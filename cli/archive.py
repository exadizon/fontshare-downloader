#!/usr/bin/env python3
"""Family ZIP extraction shared by the downloader and the browser importer.

Standard library only, so browser users can import ZIPs without installing
the downloader's dependencies.
"""

import os
import shutil
import zipfile
from pathlib import Path, PurePosixPath

FONT_EXTENSIONS = {".otf", ".ttf", ".ttc", ".otc", ".woff", ".woff2", ".eot"}


def extract_family_zip(zip_path: Path, font_dir: Path) -> int:
    """Extract ``zip_path`` into ``font_dir`` and return the file count.

    Guards against zip-slip entries, strips the archive's single top-level
    folder and a leading ``Fonts/`` directory so the result matches the
    downloader layout: ``<family>/OTF``, ``<family>/TTF``, ``<family>/WEB``.
    Extraction goes through a staging directory, so ``font_dir`` is replaced
    atomically and never left half-written.
    """
    zip_path = Path(zip_path)
    font_dir = Path(font_dir)
    staging = font_dir.parent / f".{font_dir.name}.extracting"
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True, exist_ok=True)
    try:
        with zipfile.ZipFile(zip_path) as zf:
            members = []
            for info in zf.infolist():
                if info.is_dir():
                    continue
                parts = [
                    p for p in PurePosixPath(info.filename).parts if p not in ("", ".")
                ]
                if not parts or ".." in parts:
                    continue
                members.append((info, parts))
            if not members:
                raise ValueError("archive contained no files")
            root = members[0][1][0]
            strip_root = all(len(p) > 1 and p[0] == root for _, p in members)
            count = 0
            for info, parts in members:
                rel = parts[1:] if strip_root else parts
                if len(rel) > 1 and rel[0].lower() == "fonts":
                    rel = rel[1:]
                if not rel:
                    continue
                dest = staging.joinpath(*rel)
                dest.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(info) as src, open(dest, "wb") as dst:
                    shutil.copyfileobj(src, dst)
                count += 1
            if count == 0:
                raise ValueError("archive contained no extractable files")
        if font_dir.exists():
            shutil.rmtree(font_dir)
        os.replace(staging, font_dir)
        return count
    except Exception:
        shutil.rmtree(staging, ignore_errors=True)
        raise


def is_font_archive(zip_path: Path) -> bool:
    """True when the ZIP holds at least one desktop or web font file."""
    try:
        with zipfile.ZipFile(zip_path) as zf:
            for name in zf.namelist():
                if Path(name).suffix.lower() in FONT_EXTENSIONS:
                    return True
    except (OSError, zipfile.BadZipFile):
        return False
    return False


def archive_root(zip_path: Path) -> str:
    """The single top-level folder name inside the ZIP, if it has one."""
    try:
        with zipfile.ZipFile(zip_path) as zf:
            for name in zf.namelist():
                parts = [p for p in PurePosixPath(name).parts if p not in ("", ".")]
                if parts:
                    return parts[0]
    except (OSError, zipfile.BadZipFile):
        pass
    return ""
