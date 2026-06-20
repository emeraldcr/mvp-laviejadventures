"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Crown, Loader2, Save, ShieldCheck, Sparkles, Star } from "lucide-react";
import { normalizeKey } from "../utils";
import { MUNDIAL_PREMIUM_PRICE_USD } from "../constants";

declare global {
  interface Window {
    paypal?: { Buttons: (config: unknown) => { render: (container: HTMLDivElement) => Promise<void> | void } };
  }
}

type PremiumStatus = "checking" | "locked" | "unlocked";
type Winner = "teamA" | "teamB" | "";

type PremiumPrediction = {
  id?: string;
  stage: string;
  slot: number;
  teamA: string;
  teamB: string;
  scoreA: number | "";
  scoreB: number | "";
  winner: Winner;
  confidence: number | "";
  note: string;
  updatedAt?: string | null;
};

const STAGES = [
  { key: "round16", label: "Octavos de Final", slots: 8, icon: "O" },
  { key: "quarterfinal", label: "Cuartos de Final", slots: 4, icon: "Q" },
  { key: "semifinal", label: "Semifinales", slots: 2, icon: "S" },
  { key: "thirdPlace", label: "Tercer Lugar", slots: 1, icon: "3" },
  { key: "final", label: "Gran Final", slots: 1, icon: "F" },
] as const;

const isLivePayPalMode = (mode: string | undefined) =>
  ["live", "production", "prod"].includes(mode?.trim().toLowerCase() ?? "");

const isConfiguredClientId = (id: string | undefined): id is string =>
  Boolean(id?.trim()) && !id!.trim().toLowerCase().startsWith("your-");

interface Props {
  playerName: string;
  onOpenPlayerPicker: () => void;
}

export function PronosticosView({ playerName, onOpenPlayerPicker }: Props) {
  const [status, setStatus] = useState<PremiumStatus>("checking");
  const [paypalLoading, setPaypalLoading] = useState(true);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);

  const playerKey = normalizeKey(playerName);

  useEffect(() => {
    if (!playerKey) { setStatus("locked"); return; }

    fetch(`/api/mundial/premium/check?name=${encodeURIComponent(playerKey)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { hasPremium: boolean } | null) => {
        setStatus(data?.hasPremium ? "unlocked" : "locked");
      })
      .catch(() => setStatus("locked"));
  }, [playerKey]);

  useEffect(() => {
    if (status !== "locked" || !playerKey) return;

    const container = paypalRef.current;
    let isMounted = true;

    const initButtons = () => {
      if (!container || !window.paypal) {
        if (isMounted) { setPaypalError("No se pudo cargar PayPal."); setPaypalLoading(false); }
        return;
      }

      container.innerHTML = "";

      const buttons = window.paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },
        createOrder: async () => {
          const res = await fetch("/api/mundial/premium/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerKey, playerName }),
          });
          const data = await res.json() as { orderID?: string; message?: string };
          if (!res.ok || !data.orderID) throw new Error(data.message ?? "Error al crear la orden.");
          return data.orderID;
        },
        onApprove: async (data: { orderID: string }) => {
          const res = await fetch("/api/mundial/premium/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID, playerKey, playerName }),
          });
          const result = await res.json() as { status?: string; message?: string };
          if (!res.ok || result.status !== "COMPLETED") {
            alert(result.message ?? "El pago no se completo. Intenta de nuevo.");
            return;
          }
          if (isMounted) setStatus("unlocked");
        },
        onError: (err: unknown) => {
          console.error("PAYPAL ERROR:", err);
          alert("Hubo un error con PayPal. Intenta de nuevo.");
        },
      });

      Promise.resolve(buttons.render(container))
        .then(() => { if (isMounted) setPaypalLoading(false); })
        .catch((err: unknown) => {
          if (isMounted) {
            setPaypalError(err instanceof Error ? err.message : "Error al renderizar PayPal.");
            setPaypalLoading(false);
          }
        });
    };

    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE;
    const isLive = isLivePayPalMode(mode);
    const clientId = (isLive
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID)?.trim();

    if (!isConfiguredClientId(clientId)) {
      setPaypalError(`PayPal no esta configurado (modo: ${mode ?? "sandbox"}).`);
      setPaypalLoading(false);
      return;
    }

    const sdkSrc = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons&currency=USD&intent=capture`;
    const existing = document.querySelector<HTMLScriptElement>("#paypal-sdk-premium");

    if (!existing) {
      const script = document.createElement("script");
      script.id = "paypal-sdk-premium";
      script.src = sdkSrc;
      script.async = true;
      script.onload = () => { if (isMounted) initButtons(); };
      script.onerror = () => {
        if (isMounted) { setPaypalError("No se pudo cargar el SDK de PayPal."); setPaypalLoading(false); }
      };
      document.body.appendChild(script);
    } else if (window.paypal) {
      initButtons();
    } else {
      existing.addEventListener("load", initButtons, { once: true });
    }

    return () => {
      isMounted = false;
      if (container) container.innerHTML = "";
    };
  }, [status, playerKey, playerName]);

  if (status === "checking") {
    return (
      <div className="grid min-h-72 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f0b429]" />
      </div>
    );
  }

  if (status === "unlocked") {
    return <UnlockedContent playerName={playerName} playerKey={playerKey} />;
  }

  return <LockedContent playerKey={playerKey} onOpenPlayerPicker={onOpenPlayerPicker} paypalRef={paypalRef} paypalLoading={paypalLoading} paypalError={paypalError} />;
}

