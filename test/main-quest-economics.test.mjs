import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const economics = JSON.parse(
  fs.readFileSync(new URL('../data/main-quest-economics-2026-09-16.json', import.meta.url), 'utf8'),
);

const byId = new Map(economics.verified_cash_anchors.map((route) => [route.route_id, route]));

test('Main Quest economics is explicitly post-census and money-weighted', () => {
  assert.equal(economics.schema, 'gauntlet.main_quest_economics.v1');
  assert.equal(economics.authority.depends_on, 'data/main-quest-census-pass2-2026-09-15.json');
  assert.match(economics.authority.rule, /Funding and salary are first-class route variables/);
  assert.ok(economics.decision_model.dimensions.includes('funding_or_salary_certainty'));
  assert.ok(economics.decision_model.dimensions.includes('current_monthly_cash'));
  assert.ok(economics.decision_model.dimensions.includes('long_run_income_ceiling'));
});

test('IAIS headline scholarships preserve up-to and employment constraints', () => {
  const outstanding = byId.get('phd-nycu-iais-outstanding');
  const elite = byId.get('phd-nycu-iais-elite');
  assert.equal(outstanding.headline_monthly_ntd, 30000);
  assert.equal(elite.headline_monthly_ntd, 40000);
  assert.equal(outstanding.certainty, 'COMPETITIVE_UP_TO_AMOUNT');
  assert.equal(elite.certainty, 'COMPETITIVE_UP_TO_AMOUNT');
  assert.equal(outstanding.annualized_first_24_months_ntd, 360000);
  assert.equal(elite.annualized_first_24_months_ntd, 480000);
  assert.match(elite.employment_constraint, /Full-time remunerated employment/);
  assert.match(elite.later_stage_note, /not guaranteed/i);
});

test('TIGP first-year funding is distinguished from later advisor dependence', () => {
  const tigp = byId.get('phd-tigp-standard-stipend');
  assert.equal(tigp.headline_monthly_ntd, 40000);
  assert.equal(tigp.certainty, 'GUARANTEED_ON_ADMISSION_FIRST_YEAR');
  assert.equal(tigp.annualized_first_year_ntd, 480000);
  assert.match(tigp.later_years, /advisor/i);
});

test('full-time economic anchors preserve verified floors', () => {
  const itri = byId.get('job-itri-ai-engineer-hsinchu-2026');
  const point72 = byId.get('job-point72-cubist-quant-finance-taipei-2026');
  assert.equal(itri.headline_monthly_ntd, 55000);
  assert.equal(itri.annualized_floor_ntd, 660000);
  assert.equal(point72.headline_annual_ntd, 2200000);
  assert.equal(point72.headline_monthly_equivalent_ntd, 183333);
  assert.equal(point72.decision_effect, 'JACKPOT_LANE_REOPEN_PHD_DECISION');
});

test('derived cash comparisons reconcile', () => {
  const iaisVsItri = economics.derived_comparators.iais_elite_vs_itri_first_two_years;
  assert.equal(iaisVsItri.monthly_cash_gap_ntd, 15000);
  assert.equal(iaisVsItri.annual_cash_gap_ntd, 180000);

  const iaisVsPoint72 = economics.derived_comparators.iais_elite_vs_point72;
  assert.equal(iaisVsPoint72.annual_cash_gap_ntd, 1720000);
  assert.ok(Math.abs(iaisVsPoint72.point72_to_iais_cash_multiple - (2200000 / 480000)) < 0.0001);
});

test('unknown economics cannot be silently ranked', () => {
  assert.equal(economics.route_policy.unknown_salary_or_funding_routes.state, 'ECONOMICS_UNRESOLVED');
  assert.match(economics.route_policy.unknown_salary_or_funding_routes.rule, /Do not assign a money-weighted priority/);
  assert.match(economics.decision_bands.note, /heuristics/i);
});
