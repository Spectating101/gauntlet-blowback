import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from pay_normalise import normalise

def test_annual_range_takes_the_midpoint():
    assert normalise("Annual Salary TWD 1200000~1500000") == {
        "annual_twd": 1350000, "basis": "annual", "stated": True}

def test_annual_with_currency_and_chinese_unit():
    assert normalise("NT$ 800,000 - 1,200,000 (年薪)") == {
        "annual_twd": 1000000, "basis": "annual", "stated": True}

def test_single_annual_figure():
    assert normalise("Annual Salary TWD 1400000")["annual_twd"] == 1400000

def test_monthly_is_annualised():
    r = normalise("Monthly Salary TWD 50000~70000")
    assert r["annual_twd"] == 720000 and r["basis"] == "monthly"

def test_hourly_is_annualised():
    r = normalise("時薪 200元")
    assert r["annual_twd"] == 416000 and r["basis"] == "hourly"

def test_the_104_disclosure_is_not_a_stated_salary():
    r = normalise("面議（經常性薪資達4萬元）")
    assert r == {"annual_twd": 480000, "basis": "disclosure", "stated": False}

def test_the_disclosure_threshold_is_read_not_assumed():
    assert normalise("面議（經常性薪資達3萬元）")["annual_twd"] == 360000
    assert normalise("面議（經常性薪資達4.5萬元）")["annual_twd"] == 540000

def test_a_zero_range_is_a_placeholder_not_a_wage():
    assert normalise("Monthly Salary TWD 0~0") == {
        "annual_twd": None, "basis": "none", "stated": False}

def test_not_stated():
    assert normalise("not stated")["annual_twd"] is None

def test_garbage_does_not_raise():
    for junk in ["", "   ", "??", None]:
        assert normalise(junk)["basis"] == "none"


def test_a_number_without_a_pay_marker_is_not_a_wage():
    """Found by the Copilot review seat: the other implementation read any string
    carrying a digit as a salary, so "requires 3 years experience" became a wage."""
    for junk in ["requires 3 years experience", "5 openings", "unparseable 100000",
                 "台北市 2 位", "10000-750000"]:
        assert normalise(junk) == {"annual_twd": None, "basis": "none", "stated": False}, junk


def test_a_non_twd_currency_is_converted_not_read_as_twd():
    r = normalise("Monthly Salary USD 1500~2500")
    assert r["currency"] == "USD"
    assert r["annual_twd"] > 500_000, "USD 2000/mo read as TWD would understate it thirtyfold"


def test_a_figure_outside_any_believable_band_is_flagged():
    r = normalise("Monthly Salary TWD 1000000~18000000")
    assert r["plausible"] is False, "NT$114m/yr is a mislabelled source row, not a salary"
