"""Acceptance tests for scripts/checkout-inventory.py (portfolio duplicate-checkout report)."""
import json
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "checkout-inventory.py"
ID = ["-c", "user.name=t", "-c", "user.email=t@t"]


def git(cwd, *args):
    return subprocess.run(["git", "-C", str(cwd), *args], capture_output=True, text=True, check=True).stdout.strip()


def commit(repo, name):
    (repo / name).write_text(name)
    git(repo, "add", "-A")
    git(repo, *ID, "commit", "-qm", name)


@pytest.fixture
def portfolio(tmp_path):
    root = tmp_path / "portfolio"
    root.mkdir()
    bare = tmp_path / "remote.git"
    subprocess.run(["git", "init", "-q", "--bare", str(bare)], check=True)
    main = root / "proj"
    main.mkdir()
    git(main, "init", "-q", "-b", "main")
    commit(main, "a.txt")
    git(main, "remote", "add", "origin", str(bare))
    git(main, "push", "-q", "-u", "origin", "main")
    # clean worktree, fully pushed
    git(main, "worktree", "add", "-q", "-b", "pushed", str(root / "proj-pushed"))
    git(root / "proj-pushed", "push", "-q", "-u", "origin", "pushed")
    # worktree with a commit on no remote
    git(main, "worktree", "add", "-q", "-b", "local-only", str(root / "proj-unpushed"))
    commit(root / "proj-unpushed", "b.txt")
    # worktree with uncommitted work (and junk that must not count)
    git(main, "worktree", "add", "-q", "-b", "dirty", str(root / "proj-dirty"))
    (root / "proj-dirty" / "wip.txt").write_text("wip")
    (root / "proj-dirty" / "__pycache__").mkdir()
    (root / "proj-dirty" / "__pycache__" / "x.pyc").write_text("junk")
    # worktree whose only change is junk
    git(main, "worktree", "add", "-q", "-b", "junk", str(root / "proj-junk"))
    git(root / "proj-junk", "push", "-q", "-u", "origin", "junk")
    (root / "proj-junk" / "__pycache__").mkdir()
    (root / "proj-junk" / "__pycache__" / "y.pyc").write_text("junk")
    (root / "notes").mkdir()
    return root


def inventory(root):
    p = subprocess.run([sys.executable, str(SCRIPT), str(root), "--json"], capture_output=True, text=True, timeout=120)
    assert p.returncode == 0, p.stderr
    return {row["name"]: row for row in json.loads(p.stdout)}


def test_classifies_every_checkout(portfolio):
    inv = inventory(portfolio)
    assert inv["proj"]["kind"] == "clone" and inv["proj"]["action"] == "keep"
    assert inv["proj-pushed"]["kind"] == "worktree"
    assert inv["proj-pushed"]["parent"].endswith("/proj")
    assert inv["proj-pushed"]["action"] == "remove-safe"
    assert inv["proj-unpushed"]["unpushed"] == 1 and inv["proj-unpushed"]["action"] == "push-then-remove"
    assert inv["proj-dirty"]["dirty"] == 1 and inv["proj-dirty"]["action"] == "review"
    assert inv["proj-junk"]["dirty"] == 0 and inv["proj-junk"]["action"] == "remove-safe"
    assert inv["notes"]["kind"] == "not-git" and inv["notes"]["action"] == "ignore"


def test_row_fields(portfolio):
    row = inventory(portfolio)["proj-unpushed"]
    for key in ("name", "path", "kind", "parent", "branch", "dirty", "unpushed", "last_commit", "action"):
        assert key in row
    assert row["branch"] == "local-only"
    assert len(row["last_commit"]) == 10  # YYYY-MM-DD


def test_markdown_default_is_a_table_and_changes_nothing(portfolio):
    before = git(portfolio / "proj", "worktree", "list")
    p = subprocess.run([sys.executable, str(SCRIPT), str(portfolio)], capture_output=True, text=True, timeout=120)
    assert p.returncode == 0, p.stderr
    assert "| name |" in p.stdout.lower().replace("|name|", "| name |") or "| Name |" in p.stdout
    assert "proj-unpushed" in p.stdout and "push-then-remove" in p.stdout
    assert git(portfolio / "proj", "worktree", "list") == before
    assert (portfolio / "proj-dirty" / "wip.txt").exists()
