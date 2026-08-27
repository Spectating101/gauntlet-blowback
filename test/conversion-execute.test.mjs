import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareReadyCampaign } from '../src/conversion/execute.mjs';

test('non-ready campaign is rejected before any browser execution', async () => {
  const campaign = {
    campaign_id: 'public-good:partner-needed',
    state: 'DEPENDENCY_REQUIRED',
    project: { id: 'public-good-control' },
    opportunity: { id: 'pilot:1' },
    autonomy: { may_prepare: false }
  };
  await assert.rejects(
    () => prepareReadyCampaign(campaign, { manifestPath: 'does-not-matter.json' }),
    /not ready for autonomous preparation/
  );
});
