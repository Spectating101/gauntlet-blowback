# Claude Startups — Cite-Agent application packet

Revision: 2026-10-08. Evidence-reviewed copy mapped into the authenticated live form. Partial form is preserved; server draft saving is unverified. No submission exists.

## Applicant and product

| Field | Prepared value / handling |
| --- | --- |
| Product / trading label | Cite-Agent; not proof of a registered company name |
| Website | https://www.cite-agent.com |
| Business email | chrisko@cite-agent.com — two-way delivery verified October 7 |
| Professional / preferred name | Xin-Fu Wang / 王新福, owner-selected academic writing name |
| Legal identity | Use the ignored applicant authority if explicitly requested; do not substitute a pen name in a legal-name field |
| Location | Taoyuan, Taiwan; distinguish residence from legal incorporation jurisdiction |
| Builder profile | Research engineer; current MSc Finance and Accounting student at Yuan Ze University |
| Stage | Working research software; historical deployment and recent local workflow evidence; external adoption unestablished |
| Repository | Private Cite-Agent repo; do not offer access or publish it without authorization |

## Paste-ready answers

These are prepared variants, not claims about fields already observed in the authenticated application. Use the shortest answer that fully answers the actual question.

### One sentence

Cite-Agent helps researchers find papers, analyze data and write manuscripts while keeping the sources and analysis runs beside the work.

### Short product description

Cite-Agent is a research workspace for moving from a question to a manuscript. It connects literature search, data analysis and DOCX writing, retaining the papers, dataset scope, analysis settings and saved results behind the work. Researchers can inspect that evidence as they review a claim or revise a section.

### Fuller product description

I built Cite-Agent for researchers who work across papers, datasets, statistical tools and manuscripts. The workspace carries source selections and saved analysis runs into research discussion and DOCX writing, so a researcher can inspect which evidence supports a result instead of reconstructing it from separate chat sessions and files. Recent local verification followed a real 415-row dataset through analysis, saved-run discussion, literature review and manuscript export. The project has an existing website and deployment history. The latest workflow changes have been verified locally; independent adoption and acceptance of those changes in production remain to be established.

### Problem and intended users

Researchers often move evidence manually between literature tools, analysis software and a document editor. That makes it easy to lose the dataset scope, use an older result or leave a claim disconnected from its source. Cite-Agent is intended for researchers doing literature-based and empirical manuscript work, initially with a narrow workflow that can be reviewed end to end.

### What is distinctive?

The workspace preserves more than generated text. It retains the selected sources, dataset scope, model specification and saved run, then carries that context into manuscript work. In a recent local check, reopening an earlier analysis retained that run's coefficients even after a newer model had been executed. The exported DOCX included the selected run, sample counts and source caveats. These are operational checks, not a claim that the software establishes scientific validity.

### Planned Claude use — short

I plan to evaluate Claude for source-grounded research synthesis, review of manuscript claims and explanation of saved empirical results. I will compare it with Cite-Agent's existing model routes on evidence fidelity, unsupported claims, task completion, latency and cost before choosing a production route.

### Planned Claude use — detailed

Claude would work with a project's selected sources and retained analysis results to help synthesize literature, identify unsupported or stale manuscript statements, and explain results without silently changing the analysis. I plan to compare the direct Claude API with the model routes already supported by Cite-Agent, using the same research tasks and evidence. The comparison will track source support, numerical fidelity, handling of missing evidence, task completion, latency and cost. Startup credits would fund that evaluation and a small outside pilot if the initial checks pass. Claude is not established as the current production provider.

### Current Claude relationship, if asked

Cite-Agent documents an MCP interface usable with Claude Desktop and other MCP clients. That interface is separate from the application's hosted model routes. Historical production records identify DeepSeek and Cerebras; direct Claude production usage has not been established. The proposed evaluation would use the first-party Claude API.

### Progress / traction, if asked

The product has a website and deployment history. Recent local verification followed a real imported dataset through saved analysis, source-grounded discussion, literature review and DOCX export, including retention of the selected run and source caveats. I am now preparing outside workflow validation. Independent customers, revenue and adoption metrics are not established in the reviewed evidence.

### Founder background, if asked

I am a research engineer and an MSc Finance and Accounting student at Yuan Ze University. My work combines research software, empirical analysis and academic writing. I built Cite-Agent to keep the evidence behind a research result available throughout analysis and manuscript work.

### Business model, if asked

Commercial validation is still ahead. The initial test is whether researchers repeatedly use the complete evidence-to-manuscript workflow and would pay for it. Paid individual access and lab deployments are options to evaluate, not established pricing or contracts.

