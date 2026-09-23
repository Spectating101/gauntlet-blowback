import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveBrowsersPath } from '../src/core/playwright-home.mjs';

function home(withBrowsers) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-home-'));
  if (withBrowsers) fs.mkdirSync(path.join(dir, '.cache', 'ms-playwright'), { recursive: true });
  return dir;
}

test('an explicit PLAYWRIGHT_BROWSERS_PATH always wins', () => {
  assert.equal(resolveBrowsersPath({ PLAYWRIGHT_BROWSERS_PATH: '/opt/pw', HOME: home(true) }, home(true)), '/opt/pw');
});

test('a HOME that already has browsers is left alone', () => {
  assert.equal(resolveBrowsersPath({ HOME: home(true) }, home(true)), null);
});

test('a per-session HOME with no browsers falls back to the account home', () => {
  // The real failure: Claude Code set HOME to .claude-home/main, where nothing
  // was ever downloaded, while the browsers sat in the account's own ~/.cache.
  const account = home(true);
  assert.equal(resolveBrowsersPath({ HOME: home(false) }, account),
    path.join(account, '.cache', 'ms-playwright'));
});

test('with browsers nowhere, nothing is invented', () => {
  assert.equal(resolveBrowsersPath({ HOME: home(false) }, home(false)), null);
});
