# Case-study card — Research Drive persistence and execution truth

## Current disposition

**IN PROGRESS — strong contract tests, exact RC3 candidate and complete fresh-data journey not yet frozen.**

## Candidate/topology finding

The clean `ops/rc3-auto-preview` worktree is at `62284a59a00dd16defba6aa6c6054eec4a24097d`, 371 commits ahead of local `main` (`14a9a3c65766e26e6c3da105faad02f5603482bd`). It contains substantial product/runtime work, not merely packaging.

The ordinary `yzu-cluster` worktree is on `feature/discover-sufficiency` at `db8e43c` with untracked generated evidence. It was not modified.

This means the next certification must first designate one exact RC3 product/runtime candidate. The RC2 manifest cannot be repurposed as authority for the later RC3 lineage.

## What passed on the clean RC3 preview head

### Frontend/runtime contracts — 28/28

- metadata-only remains distinct from registered and query-ready;
- source, verification, revision, manifest and lineage proof are preserved;
- absence of proof does not become verification;
- connectors keep credential/rate-limit/access uncertainty explicit;
- running/failed/blocked jobs preserve bounded progress and output proof;
- one research asset identity survives Discover, cluster execution, Synthesis and Library;
- partial payloads remain unknown rather than inventing access or registration;
- transport handles final NDJSON events, FastAPI details and bounded abort signals;
- worker capability matching blocks incompatible assignments without overclaiming unknown inventories.

### Interop/backend contracts — 32/32

The Python interop suite passed across API, connectors, contract, fencing, reliability, resources and worker tests. This is good evidence for contract behavior and retry/fencing design. It is not a fresh served journey.

## Release-authority result

`npm run release:verify` failed because the branch changes 40 product/runtime files after the accepted RC2 public SHA. That is the correct behavior of the immutable RC2 verifier: it prevents later RC3 work from masquerading as the accepted RC2 package.

This is not evidence that RC3 is broken. It is evidence that RC3 lacks its own exact-candidate release authority.

## Exact missing closure

1. designate one immutable RC3 frontend/backend/runtime candidate;
2. create an RC3 manifest instead of weakening the RC2 verifier;
3. ingest a genuinely fresh, non-demo source;
4. preserve its raw bytes, identity and provenance;
5. move the same object into synthesis and produce an output;
6. restart and prove the source/output identities survive;
7. force one worker failure, then retry safely;
8. prove no duplicate artifact and no falsely complete state appear;
9. bind commands, versions, receipts and limitations to the same candidate.

## Strongest current claim

Research Drive has mature, passing internal contracts for evidence identity, lifecycle truth, worker compatibility, transport and interop fencing on the inspected RC3 preview head.

## Strongest nonclaims

- no exact RC3 paired release is currently designated by this audit;
- no fresh non-demo ingest-to-synthesis journey was executed here;
- no independent operator certification is implied;
- RC2 acceptance does not validate later RC3 product/runtime changes;
- unit/contract tests do not establish deployment reliability.

