"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import QueueCount from "./QueueCount";
import CliHelperModal from "./CliHelperModal";

export default function Navbar() {
  const [cliModalOpen, setCliModalOpen] = useState(false);

  return (
    <>
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex items-stretch justify-between h-16 sm:h-20">
          {/* Brand / Logo */}
          <div className="flex items-center px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 group tracking-tight"
            >
              <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-[var(--color-text)]">
                Fontshare&trade;
              </span>
              <span className="badge-solid text-[9px] font-black ml-1">
                BULK
              </span>
            </Link>
          </div>

          {/* Right Segmented Blocks (Exact Fontshare style) */}
          <div className="flex items-stretch divide-x divide-[var(--color-border)] border-l border-[var(--color-border)]">
            {/* Active 'Fonts 100' Tab Cell */}
            <div className="hidden sm:flex flex-col justify-between p-3 sm:px-6 sm:py-2.5 bg-[var(--color-text)] text-[var(--color-bg)] min-w-28 sm:min-w-36">
              <span className="text-xs sm:text-sm font-semibold tracking-tight">Fonts</span>
              <span className="font-mono text-xs font-bold self-start">100</span>
            </div>

            {/* License Segment */}
            <a
              href="https://www.fontshare.com/licenses"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex flex-col justify-between p-3 sm:px-5 sm:py-2.5 hover:bg-[var(--color-panel)] transition-colors text-[var(--color-text)] min-w-28"
            >
              <span className="text-xs font-medium">License</span>
              <span className="font-mono text-[11px] text-[var(--color-muted)] flex items-center gap-1">
                <span>Free OFL</span>
                <span className="text-[10px]">{'\u2197'}</span>
              </span>
            </a>

            {/* Guide Trigger Cell */}
            <button
              type="button"
              onClick={() => setCliModalOpen(true)}
              className="flex flex-col justify-between p-3 sm:px-5 sm:py-2.5 hover:bg-[var(--color-panel)] transition-colors text-[var(--color-text)] cursor-pointer min-w-24 sm:min-w-28 text-left"
              title="How to use this site, the Python CLI, the OS installer, and shell script exports"
            >
              <span className="text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-mono">&gt;_</span>
                <span>Guide</span>
              </span>
              <span className="font-mono text-[11px] text-[var(--color-muted)] hidden sm:inline whitespace-nowrap">Web · CLI</span>
            </button>

            {/* Queue Counter Cell */}
            <div className="flex items-center px-3 sm:px-5">
              <QueueCount />
            </div>

            {/* Theme Toggle Cell */}
            <div className="flex items-center px-3 sm:px-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* CLI & Auto-Install Modal */}
      <CliHelperModal
        isOpen={cliModalOpen}
        onClose={() => setCliModalOpen(false)}
      />
    </>
  );
}
