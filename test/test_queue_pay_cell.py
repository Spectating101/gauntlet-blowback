"""The readable queue shows a 104 disclosure as a floor, never as a salary."""
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
_spec = importlib.util.spec_from_file_location(
    "build_application_queue", ROOT / "scripts" / "build-application-queue.py")
q = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(q)


def row(title, fit, pay):
    return {"company": "C", "title": title, "fit": fit, "reachable": 0.9,
            "pay": pay, "location": "Taipei", "url": f"https://x.test/{title}"}


def cell(pay):
    return q.pay_cell(q.enrich(row("t", 2.0, pay)))


def test_a_stated_salary_prints_the_figure():
    assert cell("Annual Salary TWD 1000000") == "1,000,000"


def test_a_disclosure_prints_as_a_floor():
    assert cell("面議（經常性薪資達4萬元）") == "≥480,000 (floor)"


def test_the_floor_is_read_from_the_posting():
    assert cell("面議（經常性薪資達3萬元）") == "≥360,000 (floor)"


def test_no_figure_prints_a_dash():
    assert cell("not stated") == "—"


def test_an_implausible_figure_prints_a_dash():
    assert cell("Monthly Salary TWD 1000000~18000000") == "—"


def test_the_basis_is_carried_into_the_csv_fields():
    assert "pay_basis" in q.FIELDS
    assert q.FIELDS.index("pay_basis") == q.FIELDS.index("pay_stated") + 1
    assert q.enrich(row("t", 2.0, "not stated"))["pay_basis"] == "none"


def test_a_floor_still_never_outranks_a_stated_salary():
    out = q.build([row("floor", 2.5, "面議（經常性薪資達4.5萬元）"),
                   row("stated", 2.5, "Annual Salary TWD 300000")])
    assert [r["title"] for r in out] == ["stated", "floor"]
