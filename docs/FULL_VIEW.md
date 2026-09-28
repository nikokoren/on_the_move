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
5. Facts are only data-derived so far; curated species facts wait for the species table (R8).
6. ~~Deployment config~~ written 2026-09-28: `worker/wrangler.toml` (KV id is a placeholder until the namespace exists), `worker/README.md`, `template/settings.yml`, polling URL in `template/README.md` with `{{ trmnl.user.utc_offset }}` (as Nextbike uses it in production). Deploy needs the owner's Cloudflare account; not done.
7. Other screen sizes, portrait, and the smaller views (V1: later).
