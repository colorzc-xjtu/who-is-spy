import { STORAGE_KEYS, GAME_CONFIG } from './constants.js';

const DEFAULT_SETTINGS = {
  playerCount: GAME_CONFIG.DEFAULT_PLAYERS,
  spyCount: GAME_CONFIG.DEFAULT_SPIES,
  blankCount: GAME_CONFIG.DEFAULT_BLANKS,
  categories: [],
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // storage full or disabled — silently ignore
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // ignore
  }
}
