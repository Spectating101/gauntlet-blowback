# Blowback

**Local-first gauntlet entry automation for finished projects.**

Blowback is a JavaScript + Playwright operator for competitions, grants, hackathons, conferences, fellowships, awards, and other external-validation routes.

It exists for one reason: once the underlying project is finished, repeated portal clerical work should not become another development campaign.

```text
canonical profile + project evidence + opportunity manifest
                         ↓
                    validate/plan
                         ↓
                  Playwright prepare
                         ↓
             screenshots + run record
                         ↓
                    HUMAN GATE
                         ↓
                    final submit
```

## v0 safety boundary

Blowback **does not autonomously submit entries**.

`inspect` locates fields without mutating them. `prepare` may fill fields and upload declared files, but every manifest must retain `final_submit` as an explicit human gate. Login, 2FA, CAPTCHA, eligibility/originality/authorship attestations, terms, payments, adviser/team confirmations, and ambiguous questions remain human-controlled.

The system does not bypass anti-bot controls and does not fabricate eligibility.

## Quick start

Requires Node.js 20+.

```bash
npm install
npx playwright install chromium

npm run validate
npm run plan

# Open a real portal in a visible browser and inspect mappings
npm run blowback -- run examples/opportunities/animalhack-2026.json
```

The checked-in AnimalHack manifest starts in `inspect` mode on purpose. Switch an opportunity to `prepare` only after its field map is verified against the live portal.

## Repository layout

```text
src/
  adapters/        thin Playwright portal adapters
  commands/        executable workflows
  core/            load/validate/resolve/plan/record/browser primitives
examples/
  profiles/        canonical applicant data examples
  projects/        canonical project evidence examples
  opportunities/   venue-specific manifests
submission-records/  local run evidence (git-ignored)
.auth/                local Playwright storage state (git-ignored)
docs/
```

## Commands

```bash
node src/cli.mjs validate <opportunity.json|yaml>
node src/cli.mjs plan <opportunity.json|yaml>
node src/cli.mjs run <opportunity.json|yaml>
node src/cli.mjs run <opportunity.json|yaml> --persist-auth
```

`--persist-auth` writes Playwright storage state under `.auth/<portal>.json`. Treat that file as a credential; never commit it.

## Manifest philosophy

Blowback keeps browser automation dumb.

The browser adapter should not invent application prose or decide eligibility. It consumes explicit values from three sources:

- **profile** — applicant identity/affiliation boilerplate;
- **project** — canonical title, pitch, evidence, repo/demo links, limitations;
- **opportunity** — venue URL, direct-control state, required fields/uploads, human gates, and portal mapping.

This keeps entry preparation auditable and makes it possible to diff what changed between two submissions.

## Portal strategy

v0 ships one generic accessible-form engine. `devpost`, `easychair`, and `openreview` initially route through it rather than pretending we know every live portal DOM in advance.

When a real FIRE entry exposes repeated portal-specific behavior, add the smallest adapter necessary. Playwright codegen can help capture the first interaction, but generated selectors should be cleaned up into accessible locators where possible.

## Tests

```bash
npm run check
```

Core tests verify manifest resolution and the non-submission contract. Browser CI launches Chromium against a local fixture and proves Blowback fills mapped fields without clicking the form's Submit button.

## Non-goals

- universal autonomous web agent;
- CAPTCHA/2FA bypass;
- automatic legal attestations;
- automatic payment;
- inventing teammates/advisers/affiliations;
- opportunity discovery/ranking in v0;
- another frontend/SaaS product.

Blowback is clerical infrastructure: **make gauntlet entries boring, reproducible, and cheap.**
