# Gauntlet JOB handoff — 2026-09-22

This is `fire:next` for jobs. Treat `data/jobs/handoff.json` as the execution contract (`blowback.job_handoff.v1`). The CSV is the inventory. Do not paste 1,177 roles into the unattended queue or into `gauntlet-master.json`.

## Files

| Path | What it is |
|---|---|
| `data/jobs/handoff.json` | Packaged shots + browser contract + receipt schema |
| `data/jobs/curated-shots.json` | Human shortlist (URL needles + why). `--next` prefers these when still live |
| `data/jobs/next-shots.csv` | The 8 shots as a table |
| `data/jobs/live-pipeline.csv` | Full 1,177-row inventory (company, title, location, url, pay, family, timing, score) |
| `scripts/job-watch.py` | Regenerator |
| `scripts/job-boards.json` | Live ATS / Yourator / Cake; sqlite DBs via env, not home-directory paths |

Applicant contact, cookies, and CV PDFs stay in the private authority file. This public repo must not receive them.

## How it maps onto Gauntlet

Gauntlet already ranks, packages one shot, maps copy onto a live form, and stops at Submit. The JOB lane was not using that machine:

- 52 JOB routes in the master, 11 marked `FIRE_NOW`, **every `execution_manifest` empty** — so `npm run fire:next` correctly returns nothing for jobs.
- Those 52 are a **named-employer watchlist** (Binance, WorldQuant, Hong Wen, Jane Street…). 19 of 29 employers have no live posting in the current scrape.
- Live postings live in Molina `tw_jobs.db` + `104.db` plus Greenhouse/Lever/Yourator/Cake APIs.

So:

- Master JOB records stay a watchlist.
- `live-pipeline.csv` is the live board.
- `handoff.json` shots are the firing queue (one employer each).
- A returned `blowback.job_receipt.v1` is how a shot leaves the queue.

## Inventory (as of 2026-09-22)

1,177 reachable roles, 356 employers, 887 with a stated pay string. Reachable means Taiwan-based or remote without a foreign-region lock. Freshness window: 14 days.

| Slice | Roles | When it is actually takeable |
|---|---:|---|
| Generic software / 工程師 (Compal, Foxconn, etc.) | 843 | inventory, not a shot |
| Profile-close (ML / DS / quant / data eng / LLM) | 144 | mixed |
| Intern / BAP / 實習 / 兼職 | 91 | **now** (student + ARC) |
| Full-time, not senior | most of 821 | from **2027-01** (graduate work window) |
| Senior / staff / 資深 | 265 | skip unless the posting is explicitly junior |

Stated monthly NT$ among profile-close rows that parse as numbers: ML ~142k median, data eng ~110k, data science ~96k, quant ~200k (tiny n). Best PhD stipend found in the parallel sweep is ~NT$40k. That is a fact about cash, not a reason to skip the 30 September referee emails.

## Sources, honestly

| Source | In this snapshot | Notes |
|---|---|---|
| Yourator / Cake / 1111 / ATS in `tw_jobs.db` | majority | Yourator cron on this Optiplex wrote the DB at 19:30 on 2026-09-21 |
| Cake live overlay | extra unique URLs | public search API; some rows are `TWD 0~0` — treat as not stated |
| `104.db` | 43 after keyword filter | **intern/corridor crawl**, not full-time 104. 43k historical rows exist; most are 門市/工讀 |
| 104 HTTP | **not used** | 403s; do not hammer. Cookies are expired; needed only to apply, not to list |

Set the DBs when regenerating:

```bash
export JOB_WATCH_TW_JOBS_DB=/path/to/Molina-Optiplex/src/data/tw_jobs.db
export JOB_WATCH_104_DB=/path/to/Molina-Optiplex/src/data/104.db
python3 scripts/job-watch.py --with-pay --next 8 \
  --csv data/jobs/live-pipeline.csv \
  --handoff data/jobs/handoff.json
```

`--next` limits stdout. CSV and handoff inventory stay the full list.

## Shots to fire (one employer each)

Human shortlist in `data/jobs/curated-shots.json`, not raw `--next` rank. The first published eight were intern+pay+board heuristics: they promoted an agency intern, Cake Recruitment, and three `TWD 0~0` rows. Those are dropped.

Open `target.starting_url`. Use `cv_variant`. Stop at `human_gate`.

**Now (student / intern window)**

1. **job-shot-01** — Appier, Data Analyst Intern, Taipei. [Greenhouse](https://job-boards.greenhouse.io/appier/jobs/7495834). Named watchlist employer. Honest current-window shot.
2. **job-shot-02** — Binance Accelerator Program, AI Research Scientist (LLM). [Lever](https://jobs.lever.co/binance/e7f93f9f-9e39-4a3f-87e3-4dea1efb79b1). One Binance only. Nationality / hours / hCaptcha on the live form — do not invent them.
3. **job-shot-03** — KPMG, 虛擬資產法規實務研究實習生, 信義. [Cake](https://www.cake.me/companies/KPMG/jobs/3be6655a-177c-4f05-a667-9ccec723c880-consultant-department-virtual-0816a6099b3f221a04e152706eba55). Closest intern to the finance/crypto thesis work. Hourly ~196 is intern-market.
4. **job-shot-04** — 聚典資訊 Ret[AI]ling, AI系統工程師-學生實習, Taipei, 時薪 200–250. [Cake](https://www.cake.me/companies/ret-ai-ling-data/jobs/22b97f). Actual AI intern, not BD/sales.

**From 2027-01 (full-time; package now)**

5. **job-shot-05** — Gogolook, Machine Learning Engineer, Taipei. [Lever](https://jobs.lever.co/Gogolook/53ccbfd0-9139-4ce6-be17-adb2497c518c). Named watchlist employer.
6. **job-shot-06** — 優式資本, 量化資料分析師, Taipei. [Yourator](https://www.yourator.co/companies/UCCapital/jobs/46849). Finance master's is the honest fit. 面議.
7. **job-shot-07** — AIFT, Machine Learning Engineer Vulcan, 年薪 NT$1.3–1.8M, Taipei. [Yourator](https://www.yourator.co/companies/aift/jobs/46568). Real stated band, not junk pay.
8. **job-shot-08** — 創樂, AI量化建模工程師, 年薪 TWD 1.2–1.9M, Taipei. [Cake](https://www.cake.me/companies/chuangle/jobs/ai-quantitative-modeling-engineer). Finance + ML, direct employer.

Not in the eight, still worth watching: Appier Research Scientist (Generative & Agentic AI) — stretch, and Appier is already used on the intern; WorldQuant QR — named watchlist, different interview game; Cyberon LLM/Agentic — closest agent-platform FT.

After a human Submit, return `blowback.job_receipt.v1` with `shot_id`, `submitted_at`, and an application id or receipt URL. `SUBMITTED` without that evidence is invalid, same as FIRE.

## Browser contract (short)

AUTO: open the URL, fill facts from the private authority file, upload the named CV variant, save draft.

HUMAN GATE: CAPTCHA, 2FA, 104 cookies, terms, eligibility attestation, final Apply/Submit.

FORBIDDEN: invent work authorisation, bypass anti-bot, click final Submit, put phone/email into this repository, enqueue one queue block per role, paste Gauntlet words (`FIRE`, `bounded`, `G4`) into the application.

## What this does not do

It does not send the NYCU / NTHU referee emails (30 September; NYCU office dark 25–28 Sep). It does not apply on 104 while cookies are expired. It does not turn 43 intern rows into a full-time 104 catalog — that is a crawl-config change on the existing 07:00 job, not a new HTTP client.
