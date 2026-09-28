#!/usr/bin/env python3
"""Build the selectable animal catalog and the "usually" day-of-year tables.

Decision S2 (docs/DECISIONS.md). Run locally; needs MOVEBANK_USERNAME and
MOVEBANK_PASSWORD in the environment (never commit them). Output:

  data/catalog.json          species, studies (license, citation), animals
  data/usual/<study_id>.json per animal: 366 day-of-year positions [lat, lon, year]

Sources (re-check before relying on them, see docs/SOURCES.md):
  Movebank REST API (direct-read), daily reduced events (EURING_01)
  AVONET (Tobias et al. 2022, CC BY 4.0) for bird migration status
  pipeline/nonbird_migrants.json for non-birds (curated, to verify in R8)
  GBIF species API for provisional en/de common names and IUCN category

Movebank allows one concurrent request per IP: this script is strictly
sequential. Downloads are cached in pipeline/.cache (git-ignored).
"""
import csv, datetime as dt, hashlib, html, io, json, math, os, re, sys, time
import urllib.parse, urllib.request, base64
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "pipeline", ".cache")
MB = "https://www.movebank.org/movebank/service/direct-read"
AVONET_URL = "https://ndownloader.figshare.com/files/34480856"
NOW = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
LIVE_DAYS = 14          # R21: newer than this counts as live
MIN_SPAN_DAYS = 330     # reference-data prefilter for a full annual cycle
MIN_DOY_COVER = 240     # days of year with a position after gap filling (sweep 2026-09-28: 54 sparse animals kept 19 at 240, 4 at 330)
MAX_GAP = 7             # days interpolated across while moving
HOLD_DAYS, HOLD_KM = 150, 300  # stationary: hold position across a gap (geolocator error ~200 km)
ROUTE_DAYS = 21         # longer moving gaps: straight-line route estimate
csv.field_size_limit(10**9)
os.makedirs(CACHE, exist_ok=True)


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def http(url, auth=False, raw=False, tries=5):
    req = urllib.request.Request(url)
    if auth:
        tok = base64.b64encode(f"{os.environ['MOVEBANK_USERNAME']}:{os.environ['MOVEBANK_PASSWORD']}".encode()).decode()
        req.add_header("Authorization", "Basic " + tok)
    for t in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                body = r.read()
                if r.headers.get("accept-license", "").lower() == "true":
                    raise PermissionError("license terms not accepted")
                return body if raw else body.decode("utf-8", "replace")
        except PermissionError:
            raise
        except Exception as e:
            if t == tries - 1:
                raise
            time.sleep(3 * (t + 1))


def cached(name, fetch):
    p = os.path.join(CACHE, name)
    if os.path.exists(p):
        return open(p, encoding="utf-8").read()
    body = fetch()
    open(p, "w", encoding="utf-8").write(body)
    return body


def mb_csv(params, cache_name):
    url = MB + "?" + urllib.parse.urlencode(params)
    return list(csv.DictReader(io.StringIO(cached(cache_name, lambda: http(url, auth=True)))))


def coord(la, lo):
    """Parsed (lat, lon), or None if missing, NaN or out of range (seen: literal NaN, 2026-09-28)."""
    try:
        la, lo = float(la), float(lo)
    except (TypeError, ValueError):
        return None
    if not (math.isfinite(la) and math.isfinite(lo) and -90 <= la <= 90 and -180 <= lo <= 180):
        return None
    return la, lo


def ts(s):
    try:
        return dt.datetime.fromisoformat(s[:19])
    except Exception:
        return None


def clean(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(html.unescape(s or "")))).strip()


# ---------- migratory classification ----------

