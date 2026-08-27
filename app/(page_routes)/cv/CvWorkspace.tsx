"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ClipboardCopy, FileText, Home, Mail, Printer, Search, Waypoints, X } from "lucide-react";
import { CvDocument } from "./CvDocument";
import { auditJd, buildCorpus, DICT_CATEGORY_ORDER, type DictHit } from "./audit";
import { buildCoverLetter, parseCompanyInfo } from "./coverLetter";
import { cvVariantBySlug, cvVariants, type CvVariant } from "./variants";
import type { CvData } from "./types";

const JD_STORAGE_KEY = "cv:jd-audit";
const MIN_JD_LEN = 30;

const CL_COMPANY_KEY = "cv:cl-company";
const CL_NOTES_KEY = "cv:cl-notes";

export function CvWorkspace({ activeSlug, cv }: { activeSlug: string; cv: CvData }) {
  const corpus = useMemo(() => buildCorpus(cv), [cv]);
  const variant = useMemo(() => cvVariantBySlug(activeSlug) ?? cvVariants[0], [activeSlug]);

  return (
    <main className="min-h-screen bg-zinc-100 print:bg-white">
      <style>{`
        @media print {
          @page { size: letter; margin: 0.4in; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start print:block print:max-w-none print:p-0">
        <aside className="w-full shrink-0 lg:w-[330px] print:hidden">
          <div className="space-y-4 lg:sticky lg:top-6">
            <VariantNav activeSlug={activeSlug} />
            <JdAudit corpus={corpus} />
            <CoverLetter variant={variant} cv={cv} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 justify-center print:block">
          <CvDocument cv={cv} />
        </div>
      </div>
    </main>
  );
}

// ── variant switcher ────────────────────────────────────────

function VariantNav({ activeSlug }: { activeSlug: string }) {
  return (
    <nav className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">Résumé variants</h2>
        <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500">
          {cvVariants.length}
        </span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {cvVariants.map((v) => {
          const active = v.slug === activeSlug;
          return (
            <li key={v.path}>
              <Link
                href={v.path}
                aria-current={active ? "page" : undefined}
                className={`block rounded-lg border px-3 py-2 transition-colors ${
                  active
                    ? "border-teal-500 bg-teal-50"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[13px] font-semibold ${active ? "text-teal-800" : "text-zinc-900"}`}>
                    {v.name}
                  </span>
                  {active && <span className="text-[9px] font-bold uppercase tracking-wide text-teal-600">· viewing</span>}
                </div>
                <p className="text-[11px] text-zinc-500">{v.role}</p>
                <p className="mt-1 text-[11px] leading-snug text-zinc-400">{v.when}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {v.focus.map((f) => (
                    <span
                      key={f}
                      className={`rounded px-1.5 py-0.5 text-[9.5px] font-medium ${
                        active ? "bg-teal-100 text-teal-700" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 border-t border-zinc-100 pt-2.5 text-[10.5px] leading-snug text-zinc-400">
        New variant: add <code className="text-zinc-500">cv/&lt;slug&gt;/</code> + a line in{" "}
        <code className="text-zinc-500">variants.ts</code>.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-zinc-700 shadow-sm transition-colors hover:border-transparent hover:bg-teal-600 hover:text-white"
        >
          <Printer size={13} />
          Print / PDF
        </button>
        <Link
          href="/allan"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
        >
          <Waypoints size={13} />
          Portfolio
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
        >
          <Home size={13} />
          Home
        </Link>
      </div>
    </nav>
  );
}

// ── JD audit panel ──────────────────────────────────────────

function JdAudit({ corpus }: { corpus: string }) {
  const [jd, setJd] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCovered, setShowCovered] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(JD_STORAGE_KEY);
      if (saved) setJd(saved);
    } catch {
      /* sessionStorage unavailable — ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(JD_STORAGE_KEY, jd);
    } catch {
      /* ignore */
    }
  }, [jd]);

  const ready = jd.trim().length >= MIN_JD_LEN;
  const result = useMemo(() => (ready ? auditJd(jd, corpus) : null), [ready, jd, corpus]);

  const missing = result ? sortHits(result.missing) : [];
  const covered = result ? sortHits(result.covered) : [];

  async function copyMissing() {
    try {
      await navigator.clipboard.writeText(missing.map((h) => h.label).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Search size={13} className="text-teal-600" />
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">JD keyword audit</h2>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-zinc-400">
        Paste a job description — see which keywords this variant is missing before you tailor it.
      </p>

      <div className="relative mt-2.5">
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={7}
          spellCheck={false}
          placeholder="Paste the full job description here…"
          className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 font-mono text-[11.5px] leading-relaxed text-zinc-700 outline-none transition-colors focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
        />
        {jd && (
          <button
            type="button"
            onClick={() => setJd("")}
            title="Clear"
            className="absolute right-1.5 top-1.5 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {!ready && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
          <FileText size={12} />
          {jd.trim().length === 0 ? "Waiting for a job description…" : "Keep going — need a bit more text to analyze."}
        </p>
      )}

      {result && result.total === 0 && (
        <p className="mt-2 text-[11px] text-zinc-500">
          No known skill keywords detected yet. Paste more of the description, or the terms may be outside the audit
          dictionary — check &ldquo;other repeated terms&rdquo; below.
        </p>
      )}

      {result && result.total > 0 && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between text-[11px]">
            <span className="font-semibold text-zinc-700">Keyword coverage</span>
            <span className="tabular-nums text-zinc-500">
              <span className={`font-bold ${scoreText(result.score)}`}>{result.score}%</span> · {result.matched}/
              {result.total}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div className={`h-full rounded-full ${scoreBar(result.score)}`} style={{ width: `${result.score}%` }} />
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10.5px] font-bold uppercase tracking-wide text-amber-700">
              Missing from this variant ({missing.length})
            </h3>
            <button
              type="button"
              onClick={copyMissing}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
            >
              {copied ? <Check size={11} /> : <ClipboardCopy size={11} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {missing.map((h) => (
              <Chip key={h.label} tone="amber" label={h.label} title={h.category} />
            ))}
          </div>
        </div>
      )}

      {covered.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowCovered((s) => !s)}
            className="text-[10.5px] font-bold uppercase tracking-wide text-teal-700 transition-colors hover:text-teal-800"
          >
            {showCovered ? "▾" : "▸"} Already covered ({covered.length})
          </button>
          {showCovered && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {covered.map((h) => (
                <Chip key={h.label} tone="teal" label={h.label} title={h.category} />
              ))}
            </div>
          )}
        </div>
      )}

      {result && result.extra.length > 0 && (
        <div className="mt-3">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">
            Other repeated terms ({result.extra.length})
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {result.extra.map((t) => (
              <span
                key={t.term}
                className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10.5px] text-zinc-500"
              >
                {t.term}
                <span className="tabular-nums text-zinc-400">×{t.count}</span>
              </span>
            ))}
          </div>
          <p className="mt-1 text-[10px] leading-snug text-zinc-400">
            Not in the audit dictionary — skim for real skills worth adding.
          </p>
        </div>
      )}
    </section>
  );
}

