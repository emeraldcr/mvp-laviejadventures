"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, SendHorizonal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { OrderDetails } from "@/types";
import {
  FIELD_LABELS,
  INITIAL_BOOKING_STATE,
  REQUIRED_BOOKING_FIELDS,
  TOUR_PACKAGE_OPTIONS,
  TOUR_TIME_OPTIONS,
  type BookingState,
  type ChatMessage,
} from "@/lib/ai-assistant/shared";

const PACKAGE_PRICE_USD: Record<NonNullable<BookingState["tourPackage"]>, number> = {
  basic: 30,
  "full-day": 40,
  private: 60,
};

const TAX_RATE = 0.13;
const AI_BOOKING_SESSION_KEY = "aiBookingConversationState";
const RESERVATION_RETURN_KEY = "reservationReturnPath";

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "¡Hola! Soy tu asistente de reservas ✨ Puedo ayudarte a reservar y también responder dudas como ubicación, qué llevar o políticas. ¿Querés comenzar con fecha, hora, paquete y cantidad de personas?",
};

type PersistedAIState = {
  messages: ChatMessage[];
  state: BookingState;
  missingFields: string[];
  input: string;
};

export default function AIAssistantClient() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [state, setState] = useState<BookingState>(INITIAL_BOOKING_STATE);
  const [missingFields, setMissingFields] = useState<string[]>(REQUIRED_BOOKING_FIELDS);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [guidedDate, setGuidedDate] = useState("");
  const [guidedTickets, setGuidedTickets] = useState<number>(2);
  const [guidedText, setGuidedText] = useState("");
  const [guidedPhone, setGuidedPhone] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(AI_BOOKING_SESSION_KEY);
    if (!raw) return;

    try {
      const persisted = JSON.parse(raw) as PersistedAIState;
      if (persisted.messages?.length) setMessages(persisted.messages);
      if (persisted.state) setState(persisted.state);
      if (persisted.missingFields) setMissingFields(persisted.missingFields);
      if (typeof persisted.input === "string") setInput(persisted.input);
    } catch {
      sessionStorage.removeItem(AI_BOOKING_SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    const payload: PersistedAIState = {
      messages,
      state,
      missingFields,
      input,
    };

    sessionStorage.setItem(AI_BOOKING_SESSION_KEY, JSON.stringify(payload));
  }, [input, messages, missingFields, state]);

  const buildOrderDetails = useCallback((bookingState: BookingState): OrderDetails | null => {
    if (
      !bookingState.date ||
      !bookingState.tourTime ||
      !bookingState.tourPackage ||
      !bookingState.tickets ||
      !bookingState.name ||
      !bookingState.email ||
      !bookingState.phone
    ) {
      return null;
    }

    const packagePrice = PACKAGE_PRICE_USD[bookingState.tourPackage];
    const subtotal = bookingState.tickets * packagePrice;

    return {
      name: bookingState.name,
      email: bookingState.email,
      phone: bookingState.phone,
      tickets: bookingState.tickets,
      date: bookingState.date,
      tourTime: bookingState.tourTime,
      tourPackage: bookingState.tourPackage,
      tourSlug: "tour-ciudad-esmeralda",
      tourName: "Tour Ciudad Esmeralda",
      packagePrice,
      total: Number((subtotal * (1 + TAX_RATE)).toFixed(2)),
    };
  }, []);

  const redirectToReservation = useCallback((bookingState: BookingState) => {
    const orderDetails = buildOrderDetails(bookingState);
    if (!orderDetails) return;

    const payload: PersistedAIState = {
      messages,
      state: bookingState,
      missingFields,
      input,
    };

    sessionStorage.setItem(AI_BOOKING_SESSION_KEY, JSON.stringify(payload));
    sessionStorage.setItem("reservationOrderDetails", JSON.stringify(orderDetails));
    sessionStorage.setItem(RESERVATION_RETURN_KEY, "/ai");
    hasRedirectedRef.current = true;
    router.push("/reservation");
  }, [buildOrderDetails, input, messages, missingFields, router]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, loading, missingFields]);

  useEffect(() => {
    const readyToBook = missingFields.length === 0;
    if (!readyToBook || hasRedirectedRef.current) return;

    redirectToReservation(state);
  }, [missingFields, redirectToReservation, state]);

  const submitContent = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const lastUserContent = [...messages].reverse().find((message) => message.role === "user")?.content.trim();
    if (lastUserContent && lastUserContent === trimmed) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
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
      setState(data.updatedState ?? INITIAL_BOOKING_STATE);
      setMissingFields(data.missingFields ?? REQUIRED_BOOKING_FIELDS);

      const nextState = data.updatedState ?? INITIAL_BOOKING_STATE;
      const nextMissingFields = data.missingFields ?? REQUIRED_BOOKING_FIELDS;
      if (!hasRedirectedRef.current && nextMissingFields.length === 0) {
        redirectToReservation(nextState);
      }
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
  }, [loading, messages, redirectToReservation, state]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitContent(input);
  };

  const currentGuidedField = missingFields[0] ?? null;

  const addToPrompt = useCallback((chunk: string, submit = false) => {
    const safeChunk = chunk.trim();
    if (!safeChunk) return;

    setInput((prev) => {
      const composed = prev.trim() ? `${prev.trim()} ${safeChunk}` : safeChunk;
      if (submit) void submitContent(composed);
      return submit ? "" : composed;
    });
  }, [submitContent]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 pt-6 pb-4 text-zinc-100 md:pt-8">
      <section className="mx-auto flex h-[calc(100vh-2.5rem)] w-full max-w-4xl flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl backdrop-blur md:h-[calc(100vh-3rem)] md:p-6">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold tracking-wide text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
            >
              <ArrowLeft size={14} />
              Volver a La Vieja Adventures
            </Link>
          </div>

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
                    <button type="button" onClick={() => addToPrompt(`Fecha ${guidedDate}`, true)} className="rounded-lg border border-emerald-400 bg-emerald-500/20 px-3 py-2 text-emerald-300">
                      Agregar
                    </button>
                  </div>
                )}

                {currentGuidedField === "tourTime" && (
                  <div className="flex flex-wrap gap-2">
                    {TOUR_TIME_OPTIONS.map((slot) => (
                      <button key={slot} type="button" onClick={() => addToPrompt(`Hora ${slot}`, true)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:border-emerald-400 hover:text-emerald-300">
                        {slot}
                      </button>
                    ))}
                  </div>
                )}

                {currentGuidedField === "tourPackage" && (
                  <div className="flex flex-wrap gap-2">
                    {TOUR_PACKAGE_OPTIONS.map((pkg) => (
                      <button key={pkg} type="button" onClick={() => addToPrompt(`Paquete ${pkg}`, true)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:border-emerald-400 hover:text-emerald-300">
                        {pkg}
                      </button>
                    ))}
                  </div>
                )}

                {currentGuidedField === "tickets" && (
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">Personas (1-20)</span>
                      <select
                        value={guidedTickets}
                        onChange={(event) => {
                          const selectedTickets = Number(event.target.value);
                          setGuidedTickets(selectedTickets);
                          addToPrompt(`Somos ${selectedTickets} personas`, true);
                        }}
                        className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      >
                        {Array.from({ length: 20 }, (_, index) => index + 1).map((option) => (
                          <option key={option} value={option} className="bg-zinc-900">
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="text-xs text-zinc-400">Se envía automáticamente al seleccionar.</p>
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
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addToPrompt(`${FIELD_LABELS[currentGuidedField]} ${guidedText.trim()}`, true);
                          }
                        }}
                        placeholder={`Tu ${FIELD_LABELS[currentGuidedField].toLowerCase()}`}
                        autoComplete={currentGuidedField === "name" ? "name" : "email"}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      />
                    </label>
                    <button type="button" onClick={() => addToPrompt(`${FIELD_LABELS[currentGuidedField]} ${guidedText.trim()}`, true)} className="rounded-lg border border-emerald-400 bg-emerald-500/20 px-3 py-2 text-emerald-300">
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
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addToPrompt(`${FIELD_LABELS[currentGuidedField]} ${guidedPhone.trim()}`, true);
                          }
                        }}
                        placeholder="Tu teléfono"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      />
                    </label>
                    <button type="button" onClick={() => addToPrompt(`${FIELD_LABELS[currentGuidedField]} ${guidedPhone.trim()}`, true)} className="rounded-lg border border-emerald-400 bg-emerald-500/20 px-3 py-2 text-emerald-300">
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
              onKeyDown={(event) => {
                if (event.key === "." && input.trim()) {
                  event.preventDefault();
                  void submitContent(input);
                }
              }}
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
