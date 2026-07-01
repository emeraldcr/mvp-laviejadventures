'use client';
import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { GameUI } from './GameUI/GameUI';
import { GameRuntimeProvider, useGameContext } from '../context/GameContext';
import type { GameRuntimeContextValue } from '../types';

export function GameCanvas() {
  const {
    collectCrystal,
    handleDie,
    handlePlayerHit,
    handlePowerUpChange,
    handleWin,
    keys,
    level,
    levelKey,
    pendingPowerUpRef,
    playerImmuneRef,
    playerPosRef,
    bulletsRef,
    state,
  } = useGameContext();

  const runtimeValue = useMemo<GameRuntimeContextValue>(() => ({
    keys,
    playerPosRef,
    bulletsRef,
    pendingPowerUpRef,
    playerImmuneRef,
    handlePowerUpChange,
    handlePlayerHit,
    handleDie,
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
    handleDie,
    handleWin,
    collectCrystal,
  ]);

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
          <GameRuntimeProvider value={runtimeValue}>
            <Scene
              level={level}
              levelKey={levelKey}
              playerPosRef={playerPosRef}
              gameStatus={state.status}
            />
          </GameRuntimeProvider>
        </Suspense>
      </Canvas>

      <GameUI />
    </div>
  );
}
