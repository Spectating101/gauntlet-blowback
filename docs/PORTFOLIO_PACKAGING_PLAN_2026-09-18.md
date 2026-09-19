# Portfolio packaging plan — 2026-09-18

Verified state of each asset, what "finished enough to enter routes" means for it, and who does the work.
Supersedes the maturity figures in `data/portfolio-assets.json` (as-of 2026-09-01), which are stale.

## Verified state (re-checked 2026-09-20)

| Asset | Public | Head | Tests (re-run) | Verified state |
|---|---|---|---|---|
| Hardware Splicer | yes | `76e92ee` on `package/hs-paired-advisory-runner-20260919` | — | Frozen candidate and claim boundary; matched advisory runner added. `PAIRED_EVALUATION_READY` still false. |
| SolarPunk / Policy Lab | yes + live site | `655c51e` on main | — | `public-lab-v1.0`; CPT-001 Cape Town case with fail-closed negative controls added 2026-09-19. |
| Refinery | **no** | `c617a4f` on main | **476 passed**, 8 skipped | Claim boundary written; one local RFC 3986 capability completes end to end. Secret scan clean. Private; Actions blocked on account billing. |
| Cite-Agent | **no** | `792f4d35` on package branch | — | Local served journey only; main and Vercel not on that SHA. Still deferred by the user. |
| Research Drive | yes | `f4b84c3` on main | — | Restart-safe ingest landed 2026-09-19; no longer cold. RC2 tag unchanged. |
| Nocturnal Oversight | **no** | `191c5fa` on main | **411 passed** | Evaluator path fixed; marked product-complete by the agent. User lane. |

## Definition of finished

An asset is finished enough to carry an external route when all of:

1. a named candidate revision (tag or release) exists and the package claims bind to it;
2. its own test suite passes, or every failure is documented as an accepted limitation;
3. a written claim/nonclaim boundary exists, as Hardware Splicer has;
4. a reviewer can reach either the code or a described artifact without asking the user for access.

Point 4 is why the 404 repositories matter: the CV can say "private, shared on request", but a private
repository cannot carry a route that depends on inspection.

## Work order

### 1. Refinery — fix the 9 failing tests  (operator, DONE 2026-09-18, commit 57e57f0)

The failures are not flaky. Two new modules (`github_tree_snapshot_v1.py`, `source_index_v1.py`) import
`re`, which violates the project's own no-regex rule, and the remaining failures cluster around the same
recent indexing work: source-index UI shape, atlas edge semantics, portable-asset determinism, and the
canonical serve entrypoint.

Either the new modules are refactored to satisfy the existing rules, or the rules are retired deliberately
and the tests rewritten. The operator will attempt the refactor first, because the rule is load-bearing:
"no script brain" is what makes Refinery's claims checkable.

Then: add a CI workflow, cut a tag, and write a claim boundary modelled on Hardware Splicer's.

### 2. Research Drive — state its currency honestly  (operator)

The repository is public but two months cold with 7 test files. No route should lead with it. Refresh the
README to describe the actual RC2 state, or mark it explicitly as internal. Do not tag new work that does
not exist.

### 3. Repository visibility  (user decision)

Refinery, Cite-Agent and Nocturnal are private. Making Refinery public after step 1 is the highest-value
change. Cite-Agent and Nocturnal may hold material the user does not want public; the operator will not
publish a repository on the user's behalf.

### 4. Leave alone

- Hardware Splicer and SolarPunk are done; further polish has no route value.
- Cite-Agent stays deferred until the user reopens it.
- Nocturnal stays in the user's lane.

## CV consequences already applied

- systems reordered: SolarPunk first (public, live, connects to the papers), Hardware Splicer second
  (strongest evidence), research assistant tools third, provenance tools fourth;
- the visibility line now names only the public repositories and states the rest are private on request.

## Housekeeping 2026-09-20

- gauntlet-blowback is **public**: a personal phone number had been committed in the CV builder and the
  Shih Hsin manifest. Both now resolve it privately (`6566c57`); `output/`, `tmp/` and `reports/` are ignored.
  The number remains in earlier public history; rewriting that history is a user decision.
- Solarpunk-bitcoin (public) holds 148 uncommitted research files, including licensed Refinitiv data and thesis
  drafts. They must not be committed there. Backed up privately to
  `gdrive:Portfolio_Backups/Solarpunk-bitcoin-uncommitted-2026-09-20` and verified file-by-file.
- yzu-cluster: 18 fully merged local branches pruned; primary checkout moved to `origin/main`.
  `/tmp/yzu-cluster-package` still has 2 uncommitted files and was left in place.
