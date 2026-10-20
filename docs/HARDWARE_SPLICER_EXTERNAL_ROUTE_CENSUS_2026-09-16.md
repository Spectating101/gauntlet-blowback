# Hardware Splicer External Route Census — 2026-09-16

This is the exhaustive companion registry to `HARDWARE_SPLICER_APPROVAL_LIGHT_EXTERNAL_STRATEGY_2026-09-16.md`.

The strategy document ranks the routes worth acting on first. This file intentionally keeps the **whole researched surface**: immediate routes, secondary routes, future recurring calls, closed-but-important cycles, and routes that should be killed or demoted. A route being present here does not mean it should be fired.

Canonical Hardware Splicer truth remains:

```text
main = f892facd67c5124e2362860ebc999625afedc5d5
state = PACKAGED_NOT_PHYSICAL
fabricated = false
assembled = false
powered = false
physical_gates_run = false
physical_correctness = UNPROVEN
physical_authority_granted = false
real_winbond_model_execution = pending
```

## Gate scale

- **G0** — self-service publication/archive; no competitive approval.
- **G1** — objective compliance, technical conformance, ordinary procurement, or light moderation.
- **G2** — ordinary peer/jury/curatorial selection open to eligible submitters.
- **G3** — proposal/resource shortlist before meaningful work can proceed.
- **G4** — relationship, institution, adviser, partner, sponsor, or adoption dependency.

## State scale

- **FIRE** — worth executing now.
- **PREPARE** — confirmed route; package before its deadline.
- **CONDITIONAL** — enter only if it produces a useful new experiment/evidence surface.
- **WATCH** — recurring/high-fit route; current call not yet open or exact 2027 terms not published.
- **CLOSED/WATCH** — current cycle missed/finished; preserve for next cycle.
- **DEMOTE** — valid route but approval dependence is too high for the critical path.
- **KILL** — not appropriate under current facts/eligibility.

---

# A. Permanent artifact, archival, compliance, and trust surfaces

| # | Route | Gate | State | Deadline | Use for Hardware Splicer |
|---|---|---:|---|---|---|
| A1 | Canonical GitHub release + `CITATION.cff` | G0 | FIRE | none | Freeze a named external artifact version around exact main/release hashes and nonclaims. |
| A2 | Zenodo DOI / GitHub-Zenodo release archive | G0 | FIRE | none | Permanent citable artifact; primary DOI spine reused by every later route. |
| A3 | Software Heritage Save Code Now + SWHID | G0 | FIRE | none | Independent long-term preservation of full source history and exact source identifiers. |
| A4 | OSHWA Open Source Hardware Certification | G1 | FIRE after license cleanup | none | Certify rev-0.2 as open hardware; certification is openness/compliance, not physical correctness. |
| A5 | FSFE REUSE compliance + live badge | G1 | PREPARE | none | Machine-readable per-file copyright/license clarity across mixed software/hardware/docs/vendor boundaries. |
| A6 | OpenSSF Best Practices Badge / OSPS Baseline | G1 | PREPARE | none | External self-certification surface for software/security project hygiene. |
| A7 | OpenSSF Scorecard | G0/G1 | PREPARE | none | Automated third-party OSS security posture checks; useful supporting trust signal, not engineering validation. |
| A8 | Release SBOM / SPDX or CycloneDX + provenance/attestation | G0 | PREPARE | none | Supporting artifact integrity surface; not a standalone external endorsement. |
| A9 | Signed/reproducible release manifest | G0 | PREPARE | none | Bind binaries/packages/EDA outputs to exact source; use as artifact infrastructure rather than application. |

Official/source anchors:

- OSHWA certification requirements: https://certification.oshwa.org/requirements.html
- REUSE: https://reuse.software/
- OpenSSF Best Practices Badge: https://openssf.org/projects/best-practices-badge/
- OpenSSF Scorecard: https://openssf.org/scorecard/
- Software Heritage: https://www.softwareheritage.org/

---

