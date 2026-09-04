#!/usr/bin/env python3
"""Fontshare bulk downloader (canonical CLI).

Discovers font families from the live Fontshare API, downloads each family
ZIP, and extracts it immediately into ``downloads/fonts/<slug>/``.
"""

import asyncio
import json
import logging
import os
import shutil
import sys
import time
import zipfile
from pathlib import Path, PurePosixPath
from typing import Dict, List, Optional
from urllib.parse import quote

import aiohttp
import click
from tqdm.asyncio import tqdm

API_BASE = "https://api.fontshare.com/v2"
USER_AGENT = "fontshare-downloader/2.0"

# File types that count as "the family is already on disk".
READY_EXTENSIONS = {".otf", ".ttf", ".ttc", ".otc", ".woff", ".woff2"}

# Minimal fallback when both the live API and data/fonts.json are unavailable.
FALLBACK_SLUGS = [
    "satoshi",
    "cabinet-grotesk",
    "clash-display",
    "general-sans",
    "switzer",
    "clash-grotesk",
    "supreme",
    "author",
    "zodiak",
    "chillax",
]


class FontshareDownloader:
    def __init__(
        self,
        output_dir: str = "./downloads",
        rate_limit: float = 1.0,
        max_concurrent: int = 3,
        install_after_download: bool = False,
        install_scope: str = "user",
        verbose: bool = False,
    ):
        self.output_dir = Path(output_dir)
        self.rate_limit = rate_limit
        self.max_concurrent = max_concurrent
        self.install_after_download = install_after_download
        self.install_scope = install_scope
        self.verbose = verbose
        self.max_retries = 3

        self.fonts_dir = self.output_dir / "fonts"
        self.logs_dir = self.output_dir / "logs"
        self.metadata_dir = self.output_dir / "metadata"
        self.fonts_dir.mkdir(parents=True, exist_ok=True)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_dir.mkdir(parents=True, exist_ok=True)

        logging.basicConfig(
            level=logging.DEBUG if verbose else logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(self.logs_dir / "download.log", encoding="utf-8"),
                logging.StreamHandler(sys.stdout),
            ],
            force=True,
        )
        self.logger = logging.getLogger(__name__)

    # -- discovery ---------------------------------------------------------

    async def discover_fonts(
        self, session: aiohttp.ClientSession
    ) -> List[Dict[str, str]]:
        self.logger.info("Discovering fonts from Fontshare...")
        fonts = await self._fetch_live_catalog(session)
        if fonts:
            self.logger.info("Found %d font families via live API", len(fonts))
            return fonts
        self.logger.warning("Live API failed, trying local data/fonts.json...")
        fonts = self._load_local_catalog()
        if fonts:
            self.logger.info("Found %d font families via local catalog", len(fonts))
            return fonts
        self.logger.warning("Using minimal fallback list")
        return [{"slug": s, "name": s} for s in FALLBACK_SLUGS]

    async def _fetch_live_catalog(
        self, session: aiohttp.ClientSession
    ) -> Optional[List[Dict[str, str]]]:
        fonts: List[Dict[str, str]] = []
        seen = set()
        offset = 0
        page_size = 100
        while True:
            try:
                async with session.get(
                    f"{API_BASE}/fonts",
                    params={"offset": offset, "limit": page_size},
                ) as resp:
                    if resp.status != 200:
                        body = (await resp.text())[:200].replace("\n", " ")
                        self.logger.debug("Catalog HTTP %s: %s", resp.status, body)
                        return None
                    data = await resp.json()
            except Exception as exc:  # network failure -> fallback path
                self.logger.debug("Catalog request failed: %s", exc)
                return None
            page = data.get("fonts") or []
            if not page:
                break
            for font in page:
                slug = font.get("slug")
                if not slug or slug in seen:
                    continue
                seen.add(slug)
                fonts.append({"slug": slug, "name": font.get("name") or slug})
            if not data.get("has_more"):
                break
            offset += len(page)
        fonts.sort(key=lambda f: f["slug"].lower())
        return fonts or None

    def _load_local_catalog(self) -> Optional[List[Dict[str, str]]]:
        candidates = [
            Path(__file__).resolve().parent.parent / "data" / "fonts.min.json",
            Path(__file__).resolve().parent.parent / "data" / "fonts.json",
        ]
        for path in candidates:
            if not path.exists():
                continue
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                fonts = data.get("fonts") if isinstance(data, dict) else data
                if isinstance(fonts, list) and fonts:
                    out = []
                    for f in fonts:
                        if isinstance(f, str):
                            out.append({"slug": f, "name": f})
                        elif isinstance(f, dict) and f.get("slug"):
                            out.append(
                                {"slug": f["slug"], "name": f.get("name") or f["slug"]}
                            )
                    if out:
                        return out
            except (OSError, ValueError) as exc:
                self.logger.debug("Local catalog %s unreadable: %s", path, exc)
        return None

    # -- download ----------------------------------------------------------

    def _family_is_ready(self, font_dir: Path) -> bool:
        if not font_dir.exists():
            return False
        return any(
            p.is_file() and p.suffix.lower() in READY_EXTENSIONS
            for p in font_dir.rglob("*")
        )

    def _extract_archive(self, zip_path: Path, font_dir: Path) -> None:
        """Extract a family ZIP, guarding against zip-slip entries."""
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
                        p
                        for p in PurePosixPath(info.filename).parts
                        if p not in ("", ".")
                    ]
                    if not parts or ".." in parts:
                        continue
                    members.append((info, parts))
                if not members:
                    raise ValueError("archive contained no files")
                root = members[0][1][0]
                strip_root = all(
                    len(p) > 1 and p[0] == root for _, p in members
                )
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
        except Exception:
            shutil.rmtree(staging, ignore_errors=True)
            raise

    async def _retry_wait(self, slug: str, attempt: int) -> None:
        delay = min(2 ** (attempt - 1), 8)
        self.logger.warning("Retrying %s in %.0fs (attempt %d)", slug, delay, attempt)
        await asyncio.sleep(delay)

    async def download_font(
        self,
        session: aiohttp.ClientSession,
        font: Dict[str, str],
        semaphore: asyncio.Semaphore,
    ) -> bool:
        slug = font["slug"]
        url = f"{API_BASE}/fonts/download/{quote(slug, safe='-')}"
        font_dir = self.fonts_dir / slug
        font_dir.mkdir(parents=True, exist_ok=True)
        legacy_zip = font_dir / f"{slug}.zip"

        if self._family_is_ready(font_dir):
            self.logger.info("Skipping %s (already downloaded)", slug)
            return True

        # Migrate old layout where only <slug>.zip was kept.
        if legacy_zip.exists() and legacy_zip.stat().st_size > 0:
            try:
                self._extract_archive(legacy_zip, font_dir)
                legacy_zip.unlink(missing_ok=True)
                self.logger.info("Migrated %s from legacy ZIP layout", slug)
                return True
            except Exception as exc:
                self.logger.warning("Legacy ZIP for %s unusable: %s", slug, exc)

        temp_file = font_dir / f"{slug}.zip.part"
        async with semaphore:
            for attempt in range(1, self.max_retries + 1):
                try:
                    async with session.get(url) as resp:
                        if resp.status != 200:
                            body = (await resp.text())[:200].replace("\n", " ")
                            if resp.status >= 500 and attempt < self.max_retries:
                                await self._retry_wait(slug, attempt)
                                continue
                            self.logger.error(
                                "Failed %s: HTTP %s - %s", slug, resp.status, body
                            )
                            return False
                        with open(temp_file, "wb") as out:
                            async for chunk in resp.content.iter_chunked(64 * 1024):
                                out.write(chunk)
                        if temp_file.stat().st_size == 0:
                            raise ValueError("empty download")
                        size = temp_file.stat().st_size
                        self._extract_archive(temp_file, font_dir)
                        self.logger.info("Downloaded %s (%d bytes)", slug, size)
                        if self.rate_limit > 0:
                            await asyncio.sleep(self.rate_limit)
                        return True
                except (aiohttp.ClientError, asyncio.TimeoutError, ValueError) as exc:
                    if attempt < self.max_retries:
                        self.logger.warning(
                            "%s failed (attempt %d): %s", slug, attempt, exc
                        )
                        await self._retry_wait(slug, attempt)
                        continue
                    self.logger.error("Gave up on %s: %s", slug, exc)
                    return False
                finally:
                    try:
                        temp_file.unlink(missing_ok=True)
                    except OSError:
                        pass
        return False

    async def download_all_fonts(self, fonts: List[Dict[str, str]]) -> Dict[str, int]:
        self.logger.info("Starting download of %d fonts...", len(fonts))
        with open(self.metadata_dir / "font-list.json", "w", encoding="utf-8") as f:
            json.dump(
                {
                    "fonts": fonts,
                    "total_count": len(fonts),
                    "discovery_time": time.time(),
                    "catalog_endpoint": f"{API_BASE}/fonts",
                },
                f,
                indent=2,
            )
        semaphore = asyncio.Semaphore(self.max_concurrent)
        timeout = aiohttp.ClientTimeout(total=180, connect=30, sock_read=120)
        connector = aiohttp.TCPConnector(limit_per_host=self.max_concurrent)
        async with aiohttp.ClientSession(
            timeout=timeout,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json, */*"},
            connector=connector,
            raise_for_status=False,
        ) as session:
            tasks = [self.download_font(session, font, semaphore) for font in fonts]
            results = [await coro for coro in tqdm.as_completed(tasks, desc="Fonts")]
        stats = {
            "total": len(fonts),
            "success": sum(results),
            "failed": len(results) - sum(results),
        }
        self.logger.info(
            "Done. Success: %d, Failed: %d", stats["success"], stats["failed"]
        )
        return stats

    async def run(self) -> None:
        start = time.time()
        timeout = aiohttp.ClientTimeout(total=60, connect=20, sock_read=30)
        async with aiohttp.ClientSession(
            timeout=timeout,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json, */*"},
            raise_for_status=False,
        ) as session:
            fonts = await self.discover_fonts(session)
        if not fonts:
            self.logger.error("No fonts discovered. Check your connection.")
            return
        stats = await self.download_all_fonts(fonts)

        install_stats = None
        if self.install_after_download and stats["success"] > 0:
            from install import FontInstaller

            install_stats = FontInstaller(
                fonts_dir=str(self.fonts_dir),
                scope=self.install_scope,
                verbose=self.verbose,
            ).install_all_fonts()

        print()
        print("=" * 50)
        print("Fontshare Bulk Download Complete")
        print("=" * 50)
        print(f"Fonts saved to: {self.fonts_dir}")
        print(f"Success: {stats['success']} fonts")
        print(f"Failed: {stats['failed']} fonts")
        print(f"Total time: {time.time() - start:.1f} seconds")
        print(f"Logs: {self.logs_dir / 'download.log'}")
        if install_stats is not None:
            print(
                f"Installed: {install_stats['installed']}, "
                f"Skipped: {install_stats['skipped']}, "
                f"Failed: {install_stats['failed']}"
            )


@click.command()
@click.option("--output-dir", "-o", default="./downloads")
@click.option("--rate-limit", "-r", default=1.0, type=float)
@click.option("--max-concurrent", "-c", default=3, type=int)
@click.option("--install", is_flag=True, help="Install fonts after download")
@click.option(
    "--install-scope",
    type=click.Choice(["user", "system"], case_sensitive=False),
    default="user",
    show_default=True,
)
@click.option("--verbose", "-v", is_flag=True)
def main(output_dir, rate_limit, max_concurrent, install, install_scope, verbose):
    """Download all Fontshare font families."""
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except ValueError:
                pass
    print("Fontshare Bulk Font Downloader")
    print("=" * 40)
    downloader = FontshareDownloader(
        output_dir=output_dir,
        rate_limit=rate_limit,
        max_concurrent=max_concurrent,
        install_after_download=install,
        install_scope=install_scope,
        verbose=verbose,
    )
    try:
        asyncio.run(downloader.run())
    except KeyboardInterrupt:
        print("\nDownload interrupted by user")
    except Exception as exc:
        print(f"\nError: {exc}")
        logging.exception("Unexpected error")


if __name__ == "__main__":
    main()
