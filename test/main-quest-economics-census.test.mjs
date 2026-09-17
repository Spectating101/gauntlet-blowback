import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const census = JSON.parse(
  fs.readFileSync(new URL('../data/main-quest-economics-census-2026-09-16.json', import.meta.url), 'utf8'),
);

test('economics census accounts for the full 149-route Main Quest universe', () => {
  const phd = census.phd_institution_funding.reduce((sum, row) => sum + (row.covered_census_routes ?? 0), 0);
  const jobs = census.employment_compensation_families.reduce((sum, row) => sum + (row.covered_named_routes ?? 0), 0);
  assert.equal(phd, 61);
  assert.equal(jobs, 88);
  assert.equal(phd + jobs, 149);
  assert.equal(census.coverage.master_routes, 149);
});

test('all PhD denominator institutions remain present, including zero-route delta institutions', () => {
  assert.equal(census.phd_institution_funding.length, 21);
  const names = new Set(census.phd_institution_funding.map((row) => row.institution));
  for (const name of [
    'NYCU', 'NTU', 'NTHU', 'NCCU', 'NCU', 'NTUST', 'NCKU', 'NCHU', 'NSYSU', 'CCU',
    'YunTech', 'Taipei Tech', 'Feng Chia', 'NTNU', 'NTPU', 'TIGP / Academia Sinica',
    'Yuan Ze University', 'Chung Yuan Christian University',
    'National Kaohsiung University of Science and Technology', 'National Dong Hwa University',
    'National Taiwan Ocean University',
  ]) assert.ok(names.has(name), `missing economics institution ${name}`);
});

test('unknown compensation is preserved as state rather than omission', () => {
  const allowed = new Set(Object.keys(census.state_semantics));
  for (const row of census.phd_institution_funding) assert.ok(allowed.has(row.state), `unknown PhD state ${row.state}`);
  for (const row of census.employment_compensation_families) assert.ok(allowed.has(row.state), `unknown job state ${row.state}`);
  assert.ok(census.employment_compensation_families.some((row) => row.state === 'SEARCH_PENDING'));
  assert.equal(census.employment_compensation_families.filter((row) => row.state === 'IDENTITY_GAP').length, 2);
});

test('published amounts remain distinct from conditional and undisclosed money', () => {
  const point72 = census.employment_compensation_families.find((row) => row.employer === 'Point72 / Cubist');
  const itri = census.employment_compensation_families.find((row) => row.employer === 'ITRI');
  const nvidia = census.employment_compensation_families.find((row) => row.employer === 'NVIDIA');
  assert.equal(point72.state, 'VERIFIED_NUMERIC');
  assert.equal(itri.state, 'VERIFIED_NUMERIC');
  assert.equal(nvidia.state, 'NEGOTIABLE_UNDISCLOSED');

  const iais = census.phd_institution_funding.find((row) => row.institution === 'NYCU');
  assert.ok(iais.programs.some((row) => row.name === 'IAIS Elite New PhD' && row.monthly_ntd === 40000));
  assert.ok(iais.programs.some((row) => row.certainty === 'COMPETITIVE_UP_TO_AMOUNT'));
});

test('economics discovery cannot pre-filter routes by value', () => {
  assert.equal(census.authority.anti_filter_rule, 'No route may disappear because its compensation or funding is unknown, low, awkward, conditional, or unpublished.');
  assert.equal(census.coverage.coverage_rule, 'UNKNOWN IS A RESULT, NOT AN OMISSION.');
  assert.match(census.execution_contract.ranking_gate, /only after/i);
});
