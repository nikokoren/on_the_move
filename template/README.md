# Template

`full.liquid` is the full view (decision V1; the smaller views come later). `settings.yml` is the recipe's settings form. Both are pasted into TRMNL's plugin editor by hand; neither updates the other (Nextbike CLAUDE.md).

## Polling URL

Strategy: Polling. One line, no spaces or line breaks (Nextbike: anything after a break is dropped):

    https://<worker-subdomain>/full?species={{ follow | join: "," | url_encode }}&lang={{ language }}&photo={{ show_photo }}&units={{ units }}&utc_offset={{ trmnl.user.utc_offset }}

- The reader's offset is `trmnl.user.utc_offset`, in seconds; a bare `utc_offset` renders empty and every day would be UTC's (Nextbike README).
- `follow` is a multi select (owner, 2026-09-29). How TRMNL hands several ticks to Liquid is not documented; `join: ","` turns a list into `white_stork,blue_whale` and leaves a plain string as it is. The Worker accepts commas, spaces or a JSON array, labels, their snake_case or taxa; nothing ticked (or the old `all_of_them_in_turn`) means every species in turn. **Check after the first real poll** what arrives: `npx wrangler tail` in `worker/` prints each request's URL.
- `units` is `metric` or `imperial` (default metric): distances in the pill and the facts, and the measurements in the sourced facts.
- `show_photo` is a boolean: `true`/`false`, or empty before the settings are first saved, which counts as on.
- Refresh: the positions change every 6 hours at most (the cron), the "all" rotation every 15 minutes, so a refresh rate of 15 to 60 minutes is enough.

Not confirmed on a device yet (R25).

## Checks

    npm i
    node render-check.mjs [outdir]   # 22 cases in Chromium against TRMNL's framework, MapLibre and live tiles

Options (environment): `OTM_SCREENS="screen--og;screen--og screen--portrait;screen--v2;screen--v2 screen--portrait"` runs every case on each screen (the TRMNL X is `screen--v2`); `OTM_SWITCH="screen--v2 screen--portrait"` changes the screen's classes after the first draw, as a host resize or rotation does; `OTM_ONLY`, `OTM_DAY`, `OTM_LANG`, `OTM_PHOTO=0`, `OTM_DEBUG=1`. A case fails if the pill shows while the destination ring is visible, or is missing while it is not.
