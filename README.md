# Blowback

**Local-first gauntlet entry automation for finished projects.**

Blowback is a JavaScript + Playwright operator for competitions, grants, sponsorships, fellowships, institutional pilots, hackathons, conferences, awards, and other external-validation routes.

It exists for one reason: once the underlying project is finished, repeated portal clerical work should not become another development campaign.

```text
canonical profile + project evidence + opportunity manifest
                         ↓
                    validate/plan
                         ↓
                portal reconnaissance
                         ↓
              human-verified route map
                         ↓
               Playwright preparation
                         ↓
             screenshots + run record
                         ↓
                    HUMAN GATE
                         ↓
                    final submit
```

## Safety boundary

Blowback **does not autonomously submit entries**.

`recon` observes an unknown route without filling or clicking and never promotes its own candidate links into executable mappings. `inspect` checks an already-declared map on the current page. `prepare` may fill ordinary fields, upload declared files, and follow explicitly verified reversible navigation, but every manifest must retain `final_submit` as an explicit human gate.

Passwords, OTP/2FA, CAPTCHA, eligibility/originality/authorship attestations, privacy/terms/consent controls, payments, adviser/team confirmations, and final submission remain human-controlled. The execution adapters refuse protected controls rather than trusting a bad recipe to classify them as safe.

The system does not bypass anti-bot controls and does not fabricate eligibility.

## Quick start

Requires Node.js 20+.

```bash
npm install
npx playwright install chromium

npm run validate
npm run plan

# Observe a declared source/registration/submission stage without mutation
npm run blowback -- recon examples/opportunities/animalhack-2026.json --stage=source

# Inspect/prepare only after a route map has been verified
npm run blowback -- run examples/opportunities/animalhack-2026.json
```

Older manifests remain in `inspect` mode on purpose. Switch an opportunity to `prepare` only after its real route and field/upload map have been verified and its `execution_state` is at least `PORTAL_MAPPED`.

## Repository layout

```text
src/
  adapters/        bounded Playwright field/recipe adapters
  commands/        executable workflows and reconnaissance
  core/            load/validate/resolve/plan/record/browser primitives
  radar/           opportunity discovery, normalization and ranking
examples/
  profiles/        repo-safe canonical applicant data examples
  projects/        canonical project evidence examples
  opportunities/   venue-specific manifests
  radar/            discovery scopes and funding-source configuration
submission-records/  local run evidence (git-ignored)
.auth/                local Playwright storage state (git-ignored)
docs/
```

## Commands

```bash
node src/cli.mjs validate <opportunity.json|yaml>
node src/cli.mjs plan <opportunity.json|yaml>
node src/cli.mjs recon <opportunity.json|yaml> --stage=source|registration|submission
node src/cli.mjs recon <opportunity.json|yaml> --stage=registration --persist-auth
node src/cli.mjs run <opportunity.json|yaml>
node src/cli.mjs run <opportunity.json|yaml> --persist-auth
```

`--persist-auth` writes Playwright storage state under `.auth/<auth-scope>.json`. Manifests should declare an explicit `auth_scope` for a specific portal/account scope; otherwise Blowback derives it from the route host. Storage-state files are credentials and must never be committed.

`plan` and `inspect` redact resolved field values by default.

## Private profile data

The checked-in profile is a non-sensitive baseline. A box can overlay private portal data at runtime without putting it in Git:

```bash
export BLOWBACK_PROFILE_FILE=/secure/path/profile.local.json
```

The local JSON/YAML object is shallow-merged over the repo profile. `*.local.json`, `*.local.yaml`, and `*.local.yml` are git-ignored. Passwords and browser cookies still do not belong in that profile file.

## Manifest philosophy

Blowback keeps browser execution dumb.

The browser adapter should not invent application prose, decide eligibility, or discover a route while preparing it. It consumes explicit values from three sources:

- **profile** — applicant identity/affiliation boilerplate, optionally overlaid locally with private fields;
- **project** — canonical title, pitch, evidence, repo/demo links, limitations;
- **opportunity** — source/registration/submission routes, execution state, required fields/uploads, human gates, and verified portal mapping/recipe.

This keeps entry preparation auditable and makes it possible to diff what changed between two submissions.

## Portal strategy

The first execution layer has two bounded mechanisms:

- the generic accessible-form adapter for a single mapped page;
- the deterministic `recipe` adapter for verified multi-page flows such as fill → Next → upload → stop at human gate.

The recipe adapter is not an autonomous browser agent. It only executes declared steps, only clicks when `safe_navigation: true`, and still refuses consequential-looking controls such as Submit, payment, account creation, privacy/consent, or attestations.

When a real FIRE entry exposes repeated portal-specific behavior, add the smallest family adapter or recipe generator necessary. Do not build a universal improvising browser.

**Execution readiness is separate from campaign readiness.** A `READY`/`FIRE` opportunity is not automatically browser-executable until its real registration/submission route and field/upload map have been inspected and verified.

Portal readiness states are:

```text
RESEARCH_ONLY
  -> PACKET_READY
  -> PORTAL_RECON_REQUIRED
  -> PORTAL_MAPPED
  -> PREPARE_VERIFIED
  -> HUMAN_SUBMIT_READY
  -> SUBMITTED
```

See `docs/PORTAL_RECON_V1.md` for the runtime contract and `docs/PORTAL_EXECUTION_AUDIT_2026-08-26.md` for the live-portal audit and box-deployment acceptance tests.

## Conversion control plane

A stacked follow-up keeps the browser operator separate from the shared opportunity/evidence layer for jobs, PhDs, competitions, grants, sponsorships, fellowships, institutional pilots, incubators, commercial leads, and research routes.

```text
Spectator research / verification
             ↓
canonical opportunity dossier
             ↓
REJECT | HOLD | READY
             ↓
truthful claim/evidence projection
             ↓
Blowback recon / inspect / prepare
             ↓
          HUMAN GATE
             ↓
external outcome ledger
```

It preserves the `$0` / `$POST` / `$UPFRONT` gauntlet doctrine, refuses `READY` when required evidence is missing, and prevents application projections from promoting `INFERRED` or `UNPROVEN` claims into `PROVEN` facts.

See `docs/CONVERSION_CONTROL_PLANE.md` for the full contract.

## Opportunity Radar

The Radar is a discovery/recall layer, not semantic authority. The existing collector uses the public Grants.gov API and then project-scopes/ranks candidates. Funding Radar v1 extends the shared opportunity ontology so non-grant routes can be represented explicitly:

- `grant`
- `sponsorship`
- `fellowship`
- `institutional_pilot`

`examples/radar/funding-scope-v1.json` is the funding-oriented portfolio scope. A source-specific detector may discover a candidate, but a candidate still must be hydrated and verified before conversion policy can produce `READY`.

## Tests

```bash
npm run check
npm run test:browser
```

Core tests cover manifest resolution, execution-state gating, auth isolation, private-profile overlay and redacted planning. Browser tests prove reconnaissance is non-mutating, ordinary mapped fields can be prepared, protected controls are refused, verified reversible navigation can cross pages, uploads work, and the final Submit control is never clicked.

## Non-goals

- universal autonomous web agent;
- CAPTCHA/2FA bypass;
- automatic legal/privacy/authorship attestations;
- automatic payment;
- autonomous account/password creation;
- inventing teammates/advisers/affiliations;
- autonomous opportunity discovery/ranking inside the browser operator;
- spray-and-pray job/PhD applications;
- another frontend/SaaS product.

Blowback is conversion infrastructure: **make external applications boring, reproducible, truthful, and cheap.**
