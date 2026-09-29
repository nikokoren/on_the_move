# On the Move

A TRMNL recipe that makes animal migration tangible from where you live: follow GPS-tagged animals (Mode A) or see which migratory species are arriving nearby (Mode B).

Status (2026-09-28): data survey first pass done (`docs/survey/results.md`); D1 and D2 open. Brief and requirements: `docs/BRIEF.md`. Decisions: `docs/DECISIONS.md`.

## Data and credits

### Species photos

Shown in the text box when the "Species photo" setting is on (default). Chosen by the owner on 2026-09-29 from iNaturalist research-grade observations; only CC0 and CC BY 4.0. Each photo is **cropped to a square and converted to greyscale** for the e-ink screen (`pipeline/build_photos.py`); the originals are at the links. CC BY photos are used under the licence, which comes without warranties. The same credits are in the recipe's About text (`template/settings.yml`), which is how the recipe credits them on the device (CC BY 4.0, section 3(a)(2); see `docs/SOURCES.md`).

| Species | Credit (as given by the photographer) | Licence | Original |
|---|---|---|---|
| White Stork | (c) SteveM4560, some rights reserved (CC BY) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [iNaturalist](https://www.inaturalist.org/observations/202678318) |
| Common Crane | (c) Parth Kansara, some rights reserved (CC BY) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [iNaturalist](https://www.inaturalist.org/observations/141518478) |
| European Honey Buzzard | (c) Настя Бухвалова, some rights reserved (CC BY) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [iNaturalist](https://www.inaturalist.org/observations/176780483) |
| European Turtle Dove | (c) Mourad Harzallah, some rights reserved (CC BY) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [iNaturalist](https://www.inaturalist.org/observations/79680063) |
| Lesser Black-backed Gull | no rights reserved | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [iNaturalist](https://www.inaturalist.org/observations/237391671) |
| Red-backed Shrike | (c) SteveM4560, some rights reserved (CC BY) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [iNaturalist](https://www.inaturalist.org/observations/161059968) |
| Northern Wheatear | (c) Jan Ebr & Ivana Ebrová, some rights reserved (CC BY) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [iNaturalist](https://www.inaturalist.org/observations/217335629) |
| Far Eastern Curlew | (c) Tim, some rights reserved (CC BY) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [iNaturalist](https://www.inaturalist.org/observations/104576393) |
| Broad-winged Hawk | (c) Abby Darrah, some rights reserved (CC BY) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [iNaturalist](https://www.inaturalist.org/observations/109546486) |
| Turkey Vulture | no rights reserved | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [iNaturalist](https://www.inaturalist.org/observations/247699630) |
| Blue Whale | no rights reserved | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [iNaturalist](https://www.inaturalist.org/observations/155430378) |
| Loggerhead Turtle | (c) Annika Lindqvist, some rights reserved (CC BY) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [iNaturalist](https://www.inaturalist.org/observations/1293229) |

### Tracking data

To be filled in (R19): full citations for every whitelisted study, references to written permissions, and links to the Movebank and GBIF terms.
