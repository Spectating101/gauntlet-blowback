# Portfolio-to-grant audit — 28 October 2026

## Verdict

**This is a credible early-stage applied research and software portfolio with several fundable directions.** It provides substantially more evidence than a CV describing interests alone: working systems, empirical datasets and methods, source-linked research, reproducibility checks, and documented failures. Its most convincing use is to support a particular experiment, open-tool improvement, individual fellowship or institutional research work package.

The strongest connecting idea is **research, finance and programming applied to the quality of evidence behind decisions**. Invisible Ledger asks what financial/platform measures mean; Policy Lab tests energy and financial claims; Cite-Refinery connects sources, methods and unresolved questions; Refinery asks when a component merits reuse; Sharpe tests financial hypotheses under realistic evaluation rules. That connection is substantive. It does not require pretending all these systems are mature commercial products.

The portfolio is less persuasive for funding reserved for widely adopted infrastructure, established maintainers, products with demonstrated community fit, or causal field interventions. Those are specific selection requirements, not a valuation of the applicant as an “average programmer.” Several early-stage funders explicitly fund work before that stage. Conversely, a sophisticated prototype does not by itself establish community demand, research novelty, personal authorship of every component or entitlement to a grant.

**Best present preparation priorities:** Mozilla Embedded/BASAibu, a tightly scoped Sentient experiment, one FUTO microgrant work package, and a PI-backed finance/energy/research-software project. Emergent Ventures remains an applicant-written alternative. Mozilla Independent is a stretch; its Incubator is a different, more adoption-dependent route.

No future award or additive personal payment is established. This audit supports pursuing funding seriously; it does not support treating grants as already-earned recurring income.

## Scope, method and limits

This pass inventoried 22 local directories, checked live metadata for 13 GitHub repositories, assessed 13 asset families and five research-paper lines, and mapped 25 funding routes across 24 programme families. Mozilla Embedded and Independent are separate routes within one fellowship programme. Worktrees, older prototypes and companion papers are not counted as independent external validations.

For the principal assets I read current handoffs, selected implementation, tests, research protocols and results. I checked public/private visibility and licensing evidence, compared local branches with remote defaults, and executed selected tests and reproducibility workflows. Three smaller public repositories were cloned at their current public heads into the private audit output. Latest Nocturnal remote documents were inspected; that latest code was not executed.

This is a comprehensive scoped portfolio audit, **not** a line-by-line security review, a replication of every scientific analysis, an audit of every historical branch, or coverage of every grant worldwide or every active Gauntlet entry. No human panel, field trial, lab-use observation or authorship verification was conducted. Existing faculty/employer ownership is not resolved merely by code appearing in a personal checkout.

Source repositories were not intentionally edited. Tests can create ignored caches or temporary files. Audit outputs and the supplemented thesis replay remain local; nothing was published, uploaded to a funder, submitted, messaged or licensed differently. No holdout was unsealed and no paid model experiment, fabrication or purchase was initiated.

### Evidence location

- Structured asset/paper/funder records: [portfolio-grant-audit-2026-10-28.json](../data/portfolio-grant-audit-2026-10-28.json).
- Local inventory, remote metadata, command receipts and private replay: `output/grant-portfolio-audit-2026-10-28/`.
- Fresh execution index: `execution-checks.json`; individual logs accompany it.
- Prior same-date funding review: [PhD funding map](PHD_FUNDING_MAP_2026-10-28.md). This audit adds actual asset-level matching and new leads; it does not rewrite historical application state.
- Prior personal-contribution questions: `output/job-preparation-v2-2026-10-22/OWNERSHIP_AND_CLAIM_REVIEW.md`.

A private GitHub URL is not an accessible reviewer artifact. A remote main README, a local experimental branch and an older deployed demo can describe three different states. The JSON records exact inspected revisions rather than merging them into one imaginary current release.

## What the actual assets establish

### Cite-Refinery: strongest immediately inspectable research-tool lead

The public repository at `b9a37c6` contains a practical/academic/program research graph, typed relations, source traces, review state and executable evidence checks. A fresh static preview build reproduced four clusters, 15 nodes and 16 reviewed relations from the existing Taiwan free-roaming-dog public packet. Twenty-four selected benchmark/provenance tests passed.

The newer full-text work is more important than that small demo. Stored artifacts contain an audit of a journal-published dog-management study, 80 program-level rows, arithmetic checks, 12 negative-binomial sensitivity fits and a 21-item source-scope diagnostic. The model scored **18/21**, including **0/2 on “unresolved” cases**. The twelve specified sensitivity fits did not reproduce the published estimates within the chosen tolerances. These are meaningful research operations and useful recorded failure cases. They do not establish that the original authors made an error: original analysis definitions, scripts and intervention records were not obtained. These stored model/statistical runs were inspected, not rerun in full here.

