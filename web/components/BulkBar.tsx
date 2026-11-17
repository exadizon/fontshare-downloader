"use client";

import { useState } from "react";
import { useQueue, type ScriptKind } from "../lib/queue";
import { FONTS } from "../lib/fonts";

export default function BulkBar() {
  const {
    slugs,
    clear,
    downloadAll,
    cancelDownload,
    isDownloading,
    downloadProgress,
    downloadDelay,
    setDownloadDelay,
    downloadScript,
    copyScriptText,
  } = useQueue();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedKind, setCopiedKind] = useState<ScriptKind | null>(null);

  if (slugs.length === 0 && !isDownloading) return null;

  // Calculate total styles selected
  const totalStyles = slugs.reduce((acc, slug) => {
    const font = FONTS.find((f) => f.slug === slug);
    return acc + (font?.styles.length ?? 0);
  }, 0);

  const handleCopy = async (kind: ScriptKind) => {
    const success = await copyScriptText(kind);
    if (success) {
      setCopiedKind(kind);
      setTimeout(() => setCopiedKind(null), 2000);
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--color-card)] border-t border-[var(--color-border)] shadow-bulkbar">
      {/* Active Download Progress Bar (transform, never width) */}
      {isDownloading && downloadProgress && (
        <div className="w-full bg-[var(--color-panel)] h-1.5 overflow-hidden">
          <div
            className="h-full w-full bg-[var(--color-text)] origin-left transition-transform duration-300"
            style={{ transform: `scaleX(${downloadProgress.percent / 100})` }}
          />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        {isDownloading && downloadProgress ? (
          /* Download in Progress View */
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-3 h-3 rounded-full bg-[var(--color-text)] animate-ping" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-[var(--color-text)]">
                    Downloading {downloadProgress.current} of {downloadProgress.total} fonts
                  </span>
                  <span className="badge-solid text-[10px]">{downloadProgress.percent}%</span>
                </div>
                <p className="text-xs text-[var(--color-muted)] truncate">
                  Triggered: <strong className="text-[var(--color-text)]">{downloadProgress.currentSlug}.zip</strong> · Please click &quot;Allow&quot; if your browser prompts for multiple files.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cancelDownload}
              className="btn-outline px-4 py-1.5 text-xs font-bold text-red-500 border-red-500/30 hover:border-red-500 cursor-pointer"
            >
              Cancel Remaining
            </button>
          </div>
        ) : (
          /* Normal Selected Queue Bar */
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Summary & Clear */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-[var(--color-text)] text-[var(--color-bg)] font-display font-black text-sm flex items-center justify-center shrink-0 border border-[var(--color-border)]">
                {slugs.length}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-text)] leading-tight">
                  {slugs.length} famil{slugs.length === 1 ? "y" : "ies"} selected
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {totalStyles} total styles ready for bulk download
                </p>
              </div>

              <div className="hidden md:block h-6 w-[1px] bg-[var(--color-border)] mx-2" />

              <button
                type="button"
                onClick={clear}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] underline underline-offset-4 hidden sm:inline-block cursor-pointer"
              >
                Clear selection
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 ml-auto">
              {/* Pace selector */}
              <div className="hidden lg:flex items-center gap-1 text-[11px] text-[var(--color-muted)] border border-[var(--color-border)] px-2 py-1 bg-[var(--color-panel)]">
                <span>Pace:</span>
                <select
                  value={downloadDelay}
                  onChange={(e) => setDownloadDelay(Number(e.target.value))}
                  className="bg-transparent text-[var(--color-text)] outline-none font-mono cursor-pointer"
                  title="Delay between download triggers to prevent browser throttling"
                >
                  <option value={300} className="bg-[var(--color-card)] text-[var(--color-text)]">Fast (300ms)</option>
                  <option value={500} className="bg-[var(--color-card)] text-[var(--color-text)]">Standard (500ms)</option>
                  <option value={1000} className="bg-[var(--color-card)] text-[var(--color-text)]">Polite (1000ms)</option>
                </select>
              </div>

              {/* Scripts Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportMenu((v) => !v)}
                  className="btn-outline px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  aria-expanded={showExportMenu}
                >
                  <span>Scripts / Terminal</span>
                  <span className="text-[10px]">&#9662;</span>
                </button>

                {showExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowExportMenu(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 bottom-full mb-2 w-72 bg-[var(--color-panel)] border border-[var(--color-border)] shadow-lg p-3 z-50 text-xs space-y-2">
                      <p className="font-bold text-[var(--color-text)] text-[10px] pb-1 border-b border-[var(--color-border)]">
                        One-Click Terminal Scripts
                      </p>

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            downloadScript("bat");
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center justify-between p-2 hover:bg-[var(--color-card-hover)] text-left cursor-pointer"
                        >
                          <div>
                            <strong className="text-[var(--color-text)] block">Windows Script (.bat)</strong>
                            <span className="text-[11px] text-[var(--color-muted)]">Runs curl loop in cmd.exe</span>
                          </div>
                          <span className="text-xs">↓</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            downloadScript("ps1");
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center justify-between p-2 hover:bg-[var(--color-card-hover)] text-left cursor-pointer"
                        >
                          <div>
                            <strong className="text-[var(--color-text)] block">PowerShell (.ps1)</strong>
                            <span className="text-[11px] text-[var(--color-muted)]">Windows PowerShell native</span>
                          </div>
                          <span className="text-xs">↓</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            downloadScript("sh");
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center justify-between p-2 hover:bg-[var(--color-card-hover)] text-left cursor-pointer"
                        >
                          <div>
                            <strong className="text-[var(--color-text)] block">macOS / Linux (.sh)</strong>
                            <span className="text-[11px] text-[var(--color-muted)]">Bash script with curl</span>
                          </div>
                          <span className="text-xs">↓</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-[var(--color-border)] space-y-1">
                        <button
                          type="button"
                          onClick={() => handleCopy("cli")}
                          className="w-full text-left p-1.5 hover:bg-[var(--color-card-hover)] text-[11px] flex items-center justify-between text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer"
                        >
                          <span>Copy Python CLI Command</span>
                          <span className="font-mono">{copiedKind === "cli" ? "\u2713 Copied" : "Copy"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy("curl")}
                          className="w-full text-left p-1.5 hover:bg-[var(--color-card-hover)] text-[11px] flex items-center justify-between text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer"
                        >
                          <span>Copy cURL Commands</span>
                          <span className="font-mono">{copiedKind === "curl" ? "\u2713 Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Main Download Button */}
              <button
                type="button"
                onClick={() => downloadAll()}
                className="btn-solid px-5 py-2.5 text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <svg
                  width="16"
                  height="16"
                  style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, display: "inline-block" }}
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download ({slugs.length}) ZIPs</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
