"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  categoriesOf,
  cssUrl,
  displayWeightOf,
  downloadUrl,
  hasItalic,
  isVariable,
  licenseLabel,
  sortFonts,
  SORTS,
  type CatalogFont,
  type SortKey,
} from "../lib/fonts";
import { useQueue } from "../lib/queue";
import LazyFontLink from "./LazyFontCss";
import QuickSpecimenDrawer from "./QuickSpecimenDrawer";

const PRESET_TEXTS = [
  { label: "Names", text: "" },
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
  const [fontSize, setFontSize] = useState(88);
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

  // Preset Selection Handlers
  const selectAllCatalog = () => selectAll(fonts.map((f) => f.slug));
  const countOf = (predicate: (f: CatalogFont) => boolean) =>
    fonts.filter(predicate).length;
  const sansCount = countOf((f) => f.category.toLowerCase().includes("sans"));
  const serifCount = countOf((f) => f.category.toLowerCase().includes("serif"));
  const displayCount = countOf((f) => f.category.toLowerCase().includes("display"));
  const variableCount = countOf((f) => isVariable(f));
  const trendingCount = countOf((f) => f.is_top || f.is_hot || f.views_recent > 500);
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

  const quickSelectChips = [
    { label: "All 100", onClick: selectAllCatalog },
    { label: `Sans (${sansCount})`, onClick: selectAllSans },
    { label: `Serif (${serifCount})`, onClick: selectAllSerif },
    { label: `Display (${displayCount})`, onClick: selectAllDisplay },
    { label: `Variable (${variableCount})`, onClick: selectAllVariable },
    { label: `Trending (${trendingCount})`, onClick: selectAllTop },
  ];

  return (
    <div className="space-y-0">
      {/* 1. INTRO BAND - quiet Fontshare-style statement, bulk actions right */}
      <section className="pt-10 md:pt-14 pb-9 border-b border-[var(--color-border)]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl min-w-0">
            <h1 className="hero-enter hero-enter-1 font-display font-black text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.95] text-[var(--color-text)]">
              Quality fonts. Free. In bulk.
            </h1>
            <p className="hero-enter hero-enter-2 mt-4 text-sm md:text-base text-[var(--color-muted)] leading-relaxed max-w-xl">
              Every family from the Indian Type Foundry catalog, free for
              commercial use. Select what you need and download the ZIPs in one click.
            </p>
          </div>

          {/* Direct 1-Click Catalog Download */}
          <div className="hero-enter hero-enter-3 flex flex-col gap-2.5 lg:items-end shrink-0">
            <button
              type="button"
              onClick={() => downloadAll(fonts.map((f) => f.slug))}
              disabled={isDownloading}
              className="btn-solid px-7 py-4 text-xs font-extrabold flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download full catalog</span>
            </button>
            <p className="text-[11px] text-[var(--color-muted)] font-mono">
              100 ZIPs, ~1.2 GB {"\u00B7"} ITF FFL / SIL OFL
            </p>
          </div>
        </div>

        {/* Quick batch presets bar */}
        <div className="hero-enter hero-enter-4 mt-9 flex flex-wrap items-center gap-2">
          <span className="micro-label text-[var(--color-muted)] mr-2">Quick select</span>
          {quickSelectChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onClick}
              className="text-xs font-mono px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-text)] text-[var(--color-text)] transition-colors cursor-pointer"
            >
              + {chip.label}
            </button>
          ))}
          {slugs.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-xs font-mono px-3 py-1.5 text-[var(--color-muted)] hover:text-[var(--color-text)] underline underline-offset-4 ml-auto cursor-pointer transition-colors"
            >
              Clear selection ({slugs.length})
            </button>
          )}
        </div>
      </section>

      {/* 2. CONTROL BAND - two hairline rows, Fontshare style */}
      <div className="border-b border-[var(--color-border)]">
        {/* Row 1: search, categories, specimen size */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-0 py-4 border-b border-[var(--color-border-subtle)]">
          {/* Search */}
          <div className="flex flex-1 items-center gap-3 min-w-0 lg:pr-6">
            <svg width="16" height="16" className="w-4 h-4 shrink-0 text-[var(--color-dim)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by family, designer or tag..."
              aria-label="Search fonts"
              className="bg-transparent w-full outline-none text-sm text-[var(--color-text)] placeholder-[var(--color-dim)] font-sans"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer transition-colors"
              >
                {"\u2715"}
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 lg:pl-6 lg:border-l lg:border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setCategory("All")}
              className={`text-xs px-3 py-1.5 transition-colors cursor-pointer ${
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
                className={`text-xs px-3 py-1.5 transition-colors cursor-pointer ${
                  category === c
                    ? "bg-[var(--color-text)] text-[var(--color-bg)] font-bold"
                    : "border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Specimen size */}
          <div className="hidden md:flex items-center gap-3 lg:pl-6 lg:border-l lg:border-[var(--color-border)] shrink-0">
            <span className="text-xs font-mono text-[var(--color-text)] w-12 text-right">
              {fontSize}px
            </span>
            <input
              type="range"
              min={32}
              max={140}
              step={4}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              aria-label="Font preview size"
              className="fs-range w-24 lg:w-28"
            />
          </div>
        </div>

        {/* Row 2: your text, properties, sort */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-0 py-4">
          {/* Custom specimen input */}
          <div className="flex flex-1 items-center gap-3 min-w-0 xl:pr-6">
            <svg width="16" height="16" className="w-4 h-4 shrink-0 text-[var(--color-dim)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 4.5l4 4L8 20l-5 1 1-5L15.5 4.5z" />
            </svg>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Your text across every specimen..."
              aria-label="Custom specimen text"
              className="bg-transparent flex-1 min-w-0 outline-none text-sm text-[var(--color-text)] placeholder-[var(--color-dim)] font-sans"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              {PRESET_TEXTS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPreviewText(p.text)}
                  className={`hidden lg:inline-block text-[11px] px-2 py-1 cursor-pointer whitespace-nowrap transition-colors border ${
                    (previewText === p.text && p.text) || (p.label === "Names" && !previewText)
                      ? "border-[var(--color-text)] text-[var(--color-text)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Properties + sort */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs xl:pl-6 xl:border-l xl:border-[var(--color-border)]">
            <label className="flex items-center gap-1.5 cursor-pointer text-[var(--color-muted)] hover:text-[var(--color-text)] select-none transition-colors">
              <input
                type="checkbox"
                checked={variableOnly}
                onChange={(e) => setVariableOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[var(--color-text)]"
              />
              <span>Variable</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[var(--color-muted)] hover:text-[var(--color-text)] select-none transition-colors">
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
              className="bg-transparent border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)] outline-none cursor-pointer"
            >
              <option value="All">All licenses</option>
              <option value="sil_ofl">SIL OFL</option>
              <option value="itf_ffl">ITF FFL</option>
            </select>

            <div className="flex items-center gap-2 text-[var(--color-muted)]">
              <span>Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort fonts"
                className="bg-transparent border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)] outline-none cursor-pointer"
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

      {/* 3. COUNT ROW - big number, view toggle, bulk helpers */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 py-6">
        <div className="flex items-baseline gap-3">
          <span className="font-display font-black text-4xl sm:text-5xl tracking-tighter text-[var(--color-text)]">
            {filtered.length}
          </span>
          <span className="text-xs font-mono text-[var(--color-muted)]">
            {filtered.length === 1 ? "family" : "families"}
          </span>
          {filtered.length < fonts.length && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-mono text-[var(--color-text)] underline underline-offset-4 cursor-pointer"
            >
              (Reset filters)
            </button>
          )}
        </div>

        {/* View mode & bulk selection helpers */}
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
            className="text-[var(--color-muted)] hover:text-[var(--color-text)] underline underline-offset-4 cursor-pointer font-mono transition-colors"
          >
            {allShownSelected
              ? `Unselect ${shownSlugs.length} shown`
              : `Select all ${shownSlugs.length} shown`}
          </button>

          <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-4">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-pressed={viewMode === "table"}
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
              aria-pressed={viewMode === "grid"}
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

      {/* 4. FONT LIST - Fontshare specimen cards */}
      {filtered.length === 0 ? (
        <div className="border border-[var(--color-border)] p-12 text-center bg-[var(--color-panel)]">
          <p className="text-base text-[var(--color-muted)] mb-3">
            No fonts match your current search and filter settings.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="btn-outline px-4 py-2 text-xs font-bold cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ======================== LIST VIEW (specimen cards) ======================== */
        <div className="border border-[var(--color-border)] bg-[var(--color-card)]">
          {filtered.map((font) => {
            const isSelected = has(font.slug);
            const displayWeight = displayWeightOf(font);
            const displaySample = previewText.trim() || font.name;

            return (
              <article
                key={font.slug}
                onClick={() => toggle(font.slug)}
                className={`relative border-b border-[var(--color-border)] last:border-b-0 px-5 md:px-8 py-5 md:py-6 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[var(--color-panel)]"
                    : "hover:bg-[var(--color-card-hover)]"
                }`}
              >
                <LazyFontLink href={cssUrl(font)} />
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 inset-y-0 w-[3px] bg-[var(--color-text)]"
                  />
                )}

                {/* Meta row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(font.slug)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-[var(--color-text)] cursor-pointer"
                      aria-label={`Toggle ${font.name}`}
                    />
                    <h2 className="font-display font-bold text-base md:text-lg tracking-tight truncate text-[var(--color-text)]">
                      {font.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3.5 text-[11px] font-mono text-[var(--color-muted)] shrink-0">
                    <span className="hidden sm:inline">{font.category}</span>
                    <span>{font.styles.length} styles</span>
                    {isVariable(font) && (
                      <span className="badge-solid text-[9px]">VAR</span>
                    )}
                    <span className="hidden md:inline">{licenseLabel(font.license)}</span>
                  </div>
                </div>

                {/* Giant specimen */}
                <div className="py-7 md:py-9 min-w-0">
                  <p
                    className="truncate leading-none tracking-tight text-[var(--color-text)]"
                    style={{
                      fontFamily: `'${font.name}', sans-serif`,
                      fontSize: `${fontSize}px`,
                      fontWeight: displayWeight,
                    }}
                  >
                    {displaySample}
                  </p>
                </div>

                {/* Card footer */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs text-[var(--color-muted)] truncate max-w-64">
                    Designed by {font.designers.join(", ") || "Unknown"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingFont(font)}
                      className="btn-outline px-3 py-1.5 text-[11px] cursor-pointer"
                      title="Inspect styles and character specimen"
                    >
                      Inspect
                    </button>
                    <a
                      href={downloadUrl(font.slug)}
                      download={`${font.slug}.zip`}
                      className="btn-solid px-3 py-1.5 text-[11px] font-bold cursor-pointer"
                      title={`Download ${font.name} ZIP`}
                    >
                      .ZIP
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* ======================== GRID VIEW ======================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((font) => {
            const isSelected = has(font.slug);
            const displayWeight = displayWeightOf(font);
            const displaySample = previewText.trim() || font.name;

            return (
              <article
                key={font.slug}
                onClick={() => toggle(font.slug)}
                className={`border border-[var(--color-border)] bg-[var(--color-card)] px-6 pt-5 pb-4 flex flex-col cursor-pointer transition-[background-color,border-color,transform] hover:border-[var(--color-text)] hover:-translate-y-0.5 ${
                  isSelected
                    ? "shadow-[inset_0_0_0_1.5px_var(--color-text)] bg-[var(--color-panel)]"
                    : ""
                }`}
              >
                <LazyFontLink href={cssUrl(font)} />
                {/* Card header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(font.slug)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-[var(--color-text)] cursor-pointer"
                      aria-label={`Toggle ${font.name}`}
                    />
                    <div className="min-w-0">
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)] leading-tight truncate">
                        {font.name}
                      </h2>
                      <span className="text-[11px] text-[var(--color-muted)]">
                        {font.category} {"\u00B7"} {font.styles.length} styles
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isVariable(font) && (
                      <span className="badge-solid text-[9px]">VAR</span>
                    )}
                    <span className="text-[10px] font-mono text-[var(--color-muted)] border border-[var(--color-border)] px-1.5 py-0.5">
                      {licenseLabel(font.license)}
                    </span>
                  </div>
                </div>

                {/* Big specimen preview */}
                <div className="py-8 min-h-36 min-w-0 flex items-center">
                  <p
                    className="truncate w-full leading-tight tracking-tight text-[var(--color-text)]"
                    style={{
                      fontFamily: `'${font.name}', sans-serif`,
                      fontSize: `${Math.max(fontSize, 48)}px`,
                      fontWeight: displayWeight,
                    }}
                  >
                    {displaySample}
                  </p>
                </div>

                {/* Card footer */}
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
                      className="btn-solid px-3 py-1 text-[11px] font-bold cursor-pointer"
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
