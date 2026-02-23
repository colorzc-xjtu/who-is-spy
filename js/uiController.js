import { SCREENS, ROLE_INFO } from './constants.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// --- Screen Management ---
export function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('screen-active'));
  const target = $(`#${id}`);
  if (target) target.classList.add('screen-active');
}

// --- Toast ---
export function showToast(message) {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- Modal ---
export function showModal(id) {
  $(`#${id}`).classList.add('visible');
}

export function hideModal(id) {
  $(`#${id}`).classList.remove('visible');
}

// --- Confirm Dialog ---
let confirmResolve = null;

export function confirm(title, body) {
  return new Promise(resolve => {
    confirmResolve = resolve;
    $('#confirm-title').textContent = title;
    $('#confirm-body').textContent = body;
    showModal('modal-confirm');
  });
}

export function initConfirmDialog() {
  $('#btn-confirm-cancel').addEventListener('click', () => {
    hideModal('modal-confirm');
    if (confirmResolve) confirmResolve(false);
  });
  $('#btn-confirm-ok').addEventListener('click', () => {
    hideModal('modal-confirm');
    if (confirmResolve) confirmResolve(true);
  });
  $('#confirm-backdrop').addEventListener('click', () => {
    hideModal('modal-confirm');
    if (confirmResolve) confirmResolve(false);
  });
}

// --- Setup Screen: Categories ---
export function renderCategoryPills(categories, onToggle) {
  const container = $('#category-pills');
  // Keep the "random" pill, remove dynamic ones
  container.querySelectorAll('[data-category]:not([data-category="random"])').forEach(el => el.remove());

  categories.forEach(cat => {
    const pill = document.createElement('button');
    pill.className = 'category-pill';
    pill.dataset.category = cat.id;
    pill.textContent = `${cat.icon} ${cat.name}`;
    container.appendChild(pill);
  });

  container.addEventListener('click', e => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;
    const cat = pill.dataset.category;

    if (cat === 'random') {
      // Deselect all others, select random
      container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    } else {
      // Deselect "random", toggle this one
      container.querySelector('[data-category="random"]').classList.remove('active');
      pill.classList.toggle('active');
      // If none selected, re-select random
      const anyActive = container.querySelector('.category-pill.active:not([data-category="random"])');
      if (!anyActive) {
        container.querySelector('[data-category="random"]').classList.add('active');
      }
    }

    if (onToggle) onToggle(getSelectedCategories());
  });
}

export function getSelectedCategories() {
  const pills = $$('#category-pills .category-pill.active');
  const ids = [];
  pills.forEach(p => {
    if (p.dataset.category !== 'random') ids.push(p.dataset.category);
  });
  return ids; // empty = random/all
}

// --- Setup Screen: Steppers ---
export function initStepper(id, min, max, value, onChange) {
  const el = $(`#${id}`);
  const valEl = el.querySelector('.stepper-value');
  const minusBtn = el.querySelector('.stepper-minus');
  const plusBtn = el.querySelector('.stepper-plus');
  let current = value;

  function update() {
    valEl.textContent = current;
    minusBtn.disabled = current <= min;
    plusBtn.disabled = current >= max;
    if (onChange) onChange(current);
  }

  minusBtn.addEventListener('click', () => {
    if (current > min) { current--; update(); }
  });

  plusBtn.addEventListener('click', () => {
    if (current < max) { current++; update(); }
  });

  update();

  return {
    getValue: () => current,
    setValue: (v) => { current = Math.max(min, Math.min(max, v)); update(); },
  };
}

// --- Reveal Screen ---
export function renderRevealWaiting(player, total) {
  $('#reveal-progress').textContent = `${player.number} / ${total}`;
  $('#reveal-player-label').textContent = `玩家 ${player.number}`;
  $('#reveal-card').classList.remove('flipped');
  $('#btn-next-player').classList.add('hidden');
  $('#btn-start-game').classList.add('hidden');
}

export function renderRevealWord(player) {
  const roleInfo = ROLE_INFO[player.role];
  const badge = $('#reveal-role-badge');
  badge.textContent = roleInfo.label;
  badge.className = `reveal-role-badge ${roleInfo.cssClass}`;

  if (player.role === 'blank') {
    $('#reveal-word').classList.add('hidden');
    $('#reveal-blank-text').classList.remove('hidden');
  } else {
    $('#reveal-word').classList.remove('hidden');
    $('#reveal-word').textContent = player.word;
    $('#reveal-blank-text').classList.add('hidden');
  }

  $('#reveal-card').classList.add('flipped');
  $('#btn-next-player').classList.remove('hidden');
}

