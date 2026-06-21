"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, ChevronDown, ChevronUp, Crown, Filter, Loader2, Lock,
  ShieldCheck, Sparkles, Star, Target, TrendingUp, Trophy, Users, Wallet, X,
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

type BetCategory = "champion" | "players" | "final" | "specials" | "jackpot";
type RiskLevel = "bajo" | "medio" | "alto" | "jackpot";

type PremiumPool = {
  paidPlayers: number;
  totalPool: number;
  currency: string;
  price: number;
  projectedPrize: number;
  splitExamples: {
    oneWinner: number;
    twoWinners: number;
    threeWinners: number;
    fiveWinners: number;
  };
};

type BetConfig = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  price: number;
  includedInPremium?: boolean;
  tag?: string;
  pickType: PickType;
  pickLabel?: string;
  pickPlaceholder?: string;
  winCondition: string;
  difficulty: number; // 1-5
  category: BetCategory;
  riskLevel: RiskLevel;
};

/* ─── Category config ─── */
const CATEGORY_CONFIG: Record<BetCategory, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  champion: { label: "Campeón",    emoji: "🏆", color: "text-[#f0b429]",  bg: "bg-[#f0b429]/10",  border: "border-[#f0b429]/30" },
  players:  { label: "Jugadores",  emoji: "👟", color: "text-[#60a5fa]",  bg: "bg-[#60a5fa]/10",  border: "border-[#60a5fa]/30" },
  final:    { label: "Final",      emoji: "🎯", color: "text-[#f97316]",  bg: "bg-[#f97316]/10",  border: "border-[#f97316]/30" },
  specials: { label: "Especiales", emoji: "⚡", color: "text-[#a855f7]",  bg: "bg-[#a855f7]/10",  border: "border-[#a855f7]/30" },
  jackpot:  { label: "Jackpot",    emoji: "🎰", color: "text-[#9dff34]",  bg: "bg-[#9dff34]/10",  border: "border-[#9dff34]/30" },
};

/* ─── Bet catalog (15 bets) ─── */
const BETS: BetConfig[] = [
  {
    id: "champion",
    emoji: "🏆",
    title: "Campeón del Torneo",
    description: "¿Cuál selección levanta el trofeo el 19 de julio? El pozo se divide entre todos los que aciertan.",
    price: 3,
    includedInPremium: true,
    tag: "Popular",
    pickType: "text",
    pickLabel: "País campeón",
    pickPlaceholder: "Ej: Argentina, Brasil, España...",
    winCondition: "El equipo que gana la Final del Mundial 2026",
    difficulty: 3,
    category: "champion",
    riskLevel: "medio",
  },
  {
    id: "top_scorer",
    emoji: "👟",
    title: "Bota de Oro",
    description: "Elegí al máximo goleador del torneo. Pozo acumulado entre los que aciertan.",
    price: 3,
    includedInPremium: true,
    tag: "🔥 Hot",
    pickType: "text",
    pickLabel: "Jugador goleador",
    pickPlaceholder: "Ej: Mbappé, Messi, Vinicius...",
    winCondition: "El jugador con más goles al final del torneo",
    difficulty: 3,
    category: "players",
    riskLevel: "medio",
  },
  {
    id: "mvp",
    emoji: "⭐",
    title: "Balón de Oro del Mundial",
    description: "¿Quién recibirá el premio al mejor jugador del torneo? Uno solo lo gana.",
    price: 3,
    includedInPremium: true,
    tag: "Exclusivo",
    pickType: "text",
    pickLabel: "Jugador MVP",
    pickPlaceholder: "Ej: Mbappé, Haaland, Pedri...",
    winCondition: "El ganador del Balón de Oro oficial del Mundial 2026",
    difficulty: 3,
    category: "players",
    riskLevel: "medio",
  },
  {
    id: "golden_glove",
    emoji: "🧤",
    title: "Guante de Oro",
    description: "¿Cuál portero será el mejor del torneo? El arquero con menos goles recibidos y mejor desempeño.",
    price: 3,
    tag: "Difícil",
    pickType: "text",
    pickLabel: "Portero ganador",
    pickPlaceholder: "Ej: Courtois, Alisson, Ter Stegen...",
    winCondition: "El portero ganador del Guante de Oro oficial del Mundial 2026",
    difficulty: 3,
    category: "players",
    riskLevel: "medio",
  },
  {
    id: "first_goal",
    emoji: "🥇",
    title: "Primer Gol del Torneo",
    description: "¿Quién marcará el primer gol del Mundial 2026? El jugador que abra el marcador en el partido inaugural.",
    price: 4,
    tag: "Exclusivo",
    pickType: "text",
    pickLabel: "Jugador que anota el primer gol",
    pickPlaceholder: "Ej: Vinicius, Mbappé, Yamal...",
    winCondition: "El jugador que marque el primer gol del Mundial 2026",
    difficulty: 4,
    category: "players",
    riskLevel: "alto",
  },
  {
    id: "final_penalties",
    emoji: "🥅",
    title: "¿Final a los Penales?",
    description: "¿La gran final se decidirá desde el punto de penal? Apostás $2 y si acertás te repartís el pozo.",
    price: 2,
    includedInPremium: true,
    pickType: "yesno",
    winCondition: "Si la Final del Mundial 2026 va a penales",
    difficulty: 2,
    category: "final",
    riskLevel: "bajo",
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
    difficulty: 5,
    category: "final",
    riskLevel: "jackpot",
  },
  {
    id: "semi_finalists",
    emoji: "🔮",
    title: "Mis Cuatro Semifinalistas",
    description: "Escribí los 4 equipos que creés que llegan a semis. Cada acierto te suma al pozo.",
    price: 4,
    includedInPremium: true,
    tag: "Difícil",
    pickType: "multi4",
    pickLabel: "Los 4 equipos que llegan a semis",
    pickPlaceholder: "País",
    winCondition: "Los 4 equipos que lleguen a semifinales del Mundial 2026",
    difficulty: 4,
    category: "champion",
    riskLevel: "alto",
  },
  {
    id: "third_place",
    emoji: "🥉",
    title: "Ganador del Tercer Lugar",
    description: "¿Quién se lleva el bronce? La pelea por el tercer puesto también tiene pozo.",
    price: 2,
    includedInPremium: true,
    pickType: "text",
    pickLabel: "País 3er lugar",
    pickPlaceholder: "Ej: Francia, Alemania...",
    winCondition: "El equipo que gana el partido por el tercer lugar",
    difficulty: 2,
    category: "champion",
    riskLevel: "bajo",
  },
  {
    id: "group_goals",
    emoji: "⚽",
    title: "Grupo Más Goleador",
    description: "¿Cuál de los grupos de la fase inicial marcará más goles? Apostá a la letra del grupo más explosivo.",
    price: 2,
    includedInPremium: true,
    tag: "Fácil",
    pickType: "text",
    pickLabel: "Letra del grupo",
    pickPlaceholder: "Ej: A, B, C, D, E, F...",
    winCondition: "El grupo con más goles totales en la fase de grupos del Mundial 2026",
    difficulty: 2,
    category: "specials",
    riskLevel: "bajo",
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
    difficulty: 3,
    category: "specials",
    riskLevel: "medio",
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
    difficulty: 3,
    category: "specials",
    riskLevel: "medio",
  },
  {
    id: "most_red_cards",
    emoji: "🟥",
    title: "El Equipo Más Polémico",
    description: "¿Qué selección acumulará más tarjetas rojas en todo el torneo? El equipo más agresivo paga.",
    price: 2,
    includedInPremium: true,
    tag: "Atrevido",
    pickType: "text",
    pickLabel: "País más polémico",
    pickPlaceholder: "Ej: Uruguay, Argentina, Senegal...",
    winCondition: "El equipo con más tarjetas rojas en todo el torneo",
    difficulty: 3,
    category: "specials",
    riskLevel: "medio",
  },
  {
    id: "dark_horse",
    emoji: "🐴",
    title: "El Caballo Negro",
    description: "¿Cuál selección sorprenderá llegando a cuartos de final sin ser favorita? Apostar al outsider vale más.",
    price: 4,
    tag: "Arriesgado",
    pickType: "text",
    pickLabel: "El equipo sorpresa",
    pickPlaceholder: "Ej: Japón, Marruecos, Ecuador...",
    winCondition: "El equipo inesperado que llega a cuartos de final del Mundial 2026",
    difficulty: 4,
    category: "specials",
    riskLevel: "alto",
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
    difficulty: 5,
    category: "jackpot",
    riskLevel: "jackpot",
  },
];

