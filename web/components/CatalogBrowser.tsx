"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  categoriesOf,
  cssUrl,
  downloadUrl,
  hasItalic,
  isVariable,
  PERSONALITIES,
  sortFonts,
  SORTS,
  weightsOf,
  type CatalogFont,
  type SortKey,
} from "../lib/fonts";
import { useQueue } from "../lib/queue";
import LazyFontCss from "./LazyFontCss";

type QuickFilter = "all" | "top" | "hot" | "variable";

function Dropdown({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`text-sm flex items-center gap-2 py-1 ${active ? "text-[var(--color-cream)]" : "dim"}`}
      >
        {label} <span className="text-[10px]">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close filter"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-20 mt-2 min-w-52 max-h-80 overflow-auto bg-[var(--color-panel)] box p-2 shadow-xl">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="w-full flex items-center gap-3 px-2 py-1.5 text-sm hover:bg-white/5 text-left"
    >
      <span
        aria-hidden="true"
        className={`w-3.5 h-3.5 border border-[var(--color-cream)] flex items-center justify-center text-[10px] leading-none ${
          checked ? "bg-[var(--color-cream)] text-[var(--color-coal)]" : ""
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

export default function CatalogBrowser({ fonts }: { fonts: CatalogFont[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [variableOnly, setVariableOnly] = useState(false);
  const [italicsOnly, setItalicsOnly] = useState(false);
  const [personalities, setPersonalities] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const { slugs, toggle, selectAll, clear } = useQueue();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortFonts(
      fonts.filter((f) => {
        if (quick === "top" && !f.is_top) return false;
        if (quick === "hot" && !f.is_hot) return false;
        if (quick === "variable" && !isVariable(f)) return false;
        if (category !== "All" && !categoriesOf(f).includes(category)) return false;
        if (variableOnly && !isVariable(f)) return false;
        if (italicsOnly && !hasItalic(f)) return false;
        if (personalities.length > 0 && !personalities.some((t) => f.tags.includes(t))) return false;
        if (!q) return true;
        const hay = `${f.name} ${f.slug} ${f.designers.join(" ")} ${f.tags.join(" ")}`.toLowerCase();
        return hay.includes(q);
      }),
      sort
    );
  }, [fonts, query, category, variableOnly, italicsOnly, personalities, quick, sort]);

  const shownSlugs = useMemo(() => filtered.map((f) => f.slug), [filtered]);
  const allShownQueued = shownSlugs.length > 0 && shownSlugs.every((s) => slugs.includes(s));

  const resetAll = () => {
    setQuery("");
    setCategory("All");
    setVariableOnly(false);
    setItalicsOnly(false);
    setPersonalities([]);
    setQuick("all");
    setSort("popular");
  };

  const togglePersonality = (tag: string) =>
    setPersonalities((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  return (
    <div>
      {/* Toolbar row 1: search + dropdown filters */}
      <div className="rule-b flex flex-wrap items-center gap-x-10 gap-y-3 py-3">
        <label className="flex items-center gap-2 flex-1 min-w-44 text-sm">
          <span aria-hidden="true" className="dim">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search families to download"
            aria-label="Search fonts"
            className="twin-input w-full"
          />
        </label>
        <Dropdown label="Categories" active={category !== "All"}>
          {["All", ...CATEGORIES].map((c) => (
            <CheckRow
              key={c}
              label={c === "All" ? "All categories" : c}
              checked={category === c}
              onChange={() => setCategory(c)}
            />
          ))}
        </Dropdown>
        <Dropdown label="Properties" active={variableOnly || italicsOnly}>
          <CheckRow label="Variable" checked={variableOnly} onChange={() => setVariableOnly((v) => !v)} />
          <CheckRow label="Italics" checked={italicsOnly} onChange={() => setItalicsOnly((v) => !v)} />
        </Dropdown>
        <Dropdown label="Personality" active={personalities.length > 0}>
          {PERSONALITIES.map((tag) => (
            <CheckRow
              key={tag}
              label={tag}
              checked={personalities.includes(tag)}
              onChange={() => togglePersonality(tag)}
            />
          ))}
        </Dropdown>
      </div>

      {/* Toolbar row 2: preview text, bulk selection, reset */}
      <div className="rule-b flex flex-wrap items-center gap-x-8 gap-y-3 py-3">
        <label className="flex items-center gap-2 flex-[2] min-w-52 text-sm">
          <span aria-hidden="true" className="dim">✎</span>
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Preview text (optional)"
            aria-label="Custom preview text"
            className="twin-input w-full"
          />
        </label>
        <button
          type="button"
          onClick={() => (allShownQueued ? clear() : selectAll(shownSlugs))}
          className="text-sm font-semibold hover:underline underline-offset-4"
        >
          {allShownQueued ? `Unqueue ${filtered.length} shown` : `Queue all ${filtered.length} shown`}
        </button>
        <button type="button" onClick={resetAll} className="text-sm dim hover:text-[var(--color-cream)]">
          Reset All
        </button>
      </div>

      {/* View controls row */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 py-6 text-[13px]">
        <span className="font-display font-semibold text-2xl" role="status" aria-live="polite">
          {filtered.length}
        </span>
        <div className="flex items-center gap-4" role="group" aria-label="View">
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={view === "list" ? "font-semibold" : "dim"}
          >
            List view
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            className={view === "grid" ? "font-semibold" : "dim"}
          >
            Grid view
          </button>
        </div>
        <div className="flex items-center gap-4" role="group" aria-label="Quick filters">
          {(
            [
              ["top", "Top"],
              ["hot", "Hot"],
              ["variable", "Variable"],
            ] as [QuickFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setQuick((q) => (q === key ? "all" : key))}
              aria-pressed={quick === key}
              className={quick === key ? "font-semibold" : "dim"}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 ml-auto" role="group" aria-label="Sort by">
          <span className="dim">Sort by</span>
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              aria-pressed={sort === s.key}
              className={sort === s.key ? "font-semibold" : "dim"}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-lg dim">No families match. Try Reset All.</p>
      ) : view === "list" ? (
        <ul className="flex flex-col">
          {filtered.map((font) => (
            <BulkRow
              key={font.slug}
              font={font}
              preview={customText.trim() || font.name}
              selected={slugs.includes(font.slug)}
              onToggle={() => toggle(font.slug)}
            />
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((font) => (
            <BulkCard
              key={font.slug}
              font={font}
              preview={customText.trim() || font.name}
              selected={slugs.includes(font.slug)}
              onToggle={() => toggle(font.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QueueBox({ selected, onToggle, label }: { selected: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={label}
      onClick={onToggle}
      className={`shrink-0 w-6 h-6 border border-[var(--color-cream)] flex items-center justify-center text-sm leading-none ${
        selected ? "bg-[var(--color-cream)] text-[var(--color-coal)]" : ""
      }`}
    >
      {selected ? "✓" : ""}
    </button>
  );
}

function MetaLine({ font }: { font: CatalogFont }) {
  const styles = font.styles.filter((s) => !s.is_italic).length || font.styles.length;
  return (
    <span className="text-[13px] dim">
      {font.category} · {styles} style{styles === 1 ? "" : "s"}
      {isVariable(font) ? " · Variable" : ""} · {font.license === "sil_ofl" ? "Open Source" : "Closed Source"}
    </span>
  );
}

function DownloadLink({ slug, name, compact }: { slug: string; name: string; compact?: boolean }) {
  return (
    <a
      href={downloadUrl(slug)}
      download={`${slug}.zip`}
      onClick={(e) => e.stopPropagation()}
      className={compact ? "btn-ink px-4 py-1.5 text-[13px]" : "btn-ink px-5 py-2 text-sm"}
    >
      {compact ? ".zip" : `Download ${name}`}
    </a>
  );
}

function BulkRow({
  font,
  preview,
  selected,
  onToggle,
}: {
  font: CatalogFont;
  preview: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const weights = weightsOf(font);
  const mid = weights[Math.floor(weights.length / 2)] ?? 400;
  return (
    <LazyFontCss href={cssUrl(font)}>
      <li
        className={`box mb-3 px-4 py-3 flex items-center gap-4 ${
          selected ? "shadow-[inset_0_0_0_1.5px_var(--color-cream)]" : ""
        }`}
      >
        <QueueBox selected={selected} onToggle={onToggle} label={selected ? `Remove ${font.name} from queue` : `Add ${font.name} to queue`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <Link
              href={`/${font.slug}`}
              className="font-display font-bold text-lg leading-tight hover:underline underline-offset-4 truncate"
            >
              {font.name}
            </Link>
            <MetaLine font={font} />
          </div>
          <p
            className="preview-line text-[22px] leading-snug mt-0.5 opacity-90"
            style={{ fontFamily: `'${font.name}', sans-serif`, fontWeight: mid }}
            aria-hidden="true"
          >
            {preview}
          </p>
          <p className="text-xs dim mt-0.5 truncate">
            Designed by {font.designers.join(", ") || "Unknown"}
          </p>
        </div>
        <div className="shrink-0 hidden sm:block">
          <DownloadLink slug={font.slug} name={font.name} compact />
        </div>
      </li>
    </LazyFontCss>
  );
}

function BulkCard({
  font,
  preview,
  selected,
  onToggle,
}: {
  font: CatalogFont;
  preview: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const weights = weightsOf(font);
  const mid = weights[Math.floor(weights.length / 2)] ?? 400;
  return (
    <LazyFontCss href={cssUrl(font)}>
      <article
        className={`box p-5 flex flex-col gap-3 ${
          selected ? "shadow-[inset_0_0_0_1.5px_var(--color-cream)]" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <QueueBox selected={selected} onToggle={onToggle} label={selected ? `Remove ${font.name} from queue` : `Add ${font.name} to queue`} />
          <div className="min-w-0">
            <Link
              href={`/${font.slug}`}
              className="font-display font-bold text-lg leading-tight hover:underline underline-offset-4"
            >
              {font.name}
            </Link>
            <div className="mt-0.5">
              <MetaLine font={font} />
            </div>
          </div>
        </div>
        <p
          className="preview-line text-[26px] leading-snug opacity-90"
          style={{ fontFamily: `'${font.name}', sans-serif`, fontWeight: mid }}
          aria-hidden="true"
        >
          {preview}
        </p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-xs dim truncate">
            {font.designers.join(", ") || "Unknown designer"}
          </span>
          <DownloadLink slug={font.slug} name={font.name} compact />
        </div>
      </article>
    </LazyFontCss>
  );
}
