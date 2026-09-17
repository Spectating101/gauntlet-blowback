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
  'openai-researcher-access-hardware-splicer',
  'anthropic-external-researcher-access-2026',
];

test('current immediate FIRE routes expose explicit execution manifests in the Gauntlet master', () => {
  for (const id of [...FIRE_IDS, 'aws-community-day-taiwan-2026-hardware-splicer']) {
    const record = byId.get(id);
    assert.ok(record, `missing FIRE route ${id}`);
    assert.equal(record.status, 'FIRE_NOW');
    assert.match(record.execution_manifest, /^examples\/opportunities\/.+\.json$/);
  }
});

test('expired AWS route cannot re-enter the live FIRE queue', async () => {
  await assert.rejects(
    fireHandoffForRoute('aws-community-day-taiwan-2026-hardware-splicer', records),
    /not found in active Gauntlet master/i,
  );
});

test('OpenAI FIRE handoff carries the concrete experiment and credit ask inline', async () => {
  const handoff = await fireHandoffForRoute('openai-researcher-access-hardware-splicer', records);
  assert.equal(handoff.applicant_fields.working_credit_request_usd, 300);
  assert.equal(handoff.submission_copy.working_credit_request_usd, 300);
  assert.match(handoff.submission_copy.research_question, /unsupported action attempts/i);
  assert.match(handoff.submission_copy.project_summary, /300 scored runs/i);
  assert.match(handoff.submission_copy.planned_use_of_openai_products, /agents being evaluated/i);
  assert.match(handoff.submission_copy.project_summary, /I built Hardware-Splicer/i);
  assert.match(handoff.packet.final_copy_source, /FIRE_NOW_SUBMISSION_COPY_2026-09-05/);
});

test('Anthropic FIRE handoff preserves narrow AI-control framing instead of generic product development', async () => {
  const handoff = await fireHandoffForRoute('anthropic-external-researcher-access-2026', records);
  assert.equal(handoff.target.registration_url, 'https://forms.gle/pZYC8f6qYqSKvRWn9');
  assert.match(handoff.submission_copy.why_ai_safety, /safety claim I want to test is deliberately small/i);
  assert.match(handoff.submission_copy.research_summary, /200 Claude Sonnet 5 runs/i);
  assert.match(handoff.submission_copy.strongest_one_sentence_contribution, /simple checks outside the model/i);
  assert.ok(handoff.submission_copy.nonclaims.some((claim) => /general alignment solution/i.test(claim)));
});

test('fire-next skips expired dated shots and selects a live rolling research-credit route', async () => {
  const handoff = await nextFireHandoff(records);
  assert.ok(handoff);
  assert.ok(FIRE_IDS.includes(handoff.route_id));
});

test('fire queue contains only the two live executable immediate FIRE bundles', async () => {
  const queue = await fireHandoffQueue(records, { limit: 10, includePaused: true });
  assert.equal(queue.schema, 'blowback.fire_queue.v1');
  const ids = queue.handoffs.map((handoff) => handoff.route_id);
  assert.deepEqual(new Set(ids), new Set(FIRE_IDS));
  assert.equal(ids.length, FIRE_IDS.length);
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
