# Portfolio capability assessment — 2026-09-09

## Question and conclusion

Do these projects realize their intended capabilities, beyond having enough material for an application?

**Not uniformly.** The portfolio contains substantial working systems. Some have coherent research cores awaiting operational evidence; others still have concrete integration or correctness gaps. Passing tests, canonical publication, research validity, complete product behavior and submission readiness remain separate findings.

This is a source-and-execution assessment of the revisions below, not a whole-portfolio certification. It supplies development and verification briefs. It does not authorize portfolio code changes, deployments, applications or new claims.

## Scope and method

- Inspected product authority documents, implementation paths and selected tests in isolated checkouts fetched from GitHub. Used current identified integration candidates where newer work existed; did not assume default branches represent the latest product.
- Ran local checks listed below. Most Python runs used the host Python 3.13 environment, not fully reconstructed release environments. Refinery was additionally tested in an isolated environment. Missing dependencies are identified separately.
- Did not run signed-in browser journeys, paid model calls, full deployment certification, physical fabrication, real financial execution or independent field trials.
- Intended scope comes from current product contracts, not every historical ambition. An absent observation is a verification gap, not proof that a capability is absent.
- Test counts measure exercised checks, not completion percentages. Repository declarations and stored receipts are not independently repeated results unless explicitly noted.

### Revision ledger

All repositories below belong to `Spectating101`. Source paths in each finding are relative to the listed repository and revision.

| Asset | Repository / assessed ref | Exact revision |
| --- | --- | --- |
| Public-Good | animal-charity / main | b728666307149dacf64d5859ec99e6e23190baab |
| Hardware Splicer | hardware-splicer / release/reuse-first-product-rc-20260901 | c209ede15c51653acb82c3d372654d22d0e2816b |
| Nocturnal | nocturnal-oversight / main | 736c4b74c653f191b462efeb988cb89482c99f05 |
| Refinery | alpha-platform / consolidation/refinery-canonical-tool-v1 | 35ee86d1700f6604535f2c382349ccc4185ea6d7 |
| Sharpe / Terminus | sharpe-terminus / agent/portfolio-pilot-transactions | a99d02ebca5d358594f43fd1a0b9eedd1a20583e |
| Policy Lab | solarpunk-coin / main | 55fd6f2cf2eed25b589e91b5e3161e6ced68f5de |
| Citation Engine | citation-engine / main | 2de452b8ea1e6b54c93d2ada009f2d3b76c9bcab |
| GeoMap | geomap-arbitrage / main | 9efcd3508e7f0904fd9fb241c9c86e08d586afc6 |
| Cite | cite-agent / integration/cite-c4-release-candidate-20260908 | c611c61d312422d1e99aa016354b0301afa2a6b1 |
| Research Drive frontend | yzu-cluster / integration/research-drive-final-release-20260906 | 78e10a30334701767e339d3d74f3ea3718aee903 |
| Research manuscripts | solarpunk-portfolio-review / master | 0be17a216acb30eac94e648cec318c21f211338b |
| Gauntlet | local feat/calendar-application-onboarding | ef1614778d642f8bd843e9aef555e1b15aeb5821 |
| Supplemental integration: Cite–Refinery | cite-refinery / main | 13e8026329c26434300d70e72e7a77c315af366e |

Research Drive's private-backend lineage was not separately certified in this pass. A frontend result is not a frontend/backend deployment result. Gauntlet's revision is the existing local working branch, not a claim about published main.

## Assessments and executable briefs

### 1. Hardware Splicer — substantial engine, incomplete mission integration

**Intended capability:** inventory → goal → candidate designs → resolve unknowns → verify → usable build package, including reuse/buy/fabricate choices, interfaces, assembly and test instructions. Product authority: `docs/gauntlet/HARDWARE_SPLICER_PRODUCT_RC.md`.

**Observed:** 27 selected reuse/API/bench/BREP tests passed; one actual CadQuery-kernel test skipped. These are not full browser or physical-build tests.

**Confirmed gap:** `apps/circuit-ai/circuit-ai-frontend/components/workbench/reuse-mission-overview.tsx` imports candidates and the target from `lib/workbench-constructor-demo.ts`. Its selected candidate comes from the demo map. The three demo candidates have fixed blocker counts of 3, 5 and 1. The Build package button at line 183 has no action handler, even if its disabled condition were cleared. This finding concerns this mission surface, not every package-export path in the repository.

