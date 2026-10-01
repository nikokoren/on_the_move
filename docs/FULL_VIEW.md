# Full view: plan

2026-09-28. Owner's direction: full view only for now; smaller views later. Design from the owner (see `CATALOG.md`, UX draft). This file maps each part to code that already works in the owner's other recipes, read in this session (clones of `nikokoren/nearby-nextbike` at 1f30394 and `nikokoren/map_of_the_day` at db89223). Re-read those files before copying: they may have moved on.

## What is on screen

1. **Map, full bleed.** The animal's position today: last fix (live) or "usually" position for the viewer's local day.
2. **Solid line** from where this leg started (end of the last long stay) to today. May run off screen.
3. **Dotted line** from today to where it is usually headed (the next long stay).
4. **Edge callout** when the destination is off screen: a pill on the frame edge with an arrow toward it, plus destination, distance and "usually arrives around <date>".
5. **Text box, bottom left:** species, animal name if it has one, from/to, one rotating fact, the date of the position, and the credit (R18).

## Reused from Nearby Nextbike (`template/shared.liquid`)

| Part | Where | Take as is / adapt |
|---|---|---|
| MapLibre 5.24.0 from trmnl.com, preconnect | `:249-252` | as is |
| `TRMNLMaps.watch` + `options` + fractional zoom re-set with `jumpTo` (options rounds zoom) | `:621-632` | as is |
| 512 px world at zoom 0 (`MERCATOR_BASE = 78271.51696`, not 156543) | `:380-389` | as is |
| `mpx()` for every number handed to MapLibre | `:398` | as is |
| Dashed line layer (`line-dasharray`) | `:677-680` | for the "headed" line; the solid line is the same layer without dashes |
| Ink from the `map-label` slot, paper `#fff` | `:591-594`, `:634` | as is |
| Draw layers on `load`/`styledata`, marks without waiting for tiles, deadline + watchdog, `sayItInWords` fallback | `:258-273`, `:636-786` | as is |
| Edge pointer: 8 sectors to flex alignment classes, Unicode arrows, pill with 1 px ink border | `:338-348`, `:497-535` | adapt: one pointer, to the destination; text from the backend with numbers filled in |
| `DOMContentLoaded` or run now | `:801-810` | as is |
| Strings as patterns filled in the browser (`fill()`) | `:356-370` | as is (R15: words from the backend) |

## Reused from Map of the Day (`trmnl/example-markup.liquid`, `selection.liquid`)

| Part | Where | Take as is / adapt |
|---|---|---|
| Bottom-left text box: `absolute bottom--2 left--2 z--2 p--2 w--max-[80cqw] lg:w--max-[75cqw] bg--canvas outline outline--strong`, `title--small` + `label--small` lines | `example-markup.liquid:242-258` | adapt the lines |
| Viewer's local day: `timestamp_utc + utc_offset`, divided by 86400, fallback to the feed's day | `selection.liquid:136-138` | the "usually" day turns on this, so it changes at the viewer's midnight |
| Booleans arrive as the string "true"/"false"; untouched fields may be absent | `selection.liquid:47-64` | for our settings |

## Different from Nearby Nextbike (do not copy blindly)

- **Scale.** Nextbike spans about 1 km and uses flat metre arithmetic (`along`, `metresBetween`, `within`). Our tracks span thousands of km. Use `map.project()` to test what is in the frame and great-circle maths for distance and bearing; flat maths is wrong by hundreds of km at this size.
- **Framing.** Nextbike fixes the scale around the reader. Ours has to frame an animal: proposal, centre on today's position, short side covering the last 10 days of track or 500 km, whichever is larger. The leg start and destination may fall outside; the solid line simply runs off, the destination gets the callout. To decide.
- **Antimeridian.** The curlew, whale and turtle tracks can cross 180°. Unwrap longitudes before drawing.
- **Payload limit: conflicting notes.** Nextbike's CLAUDE.md says TRMNL truncates at 5 KB (observed); Map of the Day's comment says 95 KB; our brief says about 10 KB; a web search summary on 2026-09-28 said about 100 KB for polling and 2 KB (5 KB with TRMNL+) for webhooks (help.trmnl.com private plugins, docs.trmnl.com webhooks; summary only, not the pages themselves). Design to stay under 5 KB so every figure holds: this view needs about 2 KB (two lines of 40 points each as bare number lists, plus about 400 bytes of text). Settle it with a real test when the Worker exists.

