'use client';
import type { PlatformData } from '../types';

interface Props {
  data: PlatformData;
}

export function Platform({ data }: Props) {
  const [px, py, pz] = data.position;
  const [pw, ph, pd] = data.size;

  // Pseudo-random decoration offset seeded by id
  const seed = data.id.charCodeAt(1) || 1;

  return (
    <group position={[px, py, pz]}>
      {/* Stone base */}
      <mesh>
        <boxGeometry args={[pw, ph, pd]} />
        <meshStandardMaterial color="#352518" roughness={0.96} metalness={0.04} />
      </mesh>
      {/* Dirt strip */}
      <mesh position={[0, ph / 2 - 0.09, 0]}>
        <boxGeometry args={[pw * 0.97, 0.07, pd * 0.97]} />
        <meshStandardMaterial color="#241606" roughness={1} />
      </mesh>
      {/* Moss top */}
      <mesh position={[0, ph / 2 - 0.03, 0]}>
        <boxGeometry args={[pw * 0.96, 0.1, pd * 0.96]} />
        <meshStandardMaterial color="#1a582a" roughness={0.68} />
      </mesh>

      {/* Small rocks scattered on top */}
      {Array.from({ length: Math.max(2, Math.floor(pw)) }).map((_, i) => {
        const xoff = -pw / 2 + 0.6 + (i / (Math.floor(pw))) * (pw - 1.2);
        const zoff = (Math.sin(i * seed * 0.7) * 0.35);
        return (
          <mesh key={i} position={[xoff, ph / 2 + 0.06, zoff]}>
            <boxGeometry args={[
              0.12 + Math.abs(Math.sin(i * seed)) * 0.1,
              0.08 + Math.abs(Math.cos(i * seed * 1.3)) * 0.06,
              0.1,
            ]} />
            <meshStandardMaterial color="#4a3825" roughness={1} />
          </mesh>
        );
      })}

      {/* Fern tuft left */}
      <mesh position={[-pw / 2 + 0.25, ph / 2 + 0.22, 0.1]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.14, 0.42, 5]} />
        <meshStandardMaterial color="#1a4820" roughness={0.75} transparent opacity={0.88} />
      </mesh>
      {/* Fern tuft right */}
      <mesh position={[pw / 2 - 0.25, ph / 2 + 0.22, 0.1]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.14, 0.42, 5]} />
        <meshStandardMaterial color="#1a4820" roughness={0.75} transparent opacity={0.88} />
      </mesh>
    </group>
  );
}
