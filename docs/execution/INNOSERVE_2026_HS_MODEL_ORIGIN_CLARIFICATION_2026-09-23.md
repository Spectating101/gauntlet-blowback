# InnoServe 2026 — Hardware-Splicer model-origin clarification gate

Date: 2026-09-23  
Route: `innoserve-2026-hardware-splicer`  
Target category: **ADIAI — 產業AI創新組 / Industrial AI Innovation**

## Why this gate exists

The organizer's 2026-08-27 update added a declaration clause stating that the submitted work has not used China-origin or China-backed open-source models (example given: DeepSeek), including through API/MCP-mediated AI training, inference or related use.

Hardware-Splicer has historical optional Qwen and DeepSeek integrations/evaluation artifacts in the broader repository.

The prepared InnoServe overview does not present those models as the competition system, but that is not enough to infer that the declaration can safely be signed. The scope of "本次參賽作品" must be clarified.

## Organizer clarification question

Use this wording without reframing the facts:

> We are preparing a university student entry for the Industrial AI Innovation category. The competition-specific version we would submit and demonstrate would not use Qwen, DeepSeek, or any other China-origin / China-backed model in its runtime, inference, training, API/MCP calls, demo, or submitted evidence. However, the larger upstream research repository contains historical optional experiments/integrations involving Qwen and DeepSeek that are not part of the competition build. Under the updated 2026-08-27 declaration, is such a separately evidenced competition build eligible, and can the team truthfully sign the declaration?

Do not omit the historical repository fact when asking.

## Decision paths

### If organizer confirms a clean competition build is acceptable

Proceed only after creating an auditable submission boundary:

- exact competition commit/tag;
- dependency/provider inventory;
- runtime configuration;
- demo configuration;
- submitted documents;
- submitted video;
- evaluation traces used for competition claims;
- declaration-compatible model/provider list.

The competition build must not call or depend on prohibited models through API, MCP or other runtime paths.

Historical files outside the competition build should remain historical; do not delete them merely to create the appearance that they never existed.

### If organizer says historical use disqualifies the derived work

Do not submit Hardware-Splicer to this route.

Gauntlet should reallocate InnoServe to another portfolio asset only if that asset independently satisfies the same declaration and category requirements.

### If no unambiguous answer is obtained

Do not sign the declaration.

A deadline does not justify making an eligibility assertion we cannot support.

## Other verified route requirements

For ADIAI:

- enrolled undergraduate/master's/doctoral students are eligible;
- up to 8 students per team;
- **1-2 school advisers required**;
- online registration closes **2026-10-05 at 16:00 Taiwan time**;
- system overview: Word, BiauKai 14pt, no more than 5 pages, max 4 MB;
- student-status evidence required;
- 3-minute project video uploaded to YouTube;
- landscape team photo required;
- reviewed documents/video must preserve the competition's anonymity rules.

## Current HS route state

`COMPLIANCE_CLARIFICATION_REQUIRED`

This is not a downgrade of Hardware-Splicer. It is a route-specific external rule introduced after the original packet was prepared.

## Hard boundary

Do not:

- remove historical Qwen/DeepSeek evidence to hide prior work;
- claim those experiments never existed;
- sign the updated declaration based only on the fact that the current overview does not mention them;
- create a nominal "clean build" unless the organizer confirms that this interpretation satisfies the declaration.

The route fires only if both the adviser gate and the model-origin declaration can be satisfied truthfully.
