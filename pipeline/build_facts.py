#!/usr/bin/env python3
"""Refresh approved fact pools in the captured bundles without rebuilding annual tracks.

    python3 pipeline/build_facts.py

Uses the same reviewed pools as build_featured.py/build_species.py. Seasonal
journeys and their original study facts are rebuilt by the seasonal importer.
"""
import json
from pathlib import Path
from build_seasonal import append_seasonal, append_species_metadata

ROOT = Path(__file__).resolve().parents[1]


def main():
    reviewed = json.loads((ROOT/'pipeline/facts_reviewed.json').read_text())['species']

    def pools(taxon, sources):
        return {lang: [{**{'text': f['text'], 'len': length},
                        **({'star': f['star'], 'source': f['source']} if sources else {})}
                       for length in ('short', 'long') for f in reviewed[taxon][lang][length]]
                for lang in ('en', 'de')}

    featured_path = ROOT/'worker/data/featured.json'
    featured = json.loads(featured_path.read_text())
    for sp in featured['species']:
        if not sp.get('seasonal'):
            sp['facts'] = pools(sp['taxon'], sources=False)
    featured = append_seasonal(featured)
    featured_path.write_text(json.dumps(featured, separators=(',', ':'), ensure_ascii=False))
    for path in (ROOT/'data/species.json', ROOT/'worker/data/species.json'):
        doc = json.loads(path.read_text())
        for sp in doc['species']:
            if not sp.get('seasonal'):
                sp['facts'] = pools(sp['taxon'], sources=True)
        doc = append_species_metadata(doc, featured)
        path.write_text(json.dumps(doc, indent=1, ensure_ascii=False)+'\n')
    counts = {lang: sum(len(sp['facts'][lang]) for sp in featured['species']) for lang in ('en', 'de')}
    print(f"Refreshed {len(featured['species'])} species: {counts['en']} English, {counts['de']} German facts")


if __name__ == '__main__':
    main()
