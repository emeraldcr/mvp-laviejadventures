'use client';
import * as THREE from 'three';
import { Platform }    from './Platform';
import { Collectible } from './Collectible';
import { Enemy }       from './Enemy';
import { Goal }        from './Goal';
import type { LevelData } from '../types';

interface Props {
  level: LevelData;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onCollect:    (id: string) => void;
  onPlayerHit:  () => void;
  onWin:        () => void;
  gameStatus:   string;
}

export function Level({ level, playerPosRef, onCollect, onPlayerHit, onWin, gameStatus }: Props) {
  return (
    <>
      {level.platforms.map(p => <Platform key={p.id} data={p} />)}

      {level.collectibles.map(c => (
        <Collectible
          key={c.id}
          data={c}
          playerPosRef={playerPosRef}
          onCollect={onCollect}
        />
      ))}

      {level.enemies.map(e => (
        <Enemy
          key={e.id}
          data={e}
          playerPosRef={playerPosRef}
          onPlayerHit={onPlayerHit}
          gameStatus={gameStatus}
        />
      ))}

      <Goal
        position={level.goalPosition}
        playerPosRef={playerPosRef}
        onWin={onWin}
        gameStatus={gameStatus}
      />
    </>
  );
}