export function renderRevealDone() {
  $('#reveal-card').classList.remove('flipped');
  $('#btn-next-player').classList.add('hidden');
  $('#btn-start-game').classList.remove('hidden');
  $('#reveal-player-label').textContent = '发牌完成';
  $('#reveal-front-hint').textContent = '所有玩家已查看身份';
  $('.pulse-ring').style.display = 'none';
  $('.reveal-front-icon').textContent = '✅';
}

export function resetRevealScreen() {
  $('.pulse-ring').style.display = '';
  $('.reveal-front-icon').textContent = '🔒';
  $('#reveal-front-hint').textContent = '点击卡牌查看身份';
}

// --- Game Screen ---
export function renderPlayerGrid(players, onEliminate) {
  const grid = $('#player-grid');
  grid.innerHTML = '';
  players.forEach(p => {
    const card = document.createElement('div');
    card.className = `player-card${p.eliminated ? ' eliminated' : ''}`;
    card.dataset.number = p.number;
    card.innerHTML = `
      <div class="player-number">${p.number}</div>
      <div class="player-status"></div>
    `;
    card.addEventListener('click', () => onEliminate(p.number));
    grid.appendChild(card);
  });
}

export function updatePlayerCard(number, eliminated) {
  const card = $(`#player-grid .player-card[data-number="${number}"]`);
  if (card) {
    card.classList.toggle('eliminated', eliminated);
  }
}

export function updateRound(round) {
  $('#round-badge').textContent = `第 ${round} 轮`;
}

// --- Timer Display ---
export function updateTimerDisplay(text, seconds) {
  const el = $('#timer-display');
  el.textContent = text;
  el.classList.remove('warning', 'danger');
  if (seconds !== undefined) {
    if (seconds <= 10) el.classList.add('danger');
    else if (seconds <= 30) el.classList.add('warning');
  }
}

export function updateTimerButton(running) {
  $('#btn-timer-toggle').textContent = running ? '暂停' : '开始计时';
}

// --- Result Screen ---
export function renderResults(results) {
  const wordsEl = $('#result-words');
  wordsEl.innerHTML = `
    <div class="result-word-card civilian">平民词：${results.civilianWord}</div>
    <div class="result-word-card spy">卧底词：${results.spyWord}</div>
  `;

  const playersEl = $('#result-players');
  playersEl.innerHTML = '';
  results.players.forEach(p => {
    const roleInfo = ROLE_INFO[p.role];
    const row = document.createElement('div');
    row.className = `result-player-row${p.eliminated ? ' eliminated' : ''}`;
    row.innerHTML = `
      <span class="result-player-number">${p.number}</span>
      <span class="result-player-role reveal-role-badge ${roleInfo.cssClass}">${roleInfo.label}</span>
      <span class="result-player-word">${p.word || '无词语'}</span>
    `;
    playersEl.appendChild(row);
  });
}

// --- Review Modal ---
export function renderReviewGrid(players, onSelect) {
  const grid = $('#review-player-grid');
  grid.innerHTML = '';
  players.filter(p => !p.eliminated).forEach(p => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `<div class="player-number">${p.number}</div>`;
    card.addEventListener('click', () => onSelect(p.number));
    grid.appendChild(card);
  });
}

export function renderReviewReveal(player) {
  const roleInfo = ROLE_INFO[player.role];
  $('#review-reveal-title').textContent = `玩家 ${player.number} 的身份`;
  const badge = $('#review-role-badge');
  badge.textContent = roleInfo.label;
  badge.className = `reveal-role-badge ${roleInfo.cssClass}`;

  if (player.role === 'blank') {
    $('#review-word').classList.add('hidden');
    $('#review-blank-text').classList.remove('hidden');
  } else {
    $('#review-word').classList.remove('hidden');
    $('#review-word').textContent = player.word;
    $('#review-blank-text').classList.add('hidden');
  }

  // Hide info until button press
  $('#review-reveal-info').classList.add('hidden');
  $('#btn-review-show').classList.remove('hidden');
}
