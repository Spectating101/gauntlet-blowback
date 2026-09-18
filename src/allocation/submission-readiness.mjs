import fs from 'node:fs';

import { routeAssets } from './portfolio.mjs';

const DOCUMENT_AUTHORITY = JSON.parse(fs.readFileSync(
  new URL('../../data/applicant-document-readiness-2026-09-12.json', import.meta.url),
  'utf8',
));

const CAMPAIGN_AUTHORITY = JSON.parse(fs.readFileSync(
  new URL('../../data/portfolio-campaign-scope-2026-09-12.json', import.meta.url),
  'utf8',
));

// Match obligations, not mere vocabulary. A gate that says an event could create
// a "partner conversion", for example, must not be excluded just because the
// word partner appears. The campaign excludes routes only when the applicant
// must bring a new external dependency to clear the route.
const EXTERNAL_PREREQUISITE_RULES = [
  ['reference_or_referee', [
    /\b(?:requires?|provide|submit|identify|name|list)\b[^.]{0,80}\b(?:professional |academic )?(?:references?|referees?)\b/i,
    /\b(?:references?|referees?)\b[^.]{0,50}\b(?:required|needed|not found|records?|names?|contact details?)\b/i,
    /\brecommendation letters?\b/i,
  ]],
  ['team_or_adviser', [
    /\b(?:requires?|must include|need|find|confirm)\b[^.]{0,80}\b(?:teammates?|teams?|advisers?|advisors?|principal investigators?|PIs?)\b/i,
    /\b(?:teammates?|teams?|advisers?|advisors?|principal investigators?|PIs?)\b[^.]{0,60}\b(?:required|gate|commitment|confirmation|signature|not available|must)\b/i,
  ]],
  ['partner_or_host', [
    /\b(?:requires?|need|find|secure|must have)\b[^.]{0,80}\b(?:partners?|external hosts?|institutional sponsors?)\b/i,
    /\b(?:partners?|external hosts?|institutional sponsors?)\b[^.]{0,60}\b(?:required|gate|willingness|commitment|confirmation|not available|must)\b/i,
    /\b(?:real|genuine|qualified|committed)\s+(?:external\s+)?(?:partners?|hosts?)\b/i,
  ]],
  ['institutional_approval', [
    /\b(?:institutional|departmental) (?:approval|consent|endorsement|nomination|support)\b/i,
    /\b(?:approval|endorsement|nomination)\b[^.]{0,50}\b(?:institution|department)\b/i,
  ]],
  ['external_validation_or_certification', [
    /\b(?:requires?|need|provide|obtain|must have)\b[^.]{0,80}\b(?:external|independent|third-party) (?:validation|certification)\b/i,
    /\b(?:external|independent|third-party) (?:validation|certification)\b[^.]{0,50}\b(?:required|needed|gate)\b/i,
    /\bcertified credential\b/i,
  ]],
  ['connection_or_introduction', [
    /\b(?:requires?|need|must have|obtain)\b[^.]{0,80}\b(?:introduction|professional connection|network referral)\b/i,
  ]],
];

