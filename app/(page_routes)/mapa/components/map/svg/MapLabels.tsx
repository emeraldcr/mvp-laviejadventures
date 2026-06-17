import { MAP_LABELS } from '../../../data/mapData';

export default function MapLabels() {
  return (
    <>
      {MAP_LABELS.map((label) => (
        <text
          key={label.text}
          x={label.x}
          y={label.y}
          transform={`rotate(${label.rotate} ${label.x} ${label.y})`}
          fill="#2d2117"
          fontSize="18"
          fontWeight="800"
        >
          {label.text}
        </text>
      ))}
    </>
  );
}
