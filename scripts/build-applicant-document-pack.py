#!/usr/bin/env python3
"""Build evidence-bounded applicant documents for immediate calendar routes."""

from __future__ import annotations

import re
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "application-documents-2026-09-12"
OUT.mkdir(parents=True, exist_ok=True)

# Personal contact details live in the git-ignored applicant authority, never in this public repo.
AUTHORITY_FILE = ROOT / "applicant-authority.local.yaml"


def _private_phone() -> str:
    try:
        import yaml  # optional; only needed when the private authority is present

        data = yaml.safe_load(AUTHORITY_FILE.read_text(encoding="utf-8")) or {}
        return str((data.get("identity") or {}).get("phone") or "").strip()
    except Exception:  # missing file, missing PyYAML, or an unparseable authority: omit the phone
        return ""


PHONE = _private_phone()
CONTACT_LINE = "  ·  ".join(
    part for part in ("Taoyuan, Taiwan", "s1133958@mail.yzu.edu.tw", PHONE,
                      "ORCID 0009-0007-9339-9098", "SSRN 10047476", "github.com/Spectating101") if part
)

NAVY = RGBColor(25, 43, 67)
TEAL = RGBColor(25, 105, 112)
GRAY = RGBColor(85, 92, 101)
LIGHT = "E8EEF2"


def set_cell_shading(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=100, bottom=80, end=100) -> None:
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_table_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_cell_text(cell, text: str, *, bold=False, color=None, size=9.0) -> None:
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(text)
    r.bold = bold
    r.font.name = "Aptos"
    r.font.size = Pt(size)
    if color:
        r.font.color.rgb = color
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    set_cell_margins(cell)


def add_page_number(paragraph) -> None:
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("Page ")
    run.font.name = "Aptos"
    run.font.size = Pt(8)
    run.font.color.rgb = GRAY
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instr, separate, end])


def new_doc(*, title: str, subtitle: str | None = None, compact=False) -> Document:
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.58 if compact else 0.68)
    section.bottom_margin = Inches(0.56 if compact else 0.65)
    section.left_margin = Inches(0.72 if compact else 0.82)
    section.right_margin = Inches(0.72 if compact else 0.82)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(9.2 if compact else 10.2)
    normal.font.color.rgb = RGBColor(35, 39, 45)
    normal.paragraph_format.space_after = Pt(5.2 if compact else 7)
    normal.paragraph_format.line_spacing = 1.04 if compact else 1.09

    styles["Title"].font.name = "Aptos Display"
    styles["Title"].font.size = Pt(25 if compact else 27)
    styles["Title"].font.bold = True
    styles["Title"].font.color.rgb = NAVY
    styles["Title"].paragraph_format.space_after = Pt(3)

    for name, size in (("Heading 1", 14), ("Heading 2", 11.2)):
        st = styles[name]
        st.font.name = "Aptos Display"
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = NAVY if name == "Heading 1" else TEAL
        st.paragraph_format.space_before = Pt(8 if name == "Heading 1" else 5)
        st.paragraph_format.space_after = Pt(3)
        st.paragraph_format.keep_with_next = True

    styles["List Bullet"].font.name = "Aptos"
    styles["List Bullet"].font.size = normal.font.size
    styles["List Bullet"].paragraph_format.left_indent = Inches(0.22)
    styles["List Bullet"].paragraph_format.first_line_indent = Inches(-0.14)
    styles["List Bullet"].paragraph_format.space_after = Pt(3)

    p = doc.add_paragraph(style="Title")
    p.add_run(title)
    if subtitle:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(10)
        r = p.add_run(subtitle)
        r.font.name = "Aptos"
        r.font.size = Pt(10.5)
        r.font.color.rgb = TEAL
        r.bold = True

    footer = section.footer.paragraphs[0]
    add_page_number(footer)
    return doc


def add_meta(doc: Document, items: list[tuple[str, str]]) -> None:
    table = doc.add_table(rows=0, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    table.autofit = False
    table.columns[0].width = Inches(1.2)
    table.columns[1].width = Inches(5.8)
    for label, value in items:
        cells = table.add_row().cells
        set_cell_text(cells[0], label.upper(), bold=True, color=TEAL, size=8.2)
        set_cell_text(cells[1], value, size=9.2)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def add_body(doc: Document, text: str, *, bold_lead: str | None = None) -> None:
    p = doc.add_paragraph()
    p.paragraph_format.widow_control = True
    if bold_lead and text.startswith(bold_lead):
        p.add_run(bold_lead).bold = True
        p.add_run(text[len(bold_lead):])
    else:
        p.add_run(text)


def add_bullets(doc: Document, items: list[str]) -> None:
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.add_run(item)


def add_section(doc: Document, heading: str, paragraphs: list[str] | str) -> None:
    doc.add_heading(heading, level=1)
    if isinstance(paragraphs, str):
        paragraphs = [paragraphs]
    for paragraph in paragraphs:
        add_body(doc, paragraph)


def add_compact_table(doc: Document, headers: list[str], rows: list[list[str]], widths=None) -> None:
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    table.autofit = False
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for i, header in enumerate(headers):
        set_cell_text(hdr.cells[i], header, bold=True, color=RGBColor(255, 255, 255), size=8.5)
        set_cell_shading(hdr.cells[i], "193F5A")
        if widths:
            hdr.cells[i].width = Inches(widths[i])
    for row in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row):
            set_cell_text(cells[i], value, size=8.4)
            if widths:
                cells[i].width = Inches(widths[i])


def save(doc: Document, filename: str) -> Path:
    path = OUT / filename
    core = doc.core_properties
    core.author = "Christopher Ongko"
    core.last_modified_by = "Christopher Ongko"
    doc.save(path)
    return path


