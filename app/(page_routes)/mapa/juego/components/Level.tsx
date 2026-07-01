'use client';
import { memo } from 'react';
import { Platform } from './Platform';
import { Collectible } from './Collectible';
import { Enemy } from './Enemy';
import { Goal } from './Goal';
import { PowerUp } from './PowerUp';
import { useGameContext } from '../context/GameContext';

export const Level = memo(function Level() {
  const { level } = useGameContext();

  return (
    <>
      {level.platforms.map(p => <Platform key={p.id} data={p} />)}
      {level.collectibles.map(c => <Collectible key={c.id} data={c} />)}
      {level.powerUps.map(pu => <PowerUp key={pu.id} data={pu} />)}
      {level.enemies.map(e => <Enemy key={e.id} data={e} />)}
      <Goal position={level.goalPosition} />
    </>
  );
});
