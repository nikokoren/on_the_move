// Settings values to what the Worker uses. TRMNL sends select values snake_cased
// from their labels ("White Stork" -> white_stork, "Deutsch" -> deutsch;
// Nextbike PROJECT.md), so labels, their snake_case and the taxon all match.

export const snake = (s) => String(s || "").toLowerCase().replace(/ß/g, "ss").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

// Labels used before 2026-09-29, still set on devices.
const OLD_LABELS = { loggerhead: "Caretta caretta" };

// Returns the taxon, or "all" (also for anything unknown).
export function speciesParam(value, species) {
  const v = snake(value);
  if (!v || v === "all" || v === "all_of_them_in_turn" || v === "alle") return "all";
  for (const sp of species) {
    const keys = [sp.taxon, sp.names.en, sp.names.de].map(snake);
    if (keys.includes(v)) return sp.taxon;
  }
  return OLD_LABELS[v] || "all";
}

// The species setting is a multi select (owner, 2026-09-29): none ticked means
// every species in turn. How TRMNL hands a multiple select to the polling URL
// is not documented (checked 2026-09-29, help.trmnl.com form builder), so a
// list, a comma or space separated string and a JSON array are all accepted
// (Nearby Nextbike's worker/direction.md does the same). Returns taxa in the
// featured order, without duplicates; an empty list means all.
export function speciesList(value, species) {
  let parts = Array.isArray(value) ? value : String(value || "").replace(/[\[\]"']/g, " ").split(/[,;|\s]+/);
  // Labels with spaces ("White Stork") arrive whole in a JSON array but split
  // here; joining neighbours back lets "white stork" match too.
  parts = parts.map((x) => String(x).trim()).filter(Boolean);
  const hit = new Set();
  for (let i = 0; i < parts.length; i++) {
    for (let n = 3; n >= 1; n--) {
      const t = speciesParam(parts.slice(i, i + n).join("_"), species);
      if (t !== "all") { hit.add(t); i += n - 1; break; }
    }
  }
  return species.map((s) => s.taxon).filter((t) => hit.has(t));
}

// Booleans arrive as the string "true" or "false", or not at all when the
// field was never saved (Map of the Day, selection.liquid). Absent means on.
export function photoParam(value) {
  const v = snake(value);
  return !(v === "false" || v === "0" || v === "no" || v === "off");
}

export function langParam(value) {
  const v = snake(value);
  return v === "de" || v === "deutsch" || v === "german" ? "de" : "en";
}

// Units for distances and the measurements in facts (owner, 2026-09-29).
// The select sends "metric" or "imperial"; anything else is metric.
export function unitsParam(value) {
  return snake(value) === "imperial" ? "imperial" : "metric";
}

// The layout setting: "Flock View" (owner, 2026-09-30), a boolean, on by default.
// On, and following more than one species, a large screen (the TRMNL X; the
// template decides by lg:) shows the list of every followed animal with one in
// full and its map. Booleans arrive as "true"/"false", or empty before the
// settings are first saved, which counts as on (like the photo). The earlier
// select's labels (2026-09-29) stay accepted: "one animal at a time" is off.
export function layoutParam(value) {
  const v = snake(value);
  if (v === "false" || v === "0" || v === "no" || v === "off" || /(^|_)one(_|$)/.test(v)) return "single";
  return "multi";
}
