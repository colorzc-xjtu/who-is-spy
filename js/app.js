import { SCREENS, GAME_CONFIG } from './constants.js';
import { loadSettings, saveSettings, loadTheme, saveTheme } from './storage.js';
import { loadWords, getCategories, getRandomPair } from './wordLibrary.js';
import * as game from './gameEngine.js';
import * as timer from './timer.js';
import * as ui from './uiController.js';

const $ = (sel) => document.querySelector(sel);

// --- State ---
let playerStepper, spyStepper, blankStepper;
let customMode = false;

// --- Init ---
async function init() {
  await loadWords();
  initTheme();
  initHomeScreen();
  initSetupScreen();
  initRevealScreen();
  initGameScreen();
  initResultScreen();
  initRulesModal();
  ui.initConfirmDialog();
}

// --- Theme ---
function initTheme() {
  const theme = loadTheme();
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);

  $('#btn-theme').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    saveTheme(next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  $('#btn-theme').textContent = theme === 'dark' ? '🌙' : '☀️';
}

// --- Home Screen ---
function initHomeScreen() {
  $('#btn-start').addEventListener('click', () => {
    ui.showScreen(SCREENS.SETUP);
    loadSetupDefaults();
  });
}

// --- Setup Screen ---
function initSetupScreen() {
  const saved = loadSettings();

  playerStepper = ui.initStepper(
    'stepper-players',
    GAME_CONFIG.MIN_PLAYERS,
    GAME_CONFIG.MAX_PLAYERS,
    saved.playerCount,
    () => validateSetup()
  );

  spyStepper = ui.initStepper(
    'stepper-spies',
    GAME_CONFIG.MIN_SPIES,
    GAME_CONFIG.MAX_SPIES,
    saved.spyCount,
    () => validateSetup()
  );

  blankStepper = ui.initStepper(
    'stepper-blanks',
    GAME_CONFIG.MIN_BLANKS,
    GAME_CONFIG.MAX_BLANKS,
    saved.blankCount,
    () => validateSetup()
  );

  // Categories
  const categories = getCategories();
  ui.renderCategoryPills(categories);

  // Custom word toggle
  $('#custom-toggle').addEventListener('click', () => {
    customMode = !customMode;
    $('#toggle-switch').classList.toggle('active', customMode);
    $('#custom-inputs').classList.toggle('visible', customMode);
    validateSetup();
  });

  // Back
  $('#setup-back').addEventListener('click', () => {
    ui.showScreen(SCREENS.HOME);
  });

  // Deal
  $('#btn-deal').addEventListener('click', startDeal);
}

function loadSetupDefaults() {
  const saved = loadSettings();
  playerStepper.setValue(saved.playerCount);
  spyStepper.setValue(saved.spyCount);
  blankStepper.setValue(saved.blankCount);
  validateSetup();
}

function validateSetup() {
  if (!playerStepper || !spyStepper || !blankStepper) return;
  const playerCount = playerStepper.getValue();
  const spyCount = spyStepper.getValue();
  const blankCount = blankStepper.getValue();

  const error = game.validateSettings({ playerCount, spyCount, blankCount });

  if (customMode) {
    const civ = $('#input-civilian').value.trim();
    const spy = $('#input-spy').value.trim();
    if (!error && civ && spy && civ === spy) {
      $('#validation-msg').textContent = '平民词和卧底词不能相同';
      $('#btn-deal').disabled = true;
      return;
    }
    if (!error && (!civ || !spy)) {
      $('#validation-msg').textContent = '';
      $('#btn-deal').disabled = true;
      return;
    }
  }

  $('#validation-msg').textContent = error;
  $('#btn-deal').disabled = !!error;
}

function startDeal() {
  const playerCount = playerStepper.getValue();
  const spyCount = spyStepper.getValue();
  const blankCount = blankStepper.getValue();

  // Get word pair
  let wordPair;
  if (customMode) {
    const civ = $('#input-civilian').value.trim();
    const spy = $('#input-spy').value.trim();
    if (!civ || !spy || civ === spy) return;
    wordPair = { civilian: civ, spy: spy };
  } else {
    const selectedCats = ui.getSelectedCategories();
    wordPair = getRandomPair(selectedCats);
  }

  // Save settings
  saveSettings({ playerCount, spyCount, blankCount });

  // Start game
  game.startGame({ playerCount, spyCount, blankCount }, wordPair);

  // Show reveal screen
  ui.resetRevealScreen();
  ui.showScreen(SCREENS.REVEAL);
  showNextReveal();
}

// --- Reveal Screen ---
function initRevealScreen() {
  $('#reveal-front').addEventListener('click', () => {
    const player = game.getNextRevealPlayer();
    if (player && !$('#reveal-card').classList.contains('flipped')) {
      ui.renderRevealWord(player);
    }
  });

  $('#btn-next-player').addEventListener('click', () => {
    game.confirmPlayerViewed();
    if (game.allPlayersViewed()) {
      ui.renderRevealDone();
    } else {
      showNextReveal();
    }
  });

  $('#btn-start-game').addEventListener('click', () => {
    enterGameScreen();
  });
}

