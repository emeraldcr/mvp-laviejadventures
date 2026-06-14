"use client";

import {
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Loader2,
  ListChecks,
  RefreshCw,
  Save,
  Target,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { VIEW_OPTIONS } from "./constants";
import type { ViewMode } from "./types";
import { useMundial } from "./useMundial";
import { cn, formatKickoff } from "./utils";
import { Flag } from "./components/Flag";
import { MineView } from "./components/MineView";
import { NextView } from "./components/NextView";
import { PlayersView } from "./components/PlayersView";
import { PlayerPickerModal } from "./components/PlayerPickerModal";

function ViewIcon({ id, active }: { id: ViewMode; active: boolean }) {
  const className = cn("h-4 w-4 shrink-0", active ? "text-emerald-300" : "text-[#58745d]");

  if (id === "next") return <Target className={className} />;
  if (id === "mine") return <ListChecks className={className} />;
  return <Users className={className} />;
}

type MetricTileProps = {
  label: string;
  value: string;
  detail: string;
  tone: "green" | "amber" | "cyan";
};

function MetricTile({ label, value, detail, tone }: MetricTileProps) {
  const toneClass =
    tone === "green"
      ? "border-emerald-700/50 bg-emerald-950/20 text-emerald-300"
      : tone === "amber"
        ? "border-amber-700/50 bg-amber-950/20 text-amber-300"
        : "border-cyan-800/50 bg-cyan-950/20 text-cyan-200";

  return (
    <div className={cn("min-w-0 rounded-lg border px-4 py-3", toneClass)}>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums leading-none sm:text-3xl">{value}</p>
      <p className="mt-1.5 truncate text-xs font-bold text-[#9db59f]">{detail}</p>
    </div>
  );
}

export default function MundialClient() {
  const {
    playerName,
    setPlayerName,
    showPlayerPicker,
    setShowPlayerPicker,
    matches,
    predictions,
    players,
    viewMode,
    setViewMode,
    nowMs,
    isLoading,
    savingId,
    isSavingBulk,
    error,
    success,
    activeMatch,
    activeMatchId,
    todayEditableMatches,
    todayEditableMatchIds,
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

  function handlePickPlayer(name: string) {
    setPlayerName(name);
    setShowPlayerPicker(false);
  }

  const openMatchCount = Math.max(matches.length - closedMatchCount, 0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070907] text-white">
      <header className="border-b border-[#263425] bg-[linear-gradient(180deg,#0b150d_0%,#080b08_62%,#070907_100%)]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-amber-700/50 bg-amber-950/30">
              <Trophy className="h-5 w-5 text-amber-300" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Mundial 2026</p>
              <h1 className="truncate text-2xl font-black leading-tight text-white sm:text-4xl">Quiniela</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPlayerPicker(true)}
            className="flex min-h-11 max-w-full min-w-0 items-center gap-2 rounded-lg border border-[#2b3d2b] bg-[#101711] px-3 py-2 transition hover:border-emerald-500/60 hover:bg-emerald-950/20 sm:px-4"
          >
            <UserRound className="h-4 w-4 shrink-0 text-emerald-300" />
            <span
              className={cn(
                "max-w-[58vw] truncate text-base font-black sm:max-w-none",
                playerName ? "text-white" : "text-[#8aa08d]"
              )}
            >
              {playerName || "Elegir jugador"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#7f957f]" />
          </button>
        </div>

        <div className="mx-auto w-full max-w-[1400px] px-4 pb-5 sm:px-6 sm:pb-7">
          {activeMatch ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
              <section className="min-w-0 overflow-hidden rounded-lg border border-emerald-700/50 bg-[#0b130d]">
                <div className="border-b border-[#223323] bg-[#101911] px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                      <span className="truncate text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                        Proximo pick
                      </span>
                    </div>
                    <span className="rounded-md border border-[#2c422c] bg-[#071007] px-2.5 py-1 text-xs font-black text-[#a9c7ad]">
                      Partido #{activeMatch.number}
                      {activeMatch.group ? ` - Grupo ${activeMatch.group}` : ` - ${activeMatch.stageLabel}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-5 sm:gap-6 sm:px-8 sm:py-8">
                  <div className="flex min-w-0 flex-col items-center gap-2 sm:gap-3">
                    <Flag team={activeMatch.homeTeam} size="4xl" />
                    <span className="max-w-full break-words text-center text-base font-black uppercase leading-tight text-white sm:text-2xl">
                      {activeMatch.homeTeam}
                    </span>
                    <span className="rounded-full border border-[#2b3d2b] px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-[#8ca58f]">
                      Local
                    </span>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <span className="rounded-full border border-[#2b3d2b] bg-[#070907] px-3 py-1.5 text-sm font-black text-[#b5cbb7] sm:text-base">
                      VS
                    </span>
                    <span className="h-16 w-px bg-[#263425] sm:h-20" />
                  </div>

                  <div className="flex min-w-0 flex-col items-center gap-2 sm:gap-3">
                    <Flag team={activeMatch.awayTeam} size="4xl" />
                    <span className="max-w-full break-words text-center text-base font-black uppercase leading-tight text-white sm:text-2xl">
                      {activeMatch.awayTeam}
                    </span>
                    <span className="rounded-full border border-[#2b3d2b] px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-[#8ca58f]">
                      Visita
                    </span>
                  </div>
                </div>
              </section>

              <aside className="grid gap-3 rounded-lg border border-amber-700/50 bg-[#15110a] p-4">
                <div className="rounded-lg border border-amber-600/50 bg-amber-950/30 p-4 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Clock3 className="h-4 w-4 text-amber-300" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Cierra en</p>
                  </div>
                  <p className="text-4xl font-black tabular-nums leading-none text-amber-200 sm:text-5xl">
                    {activeCountdown}
                  </p>
                  <p className="mt-3 text-sm font-bold leading-snug text-[#d6c49c]">
                    {formatKickoff(activeMatch.kickoffAt)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricTile label="Guardado" value={`${completionPct}%`} detail={`${savedCount} picks`} tone="green" />
                  <MetricTile label="Cerrado" value={`${lockedPct}%`} detail={`${lockedCount} picks`} tone="amber" />
                </div>
              </aside>
            </div>
          ) : (
            <section className="grid min-h-64 place-items-center rounded-lg border border-dashed border-[#2b3d2b] bg-[#0b130d] p-8 text-center">
              <div>
                <Trophy className="mx-auto h-12 w-12 text-amber-300" />
                <p className="mt-4 text-2xl font-black text-white">
                  {closedMatchCount > 0 && closedMatchCount === matches.length ? "Quiniela cerrada" : "Sin partido activo"}
                </p>
                <p className="mt-2 text-base font-bold text-[#8ca58f]">Esperando el proximo pitazo.</p>
              </div>
            </section>
          )}

          <div className="mt-4 grid gap-3 min-[520px]:grid-cols-3">
            <MetricTile label="Picks guardados" value={`${savedCount}`} detail={`${completionPct}% del total`} tone="green" />
            <MetricTile label="Partidos abiertos" value={`${openMatchCount}`} detail="Listos para predecir" tone="cyan" />
            <MetricTile label="Cambios pendientes" value={`${dirtyDrafts.length}`} detail="Guarda antes del cierre" tone="amber" />
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-y border-[#263425] bg-[#080b08]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="grid grid-cols-3 gap-2 sm:flex sm:min-w-0">
            {VIEW_OPTIONS.map((option) => {
              const active = viewMode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setViewMode(option.id)}
                  className={cn(
                    "inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-lg border px-2.5 text-center text-sm font-black transition sm:px-5",
                    active
                      ? "border-emerald-500/70 bg-emerald-950/35 text-white shadow-[0_0_18px_rgba(16,185,129,0.12)]"
                      : "border-[#243424] bg-[#0d120d] text-[#90a893] hover:border-[#3a553a] hover:text-white"
                  )}
                >
                  <ViewIcon id={option.id} active={active} />
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={() => void saveDirtyDrafts()}
              disabled={isSavingBulk || !dirtyDrafts.length}
              className="relative inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-700 px-4 text-sm font-black text-white transition hover:border-emerald-300 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border-[#273527] disabled:bg-[#101510] disabled:text-[#647765]"
            >
              {isSavingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="truncate">Guardar cambios{dirtyDrafts.length > 0 ? ` (${dirtyDrafts.length})` : ""}</span>
            </button>
            <button
              type="button"
              onClick={() => void loadQuiniela()}
              disabled={isLoading}
              aria-label="Sincronizar quiniela"
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[#2b3d2b] bg-[#101711] text-[#a9c7ad] transition hover:border-[#4d6a4d] hover:text-white disabled:opacity-40 sm:w-auto sm:px-4"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2 hidden text-sm font-black sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6">
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-800/60 bg-red-950/35 p-4 text-sm font-bold text-red-200">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-700/60 bg-emerald-950/30 p-4 text-sm font-bold text-emerald-200">
            <Check className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words">{success}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-[#2b3d2b] bg-[#0b130d] p-8 text-center">
            <div>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-400" />
              <p className="mt-4 text-base font-black text-[#a9c7ad]">Cargando quiniela...</p>
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
                todayEditableMatches={todayEditableMatches}
                todayEditableMatchIds={todayEditableMatchIds}
                nowMs={nowMs}
                activeCountdown={activeCountdown}
                slideMatches={slideMatches}
                recentClosedMatches={recentClosedMatches}
                closedMatchCount={closedMatchCount}
                openMatchCount={openMatchCount}
                playerName={playerName}
                predictions={predictions}
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
                todayEditableMatchIds={todayEditableMatchIds}
                nowMs={nowMs}
                onUpdateDraft={updateDraft}
                onSave={saveMatch}
              />
            )}
            {viewMode === "players" && <PlayersView players={players} />}
          </>
        )}
      </section>

      {showPlayerPicker && (
        <PlayerPickerModal
          players={players}
          onSelect={handlePickPlayer}
          onClose={() => setShowPlayerPicker(false)}
          allowClose={Boolean(playerName)}
        />
      )}
    </main>
  );
}
