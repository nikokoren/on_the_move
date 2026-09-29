# On the Move (Animal Migration TRMNL recipe)

Read this first in every session. The repo is the memory: agents keep nothing between sessions.

## Status (2026-09-29)

Deployed 2026-09-28 by the owner (Worker `on-the-move`, KV namespace `on_the_move`, secrets set, cron `23 */6 * * *` registered). Endpoint checked from here: en/de payloads, viewer's local day, 1.2 to 1.5 KB. First cron refresh not yet observed (`npx wrangler tail`). Not yet set up in TRMNL, not seen on a device (R25). Worker URL stays out of the docs (Nextbike practice). Species table (R8) done 2026-09-28: `data/species.json`; 8 sourced facts per species (96, verified 96/96), rotated without repeats (decision R8a). Redeployed by the owner 2026-09-29; the live endpoint serves the new facts (checked from here). 2-bit map fix and `outline` preset merged (PR #5); template still to be pasted into TRMNL (Edit Markup, Full), then checked on the device (R25). Open items in `docs/FULL_VIEW.md` (design review: 2-bit greys, credit on screen); smaller views still to do.

## Where things are

| File | What it is |
|---|---|
| `docs/BRIEF.md` | The brief and requirements R1 to R25, as given. Do not edit requirements in place; record changes in `DECISIONS.md`. |
| `docs/DECISIONS.md` | Decided and open decisions (D1 to D4 and later ones), dated. |
| `docs/SOURCES.md` | Facts about outside systems (Movebank, GBIF, TRMNL, CC). Each fact carries its source URL, date checked and who checked it. |
| `docs/survey/` | Task 0: method, per-study records, raw captured responses, results. |
| `data/studies.json` | Study whitelist (R4): the 11 Movebank studies behind the featured animals, built by `pipeline/build_whitelist.py`. Schema in `data/studies.schema.json`. |
| `worker/`, `template/` | The Worker (payload, cron refresh, `wrangler.toml`, tests) and the TRMNL templates; each has a README with its checks. |
| `docs/FULL_VIEW.md` | Plan for the full view: what is on screen, which code it reuses (with line numbers), open questions. |
| `docs/CATALOG.md` | What the catalog contains, pipeline rules, known gaps, featured proposal, UX draft. |
| `pipeline/build_catalog.py` | Builds the catalog from Movebank and the Movebank Data Repository. Needs Movebank credentials in the environment; caches in `pipeline/.cache/` (git-ignored). |
| `data/catalog.json`, `data/usual/`, `data/featured.json` | Built catalog, per-animal day-of-year tables, the 12 featured species (F1). Regenerate with the pipeline; do not edit by hand. |
| `data/species.json` | Species table (R8): sourced names and facts (`pipeline/species_curated.json`, checked by `pipeline/verify_sources.py`), windows and regions from the tracks (`pipeline/build_species.py`). |
| `docs/TEXT_REQUIREMENTS.md` | Text slots, measured lengths and copy rules (R16); enforced by `worker/check.mjs`. |
| `docs/survey/acceptance/` | Record of the 556 Movebank license acceptances. |
| `data/permissions/` | Written permissions from data owners (section 2 of the brief). A whitelist entry that is not CC0 or CC BY must point to a file here. |

Planned later (not created yet, do not create before the decision that needs them): `fixtures/` (R23, storefront data).

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

Patterns reused from the owner's other recipes, **not in this repo**:
- Nearby Nextbike (`nikokoren/nearby-nextbike`): the map (TRMNLMaps/MapLibre, fractional zoom, loading fallbacks) and the off-screen edge callout, `template/shared.liquid`; the Worker setup, `worker/`.
- Map of the Day (`nikokoren/map_of_the_day`, public): the bottom-left text box, `trmnl/example-markup.liquid`, and the viewer's local day, `trmnl/selection.liquid`.
- Aurora Watch: map rules, LOCALES pattern, `fixtures/` generator. Not read yet.

Read 2026-09-28 (Nextbike at 1f30394, Map of the Day at db89223); the mapping with line numbers is in `docs/FULL_VIEW.md`. Re-read the actual files before copying; do not reconstruct them from memory.

## Git

Develop on the branch the session names. Commit small, dated, descriptive commits.
