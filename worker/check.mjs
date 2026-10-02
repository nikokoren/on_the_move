// Sweeps the full view against the real featured data: every species setting
// (12 + "all"), both languages, every day of the year, at noon UTC and at two
// offsets. Fails on a payload over 5 KB, a missing field, or an unfilled slot.
//
//     node worker/check.mjs
import fs from "fs";
import { buildFull, factIndex, renderUnits, km } from "./src/view.js";
import { STRINGS } from "./src/strings.js";
import { PLACES } from "./src/places.js";
import { speciesParam, speciesList, photoParam, layoutParam } from "./src/params.js";

const data = JSON.parse(fs.readFileSync(new URL("./data/featured.json", import.meta.url)));
const LIMIT = 5120;
const species = [...data.species.map((s) => s.taxon), "all"];
let runs = 0, fails = 0, maxBytes = 0, empty = 0;
const kinds = {}, bySpecies = {};
const problems = [];
for (const lang of ["en", "de"]) {
  for (const sp of species) {
    for (let doy = 0; doy < 366; doy++) {
      // Two offsets, one per unit system, so both units run through every day.
      for (const [off, units] of [[0, "metric"], [36000, "imperial"]]) {
        const now = new Date(Date.UTC(2026, 0, 1, 12) + doy * 86400000);
        const v = buildFull(data, { species: sp, lang, now, utcOffset: off, units });
        runs++;
        const s = JSON.stringify(v);
        maxBytes = Math.max(maxBytes, s.length);
        const bad = [];
        if (s.length > LIMIT) bad.push(`payload ${s.length} bytes`);
        if (/\{\w+\}|\{[^{}]*\|[^{}]*\}|undefined|NaN|null →|→ null/.test(s)) bad.push("unfilled or broken text");
        // R16 limits, docs/TEXT_REQUIREMENTS.md (measured 2026-09-28).
        const LIMITS = { title: 55, where: 100, status: 140, fact: 140, toward: 90 };
        const slot = { ...v, title: v.species + (v.name ? " · " + v.name : "") };
        for (const [k, n] of Object.entries(LIMITS)) {
          if ((slot[k] || "").length > n) bad.push(`${k} ${slot[k].length} > ${n} chars (R16)`);
        }
        if (v.state === "ok") {
          for (const k of ["species", "status", "where", "fact", "geo"]) {
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
    for (let n = 1; n <= sp.facts.length + 9; n++) {  // + up to 3 track numbers and 4 individual facts (bound kept generous)
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
// Animals take turns per visit (owner, 2026-10-01). Storks (all three named):
// following storks alone, a week of slots shows each about a third of the time;
// in the multi layout with all species, the stork row follows the same rounds
// and the shown species' row is the animal in focus.
const storkCount = {};
for (let s = 0; s < 672; s++) {
  const v = buildFull(data, { species: "Ciconia ciconia", lang: "en", now: new Date(Date.UTC(2026, 8, 28) + s * 900000) });
  storkCount[v.name] = (storkCount[v.name] || 0) + 1;
}
let flockBad = 0, flockRounds = new Set();
const allTaxa = data.species.map((s) => s.taxon);
for (let s = 0; s < 96 * 3; s += 3) {
  const v = buildFull(data, { species: allTaxa, lang: "en", now: new Date(Date.UTC(2026, 8, 28) + s * 900000), layout: "multi" });
  const row = v.rows[v.current];
  if (row.name !== v.name) flockBad++;
  flockRounds.add(v.rows[allTaxa.indexOf("Ciconia ciconia")].name);
}
if (Object.keys(storkCount).length < 3 || flockBad || flockRounds.size < 3) fails++;
console.log(`animal turns: storks over a week ${JSON.stringify(storkCount)}; flock view: ${flockBad} rows disagreeing with the focus, stork row names over 3 days ${JSON.stringify([...flockRounds])}`);
// Notes from the records' comments (pipeline/individuals_curated.json, 2026-10-01):
// within 140 characters, and on how many days of the year each one can reach the
// screen (a backup animal only shows when the star has no position that day).
const noteBad = [], noteReach = [];
for (const sp of data.species) for (const a of sp.animals) for (const n of (a.individual && a.individual.notes) || []) {
  for (const lang of ["en", "de"]) if (!n[lang] || n[lang].length > 140) noteBad.push(`${lang} ${a.id}: ${n[lang]}`);
  let days = 0;
  for (let d = 0; d < 366; d++) {
    // 48 turns hold at least one whole cycle of any pool (up to 24 facts).
    for (let turn = 0; turn < 48; turn++) {
      const v = buildFull(data, { species: sp.taxon, lang: "en", now: new Date(Date.UTC(2026, 0, 1, 12) + d * 86400000 + turn * 900000) });
      if (v.fact === n.en) { days++; break; }
    }
  }
  noteReach.push(`${a.name || a.id} ${days}`);
}
if (noteBad.length) fails++;
console.log(`notes: ${noteReach.length} from comments, ${noteBad.length} bad; days a year each can show: ${noteReach.join(", ")}`);
// Units (owner, 2026-09-29): every sourced fact in both languages and both unit
// systems renders without a leftover {metric|imperial} token, within 140
// characters, and an imperial rendering names no metric unit.
let unitFacts = 0, unitBad = [];
for (const sp of data.species) for (const f of sp.facts) for (const lang of ["en", "de"]) for (const units of ["metric", "imperial"]) {
  if (!/\{[^{}]*\|[^{}]*\}/.test(f[lang])) continue;
  unitFacts++;
  const r = renderUnits(f[lang], STRINGS[lang], lang, units);
  if (/[{}|]/.test(r) || r.length > 140 || (units === "imperial" && /\d (km|m|cm|kg|g|t|Tonnen|tonnes)\b/.test(r))) unitBad.push(`${lang} ${units}: ${r}`);
}
if (unitBad.length) fails++;
console.log(`units: ${unitFacts} renderings of facts with measurements, ${unitBad.length} bad`);
unitBad.slice(0, 5).forEach((x) => console.log("  BAD " + x));
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
// Multi view (owner, 2026-09-29): one row per followed species in a stable
// order, the shown one marked, every row with a place and a when; over a week
// every species gets its turn; one species or layout single sends no rows.
{
  const all = data.species.map((sp) => sp.taxon);
  let slots = 0, bad = 0, emptyRows = 0, maxB = 0; const turns = {};
  for (const lang of ["en", "de"]) for (let k = 0; k < 96 * 7; k += 3) {
    const v = buildFull(data, { species: all, lang, now: new Date(Date.UTC(2026, 8, 29) + k * 900000), layout: "multi" });
    slots++;
    maxB = Math.max(maxB, Buffer.byteLength(JSON.stringify(v)));
    const names = data.species.map((sp) => sp.names[lang]);
    if (!v.rows || v.rows.length !== all.length || v.rows.some((r, i) => r.species !== names[i]) || v.rows[v.current].species !== v.species) bad++;
    emptyRows += v.rows ? v.rows.filter((r) => !r.place || !r.when).length : 0;
    turns[v.current] = (turns[v.current] || 0) + 1;
  }
  const one = buildFull(data, { species: ["Larus fuscus"], lang: "en", now: new Date(), layout: "multi" });
  const single = buildFull(data, { species: all, lang: "en", now: new Date() });
  const lp = [["true", "multi"], ["", "multi"], [null, "multi"], ["false", "single"], ["all_followed_animals_trmnl_x_only", "multi"], ["one_animal_at_a_time", "single"]]
    .filter(([x, want]) => layoutParam(x) !== want);
  if (bad || emptyRows || Object.keys(turns).length !== all.length || "rows" in one || "rows" in single || lp.length) fails++;
  console.log(`multi view: ${slots} slots, ${bad} bad row sets, ${emptyRows} rows without place or when, ${Object.keys(turns).length} of ${all.length} species shown in full, ` +
    `largest payload ${maxB} bytes; one species or single layout sends rows: ${"rows" in one || "rows" in single}; layout param ${lp.length} wrong`);
}
// Late departure (seen on the owner's device 2026-09-30): the crane's live fix of
// 29 Sep in Lithuania, a day after last year's route had moved to Poland. The leg
// must follow the fix: still in Lithuania, one line ahead to Poland, none back.
{
  const f = JSON.parse(JSON.stringify(data));
  // Only the live crane, whatever animal's turn it is (animals take turns since 2026-10-01).
  const cranes = f.species.find((sp) => sp.taxon === "Grus grus");
  cranes.animals = cranes.animals.slice(0, 1);
  const crane = cranes.animals[0];
  crane.lastFix = "2026-09-29"; crane.lastPosition = [24.95, 55.15];
  const v = buildFull(f, { species: "Grus grus", lang: "en", now: new Date("2026-09-30T08:00:00Z") });
  const g = JSON.parse(v.geo);
  const back = g.past.some((p) => km(p, g.pos) > 250);
  const ok = / in Lithuania/.test(v.where) && /Poland/.test(v.toward) && !back;
  if (!ok) fails++;
  console.log(`late departure (crane, fix 29 Sep in Lithuania): "${v.where}" | "${v.toward}" | past line reaches ${back ? "Poland (wrong)" : "only Lithuania"} -> ${ok ? "ok" : "FAIL"}`);
}
// Place names (owner, 2026-09-30): every place in the data has a curated entry
// with its "in" form in both languages (src/places.js).
{
  const missing = data.places.filter((p) => !PLACES[p.en] || !PLACES[p.en].inDe || !PLACES[p.en].inEn).map((p) => p.en);
  const extra = Object.keys(PLACES).filter((k) => !data.places.some((p) => p.en === k));
  if (missing.length) fails++;
  console.log(`places: ${data.places.length} in the data, ${missing.length} without an "in" form ${JSON.stringify(missing)}, ${extra.length} curated but unused ${JSON.stringify(extra)}`);
}
console.log(`runs ${runs}, failures ${fails}, empty ${empty}, largest payload ${maxBytes} bytes, kinds ${JSON.stringify(kinds)}`);
for (const [k, v] of Object.entries(bySpecies)) console.log(`  ${k.padEnd(28)} ok ${v.ok}  staying ${v.staying}  travelling ${v.travelling}`);
problems.forEach((p) => console.log("  FAIL " + p));
process.exit(fails ? 1 : 0);
