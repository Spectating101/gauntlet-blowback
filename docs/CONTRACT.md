# Blowback v0 contract

## Purpose

Blowback reduces clerical work in external submissions. It is not an autonomous applicant and it does not decide that the operator is legally or ethically entitled to make an attestation.

## Modes

- `inspect`: navigate, locate mapped fields, record what is and is not automatable. No form mutation.
- `prepare`: fill mapped fields and upload declared files. Never perform final submission.

There is intentionally no autonomous `submit` mode in v0.

## Mandatory human boundaries

Opportunity manifests must include `final_submit` in `human_required`. Other identity-sensitive gates include login, CAPTCHA, 2FA, eligibility/originality/authorship attestations, terms, payment, adviser/team confirmation, and any ambiguous question whose answer is not already canonical data.

Blowback must not bypass anti-bot controls or fabricate answers to satisfy eligibility.

## Evidence discipline

Portal values come from explicit profile/project/opportunity manifests. Venue-specific prose may be generated upstream, but it should enter Blowback as an explicit packet field rather than be improvised inside the browser adapter.

## Auth state

Playwright storage state is local-only under `.auth/` and git-ignored. It may contain session cookies and must be treated as a credential.

## Submission records

Each run preserves before/after screenshots and a machine-readable result under `submission-records/`. These artifacts are local and git-ignored by default.
