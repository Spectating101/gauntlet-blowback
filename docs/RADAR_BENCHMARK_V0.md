# Opportunity Radar v0 benchmark

Date: 2026-08-20

This benchmark asks a narrow question before expanding the radar: does a deterministic structured-source collector recover useful opportunities found by an independent manual research pass, and does the comparison expose actionable failure modes?

## Setup

Radar source: Grants.gov public `search2` API.

Portfolio scope: Hardware-Splicer, Nocturnal, Cite-Agent, YZU-Cluster, Refinery, Sharpe-Terminus, and Invisible Ledger.

The live GitHub Actions smoke run used 42 project-derived discovery queries. The independent comparison pass searched for relevant current opportunities without using the radar output as its candidate list.

## Final live run

- query count: 42
- raw hits: 1,039
- unique Grants.gov opportunities: 381
- ranked project/opportunity matches: 63
- API query failures: 0
- core CI: PASS
- live source smoke: PASS

The first live version produced 184 matches from 355 unique opportunities. The comparison exposed a false-positive bug: the short keyword `AI` could match inside unrelated words such as `training`. Token-boundary matching plus active-deadline filtering reduced that to 59 matches despite expanding discovery. A second comparison exposed punctuation sensitivity (`open-source` versus `open source`); punctuation-normalized phrase matching raised the final set to 63 while recovering the missed open-source opportunity.

## Controlled same-source comparison

Nine manually identified Grants.gov opportunities were used as a small recall probe:

| Opportunity | Radar result |
| --- | --- |
| NSF State and Regional Artificial Intelligence Infrastructure Hubs | HIT — YZU-Cluster |
| Pathways to Enable Secure Open-Source Ecosystems | HIT — Refinery |
| CISE Future Computing Research | MISS — generic `computing` signal falls below the current threshold |
| Cyberinfrastructure for Public Access and Open Science | HIT — YZU-Cluster / Cite-Agent |
| NIH Research Software Engineer Award | HIT — Cite-Agent |
| American Innovation Hub: AI & Digital Skills for Creative & Tech Economy | MISS — weak/ambiguous portfolio fit at title-level |
| Cybersecurity Innovation for Cyberinfrastructure | HIT — YZU-Cluster |
| CyberTraining | HIT — YZU-Cluster |
| Building Sustainable Software Tools for Open Science | HIT — Cite-Agent / YZU-Cluster |

Controlled recovery: **7 / 9**.

This is not a claim of 77.8% global recall. The sample is tiny and deliberately diagnostic. It shows that structured discovery is already useful while making its failure modes observable.

## What the radar does better than manual research

- exhaustive repeated querying of a structured source;
- deterministic deduplication and provenance;
- stable portfolio-wide scoring rather than remembering which project to search for;
- cheap reruns as project scopes change;
- machine-readable output suitable for downstream verification and conversion policy;
- reproducible failure analysis.

## What manual/model research still does better

- semantic interpretation of odd titles and program language;
- distinguishing domain-specific false positives (for example biomedical `validation` from hardware validation);
- interpreting eligibility, geography, institution requirements, and hidden dependencies;
- discovering sources outside Grants.gov.

The source-coverage limitation is material. A general web pass found routes such as SANER 2027 and NLnet's September 2026 calls that a Grants.gov-only collector cannot discover regardless of ranking quality.

## Result

Radar v0 is useful as a high-recall structured-source harvester, but it is not yet a replacement for broad research. The productive architecture is hybrid:

```text
structured + web source collectors
          ↓
normalize / deduplicate
          ↓
cheap deterministic project matching
          ↓
top-candidate detail hydration
          ↓
semantic verification + eligibility evidence
          ↓
canonical opportunity dossier
          ↓
deterministic REJECT | HOLD | READY policy
          ↓
Blowback inspect / prepare
```

The next engineering work should improve source coverage and detail verification rather than lowering the score threshold or making Playwright more autonomous.
