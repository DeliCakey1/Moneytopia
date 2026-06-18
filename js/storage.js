const STORAGE_KEY = 'moneytopia_save';

function getDefaultState() {
  return {
    coins: 0,
    hearts: 100,
    maxHearts: 100,
    foodInventory: {},
    highScore: 0,
    totalRounds: 0,
    bestRounds: 0
  };
}

function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const def = getDefaultState();
      for (const key in def) {
        if (parsed[key] === undefined) parsed[key] = def[key];
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load save, starting fresh');
  }
  return getDefaultState();
}

function saveGame(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save game');
  }
}

function resetState() {
  const def = getDefaultState();
  localStorage.removeItem(STORAGE_KEY);
  return def;
}
