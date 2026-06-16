import { ListChecks, Lock, Target } from "lucide-react";
import type { ReactNode } from "react";
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
      <div className="mb-5 overflow-hidden rounded-lg border border-[#9dff34]/55 bg-[#06140f] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
        <div className="bg-[#3151ff] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-[#d5ff3f]" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d5ff3f]">Mi quiniela</p>
              </div>
              <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
                {savedCount}
                <span className="text-white/35">/{TOTAL_MATCHES}</span>
                <span className="ml-3 text-xl font-black text-white/75 sm:text-2xl">guardados</span>
              </h2>
              <p className="mt-2 text-sm font-bold text-white/70">
                Prioriza los partidos abiertos y guarda cualquier cambio antes del cierre.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:min-w-[440px] lg:gap-3">
              <StatPlate label="Guardados" value={savedCount} tone="lime" icon={<Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} />
              <StatPlate label="Cerrados" value={lockedCount} tone="orange" icon={<Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} />
              <StatPlate label="Progreso" value={`${pct}%`} tone="cyan" />
            </div>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6">
          <div className="h-3 overflow-hidden rounded-full border border-white/15 bg-black/45">
            <div
              className="h-full rounded-full bg-[#d5ff3f] transition-all shadow-[0_0_16px_rgba(213,255,63,0.55)]"
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
        <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-white/20 bg-black/35 p-6 text-center sm:p-8">
          <div>
            <ListChecks className="mx-auto h-12 w-12 text-[#62ffe6]" />
            <p className="mt-4 text-xl font-black text-white">Todavia no hay picks guardados</p>
            <p className="mt-2 text-base font-bold text-white/60">Ve a Ahora para empezar a predecir.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function StatPlate({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  tone: "lime" | "orange" | "cyan";
  icon?: ReactNode;
}) {
  const color =
    tone === "lime"
      ? "border-[#9dff34]/55 bg-[#10240b] text-[#d5ff3f]"
      : tone === "orange"
        ? "border-[#ff6a3d]/55 bg-[#2a120b] text-[#ffb15f]"
        : "border-[#62ffe6]/55 bg-[#071d2a] text-[#62ffe6]";

  return (
    <div className={`rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 ${color}`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-wider text-white/70 sm:text-[11px]">{label}</p>
      </div>
      <p className="mt-1.5 text-2xl font-black tabular-nums text-current sm:mt-2 sm:text-3xl">{value}</p>
    </div>
  );
}
