"""deadline-watch must read deadlines the way the queue does: an offset is an instant, a window ends on its last day."""
import importlib.util
import sys
from datetime import date
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "deadline-watch.py"
spec = importlib.util.spec_from_file_location("deadline_watch_parse", SCRIPT)
dw = importlib.util.module_from_spec(spec)
sys.modules["deadline_watch_parse"] = dw
spec.loader.exec_module(dw)


def test_a_plain_day_is_unchanged():
    assert dw.parse_deadline("2026-10-23") == date(2026, 10, 23)


def test_an_anywhere_on_earth_deadline_falls_on_the_next_utc_day():
    assert dw.parse_deadline("2026-10-23T23:59:00-12:00") == date(2026, 10, 24)


def test_an_offset_ahead_of_utc_keeps_its_utc_day():
    assert dw.parse_deadline("2026-10-23T09:00:00+08:00") == date(2026, 10, 23)
    assert dw.parse_deadline("2026-10-23T00:30:00+08:00") == date(2026, 10, 22)
    assert dw.parse_deadline("2026-10-23T10:00:00Z") == date(2026, 10, 23)


def test_an_event_window_ends_on_its_last_day():
    assert dw.parse_deadline("2026-10-20/2026-10-22") == date(2026, 10, 22)
    assert dw.parse_deadline("2026-10-20 / 2026-10-22") == date(2026, 10, 22)


def test_non_dates_and_bad_dates_give_none():
    for value in ("ROLLING", "UNKNOWN", "", None, "2026-13-45", "2026-13-01/2026-13-02"):
        assert dw.parse_deadline(value) is None, value
