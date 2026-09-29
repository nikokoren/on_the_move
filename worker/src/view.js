// The full view's payload, as a pure function so it can be checked offline
// against the real data (working method rule 1). Decisions S2, F1, V1.

import { STRINGS, fill } from "./strings.js";

export const LIVE_DAYS = 14;        // R21: older than this is not live
const LOOK_BACK_DAYS = 60;          // how far a gap may fall back to the last known day
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

function fmtNum(n, lang, decimals = 0) {
  return Number(n).toLocaleString(lang === "de" ? "de-DE" : "en-GB",
    { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const KM_PER_MI = 1.609344;

// A distance in the viewer's units (setting "units", owner 2026-09-29).
function fmtDist(t, km, lang, units) {
  return units === "imperial"
    ? `${fmtNum(Math.round(km / KM_PER_MI), lang)} ${t.units.mi}`
    : `${fmtNum(Math.round(km), lang)} ${t.units.km}`;
}

// Measurements in the sourced facts are written {metric|imperial}, e.g.
// "{5.6 km|3.5 mi}" or "{2.9-8.9 kg|6.5-19.8 lb}" (pipeline/species_curated.json):
// both values come from the source or are rounded from it, so an imperial source
// reads as it was written. The chosen side is formatted for the language.
export function renderUnits(text, t, lang, units) {
  return String(text).replace(/\{([^{}|]+)\|([^{}|]+)\}/g, (all, metric, imperial) => {
    const m = (units === "imperial" ? imperial : metric).trim().match(/^([\d.]+)(?:-([\d.]+))?\s+(\S+)$/);
    if (!m) return all;
    const num = (x) => fmtNum(Number(x), lang, (x.split(".")[1] || "").length);
    const value = m[2] ? fill(t.range, { a: num(m[1]), b: num(m[2]) }) : num(m[1]);
    return `${value} ${t.units[m[3]] || m[3]}`;
  });
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

// The two longest stays are the animal's home ranges (summer and winter); any
// other stay is a stopover on the way. Seen 2026-09-29 on a device: a crane
// resting four weeks south of Volgograd was shown as if it lived there.
function homeStays(stays) {
  if (stays.length <= 2) return stays;
  const len = (s) => (s[1] - s[0] + 366) % 366 + 1;
  const top = [...stays].sort((a, b) => len(b) - len(a)).slice(0, 2);
  return stays.filter((s) => top.includes(s));
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

// Days of the year not inside any stay: the time it spends travelling.
function travelDays(stays) {
  let stayed = 0;
  for (const [from, to] of stays) stayed += (to - from + 366) % 366 + 1;
  return 366 - stayed;
}

// Seeded shuffle (mulberry32 + Fisher-Yates): the same turn always gives the
// same order, so every refresh in a cycle agrees without any stored state.
function shuffled(n, seed) {
  let a = seed >>> 0;
  const rnd = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Fact n of the endless sequence for this pool: pools are shuffled per cycle,
// so every fact shows once before any repeats. Each new cycle is a fresh
// order, and its first fact is never the one the last cycle ended on.
export function factIndex(n, turn, key) {
  if (n <= 2) return turn % n;  // nothing to shuffle; alternating never repeats
  const cycle = Math.floor(turn / n), pos = turn % n;
  const order = shuffled(n, hash(key) ^ cycle);
  if (cycle > 0) {
    const before = shuffled(n, hash(key) ^ (cycle - 1));
    if (order[0] === before[n - 1]) [order[0], order[1]] = [order[1], order[0]];
  }
  return order[pos];
}

function factPool(t, lang, sp, a, units) {
  const f = a.facts;
  const days = travelDays(a.stays);
  return [
    // Sourced species facts (R8, data/species.json), then the animal's own numbers.
    ...(sp.facts || []).map((x) => renderUnits(x[lang] || x.en, t, lang, units)),
    fill(t.facts.yearKm, { dist: fmtDist(t, f.yearKmMin, lang, units) }),
    fill(t.facts.span, { dist: fmtDist(t, f.spanKm, lang, units) }),
    f.southmost < 0 || f.northmost - f.southmost > 20 ? fill(t.facts.southmost, { lat: fmtLat(t, f.southmost) }) : null,
    f.northmost > 50 ? fill(t.facts.northmost, { lat: fmtLat(t, f.northmost) }) : null,
    a.stays.length > 1 && days >= 5 && days <= 300 ? fill(t.facts.travelDays, { n: days }) : null,
    ...individualFacts(t, a)
  ].filter(Boolean);
}

// The animal's own record (owner, 2026-09-29): sex, when tracking ran, hatch
// year; only what Movebank holds for it (pipeline/build_individuals.py).
function individualFacts(t, a) {
  const i = a.individual || {};
  const ym = (s) => ({ month: t.monthsLong[Number(s.slice(5, 7)) - 1], year: s.slice(0, 4) });
  const out = [];
  if (i.sex === "f") out.push(t.facts.female);
  if (i.sex === "m") out.push(t.facts.male);
  if (i.trackedFrom) {
    const from = ym(i.trackedFrom);
    out.push(a.live || !i.trackedTo
      ? fill(t.facts.trackedSince, from)
      : fill(t.facts.trackedFromTo, { ...from, month2: ym(i.trackedTo).month, year2: ym(i.trackedTo).year }));
  }
  if (i.hatchYear) out.push(fill(i.hatchExact ? t.facts.hatched : t.facts.hatchedBy, { year: i.hatchYear }));
  return out;
}

function pickFact(t, lang, sp, a, turn, units) {
  const pool = factPool(t, lang, sp, a, units);
  return pool[factIndex(pool.length, turn, a.id)];
}

// One animal on one day. Returns null when this animal has no position today.
function animalView(data, sp, a, t, lang, now, localDoy, turn, lookBack = 0, units = "metric", withFact = true) {
  const places = data.places;
  const name = (i) => (i >= 0 && places[i] ? places[i][lang] : t.somewhere);
  const lastFix = a.lastFix ? new Date(a.lastFix + "T12:00:00Z") : null;
  // Age in days must be 0..LIVE_DAYS: a fix from the viewer's future is not live
  // (the sweep caught this: every day before the snapshot counted as live).
  const age = lastFix ? (now - lastFix) / 86400000 : Infinity;
  const live = a.live && age >= -1 && age <= LIVE_DAYS;

  // Live: the last fix, and its own day for the legs. Otherwise the viewer's day.
  let d = live ? doyOf(lastFix) : localDoy;
  // With lookBack, a day without a position falls back to the last known day
  // before it, and says so (owner, 2026-09-29: the shrikes' tracks are blank
  // around the spring equinox; better their last position than none).
  let back = 0;
  while (!live && !a.track[d] && back < lookBack) { d = (d - 1 + 366) % 366; back++; }
  const here = live ? a.lastPosition : a.track[d] && [a.track[d][0], a.track[d][1]];
  if (!here) return null;
  const year = a.track[d] ? a.track[d][2] : null;
  // Legs run from home range to home range; a stopover on the way is part of the leg.
  const homes = homeStays(a.stays);
  const leg = legAt(homes, d);
  const stop = leg.staying ? null : a.stays.find((s) => !homes.includes(s) && within(d, s[0], s[1]));

  // At home the line starts where the stay began: the journey that brought it
  // there is over (seen on a device: a turkey vulture in summer still trailing
  // its spring flight from Mexico).
  const past = slice(a.track, leg.staying ? leg.here[0] : leg.prev ? leg.prev[1] : d, d);
  const future = slice(a.track, d, leg.next ? leg.next[0] : d);
  if (live) { past.push(here); future.unshift(here); }

  // A next home under 50 km away, or with the same name as this one, is not a journey worth
  // pointing at (seen: a blue whale "Pacific Ocean -> Pacific Ocean, 0 km").
  // Nor is one named like the place it is in now (seen: a loggerhead's pill
  // "Pacific Ocean · 691 km" while in the Pacific Ocean).
  const nextFar = leg.next && km(here, [leg.next[2], leg.next[3]]) >= 50 &&
    !(leg.here && leg.here[4] === leg.next[4]) && name(leg.next[4]) !== name(a.place[d]);
  const dest = nextFar ? [leg.next[2], leg.next[3]] : null;
  const arrive = leg.next ? dateOfDoy(leg.next[0], now.getUTCFullYear()) : null;
  const until = (s) => dateOfDoy((s[1] + 1) % 366, now.getUTCFullYear());

  const status = live
    ? fill(t.live, { date: fmtDate(t, lastFix, true) })
    : fill(back ? t.usualLast : t.usual, { date: fmtDate(t, dateOfDoy(d, now.getUTCFullYear()), false), year });
  const from = name(leg.prev[4]), to = name(leg.next[4]);
  const where = leg.staying
    ? fill(t.staying, { place: name(leg.here[4]), date: fmtDate(t, until(leg.here), false) })
    : stop
      ? fill(t.resting, { place: name(stop[4]), date: fmtDate(t, until(stop), false) })
      : from === to ? to : fill(t.journey, { from, to, date: fmtDate(t, arrive, false) });
  const toward = dest ? fill(t.toward, { place: to, dist: fmtDist(t, km(here, dest), lang, units) }) : "";
  // The short forms for the multi view's list rows: where, and when (the date of
  // the last fix, or the year of the route used; D3).
  const moving = !leg.staying && !stop && from !== to;
  const short = leg.staying ? name(leg.here[4]) : stop ? name(stop[4]) : moving ? fill(t.rowJourney, { from, to }) : to;
  const when = live ? fmtDate(t, lastFix, false) : fill(t.rowUsual, { year });

  const ref = here[0];
  return {
    state: "ok",
    kind: live ? "live" : "usual",
    species: sp.names[lang] || sp.names.en,
    // Individual names in quotes (owner, 2026-09-29): „Arvin“ / “Arvin”.
    name: a.name ? fill(t.named, { name: a.name }) : "",
    status,
    where,
    fact: withFact ? pickFact(t, lang, sp, a, turn, units) : "",
    toward,
    short,
    moving,
    when,
    // Everything the map script needs, as one JSON string: Liquid prints it into
    // the script as is, the way Nextbike sends its map points.
    geo: JSON.stringify({
      pos: unwrap([here], ref)[0],
      past: unwrap(thin(past, MAX_LINE_POINTS), ref),
      ahead: unwrap(thin(future, MAX_LINE_POINTS), ref),
      dest: dest ? unwrap([dest], ref)[0] : null
    })
  };
}

// species: "all", one taxon, or a list of taxa (the multi select; an empty list
// means all). With more than one, they take turns, one per refresh slot.
// photoBase: where the species photos are served ("https://.../photo/"), or
// null when the viewer turned the photo off.
// layout "multi" (owner, 2026-09-29; TRMNL X only, the template decides): the
// payload also carries one short row per followed species, in the stable pool
// order, and which of them is shown in full (current). The template pages
// through the rows with its own page size.
export function buildFull(data, { species = "all", lang = "en", now = new Date(), utcOffset = 0, photoBase = null, units = "metric", layout = "single" }) {
  const t = STRINGS[lang] || STRINGS.en;
  lang = STRINGS[lang] ? lang : "en";
  const local = new Date(now.getTime() + utcOffset * 1000);
  const localDoy = doyOf(local);
  const slot = Math.floor(now.getTime() / 1000 / CYCLE_SECONDS);

  const wanted = species === "all" ? [] : [].concat(species);
  let pool = data.species.filter((s) => wanted.includes(s.taxon));
  if (!pool.length) pool = data.species;
  // Slot plus day: 96 slots a day is a multiple of many pool sizes, so a device
  // refreshing at the same time every day would otherwise see the same species forever.
  const start = (slot + Math.floor(now.getTime() / 86400000)) % pool.length;
  const order = pool.map((_, i) => pool[(start + i) % pool.length]);
  // The fact turns once per visit: every slot when following one species, once
  // per round when several take turns (each is shown once a round).
  const turn = Math.floor(slot / pool.length);
  // No photo for a species without one yet (sp.photo, set by build_featured.py).
  const done = (sp, v) => ({ ...v, photo: photoBase && sp.photo ? photoBase + sp.taxon.toLowerCase().replace(/ /g, "_") + ".jpg" : "" });
  // Star first, then its backups; a species with nobody today falls back to
  // the star's last known position before the gap.
  const today = (sp, withFact = true) => {
    for (const a of sp.animals) {
      const v = animalView(data, sp, a, t, lang, now, localDoy, turn, 0, units, withFact);
      if (v) return v;
    }
    return null;
  };
  const before = (sp, withFact = true) => animalView(data, sp, sp.animals[0], t, lang, now, localDoy, turn, LOOK_BACK_DAYS, units, withFact);
  // The next species in the pool with a position today; if none has one, the
  // next with a last known position.
  let shown = null, v = null;
  for (const sp of order) { v = today(sp); if (v) { shown = sp; break; } }
  if (!v) for (const sp of order) { v = before(sp); if (v) { shown = sp; break; } }
  if (!v) return { state: "empty", species: order[0] ? order[0].names[lang] : "", status: t.noData };
  const out = done(shown, v);
  if (layout === "multi" && pool.length > 1) {
    out.current = pool.indexOf(shown);
    out.rows = pool.map((sp) => {
      const r = sp === shown ? v : today(sp, false) || before(sp, false);
      return { species: sp.names[lang] || sp.names.en, name: r ? r.name : "", place: r ? r.short : "", moving: !!(r && r.moving), when: r ? r.when : "", r };
    });
    // The quadrant's two mini cards each draw a map: the pair holding the shown
    // species carries its map data; the other rows stay short.
    const pair = out.current - (out.current % 2);
    out.rows = out.rows.map(({ r, ...row }, i) => (i === pair || i === pair + 1) && r ? { ...row, geo: r.geo } : row);
  }
  return out;
}
