import { buildBrowserMission, rankGauntlet } from '../mission/operator.mjs';

const APPLICATION_LANES = new Set([
  'JOB', 'RESEARCH_JOB', 'RESEARCH_LAB', 'PREDOC', 'RESEARCH_FELLOWSHIP', 'POLICY_FELLOWSHIP',
  'RESEARCH_RESIDENCY', 'FUNDED_VISITING_RESEARCH', 'RESEARCH_CAREER_PROGRAM', 'PHD', 'PHD_FACULTY',
  'CAREER', 'FELLOWSHIP', 'STUDENT_INFRASTRUCTURE', 'RESEARCH_ACCESS', 'RESEARCH_CREDIT'
]);

const APPLICATION_ROUTE_CLASSES = new Set([
  'JOB', 'LAB_STAFF', 'RESEARCH_ENGINEER', 'PREDOC', 'RESEARCH_FELLOWSHIP', 'RESEARCH_RESIDENCY',
  'POLICY_FELLOWSHIP', 'FUNDED_VISITING_PROGRAM', 'FACULTY_PULL', 'RESEARCH_ENGINEERING_PROGRAM', 'PHD',
  'STUDENT_BENEFIT', 'INSTITUTIONAL_ENTITLEMENT', 'RESEARCH_CREDIT', 'PI_SPONSORED_CREDIT',
  'RESEARCH_PREVIEW', 'PI_SPONSORED_ACCESS'
]);

const FIREISH = /(FIRE|READY|PRICE_DISCOVERY|PRIMARY)/i;
const KNOWN_GATE_STATUS = /(AFTER_GATE|IF_ELIGIBLE|VERIFY|RECON|DEPENDENCY|HOLD|WATCH|KILL|REJECT)/i;
const BLOCKING_GATE_TEXT = /(advisor|adviser|team|partner|host|principal investigator|\bpi\b|institutional consent|payment|fee|citizen|citizenship|work authorization|visa|sponsor|eligib|attest|originality|authorship|ip\b|outside[- ]work|moonlight|company|legal entity)/i;
const FINAL_SUBMIT_GATE = 'final_submit_send_apply_confirm';

function normalized(value = '') {
  return String(value).trim().toUpperCase();
}

export function isApplicationRoute(record) {
  return APPLICATION_LANES.has(normalized(record?.lane)) || APPLICATION_ROUTE_CLASSES.has(normalized(record?.route_class));
}

export function applicationKind(record) {
  const lane = normalized(record?.lane);
  const route = normalized(record?.route_class);
  if (route === 'STUDENT_BENEFIT') return 'STUDENT_BENEFIT_CLAIM';
  if (route === 'INSTITUTIONAL_ENTITLEMENT') return 'INSTITUTIONAL_ENTITLEMENT_CLAIM';
  if (route === 'PI_SPONSORED_CREDIT' || route === 'PI_SPONSORED_ACCESS') return 'PI_SPONSORED_RESOURCE_APPLICATION';
  if (route === 'RESEARCH_PREVIEW') return 'RESEARCH_PREVIEW_APPLICATION';
  if (lane === 'RESEARCH_CREDIT' || route === 'RESEARCH_CREDIT') return 'RESEARCH_CREDIT_APPLICATION';
  if (route === 'FACULTY_PULL') return 'LAB_OUTREACH';
  if (lane === 'RESEARCH_LAB' || route === 'LAB_STAFF') return 'LAB_APPLICATION';
  if (lane === 'PREDOC' || route === 'PREDOC') return 'PREDOC_APPLICATION';
  if (lane.includes('FELLOWSHIP') || route.includes('FELLOWSHIP')) return 'FELLOWSHIP_APPLICATION';
  if (lane.includes('RESIDENCY') || route.includes('RESIDENCY')) return 'RESIDENCY_APPLICATION';
  if (lane === 'PHD' || lane === 'PHD_FACULTY' || route === 'PHD') return 'PHD_APPLICATION';
  if (route === 'RESEARCH_ENGINEER' || lane === 'RESEARCH_JOB') return 'RESEARCH_JOB_APPLICATION';
  return 'JOB_APPLICATION';
}

