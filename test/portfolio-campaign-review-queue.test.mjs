import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { buildMasterRegistry } from '../scripts/build-gauntlet-master.mjs';
import { auditCampaignCoverage } from '../src/allocation/portfolio-campaign-graph.mjs';

const review = JSON.parse(fs.readFileSync(
  new URL('../data/portfolio-campaign-review-queue-2026-09-16.json', import.meta.url),
  'utf8',
));

test('every unresolved scoped route has one assessment disposition', () => {
  const unresolved = auditCampaignCoverage(buildMasterRegistry()).assignments
    .filter((row) => row.assignment_state === 'NEEDS_CAMPAIGN_ASSIGNMENT')
    .map((row) => row.route_id)
    .sort();
  const reviewed = review.decisions.map((row) => row.route_id).sort();
  assert.deepEqual(reviewed, unresolved);
  assert.equal(new Set(reviewed).size, reviewed.length);
});

test('review dispositions never authorize execution', () => {
  assert.match(review.authority, /never authorizes browser execution/i);
  for (const decision of review.decisions) {
    assert.ok(decision.disposition);
    assert.ok(decision.reason);
    assert.ok(!/FIRE|SUBMIT|EXECUTE/i.test(decision.disposition));
  }
});
