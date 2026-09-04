#!/usr/bin/env python3
"""Fontshare font installer (canonical CLI).

Installs extracted desktop font files from the downloader output on
Windows, macOS, and Linux. Web-only assets are ignored.
"""

import argparse
import logging
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Dict, List

INSTALLABLE_EXTENSIONS = {".otf", ".ttf", ".ttc", ".otc"}


class FontInstaller:
    def __init__(
        self,
        fonts_dir: str = "./downloads/fonts",
        scope: str = "user",
        verbose: bool = False,
    ):
        self.fonts_dir = Path(fonts_dir)
        self.scope = scope
        self.verbose = verbose
        self.os_type = platform.system().lower()
        logging.basicConfig(
            level=logging.DEBUG if verbose else logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s",
            force=True,
        )
        self.logger = logging.getLogger(__name__)
        self.target_dir = self._get_target_directory()

    def _get_target_directory(self) -> Path:
        if self.os_type == "windows":
            if self.scope == "system":
                return Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"
            return Path.home() / "AppData" / "Local" / "Microsoft" / "Windows" / "Fonts"
        if self.os_type == "darwin":
            if self.scope == "system":
                return Path("/Library/Fonts")
            return Path.home() / "Library" / "Fonts"
        if self.scope == "system":
            return Path("/usr/local/share/fonts")
        xdg = os.environ.get("XDG_DATA_HOME")
        return Path(xdg) / "fonts" if xdg else Path.home() / ".local" / "share" / "fonts"

    def _windows_is_admin(self) -> bool:
        if self.os_type != "windows":
            return False
        try:
            import ctypes

            return bool(ctypes.windll.shell32.IsUserAnAdmin())
        except Exception:
            return False

    def _register_windows_font(self, font_path: Path) -> None:
        import ctypes
        import winreg

        kind = (
            "OpenType"
            if font_path.suffix.lower() in {".otf", ".otc"}
            else "TrueType"
        )
        root = (
            winreg.HKEY_LOCAL_MACHINE
            if self.scope == "system"
            else winreg.HKEY_CURRENT_USER
        )
        value = font_path.name if self.scope == "system" else str(font_path)
        with winreg.OpenKey(
            root, r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts", 0, winreg.KEY_SET_VALUE
        ) as key:
            winreg.SetValueEx(key, f"{font_path.stem} ({kind})", 0, winreg.REG_SZ, value)
        if ctypes.windll.gdi32.AddFontResourceExW(str(font_path), 0, 0) == 0:
            self.logger.debug("AddFontResourceExW returned 0 for %s", font_path.name)

    def _refresh_windows_fonts(self) -> None:
        try:
            import ctypes

            ctypes.windll.user32.SendMessageTimeoutW(0xFFFF, 0x001D, 0, 0, 0x0002, 1000, None)
        except Exception as exc:
            self.logger.debug("Font-change broadcast failed: %s", exc)

    def _refresh_linux_cache(self) -> None:
        fc_cache = shutil.which("fc-cache")
        if not fc_cache:
            self.logger.warning("fc-cache not found; restart apps to see new fonts.")
            return
        try:
            subprocess.run(
                [fc_cache, "-f", str(self.target_dir)],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
        except subprocess.CalledProcessError as exc:
            detail = exc.stderr.strip() or exc.stdout.strip() or str(exc)
            self.logger.warning("fc-cache failed: %s", detail)

    def find_font_files(self) -> List[Path]:
        if not self.fonts_dir.exists():
            return []
        files = []
        for path in self.fonts_dir.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in INSTALLABLE_EXTENSIONS:
                continue
            if any(part.lower() == "web" for part in path.parts):
                continue
            files.append(path)
        return sorted(files)

    def install_font(self, source: Path) -> str:
        dest = self.target_dir / source.name
        try:
            self.target_dir.mkdir(parents=True, exist_ok=True)
            if dest.exists() and dest.stat().st_size == source.stat().st_size:
                self.logger.info("Skipping %s (already installed)", source.name)
                return "skipped"
            shutil.copy2(source, dest)
            if self.os_type == "windows":
                self._register_windows_font(dest)
            self.logger.info("Installed %s", source.name)
            return "installed"
        except Exception as exc:
            self.logger.error("Failed to install %s: %s", source.name, exc)
            return "failed"

    def install_all_fonts(self) -> Dict[str, int]:
        if (
            self.os_type == "windows"
            and self.scope == "system"
            and not self._windows_is_admin()
        ):
            raise PermissionError("system installs on Windows need administrator rights")
        files = self.find_font_files()
        stats = {"processed": len(files), "installed": 0, "skipped": 0, "failed": 0}
        if not files:
            self.logger.warning("No font files found in %s", self.fonts_dir)
            return stats
        self.logger.info("Found %d installable files in %s", len(files), self.target_dir)
        for path in files:
            stats[self.install_font(path)] += 1
        if self.os_type == "windows":
            self._refresh_windows_fonts()
        elif self.os_type == "linux":
            self._refresh_linux_cache()
        return stats

    def run(self) -> int:
        print("Fontshare Font Installer")
        print("=" * 40)
        print(f"OS: {platform.system()} | Scope: {self.scope}")
        print(f"Source: {self.fonts_dir}")
        print(f"Target: {self.target_dir}")
        print()
        if (
            self.os_type == "windows"
            and self.scope == "system"
            and not self._windows_is_admin()
        ):
            print("System installs need an elevated shell. Use --scope user instead.")
            return 1
        try:
            stats = self.install_all_fonts()
        except PermissionError as exc:
            print(f"Error: {exc}")
            return 1
        except Exception as exc:
            print(f"Error: {exc}")
            self.logger.exception("Unexpected error")
            return 1
        print()
        print("Font Installation Complete")
        print(f"Processed: {stats['processed']} | Installed: {stats['installed']} | "
              f"Skipped: {stats['skipped']} | Failed: {stats['failed']}")
        return 0


def main() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except ValueError:
                pass
    parser = argparse.ArgumentParser(description="Install extracted Fontshare fonts")
    parser.add_argument("--fonts-dir", default="./downloads/fonts")
    parser.add_argument("--scope", choices=("user", "system"), default="user")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()
    raise SystemExit(FontInstaller(args.fonts_dir, args.scope, args.verbose).run())


if __name__ == "__main__":
    main()
