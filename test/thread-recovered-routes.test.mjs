import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

// Most recovered routes have since closed. The 2026-09-17 archive takes closed and
// partner-only routes out of the ACTIVE master while keeping their records for audit,
// so provenance and semantics are checked against the full registry, and the active
// master is checked separately against the archive policy.
const records = buildMasterRegistry({ includeArchived: true });
const byId = new Map(records.map((record) => [record.id, record]));
const activeIds = new Set(buildMasterRegistry().map((record) => record.id));

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
];

// Routes a stronger source later took over. Thread recovery must never replace
// those: DADH was already canonical, and the EU call was verified against the
// official call text on 2026-09-01 (nocturnal-conversion-radar).
const upgradedIds = [
  'dadh-2026-policy-research',
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

  // A stronger source wins. Thread recovery must dedupe against it rather than
  // replacing verified evidence with conversation memory.
  for (const id of upgradedIds) {
    const route = byId.get(id);
    assert.ok(route, `missing ${id}`);
    assert.doesNotMatch(route.source_state, /THREAD_RECOVERED/, `${id} was overwritten by thread memory`);
  }
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
  // The verified wording replaced the recovered one; the warning it must keep is
  // that an individual applicant cannot assume the funding reaches them directly.
  assert.match(eu.gate, /do not assume a taiwan-based individual can lead or receive/i);
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

test('the active master follows the archive policy for recovered routes', () => {
  // Closed or partner-only routes leave the active master; their records stay in
  // the full registry (checked above), so recovery evidence is never lost.
  for (const id of ['dadh-2026-policy-research', 'jcdl-2026-full-paper-cite', 'field-futuremode-2026',
                    'outbound-geomap-procurement-intelligence', 'watch-eu-information-integrity-consortium-2026']) {
    assert.ok(byId.has(id), `${id} lost from the full registry`);
    assert.ok(!activeIds.has(id), `${id} is archived but still in the active master`);
  }
  // Routes that are still open stay active.
  for (const id of ['climatechain-2026-policy-eci', 'watch-g0v-nocturnal']) {
    assert.ok(activeIds.has(id), `${id} is still open but missing from the active master`);
  }
});
