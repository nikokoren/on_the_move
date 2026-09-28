# Task 0: data survey

Goal: find out whether enough **eligible** (CC0 or CC BY, or written permission) and **fresh** public tracking data exists to build Mode A, and whether GBIF is fresh enough for Mode B. The outcome decides D1 and D2 (see `../DECISIONS.md`).

Status 2026-09-28: first pass done, see `results.md`. Open: 5 CC0/CC BY studies need the owner to accept their license terms before their freshness can be measured (list in `results.md`, "Owner actions").

## Prerequisites

- A registered Movebank account for API downloads. Credentials go in a local, git-ignored `.dev.vars` or environment variables, never in files that get committed.
- Accepting a study's license terms is a legal act by the account holder. Agents record which studies require it; the project owner accepts them.
- Before starting, re-fetch the Movebank and GBIF docs listed in `../SOURCES.md` and update the entries you rely on.

## Part A: Movebank (Mode A)

Candidate species (brief D2): white stork (*Ciconia ciconia*) first, then one or two long-distance species. Record candidates considered in `results.md` even if rejected.

For each study found:

1. Create `studies/<movebank-study-id>.md` from `studies/_TEMPLATE.md`.
2. Record license type **as returned by the API** (not the web page alone), terms text or hash, citation, embargo and download restrictions, newest public fix date, animal counts.
3. Save the raw API response (trimmed to what's needed, credentials and account data scrubbed) in `captures/<date>_<study-id>_<what>.<ext>`. These captures are the seed of the fixture corpus (working method rule 1).
4. Classify: **eligible** (CC0/CC BY and fresh), **stale** (eligible license, no data in the last few weeks), **needs permission** (CC BY-NC or custom but promising), **rejected** (with reason).

Search record (rule 4): in `results.md`, list every search made (endpoint or page, query, date, number of hits), so a "none found" is a proven claim.

## Part B: GBIF (Mode B freshness check)

The brief asks for real queries around Munich in spring. It is autumn now (2026-09-28), so:

- Query last spring's window (for example March to May 2026) for a handful of migrants around Munich, filtered to `CC0_1_0` and `CC_BY_4_0`, and compare `eventDate` with the date the record reached GBIF (field names to confirm from the live API).
- Query the last 30 days for autumn departures the same way.
- Save responses in `captures/` and summarize latency as numbers (median and worst-case days).

## Output

`results.md`: a table of all studies with their classification, counts of eligible and fresh animals per species, the GBIF latency numbers, and a recommendation for D1 and D2. Then update `../DECISIONS.md` once the owner decides.

## Contacting owners

For "needs permission" studies, draft the request (use, credit offered, the Creator Fund context from brief section 2) in `studies/<id>.md`. The owner of this project sends it. Replies granting permission go in `../../data/permissions/`.
