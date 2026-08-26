# Portal Execution Audit — 2026-08-26

Status: **BOX-DEPLOYMENT EXECUTION AUDIT**

This document records what Blowback can and cannot currently do when converting a verified Gauntlet campaign into a real external registration/submission workflow.

It is intentionally separate from the opportunity/gate audit. A campaign can be strategically `READY` while still lacking a verified browser-executable portal recipe.

## Executive conclusion

Blowback already has the right basic architecture for **prepare-to-human-gate** automation:

```text
canonical profile + project evidence + opportunity manifest
                         ↓
                    validate/plan
                         ↓
                authenticated browser
                         ↓
                inspect / prepare
                         ↓
             screenshots + run record
                         ↓
                    HUMAN GATE
                         ↓
                    final submit
```

However, the current campaign catalog and the current browser-executable catalog are not the same thing.

- The long-tail/post-grad boards contain a large campaign universe.
- `feat/conversion-operator-v1/examples/opportunities/` currently contains only the original AnimalHack browser manifest.
- Hardware-Splicer has six additional route manifests on `agent/hs-submission-routes-20260826`, but those deliberately remain `inspect` manifests until live portal maps are verified.
- No comparable browser manifests currently exist for the job/PhD board.

Therefore:

> **A local Blowback checkout can prepare a known mapped portal, but the repo cannot yet autonomously learn and execute an arbitrary Gauntlet entry from the campaign row alone.**

The correct near-term objective is not autonomous submission. It is:

> **campaign row → live portal reconnaissance → verified portal recipe → prepared form/files → human final-submit → receipt**

## What already works

### 1. Canonical data projection

Opportunity manifests resolve explicit values from:

- canonical applicant profile;
- canonical project evidence;
- opportunity-specific fields;
- declared upload files.

The browser layer therefore does not need to invent prose or eligibility facts.

### 2. Browser preparation

The generic Playwright adapter can:

- locate controls by role/name, label, placeholder, or explicit selector;
- fill text inputs;
- select options;
- check/uncheck boxes;
- upload declared files.

### 3. Authenticated local browser state

`openBrowser()` can load and persist Playwright storage state under `.auth/` so a local box can reuse a logged-in browser session without committing credentials.

### 4. Evidence / non-submission contract

Every run creates before/after screenshots and a result record, and records `final_submit_performed: false`.

Final submit, legal attestations, payments, CAPTCHA/2FA, adviser/team confirmation and ambiguous questions remain human-controlled.

This safety boundary should remain.

## Current execution gaps

### Gap A — no portal reconnaissance / learning step

Current `inspect` does **not** learn an unknown form. It only checks whether already-declared `field_map` locators exist.

It does not currently:

- discover the real registration link from an information page;
- enumerate unknown form controls and required fields;
- identify file inputs / accepted file types;
- identify multi-page flows;
- identify login/account-creation requirements;
- identify repeated author/team-member sections;
- infer conditional questions;
- generate a candidate portal map.

This is now observed real campaign friction and therefore earns a small reconnaissance layer.

### Gap B — info URL is often not submission URL

Observed example: TAIA 2026.

The current HS manifest points at the public competition information page, but the live official page routes `立即報名` through the embedded competition page to a Google Form.

A field map against the information page cannot work.

Blowback needs to distinguish:

- `source_url` / rules page;
- `registration_url` / account-creation page;
- `submission_url` / actual form/dashboard;
- optional `status_url` / result or receipt page.

### Gap C — current generic auth scope is unsafe/ambiguous

`openBrowser()` stores auth as:

```text
.auth/<opportunity.portal>.json
```

Many current manifests use `portal: "generic"`.

That means unrelated sites can unintentionally share `.auth/generic.json`.

Before live box deployment, auth state should be scoped explicitly by portal family / host, e.g.:

- `google-forms` / Google account state;
- `conftool-aifinconf2026`;
- `innoserve`;
- `lever`;
- `workday-<employer>`;
- `jobbnorge`;
- `academictransfer`.

Do not share a single generic auth state across unrelated domains.

### Gap D — generic adapter is single-page

