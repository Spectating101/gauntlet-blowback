import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

const recoveredIds = [
  'dadh-2026-policy-research',
  'bck26-research-paper',
  'icdlt-2026-research-paper',
  'digital-tax-icpa-2026',
  'climatechain-2026-policy-eci',
  'jcdl-2026-workshop-tutorial-cite',
  'jcdl-2026-full-paper-cite',
  'nlnet-zero-commons-2026-cite',
  'field-tairos-automation-taipei-2026',
  'field-futuremode-2026',
  'procure-taitra-isourcing-electronics-2026',
  'outbound-geomap-procurement-intelligence',
  'nstc-research-entrepreneurship-2026',
  'ethonline-2026-policy-lab',
  'field-kubesummit-2026',
  'watch-g0v-nocturnal',
  'watch-civicus-ddi-civic-tech-nocturnal',
  'watch-eu-information-integrity-consortium-2026',
];

const threadOwnedIds = [
  'bck26-research-paper',
  'icdlt-2026-research-paper',
  'digital-tax-icpa-2026',
  'climatechain-2026-policy-eci',
  'jcdl-2026-workshop-tutorial-cite',
  'jcdl-2026-full-paper-cite',
  'nlnet-zero-commons-2026-cite',
  'field-tairos-automation-taipei-2026',
  'field-futuremode-2026',
  'procure-taitra-isourcing-electronics-2026',
  'outbound-geomap-procurement-intelligence',
  'nstc-research-entrepreneurship-2026',
  'ethonline-2026-policy-lab',
  'field-kubesummit-2026',
  'watch-g0v-nocturnal',
  'watch-civicus-ddi-civic-tech-nocturnal',
  'watch-eu-information-integrity-consortium-2026',
];

test('thread-recovered identities are represented in the canonical master', () => {
  for (const id of recoveredIds) {
    assert.ok(byId.has(id), `missing recovered route identity ${id}`);
  }
});

test('thread recovery fills missing routes but does not overwrite canonical owners', () => {
  for (const id of threadOwnedIds) {
    const route = byId.get(id);
    assert.match(
      route.source_state,
      /(THREAD_RECOVERED|MANUFACTURED_OUTBOUND)/,
      `${id} lacks bounded thread-recovery provenance`,
    );
  }

  // DADH was already present in a stronger canonical source. Thread recovery must
  // dedupe against that record rather than replacing it with conversation memory.
  const dadh = byId.get('dadh-2026-policy-research');
  assert.ok(dadh);
  assert.doesNotMatch(dadh.source_state, /THREAD_RECOVERED/);
});

test('conversation memory never promotes unresolved recovered routes to live-ready state', () => {
  assert.equal(byId.get('climatechain-2026-policy-eci').status, 'WATCH_REVERIFY');
  assert.equal(byId.get('climatechain-2026-policy-eci').deadline, '2026-10-25');
  assert.match(byId.get('climatechain-2026-policy-eci').gate, /Oct 5-25/);

  assert.equal(byId.get('jcdl-2026-full-paper-cite').status, 'EXPIRED_RETAIN');

  const nstc = byId.get('nstc-research-entrepreneurship-2026');
  assert.equal(nstc.status, 'VERIFY');
  assert.match(nstc.gate, /Recovered calendar point only/);

  const eu = byId.get('watch-eu-information-integrity-consortium-2026');
  assert.match(eu.gate, /do not treat consortium funding as direct personal funding/i);
});

test('thread recovery preserves field, partner-watch and manufactured-outbound semantics', () => {
  const tairos = byId.get('field-tairos-automation-taipei-2026');
  assert.equal(tairos.route_class, 'FIELD');
  assert.equal(tairos.execution_state, 'NOT_APPLICABLE');

  const futuremode = byId.get('field-futuremode-2026');
  assert.equal(futuremode.deadline, '2026-09-04');
  assert.equal(futuremode.execution_state, 'NOT_APPLICABLE');

  const g0v = byId.get('watch-g0v-nocturnal');
  assert.equal(g0v.route_class, 'PARTNER');
  assert.equal(g0v.deadline, 'CYCLE_NOT_YET_VERIFIED');

  const geomap = byId.get('outbound-geomap-procurement-intelligence');
  assert.equal(geomap.route_class, 'PILOT');
  assert.equal(geomap.execution_state, 'OUTREACH_READY');
  assert.match(geomap.gate, /generic scraping\/lead-generation positioning remains KILL/i);
});
