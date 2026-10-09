"use client";

import { useEffect, useRef, useState } from "react";
import "./styles.css";

export default function PokerPage() {
  const loadedRef = useRef(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    async function loadGame() {
      try {
        await import("./poker-engine.js");
        await import("./api.js");
        await import("./ui.js");
        await import("./sound.js");
        await import("./app.js");
      } catch (error) {
        console.error("Unable to start the poker table", error);
        setLoadError(true);
      }
    }

    void loadGame();
  }, []);

  return (
    <div id="poker-app">
      <header className="top-bar">
        <div className="brand">
          <span className="logo" aria-hidden="true">♠</span>
          <span className="title">POKER TABLE</span>
        </div>
        <div className="stats" aria-label="Table status">
          <div className="stat"><span className="label">Hand</span><span id="hand-count">1</span></div>
          <div className="stat"><span className="label">Blinds</span><span id="blinds-display">10 / 20</span></div>
          <div className="stat"><span className="label">Pot</span><span id="pot-display">0</span></div>
        </div>
        <div className="controls">
          <span className="connection-status" id="connection-status" data-status="connecting">Connecting…</span>
          <button id="btn-sound" className="btn btn-icon" type="button" aria-label="Mute poker sounds" aria-pressed="false">🔊</button>
          <button id="btn-new-game" className="btn btn-secondary" type="button">New Game</button>
          <button id="btn-settings" className="btn btn-ghost" type="button">Settings</button>
        </div>
      </header>

      <main className="table-container">
        <div className="felt" id="felt">
          <div className="community" id="community" aria-label="Community cards">
            {[0, 1, 2, 3, 4].map((index) => (
              <div className="card-slot" data-idx={index} key={index} />
            ))}
          </div>
          <div className="center-pot">
            <div className="pot-amount" id="center-pot">0</div>
            <div className="street-label" id="street-label">PREFLOP</div>
          </div>
          <div className="seats" id="seats" aria-live="polite" />
        </div>
      </main>

      <footer className="action-bar" id="action-bar">
        <div className="player-info">
          <div className="stack" id="hero-stack">1000</div>
          <div className="to-call" id="to-call">Loading table…</div>
        </div>
        <div className="actions">
          <button className="btn btn-fold" id="btn-fold" type="button" disabled>Fold</button>
          <button className="btn btn-check" id="btn-check" type="button" disabled>Check</button>
          <button className="btn btn-call" id="btn-call" type="button" disabled>Call</button>
          <div className="raise-group">
            <input aria-label="Bet amount" type="range" id="bet-slider" min="0" max="1000" defaultValue="0" disabled />
            <div className="raise-buttons">
              <button className="btn btn-raise" id="btn-raise" type="button" disabled>Raise</button>
              <button className="btn btn-allin" id="btn-allin" type="button" disabled>All-In</button>
            </div>
          </div>
        </div>
        <div className="bet-amount" id="bet-amount">0</div>
      </footer>

      <div className="overlay hidden" id="overlay" role="dialog" aria-modal="true" aria-labelledby="overlay-title">
        <div className="overlay-content">
          <h2 id="overlay-title">Winner!</h2>
          <p id="overlay-msg" />
          <button className="btn btn-primary" id="btn-next-hand" type="button">Next Hand</button>
        </div>
      </div>

      <div className="modal hidden" id="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal-content">
          <h3 id="settings-title">Settings</h3>
          <label>Starting Stack <input type="number" id="set-stack" defaultValue="1000" min="100" step="100" /></label>
          <label>Small Blind <input type="number" id="set-sb" defaultValue="10" min="1" step="1" /></label>
          <label>Big Blind <input type="number" id="set-bb" defaultValue="20" min="2" step="1" /></label>
          <label>Number of Bots <input type="number" id="set-bots" defaultValue="5" min="1" max="5" /></label>
          <div className="modal-actions">
            <button className="btn btn-primary" id="btn-apply-settings" type="button">Apply &amp; Restart</button>
            <button className="btn btn-ghost" id="btn-close-settings" type="button">Close</button>
          </div>
        </div>
      </div>

      {loadError ? (
        <div className="load-error" role="alert">The poker table could not start. Refresh the page to try again.</div>
      ) : null}
    </div>
  );
}