The ten-case “competitive” result needs a more restrained description. The comparator is a literal/heuristic baseline, not a strong agent using the same model and tools. The constructed cases and model judges do not establish general superiority; passing scorer tests does not repeat the original model experiment. The separate full-text diagnostic has project-authored labels rather than blinded human gold. A further repair investigation remains at planning state; it is not completed research simply because a graph packet was imported.

**Funding use:** an open evidence-review workbench and evaluation study, especially multilingual/source-sensitive review or affordable verification. Strong fit for preparing Sentient and Mozilla Embedded evidence. The next funded contribution can be independent reference review, stronger baselines and measurement of review effort. No need to invent existing scientific acceptance or users.

**Packaging issue:** MIT is declared in `pyproject.toml`, but a root licence file was not detected. That is a clarity/release issue, not evidence that no licence exists. Subprocess execution is not proof of a security sandbox.

Sources: `cite-refinery/README.md`, `src/cite_refinery/competitive_gate.py`, `docs/COMPETITIVE_SEMANTIC_MAP_GATE_ISSUE60.md`, and `research_materials/runtime_trials/fulltext_dog_20261020/`.

### Refinery / Commons: promising apparatus for a new experiment

The inspected research branch is `2b03ad2`, newer than the remote default in important respects. It contains component evidence, search, claim review and frozen build-versus-reuse controls. Nineteen targeted tests passed.

The existing controls are informative precisely because they do not all show an advantage. RFC3986 reuse and rebuild both passed 42/42 cases. The Public Suffix List comparison shows a narrow advantage from carrying the right curated state, not a universal argument for reuse. The CloakPipe experiment used an actual upstream Rust component with synthetic inputs: required narrow probes passed while broader limitations leaked. That supports a restricted reuse candidate, not whole-system privacy protection. The production registry records **zero execution mappings**; thousands of records are a research corpus, not thousands of users or executed tasks.

**Funding use:** study when to reuse tools/components or allocate model effort under a quality and cost budget. That fits Sentient's optimisation interests and institutional research on software commons. It is a proposed experiment, not an already-proven economic saving.

**Needed:** an exact releasable component, baseline, measured API/compute cost and human review effort, task-quality criteria, and a clear licence/IP position. The source is private and no project licence was established. An additional integration worktree was inspected for context, not validated as the same release.

Sources: `refinery/HANDOFF.md`, `data/public_build_vs_reuse_control_v1_result.json`, targeted test receipts.

### Policy Lab: strongest existing combination of finance, empirical work and executable checks

The inspected branch `ec923ae` is a real research workbench with an evidence chain from energy measurements and market prices through financial assumptions and claim qualification. The current software is Policy Lab; older token narratives are not the authoritative product description.

The frozen renewables release passed all 15 verification stages, including a 134-file source lock, 129 renewables tests, 115 constraint-core tests, and byte-identical replay checks for eight outputs. Fourteen additional measured-PV validation tests passed. These are fresh checks, not README claims.

The later PV work also retains failures. Conditional conversion on measured inputs can pass a research screen while the system still blocks meter issuance. A weather-only September holdout shows +15.79% bias against a 15% threshold. An earlier Romanian inverter model underpredicted materially. Wholesale capture prices are not plant cash receipts; modelled project cash flows are not bankable returns. E5 retains an unresolved accounting allocation, and prepared questions were not sent. The E1–E6a frozen release and later E6e/E6f experiments must remain separately identified.

**Funding use:** research on renewable-energy financial measurement, reproducible claim audits and the conditions under which model output is sufficient for a consequential decision. This is a serious finance/research/programming intersection. It suits a PI-backed project and a future finance-and-sustainability grant more naturally than “fund my cryptocurrency.”

**Needed:** reviewer access to the exact branch, a new research question beyond the completed work, and independent measurement/model review. Source is private despite MIT licensing and an older public demo.

Sources: `policy-lab-gpt6-europe-20261019/CURRENT_SURFACE.json`, `README.md`, `scripts/renewables_research_release.mjs`, PV adapter tests and fresh release log.

### Hardware-Splicer: clearest small open-engineering grant candidate

The public MIT repository supplies concrete KiCad/CAD, ERC/DRC and BOM artifacts and an explicit handoff. The inspected local branch `445a894` and public main `1545ae8` differ; the packet must choose one. Thirteen selected physical-handoff/evidence-gate tests passed.

This establishes reproducible digital engineering work. It does not establish a fabricated board, measured electrical performance, an independent operator trial or safety certification. Later STEP/STL work is still a digital artifact.

