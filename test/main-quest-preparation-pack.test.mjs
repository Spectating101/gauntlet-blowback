import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pack = JSON.parse(fs.readFileSync(path.join(root, 'data/main-quest-preparation-pack-2026-09-18.json'), 'utf8'));
const sources = new Map(pack.sources.map(x => [x.id, x]));
const claims = new Map(pack.facts.map(x => [x.id, x]));
const families = new Set(pack.families.map(x => x.id));
function sourceRefs(ids) {
  assert.ok(Array.isArray(ids) && ids.length);
  for (const id of ids) assert.ok(sources.has(id), `missing source ${id}`);
}
function safeFile(rel) {
  const resolved = path.resolve(root, rel);
  assert.ok(resolved.startsWith(root + path.sep), `path outside repo: ${rel}`);
  assert.ok(fs.statSync(resolved).isFile(), `missing file: ${rel}`);
  return fs.readFileSync(resolved, 'utf8');
}
test('packet IDs, evidence sources and claims are unique and resolvable', () => {
  assert.equal(sources.size, pack.sources.length);
  assert.equal(claims.size, pack.facts.length);
  assert.equal(new Set(pack.routes.map(x => x.id)).size, pack.routes.length);
  for (const fact of pack.facts) sourceRefs(fact.source_ids);
  for (const card of pack.evidence_cards) {
    sourceRefs(card.source_ids);
    assert.match(card.revision, /^[a-f0-9]{40}$/);
    for (const id of card.claim_ids) assert.ok(claims.has(id));
    assert.equal(card.execution_this_pass, false);
    assert.ok(card.boundary.length > 30);
  }
});
test('six-route batch does not replace or fabricate the 149-route census', () => {
  const d = pack.denominator;
  assert.equal(d.phd + d.employment_reported, d.total_reported);
  assert.equal(d.employment_named_slots + d.employment_identity_gaps, d.employment_reported);
  assert.equal(d.total_reported, 149);
  assert.equal(pack.routes.length, 6);
  assert.equal(pack.scope, 'FIRST_BATCH_PREPARATION_NOT_CENSUS_REPLACEMENT');
  for (const r of pack.routes) { assert.match(r.id, /^batch-/); assert.equal(r.census_key.length, 2); }
});
test('all five reusable families bind to real claim IDs', () => {
  assert.deepEqual([...families].sort(), ['research-applied-ai','financial-ai-fintech','quant','ai-software-agent-systems','semiconductor-eda-physical-ai'].sort());
  for (const f of pack.families) for (const id of f.claim_ids) assert.ok(claims.has(id));
});
test('unresolved sources cannot silently become execution-ready or acquire guessed economics', () => {
  for (const r of pack.routes) {
    sourceRefs(r.source_ids);
    assert.equal(r.execution_state, 'INTERNAL_PREPARATION_ONLY');
    assert.ok(r.open_gates.length > 0);
    assert.equal(r.deadline, null);
    assert.equal(r.compensation, null);
    if (r.type === 'EMPLOYMENT') assert.ok(families.has(r.family));
    if (r.source_state !== 'OFFICIAL_PAGE_RETRIEVED') assert.notEqual(r.packet_state, 'DRAFT_CONTENT_READY');
  }
  assert.ok(pack.routes.filter(r => r.type === 'PHD').every(r => r.source_state !== 'OFFICIAL_PAGE_RETRIEVED'));
});
test('existing draft facts are not elevated into official credential proof', () => {
  for (const f of pack.facts.filter(f => f.evidence_state.startsWith('SELF_REPORTED'))) assert.equal(f.use, 'REVIEW_DRAFT_ONLY');
  for (const id of ['identity','degree-title','bachelor-records','master-records','language','referees','writing-sample','work-authorization']) {
    const d = pack.documents.find(d => d.id === id);
    assert.ok(d && d.state !== 'VERIFIED');
  }
  assert.ok(Object.values(pack.authority).every(x => x === false));
});
test('all packet artifacts and route-copy references exist and contain real content', () => {
  for (const rel of pack.artifacts) assert.ok(safeFile(rel).length > 500);
  for (const r of pack.routes) assert.ok(safeFile(r.copy_path).length > 500);
});
test('Cite-Refinery remains an explicitly scoped work sample, not a merged project identity', () => {
  const c = pack.evidence_cards.find(x => x.id === 'cite-refinery');
  assert.equal(c.repository, 'Spectating101/cite-refinery');
  assert.match(c.boundary, /Orchestrator path only/);
  assert.match(c.boundary, /Low-level kernel/);
  assert.ok(pack.excluded_or_deferred_claims.some(x => /alpha-platform.*Cite-Refinery/.test(x)));
});
test('outward CV does not repeat excluded thesis, publication or credential claims', () => {
  const cv = safeFile('docs/main-quest/2026-09-18/CV.md').split('\n---\n')[0];
  assert.doesNotMatch(cv, /under review|cum laude|GPA|IELTS|HSK|\$192|\$170|Energy-Backed Derivatives/i);
  assert.match(cv, /Expected graduation: December 2026/);
  assert.doesNotMatch(cv, /Master of Finance and Accounting|Global Master of Science/);
});
test('reusable employment prose and proposed research are present without submission claims', () => {
  const jobs = safeFile('docs/main-quest/2026-09-18/EMPLOYMENT_MODULES.md');
  assert.match(jobs, /Point72 \/ Cubist — optional note/);
  assert.match(jobs, /WorldQuant — optional cover letter/);
  const research = safeFile('docs/main-quest/2026-09-18/RESEARCH_BRIEF.md');
  assert.match(research, /held-out|Hold out/);
  assert.match(research, /proposed, not completed experiments/);
  assert.match(research, /Repeated model runs do not create independent task families/);
});
