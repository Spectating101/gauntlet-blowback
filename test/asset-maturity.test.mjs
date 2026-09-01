import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync(new URL('../data/portfolio-assets.json', import.meta.url), 'utf8'));
const assets = registry.assets ?? [];
const byId = new Map(assets.map((asset) => [asset.id, asset]));

const allowed = registry.allowed_values;

test('portfolio asset registry covers the audited twelve-asset boundary', () => {
  assert.equal(assets.length, 12);
  assert.equal(byId.size, assets.length, 'asset ids must be unique');
  for (const id of [
    'cite-agent',
    'research-drive',
    'policy-lab',
    'nocturnal-oversight',
    'hardware-splicer',
    'public-good-control',
    'refinery-commons',
    'sharpe-terminus',
    'research-papers',
    'citation-engine',
    'geomap-arbitrage',
    'gauntlet-blowback',
  ]) assert.ok(byId.has(id), `missing audited asset ${id}`);
});

test('maturity dimensions use explicit bounded vocabularies and current packaging fields', () => {
  assert.equal(registry.as_of, '2026-09-01');
  for (const asset of assets) {
    assert.ok(allowed.implementation_stage.includes(asset.implementation_stage), `${asset.id}: invalid implementation_stage`);
    assert.ok(allowed.external_evidence_stage.includes(asset.external_evidence_stage), `${asset.id}: invalid external_evidence_stage`);
    assert.ok(allowed.deployment_stage.includes(asset.deployment_stage), `${asset.id}: invalid deployment_stage`);
    assert.ok(allowed.canonicalization_state.includes(asset.canonicalization_state), `${asset.id}: invalid canonicalization_state`);
    assert.ok(asset.strongest_known_gap, `${asset.id}: strongest_known_gap required`);
    assert.ok(asset.evidence_basis, `${asset.id}: evidence_basis required`);
    assert.ok(asset.effective_candidate, `${asset.id}: effective_candidate required`);
    assert.ok(asset.packaging_role, `${asset.id}: packaging_role required`);
    assert.ok(Array.isArray(asset.allowed_claims) && asset.allowed_claims.length > 0, `${asset.id}: allowed_claims required`);
    assert.ok(Array.isArray(asset.forbidden_claims) && asset.forbidden_claims.length > 0, `${asset.id}: forbidden_claims required`);
    assert.ok(asset.next_evidence_action, `${asset.id}: next_evidence_action required`);
  }
});

test('internal validation cannot silently manufacture external validation', () => {
  const internallyValidated = assets.filter((asset) => asset.implementation_stage === 'internally_validated');
  assert.ok(internallyValidated.length > 0);
  for (const asset of internallyValidated) assert.notEqual(asset.external_evidence_stage, undefined);

  assert.equal(byId.get('public-good-control').external_evidence_stage, 'none');
  assert.equal(byId.get('citation-engine').external_evidence_stage, 'none');
  assert.equal(byId.get('policy-lab').external_evidence_stage, 'none');
  assert.equal(byId.get('geomap-arbitrage').external_evidence_stage, 'none');
});

test('deployment and external evidence remain orthogonal', () => {
  const researchDrive = byId.get('research-drive');
  assert.equal(researchDrive.deployment_stage, 'internal_live');
  assert.notEqual(researchDrive.external_evidence_stage, 'adopted');

  const policyLab = byId.get('policy-lab');
  assert.equal(policyLab.deployment_stage, 'public_demo');
  assert.equal(policyLab.external_evidence_stage, 'none');

  const cite = byId.get('cite-agent');
  assert.equal(cite.deployment_stage, 'public_demo');
  assert.equal(cite.external_evidence_stage, 'none');
});

test('known G4 assets stay explicitly short of external validation', () => {
  for (const id of ['public-good-control', 'nocturnal-oversight', 'sharpe-terminus', 'refinery-commons', 'geomap-arbitrage']) {
    assert.equal(byId.get(id).external_evidence_stage, 'none', `${id} must not receive synthetic G4 credit`);
  }
  assert.equal(byId.get('hardware-splicer').external_evidence_stage, 'limited');
  assert.match(byId.get('hardware-splicer').strongest_known_gap, /physical|design-partner|G4/i);
});

test('Nocturnal maturity points to one bounded external pilot, not another feature sprint', () => {
  const nocturnal = byId.get('nocturnal-oversight');
  assert.equal(nocturnal.external_evidence_stage, 'none');
  assert.equal(nocturnal.last_audited, '2026-09-01');
  assert.match(nocturnal.strongest_known_gap, /externally witnessed.*pilot/i);
  assert.match(nocturnal.strongest_known_gap, /Do not reopen architecture/i);
  assert.match(nocturnal.evidence_basis, /OTF.*TWNIC.*NLnet.*WebSci.*ICWSM/i);
});

test('support infrastructure is explicitly prevented from masquerading as primary ammunition', () => {
  assert.match(byId.get('citation-engine').packaging_role, /Support-only/i);
  assert.match(byId.get('gauntlet-blowback').packaging_role, /Support-only/i);
  assert.equal(byId.get('gauntlet-blowback').canonicalization_state, 'canonical');
});

test('asset maturity is explicitly not a route status field', () => {
  assert.equal(registry.doctrine.asset_maturity_is_not_route_status, true);
  assert.equal(registry.doctrine.internal_validation_is_not_external_validation, true);
  assert.equal(registry.doctrine.deployment_is_not_external_validation, true);
  assert.equal(registry.doctrine.unknowns_remain_unknown, true);
  assert.equal(registry.doctrine.package_claims_must_bind_to_the_named_candidate, true);
});
