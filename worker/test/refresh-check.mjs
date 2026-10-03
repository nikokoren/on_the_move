// Replays recorded Movebank answers (test/fixtures, captured 2026-09-29 after the species were added)
// through the cron refresh and the polling endpoint (R24, R5). Each failure
// case is the recording with one thing changed, named in the case.
//
//     node worker/test/refresh-check.mjs
import fs from "fs";
import path from "path";
import { refresh, LIVE_KEY } from "../src/refresh.js";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const load = (p) => JSON.parse(fs.readFileSync(path.join(HERE, p)));
const featured = load("../data/featured.json");
const whitelist = load("../data/studies.json");
const rec = load(fs.readdirSync(path.join(HERE, "fixtures")).filter((f) => f.endsWith("_movebank_refresh.json")).map((f) => "fixtures/" + f)[0]);
const NOW = new Date(rec.recorded);
const termsPage = fs.readFileSync(path.join(HERE, "../../docs/survey/acceptance/terms/terms_24442409.html"), "utf8");

// index.js imports JSON the Wrangler way; load it here through a data: URL
// with the two JSON imports inlined, so the same code runs under Node.
async function loadIndex() {
  let src = fs.readFileSync(path.join(HERE, "../src/index.js"), "utf8");
  src = src.replace('import featured from "../data/featured.json";', `const featured = ${JSON.stringify(featured)};`)
           .replace('import whitelist from "../data/studies.json";', `const whitelist = ${JSON.stringify(whitelist)};`)
           .replace(/from "\.\/(\w+)\.js"/g, (m, f) => `from "${new URL("../src/" + f + ".js", import.meta.url).href}"`);
  const file = path.join(HERE, ".index-under-test.mjs");
  fs.writeFileSync(file, src);
  try { return await import(file + "?" + Date.now()); } finally { fs.unlinkSync(file); }
}
const { handle, speciesParam, langParam, recordPoll } = await loadIndex();

function kv(initial) {
  const store = new Map(initial ? [[LIVE_KEY, JSON.stringify(initial)]] : []);
  let writes = 0;
  return {
    get writes() { return writes; },
    get: async (k, type) => (store.has(k) ? (type === "json" ? JSON.parse(store.get(k)) : store.get(k)) : null),
    put: async (k, v) => { writes++; store.set(k, v); }
  };
}

// Serves the recording; `change` may rewrite a call's answer for one case.
function replay(change = () => null) {
  let calls = 0;
  const fetchImpl = async (url) => {
    calls++;
    const hit = rec.calls.find((c) => c.url === url);
    if (!hit) throw new Error("not recorded: " + url);
    const alt = change(hit);
    if (alt instanceof Error) throw alt;
    const c = alt || hit;
    const headers = new Headers({ "content-type": "text/csv" });
    if (c.acceptLicense) headers.set("accept-license", c.acceptLicense);
    return new Response(c.body, { status: c.status, headers });
  };
  return { fetchImpl, get calls() { return calls; } };
}

