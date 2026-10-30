#!/usr/bin/env python3
"""Build a source-linked job inventory; observations are not live verification."""
import csv
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'data/jobs/consolidated-catalogue-2026-10-31.json'
INDEX = ROOT / 'docs/JOB_CATALOGUE_INDEX_2026-10-31.md'


def key_for(url, fallback):
    if not isinstance(url, str) or not url.startswith(('http://', 'https://')):
        return 'unlinked:' + fallback
    u = urlsplit(url)
    host = (u.hostname or '').lower().removeprefix('www.')
    # Retain identifying query parameters. Only strip known tracking parameters.
    params = [(k, v) for k, v in parse_qsl(u.query, keep_blank_values=True)
              if not k.lower().startswith('utm_') and k.lower() not in {'ref', 'jobsource', 'locale'}]
    return urlunsplit(('https', host, u.path.rstrip('/') or '/', urlencode(sorted(params)), ''))


FIELDS = ('id', 'company', 'employer_group', 'title', 'expected_title', 'observed_title',
          'url', 'location', 'last_known_location', 'pay', 'last_known_pay', 'pay_verified_at',
          'compensation', 'benchmark', 'assessment', 'rationale', 'status', 'source_status',
          'detail_status', 'application_route_status', 'verification', 'detail_reviewed',
          'checked_on', 'checked_at', 'observed_at', 'source_updated_raw', 'last_detail_seen_at',
          'observation_kind', 'requires_detail_review', 'stale', 'change', 'source', 'board',
          'source_kind', 'requirements', 'fit', 'gaps', 'unresolved', 'remaining_checks',
          'profile_use', 'profile_case', 'review_group', 'priority', 'relationship', 'family',
          'timing', 'verdict', 'tier', 'fit_pos', 'fit_neg', 'reasons', 'duplicate_of',
          'lanes', 'seniority_review', 'application_authorized', 'execution_authorized',
          'application_url', 'documents', 'evidence_note', 'source_record')

clusters = {}
counts = Counter()


def add(path, collection, rows, default_date=None):
    for i, row in enumerate(rows):
        if not isinstance(row, dict):
            continue
        ref = f'{path}#{collection}[{i}]'
        url = row.get('url') or row.get('detail_url') or row.get('application_url')
        key = key_for(url, ref)
        obs = {k: row[k] for k in FIELDS if k in row and row[k] not in (None, '', [], {})}
        obs.update({'source_file': path, 'source_collection': collection, 'source_index': i})
        if default_date:
            obs['source_snapshot_date'] = default_date
        clusters.setdefault(key, {'key': key, 'observations': []})['observations'].append(obs)
        counts[f'{path}#{collection}'] += 1


def from_json(path, collection, default_date=None):
    obj = json.loads((ROOT / path).read_text())
    rows = obj if collection == '$' else obj[collection]
    add(path, collection, rows, default_date)


from_json('data/jobs/broad-sourcing-2026-10-21.json', 'records', '2026-10-21')
from_json('data/jobs/profile-board-2026-10-26.json', 'roles', '2026-10-26')
from_json('data/jobs/refresh-2026-10-26.json', 'roles', '2026-10-26')
from_json('data/jobs/campaign-case-2026-10-27.json', 'target_employers_for_screening', '2026-10-27')
from_json('data/jobs/campaign-case-2026-10-27.json', 'additional_reviewed_not_initial_wave', '2026-10-27')
from_json('data/jobs/curated.json', 'rows')
from_json('data/jobs/live-jobs.json', '$')
with (ROOT / 'data/jobs/live-pipeline.csv').open(newline='') as f:
    add('data/jobs/live-pipeline.csv', '$', list(csv.DictReader(f)))
monitor = json.loads((ROOT / 'output/jobs-monitor/latest.json').read_text())
for section in ('watched', 'discovery'):
    add('output/jobs-monitor/latest.json', section, monitor[section])

# The detailed comparison is an authored Markdown table rather than a JSON source.
review_path = 'docs/JOB_MARKET_CATALOGUE_2026-10-31.md'
review = []
pattern = re.compile(r'^\|\s*(.*?)\s*\|\s*\[([^\]]+)\]\((https?://[^)]+)\)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$')
section = ''
for line in (ROOT / review_path).read_text().splitlines():
    if line.startswith('## '):
        section = line[3:]
    match = pattern.match(line)
    if match and ('104' in section or 'Cake' in section):
        priority, title, url, pay_location, fit = match.groups()
        review.append({'title': title, 'url': url, 'priority': priority,
                       'pay': pay_location, 'assessment': fit,
                       'source_status': '104 detail observed' if '104' in section else 'Cake indexed detail, not live verified',
                       'checked_on': '2026-10-31'})
