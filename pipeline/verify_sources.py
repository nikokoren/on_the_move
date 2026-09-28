#!/usr/bin/env python3
"""Re-fetch every source in pipeline/species_curated.json and confirm the quoted
sentence is still on the page (working method rule 3: the web wins).

    python3 pipeline/verify_sources.py

Web pages are compared as plain text; papers via their Europe PMC abstract
(publishers' pages block scripts). Exit code 1 if any quote is missing.
"""
import html, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get(url):
    for t in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            return urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
        except Exception as e:
            err = e
            time.sleep(3 * (t + 1))
    raise err


def text(url, epmc=None):
    if epmc:
        j = json.loads(get("https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&query=" + urllib.parse.quote(epmc)))
        r = j["resultList"]["result"]
        return (r[0].get("title", "") + " " + r[0].get("abstractText", "")) if r else ""
    b = re.sub(r"(?s)<(script|style)[^>]*>.*?</\1>", " ", get(url))
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", b)))


def norm(s):
    return re.sub(r"\s+", " ", s.replace("’", "'")).strip().lower()


def main():
    cur = json.load(open(os.path.join(ROOT, "pipeline", "species_curated.json"), encoding="utf-8"))["species"]
    bad = 0
    for taxon, s in cur.items():
        src = s["fact"]["source"]
        try:
            found = norm(src["quote"]) in norm(text(src["url"], src.get("europepmc")))
        except Exception as e:
            found, why = False, str(e)[:60]
        print(("ok  " if found else "MISS") + f" {taxon:26} {src['title'][:60]}")
        bad += not found
    print(f"\n{len(cur) - bad}/{len(cur)} quotes found")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
