"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "fsb-theme";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("fsb-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("fsb-theme-change", callback);
  };
}

function getSnapshot(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* ignore */
  }
  return "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event("fsb-theme-change"));
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light parchment mode"}
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      className="h-8 px-2.5 flex items-center gap-1.5 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors text-[var(--color-text)] hover:bg-[var(--color-panel)] shrink-0 cursor-pointer text-xs font-mono"
    >
      {theme === "dark" ? (
        <>
          <svg
            width="14"
            height="14"
            style={{ width: 14, height: 14, minWidth: 14, minHeight: 14, display: "inline-block" }}
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            style={{ width: 14, height: 14, minWidth: 14, minHeight: 14, display: "inline-block" }}
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </button>
  );
}
