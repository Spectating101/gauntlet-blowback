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
- Process environment takes precedence as a complete set. If no process
  key exists, the same names and order are read from repo-root .env.local,
  or from JEV_ENV_FILE when that is set. Only those key names are read;
  file contents are not exported or logged.
- TYPESAFE_API_KEY is accepted when neither the primary nor numbered keys
  are set. Numbered keys outrank it.
- JEV_API_BASE, default https://api.typesafe.ai/v1/systemone
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_API_BASE = "https://api.typesafe.ai/v1/systemone"
DEFAULT_MODEL = "jev-latest"
DEFAULT_TIMEOUT = 20

_FILE_KEY_NAMES = frozenset(
    ("JEV_API_KEY", "TYPESAFE_API_KEY", *(f"JEV_API_KEY_{n}" for n in range(1, 6)))
)
_REPO_ROOT = Path(__file__).resolve().parent.parent

_rotate = 0


def _env_file_path() -> Path:
    override = os.environ.get("JEV_ENV_FILE") or ""
    if override:
        return Path(override)
    return _REPO_ROOT / ".env.local"


def _keys_from_file() -> dict[str, str]:
    try:
        text = _env_file_path().read_text(encoding="utf-8")
    except (OSError, UnicodeError):
        return {}
    found: dict[str, str] = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        name = name.strip()
        if name not in _FILE_KEY_NAMES:
            continue
        value = value.strip()
        if value:
            found[name] = value
    return found


def _select_keys(source) -> list[str]:
    """Pick a complete key set from one source, in existing precedence order."""
    primary = source.get("JEV_API_KEY") or ""
    if primary:
        return [primary]
    keys = []
    for n in range(1, 6):
        value = source.get(f"JEV_API_KEY_{n}") or ""
        if value:
            keys.append(value)
    if keys:
        # The numbered set outranks the vendor name: rotating five keys spreads
        # the rate limit, and TYPESAFE_API_KEY is normally an alias of one of
        # them, so preferring it would silently collapse the rotation.
        return keys
    fallback = source.get("TYPESAFE_API_KEY") or ""
    return [fallback] if fallback else []


def _configured_keys() -> list[str]:
    """Every key configured for this service, in rotation order.

    TYPESAFE_API_KEY is the vendor's own name for the same secret -- TypeSafe is
    the host, Jev the model -- and other checkouts here read only that one. Both
    names are accepted so a single exported key serves every repo.
    """
    from_env = _select_keys(os.environ)
    if from_env:
        return from_env
    return _select_keys(_keys_from_file())


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
