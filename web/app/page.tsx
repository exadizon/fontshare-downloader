import { COUNT_TOTAL, FONTS, SYNCED_AT } from "../lib/fonts";
import CatalogBrowser from "../components/CatalogBrowser";
import BulkBar from "../components/BulkBar";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24">
      <section className="py-10 md:py-14">
        <p className="micro text-[var(--color-smoke)]">
          {COUNT_TOTAL} free families - synced {SYNCED_AT.slice(0, 10)}
        </p>
        <h1 className="font-display font-semibold tracking-tight leading-[0.95] text-5xl md:text-7xl mt-3 max-w-3xl">
          Every Fontshare family. Preview, pick, download.
        </h1>
        <p className="mt-4 max-w-xl text-base md:text-lg text-[var(--color-smoke)]">
          Browse the full catalog with live previews. Download families
          individually or queue a bulk set - no account, no tracking.
        </p>
      </section>
      <CatalogBrowser fonts={FONTS} />
      <BulkBar />
    </main>
  );
}