The current generic adapter fills the controls available on the currently loaded page. It does not navigate a sequence such as:

```text
login → dashboard → choose submission type → page 1 → page 2 → upload → review
```

Complex portal families require either:

1. a small explicit stage/recipe format; or
2. the smallest portal-family adapter justified by repeated real use.

Do **not** turn this into a universal autonomous web agent.

### Gap E — campaign record != executable manifest

A row in `longtail-campaigns.csv` or `postgrad-market.csv` is research/control-plane state. It is not automatically executable by Playwright.

For an entry to become browser-executable it still needs:

- verified live target URL;
- portal/auth scope;
- field map or portal adapter;
- upload map;
- human gate list;
- canonical packet source;
- live inspection receipt.

## Live portal-family observations

### TAIA 2026 — Google Forms

Official route checked 2026-08-26:

```text
TAIA information page
  → embedded competition page
  → "立即報名"
  → Google Form
```

The official page says:

- graduate students are eligible, including 115-year graduates;
- teams may contain 1–3 people;
- the graduate track emphasizes advanced AI-agent architecture, multimodal integration and research/industry depth;
- initial submission centers on an Idea deck of at most 15 pages;
- 8/31 is the initial-review / Idea-deck gate; 10/12 is the later selection close.

Implication for Blowback:

- HS is packet-ready enough for this route.
- Current manifest target must be changed from info page to verified form/registration route.
- Google authentication may be required for uploads.
- registration/privacy/originality/final submit remain human gates.
- this is a good first real portal-recon test.

### Global AI Finance 2026 — ConfTool

Official ConfTool registration was checked 2026-08-26.

The new-account form requests, among other fields:

- organization/company;
- department;
- title;
- first/last name;
- postal address/city/country;
- e-mail;
- privacy agreement;
- user name;
- password/confirmation.

ConfTool's author workflow is generally:

```text
create account → login → Your Submissions → choose submission type/track
→ enter contribution metadata/authors → upload manuscript → review page → final submit
```

Implication for Blowback:

- Policy Lab's RC5 packet already solves the content side.
- account creation and privacy acceptance remain owner-controlled.
- after a user creates/logs into the account and Blowback stores scoped ConfTool auth state, a small ConfTool adapter could prepare metadata/upload steps up to final submit.
- current generic single-page adapter is not sufficient for the full ConfTool sequence.

This is a high-value reusable adapter family because many conferences use ConfTool.

### InnoServe 2026 — custom competition portal

Official rules/FAQ checked 2026-08-26 show online registration from 2026-08-03 through 2026-10-05.

The required package can include:

- system overview Word document (max 5 pages / 4 MB);
- signed participant/privacy/portrait declaration;
- student ID / enrollment proof;
- 3-minute unlisted YouTube introduction video URL;
- 16:9 team photo;
- category-specific forms (e.g. derived dataset form, education-open-data idea form, industry collaboration/agile evidence where applicable).

Anonymous-review rules also prohibit school/adviser identity inside reviewed materials/video.

Implication for Blowback:

- this route is **not** a simple generic text form.
- the repo can own/generate the canonical documents and check anonymity/size constraints.
- the live portal needs a dedicated inspected recipe/adapter for team/adviser/category/upload handling.
- current HS InnoServe manifest points to the rules page and declares no uploads, so it is **not browser-executable yet**.

### Job portals

The post-grad board currently has no browser manifests.

Likely portal families include:

- Lever / Greenhouse — often relatively simple forms and good candidates for generic/small adapters;
- Workday — multi-step/account/dynamic-question flows, likely dedicated adapter family;
- company-specific career portals — inspect individually.

Job applications should remain low-cost price-discovery campaigns, not spray-and-pray automation. Final application submission remains human-controlled.

### PhD portals

Likely reusable families include:

- Jobbnorge / Norwegian university vacancy portals;
- AcademicTransfer / Dutch vacancies;
- university Workday/custom recruitment systems;
- ConfTool/OpenReview/EasyChair for conference-like routes.

The repo can prepare canonical CV/proposal/research evidence and portal-specific answers, but multi-step application sites need verified recipes/adapters before execution.

