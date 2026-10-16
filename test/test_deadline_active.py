"""deadline-watch must watch every route the queue treats as fire-priority.

is_active used "starts with FIRE/PREPARE/VERIFY", so STRETCH_FIRE, CHECK_FIRE, DEFAULT_PRIMARY_FIRE and WATCH_FIRE
(15 routes, among them a conference paper due 2026-10-23) never appeared in the deadline watch, while the queue
(operator.mjs) counts any status containing FIRE. Holds and closed states must stay quiet.
"""
import importlib.util
import sys
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "deadline-watch.py"
spec = importlib.util.spec_from_file_location("deadline_watch_active", SCRIPT)
dw = importlib.util.module_from_spec(spec)
sys.modules["deadline_watch_active"] = dw
spec.loader.exec_module(dw)


def test_statuses_that_always_counted_still_count():
    for status in ["FIRE", "FIRE_NOW", "FIRE_AFTER_GATE", "FIRE_IF_FIT", "VERIFY", "VERIFY_PAPER_AND_REVIEWER_ELIGIBILITY",
                   "PREPARE", "PREPARE_VERIFIED", "FIRE_AFTER_REPO_AND_USE_CASE_VERIFY"]:
        assert dw.is_active(status), status


def test_fire_in_any_position_counts():
    for status in ["STRETCH_FIRE", "CHECK_FIRE", "DEFAULT_PRIMARY_FIRE", "WATCH_FIRE", "primary_fire"]:
        assert dw.is_active(status), status


def test_holds_and_closed_states_stay_quiet_even_with_fire_in_them():
    for status in ["HOLD", "HOLD_FIRE_LATER", "HOLD_OR_KILL", "HOLD_PACKET_SIGNATURES_AND_ADVISER_CLARIFICATION",
                   "KILL_FIRE", "REJECTED", "EXPIRED_RETAIN", "SUBMITTED", "CLOSED_FIRE"]:
        assert not dw.is_active(status), status


def test_statuses_without_an_active_word_are_not_watched():
    for status in ["WATCH_OWNER_DEFERRED_POST_MASTER_FOCUS", "HIGH_FIT_ALTERNATIVE", "CHECK_CURRENT_CALL_AND_CAREER_FIT",
                   "FALLBACK_ONLY", "EXISTING_APPLICATION_IN_PROGRESS", "WATCH_REVERIFY"]:
        assert not dw.is_active(status), status


def test_an_active_word_must_be_a_whole_word_unless_it_leads_the_status():
    for status in ["HIGH_FIREPOWER", "WATCH_PREPAREDNESS", "NEEDS_VERIFYING", "WATCH_REVERIFY"]:
        assert not dw.is_active(status), status


def test_non_strings_are_inactive():
    for value in [None, 0, [], {}, ""]:
        assert not dw.is_active(value), repr(value)
