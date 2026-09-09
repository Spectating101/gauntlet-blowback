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

test('queue isolates malformed campaigns instead of stalling valid routes', () => {
  const queue = compileConversionQueue([
    { campaign_id: 'broken', project: { id: 'refinery' } },
    input('ready'),
  ]);
  assert.deepEqual(queue.auto_prepare_queue.map((row) => row.campaign_id), ['ready']);
  assert.equal(queue.failures.length, 1);
  assert.equal(queue.failures[0].campaign_id, 'broken');
  assert.equal(queue.counts.INVALID, 1);
});

test('queue collapses timestamp-only rediscovery', () => {
  const first = input('same', { retrieved_at: '2026-09-01T00:00:00Z' });
  const second = structuredClone(first);
  second.generated_at = '2026-09-02T00:00:00Z';
  second.opportunity.retrieved_at = '2026-09-02T00:00:00Z';
  const queue = compileConversionQueue([first, second]);
  assert.equal(queue.campaigns.length, 1);
  assert.equal(queue.collapsed_duplicates.length, 1);
});

test('queue fingerprint treats evidence and claim ordering as non-material', () => {
  const first = input('same', {
    required_evidence: ['e:kernel', 'e:extra'],
    available_evidence: ['e:kernel', 'e:extra'],
  });
  first.project.claims.push({ id: 'extra', status: 'PROVEN', text: 'extra exists', evidence_refs: ['e:extra'] });
  first.opportunity.claim_ids = ['kernel', 'extra'];
  const second = structuredClone(first);
  second.project.claims.reverse();
  second.opportunity.claim_ids.reverse();
  second.opportunity.required_evidence.reverse();
  second.opportunity.available_evidence.reverse();
  const queue = compileConversionQueue([first, second]);
  assert.equal(queue.campaigns.length, 1);
  assert.equal(queue.collapsed_duplicates.length, 1);
  assert.equal(queue.revision_conflicts.length, 0);
});

test('queue holds materially changed rediscovery for revision review', () => {
  const first = input('same');
  const second = structuredClone(first);
  second.opportunity.eligibility = { state: 'UNKNOWN' };
  const queue = compileConversionQueue([first, second]);
  assert.equal(queue.campaigns.length, 1);
  assert.equal(queue.auto_prepare_queue.length, 0);
  assert.equal(queue.counts.VERIFICATION_REQUIRED, 1);
  assert.equal(queue.revision_conflicts.length, 1);
  assert.equal(queue.campaigns[0].deduplication.status, 'REVISION_REVIEW_REQUIRED');
});
