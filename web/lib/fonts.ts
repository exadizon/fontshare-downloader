import catalog from "./fonts.min.json";

export interface FontStyle {
  weight_number: number;
  weight_name: string;
  is_italic: boolean;
  is_variable: boolean;
}

export interface CatalogFont {
  slug: string;
  name: string;
  category: string;
  designers: string[];
  tags: string[];
  styles: FontStyle[];
  license: string;
}

interface Catalog {
  synced_at: string;
  count_total: number;
  fonts: CatalogFont[];
}

const data = catalog as Catalog;

export const FONTS: CatalogFont[] = data.fonts;
export const SYNCED_AT = data.synced_at;
export const COUNT_TOTAL = data.count_total;

/** Split "Serif, Display" style categories into atomic values. */
export function categoriesOf(font: CatalogFont): string[] {
  return font.category
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

const seen = new Set<string>();
for (const font of FONTS) {
  for (const c of categoriesOf(font)) seen.add(c);
}
export const CATEGORIES: string[] = [...seen].sort();

/** Distinct upright weights, ascending. Drives preview controls + CSS URLs. */
export function weightsOf(font: CatalogFont): number[] {
  const weights = new Set<number>();
  for (const s of font.styles) {
    if (!s.is_italic) weights.add(s.weight_number);
  }
  if (weights.size === 0) {
    for (const s of font.styles) weights.add(s.weight_number);
  }
  return [...weights].sort((a, b) => a - b);
}

export function hasItalic(font: CatalogFont): boolean {
  return font.styles.some((s) => s.is_italic);
}

export function isVariable(font: CatalogFont): boolean {
  return font.styles.some((s) => s.is_variable);
}

const CSS_API = "https://api.fontshare.com/v2/css";

/** Live preview stylesheet for one family. Weights default to a light spread. */
export function cssUrl(font: CatalogFont, weights?: number[]): string {
  const list = weights ?? defaultWeights(font);
  return `${CSS_API}?f[]=${font.slug}@${list.join(",")}&display=swap`;
}

/** Combined stylesheet for many families (batch to keep URLs short). */
export function batchCssUrl(fonts: CatalogFont[]): string {
  const parts = fonts.map((f) => `f[]=${f.slug}@${defaultWeights(f).join(",")}`);
  return `${CSS_API}?${parts.join("&")}&display=swap`;
}

function defaultWeights(font: CatalogFont): number[] {
  const weights = weightsOf(font);
  if (weights.length <= 3) return weights;
  return [weights[0], weights[Math.floor(weights.length / 2)], weights[weights.length - 1]];
}

export function downloadUrl(slug: string): string {
  return `https://api.fontshare.com/v2/fonts/download/${slug}`;
}

export function getFont(slug: string): CatalogFont | undefined {
  return FONTS.find((f) => f.slug === slug);
}

export function licenseLabel(license: string): string {
  return license === "sil_ofl" ? "SIL OFL" : "ITF FFL";
}
