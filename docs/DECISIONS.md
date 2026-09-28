# Decisions

Newest entries at the top of each section. Each entry: ID, date, decision, reason, who decided, what it changes in the brief.

## Decided

### S2 Content model: selectable animals, live or "usually" (owner, 2026-09-28)

- Decision (project owner, in session): every migratory species without a live track gets a "usually" entry derived from historic full-cycle tracks, and is part of the selectable set. Users either pick one animal and follow it, or pick several or all and the screen cycles through where each one is on the map today: the latest position if live, otherwise its "usually" position for this day of year.
- Resolves the D3/R9 conflict noted in S1: historic positions are always labelled "usually" (plus the year the track is from); they are never shown as a live position. R9's "present-moment wording only" is amended for "usually" items: they describe a typical position on this date, not a live one. Exact wording goes through R16 (TEXT_REQUIREMENTS) first.
- Implementation (Claude, 2026-09-28): `pipeline/build_catalog.py` builds `data/catalog.json` and `data/usual/<study>.json`. "Usually" = the animal's own position on this day of year from its most recent tracked year, with gap filling flagged per day; not averaged across animals (averaging two flyways lands in the sea). Migratory = AVONET status 2 or 3 for birds (sourced); non-birds from `pipeline/nonbird_migrants.json` (curated, verify in R8). Details and thresholds in the script header.
- Open for the owner: minimum coverage (currently 240 of 366 days; sweep on 54 sparse geolocator animals kept 19 at 240, 4 at 330). Whether partial migrants (AVONET 2: gulls, red kite, turkey vulture) are in by default (currently in, flagged).

### A1 Movebank license terms accepted for all 556 CC0/CC BY studies (owner, 2026-09-28)

- Decision (project owner, in session: "accept all 556, go ahead"). Accepted via the API `license-md5` method on the project's Movebank account; log with per-study terms MD5 and SHA-256 in `survey/acceptance/2026-09-28_acceptance-log.csv`.
- What was accepted: see `SOURCES.md` (generic Movebank acceptance page plus the study's CC0/CC BY license; no study-specific extra terms).

### S1 Scope widened to a global, many-species database (owner, 2026-09-28)

- Decision (project owner, in session): not limited to Munich. Build a database of many migrating animals worldwide. Content kinds: (A) live now and live every year; (B) complete data for at least one full migration, used to say what usually happens at this time of year.
- Consequences: D1 and D2 as framed for Munich are superseded by this. The Munich-only GBIF finding (Mode B thin) still holds for local "who's arriving" content. See `survey/global.md`.
- Open conflicts: showing historical data "as if now" conflicts with D3 and R9 unless every historical item is labelled as typical or with its year. Needs an owner decision before any copy (R16).

### L1 Licensing position (decided before 2026-09-28, recorded 2026-09-28)

- Decision: treat the project as potentially commercial (TRMNL Creator Fund payouts scale with impressions and come from company revenue). Use only CC0, CC BY, or sources whose own terms explicitly allow commercial use. NC or custom-terms data only with the owner's written permission, stored in `data/permissions/`.
- Consequences: Movebank CC0/CC BY by default; GBIF filtered to `CC0_1_0` and `CC_BY_4_0`; eBird Status and Trends excluded.
- Source: brief section 2. Creator Fund and CC facts were checked in September 2026 by the brief's author; re-fetch the links in `docs/SOURCES.md` before relying on them.
- Not legal advice.

### M1 Working method (adopted 2026-09-27)

- Applies to every TRMNL recipe. Full text in `docs/BRIEF.md`.

## Open

| ID | Question | Depends on | Recommendation in brief | Status |
|---|---|---|---|---|
| D1 | Mode A, Mode B, or both (as a setting) | Task 0 | Mode A first; Mode B primary if nothing eligible and fresh exists | open; task 0 (2026-09-28) recommends Mode A only, see `survey/results.md` |
| D2 | Species and animals to feature | Task 0 | White stork plus one or two long-distance species with eligible public tracks | open; task 0 recommends white stork plus honey buzzard, pending terms acceptance and permission requests |
| D3 | Freshness promise | Task 0 (embargo findings) | Always show the date of the last position | open; task 0 found delays from under 4 hours to about 6 months by study |
| D4 | Exact or coarsened positions | D2, R14 | Coarsen for threatened species and nesting sites | open |
| R17b | Second voice besides "facts" | D1 | Optional | open |
