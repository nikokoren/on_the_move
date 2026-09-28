# Outside systems: facts log

Every fact about an outside system goes here with its source, the date it was checked, and who checked it. **Re-fetch before relying on any entry.** Where this file and the live web disagree, the web wins; update the entry and date it.

Status 2026-09-28: nothing below has been re-verified in this repo yet. Entries marked "brief" come from `docs/BRIEF.md`, whose author checked them in September 2026.

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

To add during task 0 (find, then record the URL and date here): Movebank REST API documentation, GBIF occurrence API reference (gbif.org, not only rgbif), GBIF citation guidelines, Natural Earth terms of use, TRMNL polling/webhook size limits, TRMNL Framework docs.

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
