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
    <section className="min-w-0 overflow-hidden rounded-lg border border-[#62ffe6]/45 bg-[#071018] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="bg-[#3151ff] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/25 bg-white text-[#17206b]">
              <Zap className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d5ff3f]">Apuestas del partido</p>
              <h2 className="mt-1 text-xl font-black uppercase text-white">
                {questions.length} {questions.length === 1 ? "pregunta extra" : "preguntas extra"}
              </h2>
            </div>
          </div>
          {!playerName && (
            <span className="rounded-md border border-[#ffb15f]/50 bg-[#2a120b] px-3 py-1.5 text-sm font-black text-[#ffb15f]">
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
            <div key={question.id} className="min-w-0 rounded-lg border border-white/15 bg-black/35 p-4">
              <div className="mb-4 flex flex-col items-start gap-3 min-[620px]:flex-row min-[620px]:items-start min-[620px]:justify-between">
                <div className="min-w-0">
                  <p className="min-w-0 break-words text-lg font-black leading-snug text-white">{question.text}</p>
                  <p className="mt-1 text-sm font-bold text-white/60">
                    Vale {question.pointValue} pt{question.pointValue !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isClosed && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 bg-black/45 px-2.5 py-1 text-xs font-black text-white/65">
                      <Lock className="h-3.5 w-3.5" />
                      {question.resolved ? "Resuelta" : "Cerrada"}
                    </span>
                  )}
                  {myPoints !== null && (
                    <span className="shrink-0 rounded-md border border-[#9dff34]/55 bg-[#10240b] px-2.5 py-1 text-xs font-black text-[#d5ff3f]">
                      +{myPoints} pt{myPoints !== 1 ? "s" : ""}
                    </span>
                  )}
                  {question.resolved && myBet && myBet !== question.correctOptionId && (
                    <span className="shrink-0 rounded-md border border-[#ff6a3d]/55 bg-[#2a120b] px-2.5 py-1 text-xs font-black text-[#ffb15f]">
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
                          ? "border-[#9dff34] bg-[#9dff34] text-[#06121c]"
                          : isWrongAnswer
                            ? "border-[#ff6a3d]/55 bg-[#2a120b] text-[#ffb15f] line-through opacity-70"
                            : selected
                              ? "border-[#62ffe6] bg-[#071d2a] text-[#62ffe6]"
                              : isClosed
                                ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
                                : "border-white/15 bg-black/45 text-white/75 hover:border-[#62ffe6] hover:bg-[#071d2a] hover:text-white"
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
                <p className="mt-2 text-sm font-bold text-[#ffb15f]">{errors[question.id]}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
