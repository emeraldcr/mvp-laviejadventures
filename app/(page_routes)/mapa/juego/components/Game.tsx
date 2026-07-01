'use client';
/* eslint-disable react-hooks/immutability */
import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Player }      from './Player';
import { Level }       from './Level';
import { Environment } from './Environment';
import { GameUI }      from './GameUI';
import { useKeyboard } from '../hooks/useKeyboard';
import { useGameState } from '../hooks/useGameState';
import { GAME_LEVELS } from '../data/levelData';
import type { LevelData } from '../types';

// ── Camera Rig ────────────────────────────────────────────────────────────────
function CameraRig({ targetRef }: { targetRef: React.MutableRefObject<THREE.Vector3> }) {
  const { camera } = useThree();

  useFrame(() => {
    const t = targetRef.current;
    const lerp = THREE.MathUtils.lerp;
    camera.position.x = lerp(camera.position.x, t.x,         0.075);
    camera.position.y = lerp(camera.position.y, Math.max(t.y + 2.8, 1.5), 0.075);
    // Keep looking directly ahead at player's level
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
}: {
  gameStatus:   string;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  level:         LevelData;
  levelKey:     number;
  onDie:        () => void;
  onCollect:    (id: string) => void;
  onPlayerHit:  () => void;
  onWin:        () => void;
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
      />
      {/* key forces a full remount of Level (and child Collectibles) on restart */}
      <Level
        key={levelKey}
        level={level}
        playerPosRef={playerPosRef}
        onCollect={onCollect}
        onPlayerHit={onPlayerHit}
        onWin={onWin}
        gameStatus={gameStatus}
      />
    </>
  );
}

// ── Game root ─────────────────────────────────────────────────────────────────
export default function Game() {
  const { state, collectCrystal, die, respawn, win, restart, enterLevel, resetAdventure } = useGameState();
  const level = GAME_LEVELS[state.currentLevelIndex] ?? GAME_LEVELS[0];
  const playerPosRef = useRef(new THREE.Vector3(...level.spawnPosition));

  // Auto-respawn 2 s after death (not game over)
  useEffect(() => {
    if (state.status !== 'dead') return;
    const id = setTimeout(respawn, 2000);
    return () => clearTimeout(id);
  }, [state.status, respawn]);

  // Snap player position ref on respawn so camera doesn't lag
  useEffect(() => {
    if (state.status === 'playing') {
      playerPosRef.current.set(...level.spawnPosition);
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
            onDie={die}
            onCollect={collectCrystal}
            onPlayerHit={die}
            onWin={win}
          />
        </Suspense>
      </Canvas>

      <GameUI
        state={state}
        level={level}
        playerPosRef={playerPosRef}
        onRestart={restart}
        onEnterLevel={enterLevel}
        onResetAdventure={resetAdventure}
      />
    </div>
  );
}
