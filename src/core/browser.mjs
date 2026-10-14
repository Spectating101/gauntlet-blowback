import fs from 'node:fs';
import path from 'node:path';
import './playwright-home.mjs'; // must precede 'playwright': it fixes the browser path at import
import { chromium, firefox, webkit } from 'playwright';
import { resolveAuthScope } from './routes.mjs';

const browsers = { chromium, firefox, webkit };

export async function openBrowser(opportunity) {
  const browserName = process.env.BLOWBACK_BROWSER || 'chromium';
  const type = browsers[browserName];
  if (!type) throw new Error(`Unknown browser: ${browserName}`);
  const headless = process.env.BLOWBACK_HEADLESS === 'true';
  const browser = await type.launch({ headless });
  const authDir = path.resolve(process.env.BLOWBACK_AUTH_DIR || '.auth');
  const authScope = resolveAuthScope(opportunity);
  const statePath = path.join(authDir, `${authScope}.json`);
  const contextOptions = {};
  if (fs.existsSync(statePath)) contextOptions.storageState = statePath;
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  return {
    browser, context, page, statePath, authScope,
    async persistAuth() {
      fs.mkdirSync(authDir, { recursive: true, mode: 0o700 });
      await context.storageState({ path: statePath });
      fs.chmodSync(statePath, 0o600); // session cookies: owner only
    }
  };
}
