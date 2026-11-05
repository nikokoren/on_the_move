# Approved animal facts — rounds 5 and 6

Released on 2026-11-05. Merged to `main` at `5b78ce449385960df58c698a062cf82207697c62`. The [automatic Worker deployment](https://github.com/nikokoren/on_the_move/actions/runs/42100034568) completed successfully, including the required Worker checks. Production deployment is confirmed by the successful workflow; physical-device appearance remains unverified.

The owner accepted **98 additions: 51 English and 47 German**, including 39 favorites. All final wording edits are preserved. Seven vetoes are excluded, and no rewrite or approval remains pending. The recipe now contains **513 species facts across 20 species**: 279 English and 234 German. Short and long pools remain independent.

The original review exports are preserved byte-for-byte in `pipeline/facts_review_round5.json` and `pipeline/facts_review_round6.json`. The latest decision replaces its parent by `parentId`; approvals from round five remain unless superseded. The [interactive round-six record](reviews/facts-round6.html) shows the final edits and decisions with earlier feedback.

Approved facts live in `pipeline/facts_reviewed.json`. For the two seasonal species, the importer combines those general species stories with the original study facts in `pipeline/seasonal_species.json`. The Worker featured bundle and both species tables contain the accepted text. Existing facts, individual-animal notes, species choices, routes, calendar windows and other non-fact fields are preserved. Vetoes can leave pools smaller than the original coverage target; they are not filled automatically.

## Validation

- All 98 approved additions passed length checks and source checks: 123 supporting quotes on 39 freshly fetched pages.
- All 98 additions were reached through actual Worker fact rotation. All seven vetoed texts were absent.
- `npm run check` in `worker/`: 30,744 payload cases passed; 785,050 rotation turns with no failures; recorded refresh checks and all nine seasonal checks passed. No facts exceeded 140 rendered characters.
- `python3 pipeline/test_seasonal.py`: four source/import/privacy tests passed.
- The featured bundle's non-fact fields match the previous commit exactly. Repeated fact builds are byte-for-byte identical for all three compiled bundles.
- Longest accepted English fact: 129 characters. Longest accepted German fact: 139. The fact-bearing layouts and the quadrant passed on OG and X, portrait and landscape: **32/32 renders**. The quadrant deliberately displays no fact. Not confirmed on a physical device.

Rendered examples: [English full view](previews/approved-facts-en-full.png) · [German half vertical](previews/approved-facts-de-half-vertical.png).

## Rebuild and release

From the repository root:

```sh
python3 pipeline/build_facts.py
python3 pipeline/test_seasonal.py
(cd worker && npm run check)
python3 pipeline/build_fact_review.py
```

The normal full featured/species builds also retain the additions. `pipeline/verify_sources.py` checks all owner-approved facts, including the new seasonal pools; a fresh complete run requires access to the older facts' source domains as well.

This change needs no settings or layout-tab update. The merge to main triggered the existing automatic Worker deploy, which succeeded. The published Worker includes the 98 approved additions.