`constructor-planner-bridge.tsx` does call the real strategy backend, but seeds its payload with the demo target, catalog and fixed constraints alongside donor intake. Real backend code exists; that does not close the mission overview's state/action gap. The inspected convergence browser test mocks backend responses.

**Development brief / acceptance:**

1. Bind mission goal, inventory, candidate projections and blockers to persisted project and planner/evidence revisions. Demo data must be an explicitly selected example, not silent production state.
2. Wire Build package to the actual export path. Unknown/failed checks must block the relevant claims; resolving real evidence must update the gate rather than changing a fixture count.
3. Run two materially different user inventories/goals through the real backend. Demonstrate changed candidates, changed blockers, persistence after reload and an exported package traceable to the selected revision. Do not intercept the planner in this acceptance test.
4. Separately run the exact geometry kernel, then the documented real donor/adapter build. Geometry validity must not become a claim of fit, retention, electrical safety or manufacturability without the corresponding evidence.

### 2. Nocturnal — broad implementation, a confirmed source-trust defect

**Intended capability:** source intake → provenance and independent corroboration → actor/claim review → longitudinal correction and inspectable operator/public outputs. The 1.3 alpha adds a jurisdiction-neutral analysis engine; the public read surface is distinct from authenticated/operator mutation.

**Observed:** 292 tests passed, seven failed. Failures include outdated public seed-route expectations, missing `trafilatura`, stronger corroboration defaults conflicting with old fixtures, actor typing, a sibling-tool path dependency and an old jurisdiction-default expectation. They are not seven equally established product defects.

**Confirmed defect:** `src/fleet_research/corroboration_gate.py:62` classifies authority with substring matches on `netloc`. A local, network-free probe returned:

| Input URL | Actual classification |
| --- | --- |
| https://reuters.com.attacker.invalid/story | press_tier1 |
| https://agency.gov.attacker.invalid/report | official |
| https://reuters.com/story | press_tier1 |

This proves faulty source classification, not that every downstream corroboration gate can be bypassed. The actor-resolution test also exposes “Civic Board” being typed as a person; uncertainty handling deserves examination beyond adding another keyword.

**Development brief / acceptance:**

1. Parse and normalize hostnames and match legitimate exact domains/subdomains with boundary-aware rules. Test lookalikes, credentials, ports, trailing dots and internationalized names. Inspect the trust origin of explicit `source_class` overrides as well.
2. Keep uncertain actor identity/schema reviewable. Test ambiguous organization/person names and corrections without silently manufacturing identity certainty.
3. Reconcile tests with current public/operator and jurisdiction contracts; do not restore unauthenticated writes or weaken source requirements to make old tests pass.
4. Exercise an actual source → claim → review → correction → public snapshot case, including retraction and reload. Use human-labelled cases to assess semantic quality; source counts alone are insufficient.

### 3. Refinery — portable semantic tool works; general execution remains unproven

**Intended capability:** discover existing capabilities, inspect evidence, identify missing proof, admit appropriate modules and execute only under explicit mappings. Current product lives in `experiments/slop-refinery-poc`, not the legacy root Sharpe description. See its `docs/OPERATOR_LOOP_V1.md`.

**Observed:** portable CLI self-check passed: six capabilities, nine implementations, 22 claims, **zero execution mappings**. Cite and HS were admitted as semantic-only, explicitly without imported execution authority. This is valid restricted behavior, not a working cross-project executor.

The isolated broad unittest run executed 301 tests with five failures, five errors and six skips. Contract discrepancies include frozen surface census 46 versus 45, reliability/closure fields and state expectations, a no-regex policy disagreement, and empty canonical `uv` lookup. One portable-install error was environmental: after installing setuptools/wheel, all three portable-asset tests passed. The entire suite was not rerun after that dependency repair; do not report the original install error as an unresolved code defect.

**Development brief / acceptance:**

1. Classify each remaining test discrepancy against the current authority contract. Update stale expectations only with a documented reason; preserve genuine stop/review behavior.
2. Reconcile the frozen surface manifest and canonical tool lookup with provenance. Stale portfolio observations must be identified rather than presented as current execution evidence.
3. Demonstrate one explicitly authorized consumer task through resolve → provider execution → evaluation → reuse receipt, including provider failure and stale-mapping refusal. Do not turn all semantic imports executable.
4. Repeat clean installation and supported interfaces with declared dependencies. Separate deterministic self-check from an independent adopter actually using the tool.