Do not enter this proposed direction into a field asking for existing revenue or an already adopted business model.

## Evidence index and exact limits

| Claim | Existing evidence | Limit |
| --- | --- | --- |
| Public product identity | https://www.cite-agent.com ; public page retrieved October 8 (crawl dated last month) | Not a fresh live app acceptance test |
| Deployment history | ../Cite-Agent/docs/status/generated/sol_production_bringup_handoff_2026-07-21.md | July record, not current invoice/uptime or latest release acceptance |
| Real dataset-to-DOCX journey | ../Cite-Agent/review-ui/empirics-integration-20261007/README.md ; manuscript-export.json ; empirical-final.docx | Local journey: 415 imported / 409 model rows; no causal or forecasting validity claim |
| Earlier independent numerical comparison | ../Cite-Agent/review-ui/yzuc-empirics-recheck-20261006/README.md ; real-data-ols.json | Separate 3,028-row numerical check; do not conflate with the 415-row journey |
| MCP interface | ../Cite-Agent/README.md ; ../Cite-Agent/cite_agent/mcp_server.py ; ../Cite-Agent/docs/archive/MCP_AND_LIBRARY.md | Supported client interface, not proof of production Claude usage |
| Verified business contact | docs/CITE_DOMAIN_EMAIL_SETUP_2026-10-07.md | Authorized two-way test only; no permanent Gmail forwarding |

The October 7 local journey retains real source caveats and returns a literature brief marked needs_verification. Do not claim all generated citations are verified, all results scientifically valid, or a live Research Drive connector exists. Do not expose private review fixtures, source data, credentials or legal identity in public supporting artifacts.

## Proposed evaluation and outside pilot

This is a preparation plan; it has not been executed or promised to a partner.

1. Freeze 30 source/evidence task packs: 10 literature synthesis tasks, 10 saved-result explanations, 10 manuscript claim reviews. Include supported, unsupported, contradictory and stale-result cases. Use public or owner-authorized material.
2. Compare one direct Claude route with one existing Cite route, two repetitions per task (120 responses). Keep input evidence, instructions and task boundaries matched. Record exact model identifiers and settings when executing.
3. Score source support, exact numerical/run fidelity, uncertainty handling and completion. Keep raw latency/token/cost receipts. Separate automatic checks from human review; a solo review is not an independent evaluation.
4. Estimate spend with current selected-model pricing before running. Use a configurable cap within awarded credits; no paid account, API calls or provider changes authorized by this packet.
5. After material failures are resolved, invite one outside researcher to complete a real question-to-manuscript workflow. Measure completion, blockers, repeat use and willingness to pay. Obtain any required permission before sharing their data or publishing feedback.
6. Decide whether Claude improves the selected workflow enough to justify a production route. Record negative results as well as improvements.

### Five-minute demonstration outline

- Start with a concrete research question and selected papers.
- Open the imported dataset and show its scope and source caveats.
- Execute or reopen a saved analysis; show the exact sample and specification.
- Discuss the retained run, then reopen an older run to demonstrate identity preservation.
- Carry Methods/Results into the manuscript and inspect the exported DOCX.
- Identify the unresolved scientific/source checks and local-versus-production boundary.

Existing local screenshots and DOCX are evidence candidates, not designated public uploads. Review their contents before any upload. No pitch deck is required by the public FAQ; create one only if the live intake asks for it.

## Facts to resolve from the live form/account

- Actual startup founding date, registered name/incorporation if asked, and authority to apply on its behalf. First commit/deployment dates are not substitutes.
- Actual funding, revenue and customer count. Absence of evidence does not authorize entering zero as an attested fact.
- Prior startup awards/credits and current Team subscription; do not infer from this browser being signed out.
- Any location/supportability, eligibility or legal declaration the live intake asks for.

Resolve known facts from canonical records first. Interrupt only for an actual requested fact that remains unresolved.

## Browser handoff and protected actions

October 8 inspection: the existing real Chrome tab still displays Console sign-in. Email is prepared as chrisko@cite-agent.com. Continuing explicitly accepts linked Commercial Terms and Usage Policy and acknowledges Privacy Policy.

Under AGENTS.md and applicant authority, the owner must review the displayed terms, click Continue with email and complete verification. After login the operator may inspect fields, map this packet, complete reversible steps and save a draft. Final submission and any new legal/eligibility declarations remain human-gated. No application ID or receipt exists.

Official application: https://platform.claude.com/offers/startups-application

## Program and terms sources

