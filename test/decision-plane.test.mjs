import test from 'node:test';
import assert from 'node:assert/strict';

import {
  callJevChoice,
  reviewGauntletCandidate,
  supervisedChoice,
} from '../src/intelligence/decision-plane.mjs';

function fakeFetch(answer, { status = 200 } = {}) {
  return async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'jev-latest');
    assert.ok(body.questions.decision);
    return {
      ok: status >= 200 && status < 300,
      status,
      async json() { return { answers: { decision: answer } }; },
      async text() { return status >= 400 ? 'failure' : ''; },
    };
  };
}

test('callJevChoice returns typed choice and confidence', async () => {
  const result = await callJevChoice({
    apiKey: 'test-key',
    state: { candidate: 'x' },
    instructions: 'Choose.',
    criteria: { accept: 'good', revise: 'repairable' },
    fetchImpl: fakeFetch({
      type: 'choice',
      choice: 'accept',
      probabilities: { accept: 0.93, revise: 0.07 },
      confidence: 0.93,
    }),
  });
  assert.equal(result.choice, 'accept');
  assert.equal(result.confidence, 0.93);
});

test('high-confidence normal-risk choice stays on Jev', async () => {
  let supervisorCalls = 0;
  const result = await supervisedChoice({
    apiKey: 'test-key',
    state: { x: 1 },
    instructions: 'Choose.',
    criteria: { accept: 'good', revise: 'repairable' },
    fetchImpl: fakeFetch({ choice: 'accept', probabilities: { accept: 0.96, revise: 0.04 } }),
    supervisor: {
      async resolve() { supervisorCalls += 1; return { choice: 'revise' }; },
    },
  });
  assert.equal(result.choice, 'accept');
  assert.equal(result.source, 'jev');
  assert.equal(result.escalated, false);
  assert.equal(supervisorCalls, 0);
});

test('low-confidence choice escalates to System-2 supervisor', async () => {
  const reasons = [];
  const result = await supervisedChoice({
    apiKey: 'test-key',
    state: { x: 1 },
    instructions: 'Choose.',
    criteria: { accept: 'good', revise: 'repairable' },
    minConfidence: 0.8,
    fetchImpl: fakeFetch({ choice: 'accept', probabilities: { accept: 0.55, revise: 0.45 } }),
    supervisor: {
      async resolve(context) {
        reasons.push(context.reason);
        return { choice: 'revise', confidence: 0.91, rationale: 'Missing evidence.' };
      },
    },
  });
  assert.equal(result.choice, 'revise');
  assert.equal(result.source, 'supervisor');
  assert.equal(result.escalated, true);
  assert.deepEqual(reasons, ['low_confidence']);
});

test('high-risk choice escalates regardless of Jev confidence', async () => {
  const result = await supervisedChoice({
    apiKey: 'test-key',
    state: { x: 1 },
    instructions: 'Choose.',
    criteria: { accept: 'good', revise: 'repairable' },
    risk: 'high',
    fetchImpl: fakeFetch({ choice: 'accept', confidence: 0.99 }),
    supervisor: {
      async resolve(context) {
        assert.equal(context.reason, 'high_risk');
        return { choice: 'accept', confidence: 0.99 };
      },
    },
  });
  assert.equal(result.source, 'supervisor');
  assert.equal(result.escalation_reason, 'high_risk');
});

test('missing Jev credentials fails closed into supervisor instead of executing', async () => {
  const result = await reviewGauntletCandidate({
    apiKey: '',
    candidate: { id: 'candidate-1' },
    evidence: [],
    gateResults: {},
    supervisor: {
      async resolve(context) {
        assert.equal(context.reason, 'jev_unavailable');
        return { choice: 'revise', confidence: 1 };
      },
    },
  });
  assert.equal(result.choice, 'revise');
  assert.equal(result.source, 'supervisor');
});
