import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tibette Archive",
  description: "A curated fanfic archive — rate, remember, and rediscover.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* subtle brand glow */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-20%] top-[-30%] h-[520px] w-[520px] rounded-full bg-brand/18 blur-3xl" />
          <div className="absolute right-[-15%] top-[10%] h-[520px] w-[520px] rounded-full bg-brand2/12 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <header className="flex items-center justify-between border-b border-border/90 py-6">
            <Link href="/" className="group inline-flex items-baseline gap-3">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                Fanfictions Archive
              </span>
              <span
                aria-hidden
                className="ml-1 inline-block h-2 w-2 rounded-full bg-brand shadow-[0_0_18px_rgba(135,150,122,0.55)] transition group-hover:scale-110"
              />
              <span className="hidden rounded-full border border-border/90 bg-surface px-2 py-0.5 text-[11px] text-muted sm:inline-flex">
                unofficial
              </span>
            </Link>

            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="rounded-xl px-3 py-2 text-muted transition hover:bg-surface2 hover:text-foreground"
              >
                Home
              </Link>
              <Link
                href="/authors"
                className="rounded-xl px-3 py-2 text-muted transition hover:bg-surface2 hover:text-foreground"
              >
                Authors
              </Link>
              <Link
                href="/add"
                className="rounded-xl bg-brand px-3 py-2 font-semibold text-white shadow-[0_8px_24px_rgba(135,150,122,0.22)] transition hover:-translate-y-0.5 hover:bg-brand2 active:scale-[0.99]"
              >
                Add fic
              </Link>
            </nav>
          </header>

          <main className="pb-16 pt-10">{children}</main>

          <footer className="relative border-t border-border/80 py-6 text-xs text-muted">
            <p>
              Unofficial fan project. Not affiliated with any official platforms, series, or rights holders.
            </p>

            <p className="absolute bottom-6 right-2 text-[10px] text-muted/50">
              v0.3.0
            </p>
          </footer>

        </div>
      </body>
    </html>
  );
}