# B. Rolling publication and research-software/hardware outlets

| # | Route | Gate | State | Deadline/cost | Fit / constraint |
|---|---|---:|---|---|---|
| B1 | Journal of Open Hardware — Hardware Metapaper | G2 | PREPARE after licensing/physical documentation | rolling | Strong direct home for a reusable open-hardware artifact; requires OSHWA-compatible openness and recreation information. |
| B2 | Journal of Open Hardware — Issues in Open Hardware | G2 | CONDITIONAL | rolling | Methodology paper on evidence/authority in AI-assisted open hardware if contribution is broader than the SPI board. |
| B3 | HardwareX | G2 | CONDITIONAL | rolling; official page currently lists US$550 APC | Scientific-hardware paper if physical artifact/recreation package becomes the primary story. |
| B4 | Journal of Open Source Software (JOSS) | G2 | WATCH / later | rolling | Software side can fit only after clear research impact/adoption and mature open development; do not fire merely because repo is large. |
| B5 | TechRxiv preprint | G1 | CONDITIONAL | rolling | Low-friction preprint surface for a technical manuscript when venue policy permits preprints. |
| B6 | arXiv preprint | G1 | CONDITIONAL | rolling; first/new-category submissions can require endorsement | Useful after checking target conference preprint rules; DATE explicitly restricts preprints before decision for submitted work. |

Official/source anchors:

- Journal of Open Hardware submissions: https://ojs.lib.uwo.ca/index.php/openhardware/about/submissions
- HardwareX: https://www.sciencedirect.com/journal/hardwarex
- JOSS: https://joss.theoj.org/about
- arXiv endorsement policy: https://info.arxiv.org/help/endorsement.html

---

# C. Active / confirmed 2026–2027 calls with direct technical entry

