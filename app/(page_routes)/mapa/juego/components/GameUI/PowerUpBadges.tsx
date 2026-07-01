'use client';
import { memo } from 'react';
import type { ActivePowerUps } from '../../types';

export const PowerUpBadges = memo(function PowerUpBadges({ activePowerUps }: { activePowerUps: ActivePowerUps }) {
  if (!activePowerUps.ruby && !activePowerUps.sapphire) return null;

  return (
    <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
      {activePowerUps.ruby && (
        <div style={{
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(183,28,28,0.88)', border: '1px solid #ff1744',
          color: '#ffcdd2', fontSize: 11, fontWeight: 'bold', letterSpacing: 1,
          textShadow: '0 0 8px #ff1744',
        }}>🔴 RUBÍ — INMUNE</div>
      )}
      {activePowerUps.sapphire && (
        <div style={{
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(13,71,161,0.88)', border: '1px solid #1e88e5',
          color: '#bbdefb', fontSize: 11, fontWeight: 'bold', letterSpacing: 1,
          textShadow: '0 0 8px #1e88e5',
        }}>🔵 ZAFIRO — CONTROL: DISPARAR</div>
      )}
    </div>
  );
});
