#!/usr/bin/env python3
"""Write data/studies.json, the study whitelist (R4), for the Movebank studies
behind the featured animals, and copy it into the Worker bundle for the R5
check in the cron.

Movebank Data Repository packages are not listed: they are DOI-published and
their license cannot change, so there is nothing for R5 to re-check. Their
citation and license travel in data/catalog.json.
"""
import csv, hashlib, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMPTY_SHA = hashlib.sha256(b"").hexdigest()


def person(name):
    """'JIGUET Frédéric' -> 'Frédéric Jiguet', as worker/src/view.js does for the screen."""
    import re
    m = re.match(r"^([A-ZÀ-Þ][A-ZÀ-Þ'\-]+)\s+(.+)$", (name or "").strip())
    if m and m.group(2) != m.group(2).upper():
        return f"{m.group(2)} {m.group(1)[0]}{m.group(1)[1:].lower()}"
    return (name or "").strip()


def main():
    cat = json.load(open(os.path.join(ROOT, "data", "catalog.json"), encoding="utf-8"))
    feat = json.load(open(os.path.join(ROOT, "worker", "data", "featured.json"), encoding="utf-8"))
    acc = {r["study_id"]: r for r in csv.DictReader(open(os.path.join(ROOT, "docs", "survey", "acceptance", "2026-09-28_acceptance-log.csv"), encoding="utf-8"))}
    studies = {}
    for sp in feat["species"]:
        for a in sp["animals"]:
            if not a["id"].startswith("mb-"):
                continue
            _, sid, iid = a["id"].split("-", 2)
            st = cat["studies"][sid]
            e = studies.setdefault(sid, {
                "studyId": int(sid),
                "licenseType": st["license"],
                "licenseTermsHash": acc[sid]["terms_sha256"] if sid in acc else EMPTY_SHA,
                "citation": st["citation"] or f'{st["name"]}. Movebank study {sid}, https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study{sid}',
                "citationShort": f'Data: Movebank, {person(st.get("pi")) or st["name"]}, {"CC0" if st["license"] == "CC_0" else "CC BY"}',
                "ownerContact": person(st.get("pi")),
                "dateAccepted": "2026-09-28",
                "animals": []})
            fallback = {k: f'{sp["names"].get(k) or sp["names"]["en"]} {iid}' for k in ("en", "de")}
            e["animals"].append({"individualId": int(iid),
                                 "displayName": {k: a["name"] or fallback[k] for k in ("en", "de")}})
    out = {"$schema": "./studies.schema.json", "studies": sorted(studies.values(), key=lambda s: s["studyId"])}
    for p in (os.path.join(ROOT, "data", "studies.json"), os.path.join(ROOT, "worker", "data", "studies.json")):
        json.dump(out, open(p, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print(len(out["studies"]), "studies,", sum(len(s["animals"]) for s in out["studies"]), "animals")


if __name__ == "__main__":
    main()
