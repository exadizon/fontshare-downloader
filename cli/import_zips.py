#!/usr/bin/env python3
"""Import Fontshare family ZIPs downloaded through a web browser.

Point it at a folder of ``*_Complete.zip`` files (your browser's downloads
folder by default). Every Fontshare archive is extracted into
``downloads/fonts/<slug>/`` using the same layout as the downloader, and with
``--install`` the desktop fonts are installed for the current user or system
wide. Uses only the standard library, so no dependencies are needed.
"""

import argparse
import json
import platform
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

from archive import archive_root, extract_family_zip, is_font_archive

REPO_ROOT = Path(__file__).resolve().parent.parent
CATALOG_CANDIDATES = (
    REPO_ROOT / "data" / "fonts.min.json",
    REPO_ROOT / "data" / "fonts.json",
)

# Browser downloads carry extra words around the family name.
DECORATIONS = ("_complete", "-complete", " complete", "_web", "-web", " web")
DUPLICATE_MARKER = re.compile(r"\s*\(\d+\)$")


def normalize(text: str) -> str:
    """Lowercase and drop everything that is not a letter or digit."""
    return re.sub(r"[^a-z0-9]", "", text.lower())


def clean_name(text: str) -> str:
    """Strip download decorations and browser duplicate markers."""
    name = DUPLICATE_MARKER.sub("", text.strip()).lower()
    changed = True
    while changed:
        changed = False
        for suffix in DECORATIONS:
            if name.endswith(suffix):
                name = name[: -len(suffix)].strip(" _-")
                changed = True
    return name


def default_download_dir() -> Path:
    """The platform's browser download folder."""
    home = Path.home()
    system = platform.system().lower()
    if system == "linux":
        xdg_config = Path.home() / ".config" / "user-dirs.dirs"
        try:
            for line in xdg_config.read_text(encoding="utf-8").splitlines():
                if line.startswith("XDG_DOWNLOAD_DIR="):
                    raw = line.split("=", 1)[1].strip().strip('"')
                    resolved = Path(raw.replace("$HOME", str(home)))
                    if resolved.is_dir():
                        return resolved
        except OSError:
            pass
    return home / "Downloads"


def load_slug_aliases() -> Dict[str, str]:
    """Map normalized family names and slugs to canonical catalog slugs."""
    for path in CATALOG_CANDIDATES:
        if not path.exists():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        fonts = data.get("fonts") if isinstance(data, dict) else data
        if not isinstance(fonts, list):
            continue
        aliases: Dict[str, str] = {}
        ambiguous = set()
        for font in fonts:
            if not isinstance(font, dict) or not font.get("slug"):
                continue
            slug = font["slug"]
            for alias in {normalize(slug), normalize(font.get("name") or "")}:
                if not alias:
                    continue
                if alias in aliases and aliases[alias] != slug:
                    ambiguous.add(alias)
                aliases[alias] = slug
        for alias in ambiguous:
            aliases.pop(alias, None)
        if aliases:
            return aliases
    return {}


def font_stems(zip_path: Path) -> List[str]:
    """Family-looking stems from the font files inside the archive."""
    import zipfile

    stems: List[str] = []
    try:
        with zipfile.ZipFile(zip_path) as zf:
            for name in zf.namelist():
                stem = Path(name).stem
                if stem:
                    # "Author-BoldItalic" -> "Author"
                    stems.append(stem.split("-")[0])
    except (OSError, zipfile.BadZipFile):
        pass
    return stems


def resolve_slug(zip_path: Path, aliases: Dict[str, str]) -> Tuple[Optional[str], str]:
    """Find the catalog slug for an archive, plus a one-word reason."""
    candidates: List[Tuple[str, str]] = []
    stem = clean_name(zip_path.stem)
    if stem:
        candidates.append((normalize(stem), "filename"))
    root = clean_name(archive_root(zip_path))
    if root:
        candidates.append((normalize(root), "archive folder"))
    for index, raw in enumerate(font_stems(zip_path)):
        cleaned = clean_name(raw)
        if cleaned:
            label = "font file" if index == 0 else ""
            candidates.append((normalize(cleaned), label))
    for candidate, reason in candidates:
        if candidate and candidate in aliases:
            return aliases[candidate], reason
    # Not in the catalog (new family or renamed): derive a usable slug.
    if stem:
        derived = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
        if derived:
            return derived, "derived from filename (not in catalog)"
    return None, ""


@dataclass
class ImportResult:
    zip_path: Path
    slug: Optional[str]
    status: str
    detail: str = ""         # "imported", "exists", "unknown", "not-fonts", "failed"
    files: int = 0