def avonet_migration():
    p = os.path.join(CACHE, "avonet_migration.json")
    if os.path.exists(p):
        return json.load(open(p))
    import openpyxl  # pip install openpyxl
    x = os.path.join(CACHE, "avonet.xlsx")
    if not os.path.exists(x):
        open(x, "wb").write(http(AVONET_URL, raw=True))
    wb = openpyxl.load_workbook(x, read_only=True)
    m = {}
    for sheet, col in [("AVONET1_BirdLife", "Species1"), ("AVONET2_eBird", "Species2"), ("AVONET3_BirdTree", "Species3")]:
        it = wb[sheet].iter_rows(values_only=True)
        h = next(it)
        i, j = h.index(col), h.index("Migration")
        for r in it:
            if r[i] and str(r[j]).strip() in ("1", "2", "3", "1.0", "2.0", "3.0"):
                m.setdefault(r[i], int(float(r[j])))
    json.dump(m, open(p, "w"))
    return m


def classify(taxon, avonet, nonbird):
    """Return (status, source) or None if not migratory."""
    if taxon in nonbird:
        return nonbird[taxon]["status"], "curated (verify, R8)"
    if taxon in avonet:
        v = avonet[taxon]
        return ({3: "migratory", 2: "partial"}.get(v), "AVONET") if v in (2, 3) else None
    return None


# ---------- GBIF names and IUCN ----------

def gbif(url):
    for t in range(6):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return json.load(r)
        except Exception:
            time.sleep(2 ** t)
    return {}


def species_info(taxon):
    def fetch():
        k = gbif("https://api.gbif.org/v1/species/match?" + urllib.parse.urlencode({"name": taxon})).get("usageKey")
        out = {"gbifKey": k, "names": {}, "iucn": None}
        if k:
            v = gbif(f"https://api.gbif.org/v1/species/{k}/vernacularNames?limit=500").get("results", [])
            for lang, code in (("en", "eng"), ("de", "deu")):
                c = Counter(x["vernacularName"].strip() for x in v if x.get("language") == code
                            and not re.fullmatch(r"[A-Z]{2,5}", x["vernacularName"].strip()))
                if c:
                    out["names"][lang] = c.most_common(1)[0][0]
            out["iucn"] = gbif(f"https://api.gbif.org/v1/species/{k}/iucnRedListCategory").get("code")
        return json.dumps(out)
    return json.loads(cached("gbif_" + re.sub(r"\W", "_", taxon) + ".json", fetch))


def coarsen_for(iucn):
    # R14: VU or worse -> 1 degree, NT -> 0.1 degree, else 0.01 degree
    return {"CR": 1.0, "EN": 1.0, "VU": 1.0, "NT": 0.1}.get(iucn, 0.01)


def rnd(x, step):
    return round(round(x / step) * step, 2)


# ---------- day-of-year table ----------

def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 12742 * math.asin(min(1, math.sqrt(h)))


def lerp(a, b, f):
    lo_a, lo_b = a[1], b[1]
    if abs(lo_b - lo_a) > 180:  # antimeridian
        lo_b += 360 if lo_b < lo_a else -360
    return a[0] + f * (b[0] - a[0]), (lo_a + f * (lo_b - lo_a) + 180) % 360 - 180


