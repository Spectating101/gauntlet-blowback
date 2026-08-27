import { buildProjection } from '../core/claims.mjs';
import { evaluateOpportunity } from '../core/conversion.mjs';
import { normalizeOutcome } from '../core/outcomes.mjs';
import { assessEconomicOpportunity } from './economic-triage.mjs';

const DEPENDENCY_STATES = new Set(['SATISFIED', 'OPEN', 'BLOCKED']);
const DEPENDENCY_KINDS = new Set([
  'partner', 'legal_entity', 'credential', 'evidence', 'payment', 'legal_attestation',
  'advisor', 'team', 'publication', 'account', 'other'
]);
const HUMAN_GATE_KINDS = new Set(['partner', 'legal_entity', 'payment', 'legal_attestation', 'advisor', 'team', 'account']);

function clone(value) {
  return structuredClone(value ?? null);
}

function normalizeDependency(raw, index) {
  const dependency = {
    id: raw?.id ?? `dependency-${index + 1}`,
    kind: raw?.kind ?? 'other',
    state: raw?.state ?? 'OPEN',
    description: raw?.description ?? null,
    owner: raw?.owner ?? 'human',
    evidence_refs: [...(raw?.evidence_refs ?? [])]
  };
  if (!DEPENDENCY_KINDS.has(dependency.kind)) throw new Error(`unsupported dependency kind: ${dependency.kind}`);
  if (!DEPENDENCY_STATES.has(dependency.state)) throw new Error(`unsupported dependency state: ${dependency.state}`);
  return dependency;
}

function summarizeDependencies(dependencies) {
  const open = dependencies.filter((item) => item.state === 'OPEN');
  const blocked = dependencies.filter((item) => item.state === 'BLOCKED');
  const satisfied = dependencies.filter((item) => item.state === 'SATISFIED');
  return { open, blocked, satisfied };
}

function autonomousActions({ opportunity, evaluation, dependencies }) {
  const actions = [
    { action: 'archive_source_metadata', mode: 'AUTO', reason: 'reversible provenance capture' },
    { action: 'hydrate_and_verify_opportunity', mode: 'AUTO', reason: 'research/clerical verification may run without committing externally' },
    { action: 'sync_project_evidence', mode: 'AUTO', reason: 'read-only evidence reconciliation' },
    { action: 'build_truthful_dossier', mode: 'AUTO', reason: 'application projection cannot promote claim status' },
    { action: 'draft_application_or_outreach', mode: 'AUTO', reason: 'drafting is reversible and remains unsubmitted' }
  ];

  const openHumanDependency = dependencies.some((item) => item.state !== 'SATISFIED' && HUMAN_GATE_KINDS.has(item.kind));
  if (evaluation.ok && evaluation.decision === 'READY' && !openHumanDependency) {
    actions.push({ action: 'prepare_portal_fields_and_uploads', mode: 'AUTO', reason: 'preparation is allowed while final submission remains gated' });
  }

  if (opportunity?.type === 'sponsorship' || opportunity?.type === 'institutional_pilot') {
    actions.push({ action: 'prepare_partner_or_sponsor_contact_packet', mode: 'AUTO', reason: 'packet generation is reversible; sending remains gated' });
  }
  return actions;
}

function humanGates({ opportunity, dependencies }) {
  const gates = [
    { gate: 'final_submit_or_send', required: true, reason: 'external commitment remains human-controlled' }
  ];
  if (opportunity?.cost_tag === '$UPFRONT') {
    gates.push({ gate: 'payment', required: true, reason: 'pre-verdict spend requires explicit approval' });
  }
  for (const dependency of dependencies) {
    if (dependency.state !== 'SATISFIED' && HUMAN_GATE_KINDS.has(dependency.kind)) {
      gates.push({ gate: dependency.id, required: true, reason: dependency.description ?? `${dependency.kind} dependency unresolved` });
    }
  }
  return gates;
}

