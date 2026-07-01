'use client';
import { memo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { GameUI } from './GameUI/GameUI';
import { GameRuntimeProvider, useGameSceneContext } from '../context/GameContext';

export const GameCanvas = memo(function GameCanvas() {
  const {
    gameStatus,
    level,
    levelKey,
    playerPosRef,
    runtimeValue,
  } = useGameSceneContext();

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
              gameStatus={gameStatus}
            />
          </GameRuntimeProvider>
        </Suspense>
      </Canvas>

      <GameUI />
    </div>
  );
});