| # | Route | Gate | State | Deadline | Hardware Splicer treatment |
|---|---|---:|---|---|---|
| C1 | Embedded World 2027 — Eclipse special session, “Building Trustworthy Open Source Embedded Systems in the Age of AI Agents” | G2 | **FIRE** | **2026-09-28** | Exceptional topical fit. Submit evidence-gated AI-agent hardware engineering talk; selected presenter gets conference-track pass. |
| C2 | ISPD 2027 Taipei — research paper | G2 | **KILL for this cycle / WATCH future** | abstract **2026-09-21**, manuscript **2026-09-28** | Strong EDA prestige and local venue, but current contribution is not primarily physical-design research and deadline pressure is unsafe. Preserve rather than force a paper. |
| C3 | PolarFire FPGA Design Contest 2026 | G3 | CONDITIONAL | proposal **2026-10-03** | Global engineer/student entry, but shortlist controls kit/work phase. Use only for a deliberate FPGA generalization test. |
| C4 | FOSDEM 2027 devroom proposal | G3 | KILL as solo primary route | **2026-10-04** | Requires at least two named managers and a full/half-day community program. Better to target a stand and later a relevant devroom talk. |
| C5 | DATE 2027 Focus Session proposal | G2/G3 | CONDITIONAL / usually KILL | **2026-10-18 AoE** | Session-organizing route rather than artifact submission; requires broader program/speakers. |
| C6 | DATE 2027 Embedded Tutorial proposal | G2/G3 | CONDITIONAL / usually KILL | **2026-10-18 AoE** | Viable only if we intentionally build a tutorial, not as normal HS conversion. |
| C7 | DATE 2027 Workshop proposal | G2/G3 | KILL unless community coalition exists | **2026-10-18 AoE** | Organizing burden exceeds current conversion value. |
| C8 | DATE 2027 Multi-Partner Project session | G4 | KILL | abstract **2026-10-18**, paper **2026-10-25** | Structurally mismatched: requires multi-partner project context. |
| C9 | FOSDEM 2027 project stand | G2 | **FIRE** | **2026-10-31 23:59 UTC** | Free stand, project demo, direct community exposure. Use reproducible/offline artifact demo. |
| C10 | IEEE VTS 2027 regular paper | G2 | **PREPARE** | title/abstract **2026-11-13**; paper **2026-11-20** | Very strong for test/validation/Generative AI in test. Prefer if quantitative validation contribution is strongest. |
| C11 | DAC 2027 Research Manuscript | G2 | **PREPARE / choose primary** | **2026-11-18 17:00 PST** | High-value EDA methodology paper; needs real ablation/comparative contribution, not project description. |
| C12 | DATE 2027 Late Breaking Results | G2 | **PREPARE / strong fallback** | **2026-11-29 AoE** | Two-page extended abstract + references; excellent if physical or manufacturer-model results arrive after main DATE paper deadline. |
| C13 | DATE 2027 PhD Forum | G2 | **KILL — ineligible** | **2026-11-30 AoE** | User is a Master’s student, not a PhD student. Keep in census solely to prevent accidental routing. |
| C14 | IEEE ETS 2027 regular paper | G2 | **PREPARE** | abstract **2026-12-08**; PDF **2026-12-15** | Excellent for dependable AI, V&V, fault modelling/simulation and testing. |
| C15 | Hackster — Build the Autodesk University 2027 Product | G2 | CONDITIONAL | project submission ~**2026-12-20/21** | Individual entry allowed; only worth doing if a sponsor-hardware derivative becomes a meaningful generalization experiment. |
| C16 | Hackster — Infineon Boss Battle in the AI Arena | G2 | CONDITIONAL | **2027-01-04** | Same rule: enter for a useful bounded target, not application count. |
| C17 | DAC 2027 Engineering Track — Systems & Software / EDA / Verification presentation-poster | G2 | **PREPARE** | **2027-01-11** | Possibly cleanest high-prestige fit for HS as an engineered system; accepted material archived on DAC site. |
| C18 | DAC 2027 Back-End Design Engineering Track | G2 | CONDITIONAL | **2027-01-11** | Use only if physical-design/implementation content is the dominant story; do not duplicate another DAC Engineering submission. |
| C19 | DAC 2027 Engineering Special Session | G4-ish | KILL for solo route | **2027-01-11** | Requires confirmed chair/speakers and balanced viewpoints before submission. |
| C20 | DAC 2027 Research Panel | G4-ish | KILL for solo route | **2026-11-16** | Panel route requires multiple viewpoints/panelists; not a single-project artifact route. |
| C21 | DATE 2027 University Fair | G2 | WATCH / likely eligible as Master’s student | **2027-01-15 AoE** | Potential demo surface under Young People Programme; re-check exact 2027 rules when submission page opens. |
| C22 | IEEE VTS 2027 Late Breaking Results | G2 | WATCH / fallback | **2027-02-05** | Three-page IEEE extended abstract, formally published if accepted; useful if November regular paper is not ready. |

Official/source anchors:

- Embedded World/Eclipse call: https://www.eclipse.org/lists/openhw/msg00030.html
- ISPD 2027: https://ispd.cc/ispd2027/
- PolarFire Contest: https://www.microchip.com/en-us/campaigns/polarfire-fpga-design-contest
- FOSDEM stand: https://fosdem.org/2027/news/call-for-stands/
- FOSDEM devroom: https://fosdem.org/2027/news/call-for-devrooms/
- VTS 2027: https://tttc-vts.org/public_html/new/2027/
- DAC 2027: https://dac.com/2027
- DATE 2027: https://www.date-conference.com/call-for-papers
- ETS dates: https://ieee-tttc.org/
- Hackster contests: https://www.hackster.io/contests

---

# D. Current direct manufacturing / real-hardware evidence routes

These are not “applications” but are strategically important because they remove approval as a blocker.

