#!/usr/bin/env python3
"""Check a fact draft for one language (docs/FACT_STYLE.md, decision R8f).

    python3 pipeline/check_fact_draft.py DRAFT.json [--cache DIR]

DRAFT.json: {"lang": "en"|"de",
             "species": {taxon: {"short": [fact, ...], "long": [fact, ...]}},
             "individual": {"templates": {key: text}, "notes": {animal id: {"short": text, "long": text}}},
             "report": "..."}
fact: {"id": "...", "text": "...", "source": {"title", "url", "quote": str | [str],
       optional "europepmc": "DOI:...", "pdf": true}}

Checks: every taxon of pipeline/species_curated.json present; ids unique; short
facts up to 90 characters and long up to 140 (units rendered metric); {metric|imperial}
well formed; every quote found verbatim on its source page (same text extraction as
verify_sources.py). Pages are cached in --cache (default .fact-cache next to the draft).
Exit code 1 on any failure.
"""
import hashlib, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import verify_sources as vs

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIMIT = {"short": 90, "long": 140}
TEMPLATE_KEYS = ["yearKm", "span", "travelDays", "female", "male", "trackedSince", "trackedFromTo", "hatched", "hatchedBy"]


def plain(s):
    return re.sub(r"\{([^|}]*)\|[^}]*\}", r"\1", s)


def main():
    path = sys.argv[1]
    cache = sys.argv[sys.argv.index("--cache") + 1] if "--cache" in sys.argv else os.path.join(os.path.dirname(os.path.abspath(path)), ".fact-cache")
    os.makedirs(cache, exist_ok=True)
    d = json.load(open(path, encoding="utf-8"))
    taxa = json.load(open(os.path.join(ROOT, "pipeline", "species_curated.json"), encoding="utf-8"))["species"]
    errs, ids, counts = [], set(), {}

    def page(src):
        key = hashlib.md5((src["url"] + "|" + src.get("europepmc", "")).encode()).hexdigest()
        p = os.path.join(cache, key + ".txt")
        if not os.path.exists(p):
            open(p, "w", encoding="utf-8").write(vs.text(src["url"], src.get("europepmc"), src.get("pdf", False)))
        return vs.norm(open(p, encoding="utf-8").read())

    for t in taxa:
        sp = d.get("species", {}).get(t)
        if not sp:
            errs.append(f"{t}: missing")
            continue
        counts[t] = (len(sp.get("short", [])), len(sp.get("long", [])))
        for kind in ("short", "long"):
            for f in sp.get(kind, []):
                fid = f.get("id", "?")
                if fid in ids:
                    errs.append(f"{fid}: duplicate id")
                ids.add(fid)
                n = len(plain(f["text"]))
                if n > LIMIT[kind]:
                    errs.append(f"{fid}: {kind} is {n} characters (limit {LIMIT[kind]})")
                if re.search(r"\{[^}|]*\}", f["text"]):
                    errs.append(f"{fid}: unit braces without |")
                try:
                    text = page(f["source"])
                except Exception as e:
                    errs.append(f"{fid}: source not fetched ({e})")
                    continue
                for q in vs.quotes(f["source"]):
                    if vs.norm(q) not in text:
                        errs.append(f"{fid}: quote not found: {q[:80]!r}")
    ind = d.get("individual", {})
    for k in TEMPLATE_KEYS:
        if not ind.get("templates", {}).get(k):
            errs.append(f"individual template missing: {k}")
    notes = json.load(open(os.path.join(ROOT, "pipeline", "individuals_curated.json"), encoding="utf-8"))["animals"]
    for aid in notes:
        n = ind.get("notes", {}).get(aid)
        if not n:
            errs.append(f"note missing: {aid}")
            continue
        for kind in ("short", "long"):
            if n.get(kind) and len(plain(n[kind])) > LIMIT[kind]:
                errs.append(f"note {aid} {kind} too long")
    for t, (s, l) in counts.items():
        print(f"{t:28} short {s:2}  long {l:2}")
    print(f"{sum(s for s, _ in counts.values())} short, {sum(l for _, l in counts.values())} long; {len(errs)} problems")
    for e in errs:
        print("  -", e)
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
