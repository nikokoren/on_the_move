#!/usr/bin/env python3
"""Facts about the individual animal (owner, 2026-09-29): sex, when tracking
started (and ended, for tracks that are over) and hatch year, from Movebank's
individual records for the featured animals. Nothing else is kept: the owner
found the other fields dull, and hatch and capture coordinates must never reach
the screen (R14). Free-text comments are a separate, hand-curated to-do.

Writes pipeline/individuals.json, which build_featured.py merges in. Needs
Movebank credentials in the environment; answers cached in pipeline/.cache.
Data Repository animals have no individual record here and get none.
"""
import csv, io, json, os
import build_catalog as bc

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    feat = json.load(open(os.path.join(ROOT, "worker", "data", "featured.json"), encoding="utf-8"))
    ids = [a["id"] for s in feat["species"] for a in s["animals"] if a["id"].startswith("mb-")]
    out = {}
    for sid in sorted({i.split("-")[1] for i in ids}):
        rows = list(csv.DictReader(io.StringIO(bc.cached(f"individuals_{sid}.csv",
                    lambda: bc.http(bc.MB + f"?entity_type=individual&study_id={sid}", auth=True)))))
        by = {r["id"]: r for r in rows}
        for aid in ids:
            if aid.split("-")[1] != sid or aid.split("-")[2] not in by:
                continue
            r = by[aid.split("-")[2]]
            rec = {}
            if r.get("sex") in ("m", "f"):
                rec["sex"] = r["sex"]
            if r.get("timestamp_start"):
                rec["trackedFrom"] = r["timestamp_start"][:7]
            if r.get("timestamp_end"):
                rec["trackedTo"] = r["timestamp_end"][:7]
            # latest_date_born is an upper bound: exact only when it matches the
            # earliest bound or the animal was tagged in its hatch year (a chick,
            # like Kiki); otherwise "hatched in 2020 or earlier" (an adult).
            latest, earliest = r.get("latest_date_born"), r.get("earliest_date_born")
            if latest or earliest:
                y = int((latest or earliest)[:4])
                rec["hatchYear"] = y
                rec["hatchExact"] = bool(earliest and latest and earliest[:4] == latest[:4]) or \
                    (rec.get("trackedFrom", "")[:4] == str(y))
            out[aid] = rec
    json.dump({"about": "Individual facts for the featured animals, from Movebank individual records (sex, timestamp_start/end, latest_date_born). Built by pipeline/build_individuals.py.",
               "animals": out}, open(os.path.join(ROOT, "pipeline", "individuals.json"), "w", encoding="utf-8"), indent=1)
    n = lambda k: sum(1 for v in out.values() if k in v)
    print(len(out), "animals;", n("sex"), "with sex,", n("trackedFrom"), "with tracking dates,", n("hatchYear"), "with hatch year")


if __name__ == "__main__":
    main()
