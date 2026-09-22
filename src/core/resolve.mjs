import path from 'node:path';
import { loadStructured } from './load.mjs';

function getByPath(obj, dotted) {
  return dotted.split('.').reduce((value, key) => value?.[key], obj);
}

const AUTHORITY_FILE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../applicant-authority.local.yaml'
);

// Contact details are deliberately absent from the public profile, because this repository is
// public. They live in the git-ignored applicant authority file, which is the operator's source of
// truth, so `$profile.phone` and friends resolve from its `identity` section.
async function authorityIdentity() {
  const file = process.env.BLOWBACK_AUTHORITY_FILE ?? AUTHORITY_FILE;
  try {
    const authority = await loadStructured(file);
    const identity = authority?.identity;
    return identity && typeof identity === 'object' && !Array.isArray(identity) ? identity : {};
  } catch (error) {
    // An absent file is normal: the public profile stands on its own. Anything else (malformed
    // YAML, a missing parser, bad permissions) would silently drop contact fields, so say so.
    if (error?.code !== 'ENOENT') {
      console.warn(`applicant authority file ignored (${file}): ${error.message}`);
    }
    return {};
  }
}

export async function loadProfile(opportunity) {
  const publicProfilePath = path.resolve(opportunity.__dir, opportunity.profile);
  const publicProfile = await loadStructured(publicProfilePath);
  const identity = await authorityIdentity();
  const privateOverride = process.env.BLOWBACK_PROFILE_FILE;
  if (!privateOverride) return { ...publicProfile, ...identity };

  const privateProfile = await loadStructured(path.resolve(privateOverride));
  return { ...publicProfile, ...identity, ...privateProfile };
}

export async function resolveBundle(opportunity) {
  const projectPath = path.resolve(opportunity.__dir, opportunity.project);
  const profile = await loadProfile(opportunity);
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
