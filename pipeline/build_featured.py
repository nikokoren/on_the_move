#!/usr/bin/env python3
"""Build worker/data/featured.json: what the full view needs for the featured species.

Decisions F1 (the 12 species) and V1 (framing, place names, stays and legs).
Reads data/catalog.json, data/usual/, data/featured.json; no Movebank access.
Natural Earth layers (public domain) are downloaded once into pipeline/.cache.

Per species: a star animal and backups. Per animal: the 366-day track, its
stays (places it sat for a while), a place key per day, and a few numbers the
backend turns into facts. Words live in the Worker (R15); this file carries
names only as data (place names en/de from Natural Earth).
"""
import json, math, os, re, urllib.request
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "pipeline", ".cache")
NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
NE_LAYERS = ["ne_50m_admin_0_countries", "ne_50m_geography_regions_polys", "ne_50m_geography_marine_polys"]

STAY_KM = 100        # V1: a stay keeps within this distance ...
STAY_DAYS = 14       # ... for at least this many days
BACKUPS = 2          # animals kept behind the star, per species
MIN_JOURNEY_KM = 300 # stays must be this far apart somewhere in the year

os.makedirs(CACHE, exist_ok=True)


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 12742 * math.asin(min(1, math.sqrt(h)))


# ---------- place names ----------

def load_places():
    from shapely.geometry import shape
    from shapely.strtree import STRtree
    layers = {}
    for name in NE_LAYERS:
        p = os.path.join(CACHE, name + ".geojson")
        if not os.path.exists(p):
            urllib.request.urlretrieve(NE + name + ".geojson", p)
        feats = json.load(open(p, encoding="utf-8"))["features"]
        keep = []
        for f in feats:
            pr = {k.lower(): v for k, v in f["properties"].items()}
            if name.endswith("regions_polys") and pr.get("featurecla") != "Desert":
                continue
            en, de = pr.get("name_en") or pr.get("name"), pr.get("name_de") or pr.get("name_en") or pr.get("name")
            if not en or not f.get("geometry"):
                continue
            keep.append((shape(f["geometry"]), {"en": en.strip(), "de": de.strip()}))
        geoms = [g for g, _ in keep]
        layers[name] = (STRtree(geoms), geoms, [n for _, n in keep])
    return layers


MARINE = {"Balaenoptera musculus", "Caretta caretta"}


def place_of(layers, lat, lon, marine=False, stay=False):
    """Desert, else country, else sea. Coarse or coastal points often land on the
    wrong side of a 1:50m coastline, so a land animal off the coast takes the
    nearest country within about 1 degree, and a marine animal on land takes the
    nearest sea (seen 2026-09-28: a shrike 'in the Baltic Sea', a blue whale 'in
    the United States')."""
    from shapely.geometry import Point
    pt = Point(lon, lat)

    def inside(name):
        tree, geoms, names = layers[name]
        for i in tree.query(pt):
            if geoms[i].contains(pt):
                return names[i]
        return None

    def near(name, limit=1.0):
        tree, geoms, names = layers[name]
        i = tree.nearest(pt)
        return names[i] if geoms[i].distance(pt) <= limit else None

    if marine:
        return inside("ne_50m_geography_marine_polys") or near("ne_50m_geography_marine_polys", 2.0) \
            or inside("ne_50m_admin_0_countries")
    # Stays are named by country: at 1:50m the desert polygons reach into the
    # Sahel (seen: a turtle dove wintering at Abéche, Chad, named "Libyan Desert").
    # Deserts name the places passed on the way.
    if stay:
        return inside("ne_50m_admin_0_countries") or near("ne_50m_admin_0_countries") \
            or inside("ne_50m_geography_marine_polys") or near("ne_50m_geography_marine_polys", 2.0)
    return inside("ne_50m_geography_regions_polys") or inside("ne_50m_admin_0_countries") \
        or near("ne_50m_admin_0_countries") or inside("ne_50m_geography_marine_polys") \
        or near("ne_50m_geography_marine_polys", 2.0)


