'use client';
import { useState, useCallback, useRef } from 'react';
import type { GameState } from '../types';
import { GAME_LEVELS } from '../data/levelData';

export const DEV_UNLOCK_ALL_LEVELS = process.env.NODE_ENV === 'development';

const makeInitialState = (levelIndex = 0): GameState => ({
  lives: 3,
  score: 0,
  crystals: 0,
  totalCrystals: GAME_LEVELS[levelIndex]?.collectibles.length ?? 0,
  status: 'map',
  currentLevelIndex: levelIndex,
  unlockedStationIndex: DEV_UNLOCK_ALL_LEVELS ? GAME_LEVELS.length : 0,
  restartKey: 0,
});

export function useGameState() {
  const [state, setState] = useState<GameState>(() => makeInitialState());
  const collectedRef = useRef(new Set<string>());

  const collectCrystal = useCallback((id: string) => {
    if (collectedRef.current.has(id)) return;
    collectedRef.current.add(id);
    setState(s => ({ ...s, crystals: s.crystals + 1, score: s.score + 100 }));
  }, []);

  const die = useCallback(() => {
    setState(s => {
      const lives = s.lives - 1;
      return { ...s, lives, status: lives <= 0 ? 'gameover' : 'dead' };
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
      };
    });
  }, []);

  const resetAdventure = useCallback(() => {
    collectedRef.current.clear();
    setState(s => ({ ...makeInitialState(), restartKey: s.restartKey + 1 }));
  }, []);

  return { state, collectCrystal, die, respawn, win, restart, enterLevel, resetAdventure };
}
