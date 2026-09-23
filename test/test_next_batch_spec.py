import csv, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import json
import subprocess

import pytest

from next_batch import load_queue, load_sent, mark_sent, next_batch, render


def write_queue(path, rows):
    fields = [
        "rank",
        "fit",
        "reachable",
        "annual_twd",
        "pay_stated",
        "pay_basis",
        "plausible",
        "company",
        "title",
        "location",
        "url",
    ]
    with path.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def row(rank, url, reachable="0.9", **overrides):
    values = {
        "rank": str(rank),
        "fit": "high",
        "reachable": reachable,
        "annual_twd": "1234567",
        "pay_stated": "True",
        "pay_basis": "annual",
        "plausible": "True",
        "company": "Company",
        "title": "Role",
        "location": "Taipei",
        "url": url,
    }
    values.update(overrides)
    return values


def test_load_queue_reads_dict_rows_and_sorts_by_integer_rank(tmp_path):
    queue_path = tmp_path / "queue.csv"
    write_queue(queue_path, [row(10, "u10"), row(2, "u2"), row(1, "u1")])

    loaded = load_queue(queue_path)

    assert [item["rank"] for item in loaded] == ["1", "2", "10"]
    assert loaded[0]["company"] == "Company"


def test_load_sent_skips_missing_blank_and_invalid_lines(tmp_path):
    ledger = tmp_path / "sent.jsonl"
    ledger.write_text(
        "\n"
        '{"url": "https://one.example"}\n'
        "not json\n"
        '{"at": "2026-09-23"}\n'
        '{"url": "https://two.example", "at": "2026-09-23"}\n'
        "\n"
    )

    assert load_sent(ledger) == {
        "https://one.example",
        "https://two.example",
    }


def test_load_sent_missing_file_returns_empty_set(tmp_path):
    assert load_sent(tmp_path / "missing.jsonl") == set()


def test_mark_sent_creates_parent_appends_json_and_is_idempotent(tmp_path):
    ledger = tmp_path / "nested" / "sent.jsonl"

    assert mark_sent(ledger, "https://example.com/job", "2026-09-23") is True
    assert mark_sent(ledger, "https://example.com/job", "2026-09-24") is False

    assert ledger.read_text().splitlines() == [
        '{"url": "https://example.com/job", "at": "2026-09-23"}'
    ]
    assert load_sent(ledger) == {"https://example.com/job"}


def test_next_batch_preserves_order_filters_sent_empty_and_unreachable():
    rows = [
        row(1, "https://sent.example", reachable="0.9"),
        row(2, "", reachable="0.9"),
        row(3, "https://low.example", reachable="0.499"),
        row(4, "https://boundary.example", reachable="0.5"),
        row(5, "https://good.example", reachable="1"),
    ]

    batch = next_batch(rows, {"https://sent.example"}, n=10)

    assert [item["url"] for item in batch] == [
        "https://boundary.example",
        "https://good.example",
    ]


def test_next_batch_treats_empty_and_non_numeric_reachable_as_unreachable():
    rows = [
        row(1, "https://empty.example", reachable=""),
        row(2, "https://text.example", reachable="unknown"),
        row(3, "https://good.example", reachable="0.8"),
    ]

    assert [item["url"] for item in next_batch(rows, set())] == [
        "https://good.example"
    ]


def test_next_batch_include_unreachable_allows_empty_and_non_numeric_values():
    rows = [
        row(1, "https://empty.example", reachable=""),
        row(2, "https://text.example", reachable="unknown"),
        row(3, "https://low.example", reachable="0.1"),
    ]

    assert [item["url"] for item in next_batch(rows, set(), include_unreachable=True)] == [
        "https://empty.example",
        "https://text.example",
        "https://low.example",
    ]


@pytest.mark.parametrize("n", [0, -1, -10])
def test_next_batch_non_positive_n_returns_empty(n):
    assert next_batch([row(1, "https://example.com")], set(), n=n) == []


def test_next_batch_limits_results_to_n_in_queue_order():
    rows = [row(3, "https://three.example"), row(1, "https://one.example"), row(2, "https://two.example")]

    batch = next_batch(rows, set(), n=2)

    assert [item["url"] for item in batch] == [
        "https://three.example",
        "https://one.example",
    ]


def test_render_formats_pay_and_fields():
    batch = [
        row(
            7,
            "https://paid.example",
            company="Acme",
            title="Researcher",
            annual_twd="1234567",
            pay_stated="True",
            plausible="True",
        ),
        row(
            8,
            "https://unpaid.example",
            company="Beta",
            title="Engineer",
            annual_twd="7654321",
            pay_stated="False",
            plausible="True",
        ),
        row(
            9,
            "https://implausible.example",
            company="Gamma",
            title="Scientist",
            annual_twd="9999999",
            pay_stated="True",
            plausible="False",
        ),
    ]

    assert render(batch) == (
        "- [ ] #7 Acme — Researcher (1,234,567) https://paid.example\n"
        "- [ ] #8 Beta — Engineer (pay not stated) https://unpaid.example\n"
        "- [ ] #9 Gamma — Scientist (pay not stated) https://implausible.example"
    )


def test_render_empty_batch():
    assert render([]) == "Nothing left to send."


def test_cli_marks_sent_and_reports_duplicate(tmp_path):
    script = ROOT / "scripts" / "next_batch.py"
    ledger = tmp_path / "data" / "applied.local.jsonl"

    first = subprocess.run(
        [
            sys.executable,
            str(script),
            "--ledger",
            str(ledger),
            "--mark-sent",
            "https://example.com/job",
            "--today",
            "2026-09-23",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    second = subprocess.run(
        [
            sys.executable,
            str(script),
            "--ledger",
            str(ledger),
            "--mark-sent",
            "https://example.com/job",
            "--today",
            "2026-09-24",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )

    assert first.stdout.strip() == "recorded"
    assert second.stdout.strip() == "already recorded"


def test_cli_prints_rendered_next_batch(tmp_path):
    script = ROOT / "scripts" / "next_batch.py"
    queue = tmp_path / "queue.csv"
    ledger = tmp_path / "sent.jsonl"
    write_queue(
        queue,
        [
            row(2, "https://two.example", company="Two", title="Second"),
            row(1, "https://one.example", company="One", title="First"),
        ],
    )
    ledger.write_text('{"url": "https://one.example", "at": "2026-09-22"}\n')

    result = subprocess.run(
        [
            sys.executable,
            str(script),
            "--queue",
            str(queue),
            "--ledger",
            str(ledger),
            "--n",
            "1",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )

    assert result.stdout.strip() == (
        "- [ ] #2 Two — Second (1,234,567) https://two.example"
    )