'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import type { BulletState, GameContextValue, GameProviderProps, GameRuntimeContextValue, PowerUpKind } from '../types';
import { useGameState } from '../hooks/useGameState';
import { useKeyboard } from '../hooks/useKeyboard';
import { GAME_LEVELS } from '../data/levelData';

const GameContext = createContext<GameContextValue | null>(null);
const GameRuntimeContext = createContext<GameRuntimeContextValue | null>(null);

export function GameProvider({
  children,
  sharedPosRef,
  onRaceWin,
  raceLevelIndex,
  racePlayerName,
  startLevel,
}: GameProviderProps) {
  const {
    state,
    leaderboard,
    registerPlayer,
    clearPlayer,
    collectCrystal,
    dieFromFall,
    dieFromEnemy,
    respawn,
    win,
    restart,
    enterLevel,
    preSelectLevel,
    resetAdventure,
  } = useGameState();

  const effectiveLevelIndex = raceLevelIndex ?? state.currentLevelIndex;
  const level = GAME_LEVELS[effectiveLevelIndex] ?? GAME_LEVELS[0];

  const keys = useKeyboard();
  const internalPosRef = useRef(new THREE.Vector3(...level.spawnPosition));
  const playerPosRef = sharedPosRef ?? internalPosRef;
  const bulletsRef = useRef<BulletState[]>([]);
  const pendingPowerUpRef = useRef<PowerUpKind | null>(null);
  const playerImmuneRef = useRef(false);

  const [activePowerUps, setActivePowerUps] = useState({ ruby: false, sapphire: false });

  const handlePowerUpChange = useCallback((ruby: boolean, sapphire: boolean) => {
    setActivePowerUps({ ruby, sapphire });
  }, []);

  const handlePlayerHit = useCallback(() => {
    if (!playerImmuneRef.current) dieFromEnemy();
  }, [dieFromEnemy]);

  const handleWin = useCallback(() => {
    win();
    onRaceWin?.();
  }, [win, onRaceWin]);

  // In race mode: auto-register with race name and enter the level immediately
  useEffect(() => {
    if (raceLevelIndex == null || state.status !== 'map') return;
    registerPlayer(racePlayerName ?? 'Fantasma');
    enterLevel(raceLevelIndex);
  }, [raceLevelIndex, state.status, registerPlayer, enterLevel, racePlayerName]);

  // Deep-link from /mapa: pre-select the level on the map screen without starting
  useEffect(() => {
    if (startLevel == null || raceLevelIndex != null || state.status !== 'map') return;
    preSelectLevel(startLevel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLevel, state.status]);

  // Auto-respawn 2s after death (not game over)
  useEffect(() => {
    if (state.status !== 'dead') return;
    const id = setTimeout(respawn, 2000);
    return () => clearTimeout(id);
  }, [state.status, respawn]);

  // Snap player position and clear bullets on respawn
  useEffect(() => {
    if (state.status === 'playing') {
      playerPosRef.current.set(...level.spawnPosition);
      bulletsRef.current = [];
    }
  }, [level.spawnPosition, state.restartKey, state.status]);

  const value = useMemo<GameContextValue>(() => ({
    state,
    leaderboard,
    level,
    levelKey: state.restartKey,
    keys,
    playerPosRef,
    bulletsRef,
    pendingPowerUpRef,
    playerImmuneRef,
    activePowerUps,
    handlePowerUpChange,
    handlePlayerHit,
    handleDie: dieFromFall,
    handleWin,
    registerPlayer,
    clearPlayer,
    collectCrystal,
    respawn,
    restart,
    enterLevel,
    resetAdventure,
  }), [
    state, leaderboard, level, keys, playerPosRef, bulletsRef, pendingPowerUpRef, playerImmuneRef,
    activePowerUps, handlePowerUpChange, handlePlayerHit, dieFromFall, handleWin,
    registerPlayer, clearPlayer, collectCrystal, respawn, restart, enterLevel, resetAdventure,
  ]);

  const runtimeValue = useMemo<GameRuntimeContextValue>(() => ({
    keys,
    playerPosRef,
    bulletsRef,
    pendingPowerUpRef,
    playerImmuneRef,
    handlePowerUpChange,
    handlePlayerHit,
    handleDie: dieFromFall,
    handleWin,
    collectCrystal,
  }), [
    keys,
    playerPosRef,
    bulletsRef,
    pendingPowerUpRef,
    playerImmuneRef,
    handlePowerUpChange,
    handlePlayerHit,
    dieFromFall,
    handleWin,
    collectCrystal,
  ]);

  return (
    <GameRuntimeContext.Provider value={runtimeValue}>
      <GameContext.Provider value={value}>{children}</GameContext.Provider>
    </GameRuntimeContext.Provider>
  );
}

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within a GameProvider');
  return ctx;
}

export function GameRuntimeProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: GameRuntimeContextValue;
}) {
  return (
    <GameRuntimeContext.Provider value={value}>
      {children}
    </GameRuntimeContext.Provider>
  );
}

export function useGameRuntimeContext(): GameRuntimeContextValue {
  const ctx = useContext(GameRuntimeContext);
  if (!ctx) throw new Error('useGameRuntimeContext must be used within a GameProvider');
  return ctx;
}
