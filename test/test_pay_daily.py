import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pay_normalise import normalise

def test_daily_range():
    r = normalise("日薪1,600~3,000元")
    assert r["annual_twd"] == 575000 and r["basis"] == "daily" and r["stated"] is True

def test_daily_english():
    assert normalise("Daily rate TWD 2000")["annual_twd"] == 500000

def test_existing_behaviour_kept():
    assert normalise("時薪 200元")["basis"] == "hourly"
    assert normalise("10000-750000")["basis"] == "none"