| # | Route | Gate | State | Timing | Treatment |
|---|---|---:|---|---|---|
| D1 | Ordinary PCB fabrication | G1 procurement | **FIRE when spend approved** | anytime | Send frozen manufacturing package; vendor is supplier, not validator/partner. |
| D2 | Ordinary PCBA assembly | G1 procurement | **FIRE when spend approved** | anytime | Buy assembly as a service; keep component substitution controlled by BOM/evidence rules. |
| D3 | Independent bench/lab measurements as paid service | G1 procurement | PREPARE after board exists | anytime | Commission specific measurements, not project endorsement. Ingest raw evidence under current audit contract. |
| D4 | Winbond authenticated model download | G1 account/session | PREPARE human gate | anytime | Obtain exact DA03-AAG072 IBIS and DA02-AAG072 Verilog bytes; this closes manufacturer-model layer but is not external prestige by itself. |
| D5 | Tiny Tapeout IHP26b | G1 technical conformance | CONDITIONAL | current shuttle open; official site shows short remaining window | Only for a deliberately small RTL derivative proving agent→RTL→synthesis→silicon; do not contort SPI PCB into ASIC form. |
| D6 | Future Tiny Tapeout/open MPW shuttle | G1 | WATCH | recurring | Better after a purposeful HS-generated digital testcase exists. |

---

# E. Open-source / open-hardware community showcases and talks

| # | Route | Gate | State | Current-cycle status | Treatment |
|---|---|---:|---|---|---|
| E1 | FOSDEM 2027 stand | G2 | FIRE | open; Oct 31 deadline | Primary community demo route. |
| E2 | FOSDEM 2027 devroom talk | G2 | WATCH | individual devroom CFPs expected after accepted rooms around Oct 27 | Fire only into a genuinely matching open-hardware/CAD/EDA/embedded room. |
| E3 | FOSDEM 2027 devroom organizer | G3 | KILL | Oct 4 deadline; ≥2 managers required | Too much organizing overhead for conversion objective. |
| E4 | Open Hardware Summit 2027 talk/workshop | G2 | **A-WATCH** | speaker CFP not yet published; 2027 host process occurred earlier in 2026 | Excellent after DOI/OSHWA and preferably physical results. |
| E5 | ORConf 2027 / FOSSi | G2 | A-WATCH | 2026 event completed Sep 11–13 | Strong free/open-source silicon audience; watch next CFP. |
| E6 | Latch-Up 2027 / FOSSi | G2 | A/B-WATCH | 2026 event completed May 1–3 | North American open-source silicon route; useful if silicon/FPGA derivative emerges. |
| E7 | KiCon 2027 | G2 | WATCH | 2027 call not verified/open yet | High-fit if accepted talk centers on reproducible KiCad evidence and agent-assisted hardware design. |
| E8 | Hackaday Superconference 2027 | G2 | WATCH | 2026 CFP closed Aug 26; event Nov 6–8 | Very strong maker/hacker demo audience; watch 2027 early. |
| E9 | Open Hardware Makers mentorship/public demo | G2 | CONDITIONAL | applications/community program available | Community/open-practice value, but project may be beyond “initial stage”; use only if cohort terms fit. |
| E10 | COSCUP 2027 | G2 | WATCH | 2027 CFP not open | Taiwan/open-source visibility; fire only into real hardware/tooling track. |
| E11 | SITCON 2027 | G2 | WATCH | 2027 CFP not verified/open | User is a student; potential local OSS/student technical talk if hardware/tool track fits. |
| E12 | Maker Faire Taipei 2027 | G2 | WATCH | 2027 maker call not verified/open | Physical/demo value once board exists; lower archival credibility than engineering conferences. |
| E13 | RISC-V Summit Europe/North America 2027 | G2 | WATCH | 2027 CFPs not yet verified/open | Relevant only if RISC-V/FPGA/silicon derivative becomes substantial, not for generic SPI board. |
| E14 | Open Source Summit / Embedded Linux Conference 2027 | G2 | WATCH | 2027 CFP not yet mapped | Potential if software/agent integration is strong enough for embedded OSS audience. |

---

# F. EDA/test conference and competition radar — 2027 cycles

