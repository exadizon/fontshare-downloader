import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { COUNT_TOTAL } from "../lib/fonts";
import { QueueProvider } from "../lib/queue";
import QueueCount from "../components/QueueCount";
import ThemeToggle from "../components/ThemeToggle";

export const metadata: Metadata = {
  title: "Fontshare Bulk - Browse and download all 100 free families",
  description:
    "Preview every Fontshare font family, download individuals, or queue the full catalog for bulk download.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Satoshi is the primary chrome face; body text uses General Sans. */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@500,700,900&f[]=general-sans@400,500,600&display=swap"
        />
        {/* Apply saved theme before paint to avoid a dark flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('fsb-theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <QueueProvider>
          <header className="rule-b">
            <div className="mx-auto max-w-7xl flex items-stretch">
              <Link
                href="/"
                className="font-display font-bold text-xl tracking-tight px-5 py-5 flex items-center shrink-0"
              >
                Fontshare Bulk™
              </Link>
              <nav className="flex items-stretch flex-1 min-w-0" aria-label="Primary">
                <Link
                  href="/"
                  className="cell cell-active hidden sm:flex flex-col justify-between px-8 py-3 min-w-36"
                  aria-current="page"
                >
                  <span className="text-sm font-medium text-center">Fonts</span>
                  <span className="micro">{COUNT_TOTAL}</span>
                </Link>
                <a
                  href="https://www.fontshare.com/licenses"
                  target="_blank"
                  rel="noreferrer"
                  className="cell hidden md:flex flex-col justify-between px-8 py-3 min-w-36 hover:bg-[var(--color-panel)]"
                >
                  <span className="text-sm font-medium text-center">Licenses</span>
                  <span className="micro dim">ITF / OFL</span>
                </a>
                <div className="cell flex-1 hidden lg:block" aria-hidden="true" />
                <div className="cell px-5 py-3 flex items-center justify-end gap-3 min-w-44">
                  <ThemeToggle />
                  <QueueCount />
                </div>
              </nav>
            </div>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="rule-t mt-16">
            <div className="mx-auto max-w-7xl px-5 py-8 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm dim">
              <p>
                Fonts by the Indian Type Foundry. Each family keeps its own
                license (ITF FFL or SIL OFL).
              </p>
              <p>
                <a
                  href="https://www.fontshare.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  fontshare.com
                </a>{" "}
                ·{" "}
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
