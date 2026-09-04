"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, categoriesOf, type CatalogFont } from "../lib/fonts";
import { useQueue } from "../lib/queue";
import FontCard from "./FontCard";

type SortKey = "name" | "weights" | "designer";

export default function CatalogBrowser({ fonts }: { fonts: CatalogFont[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [license, setLicense] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");
  const [preview, setPreview] = useState("The quick brown fox jumps over the lazy dog");
  const { slugs, selectAll, clear } = useQueue();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = fonts.filter((f) => {
      if (category !== "All" && !categoriesOf(f).includes(category)) return false;
      if (license !== "All" && f.license !== license) return false;
      if (!q) return true;
      const hay = `${f.name} ${f.slug} ${f.designers.join(" ")} ${f.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
    const by: Record<SortKey, (a: CatalogFont, b: CatalogFont) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      weights: (a, b) => b.styles.length - a.styles.length || a.name.localeCompare(b.name),
      designer: (a, b) =>
        (a.designers[0] ?? "").localeCompare(b.designers[0] ?? "") || a.name.localeCompare(b.name),
    };
    return [...list].sort(by[sort]);
  }, [fonts, query, category, license, sort]);

  const allSelected = filtered.length > 0 && filtered.every((f) => slugs.includes(f.slug));

  return (
    <div>
      <div className="rule-b py-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <label className="flex-1 flex items-center gap-3 border border-[var(--color-ink)] bg-[var(--color-card)] px-4 py-2.5">
            <span className="micro text-[var(--color-smoke)]">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, designer, or tag..."
              className="flex-1 bg-transparent outline-none text-base placeholder:text-[var(--color-smoke)]"
            />
          </label>
          <label className="flex items-center gap-3 border border-[var(--color-ink)] bg-[var(--color-card)] px-4 py-2.5 md:w-96">
            <span className="micro text-[var(--color-smoke)]">Preview</span>
            <input
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              placeholder="Type to preview..."
              className="flex-1 bg-transparent outline-none text-base placeholder:text-[var(--color-smoke)]"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`micro px-3 py-1.5 border border-[var(--color-ink)] ${
                category === c ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : ""
              }`}
            >
              {c}
            </button>
          ))}
          <span className="mx-1 text-[var(--color-smoke)]">|</span>
          {["All", "itf_ffl", "sil_ofl"].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLicense(l)}
              aria-pressed={license === l}
              className={`micro px-3 py-1.5 border border-[var(--color-ink)] ${
                license === l ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : ""
              }`}
            >
              {l === "All" ? "Any license" : l === "sil_ofl" ? "SIL OFL" : "ITF FFL"}
            </button>
          ))}
          <span className="mx-1 text-[var(--color-smoke)]">|</span>
          <label className="micro flex items-center gap-2">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="micro bg-transparent border border-[var(--color-ink)] px-2 py-1.5"
            >
              <option value="name">Name</option>
              <option value="weights">Weights</option>
              <option value="designer">Designer</option>
            </select>
          </label>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => (allSelected ? clear() : selectAll(filtered.map((f) => f.slug)))}
            className="micro underline underline-offset-4"
          >
            {allSelected ? "Clear selection" : `Select all ${filtered.length} shown`}
          </button>
        </div>
      </div>

      <p className="micro text-[var(--color-smoke)] py-4" role="status" aria-live="polite">
        Showing {filtered.length} of {fonts.length} families
      </p>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-lg text-[var(--color-smoke)]">
          No families match. Try a different search or filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
          {filtered.map((font) => (
            <FontCard key={font.slug} font={font} preview={preview} />
          ))}
        </div>
      )}
    </div>
  );
}
