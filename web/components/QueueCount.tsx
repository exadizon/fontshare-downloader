"use client";

import { useQueue } from "../lib/queue";

export default function QueueCount() {
  const { slugs } = useQueue();
  if (slugs.length === 0) return null;
  return (
    <span className="micro bg-[var(--color-ink)] text-[var(--color-paper)] rounded-full px-2.5 py-1">
      {slugs.length} queued
    </span>
  );
}
