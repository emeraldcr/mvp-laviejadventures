'use client';
import type { GameState } from '../types';

interface Props {
  state: GameState;
  onRestart: () => void;
}

export function GameUI({ state, onRestart }: Props) {
  const { lives, score, crystals, totalCrystals, status } = state;

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 10,
        fontFamily: '"Courier New", monospace',
      }}
    >
      {/* HUD top-left */}
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

      {/* Title top-center */}
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div style={{ color: '#4fc3f7', fontSize: 11, letterSpacing: 3, textShadow: '0 0 12px #4fc3f7' }}>
          FANTASMA DE LA CIUDAD ESMERALDA
        </div>
      </div>

      {/* Controls hint bottom-right */}
      <div style={{ position: 'absolute', bottom: 14, right: 14, color: '#ffffff40', fontSize: 10, textAlign: 'right', lineHeight: 1.6 }}>
        ← → / A D — mover<br />
        ESPACIO / ↑ — saltar<br />
        Mantén ESPACIO en aire — planear
      </div>

      {/* Death overlay */}
      {status === 'dead' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5,0,15,0.72)',
        }}>
          <p style={{ color: '#ff4444', fontSize: 30, margin: 0, textShadow: '0 0 24px #ff4444' }}>
            ¡Caíste al Río La Vieja!
          </p>
          <p style={{ color: '#888', fontSize: 13, marginTop: 10 }}>Reapareciendo…</p>
        </div>
      )}

      {/* Game Over */}
      {status === 'gameover' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
          background: 'rgba(5,0,15,0.88)',
        }}>
          <p style={{ color: '#ff4444', fontSize: 36, margin: 0, textShadow: '0 0 30px #ff4444' }}>
            FIN DEL JUEGO
          </p>
          <p style={{ color: '#ffd700', fontSize: 16, margin: 0 }}>
            💎 {crystals}/{totalCrystals} cristales · ⭐ {score} pts
          </p>
          <button onClick={onRestart} style={btnStyle('#ff4444')}>REINTENTAR</button>
        </div>
      )}

      {/* Win */}
      {status === 'win' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
          background: 'rgba(0,15,8,0.88)',
        }}>
          <p style={{ color: '#00e676', fontSize: 32, margin: 0, textShadow: '0 0 30px #00e676', letterSpacing: 2 }}>
            ¡NIVEL COMPLETO!
          </p>
          <p style={{ color: '#ffd700', fontSize: 16, margin: 0 }}>
            💎 {crystals}/{totalCrystals} cristales · ⭐ {score} pts
          </p>
          <button onClick={onRestart} style={btnStyle('#00e676')}>JUGAR DE NUEVO</button>
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