Rechecked October 8: [program FAQ](https://claude.com/programs/startups), [official terms](https://www.anthropic.com/startup-program-official-terms). Bootstrapped applicants are accepted; founding/funding window and actual eligibility still apply. Current offer: $1,000 direct API credits, six-month expiry, Team year up to five Premium seats if new to Team. Third-party bills are not covered.

Earlier review: [linked commercial terms](https://www.anthropic.com/legal/archive/af81645b-040b-485c-a4a0-3205ccfb3792), [additional-benefits addendum](https://www.anthropic.com/legal/startup-program-addendum), [privacy](https://www.anthropic.com/legal/privacy). Exact linked archived privacy page failed earlier; current privacy review does not substitute for the exact displayed version. Program publicity covers selected applicant name/logo. Member Stack offers prohibit automated access/harvesting; do not automate member perk redemption. Review is not consent.

Social benchmarks and their limitations: docs/CLAUDE_STARTUPS_SOCIAL_BENCHMARK_2026-10-07.md. They support trying; they do not establish approval odds.

## Authenticated live form — October 8

Owner completed login as chrisko@cite-agent.com. Form identifies Christopher’s Individual Org and account-provided first/last name Christopher / Ongko Wijoyo; those names were retained. The optional API-credit purchase was skipped via Skip for now, without payment.

Filled: Cite-Agent; Founder and research engineer; https://www.cite-agent.com; Taiwan; Taoyuan; Software & SaaS; prepared technical copy compressed to 391 characters for support and 481 for product (portal accepts 50–500 characters). Exact field copy is preserved in output/startup-applications-2026-10-08/claude-startups-live-draft.json.

Still unresolved: founding date helper says month/year incorporated, requiring owner confirmation of incorporation status and actual start date; latest funding round; Anthropic monthly AI-spend range. Funding choices: Not yet raised, Pre-seed, Seed, Series A, Series B, Series C or later. Spend choices: 0–20%, 21–40%, 41–60%, 61–80%, 81–100%. Neither funding nor spend was guessed. Investors and LinkedIn remain optional/blank.

Program-update opt-in and program-terms checkbox remain untouched, as does Submit application. No Save draft control was observed. The live tab and local copy are preserved; a server-saved draft or receipt is not claimed.

## Owner facts resolved and final review — October 8

Owner confirms: Cite-Agent is not incorporated; project began around October 2025; no outside investment; monthly AI spend on Anthropic is estimated at 41–60%. Funding and spending selections now match those replies. The date is provisionally October 2025 under the main founded question, while the helper text says incorporated. The product description explicitly begins: I started Cite-Agent around October 2025; it is not incorporated. This disclosure does not establish provider eligibility or resolve the portal wording authoritatively; owner must review before submission.

The final support/product copy is 391/483 characters and is backed up in claude-startups-live-draft.json. Required factual fields are filled. Program consent and Submit remain untouched. Optional investors, LinkedIn and email-update opt-in remain blank/off. No paid credits purchased and no submission receipt.

## Current final copy after plain-language review

Owner challenged abstract wording. Replaced it with direct descriptions of papers, saved results, checking sources/numbers and proposed tests. The 415-row local test is supported by the October 7 workflow receipt. Approval odds are not established; acceptance of unincorporated applicants and interpretation of the date helper remain unresolved. Disclosing unincorporated status does not establish eligibility.

Support (453 characters):

I'd like API credits to test Claude in Cite-Agent, and technical feedback on using it with selected papers and saved analysis results. I'll compare it with the models Cite-Agent already uses, checking whether answers use the supplied sources, quote the right numbers and flag missing evidence. I'll also measure latency and cost. If the tests pass, I'll try the workflow with an outside researcher. Claude is not currently Cite-Agent's production model.

Product (458 characters):

I built Cite-Agent to help researchers find papers, analyze data and write manuscripts in one workspace. It keeps selected papers and saved analysis results with the writing, so a researcher can check the sources and numbers behind a claim. A local test took a real 415-row dataset through analysis and DOCX export. Next I plan to evaluate Claude for literature synthesis and manuscript review. Cite-Agent is unincorporated; I started it around October 2025.

Exact text verified in both live textareas. Owner-selected program-terms checkbox remains checked; operator did not select it. Final Submit untouched. Earlier character counts/copy revisions are historical; exact current backup is claude-startups-live-draft.json.

## Superseding date correction after second review

The provisional project-start interpretation above was withdrawn. October 2025 is not a legal incorporation date. Both date selectors are now blank pending provider clarification. The form was reloaded to clear selectors, then all other supported fields were restored. This also reset the owner-selected terms checkbox, which the operator left unchecked. No submission should be described as ready until unincorporated eligibility/date handling is resolved. See CLAUDE_STARTUPS_SECOND_REVIEW_2026-10-08.md for the evidence comparison and legal-source limits.
