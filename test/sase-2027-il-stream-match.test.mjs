import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';

const match = JSON.parse(fs.readFileSync(new URL('../data/sase-2027-il-stream-match-2026-09-15.json', import.meta.url), 'utf8'));
const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));

test('SASE stream note remains attached to canonical Invisible Ledger route', () => {
  assert.equal(match.route_id, 'sase-2027-invisible-ledger');
  assert.equal(match.primary_asset, 'Invisible Ledger');
  const route = byId.get(match.route_id);
  assert.ok(route, 'canonical SASE route must exist');
  assert.equal(route.status, 'WATCH_STREAM_MATCH');
  assert.equal(route.execution_state, 'RESEARCH_ONLY');
});

test('Network J is the resolved default without forcing an abstract', () => {
  assert.equal(match.venue_fit.status, 'RESOLVED');
  assert.equal(match.venue_fit.primary_network.id, 'J');
  assert.equal(match.venue_fit.primary_network.name, 'Digital Economy');
  assert.equal(match.execution_doctrine.write_outward_abstract_now, false);
});

test('mini conference remains watch-only until accepted themes are allocatable', () => {
  assert.equal(match.mini_conference.state, 'WATCH_ACCEPTED_THEME_CATALOGUE');
  assert.equal(match.mini_conference.public_theme_catalogue_stable_for_allocation, false);
  assert.equal(match.mini_conference.duplicate_same_paper_across_mini_conference_and_network, false);
  assert.equal(match.conference.mini_conference_deadline, '2026-11-01');
  assert.equal(match.conference.network_deadline, '2026-12-16');
});

test('Invisible Ledger advisor ratification is a hard pre-abstract gate', () => {
  const dependency = match.empirical_dependency;
  assert.equal(dependency.repository, 'Spectating101/Invisible-ledger');
  assert.equal(dependency.pull_request, 8);
  assert.equal(dependency.advisor_approved, false);
  assert.equal(dependency.blocking_gate, 'IL_ADVISOR_RATIFICATION_AND_LONGITUDINAL_PERIMETER');
  assert.equal(dependency.abstract_drafting_allowed_before_gate, false);
  assert.equal(dependency.submission_allowed_before_gate, false);
});

test('candidate inference boundary cannot become an Indonesia country panel', () => {
  const boundary = match.inference_boundary_after_ratification;
  assert.equal(boundary.main_geography, 'Indonesia');
  assert.equal(boundary.direct_periods_candidate, 13);
  assert.equal(boundary.positive_base_transitions_candidate, 9);
  assert.equal(boundary.pool_as_indonesia_country_panel, false);
  assert.match(boundary.grab_shopee, /conditional/i);
});

test('participation economics remain gated', () => {
  assert.equal(match.execution_doctrine.virtual_preference_if_glasgow_unfunded, true);
  assert.equal(match.execution_doctrine.virtual_submission_mechanics_must_be_reverified, true);
  assert.equal(match.execution_doctrine.purchase_membership_or_registration_before_acceptance, false);
});

test('human-readable stream-match note exists', () => {
  const note = new URL(`../${match.human_readable_note}`, import.meta.url);
  assert.equal(fs.existsSync(fileURLToPath(note)), true);
});
