# On the Move (Animal Migration TRMNL recipe)

Read this first in every session. The repo is the memory: agents keep nothing between sessions.

## Status (2026-09-28)

Catalog built (decision S2, `docs/CATALOG.md`): 3,617 animals of 154 migratory species in `data/catalog.json` and `data/usual/`, 76 of them live. Featured set decided: 12 species (decision F1, `data/featured.json`). License terms accepted for all 556 CC0/CC BY Movebank studies (decision A1). Next: R8 species table for the 12, R16 text requirements, and the UX draft in `docs/CATALOG.md`, before any Worker or template code.

## Where things are

| File | What it is |
|---|---|
| `docs/BRIEF.md` | The brief and requirements R1 to R25, as given. Do not edit requirements in place; record changes in `DECISIONS.md`. |
| `docs/DECISIONS.md` | Decided and open decisions (D1 to D4 and later ones), dated. |
| `docs/SOURCES.md` | Facts about outside systems (Movebank, GBIF, TRMNL, CC). Each fact carries its source URL, date checked and who checked it. |
| `docs/survey/` | Task 0: method, per-study records, raw captured responses, results. |
| `data/studies.json` | Study whitelist (R4). Empty until task 0 produces eligible studies. Schema in `data/studies.schema.json`. |
| `docs/CATALOG.md` | What the catalog contains, pipeline rules, known gaps, featured proposal, UX draft. |
| `pipeline/build_catalog.py` | Builds the catalog from Movebank and the Movebank Data Repository. Needs Movebank credentials in the environment; caches in `pipeline/.cache/` (git-ignored). |
| `data/catalog.json`, `data/usual/`, `data/featured.json` | Built catalog, per-animal day-of-year tables, the 12 featured species (F1). Regenerate with the pipeline; do not edit by hand. |
| `docs/survey/acceptance/` | Record of the 556 Movebank license acceptances. |
| `data/permissions/` | Written permissions from data owners (section 2 of the brief). A whitelist entry that is not CC0 or CC BY must point to a file here. |

Planned later (not created yet, do not create before the decision that needs them): `worker/` (Cloudflare Worker, R1, R2), `recipe/` (TRMNL templates, section 8), `fixtures/` (R23), `docs/TEXT_REQUIREMENTS.md` (R16, before any copy), `data/species.json` (R8).

## Working method (adopted 2026-09-27, applies to every TRMNL recipe)

The full text is in `docs/BRIEF.md`. Short form:

1. Never verify against invented input. Only live captures or fixtures built from captures.
2. Sweep the state space and report results as numbers.
3. Re-fetch versioned docs; use unversioned URLs; stamp what was verified and when. The web wins.
4. "Not there" needs proof: say what was searched and what it returned.
5. Prove fixes with before/after diffs. Device-only proof: say "not confirmed on device".
6. Run real data through all new copy before shipping it.
7. State corrections in one line, then move on.
8. Write memory down, dated, with a re-check instruction.
9. Assume concurrent agents: re-read a file before editing it; don't trust your last-known main.

## Hard rules for this project

- **Licensing (decided, brief section 2):** only CC0 and CC BY data, or sources whose own terms explicitly allow commercial use. CC BY-NC, custom terms and similar only with the owner's written permission stored in `data/permissions/`. GBIF queries always filter `license` to `CC0_1_0` and `CC_BY_4_0`. eBird Status and Trends is excluded. This is a cautious reading, not legal advice.
- **Secrets:** Movebank credentials live only in Cloudflare Worker secrets (and a local, git-ignored `.dev.vars` during development). Never commit them, never put them in the recipe, never paste them into docs or captured responses. Scrub captured responses of anything account-specific before committing.
- **Sensitive locations (R14):** never commit or display breeding or nesting sites of threatened species. When in doubt, coarsen (e.g. 0.1 degree) and note it in the study record.
- **No live-tracking claims (D3, recommended):** always show the date of the last position.
- **All words in the backend** (R15), en and de from day one; none in templates.

## Cross-repo references

The brief reuses patterns from two other recipes that are **not in this repo**: Aurora Watch (map rules in its CLAUDE.md, LOCALES pattern, `fixtures/` generator, view layout) and Nearby Nextbike (Cloudflare Worker setup). Checked 2026-09-28: this session's GitHub access covers only `nikokoren/on_the_move`. Before relying on those patterns, add the repo to the session and read the actual files; do not reconstruct them from memory.

## Git

Develop on the branch the session names. Commit small, dated, descriptive commits.
