// Point Playwright at the browsers that are actually installed.
//
// Playwright resolves its browser directory once, when the package is first
// imported, from $HOME/.cache/ms-playwright. Claude Code and some agent runners
// start processes with HOME set to a per-session config directory, where no
// browser was ever downloaded, so every launch failed with "Executable doesn't
// exist" even though the browsers sat in the account's real home all along.
//
// This module must be imported BEFORE 'playwright'. It changes nothing when
// PLAYWRIGHT_BROWSERS_PATH is already set, or when $HOME already has browsers.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// A cache folder can exist with nothing usable in it -- the student profile's held
// only a stray `b/` directory -- so it counts only if a browser is installed there.
function hasBrowsers(dir) {
  try {
    return fs.readdirSync(dir).some((name) => /^(chromium|firefox|webkit)/.test(name));
  } catch {
    return false;
  }
}

export function resolveBrowsersPath(env = process.env, accountHome = os.userInfo().homedir) {
  if (env.PLAYWRIGHT_BROWSERS_PATH) return env.PLAYWRIGHT_BROWSERS_PATH;
  const fromHome = env.HOME ? path.join(env.HOME, '.cache', 'ms-playwright') : null;
  if (fromHome && hasBrowsers(fromHome)) return null;
  // The password database, not HOME, knows the real home: HOME is the value
  // that was wrong.
  const fromAccount = path.join(accountHome, '.cache', 'ms-playwright');
  return hasBrowsers(fromAccount) ? fromAccount : null;
}

const resolved = resolveBrowsersPath();
if (resolved && !process.env.PLAYWRIGHT_BROWSERS_PATH) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = resolved;
}
