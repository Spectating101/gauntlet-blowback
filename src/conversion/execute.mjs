import { runOpportunity } from '../commands/run.mjs';

export async function prepareReadyCampaign(campaign, { manifestPath, persistAuth = false } = {}) {
  if (!campaign?.campaign_id) throw new Error('valid conversion campaign required');
  if (campaign.state !== 'READY_TO_PREPARE' || campaign.autonomy?.may_prepare !== true) {
    throw new Error(`campaign is not ready for autonomous preparation: ${campaign.state ?? 'unknown'}`);
  }
  if (!manifestPath) throw new Error('manifestPath is required for portal preparation');

  const result = await runOpportunity(manifestPath, { persistAuth });
  return {
    schema: 'blowback.preparation_receipt.v1',
    campaign_id: campaign.campaign_id,
    opportunity_id: campaign.opportunity.id,
    record_dir: result.recordDir,
    human_required: result.humanRequired,
    result: result.result,
    final_submit_performed: false,
    boundary: 'portal preparation completed; final external commitment remains human-controlled'
  };
}