## Can submissions be done "just through the Gauntlet repo"?

### GitHub repository alone: **No**

GitHub should contain:

- public/canonical project evidence;
- opportunity records;
- submission packet sources where safe;
- portal recipes/adapters;
- tests.

GitHub should **not** contain:

- passwords;
- authenticated cookies/storage state;
- private identity documents;
- student ID scans;
- private postal/contact fields unless intentionally public;
- signed legal declarations.

### Local box checkout of Gauntlet: **Yes, for near-submit preparation**

The intended execution environment is:

```text
Gauntlet repo checkout
+ local private profile/identity store
+ local packet files
+ .auth/<scoped portal>.json
+ Playwright browser
+ verified opportunity recipe
= form prepared / uploads staged / screenshots recorded
→ HUMAN FINAL-SUBMIT GATE
```

That is realistic and is already partially implemented.

### Fully autonomous final submission: **No / intentionally not a goal**

Keep human control over:

- account creation where legal/privacy consent is involved;
- CAPTCHA/2FA;
- eligibility/originality/authorship attestations;
- adviser/team declarations;
- payment/travel commitment;
- final submit.

## Minimum earned engineering before box deployment

The following work is justified by observed live campaign friction and is small enough to remain consistent with Blowback doctrine.

### P0 — portal reconnaissance command

Add a non-mutating command such as:

```bash
node src/cli.mjs recon <opportunity>
```

It should record, without submitting or accepting terms:

- current URL/title;
- redirects;
- iframe sources;
- candidate links containing apply/register/submit/login or local-language equivalents;
- form actions/methods;
- visible controls and labels;
- required/type/name/id/placeholder/ARIA metadata;
- file inputs and `accept` types;
- buttons;
- obvious auth/CAPTCHA/2FA signals;
- screenshot + JSON receipt.

Output should be a **candidate map**, never automatically promoted to `prepare`.

### P0 — explicit auth scope

Add `auth_scope` (or equivalent) to manifests and use it for local storage state instead of treating every `generic` portal as one session.

### P0 — separate source / registration / submission URLs

The opportunity contract should distinguish rules/source pages from actual browser execution targets.

### P1 — smallest reusable portal adapters

Implement only after real repeated need.

Priority based on the current Gauntlet:

1. Google Forms (TAIA and possibly other student competitions);
2. ConfTool (Global AI Finance + many conference routes);
3. InnoServe custom portal;
4. Lever/Greenhouse job forms;
5. Jobbnorge / AcademicTransfer / other repeated PhD family after first live fire.

### P1 — executable-manifest coverage

For each `FIRE` campaign, define an execution readiness field such as:

- `RESEARCH_ONLY`
- `PACKET_READY`
- `PORTAL_RECON_REQUIRED`
- `PORTAL_MAPPED`
- `PREPARE_VERIFIED`
- `HUMAN_SUBMIT_READY`
- `SUBMITTED`

Do not call a campaign `HUMAN_SUBMIT_READY` until an exact live portal preparation run has succeeded.

### P1 — receipt capture

After the user performs final submit, Blowback should capture/record:

- confirmation page screenshot;
- submission/application ID;
- timestamp;
- submitted file hashes;
- final field snapshot where available;
- confirmation email/reference entered later if necessary.

## Box-deployment acceptance test

Before calling Blowback an operational submission machine, run at least three distinct portal families end-to-end **up to but not including final submit**:

1. TAIA / Google Forms;
2. Global AI Finance / ConfTool;
3. InnoServe or one real job/PhD portal.

For each, require:

- live target discovered and verified;
- auth state isolated correctly;
- all non-human fields/uploads prepared;
- no legal/eligibility field guessed;
- final submit untouched;
- screenshots/run record preserved;
- a human can complete the remaining steps without reconstructing the application manually.

## Stop rule

Do not solve this by building a generalized browser-agent SaaS.

The correct product remains:

> **verified opportunity + canonical evidence + tiny portal recipe = boring near-submit preparation**

Portal learning should only make the clerical bridge from campaign to form cheaper and more reliable.