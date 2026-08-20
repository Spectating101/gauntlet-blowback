function text(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#.$/-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchText(value) {
  return text(value).replace(/[-/]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function list(value) {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function normalizedDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? String(value) : parsed.toISOString();
}

function slug(value) {
  return text(value).replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 96) || 'unknown';
}

function containsTerm(haystack, term) {
  const normalizedHaystack = ` ${matchText(haystack)} `;
  const normalizedTerm = matchText(term);
  if (!normalizedTerm) return false;
  return normalizedHaystack.includes(` ${normalizedTerm} `);
}

export function normalizeOpportunity(raw, { source = 'unknown', retrievedAt = new Date().toISOString() } = {}) {
  if (!raw?.title) throw new Error('opportunity title is required');

  const sourceId = String(raw.source_id ?? raw.id ?? raw.number ?? slug(raw.title));
  return {
    id: raw.canonical_id ?? `${source}:${sourceId}`,
    source: {
      name: source,
      source_id: sourceId,
      url: raw.url ?? raw.source_url ?? null,
      retrieved_at: retrievedAt
    },
    type: raw.type ?? 'grant',
    title: String(raw.title),
    organization: raw.organization ?? raw.agency ?? raw.agencyName ?? null,
    summary: raw.summary ?? raw.description ?? '',
    status: raw.status ?? null,
    open_date: normalizedDate(raw.open_date ?? raw.openDate),
    deadline: normalizedDate(raw.deadline ?? raw.close_date ?? raw.closeDate),
    tags: [...new Set(list(raw.tags).map(text).filter(Boolean))],
    eligibility_text: list(raw.eligibility_text ?? raw.eligibility).map(String),
    funding: raw.funding ?? null,
    raw_ref: raw.raw_ref ?? null
  };
}

export function isOpportunityActive(opportunity, { asOf = new Date() } = {}) {
  const status = text(opportunity?.status);
  if (status === 'closed' || status === 'archived') return false;
  if (!opportunity?.deadline) return true;
  const deadline = new Date(opportunity.deadline);
  if (Number.isNaN(deadline.valueOf())) return true;
  const endOfDeadlineDay = new Date(deadline.valueOf() + 24 * 60 * 60 * 1000);
  return endOfDeadlineDay > asOf;
}

function dedupeKey(opportunity) {
  const sourceKey = opportunity?.source?.name && opportunity?.source?.source_id
    ? `${text(opportunity.source.name)}:${text(opportunity.source.source_id)}`
    : null;
  if (sourceKey) return `source:${sourceKey}`;
  return `fallback:${text(opportunity.title)}|${text(opportunity.organization)}|${text(opportunity.deadline)}`;
}

export function deduplicateOpportunities(opportunities) {
  const seen = new Map();
  for (const opportunity of opportunities) {
    const key = dedupeKey(opportunity);
    const previous = seen.get(key);
    if (!previous) {
      seen.set(key, opportunity);
      continue;
    }

    const previousRichness = text(previous.summary).length + previous.tags.length * 10 + previous.eligibility_text.length * 20;
    const nextRichness = text(opportunity.summary).length + opportunity.tags.length * 10 + opportunity.eligibility_text.length * 20;
    if (nextRichness > previousRichness) seen.set(key, opportunity);
  }
  return [...seen.values()];
}

function weightedTerms(entries, defaultWeight = 1) {
  return list(entries)
    .map((entry) => typeof entry === 'string' ? { term: entry, weight: defaultWeight } : entry)
    .filter((entry) => entry?.term && Number(entry.weight ?? defaultWeight) > 0)
    .map((entry) => ({ term: text(entry.term), weight: Number(entry.weight ?? defaultWeight) }));
}

export function scoreOpportunityForProject(opportunity, project) {
  if (!project?.id) throw new Error('project id is required');
  const allowedTypes = new Set(list(project.opportunity_types));
  if (allowedTypes.size > 0 && !allowedTypes.has(opportunity.type)) {
    return { project_id: project.id, opportunity_id: opportunity.id, score: 0, matched_terms: [], negative_terms: [], type_match: false };
  }

  const haystack = text([
    opportunity.title,
    opportunity.organization,
    opportunity.summary,
    ...opportunity.tags,
    ...opportunity.eligibility_text
  ].join(' '));

  const positive = weightedTerms(project.keywords);
  const negative = weightedTerms(project.negative_keywords, 0.5);
  const totalWeight = positive.reduce((sum, item) => sum + item.weight, 0) || 1;
  const matched = positive.filter((item) => containsTerm(haystack, item.term));
  const negatives = negative.filter((item) => containsTerm(haystack, item.term));
  const positiveScore = matched.reduce((sum, item) => sum + item.weight, 0) / totalWeight;
  const penalty = negatives.reduce((sum, item) => sum + item.weight, 0) / totalWeight;
  const score = Math.max(0, Math.min(1, positiveScore - penalty));

  return {
    project_id: project.id,
    opportunity_id: opportunity.id,
    score: Number(score.toFixed(4)),
    matched_terms: matched.map((item) => item.term),
    negative_terms: negatives.map((item) => item.term),
    type_match: true
  };
}

export function rankPortfolioMatches(opportunities, projects, { minimumScore = 0.08, activeOnly = true, asOf = new Date() } = {}) {
  const rows = [];
  for (const opportunity of deduplicateOpportunities(opportunities)) {
    if (activeOnly && !isOpportunityActive(opportunity, { asOf })) continue;
    for (const project of projects) {
      const match = scoreOpportunityForProject(opportunity, project);
      if (match.score < minimumScore) continue;
      rows.push({ ...match, opportunity, project: { id: project.id, name: project.name ?? project.id } });
    }
  }

  return rows.sort((a, b) =>
    b.score - a.score ||
    String(a.opportunity.deadline ?? '9999').localeCompare(String(b.opportunity.deadline ?? '9999')) ||
    a.opportunity.title.localeCompare(b.opportunity.title)
  );
}

export function buildDiscoveryQueries(project, { limit = 6 } = {}) {
  const explicit = list(project.discovery_queries).map(String).filter(Boolean);
  if (explicit.length) return explicit.slice(0, limit);
  return weightedTerms(project.keywords)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map((item) => item.term);
}
