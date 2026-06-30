'use client';
import type { PlatformData } from '../types';

interface Props {
  data: PlatformData;
}

export function Platform({ data }: Props) {
  const [px, py, pz] = data.position;
  const [pw, ph, pd] = data.size;

  return (
    <group position={[px, py, pz]}>
      <mesh>
        <boxGeometry args={[pw, ph, pd]} />
        <meshStandardMaterial color="#352518" roughness={0.96} metalness={0.04} />
      </mesh>
      <mesh position={[0, ph / 2 - 0.09, 0]}>
        <boxGeometry args={[pw * 0.97, 0.07, pd * 0.97]} />
        <meshStandardMaterial color="#241606" roughness={1} />
      </mesh>
      <mesh position={[0, ph / 2 - 0.03, 0]}>
        <boxGeometry args={[pw * 0.96, 0.1, pd * 0.96]} />
        <meshStandardMaterial color="#1a582a" roughness={0.68} />
      </mesh>
    </group>
  );
}
