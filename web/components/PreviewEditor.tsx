"use client";

import { useState } from "react";
import { hasItalic, weightsOf, type CatalogFont } from "../lib/fonts";

export default function PreviewEditor({ font }: { font: CatalogFont }) {
  const weights = weightsOf(font);
  const italic = hasItalic(font);
  const [text, setText] = useState("Pack my box with five dozen liquor jugs");
  const [size, setSize] = useState(56);
  const [weight, setWeight] = useState(weights.includes(400) ? 400 : weights[0] ?? 400);
  const [isItalic, setIsItalic] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3">
        <label className="flex-[2] flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2.5 focus-within:border-[var(--color-text)] transition-colors">
          <span className="micro-label text-[var(--color-muted)]">Text</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text)]"
          />
        </label>
        <label className="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2.5">
          <span className="micro-label text-[var(--color-muted)]">Weight</span>
          <select
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="bg-transparent text-sm outline-none text-[var(--color-text)] cursor-pointer font-mono"
          >
            {weights.map((w) => (
              <option key={w} value={w} className="bg-[var(--color-card)] text-[var(--color-text)]">
                {w}
              </option>
            ))}
          </select>
        </label>
        {italic && (
          <button
            type="button"
            onClick={() => setIsItalic((v) => !v)}
            aria-pressed={isItalic}
            className={`text-xs px-4 py-2.5 border transition-all uppercase font-semibold tracking-wider cursor-pointer ${
              isItalic
                ? "bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-border)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Italic
          </button>
        )}
        <label className="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2.5">
          <span className="micro-label text-[var(--color-muted)] font-mono">{size}px</span>
          <input
            type="range"
            min={16}
            max={140}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            aria-label="Preview size"
            className="fs-range w-28"
          />
        </label>
      </div>

      <div className="p-8 bg-[var(--color-panel)] border border-[var(--color-border)] min-h-48 flex items-center">
        <p
          className="break-words leading-tight text-[var(--color-text)] w-full"
          style={{
            fontFamily: `'${font.name}', sans-serif`,
            fontSize: `${size}px`,
            fontWeight: weight,
            fontStyle: isItalic ? "italic" : "normal",
          }}
        >
          {text || font.name}
        </p>
      </div>

      <div className="pt-4 flex flex-wrap gap-x-8 gap-y-4">
        {weights.map((w) => (
          <div key={w} className="border-b border-[var(--color-border)] pb-2 min-w-48">
            <span className="micro-label text-[var(--color-muted)] font-mono block mb-1">
              Weight {w}
            </span>
            <p
              style={{ fontFamily: `'${font.name}', sans-serif`, fontWeight: w }}
              className="text-xl text-[var(--color-text)]"
            >
              {font.name} {w}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
