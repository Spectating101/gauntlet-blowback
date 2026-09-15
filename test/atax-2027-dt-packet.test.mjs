import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const packet = JSON.parse(fs.readFileSync(new URL('../data/atax-2027-dt-packet-2026-09-15.json', import.meta.url), 'utf8'));
const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

test('ATAx packet stays bound to the canonical Fiscal Choke Points route', () => {
  assert.equal(packet.route_id, 'atax-2027-fiscal-choke-points');
  assert.equal(packet.primary_asset, 'Fiscal Choke Points');
  const route = byId.get(packet.route_id);
  assert.ok(route, 'canonical ATAx route must exist');
  assert.equal(route.deadline, '2026-10-30');
  assert.equal(route.status, 'FIRE_AFTER_GATE');
  assert.equal(route.execution_state, 'APPLICATION_READY');
});

test('ATAx abstract word count is internally consistent and conservative', () => {
  const words = packet.abstract.text.trim().split(/\s+/).filter(Boolean);
  assert.equal(words.length, packet.abstract.word_count);
  assert.equal(words.length, 371);
  assert.equal(packet.opportunity.current_2027_abstract_word_limit, null);
});

test('historical 2025 process evidence is not promoted into a 2027 requirement', () => {
  assert.equal(packet.historical_process_evidence.source_cycle, '2025 ATAx call');
  assert.equal(packet.historical_process_evidence.imported_as_current_requirement, false);
  assert.equal(packet.opportunity.current_2027_required_field_list, null);
});

test('current ATAx economics remain a post-acceptance gate', () => {
  assert.equal(packet.attendance_gate.active, true);
  assert.equal(packet.opportunity.current_full_early_bird_registration_aud, 985);
  assert.equal(packet.opportunity.presenter_registration_deadline, '2026-12-31');
  assert.ok(packet.attendance_gate.actions_if_accepted.includes('make_explicit_go_no_go_decision_before_payment'));
});

test('submission still requires the human author contact field and send action', () => {
  assert.equal(packet.author_material.contact_email, null);
  assert.ok(packet.human_gate.includes('insert_author_email'));
  assert.ok(packet.human_gate.includes('final_email_send'));
});

test('causal and performance nonclaims remain explicit', () => {
  assert.equal(packet.evidence_boundary.new_empirical_results_added_for_venue, false);
  assert.equal(packet.evidence_boundary.causal_effect_claim, false);
  assert.equal(packet.evidence_boundary.country_ranking, false);
  assert.equal(packet.evidence_boundary.performance_superiority_claim, false);
});

test('human-readable packet exists', () => {
  const packetDoc = new URL(`../${packet.packet_doc}`, import.meta.url);
  assert.equal(fs.existsSync(fileURLToPath(packetDoc)), true);
});
