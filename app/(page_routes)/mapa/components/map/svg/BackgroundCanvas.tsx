import { TOUR_GROUPS, VIEWBOX } from '../../../data/mapData';
import type { MapLayer } from '../../../types';
import BridgeLayer from './BridgeLayer';
import CanyonLayer from './CanyonLayer';
import ForestLayer from './ForestLayer';
import MapDefs from './MapDefs';
import MapLabels from './MapLabels';
import MountainRange from './MountainRange';
import PlatformLayer from './PlatformLayer';
import RiverLayer from './RiverLayer';
import SafeZoneLayer from './SafeZoneLayer';
import ServiceLayer from './ServiceLayer';
import TerrainBase from './TerrainBase';
import TourRunner from './TourRunner';
import TrailLayer from './TrailLayer';
import TreeLayer from './TreeLayer';
import UpperLeftDetailLayer from './UpperLeftDetailLayer';

interface BackgroundCanvasProps {
  layers: Record<MapLayer, boolean>;
}

export default function BackgroundCanvas({ layers }: BackgroundCanvasProps) {
  return (
    <svg viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} className="absolute inset-0 h-full w-full">
      <MapDefs />
      <TerrainBase />
      {layers.safe ? <SafeZoneLayer /> : null}
      <ForestLayer />
      <MountainRange />
      <CanyonLayer />
      {layers.river ? <RiverLayer /> : null}
      {layers.trail ? <TrailLayer /> : null}
      <ServiceLayer />
      <UpperLeftDetailLayer />
      <BridgeLayer />
      {layers.platforms ? <PlatformLayer /> : null}
      <TreeLayer />
      <MapLabels />
      {TOUR_GROUPS.map((group) => (
        <TourRunner key={group.id} group={group} />
      ))}
    </svg>
  );
}
