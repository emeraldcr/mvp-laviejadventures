import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_URL, EMPTY_DRAFTS, STORAGE_KEY, TOTAL_MATCHES } from "./constants";
import type { Draft, LeaderboardEntry, MundialMatch, PlayerProgress, Prediction, PredictionsResponse, ViewMode } from "./types";
import {
  emptyDraft,
  fetchWithTimeout,
  formatCountdown,
  isMatchClosed,
  isMatchLive,
  isSameDayInCR,
  kickoffMs,
  normalizeKey,
  normalizeName,
} from "./utils";

export function useMundial() {
  const [playerName, setPlayerName] = useState("");
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
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
  const [pinVerifiedPlayers, setPinVerifiedPlayers] = useState<Set<string>>(new Set());
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<"set" | "verify">("verify");
  const pinCheckedRef = useRef<Set<string>>(new Set());

  const playerKey = useMemo(() => normalizeKey(playerName), [playerName]);
  const registeredNames = useMemo(() => players.map((p) => p.playerName).sort(), [players]);
  const registeredKeys = useMemo(() => new Set(players.map((p) => p.key)), [players]);
  const isAuthenticated = !playerKey || pinVerifiedPlayers.has(playerKey) || !registeredKeys.has(playerKey);
  const orderedMatches = useMemo(
    () => [...matches].sort((a, b) => kickoffMs(a) - kickoffMs(b) || a.number - b.number),
    [matches]
  );
  const matchById = useMemo(() => new Map(matches.map((m) => [m.id, m])), [matches]);
  const activeMatch = useMemo(
    () => orderedMatches.find((m) => !isMatchClosed(m, nowMs)) ?? null,
    [nowMs, orderedMatches]
  );
  const liveMatch = useMemo(
    () => orderedMatches.find((m) => isMatchLive(m)) ?? null,
    [orderedMatches]
  );
  const activeMatchId = activeMatch?.id ?? null;
  const todayEditableMatches = useMemo(
    () =>
      orderedMatches.filter(
        (m) =>
          !isMatchClosed(m, nowMs) &&
          (m.id === activeMatchId || (nowMs > 0 && isSameDayInCR(kickoffMs(m), nowMs)))
      ),
    [orderedMatches, nowMs, activeMatchId]
  );
  const todayEditableMatchIds = useMemo(
    () => new Set(todayEditableMatches.map((m) => m.id)),
    [todayEditableMatches]
  );
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
  const dirtyDrafts = useMemo(() => {
    return Object.entries(drafts).filter(
      ([matchId, draft]) => draft.dirty && !draft.locked && todayEditableMatchIds.has(matchId)
    );
  }, [todayEditableMatchIds, drafts]);
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

  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const playerMap = new Map<string, LeaderboardEntry>();

    for (const pred of predictions) {
      const key = normalizeKey(pred.playerName);
      if (!playerMap.has(key)) {
        playerMap.set(key, {
          playerName: pred.playerName,
          normalizedName: key,
          totalPoints: 0,
          totalPredictions: 0,
          scoredPredictions: 0,
          exactScores: 0,
          correctOutcomes: 0,
        });
      }
      const entry = playerMap.get(key)!;
      entry.totalPredictions++;

      const match = matchById.get(pred.matchId);
      if (match && match.homeFinalScore !== null && match.awayFinalScore !== null) {
        const isExact = pred.homeScore === match.homeFinalScore && pred.awayScore === match.awayFinalScore;
        const actualOutcome =
          match.homeFinalScore > match.awayFinalScore ? "home" : match.awayFinalScore > match.homeFinalScore ? "away" : "draw";
        const predictedOutcome =
          pred.homeScore > pred.awayScore ? "home" : pred.awayScore > pred.homeScore ? "away" : "draw";
        const correctOutcome = actualOutcome === predictedOutcome;
        const pts = isExact ? 3 : correctOutcome ? 1 : 0;
        entry.scoredPredictions++;
        entry.totalPoints += pts;
        if (pts >= 3) entry.exactScores++;
        if (pts >= 1) entry.correctOutcomes++;
      }
    }

    return [...playerMap.values()].sort(
      (a, b) => b.totalPoints - a.totalPoints || a.playerName.localeCompare(b.playerName)
    );
  }, [predictions, matchById]);

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
    const storedPlayerName = window.localStorage.getItem(STORAGE_KEY) ?? "";
    setPlayerName(storedPlayerName);
    setShowPlayerPicker(!storedPlayerName);
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

  useEffect(() => {
    if (isLoading || !playerName || registeredKeys.size === 0) return;
    const key = normalizeKey(normalizeName(playerName));
    if (pinVerifiedPlayers.has(key)) return;
    if (pinCheckedRef.current.has(key)) return;

    if (!registeredKeys.has(key)) {
      setPinVerifiedPlayers((prev) => { const next = new Set(prev); next.add(key); return next; });
      return;
    }

    pinCheckedRef.current.add(key);
    void (async () => {
      try {
        const r = await fetch(`/api/mundial/pin?playerName=${encodeURIComponent(playerName)}`);
        const data = (await r.json()) as { hasPinSet: boolean };
        setPinMode(data.hasPinSet ? "verify" : "set");
        setShowPinModal(true);
      } catch {
        setPinVerifiedPlayers((prev) => { const next = new Set(prev); next.add(key); return next; });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, playerName, registeredKeys]);

  function getDraft(matchId: string) {
    return drafts[matchId] ?? emptyDraft();
  }

  function canEditMatch(match: MundialMatch) {
    return !isMatchClosed(match, nowMs) && todayEditableMatches.some((m) => m.id === match.id);
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

  function onPinSuccess() {
    const key = normalizeKey(normalizeName(playerName));
    setPinVerifiedPlayers((prev) => { const next = new Set(prev); next.add(key); return next; });
    setShowPinModal(false);
  }

  async function saveMatch(match: MundialMatch) {
    const trimmed = normalizeName(playerName);
    if (!trimmed) { setError("Pone tu nombre antes de guardar."); return; }
    if (!isAuthenticated) { setError("Verificá tu PIN antes de guardar."); return; }
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
    if (!isAuthenticated) { setError("Verificá tu PIN antes de guardar."); return; }

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
    showPinModal,
    pinMode,
    isAuthenticated,
    onPinSuccess,
    matches,
    predictions,
    players,
    leaderboard,
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
    liveMatch,
    activeMatchId,
    todayEditableMatches,
    todayEditableMatchIds,
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
