#!/usr/bin/env python3
"""Re-fetch every source in pipeline/species_curated.json and confirm the quoted
sentence is still on the page (working method rule 3: the web wins).

    python3 pipeline/verify_sources.py

Web pages are compared as plain text; papers via their Europe PMC abstract
(publishers' pages block scripts); PDFs (source "pdf": true) via pypdf. Each
URL is fetched once. Exit code 1 if any quote is missing.
"""
import html, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get(url, raw=False):
    for t in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            body = urllib.request.urlopen(req, timeout=60).read()
            return body if raw else body.decode("utf-8", "replace")
        except Exception as e:
            err = e
            time.sleep(3 * (t + 1))
    raise err


def text(url, epmc=None, pdf=False):
    if pdf:
        import io, pypdf
        pages = pypdf.PdfReader(io.BytesIO(get(url, raw=True))).pages
        return re.sub(r"\s+", " ", " ".join(p.extract_text() or "" for p in pages))
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
    pages, bad, total = {}, 0, 0
    for taxon, s in cur.items():
        for fact in s["facts"]:
            src = fact["source"]
            total += 1
            try:
                if src["url"] not in pages:
                    pages[src["url"]] = norm(text(src["url"], src.get("europepmc"), src.get("pdf", False)))
                found, why = norm(src["quote"]) in pages[src["url"]], ""
            except Exception as e:
                found, why = False, " (" + str(e)[:60] + ")"
            print(("ok  " if found else "MISS") + f" {taxon:26} {src['title'][:40]:40} {src['quote'][:50]}{why}")
            bad += not found
    print(f"\n{total - bad}/{total} quotes found ({len(pages)} pages)")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
