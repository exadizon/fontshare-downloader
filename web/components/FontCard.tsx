"use client";

import Link from "next/link";
import { cssUrl, weightsOf, type CatalogFont } from "../lib/fonts";
import { useQueue } from "../lib/queue";
import LazyFontCss from "./LazyFontCss";

export default function FontCard({ font, preview }: { font: CatalogFont; preview: string }) {
  const { toggle, has } = useQueue();
  const selected = has(font.slug);
  const weights = weightsOf(font);
  const mid = weights[Math.floor(weights.length / 2)] ?? 400;

  return (
    <LazyFontCss href={cssUrl(font)}>
      <article
        className={`rule-t pt-4 pb-5 flex flex-col gap-3 bg-[var(--color-card)] px-4 transition-shadow ${
          selected ? "shadow-[inset_0_0_0_2px_var(--color-ink)]" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-lg leading-tight truncate">
              <Link href={`/${font.slug}`} className="hover:underline underline-offset-4">
                {font.name}
              </Link>
            </h2>
            <p className="micro text-[var(--color-smoke)] mt-1">
              {font.category} - {weights.length} weight{weights.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggle(font.slug)}
            aria-pressed={selected}
            aria-label={selected ? `Remove ${font.name} from queue` : `Add ${font.name} to queue`}
            className={`shrink-0 w-7 h-7 border border-[var(--color-ink)] text-lg leading-none ${
              selected ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : ""
            }`}
          >
            {selected ? "✓" : "+"}
          </button>
        </div>
        <Link href={`/${font.slug}`} aria-label={`Open ${font.name} details`} className="block">
          <p
            className="preview-line text-4xl leading-snug"
            style={{ fontFamily: `'${font.name}', sans-serif`, fontWeight: mid }}
          >
            {preview || font.name}
          </p>
        </Link>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-[var(--color-smoke)] truncate">
            {(font.designers[0] ?? "Unknown designer").slice(0, 28)}
          </span>
          <Link
            href={`/${font.slug}`}
            className="shrink-0 font-semibold hover:underline underline-offset-4"
          >
            Details
          </Link>
        </div>
      </article>
    </LazyFontCss>
  );
}
