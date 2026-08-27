import { protectedCommitmentReason, protectedFieldReason } from './guard.mjs';

function locatorFor(page, spec) {
  if (spec.role) return page.getByRole(spec.role, { name: spec.name, exact: spec.exact ?? false });
  if (spec.label) return page.getByLabel(spec.label, { exact: spec.exact ?? false });
  if (spec.placeholder) return page.getByPlaceholder(spec.placeholder, { exact: spec.exact ?? false });
  if (spec.selector) return page.locator(spec.selector);
  throw new Error(`Field adapter requires role/name, label, placeholder, or selector: ${JSON.stringify(spec)}`);
}

export const genericAdapter = {
  id: 'generic',
  async inspect({ page, bundle }) {
    const findings = [];
    for (const name of Object.keys(bundle.fields)) {
      const spec = bundle.opportunity.field_map?.[name];
      if (!spec) { findings.push({ name, status: 'unmapped' }); continue; }
      const count = await locatorFor(page, spec).count();
      findings.push({ name, status: count > 0 ? 'found' : 'missing', matches: count });
    }
    return findings;
  },
  async prepare({ page, bundle }) {
    const actions = [];
    for (const [name, value] of Object.entries(bundle.fields)) {
      const spec = bundle.opportunity.field_map?.[name];
      if (!spec) { actions.push({ name, status: 'skipped_unmapped' }); continue; }
      const protectedReason = spec.action === 'check'
        ? protectedCommitmentReason(name, spec)
        : protectedFieldReason(name, spec);
      if (protectedReason) {
        actions.push({ name, status: 'skipped_protected', reason: protectedReason });
        continue;
      }
      const locator = locatorFor(page, spec);
      if (spec.action === 'select') await locator.selectOption(String(value));
      else if (spec.action === 'check') { if (value) await locator.check(); else await locator.uncheck(); }
      else await locator.fill(String(value));
      actions.push({ name, status: 'filled' });
    }
    for (const upload of bundle.uploads) {
      const spec = bundle.opportunity.upload_map?.[upload.name];
      if (!spec) { actions.push({ name: upload.name, status: 'upload_skipped_unmapped' }); continue; }
      if (spec.human_gate) {
        actions.push({ name: upload.name, status: 'upload_skipped_human_gate', reason: `human_gate:${spec.human_gate}` });
        continue;
      }
      await locatorFor(page, spec).setInputFiles(upload.path);
      actions.push({ name: upload.name, status: 'uploaded' });
    }
    return actions;
  }
};
