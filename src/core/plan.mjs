export function buildPlan(bundle) {
  const o = bundle.opportunity;
  const steps = [{ kind: 'navigate', url: o.entry_url }];
  for (const [name, value] of Object.entries(bundle.fields)) steps.push({ kind: 'field', name, value });
  for (const upload of bundle.uploads) steps.push({ kind: 'upload', name: upload.name, path: upload.path });
  for (const gate of o.human_required ?? []) steps.push({ kind: 'human_gate', gate });
  return { opportunity: o.id, portal: o.portal, mode: o.mode, direct_control: o.direct_control ?? null, steps };
}
