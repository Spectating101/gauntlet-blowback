# Nocturnal final closure — historical plan superseded

Reconciled 2026-09-18. This earlier candidate-closure plan is no longer active.

RC2 #29 and V3 #30 are merged in the Nocturnal repository, and RC1 #15 is closed as superseded. The product integration is `12ece15ec6042dec786ef50006db2f92251a7840`; portfolio freeze is `ceb0551e0c148476c51b40b8ffef1713f33efd55`.

Current authority is [Nocturnal portfolio closure](NOCTURNAL_PORTFOLIO_CLOSURE_2026-09-17.md), [the asset supplement](../data/portfolio-assets-supplement-2026-09-17.json), and [the conversion execution brief](nocturnal-conversion/EXECUTION_BRIEF_2026-09-17.md). The supplement's Nocturnal row has been reconciled into the asset registry on this integration branch.

The old plan remains inspectable at Gauntlet commit `83e4bd02626f7f00fc451a955268b3341ac6525c`. Do not execute its pre-merge closure sequence again. Product engineering stays frozen unless a reproducible defect, evaluator/pilot finding, or concrete route requirement earns a repair.

Product completion is not independent validation, adoption, or a final V3 exact-head hosted UI pass. External human-labelled validation remains absent. PR #54's TFC staging record is historical and unsent; it does not establish that the same live browser session is still prepared. Revalidate the session and preserve the human final-Send gate.
