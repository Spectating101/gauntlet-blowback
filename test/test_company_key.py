import importlib.util, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
_s = importlib.util.spec_from_file_location("bq", ROOT / "scripts" / "build-application-queue.py")
q = importlib.util.module_from_spec(_s); _s.loader.exec_module(q)

def test_latin_brand_with_cjk_name_collapses():
    assert q.company_key("GliaCloud 集雅科技") == q.company_key("GliaCloud") == "gliacloud"

def test_legal_suffix_is_removed():
    assert q.company_key("SHOPLINE 商線科技股份有限公司") == q.company_key("SHOPLINE 商線科技")

def test_dedupe_uses_the_company_key():
    rows = [{"company": "GliaCloud", "title": "BD Associate", "fit": 2.0},
            {"company": "GliaCloud 集雅科技", "title": "BD Associate", "fit": 3.0}]
    out = q.dedupe(rows)
    assert len(out) == 1 and out[0]["fit"] == 3.0
