"use client";

import { downloadUrl } from "../../lib/fonts";
import { useQueue } from "../../lib/queue";

export default function DetailActions({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const { toggle, has } = useQueue();
  const selected = has(slug);

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={downloadUrl(slug)}
        download={`${slug}.zip`}
        className="btn-solid px-6 py-3 text-xs uppercase tracking-wider font-extrabold flex items-center gap-2 cursor-pointer shadow-md"
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
        <span>Download {name} (.zip)</span>
      </a>
      <button
        type="button"
        onClick={() => toggle(slug)}
        aria-pressed={selected}
        className={`px-6 py-3 text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 cursor-pointer ${
          selected
            ? "bg-[var(--color-text)] text-[var(--color-bg)] border border-[var(--color-border)]"
            : "btn-outline"
        }`}
      >
        <span>{selected ? "[x] In Bulk Queue" : "+ Add to Bulk Queue"}</span>
      </button>
    </div>
  );
}
