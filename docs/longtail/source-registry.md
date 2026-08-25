# Long-Tail Source Registry

The radar should poll a small number of high-yield sources continuously instead of repeatedly starting from generic web search.

## Taiwan / university / government sources

| Source | Cadence | Ingest | Automatic action |
|---|---:|---|---|
| InnoServe | weekly; daily in final week | tracks, award tables, deadlines, eligibility, category limits | re-run project × track optimizer |
| YZU Innovation & Entrepreneurship Center competition feed | 2× weekly | student/startup/innovation contests | verify deadline + graduate eligibility + reuse level |
| YZU Student Affairs / competition subsidy notices | weekly; after every qualifying submission | reimbursement rules and student awards | auto-stack eligible reimbursement |
| Taiwan university competition boards | 2× weekly | NT$1k–50k student/research/AI contests | deduplicate + match assets |
| MOEA / Startup Taiwan / Startup Terrace | weekly | PoC, open innovation, startup procurement | HS-first pilot match; company gate |
| Taiwan Startup Procurement | weekly | specification surveys, catalogs, field-validation, tenders | procurement match + vendor gate |
| Ministry / agency AI & open-data contests | weekly | transport, civic, security, environment, finance, education problems | match Policy/HS/Public-Good/Nocturnal |
| Conference / research-paper award boards | weekly | poster, short-paper, paper awards | match current papers; verify prior-publication rules |

## Global microgrant / OSS / public-good sources

| Source | Cadence | Ingest | Automatic action |
|---|---:|---|---|
| AsyncAPI microgrant program | monthly; daily while claimable tasks open | funded medium/advanced issues | estimate execution hours; claim best positive-EV issue |
| Opire | 2–3× weekly | funded GitHub issues | rank payout / expected execution time |
| Algora bounty boards | 2–3× weekly | live funded issues | skill filter + claim workflow |
| ProjectDiscovery OSS bounty | weekly | security OSS contribution tasks | strict demonstrated-skill gate |
| Awesome Foundation | monthly | chapter/thematic rounds | geography/theme eligibility before proposal generation |
| Interledger grants | weekly | Local Impact + bounded technical grants | finance/open-payments fit check |
| Emergent Ventures | monthly | rolling opportunity status / rules | maintain project-specific concise proposal variants |
| OSS maintainer-funding registries | monthly | new maintainer grants, credits, fellowship calls | public-repo / maintainer-fit filter |

## AI / compute / tool-offset sources

| Source | Cadence | Ingest | Automatic action |
|---|---:|---|---|
| OpenAI researcher / OSS programs | monthly | researcher credits, maintainer support | match active research and public OSS; measure displaced spend |
| Lambda Research | monthly | compute-credit rules | apply only where real compute demand exists |
| Cohere Labs | monthly | public-benefit/research API support | academic/civic host gate |
| AWS / Google / Microsoft / NVIDIA startup programs | monthly | startup credit/benefit changes | suppress until company vehicle exists |

## Career / contract sources

| Source | Cadence | Ingest | Automatic action |
|---|---:|---|---|
| selected north-Taiwan research/AI employers | 2× weekly | research engineer, applied AI, data, agent, fintech roles | portfolio-to-role evidence map |
| remote/global AI/research roles | weekly | roles compatible with location/work authorization | eligibility gate before packet |
| paid research/fellowship boards | weekly | short paid fellowships / residencies / contributor programs | time-commitment vs value calculation |
| technical contract/bounty boards | 2× weekly | bounded paid engineering tasks | payout/hour and skill match |

## Direct outbound source generation

Outbound is not crawled from opportunity pages. Blowback manufactures campaigns by crawling for target actors with visible needs.

### Cite
- university labs publishing evidence-heavy work;
- systematic-review / evidence-synthesis groups;
- research centers with manual literature workflows;
- labs already paying for research software.

### YZU / Research Drive expertise
- university data/research centers;
- labs with fragmented research-data workflows;
- centers running internal datasets + literature + analysis systems.

### Policy Lab
- NGOs / think tanks / policy centers with explicit evaluation questions;
- public bodies publishing open datasets and policy challenges;
- finance/regulatory teams needing bounded evidence analysis.

### Nocturnal
- investigative/newsroom research desks;
- watchdog/civic research organizations;
- archival/public-memory organizations;
- accountability groups operating recurring monitoring workflows.

### Hardware Splicer
- EMS / PCB / electronics SMEs;
- machine-vision integrators;
- industrial QA / inspection teams;
- semiconductor-adjacent labs and incubators;
- firms publishing inspection/verification pain in hiring or technical posts.

### Public-Good
- NGOs / social operators with visible coordination failures;
- animal welfare / disaster / food redistribution / public-service networks;
- small operators whose current process is spreadsheet/chat/manual routing.

### Commons / Citation Engine
- OSS projects with contested claims, compatibility, provenance or benchmark confusion;
- AI-agent infrastructure teams with traceability/verifiability needs;
- research-software teams with evidence/claim surfaces.

### Sharpe
- quant/research teams emphasizing reproducibility, risk controls and research pipelines;
- finance/data teams hiring research-engineering skill rather than promised alpha.

## Snapshot requirements

Every fetched record should preserve:

- canonical source URL;
- retrieval timestamp;
- organizer;
- deadline/cadence;
- payout in original currency;
- cash-bearing slot count if known;
- verbatim eligibility facts needed for rules;
- source version/hash where possible;
- detected source anomalies;
- previous snapshot diff.

If a source changes after a packet is prepared, eligibility and economics must be recomputed before FIRE.
