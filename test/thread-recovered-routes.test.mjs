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
];

test('thread-recovered routes enter the canonical master', () => {
  for (const id of recoveredIds) {
    assert.ok(byId.has(id), `missing thread-recovered route ${id}`);
  }
});

test('conversation memory never masquerades as live verification', () => {
  for (const id of recoveredIds) {
    const route = byId.get(id);
    assert.match(
      route.source_state,
      /(THREAD_RECOVERED|MANUFACTURED_OUTBOUND)/,
      `${id} lacks bounded thread-recovery provenance`,
    );
  }

  assert.equal(byId.get('climatechain-2026-policy-eci').status, 'WATCH_REVERIFY');
  assert.equal(byId.get('climatechain-2026-policy-eci').deadline, '2026-10-25');
  assert.match(byId.get('climatechain-2026-policy-eci').gate, /Oct 5-25/);

  assert.equal(byId.get('dadh-2026-policy-research').status, 'EXPIRED_RETAIN');
  assert.equal(byId.get('jcdl-2026-full-paper-cite').status, 'EXPIRED_RETAIN');
});

test('thread recovery preserves field and manufactured-outbound semantics', () => {
  const tairos = byId.get('field-tairos-automation-taipei-2026');
  assert.equal(tairos.route_class, 'FIELD');
  assert.equal(tairos.execution_state, 'NOT_APPLICABLE');

  const geomap = byId.get('outbound-geomap-procurement-intelligence');
  assert.equal(geomap.route_class, 'PILOT');
  assert.equal(geomap.execution_state, 'OUTREACH_READY');
  assert.match(geomap.gate, /generic scraping\/lead-generation positioning remains KILL/i);
});
