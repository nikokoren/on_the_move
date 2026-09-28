# Template

`full.liquid` is the full view (decision V1; the smaller views come later). `settings.yml` is the recipe's settings form. Both are pasted into TRMNL's plugin editor by hand; neither updates the other (Nextbike CLAUDE.md).

## Polling URL

Strategy: Polling. One line, no spaces or line breaks (Nextbike: anything after a break is dropped):

    https://<worker-subdomain>/full?species={{ follow | url_encode }}&lang={{ language }}&utc_offset={{ trmnl.user.utc_offset }}

- The reader's offset is `trmnl.user.utc_offset`, in seconds; a bare `utc_offset` renders empty and every day would be UTC's (Nextbike README).
- `follow` arrives snake_cased ("White Stork" -> `white_stork`, "All of them in turn" -> `all_of_them_in_turn`); the Worker maps both labels and taxa, and anything unknown means all.
- Refresh: the positions change every 6 hours at most (the cron), the "all" rotation every 15 minutes, so a refresh rate of 15 to 60 minutes is enough.

Not confirmed on a device yet (R25).

## Checks

    npm i
    node render-check.mjs [outdir]   # 16 cases in Chromium against TRMNL's framework, MapLibre and live tiles
