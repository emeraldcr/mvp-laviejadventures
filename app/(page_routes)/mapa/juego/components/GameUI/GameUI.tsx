'use client';
import { useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { TrailMiniMap } from '../TrailMiniMap/TrailMiniMap';
import { Hud } from './Hud';
import { MapOverlay } from './MapOverlay';
import { PowerUpBadges } from './PowerUpBadges';
import { StatusOverlays } from './StatusOverlays';
import { rootStyle } from './styles';

export function GameUI() {
  const {
    state, level, leaderboard, activePowerUps,
    registerPlayer, clearPlayer, restart, enterLevel, resetAdventure,
  } = useGameContext();
  const [nameInput, setNameInput] = useState(state.playerName ?? '');
  const canPlay = Boolean(state.playerName);

  return (
    <div style={rootStyle}>
      <Hud activePowerUps={activePowerUps} levelTitle={level.title} state={state} />
      <PowerUpBadges activePowerUps={activePowerUps} />

      {state.status === 'playing' || state.status === 'dead' ? (
        <TrailMiniMap />
      ) : null}

      {(state.status === 'map' || state.status === 'complete') && (
        <MapOverlay
          canPlay={canPlay}
          clearPlayer={clearPlayer}
          enterLevel={enterLevel}
          leaderboard={leaderboard}
          nameInput={nameInput}
          registerPlayer={registerPlayer}
          resetAdventure={resetAdventure}
          setNameInput={setNameInput}
          state={state}
        />
      )}

      <StatusOverlays restart={restart} state={state} />
    </div>
  );
}
