import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const OVERLAY = new URL('../data/hs-route-rebalance-2026-09-23.json', import.meta.url);

async function loadOverlay() {
  return JSON.parse(await fs.readFile(OVERLAY, 'utf8'));
}

test('HS route overlay keeps project identity outside Gauntlet allocation', async () => {
  const overlay = await loadOverlay();
  assert.equal(overlay.schema, 'blowback.hs_route_rebalance.v3');
  assert.equal(overlay.project, 'hardware-splicer');
  assert.equal(overlay.canonical_project_state.repository, 'Spectating101/hardware-splicer');
  assert.equal(overlay.canonical_project_state.path, 'docs/HARDWARE_SPLICER_OPERATING_STATE.json');
  assert.equal(overlay.allocation_invariants.route_reallocation_reduces_hs_capability, false);
  assert.equal(overlay.allocation_invariants.moved_routes_are_reclaimable_when_fit_changes, true);
  assert.equal(overlay.allocation_invariants.physical_proof_campaign, 'Spectating101/hardware-splicer#105');
  assert.equal(overlay.allocation_invariants.physical_proof_priority, 'P0');
});

test('HS route overlay reflects merged physical-proof and provider-reply control plane', async () => {
  const overlay = await loadOverlay();
  const route = overlay.routes['hardware-splicer-spi-flash-adapter-v1-remote-fct'];
  assert.equal(route.decision, 'HS_PRIMARY');
  assert.equal(route.priority, 'HIGHEST');
  assert.equal(route.execution_state, 'CONTACT_READY');
  assert.equal(route.tracking, 'Spectating101/hardware-splicer#105');
  assert.equal(route.frozen_release, 'gauntlet-spi-flash-adapter-v1-20260916');
  assert.equal(route.package_sha256, '6d4c76feaeebdab1223ed6c4be21d63835212baea731aea9d3933f2525be1edd');
  assert.deepEqual(route.provider_candidates, ['JLCPCB', 'PCBWay']);
  assert.match(route.provider_reply_evaluator, /#108/);
  assert.match(route.next_external_action, /stop before checkout\/payment/i);
});

test('HS-native Gauntlet routes carry their current execution gates', async () => {
  const overlay = await loadOverlay();

  const erap = overlay.routes['anthropic-external-researcher-access-2026'];
  assert.equal(erap.decision, 'HS_PRIMARY');
  assert.equal(erap.execution_state, 'HUMAN_SUBMIT_READY');
  assert.equal(erap.manual_only, true);

  const mhs = overlay.routes['anthropic-mhs-preview-2026'];
  assert.equal(mhs.decision, 'HS_PRIMARY');
  assert.equal(mhs.execution_state, 'RESEARCH_ONLY');
  assert.equal(mhs.device_surface, 'hardware-splicer spi_flash_adapter_v1');
  assert.match(mhs.initial_functional_surface, /0x9F/);
  assert.match(mhs.integration_rule, /MHS supplies device discovery\/command transport/i);

  const date = overlay.routes['date-2027-lbr-hardware-splicer'];
  assert.equal(date.decision, 'HS_AFTER_EVIDENCE');
  assert.equal(date.execution_state, 'PACKET_READY');
  assert.equal(date.final_deadline, '2026-11-29 AoE');
  assert.match(date.insufficient_trigger, /MCP transport\/infrastructure alone/i);

  const innoserve = overlay.routes['innoserve-2026-hardware-splicer'];
  assert.equal(innoserve.decision, 'HS_CONDITIONAL');
  assert.equal(innoserve.execution_state, 'RESEARCH_ONLY');
  assert.equal(innoserve.compliance_state, 'BLOCKING_CLARIFICATION');
  assert.equal(innoserve.contact_state, 'CONTACT_READY_NOT_SENT');
  assert.deepEqual(innoserve.organizer_contacts.emails, [
    'maris@mail.tca.org.tw',
    'yuanhan@mail.tca.org.tw',
  ]);
  assert.match(innoserve.clarification_runbook, /INNOSERVE_2026_HS_MODEL_ORIGIN_CLARIFICATION_2026-09-23\.md$/);
  assert.match(innoserve.known_conflict, /Qwen\/DeepSeek/i);
  assert.match(innoserve.next_external_action, /both official organizer emails/i);

  const science = overlay.routes['anthropic-ai-for-science-general-2026'];
  assert.equal(science.decision, 'HS_AFTER_EVIDENCE');
  assert.equal(science.execution_state, 'RESEARCH_ONLY');
  assert.match(science.wake_condition, /#105/);
  assert.match(science.public_credit_cap_conflict, /US\$50k.*US\$20k/i);
});

test('generic routes stay allocated to more native portfolio assets without shrinking HS', async () => {
  const overlay = await loadOverlay();
  assert.equal(overlay.routes['openai-researcher-access-hardware-splicer'].current_lead, 'cite-agent');
  assert.equal(overlay.routes['aws-cloud-credit-research-2026'].current_lead, 'research-drive');
  assert.equal(overlay.routes['nchc-university-ai-compute-yzu-2026'].current_lead, 'yzu-data-assistance');
  assert.equal(overlay.routes['openai-researcher-access-hardware-splicer'].reclaimable, true);
  assert.equal(overlay.routes['aws-cloud-credit-research-2026'].reclaimable, true);
  assert.equal(overlay.routes['nchc-university-ai-compute-yzu-2026'].reclaimable, true);
});

test('program summary keeps external proof ahead of speculative feature growth', async () => {
  const overlay = await loadOverlay();
  assert.equal(overlay.current_program_summary.internal_engineering, 'No new speculative HS feature lane is authorized.');
  assert.match(overlay.current_program_summary.physical_proof, /P0 ACTIVE/i);
  assert.equal(overlay.current_program_summary.external_conversion.erap, 'HUMAN_SUBMIT_READY');
  assert.match(overlay.current_program_summary.external_conversion.mhs, /WAITING_ON_PHYSICAL_SUBJECT/);
  assert.match(overlay.current_program_summary.external_conversion.date_2027, /WAITING_ON_EMPIRICAL_RESULT/);
  assert.match(overlay.current_program_summary.external_conversion.innoserve, /CONTACT_READY_NOT_SENT/);
  assert.match(overlay.current_program_summary.external_conversion.ai_for_science, /EVIDENCE_CONSENT_ACCOUNT_AND_BUDGET/);
});
