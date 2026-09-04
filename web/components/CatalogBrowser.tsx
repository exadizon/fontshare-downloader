"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  categoriesOf,
  cssUrl,
  downloadUrl,
  hasItalic,
  isVariable,
  licenseLabel,
  sortFonts,
  SORTS,
  weightsOf,
  type CatalogFont,
  type SortKey,
} from "../lib/fonts";
import { useQueue } from "../lib/queue";
import LazyFontLink from "./LazyFontCss";
import QuickSpecimenDrawer from "./QuickSpecimenDrawer";

const PRESET_TEXTS = [
  { label: "Headline", text: "The quick brown fox jumps over the lazy dog" },
  { label: "Alphabet", text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz" },
  { label: "Numbers", text: "0123456789 &?!@#$%*" },
  { label: "Editorial", text: "Quality fonts accessible to all designers and developers" },
];

export default function CatalogBrowser({ fonts }: { fonts: CatalogFont[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [variableOnly, setVariableOnly] = useState(false);
  const [italicsOnly, setItalicsOnly] = useState(false);
  const [licenseFilter, setLicenseFilter] = useState<string>("All");
  const [previewText, setPreviewText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sort, setSort] = useState<SortKey>("popular");
  const [inspectingFont, setInspectingFont] = useState<CatalogFont | null>(null);

  const {
    slugs,
    toggle,
    has,
    selectAll,
    clear,
    selectSlugs,
    downloadAll,
    isDownloading,
  } = useQueue();

  // Filter fonts
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = fonts.filter((f) => {
      if (category !== "All" && !categoriesOf(f).some((c) => c.toLowerCase() === category.toLowerCase())) {
        return false;
      }
      if (variableOnly && !isVariable(f)) return false;
      if (italicsOnly && !hasItalic(f)) return false;
      if (licenseFilter === "sil_ofl" && f.license !== "sil_ofl") return false;
      if (licenseFilter === "itf_ffl" && f.license !== "itf_ffl") return false;
      if (!q) return true;
      const haystack = `${f.name} ${f.slug} ${f.category} ${f.designers.join(" ")} ${f.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });

    return sortFonts(list, sort);
  }, [fonts, query, category, variableOnly, italicsOnly, licenseFilter, sort]);

  const shownSlugs = useMemo(() => filtered.map((f) => f.slug), [filtered]);
  const allShownSelected =
    shownSlugs.length > 0 && shownSlugs.every((s) => slugs.includes(s));
  const someShownSelected =
    shownSlugs.length > 0 &&
    shownSlugs.some((s) => slugs.includes(s)) &&
    !allShownSelected;

  // Preset Selection Handlers
  const selectAllCatalog = () => selectAll(fonts.map((f) => f.slug));
  const selectAllSans = () => {
    const matching = fonts.filter((f) => f.category.toLowerCase().includes("sans")).map((f) => f.slug);
    selectSlugs(matching);
  };
  const selectAllSerif = () => {
    const matching = fonts.filter((f) => f.category.toLowerCase().includes("serif")).map((f) => f.slug);
    selectSlugs(matching);
  };
  const selectAllDisplay = () => {
    const matching = fonts.filter((f) => f.category.toLowerCase().includes("display")).map((f) => f.slug);
    selectSlugs(matching);
  };
  const selectAllVariable = () => {
    const matching = fonts.filter((f) => isVariable(f)).map((f) => f.slug);
    selectSlugs(matching);
  };
  const selectAllTop = () => {
    const matching = fonts.filter((f) => f.is_top || f.is_hot || f.views_recent > 500).map((f) => f.slug);
    selectSlugs(matching);
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setVariableOnly(false);
    setItalicsOnly(false);
    setLicenseFilter("All");
    setPreviewText("");
    setSort("popular");
  };

  return (
    <div className="space-y-8">
      {/* 1. HERO COMMAND DECK (Fontshare Parchment & Charcoal) */}
      <section className="border border-[var(--color-border)] bg-[var(--color-panel)] p-6 md:p-8 mt-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-solid">100% FREE FOR COMMERCIAL USE</span>
              <span className="text-xs font-mono text-[var(--color-muted)]">ITF &amp; SIL OFL</span>
            </div>
            <h1 className="font-display font-black text-3xl md:text-5xl lg:text-6xl tracking-tight text-[var(--color-text)] leading-tight">
              Bulk Download Fontshare
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">
              Download all 100 curated font families from the Indian Type Foundry catalog.
              Select specific styles, filter by type or variable axes, or download the full library in one click.
            </p>
          </div>

          {/* Direct 1-Click Catalog Download */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => downloadAll(fonts.map((f) => f.slug))}
              disabled={isDownloading}
              className="btn-solid px-7 py-4 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-3 shadow-md cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, display: "inline-block" }}
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Full Catalog (100 Fonts)</span>
            </button>
            <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--color-muted)] font-mono">
              <span>~1.2 GB Total</span>
              <span>{"\u00B7"}</span>
              <span>Direct ZIP Downloads</span>
            </div>
          </div>
        </div>

        {/* Quick Batch Presets Bar */}
        <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2">
          <span className="micro-label text-[var(--color-muted)] mr-2">Quick Select:</span>
          <button
            type="button"
            onClick={selectAllCatalog}
            className="text-xs font-mono px-3 py-1 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] transition-colors cursor-pointer"
          >
            + All 100
          </button>
          <button
            type="button"
            onClick={selectAllSans}
            className="text-xs font-mono px-3 py-1 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] transition-colors cursor-pointer"
          >
            + Sans ({fonts.filter((f) => f.category.toLowerCase().includes("sans")).length})
          </button>
          <button
            type="button"
            onClick={selectAllSerif}
            className="text-xs font-mono px-3 py-1 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] transition-colors cursor-pointer"
          >
            + Serif ({fonts.filter((f) => f.category.toLowerCase().includes("serif")).length})
          </button>
          <button
            type="button"
            onClick={selectAllDisplay}
            className="text-xs font-mono px-3 py-1 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] transition-colors cursor-pointer"
          >
            + Display ({fonts.filter((f) => f.category.toLowerCase().includes("display")).length})
          </button>
          <button
            type="button"
            onClick={selectAllVariable}
            className="text-xs font-mono px-3 py-1 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] transition-colors cursor-pointer"
          >
            + Variable ({fonts.filter((f) => isVariable(f)).length})
          </button>
          <button
            type="button"
            onClick={selectAllTop}
            className="text-xs font-mono px-3 py-1 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] transition-colors cursor-pointer"
          >
            + Top / Trending
          </button>
          {slugs.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-xs font-mono px-3 py-1 text-[var(--color-muted)] hover:text-red-600 underline underline-offset-4 ml-auto cursor-pointer"
            >
              Clear selection ({slugs.length})
            </button>
          )}
        </div>
      </section>

      {/* 2. MINIMALIST FONTSHARE SEARCH & CONTROLS */}
      <div className="space-y-4 pt-2">
        {/* Row 1: Search & Category Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-3 border-b border-[var(--color-border)]">
          {/* Search Box with Search Icon */}
          <div className="flex-1 flex items-center gap-2 text-sm text-[var(--color-text)]">
            <span className="text-[var(--color-dim)] text-base font-serif">&#9906;</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fonts by name, designer, tag (e.g. Satoshi, modern, geometric)..."
              aria-label="Search fonts"
              className="bg-transparent w-full outline-none text-sm text-[var(--color-text)] placeholder-[var(--color-dim)] font-sans"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer"
              >
                {"\u2715"}
              </button>
            )}
          </div>

          {/* Categories Horizontal Selector */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setCategory("All")}
              className={`text-xs px-3 py-1.5 transition-all cursor-pointer ${
                category === "All"
                  ? "bg-[var(--color-text)] text-[var(--color-bg)] font-bold"
                  : "border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text)]"
              }`}
            >
              All ({fonts.length})
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 transition-all cursor-pointer ${
                  category === c
                    ? "bg-[var(--color-text)] text-[var(--color-bg)] font-bold"
                    : "border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Live Specimen Input & Properties */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-3 border-b border-[var(--color-border)] text-xs">
          {/* Custom Specimen Input with Pencil Icon */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[var(--color-dim)] text-sm">&#9998;</span>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Your Text (type custom preview string)..."
              aria-label="Custom specimen text"
              className="bg-transparent w-full outline-none text-xs text-[var(--color-text)] placeholder-[var(--color-dim)]"
            />
            {PRESET_TEXTS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPreviewText(p.text)}
                className="hidden lg:inline-block text-[11px] text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] px-2 py-0.5 cursor-pointer whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
            {previewText && (
              <button
                type="button"
                onClick={() => setPreviewText("")}
                className="text-[11px] text-[var(--color-muted)] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Properties Filter & Sizing */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-[var(--color-muted)] hover:text-[var(--color-text)] select-none">
              <input
                type="checkbox"
                checked={variableOnly}
                onChange={(e) => setVariableOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[var(--color-text)]"
              />
              <span>Variable</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[var(--color-muted)] hover:text-[var(--color-text)] select-none">
              <input
                type="checkbox"
                checked={italicsOnly}
                onChange={(e) => setItalicsOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[var(--color-text)]"
              />
              <span>Italics</span>
            </label>

            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              aria-label="Filter by license"
              className="bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)] outline-none cursor-pointer"
            >
              <option value="All">All Licenses</option>
              <option value="sil_ofl">SIL OFL</option>
              <option value="itf_ffl">ITF Free License</option>
            </select>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[var(--color-border)]">
              <span className="text-[11px] font-mono text-[var(--color-muted)]">{fontSize}px</span>
              <input
                type="range"
                min={18}
                max={64}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                aria-label="Font preview size"
                className="fs-range w-20"
              />
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--color-border)]">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort fonts"
                className="bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)] outline-none cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FONTSHARE BIG NUMBER & VIEW TOGGLE BAR */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 pt-2">
        <div className="flex items-baseline gap-4">
          <span className="font-display font-black text-4xl sm:text-5xl tracking-tighter text-[var(--color-text)]">
            {filtered.length}
          </span>
          <span className="text-xs font-mono text-[var(--color-muted)]">
            families available
          </span>
          {filtered.length < fonts.length && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-mono text-[var(--color-text)] underline cursor-pointer"
            >
              (Reset filters)
            </button>
          )}
        </div>

        {/* View Mode & Bulk Selection Helpers */}
        <div className="flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => {
              if (allShownSelected) {
                const shownSet = new Set(shownSlugs);
                const remaining = slugs.filter((s) => !shownSet.has(s));
                selectAll(remaining);
              } else {
                selectSlugs(shownSlugs);
              }
            }}
            className="text-[var(--color-muted)] hover:text-[var(--color-text)] underline underline-offset-4 cursor-pointer font-mono"
          >
            {allShownSelected
              ? `Unselect ${shownSlugs.length} shown`
              : `Select all ${shownSlugs.length} shown`}
          </button>

          <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-4 font-mono">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`cursor-pointer transition-colors ${
                viewMode === "table"
                  ? "font-bold text-[var(--color-text)] underline underline-offset-4"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              List view
            </button>
            <span className="text-[var(--color-dim)]">/</span>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`cursor-pointer transition-colors ${
                viewMode === "grid"
                  ? "font-bold text-[var(--color-text)] underline underline-offset-4"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Grid view
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN LIST / GRID CONTENT */}
      {filtered.length === 0 ? (
        <div className="border border-[var(--color-border)] p-12 text-center bg-[var(--color-panel)]">
          <p className="text-base text-[var(--color-muted)] mb-3">
            No fonts match your current search and filter settings.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="btn-outline px-4 py-2 text-xs uppercase tracking-wider font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ======================== TABLE VIEW ======================== */
        <div className="border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-muted)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allShownSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someShownSelected;
                      }}
                      onChange={() => {
                        if (allShownSelected) {
                          const shownSet = new Set(shownSlugs);
                          selectAll(slugs.filter((s) => !shownSet.has(s)));
                        } else {
                          selectSlugs(shownSlugs);
                        }
                      }}
                      className="w-4 h-4 accent-[var(--color-text)] cursor-pointer"
                      aria-label="Select all filtered fonts"
                    />
                  </th>
                  <th className="py-3 px-4 min-w-44">Family</th>
                  <th className="py-3 px-4 min-w-64">Sample Specimen</th>
                  <th className="py-3 px-4 min-w-28">Category</th>
                  <th className="py-3 px-4 min-w-24">Styles</th>
                  <th className="py-3 px-4 min-w-24">License</th>
                  <th className="py-3 px-4 text-right min-w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((font) => {
                  const isSelected = has(font.slug);
                  const weights = weightsOf(font);
                  const midWeight = weights[Math.floor(weights.length / 2)] ?? 400;
                  const displaySample = previewText.trim() || font.name;

                  return (
                    <tr
                      key={font.slug}
                      onClick={() => toggle(font.slug)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[var(--color-panel)] font-medium shadow-[inset_3px_0_0_var(--color-text)]"
                          : "hover:bg-[var(--color-card-hover)]"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <LazyFontLink href={cssUrl(font)} />
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(font.slug)}
                          className="w-4 h-4 accent-[var(--color-text)] cursor-pointer"
                          aria-label={`Toggle ${font.name}`}
                        />
                      </td>

                      {/* Family Name & Designer */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-base text-[var(--color-text)]">
                            {font.name}
                          </span>
                          <span className="text-[11px] text-[var(--color-muted)] truncate max-w-40">
                            {font.designers.join(", ") || "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* Live Font Specimen (Big & Crisp) */}
                      <td className="py-3 px-4">
                        <p
                          className="truncate max-w-md text-[var(--color-text)] opacity-95 leading-normal"
                          style={{
                            fontFamily: `'${font.name}', sans-serif`,
                            fontSize: `${fontSize}px`,
                            fontWeight: midWeight,
                          }}
                        >
                          {displaySample}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-[var(--color-muted)]">
                          {font.category}
                        </span>
                      </td>

                      {/* Styles & Features */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="badge-tag font-mono text-[10px]">
                            {font.styles.length} styles
                          </span>
                          {isVariable(font) && (
                            <span className="badge-solid text-[9px]">
                              VAR
                            </span>
                          )}
                        </div>
                      </td>

                      {/* License */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-[var(--color-muted)]">
                          {licenseLabel(font.license)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectingFont(font)}
                            className="btn-outline px-2.5 py-1 text-[11px] cursor-pointer"
                            title="Inspect styles and character specimen"
                          >
                            Inspect
                          </button>
                          <a
                            href={downloadUrl(font.slug)}
                            download={`${font.slug}.zip`}
                            className="btn-solid px-3 py-1 text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer"
                            title={`Download ${font.name} ZIP`}
                          >
                            <span>.ZIP</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================== GRID VIEW ======================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((font) => {
            const isSelected = has(font.slug);
            const weights = weightsOf(font);
            const midWeight = weights[Math.floor(weights.length / 2)] ?? 400;
            const displaySample = previewText.trim() || font.name;

            return (
              <article
                key={font.slug}
                onClick={() => toggle(font.slug)}
                className={`border border-[var(--color-border)] bg-[var(--color-card)] p-6 flex flex-col justify-between cursor-pointer transition-all hover:border-[var(--color-text)] ${
                  isSelected
                    ? "shadow-[inset_0_0_0_1.5px_var(--color-text)] bg-[var(--color-panel)]"
                    : ""
                }`}
              >
                <LazyFontLink href={cssUrl(font)} />
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(font.slug)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-[var(--color-text)] cursor-pointer"
                      aria-label={`Toggle ${font.name}`}
                    />
                    <div>
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)] leading-tight">
                        {font.name}
                      </h2>
                      <span className="text-[11px] text-[var(--color-muted)]">
                        {font.category} {"\u00B7"} {font.styles.length} styles
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isVariable(font) && (
                      <span className="badge-solid text-[9px]">VAR</span>
                    )}
                    <span className="text-[10px] font-mono text-[var(--color-muted)] border border-[var(--color-border)] px-1.5 py-0.5">
                      {licenseLabel(font.license)}
                    </span>
                  </div>
                </div>

                {/* Big Specimen Preview (Fontshare Style) */}
                <div className="py-8 min-h-32 flex items-center">
                  <p
                    className="truncate w-full text-[var(--color-text)] leading-tight tracking-tight"
                    style={{
                      fontFamily: `'${font.name}', sans-serif`,
                      fontSize: `${Math.max(fontSize, 40)}px`,
                      fontWeight: midWeight,
                    }}
                  >
                    {displaySample}
                  </p>
                </div>

                {/* Card Footer */}
                <div
                  className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-[var(--color-dim)] truncate max-w-36">
                    by {font.designers[0] || "Unknown"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingFont(font)}
                      className="btn-outline px-2.5 py-1 text-[11px] cursor-pointer"
                    >
                      Inspect
                    </button>
                    <a
                      href={downloadUrl(font.slug)}
                      download={`${font.slug}.zip`}
                      className="btn-solid px-3 py-1 text-[11px] uppercase tracking-wider font-bold cursor-pointer"
                    >
                      .ZIP
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 5. QUICK SPECIMEN DRAWER */}
      <QuickSpecimenDrawer
        font={inspectingFont}
        onClose={() => setInspectingFont(null)}
      />
    </div>
  );
}