## Payload sketch (full view)

Words already in the chosen language (R15); numbers as bare lists (Nextbike: 28 bytes a point against 109 as objects).

```
state         ok | stale | error
kind          live | usual
species       "Weißstorch"
name          "Louis" or ""
date_text     "28. Sep. 2026" (live: last fix) / "gewöhnlich am 28. Sep. (Track von 2018)"
pos           [lng, lat]
past          [[lng, lat], ...]  leg start to today, thinned to at most 40
ahead         [[lng, lat], ...]  today to destination, thinned to at most 40
dest          { name, km, arrive_text }  or null when staying put
from_to       "von Baden-Württemberg in die Sahelzone"
fact          one line, chosen by the backend per refresh
credit        "Daten: Movebank, Fiedler et al., CC BY"
t_arrow       pattern for the callout, e.g. "{km} km bis {dest}"
```

## Open before building

1. Framing rule (above).
2. Payload limit (above).
3. Place names for from/to and destination: R7 plans Natural Earth country and region polygons in the Worker.
4. The fact pool: curated facts for the 12 species come from the species table (R8, in progress); data-derived facts need their own wording rules (R16).
5. Does the reader's own location appear (brief R6 distance from you)? Not in the owner's full-view design; could be one line in the text box.

## Status (2026-09-28): first build

Built: `pipeline/build_featured.py` → `worker/data/featured.json`; `worker/src/` (payload, en/de strings); `template/full.liquid`. Checks:

- `node worker/check.mjs`: 12 species + "all" × en/de × 366 days × 2 UTC offsets = 19,032 payloads, 0 failures, largest 1,751 bytes.
- `cd template && npm i && node render-check.mjs`: 16 cases rendered in Chromium with TRMNL's plugins.css/js, MapLibre 5.24.0 and live tiles, 800 × 480 (`screen--og`): 16/16 drawn, 0 errors, 0 overlaps between the callout and the text box or the map attribution. Before/after for the attribution guard: 1/16 overlap with it off, 0/16 with it on. The harness fetches through Node because Chromium here does not trust the proxy CA.
- Previews: `docs/previews/`.
- **Not confirmed on a device** (R25).

Open:

1. ~~Live refresh (R2)~~ built 2026-09-28: `worker/src/refresh.js`, cron every 6 h, KV written only on change, R5 refusal on license or terms change. Tested against recorded Movebank answers (20/20) and end to end with `wrangler dev` against live Movebank (7 studies, 16 animals, 0 errors). Not yet deployed.
2. The basemap labels are in local scripts (Korean, Arabic). TRMNL's framework draws them; changing them means replacing its labels. Owner's call.
3. Geolocator tracks are smoothed but still coarse: the wheatear "stays" on the Mediterranean on its way south; stays for land birds far from any coast keep sea names.
4. Coastal marine animals sit on the coastline after R14 rounding (blue whale).
5. ~~Species facts~~ done 2026-09-28: 8 sourced facts per species (R8, `data/species.json`) plus the animal's own numbers, shuffled per cycle without repeats (decision R8a).
6. ~~Deployment config~~ written 2026-09-28: `worker/wrangler.toml` (KV id is a placeholder until the namespace exists), `worker/README.md`, `template/settings.yml`, polling URL in `template/README.md` with `{{ trmnl.user.utc_offset }}` (as Nextbike uses it in production). Deploy needs the owner's Cloudflare account; not done.
7. Other screen sizes, portrait, and the smaller views (V1: later).

## Design review topics (raised by the owner, 2026-09-28, after the first real render)

The owner's screenshot shows the white stork Kiki in German, with TRMNL's "Refreshed" badge, so it is TRMNL's own render and not the Chromium harness.

