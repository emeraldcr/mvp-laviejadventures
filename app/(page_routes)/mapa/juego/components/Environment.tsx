'use client';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function Environment() {
  const { scene } = useThree();
  const farRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const riverRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useEffect(() => {
    scene.background = new THREE.Color('#060c10');
    scene.fog = new THREE.FogExp2('#0a1a12', 0.02);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

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
      <ambientLight color="#173a2b" intensity={0.85} />
      <directionalLight position={[8, 18, 4]} color="#c0f0d0" intensity={1.25} />
      <hemisphereLight args={['#1a4a28', '#3a2a14', 0.35]} />

      <group ref={farRef} position={[20, 0, -22]}>
        <mesh>
          <planeGeometry args={[150, 58]} />
          <meshBasicMaterial color="#07140e" />
        </mesh>

        {[-48, -28, -8, 14, 34, 56, 78].map((x, i) => (
          <mesh key={x} position={[x, 7 + (i % 3) * 1.5, 0.12]}>
            <boxGeometry args={[18 + (i % 2) * 6, 22 + (i % 3) * 4, 0.1]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#0d1c0d' : '#102612'} />
          </mesh>
        ))}

        {[-38, -12, 18, 46, 72].map((x, i) => (
          <mesh key={x} position={[x, 13 - i * 0.5, 0.22]}>
            <boxGeometry args={[0.12, 13 + i, 0.04]} />
            <meshBasicMaterial color="#173516" />
          </mesh>
        ))}
      </group>

      <group ref={midRef} position={[20, 0, -11]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-22 + i * 8, -2.7 + (i % 2) * 0.45, 0]} rotation={[0, 0, i % 2 ? -0.14 : 0.14]}>
            <planeGeometry args={[3.4, 4.4]} />
            <meshBasicMaterial color="#0e2e0e" side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      <mesh ref={riverRef} position={[22, -3.1, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 7]} />
        <meshBasicMaterial color="#081828" transparent opacity={0.82} />
      </mesh>
      <mesh position={[22, -2.86, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 4]} />
        <meshBasicMaterial color="#0d2a4a" transparent opacity={0.38} />
      </mesh>

      <mesh position={[-7, 6, 0]}>
        <boxGeometry args={[5, 28, 2.5]} />
        <meshStandardMaterial color="#281e10" roughness={1} />
      </mesh>
      <mesh position={[50, 6, 0]}>
        <boxGeometry args={[5, 28, 2.5]} />
        <meshStandardMaterial color="#281e10" roughness={1} />
      </mesh>
      <mesh position={[22, -5, 0]}>
        <boxGeometry args={[70, 3, 2.5]} />
        <meshStandardMaterial color="#100c06" roughness={1} />
      </mesh>
    </>
  );
}
