import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL, EMPTY_DRAFTS, STORAGE_KEY, TOTAL_MATCHES } from "./constants";
import type { Draft, MundialMatch, PlayerProgress, Prediction, PredictionsResponse, ViewMode } from "./types";
import {
  emptyDraft,
  fetchWithTimeout,
  formatCountdown,
  isMatchClosed,
  kickoffMs,
  normalizeKey,
  normalizeName,
} from "./utils";

export function useMundial() {
  const [playerName, setPlayerName] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(STORAGE_KEY) ?? ""
  );
  const [showPlayerPicker, setShowPlayerPicker] = useState(() =>
    typeof window === "undefined" ? false : !window.localStorage.getItem(STORAGE_KEY)
  );
  const [matches, setMatches] = useState<MundialMatch[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [players, setPlayers] = useState<PlayerProgress[]>([]);
  const [draftOverridesByPlayer, setDraftOverridesByPlayer] = useState<Record<string, Record<string, Draft>>>({});
  const [viewMode, setViewMode] = useState<ViewMode>("next");
  const [nowMs, setNowMs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const playerKey = useMemo(() => normalizeKey(playerName), [playerName]);
  const registeredNames = useMemo(() => players.map((p) => p.playerName).sort(), [players]);
  const orderedMatches = useMemo(
    () => [...matches].sort((a, b) => kickoffMs(a) - kickoffMs(b) || a.number - b.number),
    [matches]
  );
  const matchById = useMemo(() => new Map(matches.map((m) => [m.id, m])), [matches]);
  const activeMatch = useMemo(
    () => orderedMatches.find((m) => !isMatchClosed(m, nowMs)) ?? null,
    [nowMs, orderedMatches]
  );
  const activeMatchId = activeMatch?.id ?? null;
  const nextMatches = useMemo(() => {
    const activeIndex = activeMatch ? orderedMatches.findIndex((m) => m.id === activeMatch.id) : -1;
    const startIndex = activeIndex >= 0 ? activeIndex + 1 : 0;
    return orderedMatches.slice(startIndex).filter((m) => !isMatchClosed(m, nowMs)).slice(0, 4);
  }, [activeMatch, nowMs, orderedMatches]);
  const recentClosedMatches = useMemo(
    () => [...orderedMatches].reverse().filter((m) => isMatchClosed(m, nowMs)),
    [nowMs, orderedMatches]
  );
  const slideMatches = useMemo(() => {
    const recent = recentClosedMatches.slice(0, 1);
    const active = activeMatch ? [activeMatch] : [];
    return [...recent, ...active, ...nextMatches.slice(0, 3)];
  }, [activeMatch, nextMatches, recentClosedMatches]);
  const playerPredictions = useMemo(
    () => predictions.filter((p) => normalizeKey(p.playerName) === playerKey),
    [playerKey, predictions]
  );
  const predictionByMatch = useMemo(
    () => new Map(playerPredictions.map((p) => [p.matchId, p])),
    [playerPredictions]
  );
  const baseDrafts = useMemo(() => {
    const next: Record<string, Draft> = {};
    for (const match of matches) {
      const prediction = predictionByMatch.get(match.id);
      const closed = isMatchClosed(match, nowMs);
      if (prediction) {
        next[match.id] = {
          homeScore: prediction.homeScore,
          awayScore: prediction.awayScore,
          winnerPick: prediction.winnerPick,
          locked: prediction.locked || closed,
          dirty: false,
          saved: true,
          updatedAt: prediction.updatedAt,
        };
      }
    }
    return next;
  }, [matches, nowMs, predictionByMatch]);
  const playerDraftOverrides = useMemo(
    () => draftOverridesByPlayer[playerKey] ?? EMPTY_DRAFTS,
    [draftOverridesByPlayer, playerKey]
  );
  const drafts = useMemo(() => {
    const merged: Record<string, Draft> = { ...baseDrafts };
    for (const [matchId, draft] of Object.entries(playerDraftOverrides)) {
      const match = matchById.get(matchId);
      const closed = match ? isMatchClosed(match, nowMs) : false;
      const base = baseDrafts[matchId] ?? emptyDraft();
      merged[matchId] = {
        ...base,
        ...draft,
        dirty: closed ? false : draft.dirty,
        locked: closed || base.locked || draft.locked,
      };
    }
    return merged;
  }, [baseDrafts, matchById, nowMs, playerDraftOverrides]);
  const dirtyDrafts = useMemo(
    () => Object.entries(drafts).filter(([matchId, draft]) => draft.dirty && !draft.locked && matchId === activeMatchId),
    [activeMatchId, drafts]
  );
  const savedCount = playerPredictions.length;
  const lockedCount = playerPredictions.filter((p) => {
    const match = matchById.get(p.matchId);
    return match ? isMatchClosed(match, nowMs) : p.locked;
  }).length;
  const closedMatchCount = orderedMatches.filter((m) => isMatchClosed(m, nowMs)).length;
  const completionPct = Math.round((savedCount / TOTAL_MATCHES) * 100);
  const lockedPct = Math.round((lockedCount / TOTAL_MATCHES) * 100);
  const activeCountdown =
    activeMatch && nowMs > 0 ? formatCountdown(kickoffMs(activeMatch) - nowMs) : "Calculando";
  const mineMatches = useMemo(() => {
    const touched = orderedMatches.filter((m) => {
      const draft = drafts[m.id];
      return draft?.saved || draft?.dirty || isMatchClosed(m, nowMs);
    });
    if (touched.length) return touched;
    return activeMatch ? [activeMatch] : [];
  }, [activeMatch, drafts, nowMs, orderedMatches]);

  async function readQuiniela() {
    const response = await fetchWithTimeout(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar la quiniela.");
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
    } catch (err) {
      console.error(err);
      setError("No pude cargar Mongo en este momento.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadQuiniela(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadQuiniela]);

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const trimmed = normalizeName(playerName);
    if (trimmed) window.localStorage.setItem(STORAGE_KEY, trimmed);
  }, [playerName]);

  function getDraft(matchId: string) {
    return drafts[matchId] ?? emptyDraft();
  }

  function canEditMatch(match: MundialMatch) {
    return match.id === activeMatchId && !isMatchClosed(match, nowMs);
  }

  function updateDraft(matchId: string, patch: Partial<Draft>) {
    setError("");
    setSuccess("");
    setDraftOverridesByPlayer((current) => {
      const match = matchById.get(matchId);
      if (!match || !canEditMatch(match)) return current;
      const playerDrafts = current[playerKey] ?? {};
      const existing = drafts[matchId] ?? emptyDraft();
      return {
        ...current,
        [playerKey]: {
          ...playerDrafts,
          [matchId]: { ...existing, ...patch, dirty: true, locked: false },
        },
      };
    });
  }

  function buildPayload(match: MundialMatch) {
    const draft = getDraft(match.id);
    return {
      matchId: match.id,
      playerName: normalizeName(playerName),
      homeScore: draft.homeScore,
      awayScore: draft.awayScore,
      winnerPick: draft.winnerPick,
      locked: false,
    };
  }

  async function postPredictions(payload: unknown) {
    const response = await fetchWithTimeout(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error ?? "No se pudo guardar.");
    return data as { predictions: Prediction[] };
  }

  function mergeSaved(saved: Prediction[]) {
    const savedMatchIds = new Set(saved.map((p) => p.matchId));
    setPredictions((current) => {
      const savedIds = new Set(saved.map((p) => p.id));
      const savedKeys = new Set(saved.map((p) => `${p.matchId}:${normalizeKey(p.playerName)}`));
      const without = current.filter(
        (p) => !savedIds.has(p.id) && !savedKeys.has(`${p.matchId}:${normalizeKey(p.playerName)}`)
      );
      return [...saved, ...without].sort((a, b) => {
        const ta = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        const tb = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        return ta - tb;
      });
    });
    setDraftOverridesByPlayer((current) => {
      const playerDrafts = current[playerKey] ?? {};
      const next = Object.fromEntries(
        Object.entries(playerDrafts).filter(([matchId]) => !savedMatchIds.has(matchId))
      );
      return { ...current, [playerKey]: next };
    });
  }

  function validatePrediction(match: MundialMatch) {
    const draft = getDraft(match.id);
    if (match.stage !== "group" && draft.homeScore === draft.awayScore && !draft.winnerPick) {
      return "Elegis quien pasa antes de guardar una llave empatada.";
    }
    if (!canEditMatch(match)) return "Ese partido no esta abierto.";
    return "";
  }

  async function saveMatch(match: MundialMatch) {
    const trimmed = normalizeName(playerName);
    if (!trimmed) { setError("Pone tu nombre antes de guardar."); return; }
    const validationError = validatePrediction(match);
    if (validationError) { setError(validationError); return; }

    setSavingId(match.id);
    setError("");
    setSuccess("");
    try {
      const data = await postPredictions(buildPayload(match));
      mergeSaved(data.predictions);
      setPlayerName(trimmed);
      setSuccess(`Guardado: ${match.homeTeam} vs ${match.awayTeam}.`);
      void loadQuiniela();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No pude guardar en Mongo.");
    } finally {
      setSavingId(null);
    }
  }

  async function saveDirtyDrafts() {
    const trimmed = normalizeName(playerName);
    if (!trimmed) { setError("Pone tu nombre antes de guardar."); return; }

    const dirtyMatches = dirtyDrafts
      .map(([matchId]) => matchById.get(matchId))
      .filter((m): m is MundialMatch => Boolean(m));
    if (!dirtyMatches.length) { setSuccess("No hay cambios pendientes."); return; }

    const validationError = dirtyMatches.map(validatePrediction).find(Boolean);
    if (validationError) { setError(validationError); return; }

    setIsSavingBulk(true);
    setError("");
    setSuccess("");
    try {
      const data = await postPredictions({
        playerName: trimmed,
        predictions: dirtyMatches.map(buildPayload),
      });
      mergeSaved(data.predictions);
      setPlayerName(trimmed);
      setSuccess(`${data.predictions.length} resultado guardado.`);
      void loadQuiniela();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No pude guardar en Mongo.");
    } finally {
      setIsSavingBulk(false);
    }
  }

  return {
    playerName,
    setPlayerName,
    showPlayerPicker,
    setShowPlayerPicker,
    matches,
    players,
    viewMode,
    setViewMode,
    nowMs,
    isLoading,
    savingId,
    isSavingBulk,
    error,
    success,
    registeredNames,
    activeMatch,
    activeMatchId,
    slideMatches,
    recentClosedMatches,
    drafts,
    dirtyDrafts,
    savedCount,
    lockedCount,
    closedMatchCount,
    completionPct,
    lockedPct,
    activeCountdown,
    mineMatches,
    loadQuiniela,
    getDraft,
    updateDraft,
    saveMatch,
    saveDirtyDrafts,
  };
}