const TEAM_OPTIONS = [
  "Argentina", "Brazil", "Spain", "France", "England", "Portugal", "Germany", "Netherlands",
  "Uruguay", "Belgium", "Croatia", "Colombia", "Morocco", "USA", "Mexico", "Canada",
  "Japan", "Senegal", "Switzerland", "Austria", "Norway", "Sweden", "Ecuador", "Ghana",
  "Paraguay", "Australia", "Cote d'Ivoire", "Egypt", "IR Iran", "Saudi Arabia", "Qatar",
  "South Africa", "Korea Republic", "Scotland", "Tunisia", "Algeria", "Turkiye", "Panama",
  "Czechia", "Bosnia and Herzegovina", "Haiti", "Curacao", "New Zealand", "Cabo Verde",
  "Iraq", "Jordan", "Congo DR", "Uzbekistan",
];

const PLAYER_OPTIONS = [
  "Lionel Messi", "Kylian Mbappe", "Vinicius Jr.", "Erling Haaland", "Jude Bellingham",
  "Lamine Yamal", "Harry Kane", "Cristiano Ronaldo", "Neymar Jr.", "Pedri",
  "Bukayo Saka", "Phil Foden", "Jamal Musiala", "Florian Wirtz", "Rodrygo",
  "Lautaro Martinez", "Julian Alvarez", "Raphinha", "Rafael Leao", "Bruno Fernandes",
  "Antoine Griezmann", "Ousmane Dembele", "Mohamed Salah", "Achraf Hakimi", "Christian Pulisic",
  "Santiago Gimenez", "Alphonso Davies", "Darwin Nunez", "Federico Valverde", "Luis Diaz",
];

const GOALKEEPER_OPTIONS = [
  "Thibaut Courtois", "Alisson Becker", "Emiliano Martinez", "Mike Maignan", "Unai Simon",
  "Diogo Costa", "Manuel Neuer", "Gregor Kobel", "Yassine Bounou", "Jordan Pickford",
  "Andries Noppert", "Matt Turner", "Guillermo Ochoa", "Kasper Schmeichel", "Wojciech Szczesny",
];

const GROUP_OPTIONS = ["Grupo A", "Grupo B", "Grupo C", "Grupo D", "Grupo E", "Grupo F", "Grupo G", "Grupo H", "Grupo I", "Grupo J", "Grupo K", "Grupo L"];

const BLOWOUT_OPTIONS = [
  "Brazil 4-0 Haiti", "Spain 4-0 Cabo Verde", "France 4-0 Iraq", "England 4-0 Panama",
  "Argentina 4-0 Jordan", "Portugal 4-0 Uzbekistan", "Germany 4-0 Curacao", "Netherlands 4-0 Tunisia",
  "Belgium 3-0 New Zealand", "Uruguay 3-0 Saudi Arabia", "Morocco 3-0 Haiti", "USA 3-0 Australia",
];

const UPSET_OPTIONS = [
  "Brazil eliminado en cuartos", "Argentina eliminado en cuartos", "France eliminado en cuartos",
  "England eliminado en octavos", "Spain eliminado en cuartos", "Portugal eliminado en octavos",
  "Germany eliminado en fase de grupos", "Netherlands eliminado en octavos", "Belgium eliminado en fase de grupos",
];