VARIANTS: dict[str, dict[str, object]] = {
    "general": {
        "subtitle": "Research Engineer · Research Software and Data Systems · Empirical Finance",
        "profile": (
            "MSc Finance and Accounting candidate and research assistant. I publish empirical work on platform-economy "
            "measurement, energy-linked asset pricing and digital taxation, and I build the software it runs on: Python, R and "
            "SQL pipelines, tool-using AI systems, and tests that check a result against its sources."
        ),
        "research_order": ["energy", "platform", "tax"],
        "filename": "Christopher_Ongko_CV_2026-09.docx",
    },
    "research_engineer": {
        "subtitle": "Research Engineer · Data Systems, Tool-Using AI, Reproducible Analysis",
        "profile": (
            "I build the software research runs on: ingestion and cleaning pipelines, tool-using AI systems over REST and MCP, "
            "and evaluation that scores output against marked examples. I also publish empirical finance papers, including one "
            "whose headline effect disappeared under a sample split. Python, R, SQL, TypeScript, Linux, CI."
        ),
        "research_order": ["energy", "tax", "platform"],
        "filename": "Christopher_Ongko_CV_research_engineer.docx",
    },
    "quant": {
        "subtitle": "Quantitative Research · Empirical Finance · Data Engineering",
        "profile": (
            "MSc Finance and Accounting candidate with published empirical work in asset pricing, digital taxation and platform-economy "
            "measurement, and the engineering to run it end to end: Python, R and SQL pipelines, panel construction, and reproducible "
            "analysis. My work uses policy shocks and natural experiments for identification, and reports null results when that is "
            "what the data supports."
        ),
        "research_order": ["energy", "tax", "platform"],
        "filename": "Christopher_Ongko_CV_quant.docx",
    },
    "research_assistant": {
        "subtitle": "Research Assistant · Empirical Finance · Research Data Infrastructure",
        "profile": (
            "Research assistant and MSc candidate who both runs the analysis and builds the infrastructure it depends on. I collect "
            "and clean multi-source financial data, construct panels, run the econometrics and keep the workflow reproducible, and I "
            "build tools that do the same for a whole group: organised lab data, literature search and synthesis, and citation "
            "checking measured against a marked test set."
        ),
        "research_order": ["platform", "energy", "tax"],
        "filename": "Christopher_Ongko_CV_research_assistant.docx",
    },
    "policy": {
        "subtitle": "Policy Research · Digital Taxation and Fiscal Capacity · Measurement",
        "profile": (
            "I study why digital tax rules collect less than they promise, and how much economic activity goes unmeasured in "
            "Southeast Asia. My recent work traces seven collection paths across five jurisdictions and separates who is legally "
            "liable from who can operationally collect. I also build the software that keeps this kind of case work reproducible, "
            "with sources and calculations versioned rather than recalled."
        ),
        "research_order": ["tax", "platform", "energy"],
        "filename": "Christopher_Ongko_CV_policy.docx",
    },
}


