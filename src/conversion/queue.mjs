import { buildConversionCampaign } from './operator.mjs';
import { createHash } from 'node:crypto';

const STATE_PRIORITY = new Map([
  ['READY_TO_PREPARE', 0],
  ['DEPENDENCY_REQUIRED', 1],
  ['VERIFICATION_REQUIRED', 2],
  ['BLOCKED', 3],
  ['REJECTED', 4],
  ['INVALID', 5]
]);

function deadlineValue(campaign) {
  const raw = campaign?.opportunity?.deadline;
  if (!raw) return Number.POSITIVE_INFINITY;
  const parsed = new Date(raw).valueOf();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

const VOLATILE_KEYS = new Set(['generated_at', 'retrieved_at', 'observed_at', 'checked_at', 'updated_at']);
const UNORDERED_ARRAY_KEYS = new Set([
  'claims', 'claim_ids', 'dependencies', 'required_evidence', 'available_evidence',
  'evidence_refs', 'hard_blockers'
]);

function canonicalValue(value, parentKey = '') {
  if (Array.isArray(value)) {
    const items = value.map((item) => canonicalValue(item));
    return UNORDERED_ARRAY_KEYS.has(parentKey)
      ? items.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
      : items;
  }
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value)
    .filter((key) => !VOLATILE_KEYS.has(key))
    .sort()
    .map((key) => [key, canonicalValue(value[key], key)]));
}

function inputFingerprint(input) {
  const material = canonicalValue({
    project: input?.project ?? null,
    opportunity: input?.opportunity ?? null,
    dependencies: input?.dependencies ?? input?.opportunity?.dependencies ?? [],
    claims: input?.claims ?? input?.project?.claims ?? [],
    claim_ids: input?.claim_ids ?? input?.opportunity?.claim_ids ?? []
  });
  return createHash('sha256').update(JSON.stringify(material)).digest('hex');
}

function logicalRouteKey(input) {
  return `${input?.project?.id ?? '(missing-project)'}:${input?.opportunity?.id ?? '(missing-opportunity)'}`;
}

function requireRevisionReview(campaign, fingerprint, conflictingFingerprint) {
  campaign.state = 'VERIFICATION_REQUIRED';
  campaign.autonomy.may_prepare = false;
  const conflicts = new Set([
    ...(campaign.deduplication?.conflicting_fingerprints ?? []),
    conflictingFingerprint
  ]);
  campaign.deduplication = { status: 'REVISION_REVIEW_REQUIRED', fingerprint, conflicting_fingerprints: [...conflicts] };
  campaign.evaluation.reasons = [
    ...(campaign.evaluation.reasons ?? []),
    'same project/opportunity route was rediscovered with materially changed evidence or eligibility; review the revision before preparation'
  ];
}

export function compileConversionQueue(inputs = []) {
  const campaigns = [];
  const failures = [];
  const collapsed_duplicates = [];
  const revision_conflicts = [];
  const seen = new Map();

  inputs.forEach((input, index) => {
    try {
      const campaign = buildConversionCampaign(input);
      const routeKey = logicalRouteKey(input);
      const fingerprint = inputFingerprint(input);
      const prior = seen.get(routeKey);
      if (prior?.fingerprint === fingerprint) {
        collapsed_duplicates.push({
          route_key: routeKey,
          campaign_id: campaign.campaign_id,
          fingerprint,
          input_index: index,
          reason: 'timestamp-only or byte-equivalent rediscovery'
        });
        return;
      }
      if (prior) {
        requireRevisionReview(prior.campaign, prior.fingerprint, fingerprint);
        revision_conflicts.push({
          route_key: routeKey,
          campaign_id: campaign.campaign_id,
          retained_fingerprint: prior.fingerprint,
          candidate_fingerprint: fingerprint,
          retained_input_index: prior.input_index,
          candidate_input_index: index,
          reason: 'material evidence, eligibility, dependency, or claim change requires review'
        });
        return;
      } else {
        campaign.deduplication = { status: 'UNIQUE', fingerprint };
      }
      campaigns.push(campaign);
      seen.set(routeKey, { campaign, fingerprint, input_index: index });
    } catch (error) {
      failures.push({
        input_index: index,
        campaign_id: input?.campaign_id ?? null,
        project_id: input?.project?.id ?? null,
        opportunity_id: input?.opportunity?.id ?? null,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  campaigns.sort((a, b) =>
    (STATE_PRIORITY.get(a.state) ?? 99) - (STATE_PRIORITY.get(b.state) ?? 99) ||
    deadlineValue(a) - deadlineValue(b) ||
    a.campaign_id.localeCompare(b.campaign_id)
  );

  return {
    schema: 'blowback.conversion_queue.v1',
    generated_at: new Date().toISOString(),
    counts: Object.fromEntries([...STATE_PRIORITY.keys()].map((state) => [
      state,
      campaigns.filter((item) => item.state === state).length + (state === 'INVALID' ? failures.length : 0)
    ])),
    auto_prepare_queue: campaigns
      .filter((item) => item.autonomy.may_prepare)
      .map((item) => ({ campaign_id: item.campaign_id, opportunity_id: item.opportunity.id, deadline: item.opportunity.deadline ?? null })),
    human_attention_queue: campaigns
      .filter((item) => ['DEPENDENCY_REQUIRED', 'VERIFICATION_REQUIRED', 'BLOCKED'].includes(item.state))
      .map((item) => ({
        campaign_id: item.campaign_id,
        state: item.state,
        deadline: item.opportunity.deadline ?? null,
        unresolved_dependencies: item.dependency_summary.open,
        evidence_gaps: item.evaluation.evidence_gaps ?? [],
        reasons: item.evaluation.reasons ?? []
      })),
    rejected: campaigns.filter((item) => ['REJECTED', 'INVALID'].includes(item.state)).map((item) => item.campaign_id),
    failures,
    collapsed_duplicates,
    revision_conflicts,
    campaigns
  };
}
