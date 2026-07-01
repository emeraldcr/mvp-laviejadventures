'use client';
/* eslint-disable react-hooks/immutability */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { LevelData } from '../types';
import { THEMES } from '../constants/themes';
import { getBasicMaterial, getBoxGeometry, getPlaneGeometry, getSphereGeometry, getStandardMaterial } from '../lib/renderAssets';

const FAR_BLOCKS = [-48, -28, -8, 14, 34, 56, 78];
const FAR_TRUNKS = [-38, -12, 18, 46, 72];
const MID_LEAVES = Array.from({ length: 8 }, (_, i) => i);
const STAIRS_STEPS = Array.from({ length: 7 }, (_, i) => i);
const RIVER_ROCKS = [-2, 8, 19, 31, 43];
const CAFETAL_TRUNKS = [-2, 6, 14, 23, 31, 39, 47];
const FOREST_TRUNKS = [0, 12, 24, 36, 48];

export function Environment({ level }: { level: LevelData }) {
  const { scene } = useThree();
  const theme = THEMES[level.theme];
  const farRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const riverRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useEffect(() => {
    scene.background = new THREE.Color(theme.sky);
    scene.fog = new THREE.FogExp2(theme.fog, theme.fogDensity);
    return () => {
      scene.fog = null;
    };
  }, [scene, theme.fog, theme.fogDensity, theme.sky]);

  useFrame((state, delta) => {
    t.current += delta;
    const camX = state.camera.position.x;

    if (farRef.current) farRef.current.position.x = camX * 0.08;
    if (midRef.current) midRef.current.position.x = camX * 0.28;
    if (riverRef.current) {
      (riverRef.current.material as THREE.MeshBasicMaterial).opacity = 0.78 + Math.sin(t.current * 1.4) * 0.04;
    }
  });

  return (
    <>
      <ambientLight color={theme.ambient} intensity={0.85} />
      <directionalLight position={[8, 18, 4]} color={theme.sun} intensity={1.25} />
      <hemisphereLight args={['#1a4a28', '#3a2a14', 0.35]} />

      <group ref={farRef} position={[20, 0, -22]} dispose={null}>
        <mesh geometry={getPlaneGeometry(150, 58)} material={getBasicMaterial({ color: theme.backdrop })}>
        </mesh>

        {FAR_BLOCKS.map((x, i) => (
          <mesh
            key={x}
            position={[x, 7 + (i % 3) * 1.5, 0.12]}
            geometry={getBoxGeometry(18 + (i % 2) * 6, 22 + (i % 3) * 4, 0.1)}
            material={getBasicMaterial({ color: i % 2 === 0 ? theme.farA : theme.farB })}
          >
          </mesh>
        ))}

        {FAR_TRUNKS.map((x, i) => (
          <mesh
            key={x}
            position={[x, 13 - i * 0.5, 0.22]}
            geometry={getBoxGeometry(0.12, 13 + i, 0.04)}
            material={getBasicMaterial({ color: theme.trunks })}
          >
          </mesh>
        ))}
      </group>

      <group ref={midRef} position={[20, 0, -11]} dispose={null}>
        {MID_LEAVES.map((i) => (
          <mesh
            key={i}
            position={[-22 + i * 8, -2.7 + (i % 2) * 0.45, 0]}
            rotation={[0, 0, i % 2 ? -0.14 : 0.14]}
            geometry={getPlaneGeometry(3.4, 4.4)}
            material={getBasicMaterial({ color: theme.leaves, side: THREE.DoubleSide })}
          >
          </mesh>
        ))}
      </group>

      <mesh ref={riverRef} position={[22, -3.1, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive attach="geometry" object={getPlaneGeometry(100, 7)} />
        <meshBasicMaterial color={theme.water} transparent opacity={theme.waterOpacity} />
      </mesh>
      <mesh
        position={[22, -2.86, -0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={getPlaneGeometry(100, 4)}
        material={getBasicMaterial({ color: theme.waterGlow, transparent: true, opacity: 0.38 })}
      >
      </mesh>

      <StationScenery theme={level.theme} />
      <mesh
        position={[22, -5, 0]}
        geometry={getBoxGeometry(70, 3, 2.5)}
        material={getStandardMaterial({ color: theme.floor })}
      >
      </mesh>
    </>
  );
}

function StationScenery({ theme }: { theme: LevelData['theme'] }) {
  if (theme === 'stairs') {
    return (
      <>
        <CanonWall x={-7} color="#2d241d" />
        <CanonWall x={50} color="#3a2b22" />
        {STAIRS_STEPS.map((i) => (
          <mesh
            key={i}
            position={[9 + i * 4.1, -2.3 + i * 0.28, -0.65]}
            geometry={getBoxGeometry(1.5, 0.22, 0.2)}
            material={getStandardMaterial({ color: '#9c7444', roughness: 0.92 })}
          >
          </mesh>
        ))}
      </>
    );
  }

  if (theme === 'river') {
    return (
      <>
        <CanonWall x={-7} color="#25302e" />
        <CanonWall x={50} color="#293b36" />
        {RIVER_ROCKS.map((x, i) => (
          <mesh
            key={x}
            position={[x, -2.25 + (i % 2) * 0.18, 0.35]}
            geometry={getSphereGeometry(1.4 + (i % 2) * 0.5, 12, 8)}
            material={getStandardMaterial({ color: '#566b63' })}
          >
          </mesh>
        ))}
      </>
    );
  }

  return (
    <>
      <CanonWall x={-7} color={theme === 'montanita' ? '#2c2f20' : '#281e10'} />
      <CanonWall x={50} color={theme === 'montanita' ? '#343824' : '#281e10'} />
      {(theme === 'cafetal' ? CAFETAL_TRUNKS : FOREST_TRUNKS).map((x, i) => (
        <mesh
          key={x}
          position={[x, -0.8, -0.25]}
          rotation={[0, 0, i % 2 ? -0.08 : 0.08]}
          geometry={getBoxGeometry(0.35, theme === 'cafetal' ? 4.4 : 5.8, 0.25)}
          material={getStandardMaterial({ color: theme === 'cafetal' ? '#355024' : '#3c2b17' })}
        >
        </mesh>
      ))}
    </>
  );
}

function CanonWall({ x, color }: { x: number; color: string }) {
  return (
    <mesh
      position={[x, 6, 0]}
      geometry={getBoxGeometry(5, 28, 2.5)}
      material={getStandardMaterial({ color })}
    >
    </mesh>
  );
}