def family_has_fonts(font_dir: Path) -> bool:
    from archive import FONT_EXTENSIONS

    if not font_dir.is_dir():
        return False
    return any(
        path.is_file() and path.suffix.lower() in FONT_EXTENSIONS
        for path in font_dir.rglob("*")
    )


def find_archives(source: Path) -> List[Path]:
    return sorted(
        (p for p in source.iterdir() if p.is_file() and p.suffix.lower() == ".zip"),
        key=lambda p: p.name.lower(),
    )


def import_archive(
    zip_path: Path,
    fonts_dir: Path,
    aliases: Dict[str, str],
    force: bool = False,
    dry_run: bool = False,
) -> ImportResult:
    if not is_font_archive(zip_path):
        return ImportResult(zip_path, None, "not-fonts")
    slug, reason = resolve_slug(zip_path, aliases)
    if not slug:
        return ImportResult(zip_path, None, "unknown")
    font_dir = fonts_dir / slug
    if family_has_fonts(font_dir) and not force:
        return ImportResult(zip_path, slug, "exists", detail=reason)
    if dry_run:
        return ImportResult(zip_path, slug, "imported", detail=f"{reason} (dry run)")
    try:
        count = extract_family_zip(zip_path, font_dir)
    except Exception as exc:  # unreadable or malformed archive
        return ImportResult(zip_path, slug, "failed", detail=str(exc))
    return ImportResult(zip_path, slug, "imported", detail=reason, files=count)


def print_report(source: Path, results: Iterable[ImportResult]) -> Tuple[int, int]:
    results = list(results)
    imported = [r for r in results if r.status == "imported"]
    existing = [r for r in results if r.status == "exists"]
    unknown = [r for r in results if r.status == "unknown"]
    failed = [r for r in results if r.status == "failed"]
    ignored = [r for r in results if r.status == "not-fonts"]

    print()
    print("Fontshare ZIP Import")
    print("=" * 40)
    print(f"Source: {source}")
    print(f"Archives scanned: {len(results)}")
    print()

    for result in imported:
        note = f" ({result.detail})" if result.detail else ""
        print(f"  imported  {result.zip_path.name} -> {result.slug}/{note}")
    for result in existing:
        print(f"  skipped   {result.zip_path.name} -> {result.slug}/ (already imported)")
    for result in unknown:
        print(f"  unknown   {result.zip_path.name} (no matching catalog family)")
    for result in failed:
        print(f"  failed    {result.zip_path.name}: {result.detail}")
    if ignored:
        print(f"  ignored   {len(ignored)} ZIPs without font files")

    return len(imported), len(unknown) + len(failed)


def run_installer(fonts_dir: Path, scope: str, variants: str, verbose: bool) -> Dict[str, int]:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from install import FontInstaller

    return FontInstaller(
        fonts_dir=str(fonts_dir),
        scope=scope,
        variants=variants,
        verbose=verbose,
    ).install_all_fonts()


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except ValueError:
                pass

    parser = argparse.ArgumentParser(
        description="Import Fontshare ZIPs downloaded through a browser"
    )
    parser.add_argument(
        "--source",
        "-s",
        default=None,
        help="folder holding the ZIPs (default: your browser's download folder)",
    )
    parser.add_argument("--output-dir", "-o", default="./downloads")
    parser.add_argument("--install", action="store_true", help="install after import")
    parser.add_argument(
        "--install-scope",
        choices=("user", "system"),
        default="user",
        help="install for the current user (default) or system wide",
    )
    parser.add_argument(
        "--variants",
        choices=("all", "static", "variable"),
        default="all",
        help="which desktop styles to install (default: all)",
    )
    parser.add_argument("--force", action="store_true", help="re-extract existing families")
    parser.add_argument("--dry-run", action="store_true", help="report without writing")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    source = Path(args.source).expanduser() if args.source else default_download_dir()
    if not source.is_dir():
        print(f"Error: {source} is not a folder. Pass --source <download folder>.")
        return 1

    fonts_dir = Path(args.output_dir).expanduser() / "fonts"
    aliases = load_slug_aliases()
    if not aliases:
        print("Warning: catalog data missing; slugs will come from filenames.")

    results = [
        import_archive(zip_path, fonts_dir, aliases, args.force, args.dry_run)
        for zip_path in find_archives(source)
    ]
    imported, problems = print_report(source, results)

    print()
    print(f"Families imported: {imported} | Written to: {fonts_dir}")

    install_stats = None
    if args.install:
        if args.dry_run:
            print("Dry run: no fonts installed.")
        else:
            install_stats = run_installer(fonts_dir, args.install_scope, args.variants, args.verbose)
            print(
                f"Installed: {install_stats['installed']} | "
                f"Skipped: {install_stats['skipped']} | "
                f"Failed: {install_stats['failed']}"
            )

    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