def doy_table(fixes):
    """fixes: (datetime, lat, lon). One position per calendar day (first fix),
    gaps filled on the real timeline, then mapped to day of year taking the
    most recent year. Entry: [lat, lon, year, quality] with quality
    f = fix that day, i = interpolated (gap <= MAX_GAP days),
    s = stationary hold (gap <= HOLD_DAYS, ends within HOLD_KM),
    r = route estimate (gap <= ROUTE_DAYS, straight line). Else None."""
    daily = {}
    for t, la, lo in sorted(fixes):
        daily.setdefault(t.date(), (la, lo))
    days = sorted(daily)
    line = {d: (*daily[d], "f") for d in days}
    for d0, d1 in zip(days, days[1:]):
        gap = (d1 - d0).days
        if gap <= 1:
            continue
        a, b = daily[d0], daily[d1]
        dist = km(a, b)
        if gap <= MAX_GAP:
            q = "i"
        elif gap <= HOLD_DAYS and dist <= HOLD_KM:
            q = "s"
        elif gap <= ROUTE_DAYS:
            q = "r"
        else:
            continue
        for k in range(1, gap):
            f = k / gap
            pos = (a if f < 0.5 else b) if q == "s" else lerp(a, b, f)
            line[d0 + dt.timedelta(days=k)] = (pos[0], pos[1], q)
    # wrap: track ends near where it started (e.g. breeding site) -> hold across the unseen part of the year
    first, lastd = days[0], days[-1]
    wrap = (first - lastd).days % 365 if days else 0
    if days and (lastd - first).days < 365 and 1 < wrap <= HOLD_DAYS and km(daily[first], daily[lastd]) <= HOLD_KM:
        for k in range(1, wrap):
            dd = lastd + dt.timedelta(days=k)
            line.setdefault(dd, (*(daily[lastd] if k < wrap / 2 else daily[first]), "s"))
    tab = [None] * 366
    for d in sorted(line):  # later years overwrite earlier ones
        la, lo, q = line[d]
        tab[d.timetuple().tm_yday - 1] = (la, lo, d.year, q)
    if tab[365] is None:  # 31 Dec in non-leap years sits at index 364
        tab[365] = tab[364]
    return tab, sum(1 for x in tab if x)



# ---------- Movebank Data Repository stage ----------

DR = "https://datarepository.movebank.org/server/api"
DR_MAX_BYTES = 400_000_000  # skip larger event files (recorded in stats)


def dr_json(url):
    return json.loads(http(url))


