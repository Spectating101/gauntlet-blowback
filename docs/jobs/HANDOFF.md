# Gauntlet JOB handoff — 2026-09-22

The product of the scrape is the curated dataset, not an 8-row firing list.

Treat `data/jobs/curated.sqlite` / `curated.csv` / `curated.json` as the working set. `handoff.json` is only `fire:next` packaging. Do not paste 1,177 generic 工程師 rows into the unattended queue or into `gauntlet-master.json`.

## Files

| Path | What it is |
|---|---|
| `data/jobs/curated.sqlite` | Keep set (133), prototype fit scores |
| `data/jobs/curated.csv` / `curated.json` | Same keep rows |
| `data/jobs/live-jobs.json` | Live 1,177-row dump used to regenerate curated |
| `data/jobs/live-pipeline.csv` | Same live board, annotated |
| `data/jobs/snapshot.sqlite` | `live` (1,177) + `curated` (133) in one queryable DB |
| `data/jobs/boards/yourator.csv` | Live Yourator (542) |
| `data/jobs/boards/cake.csv` | Live Cake (376) |
| `data/jobs/boards/lever.csv` | Live Lever (108) |
| `data/jobs/boards/greenhouse.csv` | Live Greenhouse (71) |
| `data/jobs/boards/104.csv` | Live 104 intern/corridor (43) |
| `data/jobs/boards/remoteok.csv` | Live RemoteOK (21) |
| `data/jobs/boards/web3career.csv` | Live web3.career (16) |
| `data/jobs/boards/tw_jobs-listings.sqlite` | Historical TW scrape listings only (33,536; Yourator/Cake/1111/ATS). No descriptions. |
| `data/jobs/boards/104-listings.sqlite` | Historical 104 intern/corridor listings only (43,393). No descriptions. Recruiter phones/emails redacted. |
| `data/jobs/handoff.json` | Optional `fire:next` pointer |
| `scripts/job-watch.py` | Regenerator |
| `scripts/pack-job-datasets.py` | Rebuilds the public packs from a live JSON + Molina DBs via env |

Raw Molina `104.db` / `tw_jobs.db` stay off GitHub (~140MB each; they hold full job descriptions). Set `JOB_WATCH_TW_JOBS_DB` / `JOB_WATCH_104_DB` locally, then `npm run jobs:pack`.

Applicant contact, cookies, and CV PDFs stay in the private authority file. This public repo must not receive them.

## Curated dataset (as of 2026-09-22)

From 1,177 reachable live rows: **133 keep**, 52 employers. Verdict is **prototype-centroid fit** (character n-grams + CJK shingles vs keep/skip role documents), plus employer-class adjustments (agency, OEM, watchlist). It is not `title contains AI or 工程`. Agencies, generic OEM software, senior-titled, BD/sales intern, and civil/frontend intern noise are skip (they remain in `live-pipeline.csv`).

Columns `fit_pos`, `fit_neg`, `fit_margin` are in the sqlite/CSV so a row can be audited.

| Slice | Rows | When takeable |
|---|---:|---|
| Intern / BAP now (AI, data, quant, research) | 29 | **now** |
| Full-time from 2027-01 | 104 | graduate work window |
| Tier A | 78 | intern, watchlist with real fit, quant, or high margin |
| Tier B | 55 | other keep |

Largest employers in keep: Binance 45 (BAP AI/DS/quant, not the QA/iOS/ledger tracks), 國泰金控, WorldQuant, Appier.

A title that never appeared in a keyword list still keeps if it sits on the keep centroid (`LLM post-training researcher` is the test for that).

```bash
sqlite3 data/jobs/curated.sqlite \
  "select timing, family, count(*) from jobs group by 1,2 order by 1,3 desc"
sqlite3 -header -csv data/jobs/curated.sqlite \
  "select company, title, pay, url from jobs where timing='now_intern'"
```

Regenerate from the existing dump (no 104 HTTP):

```bash
npm run jobs:curate
# or
python3 scripts/job-watch.py --from-json output/phd-taiwan-2027/live-jobs-2026-09-21.json \
  --keep-only \
  --curated data/jobs/curated.csv \
  --curated-json data/jobs/curated.json \
  --curated-db data/jobs/curated.sqlite
```

`verdict=keep` is this table. `maybe` (senior profile, AI-shaped software, intern PM/gig) is not written unless you drop `--keep-only`.

## How it maps onto Gauntlet

- Master JOB records stay a named-employer watchlist (Binance, WorldQuant, …). Empty `execution_manifest` is expected.
- `live-pipeline.csv` is the live board.
- `curated.*` is what to work from.
- `handoff.json` is one packaged shot at a time for a browser agent. A returned `blowback.job_receipt.v1` is how a shot leaves that tiny queue.

## Inventory vs curated

| Slice | Roles | Note |
|---|---:|---|
| Live reachable scrape | 1,177 | Taiwan or remote without a foreign-region lock; 14-day window |
| Generic software / OEM 工程師 | majority | inventory, skip |
| This curated keep set | 133 | prototype fit, no agency |
| Intern in keep | 29 | student + ARC **now** |
| Senior / staff / 資深 | 265 in live | skip unless explicitly junior; some profile seniors are `maybe` |

## Sources, honestly

| Source | In this snapshot | Notes |
|---|---|---|
| Yourator / Cake / 1111 / ATS in `tw_jobs.db` | majority | Yourator cron on this Optiplex wrote the DB at 19:30 on 2026-09-21 |
| Cake live overlay | extra unique URLs | public search API; some rows are `TWD 0~0` — treat as not stated |
| `104.db` | intern/corridor crawl | not a full-time 104 catalog |
| 104 HTTP | **not used** | 403s; do not hammer |

## Browser contract (short)

AUTO: open the URL, fill facts from the private authority file, upload the named CV variant, save draft.

HUMAN GATE: CAPTCHA, 2FA, 104 cookies, terms, eligibility attestation, final Apply/Submit.

FORBIDDEN: invent work authorisation, bypass anti-bot, click final Submit, put phone/email into this repository, enqueue one queue block per role, paste Gauntlet words (`FIRE`, `bounded`, `G4`) into the application.

## What this does not do

It does not send the NYCU / NTHU referee emails (30 September; NYCU office dark 25–28 Sep). It does not apply on 104 while cookies are expired. It does not turn intern 104 rows into a full-time 104 catalog.
