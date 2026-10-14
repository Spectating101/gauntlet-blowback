import test from 'node:test';
import assert from 'node:assert/strict';

import {
  automaticBundlePreflight,
  fireHandoffQueue,
  nextFireHandoff,
  validateFireReceipt,
} from '../src/application/fire.mjs';
import { assertNoSecretKeys, validateCheckpoint } from '../src/mission/checkpoint.mjs';

const AS_OF = new Date('2026-10-14T12:00:00Z');

function opportunity(evidence = {}, extra = {}) {
  return {
    packet_revision: 'p1',
    final_copy_revision: 'c1',
    route_evidence: { verified_at: '2026-10-10', ...evidence },
    ...extra,
  };
}

function receipt(overrides = {}) {
  return {
    schema: 'blowback.fire_receipt.v1',
    mission_id: 'mission:route-1',
    route_id: 'route-1',
    status: 'WAITING_HUMAN',
    stage: 'final_review',
    ...overrides,
  };
}

test('preflight accepts a fresh, real verification date', () => {
  const result = automaticBundlePreflight(opportunity(), AS_OF);
  assert.equal(result.ready, true);
  assert.equal(result.official_source_verified_at, '2026-10-10');
});

test('preflight rejects dates that look valid but are not real calendar days', () => {
  for (const bad of ['2026-13-01', '2026-02-32', '2026-00-10']) {
    const result = automaticBundlePreflight(opportunity({ verified_at: bad }), AS_OF);
    assert.equal(result.ready, false, bad);
    assert.ok(result.reasons.includes('official_source_verification_missing'), bad);
    assert.ok(!Number.isNaN(result.official_source_age_days ?? 0), bad);
  }
});

test('preflight skips an unreadable date and uses the next valid verification key', () => {
  const result = automaticBundlePreflight(
    opportunity({ verified_at: '2026-13-01', official_call_reverified: '2026-10-12' }),
    AS_OF,
  );
  assert.equal(result.ready, true);
  assert.equal(result.official_source_verified_at, '2026-10-12');
});

test('preflight still flags stale and future-dated verification', () => {
  const stale = automaticBundlePreflight(opportunity({ verified_at: '2026-09-01' }), AS_OF);
  assert.ok(stale.reasons.includes('official_source_verification_stale'));
  const future = automaticBundlePreflight(opportunity({ verified_at: '2026-10-20' }), AS_OF);
  assert.ok(future.reasons.includes('official_source_verification_is_future_dated'));
});

test('preflight flags a fire packet whose revision disagrees with the manifest', () => {
  const mismatch = automaticBundlePreflight(opportunity(), AS_OF, { source_revision: 'c0' });
  assert.equal(mismatch.ready, false);
  assert.ok(mismatch.reasons.includes('final_copy_revision_mismatch_with_fire_packet'));
  const match = automaticBundlePreflight(opportunity(), AS_OF, { source_revision: 'c1' });
  assert.equal(match.ready, true);
  const absent = automaticBundlePreflight(opportunity(), AS_OF, {});
  assert.equal(absent.ready, false);
  assert.ok(absent.reasons.includes('fire_packet_source_revision_missing'));
});

test('preflight date shape must be a full date, optionally followed by a time', () => {
  for (const bad of ['2026-10-10-corrupt', '2026-10-10x']) {
    assert.equal(automaticBundlePreflight(opportunity({ verified_at: bad }), AS_OF).ready, false, bad);
  }
  assert.equal(automaticBundlePreflight(opportunity({ verified_at: '2026-10-10T08:30:00Z' }), AS_OF).ready, true);
});

test('asOf must be a real date: null, booleans and arrays are not quietly read as 1970', async () => {
  for (const bad of [null, false, true, [], {}]) {
    assert.throws(() => automaticBundlePreflight(opportunity(), bad), /invalid FIRE preflight date/, String(bad));
    await assert.rejects(nextFireHandoff([], { asOf: bad }), /invalid asOf/, String(bad));
  }
});

test('queue and next-handoff throw on an invalid asOf instead of silently returning nothing', async () => {
  await assert.rejects(nextFireHandoff([], { asOf: 'not-a-date' }), /invalid asOf/);
  await assert.rejects(fireHandoffQueue([], { asOf: 'not-a-date' }), /invalid asOf/);
});

test('receipt: blank or untyped submission fields do not satisfy SUBMITTED', () => {
  assert.throws(() => validateFireReceipt(receipt({ status: 'SUBMITTED', submitted_at: '   ', application_id: 'A1' })), /submitted_at/);
  assert.throws(() => validateFireReceipt(receipt({ status: 'SUBMITTED', submitted_at: '2026-10-14T10:00:00Z', application_id: '  ' })), /application_id or receipt_refs/);
  assert.throws(() => validateFireReceipt(receipt({ status: 'SUBMITTED', submitted_at: '2026-10-14T10:00:00Z', receipt_refs: [''] })), /application_id or receipt_refs/);
  assert.throws(() => validateFireReceipt(receipt({ status: 'SUBMITTED', submitted_at: {}, application_id: 'A1' })), /submitted_at must be a string/);
  const ok = validateFireReceipt(receipt({ status: 'SUBMITTED', submitted_at: '2026-10-14T10:00:00Z', application_id: 'A1' }));
  assert.equal(ok.application_id, 'A1');
});

