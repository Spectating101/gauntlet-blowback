import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { assertNoSecretKeys } from '../src/mission/checkpoint.mjs';
import { assertSafeId, isSafeId } from '../src/core/safe-id.mjs';
import { createRecordDir, writeJson } from '../src/core/record.mjs';
import { persistAccountCheckpoint } from '../src/application/calendar-onboarding.mjs';
import { normalizeOutcome } from '../src/core/outcomes.mjs';

test('safe ids: plain identifiers only', () => {
  for (const ok of ['route-1', 'openai.researcher_access', '__test_waiting_human__', 'a1']) assert.ok(isSafeId(ok), ok);
  for (const bad of ['', '..', '../x', 'a/b', '.hidden', 'a b', 'a..b', null, 7]) assert.ok(!isSafeId(bad), String(bad));
  assert.throws(() => assertSafeId('../../x', 'route id'), /route id must be a plain identifier/);
});

test('secrets: malformed and multiply encoded URLs are still inspected', () => {
  const urls = [
    'https://sso.example.com/l?bad=%E0%A4%A&continue=https%3A%2F%2Fp.example.com%2Fcb%3Ftoken%3Dsecret123',
    'https://p.example.com/cb?%74oken=secret123&x=%E0',
    'https://sso.example.com/l?continue=https%253A%252F%252Fp.example.com%252Fcb%253Ftoken%253Dabc',
  ];
  for (const url of urls) assert.throws(() => assertNoSecretKeys({ current_url: url }), /secret-looking/, url);
});

test('secrets: well-known credential shapes are rejected in free text', () => {
  const notes = [
    'Authorization: Bearer abcdefghijklmnop0123456789',
    'token is eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVPmB92K27uhbUJU1p1r',
    'key sk-live-1234567890abcdefghij',
    'entered password=hunter2',
    'github ghp_abcdefghijklmnopqrstuvwxyz0123456789',
  ];
  for (const note of notes) assert.throws(() => assertNoSecretKeys({ note }), /secret-looking/, note);
  assert.doesNotThrow(() => assertNoSecretKeys({
    note: 'Stopped at password creation; the portal asked for an otp and I left it for the human',
    completed_actions: ['Saved a draft', 'Filled the project summary'],
  }));
});

test('secrets: plural and suffixed key names, authorization and cookies', () => {
  for (const key of ['api_keys', 'secrets', 'cookies', 'cookie', 'authorization', 'client_secret_id'.replace('_id', ''), 'bearer', 'jwt', 'credentials']) {
    assert.throws(() => assertNoSecretKeys({ [key]: 'x' }), /may not store secrets/, key);
  }
  for (const key of ['max_tokens', 'tokens_used', 'authorization_status', 'cookie_banner_seen', 'notes']) {
    assert.doesNotThrow(() => assertNoSecretKeys({ [key]: 'x' }), key);
  }
});

test('record directory: opportunity id cannot traverse out of the records root', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blowback-rec-'));
  await assert.rejects(createRecordDir('../../outside', root), /plain identifier/);
  const dir = await createRecordDir('route-1', root);
  assert.ok(dir.startsWith(root));
  const file = await writeJson(dir, 'result.json', { ok: true });
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  fs.rmSync(root, { recursive: true, force: true });
});

test('account checkpoints refuse email addresses and keep owner-only permissions', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blowback-acct-'));
  assert.throws(() => persistAccountCheckpoint({ scope: 'openreview.net', state: 'ACCOUNT_READY', note: 'signed in as user@private.org' }, { accountDir: dir }), /email address/);
  assert.throws(() => persistAccountCheckpoint({ scope: 'openreview.net', state: 'ACCOUNT_READY', portal_url: 'https://openreview.net/profile?id=~user@private.org' }, { accountDir: dir }), /email address/);
  const { file } = persistAccountCheckpoint({ scope: 'openreview.net', state: 'ACCOUNT_READY', note: 'signed in' }, { accountDir: dir });
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('outcomes: a compensation amount of zero is valid, a missing one is not', () => {
  const base = { opportunity_id: 'r1', stage: 'ACCEPTED' };
  assert.doesNotThrow(() => normalizeOutcome({ ...base, compensation: { currency: 'TWD', amount: 0, period: 'month' } }));
  assert.throws(() => normalizeOutcome({ ...base, compensation: { currency: 'TWD', period: 'month' } }), /compensation requires amount/);
});
