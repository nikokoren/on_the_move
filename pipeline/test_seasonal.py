#!/usr/bin/env python3
"""Check imports against pinned original published files, including privacy.
Run: python3 pipeline/test_seasonal.py (downloads originals if absent).
"""
import datetime as dt, json, unittest
from build_seasonal import ROOT, CONFIG, files_for, daily_fixes, append_seasonal, km

class SeasonalImport(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = json.loads(CONFIG.read_text())['species']
        cls.data = json.loads((ROOT/'worker/data/featured.json').read_text())
        cls.source = {}
        for sp in cls.config:
            folder, _ = files_for(sp, False)
            cls.source[sp['taxon']] = daily_fixes(folder, sp)

    def test_original_zebra_has_real_fixes_on_all_364_days(self):
        days = self.source['Equus quagga']['Z3866']
        self.assertEqual(len(days), 364)
        self.assertEqual(str(min(days)), '2007-10-25')
        self.assertEqual(str(max(days)), '2008-10-22')

    def test_turtle_interpolation_is_only_the_two_real_short_gaps(self):
        sp = next(s for s in self.data['species'] if s['taxon']=='Chelonia mydas')
        for a in sp['animals']:
            interpolated = [p[0] for p in a['journey']['points'] if p[3]=='i']
            expected = ['2018-10-06','2018-11-21'] if a['journey']['sourceAnimal']=='41082' else []
            self.assertEqual(interpolated, expected)
            for date in interpolated:
                self.assertNotIn(dt.date.fromisoformat(date), self.source[sp['taxon']][a['journey']['sourceAnimal']])

    def test_published_fixes_match_source_and_exclude_nesting_area(self):
        for spec in self.config:
            sp = next(s for s in self.data['species'] if s['taxon']==spec['taxon'])
            step = spec['coarsen']
            for a in sp['animals']:
                source = self.source[sp['taxon']][a['journey']['sourceAnimal']]
                initial = source[min(source)]
                for date,lon,lat,quality in a['journey']['points']:
                    self.assertLessEqual(a['journey']['start'],date)
                    self.assertLessEqual(date,a['journey']['end'])
                    if quality != 'f':continue
                    ll = source[dt.date.fromisoformat(date)]
                    self.assertEqual([lon,lat],[round(round(ll[1]/step)*step,2), round(round(ll[0]/step)*step,2)])
                    if sp['taxon']=='Chelonia mydas':
                        self.assertGreaterEqual(km(initial,ll),150)
                        self.assertEqual(lon,round(lon));self.assertEqual(lat,round(lat))
                        self.assertGreater(km(initial,(lat,lon)),100)

    def test_rebuilding_is_deterministic_and_preserves_annual_species(self):
        generated=append_seasonal(json.loads(json.dumps(self.data)))
        self.assertEqual(generated,self.data)
        self.assertEqual(len([s for s in generated['species'] if not s.get('seasonal')]),18)

if __name__=='__main__':unittest.main()
