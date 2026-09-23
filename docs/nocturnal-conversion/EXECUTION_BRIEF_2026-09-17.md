# Nocturnal Conversion Execution Brief — 2026-09-17

Status: **LIVE / conversion queue operational**

## Canonical asset

- Nocturnal repository: `Spectating101/nocturnal-oversight`
- Product integration on main: `12ece15ec6042dec786ef50006db2f92251a7840`
- Portfolio freeze status: `ceb0551e0c148476c51b40b8ffef1713f33efd55`
- Product state: **PRODUCT_COMPLETE / CONVERSION_READY**
- Canonical product surface: **Now → Read → Research**
- Gauntlet pre-staging CI baseline: main `45bd473bd11f7be95b019b45a109c19275bb09d0`, core + browser green

No general Nocturnal product construction should be opened from this brief. The job now is external conversion and evidence.

## Action order

### 1. RESTAGE — Taiwan FactCheck Center bounded pilot outreach

Route: `partner-tfc-nocturnal-pilot`  
State: `COPY_REVISED_RESTAGE_REQUIRED`  
Official surface: `https://tfc-taiwan.org.tw/contact-us/`

Prepared assets:

- `docs/nocturnal-conversion/TFC_PILOT_OUTREACH.md`
- `examples/fire-packets/tfc-nocturnal-pilot-2026.json`
- `examples/opportunities/tfc-nocturnal-pilot-2026.json`
- `docs/nocturnal-conversion/receipts/TFC_CONTACT_FORM_STAGED_2026-09-17.md`

Live portal reconnaissance completed on 2026-09-17:

1. verified live fields `我們如何稱呼您？`, `電子郵件地址：*`, and `留下您的訊息*`;
2. verified final control text `送出`;
3. observed no required-field or inline validation error on the first staged copy;
4. observed a non-blocking Cloudflare challenge widget;
5. did not click `送出`, press Enter, or transmit anything.

After that staging pass, the outreach copy was deliberately revised because the original message under-explained the finished product. The new canonical copy now explicitly states:

- **problem** — longitudinal public-information reconstruction: initial reports are easy to find while later responses, corrections, superseding records and outcomes fragment across pages/time;
- **solution** — one source-linked matter history preserving previous/current documented state, chronology, corrections/disputes, later outcomes, historical `as_of` state and Before ↔ After comparison;
- **interface** — `Now` for current readable state, `Read` for `What changed?`/chronology/evidence/historical views, and `Research` for read-only Timeline/Before-After/Subjects/Sources/Evidence inspection;
- **pilot** — one bounded, non-sensitive, correction-rich public case, compared against the partner's normal workflow with negative results explicitly acceptable.

Canonical external references in the revised copy:

- `https://github.com/Spectating101/nocturnal-oversight`
- `https://github.com/Spectating101/nocturnal-oversight/blob/main/EVALUATOR_GUIDE.md`

### Hosted preview exclusion

`https://edition-nocturnal-preview.vercel.app` was rechecked during conversion preparation. It is live, but its `/research` path returns 404 and the repository freeze explicitly marks the earlier Edition/RC1 frontend as superseded by Now / Read / Research. Therefore it must **not** be sent to TFC as though it were the current product interface.

The first staging receipt remains valid evidence of portal/field reconnaissance, but it no longer represents the final copy. The next reversible action is to restage the revised Traditional Chinese message, inspect it, and stop again before `送出`. Only then does the route return to `STAGED_HUMAN_SEND_GATE`.

### 2. HOST NOW — TWNIC Community Grants 2026

Route: `twnic-community-grant-2026-nocturnal`  
State: `HOST_PACKET_READY / RESEARCH_ONLY`  
Deadline: `2026-09-30T23:59:00+08:00`  
Ceiling: NT$1.5M  
Applicant gate: legal organization; one proposal per organization.

Prepared asset:

- `docs/nocturnal-conversion/TWNIC_2026_HOST_PACKET.md`

Do not enter a portal under an organization name without explicit host authority.

Immediate host conversation should answer only these questions first:

