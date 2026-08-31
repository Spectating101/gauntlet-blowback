# Long-Tail Source Registry

Snapshot: **2026-09-01**

The radar should poll a small number of high-yield source families continuously instead of repeatedly starting from generic web search.

The search doctrine is now:

> Search for **who is paying, funding, hosting, credentialing, deploying or employing capabilities already demonstrated by the portfolio**, regardless of the title used for the route.

Do not search only for `job`, `PhD`, `fellowship`, or `competition`. The hidden research-labor market routinely uses titles such as **Research Assistant, Research Engineer, Research Officer, Project Researcher, Technical Associate, Predoc, Research Professional, Student RA, Resident, Scholar, Visiting Researcher, Lab Staff, Research Programmer, Project Staff, Fellow**, or simply **Join Us / Openings / Recruiting Students**.

## Taiwan / university / government sources

| Source | Cadence | Ingest | Automatic action |
|---|---:|---|---|
| Academia Sinica central recruitment | 2× weekly | institute/lab RA, project staff, research engineer, research scientist postings | semantic asset→paid-demand match; preserve explicit salary and deadline |
| Academia Sinica IIS recruitment | 2× weekly | NLP/LLM/agent/data systems/research assistant openings | Cite/Research Drive/Nocturnal first; degree gate before packet |
| Academia Sinica CITI recruitment | 2× weekly | CV/Embodied AI/3D/digital-twin/robotics/data-system assistants | Hardware Splicer first; PT/student-pay route detection |
| Academia Sinica Economics | weekly | economics/finance/data RA and project research positions | Finance/Sharpe/Policy/research-paper match |
| NTU / NTHU / NYCU / NCCU / NCU / NTUST / YZU recruitment boards | 2× weekly | project assistants, research engineers, lab staff and fixed-term project hires | north-Taiwan priority; distinguish paid staff from graduate recruitment |
| professor/lab `Join Us` pages | weekly | active recruiting, open applications, student RA and project staff | first resolve funding + status eligibility; do not assume graduate recruitment is paid |
| InnoServe | weekly; daily in final week | tracks, award tables, deadlines, eligibility, category limits | re-run project × track optimizer |
| YZU Innovation & Entrepreneurship Center competition feed | 2× weekly | student/startup/innovation contests | verify deadline + graduate eligibility + reuse level |
| YZU Student Affairs / competition subsidy notices | weekly; after every qualifying submission | reimbursement rules and student awards | auto-stack eligible reimbursement |
| Taiwan university competition boards | 2× weekly | NT$1k–50k student/research/AI contests | deduplicate + match assets |
| MOEA / Startup Taiwan / Startup Terrace | weekly | PoC, open innovation, startup procurement | HS-first pilot match; company gate |
| Taiwan Startup Procurement | weekly | specification surveys, catalogs, field-validation, tenders | procurement match + vendor gate |
| Ministry / agency AI & open-data contests | weekly | transport, civic, security, environment, finance, education problems | match Policy/HS/Public-Good/Nocturnal |
| Conference / research-paper award boards | weekly | poster, short-paper, paper awards | match current papers; verify prior-publication rules |

## Asia research-labor sources

| Source family | Cadence | Ingest | Automatic action |
|---|---:|---|---|
| HKU careers + school/faculty recruitment | 2× weekly | RA I/II, Research Officer, AI Engineer, project staff, student RA | detect technical-stack literals such as MCP/agents; verify salary + visa before heavy application |
| CUHK / HKUST research hiring | weekly | RAs, project researchers, research engineers, fixed-term center staff | portfolio-semantic match rather than title match |
| A*STAR careers | weekly | Research Engineer, Scientist, robotics/AI/data-system roles | HS/CRD fit; sponsorship gate before packet |
| AI Singapore programs/careers | weekly; daily near cohort opening | AIAP, research engineering, fellowships and project roles | verify citizenship/residency/work-right gate first |
| NTU Singapore / NUS lab pages | weekly | project staff, research assistants and professor-direct lab hiring | funding-first outreach if cash is not published |
| AIST + AIRC/EART | weekly | student RA mechanism, Embodied AI engineers/researchers | binary eligibility check for Taiwan-enrolled student before packaging |
| OIST research internship/lab pages | monthly; weekly near Apr/Oct deadline | funded research internships + host-lab openings | host-specific one-project pitch; evaluate relocation cost |
| RIKEN / Japanese institute careers | monthly | technical scientist/research staff routes | suppress PhD-only rows if current eligibility fails |
| Yonsei / POSTECH / KAIST lab pages | monthly | research interns, graduate researchers, staff/open applications | if pay is absent, send one funding/eligibility check before full packet |

## Global predoc / research-professional sources

| Source family | Cadence | Ingest | Automatic action |
|---|---:|---|---|
| Predoc.org | weekly | predoc/research-professional vacancies and recurring programs | Finance/Policy/Research Drive match; verify official source before activation |
| MIT FutureTech and adjacent AI×economics centers | weekly | Technical Associate / predoc / research staff | prioritize Finance + AI + econometrics combinations |
| UChicago BFI PREP | weekly | Research Professional / predoc vacancies | salary/work-auth gate before high-effort application |
| Stanford SIEPR predoc | monthly; weekly Dec–Jan | annual fellow openings | closed cycle becomes WATCH; never reuse old deadline |
| Yale Economics/Tobin predoc | monthly; weekly in hiring season | predoc/fellow/research-professional calls | recurring source; external research conversion value |
| university research centers using `Technical Associate`, `Research Professional`, `Research Officer` | weekly | paid research staff missed by normal job-title searches | map by actual demanded capability and publication/data work |

