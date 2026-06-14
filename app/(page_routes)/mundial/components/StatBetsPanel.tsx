"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Lock, Zap } from "lucide-react";
import { cn } from "../utils";

type StatQuestion = {
  id: string;
  text: string;
  options: Array<{ id: string; label: string }>;
  correctOptionId: string | null;
  resolved: boolean;
  pointValue: number;
  closed: boolean;
};

type StatBet = { questionId: string; optionId: string };

type StatBetsPanelProps = {
  matchId: string;
  playerName: string;
};

export function StatBetsPanel({ matchId, playerName }: StatBetsPanelProps) {
  const [questions, setQuestions] = useState<StatQuestion[]>([]);
  const [myBets, setMyBets] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const params = new URLSearchParams({ matchId });
    if (playerName) params.set("playerName", playerName);
    const res = await fetch(`/api/mundial/stat-bets?${params.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setQuestions(data.questions ?? []);
    const betsMap: Record<string, string> = {};
    for (const bet of (data.myBets ?? []) as StatBet[]) {
      betsMap[bet.questionId] = bet.optionId;
    }
    setMyBets(betsMap);
  }, [matchId, playerName]);

  useEffect(() => {
    if (!matchId) return;
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [load, matchId]);

  async function placeBet(questionId: string, optionId: string) {
    if (!playerName) return;
    setSaving(questionId);
    setErrors((prev) => ({ ...prev, [questionId]: "" }));
    try {
      const res = await fetch("/api/mundial/stat-bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, matchId, playerName, optionId }),
      });
      if (res.ok) {
        setMyBets((prev) => ({ ...prev, [questionId]: optionId }));
      } else {
        const body = await res.json().catch(() => ({}));
        setErrors((prev) => ({ ...prev, [questionId]: body.error ?? "Error guardando." }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, [questionId]: "Error de red." }));
    } finally {
      setSaving(null);
    }
  }

  if (!questions.length) return null;

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-cyan-800/50 bg-[#0b1315]">
      <div className="border-b border-cyan-950 bg-[#101719] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-800/50 bg-cyan-950/25">
              <Zap className="h-5 w-5 text-cyan-200" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Apuestas del partido</p>
              <h2 className="mt-1 text-xl font-black text-white">
                {questions.length} {questions.length === 1 ? "pregunta extra" : "preguntas extra"}
              </h2>
            </div>
          </div>
          {!playerName && (
            <span className="rounded-md border border-amber-700/50 bg-amber-950/25 px-3 py-1.5 text-sm font-black text-amber-200">
              Elegi jugador para apostar
            </span>
          )}
        </div>
      </div>

      <div className="grid min-w-0 gap-4 p-4 sm:p-5">
        {questions.map((question) => {
          const myBet = myBets[question.id];
          const isSaving = saving === question.id;
          const isClosed = question.closed || question.resolved;
          const myPoints =
            question.resolved && myBet && myBet === question.correctOptionId ? question.pointValue : null;

          return (
            <div key={question.id} className="min-w-0 rounded-lg border border-cyan-900/60 bg-[#101719] p-4">
              <div className="mb-4 flex flex-col items-start gap-3 min-[620px]:flex-row min-[620px]:items-start min-[620px]:justify-between">
                <div className="min-w-0">
                  <p className="min-w-0 break-words text-lg font-black leading-snug text-white">{question.text}</p>
                  <p className="mt-1 text-sm font-bold text-[#95b7ba]">
                    Vale {question.pointValue} pt{question.pointValue !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isClosed && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#2c4548] bg-[#071013] px-2.5 py-1 text-xs font-black text-[#95b7ba]">
                      <Lock className="h-3.5 w-3.5" />
                      {question.resolved ? "Resuelta" : "Cerrada"}
                    </span>
                  )}
                  {myPoints !== null && (
                    <span className="shrink-0 rounded-md border border-emerald-600/50 bg-emerald-950/40 px-2.5 py-1 text-xs font-black text-emerald-200">
                      +{myPoints} pt{myPoints !== 1 ? "s" : ""}
                    </span>
                  )}
                  {question.resolved && myBet && myBet !== question.correctOptionId && (
                    <span className="shrink-0 rounded-md border border-red-800/50 bg-red-950/40 px-2.5 py-1 text-xs font-black text-red-200">
                      Sin puntos
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 min-[520px]:grid-cols-2 lg:flex lg:flex-wrap">
                {question.options.map((option) => {
                  const selected = myBet === option.id;
                  const isCorrectAnswer = question.resolved && question.correctOptionId === option.id;
                  const isWrongAnswer = question.resolved && selected && !isCorrectAnswer;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isClosed || isSaving || !playerName}
                      onClick={() => void placeBet(question.id, option.id)}
                      className={cn(
                        "inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-center text-sm font-black transition-all lg:flex-none",
                        isCorrectAnswer
                          ? "border-emerald-500 bg-emerald-700/60 text-emerald-100"
                          : isWrongAnswer
                            ? "border-red-800/50 bg-red-950/40 text-red-200 line-through opacity-70"
                            : selected
                              ? "border-cyan-400 bg-cyan-800/50 text-cyan-100"
                              : isClosed
                                ? "cursor-not-allowed border-[#243638] bg-[#0b1315] text-[#587478]"
                                : "border-cyan-900/70 bg-[#0b1315] text-[#c1d7da] hover:border-cyan-400 hover:bg-cyan-950/35 hover:text-white"
                      )}
                    >
                      {isSaving && selected ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCorrectAnswer || (selected && !question.resolved) ? (
                        <Check className="h-4 w-4" />
                      ) : null}
                      <span className="min-w-0 break-words">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {errors[question.id] && (
                <p className="mt-2 text-sm font-bold text-red-200">{errors[question.id]}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
