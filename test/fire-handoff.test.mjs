import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import {
  fireHandoffForRoute,
  fireHandoffQueue,
  fireReceiptToCheckpoint,
  nextFireHandoff,
  validateFireReceipt,
} from '../src/application/fire.mjs';

const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));
const FIRE_IDS = [
  'aws-community-day-taiwan-2026-hardware-splicer',
  'openai-researcher-access-hardware-splicer',
  'anthropic-external-researcher-access-2026',
];

test('immediate FIRE routes expose explicit execution manifests in the Gauntlet master', () => {
  for (const id of FIRE_IDS) {
    const record = byId.get(id);
    assert.ok(record, `missing FIRE route ${id}`);
    assert.equal(record.status, 'FIRE_NOW');
    assert.match(record.execution_manifest, /^examples\/opportunities\/.+\.json$/);
  }
});

test('AWS FIRE handoff is self-contained and remains human-submit gated', async () => {
  const handoff = await fireHandoffForRoute('aws-community-day-taiwan-2026-hardware-splicer', records);
  assert.equal(handoff.schema, 'blowback.fire_handoff.v1');
  assert.equal(handoff.state, 'READY_FOR_BROWSER_AGENT');
  assert.equal(handoff.target.registration_url, 'https://go.awscmd.tw/cfp');
  assert.equal(handoff.submission_copy.title, 'From Model Output to Physical Action: Evidence and Authority Gates for Agentic AI');
  assert.ok(handoff.submission_copy.abstract.length > 500);
  assert.equal(handoff.browser_agent_contract.final_submit_policy, 'HUMAN_PROTECTED');
  assert.ok(handoff.browser_agent_contract.human_gate.includes('final_submit_send_apply_confirm'));
  assert.equal(handoff.receipt_contract.template.route_id, handoff.route_id);
  assert.equal(handoff.receipt_contract.template.mission_id, handoff.mission_id);
});

test('OpenAI FIRE handoff carries the concrete experiment and credit ask inline', async () => {
  const handoff = await fireHandoffForRoute('openai-researcher-access-hardware-splicer', records);
  assert.equal(handoff.applicant_fields.working_credit_request_usd, 300);
  assert.equal(handoff.submission_copy.working_credit_request_usd, 300);
  assert.match(handoff.submission_copy.research_question, /unsupported consequential actions/i);
  assert.match(handoff.submission_copy.project_summary, /300 scored runs/i);
  assert.match(handoff.submission_copy.planned_use_of_openai_products, /experimental agents under evaluation/i);
  assert.match(handoff.packet.final_copy_source, /FIRE_NOW_SUBMISSION_COPY_2026-09-05/);
});

test('Anthropic FIRE handoff preserves AI-control framing instead of generic product development', async () => {
  const handoff = await fireHandoffForRoute('anthropic-external-researcher-access-2026', records);
  assert.equal(handoff.target.registration_url, 'https://forms.gle/pZYC8f6qYqSKvRWn9');
  assert.match(handoff.submission_copy.why_ai_safety, /control intervention/i);
  assert.match(handoff.submission_copy.research_summary, /200 Claude Sonnet 5 scored runs/i);
  assert.match(handoff.submission_copy.strongest_one_sentence_contribution, /unsupported confidence/i);
  assert.ok(handoff.submission_copy.nonclaims.some((claim) => /general alignment solution/i.test(claim)));
});

test('fire-next selects the deadline-bound AWS shot before rolling research-credit routes', async () => {
  const handoff = await nextFireHandoff(records);
  assert.ok(handoff);
  assert.equal(handoff.route_id, 'aws-community-day-taiwan-2026-hardware-splicer');
});

test('fire queue contains only executable immediate FIRE bundles', async () => {
  const queue = await fireHandoffQueue(records, { limit: 10 });
  assert.equal(queue.schema, 'blowback.fire_queue.v1');
  assert.deepEqual(queue.handoffs.map((handoff) => handoff.route_id), FIRE_IDS);
  assert.ok(queue.handoffs.every((handoff) => handoff.state === 'READY_FOR_BROWSER_AGENT'));
});

test('submitted fire receipts require durable receipt evidence and become checkpoints', () => {
  const receipt = validateFireReceipt({
    schema: 'blowback.fire_receipt.v1',
    mission_id: 'mission:openai-researcher-access-hardware-splicer',
    route_id: 'openai-researcher-access-hardware-splicer',
    status: 'SUBMITTED',
    stage: 'confirmation',
    current_url: 'https://example.test/confirmation',
    completed_actions: ['mapped live fields', 'filled final copy', 'human clicked submit'],
    receipt_refs: ['confirmation-screenshot.png'],
    application_id: 'APP-123',
    submitted_at: '2026-09-05T01:00:00+08:00',
    next_expected_event: 'quarterly review',
  });
  const checkpoint = fireReceiptToCheckpoint(receipt);
  assert.equal(checkpoint.status, 'SUBMITTED');
  assert.equal(checkpoint.route_id, receipt.route_id);
  assert.deepEqual(checkpoint.receipt_refs, ['confirmation-screenshot.png']);
});

test('fire receipts reject submission without receipt evidence', () => {
  assert.throws(() => validateFireReceipt({
    mission_id: 'mission:test',
    route_id: 'test',
    status: 'SUBMITTED',
    stage: 'confirmation',
    submitted_at: '2026-09-05T01:00:00+08:00',
  }), /application_id or receipt_refs/i);
});

test('fire receipts refuse secrets', () => {
  assert.throws(() => validateFireReceipt({
    mission_id: 'mission:test',
    route_id: 'test',
    status: 'WAITING_HUMAN',
    stage: 'login',
    api_key: 'do-not-store-this',
  }), /may not store secrets/i);
});
