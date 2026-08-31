# Codex + Chrome Mission Operator

## Purpose

Blowback does **not** try to hardcode every portal.

The repo provides the portfolio queue, application policy, state, evidence boundaries, permissions, checkpoints and receipts. Codex supplies adaptive reasoning. Chrome supplies the authenticated live browser.

```text
Radar / Gauntlet Master
        ↓
blowback next
or blowback apply-next
        ↓
Codex browser/application mission
        ↓
Codex + Chrome extension
        ↓
arbitrary live portal / lab outreach workflow
        ↓
checkpoint / protected gate / receipt
        ↓
Gauntlet state + outcome ledger
```

## Two mission modes

### Portfolio mission

```bash
npm run blowback -- next
```

Emits the highest-priority general Gauntlet route across competitions, grants, jobs, papers, fellowships, research routes and other conversion lanes.

### Application mission

```bash
npm run blowback -- apply-next
npm run blowback -- apply <route-id>
npm run blowback -- apply-queue --limit=20
```

Application missions are specialized for jobs, lab/RA recruitment, predocs, research jobs, fellowships, residencies, funded visiting programs and PhD/faculty-pull routes.

They add:

- application market/kind;
- route-specific packet profile;
- evidence-family projection;
- portal vs outreach channel inference;
- `RECON` vs `PREPARE` stage;
- follow-up/receipt requirements.

## Non-goal: portal hardcoding

A novel website is normal. The operator should not require a checked-in selector map, recipe or adapter before attempting it.

Do not turn one successful application into code such as:

```text
if portal == workday:
  click('#apply')
```

unless repeated evidence shows that a small reusable helper has real value. Even then, the helper remains an optimization, not the source of browser intelligence.

Playwright reconnaissance/recipes remain useful for observation, deterministic replay and safety regression tests. They are not the primary navigation architecture for arbitrary new opportunities.

## Mission contract

`npm run blowback -- next` emits `blowback.codex_browser_mission.v1`.

Application commands emit `blowback.application_mission.v1` or `blowback.application_queue.v1`.

A mission contains:

- strategic route state;
- starting official/source URL;
- adaptive-browser requirement;
- actions Codex may perform automatically;
- questions Codex must resolve from canonical evidence before asking the user;
- protected gates;
- previous checkpoint state when available;
- for application missions, packet profile, application stage, channel and follow-up contract.

The normal browser objective is:

> Advance the route through the live workflow to the last safe state supported by verified evidence and current runtime authority.

Do not invent a project result, credential, eligibility fact, salary, publication, user/adoption claim or material application answer.

## Permission model

### Reversible navigation — AUTO

Codex may independently follow relevant links, redirects, tabs, Next/Continue/Back/Open/Edit actions, inspect instructions, recover sessions and use the existing signed-in Chrome state.

### Reversible application state — AUTO

Codex may:

- fill canonical factual fields;
- make unambiguous mechanical selections;
- upload existing designated files;
- select route-specific evidence from canonical packets;
- draft a bounded role/research note from `PROVEN` claims;
- answer questions already resolved by the verified profile or route evidence;
- download instructions/templates;
- save drafts;
- capture application status and follow-up dates.

### Resolve before asking

Codex should consult the Gauntlet and canonical project evidence before asking about category/track, title, affiliation, dates, previously established eligibility facts, designated files or existing project evidence.

## Final submit/send authority

Default application missions keep final submit/send protected:

```bash
npm run blowback -- apply-next
```

For a run where the user explicitly authorizes final submit/send when safe:

```bash
npm run blowback -- apply-next --submit-if-safe
npm run blowback -- apply <route-id> --submit-if-safe
npm run blowback -- apply-queue --limit=20 --submit-if-safe
```

This runtime flag does **not** remove the other protected gates.

The operator must still stop for:

- CAPTCHA;
- required 2FA/OTP/password choice;
- legal/privacy/terms consent;
- eligibility/originality/authorship attestations;
- payment/purchase;
- adviser/team/partner/host commitments;
- unresolved work authorization/visa questions;
- unresolved IP/moonlighting/outside-work terms;
- material questions not answerable from verified evidence;
- destructive actions.

If a route is `FIRE_AFTER_GATE`, `VERIFY`, `HOLD`, `WATCH`, eligibility-recon-required, or otherwise carries a known material dependency, `--submit-if-safe` does not promote it into an autonomous submission.

## Checkpoints

Create a checkpoint JSON such as:

```json
{
  "mission_id": "mission:job-example",
  "route_id": "job-example",
  "status": "WAITING_HUMAN",
  "stage": "FINAL_REVIEW",
  "current_url": "https://portal.example/review",
  "visited_urls": ["https://portal.example/start"],
  "completed_actions": ["profile completed", "CV uploaded", "draft saved"],
  "unresolved_items": [],
  "human_required": ["work authorization answer", "privacy declaration"]
}
```

Then persist it with:

```bash
npm run blowback -- checkpoint /path/to/checkpoint.json
```

Checkpoints live under `.blowback/missions/` and are git-ignored. The validator refuses obvious secret-bearing keys such as passwords, OTPs, card data, API keys and tokens.

## Resume behavior

Mission operators read local route checkpoints. Terminal routes (`SUBMITTED`, `ABANDONED`, `EXPIRED`) are excluded from dispatch. Non-terminal routes carry their previous stage/current URL/completed work into the next mission so Codex can resume rather than reconstructing the application from scratch.

`WAITING_HUMAN` routes do not freeze the rest of the queue; another application can continue while one route waits on a protected fact or action.

## Receipts and follow-up

A successful application run should preserve, when observable:

- canonical opportunity URL;
- submitted artifact/version references;
- application/receipt ID;
- submitted timestamp;
- confirmation page/email/PDF evidence;
- next expected event or response window;
- later screen/interview/rejection/offer outcome.

No receipt means no `SUBMITTED` claim.

## Intended operator experience

General Gauntlet:

> Run `blowback next`, execute the mission in Chrome, checkpoint meaningful progress, and continue through the queue.

Application campaign:

> Run `blowback apply-queue`, execute the highest-value application missions using canonical evidence, stop on protected gates, capture receipts, and continue. When explicit runtime authority is supplied, submit/send only routes that remain safe after live inspection.

The repo is the mission/state substrate. Codex is the adaptive navigator. Chrome is the authenticated execution surface.
