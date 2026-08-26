import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { genericAdapter } from '../src/adapters/generic.mjs';
import { collectReconSnapshot } from '../src/commands/recon.mjs';

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

test('recon snapshot discovers routes and controls without mutating form state', { skip: !chromium && 'playwright is not installed in this environment' }, async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve('fixtures/recon.html')).href);

  const beforeEmail = await page.getByLabel('Email').inputValue();
  const snapshot = await collectReconSnapshot(page);
  const afterEmail = await page.getByLabel('Email').inputValue();

  assert.equal(beforeEmail, '');
  assert.equal(afterEmail, '');
  assert.equal(snapshot.title, 'Recon Fixture');
  assert.equal(snapshot.forms.length, 1);
  assert.equal(snapshot.file_inputs.length, 1);
  assert.equal(snapshot.signals.password_inputs, 1);
  assert.equal(snapshot.signals.captcha, true);
  assert.equal(snapshot.candidate_links.some((link) => link.kind === 'registration'), true);
  assert.equal(snapshot.candidate_links.some((link) => link.kind === 'auth'), true);
});
