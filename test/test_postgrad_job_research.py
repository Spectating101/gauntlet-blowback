"""Isolated, no-network tests for candidate-safe job research."""
import importlib.util
import json
import urllib.error
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/postgrad-job-research.py"
spec = importlib.util.spec_from_file_location("postgrad_job_research", SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def job(**updates):
    row = {
        "key": "sample",
        "company": "Sample",
        "title": "Quantitative Researcher",
        "ats": "greenhouse",
        "board": "worldquant",
        "posting_id": "4069484006",
        "priority": 1,
        "lane": "quant",
        "review": "PACKET_CANDIDATE",
        "fit": "Empirical research",
        "gates": ["human final submit"],
        "source_url": "https://job-boards.greenhouse.io/worldquant/jobs/4069484006",
    }
    row.update(updates)
    return row


def test_ats_verified_does_not_mean_submitted():
    result = mod.evaluate(job(), lambda _: {
        "id": 4069484006, "title": "Quantitative Researcher", "location": {"name": "Taipei"}
    })
    assert result["listing_state"] == "LIVE_ATS_CONFIRMED"
    assert result["disposition"] == "PREPARE_DRAFT"
    assert result["application_state"] == "NOT_RECONCILED"


def test_404_never_approved_as_live():
    def missing(_):
        raise urllib.error.HTTPError("url", 404, "Not Found", {}, None)
    result = mod.evaluate(job(), missing)
    assert result["listing_state"] == "ATS_NOT_FOUND"
    assert result["disposition"] == "HOLD_LISTING"


def test_network_error_not_treated_as_closed_or_verified():
    def failed(_):
        raise urllib.error.URLError("outage")
    result = mod.evaluate(job(), failed)
    assert result["listing_state"] == "CHECK_FAILED"
    assert result["disposition"] == "HOLD_LISTING"


def test_renamed_posting_requires_review():
    result = mod.evaluate(job(), lambda _: {"id": 4069484006, "title": "Senior Quantitative Researcher"})
    assert result["listing_state"] == "TITLE_CHANGED_REVIEW"
    assert result["disposition"] == "HOLD_LISTING"


def test_eligibility_hold_survives_active_listing():
    result = mod.evaluate(job(review="HOLD_REQUIREMENTS"), lambda _: {
        "id": 4069484006, "title": "Quantitative Researcher"
    })
    assert result["disposition"] == "HOLD_REQUIREMENTS"


def test_reject_mismatched_ats_urls():
    with pytest.raises(ValueError):
        mod.api_url(job(source_url="https://evil.example.com/jobs/4069484006"))


def test_duplicate_identity_is_rejected():
    with pytest.raises(ValueError, match="duplicate"):
        mod.build({"schema": "blowback.postgrad_job_targets.v1", "targets": [job(), job(key="two")]})


def test_official_ledger_is_not_counted_as_applications():
    result = mod.build({"schema": "blowback.postgrad_job_targets.v1", "targets": [job()]},
                       lambda _: {"id": 4069484006, "title": "Quantitative Researcher"})
    assert result["policy"]["application_receipts"] == "NOT_RECONCILED"
    assert "applications" in mod.markdown(result).lower()
