# Conversion Operator v1

## Purpose

Blowback is no longer only a portal preparer. Conversion Operator v1 turns the portfolio into an evidence-bounded campaign queue:

```text
Radar discovery
  -> source hydration / verification
  -> project match
  -> dependency resolution
  -> claim-safe dossier
  -> REJECT / HOLD / READY
  -> reversible preparation
  -> HUMAN GATE
  -> external outcome receipt
  -> reviewed evidence feedback
```

The design goal is maximum autonomy over reversible work and minimum autonomy over irreversible commitments.

## Autonomous work

The operator may automatically:

- archive source metadata;
- hydrate and verify opportunity facts;
- reconcile project evidence;
- build truthful claim projections;
- generate application/grant/sponsorship/pilot dossiers;
- draft outreach and application answers;
- prepare partner/sponsor contact packets;
- prepare mapped portal fields/uploads after the opportunity is READY;
- maintain a deadline-prioritized portfolio conversion queue;
- ingest external outcomes as review-required receipts.

## Mandatory human gates

The operator must not autonomously:

- click final Submit or send consequential outreach;
- spend money or accept paid terms;
- create legal attestations;
- fabricate eligibility, affiliation, evidence, team/adviser state or partner consent;
- bypass CAPTCHA/2FA/anti-bot controls;
- promote an external verdict into unrelated technical truth.

A future connector may automate a reversible draft or preparation step only if the same boundary remains explicit.

## Dependencies

Campaigns represent real conversion blockers as typed dependencies:

- partner;
- legal entity;
- credential;
- evidence;
- payment;
- legal attestation;
- adviser/team;
- publication;
- account;
- other.

States are `SATISFIED`, `OPEN`, or `BLOCKED`. Open dependencies surface in the human-attention queue instead of silently becoming rejection or fabricated completion.

## Campaign states

- `READY_TO_PREPARE` — evidence/fit/cost rules pass and no open dependency remains;
- `DEPENDENCY_REQUIRED` — a real partner/entity/etc. dependency remains;
- `VERIFICATION_REQUIRED` — the conversion policy still HOLDs the opportunity;
- `BLOCKED` — an explicit dependency is blocked;
- `REJECTED` — eligibility/policy rejects it;
- `INVALID` — malformed or unsupported dossier.

## External feedback

`ingestExternalOutcome()` creates an appendable external receipt. A grant win, interview, acceptance, rejection, sponsor reply or pilot offer is evidence about that external event only. The receipt is `UNREVIEWED` for project-claim purposes until a human or project-specific evidence process decides what, if anything, it legitimately changes.

## Operating doctrine

Once this layer is stable, new Blowback engineering should be earned by real campaign friction.

Examples:

- repeated partner-host blockers -> add a partner dependency adapter;
- repeated NLnet fields -> add a minimal NLnet preparer;
- recurring sponsorship obligations -> enrich sponsorship metadata;
- repeated outcome-import work -> add source-specific receipt ingestion.

Do not build a universal CRM, autonomous legal agent, universal web crawler or spray-and-pray submitter.

The mature unit of work is a campaign, not a new feature.
