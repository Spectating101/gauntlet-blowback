import importlib.util, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
_s = importlib.util.spec_from_file_location("bq", ROOT / "scripts" / "build-application-queue.py")
q = importlib.util.module_from_spec(_s); _s.loader.exec_module(q)

import pytest


def test_company_key_none_empty_and_whitespace():
    assert q.company_key(None) == ""
    assert q.company_key("") == ""
    assert q.company_key(" \t\n ") == ""


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("Acme 股份有限公司", "acme"),
        ("Acme 有限公司", "acme"),
        ("Acme 公司", "acme"),
        ("Acme Co., Ltd.", "acme"),
        ("Acme Co.,Ltd.", "acme"),
        ("Acme Co. Ltd", "acme"),
        ("Acme Ltd.", "acme"),
        ("Acme Ltd", "acme"),
        ("Acme Inc.", "acme"),
        ("Acme Inc", "acme"),
        ("Acme Corp.", "acme"),
        ("Acme Corp", "acme"),
        ("Acme Limited", "acme"),
        ("Acme LLC", "acme"),
    ],
)
def test_company_key_removes_each_legal_suffix(name, expected):
    assert q.company_key(name) == expected


@pytest.mark.parametrize(
    "name",
    [
        "Acme股份有限公司",
        "Acme,股份有限公司",
        "Acme.有限公司",
        "Acme \t 股份有限公司",
    ],
)
def test_company_key_accepts_suffix_separator_variants(name):
    assert q.company_key(name) == "acme"


def test_company_key_extracts_latin_brand_before_cjk():
    assert q.company_key("GliaCloud 集雅科技") == "gliacloud"
    assert q.company_key("SHOPLINE 商線科技") == "shopline"


def test_company_key_preserves_allowed_latin_brand_characters():
    assert q.company_key("ACME Labs & Co.-2 集雅科技") == "acme labs & co.-2"


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("GliaCloud集雅科技", "gliacloud集雅科技"),
        ("GliaCloud 123", "gliacloud 123"),
        ("集雅科技 GliaCloud", "集雅科技 gliacloud"),
        ("123-ABC 集雅科技", "123-abc"),
    ],
)
def test_company_key_requires_space_and_cjk_after_latin_brand(name, expected):
    assert q.company_key(name) == expected


def _row(company, title, fit):
    return {"company": company, "title": title, "fit": fit}


def test_dedupe_merges_company_spellings_and_keeps_higher_fit():
    lower_fit = _row("GliaCloud", "Backend Engineer", 3)
    higher_fit = _row("GliaCloud 集雅科技", "Backend Engineer", 8)

    result = q.dedupe([lower_fit, higher_fit])

    assert result == [higher_fit]


def test_dedupe_merges_shopline_suffix_spellings():
    first = _row("SHOPLINE 商線科技", "Product Manager", 5)
    second = _row("SHOPLINE 商線科技股份有限公司", "Product Manager", 7)

    assert q.dedupe([first, second]) == [second]


def test_dedupe_retains_distinct_titles_and_normalizes_title_matching():
    first = _row("GliaCloud", "  Data Engineer ", 4)
    duplicate = _row("GliaCloud 集雅科技", "data engineer", 9)
    distinct = _row("GliaCloud", "Data Scientist", 6)

    assert q.dedupe([first, duplicate, distinct]) == [duplicate, distinct]


def test_dedupe_preserves_unique_order_when_replacing_duplicate():
    first = _row("Alpha", "Developer", 1)
    duplicate = _row("Alpha 公司", "developer", 10)
    second = _row("Beta", "Developer", 2)

    assert q.dedupe([first, duplicate, second]) == [duplicate, second]