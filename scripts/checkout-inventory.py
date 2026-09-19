#!/usr/bin/env python3
"""Read-only inventory of immediate checkouts under a portfolio root."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path


JUNK_DIR_NAMES = frozenset(
    {
        "__pycache__",
        ".pytest_cache",
        "node_modules",
        ".venv",
        ".mypy_cache",
        ".ruff_cache",
    }
)
ACTION_ORDER = ("ignore", "keep", "review", "push-then-remove", "remove-safe")


class GitError(Exception):
    pass


def run_git(cwd: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(cwd), *args],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip() or f"git {' '.join(args)} failed"
        raise GitError(detail)
    return result.stdout.strip()


def classify_kind(path: Path) -> str:
    git_path = path / ".git"
    if git_path.is_dir():
        return "clone"
    if git_path.is_file():
        return "worktree"
    return "not-git"


def porcelain_path(line: str) -> str:
    if len(line) < 4:
        return line.strip()
    path = line[3:]
    if " -> " in path:
        path = path.split(" -> ", 1)[1]
    if len(path) >= 2 and path[0] == '"' and path[-1] == '"':
        path = path[1:-1]
    return path


def is_build_junk(relpath: str) -> bool:
    cleaned = relpath.strip().replace("\\", "/").rstrip("/")
    if not cleaned:
        return False
    parts = Path(cleaned).parts
    for part in parts:
        if part in JUNK_DIR_NAMES or part.endswith(".egg-info"):
            return True
    name = Path(cleaned).name
    return name.endswith(".pyc") or name == ".DS_Store"


def count_dirty(cwd: Path) -> int:
    output = run_git(cwd, "status", "--porcelain")
    if not output:
        return 0
    dirty = 0
    for line in output.splitlines():
        if not line.strip():
            continue
        if not is_build_junk(porcelain_path(line)):
            dirty += 1
    return dirty


def current_branch(cwd: Path) -> str:
    branch = run_git(cwd, "rev-parse", "--abbrev-ref", "HEAD")
    if branch in ("", "HEAD"):
        return "(detached)"
    return branch


def worktree_parent(cwd: Path) -> str | None:
    common = run_git(cwd, "rev-parse", "--git-common-dir")
    common_path = Path(common)
    if not common_path.is_absolute():
        common_path = (cwd / common_path).resolve()
    else:
        common_path = common_path.resolve()
    if common_path.name == ".git":
        return str(common_path.parent)
    return str(common_path)


def last_commit_date(cwd: Path) -> str:
    return run_git(cwd, "log", "-1", "--format=%cd", "--date=short")


def unpushed_count(cwd: Path) -> int:
    return int(run_git(cwd, "rev-list", "--count", "HEAD", "--not", "--remotes"))


def directory_size(path: Path) -> str:
    result = subprocess.run(
        ["du", "-sh", str(path)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip() or "du -sh failed"
        raise GitError(detail)
    line = result.stdout.strip()
    if "\t" in line:
        return line.split("\t", 1)[0]
    return line.split()[0]


def decide_action(kind: str, dirty: int, unpushed: int, error: str | None) -> str:
    if error:
        return "review"
    if kind == "not-git":
        return "ignore"
    if kind == "clone":
        return "keep"
    if dirty > 0:
        return "review"
    if unpushed > 0:
        return "push-then-remove"
    return "remove-safe"


def inventory_one(path: Path, *, include_size: bool) -> dict:
    row: dict = {
        "name": path.name,
        "path": str(path),
        "kind": classify_kind(path),
        "parent": None,
        "branch": None,
        "dirty": 0,
        "unpushed": 0,
        "last_commit": None,
        "action": "ignore",
    }
    if include_size:
        try:
            row["size"] = directory_size(path)
        except GitError as exc:
            row["error"] = str(exc)
            row["action"] = "review"
            return row

    if row["kind"] == "not-git":
        row["action"] = decide_action(row["kind"], 0, 0, None)
        return row

    errors: list[str] = []

    def try_call(fn, *args):
        try:
            return fn(*args)
        except GitError as exc:
            errors.append(str(exc))
            return None

    if row["kind"] == "worktree":
        row["parent"] = try_call(worktree_parent, path)

    branch = try_call(current_branch, path)
    if branch is not None:
        row["branch"] = branch

    dirty = try_call(count_dirty, path)
    if dirty is not None:
        row["dirty"] = dirty

    unpushed = try_call(unpushed_count, path)
    if unpushed is not None:
        row["unpushed"] = unpushed

    last_commit = try_call(last_commit_date, path)
    if last_commit is not None:
        row["last_commit"] = last_commit

    error = "; ".join(errors) if errors else None
    if error:
        row["error"] = error
    row["action"] = decide_action(row["kind"], row["dirty"], row["unpushed"], error)
    return row


def scan(root: Path, *, include_size: bool) -> list[dict]:
    children = sorted((p for p in root.iterdir() if p.is_dir()), key=lambda p: p.name)
    return [inventory_one(child, include_size=include_size) for child in children]


def md_cell(value) -> str:
    if value is None:
        return ""
    return str(value).replace("|", "\\|")


def render_markdown(rows: list[dict], *, include_size: bool) -> str:
    headers = ["name", "path", "kind", "parent", "branch", "dirty", "unpushed", "last_commit"]
    if include_size:
        headers.append("size")
    headers.append("action")
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(md_cell(row.get(h)) for h in headers) + " |")
    counts = Counter(row["action"] for row in rows)
    count_line = "  ".join(f"{name}: {counts.get(name, 0)}" for name in ACTION_ORDER)
    lines.append("")
    lines.append(count_line)
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Read-only inventory of checkouts under ROOT.")
    parser.add_argument("root", type=Path, help="Directory whose immediate children are scanned")
    parser.add_argument("--json", action="store_true", help="Print rows as a JSON list")
    parser.add_argument("--sizes", action="store_true", help="Include du -sh sizes")
    args = parser.parse_args(argv)

    root = args.root
    if not root.is_dir():
        print(f"not a directory: {root}", file=sys.stderr)
        return 2

    rows = scan(root, include_size=args.sizes)
    if args.json:
        print(json.dumps(rows))
    else:
        sys.stdout.write(render_markdown(rows, include_size=args.sizes))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
