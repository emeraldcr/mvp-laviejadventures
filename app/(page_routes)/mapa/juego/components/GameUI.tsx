'use client';

import { useState } from 'react';
import * as THREE from 'three';
import type { GameState, LeaderboardEntry, LevelData } from '../types';
import { TrailMiniMap } from './TrailMiniMap';

const FALL_MESSAGES = [
  '¡Caíste al Río La Vieja! 🌊',
  '¡Las aguas del cañón te jalaron! 💧',
  '¡Perdiste el balance en el sendero! 🌿',
  '¡El río no perdona, mae! 🌊',
];

const ENEMY_MESSAGES = [
  '¡El murciélago te bloqueó el camino! 🦇',
  '¡Las criaturas del cañón te alcanzaron! 🦇',
  '¡Te agarró el bicho del bosque! 🌿',
  '¡Cuidado con los bichos voladores! 🦇',
];

const FALL_GAMEOVER = [
  '¡El río ganó esta vez! 🌊',
  '¡No lograste cruzar el cañón! 🌿',
  '¡Las aguas del La Vieja te vencieron! 💧',
  '¡El sendero no fue amable hoy! 🌊',
];

const ENEMY_GAMEOVER = [
  '¡Los murciélagos te derrotaron! 🦇',
  '¡Las criaturas del bosque te vencieron! 🌿',
  '¡Los bichos del cañón son muy fuertes! 🦇',
  '¡No pudiste con los guardianes del sendero! 🌿',
];

interface Props {
  state: GameState;
  level: LevelData;
  leaderboard: LeaderboardEntry[];
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  activePowerUps: { ruby: boolean; sapphire: boolean };
  onRegisterPlayer: (name: string) => void;
  onClearPlayer: () => void;
  onRestart: () => void;
  onEnterLevel: (levelIndex: number) => void;
  onResetAdventure: () => void;
}

