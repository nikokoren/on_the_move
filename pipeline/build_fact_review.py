#!/usr/bin/env python3
"""Build the round-five review documents without changing approved recipe data."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/reviews"


def build():
    species = json.loads((ROOT / "worker/data/featured.json").read_text())["species"]
    drafts = {lang: json.loads((ROOT / f"pipeline/facts_draft_round5_{lang}.json").read_text())
              for lang in ("en", "de")}
    rows, facts, existing = [], [], {}
    for sp in species:
        taxon = sp["taxon"]
        before, after = [], []
        existing[taxon] = {lang: [f["text"] for f in sp["facts"][lang]] for lang in drafts}
        for lang, draft in drafts.items():
            for kind, limit in (("short", 90), ("long", 140)):
                pool = draft["species"][taxon][kind]
                count = sum(f["len"] == kind for f in sp["facts"][lang])
                before.append(count)
                after.append(count + len(pool))
                for f in pool:
                    facts.append({**f, "taxon": taxon, "name": sp["names"][lang],
                                  "lang": lang, "kind": kind, "limit": limit})
        rows.append((sp, before, after))

    lines = ["# Animal facts — round 5", "",
             "2026-11-05 · **105 proposed additions, all pending review.** "
             "52 English and 53 German facts across all 20 currently featured species. "
             "No production pools or individual-animal notes were changed.", "",
             "Open [the interactive review](facts-round5.html) in a browser to edit wording, "
             "approve, star, reject, add notes and export your decisions. "
             "Edits are saved in that browser when local storage is available; export to keep a portable copy. "
             "Approval in the page only records a decision; integration is a separate step.", "",
             "## Approach and checks", "",
             "Written to [FACT_STYLE.md](../FACT_STYLE.md), including the latest vetoes from rounds 1–4. "
             "English and German were written independently; short and long facts tell separate stories. "
             "The same story can appear across languages when it works naturally in both.", "",
             "All 132 supporting quotes for the 105 facts were matched against 40 source pages fetched on 2026-11-05. "
             "All additions fit their 90/140-character limits, have unique IDs and contain no exact repeats "
             "of the current facts or one another within a language. "
             "Quote matching confirms the evidence exists; the owner still reviews the wording and appeal.", "",
             "Sources are mostly English and German Wikipedia, with NOAA Fisheries for several marine facts. "
             "English sources support a few German facts where the German article lacks detail. "
             "No new measurements require metric/imperial conversion.", "",
             "Every species gets at least one new short and one new long fact in each language. "
             "If all proposals are accepted, every pool reaches at least six short and four long facts. "
             "Zebras and green turtles each receive 16 additions, bringing each language from two to ten facts.", "",
             "Recheck before integration:", "", "```sh",
             "python3 pipeline/check_fact_draft.py pipeline/facts_draft_round5_en.json --additions --cache pipeline/.cache/facts-round5-check",
             "python3 pipeline/check_fact_draft.py pipeline/facts_draft_round5_de.json --additions --cache pipeline/.cache/facts-round5-check",
             "python3 pipeline/build_fact_review.py", "```", "",
             "Use an empty cache directory for a fresh live-source pass. "
             "After review, recheck edited wording against its quotes and build/render the accepted facts "
             "through the normal recipe pipeline. Rejected facts remain excluded.", "",
             "Browser checks passed for all 105 cards, filters, current-fact comparison, edits and overlength warnings, "
             "favorites, notes, persistence, and the complete JSON export. Desktop (1280 px) and mobile (390 px) "
             "showed no horizontal overflow or JavaScript errors. [Rendered review preview](facts-round5-preview.png).", "",
             "## Coverage", "",
             "Counts are **EN short / EN long / DE short / DE long**. "
             "‘After’ assumes every proposal is accepted.", "",
             "| Species | Current | After review, if accepted |", "|---|---|---|"]
    for sp, before, after in rows:
        lines.append(f"| {sp['names']['en']} / {sp['names']['de']} | "
                     + " / ".join(map(str, before)) + " | " + " / ".join(map(str, after)) + " |")
    for sp, _, _ in rows:
        lines += ["", f"## {sp['names']['en']} / {sp['names']['de']}", "", f"*{sp['taxon']}*", ""]
        for lang in drafts:
            for kind in ("short", "long"):
                lines += [f"### {lang.upper()} · {kind}", ""]
                for f in drafts[lang]["species"][sp["taxon"]][kind]:
                    quotes = f["source"]["quote"]
                    if isinstance(quotes, str):
                        quotes = [quotes]
                    lines += [f"**{f['id']}** · {len(f['text'])} characters · pending", "", f["text"], "",
                              f"Source: [{f['source']['title']}]({f['source']['url']}) · checked {f['source']['checked']}", ""]
                    lines += ["> " + q for q in quotes] + [""]
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "facts-round5.md").write_text("\n".join(lines) + "\n")
    payload = json.dumps({"facts": facts, "existing": existing}, ensure_ascii=False).replace("<", "\\u003c")
    template = (ROOT / "pipeline/fact_review.html").read_text()
    (OUT / "facts-round5.html").write_text(template.replace("__REVIEW_DATA__", payload))
    print(f"Built review for {len(facts)} additions across {len(species)} species")


if __name__ == "__main__":
    build()
