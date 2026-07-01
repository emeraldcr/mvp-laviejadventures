'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { GAME_LEVELS } from '../../data/levelData';
import { TRAIL_STATIONS, TRAIL_CONNECTIONS } from '../../data/stations';
import { getStation, stationIndex, buildTrailPath } from '../../lib/trail';
import { DEV_UNLOCK_ALL_LEVELS } from '../../constants/storage';
import {
  miniWrapStyle, fullWrapStyle, miniHeaderStyle, fullHeaderStyle, miniSvgStyle, fullSvgStyle,
  miniFooterStyle, fullBodyStyle, stationDescStyle, routeTextStyle, hintTextStyle,
  completeTextStyle, devStyle, stageGridStyle, stageButtonStyle,
} from './styles';

interface Props {
  variant?: 'mini' | 'full';
  onEnterLevel?: (levelIndex: number) => void;
}

const TRAIL_PATH = buildTrailPath();

export function TrailMiniMap({ variant = 'mini', onEnterLevel }: Props) {
  const { state, level, playerPosRef, enterLevel } = useGameContext();
  const handleEnterLevel = onEnterLevel ?? enterLevel;
  const ghostRef = useRef<SVGCircleElement>(null);
  const isFull = variant === 'full';
  const levelStationIndex = Math.max(0, stationIndex(level.stationId));
  const activeStationIndex = Math.min(
    state.status === 'complete' ? state.unlockedStationIndex : levelStationIndex,
    TRAIL_STATIONS.length - 1,
  );
  const activeStation = TRAIL_STATIONS[activeStationIndex];
  const nextStation = level.nextStationId
    ? getStation(level.nextStationId)
    : TRAIL_STATIONS[Math.min(activeStationIndex + 1, TRAIL_STATIONS.length - 1)];
  const unlockedStationIndex = DEV_UNLOCK_ALL_LEVELS ? GAME_LEVELS.length : state.unlockedStationIndex;

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const ghostStart = useMemo(() => activeStation ?? TRAIL_STATIONS[0], [activeStation]);

  // Animate ghost position along trail in useEffect (rAF loop)
  useEffect(() => {
    const el = ghostRef.current;
    if (!el || !activeStation || !nextStation) return;

    if (!playerPosRef || state.status !== 'playing') {
      el.setAttribute('cx', String(activeStation.x));
      el.setAttribute('cy', String(activeStation.y));
      return;
    }

    let frame = 0;
    let lastProgress = -1;
    const tick = () => {
      const dx = level.goalPosition[0] - level.spawnPosition[0];
      const dy = level.goalPosition[1] - level.spawnPosition[1];
      const lenSq = dx * dx + dy * dy;
      const raw = lenSq === 0
        ? 0
        : ((playerPosRef.current.x - level.spawnPosition[0]) * dx +
           (playerPosRef.current.y - level.spawnPosition[1]) * dy) / lenSq;
      const progress = Math.max(0, Math.min(1, raw));
      if (Math.abs(progress - lastProgress) > 0.006) {
        lastProgress = progress;
        const x = activeStation.x + (nextStation.x - activeStation.x) * progress;
        const y = activeStation.y + (nextStation.y - activeStation.y) * progress;
        el.setAttribute('cx', x.toFixed(2));
        el.setAttribute('cy', y.toFixed(2));
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [activeStation, level.goalPosition, level.spawnPosition, nextStation, playerPosRef, state.status]);

  const handleStationClick = (index: number) => {
    if (!isFull) return;
    const isUnlocked = index <= unlockedStationIndex;
    if (isUnlocked) handleEnterLevel(index);
  };

  return (
    <div style={isFull ? fullWrapStyle : miniWrapStyle}>
      <div style={isFull ? fullHeaderStyle : miniHeaderStyle}>
        <span style={{ opacity: 0.7 }}>{isFull ? 'Mapa del sendero' : 'Sendero'}</span>
        <strong style={{ color: '#00e676' }}>{activeStation?.shortName ?? 'Inicio'}</strong>
      </div>

      <svg
        viewBox="0 0 100 100"
        style={isFull ? fullSvgStyle : miniSvgStyle}
        aria-label="Mapa del sendero"
      >
        {/* ── Background ── */}
        <rect x="0" y="0" width="100" height="100" rx="5" fill="#071510" />

        {/* ── Terrain blobs (zones) ── */}
        <ellipse cx="44" cy="18" rx="28" ry="16" fill="#0d2218" opacity="0.9" />
        <ellipse cx="18" cy="38" rx="18" ry="14" fill="#0a1e14" opacity="0.9" />
        <ellipse cx="54" cy="46" rx="24" ry="16" fill="#0f2016" opacity="0.9" />
        <ellipse cx="78" cy="66" rx="16" ry="14" fill="#0c1e28" opacity="0.9" />
        <ellipse cx="46" cy="84" rx="20" ry="12" fill="#091c24" opacity="0.9" />

        {/* ── River at bottom ── */}
        <path
          d="M10 92 C22 88 38 90 46 86 C54 82 68 88 88 84"
          fill="none" stroke="#0e7490" strokeWidth="3.5" opacity="0.55" strokeLinecap="round"
        />
        <path
          d="M10 94 C22 90 38 92 46 88 C54 84 68 90 88 86"
          fill="none" stroke="#0e7490" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"
        />

        {/* ── Forest patches (decorative) ── */}
        <circle cx="8" cy="22" r="3.5" fill="#0f3020" opacity="0.6" />
        <circle cx="14" cy="18" r="2.5" fill="#0f3020" opacity="0.5" />
        <circle cx="72" cy="30" r="3" fill="#0f3020" opacity="0.5" />
        <circle cx="82" cy="38" r="2.5" fill="#0f3020" opacity="0.45" />
        <circle cx="30" cy="58" r="3" fill="#0f3020" opacity="0.45" />
        <circle cx="60" cy="72" r="2.5" fill="#0f3020" opacity="0.4" />

        {/* ── Trail connections (locked / unlocked) ── */}
        {TRAIL_CONNECTIONS.map((conn) => {
          const from = getStation(conn.from);
          const to = getStation(conn.to);
          const fromIdx = stationIndex(conn.from);
          const isUnlocked = fromIdx <= unlockedStationIndex;
          return (
            <line
              key={`${conn.from}-${conn.to}`}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isUnlocked ? '#c8922a' : '#3d3018'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray={isUnlocked ? undefined : '3.5 2.5'}
              opacity={isUnlocked ? 0.9 : 0.4}
            />
          );
        })}

        {/* ── Smooth trail path (decorative underlay) ── */}
        <path
          d={TRAIL_PATH}
          fill="none"
          stroke="#8b6a2a"
          strokeWidth="1"
          opacity="0.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Station zones (clickable hit areas in full mode) ── */}
        {isFull && TRAIL_STATIONS.map((station, index) => {
          const isUnlocked = index <= unlockedStationIndex;
          const isCurrent = index === activeStationIndex;
          const isHovered = hoveredIdx === index;
          return (
            <circle
              key={`zone-${station.id}`}
              cx={station.x}
              cy={station.y}
              r={12}
              fill={isHovered && isUnlocked ? 'rgba(0,230,118,0.12)' : 'transparent'}
              stroke={isCurrent ? 'rgba(0,230,118,0.3)' : isUnlocked && isHovered ? 'rgba(0,230,118,0.2)' : 'none'}
              strokeWidth="1"
              style={{ cursor: isUnlocked ? 'pointer' : 'default', transition: 'fill 0.15s' }}
              onClick={() => handleStationClick(index)}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}

        {/* ── Station nodes ── */}
        {TRAIL_STATIONS.map((station, index) => {
          const isUnlocked = index <= unlockedStationIndex;
          const isCurrent = index === activeStationIndex;
          const isHovered = hoveredIdx === index && isFull;
          const nodeR = isFull ? 3.6 : 2.8;
          return (
            <g
              key={station.id}
              style={{ cursor: isFull && isUnlocked ? 'pointer' : 'default' }}
              onClick={() => handleStationClick(index)}
              onMouseEnter={() => isFull && setHoveredIdx(index)}
              onMouseLeave={() => isFull && setHoveredIdx(null)}
            >
              {/* Glow ring for current */}
              {isCurrent && (
                <circle cx={station.x} cy={station.y} r={nodeR + 3}
                  fill="none" stroke="#00e676" strokeWidth="0.8" opacity="0.4" />
              )}
              {/* Main node */}
              <circle
                cx={station.x} cy={station.y} r={nodeR}
                fill={
                  !isUnlocked ? '#2a3830' :
                  isCurrent ? '#00e676' :
                  isHovered ? '#80ffb8' :
                  '#ffd166'
                }
                stroke={isCurrent ? '#eafff4' : isUnlocked ? '#a08040' : '#1a2820'}
                strokeWidth="1"
              />
              {/* Lock icon for locked */}
              {!isUnlocked && (
                <text x={station.x} y={station.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill="#4a6050" fontSize="3" fontWeight="bold">🔒</text>
              )}
              {/* Labels in full mode */}
              {isFull && (
                <>
                  <text
                    x={station.x}
                    y={station.y - (nodeR + 3.5)}
                    textAnchor="middle"
                    fill={isUnlocked ? (isCurrent ? '#00e676' : isHovered ? '#c0ffd8' : '#e8d090') : '#4a6050'}
                    fontSize={isCurrent ? '3.8' : '3.2'}
                    fontWeight={isCurrent ? '900' : '700'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {station.shortName}
                  </text>
                  {isUnlocked && isHovered && (
                    <text
                      x={station.x}
                      y={station.y + nodeR + 5}
                      textAnchor="middle"
                      fill="#00e676"
                      fontSize="2.8"
                      fontWeight="700"
                      style={{ pointerEvents: 'none' }}
                    >
                      ▶ JUGAR
                    </text>
                  )}
                </>
              )}
              {/* Mini mode: just number */}
              {!isFull && isUnlocked && (
                <text x={station.x} y={station.y + 0.9} textAnchor="middle" dominantBaseline="middle"
                  fill={isCurrent ? '#04110e' : '#04110e'} fontSize="2.2" fontWeight="900"
                  style={{ pointerEvents: 'none' }}>
                  {index + 1}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Ghost position ── */}
        {(state.status === 'playing' || state.status === 'map' || state.status === 'complete') && (
          <g>
            <circle
              ref={ghostRef}
              cx={ghostStart.x} cy={ghostStart.y}
              r={isFull ? 3.2 : 2.6}
              fill="#d4f0ff"
              opacity="0.95"
              style={{ filter: 'drop-shadow(0 0 2px #4fc3f7)' }}
            />
            {/* Ghost eyes (relative, decorative) */}
          </g>
        )}

        {/* ── "You are here" indicator in mini ── */}
        {!isFull && (
          <text x="50" y="97" textAnchor="middle" fill="#ffffff30" fontSize="3.2">
            {activeStation?.shortName ?? ''}
          </text>
        )}
      </svg>

      {/* ── Full mode body ── */}
      {isFull ? (
        <div style={fullBodyStyle}>
          <p style={stationDescStyle}>{activeStation?.description}</p>
          <p style={routeTextStyle}>{level.title}</p>
          <p style={hintTextStyle}>{level.subtitle}</p>

          {/* Stage buttons */}
          <div style={stageGridStyle}>
            {GAME_LEVELS.map((gl, index) => {
              const isUnlocked = DEV_UNLOCK_ALL_LEVELS || index <= unlockedStationIndex;
              const isCurrent = index === activeStationIndex;
              const st = TRAIL_STATIONS[index];
              return (
                <button
                  key={gl.id}
                  type="button"
                  onClick={() => isUnlocked && handleEnterLevel(index)}
                  disabled={!isUnlocked}
                  style={stageButtonStyle(isCurrent, isUnlocked)}
                  title={gl.title}
                >
                  <span style={{ fontSize: 16 }}>
                    {!isUnlocked ? '🔒' : isCurrent ? '👻' : '✓'}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isUnlocked ? '#e8d090' : '#4a6050' }}>
                    {st?.shortName ?? `Zona ${index + 1}`}
                  </span>
                </button>
              );
            })}
          </div>

          {state.status === 'complete' ? (
            <p style={completeTextStyle}>¡Aventura completada! El fantasma llegó al río. Pura vida 🌿</p>
          ) : null}

          {DEV_UNLOCK_ALL_LEVELS && (
            <p style={devStyle}>DEV: todos los tramos desbloqueados</p>
          )}
        </div>
      ) : (
        <div style={miniFooterStyle}>{level.title}</div>
      )}
    </div>
  );
}
