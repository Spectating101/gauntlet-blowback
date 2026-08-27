# Codex + Chrome Mission Operator

## Purpose

Blowback does **not** try to become a universal browser agent.

The repo provides the portfolio queue, state, evidence boundaries, permissions, checkpoints and receipts. Codex supplies adaptive reasoning. Chrome supplies the authenticated live browser.

```text
Gauntlet Master
      ↓
blowback next
      ↓
Codex browser mission
      ↓
Codex + Chrome extension
      ↓
arbitrary live portal navigation
      ↓
checkpoint / human gate / receipt
      ↓
Gauntlet state
```

## Non-goal: portal hardcoding

A novel website is normal. The operator should not require a checked-in selector map, recipe or adapter before attempting it.

Do not turn one successful application into code such as:

```text
if portal == conftool:
  click('#newSubmission')
```

unless repeated evidence shows that a tiny reusable helper has real value. Even then, the helper remains an optimization, not the source of browser intelligence.

PR-era Playwright reconnaissance/recipes remain useful for observation, deterministic replay and safety regression tests. They are not the primary navigation architecture.

## Mission contract

`npm run blowback -- next` emits `blowback.codex_browser_mission.v1`.

The mission contains:

- strategic route state;
- starting official/source URL;
- adaptive-browser requirement;
- actions Codex may perform automatically;
- questions Codex must resolve from canonical evidence before asking the user;
- protected human gates;
- forbidden behavior;
- previous checkpoint state when available.

The browser objective is intentionally simple:

> Advance the route through the live web workflow to the last safe reversible state.

The mission does not ask Codex to invent or rebuild an application packet. Use existing designated material and known factual data. If a required substantive artifact genuinely does not exist, checkpoint that as an unresolved item rather than silently manufacturing one.

## Permission model

### Reversible navigation — AUTO

Codex may independently follow relevant links, redirects, tabs, Next/Continue/Back/Open/Edit actions, inspect instructions, recover sessions and use the existing signed-in Chrome state.

### Reversible application state — AUTO

Codex may fill canonical factual fields, make unambiguous mechanical selections, upload existing designated files, download instructions/templates and save drafts.

### Resolve before asking

Codex should consult the Gauntlet and canonical project evidence before asking about category/track, title, affiliation, dates, previously established eligibility facts or designated files.

### Protected actions — HUMAN GATE

CAPTCHA, required 2FA/OTP, password creation/choice, payment, final submission/send/apply, legal/privacy/terms consent, originality/authorship declarations, unresolved eligibility attestations, adviser/team/partner commitments and destructive actions remain protected.

## Checkpoints

Create a checkpoint JSON such as:

```json
{
  "mission_id": "mission:gaf-2026-policy-lab",
  "route_id": "gaf-2026-policy-lab",
  "status": "WAITING_HUMAN",
  "stage": "FINAL_REVIEW",
  "current_url": "https://portal.example/review",
  "visited_urls": ["https://portal.example/start"],
  "completed_actions": ["metadata completed", "PDF uploaded", "draft saved"],
  "unresolved_items": [],
  "human_required": ["privacy declaration", "final submit"]
}
```

Then persist it with:

```bash
npm run blowback -- checkpoint /path/to/checkpoint.json
```

Checkpoints live under `.blowback/missions/` and are git-ignored. The validator refuses obvious secret-bearing keys such as passwords, OTPs, card data, API keys and tokens.

## Resume behavior

`blowback next` reads local route checkpoints. Terminal routes (`SUBMITTED`, `ABANDONED`, `EXPIRED`) are excluded from dispatch. Non-terminal routes carry their previous stage/current URL/completed work into the next mission so Codex can resume rather than reconstructing the application from scratch.

## Intended operator experience

The desired command to Codex is effectively:

> Run the Gauntlet. Use `blowback next`, operate the mission in Chrome, checkpoint meaningful progress, stop only for protected human gates or verified blockers, then continue with the next route.

The repo is the mission/state substrate. Codex is the adaptive navigator. Chrome is the authenticated execution surface.
