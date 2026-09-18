# Submission readiness assessment

## Separate project capability assessment

Assess the project against its intended user capabilities independently of any
one application. The [2026-09-09 capability assessment](PORTFOLIO_CAPABILITY_ASSESSMENT_2026-09-09.md)
records inspected revisions, executed tests, confirmed implementation gaps,
unperformed verification and development acceptance criteria across the portfolio.

An application-ready research prototype may still be an incomplete product.
Conversely, product completeness does not establish eligibility or portal readiness.
Use both reviews; do not collapse either into one maturity score. Builder completion
claims require reassessment of the resulting revision and actual workflow evidence.

## Entry-specific review

The assessor evaluates a specific portfolio package for a specific opportunity.
Repository maturity alone does not establish application readiness. This review
adds evidence to the existing opportunity and FIRE workflow; it does not replace
route state, browser checkpoints, or final-action authorization.

## Review record

Record the route ID, review date, official requirements inspected, project
revision, packet revision, designated artifacts, and reviewer. For each material
requirement, record the source, supporting evidence, finding, and remaining action.
Use PASS, FAIL, UNKNOWN, or NOT_APPLICABLE; explain every non-pass finding.

Assess:

1. Current opening, deadline/timezone, applicant eligibility and submission rules.
2. Whether the selected project actually answers the opportunity's question.
3. Whether each material claim is supported by the cited revision and evidence.
4. Whether relevant tests executed and passed; distinguish product failures from
   infrastructure failures, skipped checks, and unperformed verification.
5. Whether reviewers can access the designated repository, demo and attachments.
6. Whether copy answers the questions, meets limits and agrees with attachments,
   applicant facts, proposed methods, budget and model/resource availability.
7. Live form requirements, draft completeness and unresolved human actions.

Apply the evidence standard the opportunity requires. External adoption is not
a universal prerequisite for a job application or a proposed research experiment.
Empty selector maps do not block adaptive Chrome preparation.

## Conclusions

- READY_FOR_PREPARATION: enough evidence to begin reversible browser work;
  remaining live requirements must still be inspected.
- READY_FOR_FINAL_REVIEW: the actual completed application and attachments have
  been checked; list any remaining protected human actions separately.
- NEEDS_CORRECTION: name the concrete copy, artifact, access or tool correction.
- NEEDS_EVIDENCE: name the unsupported material claim or missing required result.
- NEEDS_APPLICANT_INPUT: name the exact unresolved personal fact or commitment.
- INELIGIBLE_OR_CLOSED: cite the controlling requirement or closing evidence.

Several findings can coexist. Record the next executable action and distinguish
what blocks drafting from what blocks final submission. Reassess affected findings
when requirements, packet contents, designated artifacts or project revisions
change. Approval applies only to the reviewed versions.

QA does not imply acceptance, independent scientific replication or submission.
Only external confirmation supports a SUBMITTED receipt.

## Initial inspection: 2026-09-09

The existing evaluator in `src/core/conversion.mjs` compares declared required
and available evidence identifiers and supplied eligibility/fit states. It does
not inspect the underlying evidence. FIRE validates packet structure and readiness
flags, but those checks do not independently substantiate the submission claims.

The current OpenAI and Anthropic research-access handoffs contain versioned
Hardware-Splicer copy. They are candidates for substantive QA, not approved here.
Outstanding checks include current official requirements, provider model/API
availability, budget assumptions, the cited experiment artifacts, and live form
requirements. Existing packet model names must not be treated as verified API
availability. This document does not assert that either live route was reviewed.
