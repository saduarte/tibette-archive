"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import type { Fic } from "@/lib/data";

type PromptStatus = "Open" | "Claimed" | "Completed";

type PromptEntry = {
  id: string;
  description: string;
  requestedBy: string;
  suggestedAuthors: string[];
  type: "Solo" | "Collaboration";
  status: PromptStatus;
  date: string;
  claimedBy?: string;
  collaborators?: string[];
  resultLink?: string;
};

export default function PromptsPage() {
  const [fics, setFics] = useState<Fic[]>([]);
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<PromptStatus | "All">("All");
  const [searchAuthor, setSearchAuthor] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptEntry | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [newPrompt, setNewPrompt] = useState<{
  description: string;
  type: "Solo" | "Collaboration";
  requestedBy: string;
}>({
  description: "",
  type: "Solo",
  requestedBy: "",
});
  const [authorQuery, setAuthorQuery] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);

  const [claimType, setClaimType] = useState<"Solo" | "Collaboration">("Solo");
  const [claimAuthorName, setClaimAuthorName] = useState("");
  const [partnerQuery, setPartnerQuery] = useState("");
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [claimLink, setClaimLink] = useState("");
  const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false);

 useEffect(() => {
  async function loadPageData() {
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
        const promptsData: PromptEntry[] = await promptsResponse.json();
        setPrompts(promptsData);
      } else {
        setPrompts([]);
      }
    } catch {
      setFics([]);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }

  loadPageData();
}, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const allAuthors = useMemo(() => {
    return Array.from(new Set(fics.map((f) => f.author)));
  }, [fics]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const matchesStatus = filter === "All" || p.status === filter;
      const matchesAuthor =
        searchAuthor === "" ||
        p.suggestedAuthors.some((a) =>
          a.toLowerCase().includes(searchAuthor.toLowerCase())
        ) ||
        p.claimedBy?.toLowerCase().includes(searchAuthor.toLowerCase());

      return matchesStatus && matchesAuthor;
    });
  }, [prompts, filter, searchAuthor]);

  const filteredSuggestions = useMemo(() => {
    if (authorQuery.length < 2) return [];

    return allAuthors
      .filter(
        (a) =>
          a.toLowerCase().includes(authorQuery.toLowerCase()) &&
          !selectedAuthors.includes(a)
      )
      .slice(0, 3);
  }, [authorQuery, allAuthors, selectedAuthors]);

  const filteredPartnerSuggestions = useMemo(() => {
    if (partnerQuery.length < 2) return [];

    return allAuthors
      .filter(
        (a) =>
          a.toLowerCase().includes(partnerQuery.toLowerCase()) &&
          !selectedPartners.includes(a)
      )
      .slice(0, 3);
  }, [partnerQuery, allAuthors, selectedPartners]);

  const filteredLeadSuggestions = useMemo(() => {
    if (claimAuthorName.length < 2) return [];

    return allAuthors
      .filter((a) =>
        a.toLowerCase().includes(claimAuthorName.toLowerCase())
      )
      .slice(0, 3);
  }, [claimAuthorName, allAuthors]);

  const handlePostPrompt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPrompt.description.trim() || !newPrompt.requestedBy.trim()) return;

    const payload = {
      description: newPrompt.description.trim(),
      requestedBy: newPrompt.requestedBy.trim(),
      suggestedAuthors: selectedAuthors,
      type: newPrompt.type,
      status: "Open" as PromptStatus,
    };

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const createdPrompt: PromptEntry = await response.json();
        setPrompts((prev) => [createdPrompt, ...prev]);
      } else {
        const localPrompt: PromptEntry = {
          id: crypto.randomUUID(),
          description: payload.description,
          requestedBy: payload.requestedBy,
          suggestedAuthors: payload.suggestedAuthors,
          type: payload.type,
          status: "Open",
          date: new Date().toISOString().slice(0, 10),
        };

        setPrompts((prev) => [localPrompt, ...prev]);
      }

      setNotification("Spark posted successfully!");
      setIsModalOpen(false);
      setNewPrompt({ description: "", type: "Solo", requestedBy: "" });
      setSelectedAuthors([]);
      setAuthorQuery("");
    } catch (error) {
      console.error("Error posting prompt:", error);

      const localPrompt: PromptEntry = {
        id: crypto.randomUUID(),
        description: payload.description,
        requestedBy: payload.requestedBy,
        suggestedAuthors: payload.suggestedAuthors,
        type: payload.type,
        status: "Open",
        date: new Date().toISOString().slice(0, 10),
      };

      setPrompts((prev) => [localPrompt, ...prev]);
      setNotification("Spark posted successfully!");
      setIsModalOpen(false);
      setNewPrompt({ description: "", type: "Solo", requestedBy: "" });
      setSelectedAuthors([]);
      setAuthorQuery("");
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPrompt) return;

    if (!claimLink.startsWith("http")) {
      alert("Invalid link! Please provide a full URL (e.g., https://...)");
      return;
    }

    const payload = {
      promptId: selectedPrompt.id,
      claimType,
      claimedBy: claimAuthorName.trim(),
      collaborators: claimType === "Collaboration" ? selectedPartners : [],
      resultLink: claimLink.trim(),
    };

    try {
      const response = await fetch(`/api/prompts/${selectedPrompt.id}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedPrompt: PromptEntry = await response.json();

        setPrompts((prev) =>
          prev.map((p) => (p.id === updatedPrompt.id ? updatedPrompt : p))
        );
      } else {
        setPrompts((prev) =>
          prev.map((p) =>
            p.id === selectedPrompt.id
              ? {
                  ...p,
                  status: "Completed",
                  claimedBy: payload.claimedBy,
                  collaborators: payload.collaborators,
                  resultLink: payload.resultLink,
                }
              : p
          )
        );
      }

      setNotification("Claimed successfully! Verify in progress.");
      setIsClaimModalOpen(false);
      setSelectedPrompt(null);
      setClaimAuthorName("");
      setSelectedPartners([]);
      setPartnerQuery("");
      setClaimLink("");
      setClaimType("Solo");
      setShowAuthorSuggestions(false);
    } catch (error) {
      console.error("Error submitting claim:", error);

      setPrompts((prev) =>
        prev.map((p) =>
          p.id === selectedPrompt.id
            ? {
                ...p,
                status: "Completed",
                claimedBy: payload.claimedBy,
                collaborators: payload.collaborators,
                resultLink: payload.resultLink,
              }
            : p
        )
      );

      setNotification("Claimed successfully! Verify in progress.");
      setIsClaimModalOpen(false);
      setSelectedPrompt(null);
      setClaimAuthorName("");
      setSelectedPartners([]);
      setPartnerQuery("");
      setClaimLink("");
      setClaimType("Solo");
      setShowAuthorSuggestions(false);
    }
  };

  return (
    <section className="relative mx-auto max-w-7xl space-y-8 p-6 pb-24 text-foreground">
      {notification && (
        <div className="animate-bounce-in fixed bottom-10 left-1/2 z-[100] -translate-x-1/2">
          <div className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-brand px-6 py-3 text-sm font-bold text-foreground shadow-2xl ring-2 ring-brand/20">
            <span>✨</span> {notification}
          </div>
        </div>
      )}

      <header className="flex flex-col justify-between gap-4 border-b border-border/40 pb-6 text-left md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">
            Prompt <span className="text-brand">Board</span>
          </h1>
          <p className="max-w-md text-xs font-medium italic leading-relaxed text-muted">
            Share your story ideas. If you're an author, claim a spark and bring
            it to life.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
            placeholder="Search author..."
            className="w-36 rounded-lg border border-border bg-surface2 px-3 py-2 text-[10px] outline-none focus:ring-1 focus:ring-brand"
          />

          <div className="flex rounded-lg border border-border bg-surface2 p-1">
            {["All", "Open", "Completed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as PromptStatus | "All")}
                className={`rounded-md px-3 py-1 text-[9px] font-black uppercase transition-all ${
                  filter === s
                    ? "bg-brand text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-brand px-4 py-2 text-[10px] font-black uppercase text-foreground shadow-lg shadow-brand/20 transition hover:brightness-110"
          >
            + Post Spark
          </button>
        </div>
      </header>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-sm italic text-muted">Loading prompt board...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((p) => (
            <article
              key={p.id}
              className={`group flex flex-col rounded-3xl border p-5 transition-all hover:shadow-lg ${
                p.status === "Completed"
                  ? "border-emerald-500/20 bg-emerald-500/5 opacity-75"
                  : "border-border/60 bg-surface shadow-sm hover:border-brand/40"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`rounded-md border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                    p.status === "Open"
                      ? "border-brand/30 bg-brand/10 text-brand"
                      : p.status === "Completed"
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {p.status}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-tighter text-muted/30">
                  {p.date}
                </span>
              </div>

              <div className="flex-1 space-y-2 text-left">
                <span className="shrink-0 rounded border border-border bg-surface2 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-tighter text-muted">
                  {p.type} Request
                </span>
                <p className="line-clamp-5 text-xs italic leading-relaxed text-muted">
                  "{p.description}"
                </p>
              </div>

              <div className="mt-5 space-y-3 border-t border-border/20 pt-4 text-[10px]">
                {p.status === "Completed" ? (
                  <div className="space-y-1 text-left">
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/50">
                      Fulfilled by:
                    </span>
                    <div className="font-bold">
                      @{p.claimedBy}{" "}
                      {p.collaborators?.length
                        ? `& @${p.collaborators.join(", @")}`
                        : ""}
                    </div>
                    {p.resultLink && (
                      <a
                        href={p.resultLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-black text-brand underline decoration-brand/20"
                      >
                        Read Result ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 text-left">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted/50">
                      Suggested Voices:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {p.suggestedAuthors.length > 0 ? (
                        p.suggestedAuthors.map((auth) => (
                          <span key={auth} className="font-bold text-brand">
                            @{auth}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] italic text-muted/40">
                          Open to anyone
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border/10 pt-3">
                  <div className="text-left text-[9px]">
                    <span className="block text-[7px] font-bold uppercase leading-none text-muted/60">
                      From
                    </span>
                    <span className="block max-w-[100px] truncate font-bold">
                      {p.requestedBy}
                    </span>
                  </div>

                  {p.status === "Open" && (
                    <button
                      onClick={() => {
                        setSelectedPrompt(p);
                        setIsClaimModalOpen(true);
                      }}
                      className="rounded-md bg-brand px-3 py-1.5 text-[9px] font-black uppercase text-foreground shadow-sm transition-all hover:scale-105"
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && filteredPrompts.length === 0 && (
        <div className="rounded-3xl border border-border/50 bg-surface p-8 text-center text-sm text-muted">
          No prompts found for the current filters.
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur-sm">
          <form
            onSubmit={handlePostPrompt}
            className="w-full max-w-lg space-y-6 rounded-[2.5rem] border border-border bg-surface p-10 shadow-2xl"
          >
            <h2 className="text-3xl font-black text-foreground">
              Post New Spark
            </h2>

            <div className="space-y-1 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted">
                Story Idea *
              </label>
              <textarea
                required
                value={newPrompt.description}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, description: e.target.value })
                }
                rows={4}
                placeholder="Describe what you want to read..."
                className="w-full resize-none rounded-xl border border-border bg-surface2 p-3 text-xs outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted">
                Your Name / Handle *
              </label>
              <input
                required
                value={newPrompt.requestedBy}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, requestedBy: e.target.value })
                }
                placeholder="How should we call you?"
                className="w-full rounded-xl border border-border bg-surface2 p-3 text-xs outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted">
                  Target Writing Type
                </label>
                <select
                  value={newPrompt.type}
                  onChange={(e) =>
                    setNewPrompt({
                      ...newPrompt,
                      type: e.target.value as "Solo" | "Collaboration",
                    })
                  }
                  className="cursor-pointer bg-transparent text-[10px] font-bold text-brand outline-none"
                >
                  <option value="Solo">Solo Work</option>
                  <option value="Collaboration">Collaboration</option>
                </select>
              </div>

              <div className="relative">
                <div className="mb-2 flex flex-wrap gap-1">
                  {selectedAuthors.map((a) => (
                    <span
                      key={a}
                      className="flex items-center gap-1 rounded bg-brand/10 px-2 py-0.5 text-[8px] font-bold text-brand"
                    >
                      @{a}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAuthors(
                            selectedAuthors.filter((i) => i !== a)
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <input
                  value={authorQuery}
                  onChange={(e) => setAuthorQuery(e.target.value)}
                  placeholder="Suggest specific authors? (Optional)"
                  className="w-full rounded-xl border border-border bg-surface2 p-3 text-xs outline-none focus:ring-1 focus:ring-brand"
                />

                {filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-lg">
                    {filteredSuggestions.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          setSelectedAuthors([...selectedAuthors, a]);
                          setAuthorQuery("");
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-[9px] font-bold hover:bg-brand/10"
                      >
                        @{a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl bg-surface2 py-3 text-[10px] font-bold text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-brand py-3 text-[10px] font-black uppercase text-foreground"
              >
                Post Spark
              </button>
            </div>
          </form>
        </div>
      )}

      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 text-left backdrop-blur-sm">
          <form
            onSubmit={handleClaimSubmit}
            className="w-full max-w-md space-y-6 rounded-[2.5rem] border border-border bg-surface p-10 shadow-2xl"
          >
            <h2 className="text-center text-2xl font-black text-foreground">
              Claim Idea
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase leading-none tracking-widest text-muted">
                  Writing Type *
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setClaimType("Solo")}
                    className={`rounded-lg border py-2 text-[10px] font-bold transition-all ${
                      claimType === "Solo"
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border text-muted"
                    }`}
                  >
                    Writing Solo
                  </button>
                  <button
                    type="button"
                    onClick={() => setClaimType("Collaboration")}
                    className={`rounded-lg border py-2 text-[10px] font-bold transition-all ${
                      claimType === "Collaboration"
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border text-muted"
                    }`}
                  >
                    With Partner(s)
                  </button>
                </div>
              </div>

              <div className="relative space-y-1">
                <label className="text-[9px] font-black uppercase leading-none tracking-widest text-muted">
                  Your Handle *
                </label>
                <input
                  required
                  value={claimAuthorName}
                  onChange={(e) => {
                    setClaimAuthorName(e.target.value);
                    setShowAuthorSuggestions(true);
                  }}
                  placeholder="Your handle"
                  className="mt-1 w-full rounded-xl border border-border bg-surface2 p-3 text-xs outline-none focus:ring-1 focus:ring-brand"
                />

                {showAuthorSuggestions && filteredLeadSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-lg">
                    {filteredLeadSuggestions.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          setClaimAuthorName(a);
                          setShowAuthorSuggestions(false);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-[9px] font-bold text-foreground hover:bg-brand/10"
                      >
                        @{a}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {claimType === "Collaboration" && (
                <div className="relative space-y-1">
                  <label className="text-[9px] font-black uppercase leading-none tracking-widest text-muted">
                    Partner(s) *
                  </label>

                  <div className="mb-2 flex flex-wrap gap-1 pt-1">
                    {selectedPartners.map((a) => (
                      <span
                        key={a}
                        className="flex items-center gap-1 rounded bg-brand/10 px-2 py-0.5 text-[8px] font-bold text-brand"
                      >
                        @{a}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPartners(
                              selectedPartners.filter((i) => i !== a)
                            )
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <input
                    value={partnerQuery}
                    onChange={(e) => setPartnerQuery(e.target.value)}
                    placeholder="Search partners..."
                    className="w-full rounded-xl border border-border bg-surface2 p-3 text-xs outline-none focus:ring-1 focus:ring-brand"
                  />

                  {filteredPartnerSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-lg">
                      {filteredPartnerSuggestions.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            setSelectedPartners([...selectedPartners, a]);
                            setPartnerQuery("");
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-[9px] font-bold text-foreground hover:bg-brand/10"
                        >
                          @{a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-boldtext-brand text-[9px] font-black uppercase leading-none tracking-widest text-brand">
                  Proof Work Link *
                </label>
                <input
                  required
                  value={claimLink}
                  onChange={(e) => setClaimLink(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-brand/50 bg-surface2 p-3 text-xs outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="flex-1 rounded-xl bg-surface2 py-3 text-[10px] font-bold text-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-brand py-3 text-[10px] font-black uppercase text-foreground shadow-lg"
              >
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="pt-4">
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