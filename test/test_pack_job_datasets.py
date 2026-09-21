"""Public job packs must not carry recruiter phones or home paths."""
import importlib.util
import json
from pathlib import Path

PACK = Path(__file__).resolve().parents[1] / "scripts" / "pack-job-datasets.py"


def _load():
    spec = importlib.util.spec_from_file_location("pack_job_datasets", PACK)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_sanitize_redacts_email_phone_and_home_paths():
    pack = _load()
    text = pack.sanitize("call 0970688035 or official@111z.co /home/phyrexian/secret")
    assert "0970688035" not in text
    assert "official@111z.co" not in text
    assert "/home/phyrexian" not in text
    assert "[redacted-phone]" in text and "[redacted-email]" in text


def test_pack_live_splits_boards_without_pii(tmp_path):
    pack = _load()
    dump = tmp_path / "live.json"
    dump.write_text(json.dumps([
        {"company": "Appier", "title": "Data Analyst Intern",
         "url": "https://job-boards.greenhouse.io/appier/jobs/1",
         "location": "Taipei", "source": "greenhouse", "ats": "greenhouse",
         "id": "1", "pay": "not stated"},
        {"company": "AIFT", "title": "MLE",
         "url": "https://www.yourator.co/companies/aift/jobs/1",
         "location": "臺北市經歷不拘碩士", "source": "yourator", "ats": "sqlite",
         "id": "1", "pay": "NT$ 1,300,000"},
        {"company": "Shop", "title": "工讀 電洽0912345678",
         "url": "https://www.104.com.tw/job/x",
         "location": "台北 official@shop.test", "source": "104", "ats": "sqlite",
         "id": "x", "pay": "時薪200"},
    ]), encoding="utf-8")
    out = tmp_path / "jobs"
    rows = pack.pack_live(dump, out)
    assert {r["board"] for r in rows} == {"greenhouse", "yourator", "104"}
    assert (out / "boards" / "yourator.csv").read_text(encoding="utf-8").count("AIFT") == 1
    packed = (out / "live-jobs.json").read_text(encoding="utf-8")
    assert "0912345678" not in packed
    assert "official@shop.test" not in packed
    assert "經歷不拘" not in packed
