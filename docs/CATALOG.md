# Animal catalog

Built 2026-09-28 by Claude with `pipeline/build_catalog.py` (decision S2). Re-run the pipeline before relying on the numbers: tags go live and die every day. Movebank credentials come from the environment, never from files.

## What is in it

| | Count |
|---|---|
| Animals | 3,617 (76 live, 3,541 "usually") |
| Species | 154 (102 migratory, 52 partial migrants) |
| Studies / packages | 249 (Movebank API and Movebank Data Repository) |
| Live species | 11: white stork 28, lesser black-backed gull 17, turtle dove 8, turkey vulture 6, black-headed gull 4, red kite 4, broad-winged hawk 3, herring gull 2, American crow 2, common crane 1, honey buzzard 1 |

Files:
- `data/catalog.json`: species (provisional en/de names, IUCN, migration status and its source), studies (license, citation, DOI where given), animals (study, label, years, days of year covered, last fix, live flag, last position if live, coarsening).
- `data/usual/<study>.json`: per animal, 366 entries `[lat, lon, year, quality]` for 1 Jan to 31 Dec. Quality: `f` fix that day, `i` interpolated (gap up to 7 days), `s` stationary hold (gap up to 150 days, ends within 300 km), `r` straight-line route estimate (gap up to 21 days). `null` = unknown that day.
- `data/featured.json`: the 12 featured species (decision F1).

Build log (2026-09-28): 702 eligible studies; 300 without a migratory species, 160 without an animal tracked a full year; 1,477 + 3,080 animals dropped for too little year coverage; 67 duplicates dropped (the same animal published in several studies); 6 repository files over 400 MB skipped.

## Rules the pipeline applies

- **Eligible:** CC0 or CC BY only (brief section 2). Terms accepted for all 556 studies that asked (decision A1).
- **Migratory:** birds by AVONET (Tobias et al. 2022, CC BY 4.0), where 2 = partial and 3 = migratory. Non-birds from `pipeline/nonbird_migrants.json`: Claude's judgement, to verify in R8.
- **"Usually":** the animal's own position on this day of year, from its most recent tracked year. Not averaged across animals: averaging two flyways lands in the sea. Kept if at least 240 of 366 days are known. Sweep on 54 real geolocator animals: 19 kept at 240, 10 at 270, 6 at 300, 4 at 330.
- **Live:** newest fix no older than 14 days, and no `mortality_date` recorded in Movebank. Fixes from the death date on are dropped. Seen: two dead red kites' tags reporting from Bhutan a year after death.
- **R14:** positions rounded to 1° for IUCN VU/EN/CR, 0.1° for NT, else 0.01°. Checked: 154,081 VU/EN entries, 0 off the 1° grid.
- **Bad coordinates:** NaN and out-of-range values are dropped (one study has literal NaN).

## Known gaps

- Data Repository animals: `mortality_date` is not read yet, so a dead bird's final stationary days can appear as "usually". To do: read `deployment-end-type` and `deploy-off-date` from the reference files.
- Mammals barely move in our data. Median annual range: reindeer 64 km, blue wildebeest 24 km, pronghorn 25 km, red deer 22 km. These are resident populations, not the famous migrations. They stay in the pool but are not featured.
- Common names in the catalog are provisional (the most frequent GBIF vernacular name per language; some German ones are odd, "Ren"). The 12 featured species use sourced names from the species table (R8, `data/species.json`).
- Animal labels are often tag codes ("DER AU050 (eobs 3264)"). A display-name rule is still needed.
- `data/usual/` is 30 MB. Fine in git for now; move to KV or R2 once the Worker exists.

## Featured species (decided, F1)

12 species, 738 animals behind them, 64 live: white stork (274 animals / 28 live), common crane (23 / 1), honey buzzard (5 / 1), turtle dove (18 / 8), lesser black-backed gull (251 / 17), red-backed shrike (25), northern wheatear (13), Far Eastern curlew (11), broad-winged hawk (20 / 3), turkey vulture (89 / 6), blue whale (1), loggerhead turtle (8). Earlier proposal of 41 superseded.