1. **Greys do not survive on 2-bit screens.** Cause found 2026-09-29, fix on the branch, **not confirmed on a device** (R25).
   - We already use TRMNL's own basemap (`TRMNLMaps.options`, preset `streets`). At 1 and 2 bit the framework paints the land and sea fills as flat "key colours" and repaints them as dither patterns on each idle, but only at an integer zoom (`plugins.js`, `mapDeviceOrigin`: `if (!Number.isInteger(zoom)) return null`). `options()` rounds the zoom for that reason; our template, copied from Nextbike, put the fractional zoom back with `jumpTo`. So the pass never ran and the near-white key colour (220, 220, 214) reached the panel as white.
   - Before/after at 2 bit (`screen--og screen--2bit`, stork, 2026-09-28): key-colour pixels 127,083 → 0; the dither layer (`canvas.map__dither`) absent → present. Picture: `docs/previews/2bit-before-after.png`.
   - The harness renders in any framework mode now: `OTM_SCREEN="screen--og screen--2bit"` (or `screen--1bit`, `screen--ogv2`), `OTM_ONLY=<taxon>`, `OTM_DEBUG=1`.
   - Also moved to the framework: lines and dots now come from `TRMNLMaps.route` and `TRMNLMaps.dot`. Our HTML marker vanished under the dither layer. Picture: `docs/previews/framework-route-dot-2bit-1bit.png`.
   - Open, for the owner:
     - (a) `route()` has no dashes, so the "headed" line is now a lighter step of the series ramp and reads faintly.
     - (b) The zoom is rounded down, so the frame is up to twice as wide as the V1 rule.
     - (c) Framework place labels can sit on the animal dot (Sevilla).

