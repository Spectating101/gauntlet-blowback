import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pay_normalise import normalise

import pytest


def test_chinese_daily_range_uses_midpoint_and_250_working_days():
    result = normalise("日薪1,600~3,000元")
    assert result["annual_twd"] == 575000
    assert result["basis"] == "daily"
    assert result["stated"] is True


def test_daily_marker_annualises_single_twd_amount():
    result = normalise("Daily rate TWD 2000")
    assert result["annual_twd"] == 500000
    assert result["basis"] == "daily"
    assert result["stated"] is True


def test_daily_marker_is_recognised_case_insensitively():
    result = normalise("DAILY TWD 2,000")
    assert result["annual_twd"] == 500000
    assert result["basis"] == "daily"
    assert result["stated"] is True


def test_per_day_marker_annualises_amount():
    result = normalise("TWD 2,000 per day")
    assert result["annual_twd"] == 500000
    assert result["basis"] == "daily"
    assert result["stated"] is True


def test_slash_day_marker_annualises_amount():
    result = normalise("TWD 2,000/day")
    assert result["annual_twd"] == 500000
    assert result["basis"] == "daily"
    assert result["stated"] is True


def test_daily_range_uses_midpoint_before_annualisation():
    result = normalise("daily 1,000~2,000 TWD")
    assert result["annual_twd"] == 375000
    assert result["basis"] == "daily"
    assert result["stated"] is True


def test_daily_amount_at_range_endpoint_is_not_shifted():
    result = normalise("per day TWD 1,600~1,600")
    assert result["annual_twd"] == 400000
    assert result["basis"] == "daily"
    assert result["stated"] is True


def test_malformed_daily_marker_does_not_create_stated_daily_result():
    result = normalise("daily rate unavailable")
    assert result["basis"] != "daily"
    assert result["stated"] is False


def test_disclosure_remains_unstated_with_daily_word():
    result = normalise("daily rate 面議")
    assert result["basis"] == "none"
    assert result["stated"] is False


def test_daily_figure_preserves_currency_conversion():
    result = normalise("日薪2,000 TWD")
    assert result["annual_twd"] == 500000
    assert result["basis"] == "daily"
    assert result["stated"] is True