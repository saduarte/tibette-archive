"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { type TagOption, type Fic, type FicStatus } from "@/lib/data";
import { getTopAuthorsByScore } from "@/lib/authorAggregates";

type Prompt = {
  id: string;
  idea: string;
  suggestedAuthors: string[];
  requestedBy: string;
};


function statusPillClass(status: FicStatus) {
  const base =
    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ";

  if (status === "Complete") {
    return base + "border-emerald-700/15 bg-emerald-700/8 text-emerald-700";
  }

  if (status === "Hiatus") {
    return base + "border-amber-700/15 bg-amber-700/8 text-amber-700";
  }

  return base + "border-sky-700/15 bg-sky-700/8 text-sky-700";
}

function getInitials(name: string) {
  const parts = name.trim().split(/[_\s]+/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export default function Home() {
  const [fics, setFics] = useState<Fic[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState({
    title: true,
    author: true,
    tags: true,
  });

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);

        const [ficsResponse, promptsResponse] = await Promise.all([
          fetch("/api/fics"),
          fetch("/api/prompts"),
        ]);

        if (ficsResponse.ok) {
          const ficsData: Fic[] = await ficsResponse.json();
          setFics(ficsData);
        } else {
          setFics([]);
        }

        if (promptsResponse.ok) {
          const promptsData: Prompt[] = await promptsResponse.json();
          setPrompts(promptsData);
        } else {
          setPrompts([]);
        }
      } catch (error) {
        console.error("Error loading home data:", error);

        // enquanto backend não existe, não quebra a página
        setFics([]);
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const recentPrompts = useMemo(() => prompts.slice(0, 3), [prompts]);

  const topAuthor = useMemo(() => {
    return getTopAuthorsByScore(fics, { limit: 1 })[0];
  }, [fics]);

  const filteredFics = useMemo(() => {
    let list = fics;
    const norm = query.trim().toLowerCase();

    if (activeTags.length > 0) {
      list = list.filter((f) =>
        activeTags.every((t) => f.tags.includes(t as TagOption))
      );
    }

    if (norm) {
      list = list.filter((f) => {
        const inTitle = scope.title && f.title.toLowerCase().includes(norm);
        const inAuthor = scope.author && f.author.toLowerCase().includes(norm);
        const inTags =
          scope.tags && f.tags.some((t) => t.toLowerCase().includes(norm));

        return inTitle || inAuthor || inTags;
      });
    }

    return list;
  }, [fics, activeTags, query, scope]);

  const visibleFics = filteredFics.slice(0, visibleCount);

  return (
    <section className="space-y-16 pb-20">
      <div className="relative mt-6 overflow-hidden rounded-[2.5rem] border border-border/70 bg-surface/95 p-6 shadow-[0_24px_60px_rgba(110,102,88,0.12)] md:p-16">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/5 blur-[120px]" />

        <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-2xl flex-col items-center space-y-8 text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/12 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-brand ring-1 ring-brand/20">
              Tibette Curator Hub
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-black leading-[1.1] tracking-tighter text-foreground md:text-7xl md:leading-[0.9]">
                The Library of <br />
                <span className="text-brand">Recommendations.</span>
              </h1>

              <p className="max-w-xl text-balance text-base leading-relaxed text-muted md:text-lg">
                A community guide to Tibette fanfiction. We don't host stories,
                we highlight the gems found across the web.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <Link
                href="/add"
                className="w-full rounded-2xl bg-brand px-8 py-4 text-center font-bold text-white shadow-xl shadow-brand/20 transition hover:-translate-y-0.5 hover:bg-brand2 active:scale-95 sm:w-auto"
              >
                Recommend a Fic
              </Link>

              <Link
                href="/prompts"
                className="w-full rounded-2xl border-2 border-brand/40 bg-transparent px-8 py-4 text-center font-bold text-brand transition hover:bg-brand/10 hover:text-foreground active:scale-95 sm:w-auto"
              >
                Prompt Board
              </Link>

              <div className="group relative inline-block w-full sm:w-auto">
                <button className="flex w-full cursor-default items-center justify-center gap-2 rounded-2xl border border-border bg-surface2 px-6 py-4 text-sm font-bold text-muted shadow-sm transition sm:w-auto">
                  <img src="/icons/labrys.png" alt="" className="h-4 w-4" />
                  <span>Awards 2026</span>
                </button>

                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-64 -translate-x-1/2 scale-95 rounded-2xl border border-border bg-surface p-4 text-xs opacity-0 shadow-2xl transition-all group-hover:scale-100 group-hover:opacity-100">
                  <p className="mb-1 font-bold italic tracking-tight text-brand">
                    The official voting opens soon!
                  </p>
                  Add your favorite fics now so they can appear on the nominees list!
                </div>
              </div>
            </div>
          </div>

          {topAuthor && (
            <div className="flex w-full justify-center lg:w-auto">
              <Link
                href={`/authors/${encodeURIComponent(topAuthor.name)}`}
                className="group relative flex w-full max-w-[300px] flex-col items-center rounded-[2rem] border border-border/60 bg-surface p-8 text-center shadow-lg transition-all hover:-translate-y-1 hover:bg-surface2 lg:w-72"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/12 text-xl font-black text-brand transition-transform group-hover:scale-110">
                  {getInitials(topAuthor.name)}
                </div>

                <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">
                  Top Rated Author
                </div>

                <div className="break-all text-xl font-bold text-foreground">
                  {topAuthor.name}
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface2 px-4 py-1.5 text-xs font-bold ring-1 ring-border">
                  ★ {topAuthor.authorScore?.toFixed(1)}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-6 px-2 md:px-0">
        <div className="flex items-end justify-between border-b border-border/40 pb-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground md:text-2xl">
              Recent Ideas
            </h2>
            <p className="text-xs italic text-muted md:text-sm">
              What the community wants to read.
            </p>
          </div>

          <Link
            href="/prompts"
            className="flex items-center gap-1 text-[10px] font-bold text-brand hover:underline md:text-xs"
          >
            See full board <span className="text-lg leading-none">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {recentPrompts.length > 0 ? (
            recentPrompts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between space-y-4 rounded-3xl border border-brand/20 bg-brand/7 p-6 shadow-sm"
              >
                <p className="text-sm font-medium italic leading-relaxed text-foreground">
                  "{p.idea}"
                </p>

                <div className="border-t border-brand/10 pt-4">
                  <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-muted">
                    Suggested:
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {p.suggestedAuthors.map((auth) => (
                      <span
                        key={auth}
                        className="text-[11px] font-bold text-brand"
                      >
                        @{auth}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-border/50 bg-surface p-6 text-sm text-muted">
              No prompts available yet.
            </div>
          )}
        </div>
      </section>

      <div className="sticky top-6 z-40 space-y-4 px-2 md:px-0">
        <div className="rounded-3xl border border-border/70 bg-surface/85 p-2 shadow-[0_20px_45px_rgba(110,102,88,0.10)] backdrop-blur-2xl md:p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-50">
                <img src="/icons/search.png" alt="" className="h-5 w-5" />
              </span>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a recommendation..."
                className="w-full rounded-2xl border-none bg-transparent py-4 pl-12 pr-6 text-sm text-foreground outline-none placeholder:text-muted/70"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2 p-1 md:justify-end">
              {Object.entries(scope).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() =>
                    setScope((s) => ({ ...s, [key]: !val }))
                  }
                  className={`rounded-xl px-4 py-2 text-[10px] font-bold transition-all md:text-xs ${val
                    ? "bg-brand text-white shadow-sm shadow-brand/20"
                    : "bg-transparent text-muted hover:bg-surface2"
                    }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-2 py-10 text-center md:px-0">
          <p className="text-muted italic">Loading recommendations...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 px-2 md:grid-cols-2 md:gap-8 md:px-0 lg:grid-cols-3">
            {visibleFics.map((fic) => (
              <article
                key={fic.title}
                className="group relative flex flex-col overflow-hidden rounded-[2.25rem] border border-border/70 bg-surface transition-all hover:-translate-y-1 hover:border-brand/45 hover:shadow-[0_24px_50px_rgba(110,102,88,0.12)]"
              >
                <div className="flex h-24 w-full items-start justify-between bg-gradient-to-br from-brand/10 via-surface2 to-surface p-6">
                  <span className={statusPillClass(fic.status)}>
                    {fic.status}
                  </span>

                  {fic.ao3Url ? (
                    <a
                      href={fic.ao3Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer rounded-full bg-surface/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted transition-colors hover:bg-brand/15 hover:text-brand"
                    >
                      External ↗
                    </a>
                  ) : (
                    <span className="rounded-full bg-surface/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                      External ↗
                    </span>
                  )}
                </div>

                <div className="-mt-7 flex flex-1 flex-col space-y-5 p-7">
                  <div className="ring-border self-start rounded-full bg-surface px-3 py-1 shadow-sm ring-1">
                    <span className="text-sm font-bold text-foreground">
                      <span className="mr-1 text-amber-500">★</span>
                      {fic.ratingAvg.toFixed(1)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="line-clamp-2 text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-brand md:text-2xl">
                      {fic.title}
                    </h3>

                    <Link
                      href={`/authors/${encodeURIComponent(fic.author)}`}
                      className="text-sm text-muted transition-colors hover:text-brand"
                    >
                      by{" "}
                      <span className="font-bold text-foreground underline decoration-brand/20 underline-offset-4">
                        {fic.author}
                      </span>
                    </Link>
                  </div>

                  <p className="min-h-[6rem] line-clamp-4 text-sm leading-6 text-muted">
                    {fic.summary}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-muted/70">
                    <span>{fic.chapterCurrent || "?"} Chapters</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span>Curated pick</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {fic.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border/70 bg-surface2 px-2.5 py-1 text-[10px] font-medium text-muted"
                      >
                        #{tag.toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleFics.length === 0 && (
            <div className="px-2 py-10 text-center md:px-0">
              <p className="text-muted italic">
                No recommendations found with the current filters.
              </p>
            </div>
          )}

          {visibleFics.length < filteredFics.length && (
            <div className="flex justify-center pb-10">
              <button
                onClick={() => setVisibleCount((c) => c + 6)}
                className="w-full max-w-[300px] rounded-2xl border-2 border-border px-12 py-4 font-black text-foreground transition-all hover:border-brand hover:text-brand active:scale-95 md:w-auto"
              >
                Explore More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}