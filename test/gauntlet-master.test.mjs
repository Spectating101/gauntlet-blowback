import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMasterRegistry, summarizeMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

test('master registry is materially larger than either source board', () => {
  assert.ok(records.length > 140, `expected >140 routes, got ${records.length}`);
  assert.equal(new Set(records.map((record) => record.id)).size, records.length);
});

test('restores cross-thread flagship routes', () => {
  for (const id of [
    'gaf-2026-policy-lab',
    'fc27-cl-eci',
    'ftsid-2026-cl-eci',
    'shih-hsin-finance-2026-il',
    'innoserve-2026-policy-lab-ip',
    'twnic-community-grant-2026-nocturnal',
    'msr-2027-technical-refinery',
    'taia-2026-hardware-splicer',
    'phd-tudelft-decentralized-trustworthy-ai',
    'job-dutch-rse-family',
  ]) assert.ok(byId.has(id), `missing restored route ${id}`);
});

test('includes verified live faculty-pull routes without inventing funding', () => {
  const route = byId.get('faculty-nthu-shan-hung-wu-ai-2026');
  assert.ok(route, 'missing Shan-Hung Wu faculty-pull route');
  assert.equal(route.route_class, 'FACULTY_PULL');
  assert.equal(route.status, 'FIRE_NOW');
  assert.equal(route.execution_state, 'OUTREACH_READY');
  assert.match(route.source_state, /RECRUITING_VERIFIED/);
  assert.match(route.source_state, /FUNDING_UNKNOWN/);
  assert.match(route.gate, /stipend\/RA compensation is not stated/i);
});

test('preserves research-family ownership and manuscript exclusivity', () => {
  assert.equal(byId.get('ftsid-2026-cl-eci').contribution_view, 'CL-ECI');
  assert.equal(byId.get('ftsid-2026-cl-eci').mutual_exclusion_group, 'cl-eci-manuscript-2026');
  assert.equal(byId.get('fc27-cl-eci').mutual_exclusion_group, 'cl-eci-manuscript-2026');
  assert.equal(byId.get('shih-hsin-finance-2026-il').contribution_view, 'Invisible Ledger');
  assert.equal(byId.get('innoserve-2026-policy-lab-ip').shared_evidence_family, 'policy-lab-family');
});

test('applies gate-audit corrections to current source rows', () => {
  assert.equal(byId.get('freeway-bridge-2026').status, 'VERIFY');
  assert.equal(byId.get('innoserve-pet-2026').status, 'HOLD');
  assert.equal(byId.get('innoserve-oss-2026').status, 'HOLD');
  assert.equal(byId.get('projectdiscovery-oss').status, 'SELECTIVE_SELL');
  assert.equal(byId.get('job-gogolook-credit').status, 'VERIFY');
  assert.equal(byId.get('job-qualcomm-ai-ml').status, 'WATCH');
});

test('keeps strategic and browser execution states separate', () => {
  assert.equal(byId.get('gaf-2026-policy-lab').status, 'FIRE_NOW');
  assert.equal(byId.get('gaf-2026-policy-lab').execution_state, 'PORTAL_RECON_REQUIRED');
  assert.equal(byId.get('innoserve-2026-policy-lab-ip').execution_state, 'PACKET_READY');
  assert.equal(byId.get('field-meet-taipei-2026').execution_state, 'NOT_APPLICABLE');
});

test('summary exposes portfolio-wide lane mix', () => {
  const summary = summarizeMasterRegistry(records);
  assert.equal(summary.total, records.length);
  assert.ok(summary.lanes.JOB > 0);
  assert.ok(summary.lanes.PhD > 0 || summary.lanes.PHD > 0);
  assert.ok(summary.lanes.PHD_FACULTY > 0);
  assert.ok(summary.lanes.RESEARCH > 0);
  assert.ok(summary.lanes.FIELD > 0);
});