const ROUTE_EXTERNAL_PREREQUISITES = {
  'wanrun-grad-2026': ['adviser relationship and signature required'],
  'cohere-catalyst': ['external host required'],
  'phd-nycu-ms': ['adviser dependency'],
  'phd-nycu-ibm': ['adviser dependency'],
  'phd-nccu-tiipm': ['adviser dependency'],
  'phd-ncu-im': ['adviser dependency'],
  'ntub-fintech-2026-cl-eci': ['team and adviser dependency'],
  'innoserve-2026-policy-lab-ip': ['school advisers and team required'],
  'innoserve-2026-policy-lab-ic': ['school advisers and team required'],
  'twnic-community-grant-2026-nocturnal': ['legally registered applying entity required'],
  'pulitzer-nocturnal': ['interdisciplinary journalist and civil-society/academic partnership required'],
  'fij-2026-nocturnal': ['real journalist or media-outlet applicant required'],
  'otf-nocturnal': ['departmental support or external host dependency'],
  'innoserve-2026-hs-industrial-ai': ['student team and adviser dependency'],
  'nstc-research-entrepreneurship-2026': ['principal-investigator or institutional dependency'],
  'watch-civicus-ddi-civic-tech-nocturnal': ['civil-society partner dependency'],
  'cht-smart-innovation-2026-cl-eci': ['eligible teammate required'],
  'fellowship-era-ai-winter-2027': ['two referees required'],
  'fellowship-astra-2027': ['two references required by the official application process'],
  'fellowship-tech-policy-press-2027': ['two professional references required'],
  'residency-mats-2027': ['two references required by the official application process'],
  'partner-doublethink-nocturnal-pilot': ['external operator partner required'],
  'partner-tfc-nocturnal-pilot': ['external operator partner required'],
  'partner-ocf-nocturnal-pilot': ['external operator partner required'],
  'google-cloud-research-credits-pi-2026': ['eligible principal investigator required'],
  'oracle-for-research-project-award-2026': ['principal investigator and institutional signatures required'],
  'anthropic-team-scientists-2026': ['principal investigator and institutional verification required'],
  'anthropic-wellbeing-evaluations-2026': ['qualified external experts required for design and validation'],
  'aws-cloud-credit-research-2026': ['written third-party eligibility confirmation required'],
  'anthropic-ai-for-science-general-2026': ['institutional consent and receiving organization required'],
  'watch-eu-information-integrity-consortium-2026': ['consortium or organizational participation required'],
  'otf-iff-nocturnal': ['external partner, pilot, or host required'],
  'moda-ai-ecosystem-2026-nocturnal': ['Taiwan company and nonprofit joint applicants required'],
  'nchc-university-ai-compute-yzu-2026': ['university applicant and faculty or unit authority required'],
  'openai-teen-development-research-grants-2026': ['research organization or qualified domain partners required'],
  'anthropic-economic-futures-research-fund-2026': ['institutional lead required; individuals are ineligible'],
  'legaltech-app-2026': ['student team and adviser required'],
  'nvidia-inception': ['incorporated startup required'],
  'startupterrace-hs': ['company or startup vehicle required'],
  'tw-procurement-cite': ['company and vendor setup required'],
  'tw-procurement-nocturnal': ['company and vendor setup required'],
  'tw-procurement-publicgood': ['company and vendor setup required'],
  'procure-taitra-isourcing-electronics-2026': ['supplier or vendor posture and buyer engagement required'],
  'joss-policy-lab': ['external research or community impact required'],
  'isif-asia-2027-nocturnal-watch': ['registered APNIC-region organization required; individuals are ineligible'],
  'isif-asia-2027-portfolio-watch': ['registered Asia-Pacific organization required; individuals are ineligible'],
};

