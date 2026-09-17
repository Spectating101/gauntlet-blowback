# Research identity and doctoral concept

Christopher Ongko · Review draft · 18 September 2026

## Research identity

I want to study how AI-assisted research systems can find, evaluate and reuse working software without losing the evidence that made a component useful in the first place. My starting point is a practical gap: a description can make a tool look relevant, while saying little about the exact version, the conditions under which it worked, or whether its evidence applies to a new task.

My preparation combines finance research and software construction. As a research assistant at Yuan Ze University, I build and clean cryptocurrency datasets for academic analysis. That work makes the difference between a recorded value and a defensible research input concrete. Alongside it, I develop software that connects sources, claims, implementation choices and execution records. I now want to turn those engineering choices into a research design that can show where they help, where they create friction and where they fail.

The broader agenda is evidence-aware capability discovery and reuse. A first doctoral study would concentrate on one tractable part: whether task-scoped execution evidence improves component selection and reuse over description-based retrieval alone.

## Proposed study: when does execution evidence improve software reuse?

**Research question.** Given the same candidate components and task budget, does retrieving and checking version-specific execution evidence improve successful reuse on unseen research-data tasks?

**Initial setting.** Use small data-processing tasks with explicit input/output contracts: schema normalization, duplicate handling, date parsing, missingness reporting and transformations of tabular research data. Start with owned fixtures or openly licensed inputs. This keeps outcomes inspectable and avoids making a first result depend on private market data, institutional partners or physical equipment.

**Comparison.** Freeze the candidate pool, task set, evaluator and model configuration. Compare three conditions: description-based retrieval; retrieval with version/provenance metadata; and retrieval with metadata plus task-relevant execution checks. Keep the base model, tools, candidate access and resource ceiling matched. Record extra verification cost rather than hiding it inside a larger compute budget. A separate build-from-scratch baseline can test whether reuse itself is helpful, but it must not be confused with the evidence-checking comparison.

**Evaluation.** Hold out task instances and related task families so near-duplicate fixtures do not leak into the test set. Define acceptance tests independently of the agent's answer. Include stale-version evidence, incompatible schemas, false-positive descriptions and components whose original test conditions do not transfer. Record first-attempt success, final accepted artifacts, unsupported reuse decisions, false rejection of usable components, repair effort and elapsed or token cost. Inspect complete traces for a smaller sample rather than reporting one aggregate score without failure analysis.

**Analysis and decision rule.** Use paired task comparisons and uncertainty intervals, with task family as the unit of generalization. Repeated model runs do not create independent task families. Freeze the main outcome and cost ceiling before the confirmatory pass. Estimate any success gain together with added verification cost; the evidence-heavy condition should not be declared better merely because it abstains more often. Report which checks matter through ablations. No sample size or success threshold is presented as validated before a pilot establishes variability and practical cost.

**Available starting artifact.** Cite-Refinery at `13e8026329c26434300d70e72e7a77c315af366e` provides project-local capability records, execution records and an orchestrated promotion path. Its inspected implementation checks experiment verdict and successful linked execution for executable capabilities. This is infrastructure for an experiment, not evidence that the proposed intervention works. The lower-level kernel exposes different behavior, so the study must freeze and test the actual entry point used rather than claim a universal safety invariant. [S1–S2]

**Extension and limits.** Hardware Splicer provides a later, more consequential dry-run testbed, but its software evidence must not be represented as physical validation. Nocturnal offers a separate source-revision workflow. Cross-domain transfer should be evaluated only after the initial data-task result, not assumed because the projects share terminology. The project does not currently claim novelty over all retrieval, program-repair or agent-evaluation research; a current related-work map is required before a full doctoral proposal is submitted.

**Outputs.** A frozen benchmark, versioned candidate/evidence manifests, evaluator tests, permitted model/tool traces, and a report with positive, negative and mixed results. Begin with a small feasibility pilot, revise the protocol once, then freeze the confirmatory study. Expand only when the first result identifies a useful question rather than simply another feature to build.

## Reusable motivation paragraph

I am applying for doctoral training to connect the systems I build with more rigorous experimental design. Finance has trained me to question whether an observed pattern survives changes in measurement and specification. Software work gives me mechanisms that can be tested directly. I want to develop deeper foundations in information retrieval, machine learning and software evaluation, and use them to study how research systems decide what evidence is sufficient for a particular reuse decision. I would bring implementation experience and a willingness to expose failed assumptions, while expecting supervision to challenge the design rather than merely endorse the existing portfolio.

## Sources and preparation boundary

S1: https://github.com/Spectating101/cite-refinery/blob/13e8026329c26434300d70e72e7a77c315af366e/src/cite_refinery/orchestrator.py  
S2: https://github.com/Spectating101/cite-refinery/blob/13e8026329c26434300d70e72e7a77c315af366e/src/cite_refinery/refinery.py

Personal preparation: F02, F04 and F07 in the source ledger. All comparisons, outputs and study stages above are proposed, not completed experiments. This brief does not designate a master's thesis or a mandatory writing sample, establish supervisor availability, or replace a programme-specific application form.
