import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const census = JSON.parse(
  fs.readFileSync(new URL('../data/main-quest-census-pass2-2026-09-15.json', import.meta.url), 'utf8'),
);

test('Pass 2 preserves the census denominator before ranking', () => {
  assert.equal(census.schema, 'gauntlet.main_quest_census.v1');
  assert.equal(census.authority.lane, 'RADAR');
  assert.equal(census.authority.discovery_rule, 'Discovery may gate, but it may not rank.');
  assert.equal(census.coverage.total.routes_captured, 149);
  assert.equal(census.coverage.taiwan_phd.routes_captured, 61);
  assert.equal(census.coverage.taiwan_employment.routes_captured, 88);
  assert.deepEqual(census.doctrine.pipeline, [
    'MASTER_UNIVERSE',
    'ELIGIBILITY_GATES',
    'PACKET_FAMILIES',
    'MARGINAL_APPLICATION_COST',
    'EXECUTION_QUEUE',
  ]);
});

test('Pass 2 gate counts reconcile exactly to the 149-route universe', () => {
  const gates = census.coverage.gate_distribution;
  assert.equal(
    gates.ELIGIBLE + gates.STRETCH + gates.DEGREE_GATE + gates.SENIORITY_GATE
      + gates.LANGUAGE_GATE + gates.NOT_ELIGIBLE,
    149,
  );
  assert.deepEqual(gates, {
    ELIGIBLE: 52,
    STRETCH: 57,
    DEGREE_GATE: 19,
    SENIORITY_GATE: 21,
    LANGUAGE_GATE: 0,
    NOT_ELIGIBLE: 0,
  });
});

test('the complete persisted PhD compact index reconciles to its coverage matrix', () => {
  const rows = census.phd_denominator.compact_route_index;
  assert.equal(rows.length, 61);
  const counts = rows.reduce((acc, row) => {
    acc[row.gate] = (acc[row.gate] ?? 0) + 1;
    return acc;
  }, {});
  assert.equal(counts.ELIGIBLE, 36);
  assert.equal(counts.STRETCH, 22);
  assert.equal(counts.DEGREE_GATE, 3);
  assert.equal(census.phd_denominator.with_route_rows.length, 16);
  assert.equal(census.phd_denominator.c_tier_delta_queue.length, 5);
});

test('employment coverage debt remains visible instead of becoming a false negative', () => {
  assert.equal(census.employment_denominator.employers_in_denominator, 57);
  assert.equal(census.employment_denominator.employers_with_route_rows, 35);
  assert.equal(census.employment_denominator.c_tier_delta_queue.length, 22);
  assert.equal(census.coverage.taiwan_employment.searched_no_exact_route_promoted, 22);
  assert.match(census.employment_denominator.compact_index_integrity_note, /not individually recoverable|not individually/i);
});

test('missing transient row payload cannot silently enter the Gauntlet master', () => {
  assert.equal(census.hydration_state.full_149_row_master_payload, 'PENDING_EXACT_REEXPORT_OR_RECOVERY');
  assert.equal(census.hydration_state.master_builder_wiring, 'DEFERRED_UNTIL_FULL_ROW_PAYLOAD');
  assert.equal(census.hydration_state.phd_rows_exactly_hydrated_from_persisted_report, 61);
  assert.equal(census.hydration_state.job_rows_exactly_hydrated_from_persisted_report, false);
  assert.match(census.hydration_state.safe_rule, /Do not reconstruct missing job rows from guesses/);
});

test('census data contains no downstream P0/FIRE ranking state', () => {
  const text = JSON.stringify(census);
  assert.doesNotMatch(text, /P0_MUST_APPLY|P1_APPLY|FIRE_FIRST_BATCH|FIRE_FIRST_OR_SECOND_BATCH|QUEUE_HIGH_FIT/);
});
