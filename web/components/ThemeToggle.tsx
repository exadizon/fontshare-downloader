"use client";

import { useState } from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "fsb-theme";

function apply(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export default function ThemeToggle() {
  // The blocking script in <head> already painted the saved theme, so the
  // initializer just mirrors the DOM instead of syncing in an effect.
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark"
  );

  const flip = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-pressed={theme === "light"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className="w-8 h-8 flex items-center justify-center hover:opacity-70"
    >
      <span
        aria-hidden="true"
        className="w-4 h-4 rounded-full border border-[var(--color-cream)]"
        style={
          theme === "dark"
            ? { background: "linear-gradient(90deg, var(--color-cream) 50%, transparent 50%)" }
            : { background: "var(--color-cream)" }
        }
      />
    </button>
  );
}
