import { FONTS } from "../lib/fonts";
import CatalogBrowser from "../components/CatalogBrowser";
import BulkBar from "../components/BulkBar";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-5 pb-28 pt-2">
      <CatalogBrowser fonts={FONTS} />
      <BulkBar />
    </main>
  );
}
