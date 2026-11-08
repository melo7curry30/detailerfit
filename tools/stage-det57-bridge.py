#!/usr/bin/env python3
"""Stage (do not send) the guarded DET-57 Gmail bridge release ZIP.

This artifact is a release CANDIDATE, not permission to deploy. The existing
bridge validates the full main SHA again before applying a Sent command.
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
import zipfile
from pathlib import Path

BASE = "6ec4c63a49f2763036eff223ecc2b061f6decb0b"
COMMAND_ID = "df-det57-finder-home-20261108-v2"
FILES = [
    ".assetsignore",
    "assets/brand/detailerfit-hero-car.webp",
    "home.css",
    "index.html",
    "quoteiq-vs-housecall-pro.html",
    "tools/check-det57.py",
    "tools/check-home.py",
    "tools/check-release.py",
    "tools/check-sitewide.py",
    "tools/release_baseline.py",
    "wrangler.jsonc",
]

def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], text=True).strip()

def main() -> None:
    actual = git("rev-parse", "origin/main")
    assert actual == BASE, f"Main moved from {BASE} to {actual}; do not stage stale release"
    assert len(FILES) == len(set(FILES))
    assert len(FILES) <= 250
    assert all(not p.startswith((".git/", ".github/", ".env")) for p in FILES)
    assert ".detailerfit-bridge-state.json" not in FILES
    assert "quoteiq-vs-housecall-pro.html" in FILES
    payloads = {}
    for p in FILES:
        f = Path(p)
        assert f.is_file() and not f.is_symlink(), p
        payloads[p] = f.read_bytes()
    assert b"housecallpro.partnerlinks.io" not in payloads["quoteiq-vs-housecall-pro.html"]
    assert b"Both primary buttons are affiliate links" not in payloads["quoteiq-vs-housecall-pro.html"]
    assert b".detailerfit-bridge-state.json" in payloads[".assetsignore"]
    assert b'"directory": "./"' in payloads["wrangler.jsonc"]

    manifest = {
        "schema": 1,
        "command_id": COMMAND_ID,
        "base_commit": BASE,
        "replace": FILES,
        "delete": [],
        "commit_message": "Publish validated Finder-first homepage and HCP disclosure correction (DET-57)",
    }
    out = Path("qa-artifacts/bridge-candidate")
    out.mkdir(parents=True, exist_ok=True)
    zip_path = out / "detailerfit-deploy.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("detailerfit-command.json", json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
        for p in FILES:
            z.writestr("payload/" + p, payloads[p])
    with zipfile.ZipFile(zip_path) as z:
        assert z.testzip() is None, "ZIP CRC error"
        names = set(z.namelist())
        assert names == {"detailerfit-command.json", *{"payload/" + p for p in FILES}}
        check = json.loads(z.read("detailerfit-command.json"))
        assert check == manifest
        assert sum(i.file_size for i in z.infolist()) <= 20 * 1024 * 1024
        for p in FILES:
            assert z.read("payload/" + p) == payloads[p]
    sha256 = hashlib.sha256(zip_path.read_bytes()).hexdigest()
    (out / "SHA256SUMS.txt").write_text(sha256 + "  detailerfit-deploy.zip\n")
    (out / "RELEASE-HOLD.txt").write_text(
        "NOT SENT OR DEPLOYED. Final DET-54 acceptance, actual iPhone Safari, analytics receipt "
        "and a fresh main/Sent/bridge check remain mandatory. Do not send if base main changes.\n"
    )
    print("STAGED ONLY, NOT SENT", COMMAND_ID, "BASE", BASE)
    print("Files:", len(FILES), "ZIP bytes:", zip_path.stat().st_size, "SHA256:", sha256)
    for p in FILES:
        print("REPLACE", p, "bytes", len(payloads[p]))

if __name__ == "__main__":
    main()
