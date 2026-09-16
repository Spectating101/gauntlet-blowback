import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildExternalReleaseHandoff,
  loadExternalReleaseRoute,
  validateExternalReleaseRoute,
} from '../src/handoff/external-release.mjs';

const manifest = 'examples/release-routes/hardware-splicer-spi-flash-adapter-v1.json';

test('Hardware Splicer handoff binds the canonical release and package hash', async () => {
  const handoff = await buildExternalReleaseHandoff(manifest);
  assert.equal(handoff.schema, 'blowback.external_release_handoff.v1');
  assert.equal(handoff.state, 'READY_FOR_TARGET_SELECTION');
  assert.equal(handoff.release.revision, 'f892facd67c5124e2362860ebc999625afedc5d5');
  assert.equal(handoff.release.tag, 'gauntlet-spi-flash-adapter-v1-20260916');
  const candidate = handoff.artifacts.find((artifact) => artifact.role === 'candidate_package');
  assert.equal(candidate.sha256, '6d4c76feaeebdab1223ed6c4be21d63835212baea731aea9d3933f2525be1edd');
  assert.equal(handoff.project.canonical_release.sha256, candidate.sha256);
  assert.equal(handoff.verification.named_focused_tests_passed, 64);
  assert.equal(handoff.verification.tag_push_workflows_passed, 22);
});

test('provider-neutral route remains executable without inventing submission or physical credit', async () => {
  const handoff = await buildExternalReleaseHandoff(manifest);
  assert.deepEqual(handoff.target, { provider: null, evaluator: null, selected: false });
  assert.equal(handoff.authority.externally_submitted, false);
  assert.equal(handoff.authority.physical_correctness, 'UNPROVEN');
  assert.ok(handoff.human_gates.includes('provider_selection'));
  assert.ok(handoff.human_gates.includes('payment'));
  assert.ok(handoff.human_gates.includes('fabrication_authorization'));
  assert.match(handoff.receipt_contract.authority_effect, /none_without_explicit_human_authorization/);
});

test('route validation rejects a stale project binding or synthetic physical promotion', async () => {
  const { route, project } = await loadExternalReleaseRoute(manifest);
  const staleProject = structuredClone(project);
  staleProject.canonical_revision = '0'.repeat(40);
  assert.equal(validateExternalReleaseRoute(route, staleProject).ok, false);

  const promoted = structuredClone(route);
  promoted.authority.physical_correctness = 'VERIFIED';
  promoted.authority.fabricated = true;
  const result = validateExternalReleaseRoute(promoted, project);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => /UNPROVEN/.test(error)));
  assert.ok(result.errors.some((error) => /fabricated/.test(error)));
});
