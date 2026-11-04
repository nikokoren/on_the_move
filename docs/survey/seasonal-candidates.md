# Seasonal candidates: zebras and green turtles

Direction agreed by the owner, 2026-11-04: seasonal rotation; focus the next investigation on zebras and green turtles. Caspian terns deferred because Europe–Africa journeys are already well represented.

## Evidence available locally

Source: `captures/2026-09-28_movebank-dr_cc0-ccby_packages.json`. These are saved September observations, not a fresh verification of access or licensing.

| Candidate | Dataset | Saved metadata | Next check |
|---|---|---|---|
| Zebra | “In search of greener pastures: using satellite images to predict the effects of environmental change on zebra migration”; DOI `10.5441/001/1.f3550b4f`; Movebank study `10898263` | CC0; GPS; 7 animals in metadata; no per-animal span established by that survey | Read README and original events; establish species, route, actual migration dates, per-animal gaps and coverage. Missing span metadata does not prove short tracks. |
| Green turtle | “Green turtles (Chelonia Mydas); Hays; Chagos Archipelago, Western Indian Ocean”; DOI `10.5441/001/1.313`; Movebank study `3267664208` | Repository package: CC0; GPS/Argos; 33 animals in metadata; 5 with spans >=330 days | Identify actual migration legs rather than local movements; inspect original dated fixes and gaps. |

The local catalog already contains four animals from the Chagos study, with tracks from 2012–2019, in `data/usual/3267664208.json`. These are processed day-of-year tables selecting positions across years, with interpolations and stationary holds. They cannot establish a continuous historical journey; inspect original chronological events before using them for seasonal replay.

Licensing distinction to re-check: the saved repository package says CC0, while the local catalog's Movebank study entry says CC_BY. Preserve the citation and verify the terms of the exact files used rather than treating these as interchangeable.

## Original-file verification (2026-11-04)

Access succeeded in the replacement environment. Both original packages were downloaded anonymously via the repository API, including READMEs, reference data and events. All seven files matched the MD5 checksums supplied by the repository. Each package's current metadata **and README** explicitly identify the published files as CC0. The turtle package's CC0 status does not change the separate Movebank API study's saved CC_BY entry.

Evidence: `captures/2026-11-04_seasonal-zebra-turtle_summary_no-coords.json` records item UUIDs, file checksums, filtering method and per-animal statistics without coordinates. Original files are retained locally in the ignored `pipeline/.cache/seasonal/` directory. Re-fetch metadata and re-check checksums before a later import.

### Zebras: strong candidate

- The reference file identifies seven female Burchell's zebras (`Equus burchellii`, source taxonomy) in northern Botswana, tracked in 2007–2009. The abstract explicitly describes travel between dry- and rainy-season ranges and responses to rainfall/vegetation.
- Parsed 53,794 event rows; excluded 17 with invalid/missing coordinates and one explicitly flagged event. All seven animals have fixes on 98.6–100% of days within their own recorded windows; no animal has more than one consecutive missing day.
- Their maximum displacement from the first daily median is approximately 202–222 km. This is straight-line displacement, not distance walked.
- `Z3866` is a particularly useful starting point: 25 October 2007–22 October 2008, all 364 days represented, and an approximately 206 km excursion followed by a return close to the starting area. Monthly medians show a southeastward shift in November–December and a northwestward return during April–May. Exact migration-leg boundaries still need segmentation.
- This corrects the earlier survey's missing-span impression: at least one original track spans almost a year. The catalog prefilter also misses this package because its package metadata lacks a scientific-name field, despite the taxon being present in the CSVs; simply lowering the annual-duration threshold would not import it.

### Green turtles: strong candidate, select long-distance journeys

- Parsed 55,462 GPS/Argos rows for 33 animal identifiers; excluded 51 explicitly flagged events. Deduplicated equal timestamps, preferring GPS. No synthetic or held positions were used for these checks.
- Some animals remain near Chagos; others have multi-thousand-kilometre journeys. The longest recordings are not automatically the most interesting migration candidates.
- `52189`: 8 July 2018–14 February 2019; fixes on 207/222 days (93.2%), maximum gap seven missing days, approximately 4,289 km between first and final daily medians. Broad destination screening places its final area off Mozambique. It first exceeds 100 km from its initial position on 15 September and first comes within 50 km of the final position on 17 November 2018.
- `41082`: 5 July 2018–2 January 2019; fixes on 176/182 days (96.7%), no gap longer than one missing day, approximately 3,023 km between first and final daily medians. Broad destination screening places its final area off Somalia. Corresponding 100 km departure / 50 km final-area screening dates: 23 September / 25 November 2018.
- These screening dates are geometric thresholds, **not verified biological departure or arrival dates**. Destination screening uses Natural Earth country outlines and rounded monthly medians; final place names need checking against actual tracks and the publications. Exact nesting locations are not included in this note or the committed summary.

## Prepared implementation (2026-11-04)

The selected windows are explicit editorial excerpts of recorded journeys, not claims about exact biological departure/arrival or population-wide seasons. Zebra `Z3866`: 18 November–8 December 2007 and 1 May–1 June 2008. Turtle `41082`: 25 September–25 November 2018; turtle `52189`: 18 September–17 November 2018. Published observations cover every date in these excerpts after two short internal gaps in `41082` are interpolated and labelled. Coarsening: zebra 0.1°, turtles 1°. Turtle fixes within 150 km of the original starting area are excluded before interpolation/generalisation; original nesting coordinates remain only in the ignored cache.

`pipeline/seasonal_species.json` records the windows, captions, source identifiers, display names and sourced English/German facts. `pipeline/build_seasonal.py` pins and checks original file MD5s, source licenses and every fact quote. The import preserves chronological dates and does not reuse the annual day-of-year tables. Working-tree changes include selection logic, settings and template support; see `../SEASONAL_RELEASE.md` for reproduction, validation and release details.
