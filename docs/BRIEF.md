# Animal Migration: brief and requirements

TRMNL recipe. Status: working brief, ready to start with a data survey. Last updated September 2026.

This document replaces the original brief, which is no longer available. Source facts (licenses, access rules) were checked against each source's own terms in September 2026; links are in section 13. Re-fetch every source before relying on it; where the web and this document disagree, the web wins.

> Stored in the repo on 2026-09-28 as given by the project owner. Wording kept as given. Decisions made later are recorded in [DECISIONS.md](DECISIONS.md), not by editing this file; if a decision changes a requirement, add a dated note here that points to the decision.

## Working method (adopted 2026-09-27, applies to every TRMNL recipe)

1. Never verify against input you invented. Test payloads must be captured from the live API, or come from the fixture corpus built from captured responses. A bug found only in made-up data isn't a bug.
2. Sweep the state space, don't spot-check. Render every combination that matters (states x languages x voices x views x devices) and compare outputs. Report results as numbers (for example "6/6 identical before, 0/6 after"); that number is also the proof of the fix.
3. Re-fetch versioned docs; memory is stale. Use unversioned URLs, stamp what was verified and when, and the web wins on disagreement.
4. "Not there" needs proof, not recall. Search every relevant place and say what was searched: "checked X and Y, zero hits" is a different claim from "I don't think so".
5. Prove fixes, don't assert them. Reproduce the failure, show it gone, and diff outputs before and after (for example "removed 3, added 0, kept 25"). Where only a device can prove it, say "not confirmed on device" instead of "fixed".
6. Run real data through new copy before shipping it. Every new phrase goes through real payloads in every state it can appear in, so contradictions show up before users see them.
7. State corrections in one line, then move on.
8. Write memory down, dated, with a re-check instruction. Agents have no memory across sessions; the repo is the memory. Every stated fact about an outside system carries its version, date, and "re-fetch before relying on this".
9. Assume concurrent agents. In a long session, re-read a file before editing it; don't trust your last-known main.

## 1. What it is

A screen that makes animal migration tangible from where you live. Two shapes; picking one is decision D1.

- **Mode A, "Follow the flock"**: a small curated set of individually GPS-tagged animals (for example white storks tagged in southern Germany) shown on a map with their recent track and current position, plus one headline fact: where the animal is now and how far it is from you.
- **Mode B, "Who's arriving"**: which migratory species have recently been sighted near your location, compared with when they usually arrive. Text first, small map optional.

Recommendation: build Mode A first. It has the strongest single visual, reuses the map work from Aurora Watch, and its curation (picking animals and studies) is bounded. Mode B can follow as a second view or setting.

## 2. Licensing position (decided)

The recipe is released for free, but TRMNL's Creator Fund may pay the author. That fund is paid from company revenue (80% of TRMNL+ subscription revenue, plus 10 to 15% of hardware sales), and plugin author payouts are calculated automatically from playlist age, playlist presence and impressions (times displayed on devices), above a threshold of 50 installs plus forks.

Creative Commons NonCommercial licenses define noncommercial as "not primarily intended for or directed towards commercial advantage or monetary compensation". The test is the primary purpose, and CC itself describes it as intent-based with gray areas. Because Creator Fund payouts scale with how often the licensed material is displayed and come from a company's sales, this project treats itself as potentially commercial.

**Rule: no NC-licensed data (CC BY-NC or similar) unless the data owner grants written permission, stored in the repo.** Only CC0, CC BY, and sources whose own terms explicitly allow commercial use. This is a cautious reading, not legal advice.

Consequences for this project:

