'use client';
import { memo } from 'react';
import * as THREE from 'three';
import { Platform }    from './Platform';
import { Collectible } from './Collectible';
import { Enemy }       from './Enemy';
import { Goal }        from './Goal';
import { PowerUp }     from './PowerUp';
import type { LevelData, PowerUpKind, BulletState } from '../types';

interface Props {
  level: LevelData;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onCollect:    (id: string) => void;
  onPlayerHit:  () => void;
  onWin:        () => void;
  gameStatus:   string;
  bulletsRef:        React.MutableRefObject<BulletState[]>;
  pendingPowerUpRef: React.MutableRefObject<PowerUpKind | null>;
}

export const Level = memo(function Level({
  level, playerPosRef, onCollect, onPlayerHit, onWin, gameStatus,
  bulletsRef, pendingPowerUpRef,
}: Props) {
  return (
    <>
      {level.platforms.map(p => <Platform key={p.id} data={p} />)}

      {level.collectibles.map(c => (
        <Collectible key={c.id} data={c} playerPosRef={playerPosRef} onCollect={onCollect} />
      ))}

      {level.powerUps.map(pu => (
        <PowerUp key={pu.id} data={pu} playerPosRef={playerPosRef} pendingPowerUpRef={pendingPowerUpRef} />
      ))}

      {level.enemies.map(e => (
        <Enemy
          key={e.id}
          data={e}
          playerPosRef={playerPosRef}
          onPlayerHit={onPlayerHit}
          gameStatus={gameStatus}
          bulletsRef={bulletsRef}
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
});
