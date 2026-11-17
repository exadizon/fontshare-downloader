#!/usr/bin/env python3
"""Sync the Fontshare catalog to data/fonts.json + data/fonts.min.json.

Fetches the full live catalog from https://api.fontshare.com/v2/fonts and
stores rich per-family metadata. Run whenever font options need updating::

    python scripts/sync_catalog.py
"""

import json
import sys
import time
import urllib.request
from pathlib import Path

API_URL = "https://api.fontshare.com/v2/fonts"
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

# Fields kept in the slim UI bundle.
MIN_STYLE_KEYS = ("weight_number", "weight_name", "is_italic", "is_variable")


def fetch_catalog() -> dict:
    fonts = []
    offset = 0
    limit = 100
    while True:
        url = f"{API_URL}?offset={offset}&limit={limit}"
        req = urllib.request.Request(url, headers={"User-Agent": "fontshare-downloader/2.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.load(resp)
        page = data.get("fonts") or []
        if not page:
            break
        fonts.extend(page)
        if not data.get("has_more"):
            break
        offset += len(page)
    return {"fonts": fonts, "count_total": data.get("count_total", len(fonts))}


def slim_font(font: dict) -> dict:
    styles = []
    for s in font.get("styles") or []:
        w = s.get("weight") or {}
        styles.append(
            {
                "weight_number": w.get("number", 400),
                "weight_name": w.get("name") or w.get("label") or "Regular",
                "is_italic": bool(s.get("is_italic")),
                "is_variable": bool(s.get("is_variable")),
            }
        )
    designers = [
        d.get("name") for d in (font.get("designers") or []) if d.get("name")
    ]
    tags = [t.get("name") for t in (font.get("font_tags") or []) if t.get("name")]
    return {
        "slug": font.get("slug"),
        "name": font.get("name"),
        "category": font.get("category"),
        "designers": designers,
        "tags": tags,
        "styles": styles,
        "license": font.get("license_type"),
        "views": font.get("views") or 0,
        "views_recent": font.get("views_recent") or 0,
        "is_new": bool(font.get("is_new")),
        "is_hot": bool(font.get("is_hot")),
        "is_top": bool(font.get("is_top")),
    }


def main() -> int:
    print("Syncing Fontshare catalog...")
    started = time.time()
    try:
        catalog = fetch_catalog()
    except Exception as exc:
        print(f"Error: failed to fetch catalog: {exc}")
        return 1
    fonts = catalog["fonts"]
    fonts.sort(key=lambda f: (f.get("slug") or "").lower())
    stamped = {
        "synced_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count_total": catalog["count_total"],
        "fonts": fonts,
    }
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "fonts.json").write_text(json.dumps(stamped, indent=2), encoding="utf-8")
    slim = {
        "synced_at": stamped["synced_at"],
        "count_total": stamped["count_total"],
        "fonts": [slim_font(f) for f in fonts],
    }
    (DATA_DIR / "fonts.min.json").write_text(json.dumps(slim), encoding="utf-8")
    # Mirror the slim bundle into the web app so Vercel deploys (root: web/)
    # stay self-contained without reaching outside the web directory.
    web_lib = ROOT / "web" / "lib"
    if web_lib.exists():
        (web_lib / "fonts.min.json").write_text(
            json.dumps(slim), encoding="utf-8"
        )
        print(f"Mirrored slim bundle to {web_lib / 'fonts.min.json'}")
    print(f"Synced {len(fonts)} families in {time.time() - started:.1f}s")
    print(f"Wrote {DATA_DIR / 'fonts.json'} and {DATA_DIR / 'fonts.min.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