### 4. Cite — newer candidate is stronger; verify the served research journey

**Intended capability:** connected Library, Chat, Empirics and Project workflows, including grounded research and manuscripts, without forcing every user through one rigid sequence.

**Observed:** current release closure passed 11 hard invariants and five declared blocker checks, reporting zero open blockers. Forty selected release/backend/attestation/reachability tests passed. However, `scripts/verify_cite_release.py` in fast mode stopped at `api-inference-routes`: the governed API authority installation was unhealthy in this checkout. Static closure is therefore not a complete release pass. Old candidate failures must not be substituted for this newer candidate's results.

**Verification-first brief / acceptance:**

1. Establish the declared API/provider installation and repeat fast, then full release gates on the exact served frontend/backend pair. Record configuration failures separately from code defects.
2. Complete a fresh question → actual source bytes/locators → grounded result → empirical run → manuscript/export journey, plus an independent Library entry path.
3. Change or invalidate an underlying result and show that affected citations, conclusions and exports update or block. Inspect correctness, not just the presence of citation fields.
4. Verify restart continuity and provider/model traceability. Create development tasks from failed lived workflows, not a speculative feature wishlist.

### 5. Research Drive — strong tested contracts, live paired operation outstanding

**Intended capability:** discover and procure actual research material, preserve bytes and provenance, organize a library, and synthesize reusable assets with honest worker/job state.

**Observed:** current candidate passed 520 candidate-key UI logic tests, 44 runtime-contract tests and 32 Python interoperability reference tests. These do not establish that the separate deployed backend implements every reference-runtime behavior.

**Verification-first brief / acceptance:** pin the actual frontend/backend pair; ingest a fresh non-demo dataset/document; inspect real bytes, provenance and synthesis output; reopen after restart. Force a worker failure and transport retry and verify no duplicate artifact, falsely completed job or lost error scope. Show that cataloguing an asset does not by itself establish its quality/readiness. Backend gaps require backend evidence, not assumptions from the frontend suite.

### 6. Public-Good — coherent research control plane, field loop not established

**Intended capability:** evidence → bottleneck diagnosis → accessible capability → appropriate action proposal → external decision → outcome feedback. The domain adapters and ledger are substantial, not a README-only project.

**Observed:** `make verify` passed 182 tests, all smoke targets and compileall. Repository evidence distinguishes synthetic R0 and retrospective disaster R1 evidence from field adoption. Docker and real operator use were not rerun here.

**Maturation brief / acceptance:** run one configured domain through actual intake, case revision, proposal, human/operator decision and follow-up. Demonstrate that new observations change the case and that absent follow-up is not counted as success. Preserve replay/provenance through correction. Only then assess a limited assisted pilot; do not convert internal verification into effectiveness or deployment claims. The README's undeclared licensing needs an owner decision if redistribution is required.

### 7. Policy Lab — relatively coherent research product, not a financial launch

**Intended capability:** inspect case evidence and assurance, compare constraint/policy admission, examine settlement stress and export a reproducible research result. Use `CURRENT_SURFACE.json` and current workbench authority rather than the historical token roadmap.

**Observed:** surface/preflight checks passed; constraint-core passed 92 tests after installing its declared `ethers` peer dependency. Four controlled cases are explicitly non-empirical. The separate public Ausgrid checkpoint has limited L0 evidence; it is not owner verification or legal approval. Browser, frontend build and independent outside-case reproduction were not rerun.

**Maturation brief / acceptance:** take a genuinely new case through evidence intake, policy comparison and portable export; reproduce it independently; reject a tampered or insufficient-evidence variant; inspect UI error explanations and units. Evaluate whether the policy comparison changes meaningfully with evidence and assumptions. Build only the missing parts that this exercise reveals. A token launch or financial institution is not this product's completion criterion.

### 8. Citation Engine — bounded substrate, not an entire research assistant

**Intended capability:** neutral evidence objects, provenance, assertions/citation edges, inspectable decisions and portable bundles for consuming projects.

**Observed:** 54 tests passed. GeoMap and Cite–Refinery contain consumers, but their existence is not proof of robust interoperability across all real workflows.

