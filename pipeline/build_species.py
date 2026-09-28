#!/usr/bin/env python3
"""Build data/species.json, the species table (R8), for the featured species.

Curated names and facts come from pipeline/species_curated.json (sources
verified by pipeline/verify_sources.py). Migration windows and the wintering
region are computed from the tracked animals of each species in
data/catalog.json and data/usual/, so every figure's source is the list of
published studies it rests on (their citations are in data/catalog.json).

Regions: each migrating animal's own summer (20 June) and winter (15 January)
place, named like the stays (country first), counted; the top three with n.

Windows: an animal counts if its positions on 20 June and 15 January are at
least 500 km apart (it migrated that year). Autumn departure is the first day
from 1 July on that it stays more than 300 km from its 20 June position for 5
days; arrival is the first day it stays within 300 km of its 15 January
position; spring the same the other way round. Reported as median and the
middle half (25th to 75th percentile) with n. First computed 2026-09-28.
"""
import datetime as dt, json, os, statistics
from collections import Counter

from build_featured import km, load_places, place_of, MARINE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CENTRAL_EUROPE = (45, 56, 5, 25)   # lat min, lat max, lon min, lon max (Claude's box; to review)
MIN_ANIMALS = 3
D = lambda m, d: dt.date(2021, m, d).timetuple().tm_yday - 1
SUMMER, WINTER = D(6, 20), D(1, 15)


def md(doy):
    d = dt.date(2021, 1, 1) + dt.timedelta(days=round(doy) % 365)
    return d.strftime("%m-%d")


def first(tab, start, end, ref, cond):
    d = start
    while d != end:
        seq = [tab[(d + k) % 366] for k in range(5)]
        if all(x and cond(km(x[:2], ref[:2])) for x in seq):
            return d
        d = (d + 1) % 366
    return None


def windows(tabs):
    """Returns the four windows over the animals that migrated, or None."""
    got = {"autumnDeparture": [], "autumnArrival": [], "springDeparture": [], "springArrival": []}
    summer, winter = [], []
    for tab in tabs:
        s, w = tab[SUMMER], tab[WINTER]
        if not s or not w or km(s[:2], w[:2]) < 500:
            continue
        summer.append(s[:2]); winter.append(w[:2])
        for key, v in (("autumnDeparture", first(tab, D(7, 1), WINTER, s, lambda x: x > 300)),
                       ("autumnArrival", first(tab, D(7, 1), WINTER, w, lambda x: x < 300)),
                       ("springDeparture", first(tab, WINTER, SUMMER, w, lambda x: x > 300)),
                       ("springArrival", first(tab, WINTER, SUMMER, s, lambda x: x < 300))):
            if v is not None:
                # Autumn days after 31 Dec wrap into the next year; keep them ordered.
                got[key].append(v + (366 if key.startswith("autumn") and v < D(7, 1) else 0))
    if len(summer) < MIN_ANIMALS:
        return None, summer, winter
    out = {}
    for key, vals in got.items():
        if len(vals) < MIN_ANIMALS:
            out[key] = None
            continue
        q = statistics.quantiles(vals, n=4)
        out[key] = {"median": md(statistics.median(vals)), "from": md(q[0]), "to": md(q[2]), "n": len(vals)}
    return out, summer, winter


def main():
    cat = json.load(open(os.path.join(ROOT, "data", "catalog.json"), encoding="utf-8"))
    featured = json.load(open(os.path.join(ROOT, "data", "featured.json"), encoding="utf-8"))["species"]
    cur = json.load(open(os.path.join(ROOT, "pipeline", "species_curated.json"), encoding="utf-8"))["species"]
    tables = {}
    for f in os.listdir(os.path.join(ROOT, "data", "usual")):
        tables.update(json.load(open(os.path.join(ROOT, "data", "usual", f)))["animals"])
    layers = load_places()
    out = []
    for f in featured:
        taxon = f["taxon"]
        animals = [a for a in cat["animals"] if a["taxon"] == taxon]
        tabs = {a["id"]: tables[a["id"]] for a in animals}
        allw, summer, winter = windows(list(tabs.values()))
        la0, la1, lo0, lo1 = CENTRAL_EUROPE
        ce_ids = [i for i, t in tabs.items() if t[SUMMER] and la0 <= t[SUMMER][0] <= la1 and lo0 <= t[SUMMER][1] <= lo1]
        cew, _, _ = windows([tabs[i] for i in ce_ids])
        # Each animal's own place, counted: a median point of several populations
        # lands where none of them goes (seen: storks "wintering in Niger" between
        # the Spanish and West African winterers; turkey vultures "in the Caribbean Sea").
        def region(pts):
            c = Counter()
            names = {}
            for p in pts:
                n = place_of(layers, p[0], p[1], taxon in MARINE, stay=True)
                if n:
                    c[n["en"]] += 1
                    names[n["en"]] = n
            return [{**names[k], "animals": v} for k, v in c.most_common(3)] or None
        studies = Counter(a["studyId"] for a in animals)
        sp = cat["species"][taxon]
        out.append({
            "taxon": taxon,
            "names": {k: cur[taxon]["names"][k] for k in ("en", "de")},
            "namesSource": cur[taxon]["names"]["source"],
            "iucn": sp["iucn"], "iucnSource": "GBIF species API, iucnRedListCategory, checked 2026-09-28",
            "migration": sp["migration"], "migrationSource": sp["migrationSource"],
            "windows": {
                "centralEurope": cew,
                "allTracked": allw,
                "note": None if allw else "Too few animals move 500 km or more between summer and winter to give windows (e.g. sea turtles roam rather than shuttle).",
            },
            "summerRegion": region(summer), "winterRegion": region(winter),
            "facts": cur[taxon]["facts"],
            "tracked": {"animals": len(animals), "migrated": len(summer), "centralEuropeSummer": len(ce_ids),
                        "studies": [{"id": s, "animals": n, "name": cat["studies"][s]["name"]} for s, n in studies.most_common()]},
        })
    doc = {"about": "Species table (R8) for the 12 featured species (F1). Names and facts: pipeline/species_curated.json, "
                    "sources verified by pipeline/verify_sources.py. Windows and regions: computed by pipeline/build_species.py "
                    "from the tracked animals listed under 'tracked' (citations in data/catalog.json). Dates are MM-DD; "
                    "'from'/'to' span the middle half of the animals. Re-run before relying on the numbers.",
           "built": dt.date.today().isoformat(), "centralEuropeBox": CENTRAL_EUROPE, "species": out}
    for p in (os.path.join(ROOT, "data", "species.json"), os.path.join(ROOT, "worker", "data", "species.json")):
        json.dump(doc, open(p, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    for s in out:
        w = s["windows"]["centralEurope"] or s["windows"]["allTracked"]
        tag = "CE " if s["windows"]["centralEurope"] else "all"
        dep = w and w["autumnDeparture"]; arr = w and w["springArrival"]
        print(f'{s["names"]["en"]:24} {tag} n={s["tracked"]["migrated"]:3} leaves {dep and dep["median"]} ({dep and dep["from"]}..{dep and dep["to"]}) '
              f'back {arr and arr["median"]} | winter: ' + ", ".join("%s %d" % (r["en"], r["animals"]) for r in (s["winterRegion"] or [])))


if __name__ == "__main__":
    main()
