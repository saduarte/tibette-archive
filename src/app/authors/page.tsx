"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Fic } from "@/lib/data";
import { getAllAuthorAggregates } from "@/lib/authorAggregates";

type AuthorRow = {
  author: string;
  fics: number;
  score: number | null;
};

export default function AuthorsIndexPage() {
  const [q, setQ] = useState("");
  const [fics, setFics] = useState<Fic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalized = q.trim().toLowerCase();

 useEffect(() => {
  async function loadFics() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/fics");

      if (!response.ok) {
        setFics([]);
        return;
      }

      const data: Fic[] = await response.json();
      setFics(data);
    } catch {
      setFics([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  loadFics();
}, []);

  const authors = useMemo<AuthorRow[]>(() => {
    return getAllAuthorAggregates(fics)
      .map((a) => ({
        author: a.name,
        fics: a.totalFics,
        score: a.authorScore,
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [fics]);

  const filtered = useMemo(() => {
    if (!normalized) return authors;
    return authors.filter((a) => a.author.toLowerCase().includes(normalized));
  }, [authors, normalized]);

  function getInitials(name: string) {
    const parts = name.trim().split(/[_\s]+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  }

  return (
    <section className="mx-auto max-w-5xl space-y-10 p-6">
      <header className="relative space-y-4 border-b border-border/40 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Hall of Authors
          </h1>
          <p className="text-sm text-muted md:text-base">
            Exploring {authors.length} creators in our archive.
          </p>
        </div>

        <div className="relative max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search creators..."
            className="w-full rounded-2xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition-all focus:border-brand/40 focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <p className="text-muted italic">Loading authors...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {filtered.length > 0 ? (
            filtered.map((a) => (
              <Link
                key={a.author}
                href={`/authors/${encodeURIComponent(a.author)}`}
                className="group relative flex items-center justify-between rounded-3xl border border-border/60 bg-surface p-5 transition-all hover:border-brand/30 hover:bg-surface2 hover:shadow-xl active:scale-[0.99]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 text-lg font-bold text-foreground ring-1 ring-border transition-all group-hover:ring-brand/30">
                    {getInitials(a.author)}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="truncate text-lg font-bold text-foreground">
                      {a.author}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-muted">
                      <span className="rounded-md bg-surface2 px-2 py-0.5 ring-1 ring-border">
                        {a.fics} {a.fics === 1 ? "work" : "works"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 text-sm font-black text-foreground">
                    <span className="text-amber-400">★</span>
                    <span>{a.score === null ? "—" : a.score.toFixed(1)}</span>
                  </div>

                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border/40">
                    <div
                      className="h-full bg-brand"
                      style={{ width: `${(a.score || 0) * 20}%` }}
                    />
                  </div>
                </div>

                <div className="absolute -right-1 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:right-4 group-hover:opacity-100">
                  <span className="text-xl text-brand">→</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted italic">
                No authors found with that name.
              </p>
            </div>
          )}
        </div>
      )}

      <footer className="pt-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>
          Return to Archive
        </Link>
      </footer>
    </section>
  );
}