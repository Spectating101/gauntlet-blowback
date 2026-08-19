import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateOpportunity, missingEvidence } from '../src/core/conversion.mjs';
import { buildProjection, assertNoStatusUpgrade } from '../src/core/claims.mjs';
import { normalizeOutcome } from '../src/core/outcomes.mjs';

function baseOpportunity(overrides = {}) {
  return {
    id: 'fde-001',
    type: 'job',
    cost_tag: '$0',
    eligibility: { state: 'PASS', evidence_refs: ['source:job'] },
    fit: { state: 'HIGH', basis: ['agentic-systems'] },
    marginal_work: { state: 'LOW' },
    direct_control: true,
    hard_blockers: [],
    required_evidence: ['claim:agentic'],
    available_evidence: ['claim:agentic'],
    ...overrides
  };
}

test('credible zero-cost opportunity is READY without autonomous submission authority', () => {
  const result = evaluateOpportunity(baseOpportunity());
  assert.equal(result.ok, true);
  assert.equal(result.decision, 'READY');
  assert.equal(result.doctrine.fire, true);
});

test('unknown eligibility and upfront spend fail closed to HOLD', () => {
  assert.equal(evaluateOpportunity(baseOpportunity({ eligibility: { state: 'UNKNOWN' } })).decision, 'HOLD');
  assert.equal(evaluateOpportunity(baseOpportunity({ cost_tag: '$UPFRONT' })).decision, 'HOLD');
});

test('failed eligibility is REJECT, not a prompt to rewrite the applicant', () => {
  const result = evaluateOpportunity(baseOpportunity({ eligibility: { state: 'FAIL' } }));
  assert.equal(result.decision, 'REJECT');
});

test('required evidence gaps remain explicit', () => {
  const opportunity = baseOpportunity({ required_evidence: ['claim:agentic', 'claim:physical'], available_evidence: ['claim:agentic'] });
  assert.deepEqual(missingEvidence(opportunity), ['claim:physical']);
});

test('projection excludes unproven claims and preserves inference labels', () => {
  const claims = [
    { id: 'proven', text: 'MCP contract passed CI.', status: 'PROVEN', evidence_refs: ['workflow:1'] },
    { id: 'inferred', text: 'This may reduce integration effort.', status: 'INFERRED', evidence_refs: ['analysis:1'] },
    { id: 'unproven', text: 'Customers save 50%.', status: 'UNPROVEN', evidence_refs: [] }
  ];
  const projection = buildProjection({ claims, claim_ids: ['proven', 'inferred', 'unproven'] });
  assert.deepEqual(projection.selected.map((c) => c.status), ['PROVEN', 'INFERRED']);
  assert.equal(projection.selected[1].qualifier, 'inference');
  assert.deepEqual(projection.excluded.map((c) => c.id), ['unproven']);
  assert.equal(assertNoStatusUpgrade(claims, projection.selected), true);
});

test('outcome compensation is recorded only with an explicit amount/currency/period', () => {
  const result = normalizeOutcome({
    opportunity_id: 'fde-001',
    opportunity_type: 'job',
    stage: 'OFFERED',
    compensation: { currency: 'TWD', amount: 90000, period: 'month' }
  });
  assert.equal(result.compensation.amount, 90000);
  assert.throws(() => normalizeOutcome({ opportunity_id: 'fde-002', stage: 'OFFERED', compensation: { amount: 90000 } }));
});
