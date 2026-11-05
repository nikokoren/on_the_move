# Animal facts — round 5

2026-11-05 · **105 proposed additions.** 52 English and 53 German facts across all 20 currently featured species. The imported review outcomes and current release state are recorded below.

Open [the interactive review](facts-round5.html) in a browser to edit wording, go through suggestions individually, approve, star, veto, request a rewrite with notes, and export your decisions. Edits are saved in that browser when local storage is available; export to keep a portable copy. Approval in the page only records a decision; integration is a separate step.

## Approach and checks

Written to [FACT_STYLE.md](../FACT_STYLE.md), including the latest vetoes from rounds 1–4. English and German were written independently; short and long facts tell separate stories. The same story can appear across languages when it works naturally in both.

All 132 supporting quotes for the 105 facts were matched against 40 source pages fetched on 2026-11-05. All additions fit their 90/140-character limits, have unique IDs and contain no exact repeats of the current facts or one another within a language. Quote matching confirms the evidence exists; the owner still reviews the wording and appeal.

Sources are mostly English and German Wikipedia, with NOAA Fisheries for several marine facts. English sources support a few German facts where the German article lacks detail. No new measurements require metric/imperial conversion.

Every species gets at least one new short and one new long fact in each language. If all proposals are accepted, every pool reaches at least six short and four long facts. Zebras and green turtles each receive 16 additions, bringing each language from two to ten facts.

Initial draft checks (before integration):

```sh
python3 pipeline/check_fact_draft.py pipeline/facts_draft_round5_en.json --additions --cache pipeline/.cache/facts-round5-check
python3 pipeline/check_fact_draft.py pipeline/facts_draft_round5_de.json --additions --cache pipeline/.cache/facts-round5-check
python3 pipeline/build_fact_review.py
```

Use an empty cache directory for a fresh live-source pass. After integration, the additions checker correctly rejects facts already in the bundle; use [the release checks](../FACTS_RELEASE.md) for the accepted content. After review, recheck edited wording against its quotes and build/render the accepted facts through the normal recipe pipeline. Rejected facts remain excluded.

Browser checks passed for individual navigation through all 105 suggestions, filters, current-fact comparison, edits and overlength warnings, separate veto/rewrite decisions with notes, favorites, persistence, and the complete JSON export. Desktop (1280 px) and mobile (390 px) showed no horizontal overflow or JavaScript errors. [Rendered review preview](facts-round5-preview.png).

## Coverage

Counts are **EN short / EN long / DE short / DE long**. ‘After’ describes the initial proposal, assuming every item is accepted; owner decisions are recorded below.

| Species | Current | After review, if accepted |
|---|---|---|
| White Stork / Weißstorch | 7 / 5 / 6 / 4 | 8 / 6 / 7 / 5 |
| Common Crane / Kranich | 8 / 6 / 8 / 4 | 9 / 7 / 9 / 5 |
| European Honey Buzzard / Wespenbussard | 6 / 4 / 4 / 6 | 7 / 5 / 6 / 7 |
| European Turtle Dove / Turteltaube | 5 / 5 / 6 / 4 | 6 / 6 / 7 / 5 |
| Lesser Black-backed Gull / Heringsmöwe | 7 / 5 / 6 / 4 | 8 / 6 / 7 / 5 |
| Red-backed Shrike / Neuntöter | 7 / 6 / 6 / 5 | 8 / 7 / 7 / 6 |
| Northern Wheatear / Steinschmätzer | 8 / 4 / 7 / 3 | 9 / 5 / 8 / 4 |
| Far Eastern Curlew / Isabellbrachvogel | 7 / 4 / 6 / 4 | 8 / 5 / 7 / 5 |
| Broad-winged Hawk / Breitflügelbussard | 7 / 5 / 5 / 3 | 8 / 6 / 6 / 4 |
| Turkey Vulture / Truthahngeier | 9 / 5 / 8 / 3 | 10 / 6 / 9 / 4 |
| Osprey / Fischadler | 10 / 5 / 6 / 3 | 11 / 6 / 7 / 4 |
| Snow Goose / Schneegans | 8 / 4 / 7 / 3 | 9 / 5 / 8 / 4 |
| Canada Goose / Kanadagans | 8 / 6 / 7 / 4 | 9 / 7 / 8 / 5 |
| Bald Eagle / Weißkopf-Seeadler | 8 / 5 / 5 / 4 | 9 / 6 / 6 / 5 |
| Blackpoll Warbler / Streifenwaldsänger | 7 / 4 / 5 / 4 | 8 / 5 / 6 / 5 |
| Blue Whale / Blauwal | 8 / 6 / 7 / 5 | 9 / 7 / 8 / 6 |
| Loggerhead Turtle / Unechte Karettschildkröte | 9 / 4 / 6 / 4 | 10 / 5 / 7 / 5 |
| Peregrine Falcon / Wanderfalke | 7 / 5 / 7 / 4 | 8 / 6 / 8 / 5 |
| Plains Zebra / Steppenzebra | 1 / 1 / 1 / 1 | 6 / 4 / 6 / 4 |
| Green Turtle / Grüne Meeresschildkröte | 1 / 1 / 1 / 1 | 6 / 4 / 6 / 4 |

## Imported owner review

Exported 2026-11-05T14:30:07.841Z: 91 approved, 6 vetoed, 5 requested rewrites, 3 pending. All edits, notes and 39 favorites are preserved in `pipeline/facts_review_round5.json`. Three approved edits have proposed grammar repairs, presented separately for confirmation. The other 88 approvals need no further wording review. Round six is complete: 98 approved additions are integrated locally and all 7 vetoes are excluded. Release status is recorded in the release notes.

See the [11-item follow-up review](facts-round6.html). The original export remains unchanged; its instructions are editorial feedback for these items.


## White Stork / Weißstorch

*Ciconia ciconia*

### EN · short

**en5-s-stork-frog-calls** · 64 characters · ok

White storks can find frogs by listening for their mating calls.

