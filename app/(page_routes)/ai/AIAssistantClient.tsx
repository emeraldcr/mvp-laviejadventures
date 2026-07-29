"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, ChevronRight, Headphones, MessageCircle, RefreshCcw, SendHorizonal, ShieldCheck, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AI_BOOKING_HANDOFF_KEY, createAIBookingHandoff, type BookingState, type ChatMessage } from "@/lib/ai-assistant/shared";
import { RESERVATION_TRAVELER_DRAFT_KEY } from "@/lib/reservation/constants";
import type { ConversationResponse, PublicConversationStep } from "@/lib/conversation/types";
import { getMinBookableIsoDateInCostaRica, isDateOnOrAfterMinBookableInCostaRica } from "@/lib/helpers/costa-rica-time";

const CONVERSATION_SESSION_KEY = "veroConversationSessionId";
const CONVERSATION_MESSAGES_KEY = "veroConversationMessages";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function dedupeMessages(messages: ChatMessage[]) {
  return messages.filter((message, index) => {
    const previous = messages[index - 1];
    return !previous || previous.role !== message.role || previous.content.trim() !== message.content.trim();
  });
}

function appendUniqueMessage(messages: ChatMessage[], message: ChatMessage) {
  const previous = messages.at(-1);
  if (previous?.role === message.role && previous.content.trim() === message.content.trim()) return messages;
  return [...messages, message];
}

function getSessionId() {
  const existing = localStorage.getItem(CONVERSATION_SESSION_KEY);
  if (existing) return existing;
  const id = `web_${crypto.randomUUID()}`;
  localStorage.setItem(CONVERSATION_SESSION_KEY, id);
  return id;
}

function packageId(value: string | null): BookingState["tourPackage"] {
  if (value === "essential-package" || value === "lunch-package" || value === "private-package") return value;
  return null;
}

