# Text requirements (R16)

2026-09-28, full view only (decision V1). Measured with `template/measure-slots.mjs`: real template, TRMNL's framework CSS and fonts, Chromium, 800 × 480 (`screen--og`). Re-measure when the template, the framework or the panel size changes. Enforced by `worker/check.mjs` over every species, language and day.

## Slots

All words come from the Worker (R15), in English and German. The text box sits bottom left and is at most 484 px wide (about 463 px inside its padding). Its lines share one screen with the map, so the box should stay under about 40% of the height (190 px).

| Slot | Where | Class | px per char (measured) | Chars per line | Limit | Current max (sweep) |
|---|---|---|---|---|---|---|
| Species · name | box, line 1 | `title title--small` | 7.4 | ~62 | 1 line, **55** | 32 |
| Where (from → to, or what it is doing where, and until when; 2026-10-01) | box, line 2 | `label` | 8.4 | ~55 | 2 lines, **100** | 75 |
| Date line (live: last position; usual: "usually here around … track from …") | box, line 3 | `label label--small` | 6.0 | ~76 | 2 lines, **140** | 59 |
| Fact | box, line 4 | `description` | 6.1 | ~75 | 2 lines, **140** | 61 |
| Credit | box, last line | `label label--small label--gray` | 6.3 | ~73 | 1 line, **73** | 64 |
| Callout (destination or departure) | frame edge pill, max 46% of the map (359 px) | 13 px bold system font | ~7.3 (estimate) | ~45 | 2 lines, **90** | 79 |

Worst case in lines: 1 + 2 + 2 + 2 + 1 = 8 lines ≈ 16 + 40 + 24 + 24 + 12 = 116 px of text, about 170 px with padding and gaps: inside the 40% budget.

## Rules

- Sentence case. Facts are full sentences ending with a full stop; the other lines are not.
- The date is always shown with a position (D3). Historic positions always say "usually" and give the year of the track (S2).
- German: no prepositions before place names (articles vary: "in die Schweiz", "auf den Pazifik"), so journeys use an arrow. No pronouns for the animal (der Storch, die Möwe, die Schildkröte).
- Numbers and dates in the language's format: "3,415 km" / "3.415 km", "25 Aug" / "25. Aug.".
- A fact must be true of the animal on screen: data facts come from its own track; species facts must hold for the species as a whole and carry a published source with the exact sentence they rest on (R8, `pipeline/species_curated.json`; `pipeline/verify_sources.py` must find every quote). Converted figures (miles, feet, pounds, US tons) are rounded, never made more precise than the source.
- Place names come from Natural Earth as they are (R7); they are not edited.
- Animal names in quotes: „Name“ in German, “Name” in English (2026-09-29).
- Measurements in facts follow the Units setting; sourced facts write them `{metric|imperial}` (decision U1). No data credit on screen (decision C2).
- New copy goes through real payloads in every state before shipping (working method rule 6): `node worker/check.mjs`, then `node template/render-check.mjs`.