function campaignState(evaluation, dependencySummary) {
  if (!evaluation.ok) return 'INVALID';
  if (evaluation.decision === 'REJECT') return 'REJECTED';
  if (dependencySummary.blocked.length) return 'BLOCKED';
  if (dependencySummary.open.length) return 'DEPENDENCY_REQUIRED';
  if (evaluation.decision === 'READY') return 'READY_TO_PREPARE';
  return 'VERIFICATION_REQUIRED';
}

export function buildConversionCampaign(input) {
  if (!input?.opportunity) throw new Error('conversion campaign requires opportunity');
  if (!input?.project?.id) throw new Error('conversion campaign requires project.id');

  const opportunity = clone(input.opportunity);
  const project = clone(input.project);
  const dependencies = (input.dependencies ?? opportunity.dependencies ?? []).map(normalizeDependency);
  const dependencySummary = summarizeDependencies(dependencies);
  const evaluation = evaluateOpportunity(opportunity);
  const economicTriage = assessEconomicOpportunity(opportunity, input.economic_policy ?? {});
  const projection = buildProjection({
    claims: input.claims ?? project.claims ?? [],
    claim_ids: input.claim_ids ?? opportunity.claim_ids ?? []
  });

  const state = campaignState(evaluation, dependencySummary);
  const nextActions = autonomousActions({ opportunity, evaluation, dependencies });
  const gates = humanGates({ opportunity, dependencies });

  return {
    schema: 'blowback.conversion_campaign.v1',
    campaign_id: input.campaign_id ?? `${project.id}:${opportunity.id}`,
    generated_at: input.generated_at ?? new Date().toISOString(),
    state,
    project: { id: project.id, name: project.name ?? project.id, canonical_ref: project.canonical_ref ?? null },
    opportunity,
    evaluation,
    economic_triage: economicTriage,
    dependencies,
    dependency_summary: {
      open: dependencySummary.open.map((item) => item.id),
      blocked: dependencySummary.blocked.map((item) => item.id),
      satisfied: dependencySummary.satisfied.map((item) => item.id)
    },
    claim_projection: projection,
    autonomy: {
      reversible_actions: nextActions,
      human_gates: gates,
      may_prepare: state === 'READY_TO_PREPARE',
      may_submit: false,
      may_pay: false,
      may_make_legal_attestation: false,
      may_fabricate_eligibility_or_evidence: false
    },
    dossier: {
      title: opportunity.title,
      project_pitch: project.pitch ?? null,
      selected_claims: projection.selected,
      excluded_claims: projection.excluded,
      evidence_gaps: evaluation.evidence_gaps ?? [],
      blockers: [
        ...(opportunity.hard_blockers ?? []),
        ...dependencySummary.blocked.map((item) => item.description ?? item.id)
      ],
      unresolved_dependencies: dependencySummary.open,
      source_url: opportunity.source_url ?? opportunity.url ?? opportunity?.source?.url ?? null,
      deadline: opportunity.deadline ?? null
    }
  };
}

export function ingestExternalOutcome(campaign, rawOutcome) {
  if (!campaign?.campaign_id || !campaign?.opportunity?.id) throw new Error('valid campaign required');
  const outcome = normalizeOutcome({
    ...rawOutcome,
    opportunity_id: rawOutcome?.opportunity_id ?? campaign.opportunity.id,
    opportunity_type: rawOutcome?.opportunity_type ?? campaign.opportunity.type
  });

  return {
    schema: 'blowback.external_receipt.v1',
    campaign_id: campaign.campaign_id,
    project_id: campaign.project.id,
    opportunity_id: campaign.opportunity.id,
    outcome,
    claim_effect: 'REVIEW_REQUIRED',
    rule: 'an external outcome is evidence about that outcome only; it does not automatically promote project claims',
    candidate_evidence: {
      kind: 'external_verdict',
      status: 'UNREVIEWED',
      observed_at: outcome.observed_at,
      source: outcome.source,
      verdict: outcome.verdict,
      stage: outcome.stage
    }
  };
}
