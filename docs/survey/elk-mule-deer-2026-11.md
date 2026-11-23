# Elk and mule deer: where, why, and which animals (2026-11-22)

Owner, 2026-11-21: "add the elk and mule deer based on the criteria you suggested. see if you can find some secondary sources to back us up on the storyline." Built after the 11 picked species (`pipeline/new_species.json`). Correction to the 2026-11-21 table in `more-candidates-2026-11.md`: the mule deer's summer range is the Hoback Basin and Wyoming Range, not the Idaho line.

## Where our animals go (from `data/usual/`, checked 2026-11-22)

Centre of each animal's 15 Jun to 15 Aug positions against 15 Dec to 15 Feb.

- **Mule deer**, Wyoming Sublette Mule Deer (2018-2020), CC0, 97 animals. Winter centres cluster at about 41.8° N, 109.0° W: the Red Desert northeast of Rock Springs, north of Interstate 80. Summer centres at about 43.2 to 43.4° N, 110.1 to 110.6° W: the mountains around the Hoback Basin. Median summer-winter distance 92 km; 44 animals over 100 km; the longest-travelled deer summers near 44.1° N, 110.8° W, 293 km away. This is the Red Desert to Hoback migration.
- **Elk**, Ya Ha Tinda (Banff) studies, CC0. Migrants winter at about 51.74° N, 115.55° W (the Ya Ha Tinda ranch, east of Banff National Park) and summer at about 51.5 to 51.7° N, 116.3 to 116.5° W inside the park, 57 to 66 km away. Most elk in the data stay near the ranch all year (median 11 km over 326 animals with both seasons).

## Secondary sources for the storyline (quotes found on the live pages 2026-11-22)

Mule deer:
- Wyoming Migration Initiative, Red Desert to Hoback Migration Assessment, https://migrationinitiative.org/?p=279
  - "Recently, the longest mule deer migration ever recorded (and 2nd longest land migration in North America) was discovered where deer travel a one-way distance of 150 miles from the low-elevation winter ranges in the Red Desert to the high mountain slopes surrounding the Hoback Basin."
  - "The deer that complete this journey spend 4 months of each year migrating and encounter a variety of natural and anthropogenic obstacles, including sand dunes, lake and river crossings, multiple highways, and more than 100 fences."
  - Why: "The performance of these herds is largely dependent on their ability to seasonally migrate from low-elevation winter ranges to high-elevation summer ranges, where they gain fat needed to survive the long Wyoming winters."
  - "The goal of this study was to document the baseline movement and distribution patterns of mule deer that winter in the Red Desert, near Interstate 80." / "The GPS collars were recovered in April 2013, revealing the 150-mile migration."
- Aikens et al. 2017, Ecology Letters, DOI 10.1111/ele.12772 (Europe PMC abstract), mule deer in the Wyoming Range:
  - Why: "The Green Wave Hypothesis posits that herbivore migration manifests in response to waves of spring green-up (i.e. green-wave surfing)."
  - "In a population of migratory mule deer (Odocoileus hemionus), 31% surfed plant phenology in spring as well as a theoretically perfect surfer, and 98% surfed better than random."
- Also found (not quote-checked, USGS blocks scripts): USGS news release "Migrating mule deer track green waves of spring forage"; The Nature Conservancy and High Country News on the corridor; Wyoming Game and Fish designated the Red Desert to Hoback corridor in 2016 (per search results; check before use).

Elk:
- The dataset's own abstract (Movebank Data Repository, forage maturation study, CC0; read 2026-11-21): green-up is "delayed by 50 days for every 1000-m increase in elevation", and migrant elk follow it.
- Williams, Hebblewhite et al., "Predation risk drives long-term shifts in migratory behaviour and demography in a large herbivore population", https://umimpact.umt.edu/en/publications/predation-risk-drives-long-term-shifts-in-migratory-behaviour-and/
  - "Here, we use a nearly 20-year record of individual-based monitoring of a large herbivore, elk (Cervus canadensis) to test hypotheses for changing patterns of migration in and adjacent to a large protected area in Banff National Park (BNP), Canada."
  - "We found dramatic shifts in migration consistent with behavioural plasticity in individual choice of annual migratory routes."
  - "Wolf predation risk was higher on migratory routes than summer ranges of montane-migrant tactics, but wolf predation risk traded-off with heightened risk from grizzly bears on summer ranges."
- Ya Ha Tinda Elk Project, University of Montana, https://www.umt.edu/yahatinda/
  - "Combined, our studies of the population at Ya Ha Tinda represent one of the longest elk population studies in a system with intact natural predators, including wolves and grizzly bears and human hunting."
- Hebblewhite 2006 PhD (search result summary, not quote-checked yet): migrants had higher pregnancy rates and calf weights but lower survival from wolves and grizzly bears.

So the elk story is a trade-off: migrants go up into the park for fresher grass and pay with more predators; over the years many have switched to staying on the ranch. Facts must stay clear of the grim side (vetoed kind): tell it as a choice, not as deaths.

## Which animals

- **Mule deer:** the build's usual ranking (days covered, then a real name) over all 97, with the minimum journey lowered to fit (they move about 150 to 290 km stay to stay). Globe on, like the zebra.
- **Elk:** migrants only, from the two CC0 Ya Ha Tinda studies: summer and winter centres at least 40 km apart (21 of 214 animals with both seasons qualify, at 42 to 66 km). Not the southwestern Alberta study (CC BY, a "landscape of fear" study with a different story). Globe on.
- Names: catalog says "Red Deer" (Cervus elaphus); North American elk are Cervus canadensis. Use "Elk" / "Wapiti".

## Needed in the build (not done yet)

The annual build assumes long journeys: stays are 100 km wide and a journey must have 300 km between stays. Elk and mule deer need per-species values (stay radius about 10 to 15 km, minimum journey about 40 km), and place names below country level, or every stay reads "in Canada" / "in the United States". Proposed: named ranges per species (Ya Ha Tinda / Banff National Park; Red Desert / Hoback Basin), sourced from the pages above. Re-check every quote before writing facts.
