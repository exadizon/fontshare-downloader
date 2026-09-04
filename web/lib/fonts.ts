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
  views: number;
  views_recent: number;
  is_new: boolean;
  is_hot: boolean;
  is_top: boolean;
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

export type SortKey = "popular" | "new" | "hot" | "alphabetical";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "new", label: "New" },
  { key: "hot", label: "Hot" },
  { key: "alphabetical", label: "Alphabetical" },
];

const sorters: Record<SortKey, (a: CatalogFont, b: CatalogFont) => number> = {
  popular: (a, b) => b.views_recent - a.views_recent || b.views - a.views,
  new: (a, b) => Number(b.is_new) - Number(a.is_new) || b.views_recent - a.views_recent,
  hot: (a, b) => Number(b.is_hot) - Number(a.is_hot) || b.views_recent - a.views_recent,
  alphabetical: (a, b) => a.name.localeCompare(b.name),
};

export function sortFonts(fonts: CatalogFont[], sort: SortKey): CatalogFont[] {
  return [...fonts].sort(sorters[sort]);
}

/** Top tags across the catalog, used as the Personality filter. */
export const PERSONALITIES: string[] = (() => {
  const counts = new Map<string, number>();
  for (const font of FONTS) {
    for (const tag of font.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([tag]) => tag);
})();

/** Preview presets mirroring the Names / Excerpts / Cities toggle. */
export const CITIES = [
  "New Delhi",
  "Mumbai",
  "Berlin",
  "Tokyo",
  "Lagos",
  "Mexico City",
  "Jakarta",
  "Cairo",
  "Paris",
  "Seoul",
];

export const EXCERPT =
  "The quick brown fox jumps over the lazy dog, packing my box with five dozen liquor jugs.";
