# TFC contact form staging receipt — 2026-09-17

Route: `partner-tfc-nocturnal-pilot`  
State after run: **STAGED / HUMAN_SEND_GATE**  
Official surface: `https://tfc-taiwan.org.tw/contact-us/`

## What was executed

A live browser session opened the Taiwan FactCheck Center contact page and filled the prepared Nocturnal pilot outreach without submitting the form.

Filled fields:

- `我們如何稱呼您？` → `Christopher Ongko`
- `電子郵件地址：*` → `s1133958@mail.yzu.edu.tw`
- `留下您的訊息*` → canonical Traditional Chinese Nocturnal pilot outreach from `examples/fire-packets/tfc-nocturnal-pilot-2026.json`

## Live form verification

- all three intended fields remained populated after staging;
- no required-field warning was visible;
- no inline validation error or error banner was visible;
- a Cloudflare security challenge iframe/widget was present, but no blocking error was shown;
- the visible final submit control was `送出`;
- `送出` was **not clicked**;
- no Enter-key submission was triggered;
- the browser did not navigate away from the contact page.

## Human gate

The route has now reached the irreversible boundary.

Next action is applicant review of the staged copy followed by an explicit human decision whether to click `送出`.

No outreach receipt, partnership claim, pilot agreement, or external-validation claim exists yet because the message has not been transmitted.
