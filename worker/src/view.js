// The full view's payload, as a pure function so it can be checked offline
// against the real data (working method rule 1). Decisions S2, F1, V1.

import { STRINGS, fill } from "./strings.js";

export const LIVE_DAYS = 14;        // R21: older than this is not live
const FRAME_DAYS = 10;              // V1: the frame holds the last 10 days of track ...
const FRAME_MIN_RADIUS_KM = 250;    // ... or 500 km across the short side
const MAX_LINE_POINTS = 40;         // per line; Nextbike: bare lists, ~28 bytes a point
const CYCLE_SECONDS = 15 * 60;      // "all" moves to the next species every refresh slot

export function km(a, b) {
  const r = Math.PI / 180;
  const dLat = (b[1] - a[1]) * r, dLng = (b[0] - a[0]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearing(a, b) {
  const r = Math.PI / 180;
  const y = Math.sin((b[0] - a[0]) * r) * Math.cos(b[1] * r);
  const x = Math.cos(a[1] * r) * Math.sin(b[1] * r) - Math.sin(a[1] * r) * Math.cos(b[1] * r) * Math.cos((b[0] - a[0]) * r);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Day of year 0..365 for a UTC date, the index the tables use.
export function doyOf(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((date.getTime() - start) / 86400000);
}

function dateOfDoy(doy, year) {
  return new Date(Date.UTC(year, 0, 1) + doy * 86400000);
}

function fmtDate(t, date, withYear) {
  return fill(withYear ? t.dayYear : t.day,
    { d: date.getUTCDate(), m: t.months[date.getUTCMonth()], y: date.getUTCFullYear() });
}

function fmtKm(n, lang) {
  return Math.round(n).toLocaleString(lang === "de" ? "de-DE" : "en-GB");
}

function fmtLat(t, lat) {
  return fill(lat >= 0 ? t.north : t.south, { v: Math.round(Math.abs(lat)) });
}

const within = (d, from, to) => (from <= to ? d >= from && d <= to : d >= from || d <= to);
const ahead = (from, to) => (to - from + 366) % 366;

// Where the animal is in its year on day d: in a stay, or on a leg between two.
export function legAt(stays, d) {
  const n = stays.length;
  for (let i = 0; i < n; i++) {
    if (within(d, stays[i][0], stays[i][1])) {
      return { staying: true, prev: stays[(i - 1 + n) % n], here: stays[i], next: stays[(i + 1) % n] };
    }
  }
  // Travelling: the last stay that ended before d, and the next one to start after it.
  let prev = null, next = null, best = 999, bestN = 999;
  for (const s of stays) {
    const since = ahead(s[1], d), until = ahead(d, s[0]);
    if (since < best) { best = since; prev = s; }
    if (until < bestN) { bestN = until; next = s; }
  }
  return { staying: false, prev, here: null, next };
}

// Track points from day a to day b on the circular year, skipping unknown days.
function slice(track, a, b) {
  const out = [];
  for (let k = 0, d = a; k < 367; k++, d = (d + 1) % 366) {
    if (track[d]) out.push([track[d][0], track[d][1]]);
    if (d === b) break;
  }
  return out;
}

function thin(pts, max) {
  if (pts.length <= max) return pts;
  const out = [];
  for (let i = 0; i < max; i++) out.push(pts[Math.round(i * (pts.length - 1) / (max - 1))]);
  return out;
}

// Longitudes continuous along a line, so a track across 180 degrees is not
// drawn the long way round the world.
function unwrap(pts, ref) {
  let last = ref;
  return pts.map(([lng, lat]) => {
    let x = lng;
    while (x - last > 180) x -= 360;
    while (x - last < -180) x += 360;
    last = x;
    return [Math.round(x * 100) / 100, Math.round(lat * 100) / 100];
  });
}

function credit(t, c) {
  const lic = c.license === "CC_0" ? "CC0" : c.license === "CC_BY" ? "CC BY" : c.license;
  // "JIGUET Frédéric" -> "Frédéric Jiguet": some PI fields are surname first in capitals.
  let pi = (c.pi || "").trim();
  const m = pi.match(/^([A-ZÀ-Þ][A-ZÀ-Þ'\-]+)\s+(.+)$/);
  if (m && m[1] === m[1].toUpperCase() && m[2] !== m[2].toUpperCase()) {
    pi = `${m[2]} ${m[1][0]}${m[1].slice(1).toLowerCase()}`;
  }
  c = { ...c, pi };
  const who = c.source === "Movebank Data Repository"
    ? `Movebank Data Repository${c.doi ? ", " + c.doi.replace(/^doi:/, "doi:") : ""}`
    : `Movebank, ${c.pi || c.study}`;
  return fill(t.credit, { source: `${who}, ${lic}` });
}

function pickFact(t, lang, sp, a, slot) {
  const f = a.facts;
  const all = [
    // The species fact first (R8, sourced in data/species.json), then the
    // animal's own numbers.
    sp.fact && (sp.fact[lang] || sp.fact.en),
    fill(t.facts.yearKm, { km: fmtKm(f.yearKmMin, lang) }),
    fill(t.facts.span, { km: fmtKm(f.spanKm, lang) }),
    f.southmost < 0 || f.northmost - f.southmost > 20 ? fill(t.facts.southmost, { lat: fmtLat(t, f.southmost) }) : null,
    f.northmost > 50 ? fill(t.facts.northmost, { lat: fmtLat(t, f.northmost) }) : null
  ].filter(Boolean);
  return all[slot % all.length];
}

// One animal on one day. Returns null when this animal has no position today.
function animalView(data, sp, a, t, lang, now, localDoy, slot) {
  const places = data.places;
  const name = (i) => (i >= 0 && places[i] ? places[i][lang] : t.somewhere);
  const lastFix = a.lastFix ? new Date(a.lastFix + "T12:00:00Z") : null;
  // Age in days must be 0..LIVE_DAYS: a fix from the viewer's future is not live
  // (the sweep caught this: every day before the snapshot counted as live).
  const age = lastFix ? (now - lastFix) / 86400000 : Infinity;
  const live = a.live && age >= -1 && age <= LIVE_DAYS;

  // Live: the last fix, and its own day for the legs. Otherwise the viewer's day.
  const d = live ? doyOf(lastFix) : localDoy;
  const here = live ? a.lastPosition : a.track[d] && [a.track[d][0], a.track[d][1]];
  if (!here) return null;
  const year = a.track[d] ? a.track[d][2] : null;
  const leg = legAt(a.stays, d);

  const past = slice(a.track, leg.prev ? leg.prev[1] : d, d);
  const future = slice(a.track, d, leg.next ? leg.next[0] : d);
  if (live) { past.push(here); future.unshift(here); }

  let radius = FRAME_MIN_RADIUS_KM;
  for (let k = 1; k <= FRAME_DAYS; k++) {
    const p = a.track[(d - k + 366) % 366];
    if (p) radius = Math.max(radius, km(here, p));
  }

  // A next stay under 50 km away, or with the same name, is not a journey worth
  // pointing at (seen: a blue whale "Pacific Ocean -> Pacific Ocean, 0 km").
  const nextFar = leg.next && km(here, [leg.next[2], leg.next[3]]) >= 50 &&
    !(leg.here && leg.here[4] === leg.next[4]);
  const dest = nextFar ? [leg.next[2], leg.next[3]] : null;
  const arrive = leg.next ? dateOfDoy(leg.next[0], now.getUTCFullYear()) : null;
  const leaves = leg.here ? dateOfDoy((leg.here[1] + 1) % 366, now.getUTCFullYear()) : null;

  const status = live
    ? fill(t.live, { date: fmtDate(t, lastFix, true) })
    : fill(t.usual, { date: fmtDate(t, dateOfDoy(d, now.getUTCFullYear()), false), year });
  const from = name(leg.prev[4]), to = name(leg.next[4]);
  const where = leg.staying
    ? fill(t.staying, { place: name(leg.here[4]), date: fmtDate(t, leaves, false) })
    : from === to ? to : fill(t.journey, { from, to });
  const toward = !dest ? "" : leg.staying
    ? fill(t.leaving, { date: fmtDate(t, leaves, false), place: name(leg.next[4]) })
    : fill(t.toward, { place: name(leg.next[4]), km: fmtKm(km(here, dest), lang), date: fmtDate(t, arrive, false) });

  const ref = here[0];
  return {
    state: "ok",
    kind: live ? "live" : "usual",
    species: sp.names[lang] || sp.names.en,
    name: a.name,
    status,
    where,
    fact: pickFact(t, lang, sp, a, slot),
    credit: credit(t, a.credit),
    toward,
    // Everything the map script needs, as one JSON string: Liquid prints it into
    // the script as is, the way Nextbike sends its map points.
    geo: JSON.stringify({
      pos: unwrap([here], ref)[0],
      past: unwrap(thin(past, MAX_LINE_POINTS), ref),
      ahead: unwrap(thin(future, MAX_LINE_POINTS), ref),
      dest: dest ? unwrap([dest], ref)[0] : null,
      r: Math.round(radius)
    })
  };
}

// species: a taxon from the featured list, or "all" to cycle through them.
export function buildFull(data, { species = "all", lang = "en", now = new Date(), utcOffset = 0 }) {
  const t = STRINGS[lang] || STRINGS.en;
  lang = STRINGS[lang] ? lang : "en";
  const local = new Date(now.getTime() + utcOffset * 1000);
  const localDoy = doyOf(local);
  const slot = Math.floor(now.getTime() / 1000 / CYCLE_SECONDS);

  const list = data.species;
  let order;
  if (species === "all") {
    // Slot plus day: 96 slots a day is a multiple of 12, so a device refreshing at
    // the same time every day would otherwise see the same species forever.
    const start = (slot + Math.floor(now.getTime() / 86400000)) % list.length;
    order = list.map((_, i) => list[(start + i) % list.length]);
  } else {
    order = list.filter((s) => s.taxon === species);
    if (!order.length) order = list;
  }
  // Star first, then its backups; in "all" mode, then the next species.
  for (const sp of order) {
    for (const a of sp.animals) {
      const v = animalView(data, sp, a, t, lang, now, localDoy, slot);
      if (v) return v;
    }
    if (species !== "all") break;
  }
  return { state: "empty", species: order[0] ? order[0].names[lang] : "", status: t.noData };
}
