import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categoriesOf,
  cssUrl,
  FONTS,
  getFont,
  hasItalic,
  isVariable,
  licenseLabel,
  weightsOf,
} from "../../lib/fonts";
import PreviewEditor from "../../components/PreviewEditor";
import BulkBar from "../../components/BulkBar";
import DetailActions from "./DetailActions";

export function generateStaticParams() {
  return FONTS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const font = getFont(slug);
  if (!font) return { title: "Not found" };
  return {
    title: `${font.name} - Fontshare Bulk Downloader`,
    description: `Download ${font.name} (${font.category}) by ${font.designers.join(", ") || "unknown designer"}. Free for personal and commercial use.`,
  };
}

export default async function FontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const font = getFont(slug);
  if (!font) notFound();

  const weights = weightsOf(font);
  const related = FONTS.filter(
    (f) =>
      f.slug !== font.slug &&
      categoriesOf(f).some((c) => categoriesOf(font).includes(c))
  ).slice(0, 6);

  return (
    <main className="mx-auto max-w-7xl px-5 pb-32 pt-4">
      <link rel="stylesheet" href={cssUrl(font, weights)} />

      {/* Breadcrumb Navigation */}
      <nav className="py-4 flex items-center justify-between border-b border-[var(--color-border)] mb-8 text-xs font-mono">
        <Link
          href="/"
          className="text-[var(--color-muted)] hover:text-[var(--color-text)] flex items-center gap-1.5 transition-colors"
        >
          <span>&larr;</span>
          <span>Back to All 100 Families</span>
        </Link>
        <span className="badge-solid">{font.category}</span>
      </nav>

      {/* Family Header Banner */}
      <header className="border border-[var(--color-border)] bg-[var(--color-panel)] p-6 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-[var(--color-muted)]">
              <span>By <strong className="text-[var(--color-text)]">{font.designers.join(", ") || "Unknown"}</strong></span>
              <span>&middot;</span>
              <span>{weights.length} weights ({font.styles.length} styles)</span>
              {isVariable(font) && (
                <>
                  <span>&middot;</span>
                  <span className="text-[var(--color-text)] font-semibold border border-[var(--color-border)] px-1.5 py-0.5 rounded-sm">Variable Font</span>
                </>
              )}
              {hasItalic(font) && (
                <>
                  <span>&middot;</span>
                  <span>Includes Italics</span>
                </>
              )}
              <span>&middot;</span>
              <span>{licenseLabel(font.license)}</span>
            </div>

            <h1
              className="font-bold tracking-tight leading-none text-6xl md:text-8xl text-[var(--color-text)]"
              style={{ fontFamily: `'${font.name}', sans-serif` }}
            >
              {font.name}
            </h1>
          </div>

          <div className="shrink-0">
            <DetailActions slug={font.slug} name={font.name} />
          </div>
        </div>
      </header>

      {/* Live Specimen Preview Section */}
      <section className="border border-[var(--color-border)] bg-[var(--color-card)] p-6 md:p-8 mb-8" aria-label="Live preview">
        <h2 className="micro-label text-[var(--color-muted)] mb-4">
          Live Interactive Specimen
        </h2>
        <PreviewEditor font={font} />
      </section>

      {/* Metadata & Weights Breakdown */}
      <section className="grid md:grid-cols-3 gap-6" aria-label="Family details">
        {/* Weights List */}
        <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
          <h2 className="micro-label text-[var(--color-muted)] pb-3 border-b border-[var(--color-border)] mb-3">
            Styles &amp; Weights ({font.styles.length})
          </h2>
          <ul className="divide-y divide-[var(--color-border)] text-sm">
            {font.styles
              .filter((s) => !s.is_italic)
              .map((s, i) => (
                <li key={i} className="py-2 flex justify-between items-center">
                  <span
                    className="text-[var(--color-text)]"
                    style={{
                      fontFamily: `'${font.name}', sans-serif`,
                      fontWeight: s.weight_number,
                    }}
                  >
                    {s.weight_name}
                  </span>
                  <span className="text-xs font-mono text-[var(--color-muted)]">
                    {s.weight_number}
                  </span>
                </li>
              ))}
          </ul>
        </div>

        {/* Tags */}
        <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
          <h2 className="micro-label text-[var(--color-muted)] pb-3 border-b border-[var(--color-border)] mb-3">
            Suggested Uses &amp; Tags
          </h2>
          {font.tags.length === 0 ? (
            <p className="text-xs text-[var(--color-muted)]">No tags listed</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {font.tags.map((t) => (
                <span key={t} className="badge-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* License & Source */}
        <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
          <h2 className="micro-label text-[var(--color-muted)] pb-3 border-b border-[var(--color-border)] mb-3">
            License &amp; Foundry
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-muted)]">License</span>
              <strong className="text-[var(--color-text)]">{licenseLabel(font.license)}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-muted)]">Commercial Use</span>
              <strong className="text-[var(--color-text)]">100% Free</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-muted)]">Foundry</span>
              <strong className="text-[var(--color-text)]">Indian Type Foundry</strong>
            </div>
            <div className="pt-3">
              <a
                href={`https://www.fontshare.com/fonts/${font.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-text)] font-semibold underline underline-offset-4 inline-flex items-center gap-1 hover:opacity-80"
              >
                <span>View on Fontshare Official</span>
                <span>&nearr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Families */}
      {related.length > 0 && (
        <section className="mt-12" aria-label="Related families">
          <h2 className="micro-label text-[var(--color-muted)] mb-4">
            More {font.category} Families
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {related.map((f) => (
              <Link
                key={f.slug}
                href={`/${f.slug}`}
                className="border border-[var(--color-border)] bg-[var(--color-card)] p-3 hover:border-[var(--color-text)] transition-colors block group"
              >
                <p className="font-display font-bold text-sm text-[var(--color-text)] truncate group-hover:underline">
                  {f.name}
                </p>
                <p className="text-[10px] text-[var(--color-muted)]">
                  {f.styles.length} styles
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <BulkBar />
    </main>
  );
}
