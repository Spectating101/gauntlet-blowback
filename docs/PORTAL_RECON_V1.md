# Portal Recon v1

## Purpose

Portal reconnaissance bridges the gap between a strategically qualified Gauntlet campaign and a browser-executable application recipe.

The rule is deliberately conservative:

```text
research facts
  -> packet readiness
  -> source-page recon
  -> registration-page recon
  -> submission-page recon
  -> human-verified route map
  -> prepare
  -> human final submit
```

Recon is observation-only. It must never fill a field, upload a file, accept a declaration, create an account, or promote a candidate route to executable preparation.

## Route stages

Opportunity manifests may distinguish:

- `source_url`: public opportunity/rules/call page;
- `registration_url`: account creation or application entry point;
- `submission_url`: exact page used for the application/submission when known.

`entry_url` remains a compatibility alias for older manifests. New live routes should progressively replace it with explicit stages.

Run staged reconnaissance with:

```bash
npm run blowback -- recon examples/opportunities/<manifest>.json --stage=source
npm run blowback -- recon examples/opportunities/<manifest>.json --stage=registration
npm run blowback -- recon examples/opportunities/<manifest>.json --stage=submission
```

A stage must already have a URL in the manifest. Recon may discover candidate next-stage links, but it does not write them back automatically.

## Recon receipt

`blowback.portal_recon.v1` records:

- current URL/title and main-frame navigation history;
- candidate apply/register/login/submission links;
- forms and form actions;
- controls, labels, required flags and upload constraints;
- buttons and iframes;
- password/login/CAPTCHA/2FA signals;
- a full-page screenshot;
- `mutations_performed: false`;
- `candidate_route_status: UNVERIFIED`;
- `final_submit_performed: false`.

The collector intentionally does not record current form values so persisted sessions do not leak private field contents into reconnaissance receipts.

## Authentication isolation

Browser storage state is no longer keyed only by `portal`.

Preferred manifests declare an explicit `auth_scope`, for example:

- `google-forms-taia-aida2026`;
- `conftool-aifinconf2026`;
- `innoserve.tca.org.tw`.

If `auth_scope` is absent, Blowback derives a safe scope from the execution/recon host. A generic portal without an explicit scope or valid host is rejected rather than falling back to a shared `.auth/generic.json`.

Authentication state remains local under `.auth/` and must never be committed.

## Execution readiness

Portal readiness is separate from strategic campaign readiness:

```text
RESEARCH_ONLY
  -> PACKET_READY
  -> PORTAL_RECON_REQUIRED
  -> PORTAL_MAPPED
  -> PREPARE_VERIFIED
  -> HUMAN_SUBMIT_READY
  -> SUBMITTED
```

`mode: prepare` is rejected unless the manifest is explicitly `PORTAL_MAPPED`, `PREPARE_VERIFIED`, or `HUMAN_SUBMIT_READY`.

`PORTAL_MAPPED` is a human-verification statement. Recon output alone cannot set it.

## First live families

The initial real cases are intentionally heterogeneous:

1. TAIA 2026: public source -> official competition site -> Google Form. The exact registration form is known; its field map still requires live recon.
2. 2026 Global AI Finance: ConfTool registration is known; account-private values remain local and the authenticated submission route still requires recon.
3. InnoServe 2026: source rules and packet requirements are known; the current registration endpoint and form sequence still require recon.

These cases earn the next adapters. They do not justify a universal autonomous browser agent.

## Human boundary

Always keep these human-controlled when applicable:

- CAPTCHA and 2FA;
- account/password choices;
- privacy/legal terms;
- eligibility, originality and authorship attestations;
- team/adviser declarations;
- payment/travel decisions;
- final submit/send.
