# Template

The recipe's markup, one file per tab of TRMNL's plugin editor, pasted by hand (neither updates the other; Nextbike CLAUDE.md):

| Editor tab | File |
|---|---|
| Shared | `shared.liquid`: the components (`{% template %}`) and the map script; TRMNL prepends it to every layout |
| Full | `full.liquid` |
| Half Horizontal | `half_horizontal.liquid` |
| Half Vertical | `half_vertical.liquid` |
| Quadrant | `quadrant.liquid` |

`settings.yml` is the settings form. What each view shows and why: decision V2 in `docs/DECISIONS.md`.

## Polling URL

Strategy: Polling. One line, no spaces or line breaks (Nextbike: anything after a break is dropped):

    https://<worker-subdomain>/full?species={{ follow | join: "," | url_encode }}&lang={{ language }}&photo={{ show_photo }}&units={{ units }}&layout={{ layout }}&utc_offset={{ trmnl.user.utc_offset }}

- The reader's offset is `trmnl.user.utc_offset`, in seconds; a bare `utc_offset` renders empty and every day would be UTC's (Nextbike README).
- `follow` is a multi select (owner, 2026-09-29). How TRMNL hands several ticks to Liquid is not documented; `join: ","` turns a list into `white_stork,blue_whale` and leaves a plain string as it is. The Worker accepts commas, spaces or a JSON array, labels, their snake_case or taxa; nothing ticked (or the old `all_of_them_in_turn`) means every species in turn. **Check after the first real poll** what arrives: `npx wrangler tail` in `worker/` prints each request's URL.
- `units` is `metric` or `imperial` (default metric): distances in the pill and the facts, and the measurements in the sourced facts.
- `layout` is `one_animal_at_a_time` (default) or `all_followed_animals_trmnl_x_only` (snake_cased labels); the Worker only looks for "all" in it. With the multi layout and more than one species it adds `rows` and `current`; the template shows the list only on the TRMNL X (`lg:`).
- `show_photo` is a boolean: `true`/`false`, or empty before the settings are first saved, which counts as on.
- Refresh: the positions change every 6 hours at most (the cron), the "all" rotation every 15 minutes, so a refresh rate of 15 to 60 minutes is enough.

Not confirmed on a device yet (R25).

## Checks

    npm i
    node render-check.mjs [outdir]   # in Chromium against TRMNL's framework, MapLibre and live tiles

Like TRMNL: `shared.liquid` is prepended to each layout and its `{% template %}` blocks become partials for `{% render %}`; the smaller views sit in a real mashup (`mashup--1Tx1B`, `1Lx1R`, `2x2`) so the framework sizes them; the screen gets the breakpoint class TRMNL's renderer adds by device model (OG `screen--md`, X `screen--lg`).

Options (environment):
- `OTM_VIEWS=full,half_horizontal,half_vertical,quadrant` (default `full`).
- `OTM_SCREENS="screen--og;screen--og screen--portrait;screen--v2;screen--v2 screen--portrait"` (the TRMNL X is `screen--v2`).
- `OTM_LAYOUT=multi` follows all species and renders `OTM_SLOTS` refresh slots over the day (default 6) instead of one case per species.
- `OTM_SWITCH="screen--v2 screen--portrait"` changes the screen's classes after the first draw, as a host resize or rotation does.
- `OTM_ONLY`, `OTM_DAY`, `OTM_LANG`, `OTM_PHOTO=0`.
- `OTM_TPL=path/to/variant.liquid` renders a variant file in the view's place (mock-ups on the real framework).

A case fails if a map on screen is not drawn, the fallback text shows, any text is cut off by the view or by its list, the multi layout shows where it should not (or not where it should), the list's page does not hold the shown animal, or the pill shows while the destination ring is visible (or is missing while it is not).
