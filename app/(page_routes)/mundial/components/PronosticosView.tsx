"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Crown, Loader2, Lock, ShieldCheck, Sparkles, Star, Trophy, X,
} from "lucide-react";
import { normalizeKey } from "../utils";
import { MUNDIAL_PREMIUM_PRICE_USD } from "../constants";

/* ─── PayPal SDK type ─── */
declare global {
  interface Window {
    paypal?: { Buttons: (cfg: unknown) => { render: (el: HTMLDivElement) => Promise<void> | void } };
  }
}

/* ─── Types ─── */
type PremiumStatus = "checking" | "locked" | "unlocked";

export type PlayerBet = {
  betId: string;
  betTitle: string;
  pick: unknown;
  amountPaid: number;
  paidAt: string;
  resolved: boolean;
  result: "won" | "lost" | null;
};

type PickType = "text" | "yesno" | "score" | "multi4" | "combo";

type BetConfig = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  price: number;
  tag?: string;
  pickType: PickType;
  pickLabel?: string;
  pickPlaceholder?: string;
  winCondition: string;
};

/* ─── Bet catalog ─── */
const BETS: BetConfig[] = [
  {
    id: "champion",
    emoji: "🏆",
    title: "Campeón del Torneo",
    description: "¿Cuál selección levanta el trofeo el 19 de julio? El pozo se divide entre todos los que aciertan.",
    price: 3,
    tag: "Popular",
    pickType: "text",
    pickLabel: "País campeón",
    pickPlaceholder: "Ej: Argentina, Brasil, España...",
    winCondition: "El equipo que gana la Final del Mundial 2026",
  },
  {
    id: "top_scorer",
    emoji: "👟",
    title: "Bota de Oro",
    description: "Elegí al máximo goleador del torneo. Pozo acumulado entre los que aciertan.",
    price: 3,
    tag: "🔥 Hot",
    pickType: "text",
    pickLabel: "Jugador goleador",
    pickPlaceholder: "Ej: Mbappé, Messi, Vinicius...",
    winCondition: "El jugador con más goles al final del torneo",
  },
  {
    id: "mvp",
    emoji: "⭐",
    title: "Balón de Oro del Mundial",
    description: "¿Quién recibirá el premio al mejor jugador del torneo? Uno solo lo gana.",
    price: 3,
    tag: "Exclusivo",
    pickType: "text",
    pickLabel: "Jugador MVP",
    pickPlaceholder: "Ej: Mbappé, Haaland, Pedri...",
    winCondition: "El ganador del Balón de Oro oficial del Mundial 2026",
  },
  {
    id: "final_penalties",
    emoji: "🥅",
    title: "¿Final a los Penales?",
    description: "¿La gran final se decidirá desde el punto de penal? Apostás $2 y si acertás duplicás el pozo.",
    price: 2,
    pickType: "yesno",
    winCondition: "Si la Final del Mundial 2026 va a penales",
  },
  {
    id: "final_score",
    emoji: "🎯",
    title: "Marcador Exacto de la Final",
    description: "El riesgo más alto, la recompensa más grande. Adiviná el marcador exacto al 90'.",
    price: 5,
    tag: "💰 Jackpot",
    pickType: "score",
    winCondition: "El marcador al final del tiempo reglamentario (90 min) de la Final",
  },
  {
    id: "semi_finalists",
    emoji: "🔮",
    title: "Mis Cuatro Semifinalistas",
    description: "Escribí los 4 equipos que creés que llegan a semis. Cada acierto te suma al pozo.",
    price: 4,
    tag: "Difícil",
    pickType: "multi4",
    pickLabel: "Los 4 equipos que llegan a semis",
    pickPlaceholder: "País",
    winCondition: "Los 4 equipos que lleguen a semifinales del Mundial 2026",
  },
  {
    id: "third_place",
    emoji: "🥉",
    title: "Ganador del Tercer Lugar",
    description: "¿Quién se lleva el bronce? La pelea por el tercer puesto también tiene pozo.",
    price: 2,
    pickType: "text",
    pickLabel: "País 3er lugar",
    pickPlaceholder: "Ej: Francia, Alemania...",
    winCondition: "El equipo que gana el partido por el tercer lugar",
  },
  {
    id: "biggest_blowout",
    emoji: "💥",
    title: "Mayor Goleada del Torneo",
    description: "¿Qué partido tendrá la mayor diferencia de goles? Escribí el equipo ganador y el marcador que esperás.",
    price: 3,
    tag: "Atrevido",
    pickType: "text",
    pickLabel: "Equipo y marcador que adivinás",
    pickPlaceholder: "Ej: España 7-0 vs Costa Rica",
    winCondition: "El partido con mayor diferencia de goles en todo el torneo",
  },
  {
    id: "first_upset",
    emoji: "⚡",
    title: "Primera Gran Sorpresa",
    description: "¿Cuál favorito cae antes de las semis? Escribí el equipo que creés que se irá antes de lo esperado.",
    price: 3,
    tag: "Arriesgado",
    pickType: "text",
    pickLabel: "El favorito que se va de sorpresa",
    pickPlaceholder: "Ej: Brasil eliminado en cuartos",
    winCondition: "El primer equipo favorito eliminado antes de las semifinales",
  },
  {
    id: "maestro",
    emoji: "🎰",
    title: "Combo Maestro",
    description: "El bet supremo: campeón + goleador + marcador exacto de la final. Los 3 correctos y el pozo es tuyo.",
    price: 10,
    tag: "👑 Legendario",
    pickType: "combo",
    winCondition: "Campeón + Goleador + Marcador exacto (los 3 correctos)",
  },
];

