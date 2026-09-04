import type { Metadata } from "next";
import "./globals.css";
import { QueueProvider } from "../lib/queue";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Fontshare Bulk Downloader - Download all 100 free families",
  description:
    "The bulk font downloader for Fontshare. Batch download the full 100-family catalog, filter by category or variable axes, export terminal scripts, or auto-install directly to your system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("fsb-theme")||"light";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
        {/* Satoshi for display, General Sans for body & UI */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@500,700,900&f[]=general-sans@400,500,600,700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <QueueProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-[var(--color-border)] mt-20 bg-[var(--color-panel)]">
            <div className="mx-auto max-w-7xl px-5 py-10 flex flex-col md:flex-row gap-6 md:items-center justify-between text-xs text-[var(--color-muted)]">
              <div>
                <p className="font-semibold text-[var(--color-text)] mb-1">
                  FONTSHARE BULK DOWNLOADER
                </p>
                <p>
                  Free quality fonts released by the Indian Type Foundry (ITF). Each font retains its original license (ITF FFL or SIL OFL).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-5 text-[11px] uppercase tracking-wider font-mono">
                <a
                  href="https://www.fontshare.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-text)] hover:underline underline-offset-4"
                >
                  Fontshare Official &nearr;
                </a>
                <a
                  href="https://www.fontshare.com/licenses"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-text)] hover:underline underline-offset-4"
                >
                  License Terms &nearr;
                </a>
                <a
                  href="https://github.com/exadizon/fontshare-downloader"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-text)] hover:underline underline-offset-4"
                >
                  GitHub Repository &nearr;
                </a>
              </div>
            </div>
          </footer>
        </QueueProvider>
      </body>
    </html>
  );
}