- Movebank studies: CC0 and CC BY only by default. CC BY-NC and custom terms only with the owner's written permission.
- GBIF sightings: filter every query to `CC0_1_0` and `CC_BY_4_0`.
- eBird Status and Trends: excluded (its terms don't cover commercial use).

## 3. Decisions still open

- **D1** Mode A, Mode B, or both (as a setting).
- **D2** Species and animals to feature, after the data survey (task 0). Suggested start for Mode A: white stork, plus one or two long-distance species with eligible public tracks.
- **D3** Freshness promise. Public tracking data can be deliberately delayed by the study owner (embargo). Recommended: always show the date of the last position rather than implying live tracking.
- **D4** Exact or coarsened positions (see R14).

## 4. Task 0: data survey (before any design)

- List Movebank studies for the candidate species with public downloads.
- For each: license type, embargo and download restrictions, date of the most recent public data point, number of animals with fresh data.
- Keep only CC0 and CC BY studies with data from the last few weeks.
- If too few remain: contact owners of promising CC BY-NC or custom studies for written permission. Movebank encourages contacting owners for new uses in any case, and offering credit.
- Outcome decides D1 and D2. If nothing eligible and fresh exists, Mode B becomes the primary mode.

## 5. Data sources

### 5.1 Movebank (Mode A)

- What: GPS tracking data for tagged animals, organized in "studies" owned by researchers.
- Access: REST API with a registered Movebank account. Each study sets its own download permission; many public studies require reading and accepting their license terms once before the first download.
- License: chosen per study: CC0, CC BY, CC BY-NC, or custom terms. Citation is required for CC BY data.
- Freshness: owners can embargo public downloads, so downloaded data may exclude recent points or some animals. Coordinates shown on Movebank's public web map cannot be extracted; only downloads count.

### 5.2 GBIF occurrence API (Mode B)

- What: sightings aggregated from many publishers (for example iNaturalist and national recording schemes).
- Access: public API, no key needed for search. Supports filtering by species (`taxonKey`), radius around a point (`geoDistance`), date range (`eventDate`) and license (`license`).
- License: per record/dataset: `CC0_1_0`, `CC_BY_4_0` or `CC_BY_NC_4_0`. Filter to the first two (section 2).
- Obligations: attribute GBIF and the contributing datasets; confirm the exact form against GBIF's citation guidelines before launch.
- Freshness risk: publishers sync to GBIF on their own schedules, from days to much longer. Verify with real queries around Munich in spring before committing to Mode B.

## 6. Architecture

- **R1** Backend: a Cloudflare Worker (same setup as Nearby Nextbike). The Movebank account credentials live only in Worker secrets, never in the recipe, so recipe users need no account.
- **R2** Scheduled refresh: a Worker cron (for example every 6 hours) fetches the whitelisted studies, downsamples each track to roughly one point per day for the display window (for example 30 days), and stores the result in KV. The polling endpoint only reads KV, so a Movebank outage never breaks the screen; it serves the last good data with its date.
- **R3** TRMNL strategy: Polling, payload under about 10 KB (Aurora Watch runs at about 7 KB). Webhooks are capped at 2 KB (5 KB with TRMNL+).
- **R4** Study whitelist in the repo (JSON): study ID, license type, the license terms text accepted (or its hash), citation string, owner contact, date accepted, written permission reference if not CC0/CC BY, animals included, display names in en/de.
- **R5** The cron refuses any study whose license in Movebank no longer matches its whitelist entry, and logs it. The whitelist itself refuses entries that are neither CC0 nor CC BY and lack a permission reference.

## 7. Content and logic

- **R6** Per animal: name or tag label, species, last fix date, last position, track for the display window, distance from the user's location, direction of travel over the last few days, and a coarse "where": country, or sea or desert region.
- **R7** "Where" lookup without external calls: low-resolution country and region polygons (Natural Earth, public domain) inside the Worker, point-in-polygon on the last fix. Names in en/de.
- **R8** Curated species table (the curation work): name en/de, scientific name, typical departure and arrival windows for Central Europe, wintering region, one short fact per species en/de, a published source for each figure. (Replaces eBird's modeled data.)
- **R9** Headline logic: one sentence per animal state (migrating, arrived at wintering grounds, back home, or no recent data, with the date). Present-moment wording only, never claims about the whole season.
- **R10** User settings: location (native `lat_lon` field), featured animal or species (select), language (en/de), units (km/mi).
- **R11** Mode B only: recent sightings within a radius, first sighting this season vs the curated typical arrival window, per species.

## 8. Views

Same four views as Aurora Watch, all native Framework 3.3.

- **Full**: map with the featured track(s) and last-position marker, plus the headline, distance and last-fix date. Framed on the track's bounding box, including the user's location if it fits; otherwise an arrow or label toward it.
- **Half Vertical**: map on top, headline and facts below.
- **Half Horizontal**: headline and facts; map on TRMNL X only (`hidden lg:block`), as in Aurora Watch.
- **Quadrant**: one animal, one fact: where it is and the date; map on X only.
- **R12** Portrait handled in every view.
- **R13** Track drawing: MapLibre via TRMNLMaps with a GeoJSON source and line layer added after load. All map rules from Aurora Watch's CLAUDE.md apply (never mutate the preset's style object, `idle` for measuring, literal stretch axes, loading fallbacks).
- **R14** Sensitive locations: for threatened species or nesting sites, coarsen positions (for example to 0.1 degree) and never show the breeding site. Movebank lets owners hide animals from its public map for conservation reasons; respect the same intent for downloadable data.

## 9. Text and languages

- **R15** English and German from day one, using the LOCALES pattern from Aurora Watch; all words in the backend, none in templates.
- **R16** A TEXT_REQUIREMENTS.md (slots, casing, lengths, which lines share the screen) before writing any copy.
- **R17** A plain "facts" voice is required; a second voice is optional, decided after D1.

## 10. Attribution on screen

- **R18** Every view shows the credit for what is displayed: study citation short form (for example "Data: Movebank, [study owner], CC BY") or, for Mode B, "Data: GBIF.org" plus dataset credit as GBIF requires. If too long for the Quadrant, an abbreviated form on screen and the full citation in the README and store listing.
- **R19** README and store listing: full citations for every whitelisted study, any written permissions (by reference), links to the Movebank and GBIF terms.

## 11. Error and empty states

- **R20** Localized error screen in all four views.
- **R21** Stale data: if the newest fix is older than a threshold (for example 14 days), say so with the date. Covers embargoed studies and dead tags.
- **R22** Animal lost (tag stopped for good): swap to the next whitelisted animal, keep a short "last seen" note.

## 12. Testing and acceptance

- **R23** Fixtures and a generator script for static storefront data (as in Aurora Watch's `fixtures/`), including an in-flight state over Africa.
- **R24** Worker tests with recorded Movebank responses; test the license mismatch refusal and the whitelist rule (R5).
- **R25** Device checks: OG 1-bit and 2-bit, BWRY, TRMNL X, both orientations, all four views.

## 13. Sources

- Movebank terms of use: https://www.movebank.org/cms/movebank-content/general-movebank-terms-of-use
- Movebank permissions and embargo: https://www.movebank.org/cms/movebank-content/permissions-and-sharing
- Movebank license field definitions: https://movebank.org/cms/movebank-content/movebank-attribute-dictionary
- GBIF occurrence search parameters (via rgbif docs): https://docs.ropensci.org/rgbif/reference/occ_data.html
- eBird Status and Trends terms (excluded, for reference): https://science.ebird.org/mn/status-and-trends/products-access-terms-of-use
- TRMNL Creator Fund: https://trmnl.com/blog/creator-fund
- CC NonCommercial interpretation: https://wiki.creativecommons.org/NonCommercial_interpretation

## 14. Risks

- Few CC0/CC BY studies with fresh public data for the wanted species (task 0 answers this first).
- Public data embargo makes "live" tracks weeks old (D3, R21).
- GBIF sighting latency makes Mode B thin.
- Owner expectations: contact study owners even where not strictly required.
