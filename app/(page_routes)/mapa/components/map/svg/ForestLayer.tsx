import { FOREST_PATCHES } from '../../../data/mapData';

export default function ForestLayer() {
  return (
    <>
      {FOREST_PATCHES.map((path) => (
        <path key={path} d={path} fill="#4f8b41" opacity="0.74" />
      ))}
    </>
  );
}