**Funding use:** a small FUTO-scale improvement to an open tool, with a fabrication and measurement milestone if justified by user benefit. The fact FUTO lists KiCad among past recipients is context, not an endorsement of this derivative workflow.

**Needed:** a small exact deliverable, itemised costs and an operator/measurement plan. Do not inflate it into general chip design or an industrial EDA platform.

Sources: `Hardware-Splicer/README.md`, `tests/test_remote_physical_validation.py`, `tests/test_evidence_bench_gates.py`.

### Research Drive / YZU cluster: tangible institutional relevance, unresolved release boundary

The current public UI README describes software built for a finance faculty workflow and internal use by one lab. The backend is currently private; an older description implying a public backend is stale. Thirty-four local reference-runtime interoperation tests passed. That verifies the reference contract, not the deployed UI/backend pair or actual usage. Internal-use claims were not independently observed.

**Funding use:** evidence for a paid institutional research-software/data work package. An existing lab need can be more valuable here than generic product ambition.

**Needed:** what the applicant personally built, which work belonged to the RA appointment, approved sharing scope, actual user/task evidence and a clean public reference artifact. Faculty data and backend code are not automatically personal releasable IP. This is not yet proof that Mozilla's AI Incubator requirements are met.

Sources: latest GitHub `yzu-cluster/README.md`, `research-drive-private/README.md` and `AGENTS.md`; local contract-test receipt.

### Nocturnal: a specific multilingual research direction, still experimental

The current remote head `0db9bee` is newer than the local checkout. Its documents show bounded historical source capture, multilingual retrieval/NLI, a small local reasoner and source-offset review. A fourteen-URL June-2019 exercise produced eight proposed relationships, all unverified. Two official captures do not constitute independent publisher groups. Reviewer identity is self-asserted.

**Funding use:** source comparison and community-controlled multilingual policy analysis. It may contribute useful methods to BASAibu or a carefully scoped verification study. OTF would additionally require a real censorship/surveillance beneficiary and threat model.

**Needed:** a permitted open component, calibrated evaluation and a defined community task. Do not pitch it as a truth detector or as identifying coordinated people. No fresh test execution of the latest remote head was performed. Older known issues cannot be assumed either repaired or still present without reviewing that head.

Sources: latest remote `README.md`, `docs/investigation/LIVE_SEMANTIC_AGENT_V0.md`, `HK2019_CLAIM_ADJUDICATION_GATE_V0.md`.

### Sharpe / Terminus: financial-method competence, without a profitable-strategy claim

The current `alpha-platform` branch at `f8139eb` contains point-in-time evaluation, explicit costs and split/holdout discipline. Its October 25 scan spans Taiwan and Indonesia and reports no candidate with established net out-of-sample alpha. A promising Indonesian development result failed validation. Costs and survivorship limitations remain. Thirty-four selected evidence/policy tests passed; the historical scan itself was not independently rerun.

**Funding use:** finance research methods, negative findings, data/evaluation tooling and a supervisor-led project. It is not presently an investment-performance grant pitch. V5 is a draft protocol, not registered; the sealed holdout stays sealed.

Sources: `alpha-platform/docs/ALPHA_SCAN_V1_RESULTS.md`, `docs/EMPIRICAL_PROGRAM_V5.md`, `AGENTS.md`.

### Public-Good Control Plane, Citation Engine and GeoMap

| Asset | Actual evidence checked | Appropriate funding role |
|---|---|---|
| Public-Good / animal-charity, `b728666` | Full suite: 182 tests passed; retrospective public-good cases. README explicitly leaves licence undeclared. No established field partner or prospective outcome. | A conditional pilot with a competent operator and a real beneficiary question. Not proof of lives saved or an established NGO. |
| Citation Engine, `2de452b` | Full suite: 54 tests passed; small claim/provenance kernel. Explicit licence not established. | Support a lead project's evidence workflow. Owner-internal reuse is not ecosystem adoption. |
| GeoMap, `9efcd35` | Ten tests passed using current Citation Engine source; not a clean install of the pinned older dependency. Demonstration opportunities are synthetic. | Defer as a separate grant campaign. No actual local-market income or demand established. |

These exact public revisions were cloned for this audit. None currently justifies an established-maintainer or critical-infrastructure pitch.

### Cite-Agent: keep the research lessons, respect the shelving decision

The current `d2c6ff8` README explicitly shelves the app. Stored same-model harness comparisons and the final Claude-with-tools comparison did not establish advantage. Five simulated personas are not five human users. The final record also reports a confirmed, unfixed cross-account dataset-exposure defect on that branch.

