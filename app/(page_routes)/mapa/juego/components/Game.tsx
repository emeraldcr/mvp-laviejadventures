'use client';
import * as THREE from 'three';
import { GameProvider } from '../context/GameContext';
import { GameCanvas } from './GameCanvas';

export default function Game({
  sharedPosRef,
  onRaceWin,
  raceLevelIndex,
  racePlayerName,
  startLevel,
}: {
  sharedPosRef?:    React.MutableRefObject<THREE.Vector3>;
  onRaceWin?:       () => void;
  raceLevelIndex?:  number;
  racePlayerName?:  string;
  startLevel?:      number;
} = {}) {
  return (
    <GameProvider
      sharedPosRef={sharedPosRef}
      onRaceWin={onRaceWin}
      raceLevelIndex={raceLevelIndex}
      racePlayerName={racePlayerName}
      startLevel={startLevel}
    >
      <GameCanvas />
    </GameProvider>
  );
}