def smooth(pts, half):
    n, out = len(pts), []
    for d in range(n):
        win = [pts[(d + k) % n] for k in range(-half, half + 1) if pts[(d + k) % n]]
        if not pts[d] or len(win) < half:
            out.append(pts[d])
            continue
        la = sorted(w[0] for w in win)[len(win) // 2]
        lo = sorted(w[1] for w in win)[len(win) // 2]
        out.append([la, lo])
    return out


def to_sea(layers, t):
    from shapely.geometry import Point
    from shapely.ops import nearest_points
    pt = Point(t[1], t[0])
    tree, geoms, _ = layers["ne_50m_admin_0_countries"]
    if not any(geoms[i].contains(pt) for i in tree.query(pt)):
        return t
    mtree, mgeoms, _ = layers["ne_50m_geography_marine_polys"]
    g = mgeoms[mtree.nearest(pt)]
    q = nearest_points(g, pt)[0]
    # a step past the coastline into the sea polygon
    q = Point(q.x + (q.x - pt.x) * 0.05, q.y + (q.y - pt.y) * 0.05)
    return [round(q.y, 2), round(q.x, 2)] + list(t[2:])


# ---------- stays ----------

def stays_of(tab, stay_km=STAY_KM):
    """Runs of at least STAY_DAYS days within stay_km of their first day, on the
    circular year. Returns [start_doy, end_doy, lat, lon] with the median position."""
    n = len(tab)
    still = [False] * n
    for d in range(n):
        if not tab[d]:
            continue
        win = [tab[(d + k) % n] for k in range(STAY_DAYS)]
        if all(win) and max(km(win[0], w) for w in win) <= stay_km:
            for k in range(STAY_DAYS):
                still[(d + k) % n] = True
    if all(still):
        return [[0, n - 1] + med([tab[d] for d in range(n)])]
    start = next((d for d in range(n) if not still[d]), 0)
    out, d, steps = [], (start + 1) % n, 0
    while steps < n:
        if still[d]:
            s = d
            run = []
            while still[d] and steps < n:
                # A jump between two still days ends the stay: the table stitches
                # years together (seen 2026-09-29: a Canada goose near Montreal in
                # 2023 until day 305, in Delaware in 2022 from day 310, merged into
                # one 260-day "stay in the USA").
                # Twice the stay radius, so ordinary moves inside a stay do not split it.
                if run and km(run[-1][:2], tab[d][:2]) > 2 * stay_km:
                    break
                run.append(tab[d])
                d, steps = (d + 1) % n, steps + 1
            if len(run) >= STAY_DAYS:  # a piece left short by a split is no stay
                out.append([s, (d - 1) % n] + med(run))
        else:
            d, steps = (d + 1) % n, steps + 1
    return out


def med(pts):
    la = sorted(p[0] for p in pts)[len(pts) // 2]
    lo = sorted(p[1] for p in pts)[len(pts) // 2]
    return [round(la, 2), round(lo, 2)]


# ---------- labels ----------

def display_name(label, species_en=""):
    """A real name ('Louis / DER AU050 (eobs 3264)' -> 'Louis') or '' for tag codes
    and labels that only repeat the species ('Honey Buzzard 12212')."""
    if species_en and species_en.lower().split()[-1] in (label or "").lower():
        return ""
    head = re.split(r"\s*[/(]\s*|\s+\+|\s+\d", label or "")[0].strip(" +")
    # All capitals is a code, not a name (seen 2026-09-29: snow geese "GSGO - EM",
    # the banding code for Greater Snow Goose plus initials).
    return head if re.fullmatch(r"[A-Za-zÀ-ÿ'\- ]{3,}", head) and not re.search(r"\d", head) and re.search(r"[a-zà-ÿ]", head) else ""


# ---------- main ----------

def main():
    cat = json.load(open(os.path.join(ROOT, "data", "catalog.json"), encoding="utf-8"))
    featured = json.load(open(os.path.join(ROOT, "data", "featured.json"), encoding="utf-8"))["species"]
    tables = {}
    for f in os.listdir(os.path.join(ROOT, "data", "usual")):
        tables.update(json.load(open(os.path.join(ROOT, "data", "usual", f)))["animals"])
    layers = load_places()
    curated = json.load(open(os.path.join(ROOT, "pipeline", "species_curated.json"), encoding="utf-8"))["species"]
    ip = os.path.join(ROOT, "pipeline", "individuals.json")
    individuals = json.load(open(ip, encoding="utf-8"))["animals"] if os.path.exists(ip) else {}
    places, place_ids = [], {}

    def pid(name):
        if not name:
            return -1
        k = (name["en"], name["de"])
        if k not in place_ids:
            place_ids[k] = len(places)
            places.append(name)
        return place_ids[k]

    out = {"built": cat["generated"], "rules": {"stayKm": STAY_KM, "stayDays": STAY_DAYS},
           "places": places, "species": []}
    stats = Counter()
    for sp in featured:
        taxon = sp["taxon"]
        animals = [a for a in cat["animals"] if a["taxon"] == taxon]
        # Star first: live, then days covered, then a real name over a tag code.
        en = sp["names"].get("en", "")
        # A label shared by several animals is a site or project name, not the animal's.
        shared = {k for k, v in Counter(display_name(a["label"], en) for a in animals).items() if v > 1}
        name_of = lambda a: "" if display_name(a["label"], en) in shared else display_name(a["label"], en)
        cands = []
        for a in animals:
            tab = tables[a["id"]]
            pts = [t[:2] if t else None for t in tab]
            # Geolocator positions jitter by ~100-200 km a day, which hides real stays
            # at 100 km (seen: a shrike's Sahel and southern Africa winters). Scale the
            # radius to the animal's own day-to-day noise.
            steps = sorted(km(pts[i], pts[i + 1]) for i in range(365) if pts[i] and pts[i + 1])
            stay_km = max(STAY_KM, 2.5 * steps[len(steps) // 2]) if steps else STAY_KM
            if stay_km > STAY_KM:
                # Same noise, drawn: a 15-day running median, so the map shows the
                # journey rather than the geolocator's scatter (seen: shrike).
                pts = smooth(pts, 7)
                tab = [[p[0], p[1], t[2], t[3]] if p and t else None for p, t in zip(pts, tab)]
            if taxon in MARINE:
                # Rounding to 1 degree (R14) can put a coastal whale on land; move
                # such points to the nearest sea, keeping the coarse grid otherwise.
                tab = [to_sea(layers, t) if t else None for t in tab]
                pts = [t[:2] if t else None for t in tab]
            st = stays_of(pts, stay_km)
            hops = [km(st[i][2:4], st[(i + 1) % len(st)][2:4]) for i in range(len(st))] if len(st) > 1 else [0]
            if max(hops) < MIN_JOURNEY_KM:
                stats["skipped_no_journey"] += 1
                continue  # stayed in one area all year: nothing to follow
            cands.append((a, tab, st, hops))
        # Star first: live, then a real migration (1,000 km between stays), then days
        # covered, then a real name. Seen 2026-09-28: without the migration rank a gull
        # moving within France outranked one flying the Netherlands to Morocco.
        # Then away from the date line: the framework's map does not wrap the world
        # and cannot centre there (seen 2026-09-29: a loggerhead at 175 W pushed
        # into the frame's corner, in open water).
        near180 = lambda tab: any(t and abs(t[1]) > 170 for t in tab)
        cands.sort(key=lambda c: (not c[0]["live"], near180(c[1]), max(c[3]) < 1000, -c[0]["doyCovered"], name_of(c[0]) == "", c[0]["id"]))
        chosen = cands[:BACKUPS + 1]
        # Names and the species facts from the species table's sources (R8,
        # pipeline/species_curated.json), not the provisional GBIF names.
        c = curated[taxon]
        # A photo only where one has been picked and built (pipeline/build_photos.py).
        has_photo = os.path.exists(os.path.join(ROOT, "worker", "photos", taxon.lower().replace(" ", "_") + ".jpg"))
        entry = {"taxon": taxon, "names": {k: c["names"][k] for k in ("en", "de")}, "iucn": sp["iucn"], "photo": has_photo,
                 "facts": [{k: f[k] for k in ("en", "de")} for f in c["facts"]], "animals": []}
        for a, tab, st, hops in chosen:
            study = cat["studies"][a["studyId"]]
            track, day_place = [], []
            cache = {}
            for t in tab:
                if not t:
                    track.append(None)
                    day_place.append(-1)
                    continue
                track.append([round(t[1], 2), round(t[0], 2), t[2]])  # [lng, lat, year]
                key = (round(t[0], 1), round(t[1], 1))
                if key not in cache:
                    cache[key] = pid(place_of(layers, t[0], t[1], taxon in MARINE))
                day_place.append(cache[key])
            stays = [[s[0], s[1], s[3], s[2], pid(place_of(layers, s[2], s[3], taxon in MARINE, stay=True))] for s in st]  # [from, to, lng, lat, place]
            # Numbers for facts: straight-line km between consecutive known days, summed over the year.
            # Weekly steps, not daily: geolocator positions jitter by ~200 km a day, which
            # summed daily gave a shrike 83,035 km a year (seen 2026-09-28).
            # Even weekly the jitter added up (shrike: 31,402 km). Stay to stay, round the
            # year, is robust and a true minimum, so the copy can say "at least".
            yearly = sum(hops)
            far = max((km(tab[d][:2], tab[e][:2]) for d in range(0, 366, 7) for e in range(0, 366, 7) if tab[d] and tab[e]), default=0)
            entry["animals"].append({
                "id": a["id"], "name": name_of(a), "live": a["live"], "lastFix": a["lastFix"],
                # Sex, tracking dates and hatch year (pipeline/build_individuals.py).
                "individual": individuals.get(a["id"], {}),
                "lastPosition": [a["lastPosition"][1], a["lastPosition"][0]] if a["live"] else None,
                "coarsen": a["coarsenDegrees"],
                "credit": {"source": study.get("source"), "pi": study.get("pi", ""), "license": study["license"],
                           "study": study["name"], "doi": study.get("doi", "")},
                "track": track, "place": day_place, "stays": stays,
                "facts": {"yearKmMin": round(yearly), "spanKm": round(far),
                          "southmost": min(t[0] for t in tab if t), "northmost": max(t[0] for t in tab if t)}})
            stats["animals"] += 1
            stats["live"] += a["live"]
        out["species"].append(entry)
        stats["species"] += 1
    os.makedirs(os.path.join(ROOT, "worker", "data"), exist_ok=True)
    p = os.path.join(ROOT, "worker", "data", "featured.json")
    json.dump(out, open(p, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
    print(dict(stats), "places", len(places), "bytes", os.path.getsize(p))


if __name__ == "__main__":
    main()
