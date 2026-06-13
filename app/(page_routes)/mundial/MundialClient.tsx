"use client";

import {
  CalendarDays,
  Check,
  CircleAlert,
  ClipboardList,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";
import { VIEW_OPTIONS } from "./constants";
import { useMundial } from "./useMundial";
import { cn, formatKickoff } from "./utils";
import { MineView } from "./components/MineView";
import { NextView } from "./components/NextView";
import { PlayersView } from "./components/PlayersView";

export default function MundialClient() {
  const {
    playerName,
    setPlayerName,
    matches,
    players,
    viewMode,
    setViewMode,
    nowMs,
    isLoading,
    savingId,
    isSavingBulk,
    error,
    success,
    registeredNames,
    activeMatch,
    activeMatchId,
    slideMatches,
    recentClosedMatches,
    drafts,
    dirtyDrafts,
    savedCount,
    lockedCount,
    closedMatchCount,
    completionPct,
    lockedPct,
    activeCountdown,
    mineMatches,
    loadQuiniela,
    updateDraft,
    saveMatch,
    saveDirtyDrafts,
  } = useMundial();

  const openMatchCount = Math.max(matches.length - closedMatchCount, 0);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-[#0d1b2a]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-64 w-96 rounded-full bg-amber-400/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            {/* Left: Marketing copy */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-300">
                <Trophy className="h-4 w-4" />
                ⚽ Mundial 2026 · USA · México · Canadá
              </div>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Predice.<br />
                <span className="text-amber-400">Compite.</span><br />
                Domina.
              </h1>
              <p className="mt-5 max-w-lg text-base font-bold leading-relaxed text-slate-400 sm:text-lg">
                La quiniela mundialista más grande del verano. 104 partidos, 48 selecciones, y tú en el centro de la acción.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-bold text-slate-300">
                  <CalendarDays className="h-4 w-4 text-emerald-400" />
                  {activeMatch ? formatKickoff(activeMatch.kickoffAt) : "Sin partidos activos"}
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-bold text-slate-300">
                  <ClipboardList className="h-4 w-4 text-sky-400" />
                  {matches.length || 104} partidos totales
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-bold text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                  Cierre al pitazo inicial
                </div>
              </div>
            </div>

            {/* Right: Player card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-slate-400" />
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Tu cuenta</p>
              </div>
              <label className="mb-2 block text-base font-black text-white" htmlFor="mundial-player-name">
                ¿Con qué nombre juegas?
              </label>
              <input
                id="mundial-player-name"
                list="mundial-player-list"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder="Tu nombre"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/10 px-4 text-base font-black text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20"
              />
              <datalist id="mundial-player-list">
                {registeredNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Guardado</p>
                  <p className="mt-2 text-4xl font-black tabular-nums text-white">
                    {completionPct}<span className="text-xl text-slate-500">%</span>
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completionPct}%` }} />
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Cerrado</p>
                  <p className="mt-2 text-4xl font-black tabular-nums text-amber-400">
                    {lockedPct}<span className="text-xl text-amber-600">%</span>
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${lockedPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto w-full max-w-[1600px] px-4 sm:px-6">
        {/* Sticky toolbar */}
        <div className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="flex flex-wrap gap-2">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setViewMode(option.id)}
                  className={cn(
                    "h-9 rounded-lg border px-4 text-sm font-black transition",
                    viewMode === option.id
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void saveDirtyDrafts()}
                disabled={isSavingBulk || !dirtyDrafts.length}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSavingBulk ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Guardar todo{dirtyDrafts.length > 0 ? ` (${dirtyDrafts.length})` : ""}
              </button>
              <button
                type="button"
                onClick={() => void loadQuiniela()}
                disabled={isLoading}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className="py-5">
          {/* Stats bar */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Partido activo</p>
              <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">
                {activeMatch ? `#${activeMatch.number}` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Cierra en</p>
              <p className="mt-2 text-3xl font-black tabular-nums text-amber-600">
                {activeMatch ? activeCountdown : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Sin guardar</p>
              <p className="mt-2 text-3xl font-black tabular-nums text-sky-700">{dirtyDrafts.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 border-l-4 border-l-purple-500 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Jugadores</p>
              <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">{players.length}</p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-900">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Views */}
          {isLoading ? (
            <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
              <div>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
                <p className="mt-4 text-base font-black text-slate-700">Cargando tu quiniela...</p>
                <p className="mt-1 text-sm font-bold text-slate-400">Conectando con el servidor</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === "next" && (
                <NextView
                  activeMatch={activeMatch}
                  drafts={drafts}
                  savingId={savingId}
                  isSavingBulk={isSavingBulk}
                  activeMatchId={activeMatchId}
                  nowMs={nowMs}
                  activeCountdown={activeCountdown}
                  slideMatches={slideMatches}
                  recentClosedMatches={recentClosedMatches}
                  closedMatchCount={closedMatchCount}
                  openMatchCount={openMatchCount}
                  playerName={playerName}
                  onUpdateDraft={updateDraft}
                  onSave={saveMatch}
                />
              )}
              {viewMode === "mine" && (
                <MineView
                  savedCount={savedCount}
                  lockedCount={lockedCount}
                  mineMatches={mineMatches}
                  drafts={drafts}
                  savingId={savingId}
                  isSavingBulk={isSavingBulk}
                  activeMatchId={activeMatchId}
                  nowMs={nowMs}
                  onUpdateDraft={updateDraft}
                  onSave={saveMatch}
                />
              )}
              {viewMode === "players" && <PlayersView players={players} />}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
