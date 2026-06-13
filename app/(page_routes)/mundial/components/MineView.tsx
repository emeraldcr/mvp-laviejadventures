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
  activeMatchId: string | null;
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
  activeMatchId,
  nowMs,
  onUpdateDraft,
  onSave,
}: MineViewProps) {
  const pct = Math.round((savedCount / TOTAL_MATCHES) * 100);

  return (
    <section>
      {/* Header */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1b2a] to-[#1a2e48] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Mi quiniela</p>
            <h2 className="mt-1 text-3xl font-black text-white">
              {savedCount}<span className="text-slate-500">/{TOTAL_MATCHES}</span>
              <span className="ml-3 text-xl font-bold text-slate-400">guardados</span>
            </h2>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-300">Cerrados</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-emerald-300">{lockedCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Progreso</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-white">{pct}%</p>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {mineMatches.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {mineMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              draft={drafts[match.id] ?? emptyDraft()}
              savingId={savingId}
              isSavingBulk={isSavingBulk}
              activeMatchId={activeMatchId}
              nowMs={nowMs}
              onUpdateDraft={onUpdateDraft}
              onSave={onSave}
            />
          ))}
        </div>
      ) : (
        <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <div>
            <p className="text-4xl">📋</p>
            <p className="mt-3 text-base font-black text-slate-700">Todavía no hay picks guardados</p>
            <p className="mt-1 text-sm font-bold text-slate-400">Ve a "Ahora" para empezar a predecir.</p>
          </div>
        </div>
      )}
    </section>
  );
}
