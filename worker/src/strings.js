// Every word on the full view, en and de (R15). The template carries none.
// Patterns take {name} slots; numbers and dates are formatted in view.js.
// No prepositions before place names: German needs articles for many of them
// ("in die Schweiz", "auf den Pazifik"), so journeys are written with an arrow.
// No pronouns for the animal in German either: der Storch, die Möwe, die
// Schildkröte would each need a different one.

export const STRINGS = {
  en: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    monthsLong: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    day: "{d} {m}",
    dayYear: "{d} {m} {y}",
    live: "Last located {date}",
    usual: "Usually here around {date}. Last route from {year}",
    usualLast: "No position for today; last known around {date}. Last route from {year}",
    journey: "{from} → {to} · usually arrives around {date}",
    toward: "Destination: {place} · {dist} away",
    // The multi view's list rows (owner, 2026-09-29): place, and when.
    rowJourney: "{from} → {to}",
    rowUsual: "{year} route",
    // Staying places in the list (owner, 2026-09-30): which home, or a stopover.
    rowWinter: "Wintering {in}",
    rowSummer: "Summering {in}",
    rowStay: "Staying {in}",
    rowStopover: "Stopover {in}",
    // The expanded animal in the list: the row's sentence and how long it usually stays.
    focusUntil: "{row}, usually until about {date}",
    named: "“{name}”",
    thisAnimal: "This animal",
    range: "{a} to {b}",
    units: { km: "km", m: "m", cm: "cm", kg: "kg", g: "g", "km/h": "km/h", t: "tonnes", mi: "mi", ft: "ft", in: "in", lb: "lb", oz: "oz", mph: "mph", ton: "US tons" },
    somewhere: "open water",
    somewhereIn: "on open water",
    facts: {
      yearKm: "{name} covers at least {dist} a year, and that's only the straight lines between stops.",
      span: "Summer home and winter home: the two ends of {name}'s year lie {dist} apart.",
      travelDays: "Of the 365 days in a year, {name} spends about {n} on the move.",
      female: "{name} is a female.",
      male: "{name} is a male.",
      trackedSince: "Researchers have followed {name} since {month} {year}.",
      trackedFromTo: "Researchers followed {name} from {month} {year} to {month2} {year2}.",
      hatched: "{name} hatched in {year}.",
      hatchedBy: "{name} hatched in {year} or earlier."
    },
    noData: "No position for today in any track of this species.",
    error: "Something went wrong: {what}"
  },
  de: {
    months: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."],
    monthsLong: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    day: "{d}. {m}",
    dayYear: "{d}. {m} {y}",
    live: "Zuletzt geortet am {date}",
    usual: "Um den {date} meist hier. Letzte Route von {year}",
    usualLast: "Für heute keine Position; zuletzt bekannt um den {date}. Letzte Route von {year}",
    journey: "{from} → {to} · Ankunft meist um den {date}",
    toward: "Ziel: {place} · {dist} entfernt",
    rowJourney: "{from} → {to}",
    rowUsual: "Route {year}",
    rowWinter: "Im Winterquartier {in}",
    rowSummer: "Im Sommerquartier {in}",
    rowStay: "Hält sich {in} auf",
    rowStopover: "Rastet {in}",
    focusUntil: "{row}, meist bis etwa {date}",
    named: "„{name}“",
    thisAnimal: "Dieses Tier",
    range: "{a} bis {b}",
    units: { km: "km", m: "m", cm: "cm", kg: "kg", g: "g", "km/h": "km/h", t: "Tonnen", mi: "Meilen", ft: "Fuß", in: "Zoll", lb: "Pfund", oz: "Unzen", mph: "mph", ton: "US-Tonnen" },
    somewhere: "offenes Meer",
    somewhereIn: "auf offenem Meer",
    facts: {
      yearKm: "{name} legt im Jahr mindestens {dist} zurück, nur in geraden Linien von Rast zu Rast gemessen.",
      span: "Im Lauf eines Jahres kommt {name} an Orte, die {dist} auseinanderliegen.",
      travelDays: "{name} ist rund {n} Tage im Jahr unterwegs.",
      female: "{name} ist ein Weibchen.",
      male: "{name} ist ein Männchen.",
      trackedSince: "Forschende verfolgen die Reisen von {name} seit {month} {year}.",
      trackedFromTo: "Forschende verfolgten die Reisen von {name} von {month} {year} bis {month2} {year2}.",
      hatched: "{name} ist {year} geschlüpft.",
      hatchedBy: "{name} ist {year} oder früher geschlüpft."
    },
    noData: "Für heute liegt für diese Art keine Position vor.",
    error: "Etwas ist schiefgelaufen: {what}"
  }
};

export function fill(pattern, vars) {
  return String(pattern).replace(/\{(\w+)\}/g, (whole, k) => (vars[k] === undefined ? whole : String(vars[k])));
}