export function packetProfileFor(record) {
  const kind = applicationKind(record);
  const common = ['canonical_profile', 'resume_or_cv', 'portfolio_index', 'truthful_claim_projection', 'source_snapshot'];
  if (kind === 'STUDENT_BENEFIT_CLAIM') return ['canonical_profile', 'student_status_proof', 'eligible_account_status', 'source_snapshot'];
  if (kind === 'INSTITUTIONAL_ENTITLEMENT_CLAIM') return ['canonical_profile', 'institutional_affiliation_proof', 'resource_scope_and_terms', 'source_snapshot'];
  if (kind === 'RESEARCH_CREDIT_APPLICATION') return [...common, 'research_question', 'experiment_or_infrastructure_plan', 'budget_or_usage_model', 'research_outputs_and_milestones'];
  if (kind === 'PI_SPONSORED_RESOURCE_APPLICATION') return [...common, 'pi_packet', 'research_question', 'experiment_or_infrastructure_plan', 'budget_or_usage_model', 'milestones', 'institutional_approval_requirements'];
  if (kind === 'RESEARCH_PREVIEW_APPLICATION') return [...common, 'research_collaboration_note', 'technical_evidence_packet', 'evaluation_agenda', 'requested_access_and_partner_value'];
  if (kind === 'LAB_OUTREACH') return [...common, 'research_interest_note', 'one_or_two_project_evidence_links'];
  if (kind === 'LAB_APPLICATION') return [...common, 'research_interest_note', 'project_evidence_packet'];
  if (kind === 'PREDOC_APPLICATION') return [...common, 'research_statement_or_cover_note', 'empirical_research_sample', 'code_or_data_evidence'];
  if (kind === 'FELLOWSHIP_APPLICATION') return [...common, 'program_specific_statement', 'proposal_or_project_agenda', 'writing_sample_if_required'];
  if (kind === 'RESIDENCY_APPLICATION') return [...common, 'research_agenda', 'technical_evidence_packet', 'availability_and_location_answers'];
  if (kind === 'PHD_APPLICATION') return [...common, 'research_statement', 'academic_evidence', 'faculty_or_program_fit_note'];
  if (kind === 'RESEARCH_JOB_APPLICATION') return [...common, 'role_specific_cover_note', 'technical_evidence_packet'];
  return [...common, 'role_specific_cover_note'];
}

export function applicationStage(record) {
  const execution = normalized(record?.execution_state);
  const status = normalized(record?.status);
  if (/ELIGIBILITY_RECON|APPLICATION_RECON|PORTAL_RECON|RESEARCH_ONLY/.test(execution) || /VERIFY|REHYDRATE|DEPENDENCY|HOLD/.test(status)) return 'RECON';
  if (/APPLICATION_READY|OUTREACH_READY|PACKET_READY|HUMAN_SUBMIT_READY|PREPARE_VERIFIED|PORTAL_MAPPED/.test(execution) || FIREISH.test(status)) return 'PREPARE';
  return 'RECON';
}

export function mayAutoSubmit(record, { submitIfSafe = false } = {}) {
  if (!submitIfSafe) return false;
  if (!isApplicationRoute(record)) return false;
  const status = normalized(record?.status);
  const execution = normalized(record?.execution_state);
  const gateText = `${record?.gate ?? ''} ${record?.source_state ?? ''}`;
  if (!FIREISH.test(status) || KNOWN_GATE_STATUS.test(status)) return false;
  if (!/APPLICATION_READY|OUTREACH_READY|PACKET_READY|HUMAN_SUBMIT_READY|PREPARE_VERIFIED|PORTAL_MAPPED/.test(execution)) return false;
  if (BLOCKING_GATE_TEXT.test(gateText)) return false;
  return true;
}

function inferChannel(record) {
  const route = normalized(record?.route_class);
  const source = String(record?.source ?? '');
  if (route === 'INSTITUTIONAL_ENTITLEMENT') return 'INSTITUTIONAL_PORTAL_OR_LICENSE_AUDIT';
  if (route === 'PI_SPONSORED_CREDIT' || route === 'PI_SPONSORED_ACCESS') return 'PI_HANDOFF_THEN_PORTAL';
  if (route === 'FACULTY_PULL' || /join us|faculty|lab/i.test(`${record?.opportunity ?? ''} ${record?.gate ?? ''}`)) return 'OUTREACH';
  if (/jobs\.|careers\.|apply|application|recruit|students|education|grant|research/i.test(source)) return 'PORTAL';
  return 'PORTAL_OR_OUTREACH_RECON';
}

