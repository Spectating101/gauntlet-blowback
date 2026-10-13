# Research submission preparation - October 8, 2026

> October 8 campaign update: ATTA is closed for attendance cost. Jobs and cash project funding now lead; conference/publication applications are deferred. Earlier counts and priorities below are historical. See [current post-master plan](POST_MASTER_CAMPAIGN_2026-10-08.md).

This file prepares the next artifacts. It is not final submission copy or a claim that the studies are complete.

## Refinery - MSR Data and Tool Showcase

The [official call](https://2027.msrconf.org/track/msr-2027-data-and-tool-showcase-track) requires a reusable tool, installation/example material and preliminary evaluation. The paper allows four pages plus one page of references, includes author names, and needs a review-accessible artifact. Publication requires a persistent DOI archive. Abstract and paper deadlines convert to November 6 and 11 at 19:59 Taipei. Authorship, concurrent-review, release and registration obligations remain protected.

### Working title

Refinery: Keeping Software Reuse Evidence Attached to the Implementation It Describes

### Draft abstract for development

Software-repository evidence is often recorded at a broader scope than the decision it supports. Refinery separates a software capability, its exact implementation and claims about that implementation. It records evidence and unresolved gaps before a reuse decision. This tool description would present that data model and a reproducible inspection workflow. Existing internal examples include a negative reuse-versus-rebuild URL-resolution control and a licensed Public Suffix List comparison in which maintained rule data improved performance against a code-only comparator. Those examples motivate the design and delimit its claims. They do not establish general reuse superiority or outside adoption. The submission would provide a review artifact and installation example that allow another researcher to inspect an exact implementation and trace each claim to its evidence.

### Four-page content plan

1. **Problem and contribution (half page):** Show the concrete provenance-scoping failure in MEV0-001. Explain which decision was vulnerable and which subject the repaired evidence identifies. Compare against relevant repository-mining/provenance tools with actual references before claiming novelty.
2. **Architecture (one page):** Capability, Implementation and Claim objects; exact artifact identity; reviewed versus provisional discovery; the separation between evidence and permission to recommend an action. Use one running example throughout.
3. **Reproduction workflow (one page):** Pin the native revision, supply a sanitized sample, document installation/import/query steps, and include expected outputs. The public read-only review page alone is not a runnable research artifact. A cold installation on a clean environment is still required.
4. **Preliminary examples and limitations (one and a half pages):** URL control 42/42 versus 42/42; PSL 78/78 versus 39/78 with comparator inputs explicit. Describe the exact-subject provenance repair. Keep outside user results at zero/unestablished and state private acquisition-path limitations. Distinguish tool usefulness from an empirical-study claim.
5. **References (separate page):** Verify primary papers and licenses; supply persistent artifact identity once the owner designates a release.

### Artifact work still needed

- Designate the native Refinery revision and a runnable, sanitized review subset. Do not substitute the cite-refinery bridge or assume permission to release the private source.
- Prepare installation and one example with exact expected results; perform a meaningful cold reviewer run.
- Audit related work and the manuscript's overlap with any technical-paper submission. Activate one overlapping review at a time.
- Resolve the eventual publication/archive scope, registration and presentation economics before promising them.

Evidence already reviewed: ../refinery/docs/EXTERNAL_ASSESSMENT.md and docs/REFINERY_OPPORTUNITY_BRIEF_2026-10-08.md. No new evaluation results were produced during this preparation.

## Hardware Splicer - grant fit review

The [Corrigibility Fund manager's methodology](https://www.lesswrong.com/posts/q2YL7qKigC9QEEdsX/how-i-m-evaluating-corrigibility-grant-applications) treats corrigibility as an agent's orientation toward human correction, beyond control imposed by outside checks. This makes the October 3 draft a research-fit hold. AI assistance is not stated as categorically forbidden there.

### Proposed extension to consider before writing a final application

The existing matched 300-run protocol tests unsupported requests and useful completion. A possible follow-up asks whether the agent voluntarily exposes errors and helps the human correct them when it could conceal or ignore them. This is a proposal, not a frozen or completed study.

- Keep the existing hardware evidence cases and dry-run action boundary.
- Separate a prevented action from an agent voluntarily noticing the unsupported plan.
- Define a rubric for whether the human learns the specific error, its consequence and the evidence needed to correct it.
- Include adequate-evidence cases so refusal and verbosity cannot count as improvement.
- Hold evidence access and tool opportunity constant across conditions; otherwise a better explanation could simply reflect extra information.
- Grade ambiguous traces using a fixed human rubric. Independent adjudication is a desirable extension, not an existing partnership.
- Decide whether this extension answers a question the fund actually values before adding it to a final protocol or budget. Do not infer alignment or a general corrigible disposition from a few behaviors.

The frozen core is still a stronger direct fit for the OpenAI researcher-credit route. Current model/budget recheck and automatic bundle readiness are recorded in docs/OPENAI_RESEARCH_ACCESS_PREFLIGHT_2026-10-08.md. Corrigibility and Transformative AI grant budgets remain unapproved; neither fund application is submitted.

## Applicant-only programmes

[SPAR's current FAQ](https://www.sparai.org/) bans AI writing, rewriting, polishing and translating free-response answers. Project matching and high-level feedback are allowed. Spring 2027 opening remains approximate, around December. Keep automated answer drafting disabled. The archived ERA route also retains its recorded applicant-only rule; it was not reopened or independently reverified in this turn.
