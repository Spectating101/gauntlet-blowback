# Jev decision plane (v1)

Gauntlet now has an optional two-layer decision contract for bounded review decisions.

## Architecture

1. A System-2 supervisor may normalize free-form language/state into a bounded decision request.
2. Jev makes the cheap typed choice.
3. Low-confidence, explicitly escalated, or high-risk decisions return to the supervisor.
4. Existing deterministic invariants remain authoritative. This layer does **not** gain credential, submission, payment, attestation, or final-submit authority.

The implementation lives in `src/intelligence/decision-plane.mjs` and intentionally uses the public System One HTTP contract directly so the base project does not gain a mandatory runtime dependency.

## Configuration

```bash
export TYPESAFE_API_KEY='...'
# optional
export TYPESAFE_MODEL='jev-latest'
export TYPESAFE_API_URL='https://api.typesafe.ai/v1/systemone'
```

Do not commit keys. If Jev is unavailable, the contract fails closed into `needs_supervisor` unless a supervisor fallback is supplied.

## Supervisor adapter

The supervisor is provider-agnostic. GPT, Claude, a local model, or another agent can expose either or both methods:

```js
const supervisor = {
  async prepare({ state, instructions, criteria }) {
    // Interpret language, remove ambiguity, construct better bounded state.
    return { state, instructions, criteria };
  },
  async resolve({ state, instructions, criteria, jev, reason }) {
    // System-2 fallback for low-confidence/high-risk cases.
    return { choice: 'revise', confidence: 0.92, rationale: '...' };
  },
};
```

This keeps the LLM in the role it is good at (language interpretation, open-ended reasoning) while Jev owns frequent closed-set classification.

## Gauntlet review vocabulary

The initial bounded disposition is:

- `accept`
- `revise`
- `reject`
- `escalate`

`reviewGauntletCandidate()` carries the existing invariant that final submission remains human-required.

## Rollout policy

Start in advisory/shadow mode. Compare Jev, deterministic gates, and the current reviewer on historical decisions. Only allow autonomous low-risk routing after calibration data shows acceptable error rates. High-risk operations should continue to require System-2/human review.
