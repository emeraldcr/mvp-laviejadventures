'use client';
/* eslint-disable react-hooks/immutability */
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Player } from './Player';
import { Level } from './Level';
import { Environment } from './Environment';
import { Bullets } from './Bullets';
import { useGameContext } from '../context/GameContext';

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

export function Scene() {
  const { level, levelKey, playerPosRef } = useGameContext();

  return (
    <>
      <CameraRig targetRef={playerPosRef} />
      <Environment level={level} />
      <Player />
      <Bullets />
      {/* key forces a full remount of Level (and children) on restart */}
      <Level key={levelKey} />
    </>
  );
}
