"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { downloadUrl } from "./fonts";

interface QueueContextValue {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  clear: () => void;
  selectAll: (slugs: string[]) => void;
  downloadAll: () => void;
  scriptText: (kind: "bat" | "sh") => string;
  downloadScript: (kind: "bat" | "sh") => void;
}

const QueueContext = createContext<QueueContextValue | null>(null);

/** Staggered anchor clicks: browsers throttle parallel downloads, so space them out. */
function triggerDownload(slug: string) {
  const a = document.createElement("a");
  a.href = downloadUrl(slug);
  a.download = `${slug}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const clear = useCallback(() => setSlugs([]), []);
  const selectAll = useCallback((next: string[]) => setSlugs(next), []);

  const downloadAll = useCallback(() => {
    slugs.forEach((slug, i) => {
      window.setTimeout(() => triggerDownload(slug), i * 600);
    });
  }, [slugs]);

  const scriptText = useCallback(
    (kind: "bat" | "sh") => {
      if (kind === "bat") {
        const lines = slugs.map(
          (s) => `curl -L -o "${s}.zip" "${downloadUrl(s)}"`
        );
        return `@echo off\r\nREM Fontshare bulk download (${slugs.length} families)\r\n` + lines.join("\r\n") + "\r\n";
      }
      const lines = slugs.map((s) => `curl -L -o "${s}.zip" "${downloadUrl(s)}"`);
      return `#!/bin/sh\n# Fontshare bulk download (${slugs.length} families)\n` + lines.join("\n") + "\n";
    },
    [slugs]
  );

  const downloadScript = useCallback(
    (kind: "bat" | "sh") => {
      const blob = new Blob([scriptText(kind)], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = kind === "bat" ? "download-fonts.bat" : "download-fonts.sh";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    [scriptText]
  );

  const value = useMemo(
    () => ({ slugs, toggle, has, clear, selectAll, downloadAll, scriptText, downloadScript }),
    [slugs, toggle, has, clear, selectAll, downloadAll, scriptText, downloadScript]
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueue(): QueueContextValue {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueue must be used inside QueueProvider");
  return ctx;
}
