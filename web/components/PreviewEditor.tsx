"use client";

import { useState } from "react";
import { hasItalic, weightsOf, type CatalogFont } from "../lib/fonts";

export default function PreviewEditor({ font }: { font: CatalogFont }) {
  const weights = weightsOf(font);
  const italic = hasItalic(font);
  const [text, setText] = useState("Pack my box with five dozen liquor jugs");
  const [size, setSize] = useState(64);
  const [weight, setWeight] = useState(weights.includes(400) ? 400 : weights[0] ?? 400);
  const [isItalic, setIsItalic] = useState(false);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 pb-6">
        <label className="flex-[2] flex items-center gap-3 border border-[var(--color-ink)] bg-[var(--color-card)] px-4 py-2.5">
          <span className="micro text-[var(--color-smoke)]">Text</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-transparent outline-none text-base"
          />
        </label>
        <label className="flex items-center gap-3 border border-[var(--color-ink)] bg-[var(--color-card)] px-4 py-2.5">
          <span className="micro text-[var(--color-smoke)]">Weight</span>
          <select
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="bg-transparent text-base outline-none"
          >
            {weights.map((w) => (
              <option key={w} value={w}>
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
            className={`micro px-4 py-2.5 border border-[var(--color-ink)] ${
              isItalic ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : ""
            }`}
          >
            Italic
          </button>
        )}
        <label className="flex items-center gap-3 border border-[var(--color-ink)] bg-[var(--color-card)] px-4 py-2.5">
          <span className="micro text-[var(--color-smoke)]">{size}px</span>
          <input
            type="range"
            min={16}
            max={160}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            aria-label="Preview size"
            className="w-28 accent-[#16130e]"
          />
        </label>
      </div>
      <p
        className="break-words leading-tight"
        style={{
          fontFamily: `'${font.name}', sans-serif`,
          fontSize: `${size}px`,
          fontWeight: weight,
          fontStyle: isItalic ? "italic" : "normal",
        }}
      >
        {text || font.name}
      </p>
      <div className="pt-6 flex flex-wrap gap-x-8 gap-y-2">
        {weights.map((w) => (
          <p key={w} style={{ fontFamily: `'${font.name}', sans-serif`, fontWeight: w }} className="text-xl">
            {font.name} {w}
          </p>
        ))}
      </div>
    </div>
  );
}
