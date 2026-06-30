'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { GameState, LevelData, TrailStation } from '../types';
import { GAME_LEVELS, TRAIL_CONNECTIONS, TRAIL_STATIONS } from '../data/levelData';

interface Props {
  state: GameState;
  level: LevelData;
  playerPosRef?: React.MutableRefObject<THREE.Vector3>;
  variant?: 'mini' | 'full';
  onEnterLevel?: (levelIndex: number) => void;
}

export function TrailMiniMap({ state, level, playerPosRef, variant = 'mini', onEnterLevel }: Props) {
  const ghostRef = useRef<SVGGElement>(null);
  const isFull = variant === 'full';
  const activeStationIndex = Math.min(
    state.status === 'complete' ? state.unlockedStationIndex : state.currentLevelIndex,
    TRAIL_STATIONS.length - 1,
  );
  const activeStation = TRAIL_STATIONS[activeStationIndex];
  const nextStation = TRAIL_STATIONS[Math.min(activeStationIndex + 1, TRAIL_STATIONS.length - 1)];
  const canEnter = state.currentLevelIndex <= state.unlockedStationIndex && state.currentLevelIndex < GAME_LEVELS.length;

  const ghostPoint = useMemo(() => {
    if (!activeStation || !nextStation) return activeStation ?? TRAIL_STATIONS[0];
    return state.status === 'complete' ? activeStation : activeStation;
  }, [activeStation, nextStation, state.status]);

  useEffect(() => {
    const ghost = ghostRef.current;
    if (!ghost || !activeStation || !nextStation) return;

    if (!playerPosRef || state.status !== 'playing') {
      const point = state.status === 'complete' ? activeStation : activeStation;
      ghost.setAttribute('transform', `translate(${point.x} ${point.y})`);
      return;
    }

    let frame = 0;
    let lastProgress = -1;
    const tick = () => {
      const span = level.goalPosition[0] - level.spawnPosition[0];
      const raw = span === 0 ? 0 : (playerPosRef.current.x - level.spawnPosition[0]) / span;
      const progress = Math.max(0, Math.min(1, raw));

      if (Math.abs(progress - lastProgress) > 0.006) {
        lastProgress = progress;
        const x = activeStation.x + (nextStation.x - activeStation.x) * progress;
        const y = activeStation.y + (nextStation.y - activeStation.y) * progress;
        ghost.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      }

      frame = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frame);
  }, [activeStation, level.goalPosition, level.spawnPosition, nextStation, playerPosRef, state.status]);

  return (
    <div style={isFull ? fullWrapStyle : miniWrapStyle}>
      <div style={isFull ? fullHeaderStyle : miniHeaderStyle}>
        <span>{isFull ? 'Mapa del sendero' : 'Sendero'}</span>
        <strong>{activeStation?.shortName ?? 'Inicio'}</strong>
      </div>

      <svg viewBox="0 0 100 100" style={isFull ? fullSvgStyle : miniSvgStyle} aria-hidden="true">
        <rect x="3" y="6" width="94" height="88" rx="4" fill="#092319" stroke="#1f7a4d" strokeWidth="1.4" />
        <path d="M8 72 C25 54 35 71 50 48 S75 26 93 43" fill="none" stroke="#0f5132" strokeWidth="8" opacity="0.45" />
        <path d="M10 78 C24 64 37 70 50 58 S74 50 90 76" fill="none" stroke="#0e7490" strokeWidth="5" opacity="0.42" />

        {TRAIL_CONNECTIONS.map((connection) => {
          const from = getStation(connection.from);
          const to = getStation(connection.to);
          const isUnlocked =
            stationIndex(connection.from) <= state.unlockedStationIndex &&
            stationIndex(connection.to) <= state.unlockedStationIndex + 1;

          return (
            <line
              key={`${connection.from}-${connection.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isUnlocked ? '#d8a84f' : '#6b5a38'}
              strokeWidth={connection.kind === 'main' ? 2.8 : 1.6}
              strokeLinecap="round"
              strokeDasharray={connection.kind === 'alt' ? '4 3' : undefined}
              opacity={isUnlocked ? 0.95 : 0.35}
            />
          );
        })}

        {TRAIL_STATIONS.map((station, index) => {
          const isUnlocked = index <= state.unlockedStationIndex;
          const isCurrent = index === activeStationIndex;

          return (
            <g key={station.id}>
              <circle
                cx={station.x}
                cy={station.y}
                r={isFull ? 3.8 : 3}
                fill={isUnlocked ? (isCurrent ? '#00e676' : '#ffd166') : '#33443d'}
                stroke={isCurrent ? '#eafff4' : '#0a130f'}
                strokeWidth="1.2"
              />
              {isFull ? (
                <text x={station.x} y={station.y - 6} textAnchor="middle" fill="#f4fff8" fontSize="3.4" fontWeight="700">
                  {station.shortName}
                </text>
              ) : null}
            </g>
          );
        })}

        {state.status === 'playing' || state.status === 'map' || state.status === 'complete' ? (
          <g ref={ghostRef} transform={`translate(${ghostPoint.x} ${ghostPoint.y})`}>
            <circle r={isFull ? 3.4 : 2.8} fill="#d4f0ff" opacity="0.95" />
            <circle cx="-0.9" cy="-0.4" r="0.35" fill="#001e3c" />
            <circle cx="0.9" cy="-0.4" r="0.35" fill="#001e3c" />
          </g>
        ) : null}
      </svg>

      {isFull ? (
        <div style={fullBodyStyle}>
          <p style={stationTextStyle}>{activeStation?.description}</p>
          <p style={routeTextStyle}>{level.title}</p>
          <p style={hintTextStyle}>{level.subtitle}</p>
          {state.status === 'complete' ? (
            <p style={completeTextStyle}>Aventura completada. El fantasma llego al rio, pura vida.</p>
          ) : (
            <button
              type="button"
              onClick={() => canEnter && onEnterLevel?.(state.currentLevelIndex)}
              disabled={!canEnter}
              style={canEnter ? enterButtonStyle : disabledButtonStyle}
            >
              ENTRAR AL TRAMO
            </button>
          )}
        </div>
      ) : (
        <div style={miniFooterStyle}>{level.title}</div>
      )}
    </div>
  );
}

function getStation(id: string): TrailStation {
  return TRAIL_STATIONS.find((station) => station.id === id) ?? TRAIL_STATIONS[0];
}

function stationIndex(id: string): number {
  return TRAIL_STATIONS.findIndex((station) => station.id === id);
}

const miniWrapStyle: React.CSSProperties = {
  position: 'absolute',
  top: 48,
  right: 16,
  width: 210,
  padding: 10,
  borderRadius: 8,
  background: 'rgba(5, 18, 15, 0.78)',
  border: '1px solid rgba(0, 230, 118, 0.35)',
  boxShadow: '0 0 24px rgba(0, 230, 118, 0.12)',
  color: '#eafff4',
};

const fullWrapStyle: React.CSSProperties = {
  width: 'min(720px, calc(100vw - 32px))',
  padding: 18,
  borderRadius: 8,
  background: 'rgba(4, 17, 14, 0.94)',
  border: '1px solid rgba(0, 230, 118, 0.45)',
  boxShadow: '0 0 38px rgba(0, 230, 118, 0.18)',
  color: '#eafff4',
};

const miniHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  color: '#8ff7c1',
  fontSize: 10,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
};

const fullHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  color: '#8ff7c1',
  fontSize: 15,
  letterSpacing: 1.6,
  textTransform: 'uppercase',
};

const miniSvgStyle: React.CSSProperties = { width: '100%', height: 118, display: 'block', marginTop: 8 };
const fullSvgStyle: React.CSSProperties = { width: '100%', height: 'min(48vh, 350px)', display: 'block', marginTop: 12 };

const miniFooterStyle: React.CSSProperties = {
  color: '#ffffffa8',
  fontSize: 9,
  lineHeight: 1.35,
  marginTop: 4,
};

const fullBodyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  textAlign: 'center',
};

const stationTextStyle: React.CSSProperties = { margin: '6px 0 0', color: '#f4fff8', fontSize: 16, lineHeight: 1.45 };
const routeTextStyle: React.CSSProperties = { margin: 0, color: '#ffd166', fontSize: 14, fontWeight: 700 };
const hintTextStyle: React.CSSProperties = { margin: 0, color: '#a7bdb2', fontSize: 12, lineHeight: 1.45 };
const completeTextStyle: React.CSSProperties = { margin: '8px 0 0', color: '#00e676', fontSize: 16, fontWeight: 700 };

const enterButtonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: '11px 34px',
  background: '#00c853',
  color: '#04110e',
  border: 'none',
  borderRadius: 8,
  fontFamily: '"Courier New", monospace',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: 1,
  boxShadow: '0 0 24px rgba(0, 230, 118, 0.35)',
};

const disabledButtonStyle: React.CSSProperties = {
  ...enterButtonStyle,
  background: '#33443d',
  color: '#8fa69a',
  cursor: 'not-allowed',
  boxShadow: 'none',
};
