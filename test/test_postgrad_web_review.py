"""No-network tests for dated job research and eligibility gates."""
import importlib.util
import json
from datetime import date
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("postgrad_web_review", ROOT / "scripts/postgrad-web-review.py")
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


@pytest.fixture
def review():
    return json.loads((ROOT / "data/jobs/postgrad-web-source-review-20261019.json").read_text())


def test_sources_are_https_and_unique(review):
    assert len(m.validate(review)) >= 10


def test_blocked_eligibility_cannot_become_apply_now(review):
    rows = {r["key"]: r for r in m.validate(review)}
    for k in ("sc-wealth-retail-2027", "hsbc-iwpb-graduate-2027", "mastercard-launch-2027"):
        assert rows[k]["status"].startswith("BLOCKED_")
    assert rows["citi-commercial-summer-2027"]["status"] == "EXCLUDE_GRADUATION_WINDOW"


def test_citi_full_time_distinct_from_summer_internship(review):
    rows = {r["key"]: r for r in m.validate(review)}
    assert rows["citi-commercial-ft-2027"]["status"] == "PRIORITIZE_PACKET"
    assert rows["citi-commercial-ft-2027"]["deadline"] == "2026-11-27"
    assert rows["citi-commercial-summer-2027"]["status"] != "PRIORITIZE_PACKET"


def test_top_packets_need_official_employer_source(review):
    review["leads"][0]["source_tier"] = "third_party_only"
    with pytest.raises(ValueError, match="official"):
        m.validate(review)


def test_missing_risk_or_requirement_is_not_evidence(review):
    review["leads"][0]["requirements"] = []
    with pytest.raises(ValueError, match="requirements"):
        m.validate(review)


def test_no_autosubmit_status_is_permitted(review):
    review["leads"][0]["status"] = "AUTO_SUBMIT"
    with pytest.raises(ValueError, match="unsafe"):
        m.validate(review)


def test_expired_deadline_is_labeled(review):
    s = m.render(review, date(2027, 1, 1))
    assert "2026-11-27 (expired)" in s
    assert "permanent work rights" in s.lower()


def test_three_tiers_keep_worthwhile_jobs_visible(review):
    rows=m.validate(review)
    assert len(rows) >= 35
    counts={t:sum(r["career_tier"]==t for r in rows) for t in "ABCX"}
    assert counts["B"] >= 10
    assert counts["C"] >= 8
    assert all(t in counts for t in "ABCX")
    out=m.render(review, date(2026, 10, 19))
    assert "Tier A (exceptional), B (strong), and C (worthwhile)" in out
    assert "Research Assistant" in out
    assert "SinoPac" in out


def test_exclusions_are_never_classified_as_applications(review):
    x=next(r for r in review["leads"] if r["key"]=="sc-wealth-retail-2027")
    x["career_tier"]="A"
    with pytest.raises(ValueError, match="cannot be in an application tier"):
        m.validate(review)


def test_mandarin_gated_prestige_can_still_be_tier_a(review):
    rows={r["key"]:r for r in m.validate(review)}
    blackrock=rows["blackrock-2027-apac"]
    assert blackrock["career_tier"]=="A"
    assert blackrock["status"]=="HOLD_LANGUAGE"
    assert any("Mandarin" in r for r in blackrock["risks"])


def test_academia_ra_accepts_bachelors_degree_without_false_masters_claim(review):
    x=next(r for r in m.validate(review) if r["key"]=="sinica-econ-chen-gongping-ra")
    assert x["career_tier"]=="B"
    assert "Bachelor" in x["requirements"][0]
    assert x["status"]=="FIT_AND_TIMING_REVIEW"
