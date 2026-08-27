import { resolveRouteUrls } from './routes.mjs';

export function buildPlan(bundle, { includeValues = false } = {}) {
  const o = bundle.opportunity;
  const routes = resolveRouteUrls(o);
  const steps = [{ kind: 'navigate', url: routes.execution_url }];
  for (const [name, value] of Object.entries(bundle.fields)) {
    steps.push({ kind: 'field', name, ...(includeValues ? { value } : { value_redacted: true }) });
  }
  for (const upload of bundle.uploads) {
    steps.push({ kind: 'upload', name: upload.name, path_redacted: true });
  }
  for (const gate of o.human_required ?? []) steps.push({ kind: 'human_gate', gate });
  return {
    opportunity: o.id,
    portal: o.portal,
    mode: o.mode,
    direct_control: o.direct_control ?? null,
    values_redacted: !includeValues,
    steps
  };
}