This is useful evidence of a research process that rejected an unsuccessful architecture. Retrieval and panel-statistics components may be reusable after targeted review. It is not a grant-ready successful app, and should not be revived as a public demonstration while that defect remains. The latest historical benchmark records were read, not rerun.

Sources: `Cite-Agent/README.md`, `docs/status/generated/competitive-benchmark/v2/final-tests-2026-10-20.md`.

### Gauntlet and legacy directories

Gauntlet is supporting application/evidence infrastructure, not the product to optimise in this mission. The current scope already treats it and Citation Engine as support rather than standalone campaigns. Earlier Molina, CircuitAI, Mecha, hosting and other directories provide implementation history; they are not independently validated current products merely because they have separate folders. No active FIRE/HOLD state was changed.

## Research portfolio: useful substance, with revision and data-rights boundaries

### How the actual doctoral profile strengthens this case

The September consolidated profile in `/Downloads/phd/setB_build/v6_sources/PROFILE_POSITIONING.md` frames the research as discovering problems from incomplete records, diagnosing missing capability, allocating models/software/human expertise, deploying an intervention and measuring total effort and results. The NYCU lens emphasises technical mechanisms; the NTHU lens emphasises workflow, trust, incentives, review and maintenance. This directly supports the allocation experiment above and gives the finance background a methodological role in costs and resource choices.

That is stronger grant positioning than a biography followed by a repository list. However, the whole dissertation is too broad for most project grants. A fundable phase should test one transition—such as whether explicit evidence review improves a tool-allocation decision at acceptable total cost—rather than promise end-to-end autonomous discovery and deployment across industries. Problem recurrence is not demand; a functioning artifact is not proof the surrounding operation improved. These are testable parts of the research programme, not accomplishments to infer from its title.

The older doctoral package contains stale thesis numbers and project descriptions, including Cite-Agent before shelving. Reuse the research framing and supported biographical facts, then replace factual evidence with the newer October results in this audit. Its September “not submitted” checklist also does not override the user's later confirmation that both doctoral applications were submitted. Admission and funding outcomes remain unconfirmed.

The newer local research is materially more developed than the older public paper repository and September profile summaries. The main current thesis source is `/home/phyrexian/Downloads/Invisible-ledger/`, at `b6bfeed` plus substantial October 26–27 working changes. The public `solarpunk-portfolio-review` default is older. Do not send an old public revision and imply it matches the current analysis.

| Research line | What it contributes to a funding case | Boundary |
|---|---|---|
| **Invisible Ledger** | Platform transaction/revenue measurement, seller-entry coverage, public financial extractions and empirical checks. Current exploratory panel has 32 platforms and 213 platform-years. | Registered, descriptive and exploratory results must stay distinct. The growth-slope gap is sensitive to Blibli and small-cluster inference; expanded exploratory results are not causal validation. |
| **ECI / When Does Energy Track the Real Economy?** | Tests whether energy measures convey useful information about monetary/economic activity. Latest September r2 is more careful than broad “energy predicts the economy” framing. | Persistence/dynamic specifications weaken the stablecoin/M2 result; WEI partly includes utility information; a semiconductor footprint is not a validated short-horizon output forecast. |
| **Constrained Ledger** | Defines measurement and closure conditions for energy-linked financial/monetary claims. | Mining-cost association is not robust against a time placebo. PPA/GO coupling is possible under the corrected account. Necessary conditions are not a proven novel impossibility theorem or financial product. |
| **CL–ECI synthesis** | Connects measurement, qualification, closure and monetary-performance tests to executable research. | Overlaps the two companion papers; synthesis is not independent external validation. |
| **Fiscal Choke Points** | Comparative institutional finance/policy analysis across five countries and seven transaction paths. | Institutional coding and legal-control propositions do not measure causal tax-collection impact. |

Current abstracts/results Markdown and selected side-paper DOCX text were read. This was not a full referee report on every manuscript or an inspection of a purported final thesis PDF. A file named “for submission” does not establish submission or approval. Earlier CV conference-acceptance statements still need actual supporting records before reuse; the bounded local search did not locate those records.

### Fresh thesis replay: successful supplemented computation, incomplete distributable

The public empirical-package builder created a private audit copy. Its standard rebuild stopped after earlier computations at missing `h1_controls_h2_province.py`. The source file exists but is untracked and was omitted by the builder's tracked-file inventory. Three additional new scripts and four required public-source inputs were also absent. Later the ledger needed a missing retained `m1_simple_change_results.json`.

I copied only those four scripts, four public-source inputs and one retained coefficient/aggregate result into the **private audit copy**, ran the remaining computations and reran the final ledger. All **14 ledgers / 460 claim rows** then passed their stated consistency checks. The original package builder and source repository remain unchanged. The final ledger now contains 146 rows, so an older 141-row snapshot is not the current result.

