import fs from 'node:fs';

import { resolvePortfolioAllocation, routeAssets } from './portfolio.mjs';

const DEFAULT_SCOPE = JSON.parse(fs.readFileSync(
  new URL('../../data/portfolio-campaign-scope-2026-09-12.json', import.meta.url),
  'utf8'
));

function scopeSets(scope = DEFAULT_SCOPE) {
  return {
    active: new Set(scope.active_lead_assets ?? []),
    support: new Set(scope.support_only_assets ?? []),
    deferred: new Set(scope.deferred_lead_assets ?? []),
  };
}

export function portfolioCampaignScope() {
  return DEFAULT_SCOPE;
}

/**
 * Decide whether a route belongs in the active execution campaign.
 *
 * This is deliberately separate from the master registry: excluded routes remain
 * discoverable and auditable, but cannot occupy automatic execution queue slots.
 */
export function routeCampaignDecision(record = {}, scope = DEFAULT_SCOPE) {
  const allocation = resolvePortfolioAllocation(record);
  const { active, support, deferred } = scopeSets(scope);
  const lead = allocation.lead_asset;
  const candidates = new Set([
    ...(allocation.lead_projects ?? []),
    ...routeAssets(record),
  ]);
  const activeCandidates = [...candidates].filter((asset) => active.has(asset));
  const deferredCandidates = [...candidates].filter((asset) => deferred.has(asset));

  if (allocation.mode === 'SHARED_ENTITLEMENT') {
    return {
      included: scope.include_shared_entitlements === true,
      role: 'SHARED_RESOURCE',
      reason: scope.include_shared_entitlements === true
        ? 'Shared entitlement supports the selected portfolio without consuming a project slot.'
        : 'Shared entitlements are disabled for this campaign.',
      allocation,
    };
  }

  if (allocation.mode === 'PORTFOLIO_BAKEOFF' && activeCandidates.length > 0) {
    return {
      included: true,
      role: 'ACTIVE_BAKEOFF',
      reason: `Route has active lead candidates: ${activeCandidates.join(', ')}. Allocation must resolve before submission.`,
      active_candidates: activeCandidates,
      deferred_candidates: deferredCandidates,
      allocation,
    };
  }

  if (lead && active.has(lead)) {
    return {
      included: true,
      role: 'ACTIVE_LEAD',
      reason: `${lead} is an active campaign lead asset.`,
      allocation,
    };
  }

  if (lead && deferred.has(lead)) {
    return {
      included: false,
      role: 'DEFERRED_LEAD',
      reason: `${lead} is explicitly deferred from the active campaign.`,
      allocation,
    };
  }

  if (lead && support.has(lead)) {
    return {
      included: false,
      role: 'SUPPORT_ONLY',
      reason: `${lead} may support a selected asset but may not lead a standalone queue item.`,
      allocation,
    };
  }

  if (allocation.mode === 'SUPPORT_ONLY') {
    return {
      included: false,
      role: 'SUPPORT_ONLY',
      reason: 'Support-only assets cannot consume a standalone campaign slot.',
      allocation,
    };
  }

  if (allocation.mode === 'PERSON_BUNDLE' && activeCandidates.length > 0) {
    return {
      included: true,
      role: 'ACTIVE_PERSON_BUNDLE',
      reason: `Person-level route is explicitly packaged around selected assets: ${activeCandidates.join(', ')}.`,
      active_candidates: activeCandidates,
      allocation,
    };
  }

  return {
    included: false,
    role: 'OUT_OF_SCOPE',
    reason: 'No selected portfolio asset is authorized to lead this route.',
    allocation,
  };
}

export function routeInCampaignScope(record, scope = DEFAULT_SCOPE) {
  return routeCampaignDecision(record, scope).included;
}

export function campaignScopedRecords(records, scope = DEFAULT_SCOPE) {
  return records.filter((record) => routeInCampaignScope(record, scope));
}
