'use client';
import { useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { TrailMiniMap } from '../TrailMiniMap/TrailMiniMap';
import { CenteredOverlay } from './CenteredOverlay';
import { FALL_MESSAGES, ENEMY_MESSAGES, FALL_GAMEOVER, ENEMY_GAMEOVER } from '../../constants/messages';
import {
  rootStyle, hudStyle, titleStyle, helpStyle, mapOverlayStyle, dashboardStyle, panelStyle,
  eyebrowStyle, panelTitleStyle, mutedTextStyle, inputStyle, smallBtnStyle, rankNameStyle,
  rankRowStyle, btnStyle,
} from './styles';

export function GameUI() {
  const {
    state, level, leaderboard, activePowerUps,
    registerPlayer, clearPlayer, restart, enterLevel, resetAdventure,
  } = useGameContext();
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
    registerPlayer(nameInput);
  };

  const guardedEnterLevel = (levelIndex: number) => {
    if (!canPlay) return;
    enterLevel(levelIndex);
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
          ⚪ {crystals} / {totalCrystals}
        </div>
        <div style={{ color: '#ffd700', fontSize: 13, textShadow: '0 0 8px #ffd70099' }}>
          ⭐ {score.toString().padStart(5, '0')}
        </div>
        {playerName ? (
          <div style={{ color: '#ffffff80', fontSize: 11 }}>
            {playerName} · ⚪ {lifetimeCrystals}
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
            }}>🔵 ZAFIRO — CONTROL: DISPARAR</div>
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
        <TrailMiniMap />
      ) : null}

      {status === 'playing' ? (
        <div style={helpStyle}>
          ← → / A D — mover<br />
          ESPACIO / ↑ — saltar · planear<br />
          {activePowerUps.sapphire
            ? <span style={{ color: '#90caf9' }}>🔵 CONTROL — disparar zafiro</span>
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
                    Perlas secretas: <b>{lifetimeCrystals}</b><br />
                    Puntaje actual: <b>{score}</b>
                  </p>
                  <button onClick={clearPlayer} style={{ ...smallBtnStyle, marginTop: 14 }}>
                    CAMBIAR NOMBRE
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmitName}>
                  <h2 style={panelTitleStyle}>Ponga su nombre</h2>
                  <p style={{ ...mutedTextStyle, marginBottom: 12 }}>
                    Así guardamos quién encuentra más esmeraldas secretas.
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

            <TrailMiniMap variant="full" onEnterLevel={guardedEnterLevel} />

            <section style={panelStyle}>
              <p style={eyebrowStyle}>Ranking</p>
              <h2 style={panelTitleStyle}>💎 Más esmeraldas</h2>
              {leaderboard.length ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {leaderboard.slice(0, 6).map((entry, index) => (
                    <div key={entry.name} style={rankRowStyle(index === 0)}>
                      <b style={{ color: index === 0 ? '#00e676' : '#ffffff7a' }}>{index + 1}</b>
                      <span style={rankNameStyle}>{entry.name}</span>
                      <span style={{ color: '#b9f7ff', fontWeight: 900 }}>⚪ {entry.crystals}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={mutedTextStyle}>
                  Todavía no hay jugadores. Sea el primero en encontrar esmeraldas secretas, mae.
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
            <button onClick={resetAdventure} style={btnStyle('#00e676')}>REINICIAR AVENTURA</button>
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
            💎 {crystals}/{totalCrystals} · ⭐ {score} pts
          </p>
          <button onClick={restart} style={btnStyle('#ff4444')}>REINTENTAR TRAMO</button>
        </CenteredOverlay>
      )}

      {status === 'win' && (
        <CenteredOverlay background="rgba(0,15,8,0.88)" pointer>
          <p style={{ color: '#00e676', fontSize: 32, margin: 0, textShadow: '0 0 30px #00e676', letterSpacing: 2 }}>
            NIVEL COMPLETO
          </p>
          <p style={{ color: '#ffd700', fontSize: 16, margin: 0 }}>
            💎 {crystals}/{totalCrystals} · ⭐ {score} pts
          </p>
          <button onClick={restart} style={btnStyle('#00e676')}>SEGUIR</button>
        </CenteredOverlay>
      )}
    </div>
  );
}
