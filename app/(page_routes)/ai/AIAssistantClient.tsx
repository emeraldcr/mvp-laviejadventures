"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, CalendarDays, CheckCircle2, SendHorizonal } from "lucide-react";

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
  const [readyToBook, setReadyToBook] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const completion = useMemo(() => {
    const total = 7;
    return Math.round(((total - missingFields.length) / total) * 100);
  }, [missingFields]);

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
      setReadyToBook(Boolean(data.readyToBook));
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_420px]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur">
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

          <div className="h-[56vh] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">
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
            {loading && <div className="h-10 w-40 animate-pulse rounded-xl bg-white/10" />}
          </div>

          <form onSubmit={onSubmit} className="mt-4 flex gap-2">
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

        <aside className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Estado de reserva</h2>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completion}%` }} />
          </div>
          <p className="text-sm text-zinc-400">Completado: {completion}%</p>

          <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
            {Object.entries(FIELD_LABELS).map(([key, label]) => {
              const value = state[key as keyof BookingState];
              return (
                <div key={key} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-zinc-400">{label}</span>
                  <span className="font-medium text-zinc-200">{value ? String(value) : "—"}</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
            {readyToBook ? (
              <p className="flex items-start gap-2 text-emerald-300">
                <CheckCircle2 size={16} className="mt-0.5" />
                ¡Listo! Ya tengo los datos básicos para continuar con la reserva.
              </p>
            ) : (
              <>
                <p className="mb-2 font-medium text-zinc-300">Aún faltan:</p>
                <ul className="space-y-1 text-zinc-400">
                  {missingFields.map((field) => (
                    <li key={field}>• {FIELD_LABELS[field] ?? field}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
            <p className="mb-2 flex items-center gap-2 font-medium">
              <CalendarDays size={16} /> Tips rápidos
            </p>
            <ul className="space-y-1 text-zinc-400">
              <li>• Horas válidas: 08:00, 09:00, 10:00</li>
              <li>• Paquetes: basic, full-day, private</li>
              <li>• También podés preguntar: ubicación, qué llevar, políticas</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
