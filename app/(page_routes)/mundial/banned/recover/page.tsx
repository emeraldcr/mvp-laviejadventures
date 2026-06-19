"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Upload,
  FileText,
  Smartphone,
  Mail,
  Phone,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "../../utils";

type Step =
  | "start"
  | "captcha"
  | "form"
  | "signature"
  | "email"
  | "phone"
  | "totp"
  | "done";

type State = {
  ticketId: string | null;
  step: Step;
  captchaQuestion: string | null;
  captchasPassed: number;
  formData: { fullName: string; email: string; phone: string; message: string } | null;
  signaturePreview: string | null;
  emailMasked: string | null;
  phoneMasked: string | null;
  totpSecret: string | null;
  totpUri: string | null;
};

const TICKET_KEY = "mundial-ban-ticketId";

const STEPS: { label: string; key: Step }[] = [
  { label: "CAPTCHA", key: "captcha" },
  { label: "Formulario", key: "form" },
  { label: "Firma", key: "signature" },
  { label: "Email", key: "email" },
  { label: "Teléfono", key: "phone" },
  { label: "Autenticador", key: "totp" },
];

function StepIndicator({ current }: { current: Step }) {
  const activeIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-1 justify-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <div className={cn(
            "h-2 w-2 rounded-full transition-all",
            i < activeIdx ? "bg-emerald-400" : i === activeIdx ? "bg-white w-5" : "bg-white/20"
          )} />
        </div>
      ))}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-md mx-auto rounded-2xl border border-white/12 bg-white/4 p-6", className)}>
      {children}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 mt-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <p className="text-xs text-red-300">{msg}</p>
    </div>
  );
}

