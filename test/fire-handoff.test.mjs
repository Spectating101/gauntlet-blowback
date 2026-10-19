import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

const records = buildMasterRegistry();
const byId = new Map(records.map((record) => [record.id, record]));
const historicalRecords = buildMasterRegistry({ includeArchived: true });
const historicalById = new Map(historicalRecords.map((record) => [record.id, record]));
// Immediate FIRE routes in the live master today. The Anthropic route is no longer here:
// the applicant submitted it on 2026-10-03 (data/submission-review-2026-10-08.json), so it
// is SUBMITTED and must not be dispatched again.
const FIRE_IDS = [
  'openai-researcher-access-hardware-splicer',
  'partner-tfc-nocturnal-pilot',
];
// As-of date for automatic-queue tests: the OpenAI route's verification day, so the
// results do not change with the calendar (it goes stale 14 days later).
const AUTOMATIC_AS_OF = '2026-10-08T12:00:00+08:00';

test('current immediate FIRE routes expose explicit execution manifests in the Gauntlet master', () => {
  for (const id of FIRE_IDS) {
    const record = byId.get(id);
    assert.ok(record, `missing FIRE route ${id}`);
    assert.equal(record.status, 'FIRE_NOW');
    assert.match(record.execution_manifest, /^examples\/opportunities\/.+\.json$/);
  }
});

