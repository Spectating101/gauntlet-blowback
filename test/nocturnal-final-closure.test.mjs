import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const campaign = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/nocturnal-final-closure-2026-09-17.json'), 'utf8'));
const maturity = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/portfolio-assets.json'), 'utf8'));

test('pre-merge Nocturnal closure plan is superseded rather than reopened', () => {
  assert.equal(campaign.state, 'SUPERSEDED_BY_CANONICAL_CLOSURE');
  assert.equal(campaign.verified_topology.rc2.state, 'MERGED');
  assert.equal(campaign.verified_topology.v3.state, 'MERGED');
  assert.equal(campaign.verified_topology.legacy_rc1.state, 'CLOSED_SUPERSEDED');
  assert.deepEqual(campaign.closure_sequence, []);
  assert.ok(campaign.superseded_by.includes('data/portfolio-assets-supplement-2026-09-17.json'));
  assert.match(campaign.historical_preclosure_record, /83e4bd02626f7f00fc451a955268b3341ac6525c/);
});

test('product completion preserves the external evidence and engineering-freeze boundaries', () => {
  assert.equal(campaign.portfolio_product_status, 'complete');
  assert.equal(campaign.conversion_state, 'conversion_ready');
  assert.equal(campaign.external_evidence_stage, 'none');
  assert.equal(campaign.build_factory, 'FROZEN_UNLESS_EARNED_BY_DEFECT_EVALUATOR_PILOT_OR_ROUTE_REQUIREMENT');
  assert.match(campaign.verified_topology.hosted_ci, /not passing product tests/);
});

test('historical staging does not become submission or proof of a live prepared session', () => {
  const conversion = campaign.conversion_after_closure;
  assert.equal(conversion.one_serious_pilot_at_a_time, true);
  assert.equal(conversion.candidate_routes.length, 3);
  assert.equal(conversion.selected_preparation_route, 'partner-tfc-nocturnal-pilot');
  assert.equal(conversion.staging_is_submission, false);
  assert.equal(conversion.archived_staging_proves_live_session, false);
  assert.match(conversion.external_send_gate, /live session.*human-protected/i);
});

test('registry and closure record bind to the same canonical Nocturnal release', () => {
  const asset = maturity.assets.find((item) => item.id === 'nocturnal-oversight');
  assert.equal(asset.external_evidence_stage, campaign.external_evidence_stage);
  assert.equal(asset.canonicalization_state, 'canonical');
  assert.ok(asset.effective_candidate.includes(campaign.verified_topology.product_integration));
  assert.ok(asset.effective_candidate.includes(campaign.verified_topology.portfolio_freeze));
  assert.equal(asset.portfolio_product_status, campaign.portfolio_product_status);
});
