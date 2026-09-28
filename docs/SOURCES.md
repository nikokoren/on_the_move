# Outside systems: facts log

Every fact about an outside system goes here with its source, the date it was checked, and who checked it. **Re-fetch before relying on any entry.** Where this file and the live web disagree, the web wins; update the entry and date it.

Status 2026-09-28: Movebank API and GBIF API facts below re-verified by task 0 ("Claude, task 0"). Entries marked "brief" come from `docs/BRIEF.md` and are not re-verified yet.

## Source links (unversioned)

| Topic | URL |
|---|---|
| Movebank terms of use | https://www.movebank.org/cms/movebank-content/general-movebank-terms-of-use |
| Movebank permissions and embargo | https://www.movebank.org/cms/movebank-content/permissions-and-sharing |
| Movebank attribute dictionary (license fields) | https://movebank.org/cms/movebank-content/movebank-attribute-dictionary |
| GBIF occurrence search parameters (rgbif docs) | https://docs.ropensci.org/rgbif/reference/occ_data.html |
| eBird Status and Trends terms (excluded) | https://science.ebird.org/mn/status-and-trends/products-access-terms-of-use |
| TRMNL Creator Fund | https://trmnl.com/blog/creator-fund |
| CC NonCommercial interpretation | https://wiki.creativecommons.org/NonCommercial_interpretation |
| Movebank REST API documentation (found 2026-09-28) | https://github.com/movebank/movebank-api-doc/blob/master/movebank-api.md |
| GBIF occurrence API reference (found 2026-09-28) | https://techdocs.gbif.org/en/openapi/v1/occurrence (machine-readable: https://techdocs.gbif.org/openapi/occurrence.json) |

Still to find (record the URL and date here): GBIF citation guidelines, Natural Earth terms of use, TRMNL polling/webhook size limits, TRMNL Framework docs.

## Facts

| Fact | Source | Checked | By | Status |
|---|---|---|---|---|
| Movebank studies choose their license: CC0, CC BY, CC BY-NC or custom | Movebank attribute dictionary | 2026-09 | brief | re-fetch |
| Public studies may require accepting license terms once before first download | Movebank permissions page | 2026-09 | brief | re-fetch |
| Owners can embargo public downloads; public web map coordinates cannot be extracted | Movebank permissions page / terms | 2026-09 | brief | re-fetch |
| GBIF occurrence search needs no key; filters `taxonKey`, `geoDistance`, `eventDate`, `license` | rgbif docs | 2026-09 | brief | re-fetch; confirm against GBIF's own API docs |
| GBIF record licenses: `CC0_1_0`, `CC_BY_4_0`, `CC_BY_NC_4_0` | rgbif docs | 2026-09 | brief | re-fetch |
| eBird Status and Trends terms don't cover commercial use | eBird S&T terms | 2026-09 | brief | re-fetch |
| Creator Fund: 80% of TRMNL+ revenue plus 10 to 15% of hardware sales; payouts from playlist age, presence and impressions; threshold 50 installs plus forks | TRMNL blog | 2026-09 | brief | re-fetch |
| TRMNL webhooks capped at 2 KB (5 KB with TRMNL+) | not linked in brief | 2026-09 | brief | find source, re-fetch |
| Natural Earth data is public domain | not linked in brief | 2026-09 | brief | find source, re-fetch |
| Movebank `license_type` values returned by the API: `CC_0`, `CC_BY`, `CC_BY_NC`, `CUSTOM` (counts over 1000 downloadable studies: 448, 254, 219, 79) | live API, `direct-read?entity_type=study` | 2026-09-28 | Claude, task 0 | verified live |
| Movebank rate limit: one concurrent request per IP, 20 total | Movebank REST API doc (header note) | 2026-09-28 | Claude, task 0 | re-fetch |
| Studies requiring terms acceptance return the terms page with header `accept-license: true` instead of data, for `event` **and** `individual` requests. Acceptance: via web download, or API with `license-md5=<md5 of terms page>` and a session cookie | live API + REST API doc | 2026-09-28 | Claude, task 0 | verified live (8 studies) |
| Study attribute `go_public_license_type` appears in the doc's example output but a request listing it in `attributes` fails with HTTP 500 | live API | 2026-09-28 | Claude, task 0 | verified live |
| Study-level summary stats (`timestamp_last_deployed_location` etc.) are updated about once per day; they can lag and can include data the account cannot download | REST API doc + live comparison | 2026-09-28 | Claude, task 0 | verified live |
| Event downloads include rows with empty `individual_id` (tags not deployed on an animal) | live API | 2026-09-28 | Claude, task 0 | verified live |
| GBIF occurrence search: no key; parameters `taxonKey`, `geoDistance` (e.g. `48.137,11.575,50km`), `eventDate` (range `a,b`), `license` (repeatable: `CC0_1_0`, `CC_BY_4_0`), `occurrenceStatus` | GBIF OpenAPI | 2026-09-28 | Claude, task 0 | verified live |
| GBIF occurrence records have no "first published" date; available: `modified` (publisher), `lastCrawled`, `lastParsed`, `lastInterpreted` | live record keys | 2026-09-28 | Claude, task 0 | verified live |
| GBIF dataset licenses: iNaturalist Research-grade Observations CC BY-NC (records individually CC0/CC BY/CC BY-NC), Observation.org CC BY-NC, NABU\|naturgucker CC BY (last modified 2025-10-29) | `api.gbif.org/v1/dataset/{key}` | 2026-09-28 | Claude, task 0 | re-fetch |
| GBIF API resets connections intermittently; retry with backoff | live | 2026-09-28 | Claude, task 0 | observed |
| What the Movebank acceptance page asks (same generic page for every study, "Last updated February 2019"): follow the study's License Type and License Terms; owner permission not required for public CC0/CC BY/CC BY-NC downloads, but contacting owners about new uses and offering credit is "strongly encouraged"; follow Movebank's citation guidelines (citation required for CC BY and CC BY-NC); do not hold Movebank or the owner liable for data errors; assess fitness for use (download ≠ endorsement); follow Movebank's user agreement | captured page `docs/survey/captures/2026-09-28_movebank_24442409_license-terms.html` | 2026-09-28 | Claude, task 0 | verified live |
| Of the 556 locked CC0/CC BY studies, study-specific `license_terms` text: 491 empty, 44 the standard CC0 deed text, 21 the standard CC BY deed text ("…even commercially, as long as they credit you…"). No study-specific extra restrictions found | live API, `entity_type=study` | 2026-09-28 | Claude, task 0 | verified live; re-check before bulk acceptance |
| Acceptance is per Movebank account and per study, and lasts until the owner changes the terms. Two ways: start a download in the web app and click accept, or API: request data with a cookie jar, take the MD5 of the returned terms page, repeat the request with `license-md5=<md5>` and the same cookie | Movebank REST API doc, "Read and accept license terms using curl" | 2026-09-28 | Claude, task 0 | re-fetch; API route not yet exercised |
