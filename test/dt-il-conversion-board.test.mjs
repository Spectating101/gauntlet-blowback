import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const board = JSON.parse(fs.readFileSync(new URL('../data/dt-il-conversion-board-2026-09-15.json', import.meta.url), 'utf8'));
const overlay = JSON.parse(fs.readFileSync(new URL('../data/dt-il-master-overlay-2026-09-15.json', import.meta.url), 'utf8'));
const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

test('DT and Invisible Ledger remain separate conversion assets', () => {
  assert.equal(board.assets.dt.canonical_label, 'Fiscal Choke Points / DT');
  assert.equal(board.assets.il.canonical_label, 'The Invisible Ledger');
  assert.equal(board.assets.il.next_gate, 'freeze_indonesia_longitudinal_admission_perimeter');
  assert.match(board.assets.paired_program.identity, /digital observability/);
  assert.ok(board.assets.paired_program.do_not_use_for.includes('paper_merger'));
});

test('Tax Academy ownership is overridden to DT without fabricating a deadline', () => {
  const route = byId.get('tax-academy-sg-il');
  assert.ok(route, 'historical Tax Academy route id must remain present for continuity');
  assert.equal(route.assets, 'Fiscal Choke Points|DT');
  assert.equal(route.contribution_view, 'DT');
  assert.equal(route.status, 'FIRE_NOW');
  assert.equal(route.deadline, 'UNKNOWN');
  assert.match(route.source_state, /VERIFIED_OPEN_NO_PUBLIC_DEADLINE_2026-09-15/);
});

test('Sep-15 DT and IL routes are first-class master records', () => {
  for (const id of [
    'atta-2027-dt',
    'atax-2027-dt',
    'ipsa-2027-rc30-dt',
    'icpp8-2027-dt',
    'sase-2027-il',
    'irspm-2027-dt',
  ]) assert.ok(byId.has(id), `missing DT/IL conversion route ${id}`);

  assert.equal(byId.get('atta-2027-dt').deadline, '2026-10-12');
  assert.equal(byId.get('atax-2027-dt').deadline, '2026-10-30');
  assert.equal(byId.get('ipsa-2027-rc30-dt').deadline, '2026-11-04');
  assert.equal(byId.get('icpp8-2027-dt').deadline, '2027-01-29');
  assert.equal(byId.get('sase-2027-il').contribution_view, 'IL socio-economic observability framing');
  assert.equal(byId.get('irspm-2027-dt').status, 'WATCH');
});

test('machine-readable board preserves fee, travel, and sample-boundary kill rules', () => {
  assert.equal(board.doctrine.zero_application_or_submission_fee_required, true);
  assert.equal(board.doctrine.travel_commitment_requires_acceptance_or_funding_economics, true);
  assert.ok(board.kill_rules.includes('application_or_submission_fee_required'));
  assert.ok(board.kill_rules.includes('il_route_depends_on_unfrozen_core_longitudinal_sample'));
});

test('master overlay contains exactly one historical ownership override', () => {
  assert.equal(overlay.overrides.length, 1);
  assert.equal(overlay.overrides[0].id, 'tax-academy-sg-il');
  assert.equal(overlay.routes.length, 6);
});
