'use client';
/* eslint-disable react-hooks/immutability */
import React, { useRef, useEffect, Suspense, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Player }      from './Player';
import { Level }       from './Level';
import { Environment } from './Environment';
import { GameUI }      from './GameUI';
import { Bullets }     from './Bullets';
import { useKeyboard } from '../hooks/useKeyboard';
import { useGameState } from '../hooks/useGameState';
import { GAME_LEVELS } from '../data/levelData';
import type { LevelData, BulletState, PowerUpKind } from '../types';

// ── Camera Rig ────────────────────────────────────────────────────────────────
function CameraRig({ targetRef }: { targetRef: React.MutableRefObject<THREE.Vector3> }) {
  const { camera } = useThree();

  useFrame(() => {
    const t = targetRef.current;
    const lerp = THREE.MathUtils.lerp;
    camera.position.x = lerp(camera.position.x, t.x,                     0.075);
    camera.position.y = lerp(camera.position.y, Math.max(t.y + 2.8, 1.5), 0.075);
    camera.lookAt(camera.position.x, camera.position.y - 2.8, 0);
  });

  return null;
}

// ── Inner scene (inside Canvas) ───────────────────────────────────────────────
function Scene({
  gameStatus,
  playerPosRef,
  level,
  levelKey,
  onDie,
  onCollect,
  onPlayerHit,
  onWin,
  bulletsRef,
  pendingPowerUpRef,
  playerImmuneRef,
  onPowerUpChange,
}: {
  gameStatus:        string;
  playerPosRef:      React.MutableRefObject<THREE.Vector3>;
  level:             LevelData;
  levelKey:          number;
  onDie:             () => void;
  onCollect:         (id: string) => void;
  onPlayerHit:       () => void;
  onWin:             () => void;
  bulletsRef:        React.MutableRefObject<BulletState[]>;
  pendingPowerUpRef: React.MutableRefObject<PowerUpKind | null>;
  playerImmuneRef:   React.MutableRefObject<boolean>;
  onPowerUpChange:   (ruby: boolean, sapphire: boolean) => void;
}) {
  const keys = useKeyboard();

  return (
    <>
      <CameraRig targetRef={playerPosRef} />
      <Environment level={level} />
      <Player
        keys={keys}
        platforms={level.platforms}
        spawnPos={level.spawnPosition}
        playerPosRef={playerPosRef}
        gameStatus={gameStatus}
        onDie={onDie}
        bulletsRef={bulletsRef}
        pendingPowerUpRef={pendingPowerUpRef}
        playerImmuneRef={playerImmuneRef}
        onPowerUpChange={onPowerUpChange}
      />
      <Bullets bulletsRef={bulletsRef} />
      {/* key forces a full remount of Level (and children) on restart */}
      <Level
        key={levelKey}
        level={level}
        playerPosRef={playerPosRef}
        onCollect={onCollect}
        onPlayerHit={onPlayerHit}
        onWin={onWin}
        gameStatus={gameStatus}
        bulletsRef={bulletsRef}
        pendingPowerUpRef={pendingPowerUpRef}
      />
    </>
  );
}

// ── Game root ─────────────────────────────────────────────────────────────────
export default function Game({
  sharedPosRef,
  onRaceWin,
  raceLevelIndex,
  racePlayerName,
}: {
  sharedPosRef?:    React.MutableRefObject<THREE.Vector3>;
  onRaceWin?:       () => void;
  raceLevelIndex?:  number;
  racePlayerName?:  string;
} = {}) {
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
    resetAdventure,
  } = useGameState();

  const effectiveLevelIndex = raceLevelIndex ?? state.currentLevelIndex;
  const level = GAME_LEVELS[effectiveLevelIndex] ?? GAME_LEVELS[0];
  const internalPosRef   = useRef(new THREE.Vector3(...level.spawnPosition));
  const playerPosRef     = sharedPosRef ?? internalPosRef;
  const bulletsRef       = useRef<BulletState[]>([]);
  const pendingPowerUpRef = useRef<PowerUpKind | null>(null);
  const playerImmuneRef  = useRef(false);

  const [activePowerUps, setActivePowerUps] = useState({ ruby: false, sapphire: false });

  const handlePowerUpChange = useCallback((ruby: boolean, sapphire: boolean) => {
    setActivePowerUps({ ruby, sapphire });
  }, []);

  const handlePlayerHit = useCallback(() => {
    if (!playerImmuneRef.current) dieFromEnemy();
  }, [dieFromEnemy]);

  // In race mode: auto-register with race name and enter the level immediately
  useEffect(() => {
    if (raceLevelIndex == null || state.status !== 'map') return;
    registerPlayer(racePlayerName ?? 'Fantasma');
    enterLevel(raceLevelIndex);
  }, [raceLevelIndex, state.status, registerPlayer, enterLevel, racePlayerName]);

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

  return (
    <div
      style={{
        width: '100vw', height: '100vh',
        position: 'relative',
        background: '#060c10',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{
          position: [level.spawnPosition[0], level.spawnPosition[1] + 2.8, 10],
          fov: 62,
          near: 0.1,
          far: 100,
        }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        dpr={1}
      >
        <Suspense fallback={null}>
          <Scene
            gameStatus={state.status}
            playerPosRef={playerPosRef}
            level={level}
            levelKey={state.restartKey}
            onDie={dieFromFall}
            onCollect={collectCrystal}
            onPlayerHit={handlePlayerHit}
            onWin={() => { win(); onRaceWin?.(); }}
            bulletsRef={bulletsRef}
            pendingPowerUpRef={pendingPowerUpRef}
            playerImmuneRef={playerImmuneRef}
            onPowerUpChange={handlePowerUpChange}
          />
        </Suspense>
      </Canvas>

      <GameUI
        state={state}
        level={level}
        leaderboard={leaderboard}
        playerPosRef={playerPosRef}
        activePowerUps={activePowerUps}
        onRegisterPlayer={registerPlayer}
        onClearPlayer={clearPlayer}
        onRestart={restart}
        onEnterLevel={enterLevel}
        onResetAdventure={resetAdventure}
      />
    </div>
  );
}
