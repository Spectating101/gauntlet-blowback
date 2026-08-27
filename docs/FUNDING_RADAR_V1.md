# Funding Radar v1

## Purpose

Funding Radar v1 extends the Opportunity Radar from a Grants.gov-only discovery experiment into a broader project-funding surface while preserving the conversion control plane's evidence boundaries.

It exists to answer a narrower question than `READY`:

> Which credible funding mechanisms or calls are worth verifying against the current portfolio?

It does not answer:

> Are we eligible, funded, or authorized to submit?

Those remain downstream dossier and human-gate questions.

## Opportunity classes

Funding-facing routes are represented separately:

- `grant` — proposal reviewed for a bounded award/subgrant;
- `sponsorship` — one-off or recurring support for a project/maintainer, including fiscal-sponsorship mechanisms;
- `fellowship` — support attached primarily to an individual/researcher rather than only a project entity;
- `institutional_pilot` — bounded funded or in-kind deployment/evaluation with an institution.

These classes intentionally do not collapse into one funding score. Their obligations, legal dependencies and evidence requirements differ.

## Source model

### Grants.gov

The existing source adapter remains the structured federal-grant collector. It can hydrate applicant types and award metadata from the official API.

### Funding-page monitor

Many high-value project-funding routes expose public web pages but no stable machine API. `src/radar/sources/funding-page.mjs` provides a deliberately conservative monitor for known pages.

The registry supplies semantic facts such as:

- title;
- opportunity type;
- organization;
- declared deadline;
- known eligibility text;
- known funding metadata;
- project-domain tags.

The live page contributes only:

- source reachability;
- retrieval timestamp;
- configured open-marker presence;
- configured closed-marker presence.

The monitor **does not scrape prose into eligibility, award amounts or READY state**. This is intentional. A brittle HTML parser must not become semantic authority.

## Seed registry

`examples/radar/funding-source-registry.json` currently demonstrates four materially different routes:

1. NLnet project grants — digital commons / open internet;
2. TWNIC Community Grants — Taiwan Internet project funding;
3. GitHub Sponsors — maintainer/project sponsorship mechanism;
4. Open Source Collective — fiscal sponsorship for qualifying open-source projects.

These are examples and starting points, not a claim of comprehensive funding coverage.

## Portfolio scope

`examples/radar/funding-scope-v1.json` adds/refines funding identities for:

- Hardware-Splicer;
- Nocturnal;
- Public-Good Control;
- Cite-Agent;
- YZU-Cluster;
- Refinery / Generative Software Commons;
- Policy Lab;
- Sharpe-Terminus;
- Invisible Ledger.

Refinery is intentionally described through the newer open-source infrastructure / software commons / supply-chain provenance face rather than only the older agentic-software framing.

## Conversion boundary

A funding candidate flows through:

```text
source discovery / monitor
        ↓
normalized opportunity
        ↓
portfolio match
        ↓
source-specific hydration + manual/connected verification
        ↓
canonical opportunity dossier
        ↓
REJECT | HOLD | READY
        ↓
Blowback prepare
        ↓
HUMAN GATE
```

A match score must never substitute for:

- legal/applicant eligibility;
- geographic eligibility;
- partner/institution dependency;
- source-rights/open-license obligations;
- IP/exclusivity review;
- cost or matching-fund requirements;
- real award amount;
- deadline verification.

## Accessibility model

Funding accessibility should be tracked as separate facts, not one score:

- `applicant_form`: individual / unincorporated project / legal entity / university / company / nonprofit;
- `geography`: unrestricted / preferred region / hard region restriction;
- `legal_host_required`: yes / no / conditional;
- `open_license_required`: yes / no / conditional;
- `matching_funds_required`: yes / no / unknown;
- `support_mode`: cash / recurring cash / compute / hardware / travel / services;
- `commitment_mode`: one-off / recurring / milestone;
- `obligations`: reporting / branding / exclusivity / IP / publication / acknowledgement;
- `selection_mode`: open call / direct pitch / sponsor profile / nomination / invitation.

Future source-specific hydrators may populate these fields only when directly supported by source evidence.

## Stop rule

Do not turn Funding Radar into a universal crawler or fundraising CRM.

The next source adapter should be added only when a real portfolio route repeatedly matters and cannot be represented reliably through the existing registry/monitor or structured API path.