export function GameUI({
  state,
  level,
  leaderboard,
  playerPosRef,
  activePowerUps,
  onRegisterPlayer,
  onClearPlayer,
  onRestart,
  onEnterLevel,
  onResetAdventure,
}: Props) {
  const { lives, score, crystals, lifetimeCrystals, totalCrystals, status, playerName, deathCause, deathMessageIdx } = state;
  const [nameInput, setNameInput] = useState(playerName ?? '');

  const deadMsg = deathCause === 'enemy'
    ? ENEMY_MESSAGES[deathMessageIdx % ENEMY_MESSAGES.length]
    : FALL_MESSAGES[deathMessageIdx % FALL_MESSAGES.length];

  const gameoverSubMsg = deathCause === 'enemy'
    ? ENEMY_GAMEOVER[deathMessageIdx % ENEMY_GAMEOVER.length]
    : FALL_GAMEOVER[deathMessageIdx % FALL_GAMEOVER.length];
  const canPlay = Boolean(playerName);

  const handleSubmitName = (event: React.FormEvent) => {
    event.preventDefault();
    onRegisterPlayer(nameInput);
  };

  const guardedEnterLevel = (levelIndex: number) => {
    if (!canPlay) return;
    onEnterLevel(levelIndex);
  };

  return (
    <div style={rootStyle}>
      <div style={hudStyle}>
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
        {playerName ? (
          <div style={{ color: '#ffffff80', fontSize: 11 }}>
            {playerName} · 💎 {lifetimeCrystals}
          </div>
        ) : null}
      </div>

      {/* ── Power-up badges ── */}
      {(activePowerUps.ruby || activePowerUps.sapphire) ? (
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
            }}>🔵 ZAFIRO — ESPACIO: DISPARAR</div>
          )}
        </div>
      ) : (
        <div style={titleStyle}>
          <div style={{ color: '#4fc3f7', fontSize: 11, letterSpacing: 3, textShadow: '0 0 12px #4fc3f7' }}>
            FANTASMA DE LA CIUDAD ESMERALDA
          </div>
          <div style={{ color: '#ffffff78', fontSize: 10, marginTop: 4 }}>
            {level.title}
          </div>
        </div>
      )}

      {status === 'playing' || status === 'dead' ? (
        <TrailMiniMap state={state} level={level} playerPosRef={playerPosRef} />
      ) : null}

      {status === 'playing' ? (
        <div style={helpStyle}>
          ← → / A D — mover<br />
          ESPACIO / ↑ — saltar · planear<br />
          {activePowerUps.sapphire
            ? <span style={{ color: '#90caf9' }}>🔵 ESPACIO — disparar zafiro</span>
            : <span>🔴 Rubí=inmune · 🔵 Zafiro=disparar</span>
          }
        </div>
      ) : null}

      {(status === 'map' || status === 'complete') && (
        <div style={mapOverlayStyle}>
          <div style={dashboardStyle}>
            <section style={panelStyle}>
              <p style={eyebrowStyle}>Jugador</p>
              {playerName ? (
                <>
                  <h2 style={panelTitleStyle}>{playerName}</h2>
                  <p style={mutedTextStyle}>
                    Esmeraldas comidas: <b>{lifetimeCrystals}</b><br />
                    Puntaje actual: <b>{score}</b>
                  </p>
                  <button onClick={onClearPlayer} style={{ ...smallBtnStyle, marginTop: 14 }}>
                    CAMBIAR NOMBRE
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmitName}>
                  <h2 style={panelTitleStyle}>Ponga su nombre</h2>
                  <p style={{ ...mutedTextStyle, marginBottom: 12 }}>
                    Así guardamos quién lleva más esmeraldas comidas.
                  </p>
                  <input
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    maxLength={24}
                    placeholder="Nombre del jugador"
                    style={inputStyle}
                  />
                  <button type="submit" style={{ ...btnStyle('#00e676'), width: '100%', marginTop: 12, padding: '11px 12px' }}>
                    REGISTRAR
                  </button>
                </form>
              )}
            </section>

            <TrailMiniMap state={state} level={level} variant="full" onEnterLevel={guardedEnterLevel} />

            <section style={panelStyle}>
              <p style={eyebrowStyle}>Ranking</p>
              <h2 style={panelTitleStyle}>Más esmeraldas</h2>
              {leaderboard.length ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {leaderboard.slice(0, 6).map((entry, index) => (
                    <div key={entry.name} style={rankRowStyle(index === 0)}>
                      <b style={{ color: index === 0 ? '#00e676' : '#ffffff7a' }}>{index + 1}</b>
                      <span style={rankNameStyle}>{entry.name}</span>
                      <span style={{ color: '#00e676', fontWeight: 900 }}>💎 {entry.crystals}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={mutedTextStyle}>
                  Todavía no hay jugadores. Sea el primero en comerse unas esmeraldas, mae.
                </p>
              )}
            </section>
          </div>

          {!canPlay ? (
            <p style={{ margin: 0, color: '#ffd166', fontSize: 12, textAlign: 'center' }}>
              Registrá un nombre para entrar a los tramos.
            </p>
          ) : null}

          {status === 'complete' ? (
            <button onClick={onResetAdventure} style={btnStyle('#00e676')}>REINICIAR AVENTURA</button>
          ) : null}
        </div>
      )}

      {status === 'dead' && (
        <CenteredOverlay background={deathCause === 'enemy' ? 'rgba(80,0,20,0.75)' : 'rgba(0,10,30,0.75)'}>
          <p style={{ color: '#ff4444', fontSize: 24, margin: 0, textShadow: '0 0 24px #ff4444', textAlign: 'center', padding: '0 24px' }}>
            {deadMsg}
          </p>
          <p style={{ color: '#888', fontSize: 13, marginTop: 10 }}>Reapareciendo...</p>
        </CenteredOverlay>
      )}

      {status === 'gameover' && (
        <CenteredOverlay background="rgba(5,0,15,0.92)" pointer>
          <p style={{ color: '#ff4444', fontSize: 34, margin: 0, textShadow: '0 0 30px #ff4444' }}>
            FIN DEL JUEGO
          </p>
          <p style={{ color: '#ff8a80', fontSize: 15, margin: 0, textAlign: 'center', padding: '0 24px' }}>
            {gameoverSubMsg}
          </p>
          <p style={{ color: '#ffd700', fontSize: 15, margin: 0 }}>
            💎 {crystals}/{totalCrystals} cristales · ⭐ {score} pts
          </p>
          <button onClick={onRestart} style={btnStyle('#ff4444')}>REINTENTAR TRAMO</button>
        </CenteredOverlay>
      )}

      {status === 'win' && (
        <CenteredOverlay background="rgba(0,15,8,0.88)" pointer>
          <p style={{ color: '#00e676', fontSize: 32, margin: 0, textShadow: '0 0 30px #00e676', letterSpacing: 2 }}>
            NIVEL COMPLETO
          </p>
          <p style={{ color: '#ffd700', fontSize: 16, margin: 0 }}>
            💎 {crystals}/{totalCrystals} cristales · ⭐ {score} pts
          </p>
          <button onClick={onRestart} style={btnStyle('#00e676')}>SEGUIR</button>
        </CenteredOverlay>
      )}
    </div>
  );
}

