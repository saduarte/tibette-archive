"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import type { AuthorQuote, Fic } from "@/lib/data";

type NotesEntry = {
  message: string;
  signedBy: string;
  date: string;
};

export default function AuthorPage() {
  const { author } = useParams<{ author: string }>();
  const decodedAuthor = decodeURIComponent(author);

  const [allFics, setAllFics] = useState<Fic[]>([]);
  const [authorData, setAuthorData] = useState<AuthorQuote | null>(null);
  const [notes, setNotes] = useState<NotesEntry[]>([]);
  const [message, setMessage] = useState("");
  const [signedBy, setSignedBy] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAuthorPageData() {
      try {
        setLoading(true);
        setError(null);

        const [ficsResponse, authorResponse] = await Promise.all([
          fetch("/api/fics"),
          fetch(`/api/authors/${encodeURIComponent(decodedAuthor)}`),
        ]);

        if (!ficsResponse.ok) {
          throw new Error("Failed to load fics");
        }

        const ficsData: Fic[] = await ficsResponse.json();
        setAllFics(ficsData);

        if (authorResponse.ok) {
          const authorJson: AuthorQuote = await authorResponse.json();
          setAuthorData(authorJson);
        } else {
          setAuthorData(null);
        }
      } catch (err) {
        console.error("Error loading author page:", err);

        
        setAllFics([]);
        setAuthorData(null);
        setError(null);
      } finally {
        setLoading(false);
      }
    }

    loadAuthorPageData();
  }, [decodedAuthor]);

  const authorFics = useMemo<Fic[]>(() => {
    return allFics.filter((f) => f.author === decodedAuthor);
  }, [allFics, decodedAuthor]);

  const stats = useMemo(() => {
    const totalFics = authorFics.length;
    const highestRatedFic =
      [...authorFics].sort((a, b) => b.ratingAvg - a.ratingAvg)[0] ?? null;
    const mostRecent =
      [...authorFics].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))[0] ?? null;

    return { totalFics, highestRatedFic, mostRecent };
  }, [authorFics]);

  function getInitials(name: string) {
    const parts = name.trim().split(/[_\s]+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  }

  function submitNotes(e: React.FormEvent) {
    e.preventDefault();

    if (!message.trim()) return;

    setNotes((prev) => [
      {
        message: message.trim(),
        signedBy: signedBy.trim() || "anon",
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);

    setMessage("");
    setSignedBy("");
  }

  return (
    <section className="mx-auto max-w-4xl space-y-12 p-6">
      <header className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand/20 text-xl font-bold text-foreground ring-1 ring-border shadow-sm">
              {getInitials(decodedAuthor)}
            </div>

            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {decodedAuthor}
              </h1>

              {authorData?.quote && (
                <p className="text-sm italic text-muted/80">
                  "{authorData.quote}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {authorData?.socials && authorData.socials.length > 0 ? (
                  authorData.socials.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg bg-surface2 px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-border transition-colors hover:text-brand"
                    >
                      {link.platform} ↗
                    </a>
                  ))
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-muted/40">
                    Independent Author
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href={`/add?author=${encodeURIComponent(decodedAuthor)}`}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-foreground shadow-md transition hover:opacity-90 active:scale-95"
          >
            ＋ Add work
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="py-10 text-center">
          <p className="text-muted italic">Loading author page...</p>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              label="Top Rated"
              value={stats.highestRatedFic?.title || "—"}
            />
            <Stat label="Archived Works" value={stats.totalFics} />
            <Stat
              label="Most Recent"
              value={stats.mostRecent?.year || "—"}
              hint="Last updated"
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Library</h2>

            <div className="grid gap-3">
              {authorFics.length > 0 ? (
                authorFics.map((fic) => (
                  <article
                    key={fic.title}
                    className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-surface p-4 shadow-sm transition-all hover:border-brand/40"
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground transition-colors group-hover:text-brand">
                        {fic.ao3Url ? (
                          <a
                            href={fic.ao3Url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {fic.title}
                          </a>
                        ) : (
                          fic.title
                        )}
                      </h3>

                      <div className="mt-1 flex gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            fic.status === "Complete"
                              ? "text-green-500"
                              : "text-amber-500"
                          }`}
                        >
                          {fic.status}
                        </span>

                        <span className="text-muted/20">|</span>

                        <span className="text-[10px] text-muted">
                          {fic.chapterCurrent}/{fic.chapterTotal || "?"} ch.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        {fic.ratingAvg.toFixed(1)}
                      </span>
                      <StarRow value={fic.ratingAvg} />
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-border/40 bg-surface p-6 text-sm text-muted">
                  No archived works found for this author yet.
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Guestbook</h2>

        <form
          onSubmit={submitNotes}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-inner"
        >
          <textarea
            rows={3}
            placeholder="Write a note to the author..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-xl border border-border bg-surface2 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />

          <div className="flex items-center justify-between gap-4">
            <input
              placeholder="Your name"
              value={signedBy}
              onChange={(e) => setSignedBy(e.target.value)}
              className="rounded-xl border border-border bg-surface2 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />

            <button
              type="submit"
              className="rounded-xl bg-brand px-6 py-2 text-sm font-bold text-foreground transition-all hover:brightness-110"
            >
              Post Note
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {notes.length > 0 ? (
            notes.map((entry, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/40 bg-surface/50 p-4 text-sm"
              >
                <p className="text-foreground">"{entry.message}"</p>
                <div className="mt-2 text-[10px] uppercase tracking-tighter text-muted">
                  — {entry.signedBy} • {entry.date}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border/40 bg-surface/50 p-4 text-sm text-muted">
              No notes yet.
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border/20 pt-8">
        <Link
          href="/"
          className="text-sm text-muted transition-colors hover:text-brand"
        >
          ← Back to archive
        </Link>
      </footer>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-5 shadow-sm">
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted/60">
        {label}
      </div>
      <div className="truncate text-lg font-bold text-foreground">{value}</div>
      {hint && (
        <div className="mt-1 text-[10px] font-medium italic text-brand/60">
          {hint}
        </div>
      )}
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  const rounded = Math.round(value);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 ${
            i <= rounded ? "fill-amber-400" : "fill-muted/20"
          }`}
        >
          <path d="M12 2l2.9 6.1L22 9.2l-5 4.9 1.2 7L12 17.8 5.8 21.1 7 14.1 2 9.2l7.1-1.1L12 2z" />
        </svg>
      ))}
    </div>
  );
}