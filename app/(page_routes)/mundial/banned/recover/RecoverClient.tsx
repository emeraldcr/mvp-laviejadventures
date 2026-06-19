"use client";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronRight, Clock,
  Copy, Download, FileText, HelpCircle, Loader2, Mail, MessageCircle,
  Phone, RefreshCw, Send, ShieldOff, Upload, Wifi, X,
} from "lucide-react";
import { cn } from "../../utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step =
  | "start" | "captcha" | "form" | "signature"
  | "email-send" | "email-verify" | "phone-send" | "phone-verify"
  | "totp-setup" | "totp-verify" | "done";

type ChatMessage = { role: "user" | "bot" | "system"; text: string };

// ─── Fake error system ────────────────────────────────────────────────────────

class FakeServerError extends Error {
  constructor(msg: string) { super(msg); this.name = "FakeServerError"; }
}

const FAKE_ERRORS = [
  "Error de conexión. Verifique su red e intente de nuevo.",
  "Tiempo de espera agotado (timeout 30s). El servidor no respondió.",
  "Error interno del servidor (código 503). El equipo técnico ha sido notificado.",
  "Servicio de verificación temporalmente inaccesible. Por favor espere.",
  "Error de autenticación. Sus credenciales no pudieron ser validadas.",
  "El servidor de seguridad rechazó la solicitud. Intente en unos momentos.",
];

const BOT_RESPONSES = [
  "Gracias por contactar soporte. Un agente se conectará pronto...",
  "Tiempo de espera estimado: 4 horas 32 minutos.",
  "Para problemas de recuperación de cuenta, complete el formulario en línea primero.",
  "Su número de caso ha sido registrado. Respuesta en 5-7 días hábiles.",
  "Nuestros sistemas de soporte están en mantenimiento programado.",
  "Por política de seguridad, no podemos brindar información por este canal.",
  "Para acelerar su caso, complete todos los pasos del proceso de recuperación.",
  "Un agente especializado revisará su solicitud. Tiempo estimado: 72 horas.",
  "Error al conectar con el sistema de tickets. Por favor intente más tarde.",
];

function rndFakeError() {
  return FAKE_ERRORS[Math.floor(Math.random() * FAKE_ERRORS.length)];
}

async function withFake<T>(fn: () => Promise<T>, prob = 0.22): Promise<T> {
  if (Math.random() < prob) {
    await new Promise((r) => setTimeout(r, 1800 + Math.random() * 2200));
    throw new FakeServerError(rndFakeError());
  }
  return fn();
}

// ─── Step indicator config ────────────────────────────────────────────────────

const STEP_ORDER: Step[] = [
  "start", "captcha", "form", "signature",
  "email-send", "email-verify", "phone-send", "phone-verify",
  "totp-setup", "totp-verify", "done",
];
const STEP_LABELS = [
  { step: "captcha" as Step, label: "CAPTCHA" },
  { step: "form" as Step, label: "Formulario" },
  { step: "signature" as Step, label: "Firma" },
  { step: "email-send" as Step, label: "Correo" },
  { step: "phone-send" as Step, label: "Teléfono" },
  { step: "totp-setup" as Step, label: "Autenticador" },
  { step: "done" as Step, label: "Enviado" },
];

