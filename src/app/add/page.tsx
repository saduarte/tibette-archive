"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TAG_OPTIONS } from "@/lib/data";

type SuggestedTag = (typeof TAG_OPTIONS)[number];

type FormState = {
  url: string;
  title: string;
  author: string;
  status: "WIP" | "COMPLETE";
  format: "ONESHOT" | "MULTI";
  chaptersTotal: string;
  year: string;
  tags: string[];
  rating: number;
  /* reason: string; */
  summary: string;
  submittedBy: string;
  signature: string;
};

function AddFicForm() {
  const searchParams = useSearchParams();
  const authorFromQuery = searchParams.get("author") ?? "";

  const [authorDirty, setAuthorDirty] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    url: "",
    title: "",
    author: "",
    status: "WIP",
    format: "MULTI",
    chaptersTotal: "",
    year: "",
    tags: [],
    rating: 1,
   /*  reason: "", */
    summary: "",
    submittedBy: "",
    signature: "",
  });

  useEffect(() => {
    if (!authorDirty && authorFromQuery) {
      setForm((prev) => ({ ...prev, author: authorFromQuery }));
    }
  }, [authorFromQuery, authorDirty]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (key === "author") setAuthorDirty(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function markTouched(key: keyof FormState) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function toggleTag(tag: string) {
    setForm((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag],
      };
    });
  }

  function addCustomTag() {
    const newTag = customTag.trim();
    if (!newTag) return;

    const alreadyExists = form.tags.some(
      (tag) => tag.toLowerCase() === newTag.toLowerCase()
    );

    if (!alreadyExists) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
    }

    setCustomTag("");
    markTouched("tags");
  }

  function removeTag(tagToRemove: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
    markTouched("tags");
  }

  function isSuggestedTag(tag: string): tag is SuggestedTag {
    return TAG_OPTIONS.includes(tag as SuggestedTag);
  }

  function isValidUrl(value: string) {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function validate(current: FormState) {
    const errors: Record<string, string> = {};

    if (!current.url.trim()) {
      errors.url = "Required.";
    } else if (!isValidUrl(current.url.trim())) {
      errors.url = "Please enter a valid URL (http/https).";
    }

    if (!current.title.trim()) errors.title = "Required.";
    if (!current.author.trim()) errors.author = "Required.";

    if (!current.year.trim()) {
      errors.year = "Required.";
    } else {
      const y = Number(current.year);
      const nowYear = new Date().getFullYear();

      if (!Number.isFinite(y)) {
        errors.year = "Invalid year.";
      } else if (y < 2004 || y > nowYear + 5) {
        errors.year = `Use a year between 2004 and ${nowYear + 5}.`;
      }
    }

    if (!current.tags.length) {
      errors.tags = "Required (select at least one tag).";
    }

    if (!current.summary.trim()) errors.summary = "Required.";
    if (!current.submittedBy.trim()) {
      errors.submittedBy = "Required (name or @).";
    }

    if (current.rating < 1 || current.rating > 5) {
      errors.rating = "Please select 1–5 stars.";
    }

    if (!current.format) errors.format = "Required.";

    if (current.format === "MULTI") {
      if (!current.chaptersTotal.trim()) {
        errors.chaptersTotal = "Required for multi-chapter.";
      } else {
        const n = Number(current.chaptersTotal);
        if (!Number.isFinite(n) || n < 2) {
          errors.chaptersTotal = "Enter 2 or more chapters.";
        }
      }
    }

    return errors;
  }

  const errors = useMemo(() => validate(form), [form]);

  const customSelectedTags = form.tags.filter((tag) => !isSuggestedTag(tag));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    setTouched({
      url: true,
      title: true,
      author: true,
      status: true,
      format: true,
      chaptersTotal: true,
      year: true,
      tags: true,
      rating: true,
     /*  reason: true, */
      summary: true,
      submittedBy: true,
      signature: true,
    });

    const currentErrors = validate(form);

    if (Object.keys(currentErrors).length > 0) {
      setSubmitError(
        "Missing required fields. Please check the highlighted items."
      );
      return;
    }

    setSubmitSuccess("Submitted. Your entry is pending review.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7 rounded-[2rem] border border-border/80 bg-surface p-6 shadow-[0_24px_50px_rgba(110,102,88,0.10)] md:p-8"
    >
      {submitError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {submitSuccess}
        </div>
      )}

      <Field label="URL Fic" hint="Direct link (AO3, LesFan, etc.)">
        <input
          name="url"
          inputMode="url"
          placeholder="https://…"
          value={form.url}
          onChange={(e) => setField("url", e.target.value)}
          onBlur={() => markTouched("url")}
          className={inputClass}
        />
        {touched.url && errors.url && <ErrorText>{errors.url}</ErrorText>}
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input
            name="title"
            placeholder="Story title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            onBlur={() => markTouched("title")}
            className={inputClass}
          />
          {touched.title && errors.title && (
            <ErrorText>{errors.title}</ErrorText>
          )}
        </Field>

        <Field label="Author">
          <input
            name="author"
            placeholder="Name / username / pen name"
            value={form.author}
            onChange={(e) => setField("author", e.target.value)}
            onBlur={() => markTouched("author")}
            className={inputClass}
          />
          {touched.author && errors.author && (
            <ErrorText>{errors.author}</ErrorText>
          )}
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Status">
          <select
            name="status"
            value={form.status}
            onChange={(e) =>
              setField("status", e.target.value as FormState["status"])
            }
            className={selectClass}
          >
            <option value="WIP">Work in progress (WIP)</option>
            <option value="COMPLETE">Complete</option>
          </select>
        </Field>

        <Field label="Format">
          <select
            name="format"
            value={form.format}
            onChange={(e) => {
              const value = e.target.value as FormState["format"];
              setField("format", value);

              if (value === "ONESHOT") {
                setField("chaptersTotal", "");
                setField("status", "COMPLETE");
              }
            }}
            onBlur={() => markTouched("format")}
            className={selectClass}
          >
            <option value="ONESHOT">One-shot</option>
            <option value="MULTI">Multi-chapter</option>
          </select>
        </Field>

        <Field label="Release year">
          <input
            name="year"
            type="number"
            min={2004}
            max={new Date().getFullYear() + 5}
            placeholder="2026"
            value={form.year}
            onChange={(e) => setField("year", e.target.value)}
            onBlur={() => markTouched("year")}
            className={inputClass}
          />
          {touched.year && errors.year && <ErrorText>{errors.year}</ErrorText>}
        </Field>
      </div>

      {form.format === "MULTI" && (
        <div className="max-w-xs">
          <Field label="Total chapters">
            <input
              name="chaptersTotal"
              type="number"
              min={2}
              placeholder="e.g. 45"
              value={form.chaptersTotal}
              onChange={(e) => setField("chaptersTotal", e.target.value)}
              onBlur={() => markTouched("chaptersTotal")}
              className={inputClass}
            />
            {touched.chaptersTotal && errors.chaptersTotal && (
              <ErrorText>{errors.chaptersTotal}</ErrorText>
            )}
          </Field>
        </div>
      )}

      <Field label="Tags" hint="Select all that apply, or add your own.">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {TAG_OPTIONS.map((tag) => {
            const checked = form.tags.includes(tag);

            return (
              <label
                key={tag}
                className={
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition " +
                  (checked
                    ? "border-brand/40 bg-brand/10 text-foreground"
                    : "border-border bg-surface2 text-muted hover:bg-surface")
                }
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTag(tag)}
                  onBlur={() => markTouched("tags")}
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand/35"
                />
                <span>{tag}</span>
              </label>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row md:w-2/5">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onBlur={() => markTouched("tags")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTag();
              }
            }}
            placeholder="Add another tag"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addCustomTag}
            className="rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-muted transition hover:bg-surface hover:text-foreground"
          >
            Add
          </button>
        </div>

        {customSelectedTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customSelectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2 px-3 py-1 text-xs text-foreground"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-muted transition hover:text-foreground"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {touched.tags && errors.tags && <ErrorText>{errors.tags}</ErrorText>}
      </Field>

      <Field
        label="Short summary"
        hint="Light on spoilers — just enough to remember it later."
      >
        <textarea
          name="summary"
          rows={5}
          placeholder="Two people who…"
          value={form.summary}
          onChange={(e) => setField("summary", e.target.value)}
          onBlur={() => markTouched("summary")}
          className={textareaClass}
        />
        {touched.summary && errors.summary && (
          <ErrorText>{errors.summary}</ErrorText>
        )}
      </Field>

      <Field label="Your rating" hint="1–5 stars">
        <StarRating
          name="rating"
          rating={form.rating}
          setRating={(n) => setField("rating", n)}
        />
        {touched.rating && errors.rating && (
          <ErrorText>{errors.rating}</ErrorText>
        )}
      </Field>

      {/* <Field label="Why add this?" hint="What makes it worth saving here.">
        <textarea
          name="reason"
          rows={3}
          value={form.reason}
          onChange={(e) => setField("reason", e.target.value)}
          onBlur={() => markTouched("reason")}
          className={textareaClass}
        />
        {touched.reason && errors.reason && <ErrorText>{errors.reason}</ErrorText>}
      </Field> */}

      <Field label="Submitted by" hint="So we can credit you (and follow up if needed).">
        <div className="md:w-2/5">
          <input
            name="submittedBy"
            placeholder="@username"
            value={form.submittedBy}
            onChange={(e) => setField("submittedBy", e.target.value)}
            onBlur={() => markTouched("submittedBy")}
            className={inputClass}
          />
        </div>
        {touched.submittedBy && errors.submittedBy && (
          <ErrorText>{errors.submittedBy}</ErrorText>
        )}
      </Field>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand2 active:scale-[0.98]"
        >
          Submit
        </button>

        <a
          href="/"
          className="rounded-xl border border-border bg-surface2 px-4 py-2 text-sm text-muted transition hover:bg-surface hover:text-foreground"
        >
          Back to archive
        </a>
      </div>

      <div className="space-y-2 border-t border-border/80 pt-6 text-xs text-muted">
        <p>
          This project does <span className="font-medium">not host</span>{" "}
          fanfiction files and does <span className="font-medium">not repost</span>{" "}
          content. It stores <span className="font-medium">links</span> and
          community-submitted notes.
        </p>
      </div>
    </form>
  );
}

