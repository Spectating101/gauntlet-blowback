import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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
  'partner-tfc-nocturnal-pilot',
];

test('current immediate FIRE routes expose explicit execution manifests in the Gauntlet master', () => {
  for (const id of FIRE_IDS) {
    const record = byId.get(id);
    assert.ok(record, `missing FIRE route ${id}`);
    assert.equal(record.status, 'FIRE_NOW');
    assert.match(record.execution_manifest, /^examples\/opportunities\/.+\.json$/);
  }
});

test('expired AWS CFP packet is retained but cannot dispatch through FIRE', async () => {
  const record = byId.get('aws-community-day-taiwan-2026-hardware-splicer');
  assert.ok(record);
  assert.equal(record.status, 'EXPIRED_RETAIN');
  assert.equal(record.execution_state, 'RESEARCH_ONLY');
  assert.match(record.execution_manifest, /aws-community-day-taiwan-2026-hardware-splicer\.json$/);
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

test('TFC handoff preserves historical staging and requires live recon before human Send', async () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../examples/opportunities/tfc-nocturnal-pilot-2026.json', import.meta.url), 'utf8'));
  const handoff = await fireHandoffForRoute('partner-tfc-nocturnal-pilot', records);
  assert.equal(handoff.schema, 'blowback.fire_handoff.v1');
  assert.equal(handoff.state, 'READY_FOR_BROWSER_AGENT');
  assert.equal(handoff.target.submission_url, 'https://tfc-taiwan.org.tw/contact-us/');
  assert.equal(handoff.applicant_fields.name, 'Christopher Ongko');
  assert.equal(handoff.applicant_fields.affiliation, 'Yuan Ze University');
  assert.equal(handoff.submission_copy.preferred_language, 'Traditional Chinese');
  assert.match(handoff.submission_copy.message, /Nocturnal/);
  assert.match(handoff.submission_copy.message, /無費用/);
  assert.match(handoff.submission_copy.message_en, /negative result would be just as useful/i);
  assert.ok(handoff.submission_copy.nonclaims.some((claim) => /endorsement/i.test(claim)));
  // Use an existing valid runtime state; the archived staging label is evidence, not an enum extension.
  assert.equal(handoff.live_portal_state.execution_state, 'PORTAL_RECON_REQUIRED');
  assert.equal(handoff.live_portal_state.field_map_verified, true);
  assert.equal(handoff.live_portal_state.field_map.final_submit, '送出');
  assert.equal(manifest.route_evidence.recorded_staging_state, 'STAGED_HUMAN_SEND_GATE');
  assert.equal(manifest.route_evidence.form_staged, true);
  assert.equal(manifest.route_evidence.message_transmitted, false);
  assert.equal(manifest.route_evidence.current_session_verified, false);
  assert.equal(manifest.route_evidence.session_revalidation_required, true);
  assert.equal(manifest.route_evidence.verified_at, '2026-09-17');
  assert.match(manifest.route_evidence.receipt, /TFC_CONTACT_FORM_STAGED_2026-09-17\.md$/);
  assert.equal(handoff.browser_agent_contract.final_submit_policy, 'HUMAN_PROTECTED');
  assert.ok(handoff.browser_agent_contract.human_gate.includes('final_submit_send_apply_confirm'));
  assert.match(handoff.browser_agent_contract.objective, /inspect the current form/i);
});

test('NLnet Nocturnal planning manifest cannot dispatch before portfolio and authorship gates', async () => {
  const record = byId.get('nlnet-restack-nocturnal');
  assert.ok(record);
  assert.equal(record.status, 'PORTFOLIO_BAKEOFF_HUMAN_REWRITE_REQUIRED');
  assert.equal(record.execution_state, 'PACKET_READY');
  assert.match(record.execution_manifest, /nlnet-restack-nocturnal-2026\.json$/);
  await assert.rejects(
    fireHandoffForRoute('nlnet-restack-nocturnal', records),
    /not in an immediate FIRE state/i,
  );
});

test('fire-next ignores expired packets and returns a genuinely executable current route', async () => {
  const handoff = await nextFireHandoff(records, { includePaused: true });
  assert.ok(handoff);
  assert.ok(FIRE_IDS.includes(handoff.route_id), `unexpected next FIRE route ${handoff.route_id}`);
  assert.notEqual(handoff.route_id, 'aws-community-day-taiwan-2026-hardware-splicer');
});

test('fire queue contains the three current executable FIRE bundles including Nocturnal', async () => {
  const queue = await fireHandoffQueue(records, { limit: 10, includePaused: true });
  assert.equal(queue.schema, 'blowback.fire_queue.v1');
  const ids = queue.handoffs.map((handoff) => handoff.route_id);
  assert.deepEqual(new Set(ids), new Set(FIRE_IDS));
  assert.equal(ids.length, FIRE_IDS.length);
  assert.ok(ids.includes('partner-tfc-nocturnal-pilot'));
  assert.ok(!ids.includes('aws-community-day-taiwan-2026-hardware-splicer'));
  assert.ok(!ids.includes('nlnet-restack-nocturnal'));
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