function stepIdx(s: Step) { return STEP_ORDER.indexOf(s); }
function fmt(secs: number) {
  return `${Math.floor(secs / 60).toString().padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RecoverClient() {
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("start");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState(params.get("playerName") ?? "");

  // Captcha
  const [captchaQ, setCaptchaQ] = useState("");
  const [captchaIn, setCaptchaIn] = useState("");
  const [captchasDone, setCaptchasDone] = useState(0);

  // Form
  const [fFullName, setFFullName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fMsg, setFMsg] = useState("");

  // Signature
  const [sigPreview, setSigPreview] = useState<string | null>(null);
  const [sigErr, setSigErr] = useState("");

  // Codes
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [codeSentAt, setCodeSentAt] = useState<number | null>(null);

  // TOTP
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpIn, setTotpIn] = useState("");
  const [copied, setCopied] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fakeRetry, setFakeRetry] = useState<(() => void) | null>(null);
  const [sessionSecs, setSessionSecs] = useState(900);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Chat
  const [showChat, setShowChat] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>([
    { role: "system", text: "Soporte técnico — Mundial 2026" },
    { role: "bot", text: "Hola, bienvenido al soporte. Conectando con un agente disponible..." },
  ]);
  const [chatIn, setChatIn] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Track view
  const [showTrack, setShowTrack] = useState(false);

  // ── Session countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (step === "start" || step === "done" || sessionExpired) return;
    const id = setInterval(() => {
      setSessionSecs((s) => {
        if (s <= 1) { clearInterval(id); setSessionExpired(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, sessionExpired]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, chatTyping]);

  // ── API ────────────────────────────────────────────────────────────────────
  async function callRecover(body: Record<string, unknown>) {
    const res = await fetch("/api/mundial/ban/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({})) as Record<string, unknown>;
    if (!res.ok) throw new Error((data.error as string) ?? "Error del servidor.");
    return data;
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function resetToStart(msg?: string) {
    setStep("start"); setTicketId(null); setCaptchaQ(""); setCaptchaIn("");
    setCaptchasDone(0); setSigPreview(null); setEmailCode(""); setPhoneCode("");
    setTotpSecret(null); setTotpIn(""); setSessionSecs(900);
    setSessionExpired(false); setFakeRetry(null); setError(msg ?? null);
  }

  // ── Broken link ────────────────────────────────────────────────────────────
  function brokenLink(e: MouseEvent) {
    e.preventDefault();
    setError("El enlace no está disponible en este momento. Intente más tarde.");
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleStart() {
    const name = playerName.trim();
    if (!name) { setError("Ingresa tu nombre de jugador."); return; }
    setError(null); setLoading(true);
    try {
      const d = await withFake(() => callRecover({ action: "start", playerName: name }));
      setTicketId(d.ticketId as string);
      setCaptchaQ((d.captcha as { question: string } | undefined)?.question ?? "");
      setCaptchasDone(0); setStep("captcha");
    } catch (err) {
      if (err instanceof FakeServerError) { setFakeRetry(() => () => void handleStart()); }
      setError(err instanceof Error ? err.message : "Error.");
    } finally { setLoading(false); }
  }

  async function handleCaptcha() {
    const ans = parseInt(captchaIn, 10);
    if (isNaN(ans)) { setError("Ingresa un número."); return; }
    setError(null); setLoading(true);
    try {
      const d = await withFake(() => callRecover({ action: "captcha", ticketId, answer: ans }));
      const next = captchasDone + 1;
      setCaptchasDone(next); setCaptchaIn("");
      if (d.nextStep === "form") { setStep("form"); }
      else { setCaptchaQ((d.captcha as { question: string } | undefined)?.question ?? ""); }
    } catch (err) {
      if (err instanceof FakeServerError) { setFakeRetry(() => () => void handleCaptcha()); }
      setError(err instanceof Error ? err.message : "Respuesta incorrecta.");
    } finally { setLoading(false); }
  }

  async function handleForm() {
    if (!fFullName.trim() || !fEmail.trim() || !fPhone.trim()) { setError("Todos los campos son obligatorios."); return; }
    if (fMsg.trim().length < 20) { setError("El mensaje debe tener al menos 20 caracteres."); return; }
    setError(null); setLoading(true);
    try {
      await withFake(() => callRecover({ action: "form", ticketId, fullName: fFullName, email: fEmail, phone: fPhone, message: fMsg }));
      setStep("signature");
    } catch (err) {
      if (err instanceof FakeServerError) { setFakeRetry(() => () => void handleForm()); }
      setError(err instanceof Error ? err.message : "Error guardando formulario.");
    } finally { setLoading(false); }
  }

  function handleSigFile(file: File) {
    setSigErr("");
    if (!file.type.startsWith("image/")) { setSigErr("Solo se aceptan imágenes (JPG, PNG)."); return; }
    if (file.size > 6_000_000) { setSigErr("El archivo supera 6MB."); return; }
    const r = new FileReader();
    r.onload = (e) => setSigPreview(e.target?.result as string ?? null);
    r.readAsDataURL(file);
  }

  async function handleSignature() {
    if (!sigPreview) { setError("Sube la foto de tu formulario firmado."); return; }
    setError(null); setLoading(true);
    try {
      await withFake(() => callRecover({ action: "signature", ticketId, signatureDataUrl: sigPreview }));
      setStep("email-send");
    } catch (err) {
      if (err instanceof FakeServerError) { setFakeRetry(() => () => void handleSignature()); }
      setError(err instanceof Error ? err.message : "Error subiendo firma.");
    } finally { setLoading(false); }
  }

  async function handleSendEmailCode() {
    setError(null); setLoading(true);
    try {
      await withFake(() => callRecover({ action: "send-email-code", ticketId }));
      setCodeSentAt(Date.now()); setStep("email-verify");
    } catch (err) {
      if (err instanceof FakeServerError) { setFakeRetry(() => () => void handleSendEmailCode()); }
      setError(err instanceof Error ? err.message : "Error enviando código.");
    } finally { setLoading(false); }
  }

  async function handleVerifyEmail() {
    if (emailCode.length !== 6) { setError("El código debe tener 6 dígitos."); return; }
    setError(null); setLoading(true);
    try {
      await withFake(() => callRecover({ action: "verify-email", ticketId, code: emailCode }), 0.3);
      setStep("phone-send");
    } catch (err) {
      if (err instanceof FakeServerError) { setFakeRetry(() => () => void handleVerifyEmail()); }
      setError(err instanceof Error ? err.message : "Código incorrecto o expirado.");
    } finally { setLoading(false); }
  }

  async function handleSendPhoneCode() {
    setError(null); setLoading(true);
    try {
      await withFake(() => callRecover({ action: "send-phone-code", ticketId }));
      setCodeSentAt(Date.now()); setStep("phone-verify");
    } catch (err) {
      if (err instanceof FakeServerError) { setFakeRetry(() => () => void handleSendPhoneCode()); }
      setError(err instanceof Error ? err.message : "Error enviando código.");
    } finally { setLoading(false); }
  }

  async function handleVerifyPhone() {
    if (phoneCode.length !== 6) { setError("El código debe tener 6 dígitos."); return; }
    setError(null); setLoading(true);
    try {
      await withFake(() => callRecover({ action: "verify-phone", ticketId, code: phoneCode }), 0.3);
      const d = await callRecover({ action: "get-totp", ticketId });
      setTotpSecret(d.secret as string ?? null);
      setStep("totp-setup");
    } catch (err) {
      if (err instanceof FakeServerError) { setFakeRetry(() => () => void handleVerifyPhone()); }
      setError(err instanceof Error ? err.message : "Código incorrecto o expirado.");
    } finally { setLoading(false); }
  }

  async function handleVerifyTotp() {
    if (totpIn.length !== 6) { setError("El código TOTP debe tener 6 dígitos."); return; }
    setError(null); setLoading(true);
    try {
      await withFake(() => callRecover({ action: "verify-totp", ticketId, code: totpIn }), 0.3);
      setStep("done");
    } catch (err) {
      if (err instanceof FakeServerError) { setFakeRetry(() => () => void handleVerifyTotp()); }
      setError(err instanceof Error ? err.message : "Código TOTP incorrecto. Sincronice su reloj e intente de nuevo.");
    } finally { setLoading(false); }
  }

  async function sendChatMsg() {
    const text = chatIn.trim(); if (!text) return;
    setChatIn("");
    setChatMsgs((m) => [...m, { role: "user", text }]);
    setChatTyping(true);
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000));
    setChatTyping(false);
    setChatMsgs((m) => [...m, { role: "bot", text: BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)] }]);
  }

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (sessionExpired) return <SessionExpired onRestart={() => resetToStart("Su sesión expiró. Debe reiniciar el proceso desde el principio.")} />;
  if (showTrack) return <TrackView ticketId={ticketId} onBack={() => setShowTrack(false)} />;

  return (
    <div className="min-h-screen bg-[#060e08] text-white">
      {/* Session timer */}
      {step !== "start" && step !== "done" && (
        <div className={cn(
          "sticky top-0 z-40 border-b px-4 py-2 flex items-center justify-between text-xs font-black backdrop-blur",
          sessionSecs < 120 ? "border-red-500/40 bg-red-950/80 text-red-300"
          : sessionSecs < 300 ? "border-amber-500/30 bg-amber-950/60 text-amber-300"
          : "border-white/10 bg-black/80 text-white/40"
        )}>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Sesión expira en: {fmt(sessionSecs)}
            {sessionSecs < 300 && " — GUARDE SU PROGRESO"}
          </span>
          <span className="text-white/25 font-mono">{ticketId?.slice(0, 8)}...</span>
        </div>
      )}

      <div className="mx-auto max-w-xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/mundial/banned" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/12 bg-black/35 text-white/50 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-white">Recuperación de cuenta</h1>
            <p className="text-xs text-white/40">Proceso de verificación de identidad completa</p>
          </div>
        </div>

        {/* Step indicator */}
        {step !== "start" && (
          <div className="mb-6 flex items-center gap-1 overflow-x-auto pb-1">
            {STEP_LABELS.map((s, i) => {
              const cur = stepIdx(step), tIdx = stepIdx(s.step);
              const done = cur > tIdx;
              const active = cur >= tIdx && cur < tIdx + 2;
              return (
                <div key={s.step} className="flex shrink-0 items-center">
                  <div className={cn(
                    "flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-[10px] font-black",
                    done ? "bg-[#9dff34] text-[#06110b]"
                    : active ? "border border-[#d5ff3f]/60 bg-[#10240b] text-[#d5ff3f]"
                    : "border border-white/15 bg-black/35 text-white/30"
                  )}>
                    {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
                  </div>
                  <span className={cn("ml-1 hidden text-[10px] font-black sm:block", done ? "text-[#9dff34]" : active ? "text-[#d5ff3f]" : "text-white/25")}>
                    {s.label}
                  </span>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={cn("mx-1.5 h-px w-3 shrink-0", done ? "bg-[#9dff34]/40" : "bg-white/10")} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Warning */}
        {step !== "start" && step !== "done" && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/70" />
            <p className="text-xs text-amber-200/65 leading-relaxed">
              <strong className="text-amber-200/85">Importante:</strong> Si cierra esta página o la sesión expira, deberá reiniciar el proceso completamente desde el principio.
            </p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
            <div className="flex items-start gap-2">
              <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-red-200">{error}</p>
                {fakeRetry && (
                  <button
                    type="button"
                    onClick={() => { setError(null); const fn = fakeRetry; setFakeRetry(null); fn(); }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-red-500/40 bg-red-900/40 px-3 py-1.5 text-xs font-black text-red-200 transition hover:bg-red-900/70"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        {step === "start" && (
          <StartStep playerName={playerName} onName={setPlayerName} onSubmit={() => void handleStart()} loading={loading} onBroken={brokenLink} />
        )}
        {step === "captcha" && (
          <CaptchaStep question={captchaQ} value={captchaIn} onChange={setCaptchaIn} onSubmit={() => void handleCaptcha()} loading={loading} done={captchasDone} total={3} />
        )}
        {step === "form" && (
          <FormStep fFullName={fFullName} setFFullName={setFFullName} fEmail={fEmail} setFEmail={setFEmail} fPhone={fPhone} setFPhone={setFPhone} fMsg={fMsg} setFMsg={setFMsg} onSubmit={() => void handleForm()} loading={loading} onBroken={brokenLink} />
        )}
        {step === "signature" && (
          <SigStep sigPreview={sigPreview} sigErr={sigErr} onFile={handleSigFile} onSubmit={() => void handleSignature()} loading={loading} onBroken={brokenLink} />
        )}
        {step === "email-send" && (
          <EmailSendStep email={fEmail} onSend={() => void handleSendEmailCode()} loading={loading} />
        )}
        {step === "email-verify" && (
          <CodeVerifyStep
            title="Verificación de correo" icon={<Mail className="h-5 w-5" />}
            desc={`Ingresa el código enviado a ${fEmail || "tu correo"}.`}
            value={emailCode} onChange={setEmailCode}
            onSubmit={() => void handleVerifyEmail()} onResend={() => void handleSendEmailCode()}
            loading={loading} codeSentAt={codeSentAt}
          />
        )}
        {step === "phone-send" && (
          <PhoneSendStep phone={fPhone} email={fEmail} onSend={() => void handleSendPhoneCode()} loading={loading} />
        )}
        {step === "phone-verify" && (
          <CodeVerifyStep
            title="Verificación de teléfono" icon={<Phone className="h-5 w-5" />}
            desc={`Ingresa el código enviado a ${fEmail} para verificar el teléfono.`}
            value={phoneCode} onChange={setPhoneCode}
            onSubmit={() => void handleVerifyPhone()} onResend={() => void handleSendPhoneCode()}
            loading={loading} codeSentAt={codeSentAt}
          />
        )}
        {step === "totp-setup" && (
          <TotpSetupStep
            secret={totpSecret} copied={copied}
            onCopy={() => { if (totpSecret) { void navigator.clipboard.writeText(totpSecret); setCopied(true); setTimeout(() => setCopied(false), 2000); } }}
            onContinue={() => setStep("totp-verify")}
          />
        )}
        {step === "totp-verify" && (
          <TotpVerifyStep value={totpIn} onChange={setTotpIn} onSubmit={() => void handleVerifyTotp()} loading={loading} />
        )}
        {step === "done" && (
          <DoneStep ticketId={ticketId} onTrack={() => setShowTrack(true)} onBroken={brokenLink} />
        )}

        {/* Fake help footer */}
        {step !== "start" && step !== "done" && (
          <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-white/8 pt-5">
            <button onClick={brokenLink} className="flex items-center gap-1 text-xs text-white/25 hover:text-white/45"><HelpCircle className="h-3 w-3" />Centro de ayuda</button>
            <button onClick={brokenLink} className="flex items-center gap-1 text-xs text-white/25 hover:text-white/45"><FileText className="h-3 w-3" />Términos</button>
            <a href="mailto:soporte@laviejadventures.invalid" className="flex items-center gap-1 text-xs text-white/25 hover:text-white/45"><Mail className="h-3 w-3" />soporte@laviejadventures.com</a>
          </div>
        )}
      </div>

      {/* Floating chat */}
      <button
        type="button"
        onClick={() => setShowChat((v) => !v)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-[#0b2015] shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition hover:border-[#d5ff3f]/40"
        title="Soporte en línea"
      >
        {showChat ? <X className="h-5 w-5 text-white/70" /> : <MessageCircle className="h-5 w-5 text-white/70" />}
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-[#9dff34]" />
      </button>

      {showChat && (
        <div className="fixed bottom-24 right-5 z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b1a10] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0f2a18] px-4 py-3">
            <div>
              <p className="text-sm font-black text-white">Soporte en línea</p>
              <p className="text-[10px] text-[#9dff34]">● Conectando...</p>
            </div>
            <button type="button" onClick={() => setShowChat(false)} className="grid h-7 w-7 place-items-center rounded-lg border border-white/12 text-white/40 hover:text-white"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="h-56 space-y-2 overflow-y-auto p-3">
            {chatMsgs.map((m, i) => (
              <div key={i} className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-xs",
                m.role === "system" ? "mx-auto text-center text-white/30"
                : m.role === "user" ? "ml-auto bg-[#12351f] text-white"
                : "bg-black/40 text-white/70"
              )}>{m.text}</div>
            ))}
            {chatTyping && (
              <div className="flex w-14 gap-1 rounded-xl bg-black/40 px-3 py-2">
                {[0, 150, 300].map((d) => <span key={d} className="animate-bounce text-white/50" style={{ animationDelay: `${d}ms` }}>·</span>)}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2 border-t border-white/10 p-2">
            <input
              type="text" value={chatIn} onChange={(e) => setChatIn(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void sendChatMsg(); }}
              placeholder="Escribe un mensaje..."
              className="h-8 flex-1 rounded-lg border border-white/12 bg-black/35 px-3 text-xs text-white outline-none focus:border-[#d5ff3f]/40"
            />
            <button type="button" onClick={() => void sendChatMsg()} className="grid h-8 w-8 place-items-center rounded-lg bg-[#12351f] text-[#d5ff3f] hover:bg-[#1a4a2a]">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-steps ────────────────────────────────────────────────────────────────

function StartStep({ playerName, onName, onSubmit, loading, onBroken }: {
  playerName: string; onName: (v: string) => void; onSubmit: () => void; loading: boolean; onBroken: (e: MouseEvent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/12 bg-black/35 p-6 space-y-5">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/25 bg-red-950/30">
            <ShieldOff className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-white">Iniciar recuperación</h2>
          <p className="mt-2 text-sm text-white/45 leading-relaxed">
            Este proceso <strong className="text-white/65">no puede ser resumido</strong> una vez iniciado. Si cierra la página, deberá empezar de cero.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-black uppercase tracking-wide text-white/40">Nombre de jugador (exacto)</label>
          <input
            type="text" value={playerName} onChange={(e) => onName(e.target.value)}
            placeholder="Tu nombre en la quiniela"
            onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
            className="mb-4 h-11 w-full rounded-xl border border-white/18 bg-black/35 px-4 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#d5ff3f]/60 focus:ring-4 focus:ring-[#d5ff3f]/10"
          />
          <button type="button" onClick={onSubmit} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-black text-white transition hover:bg-white/8 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            {loading ? "Verificando..." : "Iniciar proceso de recuperación"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-black/20 p-4 space-y-2.5">
        <p className="text-[10px] font-black uppercase tracking-wider text-white/25">Recursos de ayuda</p>
        {[
          { icon: <FileText className="h-3.5 w-3.5 shrink-0" />, label: "Política de suspensión de cuentas" },
          { icon: <Download className="h-3.5 w-3.5 shrink-0" />, label: "Formulario oficial de apelación (PDF)" },
          { icon: <HelpCircle className="h-3.5 w-3.5 shrink-0" />, label: "Preguntas frecuentes — Recuperación de cuenta" },
        ].map(({ icon, label }) => (
          <button key={label} type="button" onClick={onBroken} className="flex w-full items-center gap-2 text-xs text-white/35 hover:text-white/55">
            {icon}{label}
            <span className="ml-auto text-[10px] text-red-400/60">● No disponible</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CaptchaStep({ question, value, onChange, onSubmit, loading, done, total }: {
  question: string; value: string; onChange: (v: string) => void; onSubmit: () => void; loading: boolean; done: number; total: number;
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/35 p-6 space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-[#d5ff3f]">Verificación CAPTCHA · {done + 1} de {total}</p>
        <h2 className="mt-1 text-lg font-black text-white">Prueba anti-robot</h2>
        <p className="mt-1 text-xs text-white/45">Debes resolver {total} operaciones consecutivas. Un error reinicia el contador.</p>
      </div>
      <div className="flex items-center justify-center rounded-xl border border-[#d5ff3f]/20 bg-[#10240b]/60 px-6 py-8">
        <p className="text-3xl font-black tracking-wide text-[#d5ff3f]">{question || "Cargando..."}</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-black uppercase tracking-wide text-white/40">Tu respuesta</label>
        <input
          type="number" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="Resultado" onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          className="h-11 w-full rounded-xl border border-white/18 bg-black/35 px-4 text-center text-lg font-black tabular-nums text-white outline-none focus:border-[#d5ff3f]/60 focus:ring-4 focus:ring-[#d5ff3f]/10"
        />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < done ? "bg-[#9dff34]" : i === done ? "bg-[#d5ff3f]/40" : "bg-white/10")} />
        ))}
      </div>
      <button type="button" onClick={onSubmit} disabled={loading || !value} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] py-3 text-sm font-black text-[#06110b] hover:bg-[#efff9a] disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {loading ? "Verificando..." : "Confirmar respuesta"}
      </button>
    </div>
  );
}

function Fld({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-wide text-white/40">{label}</span>{children}</label>;
}

const INPUT = "h-11 w-full rounded-xl border border-white/18 bg-black/35 px-4 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#d5ff3f]/60 focus:ring-4 focus:ring-[#d5ff3f]/10";

function FormStep({ fFullName, setFFullName, fEmail, setFEmail, fPhone, setFPhone, fMsg, setFMsg, onSubmit, loading, onBroken }: {
  fFullName: string; setFFullName: (v: string) => void; fEmail: string; setFEmail: (v: string) => void;
  fPhone: string; setFPhone: (v: string) => void; fMsg: string; setFMsg: (v: string) => void;
  onSubmit: () => void; loading: boolean; onBroken: (e: MouseEvent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/12 bg-black/35 p-6 space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#d5ff3f]">Paso 2 — Formulario de apelación</p>
          <h2 className="mt-1 text-lg font-black text-white">Datos de identificación</h2>
          <p className="mt-1 text-xs text-white/45">Todos los campos son obligatorios. Los datos deben coincidir con su documento de identidad.</p>
        </div>
        <Fld label="Nombre completo (según cédula o pasaporte)">
          <input type="text" value={fFullName} onChange={(e) => setFFullName(e.target.value)} placeholder="Nombre Apellido Apellido" className={INPUT} />
        </Fld>
        <Fld label="Correo electrónico de contacto">
          <input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} placeholder="correo@ejemplo.com" className={INPUT} />
        </Fld>
        <Fld label="Número de teléfono (con código de país)">
          <input type="tel" value={fPhone} onChange={(e) => setFPhone(e.target.value)} placeholder="+506 8888-8888" className={INPUT} />
        </Fld>
        <Fld label={`Motivo de la apelación (mín. 20 caracteres · ${fMsg.length} escritos)`}>
          <textarea value={fMsg} onChange={(e) => setFMsg(e.target.value)} rows={4} placeholder="Explica detalladamente por qué tu cuenta fue suspendida por error..." className="w-full resize-none rounded-xl border border-white/18 bg-black/35 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#d5ff3f]/60 focus:ring-4 focus:ring-[#d5ff3f]/10" />
        </Fld>
        <button type="button" onClick={onSubmit} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] py-3 text-sm font-black text-[#06110b] hover:bg-[#efff9a] disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
          {loading ? "Guardando..." : "Continuar al siguiente paso"}
        </button>
      </div>
      <p className="text-center text-[10px] text-white/20">
        Al continuar acepta la{" "}
        <button onClick={onBroken} className="underline hover:text-white/35">Política de Privacidad</button>
        {" "}y los{" "}
        <button onClick={onBroken} className="underline hover:text-white/35">Términos de Servicio</button>.
        El proceso puede tomar entre 5 y 15 días hábiles.
      </p>
    </div>
  );
}

function SigStep({ sigPreview, sigErr, onFile, onSubmit, loading, onBroken }: {
  sigPreview: string | null; sigErr: string; onFile: (f: File) => void; onSubmit: () => void; loading: boolean; onBroken: (e: MouseEvent) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-2xl border border-white/12 bg-black/35 p-6 space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-[#d5ff3f]">Paso 3 — Firma física</p>
        <h2 className="mt-1 text-lg font-black text-white">Formulario impreso y firmado</h2>
      </div>
      <ol className="space-y-3 text-sm text-white/55">
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black">1</span>
          <span>
            Descargue el{" "}
            <button onClick={onBroken} className="font-black text-[#d5ff3f] underline hover:text-[#efff9a]">formulario oficial (PDF)</button>
            <span className="ml-1.5 text-[10px] text-red-400/70">[Servicio en mantenimiento]</span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black">2</span>
          Imprima el formulario y llénelo a mano con tinta azul o negra.
        </li>
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black">3</span>
          Firme en el espacio indicado. La firma debe coincidir con su documento de identidad.
        </li>
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black">4</span>
          Tome una fotografía clara y súbala a continuación.
        </li>
      </ol>
      <div
        className={cn("cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition hover:bg-white/5", sigPreview ? "border-[#9dff34]/40 bg-[#10240b]/40" : "border-white/15 bg-black/25")}
        onClick={() => ref.current?.click()}
      >
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        {sigPreview ? (
          <div>
            <img src={sigPreview} alt="Firma" className="mx-auto mb-2 max-h-36 rounded-lg object-contain" />
            <p className="text-xs font-black text-[#9dff34]">Imagen cargada. Haz clic para cambiar.</p>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto mb-2 h-8 w-8 text-white/25" />
            <p className="text-sm font-black text-white/50">Haz clic o arrastra tu imagen aquí</p>
            <p className="mt-1 text-[10px] text-white/25">JPG / PNG · máx. 6MB</p>
          </div>
        )}
      </div>
      {sigErr && <p className="text-xs font-bold text-red-300">{sigErr}</p>}
      <button type="button" onClick={onSubmit} disabled={loading || !sigPreview} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] py-3 text-sm font-black text-[#06110b] hover:bg-[#efff9a] disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {loading ? "Subiendo..." : "Subir formulario firmado"}
      </button>
    </div>
  );
}

function EmailSendStep({ email, onSend, loading }: { email: string; onSend: () => void; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/35 p-6 space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-[#d5ff3f]">Paso 4 — Verificación de correo</p>
        <h2 className="mt-1 text-lg font-black text-white">Confirmar correo electrónico</h2>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
        <Mail className="h-5 w-5 shrink-0 text-white/40" />
        <div><p className="text-xs text-white/40">Código se enviará a:</p><p className="text-sm font-black text-white">{email || "—"}</p></div>
      </div>
      <p className="text-xs text-white/45 leading-relaxed">Se enviará un código de 6 dígitos. Expira en 15 minutos. Revisa también tu carpeta de spam.</p>
      <button type="button" onClick={onSend} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] py-3 text-sm font-black text-[#06110b] hover:bg-[#efff9a] disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Enviando..." : "Enviar código de verificación"}
      </button>
    </div>
  );
}

function PhoneSendStep({ phone, email, onSend, loading }: { phone: string; email: string; onSend: () => void; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/35 p-6 space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-[#d5ff3f]">Paso 5 — Verificación de teléfono</p>
        <h2 className="mt-1 text-lg font-black text-white">Confirmar número de teléfono</h2>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
        <Phone className="h-5 w-5 shrink-0 text-white/40" />
        <div><p className="text-xs text-white/40">Teléfono a verificar:</p><p className="text-sm font-black text-white">{phone || "—"}</p></div>
      </div>
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
        <Mail className="h-4 w-4 shrink-0 mt-0.5 text-amber-400/60" />
        <p className="text-xs text-amber-200/65">El código de verificación de teléfono se enviará a <strong>{email}</strong> por razones de seguridad.</p>
      </div>
      <button type="button" onClick={onSend} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] py-3 text-sm font-black text-[#06110b] hover:bg-[#efff9a] disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Enviando..." : "Enviar código al correo"}
      </button>
    </div>
  );
}

function CodeVerifyStep({ title, desc, icon, value, onChange, onSubmit, onResend, loading, codeSentAt }: {
  title: string; desc: string; icon: ReactNode; value: string; onChange: (v: string) => void;
  onSubmit: () => void; onResend: () => void; loading: boolean; codeSentAt: number | null;
}) {
  const [cooldown, setCooldown] = useState(60);
  useEffect(() => {
    const id = setInterval(() => {
      setCooldown(codeSentAt ? Math.max(0, 60 - Math.floor((Date.now() - codeSentAt) / 1000)) : 60);
    }, 1000);
    return () => clearInterval(id);
  }, [codeSentAt]);

  return (
    <div className="rounded-2xl border border-white/12 bg-black/35 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/12 bg-black/35 text-white/50">{icon}</div>
        <div><h2 className="text-lg font-black text-white">{title}</h2><p className="text-xs text-white/45">{desc}</p></div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-black uppercase tracking-wide text-white/40">Código de 6 dígitos</label>
        <input
          type="text" inputMode="numeric" maxLength={6} value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          className="h-14 w-full rounded-xl border border-white/18 bg-black/35 px-4 text-center text-2xl font-black tracking-[0.5em] tabular-nums text-white outline-none focus:border-[#d5ff3f]/60 focus:ring-4 focus:ring-[#d5ff3f]/10"
        />
      </div>
      <button type="button" onClick={onSubmit} disabled={loading || value.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] py-3 text-sm font-black text-[#06110b] hover:bg-[#efff9a] disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {loading ? "Verificando..." : "Verificar código"}
      </button>
      <div className="text-center">
        <button type="button" onClick={onResend} disabled={cooldown > 0 || loading} className="text-xs font-bold text-white/40 hover:text-white/65 disabled:opacity-40 disabled:cursor-not-allowed">
          {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
        </button>
      </div>
    </div>
  );
}

function TotpSetupStep({ secret, copied, onCopy, onContinue }: { secret: string | null; copied: boolean; onCopy: () => void; onContinue: () => void }) {
  const formatted = secret?.match(/.{1,4}/g)?.join(" ") ?? "";
  return (
    <div className="rounded-2xl border border-white/12 bg-black/35 p-6 space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-[#d5ff3f]">Paso 6 — Autenticador</p>
        <h2 className="mt-1 text-lg font-black text-white">Configurar Google Authenticator</h2>
      </div>
      <ol className="space-y-3 text-sm text-white/55">
        {[
          <>Descarga <strong className="text-white/80">Google Authenticator</strong> en tu teléfono (iOS o Android).</>,
          <>Abre la app, toca <strong className="text-white/80">"+"</strong> y elige <em className="text-white/80">"Ingresar clave de configuración"</em>.</>,
          <>Copia y pega la clave secreta de abajo en la app.</>,
          <>La app generará códigos de 6 dígitos cada 30 segundos.</>,
        ].map((text, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black">{i + 1}</span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-white/40">Clave secreta</p>
        <div className="flex items-center gap-2 rounded-xl border border-[#d5ff3f]/25 bg-[#10240b]/60 px-4 py-3">
          <code className="min-w-0 flex-1 break-all font-mono text-sm font-black tracking-widest text-[#d5ff3f]">{formatted || "Cargando..."}</code>
          <button type="button" onClick={onCopy} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#d5ff3f]/30 bg-black/35 text-[#d5ff3f] hover:bg-[#12351f]">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-white/30">Guarda esta clave en un lugar seguro. No podrás recuperarla.</p>
      </div>
      <button type="button" onClick={onContinue} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] py-3 text-sm font-black text-[#06110b] hover:bg-[#efff9a]">
        <ChevronRight className="h-4 w-4" />
        Ya configuré el autenticador
      </button>
    </div>
  );
}

function TotpVerifyStep({ value, onChange, onSubmit, loading }: { value: string; onChange: (v: string) => void; onSubmit: () => void; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/35 p-6 space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-[#d5ff3f]">Paso 6 — Verificación TOTP</p>
        <h2 className="mt-1 text-lg font-black text-white">Código del autenticador</h2>
        <p className="mt-1 text-xs text-white/45">Abre Google Authenticator e ingresa el código de 6 dígitos. Cambia cada 30 segundos.</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-black uppercase tracking-wide text-white/40">Código TOTP</label>
        <input
          type="text" inputMode="numeric" maxLength={6} value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000" onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          className="h-14 w-full rounded-xl border border-white/18 bg-black/35 px-4 text-center text-2xl font-black tracking-[0.5em] tabular-nums text-white outline-none focus:border-[#d5ff3f]/60 focus:ring-4 focus:ring-[#d5ff3f]/10"
        />
      </div>
      <button type="button" onClick={onSubmit} disabled={loading || value.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d5ff3f] py-3 text-sm font-black text-[#06110b] hover:bg-[#efff9a] disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {loading ? "Verificando TOTP..." : "Verificar y enviar solicitud"}
      </button>
      <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
        <p className="text-[10px] text-amber-200/60 leading-relaxed">Si el código no funciona: asegúrese de que la hora de su teléfono esté sincronizada automáticamente.</p>
      </div>
    </div>
  );
}

function DoneStep({ ticketId, onTrack, onBroken }: { ticketId: string | null; onTrack: () => void; onBroken: (e: MouseEvent) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#9dff34]/20 bg-[#10240b]/50 p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#9dff34]/30 bg-[#10240b]">
          <CheckCircle2 className="h-9 w-9 text-[#9dff34]" />
        </div>
        <h2 className="text-xl font-black text-[#d5ff3f]">Solicitud enviada</h2>
        <p className="mt-2 text-sm text-white/50 leading-relaxed">Tu solicitud de recuperación ha sido recibida y está en cola de revisión.</p>
        {ticketId && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/35 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-white/30">Número de ticket</p>
            <p className="mt-1 font-mono text-sm font-black text-white">{ticketId}</p>
            <p className="mt-1 text-[10px] text-white/25">Guarda este número. Lo necesitarás para el seguimiento.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-5 space-y-2.5">
        <p className="text-xs font-black uppercase tracking-wide text-white/40">¿Qué sigue?</p>
        {[
          "Tu solicitud será revisada por el equipo de seguridad.",
          "El proceso puede tomar entre 5 y 15 días hábiles.",
          "Recibirás una respuesta al correo proporcionado.",
          "No es posible agilizar el proceso contactando soporte.",
        ].map((t, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-white/40">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/20" />{t}
          </div>
        ))}
      </div>

      <button type="button" onClick={onTrack} className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-left transition hover:border-white/20 hover:bg-black/35">
        <div>
          <p className="text-sm font-black text-white">Ver estado de mi solicitud</p>
          <p className="text-xs text-white/35">Seguimiento en tiempo real</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-white/25" />
      </button>

      <div className="space-y-2">
        {["Descargar comprobante de solicitud", "Reenviar confirmación por correo"].map((label) => (
          <button key={label} type="button" onClick={onBroken} className="flex w-full items-center gap-2 rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/35 hover:text-white/55">
            <Download className="h-4 w-4 shrink-0" />{label}
            <span className="ml-auto text-[10px] text-red-400/60">● No disponible</span>
          </button>
        ))}
      </div>

      <Link href="/mundial" className="block text-center text-xs text-white/25 underline hover:text-white/45">Volver al inicio</Link>
    </div>
  );
}

function SessionExpired({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="min-h-screen bg-[#060e08] flex flex-col items-center justify-center px-4 py-16 text-white">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500/30 bg-red-950/40">
        <Clock className="h-10 w-10 text-red-400" />
      </div>
      <h1 className="mb-2 text-2xl font-black">Sesión expirada</h1>
      <p className="mb-8 max-w-sm text-center text-sm text-white/45 leading-relaxed">
        Tu sesión ha expirado. Por seguridad, debes iniciar el proceso completamente desde el principio.
      </p>
      <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-black text-white hover:bg-white/10">
        <RefreshCw className="h-4 w-4" />Reiniciar proceso
      </button>
    </div>
  );
}

const TRACK_STAGES = [
  { label: "Solicitud recibida", done: true, note: "Completado automáticamente" },
  { label: "Validación inicial de identidad", done: true, note: "Sistema automatizado" },
  { label: "Verificación de antecedentes", done: false, current: true, note: "En revisión — 1 a 3 días hábiles" },
  { label: "Revisión del comité de seguridad", done: false, note: "Pendiente aprobación anterior" },
  { label: "Auditoría de actividad sospechosa", done: false, note: "Proceso independiente — hasta 5 días" },
  { label: "Segunda revisión de identidad", done: false, note: "Requerido por política interna" },
  { label: "Aprobación final por gerencia", done: false, note: "Paso final obligatorio" },
  { label: "Restauración de acceso", done: false, note: "Solo si todos los pasos son aprobados" },
];

function TrackView({ ticketId, onBack }: { ticketId: string | null; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#060e08] text-white">
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={onBack} className="grid h-9 w-9 place-items-center rounded-lg border border-white/12 bg-black/35 text-white/50 hover:text-white"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-lg font-black">Estado de solicitud</h1>
            {ticketId && <p className="text-xs text-white/30 font-mono">{ticketId}</p>}
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
          <p className="text-xs font-black text-amber-200/80">Estado actual: EN REVISIÓN</p>
          <p className="mt-1 text-[10px] text-amber-200/50">Última actualización: hace 3 horas · Tiempo estimado restante: 10-14 días hábiles</p>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/35 p-5 space-y-4 mb-4">
          {TRACK_STAGES.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-black",
                s.done ? "border-[#9dff34]/50 bg-[#10240b] text-[#9dff34]"
                : s.current ? "border-[#f0b429]/50 bg-[#211707] text-[#f0b429]"
                : "border-white/12 bg-black/35 text-white/25"
              )}>
                {s.done ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-black", s.done ? "text-[#9dff34]" : s.current ? "text-[#f0b429]" : "text-white/35")}>{s.label}</p>
                <p className="text-[10px] text-white/25">{s.note}</p>
              </div>
              {s.current && (
                <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#211707] px-1.5 py-0.5 text-[10px] font-black text-[#f0b429]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f0b429]" />Activo
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/8 bg-black/20 p-4 space-y-1.5 mb-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-white/25">Historial de actividad</p>
          {[["hace 3h", "Sistema procesó validación inicial"], ["hace 3h", "Solicitud asignada al equipo #A-7"], ["hace 3h", "Ticket creado: verificación TOTP completada"]].map(([t, e], i) => (
            <div key={i} className="flex gap-2 text-[10px] text-white/30"><span className="w-12 shrink-0 tabular-nums">{t}</span><span>{e}</span></div>
          ))}
        </div>

        <div className="rounded-xl border border-red-500/15 bg-red-950/20 p-3">
          <p className="text-[10px] text-red-300/60 leading-relaxed">
            El proceso no puede ser acelerado. Cualquier intento de contactar soporte para agilizar la revisión resultará en reinicio del proceso desde el principio.
          </p>
        </div>
      </div>
    </div>
  );
}
