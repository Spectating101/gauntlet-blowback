"""A typed-decision client for Jev (TypeSafe System One), used for classification only.

Jev answers three shapes — noul (a calibrated yes/no probability), choice and score — and no reasoning. That suits
the triage this repo does badly with keyword lists: which jobs are worth an application, whether a
route is enterable, whether a question is an irreversible decision. It must never be required:
with no key configured, callers fall back to the existing heuristics rather than failing.
"""
import json
import os
import subprocess
import sys
import threading
from functools import partial
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

# Recorded from the live api.typesafe.ai/v1/systemone endpoint on 2026-09-22,
# not hand-written: a noul answer carries a bare probability and no confidence,
# score is a 0-indexed float with the legend the service echoes back, and the
# distribution key is "probabilities".
RESPONSE = {
    "model": "jev-1.13.0",
    "answers": {
        "fit": {"type": "score", "score": 2.96, "confidence": 0.63,
                "legend": {"0": "low", "1": "below market", "2": "market",
                           "3": "above market", "4": "top of market"},
                "probabilities": {"0": 0.0, "1": 0.03, "2": 0.18, "3": 0.59, "4": 0.2}},
        "reachable": {"type": "noul", "noul": 0.11},
        "kind": {"type": "choice", "choice": "senior", "confidence": 1.0,
                 "probabilities": {"junior": 0.0, "senior": 1.0, "mid": 0.0}},
    },
    "usage": {"input_tokens": 296, "output_tokens": 20},
}


class Handler(BaseHTTPRequestHandler):
    calls: list = []

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        Handler.calls.append({"body": body, "auth": self.headers.get("Authorization", "")})
        payload = json.dumps(RESPONSE).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *args):
        pass


@pytest.fixture
def server(monkeypatch):
    Handler.calls = []
    srv = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    monkeypatch.setenv("JEV_API_BASE", f"http://127.0.0.1:{srv.server_port}/v1/systemone")
    monkeypatch.setenv("JEV_API_KEY", "test-key-1")
    for n in range(1, 6):
        monkeypatch.delenv(f"JEV_API_KEY_{n}", raising=False)
    yield srv
    srv.shutdown()


def fresh():
    import importlib
    import jev
    return importlib.reload(jev)


def test_ask_returns_typed_answers(server):
    jev = fresh()
    out = jev.ask(state={"title": "Data Scientist"}, questions={
        "fit": jev.score("Pay level for Taipei", ["low", "market", "top of market"]),
        "reachable": jev.boolean("Can the applicant take this without a work permit?"),
        "kind": jev.choice("Seniority", {"junior": "entry", "mid": "a few years", "senior": "senior or staff"}),
    })
    assert out["fit"]["score"] == 2.96 and out["fit"]["confidence"] == 0.63
    assert out["reachable"]["noul"] == 0.11
    assert jev.yes(out["reachable"]) is False, "0.11 is a no"
    assert out["kind"]["choice"] == "senior"
    sent = Handler.calls[0]["body"]
    assert sent["state"] == {"title": "Data Scientist"}
    assert set(sent["questions"]) == {"fit", "reachable", "kind"}
    assert Handler.calls[0]["auth"].endswith("test-key-1"), "the key is sent as a bearer token"


def test_without_a_key_it_reports_unavailable_instead_of_failing(server, monkeypatch):
    monkeypatch.delenv("JEV_API_KEY", raising=False)
    jev = fresh()
    assert jev.available() is False
    assert jev.ask(state={"x": 1}, questions={"q": jev.boolean("is it?")}) is None
    assert not Handler.calls, "no request is attempted without a key"


def test_five_keys_are_rotated(server, monkeypatch):
    monkeypatch.delenv("JEV_API_KEY", raising=False)
    for n in range(1, 6):
        monkeypatch.setenv(f"JEV_API_KEY_{n}", f"key-{n}")
    jev = fresh()
    q = {"reachable": jev.boolean("is it?")}
    for _ in range(6):
        jev.ask(state={"x": 1}, questions=q)
    used = [c["auth"].split()[-1] for c in Handler.calls]
    assert len(set(used)) == 5, f"all five keys are used, got {set(used)}"
    assert used[0] == used[5], "rotation wraps around"


def test_a_failing_endpoint_returns_none_rather_than_raising(monkeypatch):
    monkeypatch.setenv("JEV_API_BASE", "http://127.0.0.1:9/v1/systemone")
    monkeypatch.setenv("JEV_API_KEY", "k")
    jev = fresh()
    assert jev.ask(state={"x": 1}, questions={"q": jev.boolean("is it?")}) is None


def test_question_builders_match_the_api_shapes(server):
    """The names here are the endpoint's own; a wrong one is a 400 or a 422."""
    jev = fresh()
    b = jev.boolean("is it?")
    assert b == {"type": "noul", "instructions": "is it?"}
    c = jev.choice("which?", {"a": "the first", "b": "the second"})
    assert c["type"] == "choice" and c["instructions"] == "which?"
    assert c["criteria"] == {"a": "the first", "b": "the second"}, "choice criteria are a dict"
    s = jev.score("how much?", ["low", "mid", "high"])
    assert s["type"] == "score" and s["criteria"] == ["low", "mid", "high"], "score criteria are an ordered list"


def test_yes_reads_a_noul_probability(server):
    jev = fresh()
    assert jev.yes({"type": "noul", "noul": 0.93}) is True
    assert jev.yes({"type": "noul", "noul": 0.11}) is False
    assert jev.yes(None) is None, "no answer is not a no"


# The whole Jev integration was once written against an invented schema and every
# mocked test passed, because the mock encoded the same invention. This is the only
# test that can catch that class of error: it asks the real service.
@pytest.mark.skipif(not os.environ.get("JEV_API_KEY_1") and not os.environ.get("JEV_API_KEY"),
                    reason="no Jev key configured")
def test_live_contract_matches_the_mocked_shapes():
    import importlib
    import jev as _jev
    jev = importlib.reload(_jev)
    out = jev.ask(
        state={"role": "Senior ML Engineer, Taipei"},
        questions={
            "reachable": jev.boolean("Can a person based in Taiwan take this role?"),
            "level": jev.choice("Seniority", {"junior": "entry", "senior": "senior or staff"}),
            "pay": jev.score("Pay level", ["low", "market", "top of market"]),
        },
    )
    assert out is not None, "live call failed; the request shape no longer matches the API"
    assert out["reachable"]["type"] == "noul" and isinstance(out["reachable"]["noul"], float)
    assert out["level"]["choice"] in {"junior", "senior"}
    assert isinstance(out["pay"]["score"], float)
    # The mock must keep describing the live answer keys, or the offline tests
    # drift back into testing an invention.
    for key, live in out.items():
        mocked = RESPONSE["answers"][{"reachable": "reachable", "level": "kind", "pay": "fit"}[key]]
        assert set(live) <= set(mocked), f"live {key} has keys the mock lacks: {set(live) - set(mocked)}"
