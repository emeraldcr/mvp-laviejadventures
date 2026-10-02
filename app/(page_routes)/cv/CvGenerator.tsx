"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Archive, ArrowRight, FileText, Loader2 } from "lucide-react";
import type { GenerationSummary } from "@/lib/cv/types";

const DRAFT_KEY = "cv:jd-generator-draft:v1";
const field = "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function CvGenerator({ initiallySignedIn, initialJd = "" }: { initiallySignedIn: boolean; initialJd?: string }) {
  const router = useRouter();
  const [jd, setJd] = useState(initialJd);
  const [signedIn, setSignedIn] = useState(initiallySignedIn);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationSummary[]>([]);
  const [failedId, setFailedId] = useState<string | null>(null);
  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/cv/generations", { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) { setSignedIn(false); return; }
      if (!response.ok) throw new Error(data.error);
      setHistory(data.generations);
      setHistoryError(null);
    } catch { setHistoryError("Saved CVs could not be loaded."); }
  }, []);
  useEffect(() => { if (!initialJd) { try { setJd(sessionStorage.getItem(DRAFT_KEY) ?? ""); } catch {} } }, [initialJd]);
  useEffect(() => { if (signedIn) void loadHistory(); }, [signedIn, loadHistory]);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(null); setFailedId(null);
    try {
      const response = await fetch("/api/cv/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobDescription: jd }) });
      const data = await response.json();
      if (response.status === 401) setSignedIn(false);
      if (!response.ok) { setFailedId(data.id ?? null); throw new Error(data.error || "Generation failed."); }
      router.push(data.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The server could not be reached. Your pasted description is still here.");
      void loadHistory();
    } finally { setBusy(false); }
  }
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: form.get("username"), password: form.get("password") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign-in failed.");
      setSignedIn(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign-in failed."); }
    finally { setBusy(false); }
  }
  return (
    <main className="min-h-screen bg-[#f5f4f0] px-5 py-10 text-zinc-900 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-12 flex items-center justify-between text-sm">
          <Link href="/cv" className="flex items-center gap-2 font-semibold"><FileText size={18} /> CV Studio</Link>
          <Link href="/cv/archive" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"><Archive size={16} /> Old CV archive</Link>
        </nav>
        <header className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Your experience. A sharper fit.</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Paste the job.<br />Make it your CV.</h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-600">Paste the full job description, messy bits included. We’ll clean it up, find the relevant keywords, and tailor your profile, skills, and experience using your existing CVs.</p>
        </header>
        <form onSubmit={generate} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <label htmlFor="job-description" className="mb-3 block text-sm font-semibold">Job description</label>
          <textarea id="job-description" value={jd} onChange={(event) => { setJd(event.target.value); try { sessionStorage.setItem(DRAFT_KEY, event.target.value); } catch {} }}
            placeholder={"Paste the role, responsibilities, and requirements here…\n\nYou can copy straight from the job page."}
            required minLength={100} maxLength={40_000} disabled={busy} className={`${field} min-h-[340px] resize-y leading-relaxed sm:min-h-[420px]`} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-zinc-500">{jd.length.toLocaleString()} / 40,000 characters</span>
            <button type="submit" disabled={busy || !signedIn || jd.trim().length < 100} className="inline-flex items-center gap-3 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40">
              {busy ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}{busy ? "Working…" : "Generate my CV"}
            </button>
          </div>
          {busy && signedIn && <p role="status" className="mt-4 text-sm text-zinc-500">Cleaning the JD, tailoring your CV, and checking the evidence. This can take a few minutes.</p>}
        </form>
        {!signedIn && <form onSubmit={signIn} className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="mb-4 text-sm text-zinc-600">Sign in with your existing admin account to generate and save your CVs.</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-xs font-medium">Username<input name="username" autoComplete="username" required className={`${field} mt-1`} /></label>
            <label className="text-xs font-medium">Password<input name="password" type="password" autoComplete="current-password" required className={`${field} mt-1`} /></label>
            <button disabled={busy} className="self-end rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Sign in</button>
          </div>
        </form>}
        {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}{failedId && <Link href={`/cv/generated/${failedId}`} className="ml-2 underline">View saved attempt</Link>}</div>}
        <p className="mt-5 text-xs leading-relaxed text-zinc-500">Your original CVs stay archived. Every new CV is saved separately, with the keywords used and any requirements your existing experience doesn’t support.</p>
        {signedIn && <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Recent CVs</h2>
          {historyError && <p role="status" className="text-sm text-zinc-500">{historyError} <button onClick={() => void loadHistory()} className="underline">Retry</button></p>}
          {!history.length && !historyError && <p className="text-sm text-zinc-500">Your generated CVs will appear here.</p>}
          <div className="divide-y divide-zinc-200">
            {history.map((item) => <Link key={item.id} href={`/cv/generated/${item.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-teal-700">
              <div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-zinc-500">{item.company ? `${item.company} · ` : ""}{new Date(item.createdAt).toLocaleDateString("en-US", { timeZone: "America/Costa_Rica" })}</p></div>
              <span className="text-xs text-zinc-500">{item.status === "complete" ? "Open CV →" : item.status === "error" ? "Needs retry" : "Generating"}</span>
            </Link>)}
          </div>
        </section>}
      </div>
    </main>
  );
}