**Maturation brief / acceptance:** produce a bundle in one actual consumer, load/verify it in another, preserve locators and provenance, and reject tampered/missing evidence. Exercise schema/version incompatibility and deterministic round trips. Judge it against this substrate contract, not against Cite's full user interface. No specific new substrate defect is established by this pass.

### 9. GeoMap — real seed engine, early relative to its intended scope

**Intended capability:** person/place/resources → locally supported opportunity → full costs and constraints → actionable playbook → observed outcomes. README and roadmap explicitly place adapters, richer compilation, map surfaces and outcome learning beyond the seed stage.

**Observed:** ten tests passed using fictional North Harbor cases. `src/geomap_arbitrage/cli.py` defaults every command's `--as-of`, including `assess`, to **2026-08-24**. A normal assessment reproduced that old date on September 9. Deterministic demo time is legitimate, but it can misrepresent freshness if silently used for current assessments.

**Development brief / acceptance:** keep a fixed demo clock but require or derive an explicit current clock for real assessments, recording it in receipts. Add one genuine evidence intake path and one real person/place case with costs and uncertainty. Alter freshness and constraints and verify changed conclusions; record a real outcome without treating an untried recommendation as success. A broad map/feed expansion can follow that vertical slice.

### 10. Sharpe / Terminus — decision research, incomplete operational evidence

**Intended capability:** adjudicate capital alternatives, including cash/HOLD, with point-in-time universes, causal and multiple-trial discipline, risk constraints and forward evidence. Plans are not live trades.

**Observed:** focused tests: 91 passed, one failed because optimizer output fell back to equal weights. `pypfopt` is absent from the tested environment, so this is not established as an optimization defect. Broad test collection also failed on a missing legacy `idn_retail_gdelt_lib` import. The current legacy research entry point delegates to the causal implementation despite stale root README language. Transaction plans explicitly remain plan-only.

**Maturation brief / acceptance:** establish the documented optimizer/test environment; prove point-in-time membership including delistings; connect the selected-stock cockpit to canonical causal TargetPortfolio/risk authority. Replay as-of decisions without future leakage, verify HOLD behavior and costs, and collect genuinely forward observations. Historical backfill is not elapsed prospective validation. Do not add broker execution merely to claim completion.

### 11. Research manuscripts — reproducible diagnostics, not blanket scientific clearance

**Intended capability:** manuscripts whose material results, methods, interpretation and disclosures are reproducible and internally consistent.

**Observed:** independently recomputed the committed stablecoin/M2 diagnostic without running its hardcoded-path writer. The original 42-observation levels regression yields beta 8.860592 and Durbin–Watson 0.207168; the 41-observation differenced model yields beta 3.708656 and Durbin–Watson 0.964697. This confirms material specification sensitivity; it does not settle validity or causal interpretation.

`eci_reproduction/scripts/eci_stablecoin_m2_diagnostics.py` hardcodes another local tree for input/output. `FIXES_NEEDED.md` records additional manuscript arithmetic, citation, disclosure and interpretation concerns. Those labels are repository assertions; this pass did not independently revalidate every listed literature claim or the latest external manuscript.

**Development/research brief / acceptance:** make reproduction paths portable; freeze input hashes and dependencies; rebuild all material tables from source; propagate changed results into the chosen manuscript, not just a diagnostic note. Resolve the recorded issues against the actual final document, distinguishing confirmed corrections from unresolved research questions. Obtain the author's factual disclosure where necessary. Do not use software tests as scientific validation.

### 12. Gauntlet — useful control plane, unattended conversion not demonstrated

**Intended capability:** recurring discovery → eligibility/project assessment → route-specific packaging → live preparation → protected human action → receipts → follow-up and outcome learning.

**Observed:** this local branch passed 148 core tests. FIRE produces an execution contract; it is not itself a running Chrome operator. The inspected daily radar-smoke workflow runs five live checks with `continue-on-error: true` and uploads artifacts. That establishes scheduled reconnaissance/testing, not a demonstrated discovery-to-reviewed-queue-to-application service.

