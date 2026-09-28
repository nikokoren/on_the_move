# Task 0 results

Status 2026-09-28: first pass done by Claude (task 0 session). Part A is only partly measured: 5 eligible-license studies need the project owner to accept their license terms before their data can be checked (see "Owner actions"). Re-run the checks before relying on any number here; stork tags die and embargoes change.

Time reference for all ages: 2026-09-28 14:00 UTC. "Fresh 14 d / 30 d" = deployed animals with at least one visible GPS fix **with coordinates** in that many days.

## Searches made

All Movebank calls: `https://www.movebank.org/movebank/service/direct-read`, authenticated as the project account, one request at a time (rate limit: one concurrent request per IP, per the API doc). GBIF calls: `https://api.gbif.org/v1/occurrence/search`, no key.

| Date | Where (endpoint or page) | Query | Hits | Notes |
|---|---|---|---|---|
| 2026-09-28 | Movebank `entity_type=study` | `i_have_download_access=true`, attributes incl. `go_public_license_type` | HTTP 500 | Server NullPointerException; attribute `go_public_license_type` (shown in the API doc's example output) is not accepted as a request attribute. Dropped it. |
| 2026-09-28 | Movebank `entity_type=study` | `i_have_download_access=true` | 1000 studies | `license_type`: CC_0 448, CC_BY 254, CC_BY_NC 219, CUSTOM 79 |
| 2026-09-28 | Movebank `entity_type=study` | no filter (all studies visible to the account) | 8792 studies | 1000 with download access, 7792 without. Matches the row above, so 1000 is not a page cap. |
| 2026-09-28 | Local filter on `taxon_ids` of the 8792 | 26 candidate species (table below) | see below | Freshness = study-level `timestamp_last_deployed_location` between 2026-08-29 and 2026-09-29 |
| 2026-09-28 | Movebank `entity_type=event` | 14 studies (table "Studies"), `sensor_type_id=653`, `timestamp_start=20260829000000000` | 6 returned data, 8 returned the license terms page | `accept-license: true` header on the 8 |
| 2026-09-28 | Movebank `entity_type=individual` | same 14 studies | 6 returned data, 8 the license terms page | Reference data is gated by the same terms prompt |
| 2026-09-28 | Movebank `entity_type=event`, `event_reduction_profile=EURING_03` | 1278021460, 1841091905 | 100,359 / 18,766 rows | Newest downloadable fix per animal, to measure the embargo |
| 2026-09-28 | Local filter on the 8792 | fresh (≤14 d, study level) studies **without** download access, 4 species | stork 37, black stork 11, honey buzzard 9, lesser spotted eagle 4 | All CUSTOM license among the top 6 of each; permission candidates |
| 2026-09-28 | GBIF `occurrence/search` | 7 species, `geoDistance=48.137,11.575,50km` (Munich), `license=CC0_1_0` + `CC_BY_4_0`, `occurrenceStatus=PRESENT`, 2026-03-01..2026-05-31 and 2026-08-29..2026-09-28 | see GBIF table | |
| 2026-09-28 | GBIF `occurrence/search` facets | same, no license filter, `facet=license,datasetKey`, plus spring 2025 | see GBIF table | To see what the license filter removes |
| 2026-09-28 | GBIF `dataset/{key}` | 4 dataset keys from the facets | 4 | iNaturalist RG (CC BY-NC, modified 2026-09-10), Observation.org (CC BY-NC, 2026-09-22), NABU\|naturgucker (CC BY, **modified 2025-10-29**), Birda (CC BY-NC, 2025-08-08) |
| 2026-09-28 | GBIF `species/{key}/iucnRedListCategory` | 6 species | 6 | Stork, honey buzzard, griffon, Montagu's harrier, crane LC; curlew NT |

### Candidate species (Movebank, study level)

"All" = studies visible to the account containing the species; "dl" = with download access; "fresh" = study-level newest deployed location in the last 30 days. Study-level statistics are updated about daily and can lag (seen: 8 days on 186178781) or include embargoed data (seen: 1278021460, 1841091905).

| Species | All | Fresh | dl | dl + fresh | dl + fresh by license |
|---|---|---|---|---|---|
| White stork *Ciconia ciconia* | 131 | 50 | 33 | 9 | CC_BY 6, CC_0 1, CC_BY_NC 2 |
| European honey buzzard *Pernis apivorus* | 26 | 14 | 8 | 3 | CC_BY 1, CC_BY_NC 2 |
| Montagu's harrier *Circus pygargus* | 64 | 28 | 1 | 1 | CC_0 1 |
| Eurasian curlew *Numenius arquata* | 44 | 18 | 4 | 1 | CC_0 1 |
| Common crane *Grus grus* | 93 | 24 | 5 | 1 | CC_0 1 |
| Black kite *Milvus migrans* | 37 | 13 | 6 | 1 | CC_BY_NC 1 |
| Black-tailed godwit *Limosa limosa* | 68 | 24 | 3 | 1 | CC_BY_NC 1 |
| Barn swallow, hoopoe, Eleonora's falcon, wheatear, bee-eater, roller | 2 to 15 each | 1 to 3 | 1 to 7 | 1 each | CC_BY_NC 1 each |
| Black stork, cuckoo, osprey, lesser spotted eagle, swift, whimbrel, bar-tailed godwit, white-fronted goose, Egyptian vulture, steppe eagle, red-footed falcon, booted eagle, short-toed eagle | 5 to 84 each | 0 to 37 | 0 to 8 | **0** | none |

## Studies

| Study ID | Species | License (API) | Newest fix | Fresh animals (14 d / 30 d) | Classification | Record |
|---|---|---|---|---|---|---|
| 21231406 LifeTrack White Stork SW Germany | white stork | CC_BY | 2026-09-28 10:30 (Louis, Catalonia) | 1 / 1 | eligible | [21231406](studies/21231406.md) |
| 10449318 LifeTrack White Stork Loburg | white stork | CC_BY | 2026-09-27 16:00 (Mose, Jordan Valley) | 1 / 1 | eligible | [10449318](studies/10449318.md) |
| 186178781 Raptors NABU Moessingen public | honey buzzard, griffon | CC_BY | 2026-09-27 (griffon); honey buzzard 2026-09-16, West Africa | 2 / 2 | eligible | [186178781](studies/186178781.md) |
| 24442409 LifeTrack White Stork Bavaria | white stork | CC_BY | study level 2026-09-26 | not measurable (terms) | pending: accept terms | [24442409](studies/24442409.md) |
| 212096177 LifeTrack White Stork Oberschwaben | white stork | CC_BY | study level 2026-09-25 | not measurable (terms) | pending: accept terms | [212096177](studies/212096177.md) |
| 173641633 LifeTrack White Stork Vorarlberg | white stork | CC_BY | study level 2026-09-24 | not measurable (terms) | pending: accept terms | [173641633](studies/173641633.md) |
| 76367850 LifeTrack White Stork Rheinland-Pfalz | white stork | CC_BY | study level 2026-09-22 | not measurable (terms); hidden-data flag | pending: accept terms | [76367850](studies/76367850.md) |
| 1229945587 Common Crane 2020 (LEU) | common crane | CC_0 | study level 2026-09-20 | not measurable (terms) | pending: accept terms | [1229945587](studies/1229945587.md) |
| 1562253659 LifeTrack White Stork Sarralbe | white stork | CC_0 | 2026-08-31 (Noé, Spain) | 0 / 1 | stale | [1562253659](studies/1562253659.md) |
| 1278021460 BOP_RODENT (harriers, Flanders) | Montagu's harrier and 4 more | CC_0 | downloadable 2026-03-27 (reference data: 2026-09-28) | 0 / 0 | stale (about 6-month download lag) | [1278021460](studies/1278021460.md) |
| 1841091905 CURLEW_VLAANDEREN | curlew (NT, R14) | CC_0 | downloadable 2022-08-07 | 0 / 0 | stale | [1841091905](studies/1841091905.md) |
| 2201086728 European Honey Buzzard_Finland | honey buzzard | CC_BY_NC | study level 2026-09-27 | not measurable (terms) | needs permission | [2201086728](studies/2201086728.md) |
| 4809963363 NABU FTZ White Stork Hamburg 2019-2020 | white stork | CC_BY_NC | study level 2026-09-21 | not measurable (terms) | needs permission (low priority) | [4809963363](studies/4809963363.md) |
| 864730855 NABU FTZ White Stork Hamburg 2024 | white stork | CC_BY_NC | study level 2026-09-22 | not measurable (terms) | needs permission (low priority) | [864730855](studies/864730855.md) |

Permission candidates without download access (study level only, not checked further): `8739749420` MPIAB ELSA 2.0 White Stork Bavaria (2026ff), CUSTOM, 100 animals, newest 2026-09-28; `8732924035` ELSA 2.0 Baden-Württemberg (2026ff), CUSTOM, 214 animals; `8702046608` ELSA 2.0 Rheinland-Pfalz (2026ff), CUSTOM, 155 animals; `1337442631` Honey Buzzard MPI-AB Baden-Wuerttemberg, CUSTOM, 16 animals. Source: `captures/2026-09-28_movebank_study-attributes_candidates.csv`.

**Totals now (measured):** 3 CC BY studies, 4 animals eligible and fresh within 14 days with coordinates: 2 white storks (Louis, Mose), 1 honey buzzard (12212, turns 14 days old on 2026-09-30), 1 griffon vulture (not a migrant in the brief's sense).

### Data findings the Worker must handle

- Rows without `individual_id` (tags not deployed on an animal) are mixed into study event downloads: 46,224 of 46,496 rows in 21231406, 3,810 of 3,913 in 1562253659. Drop them.
- Some deployed tags send records with no coordinates (Muffine: 150 rows, 0 with position). "Newest record" is not "newest position".
- One study (10449318) contains an individual with taxon *Homo sapiens* (test tag). Whitelist by animal, not by study.
- Study-level `timestamp_last_deployed_location` is not proof of downloadable fresh data: it lagged by 8 days (186178781) and it counted embargoed data (1278021460, 1841091905).
- `license_type` values seen live: `CC_0`, `CC_BY`, `CC_BY_NC`, `CUSTOM`. These match the placeholders in `data/studies.schema.json`.

## GBIF latency

Munich, `geoDistance=48.137,11.575,50km`, `occurrenceStatus=PRESENT`. "Eligible" = `license=CC0_1_0` or `CC_BY_4_0`. "All" = no license filter. GBIF records have no field for the date a record first reached GBIF (checked: record keys include `modified`, `lastCrawled`, `lastParsed`, `lastInterpreted`; no `created`), so delay is given as an **upper bound**, `lastParsed − eventDate`, only for the last-30-day window. For spring records that upper bound (median 140 to 191 days) only shows GBIF re-parsed them recently, so it is not reported as delay.

| Date | Species | Area / radius | Window | Records eligible / all | Median delay (days) | Max delay (days) | Capture |
|---|---|---|---|---|---|---|---|
| 2026-09-28 | White stork | Munich 50 km | 2026-03-01..05-31 | 2 / 68 | n/a | n/a | `captures/2026-09-28_gbif_munich50km_ciconia-ciconia_spring.json` |
| 2026-09-28 | Barn swallow | Munich 50 km | spring 2026 | 0 / 50 | n/a | n/a | `..._hirundo-rustica_spring.json` |
| 2026-09-28 | Common swift | Munich 50 km | spring 2026 | 0 / 49 | n/a | n/a | `..._apus-apus_spring.json` |
| 2026-09-28 | Cuckoo | Munich 50 km | spring 2026 | 5 / 38 | n/a | n/a | `..._cuculus-canorus_spring.json` |
| 2026-09-28 | House martin | Munich 50 km | spring 2026 | 0 / 6 | n/a | n/a | `..._delichon-urbicum_spring.json` |
| 2026-09-28 | Chiffchaff | Munich 50 km | spring 2026 | 36 / 384 | n/a | n/a | `..._phylloscopus-collybita_spring.json` |
| 2026-09-28 | Common crane | Munich 50 km | spring 2026 | 8 / 13 | n/a | n/a | `..._grus-grus_spring.json` |
| 2026-09-28 | White stork | Munich 50 km | 2026-08-29..09-28 | 1 / 2 | ≤ 7 (n = 1) | ≤ 7 | `..._ciconia-ciconia_last30.json` |
| 2026-09-28 | Barn swallow | Munich 50 km | last 30 d | 0 / 3 | n/a | n/a | `..._hirundo-rustica_last30.json` |
| 2026-09-28 | Swift, cuckoo, house martin, crane | Munich 50 km | last 30 d | 0 / 0 each | n/a | n/a | `..._last30.json` (4 files) |
| 2026-09-28 | Chiffchaff | Munich 50 km | last 30 d | 0 / 1 | n/a | n/a | `..._phylloscopus-collybita_last30.json` |

Comparison, spring 2025, same query (eligible / all): stork 15 / 62, swallow 15 / 42, swift 27 / 34, cuckoo 38 / 62, house martin 3 / 6, chiffchaff 118 / 167, crane 2 / 3. Most eligible 2025 records come from NABU|naturgucker (CC BY), whose GBIF dataset was last modified 2025-10-29, so its 2026 records have not reached GBIF yet: a lag of at least 5 months, possibly a stopped feed. Facets: `captures/2026-09-28_gbif_munich50km_license-facets.json`.

Summary: newest eligible record for the 7 species within 50 km of Munich is 24 days old (one stork, 2026-09-04, iNaturalist CC BY). The license filter removed 38 to 100% of spring 2026 records per species (median 97%; crane 38%, cuckoo 87%, chiffchaff 91%, stork 97%, swallow, swift and house martin 100%) (iNaturalist and Observation.org are CC BY-NC at dataset level; only individual iNaturalist records are CC BY).

## Recommendation for D1 and D2

For the owner to decide; not recorded as decided.

- **D1: Mode A only.** Mode B is not viable around Munich under the licensing rule: in spring 2026, 0 eligible records for swallow, swift and house martin, and 0 to 1 eligible records per species in the last 30 days. Its main CC BY source has not updated in GBIF for 11 months. Revisit only if that changes (re-run the facet query).
- **D2: white stork first, honey buzzard second.** Storks: LifeTrack studies (CC BY). Measured now: 2 fresh storks. The Bavaria, Oberschwaben, Vorarlberg and Rheinland-Pfalz studies (CC BY, 91 + 18 + 28 + 109 animals, study-level fixes 2026-09-22 to 26) can't be measured until the owner accepts their terms. Expect few live tags per study: SW Germany has 94 animals, 92 of them with a death note, and 1 fresh with positions. Honey buzzard: 1 bird (12212, Mössingen, CC BY), already in West Africa, the only eligible long-distance migrant found. It is fragile (one tag), so a permission request is worth it (below).
- **Strongest lever: one permission request to MPI of Animal Behavior (W. Fiedler).** The 2026 stork cohorts (ELSA 2.0 Bavaria, Baden-Württemberg, Rheinland-Pfalz; 469 animals, fixes today) and the Baden-Württemberg honey buzzards are CUSTOM and not downloadable. The same PI runs the CC BY LifeTrack studies.
- **D3 evidence:** LifeTrack SW Germany delivered a fix under 4 hours old; BOP_RODENT has a download lag of about 6 months. The recommendation stands: always show the date of the last position.

## Owner actions

1. Log in to Movebank and accept the license terms for 24442409, 212096177, 173641633, 76367850 and 1229945587 (start a download of each in the web app, or use the API's `license-md5` step). The terms texts and their SHA-256 are in the study records. Then ask an agent to re-run the Part A checks for those 5.
2. Decide on the permission requests: MPI-AB (ELSA 2.0 storks, BW honey buzzards) and 2201086728 (Finland honey buzzards, CC BY-NC). A draft is in [2201086728](studies/2201086728.md).
3. Decide D1 and D2 and record them in `../DECISIONS.md`.