export default function AIAssistantClient() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<PublicConversationStep | null>(null);
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const requestInFlightRef = useRef(false);

  const applyResponse = useCallback((data: ConversationResponse, includeReply = true) => {
    setConversation(data);
    setStep(data.step);
    if (includeReply) {
      setMessages((current) => appendUniqueMessage(current, { role: "assistant", content: data.reply }));
    }
  }, []);

  const requestConversation = useCallback(async (id: string, payload: { message?: string; optionKey?: string; reset?: boolean } = {}) => {
    const response = await fetch("/api/ai/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id, ...payload }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "No se pudo recuperar la conversación.");
    return data as ConversationResponse;
  }, []);

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);
    try {
      const stored = sessionStorage.getItem(CONVERSATION_MESSAGES_KEY);
      if (stored) setMessages(dedupeMessages(JSON.parse(stored) as ChatMessage[]));
    } catch {
      sessionStorage.removeItem(CONVERSATION_MESSAGES_KEY);
    }
    requestConversation(id)
      .then((data) => applyResponse(data))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se pudo abrir Vero."))
      .finally(() => setLoading(false));
  }, [applyResponse, requestConversation]);

  useEffect(() => {
    sessionStorage.setItem(CONVERSATION_MESSAGES_KEY, JSON.stringify(messages.slice(-60)));
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  const send = useCallback(async (payload: { message?: string; optionKey?: string }, visibleText: string) => {
    if (!sessionId || requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setLoading(true);
    setError("");
    setInputError("");
    setStep(null);
    setMessages((current) => appendUniqueMessage(current, { role: "user", content: visibleText }));
    setInput("");
    try {
      applyResponse(await requestConversation(sessionId, payload));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo continuar.");
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
    }
  }, [applyResponse, requestConversation, sessionId]);

  const resetConversation = useCallback(async () => {
    if (!sessionId || loading) return;
    setLoading(true);
    setError("");
    setInputError("");
    setMessages([]);
    sessionStorage.removeItem(CONVERSATION_MESSAGES_KEY);
    try {
      applyResponse(await requestConversation(sessionId, { reset: true }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo reiniciar.");
    } finally {
      setLoading(false);
    }
  }, [applyResponse, loading, requestConversation, sessionId]);

  const continueToBooking = useCallback(() => {
    if (!conversation) return;
    const reservation = conversation.reservation;
    const phoneMatch = reservation.phone?.trim().match(/^(\+\d{1,4})[\s-]*(.*)$/);
    const bookingState: BookingState = {
      date: reservation.date,
      tourTime: null,
      tourPackage: packageId(reservation.package),
      tickets: reservation.people,
      name: reservation.name,
      email: reservation.email,
      phone: reservation.phone,
      specialRequests: [
        reservation.ages.length ? `Edades: ${reservation.ages.join(", ")}` : "",
        reservation.fitness ? `Condición física: ${reservation.fitness}` : "",
        reservation.transport ? `Transporte: ${reservation.transport}` : "",
        reservation.lunch ? `Almuerzo: ${reservation.lunch}` : "",
      ].filter(Boolean).join(" | ") || null,
    };
    sessionStorage.setItem(AI_BOOKING_HANDOFF_KEY, JSON.stringify(createAIBookingHandoff(bookingState)));
    sessionStorage.setItem(RESERVATION_TRAVELER_DRAFT_KEY, JSON.stringify({
      name: reservation.name ?? "",
      email: reservation.email ?? "",
      phoneCode: phoneMatch?.[1] ?? "+506",
      phoneNumber: phoneMatch?.[2] ?? reservation.phone ?? "",
      specialRequests: bookingState.specialRequests ?? "",
      agreeTerms: false,
    }));
    const params = new URLSearchParams();
    if (reservation.tour) params.set("tour", reservation.tour);
    if (reservation.date) params.set("date", reservation.date);
    if (reservation.people) params.set("pax", String(reservation.people));
    if (reservation.package) params.set("package", reservation.package);
    router.push(`/reservar?${params.toString()}`);
  }, [conversation, router]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    const validationError = validateInput(step, value, conversation);
    if (validationError) {
      setInputError(validationError);
      return;
    }
    void send({ message: value }, value);
  };

  const reservation = conversation?.reservation;
  const progressFields = useMemo(() => reservation ? [
    reservation.tour, reservation.date, reservation.people,
    reservation.ages.length ? reservation.ages : null, reservation.fitness,
    reservation.package, reservation.name, reservation.email, reservation.phone,
  ] : [], [reservation]);
  const completedFields = progressFields.filter(Boolean).length;
  const progressPercent = Math.round((completedFields / (progressFields.length || 9)) * 100);
  const statusLabel = conversation?.status === "ready_for_checkout"
    ? "Lista para revisar"
    : conversation?.status === "human_requested" ? "Con el equipo" : completedFields ? "En progreso" : "Comencemos";
  const inputHint = step?.inputType === "ages" ? "Ejemplo: 34, 32, 12" :
    step?.inputType === "date" ? "Seleccione una fecha" :
    step?.inputType === "email" ? "nombre@correo.com" :
    step?.inputType === "phone" ? "+506 8888-9999" :
    step?.inputType === "integer" ? "Cantidad de personas" : "Escriba su respuesta";
  const minBookableDate = useMemo(() => getMinBookableIsoDateInCostaRica(), []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#2E2A25] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(0,196,176,0.18),transparent_32%),radial-gradient(circle_at_100%_100%,rgba(0,196,176,0.09),transparent_38%)]" />

      <header className="relative z-20 border-b border-white/10 bg-[#2E2A25]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Volver al inicio">
            <Image src="/logo2.jpg" alt="La Vieja Adventures" width={42} height={42} priority className="h-10 w-10 rounded-full border border-white/10 object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight">La Vieja Adventures</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#74e3d7]">San Carlos · Costa Rica</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Navegación del asistente">
            <Link href="/tours" className="hidden rounded-full px-3 py-2 text-xs font-bold text-stone-300 hover:bg-white/10 sm:inline-flex">Tours</Link>
            <Link href="/reservar" className="hidden rounded-full px-3 py-2 text-xs font-bold text-stone-300 hover:bg-white/10 sm:inline-flex">Reserva directa</Link>
            <button type="button" onClick={() => void resetConversation()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs font-bold text-stone-200 hover:border-[#00C4B0]/60 disabled:opacity-50">
              <RefreshCcw className="h-3.5 w-3.5" /><span className="hidden sm:inline">Reiniciar</span>
            </button>
          </nav>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 px-6 py-8 lg:flex lg:flex-col">
          <Link href="/" className="mb-9 inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Volver al sitio</Link>
          <span className="mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-[#00C4B0] text-[#173d38] shadow-[0_12px_32px_rgba(0,196,176,0.22)]"><Sparkles className="h-5 w-5" /></span>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#74e3d7]">Su aventura</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Planifiquemos sin enredos.</h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">Vero reúne lo necesario y el configurador confirma horario, cupos y tarifa.</p>

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-400">Progreso</p>
              <span className="rounded-full bg-[#00C4B0]/15 px-2.5 py-1 text-[10px] font-black text-[#74e3d7]">{statusLabel}</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#00C4B0] transition-all duration-500" style={{ width: `${progressPercent}%` }} /></div>
            <p className="mt-2 text-xs text-stone-400">{completedFields} de 9 datos principales</p>
            <div className="mt-5 space-y-3">
              <SummaryItem icon={<CalendarDays className="h-4 w-4" />} label="Fecha" value={reservation?.date} />
              <SummaryItem icon={<Users className="h-4 w-4" />} label="Personas" value={reservation?.people ? String(reservation.people) : null} />
              <SummaryItem icon={<ShieldCheck className="h-4 w-4" />} label="Estado" value={conversation?.readyForCheckout ? "Lista para revisar" : null} />
            </div>
          </div>
          <div className="mt-auto rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
            <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><p className="text-xs leading-5 text-stone-300">Cañón y río dependen del clima, nivel del agua y valoración del guía. Seguridad primero.</p></div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-[#F7F5F0] text-[#2E2A25] lg:my-5 lg:mr-5 lg:min-h-[calc(100vh-6.5rem)] lg:overflow-hidden lg:rounded-[28px] lg:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div className="border-b border-stone-200 bg-white/85 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative"><Image src="/logo2.jpg" alt="" width={48} height={48} className="h-11 w-11 rounded-full object-cover ring-2 ring-[#00C4B0]/25" /><span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#00C4B0]" /></div>
                <div><div className="flex items-center gap-2"><h1 className="text-lg font-black">Vero</h1><span className="rounded-full bg-[#D9F7F3] px-2 py-0.5 text-[9px] font-black uppercase text-[#087d72]">En línea</span></div><p className="text-xs text-stone-500">Guía virtual de La Vieja Adventures</p></div>
              </div>
              <span className="hidden rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600 sm:inline-flex">{statusLabel}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 lg:hidden"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-[#00C4B0]" style={{ width: `${progressPercent}%` }} /></div><span className="text-[10px] font-black text-stone-500">{progressPercent}%</span></div>
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex items-center justify-center gap-2"><span className="h-px w-8 bg-stone-200" /><span className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">Conversación segura</span><span className="h-px w-8 bg-stone-200" /></div>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <article key={`${message.role}-${index}`} className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && <span className="mb-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#2E2A25] text-[9px] font-black text-[#74e3d7]">V</span>}
                    <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm md:max-w-[72%] ${message.role === "assistant" ? "rounded-bl-md border border-stone-200 bg-white text-stone-700" : "rounded-br-md bg-[#2E2A25] text-white"}`}><p>{message.content}</p></div>
                  </article>
                ))}
              </div>

              {step?.options && step.options.length > 0 && !loading && (
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {step.options.map((option) => (
                    <button key={`${step.id}-${option.key}`} type="button" onClick={() => {
                      if (conversation?.readyForCheckout && option.key === "A") return continueToBooking();
                      void send({ optionKey: option.key }, option.label);
                    }} className="group flex min-h-14 items-center gap-3 rounded-2xl border border-stone-200 bg-white px-3.5 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#00C4B0] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B0]">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#D9F7F3] text-xs font-black text-[#087d72]">{option.key}</span>
                      <span className="flex-1 text-sm font-bold text-stone-700">{option.label}</span><ChevronRight className="h-4 w-4 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-[#00C4B0]" />
                    </button>
                  ))}
                </div>
              )}

              {conversation?.status === "human_requested" && (
                <div className="mt-6 rounded-2xl border border-[#00C4B0]/30 bg-[#D9F7F3] p-4">
                  <div className="flex gap-3"><Headphones className="mt-0.5 h-5 w-5 text-[#087d72]" /><div><p className="font-black">El equipo puede continuar con usted</p><p className="mt-1 text-sm text-stone-600">Su solicitud quedó guardada. Para atención inmediata, abra WhatsApp.</p><a href="https://wa.me/50662332535" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#00C4B0] px-4 py-2 text-xs font-black text-[#173d38]"><MessageCircle className="h-4 w-4" /> Abrir WhatsApp <ArrowUpRight className="h-3.5 w-3.5" /></a></div></div>
                </div>
              )}
              {loading && (
                <div aria-live="polite" className="mt-5 flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#2E2A25] text-[9px] font-black text-[#74e3d7]">V</span>
                  <div className="flex flex-wrap items-center gap-1.5 rounded-2xl rounded-bl-md border border-stone-200 bg-white px-3 py-2 shadow-sm">
                    {["Revisando", "Ordenando", "Listo"].map((label, index) => (
                      <span key={label} className="animate-pulse rounded-full bg-[#D9F7F3] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#087d72]" style={{ animationDelay: `${index * 180}ms` }}>
                        {label}
                      </span>
                    ))}
                    <span className="sr-only">Vero está preparando el siguiente paso.</span>
                  </div>
                </div>
              )}
              {error && <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
            </div>
          </div>

          <div className="border-t border-stone-200 bg-white px-4 py-3 md:px-7 md:py-4">
            {step?.kind === "input" ? (
              <div className="mx-auto max-w-3xl">
                {step.inputType === "integer" && (
                  <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Cantidades frecuentes">
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <button key={count} type="button" disabled={loading} onClick={() => void send({ message: String(count) }, `${count} ${count === 1 ? "persona" : "personas"}`)} className="min-w-11 rounded-full border border-stone-200 bg-[#F7F5F0] px-3 py-2 text-xs font-black text-stone-700 transition hover:-translate-y-0.5 hover:border-[#00C4B0] hover:bg-[#D9F7F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B0]">
                        {count}
                      </button>
                    ))}
                    <span className="self-center px-1 text-[10px] font-bold text-stone-400">o escriba otra cantidad</span>
                  </div>
                )}
                <form onSubmit={onSubmit} noValidate className="grid grid-cols-[minmax(0,1fr)_3rem] items-end gap-2">
                  <label className="min-w-0">
                    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">
                      {step.inputType === "email" ? "Correo electrónico" : step.inputType === "phone" ? "Teléfono" : step.inputType === "ages" ? "Edades" : "Su respuesta"}
                    </span>
                    <input
                      type={step.inputType === "date" ? "date" : step.inputType === "integer" ? "number" : step.inputType === "phone" ? "tel" : step.inputType === "email" ? "email" : "text"}
                      lang={step.inputType === "date" ? "es-CR" : undefined}
                      required
                      min={step.inputType === "integer" ? "1" : step.inputType === "date" ? minBookableDate : undefined}
                      max={step.inputType === "integer" ? "20" : undefined}
                      step={step.inputType === "integer" ? "1" : undefined}
                      maxLength={step.inputType === "email" ? 254 : step.inputType === "phone" ? 24 : step.inputType === "text" ? 120 : undefined}
                      pattern={step.inputType === "phone" ? "[+0-9()\\s-]{8,24}" : undefined}
                      inputMode={step.inputType === "integer" || step.inputType === "ages" ? "numeric" : step.inputType === "phone" ? "tel" : step.inputType === "email" ? "email" : "text"}
                      autoCapitalize={step.inputType === "email" ? "none" : undefined}
                      spellCheck={step.inputType === "email" ? false : undefined}
                      autoComplete={step.inputType === "phone" ? "tel" : step.inputType === "email" ? "email" : step.id.includes("name") ? "name" : "off"}
                      value={input}
                      onChange={(event) => {
                        setInput(event.target.value);
                        if (inputError) setInputError("");
                      }}
                      placeholder={inputHint}
                      autoFocus
                      aria-invalid={Boolean(inputError)}
                      aria-describedby={inputError ? "vero-input-error" : undefined}
                      className={`h-12 w-full rounded-2xl border bg-[#FAF9F6] px-4 text-sm font-medium outline-none transition focus:bg-white focus:ring-4 ${inputError ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-stone-300 focus:border-[#00C4B0] focus:ring-[#00C4B0]/10"}`}
                    />
                  </label>
                  <button type="submit" disabled={loading || !input.trim()} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#00C4B0] text-[#173d38] shadow-[0_8px_20px_rgba(0,196,176,0.25)] transition hover:-translate-y-0.5 disabled:opacity-40" aria-label="Enviar respuesta"><SendHorizonal className="h-4 w-4" /></button>
                </form>
                {step.inputType === "date" && !inputError && (
                  <p className="mt-2 text-xs font-medium text-stone-500">
                    {input ? `Fecha seleccionada: ${formatSelectedDate(input)}` : "Toque el campo para abrir el calendario."}
                  </p>
                )}
                {inputError && <p id="vero-input-error" role="alert" className="mt-2 text-xs font-bold text-red-600">{inputError}</p>}
              </div>
            ) : (
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 text-xs text-stone-500"><p>Seleccione una opción para continuar.</p><button type="button" onClick={() => void resetConversation()} disabled={loading} className="font-bold text-[#087d72] hover:underline">Empezar de nuevo</button></div>
            )}
            <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-stone-400">Cupos, precio y operación se confirman en el configurador oficial.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryItem({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-8 w-8 place-items-center rounded-xl ${value ? "bg-[#00C4B0]/15 text-[#74e3d7]" : "bg-white/[0.05] text-stone-600"}`}>{icon}</span>
      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">{label}</p><p className={`truncate text-xs font-bold ${value ? "text-stone-200" : "text-stone-600"}`}>{value || "Pendiente"}</p></div>
    </div>
  );
}

function validateInput(step: PublicConversationStep | null, value: string, conversation: ConversationResponse | null) {
  if (!value) return "Complete este dato para continuar.";
  if (!step?.inputType) return null;

  if (step.inputType === "email") {
    return value.length <= 254 && EMAIL_PATTERN.test(value)
      ? null
      : "Escriba un correo válido, por ejemplo: nombre@correo.com.";
  }

  if (step.inputType === "phone") {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15
      ? null
      : "El teléfono debe tener entre 8 y 15 dígitos.";
  }

  if (step.inputType === "integer") {
    const amount = Number(value);
    return Number.isInteger(amount) && amount >= 1 && amount <= 20
      ? null
      : "Seleccione o escriba una cantidad entre 1 y 20 personas.";
  }

  if (step.inputType === "date") {
    return isDateOnOrAfterMinBookableInCostaRica(value)
      ? null
      : "Seleccione una fecha válida disponible desde hoy.";
  }

  if (step.inputType === "ages") {
    const ages = value.split(/[\s,;]+/).filter(Boolean).map(Number);
    if (!ages.length || ages.some((age) => !Number.isInteger(age) || age < 0 || age > 100)) {
      return "Escriba edades válidas entre 0 y 100, separadas por comas.";
    }
    const people = conversation?.reservation.people;
    return people && ages.length !== people
      ? `Necesito ${people} ${people === 1 ? "edad" : "edades"}, una por cada persona.`
      : null;
  }

  if (step.inputType === "text" && value.length < 2) {
    return "Escriba al menos dos caracteres.";
  }

  return null;
}

function formatSelectedDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
