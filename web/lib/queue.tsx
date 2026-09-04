"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { downloadUrl } from "./fonts";

export interface DownloadProgress {
  current: number;
  total: number;
  currentSlug: string;
  percent: number;
}

export type ScriptKind = "bat" | "sh" | "ps1" | "cli" | "curl";

interface QueueContextValue {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  clear: () => void;
  selectAll: (allSlugs: string[]) => void;
  selectSlugs: (slugsToAdd: string[]) => void;
  deselectSlugs: (slugsToRemove: string[]) => void;
  invert: (allSlugs: string[]) => void;
  isDownloading: boolean;
  downloadProgress: DownloadProgress | null;
  downloadDelay: number;
  setDownloadDelay: (ms: number) => void;
  downloadAll: (targetSlugs?: string[]) => void;
  cancelDownload: () => void;
  scriptText: (kind: ScriptKind, customSlugs?: string[]) => string;
  downloadScript: (kind: "bat" | "sh" | "ps1", customSlugs?: string[]) => void;
  copyScriptText: (kind: ScriptKind, customSlugs?: string[]) => Promise<boolean>;
}

const QueueContext = createContext<QueueContextValue | null>(null);

function triggerDirectDownload(slug: string) {
  const a = document.createElement("a");
  a.href = downloadUrl(slug);
  a.download = `${slug}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadDelay, setDownloadDelay] = useState(500);

  const timeoutsRef = useRef<number[]>([]);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const clear = useCallback(() => setSlugs([]), []);
  const selectAll = useCallback((next: string[]) => setSlugs(next), []);

  const selectSlugs = useCallback((slugsToAdd: string[]) => {
    setSlugs((prev) => {
      const set = new Set([...prev, ...slugsToAdd]);
      return Array.from(set);
    });
  }, []);

  const deselectSlugs = useCallback((slugsToRemove: string[]) => {
    const toRemove = new Set(slugsToRemove);
    setSlugs((prev) => prev.filter((s) => !toRemove.has(s)));
  }, []);

  const invert = useCallback((allSlugs: string[]) => {
    setSlugs((prev) => {
      const prevSet = new Set(prev);
      return allSlugs.filter((s) => !prevSet.has(s));
    });
  }, []);

  const cancelDownload = useCallback(() => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
    setIsDownloading(false);
    setDownloadProgress(null);
  }, []);

  const downloadAll = useCallback(
    (targetSlugs?: string[]) => {
      const list = targetSlugs && targetSlugs.length > 0 ? targetSlugs : slugs;
      if (list.length === 0) return;

      cancelDownload();
      setIsDownloading(true);
      setDownloadProgress({
        current: 0,
        total: list.length,
        currentSlug: list[0],
        percent: 0,
      });

      const total = list.length;
      list.forEach((slug, idx) => {
        const timeoutId = window.setTimeout(() => {
          triggerDirectDownload(slug);
          const currentCount = idx + 1;
          setDownloadProgress({
            current: currentCount,
            total,
            currentSlug: slug,
            percent: Math.round((currentCount / total) * 100),
          });

          if (currentCount === total) {
            window.setTimeout(() => {
              setIsDownloading(false);
              setDownloadProgress(null);
            }, 1200);
          }
        }, idx * downloadDelay);

        timeoutsRef.current.push(timeoutId);
      });
    },
    [slugs, downloadDelay, cancelDownload]
  );

  const scriptText = useCallback(
    (kind: ScriptKind, customSlugs?: string[]): string => {
      const targetList =
        customSlugs && customSlugs.length > 0 ? customSlugs : slugs;
      const count = targetList.length;

      if (kind === "bat") {
        const lines = targetList.map(
          (s) => `curl -L -f -o "%FONT_DIR%\\${s}.zip" "${downloadUrl(s)}"`
        );
        return [
          "@echo off",
          "REM ========================================================",
          "REM Fontshare Bulk Downloader (Windows Batch Script)",
          `REM Downloading ${count} font families`,
          "REM ========================================================",
          "",
          'set "FONT_DIR=%~dp0downloads\\fonts"',
          'if not exist "%FONT_DIR%" mkdir "%FONT_DIR%"',
          "",
          `echo Downloading ${count} fonts from Fontshare to %FONT_DIR%...`,
          "echo.",
          "",
          ...lines,
          "",
          "echo.",
          "echo ========================================================",
          `echo All ${count} fonts successfully downloaded!`,
          "echo Saved in: %FONT_DIR%",
          "echo TIP: To install to Windows, run 'python cli/install.py --scope user'",
          "echo ========================================================",
          "pause",
          "",
        ].join("\r\n");
      }

      if (kind === "ps1") {
        const formattedArray = targetList.map((s) => `  "${s}"`).join(",\r\n");
        return [
          "# ========================================================",
          "# Fontshare Bulk Downloader (PowerShell Script)",
          `# Downloading ${count} font families`,
          "# ========================================================",
          "",
          '$destDir = Join-Path -Path $PSScriptRoot -ChildPath "downloads\\fonts"',
          "if (-not (Test-Path -Path $destDir)) {",
          "    New-Item -ItemType Directory -Force -Path $destDir | Out-Null",
          "}",
          "",
          "$fonts = @(",
          formattedArray,
          ")",
          "",
          'Write-Host "Downloading $($fonts.Count) font families to $destDir..." -ForegroundColor Cyan',
          "$i = 0",
          "$total = $fonts.Count",
          "foreach ($slug in $fonts) {",
          "    $i++",
          '    Write-Host "[$i/$total] Downloading $slug.zip..." -ForegroundColor Yellow',
          '    $outPath = Join-Path -Path $destDir -ChildPath "$slug.zip"',
          '    Invoke-WebRequest -Uri "https://api.fontshare.com/v2/fonts/download/$slug" -OutFile $outPath',
          "}",
          "",
          'Write-Host "`nAll $total fonts downloaded successfully!" -ForegroundColor Green',
          'Write-Host "Location: $destDir" -ForegroundColor Gray',
          "",
        ].join("\r\n");
      }

      if (kind === "sh") {
        const lines = targetList.map(
          (s) => `curl -L -f -o "$FONT_DIR/${s}.zip" "${downloadUrl(s)}"`
        );
        return [
          "#!/usr/bin/env bash",
          "# ========================================================",
          "# Fontshare Bulk Downloader (Bash Script)",
          `# Downloading ${count} font families`,
          "# ========================================================",
          "set -e",
          "",
          'DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"',
          'FONT_DIR="$DIR/downloads/fonts"',
          'mkdir -p "$FONT_DIR"',
          "",
          `echo "Downloading ${count} font families to $FONT_DIR..."`,
          "",
          ...lines,
          "",
          'echo "========================================================"',
          `echo "All ${count} fonts successfully downloaded!"`,
          'echo "Saved in: $FONT_DIR"',
          'echo "========================================================"',
          "",
        ].join("\n");
      }

      if (kind === "curl") {
        return targetList
          .map((s) => `curl -L -O "${downloadUrl(s)}"`)
          .join("\n");
      }

      return "python cli/download.py --install --install-scope user";
    },
    [slugs]
  );

  const downloadScript = useCallback(
    (kind: "bat" | "sh" | "ps1", customSlugs?: string[]) => {
      const content = scriptText(kind, customSlugs);
      const filename =
        kind === "bat"
          ? "fontshare-download.bat"
          : kind === "ps1"
          ? "fontshare-download.ps1"
          : "fontshare-download.sh";

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    [scriptText]
  );

  const copyScriptText = useCallback(
    async (kind: ScriptKind, customSlugs?: string[]): Promise<boolean> => {
      try {
        const text = scriptText(kind, customSlugs);
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    },
    [scriptText]
  );

  const value = useMemo(
    () => ({
      slugs,
      toggle,
      has,
      clear,
      selectAll,
      selectSlugs,
      deselectSlugs,
      invert,
      isDownloading,
      downloadProgress,
      downloadDelay,
      setDownloadDelay,
      downloadAll,
      cancelDownload,
      scriptText,
      downloadScript,
      copyScriptText,
    }),
    [
      slugs,
      toggle,
      has,
      clear,
      selectAll,
      selectSlugs,
      deselectSlugs,
      invert,
      isDownloading,
      downloadProgress,
      downloadDelay,
      setDownloadDelay,
      downloadAll,
      cancelDownload,
      scriptText,
      downloadScript,
      copyScriptText,
    ]
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueue(): QueueContextValue {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used inside QueueProvider");
  return ctx;
}
