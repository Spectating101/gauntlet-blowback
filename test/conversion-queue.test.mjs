import test from 'node:test';
import assert from 'node:assert/strict';
import { compileConversionQueue } from '../src/conversion/queue.mjs';

function project() {
  return {
    id: 'refinery',
    claims: [{ id: 'kernel', status: 'PROVEN', text: 'kernel exists', evidence_refs: ['e:kernel'] }]
  };
}

function input(id, overrides = {}) {
  return {
    campaign_id: id,
    project: project(),
    opportunity: {
      id,
      type: 'grant',
      title: id,
      cost_tag: '$0',
      direct_control: true,
      eligibility: { state: 'PASS' },
      fit: { state: 'HIGH' },
      marginal_work: { state: 'LOW' },
      required_evidence: ['e:kernel'],
      available_evidence: ['e:kernel'],
      claim_ids: ['kernel'],
      ...overrides
    }
  };
}

test('queue prioritizes ready work by deadline and separates human attention', () => {
  const queue = compileConversionQueue([
    input('late', { deadline: '2026-11-03T12:00:00Z' }),
    input('early', { deadline: '2026-09-30T15:59:00Z' }),
    {
      ...input('partnered', { direct_control: false }),
      dependencies: [{ id: 'host', kind: 'legal_entity', state: 'OPEN', description: 'registered host required' }]
    }
  ]);

  assert.deepEqual(queue.auto_prepare_queue.map((row) => row.campaign_id), ['early', 'late']);
  assert.equal(queue.human_attention_queue.length, 1);
  assert.equal(queue.human_attention_queue[0].campaign_id, 'partnered');
  assert.equal(queue.human_attention_queue[0].state, 'DEPENDENCY_REQUIRED');
});
