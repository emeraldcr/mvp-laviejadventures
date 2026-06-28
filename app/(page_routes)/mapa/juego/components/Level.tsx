'use client';
import * as THREE from 'three';
import { Platform }    from './Platform';
import { Collectible } from './Collectible';
import { Enemy }       from './Enemy';
import { Goal }        from './Goal';
import { PLATFORMS, COLLECTIBLES, ENEMIES, GOAL_POSITION } from '../data/levelData';

interface Props {
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onCollect:    (id: string) => void;
  onPlayerHit:  () => void;
  onWin:        () => void;
  gameStatus:   string;
}

export function Level({ playerPosRef, onCollect, onPlayerHit, onWin, gameStatus }: Props) {
  return (
    <>
      {PLATFORMS.map(p => <Platform key={p.id} data={p} />)}

      {COLLECTIBLES.map(c => (
        <Collectible
          key={c.id}
          data={c}
          playerPosRef={playerPosRef}
          onCollect={onCollect}
        />
      ))}

      {ENEMIES.map(e => (
        <Enemy
          key={e.id}
          data={e}
          playerPosRef={playerPosRef}
          onPlayerHit={onPlayerHit}
          gameStatus={gameStatus}
        />
      ))}

      <Goal
        position={GOAL_POSITION}
        playerPosRef={playerPosRef}
        onWin={onWin}
        gameStatus={gameStatus}
      />
    </>
  );
}