/* ─── PayPal helpers ─── */
const isLiveMode = (mode: string | undefined) =>
  ["live", "production", "prod"].includes(mode?.trim().toLowerCase() ?? "");

const isValidClientId = (id: string | undefined): id is string =>
  Boolean(id?.trim()) && !id!.trim().toLowerCase().startsWith("your-");

const SDK_SCRIPT_ID = "paypal-sdk-mundial";

function loadPayPalSDK(onReady: () => void, onError: () => void) {
  const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE;
  const isLive = isLiveMode(mode);
  const clientId = (isLive
    ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID)?.trim();

  if (!isValidClientId(clientId)) { onError(); return; }

  const src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons&currency=USD&intent=capture`;
  const existing = document.querySelector<HTMLScriptElement>(`#${SDK_SCRIPT_ID}`);

  if (window.paypal) { onReady(); return; }

  if (existing) {
    existing.addEventListener("load", onReady, { once: true });
    existing.addEventListener("error", onError, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.id = SDK_SCRIPT_ID;
  script.src = src;
  script.async = true;
  script.onload = onReady;
  script.onerror = onError;
  document.body.appendChild(script);
}

/* ═══════════════════════════════════════════════════════════════ */
/*  PronosticosView — main component                               */
/* ═══════════════════════════════════════════════════════════════ */
interface Props {
  playerName: string;
  onOpenPlayerPicker: () => void;
}

export function PronosticosView({ playerName, onOpenPlayerPicker }: Props) {
  const [status, setStatus] = useState<PremiumStatus>("checking");
  const [sdkReady, setSdkReady] = useState(false);
  const [email, setEmail] = useState("");
  const [myBets, setMyBets] = useState<PlayerBet[]>([]);
  const [betsLoading, setBetsLoading] = useState(false);
  const router = useRouter();

  const playerKey = normalizeKey(playerName);

  /* Check premium status */
  useEffect(() => {
    if (!playerKey) { setStatus("locked"); return; }
    fetch(`/api/mundial/premium/check?name=${encodeURIComponent(playerKey)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { hasPremium: boolean } | null) => setStatus(d?.hasPremium ? "unlocked" : "locked"))
      .catch(() => setStatus("locked"));
  }, [playerKey]);

  /* Load SDK whenever unlocked or locked-with-player */
  useEffect(() => {
    if (status === "checking") return;
    loadPayPalSDK(() => setSdkReady(true), () => setSdkReady(false));
  }, [status]);

  /* Load player's bets when unlocked */
  const refreshBets = useCallback(() => {
    if (!playerKey) return;
    setBetsLoading(true);
    fetch(`/api/mundial/premium-bets/my-bets?name=${encodeURIComponent(playerKey)}`)
      .then((r) => (r.ok ? r.json() : { bets: [] }))
      .then((d: { bets: PlayerBet[] }) => setMyBets(d.bets))
      .catch(() => {})
      .finally(() => setBetsLoading(false));
  }, [playerKey]);

  useEffect(() => {
    if (status === "unlocked") refreshBets();
  }, [status, refreshBets]);

  /* ── Render ── */
  if (status === "checking") {
    return (
      <div className="grid min-h-72 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f0b429]" />
      </div>
    );
  }

  if (status === "unlocked") {
    return (
      <UnlockedContent
        playerName={playerName}
        playerKey={playerKey}
        myBets={myBets}
        betsLoading={betsLoading}
        sdkReady={sdkReady}
        onBetPlaced={refreshBets}
      />
    );
  }

  return (
    <LockedContent
      playerKey={playerKey}
      playerName={playerName}
      email={email}
      setEmail={setEmail}
      sdkReady={sdkReady}
      onOpenPlayerPicker={onOpenPlayerPicker}
      onSuccess={() => router.push(`/mundial/premium/success?name=${encodeURIComponent(playerKey || playerName)}`)}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  LockedContent — payment gate                                   */
/* ═══════════════════════════════════════════════════════════════ */
function LockedContent({
  playerKey, playerName, email, setEmail, sdkReady, onOpenPlayerPicker, onSuccess,
}: {
  playerKey: string;
  playerName: string;
  email: string;
  setEmail: (v: string) => void;
  sdkReady: boolean;
  onOpenPlayerPicker: () => void;
  onSuccess: () => void;
}) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [paypalInitialized, setPaypalInitialized] = useState(false);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (!sdkReady || !emailOk || !playerKey || paypalInitialized || !paypalRef.current || !window.paypal) return;
    const container = paypalRef.current;
    let live = true;
    setPaypalLoading(true);
    container.innerHTML = "";

    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },
      createOrder: async () => {
        const res = await fetch("/api/mundial/premium/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerKey, playerName, email }),
        });
        const d = await res.json() as { orderID?: string; message?: string };
        if (!res.ok || !d.orderID) throw new Error(d.message ?? "Error al crear la orden.");
        return d.orderID;
      },
      onApprove: async (d: { orderID: string }) => {
        const res = await fetch("/api/mundial/premium/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderID: d.orderID, playerKey, playerName, email }),
        });
        const result = await res.json() as { status?: string; message?: string };
        if (!res.ok || result.status !== "COMPLETED") {
          alert(result.message ?? "El pago no se completó. Intentá de nuevo.");
          return;
        }
        if (live) onSuccess();
      },
      onError: (err: unknown) => {
        console.error("PAYPAL:", err);
        alert("Hubo un error con PayPal. Intentá de nuevo.");
      },
    });

    Promise.resolve(buttons.render(container))
      .then(() => { if (live) { setPaypalLoading(false); setPaypalInitialized(true); } })
      .catch((err: unknown) => {
        if (live) { setPaypalError(err instanceof Error ? err.message : "Error al cargar PayPal."); setPaypalLoading(false); }
      });

    return () => { live = false; };
  }, [sdkReady, emailOk, playerKey, playerName, email, paypalInitialized, onSuccess]);

  // Reset PayPal when email changes so buttons are re-rendered for new email
  useEffect(() => { setPaypalInitialized(false); setPaypalError(null); }, [email]);

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-4">
      {!playerKey && (
        <div className="rounded-xl border border-white/20 bg-white/5 p-5 text-center">
          <p className="mb-3 text-sm font-bold text-white/60">Registrate como jugador para acceder.</p>
          <button type="button" onClick={onOpenPlayerPicker}
            className="rounded-lg border border-[#f0b429]/50 bg-[#f0b429] px-4 py-2 text-sm font-black text-[#07110b] transition hover:bg-[#f5c842]">
            Seleccionar jugador
          </button>
        </div>
      )}

      {/* Hero gate card */}
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
            Pronósticos y Apuestas<br />de Eliminación Directa
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/55">
            10 apuestas exclusivas, pronósticos de cada ronda eliminatoria, y un pozo real que se divide entre los ganadores.
          </p>

          {/* Feature grid */}
          <div className="my-6 grid grid-cols-2 gap-2 text-left sm:grid-cols-3">
            {[
              { e: "🏆", t: "Campeón del Torneo" },
              { e: "👟", t: "Bota de Oro" },
              { e: "⭐", t: "MVP del Torneo" },
              { e: "🥅", t: "¿Final a penales?" },
              { e: "🎯", t: "Marcador de la Final" },
              { e: "🔮", t: "Mis Semifinalistas" },
              { e: "🥉", t: "Tercer Lugar" },
              { e: "💥", t: "Mayor Goleada" },
              { e: "⚡", t: "Primera Sorpresa" },
              { e: "🎰", t: "Combo Maestro" },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-2">
                <span className="text-sm leading-none">{f.e}</span>
                <span className="text-[11px] font-bold leading-tight text-white/60">{f.t}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="mx-auto mb-6 inline-flex items-center gap-3 rounded-xl border border-[#f0b429]/25 bg-[#f0b429]/8 px-6 py-3">
            <span className="text-3xl font-black text-white">${MUNDIAL_PREMIUM_PRICE_USD}</span>
            <span className="text-sm font-bold text-white/50">USD · acceso único a todo</span>
          </div>

          {/* Trust badges */}
          <div className="mb-5 flex flex-wrap justify-center gap-3 text-xs font-bold text-white/40">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-[#9dff34]" /> Pago seguro PayPal</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-[#9dff34]" /> Acceso inmediato</span>
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[#f0b429]" /> Un solo pago</span>
          </div>

          {playerKey && (
            <>
              {/* Email input */}
              <div className="mx-auto mb-4 max-w-sm text-left">
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-white/50">
                  Tu email (para la confirmación)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-[#f0b429]/50 focus:ring-1 focus:ring-[#f0b429]/30"
                />
                {email && !emailOk && (
                  <p className="mt-1 text-[11px] text-[#ff6a3d]">Ingresá un email válido para continuar.</p>
                )}
              </div>

              {/* PayPal button */}
              <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl border border-white/10 bg-black/30 p-3">
                {(!emailOk) && (
                  <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 p-4 text-center text-sm text-white/35">
                    <div>
                      <Lock className="mx-auto mb-2 h-5 w-5 opacity-40" />
                      Ingresá tu email para habilitar el pago
                    </div>
                  </div>
                )}
                {emailOk && (paypalLoading || !paypalInitialized) && !paypalError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-black/80 text-sm text-white/60">
                    <Loader2 className="h-4 w-4 animate-spin" /> Cargando PayPal...
                  </div>
                )}
                {paypalError && (
                  <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-300">
                    {paypalError}
                  </div>
                )}
                <div ref={paypalRef} className="min-h-[120px] w-full" style={{ display: emailOk ? "block" : "none" }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  UnlockedContent — the casino panel                            */
/* ═══════════════════════════════════════════════════════════════ */
function UnlockedContent({
  playerName, playerKey, myBets, betsLoading, sdkReady, onBetPlaced,
}: {
  playerName: string;
  playerKey: string;
  myBets: PlayerBet[];
  betsLoading: boolean;
  sdkReady: boolean;
  onBetPlaced: () => void;
}) {
  const betMap = Object.fromEntries(myBets.map((b) => [b.betId, b]));
  const placedCount = myBets.length;
  const totalSpent = myBets.reduce((s, b) => s + (b.amountPaid ?? 0), 0);

  return (
    <div className="space-y-5 py-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#f0b429]/25 bg-[#06100b] px-4 py-3">
        <Crown className="h-5 w-5 shrink-0 text-[#f0b429]" />
        <div className="min-w-0 flex-1">
          <p className="font-black text-white">{playerName} · Acceso Premium</p>
          <p className="text-xs text-white/40">
            {betsLoading ? "Cargando apuestas..." : `${placedCount} de ${BETS.length} apuestas colocadas · $${totalSpent.toFixed(0)} USD apostados`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#9dff34]/30 bg-[#9dff34]/10 px-3 py-1 text-[11px] font-black text-[#9dff34]">
          <CheckCircle2 className="h-3 w-3" /> Verificado
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-white/40">
          <span>Progreso de apuestas</span>
          <span>{placedCount}/{BETS.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#f0b429] transition-all duration-700"
            style={{ width: `${(placedCount / BETS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Bet grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {BETS.map((bet) => (
          <BetCard
            key={bet.id}
            bet={bet}
            existingBet={betMap[bet.id] ?? null}
            playerKey={playerKey}
            playerName={playerName}
            sdkReady={sdkReady}
            onBetPlaced={onBetPlaced}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  BetCard                                                        */
/* ═══════════════════════════════════════════════════════════════ */
type PickValue =
  | { text: string }
  | { yesno: "yes" | "no" }
  | { homeScore: number; awayScore: number }
  | { teams: string[] }
  | { champion: string; scorer: string; homeScore: number; awayScore: number };

function BetCard({
  bet, existingBet, playerKey, playerName, sdkReady, onBetPlaced,
}: {
  bet: BetConfig;
  existingBet: PlayerBet | null;
  playerKey: string;
  playerName: string;
  sdkReady: boolean;
  onBetPlaced: () => void;
}) {
  const [pick, setPick] = useState<PickValue | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const isPlaced = Boolean(existingBet) || placed;
  const pickIsValid = pick !== null && (() => {
    if ("text" in pick) return pick.text.trim().length >= 2;
    if ("yesno" in pick) return Boolean(pick.yesno);
    if ("homeScore" in pick && "awayScore" in pick && !("champion" in pick)) return true;
    if ("teams" in pick) return pick.teams.every((t) => t.trim().length >= 2);
    if ("champion" in pick) return pick.champion.trim().length >= 2 && pick.scorer.trim().length >= 2;
    return false;
  })();

  /* Initialize PayPal when showPayPal becomes true */
  useEffect(() => {
    if (!showPayPal || !sdkReady || initialized.current || !paypalRef.current || !window.paypal || !pick) return;
    initialized.current = true;
    const container = paypalRef.current;
    let live = true;
    setPaypalLoading(true);
    container.innerHTML = "";

    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },
      createOrder: async () => {
        const res = await fetch("/api/mundial/premium-bets/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerKey, playerName, betId: bet.id, betTitle: bet.title, pick, price: bet.price }),
        });
        const d = await res.json() as { orderID?: string; message?: string };
        if (!res.ok || !d.orderID) throw new Error(d.message ?? "Error al crear la apuesta.");
        return d.orderID;
      },
      onApprove: async (d: { orderID: string }) => {
        const res = await fetch("/api/mundial/premium-bets/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderID: d.orderID, playerKey, playerName, betId: bet.id, betTitle: bet.title, pick, price: bet.price }),
        });
        const result = await res.json() as { status?: string; message?: string };
        if (!res.ok || result.status !== "COMPLETED") {
          alert(result.message ?? "El pago no se completó. Intentá de nuevo.");
          return;
        }
        if (live) { setPlaced(true); setShowPayPal(false); onBetPlaced(); }
      },
      onError: (err: unknown) => {
        console.error("PAYPAL BET:", err);
        alert("Error con PayPal. Intentá de nuevo.");
      },
    });

    Promise.resolve(buttons.render(container))
      .then(() => { if (live) setPaypalLoading(false); })
      .catch((e: unknown) => {
        if (live) { setPaypalError(e instanceof Error ? e.message : "Error al renderizar PayPal."); setPaypalLoading(false); }
      });

    return () => { live = false; };
  }, [showPayPal, sdkReady, pick, playerKey, playerName, bet, onBetPlaced]);

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border transition-all duration-200 ${
      isPlaced
        ? "border-[#9dff34]/30 bg-[#0a1f0c]"
        : showPayPal
          ? "border-[#f0b429]/40 bg-[#0b1a10]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
    }`}>
      {/* Card header */}
      <div className="flex items-start gap-3 p-4">
        <span className="mt-0.5 text-2xl leading-none">{bet.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-black text-white">{bet.title}</p>
            {bet.tag && (
              <span className="rounded-full border border-[#f0b429]/30 bg-[#f0b429]/10 px-1.5 py-0.5 text-[10px] font-black text-[#f0b429]">
                {bet.tag}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/45">{bet.description}</p>
        </div>
        <span className="shrink-0 rounded-lg border border-white/15 bg-white/8 px-2.5 py-1 text-sm font-black text-white">
          ${bet.price}
        </span>
      </div>

      {/* Confirmed state */}
      {isPlaced ? (
        <div className="mx-4 mb-4 rounded-lg border border-[#9dff34]/25 bg-[#9dff34]/8 p-3">
          <div className="flex items-center gap-2 text-xs font-black text-[#9dff34]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            ¡Apuesta confirmada!
          </div>
          <p className="mt-1.5 text-xs text-white/50">
            Tu pick: <span className="font-bold text-white/80">{formatPick(existingBet?.pick ?? pick)}</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
          {/* Pick form */}
          <PickForm bet={bet} value={pick} onChange={setPick} />

          {/* CTA / PayPal section */}
          {!showPayPal ? (
            <button
              type="button"
              disabled={!pickIsValid}
              onClick={() => { if (pickIsValid) setShowPayPal(true); }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#f0b429]/50 bg-[#f0b429] py-2.5 text-sm font-black text-[#07110b] transition hover:bg-[#f5c842] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Lock className="h-3.5 w-3.5" />
              Apostar ${bet.price} USD
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-white/60">Tu apuesta: <span className="text-white/90">{formatPick(pick)}</span></p>
                <button
                  type="button"
                  onClick={() => { setShowPayPal(false); initialized.current = false; setPaypalError(null); }}
                  className="text-white/30 transition hover:text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative min-h-[130px] overflow-hidden rounded-lg border border-white/10 bg-black/30 p-2">
                {paypalLoading && !paypalError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-lg bg-black/80 text-xs text-white/50">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando...
                  </div>
                )}
                {paypalError && (
                  <div className="flex min-h-[110px] items-center justify-center rounded-lg border border-red-400/25 bg-red-950/30 p-3 text-xs text-red-300">
                    {paypalError}
                  </div>
                )}
                <div ref={paypalRef} className="min-h-[110px] w-full" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Pick form per bet type ─── */
function PickForm({ bet, value, onChange }: { bet: BetConfig; value: PickValue | null; onChange: (v: PickValue) => void }) {
  if (bet.pickType === "text") {
    const text = (value && "text" in value) ? value.text : "";
    return (
      <div>
        {bet.pickLabel && <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-white/40">{bet.pickLabel}</label>}
        <input
          type="text"
          value={text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder={bet.pickPlaceholder ?? "Escribí tu pick..."}
          className="w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-[#f0b429]/50 focus:ring-1 focus:ring-[#f0b429]/25"
        />
      </div>
    );
  }

  if (bet.pickType === "yesno") {
    const selected = (value && "yesno" in value) ? value.yesno : "";
    return (
      <div className="grid grid-cols-2 gap-2">
        {(["yes", "no"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange({ yesno: opt })}
            className={`rounded-lg border py-2.5 text-sm font-black transition ${
              selected === opt
                ? "border-[#f0b429] bg-[#f0b429]/15 text-[#f0b429]"
                : "border-white/12 bg-white/5 text-white/55 hover:border-white/25 hover:text-white"
            }`}
          >
            {opt === "yes" ? "✅ Sí" : "❌ No"}
          </button>
        ))}
      </div>
    );
  }

  if (bet.pickType === "score") {
    const hs = (value && "homeScore" in value && !("champion" in value)) ? (value as { homeScore: number; awayScore: number }).homeScore : "";
    const as_ = (value && "awayScore" in value && !("champion" in value)) ? (value as { homeScore: number; awayScore: number }).awayScore : "";
    return (
      <div>
        <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-white/40">Marcador (90 min)</label>
        <div className="flex items-center gap-2">
          <input type="number" min={0} max={20} value={hs}
            onChange={(e) => onChange({ homeScore: Number(e.target.value), awayScore: typeof as_ === "number" ? as_ : 0 })}
            className="w-16 rounded-lg border border-white/12 bg-white/5 px-2 py-2 text-center text-lg font-black text-white outline-none focus:border-[#f0b429]/50" />
          <span className="font-black text-white/30">—</span>
          <input type="number" min={0} max={20} value={as_}
            onChange={(e) => onChange({ homeScore: typeof hs === "number" ? hs : 0, awayScore: Number(e.target.value) })}
            className="w-16 rounded-lg border border-white/12 bg-white/5 px-2 py-2 text-center text-lg font-black text-white outline-none focus:border-[#f0b429]/50" />
          <span className="ml-1 text-xs text-white/30">al 90'</span>
        </div>
      </div>
    );
  }

  if (bet.pickType === "multi4") {
    const teams = (value && "teams" in value) ? value.teams : ["", "", "", ""];
    return (
      <div className="space-y-1.5">
        <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-white/40">{bet.pickLabel ?? "4 equipos"}</label>
        {[0, 1, 2, 3].map((i) => (
          <input key={i} type="text" value={teams[i] ?? ""} placeholder={`${bet.pickPlaceholder ?? "País"} ${i + 1}`}
            onChange={(e) => { const t = [...teams]; t[i] = e.target.value; onChange({ teams: t }); }}
            className="w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-[#f0b429]/50" />
        ))}
      </div>
    );
  }

  if (bet.pickType === "combo") {
    const champion = (value && "champion" in value) ? (value as { champion: string; scorer: string; homeScore: number; awayScore: number }).champion : "";
    const scorer = (value && "scorer" in value) ? (value as { champion: string; scorer: string; homeScore: number; awayScore: number }).scorer : "";
    const hs = (value && "homeScore" in value && "champion" in value) ? (value as { champion: string; scorer: string; homeScore: number; awayScore: number }).homeScore : 0;
    const as_ = (value && "awayScore" in value && "champion" in value) ? (value as { champion: string; scorer: string; homeScore: number; awayScore: number }).awayScore : 0;
    const upd = (field: string, v: string | number) => onChange({ champion, scorer, homeScore: hs, awayScore: as_, [field]: v } as PickValue);
    return (
      <div className="space-y-2">
        <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-white/40">Los 3 picks del Combo Maestro</label>
        <input type="text" value={champion} placeholder="🏆 País campeón" onChange={(e) => upd("champion", e.target.value)}
          className="w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-[#f0b429]/50" />
        <input type="text" value={scorer} placeholder="👟 Goleador del torneo" onChange={(e) => upd("scorer", e.target.value)}
          className="w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-[#f0b429]/50" />
        <div className="flex items-center gap-2">
          <input type="number" min={0} max={20} value={hs} onChange={(e) => upd("homeScore", Number(e.target.value))}
            className="w-14 rounded-lg border border-white/12 bg-white/5 px-2 py-2 text-center text-base font-black text-white outline-none focus:border-[#f0b429]/50" />
          <span className="text-xs text-white/30">🎯 Final</span>
          <input type="number" min={0} max={20} value={as_} onChange={(e) => upd("awayScore", Number(e.target.value))}
            className="w-14 rounded-lg border border-white/12 bg-white/5 px-2 py-2 text-center text-base font-black text-white outline-none focus:border-[#f0b429]/50" />
        </div>
      </div>
    );
  }

  return null;
}

/* ─── Pick display helper ─── */
function formatPick(pick: unknown): string {
  if (!pick) return "—";
  if (typeof pick === "object" && pick !== null) {
    const p = pick as Record<string, unknown>;
    if (typeof p.text === "string") return p.text;
    if (typeof p.yesno === "string") return p.yesno === "yes" ? "Sí" : "No";
    if (typeof p.homeScore === "number" && typeof p.awayScore === "number" && !p.champion)
      return `${p.homeScore} — ${p.awayScore}`;
    if (Array.isArray(p.teams)) return (p.teams as string[]).filter(Boolean).join(", ");
    if (typeof p.champion === "string")
      return `🏆 ${p.champion} · 👟 ${p.scorer} · 🎯 ${p.homeScore}-${p.awayScore}`;
  }
  return String(pick);
}