| # | Route | Gate | State | Current status | Treatment |
|---|---|---:|---|---|---|
| F1 | ICCAD CAD Contest 2027 | G1/G2 expected | **A-WATCH** | 2027 problems not yet published | Prepare generic benchmark adapter now. 2026 included LLM-assisted EDA tasks. |
| F2 | MLCAD Contest 2027 | G1/G2 expected | **A-WATCH** | 2027 call not yet published | Very high methodological fit; prepare OpenROAD-facing deterministic runner. |
| F3 | IEEE/ACM ICCAD 2027 main conference | G2 | WATCH | 2027 Design Automation ICCAD CFP not yet mapped | High bar; only fire if methodology matures into strong research contribution. Do not confuse with the unrelated Control/Automation/Diagnosis conference also called ICCAD. |
| F4 | ASP-DAC 2028 research | G2 | WATCH | ASP-DAC 2027 paper deadline closed Jul 18 | Asia-Pacific EDA route; track from early 2027 for next cycle. |
| F5 | ASP-DAC University LSI Design Contest 2028 | G2 | WATCH after physical/FPGA result | ASP-DAC 2027 design deadline closed Aug 15 | Particularly interesting once HS has implemented/measured chip/FPGA design; 2027 contest explicitly asks about implementation, measurements, software and AI. |
| F6 | ISPD 2028 | G2 | WATCH | 2027 cycle currently open but deliberately skipped | Revisit only if HS develops genuine physical-design research rather than general hardware verification. |
| F7 | International Test Conference 2027 | G2 | WATCH | 2027 dates not yet posted on TTTC page | Strong potential once physical silicon/board test evidence exists; 2026 cycle already closed. |
| F8 | IOLTS 2027 | G2 | WATCH | 2027 call not yet posted | On-line test/robust system design may fit later measurement and lifecycle work. |
| F9 | DFTS 2027 | G2 | WATCH | 2027 call not yet posted | Fault-tolerance route if methodology shifts toward fault injection/diagnosis. |

---

# G. Sponsor/hardware contests — preserve, but only as controlled generalization tests

| # | Route | Gate | State | Deadline/status | Rule |
|---|---|---:|---|---|---|
| G1 | PolarFire FPGA Design Contest 2026 | G3 | CONDITIONAL | Oct 3 proposal | Enter only to test generalization onto PolarFire; proposal shortlist and kit dependence mean it is not approval-light enough for core strategy. |
| G2 | Hackster Autodesk University 2027 Product | G2 + optional hardware allocation gate | CONDITIONAL | Dec 20/21 | Can submit an existing project, but sponsor-specific requirements must produce real learning. |
| G3 | Hackster Infineon Boss Battle | G2 | CONDITIONAL | Jan 4, 2027 | Same generalization rule. |
| G4 | Future Hackster contests | G1/G2/G3 varies | WATCH | recurring | Radar by technical relevance, not prize amount. |
| G5 | Future Hackaday Prize | G2 | WATCH | next suitable cycle not yet verified | High community fit if open-hardware/reproducibility challenge aligns. |
| G6 | Vendor FPGA/EDA challenges (AMD/Intel/Microchip/etc.) | G2/G3 | WATCH | variable | Only create adapters that remain reusable outside sponsor ecosystem. |

---

# H. Asia / Taiwan-specific routes and near-term closed routes

