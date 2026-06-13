"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CircleAlert,
  ClipboardList,
  Lock,
  Loader2,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trophy,
  Unlock,
  UserRound,
  Users,
} from "lucide-react";

type MundialStage = "group" | "round32" | "round16" | "quarterfinal" | "semifinal" | "thirdPlace" | "final";
type WinnerPick = "home" | "away" | null;
type ViewMode = "groups" | "bracket" | "mine" | "players";

type MundialMatch = {
  id: string;
  number: number;
  stage: MundialStage;
  stageLabel: string;
  group: string | null;
  date: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeSeed: string | null;
  awaySeed: string | null;
  sortOrder: number;
};

type Prediction = {
  id: string;
  matchId: string;
  matchNumber: number | null;
  playerName: string;
  homeScore: number;
  awayScore: number;
  winnerPick: WinnerPick;
  locked: boolean;
  lockedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type PlayerProgress = {
  key: string;
  playerName: string;
  totalPredictions: number;
  lockedPredictions: number;
  updatedAt: string | null;
};

type PredictionsResponse = {
  matches: MundialMatch[];
  predictions: Prediction[];
  players: PlayerProgress[];
};

type Draft = {
  homeScore: number;
  awayScore: number;
  winnerPick: WinnerPick;
  locked: boolean;
  dirty: boolean;
  saved: boolean;
  updatedAt: string | null;
};

const API_URL = "/api/mundial/predictions";
const REQUEST_TIMEOUT_MS = 12000;
const TOTAL_MATCHES = 104;
const STORAGE_KEY = "mundial-player-name";
const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const BRACKET_STAGES: MundialStage[] = ["round32", "round16", "quarterfinal", "semifinal", "thirdPlace", "final"];
const EMPTY_DRAFTS: Record<string, Draft> = {};
const VIEW_OPTIONS: Array<{ id: ViewMode; label: string }> = [
  { id: "groups", label: "Grupos" },
  { id: "bracket", label: "Llaves" },
  { id: "mine", label: "Mis picks" },
  { id: "players", label: "Jugadores" },
];

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeKey(value: string) {
  return normalizeName(value).toUpperCase();
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(30, Math.max(0, Math.trunc(value)));
}

function emptyDraft(): Draft {
  return {
    homeScore: 0,
    awayScore: 0,
    winnerPick: null,
    locked: false,
    dirty: false,
    saved: false,
    updatedAt: null,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T12:00:00-06:00`));
}

function formatUpdatedAt(value: string | null) {
  if (!value) return "Sin guardar";

  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function predictionResult(match: MundialMatch, draft: Draft) {
  if (draft.homeScore > draft.awayScore) return `Gana ${match.homeTeam}`;
  if (draft.awayScore > draft.homeScore) return `Gana ${match.awayTeam}`;
  if (match.stage === "group") return "Empate";
  if (draft.winnerPick === "home") return `Pasa ${match.homeTeam}`;
  if (draft.winnerPick === "away") return `Pasa ${match.awayTeam}`;
  return "Falta pase";
}

function getWinnerPickOptions(match: MundialMatch) {
  return [
    { value: "", label: "Pasa por penales" },
    { value: "home", label: match.homeTeam },
    { value: "away", label: match.awayTeam },
  ];
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function MundialClient() {
  const [playerName, setPlayerName] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(STORAGE_KEY) ?? ""
  );
  const [matches, setMatches] = useState<MundialMatch[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [players, setPlayers] = useState<PlayerProgress[]>([]);
  const [draftOverridesByPlayer, setDraftOverridesByPlayer] = useState<Record<string, Record<string, Draft>>>({});
  const [viewMode, setViewMode] = useState<ViewMode>("groups");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const playerKey = useMemo(() => normalizeKey(playerName), [playerName]);
  const registeredNames = useMemo(() => players.map((player) => player.playerName).sort(), [players]);
  const playerPredictions = useMemo(
    () => predictions.filter((prediction) => normalizeKey(prediction.playerName) === playerKey),
    [playerKey, predictions]
  );
  const predictionByMatch = useMemo(() => {
    return new Map(playerPredictions.map((prediction) => [prediction.matchId, prediction]));
  }, [playerPredictions]);
  const baseDrafts = useMemo(() => {
    const nextDrafts: Record<string, Draft> = {};

    for (const match of matches) {
      const prediction = predictionByMatch.get(match.id);

      if (prediction) {
        nextDrafts[match.id] = {
          homeScore: prediction.homeScore,
          awayScore: prediction.awayScore,
          winnerPick: prediction.winnerPick,
          locked: prediction.locked,
          dirty: false,
          saved: true,
          updatedAt: prediction.updatedAt,
        };
      }
    }

    return nextDrafts;
  }, [matches, predictionByMatch]);
  const playerDraftOverrides = useMemo(
    () => draftOverridesByPlayer[playerKey] ?? EMPTY_DRAFTS,
    [draftOverridesByPlayer, playerKey]
  );
  const drafts = useMemo(() => {
    const mergedDrafts: Record<string, Draft> = { ...baseDrafts };

    for (const [matchId, draft] of Object.entries(playerDraftOverrides)) {
      mergedDrafts[matchId] = {
        ...(baseDrafts[matchId] ?? emptyDraft()),
        ...draft,
      };
    }

    return mergedDrafts;
  }, [baseDrafts, playerDraftOverrides]);
  const dirtyDrafts = useMemo(
    () => Object.entries(drafts).filter(([, draft]) => draft.dirty && !draft.locked),
    [drafts]
  );
  const savedCount = playerPredictions.length;
  const lockedCount = playerPredictions.filter((prediction) => prediction.locked).length;
  const completionPct = Math.round((savedCount / TOTAL_MATCHES) * 100);
  const lockedPct = Math.round((lockedCount / TOTAL_MATCHES) * 100);

  async function readQuiniela() {
    const response = await fetchWithTimeout(API_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("No se pudo cargar la quiniela.");
    }

    return (await response.json()) as PredictionsResponse;
  }

  const loadQuiniela = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await readQuiniela();
      setMatches(data.matches ?? []);
      setPredictions(data.predictions ?? []);
      setPlayers(data.players ?? []);
    } catch (loadError) {
      console.error(loadError);
      setError("No pude cargar Mongo en este momento.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadQuiniela();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadQuiniela]);

  useEffect(() => {
    const trimmedName = normalizeName(playerName);
    if (trimmedName) {
      window.localStorage.setItem(STORAGE_KEY, trimmedName);
    }
  }, [playerName]);

  function getDraft(matchId: string) {
    return drafts[matchId] ?? emptyDraft();
  }

  function updateDraft(matchId: string, patch: Partial<Draft>) {
    setError("");
    setSuccess("");
    setDraftOverridesByPlayer((current) => {
      const playerDrafts = current[playerKey] ?? {};
      const existing = drafts[matchId] ?? emptyDraft();
      if (existing.locked) return current;

      return {
        ...current,
        [playerKey]: {
          ...playerDrafts,
          [matchId]: {
            ...existing,
            ...patch,
            dirty: true,
          },
        },
      };
    });
  }

  function buildPayload(match: MundialMatch, locked?: boolean) {
    const draft = getDraft(match.id);

    return {
      matchId: match.id,
      playerName: normalizeName(playerName),
      homeScore: draft.homeScore,
      awayScore: draft.awayScore,
      winnerPick: draft.winnerPick,
      locked: locked ?? draft.locked,
    };
  }

  async function postPredictions(payload: unknown) {
    const response = await fetchWithTimeout(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "No se pudo guardar.");
    }

    return data as { predictions: Prediction[] };
  }

  function mergeSaved(savedPredictions: Prediction[]) {
    const savedMatchIds = new Set(savedPredictions.map((prediction) => prediction.matchId));

    setPredictions((current) => {
      const savedIds = new Set(savedPredictions.map((prediction) => prediction.id));
      const savedKeys = new Set(savedPredictions.map((prediction) => `${prediction.matchId}:${normalizeKey(prediction.playerName)}`));
      const withoutSaved = current.filter(
        (prediction) => !savedIds.has(prediction.id) && !savedKeys.has(`${prediction.matchId}:${normalizeKey(prediction.playerName)}`)
      );

      return [...savedPredictions, ...withoutSaved].sort((a, b) => {
        const first = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        const second = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        return first - second;
      });
    });
    setDraftOverridesByPlayer((current) => {
      const playerDrafts = current[playerKey] ?? {};
      const nextPlayerDrafts = Object.fromEntries(
        Object.entries(playerDrafts).filter(([matchId]) => !savedMatchIds.has(matchId))
      );

      return {
        ...current,
        [playerKey]: nextPlayerDrafts,
      };
    });
  }

  async function saveMatch(match: MundialMatch, locked?: boolean) {
    const trimmedName = normalizeName(playerName);

    if (!trimmedName) {
      setError("Pone tu nombre antes de guardar.");
      return;
    }

    setSavingId(match.id);
    setError("");
    setSuccess("");

    try {
      const data = await postPredictions(buildPayload(match, locked));
      mergeSaved(data.predictions);
      setPlayerName(trimmedName);
      setSuccess(locked ? `Bloqueado: partido ${match.number}.` : `Guardado: partido ${match.number}.`);
      void loadQuiniela();
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "No pude guardar en Mongo.");
    } finally {
      setSavingId(null);
    }
  }

  async function saveDirtyDrafts(lockAfterSave = false) {
    const trimmedName = normalizeName(playerName);

    if (!trimmedName) {
      setError("Pone tu nombre antes de guardar.");
      return;
    }

    const dirtyMatches = dirtyDrafts
      .map(([matchId]) => matches.find((match) => match.id === matchId))
      .filter((match): match is MundialMatch => Boolean(match));

    if (!dirtyMatches.length) {
      setSuccess("No hay cambios pendientes.");
      return;
    }

    setIsSavingBulk(true);
    setError("");
    setSuccess("");

    try {
      const data = await postPredictions({
        playerName: trimmedName,
        predictions: dirtyMatches.map((match) => buildPayload(match, lockAfterSave)),
      });
      mergeSaved(data.predictions);
      setPlayerName(trimmedName);
      setSuccess(`${data.predictions.length} resultados guardados.`);
      void loadQuiniela();
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "No pude guardar en Mongo.");
    } finally {
      setIsSavingBulk(false);
    }
  }

  const searchedMatches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return matches;

    return matches.filter((match) =>
      [match.homeTeam, match.awayTeam, match.venue, match.stageLabel, match.group ?? "", String(match.number)]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [matches, query]);

  const savedMatches = useMemo(
    () => searchedMatches.filter((match) => Boolean(drafts[match.id]?.saved || drafts[match.id]?.dirty)),
    [drafts, searchedMatches]
  );

  function renderScoreInput({
    label,
    value,
    disabled,
    onChange,
  }: {
    label: string;
    value: number;
    disabled: boolean;
    onChange: (value: number) => void;
  }) {
    return (
      <input
        type="number"
        min={0}
        max={30}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clampScore(Number(event.target.value)))}
        aria-label={`Goles de ${label}`}
        className="h-10 w-14 rounded-lg border border-slate-300 bg-white text-center text-lg font-black tabular-nums text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
      />
    );
  }

  function renderMatchCard(match: MundialMatch, compact = false) {
    const draft = getDraft(match.id);
    const isKnockoutTie = match.stage !== "group" && draft.homeScore === draft.awayScore;
    const isSaving = savingId === match.id;
    const disabled = draft.locked || isSaving || isSavingBulk;
    const statusClass = draft.locked
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : draft.dirty
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : draft.saved
          ? "border-sky-200 bg-sky-50 text-sky-800"
          : "border-slate-200 bg-slate-50 text-slate-600";

    return (
      <article key={match.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-950 px-2 py-1 text-xs font-black tabular-nums text-white">#{match.number}</span>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-700">
                {match.group ? `Grupo ${match.group}` : match.stageLabel}
              </span>
            </div>
            <p className="mt-2 truncate text-xs font-bold text-slate-500">
              {formatDate(match.date)} - {match.venue}
            </p>
          </div>
          <span className={cn("rounded-lg border px-2 py-1 text-xs font-black", statusClass)}>
            {draft.locked ? "Bloqueado" : draft.dirty ? "Editando" : draft.saved ? "Guardado" : "Nuevo"}
          </span>
        </div>

        <div className={cn("grid gap-2", compact ? "text-sm" : "")}>
          <div className="grid grid-cols-[minmax(0,1fr)_58px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <span className="min-w-0 truncate font-black text-slate-900">{match.homeTeam}</span>
            {renderScoreInput({
              label: match.homeTeam,
              value: draft.homeScore,
              disabled,
              onChange: (value) => updateDraft(match.id, { homeScore: value }),
            })}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_58px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <span className="min-w-0 truncate font-black text-slate-900">{match.awayTeam}</span>
            {renderScoreInput({
              label: match.awayTeam,
              value: draft.awayScore,
              disabled,
              onChange: (value) => updateDraft(match.id, { awayScore: value }),
            })}
          </div>
        </div>

        {isKnockoutTie && !draft.locked && (
          <select
            value={draft.winnerPick ?? ""}
            onChange={(event) => updateDraft(match.id, { winnerPick: event.target.value === "home" || event.target.value === "away" ? event.target.value : null })}
            className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            aria-label={`Ganador por penales del partido ${match.number}`}
          >
            {getWinnerPickOptions(match).map((option) => (
              <option key={option.value || "none"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs font-black text-slate-600">{predictionResult(match, draft)}</span>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void saveMatch(match)}
              disabled={disabled || !draft.dirty}
              title="Guardar"
              aria-label={`Guardar partido ${match.number}`}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSaving && !draft.locked ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => void saveMatch(match, !draft.locked)}
              disabled={isSaving || isSavingBulk}
              title={draft.locked ? "Editar" : "Bloquear"}
              aria-label={`${draft.locked ? "Editar" : "Bloquear"} partido ${match.number}`}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-45",
                draft.locked
                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : draft.locked ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {draft.updatedAt && <p className="mt-2 text-xs font-bold text-slate-500">{formatUpdatedAt(draft.updatedAt)}</p>}
      </article>
    );
  }

  function renderGroupsView() {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {GROUPS.map((group) => {
          const groupMatches = searchedMatches.filter((match) => match.stage === "group" && match.group === group);
          if (!groupMatches.length) return null;

          return (
            <section key={group} className="rounded-lg border border-slate-200 bg-[#fbfcff] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-slate-950">Grupo {group}</h2>
                <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-600">
                  {groupMatches.length} partidos
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {groupMatches.map((match) => renderMatchCard(match))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  function renderBracketView() {
    return (
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1180px] grid-cols-[1.25fr_1.05fr_0.95fr_0.85fr_0.85fr_0.85fr] gap-3">
          {BRACKET_STAGES.map((stage) => {
            const stageMatches = searchedMatches.filter((match) => match.stage === stage);
            if (!stageMatches.length) return null;

            return (
              <section key={stage} className="rounded-lg border border-slate-200 bg-[#fbfcff] p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-base font-black text-slate-950">{stageMatches[0].stageLabel}</h2>
                  <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-600">
                    {stageMatches.length}
                  </span>
                </div>
                <div className="grid gap-3">
                  {stageMatches.map((match) => renderMatchCard(match, true))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  function renderMineView() {
    const mineMatches = savedMatches.length ? savedMatches : searchedMatches;

    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700">Mi quiniela</p>
            <h2 className="text-2xl font-black text-slate-950">{savedCount}/{TOTAL_MATCHES} guardados</h2>
          </div>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
            {lockedCount} bloqueados
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {mineMatches.map((match) => renderMatchCard(match))}
        </div>
      </section>
    );
  }

  function renderPlayersView() {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-sky-700">Jugadores</p>
            <h2 className="text-2xl font-black text-slate-950">{players.length} activos</h2>
          </div>
          <Users className="h-6 w-6 text-sky-700" />
        </div>
        {players.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => {
              const playerCompletion = Math.round((player.totalPredictions / TOTAL_MATCHES) * 100);

              return (
                <article key={player.key} className="rounded-lg border border-slate-200 bg-[#fbfcff] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-slate-950">{player.playerName}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{formatUpdatedAt(player.updatedAt)}</p>
                    </div>
                    <span className="rounded-lg bg-slate-950 px-2 py-1 text-xs font-black text-white">{playerCompletion}%</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${playerCompletion}%` }} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-black text-slate-700">
                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">{player.totalPredictions} picks</span>
                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">{player.lockedPredictions} locks</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-black text-slate-600">Todavia no hay jugadores guardados.</p>
          </div>
        )}
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-[1600px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-900">
              <Trophy className="h-4 w-4" />
              Mundial 2026
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Quiniela completa
            </h1>
            <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <CalendarDays className="h-4 w-4 text-emerald-700" />
                11 jun - 19 jul
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <ClipboardList className="h-4 w-4 text-sky-700" />
                {matches.length || TOTAL_MATCHES} partidos
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                Mongo activo
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#fbfcff] p-4 shadow-sm">
            <label className="mb-2 block text-sm font-black text-slate-700" htmlFor="mundial-player-name">
              Jugador
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="mundial-player-name"
                list="mundial-player-list"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder="Nombre"
                className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-base font-black text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              />
              <datalist id="mundial-player-list">
                {registeredNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-black uppercase text-slate-500">Guardado</p>
                <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">{completionPct}%</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-black uppercase text-slate-500">Bloqueado</p>
                <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">{lockedPct}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6">
        <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="flex flex-wrap gap-2">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setViewMode(option.id)}
                className={cn(
                  "h-10 rounded-lg border px-4 text-sm font-black transition",
                  viewMode === option.id
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(220px,360px)_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
            <button
              type="button"
              onClick={() => void saveDirtyDrafts()}
              disabled={isSavingBulk || !dirtyDrafts.length}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSavingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => void loadQuiniela()}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Actualizar
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">Mis picks</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">{savedCount}/{TOTAL_MATCHES}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">Bloqueados</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">{lockedCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">Cambios</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-amber-700">{dirtyDrafts.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">Jugadores</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">{players.length}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-900">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {isLoading ? (
          <div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-700" />
              <p className="mt-3 text-sm font-black text-slate-600">Cargando Mongo...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "groups" && renderGroupsView()}
            {viewMode === "bracket" && renderBracketView()}
            {viewMode === "mine" && renderMineView()}
            {viewMode === "players" && renderPlayersView()}
          </>
        )}
      </section>
    </main>
  );
}
