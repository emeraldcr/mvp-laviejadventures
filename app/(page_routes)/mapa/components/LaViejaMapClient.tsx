'use client';

import { useMemo, useState } from 'react';
import { Clock, MapPin, Mountain, Trees, Users } from 'lucide-react';
import { DEFAULT_LAYERS, MAP_POINTS, TOUR_GROUPS, VIEWBOX } from '../data/mapData';
import type { MapLayer, MapPoint } from '../types';
import ActiveGroupBadge from './controls/ActiveGroupBadge';
import ActivePointPanel from './controls/ActivePointPanel';
import LegendPanel from './controls/LegendPanel';
import ZoomControls from './controls/ZoomControls';
import LayeredMap from './map/LayeredMap';

export default function LaViejaMapClient() {
  const [activePoint, setActivePoint] = useState<MapPoint>(MAP_POINTS[2]);
  const [zoom, setZoom] = useState(0.86);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);

  const activeGroup = useMemo(() => TOUR_GROUPS.find((group) => group.progress > 40) ?? TOUR_GROUPS[0], []);

  const toggleLayer = (layer: MapLayer) => {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#efe4c8] text-stone-900">
      <section className="relative h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_30%_10%,#fff7d8_0,#efe4c8_36%,#ddc79b_100%)]">
        <header className="pointer-events-none absolute left-0 top-0 z-40 w-full px-4 py-4 text-center sm:py-5">
          <h1 className="text-balance text-2xl font-black tracking-normal text-[#3a2112] drop-shadow-sm sm:text-4xl">
            La Vieja Adventures: Tour al Cañón del Río La Vieja
          </h1>
        </header>

        <div className="absolute inset-0 overflow-auto pt-20">
          <div
            className="origin-top-left transition-transform duration-300"
            style={{ transform: `scale(${zoom})`, width: VIEWBOX.width, height: VIEWBOX.height }}
          >
            <LayeredMap layers={layers} activePoint={activePoint} onSelectPoint={setActivePoint} />
          </div>
        </div>

        <LegendPanel layers={layers} onToggleLayer={toggleLayer} />
        <ActivePointPanel point={activePoint} clockIcon={<Clock className="h-3.5 w-3.5" />} mapIcon={<MapPin className="h-5 w-5" />} mountainIcon={<Mountain className="h-3.5 w-3.5" />} />
        <ZoomControls setZoom={setZoom} />
        <ActiveGroupBadge group={activeGroup} leadingIcon={<Trees className="h-4 w-4 text-emerald-700" />} trailingIcon={<Users className="h-4 w-4 text-sky-700" />} />
      </section>
    </main>
  );
}