| # | Route | Gate | State | Status | Reason |
|---|---|---:|---|---|---|
| H1 | ISPD 2027 Taipei | G2 | KILL current / WATCH methodology | Sep 21/28 | Local and prestigious, but rushed and narrower physical-design fit than current HS contribution. |
| H2 | ASP-DAC 2027 Tokyo research paper | G2 | CLOSED/WATCH 2028 | Jul 11 abstract / Jul 18 PDF closed | Excellent regional EDA venue but current cycle missed. |
| H3 | ASP-DAC 2027 University LSI Design Contest | G2 | CLOSED/WATCH 2028 | Aug 15 closed | More attractive after implementation/measurement exists. |
| H4 | COSCUP 2027 Taiwan | G2 | WATCH | call not yet open | Open-source community/demo path. |
| H5 | SITCON 2027 Taiwan | G2 | WATCH | call not yet open | Student OSS route; technical-fit gate required. |
| H6 | Maker Faire Taipei 2027 | G2 | WATCH | call not yet open | Demo/exposure after physical board. |
| H7 | InnoServe 2026 | G4 | DEMOTE | existing Gauntlet route; adviser/faculty dependency | Keep as side shot, not critical path. |
| H8 | TAAI 2026 | G2/G4 depending track | CLOSED | prior deadline passed | Preserve lessons; do not distort next strategy around past route. |
| H9 | Taiwan institutional compute / university programs | G4 | DEMOTE | variable | Useful only if they uniquely unlock necessary compute/equipment. |

---

# I. DATE 2027 complete family — explicit routing

DATE has enough different surfaces that Gauntlet should not treat it as one route.

| Surface | Gate | State | Deadline | Decision |
|---|---:|---|---|---|
| Research paper | G2 | CLOSED | abstract Sep 13; final Sep 20 | Main paper registration missed; do not attempt. |
| Focus Session | G2/G3 | CONDITIONAL | Oct 18 | Requires session-level proposal; low priority. |
| Embedded Tutorial | G2/G3 | CONDITIONAL | Oct 18 | Only if tutorial itself is strategic. |
| Workshop proposal | G3 | KILL | Oct 18 | Organizing burden too high. |
| Multi-Partner Project | G4 | KILL | Oct 18/25 | Structural mismatch. |
| Late Breaking Results | G2 | **PREPARE** | Nov 29 | Strong two-page route if new result arrives. |
| PhD Forum | G2 | KILL — ineligible | Nov 30 | Master’s student, not PhD. |
| University Fair | G2 | WATCH/PREPARE | Jan 15 | Re-check 2027 Master’s eligibility and demo format. |
| Career Fair | G1/G2 | secondary | Jan 15 programme timing | Job networking, not project validation. |

Important policy: DATE states no double submissions and says submitted papers may be posted as preprints only **after** acceptance/rejection notification. Any DOI/preprint strategy for a DATE manuscript must respect that exact venue policy; the project artifact itself can remain public, but the manuscript text needs careful handling.

---

# J. DAC 2027 complete family — explicit routing

| Surface | Gate | State | Deadline | Decision |
|---|---:|---|---|---|
| Research Manuscript | G2 | PREPARE / choose primary | Nov 18 | High-value methodology route. |
| Research Panel | G4-ish | KILL | Nov 16 | Needs panel composition; not artifact-first. |
| Engineering Systems & Software Track | G2 | **PREPARE** | Jan 11 | Excellent practical systems route. |
| Engineering Back-End Design Track | G2 | CONDITIONAL | Jan 11 | Use only if physical-design content dominates. |
| Engineering Special Session | G4-ish | KILL | Jan 11 | Must confirm chair/speakers before submission. |
| Pavilion / business programme | G3/G4 | DEMOTE | variable | Commercial/exhibitor framing; not first-line technical validation. |

Accepted Engineering presentations/posters are not proceedings papers but are archived by DAC, making the track useful as an engineering credibility surface even if a research-paper route is not yet mature.

---

# K. Open-hardware/open-source maturity ladder

The artifact should accumulate these independent surfaces instead of seeking one mythical “approval.”

```text
GitHub release + CITATION.cff
    → Software Heritage SWHID
    → Zenodo DOI
    → REUSE compliance
    → OpenSSF Scorecard / Best Practices
    → OSHWA certification
    → ordinary fabrication / measured artifact version
    → Journal of Open Hardware or HardwareX (if useful)
    → FOSDEM / OHS / FOSSi community demonstration
    → VTS / DATE LBR / DAC / ETS technical review
    → ICCAD / MLCAD benchmark competition
```

No item in this ladder grants physical correctness unless it actually contains revision-bound physical measurement evidence under the Hardware Splicer contract.

