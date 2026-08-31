# Open-Web Opportunity Discovery

Snapshot: **2026-09-01**

This layer exists because a known-source monitor cannot discover an opportunity ecosystem it has never seen.

## Discovery stack

```text
open-web search discovery
  -> DISCOVERY_ONLY candidate URLs
  -> portfolio semantic scoring
  -> official/aggregator/unknown source-quality classification
  -> source-family promotion candidates
  -> official-source hydration and eligibility verification
  -> Gauntlet master registry
  -> READY / HOLD / KILL
```

Search snippets are never sufficient evidence for `ELIGIBLE`, `READY`, compensation, deadline, visa, IP or other consequential facts.

## Query doctrine

Radar combines existing portfolio vocabulary with opportunity vocabulary rather than searching only for conventional titles.

Opportunity terms include:

- research assistant / research associate;
- research engineer;
- research officer / research professional;
- technical associate;
- predoc / predoctoral;
- project researcher / project staff;
- lab manager;
- visiting researcher / research fellow;
- fellowship / research fellowship;
- residency / research residency;
- join us / open positions;
- Traditional-Chinese equivalents such as `研究助理`, `專任研究助理`, `研究工程師`, `計畫研究助理`, `研究員`, `博士前研究`, `實驗室徵才` and `實驗室招募`.

The default geography bias is north Taiwan first, then Hong Kong, Singapore, Japan, Europe and international/remote routes.

## Providers

`radar:discover` supports:

1. **Brave Search API** when `BRAVE_SEARCH_API_KEY` exists;
2. **Bing RSS web search** as the no-key fallback.

Provider failure is preserved as source error evidence and must not crash the other Radar lanes.

## Source quality

Candidates are classified as:

- `official_candidate` — preferred university/research domains or academic suffixes;
- `aggregator` — jobs aggregators; useful as hints but not canonical authority;
- `unknown` — must be verified;
- `blocked` — low-value/social surfaces excluded from ingestion.

A high-scoring recurring domain becomes a `VERIFY_DOMAIN_THEN_PROMOTE_TO_SOURCE_FAMILY` candidate. Promotion is deliberately not automatic: a human or verifier should confirm that it is a stable official listing surface first.

## Cadence

The scheduled Radar workflow runs daily. Known source families and known fellowship/funding pages can run on pull requests as smoke checks; open-web search runs on schedule/manual dispatch so normal PRs do not create unnecessary external-search traffic.

## Safety / truth boundary

Every open-web result is normalized with:

```text
status=discovered
eligibility_text=DISCOVERY_ONLY
raw_ref.search_result_only=true
```

A candidate may move through the normal lifecycle only after its official posting is hydrated:

```text
DISCOVER -> VERIFIED -> ELIGIBLE -> READY -> FIRED -> RECEIPT -> OUTCOME -> CONVERSION
```

No search result may directly create a browser submission mission or claim compensation/eligibility.
