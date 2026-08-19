import path from 'node:path';
import { loadStructured } from './load.mjs';

function getByPath(obj, dotted) {
  return dotted.split('.').reduce((value, key) => value?.[key], obj);
}

export async function resolveBundle(opportunity) {
  const profilePath = path.resolve(opportunity.__dir, opportunity.profile);
  const projectPath = path.resolve(opportunity.__dir, opportunity.project);
  const profile = await loadStructured(profilePath);
  const project = await loadStructured(projectPath);
  const context = { opportunity, profile, project };

  const fields = {};
  for (const [fieldName, spec] of Object.entries(opportunity.fields ?? {})) {
    if (typeof spec === 'string' && spec.startsWith('$')) {
      const value = getByPath(context, spec.slice(1));
      if (value === undefined) throw new Error(`Cannot resolve ${fieldName}: ${spec}`);
      fields[fieldName] = value;
    } else fields[fieldName] = spec;
  }

  const uploads = (opportunity.uploads ?? []).map((item) => ({
    ...item,
    path: path.resolve(opportunity.__dir, item.path)
  }));

  return { opportunity, profile, project, fields, uploads };
}
