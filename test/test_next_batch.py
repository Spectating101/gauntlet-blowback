import csv, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import next_batch as nb

FIELDS = ["rank","fit","reachable","annual_twd","pay_stated","pay_basis","plausible","company","title","location","url"]

def queue(tmp_path, rows):
    p = tmp_path / "q.csv"
    with p.open("w", newline="") as f:
        w = csv.DictWriter(f, FIELDS); w.writeheader(); w.writerows(rows)
    return p

def r(rank, url, reach="0.9", pay="", stated="False"):
    return {"rank": rank, "fit": "3", "reachable": reach, "annual_twd": pay, "pay_stated": stated,
            "pay_basis": "none", "plausible": "True", "company": "C", "title": f"T{rank}",
            "location": "Taipei", "url": url}

def test_sent_roles_are_skipped(tmp_path):
    rows = nb.load_queue(queue(tmp_path, [r(2, "b"), r(1, "a"), r(3, "c")]))
    assert [x["url"] for x in nb.next_batch(rows, {"a"}, n=2)] == ["b", "c"]

def test_mark_sent_is_idempotent(tmp_path):
    led = tmp_path / "led.jsonl"
    assert nb.mark_sent(led, "a", "2026-09-24") is True
    assert nb.mark_sent(led, "a", "2026-09-24") is False
    assert nb.load_sent(led) == {"a"}

def test_render_empty():
    assert nb.render([]) == "Nothing left to send."


def test_a_line_of_invalid_utf8_is_skipped_not_raised(tmp_path):
    """Found by the Copilot review seat on 2026-09-23. It was in both versions
    written for the comparison, and neither the acceptance tests nor 38 hidden
    cases covered it: reading the ledger as text raised on the bad bytes."""
    led = tmp_path / "led.jsonl"
    led.write_bytes(b'{"url": "a"}\n\xff\xfe damaged\n{"url": "b"}\n')
    assert nb.load_sent(led) == {"a", "b"}


def test_one_employer_is_capped_per_batch():
    """The queue's top holds a dozen Binance accelerator roles; ten a day must
    not all go to one recruiter."""
    rows = [dict(r(i, f"b{i}"), company="Binance") for i in range(1, 6)] + [dict(r(9, "x"), company="Other")]
    batch = nb.next_batch(rows, set(), n=4, per_company=2)
    assert [x["url"] for x in batch] == ["b1", "b2", "x"]


def test_capped_roles_come_back_in_a_later_batch():
    rows = [dict(r(i, f"b{i}"), company="Binance") for i in range(1, 4)]
    first = nb.next_batch(rows, set(), n=10, per_company=2)
    later = nb.next_batch(rows, {x["url"] for x in first}, n=10, per_company=2)
    assert [x["url"] for x in later] == ["b3"]


def test_no_cap_by_default_in_the_function():
    rows = [dict(r(i, f"b{i}"), company="Binance") for i in range(1, 4)]
    assert len(nb.next_batch(rows, set(), n=10)) == 3


# Found by copilot_review_commit reviewing these commits after they had
# passed every test written for them.

def test_a_non_string_url_in_the_ledger_is_skipped_not_raised(tmp_path):
    led = tmp_path / "led.jsonl"
    led.write_text('{"url": ["x"]}\n{"url": {"a": 1}}\n{"url": 7}\n{"url": "ok"}\n')
    assert nb.load_sent(led) == {"ok"}


def test_roles_with_no_employer_named_do_not_share_a_cap():
    rows = [dict(r(i, f"u{i}"), company="") for i in range(1, 5)]
    assert len(nb.next_batch(rows, set(), n=10, per_company=2)) == 4


def test_a_cap_of_zero_means_no_cap_as_on_the_command_line():
    rows = [dict(r(i, f"b{i}"), company="Binance") for i in range(1, 4)]
    assert len(nb.next_batch(rows, set(), n=10, per_company=0)) == 3
    assert len(nb.next_batch(rows, set(), n=10, per_company=-1)) == 3