**Development/verification brief / acceptance:** connect scheduled discoveries to a durable deduplicated review queue; apply capability and entry-specific QA before promotion; provide a resumable operator worker with explicit scoped authority. Exercise three distinct portal families using the real browser, with saved drafts, session recovery, one failed route that does not stall the others and no duplicate applications. Demonstrate pause/resume at protected gates and receipt-backed completion. Existing Chrome sessions can remove login friction; they do not resolve missing evidence, consent or CAPTCHA. Adaptive Chrome does not require hardcoded selector maps.

### Supplemental: Cite–Refinery — useful integration skeleton, real adapters next

**Intended capability:** research → grounded claim → capability → execution → evaluated experiment → promotion/reuse dossier.

**Observed:** eight tests passed, including actual subprocess execution. The grounding integration test uses `FakeCite`. The CLI adapter's successful process exit is not proof of a correct semantic grounding verdict. README explicitly lists structured Cite/MCP and current Refinery-provider adapters as subsequent work.

**Development brief / acceptance:** connect a real structured Cite grounding result and one admitted Refinery provider. Preserve claim locators, capability/version, executed inputs, evaluation and promotion lineage end to end. Reject a successful process whose semantic result fails the evaluator. Test provider failure and stale evidence before claiming a complete research-to-reuse loop.

## Work ordering and reassessment contract

1. **Confirmed correctness/integration repairs:** Nocturnal source classification; HS mission state/Build action; GeoMap real-assessment clock. Refinery's contract discrepancies require classification before edits.
2. **Verification before speculative development:** current Cite and Research Drive served journeys; Policy Lab new-case reproduction; Citation Engine cross-consumer round trip.
3. **Intended-capability completion:** real Cite–Refinery execution, Public-Good operator feedback, GeoMap evidence/outcomes, Sharpe point-in-time and forward validation, manuscript rebuilds.
4. **Gauntlet conversion:** consume these distinctions now. A well-scoped research application may proceed while a product is unfinished; an application must not advertise the missing capability as delivered. Full product completion is not a universal submission prerequisite.

For each builder handoff, include the exact base SHA, intended user outcome, confirmed defect versus unknown, relevant brief above and preserved nonclaims. Return the resulting SHA, reproducible commands, actual receipts/artifacts, negative-case results and outstanding limitations. The assessor reruns the affected checks and at least one real workflow before upgrading the finding. No self-reported “done” or aggregate test count automatically changes maturity.

## Reproduction record

Transient audit checkouts and logs are under `/tmp/gauntlet-capability-audit-zbzEIA`; the durable record is this report and its exact revision ledger. Temporary logs may be removed by the host. No portfolio source changes or GitHub writes were made.

| Project | Executed command / scope | Log basename |
| --- | --- | --- |
| Public-Good | `make verify`, with Python available on PATH | animal-charity.verification.log |
| Citation Engine | `PYTHONPATH=src:. python3 -m pytest -q` | citation-engine.verification.log |
| GeoMap | `pytest -q`, source paths include Citation Engine | geomap-arbitrage.verification.log |
| Cite–Refinery | `PYTHONPATH=src python3 -m unittest discover -s tests -v` | cite-refinery.verification.log |
| Nocturnal | `python3 -m pytest -q` | nocturnal-oversight.verification.log |
| Sharpe | broad tests, then `tests/test_*.py` | sharpe-terminus.verification.log; sharpe-focused.verification.log |
| Refinery | isolated `unittest discover -s tests -v`; portable asset retest after build dependency installation; portable CLI self-check | refinery-clean.verification.log; refinery-portable-retest.log |
| Policy Lab | surface/preflight, constraint-core tests with declared peer installed | policy-lab.verification.log; policy-core.verification.log |
| Research Drive | `npm run test:candidate-key`; `npm run test:runtime-contract`; `test_yzu_interop_*.py` | research-drive.verification.log; research-drive-runtime.verification.log |
| Cite | closure gate, five selected test files, fast release verifier | cite-closure.verification.log; cite-tests.verification.log; cite-fast.verification.log |
| Hardware Splicer | derivative_reuse, capability_reuse_api, bench_capture_evidence, bench_capture_bridge, mechanical_brep_adapter test files; live vision disabled | hardware-splicer.verification.log |
| Gauntlet | `npm run test:core` | gauntlet.verification.log |

The Nocturnal hostname probe and paper calculation were separate read-only calculations. Their results above are narrowly scoped; no live hostile-site interaction or financial recommendation was performed.
