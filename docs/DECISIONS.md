# Decisions

Newest entries at the top of each section. Each entry: ID, date, decision, reason, who decided, what it changes in the brief.

## Decided

### V2 The smaller views and the multi layout (owner, 2026-09-29)

- Decision: every view in every size and orientation, from the wireframe canvas (boards 2, 10, 11, 12; https://claude.ai/artifact/SB2mQ99yoN4up7AL3aqgAQ, owner's comments 2026-09-29):
  - No title bar in any view: the space goes to content.
  - Single layout (default, every device): the map and the text beside it (half horizontal) or below it (half vertical, quadrant, portrait). Half views carry the destination line and the fact; the quadrant the place and the date. The pill only in the full view (the only view with the text over the map).
  - Setting "Layout": "One animal at a time" (default) or "All followed animals (TRMNL X only)". With the second and more than one species, the TRMNL X shows the list of followed animals with the shown one expanded (inverted, photo, destination, fact, date) and its map; the quadrant shows two mini cards with a map each. Other devices keep the single layout. With one species it is the single layout everywhere.
  - Paging (owner: "page through everyone"): the list shows one page (full 7, halves 4, quadrant 2); each refresh expands the next animal; after the page's last, the next page. Stable order (the settings order), so animals do not jump between pages; no page indicator.
- Built: `template/shared.liquid` (components and the map script for any number of maps), `full.liquid`, `half_horizontal.liquid`, `half_vertical.liquid`, `quadrant.liquid`; `layout` parameter and `rows`/`current` in the payload (`worker/src/view.js`). X only through the framework's `lg:` classes, which the renderer sets by device model (`docs/SOURCES.md`).
- Changes brief section 8 (Half Horizontal and Quadrant have a map on every device, not X only).
- Photo in the smaller views (owner, 2026-09-30, from rendered mock-ups `docs/previews/mockup-*-photo.png`): half horizontal B (photo and text left, map right; portrait: map on top, photo and text below); half vertical B (map, text, photo filling the rest; without the photo the map takes the room); quadrant: photo beside the text on the X in landscape only. Larger type on the X (`lg:`). Photos rebuilt at 480 px (all 18 originals are at least 649 px on the short side); Worker photos 760 KB base64.
- Multi layout, full view on the X (owner, 2026-09-30): no marker dots; landscape: the whole left side is the list (10 per page), anchored to the bottom; portrait: two columns of 6 below the map, the left filling first, each anchored to the bottom, the expanded animal in its own column. A map hidden at load draws when it appears (TRMNL's preview sets the size class after load).
- Checked 2026-09-29 (`template/render-check.mjs`, real data, 29 Sep, de): single layout 352/352 (4 views × OG, OG portrait, X, X portrait × 22 cases; full view: 44 cases need the pill and show it); multi layout 96/96 (4 views × 4 screens × 6 refresh slots; OG falls back to single), and 24/24 again after the last two tweaks. No text clipped, no list overflow, every page holds the shown animal. Not confirmed on a device.
- Correction: the render check never set TRMNL's breakpoint classes before, so the full view's `lg:` box widths were never exercised on the X; now they are. The pill counts did not change: 44 (OG 17, OG portrait 10, X 10, X portrait 7), the same as the topic 10 sweep after its scale fix.

### C2 Data credit off the screen, into the About text (owner, 2026-09-29)

- Decision: the "Daten: Movebank, …" line leaves the text box. All 25 study sources (owner, study, licence, link or DOI) are in the recipe's About text (`template/settings.yml`) and, with full citations, in `README.md`. Changes brief R18 ("every view shows the credit").
- Basis: Movebank's citation guidelines (https://www.movebank.org/cms/movebank-content/citation-guidelines, checked 2026-09-29): "Web-based tools or products should include a page of acknowledgements or source information that lists citations … or otherwise references participating studies and owners, including the DOIs of published datasets." CC BY 4.0 section 3(a)(2) allows attribution "in any reasonable manner based on the medium" (`docs/SOURCES.md`). The OpenStreetMap credit on the map stays (tile licence). Not legal advice.

### U1 Units setting, metric or imperial (owner, 2026-09-29)

- Decision: a "Units" select (Metric default, Imperial). Distances in the pill and the data facts, and every measurement in the sourced facts, follow it.
- Built: measurements in `pipeline/species_curated.json` are written `{metric|imperial}` with both values from or rounded from the source (30 in 24 facts), rendered by `renderUnits` in `worker/src/view.js`. Checked: 96 renderings, none with a leftover token or a metric unit in imperial.

### Other copy changes the same day

- Animal names in quotes: „Arvin“ / “Arvin”.
- Position line: "Um den 29. Sep. meist hier. Letzte Route von 2021" / "Usually here around 29 Sep. Last route from 2021".
- Pill logic kept as it is; when and where it shows is design review topic 10.

### F2 Six more species, for North American users (owner, 2026-09-29)

- Decision: add osprey, snow goose, Canada goose, bald eagle, blackpoll warbler (from the North American shortlist in `docs/CATALOG.md`) and peregrine falcon. 18 featured species.
- Built: names from the IOC list, 8 sourced facts each (144 in all, 144/144 quotes found on 36 pages); featured tracks, species table and whitelist (22 studies, all CC0/CC BY) rebuilt. Photos: picked by the owner the same day (all six CC BY 4.0); credits in the About text and README.
- Found on the way and fixed for all species:
  - stays split where the day table jumps between years (a Canada goose's Montreal stop and Delaware winter were one "stay in the USA"); 9 of 52 animals changed, and the crane's featured animal became a live one;
  - animal names in capitals are codes, not names ("GSGO - EM");
  - solar-geolocator latitudes within 14 days of the equinoxes are interpolated (a blackpoll "flew" from 44 to 70 N and back); applied to Movebank API studies only; the Data Repository stage (wheatear, curlew) is not yet corrected.

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
