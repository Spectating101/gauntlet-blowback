"""Classify routes by whether this applicant can actually enter them.

The applicant is an Indonesian national living in Taiwan, a full-time master's student until
2027-01, with no work authorisation outside Taiwan. Routes that require work authorisation the
applicant does not hold are not opportunities, however attractive they look. This triage keeps the
addressable pool honest so effort goes where a shot can actually land.
"""
import json
import subprocess
import sys
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "route-fit-triage.py"

ROUTES = [
    {"id": "job-us-lab", "lane": "JOB", "organization": "US Lab", "opportunity": "Research engineer",
     "status": "FIRE_NOW", "deadline": "ROLLING",
     "gate": "G1 no visa sponsorship: applicant must already hold full-time work authorization in the US"},
    {"id": "fellow-visa-supported", "lane": "RESEARCH", "organization": "LASR", "opportunity": "Research programme",
     "status": "FIRE_NOW", "deadline": "2026-12-01",
     "gate": "visa support provided under the Government Authorised Exchange scheme"},
    {"id": "credits-student", "lane": "STUDENT_INFRASTRUCTURE", "organization": "Vendor", "opportunity": "Student credits",
     "status": "FIRE_NOW", "deadline": "WHILE_ENROLLED", "gate": "G1 active GitHub Student Developer Pack required"},
    {"id": "cfp-open", "lane": "RESEARCH", "organization": "Conference", "opportunity": "Call for papers",
     "status": "FIRE_NOW", "deadline": "2026-10-30", "gate": "submit an abstract; no eligibility restriction stated"},
    {"id": "already-judged", "lane": "RESEARCH", "organization": "X", "opportunity": "Y", "status": "FIRE_NOW",
     "deadline": "ROLLING", "gate": "whatever", "eligibility_verdict": "INELIGIBLE — faculty only"},
    {"id": "expired", "lane": "RESEARCH", "organization": "X", "opportunity": "Y", "status": "FIRE_NOW",
     "deadline": "2026-09-01", "gate": "open to all"},
]


def run(tmp_path, *args):
    master = tmp_path / "master.json"
    master.write_text(json.dumps({"records": ROUTES}))
    p = subprocess.run([sys.executable, str(SCRIPT), "--master", str(master), "--today", "2026-09-21", "--json", *args],
                       capture_output=True, text=True, timeout=120)
    assert p.returncode == 0, p.stdout + p.stderr
    return {r["id"]: r for r in json.loads(p.stdout)}


def test_work_authorisation_gates_are_separated_from_real_opportunities(tmp_path):
    out = run(tmp_path)
    assert out["job-us-lab"]["fit"] == "BLOCKED_WORK_AUTH"
    assert "work authorization" in out["job-us-lab"]["why"].lower()
    assert out["fellow-visa-supported"]["fit"] == "ADDRESSABLE", "visa support cancels the work-auth gate"


def test_student_and_open_routes_are_addressable(tmp_path):
    out = run(tmp_path)
    assert out["credits-student"]["fit"] == "ADDRESSABLE"
    assert out["cfp-open"]["fit"] == "ADDRESSABLE"


def test_a_recorded_verdict_wins_over_the_heuristic(tmp_path):
    out = run(tmp_path)
    assert out["already-judged"]["fit"] == "INELIGIBLE"
    assert "verdict" in out["already-judged"]["why"].lower()


def test_expired_routes_are_dropped(tmp_path):
    assert "expired" not in run(tmp_path)


def test_default_output_is_a_readable_shortlist(tmp_path):
    master = tmp_path / "master.json"
    master.write_text(json.dumps({"records": ROUTES}))
    p = subprocess.run([sys.executable, str(SCRIPT), "--master", str(master), "--today", "2026-09-21"],
                       capture_output=True, text=True, timeout=120)
    assert p.returncode == 0
    assert "ADDRESSABLE" in p.stdout and "credits-student" in p.stdout
    assert "BLOCKED_WORK_AUTH" in p.stdout


EMPLOYMENT = [
    {"id": "job-abroad-silent", "lane": "JOB", "organization": "Some Lab, Zurich", "opportunity": "Research engineer",
     "status": "FIRE_NOW", "deadline": "ROLLING", "gate": "verify exact live role and salary"},
    {"id": "predoc-abroad-silent", "lane": "PREDOC", "organization": "US University", "opportunity": "Predoctoral RA",
     "status": "FIRE_NOW", "deadline": "ROLLING", "gate": "verify live deadline and salary"},
    {"id": "job-taiwan", "lane": "JOB", "organization": "Gogolook", "opportunity": "Data scientist, Taipei Taiwan",
     "status": "FIRE_NOW", "deadline": "ROLLING", "gate": "verify team fit"},
    {"id": "job-remote", "lane": "JOB", "organization": "Remote Co", "opportunity": "Fully remote engineer, work from anywhere",
     "status": "FIRE_NOW", "deadline": "ROLLING", "gate": "portfolio review"},
]


def run_rows(tmp_path, rows):
    master = tmp_path / "m.json"
    master.write_text(json.dumps({"records": rows}))
    p = subprocess.run([sys.executable, str(SCRIPT), "--master", str(master), "--today", "2026-09-21", "--json"],
                       capture_output=True, text=True, timeout=120)
    assert p.returncode == 0, p.stdout + p.stderr
    return {r["id"]: r for r in json.loads(p.stdout)}


def test_silent_employment_routes_are_not_assumed_open(tmp_path):
    """An overseas job that says nothing about visas is not evidence that none is needed."""
    out = run_rows(tmp_path, EMPLOYMENT)
    assert out["job-abroad-silent"]["fit"] == "NEEDS_CHECK"
    assert "work authorisation" in out["job-abroad-silent"]["why"].lower()
    assert out["predoc-abroad-silent"]["fit"] == "NEEDS_CHECK"


def test_taiwan_and_remote_employment_stay_addressable(tmp_path):
    out = run_rows(tmp_path, EMPLOYMENT)
    assert out["job-taiwan"]["fit"] == "ADDRESSABLE", out["job-taiwan"]["why"]
    assert out["job-remote"]["fit"] == "ADDRESSABLE", out["job-remote"]["why"]
