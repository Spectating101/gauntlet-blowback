import test from 'node:test';
import assert from 'node:assert/strict';
import { assessEconomicOpportunity } from '../src/conversion/economic-triage.mjs';

test('undisclosed job compensation remains price discovery rather than rejection', () => {
  const result = assessEconomicOpportunity({ type: 'job', economic_profile: { compensation_confidence: 'UNKNOWN' } });
  assert.equal(result.posture, 'PRICE_DISCOVERY');
  assert.equal(result.acceptance_posture, 'OFFER_REQUIRED');
});

test('upper-tail verified job range receives high-value firing posture', () => {
  const result = assessEconomicOpportunity({
    type: 'job',
    economic_profile: {
      annual_compensation_min_ntd: 1_500_000,
      annual_compensation_max_ntd: 4_000_000,
      compensation_confidence: 'VERIFIED'
    }
  });
  assert.equal(result.posture, 'HIGH_VALUE_FIRE');
});

test('low-compensation full-time role is retained only as economic backstop', () => {
  const result = assessEconomicOpportunity({
    type: 'job',
    economic_profile: {
      annual_compensation_min_ntd: 660_000,
      annual_compensation_max_ntd: 720_000,
      compensation_confidence: 'VERIFIED'
    }
  });
  assert.equal(result.posture, 'ECONOMIC_BACKSTOP');
});

test('funded phd with unresolved founder and IP terms requires due diligence before acceptance', () => {
  const result = assessEconomicOpportunity({
    type: 'phd',
    economic_profile: {
      monthly_funding_min_ntd: 40_000,
      tuition_coverage: 'VERIFIED_POSITIVE',
      founder_freedom: 'UNKNOWN',
      preexisting_ip_protection: 'UNKNOWN',
      outside_income_freedom: 'UNKNOWN',
      research_freedom: 'MIXED'
    }
  });
  assert.equal(result.posture, 'FIRE_DUE_DILIGENCE');
  assert.equal(result.acceptance_posture, 'DO_NOT_ACCEPT_YET');
});

test('funded phd with verified autonomy can become high-optionality fire', () => {
  const result = assessEconomicOpportunity({
    type: 'phd',
    economic_profile: {
      monthly_funding_min_ntd: 40_000,
      tuition_coverage: 'VERIFIED_POSITIVE',
      founder_freedom: 'VERIFIED_POSITIVE',
      preexisting_ip_protection: 'VERIFIED_POSITIVE',
      outside_income_freedom: 'VERIFIED_POSITIVE',
      research_freedom: 'VERIFIED_POSITIVE'
    }
  });
  assert.equal(result.posture, 'HIGH_OPTIONALITY_FIRE');
});
