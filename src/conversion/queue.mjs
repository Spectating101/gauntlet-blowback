import { buildConversionCampaign } from './operator.mjs';

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

export function compileConversionQueue(inputs = []) {
  const campaigns = inputs.map((input) => buildConversionCampaign(input));
  campaigns.sort((a, b) =>
    (STATE_PRIORITY.get(a.state) ?? 99) - (STATE_PRIORITY.get(b.state) ?? 99) ||
    deadlineValue(a) - deadlineValue(b) ||
    a.campaign_id.localeCompare(b.campaign_id)
  );

  return {
    schema: 'blowback.conversion_queue.v1',
    generated_at: new Date().toISOString(),
    counts: Object.fromEntries([...STATE_PRIORITY.keys()].map((state) => [state, campaigns.filter((item) => item.state === state).length])),
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
    campaigns
  };
}
