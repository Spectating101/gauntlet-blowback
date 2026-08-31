# Blowback

**Local-first conversion automation for finished portfolio assets.**

Blowback is a JavaScript + Playwright/Codex mission substrate for competitions, grants, sponsorships, fellowships, research residencies, lab recruitment, RAs, predocs, research jobs, PhDs, institutional pilots, conferences, awards, and other external-conversion routes.

It exists for one reason: once the underlying project is credible, repeated discovery, eligibility recon, packet projection, portal clerical work and follow-up should not become another development campaign.

```text
portfolio evidence
      ↓
Radar discovery + official-source verification
      ↓
Gauntlet master + G0–G6 gates
      ↓
truthful route-specific projection
      ↓
mission / application compiler
      ↓
Codex + authenticated Chrome / bounded Playwright
      ↓
recon → fill → upload → save draft
      ↓
protected gate OR explicitly-authorized safe submit/send
      ↓
receipt + outcome ledger
```

## Safety and authority boundary

The deterministic Playwright `run` command **never performs final submission**. It remains a bounded inspect/prepare mechanism for already-mapped portals.

The adaptive application-mission layer can optionally receive explicit runtime authority with `--submit-if-safe`. That flag releases only the final submit/send action and only for application-like routes already in a fire/ready posture with no known material gate. Runtime discovery of any protected condition still forces `WAITING_HUMAN`.

Protected conditions include:

- CAPTCHA;
- required OTP/2FA/password choice;
- legal/privacy/terms consent;
- eligibility, originality or authorship attestations;
- payment/purchase/fees;
- adviser/team/partner/host commitments;
- unresolved work authorization or visa answers;
- unresolved IP/moonlighting/outside-work terms;
- any material question that cannot be answered from verified canonical evidence.

The system does not bypass anti-bot controls and does not fabricate eligibility, credentials, evidence, experience or external validation.

## Quick start

Requires Node.js 20+.

```bash
npm install
npx playwright install chromium

npm run check
npm run gauntlet:master

# Broad Gauntlet mission
npm run mission:next

# Highest-priority job/lab/predoc/fellowship/residency application
npm run application:next

# Top application queue
npm run application:queue

# Explicit runtime authority for safe final submit/send
npm run blowback -- apply-next --submit-if-safe
npm run blowback -- apply-queue --limit=20 --submit-if-safe
```

For mapped deterministic manifests:

```bash
npm run validate
npm run plan
npm run blowback -- recon examples/opportunities/animalhack-2026.json --stage=source
npm run blowback -- run examples/opportunities/animalhack-2026.json
```

Older manifests remain in `inspect` mode on purpose. Switch an opportunity to `prepare` only after its real route and field/upload map have been verified and its `execution_state` is at least `PORTAL_MAPPED`.

## Repository layout

```text
src/
  adapters/        bounded Playwright field/recipe adapters
  application/     job/lab/predoc/fellowship/residency application missions
  commands/        executable workflows and reconnaissance
  core/            load/validate/resolve/plan/record/browser primitives
  mission/         portfolio-wide Codex+Chrome mission operator
  radar/           open-web, source-family and structured opportunity discovery
examples/
  profiles/        repo-safe canonical applicant data examples
  projects/        canonical project evidence examples
  opportunities/   venue-specific manifests
  radar/            discovery policies, scopes and source registries
submission-records/  local run evidence (git-ignored)
.auth/                local Playwright storage state (git-ignored)
.blowback/             local mission/checkpoint state (git-ignored)
docs/
```

## Commands

```bash
node src/cli.mjs next
node src/cli.mjs mission <route-id>
node src/cli.mjs apply-next [--submit-if-safe]
node src/cli.mjs apply <route-id> [--submit-if-safe]
node src/cli.mjs apply-queue [--limit=N] [--submit-if-safe]
node src/cli.mjs checkpoint <checkpoint.json>
node src/cli.mjs validate <opportunity.json|yaml>
node src/cli.mjs plan <opportunity.json|yaml>
node src/cli.mjs recon <opportunity.json|yaml> --stage=source|registration|submission
node src/cli.mjs run <opportunity.json|yaml>
```

`--persist-auth` is available for `recon`/`run` and writes Playwright storage state under `.auth/<auth-scope>.json`. Storage-state files are credentials and must never be committed.

`plan` and deterministic `inspect` redact resolved field values by default.

## Application Autopilot

Application routes are compiled by market rather than flattened into a generic resume blast.

- **Job:** resume/CV + portfolio + role-specific claim projection.
- **Research job / Research Engineer:** adds technical evidence packet.
- **Lab / RA:** adds research-interest note and strongest relevant project evidence.
- **Predoc:** adds empirical research sample and code/data/reproducibility evidence.
- **Fellowship:** adds program-specific statement and bounded research/project agenda.
- **Residency:** adds research agenda, technical evidence and availability/location facts.
- **PhD/faculty pull:** adds research statement, academic evidence and faculty/program fit.

