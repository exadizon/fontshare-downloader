"use client";

import { useState } from "react";
import { usePresence } from "../lib/usePresence";

interface CliHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "site" | "quickstart" | "install" | "scripts";

function Command({ text, copyKey, onCopy, copied }: { text: string; copyKey: string; onCopy: (key: string, text: string) => void; copied: string | null }) {
  return (
    <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-3">
      <div className="bg-[var(--color-bg)] p-3 border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] overflow-x-auto select-all whitespace-pre">
        {text}
      </div>
      <button
        type="button"
        onClick={() => onCopy(copyKey, text)}
        className="btn-outline px-2.5 py-1 text-[11px] font-mono cursor-pointer"
      >
        {copied === copyKey ? "Copied" : "Copy command"}
      </button>
    </div>
  );
}

export default function CliHelperModal({ isOpen, onClose }: CliHelperModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("site");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { mounted, visible } = usePresence(isOpen, 250);

  if (!mounted) return null;

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "site", label: "Using this site" },
    { key: "quickstart", label: "CLI quick start" },
    { key: "install", label: "Install to your OS" },
    { key: "scripts", label: "Shell scripts" },
  ];

  return (
    <div
      className="guide-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      data-state={visible ? "open" : "closed"}
      data-lenis-prevent
    >
      {/* Backdrop click */}
      <div
        className="guide-backdrop fixed inset-0 bg-black/80"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="guide-panel relative w-full max-w-3xl bg-[var(--color-card)] border border-[var(--color-border)] p-6 md:p-8 shadow-lg z-10 max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Guide"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[var(--color-border)] shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-solid text-[10px]">Guide</span>
              <span className="text-xs font-mono text-[var(--color-muted)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-sm">
                Web UI + Python 3.10+ CLI
              </span>
            </div>
            <h2 className="font-display font-black text-2xl tracking-tight text-[var(--color-text)]">
              How to use this tool
            </h2>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Browse and download in the browser, or run the Python CLI to download
              and install every family straight to your operating system.
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
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--color-border)] text-xs shrink-0 overflow-x-auto">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              aria-pressed={activeTab === t.key}
              className={`px-4 py-3 border-b-2 font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === t.key
                  ? "border-[var(--color-text)] text-[var(--color-text)] bg-[var(--color-panel)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <span>
                {i + 1}. {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs leading-relaxed">
          {/* TAB 1: USING THIS SITE */}
          {activeTab === "site" && (
            <div className="space-y-4">
              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-2">
                <p className="font-bold text-[var(--color-text)]">Browse and preview</p>
                <p className="text-[var(--color-muted)]">
                  Every card shows the family name set in its own typeface, live from the
                  Fontshare CDN. Use the search box (family, designer or tag), the category
                  pills, and the Variable / Italics / license filters to narrow the list.
                  The px slider sets the specimen size; typing in “Your text” replaces the
                  name on every card at once.
                </p>
              </div>

              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-2">
                <p className="font-bold text-[var(--color-text)]">Build a queue</p>
                <p className="text-[var(--color-muted)]">
                  Click a card (or its checkbox) to add it to the bulk queue. The quick
                  select chips above the list grab whole groups at once: All 100, Sans,
                  Serif, Display, Variable, Trending. “Select all N shown” takes exactly
                  what passes your current filters.
                </p>
              </div>

              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-2">
                <p className="font-bold text-[var(--color-text)]">Download</p>
                <p className="text-[var(--color-muted)]">
                  Once your queue is not empty, a dock appears at the bottom: it shows how
                  many families and styles are queued, lets you set the pace between file
                  triggers (Polite is kindest to Fontshare’s servers), and offers two ways
                  out. “Download N ZIPs” saves each family ZIP through your browser; accept
                  the “download multiple files” prompt if it appears. “Scripts / Terminal”
                  instead exports a ready-made .bat, .ps1, .sh or curl script for exactly
                  the families you selected.
                </p>
              </div>

              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-2">
                <p className="font-bold text-[var(--color-text)]">Turn browser ZIPs into a font library</p>
                <p className="text-[var(--color-muted)]">
                  The downloaded ZIPs land in your browser’s download folder (names like{" "}
                  <code className="text-[var(--color-text)]">Satoshi_Complete.zip</code>).
                  Run the import command below and they are extracted into{" "}
                  <code className="text-[var(--color-text)]">downloads/fonts/&lt;family&gt;/</code>{" "}
                  in the same layout the CLI produces - add{" "}
                  <code className="text-[var(--color-text)]">--install</code> to register
                  them with your OS in the same step.
                </p>
                <div className="bg-[var(--color-bg)] p-3 border border-[var(--color-border)] font-mono text-xs text-[var(--color-text)] overflow-x-auto select-all">
                  python cli/import_zips.py --install
                </div>
                <p className="text-[var(--color-muted)]">
                  Pure standard library, so this works before any pip install. It scans
                  your download folder by default; point it at any folder with{" "}
                  <code className="text-[var(--color-text)]">--source ./zips</code> and
                  preview with <code className="text-[var(--color-text)]">--dry-run</code>.
                </p>
              </div>

              <div className="bg-[var(--color-panel)] border border-[var(--color-border)] p-4 space-y-2">
                <p className="font-bold text-[var(--color-text)]">Go deeper on one family</p>
                <p className="text-[var(--color-muted)]">
                  “Inspect” on any card opens a specimen drawer: your own text, size,
                  per-weight chips and the full style list. “Full page” leads to the
                  family’s own page with an interactive specimen editor and a direct ZIP
                  download.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CLI QUICK START */}
          {activeTab === "quickstart" && (
            <div className="space-y-4">
              <p className="text-[var(--color-muted)]">
                The CLI downloads the complete catalog from the live Fontshare API. It
                needs Python 3.10+ and a handful of pip packages.
              </p>

              <Command
                copyKey="setup"
                text={"pip install -r cli/requirements.txt"}
                onCopy={copy}
                copied={copiedKey}
              />
              <Command
                copyKey="quick-download"
                text={"python cli/download.py"}
                onCopy={copy}
                copied={copiedKey}
              />
              <p className="text-[var(--color-muted)] -mt-2">
                Fetches the catalog, then downloads and extracts all 100 families into{" "}
                <code className="text-[var(--color-text)]">downloads/fonts/&lt;family&gt;/</code>{" "}
                at a polite pace (1 request per second, 3 concurrent). Safe to re-run:
                families already extracted are skipped, so an interrupted run resumes
                where it stopped.
              </p>

              <Command
                copyKey="quick-all"
                text={"python cli/download.py --install --install-scope user"}
                onCopy={copy}
                copied={copiedKey}
              />
              <p className="text-[var(--color-muted)] -mt-2">
                The same pipeline, chained with the installer: after extracting, every
                OTF/TTF is registered with your operating system (see the next tab).
              </p>

              <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-[var(--color-muted)]">
                <p className="font-bold text-[var(--color-text)] mb-1">
                  Only have browser-downloaded ZIPs?
                </p>
                <code className="text-[var(--color-text)] font-mono text-xs">
                  python cli/import_zips.py --install
                </code>{" "}
                imports them without any pip install at all - it is standard library
                only. See tab 1.
              </div>

              <div className="border border-[var(--color-border)] p-4 bg-[var(--color-panel)]">
                <p className="font-bold text-[var(--color-text)] mb-2">Useful flags</p>
                <ul className="space-y-1.5 text-[var(--color-muted)]">
                  <li>
                    <code className="text-[var(--color-text)]">-o, --output-dir ./downloads</code> - where fonts, logs and metadata land
                  </li>
                  <li>
                    <code className="text-[var(--color-text)]">-r, --rate-limit 1.0</code> - seconds between requests; raise it to be gentler
                  </li>
                  <li>
                    <code className="text-[var(--color-text)]">-c, --max-concurrent 3</code> - parallel downloads
                  </li>
                  <li>
                    <code className="text-[var(--color-text)]">--install --install-scope user|system</code> - register fonts after download
                  </li>
                  <li>
                    <code className="text-[var(--color-text)]">-v, --verbose</code> - debug logging
                  </li>
                </ul>
                <p className="text-[var(--color-muted)] mt-3">
                  Filtering lives in this web UI: pick families here, then export a shell
                  script for just those (tab 4). The CLI itself always takes the full catalog.
                </p>
              </div>

              <div className="border border-[var(--color-border)] p-4 bg-[var(--color-panel)]">
                <p className="font-bold text-[var(--color-text)] text-[11px] mb-2">
                  What you get on disk
                </p>
                <pre className="font-mono text-[11px] text-[var(--color-muted)] leading-5 overflow-x-auto">
{`downloads/
  fonts/                  # one folder per family, clean OTF/TTF
    satoshi/              # incl. variable files where offered
    general-sans/
    ...
  logs/download.log       # full request + retry log
  metadata/font-list.json # the catalog snapshot it used`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: OS INSTALLER */}
          {activeTab === "install" && (
            <div className="space-y-4">
              <p className="text-[var(--color-muted)]">
                Already have the fonts (downloaded here, or by the CLI)?{" "}
                <code className="text-[var(--color-text)]">cli/install.py</code> registers
                the extracted files with your OS without re-downloading anything.
              </p>

              <Command
                copyKey="offline-install"
                text={"python cli/install.py --scope user"}
                onCopy={copy}
                copied={copiedKey}
              />
              <p className="text-[var(--color-muted)] -mt-2">
                Reads <code className="text-[var(--color-text)]">./downloads/fonts</code> by
                default. Point it elsewhere with{" "}
                <code className="text-[var(--color-text)]">--fonts-dir /path/to/fonts</code>,
                or use <code className="text-[var(--color-text)]">--scope system</code> to
                install for every account (on Windows that needs administrator rights).
              </p>

              {/* Platform Details */}
              <div className="border border-[var(--color-border)] bg-[var(--color-panel)] divide-y divide-[var(--color-border)]">
                <div className="p-3 bg-[var(--color-card)] font-bold text-[var(--color-text)] text-[11px]">
                  Where fonts go, per operating system
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-solid text-[9px]">Windows</span>
                    <strong className="text-[var(--color-text)]">User registry + live GDI broadcast</strong>
                  </div>
                  <p className="text-[var(--color-muted)] text-[11px]">
                    Copies files to{" "}
                    <code className="text-[var(--color-text)]">%LOCALAPPDATA%\Microsoft\Windows\Fonts\</code>{" "}
                    and registers font names under{" "}
                    <code className="text-[var(--color-text)]">HKCU\...\CurrentVersion\Fonts</code>.
                    A GDI <code className="text-[var(--color-text)]">WM_FONTCHANGE</code>{" "}
                    broadcast means Figma, Photoshop and Office pick them up without a
                    reboot and without an admin prompt.
                  </p>
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-solid text-[9px]">macOS</span>
                    <strong className="text-[var(--color-text)]">User library directory</strong>
                  </div>
                  <p className="text-[var(--color-muted)] text-[11px]">
                    Copies all OTF/TTF files to{" "}
                    <code className="text-[var(--color-text)]">~/Library/Fonts/</code>. Font
                    Book watches that directory and activates fonts for all apps.
                  </p>
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-solid text-[9px]">Linux</span>
                    <strong className="text-[var(--color-text)]">XDG font cache (fontconfig)</strong>
                  </div>
                  <p className="text-[var(--color-muted)] text-[11px]">
                    Copies files to{" "}
                    <code className="text-[var(--color-text)]">~/.local/share/fonts/</code>{" "}
                    (or <code className="text-[var(--color-text)]">$XDG_DATA_HOME/fonts</code>)
                    and runs <code className="text-[var(--color-text)]">fc-cache</code> to
                    rebuild the desktop font cache.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHELL SCRIPTS */}
          {activeTab === "scripts" && (
            <div className="space-y-4">
              <p className="text-[var(--color-muted)]">
                No Python? Select any families on this site, open the bottom dock, click
                “Scripts / Terminal” and export a native script for exactly that
                selection.
              </p>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-3.5 space-y-2">
                  <strong className="text-[var(--color-text)] block">Windows batch (.bat)</strong>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    A curl loop for cmd.exe, one line per selected family.
                  </p>
                </div>
                <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-3.5 space-y-2">
                  <strong className="text-[var(--color-text)] block">PowerShell (.ps1)</strong>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    Native PowerShell with progress feedback and retries.
                  </p>
                </div>
                <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-3.5 space-y-2">
                  <strong className="text-[var(--color-text)] block">macOS / Linux (.sh)</strong>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    Plain Bash with curl, safe to run with sh or bash.
                  </p>
                </div>
              </div>

              <div className="p-4 border border-[var(--color-border)] bg-[var(--color-card)] text-xs text-[var(--color-muted)]">
                <span className="font-bold text-[var(--color-text)] block mb-1">
                  Or copy raw commands
                </span>
                The same menu can copy the Python CLI one-liner or the cURL commands (a{" "}
                <code className="text-[var(--color-text)]">curl -L -O</code> line per
                selected family) straight to your clipboard - handy for pasting into any
                terminal.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-[var(--color-muted)]">
            Fontshare Downloader · Open source tool
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-solid px-6 py-2 text-xs font-bold cursor-pointer"
          >
            Close guide
          </button>
        </div>
      </div>
    </div>
  );
}
