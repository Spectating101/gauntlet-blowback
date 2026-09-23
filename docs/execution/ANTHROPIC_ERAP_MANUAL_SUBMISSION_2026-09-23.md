# Anthropic External Researcher Access — manual submission runbook (2026-09-23)

Route: `anthropic-external-researcher-access-2026`  
Project: Hardware-Splicer  
Mode: **manual human form fill**  
Submission authority: human only

## Current official program facts

Verified from Anthropic's current External Researcher Access Program help page on 2026-09-23:

- program scope is AI safety / alignment research that Anthropic considers high priority;
- successful applicants receive **US$1,000 in API credits** by default, with rare higher allocations;
- submissions are evaluated on the **first Monday of each month**;
- credits apply to the standard model suite, not Claude web subscriptions;
- the program does not provide nonpublic/experimental-model access;
- participation does not exempt the account from Anthropic's Usage Policy;
- the official page links the Google Form already stored in the opportunity manifest.

At the current date, the next nominal review day under that published cadence is **2026-10-05**. This is a cadence inference, not a guaranteed submission deadline.

## Why this route no longer needs automated portal recon

The application packet itself is complete enough for a human to fill the live form directly. The exact Google Form labels and character limits are not publicly inspectable through our normal retrieval path, so Gauntlet must not invent them.

The correct boundary is:

1. human opens the official form;
2. human maps each live prompt to the semantic section below;
3. paste/adapt only the frozen copy;
4. if a live prompt asks for information not covered here, stop and record that prompt rather than fabricating an answer;
5. human performs eligibility/terms/final-submit gates.

## Semantic fill map

Use these sections from Hardware-Splicer's frozen FIRE copy.

### Project / research title

**Testing Evidence and Authorization Checks for Tool-Using Agents**

### Research topic / project summary

Use the section:

`Anthropic External Researcher Access Program — Agent-Control Study -> Final research summary`

Keep the framing narrow:
- tool-using agent control;
- incomplete/stale/contradictory evidence;
- external checks;
- advisory/dry-run reference condition;
- no claim of general alignment solution.

### Why this is AI safety / alignment research

Use:

`Why this is AI safety research`

The strongest one-sentence version is:

> The study asks whether simple checks outside the model can stop weakly supported agent decisions from turning into actions while still leaving the agent useful.

### Team / researcher

Use the frozen team description. Do not add faculty/lab/institutional sponsorship unless it is actually part of the application.

### Planned API use

Core currently versioned as:
- Claude Sonnet 5: 200 scored runs;
- Claude Opus 5: 100 confirmatory runs;
- small unscored pilot first;
- matched frozen corpus/protocol across conditions.

### Expected outputs

Use the six-item frozen outputs section:
- matched-condition benchmark results;
- failure/control taxonomy;
- quantitative summaries;
- versioned artifacts/traces where policy permits;
- negative/failure results;
- technical report / paper draft.

### Credits / resource request

If the form asks only why credits are needed:
- repeated matched evaluations;
- 300 scored runs plus a small pilot;
- university-affiliated project without a large dedicated API budget.

If it asks for an amount, do **not** inflate to the program maximum merely because the current default award is US$1,000. Use the protocol's actual estimated need or state that the standard program allocation is sufficient if that is true at submission time.

## Model freshness gate

Anthropic released **Claude Opus 5.5 on 2026-09-22**, after the frozen September 7 packet was written.

Do not silently replace Opus 5 in the preregistered design.

Before submission choose one:

### Option A — preserve protocol comparability

Keep:
- Sonnet 5 primary;
- Opus 5 confirmatory.

Record that the experiment intentionally preserves the frozen model pair.

### Option B — version the protocol before scored execution

Create a successor protocol revision replacing Opus 5 with Opus 5.5, then update:
- model identifier;
- budget estimate;
- protocol revision;
- submission copy;
- eventual scored-run manifest.

Do this only if the cost/capability improvement materially justifies the protocol change.

No scored runs may mix the two designs without declaring separate cohorts.

## Human-only gates

The human must personally handle:
- Google/Anthropic account login if requested;
- eligibility assertions;
- exact project dates if requested;
- any organization/account identifier;
- any terms or policy attestation;
- final submit.

Gauntlet may prepare copy but must not fabricate these values or claim submission.

## Stop conditions

Stop before submission if the live form:
- requires an eligibility fact we have not established;
- asks for a collaborator/faculty sponsor that is not real;
- requires a model/access category outside the standard suite;
- asks for a claim that would imply physical correctness or live Claude benchmark results already exist;
- presents materially changed program terms.

## Receipt

After human submission, record:
- submission date/time;
- form/program name;
- any confirmation text or receipt;
- protocol/model version actually requested;
- Claude Console organization ID only in an appropriate private location if required; do not commit secrets or credentials.