Routes with unresolved eligibility or portal facts start at `RECON`; verified fire/ready routes start at `PREPARE`.

The objective is not application count. The objective is conversion of real evidence into cash, funded research, interviews, offers, institutional relationships and post-graduation options.

See `docs/APPLICATION_AUTOPILOT.md`.

## Private profile data

The checked-in profile is a non-sensitive baseline. A box can overlay private portal data at runtime without putting it in Git:

```bash
export BLOWBACK_PROFILE_FILE=/secure/path/profile.local.json
```

The local JSON/YAML object is shallow-merged over the repo profile. `*.local.json`, `*.local.yaml`, and `*.local.yml` are git-ignored. Passwords and browser cookies still do not belong in that profile file.

## Manifest philosophy

Applications should not be rewritten from memory.

The operator consumes explicit values from:

- **profile** — applicant identity/affiliation boilerplate, optionally overlaid locally with private fields;
- **project** — canonical title, pitch, evidence, repo/demo links and limitations;
- **opportunity/Gauntlet route** — source, deadline, economics, execution state, gates and verified route facts.

Canonical claim status remains authoritative:

- `PROVEN` — may be projected with evidence references;
- `INFERRED` — may appear only with inference status preserved;
- `UNPROVEN` — excluded from external application projections.

## Portal strategy

There are two complementary execution mechanisms.

### Bounded deterministic Playwright

The generic and recipe adapters are useful for verified portal mappings and regression/replay. Recipes execute declared steps only and protected commitment controls remain refused.

### Adaptive Codex + Chrome missions

Novel portals are normal. The mission operator supplies strategy, evidence boundaries, permissions, checkpoints and receipts while Codex performs adaptive navigation in the authenticated browser.

Do not hardcode a new adapter for every website. Promote repeated mechanics only when evidence shows a reusable helper has value.

Portal readiness remains separate from campaign readiness:

```text
RESEARCH_ONLY
  -> PACKET_READY
  -> PORTAL_RECON_REQUIRED
  -> PORTAL_MAPPED
  -> PREPARE_VERIFIED
  -> HUMAN_SUBMIT_READY
  -> SUBMITTED
```

## Conversion control plane

The control plane covers normal employment and the hidden research-labor market as well as competitions and grants.

Supported application-oriented classes include:

- `job`
- `research_assistant`
- `research_staff`
- `research_engineer`
- `research_officer`
- `technical_associate`
- `project_staff`
- `predoc`
- `research_fellowship`
- `research_residency`
- `policy_fellowship`
- `funded_visiting`
- `faculty_pull`
- `phd`

Alongside grants, sponsorships, competitions, pilots, commercial and research routes.

It preserves the `$0` / `$POST` / `$UPFRONT` doctrine, refuses `READY` when required evidence is missing, and prevents projections from silently upgrading claims.

See `docs/CONVERSION_CONTROL_PLANE.md`.

## Opportunity Radar

Radar now has multiple discovery layers:

1. **open-web discovery** — bounded multilingual portfolio × opportunity queries to find ecosystems Radar has never seen;
2. **source-family crawling** — recurring high-yield lab/university/research-job boards;
3. **known-program monitoring** — named fellowships, residencies and grant pages;
4. **structured APIs** — e.g. Grants.gov.

Search hits remain `DISCOVERY_ONLY`. They cannot become `ELIGIBLE`, `READY` or submit-authorized merely because a search snippet looks relevant. Official-source hydration and Gauntlet verification remain required.

Research-labor vocabulary includes Research Assistant, Research Engineer, Research Officer, Predoc, Research Professional, Technical Associate, Project Staff, Fellow, Resident, Visiting Researcher, Join Us/Openings and Traditional-Chinese equivalents.

## Tests

```bash
npm run check
npm run test:browser
```

Core tests cover manifest resolution, application-route compilation, explicit submit-if-safe authority, protected-gate preservation, Radar discovery, execution-state gating, auth isolation, private-profile overlay and redacted planning. Browser tests cover deterministic reconnaissance/preparation and continue to prove the direct Playwright runner never clicks final Submit.

## Non-goals

- CAPTCHA/2FA bypass;
- automatic legal/privacy/authorship/eligibility attestations;
- automatic payment;
- autonomous password/account creation;
- inventing teammates/advisers/affiliations/credentials/evidence;
- indiscriminate spray-and-pray applications;
- pretending search snippets are verified opportunity facts;
- another frontend/SaaS product before conversion volume requires it.

Blowback is conversion infrastructure: **discover broadly, verify strictly, project truthfully, make applications boring, and collect receipts.**
