import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const packet = JSON.parse(fs.readFileSync(new URL('../data/atta-2027-dt-packet-2026-09-15.json', import.meta.url), 'utf8'));
const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

test('ATTA packet remains bound to the canonical Fiscal Choke Points route', () => {
  assert.equal(packet.route_id, 'atta-2027-fiscal-choke-points');
  assert.equal(packet.primary_asset, 'Fiscal Choke Points');
  const route = byId.get(packet.route_id);
  assert.ok(route, 'canonical ATTA route must exist');
  assert.equal(route.status, 'FIRE_AFTER_GATE');
  assert.equal(route.execution_state, 'APPLICATION_READY');
  assert.equal(route.deadline, '2026-10-12');
});

test('frozen abstract stays under the official 500-word ceiling', () => {
  const words = packet.abstract.text.trim().split(/\s+/).filter(Boolean);
  assert.equal(words.length, packet.abstract.word_count);
  assert.ok(words.length <= packet.opportunity.abstract_word_limit);
  assert.equal(packet.opportunity.abstract_word_limit, 500);
});

test('packet preserves the intended contribution rather than a country survey', () => {
  assert.ok(packet.positioning.lead_claims.includes('digital_intermediary_liability_is_activation_specific'));
  assert.match(packet.positioning.anchor_countercase, /Philippine/i);
  assert.ok(packet.positioning.do_not_frame_as.includes('five_country_asean_survey'));
});

test('causal and performance claims remain outside the evidence boundary', () => {
  assert.equal(packet.evidence_boundary.new_empirical_results_added_for_venue, false);
  assert.equal(packet.evidence_boundary.causal_effect_claim, false);
  assert.equal(packet.evidence_boundary.country_ranking, false);
  assert.equal(packet.evidence_boundary.performance_superiority_claim, false);
  assert.equal(packet.evidence_boundary.source_currentness_sweep_required_before_submission, true);
});

test('attendance remains an explicit post-acceptance economics gate', () => {
  assert.equal(packet.attendance_gate.active, true);
  assert.equal(packet.opportunity.current_general_2_5_day_registration_aud, 750);
  assert.ok(packet.attendance_gate.actions_if_accepted.includes('make_explicit_go_no_go_economics_decision_before_purchase'));
});

test('human-readable packet exists', () => {
  const packetDoc = new URL(`../${packet.packet_doc}`, import.meta.url);
  assert.equal(fs.existsSync(fileURLToPath(packetDoc)), true);
});
