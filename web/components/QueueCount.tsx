"use client";

import { useQueue } from "../lib/queue";

export default function QueueCount() {
  const { slugs, downloadAll, isDownloading } = useQueue();

  if (slugs.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] font-mono">
        <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
        <span>0 queued</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => downloadAll()}
      disabled={isDownloading}
      className="flex items-center gap-2 px-2.5 py-1 bg-[var(--color-text)] text-[var(--color-bg)] text-xs font-bold font-mono transition-transform hover:scale-105 border border-[var(--color-border)] cursor-pointer"
      title="Click to download queued fonts"
    >
      <span className="w-2 h-2 rounded-full bg-[var(--color-bg)] animate-pulse" />
      <span>{slugs.length} queued</span>
    </button>
  );
}
