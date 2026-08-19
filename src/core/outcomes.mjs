const STAGES = new Set([
  'DISCOVERED', 'VERIFIED', 'READY', 'SUBMITTED', 'SCREEN', 'INTERVIEW',
  'FINAL', 'ACCEPTED', 'REJECTED', 'OFFERED', 'CONVERTED', 'WITHDRAWN'
]);

export function normalizeOutcome(record) {
  if (!record?.opportunity_id) throw new Error('outcome requires opportunity_id');
  if (!STAGES.has(record?.stage)) throw new Error(`unsupported outcome stage: ${record?.stage}`);
  const normalized = {
    opportunity_id: record.opportunity_id,
    opportunity_type: record.opportunity_type ?? null,
    stage: record.stage,
    observed_at: record.observed_at ?? new Date().toISOString(),
    source: record.source ?? 'operator',
    compensation: record.compensation ?? null,
    verdict: record.verdict ?? null,
    notes: record.notes ?? null
  };

  if (normalized.compensation) {
    for (const key of ['currency', 'amount', 'period']) {
      if (!normalized.compensation[key]) throw new Error(`compensation requires ${key}`);
    }
  }
  return normalized;
}

export function summarizeOutcomes(records = []) {
  const counts = Object.fromEntries([...STAGES].map((stage) => [stage, 0]));
  for (const record of records) counts[normalizeOutcome(record).stage] += 1;
  return {
    total: records.length,
    counts,
    response_rate: records.length ? (counts.SCREEN + counts.INTERVIEW + counts.FINAL + counts.ACCEPTED + counts.OFFERED + counts.CONVERTED) / records.length : 0
  };
}
