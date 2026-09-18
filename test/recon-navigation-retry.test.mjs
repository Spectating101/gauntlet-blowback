import assert from 'node:assert/strict';
import test from 'node:test';

import { collectReconSnapshotWithNavigationRetry } from '../src/commands/recon.mjs';

const EMPTY_SNAPSHOT = {
  title: 'Application',
  url: 'https://example.test/apply',
  links: [],
  controls: [],
  buttons: [],
  forms: [],
  iframes: [],
  signals: {
    password_inputs: 0,
    email_or_username_inputs: 0,
    captcha: false,
    two_factor: false,
    login: false,
  },
};

function pageStub(evaluate) {
  return {
    evaluate,
    waitForLoadStateCalls: [],
    waitForTimeoutCalls: [],
    async waitForLoadState(...args) { this.waitForLoadStateCalls.push(args); },
    async waitForTimeout(...args) { this.waitForTimeoutCalls.push(args); },
  };
}

test('recon retries a snapshot after a redirect destroys the execution context', async () => {
  let calls = 0;
  const page = pageStub(async () => {
    calls += 1;
    if (calls === 1) throw new Error('Execution context was destroyed, most likely because of a navigation');
    return EMPTY_SNAPSHOT;
  });

  const result = await collectReconSnapshotWithNavigationRetry(page);

  assert.equal(result.title, 'Application');
  assert.equal(calls, 2);
  assert.equal(page.waitForLoadStateCalls.length, 1);
  assert.equal(page.waitForTimeoutCalls.length, 1);
});

test('recon exhausts the declared redirect retry budget', async () => {
  let calls = 0;
  const page = pageStub(async () => {
    calls += 1;
    throw new Error('Execution context was destroyed, most likely because of a navigation');
  });

  await assert.rejects(
    collectReconSnapshotWithNavigationRetry(page, { attempts: 2 }),
    /Execution context was destroyed/,
  );
  assert.equal(calls, 2);
  assert.equal(page.waitForLoadStateCalls.length, 1);
});

test('recon fails fast on a non-navigation browser error', async () => {
  let calls = 0;
  const page = pageStub(async () => {
    calls += 1;
    throw new Error('selector engine failed');
  });

  await assert.rejects(collectReconSnapshotWithNavigationRetry(page), /selector engine failed/);
  assert.equal(calls, 1);
  assert.equal(page.waitForLoadStateCalls.length, 0);
});

test('recon retry remains observation-only', async () => {
  let calls = 0;
  const page = pageStub(async () => {
    calls += 1;
    if (calls === 1) throw new Error('Cannot find context with specified id');
    return EMPTY_SNAPSHOT;
  });
  for (const method of ['click', 'fill', 'check', 'setInputFiles', 'selectOption', 'type', 'press']) {
    page[method] = async () => { throw new Error(`mutation method called: ${method}`); };
  }

  const result = await collectReconSnapshotWithNavigationRetry(page);
  assert.equal(result.url, 'https://example.test/apply');
  assert.equal(calls, 2);
});
