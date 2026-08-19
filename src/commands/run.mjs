import path from 'node:path';
import { loadOpportunity } from '../core/load.mjs';
import { assertOpportunity } from '../core/validate.mjs';
import { resolveBundle } from '../core/resolve.mjs';
import { createRecordDir, writeJson } from '../core/record.mjs';
import { getAdapter } from '../adapters/index.mjs';
import { openBrowser } from '../core/browser.mjs';

export async function runOpportunity(filePath, { persistAuth = false } = {}) {
  const opportunity = await loadOpportunity(filePath);
  assertOpportunity(opportunity);
  const bundle = await resolveBundle(opportunity);
  const adapter = getAdapter(opportunity.portal);
  const recordDir = await createRecordDir(opportunity.id);
  const session = await openBrowser(opportunity);
  try {
    await session.page.goto(opportunity.entry_url, { waitUntil: 'domcontentloaded' });
    await session.page.screenshot({ path: path.join(recordDir, 'before.png'), fullPage: true });
    const result = opportunity.mode === 'inspect'
      ? await adapter.inspect({ page: session.page, bundle })
      : await adapter.prepare({ page: session.page, bundle });
    await session.page.screenshot({ path: path.join(recordDir, 'after.png'), fullPage: true });
    if (persistAuth) await session.persistAuth();
    await writeJson(recordDir, 'result.json', {
      opportunity: opportunity.id,
      mode: opportunity.mode,
      portal: opportunity.portal,
      result,
      human_required: opportunity.human_required,
      final_submit_performed: false
    });
    return { recordDir, result, humanRequired: opportunity.human_required };
  } finally {
    await session.browser.close();
  }
}
