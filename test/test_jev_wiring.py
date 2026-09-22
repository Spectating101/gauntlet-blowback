"""Jev classifies; the heuristics stay as the floor.

Two places in this repo classify with keyword lists and have both been wrong in ways that cost
real opportunities: the job scorer and the route-fit triage. Jev is wired into both as an optional
upgrade — never a dependency. With no key, behaviour must be exactly what it was before.
"""
import json
import subprocess
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
FIT = ROOT / "scripts" / "route-fit-triage.py"

ROUTES = [
    {"id": "job-abroad-silent", "lane": "JOB", "organization": "Some Lab, Zurich",
     "opportunity": "Research engineer", "status": "FIRE_NOW", "deadline": "ROLLING",
     "gate": "verify exact live role and salary"},
    {"id": "credits-student", "lane": "STUDENT_INFRASTRUCTURE", "organization": "Vendor",
     "opportunity": "Student credits", "status": "FIRE_NOW", "deadline": "WHILE_ENROLLED",
     "gate": "GitHub Student Developer Pack required"},
]

JEV_ANSWER = {"model": "jev-test", "usage": {"input_tokens": 10, "output_tokens": 0}, "answers": {
    "fit": {"type": "choice", "choice": "BLOCKED_WORK_AUTH", "confidence": 0.88,
            "distribution": {"BLOCKED_WORK_AUTH": 0.88, "NEEDS_CHECK": 0.1, "ADDRESSABLE": 0.02}}}}


class Handler(BaseHTTPRequestHandler):
    calls = []

    def do_POST(self):
        Handler.calls.append(json.loads(self.rfile.read(int(self.headers["Content-Length"]))))
        body = json.dumps(JEV_ANSWER).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


@pytest.fixture
def jev_server():
    Handler.calls = []
    srv = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_port}/v1/systemone"
    srv.shutdown()


def run_fit(tmp_path, env=None, *args):
    master = tmp_path / "m.json"
    master.write_text(json.dumps({"records": ROUTES}))
    full = {"PATH": "/usr/bin:/bin", **(env or {})}
    p = subprocess.run([sys.executable, str(FIT), "--master", str(master), "--today", "2026-09-21", "--json", *args],
                       capture_output=True, text=True, timeout=120, env=full)
    assert p.returncode == 0, p.stderr
    return {r["id"]: r for r in json.loads(p.stdout)}, p


def test_without_a_key_the_heuristics_are_unchanged(tmp_path):
    rows, _ = run_fit(tmp_path)
    assert rows["job-abroad-silent"]["fit"] == "NEEDS_CHECK"
    assert rows["credits-student"]["fit"] == "ADDRESSABLE"


def test_jev_is_not_consulted_unless_asked(tmp_path, jev_server):
    run_fit(tmp_path, {"JEV_API_BASE": jev_server, "JEV_API_KEY": "k"})
    assert not Handler.calls, "--jev is opt-in; a configured key alone must not send data"


def test_with_jev_the_verdict_and_its_confidence_are_recorded(tmp_path, jev_server):
    rows, _ = run_fit(tmp_path, {"JEV_API_BASE": jev_server, "JEV_API_KEY": "k"}, "--jev")
    assert Handler.calls, "Jev was asked"
    row = rows["job-abroad-silent"]
    assert row["fit"] == "BLOCKED_WORK_AUTH"
    assert "jev" in row["why"].lower() and "0.88" in row["why"]
    assert row["heuristic_fit"] == "NEEDS_CHECK", "the heuristic verdict is kept for comparison"


def test_a_dead_jev_endpoint_falls_back_to_the_heuristics(tmp_path):
    rows, p = run_fit(tmp_path, {"JEV_API_BASE": "http://127.0.0.1:9/v1", "JEV_API_KEY": "k"}, "--jev")
    assert rows["job-abroad-silent"]["fit"] == "NEEDS_CHECK"
    assert "jev" in p.stderr.lower(), "the failure is reported, not hidden"
