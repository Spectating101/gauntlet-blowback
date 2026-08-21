import path from 'node:path';
import { loadStructured } from '../core/load.mjs';
import { assertOpportunityDossier, toConversionOpportunity } from '../core/dossier.mjs';
import { evaluateOpportunity, missingEvidence } from '../core/conversion.mjs';
import { buildProjection } from '../core/claims.mjs';

export async function assessDossier(filePath, { claimsPath = 'data/applicant_claims.json' } = {}) {
  const dossier = await loadStructured(filePath);
  assertOpportunityDossier(dossier);

  const claimDoc = await loadStructured(path.resolve(claimsPath));
  const claims = claimDoc.claims ?? [];
  const availableEvidence = claims
    .filter((claim) => claim.status !== 'UNPROVEN')
    .map((claim) => claim.id);

  const opportunity = toConversionOpportunity(dossier, { available_evidence: availableEvidence });
  const decision = evaluateOpportunity(opportunity);
  const projection = buildProjection({
    claims,
    claim_ids: dossier.recommended_claim_ids
  });

  return {
    dossier: {
      id: dossier.id,
      type: dossier.type,
      organization: dossier.organization,
      title: dossier.title,
      source: dossier.source,
      economics: dossier.economics
    },
    decision,
    missing_evidence: missingEvidence(opportunity),
    projection,
    final_submit_authorized: false
  };
}
