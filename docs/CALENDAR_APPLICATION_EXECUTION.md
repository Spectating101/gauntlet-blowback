# Calendar-driven application execution

The consolidated active and rolling-watch calendars supply **time cues**. The
generated Gauntlet master supplies the authoritative route, eligibility,
evidence and allocation state. `calendar-queue` expands the calendar's own
simple recurring review blocks and combines them with the master without
allowing a calendar label to promote a stale or unverified route.

```bash
npm run calendar:queue
node src/cli.mjs calendar-queue --date=2026-09-09 --days=21
```

The output separates routes into account onboarding, recon, and preparation.
It excludes hard-deadline routes whose current cycle is already over, instead
of keeping expired `FIRE` rows at the head of an execution queue. Direct UID
matches are preferred; a unique route-id token match is labelled as such; an
ambiguous cue stays unbound rather than being guessed into an application.

The immediate `fire-next` and `fire-queue` interfaces apply the same
current-cycle check, so a date-bound package cannot remain the default live
browser handoff after its verified deadline passes.

## Public readiness audit

Use the headless audit to distinguish a public page that can be inspected now
from a page where an account/login gate was actually observed. It covers only
the near-term hard-deadline queue plus directly executable rolling FIRE routes;
it does not crawl every historical or long-horizon row.

```bash
npm run application:readiness
node src/cli.mjs readiness-audit --scope=all --limit=200
```

`--scope=all` includes every current-cycle application-like route, deduplicates
shared public URLs, and pauses at least one second between requests to a given
host. The audit uses a fresh browser context for each public source. It does not use
saved auth state, create accounts, fill fields, upload files, save drafts,
accept consent, interact with CAPTCHA, or submit. `NOT_OBSERVED_ON_CURRENT_PAGE`
does not mean an account will never be required; it is deliberately weaker
than an observed account gate.

## Non-secret account checkpoints

An account checkpoint records only a portal scope and a coarse state. It is
local, git-ignored, and must never contain an email address, password, OTP,
token, organization ID, mailbox content, or personal profile value.

```json
{
  "scope": "openai.smapply.org",
  "state": "LOGIN_REQUIRED",
  "route_ids": ["openai-researcher-access-hardware-splicer"],
  "portal_url": "https://openai.smapply.org/"
}
```

Persist it with:

```bash
node src/cli.mjs account-checkpoint /secure/local/account-state.json
```

States include `UNVERIFIED`, `LOGIN_REQUIRED`, `ACCOUNT_REQUIRED`,
`EMAIL_VERIFICATION_REQUIRED`, `CONSOLE_ORG_REQUIRED`, `ACCOUNT_READY`,
`NOT_REQUIRED`, and `BLOCKED`.

## Gmail and account boundaries

Gmail access can help observe a verification or receipt for one explicitly
scoped application. It does not grant authority to create an account, use a
verification code/link, accept terms, or submit an application. Those actions
remain live, per-route human confirmations. The browser executor should use
the existing signed-in Chrome state and persist only the non-secret checkpoint
after the human gate has cleared.

The desired loop is:

```text
calendar cue -> official-route recon -> account checkpoint -> map/prepare
             -> human account/verification/terms gate -> draft -> human submit
             -> receipt checkpoint -> outcome follow-up
```
