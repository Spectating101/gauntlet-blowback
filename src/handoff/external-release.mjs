import path from 'node:path';

import { loadStructured } from '../core/load.mjs';

const ROUTE_SCHEMA = 'blowback.external_release_route.v1';
const COMMIT_SHA = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const REQUIRED_ROLES = new Set(['candidate_package', 'checksums', 'handoff']);

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${name} is required`);
  return value;
}

export function validateExternalReleaseRoute(route, project) {
  const errors = [];
  const add = (condition, message) => { if (!condition) errors.push(message); };

  add(route?.schema === ROUTE_SCHEMA, `schema must be ${ROUTE_SCHEMA}`);
  add(typeof route?.id === 'string' && route.id.length > 0, 'id is required');
  add(typeof route?.release?.repository === 'string', 'release.repository is required');
  add(COMMIT_SHA.test(route?.release?.revision ?? ''), 'release.revision must be a full commit SHA');
  add(typeof route?.release?.tag === 'string', 'release.tag is required');
  add(typeof route?.release?.url === 'string', 'release.url is required');

  const artifacts = Array.isArray(route?.artifacts) ? route.artifacts : [];
  const roles = new Set(artifacts.map((artifact) => artifact?.role));
  for (const role of REQUIRED_ROLES) add(roles.has(role), `artifact role is required: ${role}`);
  add(roles.size === artifacts.length, 'artifact roles must be unique');
  for (const artifact of artifacts) {
    add(typeof artifact?.name === 'string' && artifact.name.length > 0, `artifact name is required: ${artifact?.role ?? 'unknown'}`);
    add(typeof artifact?.url === 'string' && artifact.url.startsWith('https://'), `artifact URL must be HTTPS: ${artifact?.role ?? 'unknown'}`);
  }
  const candidate = artifacts.find((artifact) => artifact.role === 'candidate_package');
  add(SHA256.test(candidate?.sha256 ?? ''), 'candidate package requires a SHA-256');

  add(route?.authority?.gauntlet_state === 'PACKAGED_NOT_PHYSICAL', 'gauntlet_state must remain PACKAGED_NOT_PHYSICAL');
  add(route?.authority?.physical_correctness === 'UNPROVEN', 'physical_correctness must remain UNPROVEN');
  for (const key of ['provider_selected', 'provider_engaged', 'fabrication_authorized', 'fabricated', 'assembled', 'powered', 'externally_submitted']) {
    add(route?.authority?.[key] === false, `authority.${key} must be false for this frozen candidate`);
  }
  add(route?.routing?.state === 'READY_FOR_TARGET_SELECTION', 'routing.state must be READY_FOR_TARGET_SELECTION');
  add(route?.routing?.provider == null, 'routing.provider must remain unset until explicitly selected');
  add(route?.routing?.evaluator == null, 'routing.evaluator must remain unset until explicitly selected');
  add(Array.isArray(route?.routing?.human_gates) && route.routing.human_gates.includes('payment'), 'routing must human-gate payment');
  add(Array.isArray(route?.routing?.human_gates) && route.routing.human_gates.includes('fabrication_authorization'), 'routing must human-gate fabrication authorization');

  if (project) {
    add(project.canonical_revision === route?.release?.revision, 'project canonical_revision does not match release revision');
    add(project.canonical_release?.tag === route?.release?.tag, 'project canonical release tag does not match route');
    add(project.canonical_release?.url === route?.release?.url, 'project canonical release URL does not match route');
    add(project.canonical_release?.sha256 === candidate?.sha256, 'project canonical package SHA-256 does not match route');
    add(project.canonical_release?.provider_engaged === false, 'project must not claim provider engagement');
    add(project.canonical_release?.fabrication_authorized === false, 'project must not claim fabrication authorization');
  }

  return { ok: errors.length === 0, errors };
}

export async function loadExternalReleaseRoute(filePath) {
  const absolute = path.resolve(filePath);
  const route = await loadStructured(absolute);
  const projectPath = path.resolve(path.dirname(absolute), requireString(route.project, 'project'));
  const project = await loadStructured(projectPath);
  const validation = validateExternalReleaseRoute(route, project);
  if (!validation.ok) throw new Error(`Invalid external release route:\n- ${validation.errors.join('\n- ')}`);
  return { route, project, absolute, projectPath };
}

export async function buildExternalReleaseHandoff(filePath) {
  const { route, project, absolute, projectPath } = await loadExternalReleaseRoute(filePath);
  return {
    schema: 'blowback.external_release_handoff.v1',
    route_id: route.id,
    state: route.routing.state,
    project: {
      id: project.id,
      name: project.name,
      canonical_revision: project.canonical_revision,
      canonical_release: project.canonical_release,
    },
    release: route.release,
    artifacts: route.artifacts,
    verification: route.verification,
    authority: route.authority,
    target: {
      provider: route.routing.provider,
      evaluator: route.routing.evaluator,
      selected: false,
    },
    next_actions: route.routing.allowed_next_actions,
    human_gates: route.routing.human_gates,
    forbidden: route.routing.forbidden,
    source: {
      route_manifest: path.relative(process.cwd(), absolute),
      project_record: path.relative(process.cwd(), projectPath),
    },
    receipt_contract: {
      schema: 'blowback.external_release_receipt.v1',
      accepted_events: ['TARGET_SELECTED', 'QUOTE_REQUESTED', 'QUOTE_RECEIVED', 'EVALUATOR_FINDING', 'DFM_FINDING', 'PHYSICAL_EVIDENCE_RETURNED'],
      authority_effect: 'none_without_explicit_human_authorization_and_evidence_adjudication',
      required_identity: ['route_id', 'release.revision', 'release.tag', 'candidate_package.sha256'],
    },
  };
}
