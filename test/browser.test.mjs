import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { genericAdapter } from '../src/adapters/generic.mjs';
import { recipeAdapter } from '../src/adapters/recipe.mjs';
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

test('generic adapter refuses protected secret and privacy controls', { skip: !chromium && 'playwright is not installed in this environment' }, async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve('fixtures/recipe.html')).href);
  const bundle = {
    fields: { project_name: 'Safe Value', password: 'do-not-fill', privacy: true },
    uploads: [],
    opportunity: {
      field_map: {
        project_name: { label: 'Project name' },
        password: { label: 'Password' },
        privacy: { label: 'Privacy agreement', action: 'check', human_gate: 'terms_acceptance' }
      }
    }
  };
  const result = await genericAdapter.prepare({ page, bundle });
  assert.equal(await page.getByLabel('Project name').inputValue(), 'Safe Value');
  assert.equal(await page.getByLabel('Password').inputValue(), '');
  assert.equal(await page.getByLabel('Privacy agreement').isChecked(), false);
  assert.equal(result.filter((item) => item.status === 'skipped_protected').length, 2);
});

test('recipe adapter executes verified reversible navigation and stops before final submit', { skip: !chromium && 'playwright is not installed in this environment' }, async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve('fixtures/recipe.html')).href);
  const bundle = {
    fields: {
      project_name: 'Recipe Fixture',
      password: 'do-not-fill',
      privacy: true,
      description: 'Prepared across pages'
    },
    uploads: [{ name: 'deck', path: path.resolve('package.json') }],
    opportunity: {
      recipe: {
        steps: [
          { id: 'name', action: 'fill', field: 'project_name', locator: { label: 'Project name' } },
          { id: 'password', action: 'fill', field: 'password', locator: { label: 'Password' } },
          { id: 'privacy', action: 'check', field: 'privacy', locator: { label: 'Privacy agreement', human_gate: 'terms_acceptance' } },
          { id: 'next', action: 'click', safe_navigation: true, locator: { role: 'button', name: 'Next' }, wait_for: { label: 'Description' } },
          { id: 'description', action: 'fill', field: 'description', locator: { label: 'Description' } },
          { id: 'deck', action: 'upload', upload: 'deck', locator: { label: 'Deck' } },
          { id: 'final-submit', action: 'stop', reason: 'final_submit' }
        ]
      }
    }
  };

  const result = await recipeAdapter.prepare({ page, bundle });
  assert.equal(await page.getByLabel('Project name').inputValue(), 'Recipe Fixture');
  assert.equal(await page.getByLabel('Password').inputValue(), '');
  assert.equal(await page.getByLabel('Privacy agreement').isChecked(), false);
  assert.equal(await page.getByLabel('Description').inputValue(), 'Prepared across pages');
  assert.equal((await page.getByLabel('Deck').inputValue()).endsWith('package.json'), true);
  assert.equal(await page.evaluate(() => window.finalSubmitClicks), 0);
  assert.equal(result.some((item) => item.status === 'clicked_safe_navigation'), true);
  assert.equal(result.at(-1).status, 'human_gate');
});

test('recipe adapter refuses click steps that look consequential even when marked safe_navigation', { skip: !chromium && 'playwright is not installed in this environment' }, async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve('fixtures/recipe.html')).href);
  await page.getByRole('button', { name: 'Next' }).click();
  const bundle = {
    fields: {},
    uploads: [],
    opportunity: {
      recipe: {
        steps: [
          { id: 'submit', action: 'click', safe_navigation: true, locator: { role: 'button', name: 'Submit' } }
        ]
      }
    }
  };
  const result = await recipeAdapter.prepare({ page, bundle });
  assert.equal(await page.evaluate(() => window.finalSubmitClicks), 0);
  assert.equal(result[0].status, 'skipped_protected');
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
