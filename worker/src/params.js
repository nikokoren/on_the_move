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

export function langParam(value) {
  const v = snake(value);
  return v === "de" || v === "deutsch" || v === "german" ? "de" : "en";
}
