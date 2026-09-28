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
    live: "Last position {date}",
    usual: "Usually here around {date}, based on its track from {year}",
    journey: "{from} → {to}",
    staying: "{place}, usually until about {date}",
    toward: "{place} · {km} km · usually arrives around {date}",
    leaving: "Usually leaves around {date} for {place}",
    somewhere: "open water",
    credit: "Data: {source}",
    facts: {
      yearKm: "Covers at least {km} km a year between the places it stays.",
      southmost: "Its year reaches as far south as {lat}.",
      northmost: "Its year reaches as far north as {lat}.",
      span: "The two farthest points of its year are {km} km apart.",
      travelDays: "Spends about {n} days a year travelling between the places it stays."
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
    live: "Letzte Position am {date}",
    usual: "Üblicherweise um den {date} hier, nach der Route von {year}",
    journey: "{from} → {to}",
    staying: "{place}, üblicherweise bis etwa {date}",
    toward: "{place} · {km} km · Ankunft üblicherweise um den {date}",
    leaving: "Aufbruch üblicherweise um den {date}, Ziel: {place}",
    somewhere: "offenes Meer",
    credit: "Daten: {source}",
    facts: {
      yearKm: "Mindestens {km} km im Jahr zwischen den Aufenthaltsorten.",
      southmost: "Südlichster Punkt des Jahres: {lat}.",
      northmost: "Nördlichster Punkt des Jahres: {lat}.",
      span: "Die zwei entferntesten Punkte des Jahres liegen {km} km auseinander.",
      travelDays: "Rund {n} Tage im Jahr unterwegs zwischen den Aufenthaltsorten."
    },
    north: "{v}° N",
    south: "{v}° S",
    noData: "Für heute gibt es in keiner Route dieser Art eine Position.",
    error: "Etwas ist schiefgelaufen: {what}"
  }
};

export function fill(pattern, vars) {
  return String(pattern).replace(/\{(\w+)\}/g, (whole, k) => (vars[k] === undefined ? whole : String(vars[k])));
}
