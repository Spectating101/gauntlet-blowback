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
import { protectedCommitmentReason, protectedInputReason } from '../src/adapters/guard.mjs';
import { recipeAdapter } from '../src/adapters/recipe.mjs';
import { genericAdapter } from '../src/adapters/generic.mjs';
import { automaticBundlePreflight, buildFireHandoff } from '../src/application/fire.mjs';

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

// ---- adapters and the fire flow ------------------------------------------------------------


function stubPage(calls) {
  const locator = (kind) => ({
    fill: async (v) => calls.push([kind, 'fill', v]),
    selectOption: async (v) => calls.push([kind, 'select', v]),
    check: async () => calls.push([kind, 'check']),
    uncheck: async () => calls.push([kind, 'uncheck']),
    setInputFiles: async (p) => calls.push([kind, 'upload', p]),
    click: async () => calls.push([kind, 'click']),
    count: async () => 1,
    waitFor: async () => {},
  });
  return {
    getByLabel: (label) => locator(label),
    getByRole: (role, o) => locator(`${role}:${o?.name}`),
    getByPlaceholder: (p) => locator(p),
    locator: (s) => locator(s),
    waitForURL: async () => {},
  };
}

test('guard: consent answers and final-action buttons in several wordings need a human', () => {
  for (const name of ['privacy_notice_ack', 'terms_accepted', 'authorship_declaration', 'eligibility_confirmation', 'signature', 'I agree']) {
    assert.ok(protectedInputReason(name, {}), name);
  }
  for (const label of ['Apply', 'Apply now', 'Confirm', 'Finish', 'Submit application', '確認送出', '立即報名', '提交', '申請']) {
    assert.ok(protectedCommitmentReason('click', { role: 'button', name: label }), label);
  }
  for (const name of ['project_summary', 'research_question', 'working_credit_request_usd', 'organization']) {
    assert.equal(protectedInputReason(name, {}), null, name);
  }
});

test('recipe adapter: attestation fields, consent selects and gated uploads are left for a human', async () => {
  const calls = [];
  const bundle = {
    fields: { project_summary: 'A bounded study', privacy_notice_ack: 'yes', eligibility_status: 'eligible' },
    uploads: [{ name: 'cv', path: '/tmp/cv.pdf' }, { name: 'declaration', path: '/tmp/decl.pdf' }],
    opportunity: {
      upload_map: { declaration: { human_gate: 'signed_declaration' } },
      recipe: { steps: [
        { id: 'f1', action: 'fill', field: 'project_summary', locator: { label: 'Summary' } },
        { id: 'f2', action: 'select', field: 'privacy_notice_ack', locator: { label: 'Privacy' } },
        { id: 'f3', action: 'fill', field: 'eligibility_status', locator: { label: 'Eligibility' } },
        { id: 'u1', action: 'upload', upload: 'cv', locator: { label: 'CV' } },
        { id: 'u2', action: 'upload', upload: 'declaration', locator: { label: 'Declaration' } },
      ] },
    },
  };
  const actions = await recipeAdapter.prepare({ page: stubPage(calls), bundle });
  const byId = Object.fromEntries(actions.map((a) => [a.id, a]));
  assert.equal(byId.f1.status, 'filled');
  assert.equal(byId.f2.status, 'skipped_protected');
  assert.equal(byId.f3.status, 'skipped_protected');
  assert.equal(byId.u1.status, 'uploaded');
  assert.equal(byId.u2.status, 'upload_skipped_human_gate');
  assert.deepEqual(calls.map((c) => c[1]).sort(), ['fill', 'upload']);
});

test('generic adapter: a consent or eligibility answer is skipped, ordinary fields are filled', async () => {
  const calls = [];
  const bundle = {
    fields: { project_summary: 'A bounded study', terms_of_use_accepted: 'yes' },
    uploads: [],
    opportunity: { field_map: {
      project_summary: { action: 'fill', label: 'Summary' },
      terms_of_use_accepted: { action: 'select', label: 'Terms' },
    } },
  };
  const actions = await genericAdapter.prepare({ page: stubPage(calls), bundle });
  assert.equal(actions.find((a) => a.name === 'project_summary').status, 'filled');
  assert.equal(actions.find((a) => a.name === 'terms_of_use_accepted').status, 'skipped_protected');
});

test('preflight: an automatic route whose upload file is missing is not ready', () => {
  const op = { packet_revision: 'p1', final_copy_revision: 'c1', route_evidence: { verified_at: '2026-10-10' } };
  const missing = automaticBundlePreflight(op, new Date('2026-10-14T12:00:00Z'), { source_revision: 'c1' },
    { uploads: [{ name: 'abstract', path: '/definitely/not/here.pdf' }] });
  assert.equal(missing.ready, false);
  assert.ok(missing.reasons.includes('upload_file_missing:abstract'));
  const present = automaticBundlePreflight(op, new Date('2026-10-14T12:00:00Z'), { source_revision: 'c1' },
    { uploads: [{ name: 'self', path: new URL(import.meta.url).pathname }] });
  assert.equal(present.ready, true);
});

test('a manifest marked manual_only never becomes a browser handoff', async () => {
  const record = {
    id: 'anthropic-external-researcher-access-2026',
    status: 'FIRE_NOW',
    execution_manifest: 'examples/opportunities/anthropic-external-researcher-access-hardware-splicer.json',
  };
  await assert.rejects(buildFireHandoff(record), /manual-only/);
});

test('the browser contract carries the human gates the manifest declares, not just the built-in list', async () => {
  const file = 'examples/opportunities/openai-researcher-access-hardware-splicer.json';
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  const record = { id: manifest.id, status: 'FIRE_NOW', execution_manifest: file, deadline: '2099-01-01', organization: 'test', opportunity: 'test' };
  const handoff = await buildFireHandoff(record);
  const gates = handoff.browser_agent_contract.human_gate;
  for (const gate of manifest.human_required) assert.ok(gates.includes(gate), gate);
  assert.ok(gates.includes('final_submit_send_apply_confirm'));
  assert.equal(new Set(gates).size, gates.length, 'no duplicates');
});
