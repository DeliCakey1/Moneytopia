const LANE_COUNT = 4;
const LANE_KEYS = ['d', 'f', 'j', 'k'];
const NOTE_HEIGHT = 60;

let canvas, ctx;
let gameRunning = false;
let notes = [];
let keysPressed = {};
let gameScore = 0;
let songTime = 0;
let lastFrameTime = 0;
let noteIdCounter = 0;
let animationId = null;
let comboCount = 0;
let maxCombo = 0;
let perfectCount = 0;
let goodCount = 0;
let missCount = 0;
let hitZoneY = 0;
let currentSong = null;
let currentAudio = null;
let audioStarted = false;

function getSongDuration() {
  return currentSong ? currentSong.duration : 45;
}

function initGameCanvas() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  
  const maxWidth = Math.min(500, window.innerWidth - 40);
  const maxHeight = Math.min(650, window.innerHeight - 120);
  
  canvas.width = maxWidth;
  canvas.height = maxHeight;
  
  canvas.style.width = maxWidth + 'px';
  canvas.style.height = maxHeight + 'px';
  
  hitZoneY = canvas.height - 80;
}

function generateNotesFromSong() {
  notes = generateSongNotes(currentSong);
  noteIdCounter = notes.length;
}

function getNoteY(note) {
  const leadIn = 2.0;
  const offset = songTime - note.time;
  const progress = (offset + leadIn) / leadIn;
  const startY = -NOTE_HEIGHT;
  return startY + progress * (hitZoneY + NOTE_HEIGHT);
}

function drawRoundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGame() {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const laneW = canvas.width / LANE_COUNT;

  for (let i = 0; i < LANE_COUNT; i++) {
    ctx.strokeStyle = keysPressed[LANE_KEYS[i]] ? '#4444ff' : '#1a1a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(i * laneW, 0);
    ctx.lineTo(i * laneW, canvas.height);
    ctx.stroke();
  }

  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, hitZoneY);
  ctx.lineTo(canvas.width, hitZoneY);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
  ctx.fillRect(0, hitZoneY - 25, canvas.width, 50);

  for (const note of notes) {
    if (note.hit || note.missed) continue;
    
    const laneW = canvas.width / LANE_COUNT;
    const ny = getNoteY(note);
    
    if (ny < -150 || ny > canvas.height + 150) continue;

    const x = note.lane * laneW + 4;
    const w = laneW - 8;
    
    const gradient = ctx.createLinearGradient(x, ny, x, ny + NOTE_HEIGHT);
    gradient.addColorStop(0, '#00e5ff');
    gradient.addColorStop(1, '#2979ff');
    ctx.fillStyle = gradient;
    
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 15;
    drawRoundRect(x, ny, w, NOTE_HEIGHT, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    drawRoundRect(x, ny, w, NOTE_HEIGHT, 6);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  const remaining = Math.max(0, getSongDuration() - songTime);
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'center';
  ctx.font = '14px Rajdhani, sans-serif';
  ctx.fillText(remaining.toFixed(1) + 's', canvas.width / 2, 30);
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  if (!lastFrameTime) lastFrameTime = timestamp;

  if (audioStarted && currentAudio) {
    songTime = currentAudio.currentTime;
    if (currentAudio.ended || songTime >= getSongDuration()) {
      endGame();
      return;
    }
  } else {
    const delta = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
    songTime += delta;
    if (songTime >= getSongDuration() + 3) {
      endGame();
      return;
    }
  }
  lastFrameTime = timestamp;

  for (const note of notes) {
    if (note.hit || note.missed) continue;
    const ny = getNoteY(note);
    if (ny > canvas.height + 100) {
      note.missed = true;
      missCount++;
      comboCount = 0;
    }
  }

  updateGameUI();
  drawGame();
  animationId = requestAnimationFrame(gameLoop);
}

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playHitSound(quality) {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const baseFreq = quality === 'perfect' ? 880 : quality === 'good' ? 660 : 440;
    osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {}
}

function handleKeyDown(e) {
  const key = e.key.toLowerCase();
  if (!gameRunning || !LANE_KEYS.includes(key)) return;
  e.preventDefault();
  
  if (e.repeat) return;
  keysPressed[key] = true;

  let closestNote = null;
  let closestDist = Infinity;
  const lane = LANE_KEYS.indexOf(key);

  for (const note of notes) {
    if (note.hit || note.missed) continue;
    if (note.lane !== lane) continue;
    const dist = Math.abs(songTime - note.time);
    if (dist < closestDist && dist < 0.3) {
      closestDist = dist;
      closestNote = note;
    }
  }

  if (closestNote) {
    closestNote.hit = true;
    comboCount++;
    if (comboCount > maxCombo) maxCombo = comboCount;

    if (closestDist < 0.08) {
      gameScore += 300 + Math.floor(comboCount * 5);
      perfectCount++;
      playHitSound('perfect');
    } else if (closestDist < 0.16) {
      gameScore += 200 + Math.floor(comboCount * 3);
      goodCount++;
      playHitSound('good');
    } else {
      gameScore += 100 + Math.floor(comboCount * 2);
      playHitSound('miss');
    }
  }
}

function handleKeyUp(e) {
  const key = e.key.toLowerCase();
  if (LANE_KEYS.includes(key)) {
    keysPressed[key] = false;
  }
}

let countdownInterval = null;

function startGame() {
  if (gameRunning) return;
  
  const canvasWrapper = document.getElementById('game-canvas-wrapper');
  const readyScreen = document.getElementById('game-ready');
  const countdownEl = document.getElementById('game-countdown');
  const songNameEl = document.getElementById('game-song');
  
  readyScreen.style.display = 'none';
  canvasWrapper.style.display = 'block';
  
  currentSong = SONGS[Math.floor(Math.random() * SONGS.length)];
  songNameEl.textContent = currentSong.artist + ' - ' + currentSong.name + ' (' + currentSong.bpm + ' BPM)';
  songNameEl.style.display = 'block';
  
  initGameCanvas();
  generateNotesFromSong();
  
  gameScore = 0;
  songTime = -3;
  comboCount = 0;
  maxCombo = 0;
  perfectCount = 0;
  goodCount = 0;
  missCount = 0;
  lastFrameTime = 0;
  gameRunning = true;
  keysPressed = {};
  audioStarted = false;

  try {
    currentAudio = new Audio(currentSong.file);
    currentAudio.load();
  } catch (e) {
    currentAudio = null;
  }

  updateGameUI();
  
  if (animationId) cancelAnimationFrame(animationId);
  
  let count = 3;
  countdownEl.textContent = count;
  countdownEl.style.display = 'block';
  
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else if (count === 0) {
      countdownEl.textContent = 'GO!';
      if (currentAudio) {
        currentAudio.play().catch(function(e) {});
        audioStarted = true;
      }
    } else {
      countdownEl.style.display = 'none';
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }, 1000);
  
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  document.getElementById('game-song').style.display = 'none';

  const coinsEarned = Math.floor(gameScore / 50) + Math.floor(maxCombo / 5);
  const heartsLost = 4 + Math.floor(Math.random() * 4);

  const gameResult = {
    score: gameScore,
    coinsEarned: Math.max(1, coinsEarned),
    heartsLost,
    maxCombo,
    perfectCount,
    goodCount,
    missCount
  };

  document.getElementById('game-canvas-wrapper').style.display = 'none';
  document.getElementById('game-ready').style.display = 'block';

  finishRound(gameResult);
}

function updateGameUI() {
  const state = window.gameState;
  document.getElementById('game-coins').textContent = state.coins;
  document.getElementById('game-hearts').textContent = state.hearts;
  document.getElementById('game-score').textContent = gameScore;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
