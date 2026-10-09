"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Search, X } from "lucide-react";
import { STATUS_LABEL, STATUS_ORDER } from "../applications";
import { JOB_TRACKS } from "../java-react-jobs-data";
import type { StatusFilter, TrackFilter } from "../java-react-jobs-types";
import { useJobBoard } from "./JavaReactJobsContext";
import { JobRow } from "./JobBoardRow";
import { Stat } from "./JobBoardStat";

export function JobBoardScreen() {
  const board = useJobBoard();
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Link href="/cv" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-teal-300">
                <ArrowLeft size={14} /> Back to CV workspace
              </Link>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300 ring-1 ring-inset ring-teal-400/20">
                  <BriefcaseBusiness size={22} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-400">Complete search archive</p>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">All software jobs</h1>
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
                Every unique role consolidated through October 8, 2026. Data ships with the app and application updates stay in this browser; no MongoDB is used. CV suggestions reuse only existing variants and general matches still need a posting review.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Jobs saved" value={board.stats.filled} tone="teal" />
              <Stat label="Strong CV matches" value={board.stats.matched} tone="sky" />
              <Stat label="In progress" value={board.stats.active} tone="amber" />
              <Stat label="Offers" value={board.stats.offers} tone="emerald" />
            </div>
          </div>
        </header>

        <section className="sticky top-0 z-20 mt-4 rounded-xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={board.query}
                onChange={(event) => board.setQuery(event.target.value)}
                placeholder="Search company, role, stack, location, stage, or notes…"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-9 text-sm text-white outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              {board.query ? (
                <button type="button" onClick={() => board.setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white">
                  <X size={13} />
                </button>
              ) : null}
            </div>
            <select value={board.trackFilter} onChange={(event) => board.setTrackFilter(event.target.value as TrackFilter)} aria-label="Filter jobs by technical track" className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-teal-500">
              <option value="all">All technical tracks</option>
              {JOB_TRACKS.map((track) => <option key={track} value={track}>{track}</option>)}
            </select>
            <select value={board.statusFilter} onChange={(event) => board.setStatusFilter(event.target.value as StatusFilter)} aria-label="Filter applications by status" className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-teal-500">
              <option value="all">All statuses</option>
              {STATUS_ORDER.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
            </select>
            <span className="px-1 text-right text-xs font-semibold tabular-nums text-zinc-500">{board.rows.length} of {board.stats.filled} jobs</span>
          </div>
        </section>

        <section aria-label="All software job applications" className="mt-4 space-y-2">
          {board.rows.map(({ job, index, state }) => (
            <JobRow
              key={job.id}
              job={job}
              number={index + 1}
              state={state}
              open={board.openId === job.id}
              onToggle={() => board.toggleOpen(job.id)}
              onJobChange={(patch) => board.updateJob(job.id, patch)}
              onApplicationChange={(patch) => board.updateApplication(job.applicationSlug, patch)}
            />
          ))}
        </section>
        {board.rows.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-500">No jobs match these filters.</div> : null}
      </div>
    </main>
  );
}
