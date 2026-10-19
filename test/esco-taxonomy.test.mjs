import test from 'node:test';
import assert from 'node:assert/strict';
import { escoOccupationCandidates } from '../src/radar/esco-taxonomy.mjs';

test('ESCO returns label leads, not jobs or applications', async () => {
  let request;
  const fetchImpl = async url => {
    request = url;
    return {ok: true, headers: {get: () => 'application/json'}, text: async () => JSON.stringify({
      total: 19, _embedded: {results: [
        {uri: 'http://data.europa.eu/esco/occupation/abc123', title: 'Research engineer', preferredLabel: {en: 'research engineer'}, searchHit: 'research engineer'},
        {uri: 'https://evil.test/', title: 'reject'}
      ]}
    })};
  };
  const result = await escoOccupationCandidates('research & engineer', {fetchImpl});
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].job_open, false);
  assert.equal(result.candidates[0].skills_verified, false);
  assert.equal(new URL(request).searchParams.get('text'), 'research & engineer');
});

test('limits and invalid responses are rejected', async () => {
  await assert.rejects(escoOccupationCandidates('x'), /query/);
  await assert.rejects(escoOccupationCandidates('research engineer', {limit: 100}), /limit/);
  await assert.rejects(escoOccupationCandidates('research', {fetchImpl: async () => ({ok:false,status:429})}), /429/);
});
