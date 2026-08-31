function list(value) {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function termValue(entry) {
  return typeof entry === 'string' ? entry : entry?.term;
}

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function quoted(value) {
  const text = clean(value).replace(/"/g, '');
  return text ? `"${text}"` : '';
}

function unique(values) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function projectTopics(project, { limit = 4 } = {}) {
  const keywords = list(project?.keywords).map(termValue).filter(Boolean);
  const explicit = list(project?.search_topics).filter(Boolean);
  return unique([...explicit, ...keywords]).slice(0, limit);
}

function sortedGeographies(policy) {
  return [...list(policy?.geographies)]
    .filter((entry) => entry?.query)
    .sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0) || String(a.id ?? '').localeCompare(String(b.id ?? '')));
}

export function buildOpenWebDiscoveryQueries(project, policy = {}, { limit } = {}) {
  if (!project?.id) throw new Error('project id is required');
  const max = Number(limit ?? policy.per_project_query_limit ?? 6);
  const exclusions = list(policy.query_exclusions).join(' ');
  const queries = [];

  for (const query of list(project.discovery_queries)) {
    queries.push(`${clean(query)} ${exclusions}`.trim());
    if (queries.length >= Math.min(2, max)) break;
  }

  const topics = projectTopics(project);
  const englishTerms = unique(list(policy.opportunity_terms));
  const chineseTerms = unique(list(policy.opportunity_terms_zh_tw));
  const geographies = sortedGeographies(policy);

  let cursor = 0;
  while (queries.length < max && topics.length && (englishTerms.length || chineseTerms.length) && geographies.length) {
    const topic = topics[cursor % topics.length];
    const geo = geographies[cursor % geographies.length];
    const isZh = String(geo.id ?? '').includes('zh') && chineseTerms.length;
    const terms = isZh ? chineseTerms : englishTerms;
    const role = terms[cursor % terms.length];
    queries.push(`${quoted(role)} ${quoted(topic)} ${clean(geo.query)} ${exclusions}`.trim());
    cursor += 1;
    if (cursor > max * Math.max(4, topics.length)) break;
  }

  return unique(queries).slice(0, max);
}

export function buildPortfolioDiscoveryPlan(projects = [], policy = {}) {
  const perProject = new Map();
  for (const project of projects) {
    perProject.set(project.id, buildOpenWebDiscoveryQueries(project, policy));
  }

  const budget = Number(policy.query_budget ?? 36);
  const rows = [];
  let index = 0;
  while (rows.length < budget) {
    let advanced = false;
    for (const project of projects) {
      const query = perProject.get(project.id)?.[index];
      if (!query) continue;
      rows.push({ project_id: project.id, query });
      advanced = true;
      if (rows.length >= budget) break;
    }
    if (!advanced) break;
    index += 1;
  }

  const seen = new Set();
  return rows.filter((row) => {
    if (seen.has(row.query)) return false;
    seen.add(row.query);
    return true;
  });
}
