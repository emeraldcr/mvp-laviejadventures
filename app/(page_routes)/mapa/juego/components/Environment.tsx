'use client';
/* eslint-disable react-hooks/immutability */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { LevelData } from '../types';

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

      <group ref={farRef} position={[20, 0, -22]}>
        <mesh>
          <planeGeometry args={[150, 58]} />
          <meshBasicMaterial color={theme.backdrop} />
        </mesh>

        {[-48, -28, -8, 14, 34, 56, 78].map((x, i) => (
          <mesh key={x} position={[x, 7 + (i % 3) * 1.5, 0.12]}>
            <boxGeometry args={[18 + (i % 2) * 6, 22 + (i % 3) * 4, 0.1]} />
            <meshBasicMaterial color={i % 2 === 0 ? theme.farA : theme.farB} />
          </mesh>
        ))}

        {[-38, -12, 18, 46, 72].map((x, i) => (
          <mesh key={x} position={[x, 13 - i * 0.5, 0.22]}>
            <boxGeometry args={[0.12, 13 + i, 0.04]} />
            <meshBasicMaterial color={theme.trunks} />
          </mesh>
        ))}
      </group>

      <group ref={midRef} position={[20, 0, -11]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-22 + i * 8, -2.7 + (i % 2) * 0.45, 0]} rotation={[0, 0, i % 2 ? -0.14 : 0.14]}>
            <planeGeometry args={[3.4, 4.4]} />
            <meshBasicMaterial color={theme.leaves} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      <mesh ref={riverRef} position={[22, -3.1, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 7]} />
        <meshBasicMaterial color={theme.water} transparent opacity={theme.waterOpacity} />
      </mesh>
      <mesh position={[22, -2.86, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 4]} />
        <meshBasicMaterial color={theme.waterGlow} transparent opacity={0.38} />
      </mesh>

      <StationScenery theme={level.theme} />
      <mesh position={[22, -5, 0]}>
        <boxGeometry args={[70, 3, 2.5]} />
        <meshStandardMaterial color={theme.floor} roughness={1} />
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
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[9 + i * 4.1, -2.3 + i * 0.28, -0.65]}>
            <boxGeometry args={[1.5, 0.22, 0.2]} />
            <meshStandardMaterial color="#9c7444" roughness={0.92} />
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
        {[-2, 8, 19, 31, 43].map((x, i) => (
          <mesh key={x} position={[x, -2.25 + (i % 2) * 0.18, 0.35]}>
            <sphereGeometry args={[1.4 + (i % 2) * 0.5, 12, 8]} />
            <meshStandardMaterial color="#566b63" roughness={1} />
          </mesh>
        ))}
      </>
    );
  }

  return (
    <>
      <CanonWall x={-7} color={theme === 'montanita' ? '#2c2f20' : '#281e10'} />
      <CanonWall x={50} color={theme === 'montanita' ? '#343824' : '#281e10'} />
      {(theme === 'cafetal' ? [-2, 6, 14, 23, 31, 39, 47] : [0, 12, 24, 36, 48]).map((x, i) => (
        <mesh key={x} position={[x, -0.8, -0.25]} rotation={[0, 0, i % 2 ? -0.08 : 0.08]}>
          <boxGeometry args={[0.35, theme === 'cafetal' ? 4.4 : 5.8, 0.25]} />
          <meshStandardMaterial color={theme === 'cafetal' ? '#355024' : '#3c2b17'} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

function CanonWall({ x, color }: { x: number; color: string }) {
  return (
    <mesh position={[x, 6, 0]}>
      <boxGeometry args={[5, 28, 2.5]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

const THEMES: Record<LevelData['theme'], {
  sky: string;
  fog: string;
  fogDensity: number;
  ambient: string;
  sun: string;
  backdrop: string;
  farA: string;
  farB: string;
  trunks: string;
  leaves: string;
  water: string;
  waterGlow: string;
  waterOpacity: number;
  floor: string;
}> = {
  reception: {
    sky: '#07120f', fog: '#0b2418', fogDensity: 0.018, ambient: '#173a2b', sun: '#c0f0d0',
    backdrop: '#07140e', farA: '#0d1c0d', farB: '#102612', trunks: '#173516', leaves: '#0e2e0e',
    water: '#081828', waterGlow: '#0d2a4a', waterOpacity: 0.7, floor: '#100c06',
  },
  cafetal: {
    sky: '#08120b', fog: '#16310f', fogDensity: 0.021, ambient: '#26401b', sun: '#d9f0bd',
    backdrop: '#0b1608', farA: '#19330f', farB: '#233b12', trunks: '#4b321b', leaves: '#243f13',
    water: '#10251f', waterGlow: '#1f5643', waterOpacity: 0.58, floor: '#160f08',
  },
  montanita: {
    sky: '#091216', fog: '#17231e', fogDensity: 0.016, ambient: '#263524', sun: '#e8dfaa',
    backdrop: '#111711', farA: '#202915', farB: '#263018', trunks: '#312612', leaves: '#253616',
    water: '#0c1b24', waterGlow: '#24475a', waterOpacity: 0.54, floor: '#15140c',
  },
  stairs: {
    sky: '#060c10', fog: '#20170f', fogDensity: 0.026, ambient: '#342317', sun: '#f4d39a',
    backdrop: '#100d0a', farA: '#2a2119', farB: '#35271c', trunks: '#4f3822', leaves: '#1f2b16',
    water: '#071826', waterGlow: '#15546a', waterOpacity: 0.8, floor: '#120d08',
  },
  river: {
    sky: '#061216', fog: '#082c2b', fogDensity: 0.022, ambient: '#123c39', sun: '#b9f4e1',
    backdrop: '#071817', farA: '#12302c', farB: '#173b34', trunks: '#263b35', leaves: '#145040',
    water: '#064051', waterGlow: '#15a5a5', waterOpacity: 0.88, floor: '#0b1615',
  },
};