test('receipt: blank timestamps normalise to null so they cannot blank the receipt filename', () => {
  const result = validateFireReceipt(receipt({ submitted_at: '', observed_at: '' }));
  assert.equal(result.submitted_at, null);
  assert.ok(result.observed_at.length > 0);
  assert.ok(!Number.isNaN(Date.parse(result.observed_at)));
});

test('receipt: timestamps must parse, and blank identity fields are rejected', () => {
  assert.throws(() => validateFireReceipt(receipt({ status: 'SUBMITTED', submitted_at: '???', application_id: 'A1' })), /submitted_at/);
  assert.throws(() => validateFireReceipt(receipt({ observed_at: 'yesterday-ish' })), /observed_at/);
  assert.throws(() => validateFireReceipt(receipt({ mission_id: '   ' })), /mission_id/);
  assert.throws(() => validateFireReceipt(receipt({ stage: '  ' })), /stage/);
  const ok = validateFireReceipt(receipt({ status: 'SUBMITTED', submitted_at: '2026-10-14 10:00:00Z', application_id: 'A1' }));
  assert.equal(ok.submitted_at, '2026-10-14T10:00:00.000Z');
});

test('receipt: route ids must be plain identifiers', () => {
  for (const bad of ['../../tmp/pwn', 'a/b', '..', '.hidden', 'a b', '']) {
    assert.throws(() => validateFireReceipt(receipt({ route_id: bad })), /route_id/, JSON.stringify(bad));
  }
});

test('checkpoint: route ids cannot traverse out of the state directory', () => {
  const base = { mission_id: 'mission:x', status: 'WAITING_HUMAN', stage: 'final_review' };
  assert.throws(() => validateCheckpoint({ ...base, route_id: '../../tmp/pwn' }), /plain identifier/);
  assert.equal(validateCheckpoint({ ...base, route_id: 'openai-researcher-access-hardware-splicer' }).route_id, 'openai-researcher-access-hardware-splicer');
  assert.equal(validateCheckpoint({ ...base, route_id: '__test_waiting_human__' }).route_id, '__test_waiting_human__');
});

test('secrets: credentials in URLs are rejected', () => {
  const urls = [
    'https://portal.example.com/cb?token=abc123',
    'https://p.example.com/b?x=1&api_key=zzz',
    'https://p.example.com/b?api-key=zzz&x=1',
    'https://p.example.com/#access_token=abc',
    'https://p.example.com/cb?session-id=s456',
    'https://p.example.com/cb?X-Amz-Signature=abc123',
    'https://sso.example.com/l?continue=https%3A%2F%2Fp.example.com%2Fcb%3Ftoken%3Dabc123',
    'https://applicant:MySecretPassword@portal.example.com/apply',
  ];
  for (const url of urls) {
    assert.throws(() => assertNoSecretKeys({ current_url: url }), /secret-looking URL parameter/, url);
  }
  assert.throws(() => assertNoSecretKeys({ visited_urls: ['https://portal.example.com/a', 'https://p.example.com/b?otp=123456'] }), /visited_urls\.1/);
});

test('secrets: ordinary URLs and notes are not mistaken for credentials', () => {
  const urls = [
    'https://forms.gle/pZYC8f6qYqSKvRWn9?usp=sf_link',
    'https://portal.example.com/apply?rootpath=/grants',
    'https://portal.example.com/apply?secretary_name=Smith',
    'https://portal.example.com/apply?max_tokens=4096&notpublic=true&hotpath=1',
    'https://portal.example.com/apply?country_code=TW&lang=zh',
    'mailto:person@example.com',
  ];
  for (const url of urls) assert.doesNotThrow(() => assertNoSecretKeys({ current_url: url }), url);
  assert.doesNotThrow(() => assertNoSecretKeys({
    note: 'Completed compute budget section;max_tokens=4096 and left the "Team token" field empty',
    completed_actions: ['Saved a draft', 'Stopped at the human gate (otp requested by portal)'],
  }));
});

test('secrets: key names are matched in camelCase and with common suffixes', () => {
  for (const key of ['access_token', 'apiKey', 'api-key', 'secret_key', 'otp_code', 'password_hash', 'cardNumber', 'sessionKey']) {
    assert.throws(() => assertNoSecretKeys({ [key]: 'x' }), /may not store secrets/, key);
  }
  for (const key of ['max_tokens', 'tokens_used', 'secretary', 'rootpath', 'note', 'receipt_refs']) {
    assert.doesNotThrow(() => assertNoSecretKeys({ [key]: 'x' }), key);
  }
});
