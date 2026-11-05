#!/usr/bin/env python3
"""Build the review documents from drafts and imported owner decisions."""
import json
import hashlib
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/reviews"


def build():
    species = json.loads((ROOT / "worker/data/featured.json").read_text())["species"]
    drafts = {lang: json.loads((ROOT / f"pipeline/facts_draft_round5_{lang}.json").read_text())
              for lang in ("en", "de")}
    owner_path = ROOT / "pipeline/facts_review_round5.json"
    owner = json.loads(owner_path.read_text()) if owner_path.exists() else None
    owner_facts = {f["id"]: f for f in owner["facts"]} if owner else {}
    round6_path = ROOT / "pipeline/facts_review_round6.json"
    round6 = json.loads(round6_path.read_text()) if round6_path.exists() else None
    round6_facts = {f["id"]: f for f in round6["facts"]} if round6 else {}
    # The coverage audit describes the proposal's starting point, even after
    # the accepted texts have entered the current compiled bundle.
    additions = {f['text'] for d in drafts.values() for sp in d['species'].values() for pool in sp.values() for f in pool}
    additions.update(f['text'] for f in owner_facts.values())
    additions.update(f['text'] for f in round6_facts.values())
    rows, facts, existing = [], [], {}
    for sp in species:
        taxon = sp["taxon"]
        before, after = [], []
        existing[taxon] = {lang: [f["text"] for f in sp["facts"][lang]] for lang in drafts}
        for lang, draft in drafts.items():
            for kind, limit in (("short", 90), ("long", 140)):
                pool = draft["species"][taxon][kind]
                count = sum(f["len"] == kind and f['text'] not in additions for f in sp["facts"][lang])
                before.append(count)
                after.append(count + len(pool))
                for f in pool:
                    facts.append({**owner_facts.get(f["id"], f), "taxon": taxon, "name": sp["names"][lang],
                                  "lang": lang, "kind": kind, "limit": limit})
        rows.append((sp, before, after))

    lines = ["# Animal facts — round 5", "",
             "2026-11-05 · **105 proposed additions.** "
             "52 English and 53 German facts across all 20 currently featured species. "
             "The imported review outcomes and current release state are recorded below.", "",
             "Open [the interactive review](facts-round5.html) in a browser to edit wording, "
             "go through suggestions individually, approve, star, veto, request a rewrite with notes, and export your decisions. "
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
             "Initial draft checks (before integration):", "", "```sh",
             "python3 pipeline/check_fact_draft.py pipeline/facts_draft_round5_en.json --additions --cache pipeline/.cache/facts-round5-check",
             "python3 pipeline/check_fact_draft.py pipeline/facts_draft_round5_de.json --additions --cache pipeline/.cache/facts-round5-check",
             "python3 pipeline/build_fact_review.py", "```", "",
             "Use an empty cache directory for a fresh live-source pass. After integration, the additions checker "
             "correctly rejects facts already in the bundle; use [the release checks](../FACTS_RELEASE.md) for the accepted content. "
             "After review, recheck edited wording against its quotes and build/render the accepted facts "
             "through the normal recipe pipeline. Rejected facts remain excluded.", "",
             "Browser checks passed for individual navigation through all 105 suggestions, filters, current-fact comparison, "
             "edits and overlength warnings, separate veto/rewrite decisions with notes, favorites, persistence, "
             "and the complete JSON export. Desktop (1280 px) and mobile (390 px) "
             "showed no horizontal overflow or JavaScript errors. [Rendered review preview](facts-round5-preview.png).", "",
             "## Coverage", "",
             "Counts are **EN short / EN long / DE short / DE long**. "
             "‘After’ describes the initial proposal, assuming every item is accepted; owner decisions are recorded below.", "",
             "| Species | Current | After review, if accepted |", "|---|---|---|"]
    for sp, before, after in rows:
        lines.append(f"| {sp['names']['en']} / {sp['names']['de']} | "
                     + " / ".join(map(str, before)) + " | " + " / ".join(map(str, after)) + " |")
    if owner:
        counts = Counter(f["review"]["verdict"] for f in facts)
        lines += ["", "## Imported owner review", "",
                  f"Exported {owner['exported']}: {counts['ok']} approved, {counts['veto']} vetoed, "
                  f"{counts['rewrite']} requested rewrites, {counts['pending']} pending. "
                  "All edits, notes and 39 favorites are preserved in `pipeline/facts_review_round5.json`. "
                  "Three approved edits have proposed grammar repairs, presented separately for confirmation. "
                  "The other 88 approvals need no further wording review. "
                  + ("Round six is complete: 98 approved additions are integrated locally and all 7 vetoes are excluded. Release status is recorded in the release notes."
                     if round6 else "No new facts have been integrated."), "",
                  "See the [11-item follow-up review](facts-round6.html). "
                  "The original export remains unchanged; its instructions are editorial feedback for these items.", ""]
    for sp, _, _ in rows:
        lines += ["", f"## {sp['names']['en']} / {sp['names']['de']}", "", f"*{sp['taxon']}*", ""]
        for lang in drafts:
            for kind in ("short", "long"):
                lines += [f"### {lang.upper()} · {kind}", ""]
                for f in drafts[lang]["species"][sp["taxon"]][kind]:
                    f = owner_facts.get(f["id"], f)
                    quotes = f["source"]["quote"]
                    if isinstance(quotes, str):
                        quotes = [quotes]
                    verdict = f.get("review", {}).get("verdict", "pending")
                    lines += [f"**{f['id']}** · {len(f['text'])} characters · {verdict}", "", f["text"], "",
                              f"Source: [{f['source']['title']}]({f['source']['url']}) · checked {f['source']['checked']}", ""]
                    lines += ["> " + q for q in quotes] + [""]
                    if f.get("review", {}).get("note"):
                        lines += ["Owner note: " + f["review"]["note"], ""]
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "facts-round5.md").write_text("\n".join(lines) + "\n")
    payload = {"round": 5, "facts": facts, "existing": existing,
               "speciesNames": {sp["taxon"]: sp["names"] for sp in species}}
    if owner:
        payload.update({"storageKey": "on-the-move-facts-round5-imported-" + hashlib.sha256(owner_path.read_bytes()).hexdigest()[:12],
                        "intro": "Your round-five review is preserved: 91 approved, 6 vetoed, 5 requested rewrites, and 3 pending. "
                        + ("Round six is now complete: the final 98 additions are integrated locally and all 7 vetoes are excluded. Release status is recorded in the release notes."
                           if round6 else "Continue with the focused round-six review for the open items and proposed grammar repairs.")})
    payload = json.dumps(payload, ensure_ascii=False).replace("<", "\\u003c")
    template = (ROOT / "pipeline/fact_review.html").read_text()
    (OUT / "facts-round5.html").write_text(template.replace("__REVIEW_DATA__", payload))
    print(f"Built review for {len(facts)} additions across {len(species)} species")
    followup = ROOT / "pipeline/facts_draft_round6.json"
    if followup.exists():
        d = json.loads(followup.read_text())
        if round6:
            d['facts'] = [{**f, **round6_facts[f['id']], 'originalText': f['originalText'], 'proposalText': f['text']} for f in d['facts']]
        payload = {**d, "existing": existing, "speciesNames": {sp["taxon"]: sp["names"] for sp in species},
                   "storageKey": ("on-the-move-facts-round6-imported-" + hashlib.sha256(round6_path.read_bytes()).hexdigest()[:12]) if round6 else "on-the-move-facts-round6-v1",
                   "title": "On the Move · Animal facts, round 6",
                   "audit": "facts-round6.md",
                   "intro": "Round six is complete: 10 approved and 1 vetoed. Across both rounds, all 98 approved additions are integrated locally, including your latest edits, and all 7 vetoes are excluded. There are no pending rewrites. Release status is recorded in the release notes." if round6 else "11 suggestions need your attention: 5 requested rewrites, 3 undecided facts, and 3 proposed grammar repairs to approved edits. Your other 88 approvals and all 6 vetoes are preserved. Review one item at a time; earlier feedback appears with each suggestion."}
        (OUT / "facts-round6.html").write_text(template.replace("__REVIEW_DATA__", json.dumps(payload, ensure_ascii=False).replace("<", "\\u003c")))
        lines = ["# Animal facts — round 6", "", "2026-11-05 · **10 approved, 1 vetoed; review complete.**" if round6 else "2026-11-05 · **11 items, all pending owner review.**", "",
                 "Open the [interactive review](facts-round6.html) to edit, approve, veto or send a suggestion for another rewrite with notes.", "",
                 "Round 5 feedback: 91 approvals (39 favorites), 6 vetoes, 5 rewrite requests and 3 undecided facts. "
                 "The original export is preserved byte-for-byte in `pipeline/facts_review_round5.json`. "
                 "Three approved edits contain grammar slips; proposed fixes are included for confirmation. "
                 "The other 88 approved facts and all 6 vetoes are carried forward without changes. "
                 + ("Final result: 98 additions integrated locally (51 English, 47 German), 7 vetoes excluded. The recipe now contains 513 species facts. Release status is recorded in the release notes. "
                    "The round-six upload is preserved byte-for-byte in `pipeline/facts_review_round6.json`; it includes your three latest wording edits."
                    if round6 else "No recipe facts were integrated."), "",
                 "The follow-up has 8 German and 3 English items. All fit the 90/140-character limits. "
                 "Supporting quotes for both the uploaded review and follow-up were rechecked against live sources on 2026-11-05.", "",
                 "Combine approvals by parent ID: a round-six approval supersedes its round-five wording; "
                 "a veto stays excluded, a rewrite stays open, and pending never means approved. "
                 "Keep both review rounds as the record of the owner's decisions.", "",
                 "Validation: all 105 imported edits and decisions survived re-export; all 11 follow-ups were navigable with earlier feedback. "
                 "Editing, approval, veto, rewrite notes, persistence, filtering and round-six JSON export passed browser checks. "
                 "Desktop and mobile layouts showed no horizontal overflow or JavaScript errors. "
                 "[Rendered preview](facts-round6-preview.png).", ""]
        for f in d["facts"]:
            info = f["followup"]
            verdict = f.get('review', {}).get('verdict', 'pending')
            lines += [f"## {f['name']} · {f['lang'].upper()} · {f['kind']}", "", f"**{f['id']}** · {len(f['text'])}/{f['limit']} characters · {verdict}", "",
                      info["reason"] + ": " + info["explanation"], ""]
            if info["previousReview"]["note"]:
                lines += ["Owner feedback: " + info["previousReview"]["note"], ""]
            lines += ["Previous: " + f["originalText"], "", ("Final wording: " if round6 else "Proposed: ") + f["text"], "",
                      f"Source: [{f['source']['title']}]({f['source']['url']}) · checked {f['source']['checked']}", ""]
            quote = f["source"]["quote"]
            lines += ["> " + q for q in (quote if isinstance(quote, list) else [quote])] + [""]
        (OUT / "facts-round6.md").write_text("\n".join(lines) + "\n")
        print(f"Built round-six follow-up for {len(d['facts'])} suggestions")


if __name__ == "__main__":
    build()
