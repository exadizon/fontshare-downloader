"use client";

import { useState } from "react";

interface CliHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "quickstart" | "filters" | "install" | "scripts";

export default function CliHelperModal({ isOpen, onClose }: CliHelperModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("quickstart");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-3xl bg-[var(--color-card)] border border-[var(--color-border)] p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[var(--color-border)] shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-solid text-[10px]">TERMINAL &amp; CLI GUIDE</span>
              <span className="text-xs font-mono text-[var(--color-muted)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-sm">
                Zero Dependencies (Python 3.10+)
              </span>
            </div>
            <h2 className="font-display font-black text-2xl tracking-tight text-[var(--color-text)]">
              CLI Downloader &amp; OS Auto-Installer
            </h2>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Use the built-in Python CLI tools to automate bulk downloads, filter by style, and install fonts directly into your operating system.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-border)]"
          >
            <svg
              width="20"
              height="20"
              style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, display: "inline-block" }}
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--color-border)] text-xs font-mono shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("quickstart")}
            className={`px-4 py-3 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "quickstart"
                ? "border-[var(--color-text)] text-[var(--color-text)] bg-[var(--color-panel)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <span>1. Quick Start</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("filters")}
            className={`px-4 py-3 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "filters"
                ? "border-[var(--color-text)] text-[var(--color-text)] bg-[var(--color-panel)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <span>2. Selective Filters</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("install")}
            className={`px-4 py-3 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "install"
                ? "border-[var(--color-text)] text-[var(--color-text)] bg-[var(--color-panel)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <span>3. OS Auto-Installer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("scripts")}
            className={`px-4 py-3 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "scripts"
                ? "border-[var(--color-text)] text-[var(--color-text)] bg-[var(--color-panel)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <span>4. Shell Scripts</span>
          </button>
        </div>

        {/* Tab Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs leading-relaxed">
          {/* TAB 1: QUICK START */}
          {activeTab === "quickstart" && (
            <div className="space-y-4">
              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text)] uppercase tracking-wider text-[11px]">
                    1-Command: Download, Extract &amp; Auto-Install All 100 Families
                  </span>
                  <button
                    type="button"
                    onClick={() => copy("quick-all", "python cli/download.py --install --install-scope user")}
                    className="btn-outline px-2.5 py-1 text-[11px] font-mono cursor-pointer"
                  >
                    {copiedKey === "quick-all" ? "\u2713 Copied" : "Copy Command"}
                  </button>
                </div>
                <p className="text-[var(--color-muted)]">
                  Runs the full automated pipeline: fetches the 100-family catalog, downloads all ZIP archives concurrently with polite rate pacing, unzips them into <code className="text-[var(--color-text)]">downloads/fonts/</code>, and registers every OTF/TTF directly into your operating system.
                </p>
                <div className="bg-[var(--color-bg)] p-3 border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] overflow-x-auto select-all">
                  python cli/download.py --install --install-scope user
                </div>
              </div>

              {/* Just Download & Extract (No OS install) */}
              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text)] uppercase tracking-wider text-[11px]">
                    Download &amp; Extract Only (Keep files in folder)
                  </span>
                  <button
                    type="button"
                    onClick={() => copy("quick-download", "python cli/download.py")}
                    className="btn-outline px-2.5 py-1 text-[11px] font-mono cursor-pointer"
                  >
                    {copiedKey === "quick-download" ? "\u2713 Copied" : "Copy Command"}
                  </button>
                </div>
                <p className="text-[var(--color-muted)]">
                  Downloads all 100 ZIPs to <code className="text-[var(--color-text)]">downloads/zips/</code> and extracts clean OTF/TTF files into <code className="text-[var(--color-text)]">downloads/fonts/&lt;family-name&gt;/</code> without modifying your OS font registry.
                </p>
                <div className="bg-[var(--color-bg)] p-3 border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] overflow-x-auto select-all">
                  python cli/download.py
                </div>
              </div>

              {/* Output folder structure */}
              <div className="border border-[var(--color-border)] p-4 bg-[var(--color-panel)]">
                <p className="font-bold text-[var(--color-text)] uppercase tracking-wider text-[11px] mb-2">
                  Generated Folder Structure
                </p>
                <pre className="font-mono text-[11px] text-[var(--color-muted)] leading-5">
{`fontshare-downloader/
  ├── downloads/
  │   ├── zips/                # Original untouched .zip archives
  │   └── fonts/               # Clean extracted fonts ready for design
  │       ├── Satoshi/         # .otf, .ttf, variable font files
  │       ├── General-Sans/
  │       └── ... (all 100 families)`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: SELECTIVE FILTERS */}
          {activeTab === "filters" && (
            <div className="space-y-4">
              <p className="text-[var(--color-muted)]">
                You do not need to download the full 1.2 GB library. The CLI provides precision flags to target only what you need:
              </p>

              {/* Category Filter */}
              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text)]">Filter by Category</span>
                  <button
                    type="button"
                    onClick={() => copy("filter-category", "python cli/download.py --category sans")}
                    className="btn-outline px-2.5 py-1 text-[11px] font-mono cursor-pointer"
                  >
                    {copiedKey === "filter-category" ? "\u2713 Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[var(--color-muted)]">
                  Valid categories: <code className="text-[var(--color-text)]">sans</code>, <code className="text-[var(--color-text)]">serif</code>, <code className="text-[var(--color-text)]">display</code>, <code className="text-[var(--color-text)]">slab</code>, <code className="text-[var(--color-text)]">script</code>, <code className="text-[var(--color-text)]">monospaced</code>, <code className="text-[var(--color-text)]">blackletter</code>.
                </p>
                <div className="bg-[var(--color-bg)] p-2.5 border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] select-all">
                  python cli/download.py --category sans
                </div>
              </div>

              {/* Variable Fonts Only */}
              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text)]">Variable Fonts Only (82 families)</span>
                  <button
                    type="button"
                    onClick={() => copy("filter-var", "python cli/download.py --variable-only")}
                    className="btn-outline px-2.5 py-1 text-[11px] font-mono cursor-pointer"
                  >
                    {copiedKey === "filter-var" ? "\u2713 Copied" : "Copy"}
                  </button>
                </div>
                <div className="bg-[var(--color-bg)] p-2.5 border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] select-all">
                  python cli/download.py --variable-only
                </div>
              </div>

              {/* Top / Trending Only */}
              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text)]">Top &amp; Trending Fonts Only</span>
                  <button
                    type="button"
                    onClick={() => copy("filter-top", "python cli/download.py --top-only")}
                    className="btn-outline px-2.5 py-1 text-[11px] font-mono cursor-pointer"
                  >
                    {copiedKey === "filter-top" ? "\u2713 Copied" : "Copy"}
                  </button>
                </div>
                <div className="bg-[var(--color-bg)] p-2.5 border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] select-all">
                  python cli/download.py --top-only
                </div>
              </div>

              {/* Single Family by Slug */}
              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text)]">Single Font Family (e.g. Satoshi)</span>
                  <button
                    type="button"
                    onClick={() => copy("filter-slug", "python cli/download.py --slug satoshi --install --install-scope user")}
                    className="btn-outline px-2.5 py-1 text-[11px] font-mono cursor-pointer"
                  >
                    {copiedKey === "filter-slug" ? "\u2713 Copied" : "Copy"}
                  </button>
                </div>
                <div className="bg-[var(--color-bg)] p-2.5 border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] select-all">
                  python cli/download.py --slug satoshi --install --install-scope user
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OS AUTO-INSTALLER */}
          {activeTab === "install" && (
            <div className="space-y-4">
              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text)] uppercase tracking-wider text-[11px]">
                    Install Local Font Files (Already Downloaded)
                  </span>
                  <button
                    type="button"
                    onClick={() => copy("offline-install", "python cli/install.py --scope user")}
                    className="btn-outline px-2.5 py-1 text-[11px] font-mono cursor-pointer"
                  >
                    {copiedKey === "offline-install" ? "\u2713 Copied" : "Copy Command"}
                  </button>
                </div>
                <p className="text-[var(--color-muted)]">
                  If you already downloaded fonts via this Web UI or unzipped them into <code className="text-[var(--color-text)]">downloads/fonts/</code>, run <code className="text-[var(--color-text)]">cli/install.py</code> to register them into your OS without re-downloading anything.
                </p>
                <div className="bg-[var(--color-bg)] p-3 border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] overflow-x-auto select-all">
                  python cli/install.py --scope user
                </div>
              </div>

              {/* Platform Details Table */}
              <div className="border border-[var(--color-border)] bg-[var(--color-panel)] divide-y divide-[var(--color-border)]">
                <div className="p-3 bg-[var(--color-card)] font-bold text-[var(--color-text)] uppercase tracking-wider text-[10px]">
                  How Font Registration Works Per Operating System
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-solid text-[9px]">WINDOWS</span>
                    <strong className="text-[var(--color-text)]">User Registry + Live GDI Broadcast</strong>
                  </div>
                  <p className="text-[var(--color-muted)] text-[11px]">
                    Copies files to <code className="text-[var(--color-text)]">%LOCALAPPDATA%\Microsoft\Windows\Fonts\</code> and registers font names under <code className="text-[var(--color-text)]">HKCU\Software\Microsoft\Windows NT\CurrentVersion\Fonts</code>. Calls Windows GDI <code className="text-[var(--color-text)]">SendMessageTimeout(HWND_BROADCAST, WM_FONTCHANGE)</code> so Figma, Photoshop, and Office detect them immediately with <strong>no reboot required and no admin prompt</strong>.
                  </p>
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-solid text-[9px]">MACOS</span>
                    <strong className="text-[var(--color-text)]">User Library Directory</strong>
                  </div>
                  <p className="text-[var(--color-muted)] text-[11px]">
                    Copies all OTF/TTF files directly to <code className="text-[var(--color-text)]">~/Library/Fonts/</code>. macOS Font Book monitors this directory and activates fonts immediately for all apps.
                  </p>
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-solid text-[9px]">LINUX</span>
                    <strong className="text-[var(--color-text)]">XDG Font Cache (fontconfig)</strong>
                  </div>
                  <p className="text-[var(--color-muted)] text-[11px]">
                    Copies files to <code className="text-[var(--color-text)]">~/.local/share/fonts/fontshare/</code> and executes <code className="text-[var(--color-text)]">fc-cache -fv</code> to regenerate the desktop font cache.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHELL SCRIPTS */}
          {activeTab === "scripts" && (
            <div className="space-y-4">
              <p className="text-[var(--color-muted)]">
                If you do not have Python installed, you can use native terminal shell scripts generated directly by this Web UI:
              </p>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-3.5 space-y-2">
                  <strong className="text-[var(--color-text)] block">Windows Batch (.bat)</strong>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    Uses Windows cmd.exe and built-in curl.exe to loop through selected font URLs.
                  </p>
                </div>
                <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-3.5 space-y-2">
                  <strong className="text-[var(--color-text)] block">PowerShell (.ps1)</strong>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    Native PowerShell script with clean progress feedback and retry logic.
                  </p>
                </div>
                <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-3.5 space-y-2">
                  <strong className="text-[var(--color-text)] block">macOS / Linux (.sh)</strong>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    Standard Bash script with curl and parallel downloading capabilities.
                  </p>
                </div>
              </div>

              <div className="p-4 border border-[var(--color-border)] bg-[var(--color-card)] text-xs text-[var(--color-muted)]">
                <span className="font-bold text-[var(--color-text)] block mb-1">How to export:</span>
                Select any number of fonts using the checkboxes, then in the bottom floating dock click <strong>&quot;Scripts / Terminal&quot;</strong> and choose your desired format or copy the curl commands to your clipboard.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-[var(--color-muted)]">
            Fontshare Downloader &middot; Open Source Tool
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-solid px-6 py-2 text-xs uppercase tracking-wider font-bold cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