const DARK_HORSE_OPTIONS = [
  "Morocco llega a cuartos", "Japan llega a cuartos", "Ecuador llega a cuartos", "Senegal llega a cuartos",
  "USA llega a cuartos", "Canada llega a cuartos", "Sweden llega a cuartos", "Austria llega a cuartos",
  "Colombia llega a semifinales", "Ghana llega a cuartos", "Cabo Verde llega a octavos",
];

const SCORE_PRESETS = [
  { label: "1-0", homeScore: 1, awayScore: 0 },
  { label: "1-1", homeScore: 1, awayScore: 1 },
  { label: "2-0", homeScore: 2, awayScore: 0 },
  { label: "2-1", homeScore: 2, awayScore: 1 },
  { label: "2-2", homeScore: 2, awayScore: 2 },
  { label: "3-1", homeScore: 3, awayScore: 1 },
];

const PREMIUM_PACK_FEATURES = [
  "Pack de stickers premium para celebrar picks",
  "Marco e imagen de perfil mejorada",
  "Sonidos desbloqueados para aciertos y live",
  "15 apuestas exclusivas del Mundial",
  "Pronosticos extra de eliminatoria completa",
  "Mas predicciones por ronda final",
  "Acceso a jackpots especiales",
  "Insignia Premium en tu perfil",
  "Resumen privado de tus apuestas pagas",
  "Entrada al pozo acumulado premium",
];

const EMPTY_POOL: PremiumPool = {
  paidPlayers: 0,
  totalPool: 0,
  currency: "USD",
  price: MUNDIAL_PREMIUM_PRICE_USD,
  projectedPrize: 0,
  splitExamples: { oneWinner: 0, twoWinners: 0, threeWinners: 0, fiveWinners: 0 },
};

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