Source: [Wikipedia (en), White stork](https://en.wikipedia.org/wiki/White_stork) · checked 2026-11-05

> Birds returning to Latvia during spring have been shown to locate their prey, moor frogs ( Rana arvalis ), by homing in on the mating calls produced by aggregations of male frogs. [ 102 ]

### EN · long

**en5-l-stork-apartments** · 118 characters · ok

A stork nest can be an apartment block: sparrows and starlings nest inside it, and sometimes even little owls move in.

Source: [Wikipedia (en), White stork](https://en.wikipedia.org/wiki/White_stork) · checked 2026-11-05

> Several bird species often nest within the large nests of the white stork.
> Regular occupants are house sparrows , tree sparrows , and common starlings ; less common residents include Eurasian kestrels , little owls , European rollers , white wagtails , black redstarts , Eurasian jackdaws , and Spanish sparrows .

### DE · short

**de5-s-stork-klapper-name** · 87 characters · rewrite

Kaum Stimme, aber viel Schnabelklappern: Daher heißt der Weißstorch auch Klapperstorch.

Source: [Wikipedia (de), Weißstorch](https://de.wikipedia.org/wiki/Wei%C3%9Fstorch) · checked 2026-11-05

> Die Stimme des Weißstorchs ist nur schwach ausgeprägt.
> Er verständigt sich durch Klappern mit dem Schnabel , deshalb wird er auch Klapperstorch [ 2 ] genannt.

Owner note: that's not proper German grammar. rewrite.

### DE · long

**de5-l-stork-no-knife** · 97 characters · ok

Der Weißstorch verschlingt große Beute als Ganzes, weil sein Schnabel sie nicht zerkleinern kann.

Source: [Wikipedia (de), Weißstorch](https://de.wikipedia.org/wiki/Wei%C3%9Fstorch) · checked 2026-11-05

> Große Beutestücke bis knapp 1000 Gramm können nur als ganzes Stück verschlungen werden, da der Storchenschnabel für das Zerlegen von Beute und Aas nicht geeignet ist.


## Common Crane / Kranich

*Grus grus*

### EN · short

**en5-s-crane-mud-paint** · 68 characters · pending

Common cranes paint their feathers with mud to blend into the marsh.

Source: [Wikipedia (en), Common crane](https://en.wikipedia.org/wiki/Common_crane) · checked 2026-11-05

> In common with sandhill cranes (and no other crane species), common cranes "paint" their bodies with mud or decaying vegetation, apparently in order to blend into their nesting environment.

### EN · long

**en5-l-crane-swimming-chicks** · 107 characters · pending

Crane chicks can swim soon after hatching and run with their parents a day later, long before they can fly.

Source: [Wikipedia (en), Common crane](https://en.wikipedia.org/wiki/Common_crane) · checked 2026-11-05

> New hatchlings are generally quite helpless but are able to crawl away from danger within a few hours, can swim soon after hatching and can run with their parents at 24 hours old.

### DE · short

**de5-s-crane-bare-crown** · 84 characters · pending

Der rote Fleck auf dem Kranichkopf besteht aus nackter Haut, nicht aus roten Federn.

Source: [Wikipedia (de), Kranich](https://de.wikipedia.org/wiki/Kranich) · checked 2026-11-05

> Kennzeichnend sind die schwarz-weiße Kopf- und Halszeichnung und die federlose rote Kopfplatte.

### DE · long

**de5-l-crane-false-tail** · 110 characters · veto

Die Kranich-„Schleppe“ ist kein langer Schwanz: Verlängerte Federn hängen über die eigentlichen Schwanzfedern.

Source: [Wikipedia (de), Kranich](https://de.wikipedia.org/wiki/Kranich) · checked 2026-11-05

> Die Humeralfedern variieren farblich von Grau bis Schwarz und hängen bei Altvögeln als Schleppe über den Schwanz hinweg.


## European Honey Buzzard / Wespenbussard

*Pernis apivorus*

### EN · short

**en5-s-honey-clapping** · 58 characters · ok

A honey buzzard's spring courtship includes wing-clapping.

Source: [Wikipedia (en), European honey buzzard](https://en.wikipedia.org/wiki/European_honey_buzzard) · checked 2026-11-05

> The European honey buzzard breeds in woodland , and is inconspicuous except in the spring, when the mating display includes wing-clapping.

### EN · long

**en5-l-honey-magnetic-map** · 116 characters · ok

An adult honey buzzard combines a magnetic compass with remembered rivers and mountain ranges to find its way south.

Source: [Wikipedia (en), European honey buzzard](https://en.wikipedia.org/wiki/European_honey_buzzard) · checked 2026-11-05

> Being a long-distance migrant, the honey buzzard relies on magnetic orientation to find its way south, as well as (for adult birds) a visual memory of recognisable geographical features such as mountain ranges and rivers, along the way.

### DE · short

**de5-s-honey-straight-claws** · 73 characters · ok

Wespenbussarde haben fast gerade Krallen und ans Graben angepasste Beine.

Source: [Wikipedia (de), Wespenbussard](https://de.wikipedia.org/wiki/Wespenbussard) · checked 2026-11-05

> Die Beine sind vor allem an das Graben im Boden angepasst.
> Der Tarsometatarsus ist kurz und sehr kräftig, wobei der unbefiederte Teil sehr dick beschuppt ist.
> Die Krallen sind kaum gebogen.

**de5-s-honey-rattle-call** · 82 characters · ok

Beim Partnerwechsel am Nest lassen Wespenbussarde einen leisen Rasselruf von sich.

Source: [Wikipedia (de), Wespenbussard](https://de.wikipedia.org/wiki/Wespenbussard) · checked 2026-11-05

> Noch seltener wahrgenommen wird ein vergleichsweise leiser, klappernder und in der Tonhöhe variierender „Rasselruf“, der vor allem bei der Ablösung des Partners am Nest eingesetzt wird.

### DE · long

**de5-l-honey-wasp-timetable** · 104 characters · ok

Wespenbussarde kommen so spät aus Afrika zurück, dass die Jungenaufzucht in die Wespen-Hochsaison fällt.

Source: [Wikipedia (de), Wespenbussard](https://de.wikipedia.org/wiki/Wespenbussard) · checked 2026-11-05

> Die Art kommt erst sehr spät aus den afrikanischen Winterquartieren zurück, so dass die Jungenaufzucht in die Zeit der größten Häufigkeit von Wespen, den Hochsommer, fällt.


## European Turtle Dove / Turteltaube

*Streptopelia turtur*

### EN · short

**en5-s-dove-whip-wings** · 52 characters · ok

A courting turtle dove cracks its wings like a whip.

Source: [Wikipedia (en), European turtle dove](https://en.wikipedia.org/wiki/European_turtle_dove) · checked 2026-11-05

> The nuptial flight, high and circling, is like that of the common wood pigeon , but the undulations are less decided; it is accompanied by the whip-crack of the downward flicked wings.

### EN · long

**en5-l-dove-climbing-chicks** · 93 characters · ok

Young turtle doves leave the nest before they can fly, staying among nearby branches instead.

Source: [Wikipedia (de), Turteltaube](https://de.wikipedia.org/wiki/Turteltaube) · checked 2026-11-05

> Jungvögel verlassen in einem Lebensalter von etwa 14 Tagen das Nest.
> Sie sind zu dem Zeitpunkt noch nicht flugfähig und halten sich in den Ästen in der Nähe des Nestes auf.

### DE · short

**de5-s-dove-young-collar** · 73 characters · ok

Junge Turteltauben tragen noch keinen schwarz-weißen Halsstreifen-Kragen.

Source: [Wikipedia (de), Turteltaube](https://de.wikipedia.org/wiki/Turteltaube) · checked 2026-11-05

> Die für die adulten Vögel charakteristischen Halsquerbinden entwickeln sich erst nach einigen Monaten.

### DE · long

**de5-l-dove-spring-wandering** · 123 characters · rewrite

Frisch aus Afrika zurück, ziehen Turteltauben oft wochenlang umher. Selbst ein balzendes Paar muss am Fundort nicht brüten.

Source: [Wikipedia (de), Turteltaube](https://de.wikipedia.org/wiki/Turteltaube) · checked 2026-11-05

> Rückkehrende Turteltauben schreiten nicht sofort zur Brut, sondern ziehen einzeln und als Paar über mehrere Wochen umher.
> Selbst eine Balz ist kein Indiz dafür, dass das Paar an diesem Ort auch zur Brut schreiten wird. [ 15 ]

Owner note: am Fundort? Fundort of what?


## Lesser Black-backed Gull / Heringsmöwe

*Larus fuscus*

### EN · short

**en5-s-gull-food-button** · 65 characters · ok

Gull chicks peck the red spot on a parent's bill to ask for food.

Source: [Wikipedia (en), Lesser black-backed gull](https://en.wikipedia.org/wiki/Lesser_black-backed_gull) · checked 2026-11-05

> The bill is yellow with a red spot at which the young peck, inducing feeding (see fixed action pattern ).

### EN · long

**en5-l-gull-grownup-coat** · 115 characters · ok

Young lesser black-backed gulls start out scaly brown, not black-backed. The journey to adulthood takes four years.

Source: [Wikipedia (en), Lesser black-backed gull](https://en.wikipedia.org/wiki/Lesser_black-backed_gull) · checked 2026-11-05

> Young birds have scaly black-brown upperparts and a neat wing pattern.
> They take four years to reach maturity.

### DE · short

**de5-s-gull-underwater** · 66 characters · ok

Heringsmöwen tauchen bei der Fischjagd manchmal vollständig unter.

Source: [Wikipedia (de), Heringsmöwe](https://de.wikipedia.org/wiki/Heringsm%C3%B6we) · checked 2026-11-05

> Fische werden auf dem Meer oft stoßtauchend aus dem Suchflug aus 10–12 m Höhe heraus erbeutet, wobei der Vogel im 45°-Winkel etwa 8 m herabfliegt, rüttelnd abbremst, hinabstößt und völlig untertaucht.

### DE · long

**de5-l-gull-rice-olives** · 122 characters · ok

Nach dem Treibnetzverbot im westlichen Mittelmeer suchten Heringsmöwen neue Nahrung: auch in Olivenhainen und Reisfeldern.

Source: [Wikipedia (de), Heringsmöwe](https://de.wikipedia.org/wiki/Heringsm%C3%B6we) · checked 2026-11-05

> So führte ein 1991 von der UN erlassenes Moratorium zur Treibnetzfischerei im westlichen Mittelmeer dazu, dass die Art auf andere Nahrungsquellen umsteigen musste und zwischenzeitlich vermehrt auf Mülldeponien, in Olivenhainen und auf Reisfeldern anzutreffen war.


## Red-backed Shrike / Neuntöter

*Lanius collurio*

### EN · short

**en5-s-shrike-pellets** · 64 characters · ok

A red-backed shrike coughs up pellets of indigestible leftovers.

Source: [Wikipedia (de), Neuntöter](https://de.wikipedia.org/wiki/Neunt%C3%B6ter) · checked 2026-11-05

> Unverdauliche Bestandteile werden als Speiballen ausgewürgt.

### EN · long

**en5-l-shrike-helper-males** · 89 characters · ok

Some unattached male shrikes help feed another pair's young, or join in as extra singers.

Source: [Wikipedia (de), Neuntöter](https://de.wikipedia.org/wiki/Neunt%C3%B6ter) · checked 2026-11-05

> Lediglich zum Ende der Brutsaison, nach dem Ausfliegen der Jungvögel, schließen sich manchmal nichtbrütende Männchen den Familien an, beteiligen sich an der Fütterung der Jungen oder betätigen sich als „Vorsänger“.

### DE · short

**de5-s-shrike-closed-bill** · 53 characters · ok

Neuntöter singen oft mit fast geschlossenem Schnabel.

Source: [Wikipedia (de), Neuntöter](https://de.wikipedia.org/wiki/Neunt%C3%B6ter) · checked 2026-11-05

> Der Gesang wird meist in aufrecht sitzender Haltung mit kaum geöffnetem Schnabel vorgetragen.

### DE · long

**de5-l-shrike-sunny-lookout** · 118 characters · ok

Neuntöter wählen ihre Lieblingswarte je nach Tageszeit und Sonnenstand. Der beste Ausguck bleibt nicht immer derselbe.

Source: [Wikipedia (de), Neuntöter](https://de.wikipedia.org/wiki/Neunt%C3%B6ter) · checked 2026-11-05

> Die favorisierte Warte eines Revierinhabers kann je nach Tageszeit und Sonnenstand wechseln.


## Northern Wheatear / Steinschmätzer

*Oenanthe oenanthe*

### EN · short

**en5-s-wheatear-tail-t** · 60 characters · ok

A wheatear's white tail carries a bold black, upside-down T.

Source: [Wikipedia (en), Northern wheatear](https://en.wikipedia.org/wiki/Northern_wheatear) · checked 2026-11-05

> Both sexes have a white rump and tail, with a black inverted T-pattern at the end of the tail.

### EN · long

**en5-l-wheatear-pipe-nursery** · 112 characters · ok

Northern wheatears can make a nursery in a pipe or a wall cavity; the female builds while the male sings nearby.

Source: [Wikipedia (en), Northern wheatear](https://en.wikipedia.org/wiki/Northern_wheatear) · checked 2026-11-05

> The nest is built entirely by the female while the male perches nearby, sings and sometimes performs song-flights.
> The nest is placed in a cavity such as a rabbit burrow, a crevice among rocks or in a man-made object such as a wall or pipe.

### DE · short

**de5-s-wheatear-asteroid** · 66 characters · rewrite

Ein Asteroid trägt den Namen des Steinschmätzers: (8959) Oenanthe.

Source: [Wikipedia (de), Steinschmätzer (Art)](https://de.wikipedia.org/wiki/Steinschm%C3%A4tzer_(Art)) · checked 2026-11-05

> Der Asteroid des inneren Hauptgürtels (8959) Oenanthe ist nach dem Steinschmätzer benannt (wissenschaftlicher Name: Oenanthe oenanthe ).

Owner note: recheck German grammar

### DE · long

**de5-l-wheatear-changing-look** · 128 characters · veto

Steinschmätzer-Männchen wechseln den Look: Im Frühjahr schwarze Maske und grauer Rücken, im Herbst mehr Braun und weniger Maske.

Source: [Wikipedia (de), Steinschmätzer (Art)](https://de.wikipedia.org/wiki/Steinschm%C3%A4tzer_(Art)) · checked 2026-11-05

> Die Männchen haben im Prachtkleid im Frühjahr und Sommer einen grauen Scheitel und grauen Rücken, einen schwarzen Augenstreif , der sich bis auf die Wangen zieht und sich dort etwas verbreitert, so dass er wie eine Maske wirkt.
> Im Schlichtkleid ähneln sich die Geschlechter mehr, denn die Männchen sind dann etwas unscheinbarer mit braunem Rücken und Scheitel und weniger stark ausgeprägter Maske.


## Far Eastern Curlew / Isabellbrachvogel

*Numenius madagascariensis*

### EN · short

**en5-s-curlew-berries** · 86 characters · ok

A Far Eastern curlew sometimes swaps it's seafood diet for berries while on migration.

Source: [Wikipedia (en), Far Eastern curlew](https://en.wikipedia.org/wiki/Far_Eastern_curlew) · checked 2026-11-05

> During migration it also feeds on berries.

### EN · long

**en5-l-curlew-new-moon** · 121 characters · ok

Numenius, the curlew's scientific genus name, is linked to Greek words for a new moon: a nod to the crescent-shaped bill.

Source: [Wikipedia, Curlew](https://en.wikipedia.org/wiki/Curlew) · checked 2026-11-05

> The name Numenius is from Ancient Greek noumenios , a bird mentioned by Hesychius .
> It is associated with the curlews because it appears to be derived from neos , "new" and mene , "moon", referring to the crescent-shaped bill.

### DE · short

**de5-s-curlew-fruit-break** · 66 characters · veto

Isabellbrachvögel legen auf dem Zug auch mal eine Beerenpause ein.

Source: [Wikipedia (en), Far Eastern curlew](https://en.wikipedia.org/wiki/Far_Eastern_curlew) · checked 2026-11-05

> During migration it also feeds on berries.

Owner note: birds take a break while on migration isn't that interesting of a fact.

### DE · long

**de5-l-curlew-wrong-madagascar** · 125 characters · rewrite

Madagaskar steckt im Artnamen des Isabellbrachvogels, doch dort wurde nie einer nachgewiesen. Die Herkunftsangabe war falsch.

Source: [Wikipedia (en), Far Eastern curlew](https://en.wikipedia.org/wiki/Far_Eastern_curlew) · checked 2026-11-05

> The name madagascariensis , referring to Madagascar , was an error by Brisson, with the type locality now known to have been Makassar on Sulawesi, Indonesia, where it winters; the species has never been recorded in Madagascar. [ 4 ]

Owner note: too complex. simplify


## Broad-winged Hawk / Breitflügelbussard

*Buteo platypterus*

### EN · short

**en5-s-broadwing-whistle** · 73 characters · ok

A broad-winged hawk sounds more like a thin whistle than a fierce scream.

Source: [Wikipedia (en), Broad-winged hawk](https://en.wikipedia.org/wiki/Broad-winged_hawk) · checked 2026-11-05

> Their call sounds like a very high-pitched kee-ee , almost like a whistle.

### EN · long

**en5-l-broadwing-spiral** · 93 characters · ok

Courting broad-winged hawks can hook their feet together in midair and spiral down as a pair.

Source: [Wikipedia (en), Broad-winged hawk](https://en.wikipedia.org/wiki/Broad-winged_hawk) · checked 2026-11-05

> Birds meet in the air, hook their feet together and spiral down together.

### DE · short

**de5-s-broadwing-fresh-twigs** · 82 characters · ok

Breitflügelbussarde schmücken den Nestrand immer wieder mit frischen Nadelzweigen.

Source: [Wikipedia (de), Breitflügelbussard](https://de.wikipedia.org/wiki/Breitfl%C3%BCgelbussard) · checked 2026-11-05

> Es wird außen immer mit frischen Koniferenzweigen verkleidet und innen mit Rindenstückchen, Moos, Flechten, Vogelfedern und Tier- oder Pflanzenwolle ausgepolstert.
> Sowohl die Außen– als auch die Innenverkleidung werden während der gesamten Brut- und Nestlingszeit gewartet und erneuert.

### DE · long

**de5-l-broadwing-sky-ballet** · 139 characters · ok

Balzende Breitflügelbussarde steigen bis außer Sichtweite in den Himmel auf. Dann trudeln beide Partner gemeinsam in einer Spirale abwärts.

Source: [Wikipedia (de), Breitflügelbussard](https://de.wikipedia.org/wiki/Breitfl%C3%BCgelbussard) · checked 2026-11-05

> Beide Partner kreisen über dem Neststandort, steigen dabei oft in so große Höhen auf, dass sie außer Sicht geraten.
> Im Sinkflug nähert sich das meist höher fliegende Männchen dem Weibchen, bis es fast zur Berührung kommt; beide kippen danach ab und trudeln spiralig abwärts.


## Turkey Vulture / Truthahngeier

*Cathartes aura*

### EN · short

**en5-s-vulture-blunt-claws** · 70 characters · ok

A turkey vulture's claws are blunt and poorly suited to grabbing prey.

Source: [Wikipedia (en), Turkey vulture](https://en.wikipedia.org/wiki/Turkey_vulture) · checked 2026-11-05

> The feet are flat, relatively weak, and poorly adapted to grasping; the talons are also not designed for grasping, as they are relatively blunt.

### EN · long

**en5-l-vulture-circle-dance** · 97 characters · ok

Courting turkey vultures gather in a circle and hop around its edge with their wings half spread.

Source: [Wikipedia (en), Turkey vulture](https://en.wikipedia.org/wiki/Turkey_vulture) · checked 2026-11-05

> Courtship rituals of the turkey vulture involve several individuals gathering in a circle, where they perform hopping movements around the perimeter of the circle with wings partially spread.

### DE · short

**de5-s-vulture-young-head** · 86 characters · ok

Junge Truthahngeier haben einen schwarzen Kopf; rot wird er erst nach etwa einem Jahr.

Source: [Wikipedia (de), Truthahngeier](https://de.wikipedia.org/wiki/Truthahngeier) · checked 2026-11-05

> Jungvögel haben einen schwarzen Schnabel und Kopf.
> Erst in einem Alter von einem Jahr nimmt der Kopf die Rotfärbung an.

### DE · long

**de5-l-vulture-no-nest** · 113 characters · ok

Truthahngeier sparen sich den Nestbau: Die Eier liegen direkt auf dem Boden, etwa in Höhlen oder zwischen Felsen.

Source: [Wikipedia (de), Truthahngeier](https://de.wikipedia.org/wiki/Truthahngeier) · checked 2026-11-05

> Ein Nest wird nicht gebaut, sondern die zwei Eier werden direkt auf den Boden in Höhlen, auf Klippenvorsprünge oder zwischen Felsen gelegt und anschließend 38 bis 41 Tage bebrütet.


## Osprey / Fischadler

*Pandion haliaetus*

### EN · short

**en5-s-osprey-old-nests** · 74 characters · ok

On one Australian island, some osprey nests have been reused for 70 years.

Source: [Wikipedia (en), Osprey](https://en.wikipedia.org/wiki/Osprey) · checked 2026-11-05

> Rocky outcrops just offshore are used in Rottnest Island off the coast of Western Australia , where 14 or so similar nesting sites are known, of which five to seven are used in any one year.
> Many are renovated each season, and some have been used for 70 years.

### EN · long

**en5-l-osprey-nj-platform** · 122 characters · ok

New Jersey has an official osprey nest-platform design, created by local conservationists and copied far beyond the state.

Source: [Wikipedia (en), Osprey](https://en.wikipedia.org/wiki/Osprey) · checked 2026-11-05

> The nesting platform design developed by Citizens United to Protect the Maurice River and its Tributaries, Inc. has become the official design of the State of New Jersey , U.S.
> The nesting platform plans and materials list, available online, have been used by people from a number of different geographical regions.

### DE · short

**de5-s-osprey-orange-eyes** · 60 characters · ok

Junge Fischadler fallen durch ihre orangefarbenen Augen auf.

Source: [Wikipedia (de), Fischadler](https://de.wikipedia.org/wiki/Fischadler) · checked 2026-11-05

> Jungvögel haben im Gegensatz zu adulten Adlern eine orange Iris.

### DE · long

**de5-l-osprey-no-thermals** · 118 characters · ok

Fischadler brauchen auf dem Zug keine Thermik und überqueren selbst Meere und Wüsten auch an deren breitesten Stellen.

Source: [Wikipedia (de), Fischadler](https://de.wikipedia.org/wiki/Fischadler) · checked 2026-11-05

> Der Fischadler ist bei seinen Wanderungen nicht auf Thermik angewiesen und überquert als Breitfrontzieher Meere und Wüsten auch an deren breitesten Stellen.


## Snow Goose / Schneegans

*Chen caerulescens*

### EN · short

**en5-s-snow-family-years** · 73 characters · ok

Snow goose youngsters can stay with their parents for two or three years.

Source: [Wikipedia (en), Snow goose](https://en.wikipedia.org/wiki/Snow_goose) · checked 2026-11-05

> After 42 to 50 days, they can fly, but they remain with their family until they are 2 to 3 years old.

### EN · long

**en5-l-snow-hybrid-family** · 93 characters · ok

Snow geese can have chicks with Ross's geese, and those hybrids can have chicks of their own.

Source: [Wikipedia (en), Snow goose](https://en.wikipedia.org/wiki/Snow_goose) · checked 2026-11-05

> Where snow geese and Ross's geese breed together, as at La Pérouse, they hybridize at times, and hybrids are fertile.

### DE · short

**de5-s-snow-mixed-siblings** · 71 characters · ok

In einer Schneegansfamilie können weiße und dunkle Jungvögel schlüpfen.

Source: [Wikipedia (de), Schneegans](https://de.wikipedia.org/wiki/Schneegans) · checked 2026-11-05

> Nichtsdestotrotz kann dasselbe Elternpaar Vertreter beider Morphen hervorbringen, so wie auch farbliche Übergänge möglich sind.

### DE · long

**de5-l-snow-eggs-en-route** · 133 characters · ok

Schneegänse haben es im arktischen Frühling eilig: Manche legen schon unterwegs an der Küste Eier, bevor sie den Brutplatz erreichen.

Source: [Wikipedia (de), Schneegans](https://de.wikipedia.org/wiki/Schneegans) · checked 2026-11-05

> Ihr Fortpflanzungsdrang ist zu dem Zeitpunkt so hoch, dass sie nicht selten schon Eier an der Küste auf dem Weg zu den Brutplätzen ablegen. [ 5 ]


## Canada Goose / Kanadagans

*Branta canadensis*

### EN · short

**en5-s-canada-family-line** · 76 characters · ok

Canada goose parents escort goslings with one adult in front and one behind.

Source: [Wikipedia (en), Canada goose](https://en.wikipedia.org/wiki/Canada_goose) · checked 2026-11-05

> Parents are often seen leading their goslings in a line, usually with one adult at the front and the other at the back.

### EN · long

**en5-l-canada-swimming-lessons** · 108 characters · ok

A gosling needs no swimming lessons: newly hatched Canada geese can walk, swim, and find food straight away.

Source: [Wikipedia (en), Canada goose](https://en.wikipedia.org/wiki/Canada_goose) · checked 2026-11-05

> As soon as the goslings hatch, they are immediately capable of walking, swimming, and finding their own food (a diet similar to that of adult geese).

### DE · short

**de5-s-canada-voice-id** · 49 characters · ok

Kanadagänse erkennen einander auch an der Stimme.

Source: [Wikipedia (de), Kanadagans](https://de.wikipedia.org/wiki/Kanadagans) · checked 2026-11-05

> Kanadagänse können sich auch am Ruf individuell erkennen.

### DE · long

**de5-l-canada-lishman-flight** · 129 characters · veto

1993 zeigte William Lishman Kanadagänsen per Ultraleichtflugzeug den Weg nach Virginia. Im Frühjahr flogen fast alle allein heim.

Source: [Wikipedia (de), Kanadagans](https://de.wikipedia.org/wiki/Kanadagans) · checked 2026-11-05

> Dem Bildhauer William Lishman gelang es im Herbst 1993, eine kleine Schar von Kanadagänsen, die von Menschen aufgezogen worden waren, mit einem Ultraleichtflugzeug von Ontario in Überwinterungsgebiete nach Virginia zu führen.
> Fast alle dieser Gänse kehrten im Frühjahr 1994 selbständig auf die Farm zurück, auf der man sie aufgezogen hatte.


## Bald Eagle / Weißkopf-Seeadler

*Haliaeetus leucocephalus*

### EN · short

**en5-s-eagle-shark-menu** · 56 characters · ok

Even small sharks have turned up on a bald eagle's menu.

Source: [Wikipedia (en), Bald eagle](https://en.wikipedia.org/wiki/Bald_eagle) · checked 2026-11-05

> Much larger marine fish such as Pacific halibut ( Hippoglossus stenolepis ) and lemon sharks ( Negaprion brevirostris ) have been recorded among bald eagle prey though probably are only taken as young, as small, newly mature fish, or as carrion. [ 60 ] [ 89 ]

### EN · long

**en5-l-eagle-shared-hunt** · 102 characters · ok

In New Jersey, bald and golden eagles have been seen hunting snow geese side by side without fighting.

Source: [Wikipedia (en), Bald eagle](https://en.wikipedia.org/wiki/Bald_eagle) · checked 2026-11-05

> Despite the potential for contention between these animals, in New Jersey during winter, a golden eagle and numerous bald eagles were observed to hunt snow geese alongside each other without conflict.

### DE · short

**de5-s-eagle-official-2024** · 77 characters · rewrite

Erst seit 2024 ist der Weißkopf-Seeadler offiziell der Nationalvogel der USA.

Source: [Wikipedia (en), Bald eagle](https://en.wikipedia.org/wiki/Bald_eagle) · checked 2026-11-05

> It has long been considered the "national bird", though unofficially until the act of Congress S.4610 was signed into law on December 23, 2024. [ 226 ] [ 227 ]

Owner note: check German grammar

### DE · long

**de5-l-eagle-feather-repository** · 124 characters · ok

Das National Eagle Repository der USA verteilt Adlerfedern an staatlich anerkannte indigene Stämme für religiöse Zeremonien.

Source: [Wikipedia (en), Bald eagle](https://en.wikipedia.org/wiki/Bald_eagle) · checked 2026-11-05

> The National Eagle Repository , a division of the FWS , exists as a means to receive, process, and store bald and golden eagles which are found dead and to distribute the eagles, their parts and feathers to federally recognized Native American tribes for use in religious ceremonies. [ 224 ]


## Blackpoll Warbler / Streifenwaldsänger

*Setophaga striata*

### EN · short

**en5-s-blackpoll-dad-daycare** · 81 characters · ok

Blackpoll mothers may start a second nest while the father feeds the first brood.

Source: [Wikipedia (en), Blackpoll warbler](https://en.wikipedia.org/wiki/Blackpoll_warbler) · checked 2026-11-05

> Mated females usually begin second nests right away and leave post-fledging parental duties to their mates.

### EN · long

**en5-l-blackpoll-pest-menu** · 129 characters · ok

A blackpoll hunts tiny pests from mosquitoes to aphids, and can switch from searching the treetops to catching insects in midair.

Source: [Wikipedia (en), Blackpoll warbler](https://en.wikipedia.org/wiki/Blackpoll_warbler) · checked 2026-11-05

> Documented insect prey for the species includes lice , locusts , cankerworms , mosquitoes , webworms , ants , termites , gnats , aphids , and sawflies .
> They often forage high in trees, and sometimes catch insects while in flight.

### DE · short

**de5-s-blackpoll-high-tsi** · 67 characters · ok

Streifenwaldsänger singen ein sehr hohes, schlichtes „tsi-tsi-tsi“.

Source: [Wikipedia (en), Blackpoll warbler](https://en.wikipedia.org/wiki/Blackpoll_warbler) · checked 2026-11-05

> They are more often heard than seen, though their song is one of the highest-pitched known.
> Their songs are simple repetitions of high tsi notes.

### DE · long

**de5-l-blackpoll-autumn-look** · 138 characters · ok

Ein Streifenwaldsänger-Männchen sieht im Herbst ganz anders aus: Statt schwarzer Kappe und weißer Brust sind sie überwiegen Grün und Gelb.

Source: [Wikipedia (de), Streifenwaldsänger](https://de.wikipedia.org/wiki/Streifenwalds%C3%A4nger) · checked 2026-11-05

> Im Brutkleid tragen männliche Streifenwaldsänger eine schwarze Kappe, eine schwarzgestreifte weiße Brust, ein weißes Kopfgefieder und ein braunes mit dunklen Streifen versetztes Oberseitengefieder.
> Außerhalb der Brutzeit ist das Oberseitengefieder grünlich und mit dunklen Streifen versetzt, der Kopf grünlich und der Brustbereich gelblich.


## Blue Whale / Blauwal

*Balaenoptera musculus*

### EN · short

**en5-s-blue-mottled-id** · 56 characters · ok

Every blue whale wears its own pattern of pale blotches.

Source: [NOAA Fisheries, Blue Whale](https://www.fisheries.noaa.gov/species/blue-whale) · checked 2026-11-05

> The mottling pattern is variable and can be used to identify individuals.

### EN · long

**en5-l-blue-rolling-lunch** · 114 characters · ok

While lunging for krill, blue whales can roll upside down. Turning may help them find the densest patches of food.

Source: [Wikipedia (en), Blue whale](https://en.wikipedia.org/wiki/Blue_whale) · checked 2026-11-05

> Blue whales have been recorded making 180° rolls during lunge-feeding, possibly allowing them to search the prey field and find the densest patches. [ 89 ]

### DE · short

**de5-s-blue-chin-hairs** · 82 characters · ok

Auch ein Blauwal hat Haare! Nämlich am Kinn, am Unterkiefer und oben auf dem Kopf.

Source: [Wikipedia (de), Blauwal](https://de.wikipedia.org/wiki/Blauwal) · checked 2026-11-05

> An verschiedenen Stellen des Kopfes befinden sich Haare, vor allem am Kinn, beidseitig am Unterkiefer und auf der Oberseite.

### DE · long

**de5-l-blue-belly-bellows** · 115 characters · ok

Die Bauchfalten des Blauwals reichen vom Maul bis zum Nabel. So kann sich der Mundraum beim Fressen weit ausdehnen.

Source: [Wikipedia (de), Blauwal](https://de.wikipedia.org/wiki/Blauwal) · checked 2026-11-05

> An der Unterseite ziehen sich 60 bis 88 [ 1 ] Ventralfurchen vom Maul bis zum Nabel, die das namensgebende Merkmal der Furchenwale darstellen und die Erweiterung des Mundraumes bei der Nahrungsaufnahme ermöglichen.


## Loggerhead Turtle / Unechte Karettschildkröte

*Caretta caretta*

### EN · short

**en5-s-loggerhead-salt-tears** · 63 characters · ok

A loggerhead's apparent tears are a way of getting rid of salt.

Source: [Wikipedia (en), Loggerhead sea turtle](https://en.wikipedia.org/wiki/Loggerhead_sea_turtle) · checked 2026-11-05

> Lachrymal glands located behind each eye allow the loggerhead to maintain osmotic balance by eliminating the excess salt obtained from ingesting ocean water.

### EN · long

**en5-l-loggerhead-state-coin** · 124 characters · ok

The loggerhead is South Carolina's state reptile and Florida's state saltwater reptile; it also appears on a Colombian coin.

Source: [Wikipedia (en), Loggerhead sea turtle](https://en.wikipedia.org/wiki/Loggerhead_sea_turtle) · checked 2026-11-05

> The loggerhead sea turtle appears on the $1000 Colombian peso coin.
> In the United States, the loggerhead sea turtle is the official state reptile of South Carolina and also the state saltwater reptile of Florida. [ 121 ] [ 122 ]

### DE · short

**de5-s-loggerhead-no-hiding** · 78 characters · ok

Unechte Karettschildkröten können Kopf und Flossen nicht in den Panzer ziehen.

Source: [NOAA Fisheries, Loggerhead Turtle](https://www.fisheries.noaa.gov/species/loggerhead-turtle) · checked 2026-11-05

> Unlike freshwater turtles and tortoises, sea turtles cannot withdraw their head or flippers into their shells.

### DE · long

**de5-l-loggerhead-winter-dive** · 121 characters · ok

In kalten Monaten können Unechte Karettschildkröten bis zu sieben Stunden abtauchen, bevor sie kurz zum Atmen auftauchen.

Source: [Wikipedia (en), Loggerhead sea turtle](https://en.wikipedia.org/wiki/Loggerhead_sea_turtle) · checked 2026-11-05

> In the coldest months, they submerge for up to seven hours at a time, emerging for only seven minutes to breathe.


## Peregrine Falcon / Wanderfalke

*Falco peregrinus*

### EN · short

**en5-s-peregrine-eye-black** · 77 characters · ok

A peregrine's dark cheek stripes help cut glare, like an athlete's eye black.

Source: [Wikipedia (en), Peregrine falcon](https://en.wikipedia.org/wiki/Peregrine_falcon) · checked 2026-11-05

> A 2021 study of photos from around the world showed that the malar stripe is larger in areas that receive more sunlight, and concluded that the stripe serves to improve the falcon's vision by reducing glare. [ 20 ]

### EN · long

**en5-l-peregrine-food-gift** · 90 characters · ok

A female peregrine rolls upside down in flight to take a food gift from the male's talons.

Source: [Wikipedia (en), Peregrine falcon](https://en.wikipedia.org/wiki/Peregrine_falcon) · checked 2026-11-05

> The male passes prey it has caught to the female in mid-air.
> To make this possible, the female flies upside-down to receive the food from the male's talons.

### DE · short

**de5-s-peregrine-bats** · 80 characters · ok

Wanderfalken fangen nicht nur Vögel: Auch Fledermäuse stehen auf dem Speiseplan.

Source: [Wikipedia (de), Wanderfalke](https://de.wikipedia.org/wiki/Wanderfalke) · checked 2026-11-05

> Wanderfalken jagen bis weit in die Dämmerung hinein; Fledermäuse , vor allem früh fliegende Arten wie Abendsegler , sind daher die einzigen regelmäßig erbeuteten Säugetiere. In Großstädten nutzen Wanderfalken das große Kunstlichtangebot und jagen nachts ziehende Vögel wie Rallen und Limikolen , in Berlin z. B. häufig Wasserrallen , Wachtelkönige und Waldschnepfen . [ 41 ]

### DE · long

**de5-l-peregrine-city-night** · 84 characters · ok

Wanderfalken nutzen künstliches Licht, um auch nachts durchziehende Vögel zu fangen.

Source: [Wikipedia (de), Wanderfalke](https://de.wikipedia.org/wiki/Wanderfalke) · checked 2026-11-05

> Wanderfalken jagen bis weit in die Dämmerung hinein; Fledermäuse , vor allem früh fliegende Arten wie Abendsegler , sind daher die einzigen regelmäßig erbeuteten Säugetiere. In Großstädten nutzen Wanderfalken das große Kunstlichtangebot und jagen nachts ziehende Vögel wie Rallen und Limikolen , in Berlin z. B. häufig Wasserrallen , Wachtelkönige und Waldschnepfen . [ 41 ]


## Plains Zebra / Steppenzebra

*Equus quagga*

### EN · short

**en5-s-zebra-own-stripes** · 51 characters · ok

No two plains zebras wear exactly the same stripes.

Source: [Wikipedia (en), Plains zebra](https://en.wikipedia.org/wiki/Plains_zebra) · checked 2026-11-05

> Like all zebras, they are boldly striped in black and white and no two individuals look exactly alike.

**en5-s-zebra-brown-foals** · 78 characters · ok

A plains zebra foal is born brown and white; the dark stripes deepen with age.

Source: [Wikipedia (en), Plains zebra](https://en.wikipedia.org/wiki/Plains_zebra) · checked 2026-11-05

> The natal coat of a foal is brown and white and the brown darkens with age. [ 15 ] [ 14 ] [ 19 ]

**en5-s-zebra-bark** · 71 characters · ok

Plains zebras bark: their contact call sounds like a repeated "kwa-ha".

Source: [Wikipedia (en), Plains zebra](https://en.wikipedia.org/wiki/Plains_zebra) · checked 2026-11-05

> One is its distinctive, high-pitched, contact call (commonly called " barking ") heard as "a- ha , a- ha , a- ha " or "kwa-ha, kaw-ha, ha, ha" [ 15 ] also transcribed as "kwahaah", [ 30 ] or "oug-ga".

**en5-s-zebra-night-watch** · 51 characters · ok

While a zebra group sleeps, one member keeps watch.

Source: [Wikipedia (en), Plains zebra](https://en.wikipedia.org/wiki/Plains_zebra) · checked 2026-11-05

> They may rest or sleep laying down, while one individual keeps guard. [ 9 ]

**en5-s-zebra-foal-bubble** · 78 characters · ok

A mother zebra initially keeps even her older offspring away from her newborn.

Source: [Wikipedia (en), Plains zebra](https://en.wikipedia.org/wiki/Plains_zebra) · checked 2026-11-05

> Early on, a mother zebra keeps any other zebra away from her foal, including the stallion, the other mares, and even her previous offspring.

### EN · long

**en5-l-zebra-lawn-first** · 117 characters · ok

Zebras tackle long, tough grass first, opening the way for fussier grazers such as wildebeest and Thomson's gazelles.

Source: [Wikipedia (en), Plains zebra](https://en.wikipedia.org/wiki/Plains_zebra) · checked 2026-11-05

> Plains zebras are adapted for grazing on both long, tough grass stems and newly emerging short grass (stems and sheaths).
> The zebra is a pioneer grazer and prepares the way for more specialised grazers such as blue wildebeests and Thomson's gazelles . [ 9 ]

**en5-l-zebra-groom-teeth** · 112 characters · ok

Zebras groom one another with their teeth and lips, nibbling along the neck and back to strengthen family bonds.

Source: [Wikipedia (en), Plains zebra](https://en.wikipedia.org/wiki/Plains_zebra) · checked 2026-11-05

> Zebras strengthen their social bonds with grooming .
> Members of a harem nip and scrape along the neck, withers, and back with their teeth and lips.

**en5-l-zebra-family-stays** · 118 characters · veto

A zebra family's females stay together even when a new stallion takes over: the group is more than its current leader.

Source: [Wikipedia (en), Plains zebra](https://en.wikipedia.org/wiki/Plains_zebra) · checked 2026-11-05

> The female membership of a harem stays intact, even if a new stallion takes over.

### DE · short

**de5-s-zebra-lost-members** · 64 characters · ok

Steppenzebras suchen nach verloren gegangenen Herdenmitgliedern.

Source: [Wikipedia (de), Steppenzebra](https://de.wikipedia.org/wiki/Steppenzebra) · checked 2026-11-05

> Der Zusammenhalt innerhalb der Herde ist sehr groß, verloren gegangene Mitglieder werden über längere Zeit gesucht.

**de5-s-zebra-bachelor-clubs** · 64 characters · ok

Junge Steppenzebra-Hengste leben in eigenen Junggesellengruppen.

Source: [Wikipedia (de), Steppenzebra](https://de.wikipedia.org/wiki/Steppenzebra) · checked 2026-11-05

> Neben den eigentlichen Herden gibt es auch „Junggesellengruppen“ junger männlicher Tiere, die noch keine eigene Herde aufgebaut haben.

**de5-s-zebra-eleven-minutes** · 69 characters · ok

Ein Steppenzebra-Fohlen steht schon rund elf Minuten nach der Geburt.

Source: [Wikipedia (de), Steppenzebra](https://de.wikipedia.org/wiki/Steppenzebra) · checked 2026-11-05

> Nach rund elf Minuten steht das Fohlen bereits, nach im Mittel einer Stunde saugt es erstmals Milch.

**de5-s-zebra-shadow-stripes** · 67 characters · ok

Manche Steppenzebras tragen zusätzliche „Schattenstreifen“ im Fell.

Source: [Wikipedia (de), Steppenzebra](https://de.wikipedia.org/wiki/Steppenzebra) · checked 2026-11-05

> Die breitesten Streifen besitzt heute die Unterart Böhm-Zebra in Ostafrika, sogenannte „Schattenstreifen“, die manchmal die weißen Streifen überlagern, kommen hier kaum vor.
> Die Streifenzeichnungen werden schmaler, aber weniger bei Populationen, die im Süden leben, hier treten dann auch sehr häufig „Schattenstreifen“ auf.

**de5-s-zebra-wake-foals** · 53 characters · ok

Bei Gefahr wecken Steppenzebras zuerst die Jungtiere.

Source: [Wikipedia (de), Steppenzebra](https://de.wikipedia.org/wiki/Steppenzebra) · checked 2026-11-05

> Als Schutz vor Beutegreifern hält mindestens ein Tier Wache, Jungtiere werden bei aufziehender Gefahr als erste geweckt.

### DE · long

**de5-l-zebra-lead-mare** · 119 characters · ok

Vorn führt meist die ranghöchste Stute, hinten sichert der Hengst. Beim Trinken geht dagegen der Hengst als Erster vor.

Source: [Wikipedia (de), Steppenzebra](https://de.wikipedia.org/wiki/Steppenzebra) · checked 2026-11-05

> In der Regel führt die ranghöchste Stute die Gruppe, während der Hengst am Ende des Zuges die Nachhut bildet; beim Trinken, das meist nachts stattfindet, ist er jedoch der Erste.

**de5-l-zebra-ear-greeting** · 121 characters · ok

Zur Begrüßung zeigen Steppenzebra-Ohren nach vorn; bei einer Drohung gehen sie zurück und die Zähne kommen zum Vorschein.

Source: [Wikipedia (de), Steppenzebra](https://de.wikipedia.org/wiki/Steppenzebra) · checked 2026-11-05

> Beim Treffen zweier Herden führen die Hengste eine ritualisierte Begrüßungszeremonie durch, bestehend aus der charakteristischen Grußgeste – erhobene und nach vorn gerichtete Ohren – und gegenseitigem Beschnüffeln der Nase und Genitalien .
> Ein Steppenzebra in Bedrängung legt die Ohren an und spreizt bei zunehmender Bedrohung die Lippen und zeigt die Zähne, eine Mimik , die dem Flehmen und dem Rossigkeitsgesicht ähnelt.

**de5-l-zebra-grazing-pioneers** · 135 characters · ok

Steppenzebras bereiten Gnus und Gazellen den Tisch: Erst wird das lange Gras abgefressen und niedergetrampelt, dann folgen die anderen.

Source: [Wikipedia (de), Steppenzebra](https://de.wikipedia.org/wiki/Steppenzebra) · checked 2026-11-05

> Erst nachdem das Steppenzebra das lange Gras abgefressen und niedergetrampelt hat, folgen Gnus und Gazellen .


## Green Turtle / Grüne Meeresschildkröte

*Chelonia mydas*

### EN · short

**en5-s-green-fat-name** · 69 characters · ok

Green turtles are named for the color of their fat, not their shells.

Source: [NOAA Fisheries, Green Turtle](https://www.fisheries.noaa.gov/species/green-turtle) · checked 2026-11-05

> The name “green turtle” comes from the color of their fat (not their shells), which originally was attributed to their diet; however, other sea turtles have greenish fat as well.

**en5-s-green-saw-beak** · 41 characters · ok

A green turtle's beak has saw-like edges.

Source: [NOAA Fisheries, Green Turtle](https://www.fisheries.noaa.gov/species/green-turtle) · checked 2026-11-05

> Other distinct characteristics of the green turtle are the serrated edges of their beak and two large scales located between their eyes.

**en5-s-green-eats-greens** · 60 characters · ok

Green turtles mostly eat their greens: seagrasses and algae.

Source: [NOAA Fisheries, Green Turtle](https://www.fisheries.noaa.gov/species/green-turtle) · checked 2026-11-05

> Their diet mainly consists of algae and seagrasses, though they may also eat invertebrates and other animal matter (e.g., discarded fish and bait) if available.

**en5-s-green-nearsighted** · 63 characters · ok

A green turtle sees well underwater but is nearsighted on land.

Source: [Wikipedia (en), Green sea turtle](https://en.wikipedia.org/wiki/Green_sea_turtle) · checked 2026-11-05

> Green sea turtles tend to have good vision, well adapted to a life at sea.
> On land, however, the sea turtles are nearsighted because the lenses in the eyes are spherical and adjusted to refraction underwater.

**en5-s-green-baby-outline** · 79 characters · ok

Baby green turtles have a bright white outline along their shells and flippers.

Source: [NOAA Fisheries, Green Turtle](https://www.fisheries.noaa.gov/species/green-turtle) · checked 2026-11-05

> Hatchlings have a dark gray to black carapace, white plastron, and prominent white margins on the shell and flippers.

### EN · long

**en5-l-green-salty-eyes** · 103 characters · ok

A green turtle that seems to be crying may just be shedding excess salt through glands behind its eyes.

Source: [Wikipedia (en), Green sea turtle](https://en.wikipedia.org/wiki/Green_sea_turtle) · checked 2026-11-05

> Basking turtles sometimes look like they are crying because behind the turtles eye is the lachrymal gland which stores excess salt from the sea water, which then expels through the turtles eye.

**en5-l-green-same-bed** · 115 characters · ok

Green turtles can tuck themselves under rocks to sleep, returning to the same underwater bedroom night after night.

Source: [Wikipedia (en), Green sea turtle](https://en.wikipedia.org/wiki/Green_sea_turtle) · checked 2026-11-05

> During the night while sleeping and to protect themselves from potential predators, the adults wedge themselves under rocks below the surface and under ledges in reefs and coastal rocks.
> Many green sea turtles have been observed in returning to the same sleeping location night after night. [ 35 ]

**en5-l-green-bright-horizon** · 94 characters · ok

A baby green turtle finds the sea by moving away from dark dunes toward the brightest horizon.

Source: [NOAA Fisheries, Green Turtle](https://www.fisheries.noaa.gov/species/green-turtle) · checked 2026-11-05

> Hatchlings orient seaward by moving away from the darkest silhouette of the landward dune or vegetation to crawl towards the brightest horizon.

### DE · short

**de5-s-green-front-claw** · 65 characters · ok

Grüne Meeresschildkröten haben an jeder Vorderflosse eine Kralle.

Source: [Wikipedia (de), Grüne Meeresschildkröte](https://de.wikipedia.org/wiki/Gr%C3%BCne_Meeresschildkr%C3%B6te) · checked 2026-11-05

> An den Vorderflossen haben diese Schildkröten eine verlängerte Kralle.

**de5-s-green-seagrass-meadow** · 76 characters · ok

Erwachsene Grüne Meeresschildkröten grasen auf den Seegraswiesen des Meeres.

Source: [Wikipedia (de), Grüne Meeresschildkröte](https://de.wikipedia.org/wiki/Gr%C3%BCne_Meeresschildkr%C3%B6te) · checked 2026-11-05

> Ausgewachsene Tiere ernähren sich vor allem vegetarisch und weiden sich durch die Seegraswiesen der Meere.

**de5-s-green-young-menu** · 66 characters · ok

Junge Grüne Meeresschildkröten fressen auch Kalmare und Fischeier.

Source: [Wikipedia (de), Grüne Meeresschildkröte](https://de.wikipedia.org/wiki/Gr%C3%BCne_Meeresschildkr%C3%B6te) · checked 2026-11-05

> Die Jungtiere der Grünen Meeresschildkröte sind Fleischfresser, die unter anderem Kalmare sowie die Eier von Fischen und Schwämmen fressen.

**de5-s-green-pingpong-eggs** · 74 characters · ok

Die Eier Grüner Meeresschildkröten sind etwa so groß wie Tischtennisbälle.

Source: [Wikipedia (de), Grüne Meeresschildkröte](https://de.wikipedia.org/wiki/Gr%C3%BCne_Meeresschildkr%C3%B6te) · checked 2026-11-05

> Es werden ungefähr 100 Eier von Tischtennisballgröße pro Gelege gelegt.

**de5-s-green-male-tail** · 78 characters · veto

Männliche Grüne Meeresschildkröten verraten sich durch einen längeren Schwanz.

Source: [Wikipedia (de), Grüne Meeresschildkröte](https://de.wikipedia.org/wiki/Gr%C3%BCne_Meeresschildkr%C3%B6te) · checked 2026-11-05

> Der Schwanz beim Männchen ist wie bei den meisten Schildkrötenarten deutlich verlängert.

### DE · long

**de5-l-green-magnetic-home** · 130 characters · ok

Eine Art innerer Kompass hilft Grünen Meeresschildkröten, nach Jahren auf See wieder in die Gegend ihres Geburtsstrands zu finden.

Source: [Wikipedia (de), Grüne Meeresschildkröte](https://de.wikipedia.org/wiki/Gr%C3%BCne_Meeresschildkr%C3%B6te) · checked 2026-11-05

> Die Grüne Meeresschildkröte orientiert sich aufgrund ihres Magnetsinns am Erdmagnetfeld , um Jahre nach dem Schlüpfen erstmals wieder zur Eiablage an den gleichen Strand zurückzukehren.

**de5-l-green-sand-sex** · 125 characters · ok

Bei Grünen Meeresschildkröten entscheidet die Wärme im Sand über das Geschlecht: Kühlere Nester bringen eher Männchen hervor.

Source: [Wikipedia (de), Grüne Meeresschildkröte](https://de.wikipedia.org/wiki/Gr%C3%BCne_Meeresschildkr%C3%B6te) · checked 2026-11-05

> Dabei bedingt die Temperatur während des Ausbrütens die Entwicklung der Geschlechter: Während bei 28 Grad Celsius nur Männchen schlüpfen, schlüpfen bei 32 Grad Celsius nur Weibchen.

**de5-l-green-black-relative** · 124 characters · ok

Die „Schwarze Meeresschildkröte“ ist keine eigene Art: Die dunklen Tiere gehören ebenfalls zu den Grünen Meeresschildkröten.

Source: [Wikipedia (de), Grüne Meeresschildkröte](https://de.wikipedia.org/wiki/Gr%C3%BCne_Meeresschildkr%C3%B6te) · checked 2026-11-05

> Gegenwärtig wird davon ausgegangen, dass es sich bei der dunklen Färbung lediglich um eine Farbmutation handelt, weswegen die Schwarze Meeresschildkröte weder als eigenständige Art, noch als Unterart von C. mydas anerkannt wird. [ 15 ]

