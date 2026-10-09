/**
 * Main application — wires UI + API + local engine loop
 */

const { PokerAPI, PokerSound, UI } = window;
const api = new PokerAPI();

let currentLegal = [];
let previousState = null;

function getOptions() {
  const startingStack = Math.max(100, +document.getElementById('set-stack').value || 1000);
  const smallBlind = Math.max(1, +document.getElementById('set-sb').value || 10);
  const bigBlind = Math.max(smallBlind * 2, +document.getElementById('set-bb').value || 20);
  const botCount = Math.min(5, Math.max(1, +document.getElementById('set-bots').value || 5));

  document.getElementById('set-stack').value = startingStack;
  document.getElementById('set-sb').value = smallBlind;
  document.getElementById('set-bb').value = bigBlind;
  document.getElementById('set-bots').value = botCount;

  return { startingStack, smallBlind, bigBlind, botCount };
}

async function restartGame() {
  UI.hideOverlay();
  await api.createTable(getOptions());
  await startNewHand();
}

async function init() {
  PokerSound.initButton('btn-sound');
  await api.createTable({
    startingStack: 1000,
    smallBlind: 10,
    bigBlind: 20,
    botCount: 5
  });

  api.onUpdate(async (state) => {
    PokerSound.handleState(previousState, state);
    previousState = state;
    UI.renderState(state);

    if (state.street === 'showdown') {
      const w = state.winners || [];
      const names = w.map(x => `${x.name} (${x.handName})`).join(', ');
      const amt = w[0]?.amount || 0;
      const activePlayers = state.players.filter(player => !player.empty && player.stack > 0);
      const heroIsOut = !state.players[0] || state.players[0].stack <= 0;
      const gameIsOver = heroIsOut || activePlayers.length < 2;
      const nextButton = document.getElementById('btn-next-hand');

      nextButton.dataset.restart = gameIsOver ? 'true' : 'false';
      nextButton.textContent = gameIsOver ? 'Restart Game' : 'Next Hand';
      UI.showOverlay(
        gameIsOver ? 'Game Over' : (w.length > 1 ? 'Split Pot!' : 'Winner!'),
        `${names || 'The table'} won ${amt * Math.max(w.length, 1)}`
      );
      UI.renderActionBar(state, []);
      return;
    }

    currentLegal = await api.getLegalActions();
    UI.renderActionBar(state, currentLegal);
  });

  api.onConnection((status) => {
    PokerSound.handleConnection(status);
    const indicator = document.getElementById('connection-status');
    indicator.dataset.status = status;
    indicator.textContent = status === 'connected'
      ? 'Live'
      : (status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…');
  });

  // Start first hand
  await startNewHand();

  // Wire buttons
  document.getElementById('btn-fold').onclick = () => act({ type: 'fold' });
  document.getElementById('btn-check').onclick = () => act({ type: 'check' });
  document.getElementById('btn-call').onclick = () => {
    const call = currentLegal.find(a => a.type === 'call');
    if (call) act({ type: 'call', amount: call.amount });
  };
  document.getElementById('btn-raise').onclick = () => {
    const val = +document.getElementById('bet-slider').value;
    const isBet = currentLegal.some(a => a.type === 'bet');
    act({ type: isBet ? 'bet' : 'raise', amount: val });
  };
  document.getElementById('btn-allin').onclick = () => {
    const allin = currentLegal.find(a => a.type === 'allin');
    if (allin) act({ type: 'allin', amount: allin.amount });
  };

  document.getElementById('btn-next-hand').onclick = async () => {
    const shouldRestart = document.getElementById('btn-next-hand').dataset.restart === 'true';
    if (shouldRestart) await restartGame();
    else {
      UI.hideOverlay();
      await startNewHand();
    }
  };

  document.getElementById('btn-new-game').onclick = restartGame;

  document.getElementById('btn-settings').onclick = () => {
    document.getElementById('settings-modal').classList.remove('hidden');
  };
  document.getElementById('btn-close-settings').onclick = () => {
    document.getElementById('settings-modal').classList.add('hidden');
  };
  document.getElementById('btn-apply-settings').onclick = async () => {
    document.getElementById('settings-modal').classList.add('hidden');
    await restartGame();
  };
}

async function startNewHand() {
  const result = await api.startHand();
  if (!result?.ok) {
    const nextButton = document.getElementById('btn-next-hand');
    nextButton.dataset.restart = 'true';
    nextButton.textContent = 'Restart Game';
    UI.showOverlay('Game Over', result?.error || 'The table cannot start another hand.');
    return;
  }
  await api.processUntilHeroOrEnd();
}

async function act(action) {
  await PokerSound.unlock();
  const result = await api.takeAction(action);
  if (!result.ok) {
    console.warn(result.error);
    return;
  }
  PokerSound.play(action.type === 'bet' ? 'raise' : action.type);
  await api.processUntilHeroOrEnd();
}

// Boot
init().catch((error) => {
  console.error(error);
  UI.showOverlay('Connection error', 'The table could not connect to the game server. Check MongoDB and try again.');
});

export {};
