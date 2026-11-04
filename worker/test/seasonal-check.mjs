// Real published zebra/turtle journeys; calendar boundaries and selection semantics.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { buildFull } from '../src/view.js';
import { withLive } from '../src/refresh.js';
import { speciesList } from '../src/params.js';
const data = JSON.parse(fs.readFileSync(new URL('../data/featured.json', import.meta.url)));
const run = (species, date, options = {}) => buildFull(data, { species, now: new Date(date), ...options });
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`ok   seasonal: ${name}`); }
const zebra = 'Equus quagga', turtle = 'Chelonia mydas';
check('the four source-derived journey boundaries are inclusive; no held position after them', () => {
  for (const sp of data.species.filter(s => s.seasonal)) for (const a of sp.animals) {
    const j = a.journey;
    for (const p of [j.points[0], j.points.at(-1)]) {
      const date = `2026-${p[0].slice(5)}T12:00:00Z`;
      // Restrict to this actual source journey to check its endpoints independently.
      const d = { ...data, species: [{ ...sp, animals: [a] }] };
      const v = buildFull(d, { species: sp.taxon, now: new Date(date) });
      assert.equal(v.kind, 'seasonal');
      assert.deepEqual(JSON.parse(v.geo).pos, p.slice(1, 3));
      assert.ok(v.status.includes(p[0].slice(0, 4)));
      const adjacent = new Date(date);
      adjacent.setUTCDate(adjacent.getUTCDate() + (p === j.points[0] ? -1 : 1));
      assert.equal(buildFull(d, { species: sp.taxon, now: adjacent }).state, 'seasonal');
    }
  }
});
check('source calendar dates survive leap years and viewer midnight', () => {
  const may = run(zebra, '2028-05-10T12:00:00Z');
  assert.equal(may.kind, 'seasonal');
  assert.match(may.status, /10 May 2008/);
  assert.equal(run(zebra, '2028-02-29T12:00:00Z').state, 'seasonal');
  assert.equal(run(zebra, '2026-11-17T23:30:00Z', { utcOffset: 3600 }).kind, 'seasonal');
  assert.equal(run(zebra, '2026-12-08T23:30:00Z', { utcOffset: 3600 }).state, 'seasonal');
});
check('estimated dates are labelled; their original year is always visible', () => {
  // Nicole has no original fix on 6 October 2018; only this short internal gap is interpolated.
  const sp = data.species.find(s => s.taxon === turtle);
  const nicole = sp.animals.find(a => a.journey.sourceAnimal === '41082');
  const d = { ...data, species: [{ ...sp, animals: [nicole] }] };
  for (const [lang, pattern] of [['en', /Journey estimate.*6 Oct 2018/], ['de', /Geschätzte Position.*6\. Okt\. 2018/]]) {
    const v = buildFull(d, { species: turtle, lang, now: new Date('2026-10-06T12:00:00Z') });
    assert.match(v.status, pattern);
    assert.doesNotMatch(v.status + v.where + v.fact, /usually|meist|Last located|Zuletzt geortet/);
  }
});
check('off-season animals leave automatic and mixed rotation, including Flock View', () => {
  for (let i = 0; i < 96; i++) {
    const v = run([zebra, turtle, 'Ciconia ciconia'], `2026-07-01T12:00:00Z`, { layout: 'multi' });
    assert.equal(v.species, 'White Stork');
    assert.equal(v.rows, undefined);
    const all = run('all', new Date(Date.UTC(2026, 6, 1) + i * 900000).toISOString(), { layout: 'multi' });
    assert.ok(!all.rows.some(r => ['Plains Zebra', 'Green Turtle'].includes(r.species)));
  }
});
check('seasonal-only selections remain explicit and explain the next season', () => {
  for (const selection of [zebra, turtle, [zebra, turtle]]) {
    const v = run(selection, '2026-07-01T12:00:00Z');
    assert.equal(v.state, 'seasonal'); assert.ok(!v.geo);
    assert.match(v.status, /Next season starts around/);
  }
  assert.match(run(zebra, '2026-07-01T12:00:00Z').status, /18 Nov/);
});
check('in-season rows agree with the expanded journey; units and photo-off remain supported', () => {
  for (const lang of ['en', 'de']) for (const units of ['metric', 'imperial']) for (let i = 0; i < 96; i++) {
    const v = run([zebra, turtle], new Date(Date.UTC(2026, 10, 20) + i * 900000).toISOString(), { lang, units, layout: 'multi' });
    assert.equal(v.rows.length, 2);
    const r = v.rows[v.current];assert.equal(r.species, v.species);assert.equal(r.name, v.name);
    assert.match(v.status, /2007|2018/); assert.equal(v.photo, '');
  }
});
check('source identities and publication data stay separate from live KV', () => {
  for (const sp of data.species.filter(s => s.seasonal)) {
    assert.equal(withLive(data, { animals: {}, refused: {} }).species.find(s => s.taxon === sp.taxon), sp);
    for (const a of sp.animals) {
      assert.equal(a.live, false);assert.equal(a.credit.license, 'CC0');
      const j=a.journey;
      assert.ok(j.points.every(p => p[0] >= j.start && p[0] <= j.end));
      if (sp.taxon === turtle) assert.ok(j.points.every(p => Number.isInteger(p[1]) && Number.isInteger(p[2])));
    }
  }
  assert.deepEqual(speciesList('zebra,green_sea_turtle',data.species), [zebra,turtle]);
});
check('an odd number of available species still fills both quadrant cards', () => {
  let last = 0;
  for (let i=0;i<96;i++) {
    const v=run([zebra,turtle,'Ciconia ciconia'],new Date(Date.UTC(2026,10,20)+i*900000).toISOString(),{layout:'multi'});
    if(v.current===2) { last++;assert.ok(v.rows[1].geo);assert.ok(v.rows[2].geo); }
  }
  assert.ok(last>0);
});
console.log(`${checks} seasonal checks passed`);
