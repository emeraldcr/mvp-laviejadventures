'use client';
import type { PlatformData } from '../types';

interface Props {
  data: PlatformData;
}

export function Platform({ data }: Props) {
  const [px, py, pz] = data.position;
  const [pw, ph, pd] = data.size;
  const palette = platformPalette(data.kind);

  return (
    <group position={[px, py, pz]}>
      <mesh>
        <boxGeometry args={[pw, ph, pd]} />
        <meshStandardMaterial color={palette.base} roughness={0.96} metalness={0.04} />
      </mesh>
      <mesh position={[0, ph / 2 - 0.09, 0]}>
        <boxGeometry args={[pw * 0.97, 0.07, pd * 0.97]} />
        <meshStandardMaterial color={palette.under} roughness={1} />
      </mesh>
      <mesh position={[0, ph / 2 - 0.03, 0]}>
        <boxGeometry args={[pw * 0.96, 0.1, pd * 0.96]} />
        <meshStandardMaterial color={palette.top} roughness={0.68} />
      </mesh>
      {data.kind === 'stair' ? (
        <mesh position={[0, ph / 2 + 0.07, 0]}>
          <boxGeometry args={[pw * 0.78, 0.08, pd * 0.88]} />
          <meshStandardMaterial color="#5d4730" roughness={0.9} />
        </mesh>
      ) : null}
      {data.kind === 'bridge' ? (
        <>
          {[-0.33, 0, 0.33].map((offset) => (
            <mesh key={offset} position={[0, ph / 2 + 0.05, offset * pd]}>
              <boxGeometry args={[pw * 0.92, 0.07, 0.08]} />
              <meshStandardMaterial color="#6b4a25" roughness={0.85} />
            </mesh>
          ))}
        </>
      ) : null}
    </group>
  );
}

function platformPalette(kind: PlatformData['kind']) {
  switch (kind) {
    case 'mud':
      return { base: '#302018', under: '#1b110b', top: '#5a3a1e' };
    case 'root':
      return { base: '#342214', under: '#1a1008', top: '#6b3e17' };
    case 'rock':
      return { base: '#363b35', under: '#1d211e', top: '#56615a' };
    case 'stair':
      return { base: '#403226', under: '#22170f', top: '#80613f' };
    case 'bridge':
      return { base: '#3b2715', under: '#1d1208', top: '#7a552b' };
    case 'river':
      return { base: '#263b38', under: '#111d1c', top: '#3f6f67' };
    default:
      return { base: '#352518', under: '#241606', top: '#1a582a' };
  }
}