function LockedContent({
  playerKey,
  onOpenPlayerPicker,
  paypalRef,
  paypalLoading,
  paypalError,
}: {
  playerKey: string;
  onOpenPlayerPicker: () => void;
  paypalRef: React.RefObject<HTMLDivElement | null>;
  paypalLoading: boolean;
  paypalError: string | null;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-4">
      {!playerKey && (
        <div className="rounded-xl border border-white/20 bg-white/5 p-5 text-center">
          <p className="mb-3 text-sm font-bold text-white/60">Registrate como jugador para acceder.</p>
          <button
            type="button"
            onClick={onOpenPlayerPicker}
            className="rounded-lg border border-[#f0b429]/50 bg-[#f0b429] px-4 py-2 text-sm font-black text-[#07110b] transition hover:bg-[#f5c842]"
          >
            Seleccionar jugador
          </button>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-[#f0b429]/30 bg-[#06100b] shadow-[0_0_60px_rgba(240,180,41,0.12)]">
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(240,180,41,0.15),transparent_60%)]" />
        <div className="relative p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-[#f0b429]/40 bg-[#f0b429]/10 shadow-[0_0_24px_rgba(240,180,41,0.25)]">
            <Crown className="h-8 w-8 text-[#f0b429]" />
          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#f0b429]/30 bg-[#f0b429]/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#f0b429]">
            <Sparkles className="h-3 w-3" /> Premium
          </div>

          <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">
            Pronosticos de Eliminacion Directa
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/55">
            Predeci resultados desde Octavos hasta la Gran Final y guarda tu bracket premium.
          </p>

          <div className="my-6 grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
            {STAGES.map((s) => (
              <div key={s.key} className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-[#f0b429]/15 text-xs font-black text-[#f0b429]">{s.icon}</span>
                <span className="text-xs font-bold text-white/70">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="mx-auto mb-6 flex items-center justify-center gap-3 rounded-xl border border-[#f0b429]/25 bg-[#f0b429]/8 px-4 py-3">
            <span className="text-3xl font-black text-white">${MUNDIAL_PREMIUM_PRICE_USD}</span>
            <span className="text-sm font-bold text-white/50">USD - pago unico</span>
          </div>

          <div className="mb-4 flex flex-wrap justify-center gap-3 text-xs font-bold text-white/50">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-[#9dff34]" /> Pago seguro con PayPal</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-[#9dff34]" /> Acceso inmediato</span>
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[#f0b429]" /> Una sola vez</span>
          </div>

          {playerKey && (
            <div className="relative min-h-[160px] overflow-hidden rounded-xl border border-white/10 bg-black/30 p-3">
              {paypalLoading && !paypalError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-black/80 text-sm text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando PayPal...
                </div>
              )}
              {paypalError && (
                <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-300">
                  {paypalError}
                </div>
              )}
              <div ref={paypalRef} className="min-h-[140px] w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function emptyPredictions(): PremiumPrediction[] {
  return STAGES.flatMap((stage) =>
    Array.from({ length: stage.slots }, (_, index) => ({
      stage: stage.key,
      slot: index + 1,
      teamA: "",
      teamB: "",
      scoreA: "",
      scoreB: "",
      winner: "",
      confidence: "",
      note: "",
    }))
  );
}

function mergePredictions(saved: PremiumPrediction[]) {
  const byKey = new Map(saved.map((pick) => [`${pick.stage}-${pick.slot}`, pick]));
  return emptyPredictions().map((blank) => ({ ...blank, ...byKey.get(`${blank.stage}-${blank.slot}`) }));
}

function UnlockedContent({ playerName, playerKey }: { playerName: string; playerKey: string }) {
  const [predictions, setPredictions] = useState<PremiumPrediction[]>(emptyPredictions);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!playerKey) return;
    setLoading(true);
    fetch(`/api/mundial/premium/predictions?name=${encodeURIComponent(playerKey)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { predictions: [] }))
      .then((data: { predictions?: PremiumPrediction[] }) => {
        setPredictions(mergePredictions(data.predictions ?? []));
      })
      .catch(() => setError("No se pudieron cargar tus pronosticos."))
      .finally(() => setLoading(false));
  }, [playerKey]);

  function updatePick(stage: string, slot: number, patch: Partial<PremiumPrediction>) {
    setPredictions((current) =>
      current.map((pick) => (pick.stage === stage && pick.slot === slot ? { ...pick, ...patch } : pick))
    );
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/mundial/premium/predictions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerKey, playerName, predictions }),
      });
      const data = (await res.json()) as { predictions?: PremiumPrediction[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar.");
      setPredictions(mergePredictions(data.predictions ?? []));
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  const completed = predictions.filter((pick) => pick.teamA && pick.teamB && pick.scoreA !== "" && pick.scoreB !== "" && pick.winner).length;
  const total = predictions.length;

  return (
    <div className="space-y-5 py-4">
      <div className="flex flex-col gap-3 rounded-xl border border-[#9dff34]/30 bg-[#0d2610]/80 px-4 py-3 sm:flex-row sm:items-center">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#9dff34]" />
        <div className="min-w-0">
          <p className="text-sm font-black text-white">Acceso desbloqueado, {playerName}.</p>
          <p className="mt-0.5 text-xs text-white/50">Completa tus predicciones pagas de eliminatoria. Progreso: {completed}/{total}</p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#f0b429]/45 bg-[#f0b429] px-4 text-sm font-black text-[#07110b] transition hover:bg-[#ffe083] disabled:opacity-50 sm:ml-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Guardando" : saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-[#ff6a3d]/50 bg-[#35130d]/80 px-4 py-3 text-sm font-bold text-[#ffd2c2]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid min-h-40 place-items-center rounded-xl border border-white/12 bg-black/35">
          <Loader2 className="h-7 w-7 animate-spin text-[#f0b429]" />
        </div>
      ) : (
        STAGES.map((stage) => (
          <section key={stage.key} className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-[#f0b429]/15 text-xs font-black text-[#f0b429]">{stage.icon}</span>
              <h3 className="font-black text-white">{stage.label}</h3>
              <span className="ml-auto rounded border border-[#f0b429]/30 bg-[#f0b429]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#f0b429]">
                {stage.slots} {stage.slots === 1 ? "partido" : "partidos"}
              </span>
            </div>
            <div className="grid gap-3 p-3">
              {predictions.filter((pick) => pick.stage === stage.key).map((pick) => (
                <PremiumPredictionRow
                  key={`${pick.stage}-${pick.slot}`}
                  pick={pick}
                  onChange={(patch) => updatePick(pick.stage, pick.slot, patch)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function PremiumPredictionRow({
  pick,
  onChange,
}: {
  pick: PremiumPrediction;
  onChange: (patch: Partial<PremiumPrediction>) => void;
}) {
  return (
    <article className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-3 lg:grid-cols-[4rem_minmax(0,1fr)_8rem_minmax(0,1fr)_8rem_8rem] lg:items-end">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-white/35">Partido</p>
        <p className="mt-1 text-xl font-black tabular-nums text-[#f0b429]">#{pick.slot}</p>
      </div>

      <PredictionInput label="Equipo A" value={pick.teamA} onChange={(value) => onChange({ teamA: value })} />
      <PredictionNumber label="Goles A" value={pick.scoreA} onChange={(value) => onChange({ scoreA: value })} />
      <PredictionInput label="Equipo B" value={pick.teamB} onChange={(value) => onChange({ teamB: value })} />
      <PredictionNumber label="Goles B" value={pick.scoreB} onChange={(value) => onChange({ scoreB: value })} />

      <label className="grid gap-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-white/35">Pasa</span>
        <select
          value={pick.winner}
          onChange={(e) => onChange({ winner: e.target.value as Winner })}
          className="h-10 rounded-lg border border-white/12 bg-black/35 px-2 text-sm font-black text-white outline-none focus:border-[#f0b429]/60"
        >
          <option value="">Pendiente</option>
          <option value="teamA">Equipo A</option>
          <option value="teamB">Equipo B</option>
        </select>
      </label>

      <div className="grid gap-3 lg:col-span-6 lg:grid-cols-[8rem_minmax(0,1fr)]">
        <PredictionNumber label="Conf. 1-5" min={1} max={5} value={pick.confidence} onChange={(value) => onChange({ confidence: value })} />
        <PredictionInput label="Nota" value={pick.note} onChange={(value) => onChange({ note: value })} />
      </div>
    </article>
  );
}

function PredictionInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] font-black uppercase tracking-wider text-white/35">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-white/12 bg-black/35 px-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#f0b429]/60"
      />
    </label>
  );
}

function PredictionNumber({
  label,
  value,
  onChange,
  min = 0,
  max = 30,
}: {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] font-black uppercase tracking-wider text-white/35">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="h-10 rounded-lg border border-white/12 bg-black/35 px-2 text-center text-sm font-black tabular-nums text-white outline-none focus:border-[#f0b429]/60"
      />
    </label>
  );
}
