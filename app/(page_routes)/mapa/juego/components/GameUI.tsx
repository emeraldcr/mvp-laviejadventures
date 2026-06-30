'use client';
import * as THREE from 'three';
import type { GameState, LevelData } from '../types';
import { TrailMiniMap } from './TrailMiniMap';

interface Props {
  state: GameState;
  level: LevelData;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onRestart: () => void;
  onEnterLevel: (levelIndex: number) => void;
  onResetAdventure: () => void;
}

export function GameUI({ state, level, playerPosRef, onRestart, onEnterLevel, onResetAdventure }: Props) {
  const { lives, score, crystals, totalCrystals, status } = state;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        fontFamily: '"Courier New", monospace',
      }}
    >
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ fontSize: 22, opacity: i < lives ? 1 : 0.2, filter: i < lives ? 'drop-shadow(0 0 6px #4fc3f7)' : 'none' }}>
              👻
            </span>
          ))}
        </div>
        <div style={{ color: '#00e676', fontSize: 13, textShadow: '0 0 8px #00e67699' }}>
          💎 {crystals} / {totalCrystals}
        </div>
        <div style={{ color: '#ffd700', fontSize: 13, textShadow: '0 0 8px #ffd70099' }}>
          ⭐ {score.toString().padStart(5, '0')}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div style={{ color: '#4fc3f7', fontSize: 11, letterSpacing: 3, textShadow: '0 0 12px #4fc3f7' }}>
          FANTASMA DE LA CIUDAD ESMERALDA
        </div>
        <div style={{ color: '#ffffff78', fontSize: 10, marginTop: 4 }}>
          {level.title}
        </div>
      </div>

      {status === 'playing' || status === 'dead' ? (
        <TrailMiniMap state={state} level={level} playerPosRef={playerPosRef} />
      ) : null}

      {status === 'playing' ? (
        <div style={{ position: 'absolute', bottom: 14, right: 14, color: '#ffffff40', fontSize: 10, textAlign: 'right', lineHeight: 1.6 }}>
          ← → / A D - mover<br />
          ESPACIO / ↑ - saltar<br />
          Manten ESPACIO en aire - planear
        </div>
      ) : null}

      {(status === 'map' || status === 'complete') && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: 16,
          background: 'radial-gradient(circle at 50% 35%, rgba(0, 80, 52, 0.28), rgba(5, 12, 16, 0.94) 62%)',
        }}>
          <TrailMiniMap state={state} level={level} variant="full" onEnterLevel={onEnterLevel} />
          {status === 'complete' ? (
            <button onClick={onResetAdventure} style={btnStyle('#00e676')}>REINICIAR AVENTURA</button>
          ) : null}
        </div>
      )}

      {status === 'dead' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5,0,15,0.72)',
        }}>
          <p style={{ color: '#ff4444', fontSize: 30, margin: 0, textShadow: '0 0 24px #ff4444' }}>
            Caíste al Rio La Vieja
          </p>
          <p style={{ color: '#888', fontSize: 13, marginTop: 10 }}>Reapareciendo...</p>
        </div>
      )}

      {status === 'gameover' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'rgba(5,0,15,0.88)',
        }}>
          <p style={{ color: '#ff4444', fontSize: 36, margin: 0, textShadow: '0 0 30px #ff4444' }}>
            FIN DEL JUEGO
          </p>
          <p style={{ color: '#ffd700', fontSize: 16, margin: 0 }}>
            💎 {crystals}/{totalCrystals} cristales · ⭐ {score} pts
          </p>
          <button onClick={onRestart} style={btnStyle('#ff4444')}>REINTENTAR TRAMO</button>
        </div>
      )}

      {status === 'win' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'rgba(0,15,8,0.88)',
        }}>
          <p style={{ color: '#00e676', fontSize: 32, margin: 0, textShadow: '0 0 30px #00e676', letterSpacing: 2 }}>
            NIVEL COMPLETO
          </p>
          <p style={{ color: '#ffd700', fontSize: 16, margin: 0 }}>
            💎 {crystals}/{totalCrystals} cristales · ⭐ {score} pts
          </p>
          <button onClick={onRestart} style={btnStyle('#00e676')}>SEGUIR</button>
        </div>
      )}
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    marginTop: 8,
    padding: '10px 36px',
    background: color,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontFamily: '"Courier New", monospace',
    fontSize: 15,
    cursor: 'pointer',
    letterSpacing: 1,
    boxShadow: `0 0 24px ${color}88`,
  };
}