This supports computational consistency of the reviewed current materials. It does **not** independently re-estimate the licensed BPS, LSEG or World Bank survey analyses. Some ledger checks compare manuscript numbers to retained aggregates. The package builder's default “all rows PASS” label is not a substitute for the actual execution receipt.

**Fix before external packaging:** include the newly required public scripts and permitted inputs in a deliberately reviewed release manifest, rebuild from that release, and label retained licensed-data results separately. This is a concrete packaging defect, not evidence that every thesis result is invalid.

### Data and contribution permissions are real grant gates

The thesis documents BPS microdata access as thesis-only/noncommercial, with a new permission request required for other use and no redistribution of raw records. LSEG and World Bank survey raw data are also restricted. A new grant is not automatically the same authorised use because the researcher is the same person. A future work package can instead use public aggregates, permitted new data, or separately authorised access.

No raw licensed data was included in this replay or sent to an external service. No data provider was contacted. Do not change licences, contact BPS, nominate faculty or promise supervisor participation as an automatic “packaging” step.

Likewise, repository authorship metadata does not independently establish which engineering decisions were the applicant's, what assistance was used, or faculty/employer ownership. A concise truthful contribution sheet is required for the lead artifacts; it need not minimise project capability or inflate shallow employment history.

## Exact funding map

States below concern **preparation priority**, not permission to apply or certification of eligibility. Published totals, personal stipend, institutional funding and credits are kept distinct.

### Present preparation targets

