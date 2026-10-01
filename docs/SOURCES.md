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
| TRMNL Framework breakpoints `sm:`/`md:`/`lg:` come from the device model, not a measured width: `md` = TRMNL OG and OG V2, `lg` = TRMNL V2 (the X), in both orientations; a prefix applies on its size and every larger one. The renderer puts `screen--md`/`screen--lg` on `.screen` (plugins.js reads it); the device class alone (`screen--v2`) does not | https://trmnl.com/framework/responsive; `plugins.css`/`plugins.js` latest | 2026-09-29 | Claude | verified in docs and CSS |
| Mashup layouts and their views: 1Lx1R = two `view--half_vertical`, 1Tx1B = two `view--half_horizontal`, 2x2 = four `view--quadrant`, mixed ones combine them; title bars are optional; pixel sizes are not given in the docs (measure them from the framework CSS) | https://trmnl.com/framework/mashup | 2026-09-29 | Claude | verified in docs |
| `image-dither` on an `<img>` marks a raster image for the TRMNL platform to dither to the device's palette at render time; it is a platform behaviour, not framework CSS (`plugins.css`/`plugins.js` latest contain no such rule, so local renders and BYOS do not dither). Full-tone sources are expected; pre-dithered images are served without the class | https://trmnl.com/framework/image | 2026-10-01 | Claude (after a Chef hint at submission) | verified in docs and CSS; not seen on a device |
| Private plugins have one markup tab per layout (Full, Half Horizontal, Half Vertical, Quadrant) plus Shared; "shared markup is prepended to every view layout before rendering"; `{% template name %}…{% endtemplate %}` defines a component, `{% render "name", x: y %}` calls it and it sees only the variables passed in | https://help.trmnl.com/en/articles/9510536-private-plugins; https://docs.trmnl.com/go/private-plugins/reusing-markup.md | 2026-09-29 | Claude | verified in docs; whether a script in Shared runs once per instance is not stated |

## Creative Commons attribution (checked 2026-09-29 by Claude, for the species pictures)

- CC BY 4.0 legal code, https://creativecommons.org/licenses/by/4.0/legalcode.en, section 3(a)(1): keep the creator's name as supplied, a copyright notice, a license notice, a warranty-disclaimer notice and a link to the material "to the extent reasonably practicable"; say if you modified it; name the license with its text or link. Section 3(a)(2): "You may satisfy the conditions in Section 3(a)(1) in any reasonable manner based on the medium, means, and context in which You Share the Licensed Material. For example, it may be reasonable to satisfy the conditions by providing a URI or hyperlink to a resource that includes the required information." Section 2(a)(4) allows technical modifications needed for a medium.
- CC FAQ, https://creativecommons.org/faq/: "you may satisfy the attribution requirement by providing a link to a place where the attribution information may be found."
- CC wiki, Recommended practices for attribution, https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution: title, author, source, license; note modifications ("Cropped from original"); its podcast example credits the music at the end, not while it plays.
- CC0: no attribution required (a public domain dedication, per the FAQ).
- Not legal advice. Re-fetch before relying on it.
