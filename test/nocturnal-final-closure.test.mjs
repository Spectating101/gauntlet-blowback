import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const campaign = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/nocturnal-final-closure-2026-09-17.json'), 'utf8'));
const maturity = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/portfolio-assets.json'), 'utf8'));

test('Nocturnal remains conversion-ready rather than falsely finalized', () => {
  assert.equal(campaign.state, 'CLOSURE_CONVERSION_READY');
  assert.equal(campaign.verified_topology.v3.state, 'OPEN_DRAFT');
  assert.ok(campaign.forbidden_claims.includes('V3 is canonical before integration'));
  assert.ok(campaign.forbidden_claims.includes('hosted CI passed'));
});

test('Nocturnal closure precedes external pilot outreach', () => {
  assert.equal(campaign.conversion_after_closure.one_serious_pilot_at_a_time, true);
  assert.match(campaign.conversion_after_closure.external_send_gate, /canonical demo/i);
  assert.equal(campaign.conversion_after_closure.candidate_routes.length, 3);
});

test('portfolio maturity binds Nocturnal claims to the named V3 candidate', () => {
  const asset = maturity.assets.find((item) => item.id === 'nocturnal-oversight');
  assert.equal(asset.external_evidence_stage, 'none');
  assert.equal(asset.canonicalization_state, 'release_branch_ahead');
  assert.match(asset.effective_candidate, /5c709947/);
});
