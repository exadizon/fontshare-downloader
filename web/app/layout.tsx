import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { QueueProvider } from "../lib/queue";
import QueueCount from "../components/QueueCount";

export const metadata: Metadata = {
  title: "Fontshare Bulk - Browse and download all 100 free families",
  description:
    "Preview every Fontshare font family, download individuals, or queue the full catalog for bulk download.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* UI chrome type, dogfooded from the Fontshare CDN */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=general-sans@400,500,600&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <QueueProvider>
          <header className="rule-b">
            <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-4">
              <Link href="/" className="font-display font-semibold text-xl tracking-tight">
                Fontshare Bulk
              </Link>
              <nav className="flex items-center gap-5 text-sm font-medium">
                <Link href="/" className="hover:underline underline-offset-4">
                  Catalog
                </Link>
                <a
                  href="https://www.fontshare.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline underline-offset-4"
                >
                  Fontshare
                </a>
                <QueueCount />
              </nav>
            </div>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="rule-t mt-16">
            <div className="mx-auto max-w-6xl px-5 py-8 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm text-[var(--color-smoke)]">
              <p>
                Fonts by the Indian Type Foundry. Downloads subject to each
                family&apos;s license (ITF FFL or SIL OFL).
              </p>
              <p>
                Catalog synced from the live Fontshare API.{" "}
                <a
                  href="https://www.fontshare.com/licenses"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  License details
                </a>
              </p>
            </div>
          </footer>
        </QueueProvider>
      </body>
    </html>
  );
}
