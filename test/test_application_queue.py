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


def _stub_rules(monkeypatch, verdicts):
    """Pin curate_row's verdict per title, so these tests check the ordering and
    not the content of job-watch's rules."""
    monkeypatch.setattr(q._job_watch, "curate_row",
                        lambda r: dict(zip(("verdict", "tier"), verdicts.get(r.get("title"), ("skip", "C")))))


def test_the_rules_tier_outranks_a_higher_jev_score(monkeypatch):
    """Measured on 40 hand-labelled roles: Jev alone put 2 of the 7 best in its
    top ten, rules tier first put 4. Jev only orders within a tier."""
    _stub_rules(monkeypatch, {"kept": ("keep", "A"), "skipped": ("skip", "C")})
    out = q.build([row("B", "skipped", 3.4), row("A", "kept", 1.8)])
    assert [r["title"] for r in out] == ["kept", "skipped"]
    assert [r["tier"] for r in out] == ["keep-A", "skip"]


def test_jev_orders_roles_within_one_tier(monkeypatch):
    _stub_rules(monkeypatch, {"low": ("keep", "B"), "high": ("keep", "B")})
    out = q.build([row("A", "low", 1.5), row("B", "high", 3.1)])
    assert [r["title"] for r in out] == ["high", "low"]


def test_a_skipped_role_sinks_but_is_never_dropped(monkeypatch):
    """The rules skip real roles posted through recruiting agencies, so a skip
    may only move a role down the queue."""
    _stub_rules(monkeypatch, {f"r{i}": ("keep", "A") for i in range(3)})
    rows = [row("A", f"r{i}", 2.0) for i in range(3)] + [row("Agency", "via recruiter", 3.9)]
    out = q.build(rows)
    assert len(out) == 4 and out[-1]["title"] == "via recruiter" and out[-1]["tier"] == "skip"


def test_reachability_still_comes_before_the_tier(monkeypatch):
    _stub_rules(monkeypatch, {"abroad": ("keep", "A"), "local": ("skip", "C")})
    out = q.build([row("A", "abroad", 3.0, reachable=0.1), row("B", "local", 1.0, reachable=0.9)])
    assert [r["title"] for r in out] == ["local", "abroad"]
