# Worker

Cloudflare Worker for On the Move (R1, R2). `GET /full` returns the full view's payload; a cron every 6 hours refreshes live positions from Movebank into KV. Details: `docs/FULL_VIEW.md`.

## Deploy (first time)

Needs Node.js 22 or newer (Wrangler 4 refuses Node 20: seen 2026-09-28 on the owner's Mac), a Cloudflare account (the free plan is enough) and the project's Movebank account.

    cd worker
    npm i
    npx wrangler login
    npx wrangler kv namespace create KV      # put the printed id into wrangler.toml
    npx wrangler secret put MOVEBANK_USERNAME
    npx wrangler secret put MOVEBANK_PASSWORD
    npx wrangler deploy                       # also registers the cron

Then set the polling URL in TRMNL (`template/README.md`). Keep the Worker URL out of the docs (Nextbike: an open endpoint is a way for strangers to spend quota).

## Updating the data

    python3 pipeline/verify_sources.py      # species facts still on their sources
    python3 pipeline/build_featured.py && python3 pipeline/build_whitelist.py && python3 pipeline/build_species.py
    npm run check && npx wrangler deploy

## Automatic deploy (2026-10-02)

`.github/workflows/deploy-worker.yml` deploys the Worker on every merge to main that touches `worker/` (and can be run by hand from the Actions tab), after `npm ci` and `npm run check`; a failed check stops the deploy. It needs two repository secrets (Settings → Secrets and variables → Actions): `CLOUDFLARE_API_TOKEN`, made from Cloudflare's "Edit Cloudflare Workers" token template, and `CLOUDFLARE_ACCOUNT_ID`. The Movebank secrets stay in the Worker and are not needed here. Until the secrets are set, the workflow fails at the deploy step and nothing is deployed.

## Usage counts (2026-10-03)

Each poll writes one anonymous data point to Workers Analytics Engine (binding `STATS`, dataset `on_the_move_polls`, `src/index.js` `recordPoll`): the followed species (`blob1`, taxa comma-joined, or `all`), language (`blob2`), units (`blob3`), Flock View (`blob4`: `multi` on, `single` off), photo (`blob5`), the poll's weight (`double1`) and the number of species ticked (`double2`, 0 = all). No IP, device or UTC offset. Data is kept 3 months; the free plan takes 100,000 data points a day (one device polls about 96 times a day). Set the Worker variable `STATS_SAMPLE` to N to record 1 poll in N; the weight keeps the sums right.

Query in the Cloudflare dashboard (Workers & Pages → Analytics Engine) or with the SQL API (`POST https://api.cloudflare.com/client/v4/accounts/<account id>/analytics_engine/sql`, a token with Account Analytics read). Polls count requests, not people; every device polls at about the same rate, so the shares hold.

    -- which selections, last 7 days
    SELECT blob1 AS species, SUM(double1) AS polls FROM on_the_move_polls
    WHERE timestamp > NOW() - INTERVAL '7' DAY GROUP BY species ORDER BY polls DESC LIMIT 50

    -- all species vs a hand-picked few, and how many ticked
    SELECT double2 AS ticked, SUM(double1) AS polls FROM on_the_move_polls
    WHERE timestamp > NOW() - INTERVAL '7' DAY GROUP BY ticked ORDER BY ticked

    -- language, units, Flock View, photo
    SELECT blob2 AS lang, blob3 AS units, blob4 AS flock, blob5 AS photo, SUM(double1) AS polls FROM on_the_move_polls
    WHERE timestamp > NOW() - INTERVAL '7' DAY GROUP BY lang, units, flock, photo ORDER BY polls DESC

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
