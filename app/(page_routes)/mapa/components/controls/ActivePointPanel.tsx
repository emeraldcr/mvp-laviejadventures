import type { ReactNode } from 'react';
import type { MapPoint } from '../../types';

interface ActivePointPanelProps {
  point: MapPoint;
  clockIcon: ReactNode;
  mapIcon: ReactNode;
  mountainIcon: ReactNode;
}

export default function ActivePointPanel({ point, clockIcon, mapIcon, mountainIcon }: ActivePointPanelProps) {
  return (
    <div className="absolute bottom-5 left-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-stone-200 bg-white/92 p-4 shadow-xl backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-500 text-white">
          {mapIcon}
        </span>
        <div>
          <h2 className="text-lg font-black leading-tight text-stone-950">{point.name}</h2>
          <p className="mt-1 text-sm leading-snug text-stone-600">{point.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-amber-800">
              {mountainIcon} {point.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-1 text-sky-800">
              {clockIcon} {point.minutes} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
