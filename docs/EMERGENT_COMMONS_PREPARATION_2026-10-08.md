# Emergent Ventures - Refinery/Commons preparation

> October 9 rules check: the official Emergent Ventures page allows AI only for proofreading and says AI-written applications will be rejected. This AI-prepared narrative must not be submitted as-is. Applicant authors the application; operator assistance is limited to proofreading under the current rule. Source: https://www.mercatus.org/emergent-ventures .

October 8, 2026. **Partial draft for review; not submission-ready.**

[Official programme](https://www.mercatus.org/emergent-ventures) and [live intake](https://mercatus.tfaforms.net/5099527) inspected. One application per applicant/project. Proposal limit 1,500 words; supplementary PDF uploads are excluded. Consent, CAPTCHA and final submission are protected. No draft-saving control was visible; local packet is the durable copy.

## Tweet-length description (207 characters)

Refinery helps developers decide what to reuse by tying evidence to the exact software artifact. I want to test whether it changes real reuse decisions, including cases where rebuilding is the better answer.

## Proposal components (529 words before the personal answer)

### Supported background

I build research software while studying Finance and Accounting at Yuan Ze University in Taiwan. My projects include Cite-Agent, research-data infrastructure and Refinery. In Refinery I have been testing a practical question: once AI can regenerate ordinary code cheaply, what is still worth preserving and sharing?

### Personal story and consensus view - unresolved

The applicant must supply or confirm these. The factual background above is available; a personal anecdote and strongly held belief are not inferred from a repository. A possible topic to consider is reproducibility, but it is not recorded as the applicant's belief. Do not submit a placeholder or silently omit this required part.

### Project idea

Refinery is a commons for software capabilities and the evidence behind them. It helps a developer distinguish what a component is supposed to do, which exact implementation is being evaluated, and what the available evidence actually establishes.

My hypothesis is that cheaper code generation changes the useful unit of software reuse. Generic code may become easy to replace, while curated data, accumulated maintenance and evidence about a specific implementation remain costly to reproduce. A useful commons should help identify that difference. It should also say when rebuilding is sensible.

I built two contrasting internal comparisons. In a URL-resolution control, the reused and rebuilt implementations both passed 42 reference cases, so the experiment established no correctness advantage for reuse. In a second comparison, a licensed, pinned Public Suffix List plus matching code passed all 78 official test cases; generic code without the accumulated suffix rules passed 39. That comparator tests the contribution of curated state. It does not establish universal superiority of reused software or measure a developer's willingness to pay.

The evidence record matters as much as discovery. During development I found that project-level provenance could appear to support sibling implementations that it had not actually verified. I repaired the binding so that evidence about one immutable artifact stays attached to that artifact. A developer should be able to see both the reason for a recommendation and the limit of the evidence behind it.

I propose a three-month validation project. First, freeze a small set of tasks containing both readily recreated behavior and capabilities dependent on maintained assets. Record the permitted inputs and comparison rules before evaluation. Then invite outside developers to bring actual reuse decisions. Compare their normal process with a Refinery-assisted process, retaining the exact software subject, decision time, evidence gaps and final choice. Invitations and participation are prospective; I do not have a committed partner for this proposal.

The first milestone is one complete outside case, including a negative verdict if the tool adds no value. If that case works, expand to a target of ten decisions and report where the workflow helped, where it wasted time and whether the developer would use it again. Time differences will be descriptive because this small study cannot establish a general productivity effect.

The output will be a reviewer-accessible capability catalog, a repeatable evaluation protocol and a report of the outside cases where permission allows publication. Private source code and participant material will be handled separately; this application does not promise unrestricted release of them. The existing sanitized review surface is https://spectating101.github.io/refinery/.

The larger ambition is a software commons that remains useful when producing more code is cheap. It would preserve knowledge that changes a decision: the exact behavior, maintained state, rights and evidence that cannot be recovered from a plausible implementation alone. Outside use is the next test of that ambition. Independent adoption, revenue and general product-market fit have not been established.

### Budget and time - proposed for review

A lean three-month, part-time validation budget of **US$1,000** is proposed: $500 participant time, $300 API/compute, $150 hosting, $50 contingency. These are planning estimates, not supplier quotes, spending authority or an approved grant request. Salary/stipend is excluded from this estimate. Reduce overlapping costs if another award covers them. The applicant must review amount and commitment before submission.

## Claim checks

- The PSL result compares maintained rule data plus code with generic code without those rules; it cannot support a general superiority claim.
- The URL control is negative evidence for reuse advantage.
- No independent outside participant, customer, revenue or completed validation study is claimed.
- The public reviewer page does not expose the private repository.
- Numerical claims are copied from the native evidence packet; the tests were not rerun during this preparation.

## Operator handoff

Exact field mapping, protected gates and evidence: output/application-preparation-2026-10-08/emergent-commons.packet.json. The browser can receive supported metadata and the short description; the incomplete full proposal must remain local until its personal section and budget are resolved.
