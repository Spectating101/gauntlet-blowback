import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveBrowsersPath } from '../src/core/playwright-home.mjs';

function home(withBrowsers) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-home-'));
  fs.mkdirSync(path.join(dir, '.cache', 'ms-playwright'), { recursive: true });
  // "With browsers" means a browser is installed, not merely that the folder exists.
  if (withBrowsers) fs.mkdirSync(path.join(dir, '.cache', 'ms-playwright', 'chromium_headless_shell-1234'));
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

test('a HOME cache with no browser in it does not count', () => {
  // The real case on 2026-09-30: the student profile's ~/.cache/ms-playwright held only
  // a stray `b/` directory, so trusting the folder's existence sent every launch there.
  const session = home(false);
  fs.mkdirSync(path.join(session, '.cache', 'ms-playwright', 'b'));
  const account = home(true);
  assert.equal(resolveBrowsersPath({ HOME: session }, account),
    path.join(account, '.cache', 'ms-playwright'));
});

test('a HOME cache with a browser in it is trusted', () => {
  assert.equal(resolveBrowsersPath({ HOME: home(true) }, home(true)), null);
});
