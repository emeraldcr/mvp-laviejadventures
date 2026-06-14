"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Zap } from "lucide-react";
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

  useEffect(() => {
    if (!matchId) return;
    void load();
  }, [matchId, playerName]);

  async function load() {
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
  }

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
    <section
      className="rounded-xl border border-violet-900/50 bg-[#0c0c18] p-4"
      style={{ boxShadow: "0 0 24px rgba(139,92,246,0.08)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-4 w-4 text-violet-400" />
        <p className="text-sm font-black uppercase tracking-widest text-violet-400">Apuestas del partido</p>
      </div>
      <div className="grid gap-5">
        {questions.map((question) => {
          const myBet = myBets[question.id];
          const isSaving = saving === question.id;
          const isClosed = question.closed || question.resolved;
          const myPoints =
            question.resolved && myBet && myBet === question.correctOptionId ? question.pointValue : null;

          return (
            <div key={question.id}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <p className="font-black text-[#d4f0d4] leading-snug">{question.text}</p>
                {myPoints !== null && (
                  <span className="shrink-0 rounded-md border border-green-600/50 bg-green-950/60 px-2 py-0.5 text-xs font-black text-green-400">
                    +{myPoints} pt{myPoints !== 1 ? "s" : ""}
                  </span>
                )}
                {question.resolved && myBet && myBet !== question.correctOptionId && (
                  <span className="shrink-0 rounded-md border border-red-800/50 bg-red-950/60 px-2 py-0.5 text-xs font-black text-red-400">
                    Sin puntos
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
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
                        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-black transition-all",
                        isCorrectAnswer
                          ? "border-green-500 bg-green-700/60 text-green-300"
                          : isWrongAnswer
                            ? "border-red-800/50 bg-red-950/40 text-red-500 line-through opacity-60"
                            : selected
                              ? "border-violet-500 bg-violet-800/50 text-violet-200"
                              : isClosed
                                ? "border-[#1a2a1a] bg-[#080d08] text-[#2a4020] cursor-not-allowed"
                                : "border-[#2a2a4a] bg-[#0c0c18] text-[#a8a8d8] hover:border-violet-500 hover:bg-violet-900/30 hover:text-violet-200"
                      )}
                    >
                      {isSaving && selected ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (isCorrectAnswer || (selected && !question.resolved)) ? (
                        <Check className="h-3 w-3" />
                      ) : null}
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {errors[question.id] && (
                <p className="mt-1.5 text-xs font-bold text-red-400">{errors[question.id]}</p>
              )}

              {!playerName && (
                <p className="mt-1.5 text-xs font-bold text-[#3a5a3a]">Pone tu nombre para apostar.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
