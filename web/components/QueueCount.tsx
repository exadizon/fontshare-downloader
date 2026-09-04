"use client";

import { useQueue } from "../lib/queue";

export default function QueueCount() {
  const { slugs } = useQueue();
  if (slugs.length === 0) {
    return <span className="text-sm dim">No styles selected</span>;
  }
  return (
    <span className="text-sm">
      {slugs.length} famil{slugs.length === 1 ? "y" : "ies"} queued
    </span>
  );
}
