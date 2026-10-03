# On the Move: what the recipe does

A summary for writing marketing texts (2026-09-30). Everything here is what the recipe does today; numbers are from the repository. Keep claims within this text: in particular, the recipe never claims to be live tracking (see "Honest about time").

## In one sentence

On the Move puts the journeys of real, GPS-tracked migrating animals on your TRMNL: a white stork wintering in Spain, a gull on its way to Morocco, a turkey vulture heading for Mexico, drawn on a calm e-ink map with where the animal is, where it came from, where it is going next and a fact about its species.

## What you see

**A map of one animal's journey.**
- A bold dot marks where the animal is.
- A solid line shows the way it has come on this leg of its journey.
- A thinner line shows where it usually goes next.
- A small ring marks the destination when it is on the map.
- When the destination is off screen, a pill at the edge of the map points towards it: "Destination: Morocco · 2,012 km away".
- The map is TRMNL's own, with a lean style made for e-ink: land, water and borders, few roads. It is tuned so lines and dots stay crisp on e-ink greyscale.

**A text box that tells the story.**
- The species and, where the researchers gave it one, the animal's own name: "Lesser Black-backed Gull · “Arvin”", "Turkey Vulture · “Thomas”", "White Stork · “Kiki”".
- Where it is and what it is doing:
  - "France · usually stays until about 18 Nov"
  - "Czechia → Chad · usually arrives around 3 Oct"
  - "Sudan · a stopover, usually until about 14 Oct"
- One fact, changing with each visit.
- A photo of the species (optional).

**The date of the data, on the map.** Every screen says how current it is: "Last located 27 Sep 2026", or for an animal shown on its typical route, "Usually here around 30 Sep. Last route from 2017".

## The animals

18 species, 3 tracked individuals for most of them (the blue whale has 1). The species span birds of prey, songbirds, waterbirds, a sea turtle and a whale:

- White Stork
- Common Crane
- European Honey Buzzard
- European Turtle Dove
- Lesser Black-backed Gull
- Red-backed Shrike
- Northern Wheatear
- Far Eastern Curlew
- Broad-winged Hawk
- Turkey Vulture
- Osprey
- Snow Goose
- Canada Goose
- Bald Eagle
- Blackpoll Warbler
- Blue Whale
- Loggerhead Turtle
- Peregrine Falcon

**Named individuals** include:
- the white storks Kiki, Marina and Nina;
- the cranes Barysh and Candrat;
- the gulls Arvin, Maarten and Maya;
- the broad-winged hawks Hugger, Muskoka and Ottauquechee;
- the turkey vultures Thomas, Edgar and Malcom.

Every other animal carries the first name of a famous biologist or scientist from its part of the world (since 3 Oct 2026): the peregrine falcons Signe, Gitte and Harriet, the turtle doves Gregor and Jan, the blue whale Sylvia, the osprey Rachel.

The journeys cross continents and oceans: Europe to Africa, Canada to Central and South America, Greenland to Honduras, the Korean Peninsula to Australia, along the Pacific coast of North America, and across the seas of East Asia.

## Two ways an animal is shown

- **Recent position.** For 7 species, tracks from ongoing research studies are fetched automatically every 6 hours: white stork, crane, honey buzzard, turtle dove, gull, broad-winged hawk and turkey vulture. The screen shows the animal's last known position and the date it was recorded.
- **Its usual journey on this day.** For the others, the recipe knows where the animal usually is on each day of the year, from its recorded route of a past year. The screen says so: "Usually here around 30 Sep. Last route from 2016". So even an animal whose tag stopped years ago takes you through its year, day by day, season after season.

The recipe knows each animal's rhythm:
- its summer and winter ranges;
- its stopovers on the way;
- when it usually leaves and when it usually arrives.

It notices when a live animal is late: a crane still in Lithuania after its usual departure date is shown in Lithuania, with the line pointing on to its winter range.

## Facts

