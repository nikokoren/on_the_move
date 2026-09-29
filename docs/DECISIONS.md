# Decisions

Newest entries at the top of each section. Each entry: ID, date, decision, reason, who decided, what it changes in the brief.

## Decided

### R8b Species photos, credited in the About text (owner, 2026-09-29)

- Decision: one photo per species on screen, left of the text box, switchable (`show_photo`, default on). Photos from iNaturalist research-grade observations, CC0 or CC BY 4.0 only (same rule as L1); picks in `pipeline/species_images.json`.
- Credits for the nine CC BY photos in the recipe's About text (`template/settings.yml`) and `README.md`, not on the screen: CC BY 4.0 section 3(a)(2) allows attribution "in any reasonable manner based on the medium", including a link to a page with the information (sources in `docs/SOURCES.md`). The credits note the modification (cropped, greyscale). Not legal advice.
- Species selection becomes a multi select in the same change.

### R8a Eight facts per species, rotated without repeats (owner, 2026-09-28)

- Decision: one fact on screen, drawn from a pool; 8 sourced facts per species (96 in all).
- Built: `pipeline/species_curated.json` holds a `facts` list per species, each with source and quote; `pipeline/verify_sources.py` found 96/96 quotes on 25 pages on 2026-09-28. The Worker adds the animal's own numbers: km a year, span, south/northmost point, and days travelling between stays (new). The pool is 9 to 13 facts per animal.
- Rotation (`worker/src/view.js`, `factIndex`): the pool is shuffled once per cycle with a seed from the animal and the cycle number; every fact shows once per cycle, and a new cycle never starts with the fact the last one ended on. The fact turns every 15-minute slot when following one species, once per round in "all" mode. No stored state: every refresh in a slot agrees. Checked by `worker/check.mjs`: 154,700 turns, 0 repeats within a cycle, 0 at the boundaries.
- Not built: "countries crossed" (the place list mixes countries, deserts and seas, so a count would be wrong) and "fastest day" (geolocator jitter of about 200 km a day would make it up).

### C1 Cron slot freed in nearby-nextbike (owner, 2026-09-28)

- The first deploy failed to register the cron: the account had used the free plan's 5 cron triggers (code 10072). The owner deleted nearby-nextbike's `0 4 * * *` trigger, which only pre-warmed `getSystemIndex()`; that function refreshes itself when older than 24 h and is only needed when resolving a new address (nearby-nextbike `worker/index.js` lines 417 and 635, read 2026-09-28). The owner also removes it from nearby-nextbike's local, untracked `wrangler.toml`, or its next deploy would hit the limit again.
- Brief R2 (Worker cron) stands unchanged. Fallback if slots run out again: refresh on poll when the KV state is older than 6 h, one study per poll (proposed 2026-09-28, not built).

### V1 Full view first; framing (owner, 2026-09-28)

- Decision (project owner, in session): build the full view first, smaller views later. Framing as proposed in `FULL_VIEW.md`: centre on the animal's position today; the short side of the map covers the last 10 days of its track or 500 km, whichever is larger. The line back to the leg start may run off screen; an off-screen destination gets the edge callout.
- Place names (R7): Natural Earth (public domain) desert polygons first, then country, then sea or ocean, en/de from the data's own name fields.
- Stays and legs: a stay is at least 14 days within 100 km in the animal's own year; a leg runs between stays. Thresholds are Claude's first guess, to be checked against real tracks.

### F1 Featured species: 12 (owner, 2026-09-28)

- Decision (project owner, in session: "go with the 12, keep the gull"): white stork, common crane, European honey buzzard, European turtle dove, lesser black-backed gull, red-backed shrike, northern wheatear, Far Eastern curlew, broad-winged hawk, turkey vulture, blue whale, loggerhead turtle. In `data/featured.json`.
- Together: 738 animals, 64 live (catalog of 2026-09-28). 6 of the 12 have live animals.
- Criteria: live animals first; one species per kind of journey; recognisable to en/de users; backups only needed for live species. The other 142 catalog species stay in the pool (backups, possible guests later). Gull kept over cuckoo as the most reliable live species (17 live).

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
