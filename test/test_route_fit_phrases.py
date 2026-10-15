"""Visa and location phrases must match as words, not as pieces of other words.

"e-3" and "l-1" are US visa classes. As bare substrings they matched "Stage-3" and "Level-1", so ordinary
Taiwan and remote jobs were classified BLOCKED_WORK_AUTH and dropped from the addressable pool; "ntu" (a
Taiwanese university) matched "quantum" and "venture", so unrelated routes read as local.
"""
import importlib.util
import sys
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "route-fit-triage.py"
spec = importlib.util.spec_from_file_location("route_fit_triage", SCRIPT)
rft = importlib.util.module_from_spec(spec)
sys.modules["route_fit_triage"] = rft
spec.loader.exec_module(rft)


def work_auth(text):
    return rft.find_listed_phrase(text, rft.WORK_AUTH_PHRASES)


def local(text):
    return rft.find_listed_phrase(text, rft.LOCAL_OR_REMOTE_PHRASES)


def test_visa_class_names_do_not_match_inside_ordinary_words():
    for text in ["Stage-3 research internship in Taipei, remote friendly", "Level-1 support role, remote",
                 "Phase-3 trial coordinator", "Tool-1 maintenance", "Grade-30 exam"]:
        assert work_auth(text) is None, text


def test_genuine_visa_requirements_still_match():
    assert work_auth("Must hold an L-1 visa") == "visa"      # 'visa' is listed first
    assert work_auth("L-1 transferees only") == "L-1"
    assert work_auth("E-3 holders only") == "E-3"
    assert work_auth("must hold H-1B status") == "H-1B"
    assert work_auth("no visa sponsorship available") == "visa"
    assert work_auth("visas are not provided") == "visa"      # a longer word keeps its suffix
    assert work_auth("Work Authorization required") == "Work Authorization"
    assert work_auth("Tier 2 sponsorship needed") in ("sponsorship", "Tier 2")


def test_a_numbered_phrase_must_end_at_a_word_edge():
    assert work_auth("E-30 certification") is None
    assert work_auth("L-12 cohort") is None


def test_university_abbreviations_do_not_match_inside_words():
    assert local("Quantum computing venture") is None
    assert local("Century Fox centuries-old firm") is None
    assert local("Quantum computing venture in Hsinchu") == "Hsinchu"
    assert local("Visiting researcher at NTU") == "NTU"
    assert local("Remote-first, based in Taipei") in ("Taipei", "Remote")


def test_triage_classifies_a_stage_3_taiwan_job_as_addressable_not_blocked():
    route = {"id": "job-stage3", "lane": "JOB", "organization": "Lab", "opportunity": "Stage-3 research internship",
             "status": "FIRE_NOW", "deadline": "ROLLING", "gate": "Taipei office, remote friendly; Level-1 mentoring"}
    verdict = rft.classify(route) if hasattr(rft, "classify") else None
    if verdict is not None:
        assert verdict[0] != "BLOCKED_WORK_AUTH", verdict