function showNextReveal() {
  const player = game.getNextRevealPlayer();
  if (player) {
    ui.renderRevealWaiting(player, game.getPlayerCount());
  }
}

// --- Game Screen ---
function initGameScreen() {
  // Timer setup
  timer.setCallbacks(
    (remaining) => {
      ui.updateTimerDisplay(timer.formatTime(remaining), remaining);
    },
    () => {
      ui.updateTimerButton(false);
      ui.showToast('时间到！');
    }
  );

  // Timer presets
  $('#timer-presets').addEventListener('click', e => {
    const btn = e.target.closest('.timer-preset');
    if (!btn) return;
    const seconds = parseInt(btn.dataset.seconds);
    $('#timer-presets').querySelectorAll('.timer-preset').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    timer.setDuration(seconds);
    ui.updateTimerButton(false);
  });

  // Timer controls
  $('#btn-timer-toggle').addEventListener('click', () => {
    if (timer.isRunning()) {
      timer.stop();
    } else {
      timer.start();
    }
    ui.updateTimerButton(timer.isRunning());
  });

  $('#btn-timer-reset').addEventListener('click', () => {
    timer.reset();
    ui.updateTimerButton(false);
  });

  // Game actions
  $('#btn-review').addEventListener('click', openReviewModal);
  $('#btn-next-round').addEventListener('click', () => {
    game.nextRound();
    ui.updateRound(game.getRound());
    timer.reset();
    ui.updateTimerButton(false);
    ui.showToast(`第 ${game.getRound()} 轮开始`);
  });
  $('#btn-reveal-all').addEventListener('click', async () => {
    const ok = await ui.confirm('公布答案', '确定要公布所有人的身份吗？');
    if (ok) showResults();
  });
  $('#btn-new-game').addEventListener('click', async () => {
    const ok = await ui.confirm('再来一局', '将重新分配角色和词语，确定吗？');
    if (ok) {
      game.newRound();
      ui.resetRevealScreen();
      ui.showScreen(SCREENS.REVEAL);
      showNextReveal();
    }
  });

  // Review modal
  $('#btn-close-review').addEventListener('click', () => ui.hideModal('modal-review'));
  $('#review-backdrop').addEventListener('click', () => ui.hideModal('modal-review'));

  // Review reveal modal
  let reviewPlayer = null;
  $('#btn-review-show').addEventListener('click', () => {
    if (reviewPlayer) {
      $('#review-reveal-info').classList.remove('hidden');
      $('#btn-review-show').classList.add('hidden');
    }
  });
  $('#btn-close-review-reveal').addEventListener('click', () => ui.hideModal('modal-review-reveal'));
  $('#review-reveal-backdrop').addEventListener('click', () => ui.hideModal('modal-review-reveal'));

  // Store reviewPlayer reference accessible to openReviewModal
  window.__setReviewPlayer = (p) => { reviewPlayer = p; };
}

function enterGameScreen() {
  ui.showScreen(SCREENS.GAME);
  ui.renderPlayerGrid(game.getPlayers(), handleEliminate);
  ui.updateRound(game.getRound());
  timer.reset();
  ui.updateTimerDisplay(timer.formatTime(timer.getRemaining()), timer.getRemaining());
  ui.updateTimerButton(false);
}

async function handleEliminate(number) {
  const player = game.getPlayerInfo(number);
  if (!player) return;
  const action = player.eliminated ? '恢复' : '淘汰';
  const ok = await ui.confirm(`${action}玩家`, `确定要${action}玩家 ${number} 吗？`);
  if (ok) {
    game.eliminatePlayer(number);
    ui.updatePlayerCard(number, !player.eliminated);
    ui.showToast(`玩家 ${number} 已${action}`);
  }
}

function openReviewModal() {
  ui.renderReviewGrid(game.getPlayers(), (number) => {
    ui.hideModal('modal-review');
    const player = game.getPlayerInfo(number);
    if (player) {
      window.__setReviewPlayer(player);
      ui.renderReviewReveal(player);
      ui.showModal('modal-review-reveal');
    }
  });
  ui.showModal('modal-review');
}

// --- Result Screen ---
function initResultScreen() {
  $('#btn-play-again').addEventListener('click', async () => {
    game.newRound();
    ui.resetRevealScreen();
    ui.showScreen(SCREENS.REVEAL);
    showNextReveal();
  });

  $('#btn-go-home').addEventListener('click', () => {
    ui.showScreen(SCREENS.HOME);
  });
}

function showResults() {
  timer.stop();
  const results = game.getAllResults();
  ui.renderResults(results);
  ui.showScreen(SCREENS.RESULT);
}

// --- Rules Modal ---
function initRulesModal() {
  $('#btn-rules').addEventListener('click', () => ui.showModal('modal-rules'));
  $('#btn-close-rules').addEventListener('click', () => ui.hideModal('modal-rules'));
  $('#rules-backdrop').addEventListener('click', () => ui.hideModal('modal-rules'));
}

// --- Boot ---
init();
