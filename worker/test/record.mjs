// Records Movebank's real answers to the refresh's own requests, once, into
// test/fixtures. Needs MOVEBANK_USERNAME and MOVEBANK_PASSWORD in the
// environment; they are sent as a header and never stored.
//
//     node worker/test/record.mjs
import fs from "fs";
import { refresh } from "../src/refresh.js";

const featured = JSON.parse(fs.readFileSync(new URL("../data/featured.json", import.meta.url)));
const whitelist = JSON.parse(fs.readFileSync(new URL("../data/studies.json", import.meta.url)));
const env = { MOVEBANK_USERNAME: process.env.MOVEBANK_USERNAME, MOVEBANK_PASSWORD: process.env.MOVEBANK_PASSWORD,
              KV: { get: async () => null, put: async () => {} } };
// R14: studies of threatened species (IUCN VU or worse) get their positions
// rounded to 0.1 degree before they are written to the repository.
const threatened = new Set();
for (const sp of featured.species) if (["VU", "EN", "CR"].includes(sp.iucn))
  for (const a of sp.animals) if (a.id.startsWith("mb-")) threatened.add(a.id.split("-")[1]);
const coarse = (body) => body.replace(/(-?\d+\.\d+),(-?\d+\.\d+),(true|false)/g,
  (m, la, lo, v) => `${Math.round(la * 10) / 10},${Math.round(lo * 10) / 10},${v}`);

const log = [];
const now = new Date();
await refresh(env, {
  featured, whitelist, now,
  fetchImpl: async (url, init) => {
    const res = await fetch(url, init);
    let body = await res.text();
    const sid = new URL(url).searchParams.get("study_id");
    if (threatened.has(sid)) body = coarse(body);
    log.push({ url, status: res.status, acceptLicense: res.headers.get("accept-license"), body });
    return new Response(body, { status: res.status, headers: res.headers });
  },
  log: (m) => console.log(m)
});
const out = { recorded: now.toISOString(), note: "Movebank direct-read answers to worker/src/refresh.js; threatened species rounded to 0.1 deg", calls: log };
const file = new URL(`./fixtures/${now.toISOString().slice(0, 10)}_movebank_refresh.json`, import.meta.url);
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.log("recorded", log.length, "calls,", fs.statSync(file).size, "bytes");
