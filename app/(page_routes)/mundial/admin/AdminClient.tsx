"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Loader2, RefreshCw, Shield, Tv2, Trophy, Users } from "lucide-react";
import type { AdminData, AdminView } from "./adminTypes";
import { cn } from "../utils";
import { AdminLeaderboard } from "./components/AdminLeaderboard";
import { MatchAdminCard } from "./components/MatchAdminCard";
import { StatQuestionsManager } from "./components/StatQuestionsManager";

const ADMIN_API = "/api/mundial/admin";
const MATCH_API = "/api/mundial/admin/match";
const STAT_Q_API = "/api/mundial/admin/stat-questions";

const VIEW_OPTIONS: Array<{ id: AdminView; label: string; icon: React.ReactNode }> = [
  { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="h-4 w-4" /> },
  { id: "matches", label: "Partidos", icon: <Tv2 className="h-4 w-4" /> },
  { id: "stats", label: "Stats & Apuestas", icon: <BarChart3 className="h-4 w-4" /> },
];

type MatchFilter = "all" | "open" | "closed" | "scored";
const FILTER_OPTIONS: Array<{ id: MatchFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "open", label: "Abiertos" },
  { id: "closed", label: "Cerrados" },
  { id: "scored", label: "Con resultado" },
];

export default function AdminClient() {
  const [data, setData] = useState<AdminData | null>(null);
  const [view, setView] = useState<AdminView>("leaderboard");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(ADMIN_API, { cache: "no-store" });
      if (!res.ok) throw new Error("Error cargando datos.");
      setData(await res.json());
    } catch {
      setError("No se pudo cargar el panel de admin.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function patchMatch(matchId: string, patch: Record<string, unknown>) {
    const res = await fetch(MATCH_API, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, ...patch }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Error actualizando partido.");
    }
    await load();
  }

  async function createStatQuestion(matchId: string, text: string, options: string[]) {
    const res = await fetch(STAT_Q_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, text, options }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Error creando pregunta.");
    }
    await load();
  }

  async function resolveStatQuestion(id: string, correctOptionId: string | null) {
    const res = await fetch(STAT_Q_API, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, correctOptionId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Error resolviendo pregunta.");
    }
    await load();
  }

  const filteredMatches = data?.matches.filter((m) => {
    if (matchFilter === "open") return !m.closed;
    if (matchFilter === "closed") return m.closed;
    if (matchFilter === "scored") return m.homeFinalScore !== null && m.awayFinalScore !== null;
    return true;
  }) ?? [];

  // Summary stats (computed client-side from data)
  const scoredCount = data?.matches.filter((m) => m.homeFinalScore !== null).length ?? 0;
  const openCount = data?.matches.filter((m) => !m.closed).length ?? 0;
  const playerCount = data?.leaderboard.length ?? 0;
  const leader = data?.leaderboard[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-200 bg-red-50">
              <Shield className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Admin</p>
              <h1 className="text-lg font-black leading-tight text-slate-950">Mundial 2026</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6">
        {/* Summary stats */}
        {data && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100">
                <Users className="h-4 w-4 text-slate-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Jugadores</p>
                <p className="text-xl font-black tabular-nums text-slate-950">{playerCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Con resultado</p>
                <p className="text-xl font-black tabular-nums text-slate-950">
                  {scoredCount}
                  <span className="text-sm font-bold text-slate-400">/{data.matches.length}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50">
                <Tv2 className="h-4 w-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Abiertos</p>
                <p className="text-xl font-black tabular-nums text-amber-700">{openCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Líder</p>
                <p className="truncate text-sm font-black text-slate-950">
                  {leader ? `${leader.playerName} · ${leader.totalPoints}pts` : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-black transition",
                view === option.id
                  ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
            {error}
          </div>
        )}

        {isLoading && !data ? (
          <div className="grid min-h-80 place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-500" />
              <p className="mt-3 text-sm font-black text-slate-600">Cargando panel...</p>
            </div>
          </div>
        ) : data ? (
          <>
            {view === "leaderboard" && (
              <AdminLeaderboard leaderboard={data.leaderboard} />
            )}

            {view === "matches" && (
              <div className="grid gap-4">
                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {FILTER_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setMatchFilter(f.id)}
                      className={cn(
                        "h-8 rounded-lg border px-3 text-xs font-black transition",
                        matchFilter === f.id
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-bold text-slate-400">
                    {filteredMatches.length} partido{filteredMatches.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {filteredMatches.length ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredMatches.map((match) => (
                      <MatchAdminCard
                        key={match.id}
                        match={match}
                        onPatch={patchMatch}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div>
                      <p className="text-3xl">⚽</p>
                      <p className="mt-3 text-sm font-black text-slate-600">No hay partidos en esta categoría.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {view === "stats" && (
              <StatQuestionsManager
                matches={data.matches}
                statQuestions={data.statQuestions}
                onCreateQuestion={createStatQuestion}
                onResolveQuestion={resolveStatQuestion}
              />
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
