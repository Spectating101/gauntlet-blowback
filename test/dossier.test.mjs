import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validateOpportunityDossier, toConversionOpportunity } from '../src/core/dossier.mjs';
import { evaluateOpportunity } from '../src/core/conversion.mjs';
import { buildProjection } from '../src/core/claims.mjs';

function jobDossier(overrides = {}) {
  return {
    id: 'job-fde-001',
    type: 'job',
    organization: 'Example AI Company',
    title: 'Forward Deployed Engineer',
    source: {
      url: 'https://example.com/jobs/fde-001',
      retrieved_at: '2026-08-22T00:00:00+08:00'
    },
    deadline: null,
    location: 'Taiwan',
    eligibility: {
      state: 'PASS',
      evidence_refs: ['source:job-fde-001:requirements']
    },
    economics: {
      disclosure: 'DISCLOSED',
      currency: 'TWD',
      amount_min: 76000,
      amount_max: 120000,
      period: 'month',
      evidence_refs: ['source:job-fde-001:compensation']
    },
    cost_tag: '$0',
    fit: {
      state: 'HIGH',
      basis: ['agentic systems', 'MCP', 'deployment']
    },
    marginal_work: {
      state: 'LOW',
      basis: ['existing FDE projection']
    },
    direct_control: true,
    hard_blockers: [],
    required_evidence: ['hs-canonical-mcp-gateway'],
    recommended_claim_ids: ['specialty-evidence-governed-agentic-systems', 'hs-canonical-mcp-gateway'],
    freshness: {
      checked_at: '2026-08-22T00:00:00+08:00',
      expires_at: '2026-08-29T00:00:00+08:00'
    },
    ...overrides
  };
}

test('valid Spectator job dossier bridges into READY conversion policy when evidence is present', () => {
  const dossier = jobDossier();
  const validation = validateOpportunityDossier(dossier);
  assert.equal(validation.ok, true);
  const opportunity = toConversionOpportunity(dossier, { available_evidence: ['hs-canonical-mcp-gateway'] });
  assert.equal(evaluateOpportunity(opportunity).decision, 'READY');
});

test('unknown compensation remains UNKNOWN and cannot carry invented amounts', () => {
  const validUnknown = jobDossier({ economics: { disclosure: 'UNKNOWN' } });
  assert.equal(validateOpportunityDossier(validUnknown).ok, true);

  const invented = jobDossier({ economics: { disclosure: 'UNKNOWN', amount: 90000 } });
  const result = validateOpportunityDossier(invented);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('must not be invented')));
});

test('disclosed compensation requires source evidence', () => {
  const dossier = jobDossier({
    economics: {
      disclosure: 'DISCLOSED', currency: 'TWD', amount: 90000, period: 'month', evidence_refs: []
    }
  });
  const result = validateOpportunityDossier(dossier);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('disclosed economics requires evidence_refs'));
});

test('missing required portfolio evidence holds a researched opportunity', () => {
  const opportunity = toConversionOpportunity(jobDossier(), { available_evidence: [] });
  assert.equal(evaluateOpportunity(opportunity).decision, 'HOLD');
});

test('checked-in audience projections automatically exclude UNPROVEN claims', async () => {
  const claimDoc = JSON.parse(await fs.readFile('data/applicant_claims.json', 'utf8'));
  const projectionDoc = JSON.parse(await fs.readFile('data/audience_projections.json', 'utf8'));

  const physical = buildProjection({
    claims: claimDoc.claims,
    claim_ids: projectionDoc.projections.physical_ai.claim_ids
  });
  assert.deepEqual(
    physical.excluded.map((c) => c.id).sort(),
    ['hs-independent-operator-success', 'hs-live-unseen-competence', 'hs-physical-validation'].sort()
  );
  assert.ok(physical.selected.some((c) => c.id === 'hs-evidence-governed-hardware-workflow'));

  const incubator = buildProjection({
    claims: claimDoc.claims,
    claim_ids: projectionDoc.projections.gauntlet_incubator.claim_ids
  });
  assert.ok(incubator.excluded.some((c) => c.id === 'recurring-commercial-revenue'));
});

test('first live Taiwan FDE dossier validates but remains HOLD while applicant-specific eligibility is unresolved', async () => {
  const dossier = JSON.parse(await fs.readFile('examples/dossiers/taiwan-fde-actgsys-2026-08-22.json', 'utf8'));
  assert.equal(validateOpportunityDossier(dossier).ok, true);
  const opportunity = toConversionOpportunity(dossier, {
    available_evidence: [
      'specialty-evidence-governed-agentic-systems',
      'hs-canonical-mcp-gateway',
      'research-drive-agent-directed-discovery'
    ]
  });
  const result = evaluateOpportunity(opportunity);
  assert.equal(result.decision, 'HOLD');
  assert.ok(result.reasons.includes('eligibility unresolved'));
});
