"""Jev classifies and never decides.

Jev (TypeSafe AI System One) is a typed-decision model used for classification
only. A caller POSTs {model, state, questions} and receives {answers, model, usage}.
It answers noul (a calibrated yes/no as a probability), choice (one labelled
option of up to 255, with probabilities) and score (a position on an ordered
scale) only. Every question carries "instructions"; choice and score each carry
"criteria" -- a dict of label -> meaning for choice, an ordered list for score.
It writes no prose and returns no
reasoning, so its answers are inputs to a human or to Claude, never a verdict on
an irreversible action. Jev must never be required: with no key configured,
callers fall back to existing heuristics rather than failing.

Jev
---
Environment (do not place any key value in this file or in docs):

- JEV_API_KEY, or JEV_API_KEY_1 through JEV_API_KEY_5 when the single key is
  unset. When several numbered keys are configured they rotate round-robin.
- JEV_API_BASE, default https://api.typesafe.ai/v1/systemone
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

DEFAULT_API_BASE = "https://api.typesafe.ai/v1/systemone"
DEFAULT_MODEL = "jev-latest"
DEFAULT_TIMEOUT = 20

_rotate = 0


def _configured_keys() -> list[str]:
    primary = os.environ.get("JEV_API_KEY") or ""
    if primary:
        return [primary]
    keys = []
    for n in range(1, 6):
        value = os.environ.get(f"JEV_API_KEY_{n}") or ""
        if value:
            keys.append(value)
    return keys


def available() -> bool:
    return bool(_configured_keys())


def boolean(instructions: str) -> dict:
    """A calibrated yes/no. The answer is a probability in 0..1 under key "noul"."""
    return {"type": "noul", "instructions": instructions}


def choice(instructions: str, criteria: dict) -> dict:
    """One of up to 255 labelled options. criteria maps label -> what it means."""
    return {"type": "choice", "instructions": instructions, "criteria": dict(criteria)}


def score(instructions: str, criteria) -> dict:
    """A position on an ordered scale. criteria is the levels, low to high."""
    return {"type": "score", "instructions": instructions, "criteria": list(criteria)}


def yes(answer: dict | None, threshold: float = 0.5) -> bool | None:
    """True/False from a noul answer, or None when the call produced nothing."""
    if not answer or answer.get("type") != "noul":
        return None
    return answer["noul"] >= threshold


def _next_key() -> str | None:
    global _rotate
    keys = _configured_keys()
    if not keys:
        return None
    key = keys[_rotate % len(keys)]
    _rotate += 1
    return key


def _report(reason: object) -> None:
    print(reason, file=sys.stderr)


def ask(state, questions, model: str = DEFAULT_MODEL, timeout: int = DEFAULT_TIMEOUT):
    key = _next_key()
    if key is None:
        return None
    url = os.environ.get("JEV_API_BASE") or DEFAULT_API_BASE
    payload = {"model": model, "state": state, "questions": questions}
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = json.loads(response.read().decode("utf-8"))
        return body["answers"]
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError,
            json.JSONDecodeError, OSError, KeyError, TypeError, ValueError) as exc:
        _report(exc)
        return None
