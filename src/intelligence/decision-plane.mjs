const DEFAULT_JEV_ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
const DEFAULT_MODEL = 'jev-latest';

export const GAUNTLET_REVIEW_CRITERIA = Object.freeze({
  accept: 'The candidate is sufficiently supported by the supplied evidence and passes the declared gates.',
  revise: 'The candidate is directionally useful but has a repairable evidence, wording, packaging, or gate deficiency.',
  reject: 'The candidate is unsupported, contradictory, unsafe to advance, or fails a non-repairable gate.',
  escalate: 'The evidence is ambiguous, consequential, or outside the bounded decision contract and needs System-2 review.',
});

function clamp01(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function maxProbability(probabilities) {
  if (!probabilities || typeof probabilities !== 'object') return 0;
  return Object.values(probabilities).reduce((best, value) => Math.max(best, clamp01(value)), 0);
}

export function answerConfidence(answer) {
  if (!answer || typeof answer !== 'object') return 0;
  if (Number.isFinite(Number(answer.confidence))) return clamp01(answer.confidence);
  return maxProbability(answer.probabilities);
}

export function jevConfigured(env = process.env) {
  return Boolean(String(env?.TYPESAFE_API_KEY ?? '').trim());
}

export async function callJevChoice({
  state,
  instructions,
  criteria,
  apiKey = process.env.TYPESAFE_API_KEY,
  endpoint = process.env.TYPESAFE_API_URL || DEFAULT_JEV_ENDPOINT,
  model = process.env.TYPESAFE_MODEL || DEFAULT_MODEL,
  fetchImpl = globalThis.fetch,
  signal,
  questionId = 'decision',
} = {}) {
  if (!apiKey) throw new Error('TYPESAFE_API_KEY is not configured');
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  if (!instructions || typeof instructions !== 'string') throw new TypeError('instructions must be a non-empty string');
  if (!criteria || typeof criteria !== 'object' || Array.isArray(criteria) || Object.keys(criteria).length === 0) {
    throw new TypeError('criteria must be a non-empty object');
  }

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      state,
      questions: {
        [questionId]: {
          type: 'choice',
          instructions,
          criteria,
        },
      },
    }),
    signal,
  });

  if (!response?.ok) {
    let detail = '';
    try { detail = await response.text(); } catch {}
    throw new Error(`Jev request failed (${response?.status ?? 'unknown'}): ${detail.slice(0, 500)}`);
  }

  const body = await response.json();
  const answer = body?.answers?.[questionId];
  if (!answer || typeof answer.choice !== 'string') {
    throw new Error(`Jev response did not contain answers.${questionId}.choice`);
  }
  if (!(answer.choice in criteria)) {
    throw new Error(`Jev returned out-of-contract choice: ${answer.choice}`);
  }

  return {
    choice: answer.choice,
    confidence: answerConfidence(answer),
    probabilities: answer.probabilities && typeof answer.probabilities === 'object'
      ? { ...answer.probabilities }
      : {},
    model,
    raw: body,
  };
}

async function prepareWithSupervisor(supervisor, request) {
  if (!supervisor?.prepare) return request;
  const prepared = await supervisor.prepare({ ...request });
  if (!prepared || typeof prepared !== 'object') {
    throw new Error('supervisor.prepare must return an object');
  }
  return {
    state: prepared.state ?? request.state,
    instructions: prepared.instructions ?? request.instructions,
    criteria: prepared.criteria ?? request.criteria,
  };
}

async function resolveWithSupervisor(supervisor, context) {
  if (!supervisor?.resolve) return null;
  const resolved = await supervisor.resolve(context);
  if (!resolved || typeof resolved.choice !== 'string') {
    throw new Error('supervisor.resolve must return { choice, ... }');
  }
  if (!(resolved.choice in context.criteria)) {
    throw new Error(`supervisor returned out-of-contract choice: ${resolved.choice}`);
  }
  return {
    choice: resolved.choice,
    confidence: clamp01(resolved.confidence ?? 1),
    rationale: resolved.rationale ?? null,
    source: 'supervisor',
  };
}

/**
 * Two-layer decision contract:
 *   1. optional System-2 supervisor interprets/normalizes language into bounded state;
 *   2. Jev makes the cheap typed decision;
 *   3. low-confidence or high-risk decisions escalate back to System-2.
 *
 * `supervisor` is provider-agnostic. Any GPT/Claude/local model adapter can expose:
 *   - prepare({ state, instructions, criteria }) -> normalized request (optional)
 *   - resolve({ state, instructions, criteria, jev, reason }) -> { choice, confidence?, rationale? }
 */
export async function supervisedChoice({
  state,
  instructions,
  criteria,
  supervisor = null,
  minConfidence = 0.78,
  risk = 'normal',
  forceSupervisor = false,
  ...jevOptions
} = {}) {
  const prepared = await prepareWithSupervisor(supervisor, { state, instructions, criteria });
  let jev = null;
  let jevError = null;

  try {
    jev = await callJevChoice({ ...prepared, ...jevOptions });
  } catch (error) {
    jevError = error;
  }

  const requiresSupervisor = forceSupervisor
    || risk === 'high'
    || !jev
    || jev.confidence < clamp01(minConfidence)
    || jev.choice === 'escalate';

  if (requiresSupervisor) {
    const reason = !jev
      ? 'jev_unavailable'
      : risk === 'high'
        ? 'high_risk'
        : jev.choice === 'escalate'
          ? 'jev_requested_escalation'
          : 'low_confidence';
    const resolved = await resolveWithSupervisor(supervisor, {
      ...prepared,
      jev,
      jevError: jevError ? String(jevError.message || jevError) : null,
      reason,
    });
    if (resolved) {
      return {
        ...resolved,
        jev,
        escalated: true,
        escalation_reason: reason,
      };
    }
    return {
      choice: jev?.choice ?? 'escalate',
      confidence: jev?.confidence ?? 0,
      probabilities: jev?.probabilities ?? {},
      source: jev ? 'jev' : 'unavailable',
      status: 'needs_supervisor',
      escalated: true,
      escalation_reason: reason,
      error: jevError ? String(jevError.message || jevError) : null,
    };
  }

  return {
    choice: jev.choice,
    confidence: jev.confidence,
    probabilities: jev.probabilities,
    source: 'jev',
    status: 'accepted',
    escalated: false,
  };
}

export async function reviewGauntletCandidate({
  candidate,
  evidence = [],
  gateResults = {},
  supervisor = null,
  risk = 'normal',
  minConfidence = 0.82,
  ...options
} = {}) {
  const state = {
    candidate,
    evidence,
    gate_results: gateResults,
    invariants: {
      final_submit_requires_human: true,
      credentials_are_never_model_authority: true,
      evidence_must_not_be_invented: true,
    },
  };
  return supervisedChoice({
    state,
    instructions: 'Classify the next Gauntlet review disposition. Use only supplied evidence and gate results; do not infer missing evidence.',
    criteria: GAUNTLET_REVIEW_CRITERIA,
    supervisor,
    risk,
    minConfidence,
    ...options,
  });
}
