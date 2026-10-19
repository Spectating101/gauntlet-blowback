import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));
// Routes closed out on 2026-09-30 stay canonical in historical mode.
const historicalById = new Map(buildMasterRegistry({ includeArchived: true }).map((record) => [record.id, record]));
const corrections = JSON.parse(fs.readFileSync(new URL('../data/route-corrections-2026-09-21.json', import.meta.url), 'utf8'));
const correctionFor = (id) => corrections.overrides.find((override) => override.id === id);
const closedOutIds = new Set(
  JSON.parse(fs.readFileSync(new URL('../data/archived-routes-2026-09-30.json', import.meta.url), 'utf8'))
    .routes.map((route) => route.id),
);

const fundingScope = JSON.parse(fs.readFileSync(new URL('../examples/radar/funding-scope-v1.json', import.meta.url), 'utf8'));
const grantScope = JSON.parse(fs.readFileSync(new URL('../examples/radar/portfolio-scope.json', import.meta.url), 'utf8'));

test('Sep-15 research conversion radar adds first-class Fiscal Choke Points routes', () => {
  for (const id of [
    'atax-2027-fiscal-choke-points',
    'ipsa-2027-rc30-fiscal-choke-points',
    'icpp8-2027-fiscal-choke-points',
    'irspm-2027-fiscal-choke-points',
    'ata-jltr-2027-fiscal-choke-points',
    'journal-regulation-governance-fiscal-choke-points',
    'journal-world-tax-journal-fiscal-choke-points',
    'journal-ejtr-fiscal-choke-points',
    'journal-jcpa-fiscal-choke-points',
    'kemenkeu-cfp-2027-fiscal-choke-points-watch',
  ]) assert.ok(byId.has(id), `missing Sep-15 DT conversion route ${id}`);

  // ATTA was closed out by the applicant on 2026-10-08: it is archived, not live, and keeps its verified deadline.
  assert.equal(byId.has('atta-2027-fiscal-choke-points'), false);
  assert.equal(closedOutIds.has('atta-2027-fiscal-choke-points'), true);
  assert.equal(historicalById.get('atta-2027-fiscal-choke-points').deadline, '2026-10-12');
  assert.equal(byId.get('atax-2027-fiscal-choke-points').deadline, '2026-10-30');
  // ICPP8 was deferred by the owner on 2026-10-08; its Sep-15 status is kept as the prior status on record.
  assert.equal(byId.get('icpp8-2027-fiscal-choke-points').status, 'WATCH_OWNER_DEFERRED_POST_MASTER_FOCUS');
  assert.equal(correctionFor('icpp8-2027-fiscal-choke-points').previous_status_before_post_master_focus, 'PREPARE_FOR_WINDOW');
  assert.equal(byId.get('journal-regulation-governance-fiscal-choke-points').mutual_exclusion_group, 'dt-active-journal-review');
});

test('Sep-15 research conversion radar re-owns tax-native legacy routes without deleting provenance', () => {
  const taxAcademy = byId.get('tax-academy-sg-il');
  assert.ok(taxAcademy);
  assert.match(taxAcademy.assets, /Fiscal Choke Points/);
  assert.match(taxAcademy.assets, /Invisible Ledger/);
  assert.equal(taxAcademy.status, 'FIRE_AFTER_GATE');
  assert.match(taxAcademy.source_state, /2026-09-15/);

  const globalTax = byId.get('global-tax-symposium-2027-il');
  assert.ok(globalTax);
  assert.match(globalTax.assets, /Fiscal Choke Points/);
  assert.equal(globalTax.deadline, '2027-02-01');
  assert.match(globalTax.source_state, /2026-09-15/);
});

test('Invisible Ledger keeps a separate measurement conversion lane', () => {
  const sase = byId.get('sase-2027-invisible-ledger');
  const ecra = byId.get('journal-ecra-invisible-ledger');
  assert.ok(sase);
  assert.ok(ecra);
  assert.equal(sase.assets, 'Invisible Ledger');
  // Deferred by the owner on 2026-10-08 (data/route-corrections-2026-09-21.json); the prior status is kept on record.
  assert.equal(ecra.status, 'WATCH_OWNER_DEFERRED_POST_MASTER_FOCUS');
  assert.equal(correctionFor('journal-ecra-invisible-ledger').previous_status_before_post_master_focus, 'PREP_AFTER_SAMPLE_LOCK');
  assert.match(ecra.gate, /GTV.*issuer revenue.*merchant sales.*payment flows.*GDP\/value added.*taxable base/i);
});

test('discovery scopes reflect the current DT and IL research objects', () => {
  for (const scope of [fundingScope, grantScope]) {
    const projects = new Map((scope.projects ?? []).map((project) => [project.id, project]));
    assert.ok(projects.has('fiscal-choke-points'), 'Fiscal Choke Points must be a radar discovery asset');
    assert.ok(projects.has('invisible-ledger'), 'Invisible Ledger must remain a radar discovery asset');

    const dt = JSON.stringify(projects.get('fiscal-choke-points')).toLowerCase();
    assert.match(dt, /tax administration/);
    assert.match(dt, /digital tax|digital taxation/);

    const il = JSON.stringify(projects.get('invisible-ledger')).toLowerCase();
    assert.match(il, /digital economy/);
    assert.match(il, /platform economy/);
    assert.doesNotMatch(il, /stablecoin|cryptocurrency/);
  }
});