## Fellowship / residency / funded-research sources

These are economically heterogeneous and must not be flattened into one generic `FELLOWSHIP` bucket.

| Source | Cadence | Class | Automatic action |
|---|---:|---|---|
| Open Technology Fund | weekly; daily in open-call final week | Internet-freedom research fellowship / project funding | Nocturnal-first; surveillance-tech exclusion + FT opportunity-cost audit |
| FAS fellowships | weekly near calls | sidecar policy fellowship | optimize stipend/hour; reject forced policy thesis |
| ERA | monthly; weekly while open | full-time funded research fellowship | cheap initial application; acceptance becomes career option |
| MATS | monthly; weekly while open | short fellowship + long residency | distinguish US$19.2k program from salaried residency; research-fit gate |
| Constellation / Astra | monthly; weekly while open | technical AI research fellowship | genuine research thesis + compute/value audit |
| LASR Labs | monthly | technical research fellowship | verify live deadline before FIRE |
| Anthropic Fellows | 2× monthly | paid full-time research fellowship | work-authorization gate first; no visa-sponsorship assumption |
| Tech Policy Press | monthly; weekly while open | remote part-time policy fellowship | published-work gate + strict application-hour cap due low historical base rate |
| Software Sustainability Institute | monthly; weekly near deadline | research-software fellowship/activity funding | Citation/Research Drive/Refinery/Commons first; budget is restricted, not salary |
| APNIC Foundation research fellowships | monthly; weekly when call opens | Internet research fellowship | annual-cycle WATCH when closed; Nocturnal/CRD match |
| Asia House | monthly | Asia technology/economics/policy fellowship | watch opening window; career-scale stipend if live |
| OIST / visiting funded research programs | monthly | funded visiting research | count travel/housing only if genuinely displaced |

## Global research-engineering / lab sources

| Source | Cadence | Ingest | Automatic action |
|---|---:|---|---|
| Oxford / Cambridge / UK lab recruitment | weekly | RA, research engineer, project staff | verify closing date + visa + degree gate before FIRE |
| ETH / EPFL lab `Open Positions` | weekly | research staff/software engineer/robotics roles | HS-first physical-AI match; salary/visa/IP gate |
| European research institutes | weekly | RSE, scientific engineer, project researcher, technical associate | preserve G6 publication/IP/outside-work terms |
| US/Canada university lab/center hiring | weekly | research engineer, predoc, project staff, technical associate | work-authorization gate before expensive application |

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

### Cite / Research Drive / Citation Engine
- university labs publishing evidence-heavy work;
- systematic-review / evidence-synthesis groups;
- LLM/RAG labs needing provenance, retrieval and evaluation infrastructure;
- research centers with fragmented research-data workflows;
- labs already paying for research software.

### Policy Lab / finance research
- NGOs / think tanks / policy centers with explicit evaluation questions;
- public bodies publishing open datasets and policy challenges;
- AI×economics labs and predoc programs;
- finance/regulatory teams needing bounded evidence analysis.

### Nocturnal
- investigative/newsroom research desks;
- watchdog/civic research organizations;
- Internet-freedom and information-controls research groups;
- social-network / misinformation / information-integrity labs;
- archival/public-memory organizations.

### Hardware Splicer
- Embodied AI / robotics / VLA/VLN labs;
- EMS / PCB / electronics SMEs;
- machine-vision integrators;
- industrial QA / inspection teams;
- semiconductor-adjacent labs and incubators;
- firms publishing inspection/verification pain in hiring or technical posts.

### Public-Good
- NGOs / social operators with visible coordination failures;
- animal welfare / disaster / food redistribution / public-service networks;
- small operators whose current process is spreadsheet/chat/manual routing.

### Commons / Refinery
- OSS projects with contested claims, compatibility, provenance or benchmark confusion;
- AI-agent infrastructure teams with traceability/verifiability needs;
- research-software teams with evidence/claim surfaces.

### Sharpe
- quant/research teams emphasizing reproducibility, risk controls and research pipelines;
- economics/finance predocs;
- finance/data teams hiring research-engineering skill rather than promised alpha.

## Snapshot requirements

Every fetched record should preserve:

- canonical official source URL;
- retrieval timestamp;
- organizer / PI / lab;
- deadline **or explicit rolling/cycle state**;
- salary/stipend in original currency;
- whether cash is personal, restricted, reimbursement, credits or benefits;
- FT/PT and expected hours/week when published;
- duration/start date;
- geography/remote/visa/work-authorization facts;
- degree/seniority/language/citizenship requirements;
- adviser/host/company/team requirements;
- IP/moonlighting/outside-work restrictions if published;
- application materials and estimated marginal effort;
- cash-bearing slot count / selection evidence if known;
- verbatim eligibility facts needed for rules;
- source version/hash where possible;
- detected source anomalies;
- previous snapshot diff.

If salary/funding is missing on a professor/lab page, do **not** infer unpaid or paid. The first action is a short funding/status question. If a recurring program is closed, represent it as `WATCH` / `CYCLE_NOT_YET_VERIFIED`, never with an invented next deadline.

If a source changes after a packet is prepared, eligibility and economics must be recomputed before FIRE.
