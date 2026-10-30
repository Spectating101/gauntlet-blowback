# Job search catalogue — 31 October 2026

This is the entry point to the job search across 104, Cake and other sources. It preserves the broader research + finance + programming direction, including credible adjacent and mid-tier options. It is a research inventory, not an application queue or a claim that every role remains open.

## Start here

1. [Detailed 20-post review](JOB_MARKET_CATALOGUE_2026-10-31.md): individual roles, quoted or unknown pay, location, fit, gaps and source limitations. 104 details and Cake search/index observations are distinguished there.
2. [Complete machine-readable catalogue](../data/jobs/consolidated-catalogue-2026-10-31.json): 2,578 URL-based clusters from 3,943 observations. Each observation points to its original file and row, with dates, pay, assessments and verification state when available.
3. [Application preparation and current checkpoints](JOB_APPLICATION_PREPARATION_2026-10-31.md): evidence and preparation state. A review screen or draft is not a submission; consult the original checkpoint before acting.
4. [Earlier pipeline](JOB_CALL_PIPELINE_2026-10-21.md), [target priorities](JOB_TARGET_PRIORITIES_2026-10-21.md), and [Cake research](CAKE_JOB_RESEARCH_2026-10-31.md): reasoning and historical context.
5. [NYCU and NTHU PhD package comparison](PHD_JOB_PACKAGE_COMPARISON_2026-10-31.md): scholarships, possible additional research/teaching and gigs, housing and job comparisons.
6. [First job batch and preparation](JOB_FIRST_BATCH_AND_PREPARATION_2026-10-31.md): 14 specific roles, refreshed source status, CV and work-sample mappings, and local introduction drafts.

## What's in the inventory

| Source and collection | Observations |
| --- | ---: |
| `data/jobs/broad-sourcing-2026-10-21.json#records` | 236 |
| `data/jobs/profile-board-2026-10-26.json#roles` | 28 |
| `data/jobs/refresh-2026-10-26.json#roles` | 22 |
| `data/jobs/campaign-case-2026-10-27.json#target_employers_for_screening` | 12 |
| `data/jobs/campaign-case-2026-10-27.json#additional_reviewed_not_initial_wave` | 1 |
| `data/jobs/curated.json#rows` | 133 |
| `data/jobs/live-jobs.json#$` | 1,177 |
| `data/jobs/live-pipeline.csv#$` | 355 |
| `output/jobs-monitor/latest.json#watched` | 36 |
| `output/jobs-monitor/latest.json#discovery` | 1,923 |
| `docs/JOB_MARKET_CATALOGUE_2026-10-31.md#reviewed_table` | 20 |

These rows are overlapping evidence, not separate vacancies. The catalogue groups only matching normalized URLs, retaining individual source observations and conflicting details; different links for the same opening can still appear separately. Old curated scores and dispositions are historical judgments. The 1,923 monitor discoveries include search results and potentially irrelevant or overseas roles; they have not all been individually checked. The last monitor run was degraded, so it is incomplete. The scraped and curated inventory dates must be checked in the original files when not present on a row.

## How to use it

- Start with the 20-post review and the historical reviewed board, then use monitor discoveries to find further candidates. Reopen each exact posting before relying on its pay, location, requirements, start date or availability.
- Evaluate finance/data research, quantitative work, research engineering, AI/data and practical automation alongside adjacent options. Judge the specific role, not its title alone.
- Compare stated base salary, annual guarantees and variable compensation separately. A historical benchmark or estimated pay is not an employer offer; missing pay stays unknown. Consider commuting from Neili and moving costs only after confirming the office and working arrangement.
- The working assumption is earliest full-time availability around March–April 2027, subject to the user's actual graduation and circumstances. Mandarin B1/B2 is a goal pending an exam, not a certification. A current student work permit does not establish post-graduation eligibility; confirm the relevant rules and employer requirements for each route.
- Reuse the PhD research package and project evidence where relevant, while keeping project claims, experience and achievements accurate. Verify openings and tailor documents before any final action. This catalogue does not authorize applications or messages.

Rebuild from the source snapshots with `python3 scripts/build-job-catalogue.py`. Several inputs and application materials live in ignored local-only files, so a public GitHub checkout contains the consolidated snapshot but cannot necessarily rebuild it or open local packet links. Rebuilding consolidates existing files; it does not fetch new jobs or verify openings. Credentials, private application packets and personal budgeting details remain local.