function CenteredOverlay({
  children,
  background,
  pointer = false,
}: {
  children: React.ReactNode;
  background: string;
  pointer?: boolean;
}) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: pointer ? 'auto' : 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background,
    }}>
      {children}
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

const rootStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 10,
  fontFamily: '"Courier New", monospace',
};

const hudStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const titleStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  textAlign: 'center',
};

const helpStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 14,
  right: 14,
  color: '#ffffff40',
  fontSize: 10,
  textAlign: 'right',
  lineHeight: 1.6,
};

const mapOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  padding: 16,
  overflowY: 'auto',
  background: 'radial-gradient(circle at 50% 35%, rgba(0, 80, 52, 0.28), rgba(5, 12, 16, 0.94) 62%)',
};

const dashboardStyle: React.CSSProperties = {
  width: 'min(1200px, 100%)',
  display: 'grid',
  gridTemplateColumns: 'minmax(220px, 0.8fr) minmax(460px, 1.5fr) minmax(220px, 0.8fr)',
  gap: 14,
  alignItems: 'stretch',
};

const panelStyle: React.CSSProperties = {
  alignSelf: 'center',
  border: '1px solid rgba(0,230,118,0.18)',
  borderRadius: 12,
  background: 'rgba(0, 12, 10, 0.72)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
  padding: 16,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: '#00e676',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 3,
  textTransform: 'uppercase',
};

const panelTitleStyle: React.CSSProperties = {
  margin: '4px 0 8px',
  color: '#fff',
  fontSize: 20,
};

const mutedTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#ffffff8c',
  fontSize: 12,
  lineHeight: 1.5,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(0,230,118,0.35)',
  borderRadius: 8,
  background: 'rgba(0,0,0,0.35)',
  color: '#fff',
  padding: '11px 12px',
  outline: 'none',
  fontFamily: '"Courier New", monospace',
  fontWeight: 700,
};

const smallBtnStyle: React.CSSProperties = {
  border: '1px solid rgba(0,230,118,0.35)',
  borderRadius: 8,
  background: 'rgba(0,230,118,0.10)',
  color: '#00e676',
  padding: '9px 12px',
  cursor: 'pointer',
  fontFamily: '"Courier New", monospace',
  fontWeight: 900,
  fontSize: 11,
  letterSpacing: 1,
};

const rankNameStyle: React.CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: '#fff',
  fontWeight: 800,
};

function rankRowStyle(first: boolean): React.CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: '24px minmax(0,1fr) auto',
    gap: 8,
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 8,
    background: first ? 'rgba(0,230,118,0.16)' : 'rgba(255,255,255,0.045)',
    padding: '8px 9px',
  };
}
