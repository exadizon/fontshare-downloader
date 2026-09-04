"use client";

import { useQueue } from "../lib/queue";

export default function BulkBar() {
  const { slugs, clear, downloadAll, downloadScript } = useQueue();
  if (slugs.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[var(--color-cream)] text-[var(--color-coal)]">
      <div className="mx-auto max-w-7xl px-5 py-3 flex flex-wrap items-center gap-3">
        <p className="font-semibold text-sm">
          {slugs.length} famil{slugs.length === 1 ? "y" : "ies"} queued
        </p>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => downloadScript("sh")}
          className="micro underline underline-offset-4 opacity-70 hover:opacity-100"
        >
          .sh script
        </button>
        <button
          type="button"
          onClick={() => downloadScript("bat")}
          className="micro underline underline-offset-4 opacity-70 hover:opacity-100"
        >
          .bat script
        </button>
        <button
          type="button"
          onClick={clear}
          className="micro underline underline-offset-4 opacity-70 hover:opacity-100"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={downloadAll}
          className="bg-[var(--color-coal)] text-[var(--color-cream)] font-semibold text-sm px-5 py-2 hover:opacity-90"
        >
          Download all ({slugs.length})
        </button>
      </div>
    </div>
  );
}
