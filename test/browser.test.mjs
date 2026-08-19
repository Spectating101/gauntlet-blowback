import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { genericAdapter } from '../src/adapters/generic.mjs';

let chromium;
try { ({ chromium } = await import('playwright')); } catch { chromium = null; }

test('generic adapter fills mapped fields but never clicks submit', { skip: !chromium && 'playwright is not installed in this environment' }, async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve('fixtures/form.html')).href);
  const bundle = {
    fields: { project_name: 'Blowback Fixture', tagline: 'Prepared, not submitted' },
    uploads: [],
    opportunity: { field_map: { project_name: { label: 'Project name' }, tagline: { label: 'Tagline' } } }
  };
  await genericAdapter.prepare({ page, bundle });
  assert.equal(await page.getByLabel('Project name').inputValue(), 'Blowback Fixture');
  assert.equal(await page.getByLabel('Tagline').inputValue(), 'Prepared, not submitted');
  assert.equal(page.url().startsWith('file:'), true);
});
