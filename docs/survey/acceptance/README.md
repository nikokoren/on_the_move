# Movebank license acceptance (decision A1)

On 2026-09-28 the project owner authorised accepting the license terms of all 556 CC0/CC BY Movebank studies that prompted for them ("accept all 556, go ahead"). Claude accepted them on the project's Movebank account via the API method (`license-md5`, see `../../SOURCES.md`), one study at a time, and verified each in a fresh session (data returned, no `accept-license` header).

- `2026-09-28_acceptance-log.csv`: study, license, time, MD5 and SHA-256 of the terms page as accepted, result. 556/556 accepted.
- `terms/terms_<study_id>.html`: the terms page exactly as accepted (no account data; checked).

Acceptance lasts until a study owner changes its terms. The pipeline then gets the terms page again (`accept-license: true`) and stops for that study; re-accept only with the owner's say-so.
