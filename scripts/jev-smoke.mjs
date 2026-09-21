import { reviewGauntletCandidate } from '../src/intelligence/decision-plane.mjs';

if (!process.env.TYPESAFE_API_KEY) {
  console.error('TYPESAFE_API_KEY is not set. Export it locally; do not commit or paste it into source.');
  process.exit(2);
}

const result = await reviewGauntletCandidate({
  candidate: {
    id: 'jev-smoke-candidate',
    title: 'Evidence-backed test candidate',
    proposal: 'Advance to the next internal review gate only if the supplied evidence is sufficient.',
  },
  evidence: [
    {
      id: 'evidence-1',
      kind: 'test_fixture',
      statement: 'The candidate has one explicit supporting fixture for this smoke test.',
    },
  ],
  gateResults: {
    schema_valid: true,
    evidence_present: true,
    final_submit: false,
  },
  minConfidence: 0.0,
});

// Do not print the raw provider response; keep smoke output stable and credential-safe.
console.log(JSON.stringify({
  choice: result.choice,
  confidence: result.confidence,
  probabilities: result.probabilities,
  source: result.source,
  status: result.status,
  escalated: result.escalated,
  escalation_reason: result.escalation_reason ?? null,
}, null, 2));
