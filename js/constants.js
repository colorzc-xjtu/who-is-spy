// Game configuration constants
export const GAME_CONFIG = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 12,
  MIN_SPIES: 1,
  MAX_SPIES: 3,
  MIN_BLANKS: 0,
  MAX_BLANKS: 2,
  DEFAULT_PLAYERS: 6,
  DEFAULT_SPIES: 1,
  DEFAULT_BLANKS: 0,
  TIMER_PRESETS: [60, 120, 180, 300], // seconds
  DEFAULT_TIMER: 120,
};

// Screen IDs
export const SCREENS = {
  HOME: 'screen-home',
  SETUP: 'screen-setup',
  REVEAL: 'screen-reveal',
  GAME: 'screen-game',
  RESULT: 'screen-result',
};

// Player roles
export const ROLES = {
  CIVILIAN: 'civilian',
  SPY: 'spy',
  BLANK: 'blank',
};

// Role display info
export const ROLE_INFO = {
  [ROLES.CIVILIAN]: { label: '平民', cssClass: 'role-civilian' },
  [ROLES.SPY]: { label: '卧底', cssClass: 'role-spy' },
  [ROLES.BLANK]: { label: '白板', cssClass: 'role-blank' },
};

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'wis-settings',
  THEME: 'wis-theme',
};

// Fallback word pairs (used if words.json fails to load)
export const FALLBACK_PAIRS = [
  { civilian: '苹果', spy: '梨' },
  { civilian: '猫', spy: '狗' },
  { civilian: '医生', spy: '护士' },
  { civilian: '火锅', spy: '麻辣烫' },
  { civilian: '超市', spy: '便利店' },
  { civilian: '雨伞', spy: '雨衣' },
  { civilian: '老虎', spy: '狮子' },
  { civilian: '友情', spy: '爱情' },
  { civilian: '蛋糕', spy: '面包' },
  { civilian: '机场', spy: '火车站' },
];