const ROUTE_OVERRIDES = {
  'fellowship-era-ai-winter-2027': {
    readiness: 'APPLICANT_ONLY_NO_AI_DRAFTING_GATE',
    ready_for_browser: false,
    packaging_required: ['applicant-authored responses within the live character limits', 'two referee records', 'applicant review/designation of the refreshed CV'],
    engineering_required: 'NONE',
    documents_missing_or_unverified: ['generated CV requires applicant review', '750-character experience answer', '2,000-character project answer', '800-character Technical AI Governance forecasting-methods answer', 'two referee records'],
    dependency_or_human_gates: ['no-LLM/no-AI-use attestation', 'applicant-only authorship of all written answers', 'citizenship and visa facts', 'consents', 'final application submit'],
    next_action: 'Keep this route out of AI-assisted drafting. Use the compliance checklist only; the applicant must independently write every answer and resolve the live no-AI-use attestation truthfully.',
  },
  'taai-2026-domestic-hardware-splicer': {
    readiness: 'READY_FOR_BROWSER_DRAFT',
    ready_for_browser: true,
    packaging_required: [],
    engineering_required: 'NONE',
    documents_missing_or_unverified: [],
    dependency_or_human_gates: ['signed-in OpenReview account', 'authorship/originality and terms attestations', 'final submit'],
    next_action: 'Use the existing FIRE packet and designated two-page PDF in the signed-in browser; map fields and save the draft.',
  },
  'phd-vu-social-data': {
    readiness: 'GENERATED_PACKET_ELIGIBILITY_GATE',
    ready_for_browser: false,
    packaging_required: ['applicant review/designation of the generated one-page letter and refreshed CV'],
    engineering_required: 'NONE',
    documents_missing_or_unverified: ['generated CV and letter require review', 'completed-master eligibility is not established'],
    dependency_or_human_gates: ['user has paused PhD applications', 'advertised completed research-master requirement', 'outside-work/IP terms', 'final submit'],
    next_action: 'Keep out of the automatic queue. The letter is ready for review, but verify completed-master eligibility before any portal draft.',
  },
  'fij-2026-nocturnal': {
    readiness: 'DEPENDENCY_BLOCKED',
    ready_for_browser: false,
    packaging_required: ['journalist-led investigation proposal, only after a real lead exists'],
    engineering_required: 'NONE',
    documents_missing_or_unverified: [],
    dependency_or_human_gates: ['real freelance journalist, staff reporter, or media-outlet applicant'],
    next_action: 'Skip this cycle unless a real journalist/investigation lead is already committed.',
  },
  'job-hku-ai-engineer-mcp-ra2-2026': {
    readiness: 'ELIGIBILITY_BLOCKED_OR_UNCERTAIN',
    ready_for_browser: false,
    packaging_required: ['applicant review/designation of the refreshed CV', 'optional one-page cover note only if the portal accepts one'],
    engineering_required: 'NONE',
    documents_missing_or_unverified: ['generated CV and cover note require applicant review', 'CS-or-related-degree interpretation is unresolved', 'production evidence for several exact required technologies is not established'],
    dependency_or_human_gates: ['degree-field eligibility', 'genuine exact-stack evidence', 'Hong Kong work authorization/sponsorship', 'salary/IP/outside-work terms', 'final submit'],
    next_action: 'Do not auto-queue. Treat this as a stretch route until the degree-field interpretation and genuine evidence for the required stack are resolved; use the CV as the primary record.',
  },
  'phd-vu-atlantis': {
    readiness: 'GENERATED_COVER_PACKET_PERSONAL_RECORDS_HOLD',
    ready_for_browser: false,
    packaging_required: ['applicant review/designation of generated cover letter and refreshed CV', 'designated audited writing sample'],
    engineering_required: 'NONE',
    documents_missing_or_unverified: ['generated CV and cover letter require review', 'academic transcripts not found', 'writing sample not designated/audited', 'two referee names and contact details not found', 'documented ML/bias/fairness/XAI evidence not established'],
    dependency_or_human_gates: ['user has paused PhD applications', 'master completion timing', 'degree/profile fit', 'referee disclosure', 'final submit'],
    next_action: 'Do not queue automatically. This route cannot become executable until the full official document set is assembled and verified.',
  },
  'phd-nhh-finance': {
    readiness: 'GENERATED_RESEARCH_PACKET_FORMAL_RECORDS_HOLD',
    ready_for_browser: false,
    packaging_required: ['applicant review/designation of generated CV, statement, tentative proposal, and research-activity list'],
    engineering_required: 'NONE_FOR_GENERATED_DRAFT_PACKET',
    documents_missing_or_unverified: ['generated documents require review', 'bachelor certificate/transcript and current master course/grade overview not found', 'grading-scale description not found', 'GMAT/GRE score or exemption evidence not found', 'English score or exemption evidence not found'],
    dependency_or_human_gates: ['user has paused PhD applications', 'formal academic eligibility', 'outside paid-work terms', 'final submit'],
    next_action: 'Do not queue automatically. The written research packet is generated; verify formal records, exemptions, current-degree eligibility and the applicant-approved research agenda before portal work.',
  },
  'fc27-cl-eci': {
    readiness: 'RESEARCH_EVIDENCE_REPAIR_REQUIRED',
    ready_for_browser: false,
    packaging_required: ['venue-format short paper', 'originality/overlap check', 'submission metadata'],
    engineering_required: 'RESEARCH_EVIDENCE_REPAIR',
    documents_missing_or_unverified: [],
    dependency_or_human_gates: ['authorship/originality declaration', 'final submit'],
    next_action: 'Repair or remove the unreproduced indicator result, disclose the stationarity limitation, freeze the audited manuscript, then package for FC27.',
  },
  'shih-hsin-finance-2026-il': {
    readiness: 'READY_FOR_BROWSER_DRAFT',
    ready_for_browser: true,
    packaging_required: [],
    engineering_required: 'NONE',
    documents_missing_or_unverified: [],
    dependency_or_human_gates: ['signed-in Google account/email', 'authorship/originality declaration', 'privacy/terms consent', 'final submit', 'post-submission phone confirmation'],
    next_action: 'Use the existing FIRE packet and corrected DOCX/PDF in the signed-in browser; map the live Google Form, complete every safe field and upload, then stop at protected commitments and final submit.',
  },
  'ssi-fellowship-2027-policy-lab': {
    readiness: 'PACKET_BLOCKED_ON_SCREENCAST',
    ready_for_browser: false,
    packaging_required: [
      'replace the old deck budget because CW27 registration, travel, and accommodation are provided separately',
      'record and host the required six-minute-maximum screencast from the corrected deck and revised narration',
    ],
    engineering_required: 'NONE',
    documents_missing_or_unverified: ['corrected screencast deck', 'hosted screencast URL'],
    dependency_or_human_gates: ['applicant voice/recording', 'personal demographics', 'career-stage and JACS confirmation', 'privacy/terms consent', 'final submit'],
    next_action: 'Correct the budget slide, record and host the revised screencast, then bind its URL and applicant-only answers before browser execution.',
  },
  'cht-smart-innovation-2026-cl-eci': {
    readiness: 'TEAM_GATE_THEN_PACKAGING',
    ready_for_browser: false,
    packaging_required: ['competition-specific CL-ECI packet'],
    engineering_required: 'NONE',
    documents_missing_or_unverified: [],
    dependency_or_human_gates: ['team must include at least one Taiwan national', 'team commitment', 'terms', 'final submit'],
    next_action: 'Verify and authorize the team composition first; if it clears, package the existing Policy Lab evidence without new product work.',
  },
  'smartliving-creative-2026': {
    readiness: 'CATEGORY_RECON_THEN_PACKAGING',
    ready_for_browser: false,
    packaging_required: ['category-native competition packet if an existing project fits'],
    engineering_required: 'CONDITIONAL_NONE_DO_NOT_BUILD_A_NEW_PROJECT_FOR_FIT',
    documents_missing_or_unverified: [],
    dependency_or_human_gates: ['category eligibility', 'terms', 'final submit'],
    next_action: 'Map the rules to an existing Hardware Splicer capability; package only if the fit is native, otherwise skip.',
  },
};

