// Every word on the full view, en and de (R15). The template carries none.
// Patterns take {name} slots; numbers and dates are formatted in view.js.
// No prepositions before place names: German needs articles for many of them
// ("in die Schweiz", "auf den Pazifik"), so journeys are written with an arrow.
// No pronouns for the animal in German either: der Storch, die Möwe, die
// Schildkröte would each need a different one.

export const STRINGS = {
  en: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    day: "{d} {m}",
    dayYear: "{d} {m} {y}",
    live: "Last located {date}",
    usual: "Usually here around {date} · route from {year}",
    usualLast: "No position for today; last known around {date} · route from {year}",
    journey: "{from} → {to} · usually arrives around {date}",
    staying: "{place} · usually stays until about {date}",
    resting: "{place} · a stopover, usually until about {date}",
    toward: "Destination: {place} · {km} km away",
    somewhere: "open water",
    credit: "Data: {source}",
    facts: {
      yearKm: "Covers at least {km} km a year, measured from stay to stay.",
      southmost: "Gets as far south as {lat} in a year.",
      northmost: "Gets as far north as {lat} in a year.",
      span: "The two farthest points of its year are {km} km apart.",
      travelDays: "Spends about {n} days a year on the move."
    },
    north: "{v}° N",
    south: "{v}° S",
    noData: "No position for today in any track of this species.",
    error: "Something went wrong: {what}"
  },
  de: {
    months: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."],
    day: "{d}. {m}",
    dayYear: "{d}. {m} {y}",
    live: "Zuletzt geortet am {date}",
    usual: "Um den {date} meist hier · Route von {year}",
    usualLast: "Für heute keine Position; zuletzt bekannt um den {date} · Route von {year}",
    journey: "{from} → {to} · Ankunft meist um den {date}",
    staying: "{place} · bleibt meist bis etwa {date}",
    resting: "{place} · Rast, meist bis etwa {date}",
    toward: "Ziel: {place} · {km} km entfernt",
    somewhere: "offenes Meer",
    credit: "Daten: {source}",
    facts: {
      yearKm: "Legt im Jahr mindestens {km} km zurück, gemessen von Rastgebiet zu Rastgebiet.",
      southmost: "Kommt im Lauf des Jahres bis {lat} nach Süden.",
      northmost: "Kommt im Lauf des Jahres bis {lat} nach Norden.",
      span: "Die entferntesten Punkte des Jahres liegen {km} km auseinander.",
      travelDays: "Ist rund {n} Tage im Jahr auf Reisen."
    },
    north: "{v}° nördlicher Breite",
    south: "{v}° südlicher Breite",
    noData: "Für heute liegt für diese Art keine Position vor.",
    error: "Etwas ist schiefgelaufen: {what}"
  }
};

export function fill(pattern, vars) {
  return String(pattern).replace(/\{(\w+)\}/g, (whole, k) => (vars[k] === undefined ? whole : String(vars[k])));
}
