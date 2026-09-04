"use client";

import { downloadUrl } from "../../lib/fonts";
import { useQueue } from "../../lib/queue";

export default function DetailActions({ slug, name }: { slug: string; name: string }) {
  const { toggle, has } = useQueue();
  const selected = has(slug);

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={downloadUrl(slug)}
        download={`${slug}.zip`}
        className="btn-ink px-6 py-3 text-sm"
      >
        Download {name} (.zip)
      </a>
      <button
        type="button"
        onClick={() => toggle(slug)}
        aria-pressed={selected}
        className="btn-line px-6 py-3 text-sm"
      >
        {selected ? "Remove from queue" : "Add to bulk queue"}
      </button>
    </div>
  );
}
