# Application Autopilot

## Purpose

The Gauntlet should not stop at discovering good jobs, labs, predocs, fellowships, residencies or funded research programs.

For application-like routes, the intended control loop is:

```text
Radar discovery
    ↓
official-source verification
    ↓
Gauntlet route + G0–G6 gates
    ↓
application mission compiler
    ↓
route-specific packet projection
    ↓
Codex + authenticated Chrome
    ↓
recon → fill → upload → save draft
    ↓
submit/send if runtime authority + all dynamic safety checks pass
    ↓
receipt / application id / follow-up state
    ↓
outcome ledger
```

This is an application machine for the existing portfolio. It is not permission to invent experience, spam unrelated roles, or rewrite the portfolio to match every opening.

## Supported markets

The application compiler treats these as first-class routes:

- normal jobs;
- research jobs;
- Research Assistant / Research Staff / Project Staff;
- Research Engineer / Research Officer / Technical Associate;
- professor/lab direct recruitment and faculty-pull outreach;
- predocs / research professionals;
- research fellowships;
- policy fellowships;
- research residencies;
- funded visiting programs;
- funded PhD / faculty-pull routes.

Competitions, grants, procurement and commercial campaigns continue through the broader mission operator rather than being forced through the job-application packet model.

## Commands

Prepare the highest-priority application route:

```bash
npm run application:next
```

Prepare a bounded queue:

```bash
npm run application:queue
```

Inspect a specific route:

```bash
npm run blowback -- apply <route-id>
```

By default these commands prepare the application to the last safe state and preserve final submit/send as a human gate.

### Explicit submit-if-safe authority

For an execution run where the operator is authorized to perform final submit/send when no protected gate is present:

```bash
npm run blowback -- apply-next --submit-if-safe
npm run blowback -- apply <route-id> --submit-if-safe
npm run blowback -- apply-queue --limit=20 --submit-if-safe
```

The flag is deliberately runtime-scoped rather than permanently stored in the public repository.

`--submit-if-safe` does **not** authorize:

- inventing or guessing a material answer;
- accepting legal/privacy/terms declarations on the user's behalf;
- eligibility, originality or authorship attestations;
- fees, purchases or payment;
- CAPTCHA bypass;
- password/OTP/2FA handling beyond existing authenticated-session mechanics;
- adviser/team/partner/host commitments;
- unresolved work-authorization or visa answers;
- unresolved IP, moonlighting or outside-work terms;
- destructive actions.

If any of those appear, the mission stops at `WAITING_HUMAN` with the exact blocker preserved.

## Route-specific packet profiles

The application compiler does not flatten every route into `resume + generic cover letter`.

### Job

- canonical profile;
- resume/CV;
- portfolio index;
- role-specific truthful claim projection;
- concise cover note when useful.

### Research job / Research Engineer

Adds:

- technical evidence packet;
- project/repository evidence relevant to the demanded stack.

### Lab / RA

Adds:

- research-interest note;
- one or two strongest project evidence links;
- research/system evidence packet when appropriate.

### Predoc

Adds:

- research statement or research-oriented cover note;
- empirical research sample;
- code/data/reproducibility evidence.

### Fellowship

Adds:

- program-specific statement;
- bounded proposal/project agenda;
- writing sample only when actually required.

### Residency

Adds:

- research agenda;
- technical evidence packet;
- explicit availability/location facts.

### PhD / faculty pull

Adds:

- research statement;
- academic evidence;
- faculty/program fit note.

Every packet is a projection of existing claims and evidence. `UNPROVEN` claims remain excluded.

## Application stages

Application routes compile into one of two initial stages:

- `RECON` — material eligibility, portal, work-authorization, compensation or other application facts are unresolved;
- `PREPARE` — enough is verified to fill, upload, draft and save.

`--submit-if-safe` can only release final submit/send when the route is already in a fire/ready posture and its known gate text does not contain unresolved material dependencies.

Dynamic browser findings can still force `WAITING_HUMAN`.

## Follow-up contract

Every submitted application should preserve when observable:

- canonical source URL;
- exact role/program title;
- submitted artifact/version references;
- application/receipt ID;
- submission timestamp;
- confirmation screenshot/PDF/email where available;
- next expected event or stated response window;
- outcome state (`SCREEN`, `INTERVIEW`, `FINAL`, `REJECTED`, `OFFERED`, etc.);
- offered compensation/terms separately from advertised compensation.

No receipt means the Gauntlet must not claim `SUBMITTED`.

## Operating doctrine

The objective is not application count.

The objective is **conversion of true portfolio evidence into cash, funded research, interviews, offers, institutional relationships and post-graduation options**.

Prefer:

1. high fit;
2. verified eligibility;
3. high economic value or strong option value;
4. low marginal application work;
5. reusable packet evidence;
6. routes that improve future conversion even when rejected.

A small paid RA, short fellowship, research-engineering contract or funded project can outrank a prestigious but low-probability route when its expected realized value per hour is better.

Do not spray applications at materially mismatched roles merely because the operator can automate them.
