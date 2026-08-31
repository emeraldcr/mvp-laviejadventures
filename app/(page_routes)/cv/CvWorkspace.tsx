"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  FileText,
  Home,
  Mail,
  Printer,
  RotateCcw,
  Search,
  Star,
  Waypoints,
  X,
} from "lucide-react";
import { PrintPreview, type PreviewDoc } from "./PrintPreview";
import { PRINT_CSS } from "./design";
import { auditJd, buildCorpus, DICT_CATEGORY_ORDER, type AuditResult, type DictHit } from "./audit";
import { buildCoverLetter, parseCompanyInfo, type CompanyInfo } from "./coverLetter";
import { cvVariantBySlug, cvVariants, type CvVariant } from "./variants";
import { VARIANT_CORPUS, VARIANT_CV } from "./corpora";
import { useApplications, type UseApplications } from "./useApplications";
import type { CvData } from "./types";
import {
  APPS_VIEW_KEY,
  resolveView,
  SESSION_TYPE_LABEL,
  SESSION_TYPE_ORDER,
  SORT_LABEL,
  SORT_ORDER,
  STATUS_CLASS,
  STATUS_LABEL,
  STATUS_ORDER,
  defaultView,
  type ApplicationState,
  type ApplicationStatus,
  type SessionType,
  type SortMode,
  type ViewState,
} from "./applications";

const JD_STORAGE_KEY = "cv:jd-audit";
const PREVIEW_DOC_KEY = "cv:preview-doc";
const MIN_JD_LEN = 30;

const today = () => new Date().toISOString().slice(0, 10);

