# Task 0b: global survey (many species, live and historical)

- Checked: 2026-09-28 by Claude (task 0 session). Re-run before relying on any number; tags die, embargoes change, repositories grow.
- Why: on 2026-09-28 the project owner widened the scope. Not limited to Munich; build a database of many migrating animals worldwide. Two kinds of content (owner's categories):
  - **A**: live now, and live every year (an ongoing study with tags that have already done at least one full annual cycle).
  - **B**: a complete dataset covering at least one full migration cycle, used to say what usually happens at this time of year ("usually around late September, X is at Y").
- Licensing rule unchanged: CC0 and CC BY only (brief section 2).
- Time reference: 2026-09-28 14:00 UTC. "Full cycle" = an animal tracked for at least 330 days (reference data `timestamp_start` to `timestamp_end`, or `deploy-on-date` to `deploy-off-date`). That is a necessary condition, not proof: the track can have gaps.

## Headline numbers

| Source | What | Eligible (CC0/CC BY) | Usable now without owner action | Category |
|---|---|---|---|---|
| Movebank studies, open (no terms prompt) | 146 studies, 124 species | 146 studies | yes | A and B |
| Movebank studies, locked (terms prompt) | 556 studies, 323 species | 556 studies | **no**: owner must accept terms per study | A and B |
| Movebank Data Repository | published, frozen, DOI-cited packages; anonymous download | 404 of 450 packages (377 CC0, 27 CC BY) | yes, no account needed | B |
| GBIF occurrences | sightings, aggregated by month and place | per record; birds mostly CC BY via eBird (EOD) | yes, no key | B-like ("usual pattern"), no individuals |

## Category A: live now and every year

### Verified by download (open studies)

Checked every open study whose reference data showed an animal with `timestamp_end` in the last 30 days (19 studies) by downloading its events for 2026-08-29 onward. Counted: deployed animals with a visible fix with coordinates in the last 14 days **and** tracked at least 330 days.

| Species | Animals live (≤14 d) | Also full cycle | Study (license) | Where now (coarse) |
|---|---|---|---|---|
| Lesser black-backed gull *Larus fuscus* | 17 | 19 (≤30 d) | 1258895879 DELTATRACK (CC0) | North France / Belgium coast; one off NW Spain |
| European turtle dove *Streptopelia turtur* (**IUCN VU**, R14) | 8 | 10 | 3413045568 Habitrack (CC BY) | southern Europe (Spain, Italy, Greece, Sicily): pre-Sahara staging |
| Turkey vulture *Cathartes aura* | 6 | 6 | 481458 Vultures Acopian Center USA (CC BY) | Arizona and Sonora |
| Red kite *Milvus milvus* | 6 | 7 | 501903109 Red Kite MPI-AB BW (CC0) | Baden-Württemberg; 1 tag reports from 27 N 89 E (Himalaya), suspect: check before use |
| Broad-winged hawk *Buteo platypterus* | 4 | 4 | 28691134 (CC BY) | Tennessee, Missouri, and one in NE Mexico heading south |
| Black vulture *Coragyps atratus* (not a migrant) | 3 | 0 | 481458 (CC BY) | NE USA |
| Herring gull *Larus argentatus* | 2 | 2 | 1258895879 (CC0) | Belgium coast |
| White stork *Ciconia ciconia* | 2 | 2 | 21231406, 10449318 (CC BY) | Catalonia; Jordan Valley |
| Honey buzzard *Pernis apivorus* | 1 | 1 | 186178781 (CC BY) | Liberia / Guinea |
| Griffon vulture *Gyps fulvus* | 1 | 1 | 186178781 (CC BY) | Cantabria |

Total: 50 live animals of 10 species; 47 of them belong to the 9 species that migrate (black vulture excluded). Positions are not committed for these; counts only: `captures/2026-09-28_movebank_global_live-verified_no-coords.json`.

Reference data is not proof of live downloads: 11 of the 19 studies showed live animals in reference data but returned no fix newer than 14 days (all Flemish INBO studies: gulls, spoonbills, curlews, harriers, turtle doves, parakeets). Those hold back recent data from download (seen before: about 6 months for 1278021460).

### Candidates behind terms acceptance (study level only)

12 of the 556 locked studies have a study-level newest fix in the last 30 days and span at least a year. Migrants among them: white stork (4 studies: Bavaria, Oberschwaben, Vorarlberg, Rheinland-Pfalz), common crane (1). The rest are resident or local (Forest Park Living Lab, USA, 15 species; Galápagos tortoises, which do migrate up and down the volcano; South African vultures; black-headed gull; American crow). Not verified: numbers can shrink once the per-animal data is visible.

**Finding: live, eligible, full-cycle tracking of migrants is rare worldwide.** 47 animals of 9 migrating species today, concentrated in Western Europe and the USA.

## Category B: full migration cycles, historical

### Movebank Data Repository (open now, no account)

- 404 CC0/CC BY packages. Per-animal deploy-on/off dates read from each package's `reference-data` file for 281; 123 packages have no such file or no deploy-off dates (not counted, not rejected).
- **128 species with at least one animal tracked ≥ 330 days, 2,416 animals in total.** Full list: `captures/2026-09-28_movebank-dr_cc0-ccby_per-species-spans.json`; packages with DOI, license and counts: `captures/2026-09-28_movebank-dr_cc0-ccby_packages.json`.
- Download checked on one package (Antarctic blue whales, CC0): the event CSV, reference CSV and README download anonymously (HTTP 206 on a range request).

Migrants among them, by kind (number of animals tracked ≥ 330 days). Which species count as migratory is Claude's judgement, not from a source; verify it in the species table (R8).

- **Long-distance birds:** white stork 154, alpine swift 118, red-backed shrike 98 (Europe to southern Africa), tree swallow 93, wood stork 65, Caspian tern 60, northern wheatear 60 (Arctic to Africa), osprey 59, Antarctic petrel 51, Kirtland's warbler 27, dunlin 26, long-tailed skua 23, Siberian rubythroat 16, whinchat 15, bar-tailed godwit 13, red knot 7, European roller 17, fork-tailed flycatcher 19, white-crested elaenia 20 (both South American migrants), barn swallow 9, Egyptian vulture 9, pied flycatcher 10.
- **Soaring birds and waterfowl:** turkey vulture 69, bald eagle 31, golden eagle 36, greater white-fronted goose 17, Steller's eider 20, common eider 35, black-necked crane 5.
- **Mammals:** reindeer / caribou 118 (IUCN VU), red deer / elk 96, Arctic fox 100, pronghorn 24, blue wildebeest 24, African elephant 14 (R14 check).
- **Sea:** blue whale 1 (IUCN EN), green turtle 5, mobula rays 6, Brünnich's guillemot 135.
- **Also full cycle, not classic migrants:** Galápagos tortoises (3 species, 68; altitudinal migration), wolves, lynx, snakes and others.

### Open Movebank studies (live API, open now)

78 of the 124 species in the 146 open studies have at least one animal tracked ≥ 330 days. The strongest migrant sets: lesser black-backed gull 239, herring gull 130, common eider 95, yellow-billed loon 62, turkey vulture 62, tundra swan 53, white stork 52, spectacled eider 50, lesser yellowlegs 29, long-billed curlew 24, lesser flamingo 19, whimbrel 10. Many are USGS Alaska Science Center Argos studies (CC0). Full table: `captures/2026-09-28_movebank_global_open-studies_per-species.json`.

### Locked Movebank studies (study level)

336 of the 556 locked studies span at least 330 days, covering 260 species. These include blue, fin, humpback and bowhead whales, sperm whale, whale shark, loggerhead and green turtles, wildebeest, caribou, elephants, whooping crane, cuckoo, straw-coloured fruit bat and noctule bat. Per-animal cycles are unknown until terms are accepted. Many of them probably also appear as Data Repository packages (the repository publishes snapshots of Movebank studies), so the repository route may unlock them without accepting terms. Not yet cross-checked. List: `captures/2026-09-28_movebank_global_locked-studies_per-species.json`.

## Sightings-based patterns (GBIF): monarchs and friends

No individual tracks exist for monarchs in Movebank's eligible data (searched `Danaus` in the taxa and names of all 8,792 Movebank studies visible to the account, and in all 2,010 Data Repository items: 0 hits). GBIF sightings can still give the "usually around late September they are here" line.

Monarch *Danaus plexippus*, North America (lon −130 to −60), 2015 to 2025, CC0/CC BY only, 39,057 eligible of 349,238 records (11%). Median 5° latitude band by month:

| Month | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Median band (°N) | 25–30 | 30–35 | 30–35 | 30–35 | 30–35 | 40–45 | 40–45 | 40–45 | 40–45 | 35–40 | 30–35 | 30–35 |

The spring advance and the October retreat show clearly. Caveats: sightings follow observers, not butterflies. The Mexican winter roosts (about 19 N) are nearly absent from eligible data (≤ 107 records per month for 10–20 N). Counts: `captures/2026-09-28_gbif_monarch_month-latband.json`.

Eligible share for other famous migrants, 2015 to 2025, worldwide: barn swallow 94%, sandhill crane 98%, snow goose 97%, Arctic tern 89%, whale shark 88%, humpback whale 85%, red knot 85%, bar-tailed godwit 76%, reindeer 62%, white stork 59%, painted lady 37%, green turtle 33%, gray whale 23%, wildebeest 13%, monarch 11%, green darner 10%. Birds score high because the eBird Observation Dataset on GBIF (EOD) is **CC BY 4.0** (checked 2026-09-28, dataset `4fa7b334-ce0d-4e88-aaae-2e0c138d049e`, 10.1 M of 11.5 M eligible barn swallow records). EOD is not eBird Status and Trends, which stays excluded. Counts: `captures/2026-09-28_gbif_global_eligible-counts_16-species.txt`.

## Conflicts with the brief (for the owner)

- **"Pretend it is now" vs D3 and R9.** Showing last year's track as if it were today's position would be the live-tracking claim D3 rules out. R9 also demands present-moment wording and no claims about the season. The owner's example ("usually around August, monarchs are at ABC") is fine if it is always labelled as typical or as last year's position on this date. It needs a change to R9 in `DECISIONS.md`, and a rule that every historical item shows its year.
- **R14:** threatened species in the pool (IUCN via GBIF, 2026-09-28): turtle dove VU (live), reindeer VU, blue whale EN, whale shark EN, loggerhead VU, whooping crane EN, straw-coloured fruit bat NT, curlew NT. Coarsen these, and never show breeding sites.

## Owner decisions this needs

1. **Scope:** record the widened scope as a decision (replaces D1 and D2 as framed for Munich).
2. **Terms acceptance for locked studies:** 556 studies. Accepting is the account holder's legal act. The API can do it per study (`license-md5`), so it can be scripted once you say which studies (or all of them) you accept. Cheaper first step: check how many locked studies are already covered by CC0 packages in the Data Repository, which need no acceptance.
3. **Content model:** A (about 50 live animals, Europe and USA) plus B from the Data Repository (128 species with full cycles) plus GBIF patterns for species without tracks (monarch).

## Search record

| Date | Where | Query | Hits |
|---|---|---|---|
| 2026-09-28 | Movebank `direct-read?entity_type=study` | downloadable, `license_type` CC_0 or CC_BY, not test | 702 (146 open, 556 terms prompt) |
| 2026-09-28 | Movebank `entity_type=individual` | all 146 open studies | 146/146 returned data |
| 2026-09-28 | Movebank `entity_type=event`, `timestamp_start=20260829000000000` | 19 open studies with live reference data | 8 with live fixes, 11 without |
| 2026-09-28 | Movebank Data Repository `server/api/discover/search/objects?dsoType=ITEM` | all items | 2010 items, 450 data packages, 404 CC0/CC BY |
| 2026-09-28 | Data Repository `core/items/{uuid}/bundles` and bitstreams | 404 packages | 281 with per-animal spans |
| 2026-09-28 | GBIF `occurrence/search` | monarch, month × latitude band, 96 queries | table above |
| 2026-09-28 | GBIF `occurrence/search` | 16 species, eligible vs all, 2015 to 2025 | list above |
| 2026-09-28 | GBIF `dataset/{key}` | top 3 datasets for eligible barn swallow | EOD (CC BY), Artportalen (CC0), Norwegian Species Observation Service (CC BY) |
| 2026-09-28 | GBIF `species/{key}/iucnRedListCategory` | 17 species | see R14 above |
