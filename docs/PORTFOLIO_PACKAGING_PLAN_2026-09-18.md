# Portfolio packaging plan — 2026-09-18

Verified state of each asset, what "finished enough to enter routes" means for it, and who does the work.
Supersedes the maturity figures in `data/portfolio-assets.json` (as-of 2026-09-01), which are stale.

## Verified state

| Asset | Public | Last commit | Tests | CI | Verified state |
|---|---|---|---|---|---|
| Hardware Splicer | yes | 2026-09-17 | 658 files | 44 workflows | Frozen candidate, published package checksum, written claim boundary. **Done.** |
| SolarPunk / Policy Lab | yes + live site | 2026-09-13 | 57 files | 13 | `public-lab-v1.0`, maintenance mode, forkable. **Done.** |
| Refinery | **no (404)** | 2026-09-18 | **471 pass / 0 fail** | ci.yml added | Suite green, CI added, secret-scanned clean. Awaiting a claim boundary and the user's publish decision. |
| Cite-Agent | **no (404)** | 2026-08-25 | 223 files | 3 | Tagged v1.5.9; deferred by the user pending a readiness audit. |
| Research Drive | yes | **2026-07-11** | 7 files | 2 | `research-drive-rc2`; two months cold, thinnest coverage. |
| Nocturnal Oversight | **no (404)** | 2026-08-06 | 56 files | none | Product spine plus handoff. Early. User lane. |

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
