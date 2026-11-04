#!/usr/bin/env python3
"""Download, verify and build the curated seasonal journeys; no Movebank login.

Run after build_featured.py (which also calls append_seasonal). Raw original
coordinates stay in ignored cache. Only selected migration windows enter the
bundle; nesting areas are excluded before interpolation and coarsening.
"""
import csv, datetime as dt, hashlib, json, math, os, statistics, urllib.request
from collections import defaultdict
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'pipeline/.cache/seasonal'
API = 'https://datarepository.movebank.org/server/api'
CONFIG = ROOT / 'pipeline/seasonal_species.json'

def get(url):
    with urllib.request.urlopen(url, timeout=120) as r:
        return r.read()

def remote_json(url):
    return json.loads(get(url))

def km(a, b):
    a, b = tuple(map(math.radians, a)), tuple(map(math.radians, b))
    h = math.sin((b[0]-a[0])/2)**2 + math.cos(a[0])*math.cos(b[0])*math.sin((b[1]-a[1])/2)**2
    return 12742 * math.asin(min(1, math.sqrt(h)))

def files_for(sp, refresh):
    folder = CACHE / sp['taxon'].lower().replace(' ', '_')
    folder.mkdir(parents=True, exist_ok=True)
    meta = folder / 'metadata.json'
    manifest = folder / 'files.json'
    if refresh or not meta.exists() or not manifest.exists():
        it = remote_json(f"{API}/core/items/{sp['package']}")
        files = []
        for b in remote_json(f"{API}/core/items/{sp['package']}/bundles")['_embedded']['bundles']:
            if b['name'] == 'ORIGINAL':
                files.extend(remote_json(b['_links']['bitstreams']['href'])['_embedded']['bitstreams'])
        meta.write_text(json.dumps(it, indent=2))
        manifest.write_text(json.dumps(files, indent=2))
    it, files = json.loads(meta.read_text()), json.loads(manifest.read_text())
    rights = [x['value'] for x in it['metadata']['dc.rights']]
    if rights != ['CC0 1.0 Universal']:
        raise ValueError(f"Review changed license before importing {sp['taxon']}: {rights}")
    for f in files:
        if f['name'] not in sp['events'] and f['name'] != 'README.txt' and 'reference' not in f['name']:
            continue
        at = folder / Path(f['name']).name
        if not at.exists():
            at.write_bytes(get(f['_links']['content']['href']))
        cs = f['checkSum']
        if cs['checkSumAlgorithm'].upper() != 'MD5' or sp['expectedMD5'].get(f['name']) != cs['value'] or hashlib.md5(at.read_bytes()).hexdigest() != cs['value']:
            raise ValueError(f"Checksum mismatch: {at.name}")
    if 'CC0 1.0' not in (folder / 'README.txt').read_text():
        raise ValueError('README license requires review')
    return folder, it

def daily_fixes(folder, sp):
    animals = defaultdict(dict)
    for fn in sp['events']:  # GPS last: preferred for equal timestamps
        with (folder/fn).open(encoding='utf-8', newline='') as handle:
            for r in csv.DictReader(handle):
                if r.get('visible', 'true').lower() == 'false' or any(r.get(k, '').lower() == 'true' for k in ['manually-marked-outlier', 'algorithm-marked-outlier']):
                    continue
                try:
                    t = dt.datetime.fromisoformat(r['timestamp'])
                    ll = (float(r['location-lat']), float(r['location-long']))
                    if not (all(math.isfinite(x) for x in ll) and abs(ll[0]) <= 90 and abs(ll[1]) <= 180):
                        continue
                except (ValueError, KeyError):
                    continue
                if r['individual-taxon-canonical-name'] != sp['sourceTaxon']:
                    raise ValueError('Unexpected source taxon')
                animals[r['individual-local-identifier']][t] = ll
    result = {}
    for aid, fixes in animals.items():
        days = defaultdict(list)
        for t, ll in sorted(fixes.items()):
            days[t.date()].append(ll)
        result[aid] = {d: tuple(statistics.median(x[i] for x in ll) for i in [0, 1]) for d, ll in sorted(days.items())}
    return result

