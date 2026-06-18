const FOOD_ITEMS = [
  { id: 'bread', name: '🍞 Bread', desc: 'Restores 5❤️', price: 12, hearts: 5 },
  { id: 'sandwich', name: '🥪 Sandwich', desc: 'Restores 12❤️', price: 25, hearts: 12 },
  { id: 'salad', name: '🥗 Salad', desc: 'Restores 20❤️', price: 38, hearts: 20 },
  { id: 'pizza', name: '🍕 Pizza', desc: 'Restores 30❤️', price: 55, hearts: 30 },
  { id: 'steak', name: '🥩 Steak', desc: 'Restores 45❤️', price: 78, hearts: 45 },
  { id: 'golden_apple', name: '🍎 Golden Apple', desc: 'Restores 75❤️', price: 110, hearts: 75 }
];

let gameState = {};

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2);
}


function init() {
  gameState = loadGame();
  updateAllUI();
  showView('menu');
  
  window.gameState = gameState;
  
  setInterval(autoSave, 15000);
}

function autoSave() {
  saveGame(gameState);
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + viewId).classList.add('active');
  updateAllUI();
}

function updateAllUI() {
  document.getElementById('menu-coins').textContent = formatMoney(gameState.coins);
  document.getElementById('menu-hearts').textContent = gameState.hearts;
  document.getElementById('menu-highscore').textContent = gameState.highScore;
  
  document.getElementById('shop-coins').textContent = formatMoney(gameState.coins);
  document.getElementById('eat-hearts').textContent = gameState.hearts;
  
  renderShop();
  renderEat();
}

function renderShop() {
  const container = document.getElementById('shop-items');
  container.innerHTML = '';

  for (const item of FOOD_ITEMS) {
    const canBuy = gameState.coins >= item.price;
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.innerHTML = `
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}</div>
      </div>
      <div>
        <span class="shop-item-price">${formatMoney(item.price)}</span>
        <button class="btn btn-buy" ${canBuy ? '' : 'disabled'} onclick="buyFood('${item.id}')">
          BUY
        </button>
      </div>
    `;
    container.appendChild(div);
  }
}

function renderEat() {
  const container = document.getElementById('eat-items');
  container.innerHTML = '';

  const hasAny = FOOD_ITEMS.some(item => (gameState.foodInventory[item.id] || 0) > 0);
  
  if (!hasAny) {
    container.innerHTML = '<p style="color:#888; padding: 2rem;">No food yet! Buy some from the shop.</p>';
    return;
  }

  for (const item of FOOD_ITEMS) {
    const qty = gameState.foodInventory[item.id] || 0;
    if (qty === 0) continue;
    
    const canEat = gameState.hearts < gameState.maxHearts;
    const div = document.createElement('div');
    div.className = 'eat-item';
    div.innerHTML = `
      <div class="eat-item-info">
        <div class="eat-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}</div>
      </div>
      <div>
        <span class="eat-item-qty">x${qty}</span>
        <button class="btn btn-eat-action" ${canEat ? '' : 'disabled'} onclick="eatFood('${item.id}')">
          EAT
        </button>
      </div>
    `;
    container.appendChild(div);
  }
}

function buyFood(foodId) {
  const item = FOOD_ITEMS.find(f => f.id === foodId);
  if (!item) return;
  if (gameState.coins < item.price) return;

  gameState.coins -= item.price;
  if (!gameState.foodInventory[foodId]) {
    gameState.foodInventory[foodId] = 0;
  }
  gameState.foodInventory[foodId]++;
  
  saveGame(gameState);
  updateAllUI();
}

function eatFood(foodId) {
  const item = FOOD_ITEMS.find(f => f.id === foodId);
  if (!item) return;
  
  const qty = gameState.foodInventory[foodId] || 0;
  if (qty <= 0) return;
  if (gameState.hearts >= gameState.maxHearts) return;

  gameState.foodInventory[foodId]--;
  gameState.hearts = Math.min(gameState.maxHearts, gameState.hearts + item.hearts);
  
  saveGame(gameState);
  updateAllUI();
}

function finishRound(result) {
  gameState.coins += result.coinsEarned;
  gameState.hearts -= result.heartsLost;
  gameState.totalRounds++;
  
  if (result.score > gameState.highScore) {
    gameState.highScore = result.score;
  }
  
  document.getElementById('result-score').textContent = result.score;
  document.getElementById('result-coins').textContent = '+' + formatMoney(result.coinsEarned);
  document.getElementById('result-hearts').textContent = '-' + result.heartsLost;
  document.getElementById('result-hearts-left').textContent = gameState.hearts;
  
  saveGame(gameState);
  updateAllUI();
  
  if (gameState.hearts <= 0) {
    gameState.bestRounds = Math.max(gameState.bestRounds, gameState.totalRounds);
    document.getElementById('gameover-rounds').textContent = gameState.totalRounds;
    document.getElementById('gameover-score').textContent = gameState.highScore;
    saveGame(gameState);
    showView('gameover');
  } else {
    showView('results');
  }
}

function resetGame() {
  gameState = resetState();
  gameState.bestRounds = 0;
  window.gameState = gameState;
  updateAllUI();
  showView('menu');
}

document.addEventListener('DOMContentLoaded', init);
