"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  categoriesOf,
  CITIES,
  cssUrl,
  EXCERPT,
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

type ContentMode = "names" | "excerpts" | "cities";
type QuickFilter = "all" | "top" | "hot" | "variable";

function previewFor(font: CatalogFont, mode: ContentMode, text: string, index: number): string {
  if (mode === "names") return font.name;
  if (mode === "cities") return CITIES[index % CITIES.length];
  return text.trim() || EXCERPT;
}

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
  const [mode, setMode] = useState<ContentMode>("excerpts");
  const [sizePx, setSizePx] = useState(120);
  const [lightCards, setLightCards] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const { slugs, toggle, selectAll } = useQueue();

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
      {/* Toolbar row 1: search, dropdowns, size slider */}
      <div className="rule-b flex flex-wrap items-center gap-x-10 gap-y-3 py-3">
        <label className="flex items-center gap-2 flex-1 min-w-44 text-sm">
          <span aria-hidden="true" className="dim">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
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
        <div className="flex items-center gap-4 ml-auto">
          <span className="text-sm font-semibold tabular-nums">{sizePx}px</span>
          <input
            type="range"
            min={24}
            max={240}
            value={sizePx}
            onChange={(e) => setSizePx(Number(e.target.value))}
            aria-label="Preview size"
            className="twin-range w-40 md:w-56"
          />
        </div>
      </div>

      {/* Toolbar row 2: your text, content toggle, contrast, reset */}
      <div className="rule-b flex flex-wrap items-center gap-x-8 gap-y-3 py-3">
        <label className="flex items-center gap-2 flex-[2] min-w-52 text-sm">
          <span aria-hidden="true" className="dim">✎</span>
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Your Text"
            aria-label="Custom preview text"
            className="twin-input w-full"
          />
        </label>
        <div className="flex items-center gap-5 text-sm mx-auto" role="group" aria-label="Preview content">
          {(["cities", "excerpts", "names"] as ContentMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={mode === m ? "font-semibold" : "dim"}
            >
              {m === "cities" ? "Cities" : m === "excerpts" ? "Excerpts" : "Names"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLightCards((v) => !v)}
          aria-pressed={lightCards}
          aria-label="Toggle preview contrast"
          className="flex items-center gap-2"
        >
          <span
            aria-hidden="true"
            className={`w-4 h-4 rounded-full border border-[var(--color-cream)] ${
              lightCards ? "bg-[var(--color-cream)]" : "bg-transparent"
            }`}
            style={
              lightCards
                ? undefined
                : { background: "linear-gradient(90deg, var(--color-cream) 50%, transparent 50%)" }
            }
          />
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
        <div className="flex flex-col">
          {filtered.map((font, i) => (
            <FontRow
              key={font.slug}
              font={font}
              index={i}
              preview={previewFor(font, mode, customText, i)}
              sizePx={sizePx}
              light={lightCards}
              selected={slugs.includes(font.slug)}
              onToggle={() => toggle(font.slug)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((font, i) => (
            <GridCard
              key={font.slug}
              font={font}
              preview={previewFor(font, mode, customText, i)}
              light={lightCards}
              selected={slugs.includes(font.slug)}
              onToggle={() => toggle(font.slug)}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="pt-6 flex justify-end">
          <button
            type="button"
            onClick={() => selectAll(filtered.map((f) => f.slug))}
            className="text-sm underline underline-offset-4 dim hover:text-[var(--color-cream)]"
          >
            Queue all {filtered.length} shown
          </button>
        </div>
      )}
    </div>
  );
}

function MetaHead({ font, light }: { font: CatalogFont; light: boolean }) {
  const styles = font.styles.filter((s) => !s.is_italic).length || font.styles.length;
  return (
    <div className="flex items-start justify-between gap-3 text-[13px]">
      <Link
        href={`/${font.slug}`}
        className={`font-medium hover:underline underline-offset-4 ${light ? "" : ""}`}
      >
        {font.name} <span aria-hidden="true">↗</span>
      </Link>
      <span className={`hidden sm:inline ${light ? "opacity-70" : "dim"}`}>
        {styles} styles{isVariable(font) ? " · Variable" : ""}
      </span>
      <span className={light ? "opacity-70" : "dim"}>{font.license === "sil_ofl" ? "Open Source" : "Closed Source"}</span>
    </div>
  );
}

function FontRow({
  font,
  index,
  preview,
  sizePx,
  light,
  selected,
  onToggle,
}: {
  font: CatalogFont;
  index: number;
  preview: string;
  sizePx: number;
  light: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const weights = weightsOf(font);
  const mid = weights[Math.floor(weights.length / 2)] ?? 400;
  return (
    <LazyFontCss href={cssUrl(font)}>
      <article className={`box p-5 md:p-7 mb-5 ${light ? "bg-[var(--color-cream)] text-[var(--color-coal)]" : ""}`}>
        <MetaHead font={font} light={light} />
        <Link href={`/${font.slug}`} aria-label={`Open ${font.name} details`} className="block py-6 md:py-10">
          <p
            className="preview-line font-medium leading-[1.05]"
            style={{ fontFamily: `'${font.name}', sans-serif`, fontWeight: mid, fontSize: `min(${sizePx}px, 12vw)` }}
          >
            {preview}
          </p>
        </Link>
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className={light ? "opacity-70" : "dim"}>
            Designed by {font.designers.join(", ") || "Unknown"} {index === 0 ? "" : ""}
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            aria-label={selected ? `Remove ${font.name} from queue` : `Add ${font.name} to queue`}
            className={`w-8 h-8 border text-lg leading-none shrink-0 ${
              light ? "border-[var(--color-coal)]" : "border-[var(--color-cream)]"
            } ${selected ? (light ? "bg-[var(--color-coal)] text-[var(--color-cream)]" : "bg-[var(--color-cream)] text-[var(--color-coal)]") : ""}`}
          >
            {selected ? "✓" : "+"}
          </button>
        </div>
      </article>
    </LazyFontCss>
  );
}

function GridCard({
  font,
  preview,
  light,
  selected,
  onToggle,
}: {
  font: CatalogFont;
  preview: string;
  light: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const weights = weightsOf(font);
  const mid = weights[Math.floor(weights.length / 2)] ?? 400;
  return (
    <LazyFontCss href={cssUrl(font)}>
      <article className={`box p-5 flex flex-col gap-4 ${light ? "bg-[var(--color-cream)] text-[var(--color-coal)]" : ""}`}>
        <MetaHead font={font} light={light} />
        <Link href={`/${font.slug}`} aria-label={`Open ${font.name} details`} className="block">
          <p
            className="preview-line font-medium leading-tight text-5xl"
            style={{ fontFamily: `'${font.name}', sans-serif`, fontWeight: mid }}
          >
            {preview}
          </p>
        </Link>
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className={`truncate ${light ? "opacity-70" : "dim"}`}>
            {font.designers.join(", ") || "Unknown"}
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            aria-label={selected ? `Remove ${font.name} from queue` : `Add ${font.name} to queue`}
            className={`shrink-0 px-3 py-1 border text-sm ${
              light ? "border-[var(--color-coal)]" : "border-[var(--color-cream)]"
            } ${selected ? (light ? "bg-[var(--color-coal)] text-[var(--color-cream)]" : "bg-[var(--color-cream)] text-[var(--color-coal)]") : ""}`}
          >
            {selected ? "Queued ✓" : "Queue +"}
          </button>
        </div>
      </article>
    </LazyFontCss>
  );
}
