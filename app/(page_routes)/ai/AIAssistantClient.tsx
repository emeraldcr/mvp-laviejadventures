"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, SendHorizonal } from "lucide-react";

type BookingState = {
  date: string | null;
  tourTime: "08:00" | "09:00" | "10:00" | null;
  tourPackage: "basic" | "full-day" | "private" | null;
  tickets: number | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  specialRequests: string | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const FIELD_LABELS: Record<string, string> = {
  date: "Fecha",
  tourTime: "Hora",
  tourPackage: "Paquete",
  tickets: "Personas",
  name: "Nombre",
  email: "Correo",
  phone: "Teléfono",
};

const INITIAL_STATE: BookingState = {
  date: null,
  tourTime: null,
  tourPackage: null,
  tickets: null,
  name: null,
  email: null,
  phone: null,
  specialRequests: null,
};

export default function AIAssistantClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente de reservas ✨ Puedo ayudarte a reservar y también responder dudas como ubicación, qué llevar o políticas. ¿Querés comenzar con fecha, hora, paquete y cantidad de personas?",
    },
  ]);
  const [state, setState] = useState<BookingState>(INITIAL_STATE);
  const [missingFields, setMissingFields] = useState<string[]>([
    "date",
    "tourTime",
    "tourPackage",
    "tickets",
    "name",
    "email",
    "phone",
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [guidedDate, setGuidedDate] = useState("");
  const [guidedTickets, setGuidedTickets] = useState<number>(2);
  const [guidedText, setGuidedText] = useState("");
  const [guidedPhone, setGuidedPhone] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, loading, missingFields]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          state,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setState(data.updatedState ?? INITIAL_STATE);
      setMissingFields(data.missingFields ?? []);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Perdón, tuve un problema temporal. Podés intentar de nuevo o enviarme tus datos en un solo mensaje.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentGuidedField = missingFields[0] ?? null;

  const addToPrompt = (chunk: string) => {
    if (!chunk.trim()) return;
    setInput((prev) => (prev.trim() ? `${prev.trim()} ${chunk.trim()}` : chunk.trim()));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 pt-6 pb-4 text-zinc-100 md:pt-8">
      <section className="mx-auto flex h-[calc(100vh-2.5rem)] w-full max-w-4xl flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl backdrop-blur md:h-[calc(100vh-3rem)] md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-emerald-500/20 p-2 text-emerald-300">
              <Bot size={20} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">AI booking copilot</p>
              <h1 className="text-xl font-semibold md:text-2xl">Asistente /ai para reservas</h1>
            </div>
          </div>

          <p className="mb-5 text-sm text-zinc-300">
            Conversá como en ChatGPT/Grok: escribí libremente y el bot recolecta datos de tu reserva,
            aunque mandés todo junto. También responde dudas rápidas del tour.
          </p>

          <div
            ref={messagesContainerRef}
            className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4 pr-3"
          >
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "assistant"
                    ? "mr-auto border border-emerald-500/20 bg-emerald-500/10"
                    : "ml-auto border border-white/10 bg-white/10"
                }`}
              >
                <p className="mb-1 text-[11px] uppercase tracking-wide text-zinc-400">
                  {message.role === "assistant" ? "Asistente" : "Vos"}
                </p>
                <p>{message.content}</p>
              </article>
            ))}

            {currentGuidedField && !loading && (
              <article className="mr-auto max-w-[90%] rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-relaxed">
                <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-400">Asistente</p>
                <p className="mb-3">Para avanzar paso a paso, elegí este dato: <strong>{FIELD_LABELS[currentGuidedField] ?? currentGuidedField}</strong>.</p>

                {currentGuidedField === "date" && (
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">Fecha</span>
                      <input
                        type="date"
                        value={guidedDate}
                        onChange={(event) => setGuidedDate(event.target.value)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      />
                    </label>
                    <button type="button" onClick={() => addToPrompt(`Fecha ${guidedDate}`)} className="rounded-lg border border-emerald-400 bg-emerald-500/20 px-3 py-2 text-emerald-300">
                      Agregar
                    </button>
                  </div>
                )}

                {currentGuidedField === "tourTime" && (
                  <div className="flex flex-wrap gap-2">
                    {(["08:00", "09:00", "10:00"] as const).map((slot) => (
                      <button key={slot} type="button" onClick={() => addToPrompt(`Hora ${slot}`)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:border-emerald-400 hover:text-emerald-300">
                        {slot}
                      </button>
                    ))}
                  </div>
                )}

                {currentGuidedField === "tourPackage" && (
                  <div className="flex flex-wrap gap-2">
                    {(["basic", "full-day", "private"] as const).map((pkg) => (
                      <button key={pkg} type="button" onClick={() => addToPrompt(`Paquete ${pkg}`)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:border-emerald-400 hover:text-emerald-300">
                        {pkg}
                      </button>
                    ))}
                  </div>
                )}

                {currentGuidedField === "tickets" && (
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">Personas (1-20)</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={guidedTickets}
                        onChange={(event) => setGuidedTickets(Math.min(20, Math.max(1, Number(event.target.value) || 1)))}
                        className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      />
                    </label>
                    <button type="button" onClick={() => addToPrompt(`Somos ${guidedTickets} personas`)} className="rounded-lg border border-emerald-400 bg-emerald-500/20 px-3 py-2 text-emerald-300">
                      Agregar
                    </button>
                  </div>
                )}

                {(currentGuidedField === "name" || currentGuidedField === "email") && (
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">{FIELD_LABELS[currentGuidedField]}</span>
                      <input
                        id={`guided-${currentGuidedField}`}
                        value={guidedText}
                        onChange={(event) => setGuidedText(event.target.value)}
                        placeholder={`Tu ${FIELD_LABELS[currentGuidedField].toLowerCase()}`}
                        autoComplete={currentGuidedField === "name" ? "name" : "email"}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      />
                    </label>
                    <button type="button" onClick={() => addToPrompt(`${FIELD_LABELS[currentGuidedField]} ${guidedText.trim()}`)} className="rounded-lg border border-emerald-400 bg-emerald-500/20 px-3 py-2 text-emerald-300">
                      Agregar
                    </button>
                  </div>
                )}

                {currentGuidedField === "phone" && (
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">{FIELD_LABELS[currentGuidedField]}</span>
                      <input
                        id="guided-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={guidedPhone}
                        onChange={(event) => setGuidedPhone(event.target.value)}
                        placeholder="Tu teléfono"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      />
                    </label>
                    <button type="button" onClick={() => addToPrompt(`${FIELD_LABELS[currentGuidedField]} ${guidedPhone.trim()}`)} className="rounded-lg border border-emerald-400 bg-emerald-500/20 px-3 py-2 text-emerald-300">
                      Agregar
                    </button>
                  </div>
                )}
              </article>
            )}

            {loading && <div className="h-10 w-40 animate-pulse rounded-xl bg-white/10" />}
          </div>

          <form onSubmit={onSubmit} className="mt-4 flex gap-2 border-t border-white/10 pt-4">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ejemplo: Somos 3, vamos el 2026-03-15 a las 09:00, paquete full-day..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-emerald-500 transition placeholder:text-zinc-500 focus:ring"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SendHorizonal size={16} />
              Enviar
            </button>
          </form>
      </section>
    </main>
  );
}
