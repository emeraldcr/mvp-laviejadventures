'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, LeaderboardEntry, DeathCause } from '../types';
import { GAME_LEVELS } from '../data/levelData';

export const DEV_UNLOCK_ALL_LEVELS = process.env.NODE_ENV === 'development';
const LEADERBOARD_KEY = 'lva-ghost-leaderboard';
const PLAYER_KEY = 'lva-ghost-player-name';

const makeInitialState = (levelIndex = 0): GameState => ({
  lives: 3,
  score: 0,
  crystals: 0,
  lifetimeCrystals: 0,
  totalCrystals: GAME_LEVELS[levelIndex]?.collectibles.length ?? 0,
  status: 'map',
  currentLevelIndex: levelIndex,
  unlockedStationIndex: DEV_UNLOCK_ALL_LEVELS ? GAME_LEVELS.length : 0,
  restartKey: 0,
  playerName: null,
  deathCause: null,
  deathMessageIdx: 0,
});

function readLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEADERBOARD_KEY) ?? '[]') as LeaderboardEntry[];
    return Array.isArray(parsed) ? parsed.filter((entry) => entry?.name) : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(entries: LeaderboardEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 20)));
}

function upsertLeaderboard(name: string, crystalsToAdd: number, score: number) {
  const safeName = name.trim().slice(0, 24);
  if (!safeName) return readLeaderboard();

  const entries = readLeaderboard();
  const existing = entries.find((entry) => entry.name.toLowerCase() === safeName.toLowerCase());

  if (existing) {
    existing.name = safeName;
    existing.crystals += crystalsToAdd;
    existing.bestScore = Math.max(existing.bestScore, score);
    existing.lastPlayedAt = Date.now();
  } else {
    entries.push({
      name: safeName,
      crystals: Math.max(0, crystalsToAdd),
      bestScore: Math.max(0, score),
      lastPlayedAt: Date.now(),
    });
  }

  entries.sort((a, b) => b.crystals - a.crystals || b.bestScore - a.bestScore || b.lastPlayedAt - a.lastPlayedAt);
  writeLeaderboard(entries);
  return entries;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => makeInitialState());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const collectedRef = useRef(new Set<string>());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const storedName = window.localStorage.getItem(PLAYER_KEY);
    const entries = readLeaderboard();
    setLeaderboard(entries);
    if (storedName) {
      const safeName = storedName.trim().slice(0, 24);
      const entry = entries.find((item) => item.name.toLowerCase() === safeName.toLowerCase());
      setState((s) => ({
        ...s,
        playerName: safeName || null,
        lifetimeCrystals: entry?.crystals ?? s.lifetimeCrystals,
        score: Math.max(s.score, entry?.bestScore ?? 0),
      }));
    }
  }, []);

  const registerPlayer = useCallback((name: string) => {
    const safeName = name.trim().slice(0, 24);
    if (!safeName) return;
    window.localStorage.setItem(PLAYER_KEY, safeName);
    const entries = upsertLeaderboard(safeName, 0, 0);
    const entry = entries.find((item) => item.name.toLowerCase() === safeName.toLowerCase());
    setLeaderboard(entries);
    setState((s) => ({
      ...s,
      playerName: safeName,
      lifetimeCrystals: entry?.crystals ?? 0,
      score: Math.max(s.score, entry?.bestScore ?? 0),
    }));
  }, []);

  const clearPlayer = useCallback(() => {
    window.localStorage.removeItem(PLAYER_KEY);
    setState((s) => ({ ...s, playerName: null, status: 'map' }));
  }, []);

  const collectCrystal = useCallback((id: string) => {
    if (collectedRef.current.has(id)) return;
    collectedRef.current.add(id);
    const currentState = stateRef.current;
    const nextScore = currentState.score + 100;
    if (currentState.playerName) {
      setLeaderboard(upsertLeaderboard(currentState.playerName, 1, nextScore));
    }
    setState(s => ({
      ...s,
      crystals: s.crystals + 1,
      lifetimeCrystals: s.lifetimeCrystals + 1,
      score: s.score + 100,
    }));
  }, []);

  const dieFromFall = useCallback(() => {
    setState(s => {
      const lives = s.lives - 1;
      return {
        ...s,
        lives,
        status: lives <= 0 ? 'gameover' : 'dead',
        deathCause: 'fall' as DeathCause,
        deathMessageIdx: Math.floor(Math.random() * 4),
      };
    });
  }, []);

  const dieFromEnemy = useCallback(() => {
    setState(s => {
      const lives = s.lives - 1;
      return {
        ...s,
        lives,
        status: lives <= 0 ? 'gameover' : 'dead',
        deathCause: 'enemy' as DeathCause,
        deathMessageIdx: Math.floor(Math.random() * 4),
      };
    });
  }, []);

  const respawn = useCallback(() => {
    setState(s => ({ ...s, status: 'playing' }));
  }, []);

  const win = useCallback(() => {
    collectedRef.current.clear();
    setState(s => {
      const nextStationIndex = Math.min(s.currentLevelIndex + 1, GAME_LEVELS.length);
      const isComplete = s.currentLevelIndex >= GAME_LEVELS.length - 1;

      return {
        ...s,
        status: isComplete ? 'complete' : 'map',
        score: s.score + 500,
        crystals: 0,
        totalCrystals: GAME_LEVELS[Math.min(s.currentLevelIndex + 1, GAME_LEVELS.length - 1)]?.collectibles.length ?? s.totalCrystals,
        unlockedStationIndex: Math.max(s.unlockedStationIndex, nextStationIndex),
        currentLevelIndex: isComplete ? s.currentLevelIndex : s.currentLevelIndex + 1,
      };
    });
  }, []);

  const restart = useCallback(() => {
    collectedRef.current.clear();
    setState(s => ({
      ...s,
      lives: 3,
      crystals: 0,
      totalCrystals: GAME_LEVELS[s.currentLevelIndex]?.collectibles.length ?? s.totalCrystals,
      status: 'playing',
      restartKey: s.restartKey + 1,
      deathCause: null,
    }));
  }, []);

  const enterLevel = useCallback((levelIndex: number) => {
    collectedRef.current.clear();
    setState(s => {
      const clamped = Math.max(0, Math.min(levelIndex, GAME_LEVELS.length - 1));
      const level = GAME_LEVELS[clamped];
      const unlockedStationIndex = DEV_UNLOCK_ALL_LEVELS
        ? GAME_LEVELS.length
        : Math.max(s.unlockedStationIndex, clamped);

      return {
        ...s,
        lives: 3,
        crystals: 0,
        totalCrystals: level.collectibles.length,
        status: 'playing',
        currentLevelIndex: clamped,
        unlockedStationIndex,
        restartKey: s.restartKey + 1,
        deathCause: null,
      };
    });
  }, []);

  const resetAdventure = useCallback(() => {
    collectedRef.current.clear();
    setState(s => ({ ...makeInitialState(), playerName: s.playerName, restartKey: s.restartKey + 1 }));
  }, []);

  return { state, leaderboard, registerPlayer, clearPlayer, collectCrystal, dieFromFall, dieFromEnemy, respawn, win, restart, enterLevel, resetAdventure };
}
