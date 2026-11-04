# Seasonal animals: release preparation

Prepared 2026-11-04 for review; not deployed or confirmed on a physical TRMNL.

## Result

Two new selectable species, Plains Zebra and Green Turtle. Recorded journeys join the existing rotation only on the corresponding calendar dates. The stamp shows the original date and year; interpolated dates explicitly say “Journey estimate”. An out-of-season species disappears from automatic and mixed selections. A reader selecting only inactive seasonal species gets a next-season message, with no substitute animal or held position.

| Species / display name | Source animal | Calendar window | Recorded year |
|---|---|---|---|
| Plains Zebra / Hattie | Z3866 | 18 Nov–8 Dec | 2007 |
| Plains Zebra / Hattie | Z3866 | 1 May–1 Jun | 2008 |
| Green Turtle / Nicole | 41082 | 25 Sep–25 Nov | 2018 |
| Green Turtle / Jeanne | 52189 | 18 Sep–17 Nov | 2018 |

These are selected excerpts of real journeys, not population migration predictions. The zebra ranges are labelled by dry/rainy season, as in the source publication. Turtle destination captions describe broad coastal areas; the display uses a 1° grid. Source identity, exact original windows, exclusions, credits and pinned checksums are in `pipeline/seasonal_species.json`. Hattie, Nicole and Jeanne are display names chosen here, after the cited researchers; the original files use tag codes. No researcher-assigned animal names are claimed.

The new species work without photos, through the existing no-photo layout. No substitute or generated animal photos have been added. Optional photos still need selection and verified reuse terms; Wikimedia/NOAA access was blocked in this running instance. Additional source domains were saved to the environment draft but have not been verified as applied. Review/save that draft and publish the environment if enabling those optional sources. This is independent of deploying the recipe. The small new fact pools are source-verified drafts for review, separate from the existing owner-reviewed pools; the original species' content is preserved.

## Data and regeneration

Both published packages are CC0, verified against current repository metadata and READMEs. All seven downloaded files match their repository checksums, pinned in the configuration. No Movebank credentials, new KV keys, scheduled calls, or new production network access are required. New animals cannot be replaced by live KV positions. Raw files, including nesting locations, remain in ignored local cache; only generalised, selected journeys enter the Worker bundle.

From the repository root:

```sh
python3 pipeline/build_seasonal.py --refresh
python3 pipeline/test_seasonal.py
(cd worker && npm run check)
(cd worker && XDG_CONFIG_HOME=/workspace/.config WRANGLER_SEND_METRICS=false ./node_modules/.bin/wrangler deploy --dry-run --outdir /tmp/otm-worker-bundle)
```

`build_seasonal.py` updates the compiled featured bundle and both species tables. A repeated build produces the same data. `build_featured.py` also appends the seasonal data on an ordinary full rebuild; `build_species.py` includes the seasonal metadata. The annual selection in `data/featured.json` stays separate because these imports require chronological excerpts rather than folded annual tables. The importer has only Python standard-library dependencies.

The Python tests verify original-file daily coverage, real missing dates, source-derived daily medians, privacy exclusions, coarsening and repeatable builds. The JS checks cover calendar boundaries, leap years, viewer offsets, explicit/mixed selections, interpolated-date wording, Flock View agreement, odd final quadrant pairs and protection from live KV. The original annual species and place list were compared with the pre-change bundle and are unchanged.

Validation completed on 2026-11-04: all 30,744 payload cases passed; recorded refresh assertions and eight seasonal checks passed; four Python source/import tests passed. The representative render runs below passed 52/52 cases (16 zebra, 16 turtle, 12 focused mixed, eight inactive). Local Worker requests returned the expected historical turtle payload, zebra off-season message and mixed selection. Wrangler's final dry run built a 670.28 KiB gzip bundle without deployment. Physical-device and production-poll validation remain outstanding.

Representative rendering commands, from `template/`:

```sh
NODE_USE_ENV_PROXY=1 OTM_ONLY='Equus quagga' OTM_DAY=2026-05-10 OTM_LANG=de OTM_VIEWS=full,half_horizontal,half_vertical,quadrant OTM_SCREENS='screen--og;screen--og screen--portrait;screen--v2;screen--v2 screen--portrait' node render-check.mjs /tmp/otm-seasonal-zebra-final
NODE_USE_ENV_PROXY=1 OTM_ONLY='Chelonia mydas' OTM_DAY=2026-10-06 OTM_LANG=de OTM_VIEWS=full,half_horizontal,half_vertical,quadrant OTM_SCREENS='screen--og;screen--og screen--portrait;screen--v2;screen--v2 screen--portrait' node render-check.mjs /tmp/otm-seasonal-turtle
NODE_USE_ENV_PROXY=1 OTM_LAYOUT=multi OTM_FOLLOW='Equus quagga,Chelonia mydas,Ciconia ciconia' OTM_SLOTS=3 OTM_SLOT_STEP=1 OTM_DAY=2026-11-20 OTM_LANG=de OTM_VIEWS=full,quadrant OTM_SCREENS='screen--v2;screen--v2 screen--portrait' node render-check.mjs /tmp/otm-seasonal-focused-multi
NODE_USE_ENV_PROXY=1 OTM_ONLY='Equus quagga' OTM_DAY=2026-07-01 OTM_LANG=de OTM_VIEWS=full,half_horizontal,half_vertical,quadrant OTM_SCREENS='screen--og;screen--v2' node render-check.mjs /tmp/otm-seasonal-inactive
```

Zebra maps use zoom 6, including the smaller views, so the roughly 200 km journey is visible. Existing annual maps retain their prior zoom settings. The renderer uses real TRMNL CSS/JS, MapLibre and map tiles. Framework map-label rectangles underneath opaque recipe cards are excluded from recipe-text collision checks; recipe text, clipping, cards, maps, dates and destination pills are checked.

## Publish the recipe after review

1. Review the four windows, display names, short new fact pools and screenshots. The recorded years must stay visible.
2. Update the TRMNL **Shared** tab (`template/shared.liquid`) and **Quadrant** tab (`template/quadrant.liquid`) first: these support both the existing Worker and the new one. The shared update enables zebra zoom; the quadrant update handles odd available-species counts. Other layout tabs need no publication changes.
3. Merge the Worker change through the existing repository workflow when ready: merges to main touching `worker/` automatically deploy. Then update **settings** (`template/settings.yml`) for the new options and credits. Keep the existing polling URL. No merge, template publication or deployment was performed here.
4. Select the new animals and confirm a real device poll and visual rendering. In July both new species deliberately show the off-season message; on 4 November green turtles are active and zebras resume on 18 November. Recheck dates for the viewer's local day. Production polling, quotas and device appearance remain unverified until this step.

Worker and template changes should be released together, because seasonal availability can leave an odd number of rows. The change adds no secrets or service bindings. Reverting the seasonal importer output and corresponding source/template changes restores the prior behavior; keep the source survey and citations as research evidence.
