import fs from 'node:fs';

const PLAN_URL = new URL('../../data/main-quest-internal-execution-plan-2026-09-17.json', import.meta.url);
const ASSETS_URL = new URL('../../data/portfolio-assets.json', import.meta.url);

function readJson(url) {
  return JSON.parse(fs.readFileSync(url, 'utf8'));
}

export function mainQuestInternalPlan() {
  return readJson(PLAN_URL);
}

function assetIndex() {
  return new Map(readJson(ASSETS_URL).assets.map((asset) => [asset.id, asset]));
}

export function internalBuildQueue({ limit = 20 } = {}) {
  const plan = mainQuestInternalPlan();
  if (plan.operating_mode !== 'INTERNAL_BUILD_ONLY' || plan.external_execution_authorized !== false) {
    throw new Error('Main Quest internal queue requires INTERNAL_BUILD_ONLY with external execution disabled.');
  }

  const assets = assetIndex();
  const boundedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0
    ? Math.floor(Number(limit))
    : 20;

  const items = plan.active_asset_advancement
    .filter((item) => ['IN_PROGRESS_INTERNAL', 'READY_INTERNAL_BUILD'].includes(item.state))
    .sort((a, b) => a.priority - b.priority || a.asset_id.localeCompare(b.asset_id))
    .slice(0, boundedLimit)
    .map((item, index) => {
      const asset = assets.get(item.asset_id);
      if (!asset) throw new Error(`Unknown portfolio asset: ${item.asset_id}`);
      return {
        queue_position: index + 1,
        asset_id: item.asset_id,
        asset_name: asset.name,
        repository: asset.repo,
        priority: item.priority,
        state: item.state,
        objective: item.objective,
        acceptance: item.acceptance,
        progress: item.progress ?? null,
        evidence_boundary: {
          implementation_stage: asset.implementation_stage,
          external_evidence_stage: asset.external_evidence_stage,
          deployment_stage: asset.deployment_stage,
          canonicalization_state: asset.canonicalization_state,
          forbidden_claims: asset.forbidden_claims ?? [],
        },
        permitted_actions: [
          'inspect canonical evidence',
          'develop and test inside the project repository',
          'produce reproducible internal evidence',
          'return a bounded reassessment record',
        ],
        forbidden_actions: [
          'external outreach',
          'account creation',
          'external upload or publication',
          'payment or purchase',
          'application or submission',
          'claiming external validation from internal work',
        ],
      };
    });

  return {
    schema: 'blowback.main_quest_internal_queue.v1',
    as_of: plan.as_of,
    operating_mode: plan.operating_mode,
    external_execution_authorized: false,
    count: items.length,
    items,
  };
}

export function nextInternalBuild() {
  const queue = internalBuildQueue({ limit: 1 });
  return {
    schema: 'blowback.main_quest_internal_mission.v1',
    as_of: queue.as_of,
    operating_mode: queue.operating_mode,
    external_execution_authorized: false,
    mission: queue.items[0] ?? null,
    reason: queue.items.length ? undefined : 'no ready internal build tasks',
  };
}

export function internalQuestStatus() {
  const plan = mainQuestInternalPlan();
  const queue = internalBuildQueue();
  return {
    schema: 'blowback.main_quest_internal_status.v1',
    as_of: plan.as_of,
    operating_mode: plan.operating_mode,
    external_execution_authorized: false,
    terminal_objective: plan.terminal_objective,
    main_quests: plan.main_quests.map(({ id, state, completion_gate }) => ({ id, state, completion_gate })),
    shared_deliverables_state: plan.shared_deliverables_state,
    ready_internal_builds: queue.count,
    next: queue.items[0] ?? null,
    support_only_assets: plan.support_only_assets,
    deferred_assets: plan.deferred_assets,
  };
}