---

# L. Approval-heavy routes retained only as side shots

These are **not deleted** from Gauntlet. They simply lose critical-path status.

- OpenAI/Anthropic or other model/research-credit applications — G3/G4.
- Cloud/research-compute credits — G3/G4.
- Corporate design-partner recruitment — G4.
- Custom validation-partner search — G4.
- Institutional university compute/programmes — G4.
- Adviser/team-required student contests — G4.
- Accelerators/incubators requiring selection and programme participation — G3/G4.
- Corporate pilots requiring adoption before evidence generation — G4.
- Sponsorship-dependent conference/exhibit routes — G4.
- Grant calls whose primary output is approval rather than a durable public artifact — G3/G4.

Fire these only when application cost is low and the upside is unique. Never delay DOI, open-hardware certification, ordinary fabrication, public artifact release, or open technical submissions for them.

---

# M. Closed-but-instructive 2026 cycles to keep on radar

These are not actionable now, but forgetting them would repeat the previous discovery failure.

- Hackaday Superconference 2026 CFP — closed Aug 26; watch 2027.
- ORConf 2026 — completed Sep 11–13; watch 2027.
- Latch-Up 2026 — completed May 1–3; watch 2027.
- ASP-DAC 2027 research — closed Jul 18; watch 2028 cycle early.
- ASP-DAC 2027 University LSI Design Contest — closed Aug 15; watch 2028 once physical/FPGA evidence exists.
- DATE 2027 main research paper — abstract registration closed Sep 13; use LBR instead.
- TAAI 2026 — closed/past in existing Gauntlet.
- Prior Taiwan competitions already missed/closed — retain their eligibility lessons but do not reopen them artificially.

---

# N. Radar rules so “all” stays all

The census must be refreshed rather than replaced.

1. **Never delete a route merely because it is not FIRE.** Move it between FIRE / PREPARE / CONDITIONAL / WATCH / CLOSED / DEMOTE / KILL.
2. **Every recurring route gets a next-cycle watch month.** ICCAD/MLCAD early-year radar, FOSSi/Open Hardware Summit/FOSDEM/COSCUP/SITCON/KiCon as their calls appear.
3. **Separate venue family from surface.** DATE LBR is not DATE PhD Forum; DAC Engineering is not DAC Research; FOSDEM stand is not devroom management.
4. **Prefer individual/open-source eligibility.** Flag adviser, institution, partner, speaker-team, kit-allocation and payment dependencies explicitly.
5. **Do not confuse publication with evidence authority.** Peer review, OSHWA certification, a DOI, or a contest result does not convert `UNPROVEN` physical truth into measured truth.
6. **Do not build bespoke features for venue fit.** A derivative is justified only when it tests generalization of the core system.
7. **Use one canonical artifact spine.** Every route should point back to exact release/evidence identities instead of inventing a new project narrative.

# O. Current priority queue derived from the full census

The census is broad; execution remains narrow:

```text
NOW
1. licensing split / artifact hygiene
2. Software Heritage + Zenodo DOI
3. REUSE / OpenSSF trust surfaces
4. OSHWA certification
5. Embedded World 2027 abstract
6. ordinary fabrication decision

NEXT
7. FOSDEM stand
8. one primary November archival route: VTS or DAC Research
9. DATE LBR as compact later-result route
10. ETS if distinct/stronger by December
11. DAC Engineering by Jan 11
12. DATE University Fair if exact 2027 eligibility fits

RADAR
13. FOSDEM devroom talks
14. Open Hardware Summit 2027
15. ORConf / Latch-Up / KiCon / Hackaday Supercon
16. ICCAD CAD Contest 2027
17. MLCAD Contest 2027
18. COSCUP / SITCON / Maker Faire Taipei
19. ASP-DAC next cycle / University LSI Design Contest after physical evidence
20. ITC / IOLTS / DFTS when physical test evidence matures
```

The long registry prevents opportunity loss. The short queue prevents opportunity sprawl.
