# More migration data: candidates (2026-11-21)

Owner, 2026-11-21: "investigate if we can find more migration data that would work for our plugin." Survey only; nothing built. Licensing rule L1 applies (CC0 or CC BY only). Most users are in the US (A2 usage counts), so US species are marked.

## How this was searched

1. **Our own catalog** (`data/catalog.json`, built 2026-09/10 from public Movebank studies and the Movebank Data Repository, CC0/CC BY only): 134 migratory taxa that are not featured yet. Every animal there already has a full-year day-of-year table (`data/usual/`), so these could join the year-round rotation with no new download. Journey size is the largest distance between two of the animal's weekly positions, measured from those tables.
2. **The Data Repository, searched live** (`/discover/search/objects`, 2026-11-21) for famous migrants missing from the catalog: godwit, sandhill crane, whooping crane, humpback, gray whale, white shark, leatherback, arctic tern, monarch, free-tailed bat, hoary bat, noctule, caribou, pronghorn, mule deer. Most of these are seasonal tracks, so they would follow the seasonal model used for the zebra and green turtle (decision S4).

Licences below are as recorded in the catalog or shown by the repository on 2026-11-21. Re-check the exact files before building anything (`docs/survey/seasonal-candidates.md` found a package and a study disagreeing once).

## Already in our catalog (year-round, ready to build)

| Species | US | Animals | Biggest journey | Licence | Study (first) | Note |
|---|---|---|---|---|---|---|
| Whimbrel | yes | 10 | 13,384 km | CC0 | USGS Alaska Science Center, Argos | Alaska to South America |
| Lesser Yellowlegs | yes | 26 | 13,601 km | CC0 | USFWS migratory movements | VU: coarsen breeding sites (R14) |
| Long-tailed Jaeger | yes (Arctic) | 8 | 13,613 km | CC BY | GLS, Canadian Arctic | geolocator: rough positions |
| Sabine's Gull | yes | 10 | 13,464 km | CC0/CC BY | Juan de Fuca Eddy | |
| Atlantic Puffin | yes (Maine) | 12 | 15,478 km | CC0/CC BY | Iceland (Petersen) | VU: coarsen colonies |
| Black Swift | yes (Colorado) | 2 | 17,612 km | CC0 | Northern black swift, wintering in Brazil | VU; only 2 animals |
| Buff-breasted Sandpiper | yes | 3 | 12,436 km | CC0 | USGS Alaska Science Center | VU |
| Prothonotary Warbler | yes | 22 | 7,698 km | CC0 | breeding population study | |
| Common Nighthawk | yes | 3 | 6,856 km | CC0 | non-breeding ecology | |
| Yellow-billed Cuckoo | yes | 1 | 9,678 km | CC BY | western cuckoo, Lower Colorado River to Gran Chaco | 1 animal |
| Tundra Swan | yes | 53 | 6,206 km | CC0 | USGS Alaska Science Center | |
| Snowy Owl | yes | 28 | 3,135 km | CC BY | Snowy owl, North America | VU: coarsen nests. Strong public appeal |
| Golden Eagle | yes | 37 | 6,720 km | CC0 | HawkWatch International | |
| Long-billed Curlew | yes | 24 | 2,935 km | CC0 | USGS Alaska Science Center | |
| Marbled Godwit | yes | 11 | 3,501 km | CC0 | USGS Alaska Science Center | VU |
| Yellow-billed Loon | yes (Alaska) | 51 | 6,362 km | CC0 | USGS Alaska Science Center | NT |
| King Eider | yes (Alaska) | 138 | 4,349 km | CC0/CC BY | UAF/USGS | |
| Wood Stork | yes (Southeast) | 142 | 1,308 km | CC0 (1 CC BY) | NC Wood Stork Tracking | |
| Whooping Crane | yes | 2 | 1,780 km | CC BY | Eastern Whooping Crane Population Migration Timing | EN: nesting areas must never show (R14). Year-round, so it can join the first batch |
| Bowhead Whale | yes (Alaska/Canada) | 8 | 1,664 km | CC0 | Foxe Basin | |
| Mule Deer | yes (Wyoming) | 97 | 295 km | CC0 | Wyoming Sublette mule deer 2018-2020 | short: needs the globe |
| Caribou | yes (Alaska) | 232 | 417 km | CC BY (+CC0) | Nelchina herd, Alaska 1999-2002 | short: globe |
| Pronghorn | yes (Wyoming) | 27 | 93 km | CC0 | Wyoming/Colorado 2017-2019 | very short: globe; probably too short |
| Elk | yes (Alberta) | 334 | 134 km | CC0/CC BY | Elk in southwestern Alberta | short; the catalog calls it "Red Deer" (Cervus elaphus): must be "Elk" |
| Blue Wildebeest | no | 24 | 186 km | CC BY | white-bearded wildebeest | short; globe |
| Demoiselle Crane | no | 19 | 5,249 km | CC BY | 1000 Cranes, Russia | |

All of these are historical tracks (newest 2021), none live, so they show as "usually here around …" like the current non-live animals.

## Seasonal only, in the Data Repository (would follow the zebra's seasonal model)

| Dataset | Licence (repository) | Why interesting |
|---|---|---|
| Bar-tailed Godwit geolocator tracking, New Zealand 2013-2014 | CC BY 4.0 | the record-setting non-stop flights between Alaska and New Zealand; geolocator, rough positions |
| Ontogenetic shifts from social to experiential learning drive avian migration timing (whooping cranes, eastern US) | CC0 | US icon (EN: check R14 for nests) |
| Australia's east coast humpback whales: satellite tag movements | CC0 | first whale beyond the blue whale; not US |
| Bats surf storm fronts during spring migration (common noctule) | CC BY 4.0 | O3's first lead; first bat |
| Common noctule: three other packages (aerosphere, 3D tracks, post-hibernation) | CC0 | more bat material |
| Airplane tracking: fastest flight speeds recorded for bats (Brazilian free-tailed bat) | CC0 | US bat (Texas); probably nightly flights, not migration: check |
| Sandhill Cranes, Minnesota | CC BY-NC | **excluded** (non-commercial, L1) unless the owner gets written permission |

Searched with no CC0/CC BY result: gray whale, white shark, leatherback, arctic tern, monarch, hoary bat, mule deer migration (as a phrase; the mule deer above come from the catalog).

## Recommendation

1. **First batch, US and ready (year-round, no new download):** Snowy Owl, Whooping Crane, Whimbrel, Tundra Swan, Mule Deer (with the globe), Caribou (with the globe), Bowhead Whale. They cover an icon bird, a record shorebird, a big waterfowl flock, two land mammals and a second whale, mostly in Alaska, Canada and the US West.
2. **Second batch, seasonal:** Bar-tailed Godwit (records), common noctule (first bat), the CC0 whooping crane package if it adds young birds' first journeys.
3. Each new species needs what the current ones have: names en/de, a photo (CC0/CC BY), its facts in four pools (R8f, review page), and individual names (N1). Short mammal journeys get `globe: true`.

Re-check each study's licence and terms on the exact files before building, and coarsen breeding sites of threatened species (R14).