| Route | Published support / timing | Portfolio-specific judgement |
|---|---|---|
| **Mozilla Embedded — BASAibu** | US$75K stipend + US$25K project budget for 12 months. LOI: **18 Dec 2026, 15:59 Taipei**. | A notably specific fit for Cite-Refinery plus multilingual/policy work and Indonesian context. Host challenge: community-designed multilingual policy tools within MediaWiki. MediaWiki integration and youth co-design are not established. Mid-career framing remains a stretch. [FAQ](https://www.mozillafoundation.org/en/what-we-do/grantmaking/fellowship/2027-call-for-applications/faqs/), [RFP](https://assets.mofoprod.net/network/documents/PUBLIC_2027_2028_Fellowship_RFP-2.pdf). |
| **Sentient Open Source AGI grants** | Rolling; individual amount unpublished. US$42M is programme-wide. | Strong preparation target for a defined tool/model-allocation or verification experiment using Cite-Refinery/Refinery. An essential component must genuinely be open. Existing results do not prove general cost savings. [Grants](https://sentient.foundation/grants), [requests](https://sentient.foundation/product-requests). |
| **FUTO microgrant** | US$1–5K, one time; page says applications open. | Hardware-Splicer is the clearest public MIT candidate; a small self-hosted Cite-Refinery improvement is another option. Explain a concrete user-control benefit and new deliverable. [Programme](https://futo.tech/grants). |
| **Supervisor-led research / industry project** | No user-specific amount established; actual contract needed. | Strong bridge for Policy Lab, Invisible Ledger, Research Drive and finance evaluation. PI/recipient eligibility and supervisor support matter. A lab grant is not entirely student pay. [NYCU research office](https://www.nycu.edu.tw/ord/ch/app/data/list?id=1828&module=nycu0037), [NSTC](https://www.nstc.gov.tw/spu/ch/list/7f5c7d9b-cbd1-4db2-bd3a-e186a3e840fb). |
| **Emergent Ventures** | Amount case-specific; worldwide programme. | One coherent research/software idea could fit. Existing partial route history is not evidence of submission. Applicant must write the application; AI is limited to proofreading. [Programme/rule](https://www.mercatus.org/emergent-ventures). |

Mozilla's Fellowship funds an individual; its FAQ explicitly does not require existing working technology or users. Its Incubator funds working products with users. The applicant already has prototypes, but that distinction prevents dismissing the Fellowship solely for lacking external adoption. The programme is selective: ten fellowships across both tracks. This is worth preparing, not a dependable outcome. [Fellowship overview](https://www.mozillafoundation.org/en/what-we-do/grantmaking/fellowship/), [FAQ](https://www.mozillafoundation.org/en/what-we-do/grantmaking/fellowship/2027-call-for-applications/faqs/).

The fellowship timeline is invitation February 16, full application March 12, decision April 30, start **June 1, 2027**. It cannot cover an assumed March start automatically. Mozilla permits supportive AI use, not generation of full responses; this audit is not an application draft. Its RFP does not require exclusive full-time dedication, but substantial project delivery and community participation remain obligations. Any coexistence with a doctorate, scholarship or RA contract needs actual terms. [Call](https://www.mozillafoundation.org/en/what-we-do/grantmaking/fellowship/2027-call-for-applications/), [RFP](https://assets.mofoprod.net/network/documents/PUBLIC_2027_2028_Fellowship_RFP-2.pdf).

### Additional routes, including why large totals are not current earnings

| Route | Published support / state | Actual match and next gate |
|---|---|---|
| **Mozilla Independent Fellowship** | US$100K stipend + US$25K project budget; same LOI date. | Refinery/research-audit direction is thematic. Senior recognition and proven independent leadership are substantially less established than the technical prototypes. Stretch alternative to Embedded. [FAQ](https://www.mozillafoundation.org/en/what-we-do/grantmaking/fellowship/2027-call-for-applications/faqs/). |
| **Mozilla Human-Scale AI Incubator** | US$300K first year; conditional further US$200K over two years. Deadline **21 Nov 2026, 15:59 Taipei**. | Requires working deployed AI and early community fit. No such external fit established; internal Drive use needs verification and may not be the relevant AI product. Hold rather than invent users to meet a deadline. [Call](https://www.mozillafoundation.org/en/what-we-do/grantmaking/incubator/human-scale-ai/call-for-proposals/). |
| **Sloan Digital Technology / Open Source in Science** | Scope-specific institutional grants. | Good intellectual connection to Refinery/Drive and research-software maintenance. Sloan generally does not fund individuals outside its Books programme. Need institution/PI, geography/programme fit and preliminary LOI; full proposal by invitation. The completed Better Software for Science programme is not a current call. [Programme](https://sloan.org/programs/digital-technology), [process](https://sloan.org/grants/apply). |
| **FIR–PRI finance and sustainability** | 2026 PhD research grant EUR10K, paid 4K/3K/3K over three years; separate EUR5K awards. **2026 closed April 19; 2027 unverified.** | Europe-focused energy-finance research in Policy Lab could supply a relevant connection. Europe as research field appears among eligibility links; Taiwan residence alone is not a blanket exclusion. Confirm future category/stage/supervision terms. [Rules](https://www.fir-pri-awards.org/wp-content/uploads/2026-FIR-PRI-Awards-Rules-Regulations.pdf). |
| **NYCU NSTC quota scholarship** | NT$40K/month, current framework up to three years; Oct 15 window closed. | Admission/channel/departmental quota and next cycle unresolved. Portfolio supports selection; not a separate project grant. Same-nature scholarship choice rules mean this is not automatically an extra 40K. [Notice](https://ce.nycu.edu.tw/en/posts/1006). |
| **Google East Asia PhD Fellowship** | US$10K for one year; 2026 closed, 2027 unverified. | Future doctoral research/nomination route. Coursework progress and relevant research matter. Taiwan institution uses East Asia terms, not Indonesian Southeast Asia amounts. [Programme](https://research.google/programs-and-events/phd-fellowship/). |
| **Microsoft Research Fellowship** | 2026 Taiwan amount US$17K institutional gift; closed cycle. | Future challenge-specific target; no 2027 call established. Cite-Refinery/Refinery may help when actual challenges are known. Institutional distribution is not direct guaranteed student cash. [Programme](https://www.microsoft.com/en-us/research/academic-program/2026-microsoft-research-fellowship/). |
| **NVIDIA Graduate Fellowship** | Up to US$60K, including tuition/fees; current deadline Oct 30, 2026. | User has not completed first doctoral year, so not a current eligible route. Research and required internship must fit later. [Programme](https://research.nvidia.com/graduate-fellowships). |
| **IBM** | 2026–27 fellowship paused. | Replacement programme expected to be announced Q1 2027; criteria/amounts unknown. Watch, no forecast. [Status](https://research.ibm.com/labs/yorktown-heights/ibm-academic-awards-program). |
| **Sequoia OSS Fellowship** | Living-expense support for 6–12 months; amount not fixed here. | Stated aim is real-world adoption. Current prototype evidence does not establish maintainer demand; GitHub stars are not the deciding metric. [Programme](https://sequoiacap.com/oss). |
| **Sovereign Tech Fund** | Work costs must exceed EUR50K minimum; not an automatic award. | Funds mature open base technology and excludes prototype development. Current small kernels/apps do not establish critical infrastructure use. [Requirements](https://www.sovereign.tech/programs/fund/). |
| **NumFOCUS small development grants** | Up to US$10K; only sponsored/affiliated projects. | No qualifying affiliation established. A contribution to an existing eligible project is a different route requiring maintainers. Page's listed 2025 dates do not establish a 2026 open round. [Programme](https://numfocus.org/programs/small-development-grants). |
| **fal research grants** | Advertises US$50K average and free compute; cash/compute terms unresolved. | Possible compute support for a defined Nocturnal/Cite-Refinery experiment. No model/GPU budget yet; do not book US$50K cash. [Programme](https://fal.ai/grants). |
| **OTF Internet Freedom Fund** | Official indexed target US$50–200K, 6–12 months; direct page returned 403. | Nocturnal requires a real censorship/surveillance use case, beneficiaries and security design. Generic fact checking is insufficient; current intake not operationally verified. [Programme](https://www.opentech.fund/funds/internet-freedom-fund/). |
| **Corrigibility Research Fund** | Typical US$5–35K; Oct 31, 2026. | Software permission gates are not model corrigibility results. Hold for genuine research fit; applications public. [Call](https://corrigibilityresearch.org/). |
| **EA Funds Transformative AI** | No fresh applicable amount established. | General research reliability is insufficient to establish catastrophic-risk relevance. Low priority without a substantive matching study. [Programme](https://funds.effectivealtruism.org/funds/transformative-ai). |
| **NLnet** | Usually EUR5–50K first grant; fund-specific scope. | Current AI-assisted development and October 20 proposal/development policy are material obstacles. Merely renaming the artifact does not cure compliance. [Policy](https://nlnet.nl/news/2026/20261020-AI-policy.html). |
| **Ethereum ESP** | Scope-specific; no active open round shown. | No exact current RFP match verified. Crypto research is domain context, not proof of an Ethereum infrastructure contribution. [Applicants](https://esp.ethereum.foundation/applicants), [rounds](https://esp.ethereum.foundation/applicants/open-rounds). |
| **Taiwan SBIR** | Company project support, no applicable personal amount. | No eligible company applicant established. Incorporation should follow a real venture case, not a grant ceiling. [FAQ](https://sbir.sme.gov.tw/sbir/faq). |
| **Awesome Conservation and Climate** | US$1K-scale; next listed date Nov 27, 2026. | Near-term innovative environmental action required. No field operator/deliverable established. Explicitly excludes salaries, personal and operating expenses; not a living-income route. [Chapter](https://www.awesomefoundation.org/en/chapters/conservationandclimate). |

Awards for mature maintainers, institutional research, fellowships and small project grants are different markets. Failing the first category's adoption test does not invalidate the early-stage research case. Conversely, adding every published maximum produces a meaningless funding forecast.

## What should actually be prepared

These are **internal work scopes and evidence requirements**, not outward application answers. Mozilla, EV and NLnet have distinct authorship rules; do not turn this report into ready-to-paste responses for them.

### 1. BASAibu host-fit evidence sheet

Use Cite-Refinery's public source traces and uncertainty handling as the main technical evidence. Use Nocturnal only for the narrower multilingual/source-comparison methods actually demonstrated. Finance/policy research supports understanding of proposals, incentives and measurement; it does not establish local-language proficiency or community relationships.

The missing work is MediaWiki integration, community-led requirements and evaluation of whether contributors/juries understand proposals and shared priorities better. An honest plan would specify a limited technical integration, community-selected tasks, comparison with current reading/search/translation practice, and measures of comprehension, error, language coverage and contributor control. Host collaboration would be refined after selection; do not invent an existing agreement or contact the host without authority.

Prepare accessible artifact links, a factual contribution sheet, evidence of Indonesian context/language ability, a list of integration unknowns, and a feasible 12-month delivery outline. The applicant supplies their own motivations and application responses.

### 2. Sentient experiment specification

Choose **one** question, such as whether explicit component evidence and model/tool allocation can maintain research-task quality at lower total cost than strong simpler approaches. Cite-Refinery and Refinery provide apparatus; finance contributes useful evaluation of costs and constrained choices.

Before claiming an advantage, define:
- the tasks, eligibility of sources/data and holdout policy;
- a plain same-model agent, a reasonable retrieval/tool baseline and any human reference;
- completion quality, unsupported claims, abstention, actual model/compute spend and human review time;
- repeated runs, ablations, uncertainty and failure reporting;
- which code/evaluations will be open and exactly what the funded phase adds.

Do not reuse a weak quote-matcher result as proof against capable assistants. Do not call process separation a secure sandbox. Negative results remain publishable deliverables if the work plan genuinely funds an investigation. The official individual grant range is unpublished, so budget the actual work rather than reverse-engineering a programme headline.

### 3. One FUTO work package

Hardware-Splicer has the cleanest public MIT starting point. A candidate scope is one reproducible handoff and validation improvement that another user can run, with fabrication/bench checks only if relevant and realistically costed. Alternatively choose a small self-hosted research component.

Prepare the existing reproducible artifact, exact new deliverable, simple user-control explanation, itemised labour/expenses, completion evidence and limits. US$1–5K is an early-project scale; do not attach an entire multi-repository platform roadmap or count it as annual salary.

### 4. A finance/energy/software institutional package

Use Invisible Ledger and Policy Lab as the research core, Research Drive as institutional workflow evidence, and Sharpe as evaluation-method evidence. Select a single question a real supervisor is interested in: measurement validity, renewable cash-flow evidence, financial model robustness or research-tool evaluation.

Reuse methods, public-source code, selected results and contribution records. Add an eligible PI/recipient, authorised data plan, new deliverables, supervision and a real budget. Keep RA compensation separate from base scholarship support and never invent faculty endorsement. This route may work at a current institution or a future doctorate; admission is not itself a research contract.

### The reusable document set

| Material | Reuse available now | What must be added or resolved |
|---|---|---|
| Research/technical CV | Education, supported RA/procurement facts, selected actual research and systems. | Current status, exact personal contributions, verified achievements; no invented publication or acceptance. |
| Research overview | PhD research direction and the newer thesis/paper materials. | One funding question, beneficiary and new funded phase; not an unedited doctoral admissions essay. |
| Artifact sheet | Existing repositories, demo/release records and fresh checks. | Exact revision, reviewer access, licence/IP and a short reproducible path. |
| Methods/evaluation appendix | Existing protocols, negative findings and test outputs. | Strong baselines, external reference review, uncertainty and task relevance. |
| Work plan | Existing apparatus reduces construction needed. | New milestones, measurable done criteria, risk and contingency; proposed rather than already achieved. |
| Budget and funding statement | Existing costs/workload can inform planning. | Actual quantities/rates, recipient treatment, other funding, distinct hours/costs and payment timing. |
| Data/rights/contribution statement | Existing licence/data notes and ownership review. | Permission for proposed use, coauthors/institutional IP and disclosure of assistance as required. |
| Recommendations/host/nominations | No new commitments established. | Named eligible people only after agreement and authorisation; institutional deadlines. |

No new recommendation request, external upload or application is required to finish this preparation.

## How this changes the PhD-and-income judgement

The portfolio makes a research-based earning strategy more credible. A doctorate can add a supervisor, institutional access, nominations, paid research packages and collaborators. Several independent grants here do **not** require a doctorate, so those opportunities are not exclusively a benefit of enrolling. Their compatibility with a full-time research job would also depend on contract and workload.

Personal cash must be derived from actual terms:

**Additional personal support = award's permitted personal compensation minus any overlap with already-counted compensation.** Compute credits, equipment, overhead, travel and project money stay separate. Awards paid in instalments do not automatically create a smooth monthly income.

For scale only, Mozilla Embedded's published US$75K annual stipend is US$6,250 per month when divided by twelve, before any tax/recipient treatment and without asserting that payment schedule. This is a different scale from a microgrant and gives a real reason to explore the route. It is highly selective, starts June 2027 and is not awarded to the applicant. Do not add both Mozilla tracks or automatically stack an outside fellowship with doctoral support.

The useful decision is not whether the portfolio “deserves more than NT$40–55K.” It is whether a specific recipient will fund a defined piece of work on acceptable terms. This audit identifies credible ways to seek that support, while leaving the unawarded portion out of dependable living-cost planning. No exchange-rate forecast or success probability was invented.

## Recommended sequence and completion status

1. Freeze the lead evidence revisions and resolve the thesis package manifest. Keep the original failed and supplemented replay receipts distinct.
2. Build factual evidence sheets for BASAibu and one Sentient experiment. Use one primary system and only necessary supporting work.
3. Prepare one small FUTO deliverable and cost sheet from a public artifact.
4. With an actual supervisor/recipient, prepare the finance/energy research work package and resolve data/IP boundaries.
5. Let the applicant write restricted-authorship responses; check terms, time and budget overlap before any commitments.
6. Recheck live calls and existing draft/receipt history immediately before any later authorised application action. Never promote these research rows into FIRE merely for thematic fit.

At audit completion, **no application or outreach has been made**. The immediate bottleneck is a convincing, accessible and accurately scoped funding package—not another large project or generic professional-experience credential.

Validation checked unique records, source links, evidence paths, route-to-asset references and the actual ledger totals. The required fast repository gate passed syntax and failed the same pre-existing campaign-review assertion at `test/portfolio-campaign-review-queue.test.mjs:19` concerning `cloudflare-startups-2026`. No application code or test expectations were changed. The JSON and private audit receipts record this limitation; the repository gate is not represented as green.
