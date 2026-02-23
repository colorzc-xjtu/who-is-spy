import { ROLES } from './constants.js';

let players = [];
let civilianWord = '';
let spyWord = '';
let currentRevealIndex = 0;
let round = 1;
let settings = {};

function shuffleArray(arr) {
  const a = [...arr];
  const rand = new Uint32Array(a.length);
  crypto.getRandomValues(rand);
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function validateSettings({ playerCount, spyCount, blankCount }) {
  if (playerCount < 4) return '玩家人数至少为4人';
  if (playerCount > 12) return '玩家人数最多为12人';
  if (spyCount < 1) return '至少需要1名卧底';
  if (spyCount + blankCount >= Math.ceil(playerCount / 2)) {
    return '卧底和白板总数不能达到玩家总数的一半';
  }
  if (playerCount - spyCount - blankCount < 2) {
    return '至少需要2名平民';
  }
  return '';
}

export function startGame(gameSettings, wordPair) {
  settings = { ...gameSettings };
  civilianWord = wordPair.civilian;
  spyWord = wordPair.spy;
  round = 1;
  currentRevealIndex = 0;

  const roles = [];
  for (let i = 0; i < settings.spyCount; i++) roles.push(ROLES.SPY);
  for (let i = 0; i < settings.blankCount; i++) roles.push(ROLES.BLANK);
  while (roles.length < settings.playerCount) roles.push(ROLES.CIVILIAN);

  const shuffled = shuffleArray(roles);

  players = shuffled.map((role, i) => ({
    number: i + 1,
    role,
    word: role === ROLES.CIVILIAN ? civilianWord
        : role === ROLES.SPY ? spyWord
        : null,
    eliminated: false,
  }));
}

export function getNextRevealPlayer() {
  if (currentRevealIndex >= players.length) return null;
  return players[currentRevealIndex];
}

export function confirmPlayerViewed() {
  currentRevealIndex++;
}

export function allPlayersViewed() {
  return currentRevealIndex >= players.length;
}

export function getPlayers() {
  return players;
}

export function getPlayerCount() {
  return players.length;
}

export function eliminatePlayer(number) {
  const p = players.find(p => p.number === number);
  if (p) p.eliminated = !p.eliminated;
}

export function getActivePlayers() {
  return players.filter(p => !p.eliminated);
}

export function getPlayerInfo(number) {
  return players.find(p => p.number === number) || null;
}

export function getAllResults() {
  return {
    civilianWord,
    spyWord,
    players: players.map(p => ({ ...p })),
  };
}

export function getRound() {
  return round;
}

export function nextRound() {
  round++;
}

export function newRound() {
  // Re-deal with same settings but new roles
  startGame(settings, { civilian: civilianWord, spy: spyWord });
}

export function getSettings() {
  return { ...settings };
}