def dr_stage(avonet, nonbird, covered_study_ids):
    """Returns (species, studies, animals, usual_by_pkg, stats) from CC0/CC BY
    packages whose Movebank study is not already covered by the API stage."""
    p = os.path.join(CACHE, "dr_stage.json")
    if os.path.exists(p):
        return json.load(open(p))
    res = {"species": {}, "studies": {}, "animals": [], "usual": {}, "stats": Counter()}
    page = 0
    while True:
        objs = dr_json(f"{DR}/discover/search/objects?dsoType=ITEM&size=100&page={page}")["_embedded"]["searchResult"]["_embedded"]["objects"]
        if not objs:
            break
        page += 1
        for o in objs:
            it = o["_embedded"]["indexableObject"]
            md = {k: [x["value"] for x in v] for k, v in it["metadata"].items()}
            if "dc.title" not in md:
                continue
            lic = (md.get("dc.rights") or ["?"])[0]
            if lic not in ("CC0 1.0 Universal", "Attribution 4.0 International"):
                res["stats"]["pkg_not_cc0_ccby"] += 1
                continue
            study = (md.get("mdr.study.id") or [""])[0]
            if study and study in covered_study_ids:
                res["stats"]["pkg_covered_by_api"] += 1
                continue
            if not any(classify(t, avonet, nonbird) for t in md.get("dwc.ScientificName", [])):
                res["stats"]["pkg_no_migratory_taxon"] += 1
                continue
            bundles = dr_json(f"{DR}/core/items/{it['uuid']}/bundles")["_embedded"]["bundles"]
            files = []
            for bd in bundles:
                if bd["name"] == "ORIGINAL":
                    files += dr_json(bd["_links"]["bitstreams"]["href"])["_embedded"]["bitstreams"]
            evf = [f for f in files if f["name"].lower().endswith(".csv") and "reference" not in f["name"].lower()
                   and "accessory" not in f["name"].lower()]
            fixes, taxon_of = defaultdict(list), {}
            for f in evf:
                if f["sizeBytes"] > DR_MAX_BYTES:
                    res["stats"]["file_too_large"] += 1
                    continue
                for attempt in range(4):
                    part, part_tax = defaultdict(list), {}
                    try:
                        with urllib.request.urlopen(f["_links"]["content"]["href"], timeout=600) as r:
                            rd = csv.DictReader(io.TextIOWrapper(r, encoding="utf-8", errors="replace", newline=""))
                            if rd.fieldnames and "location-lat" in rd.fieldnames:
                                seen = set()
                                for row in rd:
                                    a = row.get("individual-local-identifier")
                                    t = ts(row.get("timestamp", ""))
                                    c = coord(row.get("location-lat"), row.get("location-long"))
                                    if not a or not t or not c or row.get("visible", "true") == "false":
                                        continue
                                    if (a, t.date()) in seen:
                                        continue
                                    seen.add((a, t.date()))
                                    part[a].append((t, *c))
                                    part_tax[a] = (row.get("individual-taxon-canonical-name") or "").strip()
                        for a, v in part.items():
                            fixes[a] += v
                        taxon_of.update(part_tax)
                        break
                    except Exception as e:
                        if attempt == 3:
                            log("dr file failed", f["name"], e)
                            res["stats"]["file_failed"] += 1
                        time.sleep(5 * (attempt + 1))
            out = {}
            pkg = it["uuid"]
            for a, fx in fixes.items():
                taxon = taxon_of.get(a) or ((md.get("dwc.ScientificName") or [""])[0])
                c = classify(taxon, avonet, nonbird)
                if not c:
                    continue
                tab, cover = doy_table(fx)
                if cover < MIN_DOY_COVER:
                    res["stats"]["animal_cover_too_low"] += 1
                    continue
                if taxon not in res["species"]:
                    info = species_info(taxon)
                    res["species"][taxon] = {"names": info["names"], "namesSource": "GBIF vernacular names, provisional (R8)",
                                             "iucn": info["iucn"], "migration": c[0], "migrationSource": c[1]}
                step = coarsen_for(res["species"][taxon]["iucn"])
                aid = f"dr-{pkg[:8]}-{re.sub(r'[^A-Za-z0-9]+', '_', a)}"
                out[aid] = [[rnd(x[0], step), rnd(x[1], step), x[2], x[3]] if x else None for x in tab]
                last = max(fx)[0]
                res["animals"].append({"id": aid, "taxon": taxon, "studyId": "dr-" + pkg, "individualId": a, "label": a,
                                       "years": sorted({f[0].year for f in fx}), "doyCovered": cover,
                                       "lastFix": last.strftime("%Y-%m-%d"), "live": False, "lastPosition": None,
                                       "coarsenDegrees": step})
                res["stats"]["animal_usual"] += 1
            if out:
                res["studies"]["dr-" + pkg] = {"name": md["dc.title"][0], "license": "CC_0" if lic.startswith("CC0") else "CC_BY",
                                               "citation": (md.get("dc.identifier.citation") or md.get("dc.title"))[0],
                                               "doi": (md.get("dc.identifier.doi") or [""])[0],
                                               "source": "Movebank Data Repository"}
                res["usual"]["dr-" + pkg] = out
            log("dr pkg", page, md["dc.title"][0][:60], "animals kept", len(out))
    res["stats"] = dict(res["stats"])
    json.dump(res, open(p, "w"))
    return res

# ---------- main ----------

