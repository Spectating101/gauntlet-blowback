"""Normalise Taiwanese job pay strings to annual TWD.

The hard part is not arithmetic, it is telling a stated wage from a legal
disclosure. A 104 posting that says 面議（經常性薪資達4萬元）is declaring that
regular monthly pay reaches NT$40,000, which the law requires it to publish
once the advertised salary is negotiable. Reading that as "this job pays
480,000 a year" turns a floor into an offer, so it is reported with
stated=False and the caller decides whether to trust it.

A zero is treated the same way: boards emit "0~0" as a placeholder for an
empty field, and no job in this corpus pays nothing.

Bases: "annual", "monthly", "daily" (250 working days), "hourly" (2,080 hours),
"disclosure" (a legal floor, stated=False) and "none" (no usable figure).
"""

from __future__ import annotations

import re

HOURS_PER_YEAR = 2080
WORKING_DAYS_PER_YEAR = 250
MONTHS_PER_YEAR = 12

NONE = {"annual_twd": None, "basis": "none", "stated": False}

# Boards post a few roles in other currencies. Reading "USD 1500" as TWD
# understates the wage thirtyfold, which is worse than refusing to answer.
# Rates are indicative and only used to keep such rows comparable.
_CURRENCIES = {"usd": 32.0, "eur": 35.0, "jpy": 0.22, "cny": 4.5, "hkd": 4.1, "sgd": 24.0}
_CURRENCY_RE = re.compile(r"\b(usd|eur|jpy|cny|hkd|sgd)\b", re.I)

# Taiwan's minimum wage is about NT$300k a year and almost nothing legitimate
# clears NT$20m. Outside that band the source string has contradicted itself --
# "Monthly TWD 18000000" is an annual figure wearing a monthly label -- so the
# figure is returned with plausible=False rather than silently believed.
_PLAUSIBLE_MIN = 200_000
_PLAUSIBLE_MAX = 20_000_000

# 萬 is 10,000. The threshold in a disclosure varies (3萬, 4.5萬), so it is read
# rather than assumed.
_DISCLOSURE = re.compile(r"經常性薪資達\s*([\d.]+)\s*萬")
_NUMBER = re.compile(r"\d[\d,]*(?:\.\d+)?")

# Basis markers, checked in this order. Hourly and daily are checked before
# monthly and annual so that a string carrying 時薪 or 日薪 and a stray 月 does
# not annualise wrongly.
_MARKERS = (
    ("hourly", ("時薪", "hourly", "per hour", "/hr")),
    ("daily", ("日薪", "daily", "per day", "/day")),
    ("annual", ("年薪", "annual", "per year", "/yr", "yearly")),
    ("monthly", ("月薪", "monthly", "per month", "/mo")),
)

_PER_YEAR = {"hourly": HOURS_PER_YEAR, "daily": WORKING_DAYS_PER_YEAR, "annual": 1, "monthly": MONTHS_PER_YEAR}


def _basis(text: str) -> str | None:
    lowered = text.lower()
    for basis, markers in _MARKERS:
        if any(m in lowered for m in markers):
            return basis
    return None


def _figures(text: str) -> list[float]:
    return [float(m.group(0).replace(",", "")) for m in _NUMBER.finditer(text)]


def normalise(pay: str) -> dict:
    """Annual TWD for a pay string, or basis "none" when it carries no figure."""
    if not isinstance(pay, str) or not pay.strip():
        return dict(NONE)

    disclosure = _DISCLOSURE.search(pay)
    if disclosure:
        monthly = float(disclosure.group(1)) * 10000
        return {"annual_twd": int(round(monthly * MONTHS_PER_YEAR)),
                "basis": "disclosure", "stated": False}

    basis = _basis(pay)
    if basis is None:
        # Without a marker the figures cannot be placed on a scale: a bare
        # "10000-750000" spans an hourly rate through to an annual salary.
        return dict(NONE)

    # A disclosure threshold inside a marked string would otherwise be counted
    # as a wage figure, so those digits are removed before reading the numbers.
    figures = [f for f in _figures(_DISCLOSURE.sub("", pay)) if f > 0]
    if not figures:
        return dict(NONE)

    midpoint = (min(figures) + max(figures)) / 2
    currency = _CURRENCY_RE.search(pay)
    rate = _CURRENCIES[currency.group(1).lower()] if currency else 1.0
    annual = int(round(midpoint * _PER_YEAR[basis] * rate))
    out = {"annual_twd": annual, "basis": basis, "stated": True}
    if not _PLAUSIBLE_MIN <= annual <= _PLAUSIBLE_MAX:
        out["plausible"] = False
    if currency:
        out["currency"] = currency.group(1).upper()
    return out