test('expired AWS CFP packet is retained but cannot dispatch through FIRE', async () => {
  const record = historicalById.get('aws-community-day-taiwan-2026-hardware-splicer');
  assert.ok(record);
  assert.equal(record.status, 'EXPIRED_RETAIN');
  assert.equal(record.execution_state, 'RESEARCH_ONLY');
  assert.match(record.execution_manifest, /aws-community-day-taiwan-2026-hardware-splicer\.json$/);
  await assert.rejects(
    fireHandoffForRoute('aws-community-day-taiwan-2026-hardware-splicer', historicalRecords),
    /not in an immediate FIRE state/i,
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
  assert.ok(handoff.receipt_contract.template.human_required.includes('login'));
  assert.ok(handoff.receipt_contract.template.human_required.includes('final_submit'));
});

test('Anthropic FIRE handoff preserves narrow AI-control framing instead of generic product development', async () => {
  // The route is SUBMITTED and its manifest is manual_only, so no browser handoff exists.
  // The framing lives in the fire packet copy and the manifest, so assert those sources.
  const record = byId.get('anthropic-external-researcher-access-2026');
  assert.equal(record.status, 'SUBMITTED');
  await assert.rejects(
    fireHandoffForRoute('anthropic-external-researcher-access-2026', records),
    /not in an immediate FIRE state/i,
  );
  const manifest = readJson(record.execution_manifest);
  const submissionCopy = readJson(manifest.fire_packet.replace(/^\.\.\//, 'examples/')).copy;
  assert.equal(manifest.registration_url, 'https://forms.gle/pZYC8f6qYqSKvRWn9');
  assert.match(submissionCopy.why_ai_safety, /safety claim I want to test is deliberately small/i);
  assert.match(submissionCopy.research_summary, /200 Claude Sonnet 5 runs/i);
  assert.match(submissionCopy.strongest_one_sentence_contribution, /simple checks outside the model/i);
  assert.ok(submissionCopy.nonclaims.some((claim) => /general alignment solution/i.test(claim)));
  assert.ok(manifest.human_required.includes('anthropic_console_organization_id'));
  assert.ok(manifest.human_required.includes('terms_acceptance'));
  assert.ok(manifest.human_required.includes('final_submit'));
});

test('TAAI packet remains preserved but fee-gated out of immediate FIRE', async () => {
  assert.equal(historicalById.get('taai-2026-domestic-hardware-splicer').status, 'HOLD_FEE_AND_LIVE_CALL_STATE');
  await assert.rejects(
    () => fireHandoffForRoute('taai-2026-domestic-hardware-splicer', historicalRecords),
    /not in an immediate FIRE state/,
  );
});

test('TFC Nocturnal pilot handoff is bilingual and stops before final Send', async () => {
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
  assert.equal(handoff.live_portal_state.execution_state, 'PORTAL_RECON_REQUIRED');
  assert.equal(handoff.live_portal_state.field_map_verified, false);
  assert.equal(handoff.browser_agent_contract.final_submit_policy, 'HUMAN_PROTECTED');
  assert.ok(handoff.browser_agent_contract.human_gate.includes('final_submit_send_apply_confirm'));
});

test('NLnet Nocturnal planning manifest cannot dispatch before portfolio and authorship gates', async () => {
  const record = byId.get('nlnet-restack-nocturnal');
  assert.ok(record);
  // Set by the 2026-10-08 route correction (data/route-corrections-2026-09-21.json): the
  // general NLnet form's licensing, European-dimension and genAI-policy gates are open.
  assert.equal(record.status, 'HOLD_FUND_GEOGRAPHY_LICENSING_AND_AI_POLICY');
  assert.equal(record.execution_state, 'DEPENDENCY_RECON_REQUIRED');
  assert.match(record.execution_manifest, /nlnet-restack-nocturnal-2026\.json$/);
  await assert.rejects(
    fireHandoffForRoute('nlnet-restack-nocturnal', records),
    /not in an immediate FIRE state/i,
  );
});

test('fire-next ignores expired packets and returns a genuinely executable current route', async () => {
  // Pinned to the OpenAI verification day: the automatic queue refuses it after 14 days.
  const handoff = await nextFireHandoff(records, { asOf: AUTOMATIC_AS_OF });
  assert.ok(handoff);
  assert.ok(FIRE_IDS.includes(handoff.route_id), `unexpected next FIRE route ${handoff.route_id}`);
  assert.notEqual(handoff.route_id, 'aws-community-day-taiwan-2026-hardware-splicer');
});

test('fire queue holds the executable bundles and leaves the paused Nocturnal campaign to a human', async () => {
  const queue = await fireHandoffQueue(records, { limit: 10, asOf: AUTOMATIC_AS_OF });
  assert.equal(queue.schema, 'blowback.fire_queue.v1');
  const ids = queue.handoffs.map((handoff) => handoff.route_id);
  const automatic = FIRE_IDS.filter((id) => id !== 'partner-tfc-nocturnal-pilot');
  assert.deepEqual(new Set(ids), new Set(automatic));
  // The TFC pilot is live and can be sent by name, but the applicant paused Nocturnal
  // campaigns from the automatic queue (data/applicant-document-readiness-2026-09-12.json).
  assert.ok(!ids.includes('partner-tfc-nocturnal-pilot'));
  assert.ok(queue.skipped.some((item) => item.route_id === 'partner-tfc-nocturnal-pilot'
    && item.reasons.includes('user_owned_asset_campaign')));
  assert.ok(!ids.includes('aws-community-day-taiwan-2026-hardware-splicer'));
  assert.ok(!ids.includes('nlnet-restack-nocturnal'));
  assert.ok(queue.handoffs.every((handoff) => handoff.state === 'READY_FOR_BROWSER_AGENT'));
});

test('expired hard-date FIRE routes do not stay in the live execution queue', async () => {
  // After the AWS CFP closed (2026-09-07) and on the day the OpenAI route was verified
  // (2026-10-08): an earlier date would reject that verification as future-dated. The
  // Anthropic route is SUBMITTED, so it is no longer in the live queue at any date.
  const queue = await fireHandoffQueue(records, { limit: 10, asOf: '2026-10-08T12:00:00+08:00', includePaused: true });
  assert.ok(!queue.handoffs.some((handoff) => handoff.route_id === 'aws-community-day-taiwan-2026-hardware-splicer'));
  assert.deepEqual(queue.handoffs.map((handoff) => handoff.route_id), [
    'openai-researcher-access-hardware-splicer',
  ]);

  // The Shih Hsin pause is only visible while that route is still open (deadline 2026-09-17).
  const beforeShihHsinClosed = await fireHandoffQueue(records, { limit: 10, asOf: '2026-09-16T12:00:00+08:00', includePaused: true });
  assert.ok(beforeShihHsinClosed.skipped.some((item) => item.route_id === 'shih-hsin-finance-2026-il'
    && item.reasons.includes('user_paused_named_route')));
});

test('automatic FIRE refuses stale official-source observations', async () => {
  // The OpenAI route was verified on 2026-10-08 and goes stale after 14 days, so the
  // as-of date is 16 days after that verification (the Anthropic route is SUBMITTED and
  // never reaches the automatic queue).
  const openaiVerified = readJson('examples/opportunities/openai-researcher-access-hardware-splicer.json')
    .route_evidence.verified_at;
  const staleAsOf = new Date(Date.parse(`${openaiVerified}T00:00:00Z`) + 16 * 86_400_000).toISOString();
  const queue = await fireHandoffQueue(records, { limit: 10, asOf: staleAsOf, includePaused: true });
  assert.equal(queue.count, 0);
  assert.ok(!queue.handoffs.some((handoff) => handoff.route_id === 'anthropic-external-researcher-access-2026'));
  assert.ok(queue.skipped.some((item) => item.route_id === 'openai-researcher-access-hardware-splicer'
    && /official_source_verification_stale/.test(item.detail ?? '')));
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
