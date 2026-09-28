# Captured responses

Raw responses from live APIs (Movebank, GBIF), saved during task 0. They seed the fixture corpus: tests and fixtures may only use data from here or derived from here (working method rule 1).

- Name files `YYYY-MM-DD_<source>_<study-or-query>_<what>.<ext>`.
- Scrub credentials, session tokens, cookies and account details before committing.
- Do not commit exact positions of breeding or nesting sites of threatened species (R14); coarsen and note it in the file name (`_coarse`).
- Trim large downloads to what the survey needs; note the original size and the trimming in `results.md`.