export default function AddFicPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-10 py-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Add fic</h1>
      </header>

      <Suspense
        fallback={<div className="text-sm text-muted">Loading form...</div>}
      >
        <AddFicForm />
      </Suspense>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-700">{children}</p>;
}

function StarRating({
  name,
  rating,
  setRating,
}: {
  name: string;
  rating: number;
  setRating: (n: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={rating} />
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hover !== null ? star <= hover : star <= rating;

        return (
          <button
            key={star}
            type="button"
            aria-label={`${star} stars`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="transition-transform active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-6 w-6 transition-colors ${
                active ? "fill-amber-400" : "fill-amber-400/20"
              }`}
            >
              <path d="M12 2l2.9 6.1L22 9.2l-5 4.9 1.2 7L12 17.8 5.8 21.1 7 14.1 2 9.2l7.1-1.1L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-border/90 bg-surface2 px-4 py-3 text-sm shadow-sm " +
  "text-foreground placeholder:text-muted/70 transition focus:border-brand/40 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10";

const selectClass =
  "w-full rounded-2xl border border-border/90 bg-surface2 px-4 py-3 text-sm shadow-sm " +
  "text-foreground transition focus:border-brand/40 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10";

const textareaClass =
  "w-full resize-none rounded-2xl border border-border/90 bg-surface2 px-4 py-3 text-sm shadow-sm " +
  "text-foreground placeholder:text-muted/70 transition focus:border-brand/40 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10";