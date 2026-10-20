import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const packet = JSON.parse(fs.readFileSync(new URL('../data/ipsa-2027-rc30-dt-packet-2026-09-15.json', import.meta.url), 'utf8'));
const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

test('IPSA packet remains bound to canonical funding-gated route', () => {
  assert.equal(packet.route_id, 'ipsa-2027-rc30-fiscal-choke-points');
  const route = byId.get(packet.route_id);
  assert.ok(route, 'canonical IPSA RC30 route must exist');
  assert.equal(route.status, 'FUNDING_GATED');
  assert.equal(route.execution_state, 'DEPENDENCY_RECON_REQUIRED');
  assert.equal(route.deadline, '2026-11-04');
});

test('IPSA title and abstract stay under current official limits', () => {
  const titleWords = packet.proposal.title.trim().split(/\s+/).filter(Boolean);
  const abstractWords = packet.proposal.abstract.trim().split(/\s+/).filter(Boolean);
  assert.equal(titleWords.length, packet.proposal.title_word_count);
  assert.equal(abstractWords.length, packet.proposal.abstract_word_count);
  assert.ok(titleWords.length <= packet.opportunity.title_word_limit);
  assert.ok(abstractWords.length <= packet.opportunity.abstract_word_limit);
});

test('PL-4684 is the primary panel and duplicate panel submission is disabled', () => {
  assert.equal(packet.panel.primary_panel_id, 'PL-4684');
  assert.match(packet.panel.title, /Institutional Design for Policy Implementation/);
  assert.equal(packet.panel.duplicate_panel_submission, false);
  assert.equal(packet.panel.fallback_panel.panel_id, 'PL-4812');
});

test('proposal respects IPSA abstract-content rules', () => {
  const abstract = packet.proposal.abstract;
  assert.match(abstract, /How does institutional design determine/);
  assert.match(abstract, /Using current legislation/);
  assert.doesNotMatch(abstract, /https?:\/\//);
  assert.doesNotMatch(abstract, /@/);
});

test('submission is free but in-person participation remains gated', () => {
  assert.equal(packet.funding_and_participation.submission_fee_required, false);
  assert.equal(packet.funding_and_participation.buy_membership_before_submission, false);
  assert.equal(packet.funding_and_participation.in_person_gate_active, true);
  assert.equal(packet.opportunity.presentation_mode, 'IN_PERSON_ONLY');
});

test('funding paths are represented as possible rather than guaranteed', () => {
  assert.equal(packet.funding_and_participation.general_travel_grant.available, true);
  assert.equal(packet.funding_and_participation.general_travel_grant.guaranteed, false);
  assert.equal(packet.funding_and_participation.stein_rokkan_travel_grant.amount_usd, 1000);
  assert.equal(packet.funding_and_participation.stein_rokkan_travel_grant.guaranteed, false);
});

test('causal and performance overclaims remain excluded', () => {
  assert.equal(packet.contribution_boundary.new_empirical_results_added_for_venue, false);
  assert.equal(packet.contribution_boundary.causal_effect_claim, false);
  assert.equal(packet.contribution_boundary.country_ranking, false);
  assert.equal(packet.contribution_boundary.universal_platform_superiority_claim, false);
  assert.equal(packet.contribution_boundary.documented_procedure_equals_performance_claim, false);
});

test('human-readable packet exists', () => {
  const packetDoc = new URL(`../${packet.packet_doc}`, import.meta.url);
  assert.equal(fs.existsSync(fileURLToPath(packetDoc)), true);
});
