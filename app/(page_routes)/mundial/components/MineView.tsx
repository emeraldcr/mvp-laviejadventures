import { ListChecks, Lock, Target } from "lucide-react";
import { TOTAL_MATCHES } from "../constants";
import type { Draft, MundialMatch } from "../types";
import { emptyDraft } from "../utils";
import { MatchCard } from "./MatchCard";

type MineViewProps = {
  savedCount: number;
  lockedCount: number;
  mineMatches: MundialMatch[];
  drafts: Record<string, Draft>;
  savingId: string | null;
  isSavingBulk: boolean;
  todayEditableMatchIds: Set<string>;
  nowMs: number;
  onUpdateDraft: (matchId: string, patch: Partial<Draft>) => void;
  onSave: (match: MundialMatch) => Promise<void>;
};

export function MineView({
  savedCount,
  lockedCount,
  mineMatches,
  drafts,
  savingId,
  isSavingBulk,
  todayEditableMatchIds,
  nowMs,
  onUpdateDraft,
  onSave,
}: MineViewProps) {
  const pct = Math.round((savedCount / TOTAL_MATCHES) * 100);

  return (
    <section>
      <div className="mb-5 overflow-hidden rounded-lg border border-[#263b27] bg-[#0b130d]">
        <div className="border-b border-[#263b27] bg-[#101911] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-emerald-300" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Mi quiniela</p>
              </div>
              <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl">
                {savedCount}
                <span className="text-[#607160]">/{TOTAL_MATCHES}</span>
                <span className="ml-3 text-xl font-black text-[#a9c7ad] sm:text-2xl">guardados</span>
              </h2>
              <p className="mt-2 text-sm font-bold text-[#8ca58f]">
                Prioriza los partidos abiertos y guarda cualquier cambio antes del cierre.
              </p>
            </div>

            <div className="grid gap-3 min-[520px]:grid-cols-3 lg:min-w-[440px]">
              <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-300" />
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-300">Guardados</p>
                </div>
                <p className="mt-2 text-3xl font-black tabular-nums text-white">{savedCount}</p>
              </div>
              <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-300" />
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-300">Cerrados</p>
                </div>
                <p className="mt-2 text-3xl font-black tabular-nums text-white">{lockedCount}</p>
              </div>
              <div className="rounded-lg border border-cyan-800/50 bg-cyan-950/20 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-cyan-200">Progreso</p>
                <p className="mt-2 text-3xl font-black tabular-nums text-white">{pct}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6">
          <div className="h-3 overflow-hidden rounded-full border border-[#263b27] bg-[#070907]">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all shadow-[0_0_12px_rgba(16,185,129,0.55)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {mineMatches.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mineMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              draft={drafts[match.id] ?? emptyDraft()}
              savingId={savingId}
              isSavingBulk={isSavingBulk}
              todayEditableMatchIds={todayEditableMatchIds}
              nowMs={nowMs}
              onUpdateDraft={onUpdateDraft}
              onSave={onSave}
            />
          ))}
        </div>
      ) : (
        <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-[#2b3d2b] bg-[#0b130d] p-6 text-center sm:p-8">
          <div>
            <ListChecks className="mx-auto h-12 w-12 text-[#8ca58f]" />
            <p className="mt-4 text-xl font-black text-white">Todavia no hay picks guardados</p>
            <p className="mt-2 text-base font-bold text-[#8ca58f]">Ve a Ahora para empezar a predecir.</p>
          </div>
        </div>
      )}
    </section>
  );
}