function clampInt(raw: string, lo: number, hi: number): number {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

export function CvWorkspace({ activeSlug, cv }: { activeSlug: string; cv: CvData }) {
  const corpus = useMemo(() => buildCorpus(cv), [cv]);
  const variant = useMemo(() => cvVariantBySlug(activeSlug) ?? cvVariants[0], [activeSlug]);
  const apps = useApplications();

  const [jd, setJd] = useState("");
  const [auditOpen, setAuditOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [letterCompany, setLetterCompany] = useState("");
  const [previewDoc, setPreviewDoc] = useState<PreviewDoc>("resume");
  const [printSignal, setPrintSignal] = useState(0);

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

  useEffect(() => {
    try {
      const v = localStorage.getItem(PREVIEW_DOC_KEY);
      if (v === "resume" || v === "letter" || v === "both") setPreviewDoc(v);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(PREVIEW_DOC_KEY, previewDoc);
    } catch {
      /* ignore */
    }
  }, [previewDoc]);

  const audit = useMemo(
    () => (jd.trim().length >= MIN_JD_LEN ? auditJd(jd, corpus) : null),
    [jd, corpus],
  );

  // Point the preview at the chosen document, give React two frames to paint it,
  // then open the print dialog — what you see in the preview is what prints.
  const requestPrint = useCallback((doc: PreviewDoc) => {
    setPreviewDoc(doc);
    setPrintSignal((n) => n + 1);
  }, []);
  const handleLetter = useCallback((letter: string | null, company?: string) => {
    setCoverLetter(letter);
    setLetterCompany(company ?? "");
  }, []);
  const printLetterNow = useCallback(() => requestPrint("letter"), [requestPrint]);
  useEffect(() => {
    if (printSignal === 0) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => window.print());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [printSignal]);

  return (
    <main className="min-h-screen bg-zinc-100 print:bg-white">
      <style>{PRINT_CSS}</style>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start print:block print:max-w-none print:p-0">
        <aside className="w-full shrink-0 lg:w-[330px] print:hidden">
          <div className="space-y-4 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:pr-1">
            <VariantNav
              activeSlug={activeSlug}
              apps={apps}
              jd={jd}
              audit={audit}
              coverLetter={coverLetter}
              onOpenAudit={() => setAuditOpen(true)}
              onPrint={requestPrint}
            />
            <CoverLetter variant={variant} cv={cv} onLetter={handleLetter} onPrint={printLetterNow} />
          </div>
        </aside>

        <div className="min-w-0 flex-1 print:block">
          <PrintPreview
            cv={cv}
            letter={coverLetter}
            company={letterCompany}
            docMode={previewDoc}
            onDocMode={setPreviewDoc}
          />
        </div>
      </div>

      {auditOpen && (
        <Modal title="JD keyword audit" onClose={() => setAuditOpen(false)}>
          <JdAudit jd={jd} setJd={setJd} result={audit} />
        </Modal>
      )}
    </main>
  );
}

// ── variant switcher + application tracker ───────────────────

function VariantNav({
  activeSlug,
  apps,
  jd,
  audit,
  coverLetter,
  onOpenAudit,
  onPrint,
}: {
  activeSlug: string;
  apps: UseApplications;
  jd: string;
  audit: AuditResult | null;
  coverLetter: string | null;
  onOpenAudit: () => void;
  onPrint: (doc: PreviewDoc) => void;
}) {
  const [view, setView] = useState<ViewState>(defaultView);
  const [openSlug, setOpenSlug] = useState<string | null>(activeSlug || "");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APPS_VIEW_KEY);
      if (raw) setView(resolveView(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(APPS_VIEW_KEY, JSON.stringify(view));
    } catch {
      /* ignore */
    }
  }, [view]);

  const patchView = (p: Partial<ViewState>) => setView((v) => ({ ...v, ...p }));

  const jdReady = jd.trim().length >= MIN_JD_LEN;
  const matchScores = useMemo(() => {
    const out: Record<string, number> = {};
    if (!jdReady) return out;
    for (const v of cvVariants) out[v.slug] = auditJd(jd, VARIANT_CORPUS[v.slug] ?? "").score;
    return out;
  }, [jd, jdReady]);

  const tally = useMemo(() => {
    const t = {} as Record<ApplicationStatus, number>;
    for (const v of cvVariants) {
      const s = apps.get(v.slug).status;
      t[s] = (t[s] ?? 0) + 1;
    }
    return t;
  }, [apps]);

  const rows = useMemo(() => {
    const q = view.query.trim().toLowerCase();
    const base = cvVariants.map((v, i) => ({
      v,
      i,
      st: apps.get(v.slug),
      match: jdReady ? matchScores[v.slug] ?? 0 : null,
    }));

    const filtered = base.filter(({ v, st }) => {
      if (v.slug === activeSlug) return true; // never hide what you're viewing
      if (view.status !== "all" && st.status !== view.status) return false;
      if (view.emailOnly && !st.checkEmail) return false;
      if (q) {
        const hay = `${v.name} ${v.role} ${v.company ?? ""} ${v.postingTitle ?? ""} ${st.stage} ${st.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const ts = (s: string) => (s ? Date.parse(s) || 0 : 0);
    const recency = (r: (typeof filtered)[number]) => ts(r.st.updatedOn) || ts(r.v.tailoredOn ?? "");
    const byMode: Record<SortMode, (a: (typeof filtered)[number], b: (typeof filtered)[number]) => number> = {
      recent: (a, b) => recency(b) - recency(a) || a.i - b.i,
      relevant: (a, b) => b.st.priority - a.st.priority || recency(b) - recency(a) || a.i - b.i,
      match: (a, b) => (b.match ?? -1) - (a.match ?? -1) || a.i - b.i,
      az: (a, b) => a.v.name.localeCompare(b.v.name),
    };
    const mode: SortMode = view.sort === "match" && !jdReady ? "recent" : view.sort;
    return [...filtered].sort(byMode[mode]);
  }, [view, apps, matchScores, jdReady, activeSlug]);

  const total = cvVariants.length;
  const filtersOn = view.status !== "all" || view.emailOnly || view.query.trim() !== "";
  const progressPills = STATUS_ORDER.filter((s) => s !== "draft" && (tally[s] ?? 0) > 0);

  return (
    <nav className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">Résumé variants</h2>
        <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500">
          {rows.length === total ? total : `${rows.length}/${total}`}
        </span>
      </div>

      {progressPills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {progressPills.map((s) => (
            <span
              key={s}
              className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${STATUS_CLASS[s]}`}
            >
              {tally[s]} {STATUS_LABEL[s]}
            </span>
          ))}
        </div>
      )}

      {/* filter + sort toolbar */}
      <div className="mt-3 space-y-2">
        <div className="relative">
          <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={view.query}
            onChange={(e) => patchView({ query: e.target.value })}
            placeholder="Filter by name, company, notes…"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-7 pr-6 text-[11.5px] text-zinc-700 outline-none transition-colors focus:border-teal-500 focus:bg-white"
          />
          {view.query && (
            <button
              type="button"
              onClick={() => patchView({ query: "" })}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-400">Sort</span>
          <div className="flex flex-1 overflow-hidden rounded-lg border border-zinc-200">
            {SORT_ORDER.map((m) => {
              const on = view.sort === m;
              const disabled = m === "match" && !jdReady;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={disabled}
                  title={disabled ? "Open the JD keyword audit to rank by match" : undefined}
                  onClick={() => patchView({ sort: m })}
                  className={`flex-1 px-1 py-1 text-[10px] font-semibold transition-colors ${
                    on
                      ? "bg-teal-600 text-white"
                      : disabled
                        ? "bg-white text-zinc-300"
                        : "bg-white text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  {SORT_LABEL[m]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <select
            value={view.status}
            onChange={(e) => patchView({ status: e.target.value as ViewState["status"] })}
            className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 outline-none transition-colors focus:border-teal-500"
          >
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => patchView({ emailOnly: !view.emailOnly })}
            title="Only applications waiting on an email"
            className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors ${
              view.emailOnly
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <Mail size={11} />
            Email
          </button>
        </div>

        {filtersOn && (
          <button
            type="button"
            onClick={() => patchView({ status: "all", emailOnly: false, query: "" })}
            className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-800"
          >
            Clear filters
          </button>
        )}
      </div>

      <ul className="mt-3 space-y-1.5">
        {rows.map(({ v, st, match }) => {
          const active = v.slug === activeSlug;
          const open = openSlug === v.slug;
          return (
            <li
              key={v.path}
              className={`overflow-hidden rounded-lg border transition-colors ${
                active ? "border-teal-500 bg-teal-50" : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <Link href={v.path} aria-current={active ? "page" : undefined} className="block px-3 py-2">
                <div className="flex items-start justify-between gap-1.5">
                  <span className={`text-[13px] font-semibold ${active ? "text-teal-800" : "text-zinc-900"}`}>
                    {v.name}
                    {active && (
                      <span className="ml-1 text-[9px] font-bold uppercase tracking-wide text-teal-600">· viewing</span>
                    )}
                  </span>
                  {v.company && (
                    <span
                      title={`Tailored for ${v.company}`}
                      className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        active ? "border-teal-300 bg-white text-teal-700" : "border-indigo-200 bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {v.company}
                    </span>
                  )}
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

              <div className={`border-t px-3 py-1.5 ${active ? "border-teal-200/70" : "border-zinc-100"}`}>
                <div className="flex items-center gap-1.5">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span
                      className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${STATUS_CLASS[st.status]}`}
                    >
                      {STATUS_LABEL[st.status]}
                    </span>
                    {st.sessionTotal > 0 && (
                      <span className="shrink-0 text-[10px] font-semibold tabular-nums text-zinc-500">
                        {st.sessionCurrent}/{st.sessionTotal}
                      </span>
                    )}
                    {st.sessionType !== "none" && (
                      <span className="truncate text-[10px] text-zinc-400">{SESSION_TYPE_LABEL[st.sessionType]}</span>
                    )}
                    {st.checkEmail && <Mail size={11} className="shrink-0 text-amber-500" />}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {st.priority > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-500" title={`Priority ${st.priority}/5`}>
                        <Star size={10} fill="currentColor" />
                        <span className="text-[10px] font-semibold tabular-nums">{st.priority}</span>
                      </span>
                    )}
                    {match != null && (
                      <span
                        className="rounded bg-zinc-100 px-1 text-[9px] font-bold tabular-nums text-zinc-500"
                        title="Keyword match vs the pasted job description"
                      >
                        {match}%
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenSlug(open ? null : v.slug)}
                      aria-label={open ? "Hide pipeline" : "Edit pipeline"}
                      className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                    >
                      {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>
                  </div>
                </div>

                {open && <PipelineEditor variant={v} st={st} apps={apps} />}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 border-t border-zinc-100 pt-2.5 text-[10.5px] leading-snug text-zinc-400">
        New variant: add <code className="text-zinc-500">cv/&lt;slug&gt;/</code> + a line in{" "}
        <code className="text-zinc-500">variants.ts</code>. Pipeline state is stored locally in this browser.
      </p>

      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={onOpenAudit}
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold shadow-sm transition-colors ${
            audit
              ? "border-teal-500 bg-teal-50 text-teal-700 hover:bg-teal-100"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-transparent hover:bg-teal-600 hover:text-white"
          }`}
        >
          <Search size={13} />
          JD keyword audit
          {audit && (
            <span className="rounded bg-teal-600 px-1 text-[9px] font-bold tabular-nums text-white">{audit.score}%</span>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-zinc-400">Print</span>
          <button
            type="button"
            onClick={() => onPrint("resume")}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-zinc-700 shadow-sm transition-colors hover:border-transparent hover:bg-teal-600 hover:text-white"
          >
            <FileText size={12} />
            Résumé
          </button>
          <button
            type="button"
            onClick={() => onPrint("letter")}
            disabled={!coverLetter}
            title={coverLetter ? "Print the drafted cover letter" : "Draft a cover letter below to enable"}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-zinc-700 shadow-sm transition-colors hover:border-transparent hover:bg-teal-600 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-300 disabled:shadow-none disabled:hover:bg-zinc-50 disabled:hover:text-zinc-300"
          >
            <Mail size={12} />
            Letter
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/allan"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
          >
            <Waypoints size={12} />
            Portfolio
          </Link>
          <Link
            href="/"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
          >
            <Home size={12} />
            Home
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── per-application pipeline editor ──────────────────────────

function PipelineEditor({
  variant,
  st,
  apps,
}: {
  variant: CvVariant;
  st: ApplicationState;
  apps: UseApplications;
}) {
  const slug = variant.slug;
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<ApplicationState>) => apps.update(slug, patch);

  function onStatus(next: ApplicationStatus) {
    const patch: Partial<ApplicationState> = { status: next };
    if (next !== "draft" && next !== "archived" && next !== "rejected" && !st.appliedOn) patch.appliedOn = today();
    set(patch);
  }

  async function copyLetter() {
    const info: CompanyInfo = {
      company: variant.company ?? "",
      role: variant.postingTitle || variant.role,
      location: variant.location ?? "",
      hiringManager: variant.hiringManager ?? "",
    };
    const letter = buildCoverLetter({
      info,
      variant,
      cv: VARIANT_CV[slug] ?? VARIANT_CV[""],
      notes: variant.coverLetterNotes,
    });
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const fieldCls =
    "mt-0.5 w-full rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px] text-zinc-700 outline-none focus:border-teal-500";
  const labelCls = "text-[9px] font-bold uppercase tracking-wide text-zinc-400";

  return (
    <div className="mt-2 space-y-2 border-t border-zinc-100 pt-2">
      <label className="block">
        <span className={labelCls}>Status</span>
        <select value={st.status} onChange={(e) => onStatus(e.target.value as ApplicationStatus)} className={fieldCls}>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelCls}>Round / type</span>
        <select
          value={st.sessionType}
          onChange={(e) => set({ sessionType: e.target.value as SessionType })}
          className={fieldCls}
        >
          {SESSION_TYPE_ORDER.map((s) => (
            <option key={s} value={s}>
              {SESSION_TYPE_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <label className="flex-1">
          <span className={labelCls}>Sessions</span>
          <div className="mt-0.5 flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={20}
              value={st.sessionCurrent}
              onChange={(e) => set({ sessionCurrent: clampInt(e.target.value, 0, 20) })}
              className="w-11 rounded border border-zinc-200 bg-white px-1 py-1 text-center text-[11px] text-zinc-700 outline-none focus:border-teal-500"
            />
            <span className="text-zinc-400">/</span>
            <input
              type="number"
              min={0}
              max={20}
              value={st.sessionTotal}
              onChange={(e) => set({ sessionTotal: clampInt(e.target.value, 0, 20) })}
              className="w-11 rounded border border-zinc-200 bg-white px-1 py-1 text-center text-[11px] text-zinc-700 outline-none focus:border-teal-500"
            />
          </div>
        </label>
        <label className="flex-1">
          <span className={labelCls}>Applied on</span>
          <input
            type="date"
            value={st.appliedOn}
            onChange={(e) => set({ appliedOn: e.target.value })}
            className={fieldCls}
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className={labelCls}>Priority</span>
          <div className="mt-0.5 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set({ priority: st.priority === n ? 0 : n })}
                aria-label={`Priority ${n} of 5`}
                className="text-zinc-300 transition-colors hover:text-amber-400"
              >
                <Star
                  size={13}
                  className={n <= st.priority ? "text-amber-400" : ""}
                  fill={n <= st.priority ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={st.checkEmail}
            onChange={(e) => set({ checkEmail: e.target.checked })}
            className="h-3.5 w-3.5 accent-amber-500"
          />
          <span className="text-[10px] font-semibold text-zinc-600">Check email</span>
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>Notes</span>
        <textarea
          value={st.notes}
          onChange={(e) => set({ notes: e.target.value })}
          rows={2}
          spellCheck={false}
          placeholder="Recruiter name, next step, salary talk…"
          className="mt-0.5 w-full resize-y rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px] leading-relaxed text-zinc-700 outline-none focus:border-teal-500"
        />
      </label>

      <div className="flex items-center justify-between pt-0.5">
        {variant.company ? (
          <button
            type="button"
            onClick={copyLetter}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 transition-colors hover:bg-teal-50"
          >
            {copied ? <Check size={11} /> : <Mail size={11} />}
            {copied ? "Copied" : "Copy cover letter"}
          </button>
        ) : (
          <span className="text-[10px] text-zinc-300">No company set in variants.ts</span>
        )}
        <button
          type="button"
          onClick={() => apps.reset(slug)}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>
    </div>
  );
}

// ── JD audit panel ──────────────────────────────────────────

function JdAudit({
  jd,
  setJd,
  result,
}: {
  jd: string;
  setJd: (v: string) => void;
  result: AuditResult | null;
}) {
  const [copied, setCopied] = useState(false);
  const [showCovered, setShowCovered] = useState(false);

  const ready = result != null;
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
    <div>
      <p className="text-[11px] leading-snug text-zinc-500">
        Paste a job description — see which keywords this variant is missing, and rank every variant by match with the{" "}
        <span className="font-semibold text-zinc-600">Match</span> sort in the sidebar.
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
    </div>
  );
}

function Chip({ label, tone, title }: { label: string; tone: "amber" | "teal"; title?: string }) {
  const cls =
    tone === "amber" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-teal-200 bg-teal-50 text-teal-700";
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

function CoverLetter({
  variant,
  cv,
  onLetter,
  onPrint,
}: {
  variant: CvVariant;
  cv: CvData;
  onLetter: (letter: string | null, company?: string) => void;
  onPrint: () => void;
}) {
  const slug = variant.slug || "base";
  const companyKey = `cv:cl-company:${slug}`;
  const notesKey = `cv:cl-notes:${slug}`;

  const [raw, setRaw] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    try {
      setRaw(sessionStorage.getItem(companyKey) ?? "");
      setNotes(sessionStorage.getItem(notesKey) ?? "");
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [companyKey, notesKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(companyKey, raw);
    } catch {
      /* ignore */
    }
  }, [raw, companyKey, loaded]);
  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(notesKey, notes);
    } catch {
      /* ignore */
    }
  }, [notes, notesKey, loaded]);

  const pasted = useMemo(() => parseCompanyInfo(raw), [raw]);
  const usingPaste = raw.trim().length > 0 && pasted.company.trim().length > 0;
  const hasRegistry = Boolean(variant.company);

  const info: CompanyInfo = useMemo(
    () =>
      usingPaste
        ? pasted
        : {
            company: variant.company ?? "",
            role: variant.postingTitle || variant.role,
            location: variant.location ?? "",
            hiringManager: variant.hiringManager ?? "",
          },
    [usingPaste, pasted, variant],
  );
  const effectiveNotes = usingPaste ? notes : notes || variant.coverLetterNotes || "";
  const ready = info.company.trim().length > 0;

  const letter = useMemo(
    () => (ready ? buildCoverLetter({ info, variant, cv, notes: effectiveNotes }) : ""),
    [ready, info, variant, cv, effectiveNotes],
  );

  useEffect(() => {
    onLetter(ready ? letter : null, info.company);
  }, [ready, letter, info.company, onLetter]);

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
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Mail size={13} className="text-teal-600" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">Cover letter</h2>
        </div>
        {ready && (
          <span
            className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
              usingPaste ? "border-zinc-200 bg-zinc-50 text-zinc-500" : "border-teal-200 bg-teal-50 text-teal-700"
            }`}
          >
            {usingPaste ? "From pasted text" : "Auto · variants.ts"}
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] leading-snug text-zinc-400">
        {hasRegistry ? (
          <>
            Auto-drafted for <span className="font-semibold text-zinc-500">{variant.company}</span> from the{" "}
            <span className="font-semibold text-zinc-500">{variant.name}</span> variant. Paste below to override.
          </>
        ) : (
          <>
            Paste the company blurb or job posting — get a draft built from the{" "}
            <span className="font-semibold text-zinc-500">{variant.name}</span> variant. Set{" "}
            <code className="text-zinc-500">company</code> in <code className="text-zinc-500">variants.ts</code> to
            auto-fill it.
          </>
        )}
      </p>

      <div className="relative mt-2.5">
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder={
            hasRegistry
              ? "Override — paste company info / job posting to replace the auto draft…"
              : 'Paste company info / job posting…\nLines like "Company: Acme" or "Hiring Manager: Dana" are picked up.'
          }
          className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 font-mono text-[11.5px] leading-relaxed text-zinc-700 outline-none transition-colors focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
        />
        {raw && (
          <button
            type="button"
            onClick={() => setRaw("")}
            title="Clear override"
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
          {variant.contactEmail && !usingPaste && <DerivedChip label="Send to" value={variant.contactEmail} />}
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
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
              >
                <Printer size={11} />
                Print
              </button>
              <button
                type="button"
                onClick={copyLetter}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
              >
                {copied ? <Check size={11} /> : <ClipboardCopy size={11} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
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

// ── audit modal ─────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/50 p-4 backdrop-blur-sm sm:p-6 print:hidden"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="relative my-4 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:my-10"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Search size={13} className="text-teal-600" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={15} />
          </button>
        </div>
        <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
