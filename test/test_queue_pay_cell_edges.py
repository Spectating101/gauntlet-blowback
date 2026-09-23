"""pay_cell treats missing keys and a missing figure as a dash."""
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
_spec = importlib.util.spec_from_file_location(
    "build_application_queue", ROOT / "scripts" / "build-application-queue.py")
q = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(q)


def test_an_empty_row_prints_a_dash():
    assert q.pay_cell({}) == "—"


def test_a_stated_row_with_no_figure_prints_a_dash():
    assert q.pay_cell({"pay_stated": True, "plausible": True, "annual_twd": None}) == "—"


def test_a_disclosure_still_prints_as_a_floor():
    assert q.pay_cell({"pay_basis": "disclosure", "annual_twd": 480000}) == "≥480,000 (floor)"
