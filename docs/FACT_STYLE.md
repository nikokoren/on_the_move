# Fact style guide (owner's reviews, 2026-10-22)

How the species facts and individual-animal facts are written. Built from the owner's two review rounds on the fact review page (verdicts in `pipeline/facts_draft_round1.json` and `pipeline/facts_draft_round2.json`, field `review`). Decision R8f in `docs/DECISIONS.md`. Re-read this before writing any fact.

## Four separate pools per species

Each species has four independent pools: English short, English long, German short, German long.

- **Languages are written separately, never translated.** English facts are researched and written for English readers, German facts for German readers, ideally from sources in that language. The same story may appear in both languages only if it works natively in each. Owner, 2026-10-22: translations "reference English contexts or are just bad literal translations". Examples: the Christmas carol's turtle doves and the Song of Songs' "voice of the turtle" only work in English; "Klapperstorch", the "Neuntöter" name and the Lufthansa crane are German stories.
- **Short and long are separate facts, not two versions of one.** A short fact is complete and clear on its own. A long fact is a story that needs its detail; if it can't be told short, it stays long-only (owner: "sometimes the long ones are really cool, but don't make any sense without enough detail"). Never cut a long story down into a short one that loses the point (vetoed: the loggerhead hitchhikers' short version; "short version is too short and missing context" for the shrike's falcon tooth).
- **Lengths** (characters including spaces, units rendered in metric): short up to **90**, long up to **140** (the text box limit, `docs/TEXT_REQUIREMENTS.md`). Short facts should still be full sentences with enough context ("It is the largest migratory shorebird in the world", not "The largest migratory shorebird in the world"; "kettles of tens of thousands of hawks", not "of tens of thousands").

## English is US English, with a slight US focus (owner, 2026-10-23)

Most users are in the US. English facts use US spelling and words (color, gray, armor, practice, fall rather than autumn, toward). New research leans toward US angles: US places, history, culture, people, flyways and conservation. Facts from other countries are welcome when a general reader gets the context (the British Museum, Britain's population numbers); skip deep regional trivia (county customs, royal weddings). The UK facts approved in round 3 stay: more facts are better.

## Round 3 lessons (owner's vetoes, 2026-10-23)

Vetoed: grim stories (whaling seasons, mass deaths, injured animals in captivity, Nazi plans), pop-culture trivia (films, sneakers, slang, a royal wedding), quaint local customs (Sussex wheatear trapping), odd regional anecdotes. Some stories approved in earlier rounds were vetoed in round 3 (Lady the osprey, the Christmas carol, Hinckley, the giant Canada goose): the latest verdict counts.

## What makes a fact good (from the stars)

Starred: named animals and people (Klepetan and Malena, Prinzesschen, Lady the osprey, the giant Canada goose rediscovered in a park), culture and history (the king's geese in St James's Park, the Lufthansa crane, the bald eagle's movie scream), surprising bodies and behaviour told vividly (storks cooling off on their own legs, pigeon milk, the honk duet, projectile vomit, the blue whale's tongue, the blackpoll's fat that's less than a serving of ice cream), records (179,342 honey buzzards in a day, 8,500 km non-stop).

## What fails (from the vetoes and notes)

- Research methods and statistics (vetoed: DNA from the Hudson plane's engines; leader and follower storks' flapping).
- Facts that read wrong or ambiguous: "Britain has lost almost 99% of its turtle doves" (sounds like they were misplaced; say "population"); "Turkey vultures smell so well" (says they smell nice; "have such a good sense of smell", "können so gut riechen").
- Literal or stiff German: "ziehen gar nicht" (find natural wording, e.g. "sind Standvögel", "bleiben das ganze Jahr"), "hält" for a territory ("besetzt"), "zu lernen" ("zu erkunden"), "kamen von der Liste" ("gestrichen wurden"), "Da sie keinen Stimmapparat haben" over "Ohne Stimmapparat".
- Route descriptions the map already shows, plain behaviour lines, population numbers without a hook, facts that need missing context.
- Also vetoed in round 2 (no note): the cranes of Ibycus, Titan the turtle dove, the shrike's 22,000 km loop, blue jays imitating the broad-winged hawk, broad-wings riding updrafts, Adelita, loggerhead age, ospreys' return to Scotland, the snow goose population boom.

## Sources

Every fact rests on one or more sentences quoted verbatim from its source, checked by script against the live page (working method rule 3). Paraphrase in the fact; never copy the source sentence as the fact. Prefer primary sources, research institutions, conservation bodies and good journalism; Wikipedia is acceptable but not preferred. Measurements are written `{metric|imperial}` (e.g. `{48 km|30 mi}`), in the source's own units where the source gives them.

## House rules

- **Pronouns:** no pronouns for animals in German; in English, "he" or "she" only where Movebank records the sex (`pipeline/individuals.json`), otherwise rephrase. Individual names are in `worker/data/featured.json` (decision N1).
- **R14:** no nest or breeding sites of threatened species.
- **D3:** nothing that claims live tracking.
- **Species names:** as in `pipeline/species_curated.json` for each language.

## Individual-animal facts

Templates with placeholders filled per animal on the device: `{name}`, `{dist}`, `{n}`, `{month}`, `{year}`, `{month2}`, `{year2}`. The owner keeps all of them (yearKm, span, travelDays, female, male, trackedSince, trackedFromTo, hatched, hatchedBy) and the 8 notes from Movebank comments (`pipeline/individuals_curated.json`); make them engaging where possible, in each language separately.