Per species, one "star" animal is picked automatically: live if possible, else the best year coverage, preferring a real name over a tag code. Users choose species, not animals. The full pool is used for backups (R22), variety and data-derived facts.

## UX draft (owner's ideas, 2026-09-28; not designed yet)

- **Full-screen map:** the animal's position today, either its last fix (live, with date) or its "usually" position.
- **Solid line** back to where this leg started: the end of the last long stay (quality `s` run), so the breeding site in autumn and the wintering site in spring. It may run off-screen.
- **Dotted line** to where it is usually headed: the same animal's track forward to its next long stay. For live animals, the animal's own previous year. Every live animal has at least a full year of history by construction. Fallback: another animal of the same species and study, labelled as typical.
- **Edge callout** (pill shape with an arrow) where the dotted line leaves the frame: destination name, distance and "usually arrives around <date>, about N days". Staying put: "staying put, usually leaves around <date>".
- **Text box, bottom left:** species name (en/de), animal name if it has a real one, from/to (Natural Earth lookup, R7), and one rotating fact. Facts come from the animal's own data ("flew 4,200 km last autumn in 23 days") plus curated species facts with sources (R8). The backend picks one per refresh (R15).
- **Constraints:** one animal or fact per refresh (no animation), payload under about 10 KB (R3), so lines get thinned to a few dozen points. The quadrant and half views need simpler variants. Always show the date of the position (D3); label historic positions "usually" with their year (S2).

## North American candidates (checked 2026-09-29, owner's question)

82 catalog species spend at least 30 days a year between 7-75 N and 170-50 W. "Migrated" = animals whose 20 June and 15 January positions are 500+ km apart; places are each animal's own, named like the stays; "fix days" = share of the year with a real fix (the rest interpolated or held). None has a live animal. Re-run before relying on the numbers.

| Species | Animals (migrated) | Fix days | Last year | Summer | Winter | Note |
|---|---|---|---|---|---|---|
| Osprey | 45 (36) | 40 % | 2017 | USA 34 | Brazil 8, Venezuela 7 | recognisable, long route |
| Snow Goose | 45 (45) | 98 % | 2026 | Canada 44 | USA 44 | best data quality |
| Blackpoll Warbler | 14 (14) | 76 % | 2017 | Hudson Bay 5, Canada 5 | Brazil 6, Venezuela 4 | the non-stop Atlantic crossing; NT, 0.1 degree |
| Prothonotary Warbler | 22 (16) | 94 % | 2017 | USA 16 | Colombia 14 | |
| Long-billed Curlew | 24 (21) | 67 % | 2020 | USA 21 | Mexico 13, USA 8 | |
| Canada Goose | 45 (33) | 92 % | 2025 | Canada 33 | USA 30 | |
| Bald Eagle | 45 (24) | 47 % | 2021 | Canada 22 | USA 22 | national bird |
| Tundra Swan | 53 (46) | 45 % | 2026 | USA 45 (Alaska) | USA 44 | |
| Whimbrel | 10 (10) | 40 % | 2015 | USA 10 | Mexico 3, Honduras 2 | |
| Lesser Yellowlegs | 26 (20) | 21 % | 2021 | Canada 12, USA 8 | Argentina 7, Brazil 4 | VU: 1 degree; sparse fixes |
| Buff-breasted Sandpiper | 3 (3) | 79 % | 2020 | Canada 3 | Brazil, Uruguay | VU: 1 degree |

Weak: Whooping Crane (2 animals, 17 % fix days, EN so 1 degree), Common Nighthawk (no full year apart), Snowy Owl (irregular), Peregrine Falcon (tracks mostly Eurasian), Bowhead (3 migrated, stays in Canada).
