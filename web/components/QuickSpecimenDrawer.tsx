"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  cssUrl,
  downloadUrl,
  hasItalic,
  isVariable,
  licenseLabel,
  weightsOf,
  type CatalogFont,
} from "../lib/fonts";
import { useQueue } from "../lib/queue";

interface QuickSpecimenDrawerProps {
  font: CatalogFont | null;
  onClose: () => void;
}

export default function QuickSpecimenDrawer({
  font,
  onClose,
}: QuickSpecimenDrawerProps) {
  const { has, toggle } = useQueue();
  const [sampleText, setSampleText] = useState(
    "Almost before we knew it, we had left the ground."
  );
  const [fontSize, setFontSize] = useState(36);
  const [customWeight, setCustomWeight] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!font) return null;

  const weights = weightsOf(font);
  const defaultWeight = weights.includes(400) ? 400 : weights[0] ?? 400;
  const selectedWeight =
    customWeight !== null && weights.includes(customWeight)
      ? customWeight
      : defaultWeight;

  const isSelected = has(font.slug);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <link rel="stylesheet" href={cssUrl(font, weights)} />

      <aside className="relative w-full max-w-2xl bg-[var(--color-card)] border-l border-[var(--color-border)] h-full flex flex-col shadow-lg z-10 overflow-hidden">
        {/* Top bar */}
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-panel)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="badge-solid">Specimen</span>
            <span className="micro-label text-[var(--color-muted)]">
              {font.category} · {font.styles.length} STYLES
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${font.slug}`}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] underline underline-offset-4"
            >
              Full page
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
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
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Family Header */}
          <div>
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text)] leading-none"
              style={{ fontFamily: `'${font.name}', sans-serif` }}
            >
              {font.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[var(--color-muted)]">
              <span>
                Designed by{" "}
                <strong className="text-[var(--color-text)]">{font.designers.join(", ") || "Unknown"}</strong>
              </span>
              <span>·</span>
              <span>
                License:{" "}
                <strong className="text-[var(--color-text)]">{licenseLabel(font.license)}</strong>
              </span>
              {isVariable(font) && (
                <span className="text-[var(--color-text)] font-semibold border border-[var(--color-border)] px-1.5 py-0.5 rounded-sm">
                  Variable
                </span>
              )}
              {hasItalic(font) && (
                <span className="border border-[var(--color-border)] px-1.5 py-0.5 rounded-sm">
                  Italics
                </span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--color-panel)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => toggle(font.slug)}
              className={`flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                  : "btn-solid"
              }`}
            >
              <span>{isSelected ? "[x] In Bulk Queue" : "+ Add to Bulk Queue"}</span>
            </button>
            <a
              href={downloadUrl(font.slug)}
              download={`${font.slug}.zip`}
              className="btn-outline py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, display: "inline-block" }}
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download .ZIP</span>
            </a>
          </div>

          {/* Interactive Tester Controls */}
          <div className="space-y-3 p-4 bg-[var(--color-panel)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between text-xs">
              <span className="micro-label text-[var(--color-muted)]">Interactive Preview</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[var(--color-muted)]">{fontSize}px</span>
                <input
                  type="range"
                  min={18}
                  max={96}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="fs-range w-24"
                  aria-label="Font preview size"
                />
              </div>
            </div>
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Type custom preview text..."
              className="w-full bg-transparent border-b border-[var(--color-border)] py-1.5 text-sm outline-none text-[var(--color-text)] placeholder-[var(--color-dim)]"
            />
            {/* Quick weight selector chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {weights.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setCustomWeight(w)}
                  className={`text-xs px-2 py-0.5 border transition-colors cursor-pointer ${
                    selectedWeight === w
                      ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] font-semibold"
                      : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Specimen Display */}
          <div className="p-5 bg-[var(--color-panel)] border border-[var(--color-border)] min-h-32 flex items-center">
            <p
              className="leading-tight break-words text-[var(--color-text)] w-full"
              style={{
                fontFamily: `'${font.name}', sans-serif`,
                fontSize: `${fontSize}px`,
                fontWeight: selectedWeight,
              }}
            >
              {sampleText || font.name}
            </p>
          </div>

          {/* Styles & Weights Breakdown */}
          <div>
            <h3 className="micro-label text-[var(--color-muted)] mb-3">
              All Family Styles ({font.styles.length})
            </h3>
            <div className="border border-[var(--color-border)] divide-y divide-[var(--color-border)] bg-[var(--color-panel)]">
              {font.styles.map((style, idx) => (
                <div
                  key={idx}
                  className="p-3 flex items-center justify-between hover:bg-[var(--color-card-hover)] transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p
                      className="text-lg truncate text-[var(--color-text)]"
                      style={{
                        fontFamily: `'${font.name}', sans-serif`,
                        fontWeight: style.weight_number,
                        fontStyle: style.is_italic ? "italic" : "normal",
                      }}
                    >
                      {font.name} {style.weight_name}
                    </p>
                    <span className="text-[11px] text-[var(--color-dim)] font-mono">
                      Weight: {style.weight_number} {style.is_italic ? " \u00B7 Italic" : ""} {style.is_variable ? " \u00B7 Variable" : ""}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--color-muted)] shrink-0">
                    {style.weight_number}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags & External Info */}
          <div className="space-y-2 pt-2">
            <h3 className="micro-label text-[var(--color-muted)]">Tags &amp; Uses</h3>
            <div className="flex flex-wrap gap-1.5">
              {font.tags.map((t) => (
                <span key={t} className="badge-tag">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--color-muted)] pt-3">
              View official specimen and pairings at{" "}
              <a
                href={`https://www.fontshare.com/fonts/${font.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-text)] underline underline-offset-4 hover:opacity-80"
              >
                fontshare.com/fonts/{font.slug}
              </a>
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