def build_cv(variant: str = "general") -> Path:
    spec = VARIANTS[variant]
    doc = new_doc(
        title="Christopher Ongko",
        subtitle=str(spec["subtitle"]),
        compact=True,
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(7)
    r = p.add_run(CONTACT_LINE)
    r.font.size = Pt(8.7)
    r.font.color.rgb = GRAY

    add_section(doc, "Profile", str(spec["profile"]))

    doc.add_heading("Education", level=1)
    add_body(doc, "Yuan Ze University, Taoyuan, Taiwan — Master of Science in Finance and Accounting, February 2025–present", bold_lead="Yuan Ze University, Taoyuan, Taiwan")
    add_bullets(doc, [
        "Thesis: The Invisible Ledger: Quantifying the Invisible Wedge in Indonesia's Platform Economy. Proposal frozen September 2026; defense expected December 2026.",
        "Advisor: Prof. De-Rong Kong · First Degree Scholarship recipient · GPA 4.00",
    ])
    add_body(doc, "President University, Cikarang, Indonesia — Bachelor of Science in Management, Banking and Finance concentration, September 2017–October 2021", bold_lead="President University, Cikarang, Indonesia")
    add_bullets(doc, ["Graduated cum laude, GPA 3.61/4.00, 144 units · First Degree Scholarship recipient"])

    doc.add_heading("Research Experience", level=1)
    add_body(doc, "Research Assistant, Yuan Ze University College of Management — April 2026–present", bold_lead="Research Assistant, Yuan Ze University College of Management")
    add_bullets(doc, [
        "Built and cleaned a multi-source cryptocurrency dataset from CoinGecko category, profile, analytics, and price endpoints; integrated the panels for academic analysis under Prof. De-Rong Kong.",
        "Maintain reproducible research workflows spanning ingestion, validation, econometric analysis, evidence review, and manuscript support.",
    ])

    doc.add_heading("Research", level=1)
    add_body(doc, "Three lines of work. SSRN author name: Xin-Fu Wang (王新福) · SSRN Author ID 10047476.")

    def line_energy() -> None:
        add_body(doc, "Energy as a constraint on digital financial claims", bold_lead="Energy as a constraint on digital financial claims")
        add_bullets(doc, [
            "Energy as a Constraint: Credibility, Pricing, and Settlement in Energy-Linked Digital Finance — full manuscript, July 2026. Rebuilds the Cumulative Energy Investment Ratio on a daily Bitcoin panel, 2019–2025. The pre-split association does not survive the split, and the paper reports that.",
            "Energy Anchoring in Cryptocurrency Markets: Evidence from Natural Experiments — SSRN 6426020. The empirical core: identification from mining-cost shocks.",
            "Quantitative Pricing for Non-Storable Energy: A Derivatives Framework for Solar Energy Assets — SSRN 6425998.",
            "The Constrained Ledger: When Does Energy Actually Back Digital Money? — plain-language working draft, July 2026.",
        ])

    def line_platform() -> None:
        add_body(doc, "Measuring the platform economy", bold_lead="Measuring the platform economy")
        add_bullets(doc, [
            "The Invisible Ledger: Quantifying the Invisible Wedge in Indonesia's Platform Economy — master's thesis, proposal frozen September 2026, defense expected December 2026.",
            "The Invisible Ledger: Quantifying ASEAN's Unmeasured Platform Economy — SSRN 6113326. Preprint titled at $192bn; a later data audit put it near $170bn. The SSRN listing still shows the original figure.",
        ])

    def line_tax() -> None:
        add_body(doc, "Digital taxation and fiscal capacity", bold_lead="Digital taxation and fiscal capacity")
        add_bullets(doc, [
            "Fiscal Choke Points: Transaction-Node Architecture and Operational Fiscal Capacity in Southeast Asian Digital Tax Administration — working paper, September 2026. Seven collection paths across five jurisdictions, separating legal liability from operational collection capacity.",
            "Digital Services Taxation Without Tax Competition? Evidence from ASEAN Policy Variation and a Base-Expansion Shock in Malaysia — SSRN 6425958. The earlier, narrower cut of the same question.",
        ])

    blocks = {"energy": line_energy, "platform": line_platform, "tax": line_tax}
    for key in spec["research_order"]:
        blocks[str(key)]()

    doc.add_page_break()
    doc.add_heading("Selected Systems", level=1)
    add_body(doc, "Grouped by what they do. Policy Lab, Hardware Splicer and Research Drive are public at github.com/Spectating101; the remaining repositories are private and can be shared on request.")
    systems = [
        ("Evidence and policy workbench — Policy Lab",
         "Tests whether real-world evidence can justify a financial claim, case by case: grades the evidence, applies a "
         "versioned policy, sets a quantity ceiling and stress-tests settlement. Live in the browser; a CI check runs 336 "
         "half-hour intervals of public Ausgrid data through it. Grew out of the earlier SolarPunk energy-settlement research."),
        ("Design review checks for hardware — Hardware Splicer",
         "KiCad ERC/DRC, BOM and fabrication checks, staged bench gates, web/API/MCP/CLI. A packaged design rebuilds from source "
         "to the same checksum. Software and review only; no board has been fabricated or measured."),
        ("Research assistant tools — Research Drive, Cite-Agent",
         "Lab data organised on shared storage, with search over what the group already holds and collection of what it lacks. "
         "Literature search and synthesis across Semantic Scholar, OpenAlex and PubMed, with Zotero and R; citation checking "
         "scored against a hand-marked test set."),
        ("Provenance and reuse tools — Refinery, Nocturnal Oversight",
         "Refinery resolves a requirement to the exact code version that meets it and records what was tested about it. "
         "Nocturnal keeps a GDELT news ledger with hash-linked story chains, recurrence detection and entity exports."),
    ]
    for name, desc in systems:
        p = doc.add_paragraph(style="List Bullet")
        p.add_run(f"{name}. ").bold = True
        p.add_run(desc)

    doc.add_heading("Methods and Technology", level=1)
    add_compact_table(doc, ["Area", "Working capability"], [
        ["Quantitative research", "Difference-in-differences, panel models, fixed effects, instrumental variables, event studies, empirical asset pricing, robustness and falsification checks"],
        ["Engineering", "Python, R, SQL, JavaScript/TypeScript, Node.js, Rust, Solidity; APIs, CLI systems, databases, CI, containers, Linux"],
        ["AI systems", "Building on language-model APIs, running several models together, retrieval, tool calling and MCP, browser automation, and testing model output against marked examples"],
    ], widths=[1.45, 5.35])

    doc.add_heading("Professional Experience", level=1)
    add_body(doc, "Staff Procurement, ODC — Samator Indo Gas, Indonesia · October 2022–June 2024", bold_lead="Staff Procurement, ODC")
    add_body(doc, "Integrated procurement workflows and designed technical frameworks for distributed operations.")
    add_body(doc, "Independent projects and self-directed engineering · October 2021–September 2022", bold_lead="Independent projects and self-directed engineering")
    add_body(doc, "Built early ventures and software projects and learned to program; the basis of the systems work above.")
    add_body(doc, "Freelance Team Manager — News Monitor · May 2019–February 2020", bold_lead="Freelance Team Manager")
    add_body(doc, "Managed hiring, training, and quality assurance for distributed freelancer operations.")

    doc.add_heading("Languages", level=1)
    add_body(doc, "Indonesian (native) · English (IELTS 8.0, C1, August 2024; certificate now past its two-year validity) · Mandarin Chinese (HSK 4)")
    return save(doc, str(spec["filename"]))


def build_era() -> Path:
    doc = new_doc(
        title="ERA AI Winter 2027 Compliance Checklist",
        subtitle="Technical AI Governance track",
    )
    add_meta(doc, [
        ("Deadline", "13 September 2026 at 11:59 PM Anywhere on Earth"),
        ("Submission status", "Applicant-only writing required; this file is not application copy"),
        ("Live-form basis", "Technical AI Governance conditional fields inspected 12 September 2026"),
    ])
    add_section(doc, "Compliance boundary", [
        "The live application requires the applicant to attest that no language model or other AI assistance was used to complete the application and warns that substantially AI-generated responses may be rejected. Do not copy, paraphrase, compress, or otherwise use AI-generated application prose for this route. The applicant must independently write every response and decide whether the attestation can be made truthfully.",
    ])
    add_section(doc, "Applicant-only written fields", [
        "Motivation for applying, approximately 1,200 characters maximum.",
        "Relevant experience for the selected track, 750 characters maximum.",
        "Proposed project, 2,000 characters maximum.",
        "Technical AI Governance conditional question, 800 characters maximum: assess the strengths and weaknesses of task-completion-time-horizon forecasting and discuss alternative forecasting methods.",
    ])
    add_section(doc, "Required records and decisions", [
        "Two referees, each with name, email, role, and relationship to the applicant.",
        "Current CV upload; citizenship and visa information; track and research-area selections; required consents and declarations; final submission.",
    ])
    return save(doc, "ERA_AI_Winter_2027_Response_Bank.docx")


def build_hku() -> Path:
    doc = new_doc(
        title="Application Research Assistant II AI Engineer",
        subtitle="Ref. 537095 · Christopher Ongko",
    )
    add_meta(doc, [
        ("Applicant", "Christopher Ongko"),
        ("Current role", "Master’s researcher and Research Assistant, Yuan Ze University"),
        ("Contact", " · ".join(part for part in ("s1133958@mail.yzu.edu.tw", PHONE) if part)),
    ])
    add_body(doc, "Dear Selection Committee,")
    for para in [
        "I am applying for the Research Assistant II (AI Engineer) position, Ref. 537095. I currently study finance and work as a research assistant at Yuan Ze University, where I build data and analysis workflows for cryptocurrency research. My formal degrees are in management and finance rather than computer science. I am applying because the systems I have built provide substantial applied experience in the role’s core work: full-stack research software, Python and TypeScript services, MCP tool interfaces, data pipelines, LLM orchestration, and evidence-aware agent workflows.",
        "My closest example is Research Drive, a lab-data desk with a researcher-facing interface and a private control plane spanning API, MCP, orchestration, workers, data collection, registry updates, and dataset synthesis. The public/private release pair has passed internal acceptance against a shared contract. I also maintain Cite-Agent, a research assistant integrating scholarly search, synthesis, data analysis, Zotero/R workflows, and MCP clients, and Hardware Splicer, a web/API/MCP/CLI system for auditable hardware-design verification.",
        "These projects taught me to work across application layers while keeping execution authority explicit. In Research Drive, a proposed acquisition is not treated as registered evidence until the corresponding workflow completes. In Hardware Splicer, a software check is not represented as physical validation. That discipline is useful for research software because it makes failures inspectable and prevents a fluent model response from silently becoming a database or tool action.",
        "I work directly with Python, JavaScript and TypeScript, web interfaces, APIs, databases, containers, CI, MCP tool calling, and multiple hosted model providers. I learn new libraries by tracing their contracts through a working system, and I would be comfortable demonstrating that process in a technical exercise.",
        "I would welcome the opportunity to discuss these systems and how the engineering practice behind them could support the School’s AI research projects. My CV provides the primary application record, and links to the relevant systems are available on request.",
    ]:
        add_body(doc, para)
    add_body(doc, "Sincerely,\nChristopher Ongko")

    return save(doc, "HKU_AI_Engineer_RAII_Application_Packet.docx")


def build_vu_social() -> Path:
    doc = new_doc(
        title="Application Letter PhD in Social Data Science",
        subtitle="Christopher Ongko · Vrije Universiteit Amsterdam",
        compact=True,
    )
    add_body(doc, "Dear Members of the Selection Committee,")
    for para in [
        "I am applying for the PhD position in Social Data Science because its combination of computational methods and substantive social questions matches the direction of my research. I am currently completing a Master of Science in Finance and Accounting at Yuan Ze University and work there as a research assistant; the degree is ongoing.",
        "My empirical work examines cryptocurrency markets, energy-based valuation claims, digital taxation, and measurement in platform economies. As a research assistant, I build and clean multi-source cryptocurrency data from category, profile, analytics, and price endpoints. My working papers use designs including difference-in-differences, panel models, and natural experiments. This work has made me particularly attentive to construct validity, non-stationarity, robustness, and the difference between an available digital trace and a defensible measure of social behavior.",
        "I have also built Nocturnal Oversight, an open longitudinal news-intelligence ledger. It collects public news inputs, records modules in a hash-linked story chain, and supports recurrence and entity-based retrieval across time. The system deliberately does not label a repeated person or organization as true, false, corrupt, or culpable. Its purpose is to preserve attributed evidence and make prior reporting retrievable, while leaving interpretation to an analyst. That design experience is relevant to research on digital influence because it confronts the gap between observable online traces and stronger social claims.",
        "For doctoral research, I would be interested in studying how coordinated or economically motivated influence becomes visible across platforms, organizations, and time. One possible design would combine longitudinal content and entity recurrence with transparent sampling, platform-level context, and interviews or survey evidence where appropriate. The computational layer should make patterns inspectable; it should not substitute a classifier score for a causal explanation. I would expect to use Python or R for data preparation, time-series and panel analysis, network features, robustness checks, and reproducible reporting.",
        "My finance and management background brings a useful perspective on incentives, markets, and measurement. In work on digital taxation and platform economies, I have examined how observed transactions, policy changes, and reported activity can diverge. I would bring that same caution to studying influence systems: who benefits, what is observed, which mechanism is plausible, and which conclusion the data cannot support.",
        "I am drawn to a research environment where computational methods remain accountable to theory and empirical design. I would bring independent systems-building ability, experience with messy multi-source data, and a commitment to reporting null results and limitations as part of the research rather than as afterthoughts.",
    ]:
        add_body(doc, para)
    add_body(doc, "Sincerely,\nChristopher Ongko")
    return save(doc, "VU_Social_Data_Science_Application_Letter.docx")


def build_atlantis() -> Path:
    doc = new_doc(
        title="Cover Letter ATLANTIS PhD Programme",
        subtitle="Computational Track · Christopher Ongko · Vrije Universiteit Amsterdam",
        compact=True,
    )
    add_body(doc, "Dear Members of the ATLANTIS Selection Committee,")
    for para in [
        "I am applying to the computational track of the ATLANTIS PhD programme. My formal training is in management and finance: I hold a Bachelor of Management with a Banking and Finance specialization and am completing a Master of Science in Finance and Accounting at Yuan Ze University. My fit comes from the research software and evidence-governed agent systems I have built, together with empirical work on digital platforms, taxation, and financial constraints.",
        "Across my software portfolio, I study a recurring problem: a system can make an action easy before it has made the action justifiable. Hardware Splicer uses provenance, revision, and bench gates before hardware-affecting authority. Research Drive separates search, proposed acquisition, approved execution, and registered evidence. Policy Lab represents admission rules, quantity limits, settlement outcomes, and decision receipts as distinct stages. These systems are internally tested artifacts, not evidence that they achieve legal fairness or regulatory compliance in deployment. Their value for doctoral work is that they provide concrete mechanisms that can be evaluated rather than only described.",
        "In the computational track, I would like to examine how explanations and procedural checks change the behavior of AI-assisted decision systems used in regulated settings. A tractable first study could compare an ordinary tool-using agent with a matched system required to inspect provenance, detect stale revisions, and surface the rule authorizing an action. Outcomes would include unsupported-action rates, false blocking, task completion, and whether a reviewer can reconstruct why a decision occurred. This would connect technical evaluation to legal questions about contestability, evidence, and meaningful oversight without assuming that one metric resolves the normative issue.",
        "My quantitative research provides a second foundation. I have worked with difference-in-differences, panel models, natural experiments, financial time series, and multi-source data construction. A current paper on ASEAN digital-services taxation examines policy variation and a Malaysian tax-base shock. That paper would be my leading writing-sample candidate because it shows how I move from institutional variation to an empirical design, although the final writing sample should be audited and designated separately before submission.",
        "I would contribute practical engineering in Python, R, SQL, JavaScript/TypeScript, APIs, databases, CI, and MCP/tool-integrated AI systems. I would also contribute methodological restraint. A model output is not an explanation merely because it is fluent; a software test is not evidence of social impact; and a documented rule is not fair merely because it is consistently applied. I want to work with legal and social-science researchers who can challenge the assumptions embedded in the computational design.",
        "My master’s remains in progress, and the advertised computational profile is more directly aligned with computer science, data science, or AI. I nevertheless offer a concrete foundation in building and evaluating tool-using AI systems, empirical research design, and reproducible software, while keeping clear boundaries around fairness or legal-effectiveness claims that my current evidence does not establish.",
    ]:
        add_body(doc, para)
    add_body(doc, "Sincerely,\nChristopher Ongko")
    return save(doc, "VU_ATLANTIS_Computational_Track_Cover_Letter.docx")


NHH_SOP = """My research goal is to study how production costs, energy constraints, and market design enter cryptocurrency valuation without mistaking a persistent trend for an economic mechanism. My master’s thesis at Yuan Ze University develops this agenda through empirical tests of energy-based valuation claims and a separate derivatives framework for non-storable solar energy. As a research assistant, I also build and validate multi-source cryptocurrency datasets for academic analysis.

I am applying to NHH because I want rigorous doctoral training in empirical asset pricing, financial econometrics, and identification. My tentative project asks when energy-cost signals contain incremental information about cryptocurrency prices and returns, when they fail, and how protocol changes can provide useful quasi-experimental variation. The proposed design emphasizes stationarity diagnostics, alternative cost measures, placebo dates, specification curves, and out-of-sample tests. A null result would be informative: it would distinguish an appealing accounting identity from a stable pricing relation.

My preparation combines finance research with software engineering. I work in Python, R, SQL, and reproducible data pipelines, and I have built research tools that retain source, revision, and decision lineage. Four current working papers cover cryptocurrency energy economics, solar-asset derivatives, ASEAN digital taxation, and measurement of platform-economy activity. These projects taught me to treat corrections and failed replications as research outputs rather than hide them.

At NHH, I hope to develop a focused finance contribution with transparent data and falsifiable claims, publish the resulting work, and become an independent researcher able to connect market institutions, computational evidence, and credible empirical design at doctoral level."""


def build_nhh_sop() -> Path:
    count = len(re.findall(r"\b[\w’'-]+\b", NHH_SOP))
    assert 250 <= count <= 300, f"NHH SOP must be 250–300 words, got {count}"
    doc = new_doc(
        title="Statement of Purpose",
        subtitle=f"NHH PhD Programme in Finance · Christopher Ongko · {count} words",
    )
    for para in NHH_SOP.split("\n\n"):
        add_body(doc, para)
    return save(doc, "NHH_Finance_Statement_of_Purpose.docx")


NHH_PROPOSAL_SECTIONS = [
    ("Abstract", [
        "This project asks when energy-cost information contributes to cryptocurrency valuation and when apparent relationships are artifacts of common trends, measurement error, or protocol-specific events. The empirical focus is deliberately narrower than the claim that energy backs digital assets. I will test whether observable changes in mining economics contain incremental information for prices, returns, risk, and network adjustment after conventional market controls, and whether that relation changes when a network’s consensus mechanism changes. The design combines a panel of proof-of-work assets, high-frequency and monthly time-series tests, and event-study evidence around protocol transitions. It places stationarity, cointegration, alternative cost measures, placebo designs, and out-of-sample performance at the center rather than treating them as appendix checks. The intended contribution is a falsifiable account of when an energy-cost signal is economically meaningful, when it is only an accounting correlation, and how market structure mediates the relationship. The project will produce a documented dataset, reproducible code, a specification map, and one primary empirical paper. Existing results in my master’s work are treated as preliminary and will not be carried forward unless they survive the clean design described here."
    ]),
    ("1. Motivation and research problem", [
        "Cryptocurrency markets make the relation between production technology and asset value unusually visible. In proof-of-work networks, miners incur electricity and capital costs to secure the ledger and compete for block rewards. Prices affect mining revenue, mining participation affects security and difficulty, and protocol rules determine issuance. This creates a plausible economic connection between energy costs, network activity, and market value. It does not, however, establish that accumulated electricity expenditure is collateral, a price floor, or a stable predictor of returns.",
        "The empirical challenge is that most variables in this setting trend strongly, respond to the same price cycle, and are measured with error. Hash rate, mining difficulty, market capitalization, electricity-cost estimates, and cumulative energy consumption can rise together even when no stable economic relation exists. A regression in levels may therefore recover a common time trend. Reverse causality is equally plausible: a higher asset price makes more mining profitable and raises hash rate and energy use. A credible study must separate contemporaneous equilibrium adjustment from prediction and from stronger valuation claims.",
        "My earlier work began from the hypothesis that energy expenditure could anchor cryptocurrency value. Subsequent audit work exposed why the broad formulation is too strong. A failed merge can make an electricity-price input nearly constant; cumulative series can generate apparently precise coefficients; and differencing can remove the result. Those failures motivate the proposed doctoral project. Rather than defend one preferred model, I will define the conditions under which energy-cost information survives designs that directly confront non-stationarity, reverse causality, and data provenance."
    ]),
    ("2. Research questions and hypotheses", [
        "The first question is whether mining-cost shocks contain incremental information about cryptocurrency returns or valuation ratios after controlling for market-wide crypto conditions, macro-financial variables, and protocol rules. The null is that cost measures add no stable explanatory or predictive content once common trends and price-driven mining responses are addressed. The alternative is conditional: cost information matters in periods or assets where miners are marginal suppliers of security and face binding operating constraints.",
        "The second question is whether protocol transitions change the relation. Ethereum’s move from proof of work to proof of stake provides a prominent case in which the direct mining-energy channel was sharply reduced. I will test whether energy-cost sensitivities or mining-based valuation ratios break around such transitions relative to proof-of-work comparison assets and placebo dates. This is not automatically a clean natural experiment: the transition was anticipated, the treated asset is unique, and concurrent market events may confound estimates. The design therefore uses multiple windows, synthetic or matched controls where defensible, and transparent sensitivity analysis.",
        "The third question is whether cost-based variables improve out-of-sample forecasts or risk measurement. In-sample fit is not enough. A variable can explain trending prices without helping forecast returns, drawdowns, volatility, or network adjustment. Forecast comparisons will use rolling or expanding windows, benchmarks that exclude energy variables, and evaluation periods fixed before model comparison. I expect the strongest result may be a negative one: energy information may describe the mining equilibrium without pricing the asset independently.",
        "The hypotheses are therefore deliberately separable. H1: innovations in credible marginal mining-cost measures are associated with network adjustment after market-price controls. H2: the relation with returns or valuation ratios is weaker and may be unstable. H3: proof-of-work protocol exposure moderates any energy relation. H4: cumulative cost measures do not survive trend-robust and out-of-sample tests unless a cointegrating relation is independently supported."
    ]),
    ("3. Contribution", [
        "The project contributes to empirical asset pricing by treating cryptocurrency production costs as a candidate state variable rather than an assumed fundamental value. Traditional commodity models connect spot and futures prices to inventories, convenience yields, and production constraints. Cryptocurrencies lack a conventional inventory-demand structure and differ across consensus mechanisms. Examining when a cost channel appears and disappears can clarify which analogies to commodities are economically useful.",
        "A second contribution is methodological. The study will publish a specification map that distinguishes levels, differences, returns, error-correction terms, event-study estimands, and forecast targets. This prevents evidence from one estimand from being narrated as evidence for another. The map will record data vintages, transformations, missingness, and the exact authority of each cost input. Revisions and failed specifications will remain visible.",
        "A third contribution concerns protocol heterogeneity. Instead of treating cryptocurrency as one asset class, the analysis will use consensus mechanism, issuance rules, fee structure, and mining concentration as economic moderators. This makes the project relevant to finance even if a universal energy anchor is rejected: it identifies how technical market design changes the mapping from operating costs to asset-market outcomes."
    ]),
    ("4. Data and measurement", [
        "The core panel will include major proof-of-work assets with sufficiently reliable histories for price, market capitalization, issuance, fees, hash rate, and difficulty. Bitcoin will receive the deepest time-series treatment because its network history and mining data are comparatively mature. Ethereum will be used primarily for the protocol-transition analysis, with the pre-transition mining period separated from the post-transition proof-of-stake period. Smaller assets will enter only when measurement quality and exchange coverage meet predeclared thresholds.",
        "Market data will be assembled from reproducible API sources and cross-checked across providers where licensing permits. Candidate sources include CoinGecko for broad market panels and network-specific or institutional datasets for hash rate, difficulty, fees, and issuance. Electricity inputs will not rely on one global constant. I will compare regional industrial electricity-price indices, published mining-location estimates, and scenario ranges that reflect uncertainty about hardware efficiency and geographic mix. Every derived cost series will retain its input version and transformation code.",
        "Mining cost is not directly observed. The primary variables will therefore be presented as scenarios or ranges: estimated marginal electricity expense per unit of output, revenue-to-electricity-cost ratios, break-even price bands, and innovations in those measures. Capital expenditure, financing constraints, and hardware vintage are important but harder to measure. They will enter where defensible through hardware-efficiency series, mining-company disclosures, or sensitivity bounds rather than a false point estimate.",
        "Macro-financial controls may include interest rates, dollar conditions, broad risk sentiment, and equity or commodity benchmarks. Crypto-market controls will include aggregate returns, volatility, stablecoin or liquidity proxies, and exchange-volume measures where quality is adequate. The final set will be prespecified to avoid using a large control search to manufacture significance."
    ]),
    ("5. Empirical design", [
        "The first analysis will characterize time-series properties before estimating economic relations. Augmented Dickey–Fuller and complementary tests will be used with explicit deterministic terms and lag rules. Because unit-root tests have limited power, graphical diagnostics, break tests, and economic reasoning will accompany p-values. Cointegration models will be used only when the component series and residual relation support them. Otherwise, the analysis will use returns, growth rates, innovations, or bounded ratios.",
        "For network adjustment, I will estimate distributed-lag models linking innovations in price, fees, difficulty, hash rate, and estimated marginal cost. Identification will remain cautious: these models reveal dynamic ordering and adjustment, not structural causality by themselves. Local projections can show impulse-response patterns under transparent assumptions. Results will be compared across periods with different mining profitability and protocol regimes.",
        "For asset-pricing tests, the primary dependent variables will be future returns, volatility, drawdown risk, and valuation ratios rather than the level of market capitalization alone. Baseline models will contain market and macro controls. Energy-cost variables will be added using a locked transformation. Incremental performance will be assessed through coefficient stability, economic magnitude, nested-model comparison, and out-of-sample forecast loss. Standard errors will address serial dependence, and the panel analysis will account for common shocks and asset fixed effects where appropriate.",
        "The Ethereum transition analysis will use event-study and difference-in-differences logic without overstating the design. Windows will be selected before examining estimates. Comparison assets will be chosen through observable pre-event return, volatility, and market characteristics, with proof-of-work exposure considered explicitly. Pre-trend diagnostics, placebo transition dates, alternative windows, and exclusion of major concurrent crypto events will show how much of the estimate depends on timing choices. A synthetic-control exercise may supplement the analysis if a credible donor pool exists, but it will not be treated as automatically superior.",
        "The forecasting exercise will divide estimation and evaluation periods chronologically. Models will be trained using rolling or expanding windows. Benchmarks will include historical means, autoregressive specifications, and market-only models. The main test is whether energy variables improve forecast loss or classification of stress periods without excessive turnover or instability. Hyperparameters and model selection will be nested inside the training period so that the evaluation sample remains untouched."
    ]),
    ("6. Falsification, robustness, and evidence discipline", [
        "The project is designed around ways the main claim can fail. First, cumulative energy and cumulative capitalization series will be treated as descriptive unless a valid long-run relation is established. Second, a nearly constant or mechanically interpolated electricity series will be rejected by automated variance, coverage, and merge diagnostics. Third, all primary results will be rerun with alternative electricity assumptions, hardware-efficiency paths, and mining-location weights.",
        "Placebo tests will include pseudo-transition dates, non-proof-of-work assets, lead variables that should not predict prior outcomes, and shuffled or mismatched regional electricity series. If the same relation appears where the mechanism cannot operate, that will count against the interpretation. Specification curves will display reasonable transformations, windows, controls, and sample choices rather than report only the preferred estimate.",
        "Reverse causality will be addressed through timing, protocol events, and instruments only where an instrument has a defensible exclusion argument. Electricity-price shocks may seem attractive, but global or regional prices can correlate with macro conditions that also affect risk assets. I will therefore avoid labeling an association causal solely because an external price series was used. Where causal identification is not credible, the paper will state that it estimates dynamic association or predictive content.",
        "The data and code workflow will retain source URLs, retrieval dates, checksums, schemas, transformations, and output hashes. A clean rebuild from raw or legally redistributable inputs will be part of the release gate. Restricted inputs will be documented through retrieval and transformation manifests without redistribution. Manuscript tables will be generated from the same locked outputs used in the audit."
    ]),
    ("7. Expected results and interpretation", [
        "There are three plausible outcomes. The strongest positive outcome is that innovations in marginal mining costs predict network adjustment and contain stable incremental information for selected proof-of-work assets, with a clear break when the mechanism is removed. A narrower outcome is that cost variables explain miner participation or difficulty but not investor returns. The null outcome is that apparent valuation relations disappear after trend correction and out-of-sample testing.",
        "All three outcomes would be scientifically informative if the measurement and design are credible. The project will not interpret a positive coefficient as proof that electricity backs cryptocurrency. Nor will a null return forecast imply that mining economics are irrelevant to network security. The contribution is to locate the boundary between production-side adjustment and asset-market valuation, and to show how protocol design changes that boundary."
    ]),
    ("8. Feasibility, timeline, and outputs", [
        "Year 1 will focus on coursework, literature consolidation, data authority, and a reproducible pilot for Bitcoin and Ethereum. The first milestone is a frozen data dictionary and merge audit, followed by descriptive and stationarity diagnostics. By the end of the year, I aim to have the protocol-transition design and baseline dynamic models specified.",
        "Year 2 will complete the proof-of-work panel, event-study robustness, and out-of-sample evaluation. The primary paper will be written alongside the analysis so that each claim maps to an output and a failed test cannot disappear from the narrative. A workshop version will be used to refine the economic mechanism and reduce unnecessary model breadth.",
        "Year 3 will finalize the paper, extend the strongest result if warranted, and integrate it into the dissertation. Public outputs will include code, a data dictionary, source and transformation manifests, nonrestricted derived data where licenses permit, and a failure log covering superseded specifications. The scope is intentionally compatible with one primary empirical paper rather than dependent on building a large new platform."
    ]),
    ("Selected references", [
        "Cong, L. W., Li, Y., & Wang, N. (2021). Tokenomics: Dynamic adoption and valuation. Review of Financial Studies, 34(3), 1105–1155.",
        "de Vries, A. (2018). Bitcoin’s growing energy problem. Joule, 2(5), 801–805.",
        "Easley, D., O’Hara, M., & Basu, S. (2019). From mining to markets: The evolution of Bitcoin transaction fees. Journal of Financial Economics, 134(1), 91–109.",
        "Hayes, A. S. (2017). Cryptocurrency value formation: An empirical study leading to a cost-of-production model for valuing Bitcoin. Telematics and Informatics, 34(7), 1308–1321.",
        "Krause, M. J., & Tolaymat, T. (2018). Quantification of energy and carbon costs for mining cryptocurrencies. Nature Sustainability, 1, 711–718."
    ]),
]


def build_nhh_proposal() -> Path:
    all_text = " ".join(p for _, paras in NHH_PROPOSAL_SECTIONS for p in paras)
    count = len(re.findall(r"\b[\w’'-]+\b", all_text))
    assert 2000 <= count <= 4000, f"NHH proposal must be 2,000–4,000 words, got {count}"
    doc = new_doc(
        title="When Energy Cost Signals Fail",
        subtitle=f"Identification and Falsification in Cryptocurrency Asset Pricing · Tentative PhD Research Proposal · {count} words",
    )
    add_meta(doc, [
        ("Applicant", "Christopher Ongko"),
        ("Programme", "NHH PhD Programme in Finance"),
        ("Research area", "Empirical asset pricing, cryptocurrency markets, production costs, market design"),
    ])
    for heading, paragraphs in NHH_PROPOSAL_SECTIONS:
        doc.add_heading(heading, level=1)
        for para in paragraphs:
            add_body(doc, para)
    return save(doc, "NHH_Finance_Tentative_Research_Proposal.docx")


def build_nhh_research_list() -> Path:
    doc = new_doc(
        title="Publications and Research Activities",
        subtitle="Christopher Ongko · NHH PhD Programme in Finance",
        compact=True,
    )
    add_section(doc, "Working papers", [
        "Wang, Xin-Fu (王新福). “Energy Anchoring in Cryptocurrency Markets: Evidence from Natural Experiments.” SSRN 6426020. Working paper; the current claim audit narrows the public preprint’s broad energy-anchor interpretation.",
        "Wang, Xin-Fu (王新福). “Quantitative Pricing for Non-Storable Energy: A Derivatives Framework for Solar Energy Assets.” SSRN 6425998. Working paper.",
        "Wang, Xin-Fu (王新福). “Digital Services Taxation Without Tax Competition? Evidence from ASEAN Policy Variation and a Base-Expansion Shock in Malaysia.” SSRN 6425958. Working paper.",
        "Wang, Xin-Fu (王新福). “The Invisible Ledger: Quantifying ASEAN’s $192 Billion Unmeasured Platform Economy.” SSRN 6113326. Public preprint; the corrected working manuscript estimates approximately $170 billion and is not yet reflected in the SSRN listing.",
    ])
    add_section(doc, "Master’s research", [
        "Energy-Backed Derivatives: From Empirical Validation to a Credible Pricing-and-Contract Framework. Master of Science in Finance and Accounting thesis in progress, Yuan Ze University. Advisor: Prof. De-Rong Kong.",
        "The thesis studies energy-based cryptocurrency valuation claims and a separate derivatives framework for non-storable solar-energy assets. Current work emphasizes data integrity, stationarity diagnostics, falsification, and the distinction between production-cost mechanisms and stronger collateral or price-floor claims.",
    ])
    add_section(doc, "Research-assistant activity", [
        "Research Assistant, Yuan Ze University College of Management, April 2026–present. Build and validate a multi-source cryptocurrency market-data pipeline using CoinGecko category, profile, analytics, and price endpoints; integrate panels for academic analysis under Prof. De-Rong Kong.",
    ])
    add_section(doc, "Research software and reproducibility", [
        "Cite-Agent — scholarly-search, synthesis, data-analysis, Zotero/R, and MCP research workflows across Semantic Scholar, OpenAlex, PubMed, and financial-data sources.",
        "Research Drive — lab-data search, collection, synthesis, and registry workflow with a public executable interface contract and private API/MCP/orchestrator implementation.",
        "Policy Lab — public case-based constraint workbench separating admission gates, quantity ceilings, settlement outcomes, and reproducible decision receipts.",
        "Nocturnal Oversight — hash-linked longitudinal news-evidence ledger with source custody, recurrence, entity export, and explicit nonclaim boundaries.",
    ])
    add_section(doc, "Methods", [
        "Difference-in-differences, panel models, fixed effects, event studies, instrumental-variables reasoning, empirical asset pricing, time-series diagnostics, robustness analysis, and reproducible data engineering in Python, R, and SQL.",
    ])
    add_section(doc, "Identifiers", [
        "ORCID: 0009-0007-9339-9098 · SSRN Author ID: 10047476 · GitHub: https://github.com/Spectating101"
    ])
    return save(doc, "NHH_Publications_and_Research_Activities.docx")


def main() -> None:
    paths = [
        *[build_cv(name) for name in VARIANTS],
        build_era(),
        build_hku(),
        build_vu_social(),
        build_atlantis(),
        build_nhh_sop(),
        build_nhh_proposal(),
        build_nhh_research_list(),
    ]
    for path in paths:
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
