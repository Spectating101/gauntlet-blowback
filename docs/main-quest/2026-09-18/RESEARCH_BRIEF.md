# Learning from the software built to solve a problem

Christopher Ongko · Proposed doctoral research

Before building a new system, I want to understand what other people have already tried. A project's documentation may explain its features, a paper its method, and an issue thread where it breaks. Reading those sources separately can tell me a great deal about one project. It is harder to use them to compare the different approaches to a problem.

With Refinery, I want to study a problem through the software built to address it. For data reconciliation, that means comparing the methods used to join inconsistent datasets and the assumptions each method makes. The aim is to understand where approaches overlap and what gaps remain. Reusing a component may follow from this work, but understanding the field is useful even when none of the available implementations is suitable.

## The research problem

Consider two systems that both describe themselves as data-cleaning tools. One may match records across sources; another may standardize column formats without resolving record identity. Grouping them under the same label says little about whether they are alternatives, complementary tools, or solutions to different problems.

I want an AI system to explain those differences from the underlying material. It should describe what a system does in ordinary technical language, link that description to its sources, and compare it with other attempts. Categories should emerge from those comparisons and remain open to revision. A fixed catalogue of product types would limit what the system can discover.

The question I would begin with is: **can an AI system explain how different software projects address the same problem, with enough source detail for a researcher to check its conclusions?** I am interested in whether it can identify meaningful similarities across different terminology, preserve important differences, and recognize when the available material is too thin for a comparison.

## Where my work fits

I am completing a finance master's at Yuan Ze University and work as a research assistant preparing cryptocurrency data. My work includes collecting data from several endpoints, reconciling fields and coverage, and building panels for analysis. These are concrete examples of problems for which finding a relevant tool is only the beginning: its assumptions still have to match the data and the research question.

My software projects give me different ways to investigate this. Nocturnal connects public reporting to earlier records and later corrections. Hardware Splicer organizes electronics-design material for review before fabrication. In Cite-Refinery, I have implemented project-local software records, execution histories and experiment-linked component sharing. That last project supplies part of the infrastructure for testing an implementation; it is separate from Refinery's larger research aim of understanding the available approaches.

In doctoral work, I want to test how much these descriptions help another researcher understand a problem, and where the comparisons are misleading. That requires a way to evaluate the result beyond whether the software runs or its explanation sounds plausible.

## A first study

I would start with one manageable problem: reconciling tabular data from different sources. The corpus would include openly available projects and their documentation, with versions recorded so that the analysis can be repeated. I would compare keyword and embedding-based retrieval with a system that reads source material to describe each project's approach, then uses those descriptions to answer comparison questions.

The task would be more demanding than finding a relevant repository. For example: identify approaches to matching records when identifiers are missing, explain what each requires from the input, and distinguish a documented capability from one merely suggested by a project description. The output would include short comparisons with source passages that a reader can inspect.

I would ask independent readers familiar with the problem to examine the same material and record the distinctions they consider important. Their disagreements would remain in the evaluation set. A method would not receive credit merely for reproducing one annotator's preferred categories.

All conditions would use the same corpus and a stated resource budget. Evaluation would cover missed approaches, incorrect descriptions and unsupported relationships, as well as the time needed to produce a usable comparison. Some questions and project families would be held out during development. Repeated runs on one question would measure model variability, not count as new independent research problems.

A small pilot would establish the workload and expose ambiguities in the scoring. I would then fix the questions, evaluation rules and main comparisons before the larger experiment. The study should be able to show that a richer representation adds little value, or that its reading cost outweighs the improvement. That would help identify which parts of the system are worth pursuing.

## What would follow

The next question would be whether the method transfers to another domain, such as citation matching or correction tracking. I would look for changes in the kinds of source material and distinctions that matter, rather than simply reuse the first domain's categories.

Software reuse would be a separate extension. Once the system can explain the available approaches, I could test whether those explanations help a researcher or agent choose and run a component on a new task. Cite-Refinery provides a place to record those trials. This would connect the research to practical construction without making reuse the only measure of whether the system is useful.

My longer-term interest is how far AI can help investigate complex problems by organizing scattered technical work into an account that people can question and improve. A doctorate would give me the grounding in information retrieval and software analysis to pursue that seriously, alongside the experimental training needed to distinguish a convincing demonstration from a result that holds up across problems.