function Chip({ label, tone, title }: { label: string; tone: "amber" | "teal"; title?: string }) {
  const cls =
    tone === "amber"
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : "border-teal-200 bg-teal-50 text-teal-700";
  return (
    <span title={title} className={`rounded border px-1.5 py-0.5 text-[10.5px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

function sortHits(hits: DictHit[]): DictHit[] {
  return [...hits].sort(
    (a, b) =>
      DICT_CATEGORY_ORDER.indexOf(a.category) - DICT_CATEGORY_ORDER.indexOf(b.category) ||
      a.label.localeCompare(b.label),
  );
}

function scoreText(score: number): string {
  if (score >= 80) return "text-teal-700";
  if (score >= 50) return "text-amber-600";
  return "text-rose-600";
}

function scoreBar(score: number): string {
  if (score >= 80) return "bg-teal-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

// ── cover letter panel ──────────────────────────────────────

function CoverLetter({ variant, cv }: { variant: CvVariant; cv: CvData }) {
  const [raw, setRaw] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setRaw(sessionStorage.getItem(CL_COMPANY_KEY) ?? "");
      setNotes(sessionStorage.getItem(CL_NOTES_KEY) ?? "");
    } catch {
      /* sessionStorage unavailable — ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CL_COMPANY_KEY, raw);
    } catch {
      /* ignore */
    }
  }, [raw]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CL_NOTES_KEY, notes);
    } catch {
      /* ignore */
    }
  }, [notes]);

  const info = useMemo(() => parseCompanyInfo(raw), [raw]);
  const ready = info.company.trim().length > 0;
  const letter = useMemo(
    () => (ready ? buildCoverLetter({ info, variant, cv, notes }) : ""),
    [ready, info, variant, cv, notes],
  );

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Mail size={13} className="text-teal-600" />
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">Cover letter</h2>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-zinc-400">
        Paste the company blurb or job posting — get a draft built from the{" "}
        <span className="font-semibold text-zinc-500">{variant.name}</span> variant.
      </p>

      <div className="relative mt-2.5">
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={5}
          spellCheck={false}
          placeholder={'Paste company info / job posting…\nLines like "Company: Acme" or "Hiring Manager: Dana" are picked up.'}
          className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 font-mono text-[11.5px] leading-relaxed text-zinc-700 outline-none transition-colors focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
        />
        {raw && (
          <button
            type="button"
            onClick={() => setRaw("")}
            title="Clear"
            className="absolute right-1.5 top-1.5 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {ready && (
        <div className="mt-2 flex flex-wrap gap-1">
          <DerivedChip label="Company" value={info.company} />
          <DerivedChip label="Role" value={info.role || variant.role} muted={!info.role} />
          {info.hiringManager && <DerivedChip label="Manager" value={info.hiringManager} />}
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        spellCheck={false}
        placeholder="Optional — why this company / a detail to emphasize (used verbatim as one paragraph)…"
        className="mt-2 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-[11.5px] leading-relaxed text-zinc-700 outline-none transition-colors focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
      />

      {!ready && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
          <FileText size={12} />
          {raw.trim().length === 0
            ? "Waiting for company info…"
            : 'Add a company name (or a "Company:" line) to generate.'}
        </p>
      )}

      {ready && (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10.5px] font-bold uppercase tracking-wide text-teal-700">Draft letter</h3>
            <button
              type="button"
              onClick={copyLetter}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
            >
              {copied ? <Check size={11} /> : <ClipboardCopy size={11} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="mt-1.5 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-700">
            {letter}
          </pre>
          <p className="mt-1 text-[10px] leading-snug text-zinc-400">
            Draft only — drop in the real hiring-manager name and a company-specific detail before sending.
          </p>
        </div>
      )}
    </section>
  );
}

function DerivedChip({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500">
      <span className="font-semibold uppercase tracking-wide text-zinc-400">{label}</span>
      <span className={muted ? "italic text-zinc-400" : "text-zinc-700"}>{value}</span>
    </span>
  );
}