export function buildApplicationMission(record, checkpoint = null, options = {}) {
  if (!isApplicationRoute(record)) throw new Error(`route is not application-like: ${record?.id ?? '(missing)'}`);
  const base = buildBrowserMission(record, checkpoint);
  const autoSubmit = mayAutoSubmit(record, options);
  const stage = applicationStage(record);
  const channel = inferChannel(record);
  const protectedHumanGates = autoSubmit
    ? base.permissions.human_gate.filter((gate) => gate !== FINAL_SUBMIT_GATE)
    : [...new Set([...base.permissions.human_gate, FINAL_SUBMIT_GATE])];

  return {
    ...base,
    schema: 'blowback.application_mission.v1',
    application: {
      kind: applicationKind(record),
      stage,
      channel,
      packet_profile: packetProfileFor(record),
      evidence_family: record.shared_evidence_family ?? null,
      asset_projection: record.contribution_view ?? null,
      application_policy: {
        mode: autoSubmit ? 'SUBMIT_IF_SAFE' : 'PREPARE_TO_LAST_SAFE_STATE',
        runtime_authority: autoSubmit,
        require_official_source_before_submission: true,
        require_truthful_canonical_profile: true,
        require_existing_or_evidence_grounded_artifacts: true,
        never_invent_answers: true,
        stop_on_unknown_material_question: true,
        stop_on_legal_or_eligibility_attestation: true,
        stop_on_fee_payment_or_purchase: true,
        stop_on_advisor_team_partner_host_commitment: true,
        stop_on_work_authorization_or_visa_uncertainty: true,
        stop_on_ip_or_outside_work_terms: true,
        stop_on_pi_or_institutional_dependency: true,
        honor_noncommercial_and_research_only_credit_terms: true
      },
      follow_up: {
        capture_submission_receipt: true,
        capture_application_id: true,
        capture_submitted_at: true,
        capture_next_expected_event: true,
        create_outcome_watch_state: true,
        preserve_rejection_or_offer_verdict: true,
        capture_credit_activation_and_expiration_when_applicable: true,
        capture_realized_cost_displacement_not_nominal_face_value: true
      }
    },
    objective: stage === 'RECON'
      ? `Resolve application-critical facts for ${record.organization || record.opportunity}, then prepare the truthful application or benefit claim as far as the verified facts allow.`
      : autoSubmit
        ? `Prepare and submit the truthful application or benefit claim to ${record.organization || record.opportunity} only if no protected gate, unresolved material fact, fee, legal attestation, institutional dependency, or use restriction is encountered; otherwise stop at WAITING_HUMAN.`
        : `Prepare the truthful application or benefit claim to ${record.organization || record.opportunity} through the last safe reversible state and stop before final submit/send.` ,
    permissions: {
      ...base.permissions,
      auto: [
        ...base.permissions.auto,
        'identify_application_or_benefit_channel',
        'map_application_fields_from_verified_profile',
        'select_route_specific_existing_evidence',
        'draft_role_specific_cover_or_research_note_from_canonical_claims',
        'build_pi_review_packet_from_verified_research_plan',
        'answer_only_questions_resolved_by_verified_profile_or_route_evidence',
        'save_application_draft',
        'capture_application_status_and_follow_up_dates',
        'capture_credit_or_entitlement_activation_terms',
        ...(autoSubmit ? ['final_submit_or_send_only_if_runtime_policy_and_dynamic_gate_checks_pass'] : [])
      ],
      human_gate: protectedHumanGates
    },
    success: {
      ...base.success,
      preferred_terminal_state: autoSubmit ? 'SUBMITTED_OR_WAITING_HUMAN' : 'WAITING_HUMAN',
      acceptable_states: ['SAFE_COMPLETE', 'WAITING_HUMAN', 'SUBMITTED', 'BLOCKED'],
      instruction: autoSubmit
        ? 'Submit only when runtime authority is explicit and every dynamic protected-gate and use-restriction check passes. Otherwise stop at the last safe state and preserve exactly what blocked submission.'
        : 'Prepare completely, save draft where possible, and stop at the final submit/send boundary.'
    }
  };
}

export function rankApplicationRoutes(records, options = {}) {
  return rankGauntlet(records, options).filter(({ record }) => isApplicationRoute(record));
}

export function applicationMissionForRoute(routeId, records, options = {}) {
  const ranked = rankGauntlet(records, { ...options, includePaused: true });
  const found = ranked.find(({ record }) => record.id === routeId);
  if (!found) throw new Error(`active application route not found in Gauntlet master: ${routeId}`);
  return buildApplicationMission(found.record, found.checkpoint, options);
}

export function nextApplicationMission(records, options = {}) {
  const ranked = rankApplicationRoutes(records, options);
  if (!ranked.length) return null;
  const { record, checkpoint } = ranked[0];
  return buildApplicationMission(record, checkpoint, options);
}

export function applicationQueue(records, { limit = 10, ...options } = {}) {
  const missions = rankApplicationRoutes(records, options)
    .slice(0, Math.max(1, Number(limit) || 10))
    .map(({ record, checkpoint }) => buildApplicationMission(record, checkpoint, options));
  return {
    schema: 'blowback.application_queue.v1',
    generated_at: new Date().toISOString(),
    count: missions.length,
    runtime_authority: options.submitIfSafe === true ? 'SUBMIT_IF_SAFE' : 'PREPARE_ONLY',
    missions
  };
}