2. ~~**Does the data credit have to be on every render?**~~ Decided 2026-09-29 (C2): no; moved to the About text and README, per Movebank's citation guidelines.
   - Brief R18 as written: yes, every view shows the credit, with an abbreviated form allowed when space is short.
   - CC BY 4.0 legal code, section 3(a)(2) (checked 2026-09-28, creativecommons.org/licenses/by/4.0/legalcode.en): attribution may be given "in any reasonable manner based on the medium, means, and context", and "it may be reasonable to satisfy the conditions by providing a URI or hyperlink to a resource that includes the required information".
   - CC0 studies need no attribution at all.
   - The OpenStreetMap credit on the map is a separate matter (the tiles' licence) and stays.
   - Options: (a) keep a short credit on screen; (b) credit only in the plugin's About section and README, which changes R18 and needs a decision; (c) show the credit only for CC BY animals. Movebank's own citation guidelines are still to be read before deciding. Not legal advice.
   - Zoom and roads, re-checked 2026-10-01 against `https://usetrmnl.com/js/latest/plugins.js` (same as the cached copy): `MAP_PRESETS` has no preset with water and borders but without major roads (`outline`: water, major roads, borders, big names; `minimal` and `streets` add more; `blank` is land only, no sea). `style()` options: `labels` (true, 'major', false), `buildings`, `tiles`; no road switch. `options()` passes `labels` through and also accepts a finished `{style}`: filtering `roads-major` out of `metadata['trmnl:shapes']` and `layers` removes the roads cleanly (renders 6/6 at zoom 4 to 6, stork and loggerhead, TRMNL X). Not built: it would go against the framework-native decision below. Findings: city names in local scripts appear from zoom 4 (`labels: false` fixes it); the loggerhead's 1-degree rounding (R14) turns its path into boxes from zoom 5. Images for a TRMNL feature request (stork Kiki, TRMNL X): `docs/previews/roads-toggle-case.png` (zoom 3 today; zoom 5 outline with labels off; zoom 5 without roads), `docs/previews/labels-local-script.png` (zoom 5, labels on, roads off: local-script names). Re-check `MAP_PRESETS` and `style()` when TRMNL answers.
   - Basemap preset (owner, 2026-09-29): `outline` instead of `streets`. The roads distract, but no framework preset has water without main roads, and `style()` can only switch off labels and buildings. At zoom 3 to 6 the two presets look almost the same (`docs/previews/presets-2bit.png`). The owner is asking TRMNL for a road-free option; we do not hide their layers ourselves (topic 9, framework-native only). Re-check `plugins.js` MAP_PRESETS when they answer.
3. Also visible in the screenshot: the edge callout runs under TRMNL's "Refreshed" badge (top right, probably only in the preview), and map labels in local script (طنجة for Tangier), which is already open item 2 above.

### More topics (owner, 2026-09-29; topics only, not yet discussed)

4. **Destination arrow (edge callout):** when and why does it show up? What does it show? How is that different from the text box? Where should it sit?
5. **Text box:** what does it show, and when does it change? (The owner said "bottom right"; the current build puts it bottom left, following Map of the Day.)
6. ~~**Image of the animal:** an optional picture of the species that users can switch on and off.~~ Done 2026-09-29: owner's picks (`pipeline/species_images.json`), greyscale squares (240 px, 480 px since 2026-09-30 for the half views on the X) served by the Worker at `/photo/<taxon>.jpg`, shown 112 px on the left of the text box (`image image--cover w--28 h--28 no-shrink`); setting `show_photo`, default on. Credits in the About text and README (decision R8b). Not confirmed on a device.
7. **Position marker:** replace the dot with a bird's-eye-view icon of the animal shown.
8. ~~**Species setting as a multi-select**~~ Done 2026-09-29: `multiple: true`; none ticked = all in turn, several = those in turn, one = that one. The polling URL joins the ticks with `join: ","`; the Worker accepts commas, spaces or a JSON array, since TRMNL does not document the format (check with `npx wrangler tail` after the first real poll). Not confirmed on a device.
10. ~~**Destination pill across screen sizes and orientations (owner, 2026-09-29, TRMNL preview of the gull Arvin heading for Morocco).**~~ Fixed 2026-09-29; pill logic unchanged (owner), placement and visibility reworked. Not confirmed on a device.
   - Cause of "X portrait shows a pill for a visible destination": a host that changes the screen's classes after the first draw makes `TRMNLMaps.watch` rebuild the map, but the old pill stayed in the page. Reproduced in the harness (`OTM_SWITCH`): before, the gull after a switch to OG or X portrait: pill needed no, shown yes (FAIL); after: right in both.
   - Now: each draw of each map removes the old pill and places it afresh, again after the fonts load. "Visible" means the ring is on the map and not under the text box, with a 16 px margin (the ring on the box's edge is not readable).
   - Second cause, found in the preview of this fix: the ring's position (`map.project`, layout pixels) was compared with the text box's on-screen rectangle. When the screen is scaled (the harness shows the X at about 1.77×), they differ: the gull's ring sat under the box on X landscape but counted as visible, so no pill appeared. Both the template and the harness now convert to on-screen pixels. Whether the device or the TRMNL preview scales the screen is not confirmed; the check is right either way.
   - Placement: the pill's edge spot follows the direction; if it lands on the text box it joins a bottom-left corner stack above the box (flex column, framework classes), if it lands on the map credit it gets `pb--6` or the stack. The measured inline lift is gone: the template has no inline styles left.
   - Results 2026-09-29 (22 cases × OG, OG portrait, X, X portrait, 29 Sep. plus the dated cases): 88/88 right, 0 failed. Pill needed and shown: OG 17, OG portrait 10, X 10, X portrait 7; everything else neither. Before the scale fix the X counts were 4 and 2 (the pill was missing six times on X landscape and five times on X portrait). Switch test (screen changed after the first draw, to X portrait): 22/22. Preview: `docs/previews/pill-four-screens.png` (the gull, all four screens). Not confirmed on a device.
   - Decided (owner, 2026-09-29): on OG portrait the pill wraps to two lines, and that stays. Cause, measured: the pill is capped at 46cqw, 212 px on OG portrait, and "Ziel: Marokko · 2.012 km entfernt" needs 279 px on one line (OG 359 px cap, X 469 px: one line).
   - Harness: renders any screen model and orientation (`OTM_SCREENS`, the X is `screen--v2`), measures "pill needed" against "pill shown", and fails on a mismatch.
   - OG landscape: right. The destination is off screen, and the pill points south-west.
   - OG portrait: the pill is hidden behind the text box. The box is narrower and taller in portrait, and the pill's clearance (`clearOfBox`) did not lift it above the box.
   - X portrait: the destination ring is visible on screen, but the pill still shows. The template decides this once (`onScreen`, map size at first draw); a likely cause is a map resized after that decision, not yet checked.
   - The pill's placement and its show/hide rule need to follow the actual frame of each device and orientation. The render check covers only OG landscape today, so it needs portrait and other models too.
   - The photo inside the text box works in all three (owner): the "photo above the box" idea is dropped.
9. ~~**Framework-native layout and styling only, no "Extrawürstl" (owner, 2026-09-29).**~~ Done 2026-09-29 for the pill: `bg--canvas outline rounded--full px--2 py--1 w--max-[46cqw]`, text `label font--bold`, arrow `title`; the waiting message toggles the framework's `hidden` class. Removed `outline--strong` from the text box (not a framework class; it did nothing). Left: the measured lift that keeps the pill clear of the text box (`clearOfBox`, geometry), which topic 10 replaces. Before/after: `docs/previews/pill-framework-before-after.png`. Not confirmed on a device.
   Original note: All layout and styling through TRMNL Framework classes and components, no custom CSS or inline styles. Known deviation today: the edge callout in `template/full.liquid` is styled inline in the script (background, 2 px border, pill radius, system-ui font, font sizes, max width), carried over from Nearby Nextbike. The text box already uses framework classes only. The map lines are MapLibre layer paint, not page styling.

## Device feedback, round 1 (owner, 2026-09-29, photos of the deployed version)

Confirmed on the device: the sea dithers at the panel's bit depth (the 2-bit fix works). Fixed on the branch the same day, rendered 12/12 species for 29 Sep (`docs/previews/all-species-de-2026-09-29.png`). **Not yet confirmed on the device.**

| Seen | Cause | Change |
|---|---|---|
| Roads distracting; the wheatear's zoom looked best | zoom 4 to 6 carries the framework's main roads | one zoom for every animal: 3 (the wheatear's); `GEO.r` and the V1 frame rule dropped |
| Crane "Aufbruch" after weeks on the way south | every stay of 14+ days was treated as home | home ranges = the two longest stays; others are stopovers ("Rast") inside the leg |
| Turkey vulture at its summer site trails its spring flight | the past line ran from the previous stay | at home the line starts where the stay began |
| Onward line invisible on land | series step 2 of 2 is white at 1 bit | same ink as the past line, thinner |
| Pill over the hawk's destination ring | pill shown whenever there was a destination | pill only when the destination is off screen |
| Pill text | owner's wording | "Ziel: X · N km entfernt" / "Destination: X · N km away" |
| German reads unnaturally | literal patterns | new en/de strings (`worker/src/strings.js`) |
| Shrike's 90° bends | geolocator placeholders at the equinoxes: latitude 0 or 0.001 | `build_catalog.py` drops latitudes within 0.001 of the equator; catalog rebuilt from cache: 3,617 -> 3,616 animals, 2,257 placeholder entries removed |
| Loggerhead in open water, staircase track | 1-degree rounding (R14) at zoom 5, near the date line | zoom 3; star choice avoids tracks near 180 degrees: the Yellow Sea animal now |
| "Loggerhead" setting showed the stork | label "Loggerhead" matched no species, fell back to "all" | label "Loggerhead Turtle", old value still accepted, `check.mjs` checks every option |
| Blue whale "stuck", no destination | its winter stay was not the next stay; same-name pill suppressed | with home ranges it now heads for the Gulf of California |

Open from this round:
- ~~The shrike has no position 5 Mar to 2 Apr~~ (all three tracks are blank at the spring equinox once the placeholders are dropped). Owner, 2026-09-29: show the last position instead. When no animal of the species has today, the star's last known day (up to 60 days back) is shown, labelled "No position for today; last known around 3 Mar". Empty payloads in the sweep: 116 -> 0.
- Coastal whale positions still sit on the coastline after 1-degree rounding (at zoom 3 this reads as "off the coast").
- Labels in local scripts; the pill's inline styling (topic 9).

## Design review, session 1 (owner, 2026-09-29)

- Text on screen explained (what shows when); decisions: names in quotes, new position line, credit off screen (C2), units setting (U1). Pill logic stays; its placement and visibility across devices is topic 10.
- Individual facts, decided 2026-09-29: only sex, when tracking ran ("Besendert seit Juni 2023" / "von … bis …") and hatch year ("Geschlüpft 2023", or "2020 oder früher" when Movebank's latest_date_born is only an upper bound); built in `pipeline/build_individuals.py`, in the fact rotation. 44 of 52 featured animals have a record (30 with sex, 6 with hatch year); Data Repository animals have none.
- **Done 2026-10-01 (decision R8d):** the free-text comments are curated into 8 hand-written, translated notes (`pipeline/individuals_curated.json`); nest names left out (R14).
- Earlier note on what Movebank holds: Movebank's individual records (checked 2026-09-29 for the 15 Movebank star animals) hold, where filled: sex (11 of 15), ring number, tracking start and end, number of positions, hatch year (Kiki, 2023), and free-text comments (Kiki: "elder of 2 chicks"; the honey buzzard: found weak in Reutlingen in May 2023, cared for at the NABU centre Mössingen and released with the logger in June 2023; a bald eagle seen alive in 2013 after its tag came off). Comments are English or German free text and need curating and translating by hand. Hatch and capture coordinates exist for some and must not be shown (R14).
