"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Search, X } from "lucide-react";
import { STATUS_LABEL, STATUS_ORDER } from "../../applications";
import { TOTAL_JOBS } from "../constants";
import { useJobBoard } from "../context";
import type { StatusFilter } from "../types";
import { JobRow } from "./JobRow";
import { Stat } from "./Stat";

export function JobBoardScreen() {
  const board = useJobBoard();
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Link href="/cv" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-teal-300"><ArrowLeft size={14} /> Back to CV workspace</Link>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300 ring-1 ring-inset ring-teal-400/20"><BriefcaseBusiness size={22} /></span>
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-400">2026 application campaign</p><h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">100 Java + React jobs</h1></div>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">One focused pipeline for remote global and LATAM senior roles: 10 jobs with aligned CVs plus 90 researched remote leads. Exact Java + React titles rank first; country eligibility, posting status, and broader search matches must be verified before applying.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Jobs saved" value={`${board.stats.filled}/${TOTAL_JOBS}`} tone="teal" />
              <Stat label="Applied" value={board.stats.applied} tone="sky" />
              <Stat label="In progress" value={board.stats.active} tone="amber" />
              <Stat label="Offers" value={board.stats.offers} tone="emerald" />
            </div>
          </div>
        </header>

        <section className="sticky top-0 z-20 mt-4 rounded-xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={board.query} onChange={(event) => board.setQuery(event.target.value)} placeholder="Search company, role, location, stage, or notes…" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-9 text-sm text-white outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              {board.query ? <button type="button" onClick={() => board.setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white"><X size={13} /></button> : null}
            </div>
            <select value={board.statusFilter} onChange={(event) => board.setStatusFilter(event.target.value as StatusFilter)} aria-label="Filter applications by status" className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-teal-500">
              <option value="all">All statuses</option>
              {STATUS_ORDER.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
            </select>
            <button type="button" onClick={() => board.setFilledOnly((current) => !current)} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${board.filledOnly ? "border-teal-500 bg-teal-500/15 text-teal-300" : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white"}`}>{board.filledOnly ? "Showing saved jobs" : "Show saved only"}</button>
            <span className="px-1 text-right text-xs font-semibold tabular-nums text-zinc-500">{board.rows.length} of {TOTAL_JOBS} rows</span>
          </div>
        </section>

        <section aria-label="Java and React job applications" className="mt-4 space-y-2">
          {board.rows.map(({ job, index, state }) => <JobRow key={job.id} job={job} number={index + 1} state={state} open={board.openId === job.id} onToggle={() => board.toggleOpen(job.id)} onJobChange={(patch) => board.updateJob(job.id, patch)} onApplicationChange={(patch) => board.updateApplication(job.applicationSlug, patch)} />)}
        </section>
        {board.rows.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-500">No applications match these filters.</div> : null}
      </div>
    </main>
  );
}