def main():
    avonet = avonet_migration()
    nonbird = json.load(open(os.path.join(ROOT, "pipeline", "nonbird_migrants.json")))["species"]
    studies = mb_csv({"entity_type": "study", "i_have_download_access": "true",
                      "attributes": "id,name,citation,license_type,is_test,suspend_license_terms,taxon_ids,timestamp_last_deployed_location,principal_investigator_name"},
                     "studies.csv")
    studies = [s for s in studies if s["license_type"] in ("CC_0", "CC_BY") and s["is_test"] != "true"]
    log("eligible studies", len(studies))
    catalog = {"generated": NOW.strftime("%Y-%m-%dT%H:%MZ"), "rules": {
        "liveDays": LIVE_DAYS, "minDoyCover": MIN_DOY_COVER, "maxGapDays": MAX_GAP, "holdDays": HOLD_DAYS, "holdKm": HOLD_KM, "routeDays": ROUTE_DAYS,
        "usual": "position on this day of year from the animal's most recent tracked year; not a forecast"},
        "species": {}, "studies": {}, "animals": []}
    stats = Counter()
    os.makedirs(os.path.join(ROOT, "data", "usual"), exist_ok=True)
    for n, s in enumerate(studies):
        taxa = [t.strip() for t in s["taxon_ids"].split(",") if t.strip()]
        mig = {t: classify(t, avonet, nonbird) for t in taxa}
        if not any(mig.values()):
            stats["study_no_migratory_taxon"] += 1
            continue
        sid = s["id"]
        try:
            ind = mb_csv({"entity_type": "individual", "study_id": sid,
                          "attributes": "id,local_identifier,nick_name,taxon_canonical_name,timestamp_start,timestamp_end,mortality_date,death_comments"},
                         f"ind2_{sid}.csv")
        except PermissionError:
            stats["study_terms_not_accepted"] += 1
            continue
        cand = {}
        for i in ind:
            t = (i["taxon_canonical_name"] or "").strip()
            c = classify(t, avonet, nonbird)
            a, b = ts(i["timestamp_start"]), ts(i["timestamp_end"])
            if not c or not a or not b or b > NOW + dt.timedelta(days=2):
                continue
            if (b - a).days >= MIN_SPAN_DAYS:
                cand[i["id"]] = (i, t, c)
        if not cand:
            stats["study_no_full_cycle_animal"] += 1
            continue
        try:
            ev = mb_csv({"entity_type": "event", "study_id": sid, "event_reduction_profile": "EURING_01"},
                        f"ev_daily_{sid}.csv")
        except Exception as e:
            log("events failed", sid, e)
            stats["study_events_failed"] += 1
            continue
        by_local = {v[0]["local_identifier"]: k for k, v in cand.items() if v[0]["local_identifier"]}
        # Movebank mortality_date: fixes from that day on are not the living animal (seen 2026-09-28:
        # two dead red kites' tags reporting from Bhutan, a year after death)
        died = {k: ts(v[0]["mortality_date"]) for k, v in cand.items() if ts(v[0].get("mortality_date") or "")}
        fixes = defaultdict(list)
        for e in ev:
            # EURING_01 rows carry individual_local_identifier, not individual_id (checked 2026-09-28);
            # rows from tags not deployed on an animal have it empty and are dropped here
            iid = by_local.get(e.get("individual_local_identifier") or "")
            c = coord(e.get("location_lat"), e.get("location_long"))
            if iid in cand and c and e.get("visible", "true") != "false":
                t = ts(e["timestamp"])
                if t and t <= NOW and (iid not in died or t < died[iid]):
                    fixes[iid].append((t, *c))
        out = {}
        for iid, (i, taxon, (status, src)) in cand.items():
            tab, cover = doy_table(fixes.get(iid, []))
            if cover < MIN_DOY_COVER:
                stats["animal_cover_too_low"] += 1
                continue
            sp = catalog["species"].get(taxon)
            if not sp:
                info = species_info(taxon)
                sp = catalog["species"][taxon] = {"names": info["names"], "namesSource": "GBIF vernacular names, provisional (R8)",
                                                  "iucn": info["iucn"], "migration": status, "migrationSource": src}
            step = coarsen_for(sp["iucn"])
            last = max(fixes[iid])[0]
            lastfix = max(fixes[iid])
            live = (NOW - last).days <= LIVE_DAYS and iid not in died
            aid = f"mb-{sid}-{iid}"
            out[aid] = [[rnd(x[0], step), rnd(x[1], step), x[2], x[3]] if x else None for x in tab]
            catalog["animals"].append({
                "id": aid, "taxon": taxon, "studyId": sid, "individualId": iid,
                "label": (i["nick_name"] or i["local_identifier"] or "").strip(),
                "years": sorted({f[0].year for f in fixes[iid]}), "doyCovered": cover,
                "lastFix": last.strftime("%Y-%m-%d"), "live": live,
                "lastPosition": [rnd(lastfix[1], step), rnd(lastfix[2], step)] if live else None,
                "coarsenDegrees": step})
            stats["animal_live" if live else "animal_usual"] += 1
        if out:
            catalog["studies"][sid] = {"name": s["name"], "license": s["license_type"], "citation": clean(s["citation"]),
                                       "pi": s["principal_investigator_name"], "source": "Movebank REST API"}
            json.dump({"studyId": sid, "doy": "index 0 = 1 Jan ... 365; entry [lat, lon, year, quality f/i/s/r], see pipeline/build_catalog.py", "animals": out},
                      open(os.path.join(ROOT, "data", "usual", f"{sid}.json"), "w"), separators=(",", ":"))
        if n % 20 == 0:
            log(n, len(studies), dict(stats))
    covered = {s["id"] for s in studies}
    d = dr_stage(avonet, nonbird, covered)
    for k, v in d["species"].items():
        catalog["species"].setdefault(k, v)
    catalog["studies"].update(d["studies"])
    catalog["animals"] += d["animals"]
    for sid, out in d["usual"].items():
        json.dump({"studyId": sid, "doy": "index 0 = 1 Jan ... 365; entry [lat, lon, year, quality f/i/s/r], see pipeline/build_catalog.py",
                   "animals": out}, open(os.path.join(ROOT, "data", "usual", f"{sid}.json"), "w"), separators=(",", ":"))
    for k, v in d["stats"].items():
        stats["dr_" + k] += v
    # de-duplicate: the same animal published in several studies gives an identical table (seen: shrike 13813 x3)
    tables = {}
    for f in os.listdir(os.path.join(ROOT, "data", "usual")):
        tables.update({k: (f, v) for k, v in json.load(open(os.path.join(ROOT, "data", "usual", f)))["animals"].items()})
    seen, drop = {}, set()
    for a in sorted(catalog["animals"], key=lambda a: (not a["live"], -a["doyCovered"], a["id"])):
        sig = (a["taxon"], hashlib.sha1(json.dumps(tables[a["id"]][1]).encode()).hexdigest())
        if sig in seen:
            drop.add(a["id"])
        else:
            seen[sig] = a["id"]
    if drop:
        catalog["animals"] = [a for a in catalog["animals"] if a["id"] not in drop]
        by_file = defaultdict(list)
        for aid in drop:
            by_file[tables[aid][0]].append(aid)
        for f, ids in by_file.items():
            p = os.path.join(ROOT, "data", "usual", f)
            d = json.load(open(p))
            for aid in ids:
                d["animals"].pop(aid, None)
            if d["animals"]:
                json.dump(d, open(p, "w"), separators=(",", ":"))
            else:
                os.remove(p)
        stats["animal_duplicate_dropped"] = len(drop)
    catalog["studies"] = {k: v for k, v in catalog["studies"].items() if any(a["studyId"] == k for a in catalog["animals"])}
    catalog["stats"] = dict(stats)
    json.dump(catalog, open(os.path.join(ROOT, "data", "catalog.json"), "w"), indent=1, ensure_ascii=False)
    log("done", dict(stats), "species", len(catalog["species"]))


if __name__ == "__main__":
    if sys.argv[1:] == ["dr-only"]:  # warm the DR cache without touching Movebank
        with open(os.path.join(CACHE, "studies.csv"), encoding="utf-8") as f:
            ids = {r["id"] for r in csv.DictReader(f) if r["license_type"] in ("CC_0", "CC_BY") and r["is_test"] != "true"}
        r = dr_stage(avonet_migration(), json.load(open(os.path.join(ROOT, "pipeline", "nonbird_migrants.json")))["species"], ids)
        log("dr stage", r["stats"], "animals", len(r["animals"]))
    else:
        main()
