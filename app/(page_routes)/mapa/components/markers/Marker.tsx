import { Binoculars, Footprints, Home, Route } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { MapPoint } from '../../types';

interface MarkerProps {
  point: MapPoint;
  isActive: boolean;
  onSelect: (point: MapPoint) => void;
}

export default function Marker({ point, isActive, onSelect }: MarkerProps) {
  const Icon = point.type === 'service' ? Home : point.type === 'lookout' ? Binoculars : point.type === 'trail' ? Footprints : Route;

  return (
    <button
      type="button"
      aria-label={point.name}
      onClick={() => onSelect(point)}
      className={cn(
        'absolute z-30 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-white bg-sky-500 text-white shadow-lg transition hover:scale-110',
        isActive && 'scale-125 bg-orange-500',
      )}
      style={{ left: point.x, top: point.y }}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
