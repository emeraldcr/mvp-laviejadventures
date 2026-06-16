"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Plus, Trash2, Trophy, Users, X } from "lucide-react";
import type { AdminMatch, AdminStatQuestion, BetOptionAnalytics } from "../adminTypes";
import { cn } from "../../utils";

type Props = {
  matches: AdminMatch[];
  statQuestions: AdminStatQuestion[];
  onCreateQuestion: (matchId: string, text: string, options: string[], pointValue: number) => Promise<void>;
  onResolveQuestion: (id: string, correctOptionId: string | null) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
};

// ── Option analytics bar ────────────────────────────────────────────────────

function OptionBar({
  opt,
  isCorrect,
  totalBets,
}: {
  opt: BetOptionAnalytics;
  isCorrect: boolean;
  totalBets: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasPlayers = opt.players.length > 0;

  return (
    <div className={cn(
      "overflow-hidden rounded-lg border transition-all",
      isCorrect
        ? "border-emerald-300 bg-emerald-50"
        : totalBets > 0 && opt.count === 0
          ? "border-slate-100 bg-slate-50 opacity-60"
          : "border-slate-200 bg-white"
    )}>
      <div className="px-3 py-2.5">
        {/* label + count */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {isCorrect && (
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500">
                <Check className="h-2.5 w-2.5 text-white" />
              </span>
            )}
            <span className={cn(
              "text-sm font-black",
              isCorrect ? "text-emerald-800" : "text-slate-800"
            )}>
              {opt.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-black tabular-nums",
              isCorrect ? "text-emerald-600" : "text-slate-500"
            )}>
              {opt.pct}%
            </span>
            <span className={cn(
              "rounded-md px-1.5 py-0.5 text-xs font-black tabular-nums",
              isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            )}>
              {opt.count}
            </span>
          </div>
        </div>

        {/* bar */}
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCorrect ? "bg-emerald-500" : "bg-slate-400"
            )}
            style={{ width: `${opt.pct}%` }}
          />
        </div>

        {/* player chips */}
        {hasPlayers && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-black text-slate-400 transition hover:text-slate-600"
            >
              <Users className="h-3 w-3" />
              {opt.players.length} jugador{opt.players.length !== 1 ? "es" : ""}
              <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
            </button>
            {expanded && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {opt.players.map((name) => (
                  <span
                    key={name}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-black",
                      isCorrect
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Question card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  resolvingId,
  deletingId,
  onResolve,
  onDelete,
}: {
  question: AdminStatQuestion;
  resolvingId: string | null;
  deletingId: string | null;
  onResolve: (id: string, optionId: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isResolving = resolvingId === question.id;
  const isDeleting = deletingId === question.id;
  const correctLabel = question.options.find((o) => o.id === question.correctOptionId)?.label;

  return (
    <div className={cn(
      "overflow-hidden rounded-xl border shadow-sm",
      question.resolved ? "border-emerald-200" : "border-slate-200 bg-white"
    )}>
      {/* header */}
      <div className={cn(
        "flex items-start justify-between gap-3 px-4 py-3",
        question.resolved ? "bg-emerald-50" : "bg-white"
      )}>
        <div className="min-w-0">
          <p className={cn(
            "font-black leading-snug",
            question.resolved ? "text-emerald-900" : "text-slate-950"
          )}>
            {question.text}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">
              {question.pointValue} pt{question.pointValue !== 1 ? "s" : ""}
            </span>
            {question.totalBets > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                <Users className="h-3 w-3" />
                {question.totalBets} apuesta{question.totalBets !== 1 ? "s" : ""}
              </span>
            )}
            {question.resolved && (
              <>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-black text-emerald-700">
                  ✓ {correctLabel}
                </span>
                <button
                  type="button"
                  disabled={isResolving}
                  onClick={() => onResolve(question.id, null)}
                  className="text-[11px] font-black text-slate-400 underline transition hover:text-red-600 disabled:opacity-40"
                >
                  Quitar respuesta
                </button>
              </>
            )}
          </div>
        </div>

        {/* delete control */}
        <div className="shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-red-700">¿Eliminar?</span>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => { setConfirmDelete(false); onDelete(question.id); }}
                className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-[11px] font-black text-white transition hover:bg-red-700 disabled:opacity-40"
              >
                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Sí
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-black text-slate-600 transition hover:bg-slate-50"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isDeleting || isResolving}
              onClick={() => setConfirmDelete(true)}
              className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              title="Eliminar pregunta"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* analytics + resolve */}
      <div className="border-t border-slate-100 px-4 py-3">
        {question.totalBets === 0 ? (
          <p className="text-xs font-bold text-slate-400">Sin apuestas todavía.</p>
        ) : (
          <div className="mb-3 grid gap-2">
            {question.betsByOption.map((opt) => (
              <OptionBar
                key={opt.optionId}
                opt={opt}
                isCorrect={question.correctOptionId === opt.optionId}
                totalBets={question.totalBets}
              />
            ))}
          </div>
        )}

        {/* resolve buttons */}
        {!question.resolved && (
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
              Marcar respuesta correcta
            </p>
            <div className="flex flex-wrap gap-2">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isResolving}
                  onClick={() => onResolve(question.id, opt.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-40"
                >
                  {isResolving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function StatQuestionsManager({ matches, statQuestions, onCreateQuestion, onResolveQuestion, onDeleteQuestion }: Props) {
  const now = Date.now();

  const upcomingMatches = matches.filter((m) => {
    const isLive = m.liveStatus === "live" || m.liveStatus === "halftime";
    return isLive || new Date(m.kickoffAt).getTime() > now;
  });
  const pastMatches = matches.filter((m) => {
    const isLive = m.liveStatus === "live" || m.liveStatus === "halftime";
    return !isLive && new Date(m.kickoffAt).getTime() <= now;
  });

  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    () => {
      const withQuestions = matches.find((m) => statQuestions.some((q) => q.matchId === m.id));
      return withQuestions?.id ?? matches.find((m) => m.closed)?.id ?? matches[0]?.id ?? "";
    }
  );
  const [newText, setNewText] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [newPointValue, setNewPointValue] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const matchQuestions = statQuestions.filter((q) => q.matchId === selectedMatchId);

  const totalBetsForMatch = matchQuestions.reduce((sum, q) => sum + q.totalBets, 0);
  const resolvedCount = matchQuestions.filter((q) => q.resolved).length;

  const statBetLeaderboard = useMemo(() => {
    const playerMap = new Map<string, { playerName: string; earned: number; total: number }>();
    for (const q of matchQuestions) {
      for (const opt of q.betsByOption) {
        for (const name of opt.players) {
          if (!playerMap.has(name)) playerMap.set(name, { playerName: name, earned: 0, total: 0 });
          const entry = playerMap.get(name)!;
          entry.total++;
          if (q.correctOptionId === opt.optionId) entry.earned += q.pointValue;
        }
      }
    }
    return [...playerMap.values()].sort(
      (a, b) => b.earned - a.earned || b.total - a.total || a.playerName.localeCompare(b.playerName)
    );
  }, [matchQuestions]);

  async function handleCreate() {
    const text = newText.trim();
    const opts = newOptions.map((o) => o.trim()).filter(Boolean);
    if (text.length < 3) { setFormError("La pregunta debe tener al menos 3 caracteres."); return; }
    if (opts.length < 2) { setFormError("Necesitas al menos 2 opciones."); return; }
    setFormError("");
    setIsCreating(true);
    try {
      await onCreateQuestion(selectedMatchId, text, opts, newPointValue);
      setNewText("");
      setNewOptions(["", ""]);
      setNewPointValue(1);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error creando pregunta.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleResolve(questionId: string, optionId: string | null) {
    setResolvingId(questionId);
    try { await onResolveQuestion(questionId, optionId); }
    finally { setResolvingId(null); }
  }

  async function handleDelete(questionId: string) {
    setDeletingId(questionId);
    try { await onDeleteQuestion(questionId); }
    finally { setDeletingId(null); }
  }

  function MatchButton({ match }: { match: AdminMatch }) {
    const count = statQuestions.filter((q) => q.matchId === match.id).length;
    const bets = statQuestions
      .filter((q) => q.matchId === match.id)
      .reduce((s, q) => s + q.totalBets, 0);
    const isSelected = selectedMatchId === match.id;
    const isLive = match.liveStatus === "live" || match.liveStatus === "halftime";
    const kickoff = new Date(match.kickoffAt);
    const dateStr = kickoff.toLocaleDateString("es-CR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
      <button
        key={match.id}
        type="button"
        onClick={() => setSelectedMatchId(match.id)}
        className={cn(
          "flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0",
          isSelected ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
        )}
      >
        <div className="min-w-0">
          <p className={cn("text-[10px] font-black uppercase tracking-wide", isSelected ? "text-slate-400" : "text-slate-400")}>
            {isLive ? "🔴 LIVE" : dateStr} · {match.group ? `Grupo ${match.group}` : match.stageLabel}
          </p>
          <p className="truncate text-sm font-black">
            {match.homeTeam} vs {match.awayTeam}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {count > 0 && (
            <span className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums",
              isSelected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
            )}>
              {count}q
            </span>
          )}
          {bets > 0 && (
            <span className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums",
              isSelected ? "bg-white/10 text-white/60" : "bg-slate-50 text-slate-400"
            )}>
              {bets}b
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* ── Match selector ── */}
      <aside className="grid content-start gap-2">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Partido</p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {upcomingMatches.length > 0 && (
            <>
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Próximos</p>
              </div>
              {upcomingMatches.map((match) => <MatchButton key={match.id} match={match} />)}
            </>
          )}
          {pastMatches.length > 0 && (
            <>
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pasados</p>
              </div>
              {pastMatches.map((match) => <MatchButton key={match.id} match={match} />)}
            </>
          )}
        </div>
      </aside>

      {/* ── Questions panel ── */}
      <div className="grid content-start gap-4">
        {selectedMatch && (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-purple-600">Stats & Apuestas</p>
              <h2 className="text-xl font-black text-slate-950">
                #{selectedMatch.number} {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
              </h2>
              {matchQuestions.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                  <span>{matchQuestions.length} pregunta{matchQuestions.length !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{totalBetsForMatch} apuesta{totalBetsForMatch !== 1 ? "s" : ""} totales</span>
                  {resolvedCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-600">{resolvedCount} resuelta{resolvedCount !== 1 ? "s" : ""}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-700 bg-purple-700 px-3 py-2 text-sm font-black text-white transition hover:bg-purple-800"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancelar" : "Nueva pregunta"}
            </button>
          </div>
        )}

        {/* create form */}
        {showForm && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <p className="mb-3 text-sm font-black text-purple-800">Nueva pregunta</p>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="¿Ambos equipos anotan?"
              className="mb-3 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
            />
            <div className="mb-3 grid gap-2">
              {newOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...newOptions];
                      next[i] = e.target.value;
                      setNewOptions(next);
                    }}
                    placeholder={`Opción ${i + 1}`}
                    className="h-9 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                  />
                  {newOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setNewOptions(newOptions.filter((_, j) => j !== i))}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {newOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setNewOptions([...newOptions, ""])}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 text-sm font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700"
                >
                  <Plus className="h-3 w-3" />
                  Agregar opción
                </button>
              )}
            </div>

            {/* point value */}
            <div className="mb-3">
              <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-purple-700">Puntos</p>
              <div className="flex gap-2">
                {[1, 2, 3].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setNewPointValue(pts)}
                    className={cn(
                      "h-9 w-14 rounded-lg border text-sm font-black transition",
                      newPointValue === pts
                        ? "border-purple-700 bg-purple-700 text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:border-purple-400 hover:bg-purple-50"
                    )}
                  >
                    {pts}pt{pts !== 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>

            {formError && <p className="mb-3 text-xs font-bold text-red-700">{formError}</p>}
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-700 bg-purple-700 px-4 py-2 text-sm font-black text-white transition hover:bg-purple-800 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Crear pregunta
            </button>
          </div>
        )}

        {/* questions list */}
        {!matchQuestions.length ? (
          <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
            <div>
              <p className="text-2xl">🎰</p>
              <p className="mt-2 text-sm font-black text-slate-600">No hay preguntas para este partido.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {matchQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                resolvingId={resolvingId}
                deletingId={deletingId}
                onResolve={(id, optId) => void handleResolve(id, optId)}
                onDelete={(id) => void handleDelete(id)}
              />
            ))}
          </div>
        )}

        {/* per-match leaderboard */}
        {statBetLeaderboard.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-purple-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-purple-50 px-4 py-3">
              <Trophy className="h-4 w-4 text-purple-600" />
              <p className="text-sm font-black text-purple-900">Tabla · Mini-apuestas</p>
              <span className="ml-auto text-xs font-bold text-slate-400">{statBetLeaderboard.length} jugadores</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs">
                    <th className="px-3 py-2.5 text-left font-black uppercase tracking-wide text-slate-400">#</th>
                    <th className="px-3 py-2.5 text-left font-black uppercase tracking-wide text-slate-400">Jugador</th>
                    <th className="px-3 py-2.5 text-right font-black uppercase tracking-wide text-emerald-600">Pts</th>
                    <th className="px-3 py-2.5 text-right font-black uppercase tracking-wide text-slate-400">Apuestas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {statBetLeaderboard.map((entry, i) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    const isFirst = i === 0;
                    return (
                      <tr key={entry.playerName} className={isFirst ? "bg-amber-50" : "hover:bg-slate-50/70"}>
                        <td className="px-3 py-2.5">
                          {medals[i] ? (
                            <span className="text-base leading-none">{medals[i]}</span>
                          ) : (
                            <span className="text-sm font-black text-slate-400">{i + 1}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className={`font-black ${isFirst ? "text-amber-900" : "text-slate-950"}`}>
                            {entry.playerName}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`font-black tabular-nums ${entry.earned > 0 ? "text-emerald-700" : "text-slate-300"}`}>
                            {entry.earned}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-xs font-bold tabular-nums text-slate-400">{entry.total}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