function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
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
  const [pool, setPool] = useState<PremiumPool>(EMPTY_POOL);
  const router = useRouter();

  const playerKey = normalizeKey(playerName);

  useEffect(() => {
    if (!playerKey) { setStatus("locked"); return; }
    fetch(`/api/mundial/premium/check?name=${encodeURIComponent(playerKey)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { hasPremium: boolean } | null) => setStatus(d?.hasPremium ? "unlocked" : "locked"))
      .catch(() => setStatus("locked"));
  }, [playerKey]);

  useEffect(() => {
    if (status === "checking") return;
    loadPayPalSDK(() => setSdkReady(true), () => setSdkReady(false));
  }, [status]);

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

  useEffect(() => {
    fetch("/api/mundial/premium/pool")
      .then((r) => (r.ok ? r.json() : EMPTY_POOL))
      .then((data: PremiumPool) => setPool({ ...EMPTY_POOL, ...data }))
      .catch(() => setPool(EMPTY_POOL));
  }, [status]);

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
        pool={pool}
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
      pool={pool}
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
  playerKey, playerName, email, setEmail, pool, sdkReady, onOpenPlayerPicker, onSuccess,
}: {
  playerKey: string;
  playerName: string;
  email: string;
  setEmail: (v: string) => void;
  pool: PremiumPool;
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

  useEffect(() => { setPaypalInitialized(false); setPaypalError(null); }, [email]);

  const totalBetValue = BETS.reduce((s, b) => s + b.price, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5 py-4">
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
      <div className="relative overflow-hidden rounded-2xl border border-[#f0b429]/30 bg-[#06100b] shadow-[0_0_80px_rgba(240,180,41,0.12)]">
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(240,180,41,0.18),transparent_55%)]" />
        <div className="relative p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-[#f0b429]/40 bg-[#f0b429]/10 shadow-[0_0_32px_rgba(240,180,41,0.3)]">
            <Crown className="h-8 w-8 text-[#f0b429]" />
          </div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#f0b429]/30 bg-[#f0b429]/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#f0b429]">
            <Sparkles className="h-3 w-3" /> Premium · Mundial 2026
          </div>
          <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">
            15 Apuestas Exclusivas<br />+ Pozo Premium Acumulado
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/55">
            Acceso completo a todas las categorías de apuestas: Campeón, Jugadores, Final, Especiales y Jackpot. Stickers, perfil mejorado y entrada al pozo de todos los pagos premium.
          </p>

          {/* Value proposition stats */}
          <div className="mx-auto my-5 grid max-w-sm grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xl font-black text-[#f0b429]">{BETS.length}</p>
              <p className="mt-0.5 text-[10px] font-bold text-white/40">Apuestas</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xl font-black text-white">${totalBetValue}</p>
              <p className="mt-0.5 text-[10px] font-bold text-white/40">Valor total</p>
            </div>
            <div className="rounded-xl border border-[#9dff34]/20 bg-[#9dff34]/5 p-3">
              <p className="text-xl font-black text-[#9dff34]">{formatMoney(pool.totalPool || 0)}</p>
              <p className="mt-0.5 text-[10px] font-bold text-white/40">Pozo actual</p>
            </div>
          </div>

          <div className="my-6 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <PremiumPackGrid />
            <PremiumPoolPanel pool={pool} />
          </div>

          {/* Bet preview by category */}
          <div className="mb-6 rounded-xl border border-white/10 bg-black/25 p-4">
            <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-white/40">
              <Lock className="mb-0.5 mr-1 inline h-3 w-3" /> Vista previa de categorías
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {(Object.entries(CATEGORY_CONFIG) as [BetCategory, typeof CATEGORY_CONFIG[BetCategory]][]).map(([cat, cfg]) => {
                const count = BETS.filter((b) => b.category === cat).length;
                return (
                  <div key={cat} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${cfg.border} ${cfg.bg}`}>
                    <span className="text-sm">{cfg.emoji}</span>
                    <span className={`text-[11px] font-black ${cfg.color}`}>{cfg.label}</span>
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-white/50">{count}</span>
                  </div>
                );
              })}
            </div>
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

              <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl border border-white/10 bg-black/30 p-3">
                {!emailOk && (
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
/*  Shared sub-components                                          */
/* ═══════════════════════════════════════════════════════════════ */
function PremiumPackGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-left">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#f0b429]/30 bg-[#f0b429]/10">
          <Sparkles className="h-4 w-4 text-[#f0b429]" />
        </div>
        <div>
          <p className="text-sm font-black text-white">Pack Premium</p>
          <p className="text-[11px] font-bold text-white/40">10 beneficios desbloqueados</p>
        </div>
      </div>
      <div className={`grid gap-2 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        {PREMIUM_PACK_FEATURES.map((feature, index) => (
          <div key={feature} className="flex min-w-0 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-[#f0b429]/25 bg-[#f0b429]/10 text-[10px] font-black text-[#f0b429]">
              {index + 1}
            </span>
            <span className="min-w-0 text-[11px] font-bold leading-tight text-white/60">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PremiumPoolPanel({ pool, compact = false }: { pool: PremiumPool; compact?: boolean }) {
  const currency = pool.currency || "USD";

  if (compact) {
    return (
      <div className="rounded-lg border border-[#9dff34]/16 bg-[#07140d] p-3 text-left">
        <div className="mb-2 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[#9dff34]" />
          <p className="text-xs font-black uppercase tracking-wide text-white/60">Pozo global</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SlipMetric label="Pagaron" value={String(pool.paidPlayers)} />
          <SlipMetric label="Total" value={formatMoney(pool.totalPool, currency)} tone="win" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#9dff34]/20 bg-[#07140d] p-4 text-left shadow-[0_0_32px_rgba(157,255,52,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#9dff34]/30 bg-[#9dff34]/10">
          <Wallet className="h-5 w-5 text-[#9dff34]" />
        </div>
        <div>
          <p className="text-sm font-black text-white">Pozo Premium</p>
          <p className="text-[11px] font-bold text-white/40">Suma de todos los pagos premium</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-black/25 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-white/35">
            <Users className="h-3.5 w-3.5" /> Pagaron
          </div>
          <p className="mt-1 text-2xl font-black text-white">{pool.paidPlayers}</p>
        </div>
        <div className="rounded-lg border border-[#f0b429]/20 bg-[#f0b429]/8 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#f0b429]/75">
            <Trophy className="h-3.5 w-3.5" /> Pozo total
          </div>
          <p className="mt-1 text-2xl font-black text-[#f0b429]">{formatMoney(pool.totalPool, currency)}</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-black/25 p-3">
        <p className="text-[11px] font-black uppercase tracking-wider text-white/35">Cuanto te podes ganar</p>
        <p className="mt-1 text-xl font-black text-white">{formatMoney(pool.projectedPrize, currency)}</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-white/45">
          Si sos el unico ganador del paquete premium, te llevas el pozo completo.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "2 ganadores", value: pool.splitExamples.twoWinners },
          { label: "3 ganadores", value: pool.splitExamples.threeWinners },
          { label: "5 ganadores", value: pool.splitExamples.fiveWinners },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-2">
            <p className="text-[10px] font-bold text-white/35">{label}</p>
            <p className="mt-0.5 text-sm font-black text-white/75">{formatMoney(value, currency)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SportsbookStat({ icon, label, value, tone = "default" }: { icon: ReactNode; label: string; value: string; tone?: "default" | "win" }) {
  return (
    <div className={`rounded-lg border p-2 ${tone === "win" ? "border-[#9dff34]/18 bg-[#9dff34]/7" : "border-white/10 bg-white/[0.03]"}`}>
      <div className={`mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wide ${tone === "win" ? "text-[#9dff34]/65" : "text-white/32"}`}>
        {icon}
        {label}
      </div>
      <p className={`truncate text-sm font-black ${tone === "win" ? "text-[#9dff34]" : "text-white"}`}>{value}</p>
    </div>
  );
}

function SportsbookCategoryButton({
  active,
  emoji,
  label,
  count,
  onClick,
  className = "",
}: {
  active: boolean;
  emoji: string;
  label: string;
  count: number;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-40 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition lg:w-full lg:min-w-0 ${
        active
          ? className || "border-white/25 bg-white/12 text-white"
          : "border-transparent bg-transparent text-white/46 hover:border-white/10 hover:bg-white/[0.04] hover:text-white/75"
      }`}
    >
      <span className="text-base">{emoji}</span>
      <span className="min-w-0 flex-1 truncate text-xs font-black uppercase tracking-wide">{label}</span>
      <span className="rounded bg-black/25 px-1.5 py-0.5 text-[10px] font-black text-white/45">{count}</span>
    </button>
  );
}

