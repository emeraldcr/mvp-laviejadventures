import PlatformTower from './PlatformTower';

export default function PlatformLayer() {
  return (
    <>
      <PlatformTower x={220} y={516} rotate={-8} />
      <PlatformTower x={745} y={612} rotate={6} />
      <PlatformTower x={975} y={560} rotate={8} />
    </>
  );
}
