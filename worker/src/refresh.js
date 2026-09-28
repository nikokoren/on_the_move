// The cron refresh (R2, R5). Fetches the newest GPS fix of every featured
// animal that may be transmitting, checks each study's license against the
// whitelist, and stores the result in one KV key. The polling endpoint only
// reads that key, so a Movebank outage never breaks the screen.
//
// KV writes are scarce (free tier: 1,000 a day across the whole account,
// Nextbike's CLAUDE.md), so the key is written only when something changed.
// Movebank allows one concurrent request per IP, so everything is sequential.

export const LIVE_KEY = "live:v1";
const MB = "https://www.movebank.org/movebank/service/direct-read";
const LOOKBACK_DAYS = 20;     // how far back to ask for fixes
const WATCH_DAYS = 60;        // animals silent longer than this are not asked about

function movebankTime(d) {
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}000`;
}

// Movebank's CSV, as far as these three requests need it: no quotes around
// numbers, and the fields we read never contain commas.
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const head = lines.shift().split(",").map((h) => h.replace(/"/g, ""));
  return lines.map((l) => {
    const cells = l.split(",").map((c) => c.replace(/^"|"$/g, ""));
    return Object.fromEntries(head.map((h, i) => [h, cells[i] ?? ""]));
  });
}

async function mbGet(env, params, fetchImpl) {
  const url = MB + "?" + new URLSearchParams(params).toString();
  let res;
  try {
    res = await fetchImpl(url, {
      headers: { authorization: "Basic " + btoa(`${env.MOVEBANK_USERNAME}:${env.MOVEBANK_PASSWORD}`) }
    });
  } catch (e) {
    // One study's network error must not stop the others (caught by refresh-check).
    return { error: String((e && e.message) || e).slice(0, 80) };
  }
  // The owner changed the terms and they have to be accepted again: Movebank
  // answers with the terms page instead of data (captured 2026-09-28).
  if ((res.headers.get("accept-license") || "").toLowerCase() === "true") return { terms: true };
  if (!res.ok) return { error: `HTTP ${res.status}` };
  const text = await res.text();
  if (/^\s*</.test(text)) return { error: "HTML instead of CSV" };
  return { rows: parseCsv(text) };
}

function coarsen(v, step) {
  return Math.round(Math.round(v / step) * step * 100) / 100;
}

function validFix(r, now, died) {
  const lat = Number(r.location_lat), lng = Number(r.location_long);
  if (!r.location_lat || !r.location_long || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || r.visible === "false") return null;
  const t = new Date(r.timestamp.replace(" ", "T") + "Z");
  if (!(t <= new Date(now.getTime() + 3600e3))) return null;
  if (died && t >= died) return null;
  return { t, lat, lng };
}

// Which featured animals to ask about, grouped by study: Movebank animals of
// whitelisted studies that were seen in the last WATCH_DAYS, by the bundle or
// by an earlier refresh.
export function targets(featured, whitelist, prev, now) {
  const allowed = new Map(whitelist.studies.map((s) => [String(s.studyId), s]));
  const byStudy = new Map();
  for (const sp of featured.species) {
    for (const a of sp.animals) {
      if (!a.id.startsWith("mb-")) continue;
      const [, sid, iid] = a.id.split("-");
      if (!allowed.has(sid)) continue;
      const seen = (prev.animals[a.id] && prev.animals[a.id].t) || a.lastFix;
      if (!seen || (now - new Date(seen)) / 864e5 > WATCH_DAYS) continue;
      if (!byStudy.has(sid)) byStudy.set(sid, []);
      byStudy.get(sid).push({ id: a.id, iid, coarsen: a.coarsen || 0.01 });
    }
  }
  return { allowed, byStudy };
}

export async function refresh(env, { featured, whitelist, now = new Date(), fetchImpl = fetch, log = console.log }) {
  const prev = (await env.KV.get(LIVE_KEY, "json")) || { animals: {}, refused: {} };
  const next = { updated: now.toISOString(), animals: { ...prev.animals }, refused: {}, errors: {} };
  const { allowed, byStudy } = targets(featured, whitelist, prev, now);

  for (const [sid, animals] of byStudy) {
    // R5: the license as Movebank states it now, against the whitelist.
    const st = await mbGet(env, { entity_type: "study", study_id: sid, attributes: "id,license_type" }, fetchImpl);
    if (st.terms) { next.refused[sid] = "license terms changed, acceptance needed"; }
    else if (st.error) { next.errors[sid] = "study: " + st.error; continue; }
    else {
      const now_lic = st.rows[0] && st.rows[0].license_type;
      if (now_lic !== allowed.get(sid).licenseType) {
        next.refused[sid] = `license is ${now_lic || "unknown"}, whitelist says ${allowed.get(sid).licenseType}`;
      }
    }
    if (next.refused[sid]) {
      log(`refused study ${sid}: ${next.refused[sid]}`);
      for (const a of animals) delete next.animals[a.id];
      continue;
    }

    const ind = await mbGet(env, { entity_type: "individual", study_id: sid, attributes: "id,mortality_date" }, fetchImpl);
    if (ind.error || ind.terms) { next.errors[sid] = "individuals: " + (ind.error || "terms"); continue; }
    const died = new Map(ind.rows.filter((r) => r.mortality_date).map((r) => [r.id, new Date(r.mortality_date.replace(" ", "T") + "Z")]));

    const ev = await mbGet(env, {
      entity_type: "event", study_id: sid, sensor_type_id: "653",
      individual_id: animals.map((a) => a.iid).join(","),
      timestamp_start: movebankTime(new Date(now.getTime() - LOOKBACK_DAYS * 864e5)),
      attributes: "individual_id,timestamp,location_lat,location_long,visible"
    }, fetchImpl);
    if (ev.error || ev.terms) { next.errors[sid] = "events: " + (ev.error || "terms"); continue; }

    for (const a of animals) {
      let best = null;
      for (const r of ev.rows) {
        if (r.individual_id !== a.iid) continue;
        const f = validFix(r, now, died.get(a.iid));
        if (f && (!best || f.t > best.t)) best = f;
      }
      if (died.has(a.iid)) { delete next.animals[a.id]; continue; }
      if (!best) continue; // nothing new: keep what an earlier refresh found
      const had = next.animals[a.id];
      if (!had || new Date(had.t) < best.t) {
        next.animals[a.id] = { t: best.t.toISOString(), pos: [coarsen(best.lng, a.coarsen), coarsen(best.lat, a.coarsen)] };
      }
    }
  }

  // Write only on a change that matters to the screen (positions, refusals).
  const same = JSON.stringify([prev.animals, prev.refused || {}]) === JSON.stringify([next.animals, next.refused]);
  if (!same) await env.KV.put(LIVE_KEY, JSON.stringify(next));
  log(`refresh: ${byStudy.size} studies, ${Object.keys(next.animals).length} animals with fixes, ` +
      `${Object.keys(next.refused).length} refused, ${Object.keys(next.errors).length} errors, ${same ? "no write" : "written"}`);
  return { wrote: !same, state: next };
}

// The bundle with the refresh applied: newer fixes make an animal live (the
// view still checks the age), refused studies are never live.
export function withLive(featured, live) {
  if (!live) return featured;
  const refused = live.refused || {};
  return {
    ...featured,
    species: featured.species.map((sp) => ({
      ...sp,
      animals: sp.animals.map((a) => {
        const sid = a.id.startsWith("mb-") ? a.id.split("-")[1] : null;
        if (sid && refused[sid]) return { ...a, live: false };
        const l = live.animals && live.animals[a.id];
        if (!l || (a.lastFix && l.t.slice(0, 10) < a.lastFix)) return a;
        return { ...a, live: true, lastFix: l.t.slice(0, 10), lastPosition: l.pos };
      })
    }))
  };
}
