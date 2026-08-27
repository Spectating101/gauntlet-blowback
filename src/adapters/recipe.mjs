import { protectedCommitmentReason, protectedFieldReason } from './guard.mjs';

function locatorFor(page, spec) {
  if (spec.role) return page.getByRole(spec.role, { name: spec.name, exact: spec.exact ?? false });
  if (spec.label) return page.getByLabel(spec.label, { exact: spec.exact ?? false });
  if (spec.placeholder) return page.getByPlaceholder(spec.placeholder, { exact: spec.exact ?? false });
  if (spec.selector) return page.locator(spec.selector);
  throw new Error(`Recipe locator requires role/name, label, placeholder, or selector: ${JSON.stringify(spec)}`);
}

function requireValue(bundle, step) {
  if (step.field) {
    if (!(step.field in bundle.fields)) throw new Error(`Recipe field is unresolved: ${step.field}`);
    return bundle.fields[step.field];
  }
  if ('value' in step) return step.value;
  throw new Error(`Recipe ${step.action} step requires field or value: ${step.id ?? '(unnamed)'}`);
}

function requireUpload(bundle, step) {
  const upload = bundle.uploads.find((item) => item.name === step.upload);
  if (!upload) throw new Error(`Recipe upload is unresolved: ${step.upload}`);
  return upload;
}

async function waitAfter(page, step) {
  if (step.wait_for) await locatorFor(page, step.wait_for).waitFor({ state: step.wait_state ?? 'visible' });
  if (step.wait_url) await page.waitForURL(step.wait_url);
}

export const recipeAdapter = {
  id: 'recipe',

  async inspect({ page, bundle }) {
    const findings = [];
    for (const step of bundle.opportunity.recipe?.steps ?? []) {
      if (!step.locator) {
        findings.push({ id: step.id ?? null, action: step.action, status: 'no_locator' });
        continue;
      }
      const count = await locatorFor(page, step.locator).count();
      findings.push({ id: step.id ?? null, action: step.action, status: count > 0 ? 'found_on_current_page' : 'not_on_current_page', matches: count });
    }
    return findings;
  },

  async prepare({ page, bundle }) {
    const actions = [];
    for (const step of bundle.opportunity.recipe?.steps ?? []) {
      const id = step.id ?? `${step.action}-${actions.length + 1}`;

      if (step.action === 'stop') {
        actions.push({ id, action: 'stop', status: 'human_gate', reason: step.reason ?? 'explicit recipe stop' });
        break;
      }

      if (step.action === 'wait') {
        await waitAfter(page, step);
        actions.push({ id, action: 'wait', status: 'completed' });
        continue;
      }

      if (!step.locator) throw new Error(`Recipe step ${id} requires locator`);
      const locator = locatorFor(page, step.locator);

      if (step.action === 'fill') {
        const protectedReason = protectedFieldReason(step.field ?? id, step.locator);
        if (protectedReason) {
          actions.push({ id, action: 'fill', status: 'skipped_protected', reason: protectedReason });
          continue;
        }
        await locator.fill(String(requireValue(bundle, step)));
        await waitAfter(page, step);
        actions.push({ id, action: 'fill', status: 'filled' });
        continue;
      }

      if (step.action === 'select') {
        const protectedReason = protectedFieldReason(step.field ?? id, step.locator);
        if (protectedReason) {
          actions.push({ id, action: 'select', status: 'skipped_protected', reason: protectedReason });
          continue;
        }
        await locator.selectOption(String(requireValue(bundle, step)));
        await waitAfter(page, step);
        actions.push({ id, action: 'select', status: 'selected' });
        continue;
      }

      if (step.action === 'check') {
        const protectedReason = protectedCommitmentReason(step.field ?? id, step.locator);
        if (protectedReason) {
          actions.push({ id, action: 'check', status: 'skipped_protected', reason: protectedReason });
          continue;
        }
        const value = Boolean(requireValue(bundle, step));
        if (value) await locator.check(); else await locator.uncheck();
        await waitAfter(page, step);
        actions.push({ id, action: 'check', status: value ? 'checked' : 'unchecked' });
        continue;
      }

      if (step.action === 'upload') {
        await locator.setInputFiles(requireUpload(bundle, step).path);
        await waitAfter(page, step);
        actions.push({ id, action: 'upload', status: 'uploaded', upload: step.upload });
        continue;
      }

      if (step.action === 'click') {
        const protectedReason = protectedCommitmentReason(id, step.locator);
        if (protectedReason || step.safe_navigation !== true) {
          actions.push({
            id,
            action: 'click',
            status: 'skipped_protected',
            reason: protectedReason ?? 'click_requires_safe_navigation_true'
          });
          break;
        }
        await locator.click();
        await waitAfter(page, step);
        actions.push({ id, action: 'click', status: 'clicked_safe_navigation' });
        continue;
      }

      throw new Error(`Unsupported recipe action: ${step.action}`);
    }
    return actions;
  }
};
