# Worker

Cloudflare Worker for On the Move (R1, R2). `GET /full` returns the full view's payload; a cron every 6 hours refreshes live positions from Movebank into KV. Details: `docs/FULL_VIEW.md`.

## Deploy (first time)

Needs a Cloudflare account (the free plan is enough) and the project's Movebank account.

    cd worker
    npm i
    npx wrangler login
    npx wrangler kv namespace create KV      # put the printed id into wrangler.toml
    npx wrangler secret put MOVEBANK_USERNAME
    npx wrangler secret put MOVEBANK_PASSWORD
    npx wrangler deploy                       # also registers the cron

Then set the polling URL in TRMNL (`template/README.md`). Keep the Worker URL out of the docs (Nextbike: an open endpoint is a way for strangers to spend quota).

## Updating the data

    python3 pipeline/build_featured.py && python3 pipeline/build_whitelist.py
    npm run check && npx wrangler deploy

## Checks

    npm run check          # payload sweep (19,032 cases) + refresh tests against recorded Movebank answers
    npm run record         # re-record Movebank answers (needs MOVEBANK_USERNAME/PASSWORD in the environment)
    npx wrangler tail      # live logs after deploy: one "refresh:" line per cron run

## Limits it is built around (Cloudflare docs, checked 2026-09-28)

- Free plan: 50 external requests per run; a refresh makes 3 per study with live animals (21 today).
- Free plan: 5 cron triggers per account, shared with other Workers.
- KV: 1,000 writes a day on the free plan, account-wide (Nextbike). The refresh writes one key, only when something changed: at most 4 writes a day. Polls only read.
- Movebank: one concurrent request per IP (API doc); the refresh is sequential.

Local run: copy `.dev.vars.example` to `.dev.vars`, fill it, then `npx wrangler dev --test-scheduled` and open `/__scheduled` to run the cron once. Delete `.dev.vars` afterwards if the machine is shared.