add(review_path, 'reviewed_table', review, '2026-10-31')
if len(review) != 20:
    raise ValueError(f'Expected 20 reviewed rows, found {len(review)}; inspect the source table before rebuilding')

records = sorted(clusters.values(), key=lambda x: x['key'])
result = {
    'schema': 'job-catalogue.observations.v1',
    'built_at_utc': datetime.now(timezone.utc).isoformat(),
    'scope': 'Historical and recent job leads; research and preparation only, no submission authority.',
    'deduplication': 'Exact normalized URL only; tracking and locale parameters removed. Different URLs and explicit duplicate_of records remain separate unless URLs match. Cross-site duplicates may remain.',
    'cautions': ['A search result is a lead, not a verified vacancy or match.',
                 'Source dates and statuses describe observations, not present availability.',
                 'Salary and other conflicting claims remain in their individual observations.',
                 'The monitor was degraded at its most recent run; absence of a result proves nothing.',
                 'No inference of current work authorization, application or submission is made.'],
    'source_observation_counts': dict(counts), 'total_observations': sum(counts.values()),
    'url_clusters': len(records), 'records': records,
}
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
source_table = '\n'.join(f'| `{name}` | {count:,} |' for name, count in counts.items())
INDEX.write_text(f'''# Job search catalogue — 31 October 2026

This is the entry point to the job search across 104, Cake and other sources. It preserves the broader research + finance + programming direction, including credible adjacent and mid-tier options. It is a research inventory, not an application queue or a claim that every role remains open.

## Start here

1. [Detailed 20-post review](JOB_MARKET_CATALOGUE_2026-10-31.md): individual roles, quoted or unknown pay, location, fit, gaps and source limitations. 104 details and Cake search/index observations are distinguished there.
2. [Complete machine-readable catalogue](../data/jobs/consolidated-catalogue-2026-10-31.json): {len(records):,} URL-based clusters from {sum(counts.values()):,} observations. Each observation points to its original file and row, with dates, pay, assessments and verification state when available.
3. [Application preparation and current checkpoints](JOB_APPLICATION_PREPARATION_2026-10-31.md): evidence and preparation state. A review screen or draft is not a submission; consult the original checkpoint before acting.
4. [Earlier pipeline](JOB_CALL_PIPELINE_2026-10-21.md), [target priorities](JOB_TARGET_PRIORITIES_2026-10-21.md), and [Cake research](CAKE_JOB_RESEARCH_2026-10-31.md): reasoning and historical context.
5. [NYCU and NTHU PhD package comparison](PHD_JOB_PACKAGE_COMPARISON_2026-10-31.md): scholarships, possible additional research/teaching and gigs, housing and job comparisons.
6. [First job batch and preparation](JOB_FIRST_BATCH_AND_PREPARATION_2026-10-31.md): 14 specific roles, refreshed source status, CV and work-sample mappings, and local introduction drafts.

## What's in the inventory

| Source and collection | Observations |
| --- | ---: |
{source_table}

These rows are overlapping evidence, not separate vacancies. The catalogue groups only matching normalized URLs, retaining individual source observations and conflicting details; different links for the same opening can still appear separately. Old curated scores and dispositions are historical judgments. The 1,923 monitor discoveries include search results and potentially irrelevant or overseas roles; they have not all been individually checked. The last monitor run was degraded, so it is incomplete. The scraped and curated inventory dates must be checked in the original files when not present on a row.

## How to use it

- Start with the 20-post review and the historical reviewed board, then use monitor discoveries to find further candidates. Reopen each exact posting before relying on its pay, location, requirements, start date or availability.
- Evaluate finance/data research, quantitative work, research engineering, AI/data and practical automation alongside adjacent options. Judge the specific role, not its title alone.
- Compare stated base salary, annual guarantees and variable compensation separately. A historical benchmark or estimated pay is not an employer offer; missing pay stays unknown. Consider commuting from Neili and moving costs only after confirming the office and working arrangement.
- The working assumption is earliest full-time availability around March–April 2027, subject to the user's actual graduation and circumstances. Mandarin B1/B2 is a goal pending an exam, not a certification. A current student work permit does not establish post-graduation eligibility; confirm the relevant rules and employer requirements for each route.
- Reuse the PhD research package and project evidence where relevant, while keeping project claims, experience and achievements accurate. Verify openings and tailor documents before any final action. This catalogue does not authorize applications or messages.

Rebuild from the source snapshots with `python3 scripts/build-job-catalogue.py`. Several inputs and application materials live in ignored local-only files, so a public GitHub checkout contains the consolidated snapshot but cannot necessarily rebuild it or open local packet links. Rebuilding consolidates existing files; it does not fetch new jobs or verify openings. Credentials, private application packets and personal budgeting details remain local.
''')
print(f'Wrote {len(records):,} URL clusters from {sum(counts.values()):,} observations; {len(review)} detailed review rows.')
