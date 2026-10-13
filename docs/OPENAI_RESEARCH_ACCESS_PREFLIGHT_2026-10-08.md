# OpenAI Researcher Access - October 8 preflight

**Packet preflight restored; browser remains at password login. No submission.**

## Current checks

The current [Sol model page](https://developers.openai.com/api/docs/models/gpt-5.6-sol) lists gpt-5.6-sol at $4 input / $20 output per million tokens; Sol pricing is promotional at least through November 21. The [Terra model page](https://developers.openai.com/api/docs/models/gpt-5.6-terra) lists gpt-5.6-terra at $2 / $12. Taiwan appears in the [supported-country list](https://developers.openai.com/api/docs/supported-countries). These are public catalogue checks, not evidence of this applicant's API access or a completed model run.

## Existing workload calculation reproduced

Native source: ../Hardware-Splicer/docs/external_assessment/research_access/OPENAI_RESEARCHER_ACCESS.md, budget section. No study redesign.

| Assumed total billed tokens per scored run | 200 Sol runs | 100 Terra runs | Scored subtotal | Headroom within $300 |
| --- | ---: | ---: | ---: | ---: |
| 50,000 input + 10,000 output | $80 | $22 | $102 | $198 |
| 100,000 input + 20,000 output | $160 | $44 | $204 | $96 |

Formula: runs times (input_tokens times input_rate + output_tokens times output_rate) divided by 1,000,000. Input counts must include the entire repeated tool conversation; output counts must include billable reasoning. No caching or batch discount is assumed. Estimates are not measured pilot usage.

The existing $300 request is a working cap for the scored study, a small unscored pilot and retries. Recheck prices at final submission and activation; December review can occur after the current promotional period. If access/prices or measured pilot use exceed the cap, revise the protocol before scoring and do not spend beyond funded credits. No paid pilot was run to obtain this estimate.

## Browser handoff

Current application: https://openai.smapply.org/prog/openai_researcher_access_program/ . Apply reaches SurveyMonkey password login for the canonical YZU email. Sign in personally; then inspect the dashboard for an existing application or receipt before creating another draft. Authentication and real field mapping remain required. Terms, eligibility declarations and final submission stay with the owner under AGENTS.md.

The named route now selects Hardware Splicer, replacing the incorrect generic Cite allocation. The manifest uses the current portal and verified_at date. Original protocol and copy revisions are preserved. This restores bundle eligibility for browser preparation; it does not establish a saved cloud application.
