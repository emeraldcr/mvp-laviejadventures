'use client';
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function Environment() {
  const { scene } = useThree();
  const farRef  = useRef<THREE.Group>(null);
  const midRef  = useRef<THREE.Group>(null);
  const riverRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useEffect(() => {
    scene.background = new THREE.Color('#060c10');
    scene.fog = new THREE.FogExp2('#0a1a12', 0.022);
    return () => { scene.fog = null; };
  }, [scene]);

  useFrame((state, delta) => {
    t.current += delta;
    const camX = state.camera.position.x;

    // Parallax layers
    if (farRef.current)  farRef.current.position.x  = camX * 0.12;
    if (midRef.current)  midRef.current.position.x  = camX * 0.42;

    // Animate river surface
    if (riverRef.current) {
      (riverRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.82 + Math.sin(t.current * 1.8) * 0.06;
    }
  });

  return (
    <>
      {/* Ambient + directional lighting */}
      <ambientLight color="#1a4a38" intensity={0.7} />
      <directionalLight position={[8, 18, 4]} color="#c0f0d0" intensity={1.4} />
      <hemisphereLight args={['#1a4a28', '#3a2a14', 0.45]} />

      {/* Far background — canyon wall silhouettes, slow parallax */}
      <group ref={farRef} position={[20, 0, -22]}>
        {/* Sky backdrop */}
        <mesh>
          <planeGeometry args={[160, 60]} />
          <meshBasicMaterial color="#0a1810" />
        </mesh>

        {/* Irregular rocky canyon faces */}
        {[
          [-50, 12, 22], [-30, 10, 18], [-10, 14, 16],
          [ 10, 11, 20], [ 30, 13, 18], [ 50, 10, 24],
          [ 70, 12, 20], [ 90, 11, 16],
        ].map(([x, h, w], i) => (
          <mesh key={i} position={[x, h / 2, 0.2]}>
            <boxGeometry args={[w, h, 0.1]} />
            <meshBasicMaterial color="#0c1a0c" />
          </mesh>
        ))}

        {/* Hanging vines */}
        {[-40, -20, 0, 20, 40, 60].map((x, i) => (
          <mesh key={i} position={[x, 16 - i * 0.8, 0.3]}>
            <boxGeometry args={[0.12, 12 + i * 0.5, 0.06]} />
            <meshBasicMaterial color="#163016" transparent opacity={0.65} />
          </mesh>
        ))}
      </group>

      {/* Mid ground — vegetation & waterfall streaks */}
      <group ref={midRef} position={[20, 0, -11]}>
        {/* Large fern silhouettes */}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} position={[-30 + i * 5, -3.5 + (i % 3), 0]} rotation={[0, 0, (i % 2 === 0 ? 0.1 : -0.1)]}>
            <planeGeometry args={[3.5, 5]} />
            <meshBasicMaterial color="#0e2e0e" transparent opacity={0.82} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {/* Waterfall streaks */}
        {[-25, 5, 38].map((x, i) => (
          <mesh key={i} position={[x, 4, 0.1]}>
            <boxGeometry args={[0.25, 18, 0.06]} />
            <meshBasicMaterial color="#1a3a5a" transparent opacity={0.35} />
          </mesh>
        ))}
      </group>

      {/* River / death zone visual */}
      <mesh ref={riverRef} position={[22, -3.1, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 8]} />
        <meshBasicMaterial color="#081828" transparent opacity={0.9} />
      </mesh>
      {/* River surface shimmer */}
      <mesh position={[22, -2.88, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 5]} />
        <meshBasicMaterial color="#0d2a4a" transparent opacity={0.5} />
      </mesh>

      {/* Canyon side walls (block edges of level) */}
      <mesh position={[-7, 6, 0]}>
        <boxGeometry args={[5, 28, 2.5]} />
        <meshStandardMaterial color="#281e10" roughness={1} />
      </mesh>
      <mesh position={[50, 6, 0]}>
        <boxGeometry args={[5, 28, 2.5]} />
        <meshStandardMaterial color="#281e10" roughness={1} />
      </mesh>

      {/* Underground fill below river */}
      <mesh position={[22, -5, 0]}>
        <boxGeometry args={[70, 3, 2.5]} />
        <meshStandardMaterial color="#100c06" roughness={1} />
      </mesh>
    </>
  );
}