1. Is the organization willing to act as legal applicant for this project?
2. Is its one-proposal TWNIC 2026 slot still available?
3. Who has responsible-person / finance / seal authority?
4. Can the organization accept the budget/shortfall obligations if the award is below request?

Only after those pass should Gauntlet promote TWNIC into portal execution.

### 3. BAKEOFF + HUMAN AUTHORSHIP — NLnet Restack

Route: `nlnet-restack-nocturnal`  
State: `PORTFOLIO_BAKEOFF_HUMAN_REWRITE_REQUIRED / PACKET_READY`  
Deadline: `2026-11-03T12:00:00+01:00`

Prepared assets:

- `docs/nocturnal-conversion/NLNET_RESTACK_APPLICATION.md`
- `examples/opportunities/nlnet-restack-nocturnal-2026.json`

The workbook is **not final proposal prose**. NLnet currently asks applicants to answer in their own words and requires disclosure of GenAI assistance. If Nocturnal wins the portfolio first-grant bakeoff, the applicant must personally rewrite the form answers, approve the fully libre/open funded-output boundary, confirm the EUR 18.5k planning amount/time commitment, establish a credible European dimension, and provide/reverify the required GenAI interaction log.

Do not dispatch NLnet through FIRE until those gates are cleared.

### 4. PILOT THEN FIRE — OTF Internet Freedom Fund

Route: `otf-iff-nocturnal`  
State: `PILOT_THEN_FIRE / RESEARCH_ONLY`  
Deadline: rolling

Prepared asset:

- `docs/nocturnal-conversion/OTF_IFF_CONCEPT_NOTE.md`

The technical concept is ready, but generic information-integrity positioning is not enough. Promotion requires a real beneficiary/user group facing repressive censorship or surveillance, a concrete workflow problem, and preferably demand/pilot evidence. Do not manufacture this context.

## Evidence receipts to collect

### TFC outreach

Current evidence:

- portal/field reconnaissance complete;
- first copy staged but superseded before transmission;
- revised problem → solution → interface → pilot copy frozen in the FIRE packet;
- no message transmitted.

Next:

- restage revised copy;
- inspect exact form state;
- human Send decision;
- after Send only: timestamp, endpoint, final revision, acknowledgement/reference ID if any, response state and follow-up date.

### TWNIC host outreach

- organization contacted;
- person/role contacted;
- one-proposal slot status;
- host decision;
- finance/admin constraints;
- explicit authorization before portal work.

### NLnet

- portfolio bakeoff decision;
- final FLOS/open-release decision;
- applicant-authored proposal revision;
- GenAI disclosure/log version;
- exact form/receipt only after human final submission.

### OTF

- named user/problem evidence;
- restrictive-context relevance;
- partner/pilot willingness;
- safe threat model;
- concept-note revision and any receipt.

## Stop rules

- Do not reopen Nocturnal UI/product work merely because a richer feature could exist.
- Do not claim external adoption, workflow improvement or endorsement before receipt evidence exists.
- Do not use the superseded Edition/RC1 hosted preview as proof of the canonical interface.
- Do not use a legal host's identity, seal, finances or proposal slot without authority.
- Do not submit AI-assisted NLnet prose as if it were applicant-written.
- Do not force OTF fit by inventing an at-risk beneficiary.
- Do not perform any final send/submit/payment/contract commitment without the human gate.

## Current operational conclusion

Nocturnal is no longer waiting for an application strategy or TFC portal reconnaissance.

The conversion system now has:

- one **revised external-evidence route** requiring a single clean restage before the protected final Send control (TFC outreach);
- one **deadline-bound host route** with a complete host/proposal packet (TWNIC);
- one **direct funding route** with a compliant human-authorship workbook and explicit portfolio/open-release gates (NLnet Restack);
- one **rolling Internet-freedom funding route** with a complete concept framework but a truthful beneficiary/pilot gate (OTF IFF).

The immediate TFC task is restage revised copy → inspect → human `送出` decision. No message has been transmitted.