const quiet = () => {};
let failed = 0;
function check(name, ok, detail = "") {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? "  (" + detail + ")" : ""}`);
}
const studyOf = (id) => id.split("-")[1];
const liveIds = () => featured.species.flatMap((s) => s.animals).filter((a) => a.id.startsWith("mb-")).map((a) => a.id);

// 1. Normal run against the recording.
const k1 = kv();
const r1 = replay();
const run1 = await refresh({ KV: k1, MOVEBANK_USERNAME: "u", MOVEBANK_PASSWORD: "p" }, { featured, whitelist, now: NOW, fetchImpl: r1.fetchImpl, log: quiet });
const s1 = run1.state;
check("normal: requests match the recording", r1.calls === rec.calls.length, `${r1.calls} of ${rec.calls.length}`);
// Every animal the featured data marks live has a fix in the recording (17 on 2026-09-29).
const LIVE = featured.species.flatMap((sp) => sp.animals).filter((a) => a.live).length;
check("normal: animals with a fix", Object.keys(s1.animals).length === LIVE, `${Object.keys(s1.animals).length} of ${LIVE}`);
check("normal: one KV write", k1.writes === 1, `${k1.writes}`);
check("normal: no fix after 'now'", Object.values(s1.animals).every((a) => new Date(a.t) <= NOW));
const coarseOk = featured.species.flatMap((s) => s.animals).filter((a) => s1.animals[a.id]).every((a) => {
  const p = s1.animals[a.id].pos, st = a.coarsen || 0.01;
  return p.every((v) => Math.abs(v / st - Math.round(v / st)) < 1e-6);
});
check("normal: positions on each animal's R14 grid", coarseOk);

// 2. Same answers again: nothing changed, so nothing is written.
const r2 = replay();
await refresh({ KV: k1 }, { featured, whitelist, now: NOW, fetchImpl: r2.fetchImpl, log: quiet });
check("unchanged: no second KV write", k1.writes === 1, `${k1.writes} writes`);

// 3. License changed (recording with license_type CC_BY -> CC_BY_NC for study 28691134).
const k3 = kv(s1);
await refresh({ KV: k3 }, { featured, whitelist, now: NOW, log: quiet, fetchImpl: replay((c) =>
  c.url.includes("entity_type=study") && c.url.includes("study_id=28691134")
    ? { ...c, body: c.body.replace('"CC_BY"', '"CC_BY_NC"').replace(",CC_BY", ",CC_BY_NC") } : null).fetchImpl });
const s3 = JSON.parse(await k3.get(LIVE_KEY));
check("license changed: study refused", !!s3.refused["28691134"], s3.refused["28691134"]);
check("license changed: its animals dropped", !Object.keys(s3.animals).some((id) => studyOf(id) === "28691134"));
check("license changed: other studies untouched", Object.keys(s3.animals).length === LIVE - Object.keys(s1.animals).filter((id) => studyOf(id) === "28691134").length);

// 4. Terms changed (the terms page captured for study 24442409, served for the stork study 24442409).
const k4 = kv(s1);
await refresh({ KV: k4 }, { featured, whitelist, now: NOW, log: quiet, fetchImpl: replay((c) =>
  c.url.includes("entity_type=study") && c.url.includes("study_id=24442409")
    ? { ...c, acceptLicense: "true", body: termsPage } : null).fetchImpl });
const s4 = JSON.parse(await k4.get(LIVE_KEY));
check("terms changed: study refused", /terms/.test(s4.refused["24442409"] || ""), s4.refused["24442409"]);

// 5. Animal died (recording with a mortality_date two days before 'now' for hawk 2277782263).
const died = new Date(NOW.getTime() - 2 * 864e5).toISOString().slice(0, 10);
const k5 = kv(s1);
await refresh({ KV: k5 }, { featured, whitelist, now: NOW, log: quiet, fetchImpl: replay((c) =>
  c.url.includes("entity_type=individual") && c.url.includes("study_id=28691134")
    ? { ...c, body: c.body.replace(/^2277782263,.*$/m, `2277782263,${died} 00:00:00.000`) } : null).fetchImpl });
const s5 = JSON.parse(await k5.get(LIVE_KEY));
check("died: animal dropped", !s5.animals["mb-28691134-2277782263"]);

// 6. Movebank down for one study (network error on its event request).
const k6 = kv(s1);
await refresh({ KV: k6 }, { featured, whitelist, now: NOW, log: quiet, fetchImpl: replay((c) =>
  c.url.includes("entity_type=event") && c.url.includes("study_id=481458") ? new Error("connection reset") : null).fetchImpl })
  .catch((e) => check("down: refresh survives a network error", false, e.message));
const s6 = (await k6.get(LIVE_KEY, "json"));
check("down: last good positions kept", Object.keys(s6.animals).length === LIVE, `${Object.keys(s6.animals).length}`);

// 7. The polling endpoint with the refreshed state.
const env7 = { KV: kv(s1) };
const res = await handle(new Request("https://x/full?species=broad_winged_hawk&lang=deutsch&utc_offset=7200"), env7, NOW);
const body = await res.json();
check("poll: 200 with a live payload", res.status === 200 && body.state === "ok" && body.kind === "live", `${body.kind}`);
check("poll: German", /Zuletzt geortet/.test(body.status), body.status);
check("poll: under 5 KB", JSON.stringify(body).length < 5120, `${JSON.stringify(body).length} bytes`);
check("poll: no KV write on read", env7.KV.writes === 0);
const res8 = await handle(new Request("https://x/full?species=broad_winged_hawk&lang=english"), { KV: kv({ animals: {}, refused: { "28691134": "test" } }) }, NOW);
check("poll: refused study never live", (await res8.json()).kind !== "live");
check("settings: snake_case labels map", speciesParam("white_stork") === "Ciconia ciconia" && speciesParam("weissstorch") === "Ciconia ciconia"
  && speciesParam("all_of_them_in_turn") === "all" && speciesParam("european_turtle_dove") === "Streptopelia turtur"
  && speciesParam("nonsense") === "all" && langParam("deutsch") === "de" && langParam("english") === "en");
// Species photos and the multi select through the handler (owner, 2026-09-29).
const img = await handle(new Request("https://x/photo/ciconia_ciconia.jpg"), { KV: kv() }, NOW);
const bytes = new Uint8Array(await img.arrayBuffer());
check("photo: served as a JPEG", img.status === 200 && img.headers.get("content-type") === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8, `${img.status} ${bytes.length} bytes`);
check("photo: unknown name is 404", (await handle(new Request("https://x/photo/nothing.jpg"), { KV: kv() }, NOW)).status === 404);
const two = await (await handle(new Request("https://x/full?species=" + encodeURIComponent("white_stork,loggerhead_turtle") + "&photo=true"), { KV: kv() }, NOW)).json();
check("poll: two species, photo on", ["White Stork", "Loggerhead Turtle"].includes(two.species) && /^https:\/\/x\/photo\/(ciconia_ciconia|caretta_caretta)\.jpg$/.test(two.photo), `${two.species} ${two.photo}`);
const noPhoto = await (await handle(new Request("https://x/full?species=white_stork&photo=false"), { KV: kv() }, NOW)).json();
check("poll: photo off sends an empty photo", noPhoto.photo === "", JSON.stringify(noPhoto.photo));
// Units (owner, 2026-09-29): imperial turns the pill's distance into miles.
const imp = await (await handle(new Request("https://x/full?species=lesser_black_backed_gull&units=imperial"), { KV: kv() }, NOW)).json();
const met = await (await handle(new Request("https://x/full?species=lesser_black_backed_gull"), { KV: kv() }, NOW)).json();
check("poll: units imperial in miles, default in km", / mi away$/.test(imp.toward) && / km away$/.test(met.toward), `${imp.toward} | ${met.toward}`);
// Flock View (owner, 2026-09-30): a boolean, on by default (empty before the settings are saved).
const three = "&species=" + encodeURIComponent("white_stork,loggerhead_turtle,lesser_black_backed_gull");
const multi = await (await handle(new Request("https://x/full?layout=true" + three), { KV: kv() }, NOW)).json();
const unset = await (await handle(new Request("https://x/full?layout=" + three), { KV: kv() }, NOW)).json();
const plain = await (await handle(new Request("https://x/full?layout=false" + three), { KV: kv() }, NOW)).json();
check("layout: Flock View on (or not yet saved) sends one row per followed species and marks the shown one; off sends none",
  multi.rows && multi.rows.length === 3 && multi.rows[multi.current].species === multi.species && unset.rows && unset.rows.length === 3 && !("rows" in plain));
const err = await handle(new Request("https://x/full"), { KV: { get: async () => { throw new Error("kv down"); } } }, NOW);
check("poll: KV failure still answers 200 with an error state", err.status === 200 && (await err.json()).state === "error");

// Usage counts (owner, 2026-10-03): one anonymous data point per poll, settings only.
const points = [];
const stats = { writeDataPoint: (p) => points.push(p) };
const q = "https://x/full?species=" + encodeURIComponent("white_stork,loggerhead_turtle") + "&lang=deutsch&units=imperial&layout=false&photo=false&utc_offset=7200";
const counted = await handle(new Request(q, { headers: { "cf-connecting-ip": "203.0.113.7" } }), { KV: kv(), STATS: stats }, NOW);
const pt = points[0] || {};
const flat = JSON.stringify(pt);
check("stats: one data point per poll with the settings",
  counted.status === 200 && points.length === 1 && JSON.stringify(pt.indexes) === '["poll"]' &&
  JSON.stringify(pt.blobs) === JSON.stringify(["Ciconia ciconia,Caretta caretta", "de", "imperial", "single", "no_photo"]) &&
  JSON.stringify(pt.doubles) === "[1,2]", flat);
check("stats: no IP, no UTC offset in the data point", !/203\.0\.113\.7|7200/.test(flat), flat);
points.length = 0;
await handle(new Request("https://x/full"), { KV: kv(), STATS: stats }, NOW);
check("stats: nothing ticked counts as all, defaults recorded", JSON.stringify(points[0] && points[0].blobs) === JSON.stringify(["all", "en", "metric", "multi", "photo"]), JSON.stringify(points[0]));
const broken = await handle(new Request("https://x/full?species=white_stork"), { KV: kv(), STATS: { writeDataPoint: () => { throw new Error("ae down"); } } }, NOW);
const brokenBody = await broken.json();
check("stats: a failing binding never breaks the poll", broken.status === 200 && brokenBody.state === "ok", brokenBody.state);
const none = await handle(new Request("https://x/full?species=white_stork"), { KV: kv() }, NOW);
check("stats: no binding (local runs), the poll works as before", none.status === 200 && (await none.json()).state === "ok");
const sampled = []; const env10 = { STATS: { writeDataPoint: (p) => sampled.push(p) }, STATS_SAMPLE: "10" };
let r = 0; const rand = () => (r++ % 10) / 10;
for (let i = 0; i < 1000; i++) recordPoll(env10, { species: [], lang: "en", units: "metric", layout: "multi", photo: true }, rand);
check("stats: STATS_SAMPLE=10 writes 1 poll in 10, weighted 10", sampled.length === 100 && sampled.every((p) => p.doubles[0] === 10), `${sampled.length}`);

console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