function SlipMetric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "win" }) {
  return (
    <div className="rounded-md border border-white/8 bg-black/20 p-2">
      <p className="text-[9px] font-black uppercase tracking-wider text-white/30">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-black ${tone === "win" ? "text-[#9dff34]" : "text-white/85"}`}>{value}</p>
    </div>
  );
}

function CartCheckout({
  items,
  playerKey,
  playerName,
  sdkReady,
  onRemove,
  onPaid,
}: {
  items: CartItem[];
  playerKey: string;
  playerName: string;
  sdkReady: boolean;
  onRemove: (betId: string) => void;
  onPaid: () => void;
}) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const total = items.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (!checkoutOpen || !items.length || !sdkReady || initialized.current || !paypalRef.current || !window.paypal) return;
    initialized.current = true;
    const container = paypalRef.current;
    let live = true;
    setPaypalLoading(true);
    container.innerHTML = "";

    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },
      createOrder: async () => {
        const res = await fetch("/api/mundial/premium-bets/cart/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerKey, playerName, items }),
        });
        const data = await res.json() as { orderID?: string; message?: string };
        if (!res.ok || !data.orderID) throw new Error(data.message ?? "Error al crear el carrito.");
        return data.orderID;
      },
      onApprove: async (data: { orderID: string }) => {
        const res = await fetch("/api/mundial/premium-bets/cart/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderID: data.orderID, playerKey, playerName, items }),
        });
        const result = await res.json() as { status?: string; message?: string };
        if (!res.ok || result.status !== "COMPLETED") {
          alert(result.message ?? "El pago del carrito no se completó.");
          return;
        }
        if (live) onPaid();
      },
      onError: (error: unknown) => {
        console.error("PAYPAL CART:", error);
        alert("Error con PayPal. Intentá de nuevo.");
      },
    });

    Promise.resolve(buttons.render(container))
      .then(() => { if (live) setPaypalLoading(false); })
      .catch((error: unknown) => {
        if (live) {
          setPaypalError(error instanceof Error ? error.message : "Error al cargar PayPal.");
          setPaypalLoading(false);
        }
      });

    return () => { live = false; };
  }, [checkoutOpen, items, onPaid, playerKey, playerName, sdkReady]);

  if (!items.length) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-white/12 bg-black/18 p-3 text-center">
        <p className="text-xs font-black text-white/45">Cart vacío</p>
        <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/30">Agregá mercados extra y pagalos juntos.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-[#f0b429]/18 bg-[#110d04]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <p className="text-xs font-black uppercase tracking-wide text-white/65">Cart extras</p>
        <p className="text-sm font-black text-[#f0b429]">{formatMoney(total)}</p>
      </div>
      <div className="max-h-48 space-y-2 overflow-y-auto p-2">
        {items.map((item) => (
          <div key={item.betId} className="rounded-md border border-white/8 bg-black/22 p-2">
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-xs font-black text-white/80">{item.betTitle}</p>
              <span className="shrink-0 text-xs font-black text-[#f0b429]">{formatMoney(item.price)}</span>
              <button type="button" onClick={() => onRemove(item.betId)} className="shrink-0 text-white/28 transition hover:text-white/70">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 truncate text-[11px] font-bold text-white/40">{formatPick(item.pick)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-2">
        {!checkoutOpen ? (
          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#f0b429]/45 bg-[#f0b429] text-xs font-black uppercase text-[#07110b] transition hover:bg-[#f5c842]"
          >
            <Wallet className="h-3.5 w-3.5" /> Pagar cart
          </button>
        ) : (
          <div className="relative min-h-[120px] rounded-lg border border-white/10 bg-black/30 p-2">
            {paypalLoading && !paypalError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-lg bg-black/80 text-xs text-white/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando PayPal...
              </div>
            )}
            {paypalError && (
              <div className="flex min-h-[110px] items-center justify-center rounded-lg border border-red-400/25 bg-red-950/30 p-3 text-xs text-red-300">
                {paypalError}
              </div>
            )}
            <div ref={paypalRef} className="min-h-[110px] w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Difficulty stars ─── */
function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-2.5 w-2.5 ${i <= level ? "fill-[#f0b429] text-[#f0b429]" : "text-white/15"}`} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  UnlockedContent — the full premium panel                       */
/* ═══════════════════════════════════════════════════════════════ */
type SortOption = "default" | "price_asc" | "price_desc" | "difficulty";
type CategoryFilter = "all" | BetCategory;

function UnlockedContent({
  playerName, playerKey, myBets, pool, betsLoading, sdkReady, onBetPlaced,
}: {
  playerName: string;
  playerKey: string;
  myBets: PlayerBet[];
  pool: PremiumPool;
  betsLoading: boolean;
  sdkReady: boolean;
  onBetPlaced: () => void;
}) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showMyPicks, setShowMyPicks] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const betMap = Object.fromEntries(myBets.map((b) => [b.betId, b]));
  const placedCount = myBets.length;
  const progressPct = (placedCount / BETS.length) * 100;

  const filteredBets = BETS
    .filter((b) => categoryFilter === "all" || b.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "difficulty") return a.difficulty - b.difficulty;
      return 0;
    });

  const confirmedBets = myBets.filter((b) => betMap[b.betId]);
  const selectedCategoryConfig = categoryFilter === "all" ? null : CATEGORY_CONFIG[categoryFilter];
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const includedCount = BETS.filter((bet) => bet.includedInPremium).length;

  function addToCart(item: CartItem) {
    setCartItems((items) => [...items.filter((existing) => existing.betId !== item.betId), item]);
  }

  function removeFromCart(betId: string) {
    setCartItems((items) => items.filter((item) => item.betId !== betId));
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <div className="py-4">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#07100c] shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-[#0b1510] px-4 py-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#f0b429]/35 bg-[#f0b429]/10">
              <Crown className="h-5 w-5 text-[#f0b429]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black uppercase tracking-wide text-white">{playerName}</p>
              <p className="text-xs font-bold text-white/40">
                {betsLoading ? "Sincronizando ticket..." : `${includedCount} incluidas por $${MUNDIAL_PREMIUM_PRICE_USD} · ${placedCount}/${BETS.length} mercados jugados`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:ml-auto lg:w-[420px]">
            <SportsbookStat icon={<Target className="h-3.5 w-3.5" />} label="Picks" value={`${placedCount}/${BETS.length}`} />
            <SportsbookStat icon={<TrendingUp className="h-3.5 w-3.5" />} label="Pozo" value={formatMoney(pool.totalPool)} tone="win" />
            <SportsbookStat icon={<Wallet className="h-3.5 w-3.5" />} label="Cart" value={formatMoney(cartTotal)} />
          </div>
        </div>

        <div className="grid min-h-[680px] lg:grid-cols-[220px_minmax(0,1fr)_330px]">
          <aside className="border-b border-white/10 bg-[#050b08] p-3 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest text-white/30">
              <Filter className="h-3.5 w-3.5" /> Sportsbook
            </div>
            <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
              <SportsbookCategoryButton
                active={categoryFilter === "all"}
                emoji="🎲"
                label="Todos"
                count={BETS.length}
                onClick={() => setCategoryFilter("all")}
              />
              {(Object.entries(CATEGORY_CONFIG) as [BetCategory, typeof CATEGORY_CONFIG[BetCategory]][]).map(([cat, cfg]) => (
                <SportsbookCategoryButton
                  key={cat}
                  active={categoryFilter === cat}
                  emoji={cfg.emoji}
                  label={cfg.label}
                  count={BETS.filter((b) => b.category === cat).length}
                  onClick={() => setCategoryFilter(cat)}
                  className={categoryFilter === cat ? `${cfg.border} ${cfg.bg} ${cfg.color}` : ""}
                />
              ))}
            </div>

            <div className="mt-4 hidden rounded-lg border border-[#f0b429]/18 bg-[#f0b429]/6 p-3 lg:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#f0b429]/60">Premium activo</p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-white/45">Mercados guiados, picks seguros y pagos por PayPal.</p>
            </div>
          </aside>

          <section className="min-w-0 bg-[#08110c]">
            <div className="sticky top-[58px] z-10 border-b border-white/10 bg-[#08110c]/95 px-3 py-3 backdrop-blur-md">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">Mercados disponibles</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xl">{selectedCategoryConfig?.emoji ?? "🎲"}</span>
                    <h2 className="truncate text-lg font-black text-white">
                      {selectedCategoryConfig?.label ?? "Todos los mercados"}
                    </h2>
                    <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-black text-white/40">
                      {filteredBets.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  {[
                    { id: "default" as SortOption, label: "Lobby" },
                    { id: "difficulty" as SortOption, label: "Más fácil" },
                    { id: "price_asc" as SortOption, label: "$ bajo" },
                    { id: "price_desc" as SortOption, label: "$ alto" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      className={`shrink-0 rounded-md border px-3 py-2 text-[11px] font-black transition ${
                        sortBy === opt.id
                          ? "border-[#f0b429]/45 bg-[#f0b429]/12 text-[#f0b429]"
                          : "border-white/10 bg-white/[0.03] text-white/35 hover:text-white/70"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredBets.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-white/40">No hay mercados en esta categoría.</div>
            ) : (
              <div className="divide-y divide-white/8">
                {filteredBets.map((bet) => (
                  <BetCard
                    key={bet.id}
                    bet={bet}
                    existingBet={betMap[bet.id] ?? null}
                    playerKey={playerKey}
                    playerName={playerName}
                    sdkReady={sdkReady}
                    inCart={cartItems.some((item) => item.betId === bet.id)}
                    onAddToCart={addToCart}
                    onFreeBetPlaced={onBetPlaced}
                    onBetPlaced={onBetPlaced}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="border-t border-white/10 bg-[#050b08] p-3 lg:border-l lg:border-t-0">
            <div className="sticky top-[58px] space-y-3">
              <div className="rounded-lg border border-[#f0b429]/20 bg-[#0d1309]">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#f0b429]" />
                    <p className="text-sm font-black text-white">Bet Slip</p>
                  </div>
                  <span className="rounded bg-[#f0b429]/10 px-2 py-0.5 text-[10px] font-black text-[#f0b429]">
                    {cartItems.length} items
                  </span>
                </div>
                <div className="p-3">
                  <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-[#f0b429] transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <SlipMetric label="Jugados" value={`${placedCount}/${BETS.length}`} />
                    <SlipMetric label="Extras cart" value={formatMoney(cartTotal)} />
                  </div>
                  <div className="mt-3 rounded-lg border border-[#f0b429]/16 bg-[#f0b429]/7 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#f0b429]/70">Incluidas con Premium</p>
                    <p className="mt-1 text-lg font-black text-white">{includedCount} apuestas válidas</p>
                    <p className="mt-1 text-[11px] font-bold text-white/40">Ya están cubiertas por el pago base de ${MUNDIAL_PREMIUM_PRICE_USD}.</p>
                  </div>
                  <div className="mt-3 rounded-lg border border-[#9dff34]/16 bg-[#9dff34]/7 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#9dff34]/65">Posible pozo</p>
                    <p className="mt-1 text-2xl font-black text-[#9dff34]">{formatMoney(pool.projectedPrize)}</p>
                    <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/38">Si sos el único ganador del paquete premium.</p>
                  </div>

                  <CartCheckout
                    items={cartItems}
                    playerKey={playerKey}
                    playerName={playerName}
                    sdkReady={sdkReady}
                    onRemove={removeFromCart}
                    onPaid={() => { clearCart(); onBetPlaced(); }}
                  />
                </div>
              </div>

              {confirmedBets.length > 0 && (
                <div className="rounded-lg border border-white/10 bg-[#08110c]">
                  <button
                    type="button"
                    onClick={() => setShowMyPicks((p) => !p)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                  >
                    <span className="text-xs font-black uppercase tracking-wide text-white/65">Mis tickets</span>
                    {showMyPicks ? <ChevronUp className="h-4 w-4 text-white/35" /> : <ChevronDown className="h-4 w-4 text-white/35" />}
                  </button>
                  {showMyPicks && (
                    <div className="max-h-80 space-y-2 overflow-y-auto border-t border-white/8 p-2">
                      {confirmedBets.map((bet) => {
                        const config = BETS.find((b) => b.id === bet.betId);
                        return (
                          <div key={bet.betId} className="rounded-md border border-white/8 bg-white/[0.03] p-2">
                            <div className="flex items-center gap-2">
                              <span>{config?.emoji ?? "🎲"}</span>
                              <p className="min-w-0 flex-1 truncate text-xs font-black text-white/80">{bet.betTitle}</p>
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#9dff34]" />
                            </div>
                            <p className="mt-1 truncate text-[11px] font-bold text-white/42">{formatPick(bet.pick)}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <PremiumPoolPanel pool={pool} compact />
            </div>
          </aside>
        </div>
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

type CartItem = {
  betId: string;
  betTitle: string;
  price: number;
  pick: PickValue;
};

function BetCard({
  bet, existingBet, playerKey, playerName, inCart, onAddToCart, onFreeBetPlaced,
}: {
  bet: BetConfig;
  existingBet: PlayerBet | null;
  playerKey: string;
  playerName: string;
  sdkReady: boolean;
  inCart: boolean;
  onAddToCart: (item: CartItem) => void;
  onFreeBetPlaced: () => void;
  onBetPlaced: () => void;
}) {
  const [pick, setPick] = useState<PickValue | null>(null);
  const [placed, setPlaced] = useState(false);
  const [savingIncluded, setSavingIncluded] = useState(false);

  const catCfg = CATEGORY_CONFIG[bet.category];
  const isPlaced = Boolean(existingBet) || placed;

  const pickIsValid = pick !== null && (() => {
    if ("text" in pick) return pick.text.trim().length >= 2;
    if ("yesno" in pick) return Boolean(pick.yesno);
    if ("homeScore" in pick && "awayScore" in pick && !("champion" in pick)) return true;
    if ("teams" in pick) return pick.teams.every((t) => t.trim().length >= 2);
    if ("champion" in pick) return pick.champion.trim().length >= 2 && pick.scorer.trim().length >= 2;
    return false;
  })();

  async function saveIncludedPick() {
    if (!pick || !pickIsValid || savingIncluded) return;
    setSavingIncluded(true);
    try {
      const res = await fetch("/api/mundial/premium-bets/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerKey, playerName, betId: bet.id, betTitle: bet.title, pick }),
      });
      const result = await res.json() as { ok?: boolean; message?: string };
      if (!res.ok || !result.ok) {
        alert(result.message ?? "No se pudo guardar el pick incluido.");
        return;
      }
      setPlaced(true);
      onFreeBetPlaced();
    } finally {
      setSavingIncluded(false);
    }
  }

  function addExtraToCart() {
    if (!pick || !pickIsValid) return;
    onAddToCart({ betId: bet.id, betTitle: bet.title, price: bet.price, pick });
  }

  return (
    <div
      className={`group transition ${
        isPlaced
          ? "bg-[#081a0b]"
          : inCart
            ? "bg-[#151103]"
            : "bg-transparent hover:bg-white/[0.025]"
      }`}
    >
      <div className="grid gap-3 px-3 py-3 xl:grid-cols-[minmax(250px,1fr)_120px_minmax(250px,0.95fr)_150px] xl:items-center">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-base ${catCfg.border} ${catCfg.bg}`}>{bet.emoji}</span>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-black text-white">{bet.title}</p>
                {bet.tag && <span className={`hidden rounded border px-1.5 py-0.5 text-[9px] font-black sm:inline ${catCfg.border} ${catCfg.bg} ${catCfg.color}`}>{bet.tag}</span>}
              </div>
              <p className="mt-0.5 line-clamp-1 text-[11px] font-bold text-white/38">{bet.description}</p>
            </div>
          </div>
          <p className="mt-2 line-clamp-1 text-[10px] font-bold uppercase tracking-wide text-white/25">{bet.winCondition}</p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 xl:grid-cols-1">
          <div className="rounded-md border border-white/8 bg-black/20 px-2 py-1.5">
            <p className="text-[9px] font-black uppercase text-white/25">Stake</p>
            <p className={`text-sm font-black ${bet.includedInPremium ? "text-[#9dff34]" : "text-white"}`}>
              {bet.includedInPremium ? "Incluida" : `$${bet.price}`}
            </p>
          </div>
          <div className="rounded-md border border-white/8 bg-black/20 px-2 py-1.5">
            <p className="text-[9px] font-black uppercase text-white/25">Risk</p>
            <div className="mt-0.5"><DifficultyStars level={bet.difficulty} /></div>
          </div>
          <div className={`rounded-md border px-2 py-1.5 ${catCfg.border} ${catCfg.bg}`}>
            <p className="text-[9px] font-black uppercase text-white/25">Market</p>
            <p className={`truncate text-[11px] font-black ${catCfg.color}`}>{catCfg.label}</p>
          </div>
        </div>

        <div className="min-w-0">
          {isPlaced ? (
            <div className="rounded-lg border border-[#9dff34]/25 bg-[#9dff34]/8 p-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#9dff34]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Ticket confirmado
              </div>
              <p className="mt-1 truncate text-xs font-bold text-white/58">{formatPick(existingBet?.pick ?? pick)}</p>
            </div>
          ) : (
            <PickForm bet={bet} value={pick} onChange={setPick} />
          )}
        </div>

        {!isPlaced && (
          <div className="min-w-0">
            <button
              type="button"
              disabled={!pickIsValid || savingIncluded}
              onClick={() => { if (bet.includedInPremium) void saveIncludedPick(); else addExtraToCart(); }}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border px-3 text-xs font-black uppercase transition ${
                pickIsValid
                  ? bet.includedInPremium
                    ? "border-[#9dff34]/35 bg-[#9dff34] text-[#07110b] hover:bg-[#d5ff3f]"
                    : inCart
                      ? "border-[#f0b429]/45 bg-[#f0b429]/18 text-[#f0b429]"
                      : "border-[#f0b429]/35 bg-[#f0b429] text-[#07110b] hover:bg-[#f5c842]"
                  : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/24"
              }`}
            >
              {savingIncluded ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando</>
              ) : pickIsValid ? (
                bet.includedInPremium
                  ? <><CheckCircle2 className="h-3.5 w-3.5" /> Incluida</>
                  : inCart
                    ? <><CheckCircle2 className="h-3.5 w-3.5" /> En cart</>
                    : <><Trophy className="h-3.5 w-3.5" /> Add ${bet.price}</>
              ) : (
                <><Lock className="h-3.5 w-3.5" /> Select</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Pick form per bet type ─── */
function PickForm({ bet, value, onChange }: { bet: BetConfig; value: PickValue | null; onChange: (v: PickValue) => void }) {
  const selectClass = "w-full rounded-lg border border-white/12 bg-[#08140d] px-3 py-2 text-sm font-bold text-white outline-none transition focus:border-[#f0b429]/50 focus:ring-1 focus:ring-[#f0b429]/25";

  if (bet.pickType === "text") {
    const text = (value && "text" in value) ? value.text : "";
    const options = textPickOptions(bet);
    return (
      <div>
        {bet.pickLabel && <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-white/40">{bet.pickLabel}</label>}
        <select value={text} onChange={(e) => onChange({ text: e.target.value })} className={selectClass}>
          <option value="">Elegir una opcion...</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {options.slice(0, 6).map((option) => (
            <QuickPickButton key={option} active={text === option} onClick={() => onChange({ text: option })}>
              {option}
            </QuickPickButton>
          ))}
        </div>
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
            className={`rounded-lg border py-3 text-sm font-black transition ${
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
        <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-white/40">Marcador exacto (90 min)</label>
        <div className="mb-3 grid grid-cols-3 gap-1.5">
          {SCORE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange({ homeScore: preset.homeScore, awayScore: preset.awayScore })}
              className={`rounded-lg border py-2 text-xs font-black transition ${
                hs === preset.homeScore && as_ === preset.awayScore
                  ? "border-[#f0b429]/50 bg-[#f0b429]/15 text-[#f0b429]"
                  : "border-white/10 bg-white/[0.04] text-white/45 hover:text-white"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3">
          <ScoreNumberInput label="LOCAL" value={hs} onChange={(score) => onChange({ homeScore: score, awayScore: typeof as_ === "number" ? as_ : 0 })} />
          <span className="mt-4 text-xl font-black text-white/30">-</span>
          <ScoreNumberInput label="VISITANTE" value={as_} onChange={(score) => onChange({ homeScore: typeof hs === "number" ? hs : 0, awayScore: score })} />
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
          <div key={i} className="flex items-center gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-[#a855f7]/30 bg-[#a855f7]/10 text-[10px] font-black text-[#a855f7]">
              {i + 1}
            </span>
            <select
              value={teams[i] ?? ""}
              onChange={(e) => { const t = [...teams]; t[i] = e.target.value; onChange({ teams: t }); }}
              className={selectClass}
            >
              <option value="">Elegir equipo {i + 1}...</option>
              {TEAM_OPTIONS.map((team) => (
                <option key={team} value={team} disabled={teams.includes(team) && teams[i] !== team}>{team}</option>
              ))}
            </select>
          </div>
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
      <div className="space-y-3">
        <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-white/40">Los 3 picks del Combo Maestro</label>
        <div>
          <p className="mb-1 text-[10px] text-white/35">🏆 País campeón</p>
          <select value={champion} onChange={(e) => upd("champion", e.target.value)} className={selectClass}>
            <option value="">Elegir campeon...</option>
            {TEAM_OPTIONS.map((team) => <option key={team} value={team}>{team}</option>)}
          </select>
        </div>
        <div>
          <p className="mb-1 text-[10px] text-white/35">👟 Goleador del torneo</p>
          <select value={scorer} onChange={(e) => upd("scorer", e.target.value)} className={selectClass}>
            <option value="">Elegir goleador...</option>
            {PLAYER_OPTIONS.map((player) => <option key={player} value={player}>{player}</option>)}
          </select>
        </div>
        <div>
          <p className="mb-1 text-[10px] text-white/35">🎯 Marcador exacto de la Final</p>
          <div className="mb-2 grid grid-cols-3 gap-1.5">
            {SCORE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ champion, scorer, homeScore: preset.homeScore, awayScore: preset.awayScore })}
                className={`rounded-lg border py-2 text-xs font-black transition ${
                  hs === preset.homeScore && as_ === preset.awayScore
                    ? "border-[#f0b429]/50 bg-[#f0b429]/15 text-[#f0b429]"
                    : "border-white/10 bg-white/[0.04] text-white/45 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <ScoreNumberInput label="LOCAL" value={hs} onChange={(score) => upd("homeScore", score)} />
            <span className="mt-4 text-xl font-black text-white/30">-</span>
            <ScoreNumberInput label="VISITANTE" value={as_} onChange={(score) => upd("awayScore", score)} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function textPickOptions(bet: BetConfig) {
  if (bet.id === "top_scorer" || bet.id === "mvp" || bet.id === "first_goal") return PLAYER_OPTIONS;
  if (bet.id === "golden_glove") return GOALKEEPER_OPTIONS;
  if (bet.id === "group_goals") return GROUP_OPTIONS;
  if (bet.id === "biggest_blowout") return BLOWOUT_OPTIONS;
  if (bet.id === "first_upset") return UPSET_OPTIONS;
  if (bet.id === "dark_horse") return DARK_HORSE_OPTIONS;
  return TEAM_OPTIONS;
}

function QuickPickButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2 py-1 text-[10px] font-black transition ${
        active
          ? "border-[#f0b429]/50 bg-[#f0b429]/15 text-[#f0b429]"
          : "border-white/10 bg-white/[0.04] text-white/40 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}

function ScoreNumberInput({ label, value, onChange }: { label: string; value: number | ""; onChange: (value: number) => void }) {
  return (
    <div className="text-center">
      <p className="mb-1 text-[9px] font-bold text-white/30">{label}</p>
      <input
        type="number"
        min={0}
        max={20}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 rounded-xl border border-white/15 bg-white/5 p-2 text-center text-2xl font-black text-white outline-none focus:border-[#f0b429]/50"
      />
    </div>
  );
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