function normalized(value) {
  return String(value ?? '').toUpperCase();
}

export function externalDependencyReasons(record, routeOverride = ROUTE_OVERRIDES[record?.id]) {
  if (!CAMPAIGN_AUTHORITY.policy.exclude_routes_requiring_new_external_prerequisites) return [];
  const text = [
    record?.gate,
    ...(routeOverride?.dependency_or_human_gates ?? []),
    ...(routeOverride?.documents_missing_or_unverified ?? []),
  ].filter(Boolean).join(' ');
  const reasons = EXTERNAL_PREREQUISITE_RULES
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(text)))
    .map(([reason]) => reason);
  const routeReasons = [...(ROUTE_EXTERNAL_PREREQUISITES[record?.id] ?? [])];
  if (String(record?.id ?? '').startsWith('innoserve-')) {
    routeReasons.push('InnoServe parent program requires a student team and school adviser administration');
  }
  if (String(record?.id ?? '').startsWith('outbound-')) {
    routeReasons.push('outbound route requires recruiting an external counterpart');
  }
  return [...new Set([...reasons, ...routeReasons])];
}

export function isExternalDependencyExcluded(record) {
  return externalDependencyReasons(record).length > 0;
}

export function applicantDocumentAuthority() {
  return structuredClone(DOCUMENT_AUTHORITY);
}

export function phdAutomaticQueueEnabled() {
  return DOCUMENT_AUTHORITY.policy.phd_automatic_queue === 'ENABLED';
}

export function isPhdRoute(record) {
  return normalized(record?.lane) === 'PHD' || normalized(record?.lane) === 'PHD_FACULTY' || normalized(record?.route_class) === 'PHD';
}

export function automaticQueueExclusionReasons(record) {
  const reasons = [];
  if ((DOCUMENT_AUTHORITY.policy.automatic_queue_excluded_routes ?? []).includes(record?.id)) {
    reasons.push('user_paused_named_route');
  }
  const excludedAssets = new Set(DOCUMENT_AUTHORITY.policy.automatic_queue_excluded_assets ?? []);
  if (routeAssets(record).some((asset) => excludedAssets.has(asset))) {
    reasons.push('user_owned_asset_campaign');
  }
  reasons.push(...externalDependencyReasons(record));
  if (isPhdRoute(record) && !phdAutomaticQueueEnabled()) reasons.push('phd_automatic_queue_paused');
  return [...new Set(reasons)];
}

