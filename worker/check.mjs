// Sweeps the full view against the real featured data: every species setting
// (12 + "all"), both languages, every day of the year, at noon UTC and at two
// offsets. Fails on a payload over 5 KB, a missing field, or an unfilled slot.
//
//     node worker/check.mjs
import fs from "fs";
import { buildFull } from "./src/view.js";

const data = JSON.parse(fs.readFileSync(new URL("./data/featured.json", import.meta.url)));
const LIMIT = 5120;
const species = [...data.species.map((s) => s.taxon), "all"];
let runs = 0, fails = 0, maxBytes = 0, empty = 0;
const kinds = {}, bySpecies = {};
const problems = [];
for (const lang of ["en", "de"]) {
  for (const sp of species) {
    for (let doy = 0; doy < 366; doy++) {
      for (const off of [0, 36000]) {
        const now = new Date(Date.UTC(2026, 0, 1, 12) + doy * 86400000);
        const v = buildFull(data, { species: sp, lang, now, utcOffset: off });
        runs++;
        const s = JSON.stringify(v);
        maxBytes = Math.max(maxBytes, s.length);
        const bad = [];
        if (s.length > LIMIT) bad.push(`payload ${s.length} bytes`);
        if (/\{\w+\}|undefined|NaN|null →|→ null/.test(s)) bad.push("unfilled or broken text");
        if (v.state === "ok") {
          for (const k of ["species", "status", "where", "fact", "credit", "pos", "past", "ahead", "radius_km"]) {
            if (v[k] === undefined || v[k] === "") bad.push(`missing ${k}`);
          }
          kinds[v.kind] = (kinds[v.kind] || 0) + 1;
          bySpecies[sp] = bySpecies[sp] || { ok: 0, staying: 0, travelling: 0 };
          bySpecies[sp].ok++;
          bySpecies[sp][v.staying ? "staying" : "travelling"]++;
        } else { empty++; }
        if (bad.length) { fails++; if (problems.length < 10) problems.push(`${lang} ${sp} doy ${doy}: ${bad.join(", ")}`); }
      }
    }
  }
}
console.log(`runs ${runs}, failures ${fails}, empty ${empty}, largest payload ${maxBytes} bytes, kinds ${JSON.stringify(kinds)}`);
for (const [k, v] of Object.entries(bySpecies)) console.log(`  ${k.padEnd(28)} ok ${v.ok}  staying ${v.staying}  travelling ${v.travelling}`);
problems.forEach((p) => console.log("  FAIL " + p));
process.exit(fails ? 1 : 0);
