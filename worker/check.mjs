// Sweeps the full view against the real featured data: every species setting
// (12 + "all"), both languages, every day of the year, at noon UTC and at two
// offsets. Fails on a payload over 5 KB, a missing field, or an unfilled slot.
//
//     node worker/check.mjs
import fs from "fs";
import { buildFull, factIndex } from "./src/view.js";
import { speciesParam, speciesList, photoParam } from "./src/params.js";

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
        // R16 limits, docs/TEXT_REQUIREMENTS.md (measured 2026-09-28).
        const LIMITS = { title: 55, where: 100, status: 140, fact: 140, credit: 73, toward: 90 };
        const slot = { ...v, title: v.species + (v.name ? " · " + v.name : "") };
        for (const [k, n] of Object.entries(LIMITS)) {
          if ((slot[k] || "").length > n) bad.push(`${k} ${slot[k].length} > ${n} chars (R16)`);
        }
        if (v.state === "ok") {
          for (const k of ["species", "status", "where", "fact", "credit", "geo"]) {
            if (v[k] === undefined || v[k] === "") bad.push(`missing ${k}`);
          }
          const g = JSON.parse(v.geo);
          if (!g.pos || !g.past.length || !g.ahead.length) bad.push("geo incomplete");
          if (!!g.dest !== !!v.toward) bad.push("callout text without destination or back");
          v.staying = !v.where.includes("→");
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
// Fact rotation: over 50 cycles of every pool size in use, each cycle shows every
// fact once, and no fact follows itself across a cycle boundary.
let rotFails = 0, rotTurns = 0;
for (const sp of data.species) {
  for (const a of sp.animals) {
    for (let n = 1; n <= sp.facts.length + 5; n++) {
      let last = -1;
      for (let c = 0; c < 50; c++) {
        const seen = new Set();
        for (let p = 0; p < n; p++) {
          const i = factIndex(n, c * n + p, a.id);
          rotTurns++;
          if (seen.has(i) || i < 0 || i >= n || (n > 1 && i === last)) rotFails++;
          seen.add(i); last = i;
        }
      }
    }
  }
}
if (rotFails) fails++;
// Every fact the pools can produce, whatever day or turn picks it (R16: 140 chars).
const facts = new Set();
for (const lang of ["en", "de"]) {
  for (const sp of data.species.map((s) => s.taxon)) {
    for (let turn = 0; turn < 200; turn++) {
      const v = buildFull(data, { species: sp, lang, now: new Date(Date.UTC(2026, 0, 1, 12) + turn * 900000 + (turn % 366) * 86400000) });
      if (v.fact) facts.add(`${lang} ${sp}: ${v.fact}`);
    }
  }
}
const longFacts = [...facts].filter((f) => f.split(": ").slice(1).join(": ").length > 140);
if (longFacts.length) fails++;
console.log(`fact rotation: ${rotTurns} turns, ${rotFails} failures; ${facts.size} distinct facts seen, ${longFacts.length} over 140 chars`);
// Every species option in template/settings.yml reaches its own species, not
// the "all" fallback (seen 2026-09-29: "Loggerhead" showed the white stork).
const yml = fs.readFileSync(new URL("../template/settings.yml", import.meta.url), "utf8");
const labels = yml.split("keyname: follow")[1].split("options:")[1].split("\n- keyname")[0].split("\n")
  .filter((l) => l.trim().startsWith("- ")).map((l) => l.trim().slice(2));
const unmapped = labels.filter((l) => l !== "All of them in turn" && speciesParam(l, data.species) === "all");
const mapped = new Set(labels.map((l) => speciesParam(l, data.species)).filter((x) => x !== "all"));
if (unmapped.length || mapped.size !== data.species.length) fails++;
console.log(`settings: ${labels.length} species options, ${mapped.size} of ${data.species.length} species reachable, unmapped: ${JSON.stringify(unmapped)}`);
// Multi select (owner, 2026-09-29): every format TRMNL might send parses to the
// same taxa, and a chosen set rotates through exactly its own species.
const two = ["Ciconia ciconia", "Caretta caretta"];
const forms = ["white_stork,loggerhead_turtle", "white_stork loggerhead_turtle", '["White Stork","Loggerhead Turtle"]',
  "White Stork,Loggerhead Turtle", "loggerhead_turtle,white_stork,white_stork", ["white_stork", "loggerhead_turtle"]];
const parseBad = forms.filter((f) => JSON.stringify(speciesList(f, data.species)) !== JSON.stringify(two));
const emptyBad = ["", "all_of_them_in_turn", null, "nonsense"].filter((f) => speciesList(f, data.species).length !== 0);
const photoBad = [["true", true], ["false", false], ["", true], [null, true]].filter(([v, want]) => photoParam(v) !== want);
const seen = {}; let setRuns = 0, outside = 0, noPhoto = 0;
for (let k = 0; k < 96 * 7; k++) {
  const v = buildFull(data, { species: two, lang: "en", now: new Date(Date.UTC(2026, 8, 29) + k * 900000), photoBase: "https://x/photo/" });
  setRuns++;
  const taxon = data.species.find((sp) => (sp.names.en === v.species))?.taxon;
  if (!two.includes(taxon)) outside++;
  seen[taxon] = (seen[taxon] || 0) + 1;
  if (!/^https:\/\/x\/photo\/[a-z_]+\.jpg$/.test(v.photo || "")) noPhoto++;
}
const off = buildFull(data, { species: two, lang: "en", now: new Date(), photoBase: null });
if (parseBad.length || emptyBad.length || photoBad.length || outside || noPhoto || Object.keys(seen).length !== 2 || off.photo !== "") fails++;
console.log(`multi select: ${forms.length} formats, ${parseBad.length} misparsed; ${emptyBad.length} bad "all" cases; photo flag ${photoBad.length} wrong; ` +
  `${setRuns} slots over a week for {stork, loggerhead}: ${JSON.stringify(seen)}, ${outside} outside the set, ${noPhoto} without photo URL, photo off -> "${off.photo}"`);
console.log(`runs ${runs}, failures ${fails}, empty ${empty}, largest payload ${maxBytes} bytes, kinds ${JSON.stringify(kinds)}`);
for (const [k, v] of Object.entries(bySpecies)) console.log(`  ${k.padEnd(28)} ok ${v.ok}  staying ${v.staying}  travelling ${v.travelling}`);
problems.forEach((p) => console.log("  FAIL " + p));
process.exit(fails ? 1 : 0);