- **Species facts:** 162 hand-written facts, 8 to 11 per species, each checked against a published source (reworked for fun on 1 Oct 2026). Examples:
  - "In 1822 a stork turned up in Germany with an 80 cm African arrow in its neck: the first proof that storks winter in Africa."
  - "Turkey vultures smell so well that they help gas companies find leaks."
  - "A blue whale's tongue can weigh as much as an elephant, and its heart as much as a car."
  - "A crane's windpipe is 130 cm long and coiled through its breastbone, like a trumpet."
  - "Courting bald eagles lock talons high in the sky and cartwheel down, letting go just before they hit the ground."
  - "In autumn blackpoll warblers fly non-stop over the Atlantic, 2,270 to 2,770 km, weighing just 12 g."
  - "Red-backed shrikes impale leftover prey on thorns, or on barbed wire, to keep it for later."
- **Facts about the individual animal:**
  - how far apart the ends of its year lie;
  - how many days a year it spends travelling;
  - its sex;
  - since when it has been tracked;
  - the year it hatched.
- **Rotation:** facts rotate without repeats, so each visit brings something new.

## Flock View (TRMNL X)

Follow several animals and see them all at once. On larger screens like the TRMNL X, Flock View shows a list of every animal you follow, each with a short line of context:
- "Wintering in Spain"
- "Stopover in Sudan"
- "Summering in the USA"
- "Czechia → Chad"

One animal at a time is in focus: it is highlighted with its photo, where it is and how long it usually stays, its destination and a fact, and the map shows its journey. On each refresh the next animal comes into focus.

The list fits itself to the screen: as many animals as fit, in one column in landscape and two in portrait. In the smallest view, two animals sit side by side, each with its own map. Flock View is on by default and can be switched off; smaller screens always show one animal.

## Every layout, every screen

- **All four TRMNL layouts:** full screen, half horizontal, half vertical and quadrant. Each is designed for its own shape: the photo beside the text in the half views, the map with one strip of text in the quadrant.
- **Screens:** the TRMNL OG and the TRMNL X, in landscape and portrait.
- **Design:** built entirely with TRMNL's own design framework, so it looks at home next to other plugins in a mashup.
- **Checks:** every layout is render-tested on every screen and orientation with real data.

## Settings

- **Animals:** follow one species, several, or all of them in turn.
- **Species photo:** on or off.
- **Flock View:** on or off.
- **Units:** metric or imperial. Distances and the measurements inside the facts follow it.
- **Language:** English or German. Everything is written in both languages, including place names with their proper forms ("in den USA", "auf Kuba", "im Pazifik").

## Rhythm

- Positions are refreshed every 6 hours.
- With several animals, the one on screen changes every 15 minutes.
- The day is the viewer's local day.

## Honest about time

Tracking data reaches the public with a delay, and some tags have stopped. The recipe always shows the date of the data and never calls itself live. When it shows a typical route, it says which year the route is from.

## Sources and credits

- **Tracks:** research studies published on Movebank, under open licences (CC0 or CC BY) only. The About text credits every study and its owners.
- **Photos:** chosen by the author, under CC BY or CC0, credited in the About text.
- **Map data:** © OpenStreetMap contributors, shown on the map.
- **Place names:** Natural Earth (public domain).

## More real lines from the screen (30 Sep 2026)

- "Canada → Guatemala · usually arrives around 5 Oct" (broad-winged hawk “Hugger”)
- "USA · usually stays until about 6 Oct", "Destination: Mexico · 1,442 km away" (turkey vulture “Thomas”)
- "Greenland → Honduras · usually arrives around 1 Dec" (peregrine falcon, 1997 route)
- "North Korea · usually stays until about 17 Oct", "Destination: Australia · 5,584 km away" (Far Eastern curlew)
- "Spends about 63 days a year on the move." (a blackpoll warbler)
- German: "Im Winterquartier in Spanien", "Rastet im Sudan", "Zuletzt geortet am 26. Sep. 2026"

## Tone notes for the copy

- The appeal is quiet wonder: a tiny warbler crossing an ocean, a stork you can follow by name, the seasons turning on your desk.
- Don't promise real-time tracking or exact positions: the screen names the country or sea, and the map shows the journey, not a pinpoint.
- Don't promise that every animal is tracked right now: some are shown on the journey they usually make.
