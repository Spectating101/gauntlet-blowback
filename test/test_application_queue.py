"""The queue orders every role; it never drops one.

The ranking decides what gets sent first, so the failure that matters is a role
silently disappearing, or an unreachable role sitting at the top.
"""
import importlib.util
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

_spec = importlib.util.spec_from_file_location(
    "build_application_queue", ROOT / "scripts" / "build-application-queue.py")
q = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(q)


def row(company, title, fit, reachable=0.9, pay="not stated"):
    return {"company": company, "title": title, "fit": fit,
            "reachable": reachable, "pay": pay, "location": "Taipei",
            "url": f"https://example.test/{company}/{title}"}


def test_every_role_survives_the_queue():
    rows = [row("A", f"Role {i}", 2.0 + i / 100) for i in range(25)]
    assert len(q.build(rows)) == 25, "ranking must not drop anything"


def test_higher_fit_is_sent_first():
    out = q.build([row("A", "low", 1.2), row("B", "high", 3.3)])
    assert [r["title"] for r in out] == ["high", "low"]


def test_unreachable_roles_go_to_the_back_but_stay():
    out = q.build([row("A", "unreachable", 3.9, reachable=0.1),
                   row("B", "reachable", 1.1, reachable=0.9)])
    assert [r["title"] for r in out] == ["reachable", "unreachable"]
    assert len(out) == 2, "an unreachable role is deferred, never deleted"


def test_the_same_role_on_two_boards_appears_once():
    out = q.build([row("Binance", "Accelerator", 3.0),
                   row("binance", "accelerator", 3.2)])
    assert len(out) == 1
    assert out[0]["fit"] == 3.2, "the better-scored copy is the one kept"


def test_pay_breaks_a_tie_between_equal_fits():
    out = q.build([row("A", "poorer", 2.5, pay="Annual Salary TWD 600000"),
                   row("B", "richer", 2.5, pay="Annual Salary TWD 1800000")])
    assert [r["title"] for r in out] == ["richer", "poorer"]


def test_a_disclosure_does_not_count_as_stated_pay():
    """面議（經常性薪資達4萬元）is a legal floor, not an offer, so it must not
    outrank a role that genuinely states a salary."""
    out = q.build([row("A", "disclosure", 2.5, pay="面議（經常性薪資達4萬元）"),
                   row("B", "stated", 2.5, pay="Annual Salary TWD 500000")])
    assert [r["title"] for r in out] == ["stated", "disclosure"]


def test_an_implausible_figure_cannot_jump_the_queue():
    out = q.build([row("A", "bogus", 2.5, pay="Monthly Salary TWD 1000000~18000000"),
                   row("B", "real", 2.5, pay="Annual Salary TWD 900000")])
    assert [r["title"] for r in out] == ["real", "bogus"]


def test_ranks_are_dense_and_start_at_one():
    out = q.build([row("A", f"r{i}", 3.0 - i / 10) for i in range(6)])
    assert [r["rank"] for r in out] == [1, 2, 3, 4, 5, 6]


def test_a_missing_fit_does_not_crash_the_sort():
    rows = [row("A", "scored", 2.0)]
    rows.append({"company": "B", "title": "unscored", "reachable": 0.9, "pay": "not stated"})
    out = q.build(rows)
    assert len(out) == 2 and out[0]["title"] == "scored"
