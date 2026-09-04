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
    title: `${font.name} - Fontshare Bulk`,
    description: `Preview and download ${font.name} (${font.category}) by ${font.designers.join(", ") || "unknown designer"}.`,
  };
}

export default async function FontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const font = getFont(slug);
  if (!font) notFound();

  const weights = weightsOf(font);
  const related = FONTS.filter(
    (f) => f.slug !== font.slug && categoriesOf(f).some((c) => categoriesOf(font).includes(c))
  ).slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24">
      <link rel="stylesheet" href={cssUrl(font, weights)} />
      <nav className="py-6">
        <Link href="/" className="micro hover:underline underline-offset-4">
          ← All families
        </Link>
      </nav>

      <header className="rule-t pt-6 pb-8">
        <p className="micro text-[var(--color-smoke)]">{font.category}</p>
        <h1
          className="font-semibold tracking-tight leading-none mt-2 text-6xl md:text-8xl"
          style={{ fontFamily: `'${font.name}', sans-serif` }}
        >
          {font.name}
        </h1>
        <p className="mt-3 text-[var(--color-smoke)]">
          by {font.designers.join(", ") || "Unknown designer"}
          {"  "}· {weights.length} weight{weights.length === 1 ? "" : "s"}
          {isVariable(font) ? " · Variable" : ""}
          {hasItalic(font) ? " · Italics" : ""} · {licenseLabel(font.license)}
        </p>
        <div className="mt-6">
          <DetailActions slug={font.slug} name={font.name} />
        </div>
      </header>

      <section className="rule-t pt-6" aria-label="Live preview">
        <PreviewEditor font={font} />
      </section>

      <section className="grid md:grid-cols-3 gap-8 mt-12" aria-label="Family details">
        <div>
          <h2 className="micro text-[var(--color-smoke)] pb-2">Weights</h2>
          <ul className="rule-t">
            {font.styles
              .filter((s) => !s.is_italic)
              .map((s, i) => (
                <li key={i} className="rule-b py-2 flex justify-between text-sm">
                  <span style={{ fontFamily: `'${font.name}', sans-serif`, fontWeight: s.weight_number }}>
                    {s.weight_name}
                  </span>
                  <span className="text-[var(--color-smoke)]">{s.weight_number}</span>
                </li>
              ))}
          </ul>
        </div>
        <div>
          <h2 className="micro text-[var(--color-smoke)] pb-2">Tags</h2>
          <ul className="rule-t">
            {font.tags.length === 0 && <li className="rule-b py-2 text-sm text-[var(--color-smoke)]">No tags</li>}
            {font.tags.map((t) => (
              <li key={t} className="rule-b py-2 text-sm">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="micro text-[var(--color-smoke)] pb-2">License and source</h2>
          <div className="rule-t text-sm">
            <p className="rule-b py-2 flex justify-between">
              <span>License</span>
              <span className="font-semibold">{licenseLabel(font.license)}</span>
            </p>
            <p className="rule-b py-2 flex justify-between gap-4">
              <span>Designers</span>
              <span className="text-right">{font.designers.join(", ") || "Unknown"}</span>
            </p>
            <p className="py-2">
              <a
                href={`https://www.fontshare.com/fonts/${font.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold hover:underline underline-offset-4"
              >
                View on Fontshare →
              </a>
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12" aria-label="Related families">
          <h2 className="micro text-[var(--color-smoke)] pb-3">Related families</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6">
            {related.map((r) => (
              <Link key={r.slug} href={`/${r.slug}`} className="rule-t py-3 group">
                <p className="font-display font-semibold text-lg group-hover:underline underline-offset-4">
                  {r.name}
                </p>
                <p className="micro text-[var(--color-smoke)] mt-1">{r.category}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <BulkBar />
    </main>
  );
}
