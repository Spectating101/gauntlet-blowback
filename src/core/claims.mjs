const STATUSES = new Set(['PROVEN', 'INFERRED', 'UNPROVEN']);

export function indexClaims(claims = []) {
  const index = new Map();
  for (const claim of claims) {
    if (!claim?.id) throw new Error('claim requires id');
    if (!STATUSES.has(claim.status)) throw new Error(`invalid claim status for ${claim.id}: ${claim.status}`);
    if (claim.status === 'PROVEN' && !(claim.evidence_refs ?? []).length) {
      throw new Error(`PROVEN claim ${claim.id} requires evidence_refs`);
    }
    if (index.has(claim.id)) throw new Error(`duplicate claim id: ${claim.id}`);
    index.set(claim.id, structuredClone(claim));
  }
  return index;
}

export function buildProjection({ claims = [], claim_ids = [] }) {
  const index = indexClaims(claims);
  const selected = [];
  const excluded = [];

  for (const id of claim_ids) {
    const claim = index.get(id);
    if (!claim) throw new Error(`unknown claim id: ${id}`);
    if (claim.status === 'UNPROVEN') {
      excluded.push({ id, reason: 'unproven claims cannot enter an application projection' });
      continue;
    }
    selected.push({
      id: claim.id,
      text: claim.text,
      status: claim.status,
      evidence_refs: claim.evidence_refs ?? [],
      qualifier: claim.status === 'INFERRED' ? 'inference' : null
    });
  }

  return { selected, excluded };
}

export function assertNoStatusUpgrade(sourceClaims = [], projectedClaims = []) {
  const source = indexClaims(sourceClaims);
  for (const projected of projectedClaims) {
    const original = source.get(projected.id);
    if (!original) throw new Error(`projection contains unknown claim: ${projected.id}`);
    if (projected.status !== original.status) {
      throw new Error(`projection may not change claim status: ${projected.id} ${original.status} -> ${projected.status}`);
    }
  }
  return true;
}