export function isAutomaticQueueExcluded(record) {
  return automaticQueueExclusionReasons(record).length > 0;
}

export function assessSubmissionReadiness(record) {
  if (!record) {
    return {
      readiness: 'ROUTE_BINDING_REQUIRED', ready_for_browser: false, packaging_required: [],
      engineering_required: 'UNKNOWN_UNTIL_ROUTE_BOUND', documents_missing_or_unverified: [],
      dependency_or_human_gates: [], next_action: 'Bind and verify an official route before preparing a submission.',
    };
  }
  const externalDependencies = externalDependencyReasons(record);
  if (externalDependencies.length) {
    return {
      readiness: 'EXTERNAL_DEPENDENCY_EXCLUDED', ready_for_browser: false, packaging_required: [],
      engineering_required: 'NONE_DO_NOT_BUILD_AROUND_EXTERNAL_PREREQUISITES', documents_missing_or_unverified: [],
      dependency_or_human_gates: externalDependencies,
      next_action: 'Drop from the active execution queue. Retain only for audit/history unless the route later removes every pre-application external dependency.',
    };
  }
  if (ROUTE_OVERRIDES[record.id]) return structuredClone(ROUTE_OVERRIDES[record.id]);
  if (isPhdRoute(record) && !phdAutomaticQueueEnabled()) {
    return {
      readiness: 'PHD_DOCUMENT_HOLD', ready_for_browser: false,
      packaging_required: ['route-specific PhD packet'], engineering_required: 'UNKNOWN_UNTIL_DOCUMENT_AND_FIT_AUDIT',
      documents_missing_or_unverified: ['route-specific applicant document set is not verified'],
      dependency_or_human_gates: ['user has paused PhD applications', 'final submit'],
      next_action: 'Keep out of the automatic application queue until the user reopens PhD applications and the official document set is verified.',
    };
  }
  const status = normalized(record.status);
  const execution = normalized(record.execution_state);
  if (/KILL|REJECT|EXPIRED/.test(status)) {
    return {
      readiness: 'NOT_ACTIONABLE', ready_for_browser: false, packaging_required: [], engineering_required: 'NONE',
      documents_missing_or_unverified: [], dependency_or_human_gates: [], next_action: 'Do not execute this route.',
    };
  }
  if (/DEPENDENCY|PARTNER|TEAM_GATE/.test(`${status} ${execution}`)) {
    return {
      readiness: 'DEPENDENCY_BLOCKED', ready_for_browser: false, packaging_required: [], engineering_required: 'NONE',
      documents_missing_or_unverified: [], dependency_or_human_gates: [record.gate].filter(Boolean),
      next_action: 'Resolve the external dependency before packaging or browser execution.',
    };
  }
  if (record.execution_manifest && /PACKET_READY|PORTAL_MAPPED|PREPARE_VERIFIED|HUMAN_SUBMIT_READY/.test(execution)) {
    return {
      readiness: 'READY_FOR_BROWSER_DRAFT', ready_for_browser: true, packaging_required: [], engineering_required: 'NONE',
      documents_missing_or_unverified: [], dependency_or_human_gates: ['protected attestations and final submit'],
      next_action: 'Execute the designated packet in the signed-in browser to the last safe state.',
    };
  }
  if (/APPLICATION_READY|OUTREACH_READY|PACKET_READY/.test(execution) || /FIRE|PRIMARY/.test(status)) {
    return {
      readiness: 'PACKAGING_OR_ROUTE_RECON_REQUIRED', ready_for_browser: false, packaging_required: ['route-specific submission packet'],
      engineering_required: 'NOT_INDICATED_BY_CURRENT_RECORD', documents_missing_or_unverified: [],
      dependency_or_human_gates: [record.gate].filter(Boolean), next_action: 'Verify the live route and finish the submission packet before browser execution.',
    };
  }
  return {
    readiness: 'RESEARCH_OR_RECON_REQUIRED', ready_for_browser: false, packaging_required: [],
    engineering_required: 'UNKNOWN_UNTIL_ROUTE_RECON', documents_missing_or_unverified: [],
    dependency_or_human_gates: [record.gate].filter(Boolean), next_action: 'Reverify the source, eligibility and required artifacts.',
  };
}