def append_seasonal(data, refresh=False):
    config = json.loads(CONFIG.read_text())
    data['species'] = [s for s in data['species'] if not s.get('seasonal')]
    for sp in config['species']:
        folder, it = files_for(sp, refresh)
        abstract = ' '.join(x['value'] for x in it['metadata']['dc.description.abstract'])
        source = {'title': it['metadata']['dc.title'][0]['value'], 'url': f"{API}/core/items/{sp['package']}", 'doi': sp['doi'], 'checked': config['checked']}
        facts = {}
        for lang, pools in sp['facts'].items():
            ff = [dict(f, len=length) for length in ('short','long') for f in pools[length]]
            for f in ff:
                if f['quote'] not in abstract or len(f['text']) > 140:
                    raise ValueError(f"Fact quote or length invalid: {f['text']}")
            facts[lang] = [{ 'text': f['text'], 'len':f['len'], 'source': {**source, 'quote': f['quote']}} for f in ff]
        daily = daily_fixes(folder, sp)
        entry = {'taxon': sp['taxon'], 'names': sp['names'], 'seasonal': True, 'mapZoom':sp.get('mapZoom',3),
                 'photo': (ROOT/'worker/photos'/f"{sp['taxon'].lower().replace(' ', '_')}.jpg").exists(),
                 'facts': facts, 'animals': []}
        for j in sp['journeys']:
            fixes = daily[j['animal']]
            initial = fixes[min(fixes)]
            start, end = map(dt.date.fromisoformat, [j['start'], j['end']])
            if end < start or (end-start).days > 180:
                raise ValueError('A journey must be a single chronological seasonal leg')
            # Never publish nesting fixes, including a coarse version of a nesting fix.
            safe = {d:ll for d,ll in fixes.items() if start <= d <= end and km(initial,ll) >= sp.get('excludeStartKm', 0)}
            if start not in safe or end not in safe:
                raise ValueError(f"Unsafe or missing endpoint: {j['animal']}")
            points = []
            dates = sorted(safe)
            for i,d in enumerate(dates):
                ll = safe[d]
                points.append((d,ll,'f'))
                if i+1 < len(dates):
                    after = dates[i+1]; gap = (after-d).days
                    # Only interpolate short internal gaps in this same journey.
                    if 1 < gap <= 4:
                        for step in range(1,gap):
                            q = tuple(ll[k]+(safe[after][k]-ll[k])*step/gap for k in [0,1])
                            if km(initial,q) >= sp.get('excludeStartKm',0):
                                points.append((d+dt.timedelta(days=step),q,'i'))
            points.sort()
            step = sp['coarsen']
            track = [[str(d), round(round(ll[1]/step)*step,2), round(round(ll[0]/step)*step,2), quality] for d,ll,quality in points]
            aid = f"dr-{sp['package']}-{j['animal']}-{j['start']}"
            entry['animals'].append({'id':aid, 'name':j['name'], 'nameSource':j['nameSource'], 'live':False,
                'lastFix':j['end'], 'lastPosition':None, 'coarsen':step, 'stays':[],
                'individual':{'sex':'f','trackedFrom':str(min(fixes)), 'trackedTo':str(max(fixes))},
                'credit':{**source,'license':'CC0'},
                'journey':{**{k:j[k] for k in ['start','end','from','to']}, 'sourceAnimal':j['animal'], 'points':track}})
        data['species'].append(entry)
    return data

def append_species_metadata(doc, featured):
    """Keep the public species table complete without inventing annual windows."""
    doc['species'] = [s for s in doc['species'] if not s.get('seasonal')]
    catalog = json.loads((ROOT/'data/catalog.json').read_text())['species']
    for sp in featured['species']:
        if not sp.get('seasonal'):
            continue
        snapshot = catalog[sp['taxon']]
        doc['species'].append({'taxon':sp['taxon'], 'names':sp['names'], 'seasonal':True,
            'namesSource':'pipeline/seasonal_species.json; source taxon recorded in original CSVs; Equus burchellii is retained as a source alias for Equus quagga',
            'iucn':snapshot['iucn'], 'iucnSource':'Existing GBIF catalog snapshot, 2026-09-28; re-check before relying on current status',
            'migration':snapshot['migration'], 'migrationSource':sp['animals'][0]['credit']['url'],
            'windows':{'centralEurope':None,'allTracked':None,'note':'Individual recorded journey windows, not population migration estimates.'},
            'journeys':[{k:a['journey'][k] for k in ['sourceAnimal','start','end','from','to']} for a in sp['animals']],
            'facts':sp['facts'], 'tracked':{'animals':len({a['journey']['sourceAnimal'] for a in sp['animals']}), 'journeys':len(sp['animals'])}})
    return doc

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true', help='Re-fetch metadata and manifests; verify every file and source quote')
    args = parser.parse_args()
    out = ROOT/'worker/data/featured.json'
    data = append_seasonal(json.loads(out.read_text()), args.refresh)
    out.write_text(json.dumps(data,separators=(',',':'),ensure_ascii=False))
    for table in [ROOT/'data/species.json',ROOT/'worker/data/species.json']:
        doc = append_species_metadata(json.loads(table.read_text()), data)
        table.write_text(json.dumps(doc,indent=1,ensure_ascii=False)+'\n')
    print('Seasonal species:', ', '.join(s['names']['en'] for s in data['species'] if s.get('seasonal')))
