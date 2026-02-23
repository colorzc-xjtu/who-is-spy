import { FALLBACK_PAIRS } from './constants.js';

let data = null;

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

export async function loadWords() {
  try {
    const resp = await fetch('./data/words.json');
    data = await resp.json();
  } catch {
    data = null;
  }
}

export function getCategories() {
  if (!data) return [];
  return data.categories.map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    count: c.pairs.length,
  }));
}

export function getRandomPair(categoryIds = []) {
  let pool;
  if (!data) {
    pool = FALLBACK_PAIRS;
  } else if (categoryIds.length === 0) {
    pool = data.categories.flatMap(c => c.pairs);
  } else {
    pool = data.categories
      .filter(c => categoryIds.includes(c.id))
      .flatMap(c => c.pairs);
    if (pool.length === 0) {
      pool = data.categories.flatMap(c => c.pairs);
    }
  }
  const shuffled = shuffleArray(pool);
  return { ...shuffled[0] };
}