function PrimaryBtn({
  onClick,
  loading,
  disabled,
  children,
  className,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/8 px-5 py-3.5 text-sm font-black text-white transition hover:bg-white/12 disabled:opacity-50",
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export default function RecoverPage() {
  const params = useSearchParams();
  const initPlayerName = params.get("playerName") ?? "";

  const [playerNameInput, setPlayerNameInput] = useState(initPlayerName);
  const [state, setState] = useState<State>({
    ticketId: null,
    step: "start",
    captchaQuestion: null,
    captchasPassed: 0,
    formData: null,
    signaturePreview: null,
    emailMasked: null,
    phoneMasked: null,
    totpSecret: null,
    totpUri: null,
  });

  const [captchaInput, setCaptchaInput] = useState("");
  const [formFields, setFormFields] = useState({ fullName: "", email: "", phone: "", message: "" });
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore ticket from session if available
  useEffect(() => {
    const saved = sessionStorage.getItem(TICKET_KEY);
    if (!saved) return;
    // Try to resume
    fetch(`/api/mundial/ban/recover?ticketId=${encodeURIComponent(saved)}`)
      .then((r) => r.json() as Promise<{
        step?: number; playerName?: string; captchasPassed?: number;
        emailVerified?: boolean; phoneVerified?: boolean; totpVerified?: boolean;
        emailMasked?: string; phoneMasked?: string; error?: string;
      }>)
      .then((data) => {
        if (data.error) { sessionStorage.removeItem(TICKET_KEY); return; }
        const step = data.step ?? 0;
        setState((s) => ({
          ...s,
          ticketId: saved,
          step: step < 3 ? "captcha" : step === 3 ? "form" : step === 4 ? "signature"
              : step === 5 ? "email" : step === 6 ? "phone" : step === 7 ? "totp" : "done",
          captchasPassed: data.captchasPassed ?? 0,
          emailMasked: data.emailMasked ?? null,
          phoneMasked: data.phoneMasked ?? null,
        }));
        if (data.playerName) setPlayerNameInput(data.playerName);
      })
      .catch(() => { /* start fresh */ });
  }, []);

  async function api(body: Record<string, unknown>) {
    const res = await fetch("/api/mundial/ban/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json() as Record<string, unknown>;
    if (!res.ok) throw new Error((json.error as string) ?? "Error");
    return json;
  }

  async function handleStart() {
    if (!playerNameInput.trim()) { setError("Ingresa tu nombre en la quiniela."); return; }
    setLoading(true); setError("");
    try {
      const data = await api({ action: "start", playerName: playerNameInput.trim() });
      const ticketId = data.ticketId as string;
      sessionStorage.setItem(TICKET_KEY, ticketId);
      setState((s) => ({ ...s, ticketId, step: "captcha", captchaQuestion: data.captchaQuestion as string }));
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleCaptcha() {
    const answer = parseInt(captchaInput, 10);
    if (isNaN(answer)) { setError("Ingresa un número."); return; }
    setLoading(true); setError("");
    try {
      const data = await api({ action: "captcha", ticketId: state.ticketId, answer });
      setCaptchaInput("");
      if (data.nextStep === "form") {
        setState((s) => ({ ...s, step: "form", captchasPassed: 3, captchaQuestion: null }));
      } else {
        setState((s) => ({
          ...s,
          captchasPassed: (data.captchasPassed as number) ?? s.captchasPassed + 1,
          captchaQuestion: (data.captchaQuestion as string) ?? null,
        }));
      }
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleForm() {
    setLoading(true); setError("");
    try {
      await api({ action: "form", ticketId: state.ticketId, ...formFields });
      setState((s) => ({ ...s, step: "signature", formData: formFields }));
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleSignature() {
    if (!signatureFile) { setError("Selecciona una foto del formulario firmado."); return; }
    setLoading(true); setError("");
    try {
      const imageData = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(signatureFile);
      });
      await api({ action: "signature", ticketId: state.ticketId, imageData });
      setState((s) => ({ ...s, step: "email", signaturePreview: imageData }));
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleSendEmail() {
    setLoading(true); setError("");
    try {
      const data = await api({ action: "send-email-code", ticketId: state.ticketId });
      setState((s) => ({ ...s, emailMasked: (data.emailMasked as string) ?? s.emailMasked }));
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleVerifyEmail() {
    if (!emailCode.trim()) { setError("Ingresa el código."); return; }
    setLoading(true); setError("");
    try {
      await api({ action: "verify-email", ticketId: state.ticketId, code: emailCode.trim() });
      setState((s) => ({ ...s, step: "phone" }));
      setEmailCode("");
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleSendPhone() {
    setLoading(true); setError("");
    try {
      const data = await api({ action: "send-phone-code", ticketId: state.ticketId });
      setState((s) => ({ ...s, phoneMasked: (data.phoneMasked as string) ?? s.phoneMasked }));
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleVerifyPhone() {
    if (!phoneCode.trim()) { setError("Ingresa el código."); return; }
    setLoading(true); setError("");
    try {
      await api({ action: "verify-phone", ticketId: state.ticketId, code: phoneCode.trim() });
      setState((s) => ({ ...s, step: "totp" }));
      setPhoneCode("");
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleGetTotp() {
    setLoading(true); setError("");
    try {
      const data = await api({ action: "get-totp", ticketId: state.ticketId });
      setState((s) => ({
        ...s,
        totpSecret: (data.secret as string) ?? null,
        totpUri: (data.totpUri as string) ?? null,
      }));
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleVerifyTotp() {
    if (!totpCode.trim()) { setError("Ingresa el código de 6 dígitos."); return; }
    setLoading(true); setError("");
    try {
      await api({ action: "verify-totp", ticketId: state.ticketId, code: totpCode.trim() });
      setState((s) => ({ ...s, step: "done" }));
      sessionStorage.removeItem(TICKET_KEY);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  function copySecret() {
    const raw = state.totpSecret?.replace(/\s/g, "") ?? "";
    navigator.clipboard.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const { step } = state;

  return (
    <div className="min-h-screen bg-[#060e08] px-4 py-12">
      {/* Back link */}
      <div className="mb-8 flex max-w-md mx-auto">
        <Link
          href="/mundial/banned"
          className="inline-flex items-center gap-1.5 text-xs text-white/35 transition hover:text-white/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Link>
      </div>

      <div className="max-w-md mx-auto mb-6 text-center">
        <h1 className="text-2xl font-black text-white mb-2">Recuperación de cuenta</h1>
        <p className="text-sm text-white/45">Proceso de verificación de identidad</p>
      </div>

      {step !== "start" && step !== "done" && <StepIndicator current={step} />}

      {/* ── START ──────────────────────────────────────────── */}
      {step === "start" && (
        <Card>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Paso 1 de 7</p>
            <h2 className="text-lg font-black text-white">Identifica tu cuenta</h2>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">
              Ingresa el nombre exacto con el que participas en la quiniela para iniciar el proceso. Completarás 6 pasos de verificación.
            </p>
          </div>
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm font-bold text-white placeholder-white/25 focus:border-white/25 focus:outline-none"
              placeholder="Tu nombre en la quiniela"
              value={playerNameInput}
              onChange={(e) => setPlayerNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleStart(); }}
            />
            {error && <ErrorBox msg={error} />}
            <PrimaryBtn onClick={handleStart} loading={loading}>
              Iniciar proceso <ChevronRight className="h-4 w-4" />
            </PrimaryBtn>
          </div>
        </Card>
      )}

      {/* ── CAPTCHA ────────────────────────────────────────── */}
      {step === "captcha" && (
        <Card>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">
              CAPTCHA {state.captchasPassed + 1}/3
            </p>
            <h2 className="text-lg font-black text-white">Verificación humana</h2>
            <p className="mt-2 text-sm text-white/55">Resuelve cada operación para continuar.</p>
          </div>
          {state.captchaQuestion && (
            <div className="mb-4 rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-center">
              <p className="text-2xl font-black text-white">{state.captchaQuestion}</p>
            </div>
          )}
          <div className="space-y-3">
            <input
              type="number"
              inputMode="numeric"
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-center text-2xl font-black text-white placeholder-white/25 focus:border-white/25 focus:outline-none"
              placeholder="?"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleCaptcha(); }}
            />
            {error && <ErrorBox msg={error} />}
            <PrimaryBtn onClick={handleCaptcha} loading={loading}>
              Verificar
            </PrimaryBtn>
          </div>
        </Card>
      )}

      {/* ── FORM ───────────────────────────────────────────── */}
      {step === "form" && (
        <Card>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Datos de apelación</p>
            <h2 className="text-lg font-black text-white">Formulario de apelación</h2>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">
              Completa todos los campos con información real. El correo y teléfono se usarán en los siguientes pasos.
            </p>
          </div>
          <div className="space-y-3">
            {(["fullName", "email", "phone"] as const).map((field) => (
              <input
                key={field}
                type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white/25 focus:outline-none"
                placeholder={
                  field === "fullName" ? "Nombre completo" :
                  field === "email" ? "Correo electrónico" :
                  "Teléfono (con código de país)"
                }
                value={formFields[field]}
                onChange={(e) => setFormFields((f) => ({ ...f, [field]: e.target.value }))}
              />
            ))}
            <textarea
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white/25 focus:outline-none resize-none"
              rows={4}
              placeholder="Motivo de la apelación — ¿por qué crees que tu cuenta fue suspendida por error? (mínimo 20 caracteres)"
              value={formFields.message}
              onChange={(e) => setFormFields((f) => ({ ...f, message: e.target.value }))}
            />
            {error && <ErrorBox msg={error} />}
            <PrimaryBtn onClick={handleForm} loading={loading}>
              Continuar <ChevronRight className="h-4 w-4" />
            </PrimaryBtn>
          </div>
        </Card>
      )}

      {/* ── SIGNATURE ──────────────────────────────────────── */}
      {step === "signature" && (
        <Card>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Formulario firmado</p>
            <h2 className="text-lg font-black text-white">Descarga, imprime y firma</h2>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">
              Debes descargar el formulario oficial, imprimirlo, completarlo a mano, firmarlo y subir una foto clara aquí.
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={`/api/mundial/ban/recover/form?ticketId=${encodeURIComponent(state.ticketId ?? "")}&playerName=${encodeURIComponent(playerNameInput)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl border border-white/12 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              <FileText className="h-5 w-5 text-white/60 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-black text-white">Descargar formulario</p>
                <p className="text-xs text-white/40">Abre en nueva pestaña · imprimir con Ctrl+P</p>
              </div>
            </a>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/15 px-4 py-6 transition hover:border-white/30",
                signatureFile && "border-emerald-500/50 bg-emerald-950/20"
              )}
            >
              {signatureFile ? (
                <>
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                  <p className="text-sm font-black text-emerald-300">{signatureFile.name}</p>
                  <p className="text-xs text-white/35">Toca para cambiar la foto</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-white/35" />
                  <p className="text-sm font-black text-white/70">Subir foto del formulario firmado</p>
                  <p className="text-xs text-white/35">JPG, PNG — máximo 4MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setSignatureFile(f);
                  setError("");
                }}
              />
            </div>

            {error && <ErrorBox msg={error} />}
            <PrimaryBtn onClick={handleSignature} loading={loading} disabled={!signatureFile}>
              Subir y continuar <ChevronRight className="h-4 w-4" />
            </PrimaryBtn>
          </div>
        </Card>
      )}

      {/* ── EMAIL ──────────────────────────────────────────── */}
      {step === "email" && (
        <Card>
          <div className="mb-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5">
              <Mail className="h-5 w-5 text-white/60" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Verificación de email</p>
            <h2 className="text-lg font-black text-white">Confirma tu correo</h2>
            {state.emailMasked ? (
              <p className="mt-2 text-sm text-white/55">
                Enviamos un código a <strong className="text-white/80">{state.emailMasked}</strong>. Válido por 15 minutos.
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/55">Solicita el código de verificación para continuar.</p>
            )}
          </div>
          <div className="space-y-3">
            {!state.emailMasked ? (
              <PrimaryBtn onClick={handleSendEmail} loading={loading}>
                Enviar código por email
              </PrimaryBtn>
            ) : (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-center text-2xl font-black tracking-widest text-white placeholder-white/25 focus:border-white/25 focus:outline-none"
                  placeholder="000000"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleVerifyEmail(); }}
                />
                {error && <ErrorBox msg={error} />}
                <PrimaryBtn onClick={handleVerifyEmail} loading={loading}>
                  Verificar código
                </PrimaryBtn>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-1.5 text-xs text-white/35 transition hover:text-white/60 disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" /> Reenviar código
                </button>
              </>
            )}
            {!state.emailMasked && error && <ErrorBox msg={error} />}
          </div>
        </Card>
      )}

      {/* ── PHONE ──────────────────────────────────────────── */}
      {step === "phone" && (
        <Card>
          <div className="mb-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5">
              <Phone className="h-5 w-5 text-white/60" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Verificación de teléfono</p>
            <h2 className="text-lg font-black text-white">Confirma tu número</h2>
            {state.phoneMasked ? (
              <p className="mt-2 text-sm text-white/55">
                Enviamos el código al número <strong className="text-white/80">{state.phoneMasked}</strong> (vía email). Válido 15 minutos.
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/55">Solicita el código de verificación de teléfono.</p>
            )}
          </div>
          <div className="space-y-3">
            {!state.phoneMasked ? (
              <PrimaryBtn onClick={handleSendPhone} loading={loading}>
                Enviar código de teléfono
              </PrimaryBtn>
            ) : (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-center text-2xl font-black tracking-widest text-white placeholder-white/25 focus:border-white/25 focus:outline-none"
                  placeholder="000000"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleVerifyPhone(); }}
                />
                {error && <ErrorBox msg={error} />}
                <PrimaryBtn onClick={handleVerifyPhone} loading={loading}>
                  Verificar código
                </PrimaryBtn>
                <button
                  type="button"
                  onClick={handleSendPhone}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-1.5 text-xs text-white/35 transition hover:text-white/60 disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" /> Reenviar código
                </button>
              </>
            )}
            {!state.phoneMasked && error && <ErrorBox msg={error} />}
          </div>
        </Card>
      )}

      {/* ── TOTP ───────────────────────────────────────────── */}
      {step === "totp" && (
        <Card>
          <div className="mb-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5">
              <Smartphone className="h-5 w-5 text-white/60" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Autenticador de dos pasos</p>
            <h2 className="text-lg font-black text-white">Configura Google Authenticator</h2>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">
              Instala <strong className="text-white/80">Google Authenticator</strong> en tu teléfono. Luego agrega la cuenta usando la clave secreta.
            </p>
          </div>

          {!state.totpSecret ? (
            <div className="space-y-3">
              {error && <ErrorBox msg={error} />}
              <PrimaryBtn onClick={handleGetTotp} loading={loading}>
                Obtener clave secreta
              </PrimaryBtn>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions */}
              <ol className="list-decimal pl-4 space-y-1 text-xs text-white/55">
                <li>Abre Google Authenticator en tu teléfono.</li>
                <li>Toca <strong className="text-white/80">+</strong> → <strong className="text-white/80">Ingresar clave de configuración</strong>.</li>
                <li>Escribe cualquier nombre de cuenta y pega la clave secreta abajo.</li>
                <li>Selecciona <strong className="text-white/80">Basado en tiempo</strong> y toca <strong className="text-white/80">Agregar</strong>.</li>
                <li>Ingresa el código de 6 dígitos que aparece en la app.</li>
              </ol>

              {/* Secret */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-white/40">Clave secreta</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm font-black tracking-wider text-white break-all">
                    {state.totpSecret}
                  </code>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-black text-white/60 transition hover:text-white"
                  >
                    {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* TOTP input */}
              <div className="space-y-2">
                <p className="text-xs font-black text-white/55 uppercase tracking-wider">Código del autenticador</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-center text-2xl font-black tracking-widest text-white placeholder-white/25 focus:border-white/25 focus:outline-none"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleVerifyTotp(); }}
                />
              </div>
              {error && <ErrorBox msg={error} />}
              <PrimaryBtn onClick={handleVerifyTotp} loading={loading} disabled={totpCode.length !== 6}>
                Verificar y finalizar
              </PrimaryBtn>
            </div>
          )}
        </Card>
      )}

      {/* ── DONE ───────────────────────────────────────────── */}
      {step === "done" && (
        <Card className="text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500/40 bg-emerald-950/40">
              <ShieldCheck className="h-10 w-10 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-400/70 mb-2">Proceso completado</p>
          <h2 className="text-2xl font-black text-white mb-3">¡Solicitud enviada!</h2>
          {state.ticketId && (
            <div className="mb-5 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-1">Número de ticket</p>
              <p className="text-xl font-black font-mono text-white">{state.ticketId}</p>
            </div>
          )}
          <p className="text-sm text-white/55 leading-relaxed mb-6">
            Un administrador revisará tu solicitud en los próximos <strong className="text-white/80">3–5 días hábiles</strong>. Recibirás una notificación en el correo registrado.
          </p>
          <p className="text-xs text-white/35">
            Guarda el número de ticket como referencia. Si no recibes respuesta en 5 días hábiles, contacta a soporte.
          </p>
        </Card>
      )}
    </div>
  );
}
