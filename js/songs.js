const SONGS = [
  {
    id: 'blank',
    name: 'Blank',
    artist: 'Disfigure',
    file: 'audio/Blank - Disfigure.mp3',
    bpm: 140,
    duration: 210,
    style: 'heavy',
    density: 0.65
  },
  {
    id: 'onandon',
    name: 'On & On',
    artist: 'Cartoon',
    file: 'audio/On & On.mp3',
    bpm: 115,
    duration: 210,
    style: 'light',
    density: 0.5
  },
  {
    id: 'savannah',
    name: 'Savannah',
    artist: 'Diviners',
    file: 'audio/Savannah - Diviners.mp3',
    bpm: 110,
    duration: 210,
    style: 'light',
    density: 0.45
  },
  {
    id: 'nekozilla',
    name: 'Nekozilla',
    artist: 'Different Heaven',
    file: 'audio/Nekozilla - Different Heaven.mp3',
    bpm: 128,
    duration: 210,
    style: 'balanced',
    density: 0.55
  },
  {
    id: 'myheart',
    name: 'My Heart',
    artist: 'Different Heaven',
    file: 'audio/My Heart - Different Heaven.mp3',
    bpm: 128,
    duration: 210,
    style: 'balanced',
    density: 0.55
  },
  {
    id: 'invincible',
    name: 'Invincible',
    artist: 'Deaf Kev',
    file: 'audio/Invincible - Deaf Kev.mp3',
    bpm: 128,
    duration: 210,
    style: 'balanced',
    density: 0.6
  },
  {
    id: 'cloud9',
    name: 'Cloud 9',
    artist: 'Tobu',
    file: 'audio/Cloud 9 - Tobu.mp3',
    bpm: 128,
    duration: 240,
    style: 'balanced',
    density: 0.55
  },
  {
    id: 'hope',
    name: 'Hope',
    artist: 'Tobu',
    file: 'audio/Hope - Tobu.mp3',
    bpm: 128,
    duration: 210,
    style: 'balanced',
    density: 0.55
  },
  {
    id: 'candyland',
    name: 'Candyland',
    artist: 'Tobu',
    file: 'audio/Candyland - Tobu.mp3',
    bpm: 110,
    duration: 240,
    style: 'light',
    density: 0.5
  }
];

function getSongDuration(song) {
  return song.duration;
}

function getBeatsInSong(song) {
  const beatDur = 60 / song.bpm;
  return Math.floor(song.duration / beatDur);
}

function generateSongNotes(song) {
  const notes = [];
  const beats = getBeatsInSong(song);
  const beatsPerMeasure = 4;
  let id = 0;

  for (let beat = 0; beat < beats; beat++) {
    const beatInMeasure = beat % beatsPerMeasure;
    const isDownbeat = beatInMeasure === 0;
    const isStrong = beatInMeasure === 2;
    const isOffbeat = beatInMeasure === 1 || beatInMeasure === 3;

    let chance = 0;
    if (song.style === 'heavy') {
      chance = isDownbeat ? 0.85 : isStrong ? 0.7 : isOffbeat ? 0.45 : 0.25;
    } else if (song.style === 'light') {
      chance = isDownbeat ? 0.6 : isStrong ? 0.4 : isOffbeat ? 0.25 : 0.1;
    } else {
      chance = isDownbeat ? 0.75 : isStrong ? 0.55 : isOffbeat ? 0.35 : 0.15;
    }

    chance *= song.density * 1.5;

    if (Math.random() < chance) {
      const beatDur = 60 / song.bpm;
      const time = beat * beatDur;
      const lane = Math.floor(Math.random() * 4);
      notes.push({ id: id++, lane, time, hit: false, missed: false });
    }

    if (song.style === 'heavy' && Math.random() < 0.2) {
      const beatDur = 60 / song.bpm;
      const time = beat * beatDur + beatDur / 2;
      const lane = Math.floor(Math.random() * 4);
      notes.push({ id: id++, lane, time, hit: false, missed: false });
    }
  }

  notes.sort((a, b) => a.time - b.time);
  return notes;
}

let _noiseBuf = null;

function _getNoise(ctx) {
  if (!_noiseBuf) {
    const len = ctx.sampleRate * 0.2;
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    _noiseBuf = b;
  }
  return _noiseBuf;
}

function _pKick(ctx, t, vol) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(30, t + 0.12);
  o.type = 'sine';
  g.gain.setValueAtTime(vol * 0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.start(t); o.stop(t + 0.22);
}

function _pClap(ctx, t, vol) {
  const src = ctx.createBufferSource();
  src.buffer = _getNoise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = 2000; f.Q.value = 1.5;
  const g = ctx.createGain();
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(vol * 0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  src.start(t); src.stop(t + 0.1);
}

function _pHat(ctx, t, vol) {
  const src = ctx.createBufferSource();
  src.buffer = _getNoise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 5000;
  const g = ctx.createGain();
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(vol * 0.1, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  src.start(t); src.stop(t + 0.06);
}

function _pBass(ctx, freq, t, dur) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.setValueAtTime(freq, t);
  o.type = 'sawtooth';
  g.gain.setValueAtTime(0.1, t);
  g.gain.linearRampToValueAtTime(0.06, t + dur * 0.3);
  g.gain.setValueAtTime(0.06, t + dur - 0.03);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
}

function _pLead(ctx, freq, t, dur) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.setValueAtTime(freq, t);
  o.type = 'triangle';
  g.gain.setValueAtTime(0.08, t);
  g.gain.linearRampToValueAtTime(0.05, t + dur * 0.3);
  g.gain.setValueAtTime(0.05, t + dur - 0.04);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
}

const _DEFAULT_CHORDS = [
  { root: 110, notes: [110, 130.81, 164.81] },
  { root: 174.61, notes: [174.61, 220, 261.63] },
  { root: 130.81, notes: [130.81, 164.81, 196] },
  { root: 196, notes: [196, 246.94, 293.66] }
];

function _getChords(song) {
  if (song.chords && song.chords.length > 0) return song.chords;
  const count = Math.max(1, Math.floor(getBeatsInSong(song) / 4));
  const chords = [];
  for (let i = 0; i < count; i++) {
    chords.push(_DEFAULT_CHORDS[i % _DEFAULT_CHORDS.length]);
  }
  return chords;
}

// Real-time procedural audio state
let _procLastBeat = -1;
let _procChords = [];
let _procLeadIdx = 0;
let _procActive = false;

function startRoundAudio(ctx, song) {
  if (!ctx) return;
  _procLastBeat = -1;
  _procLeadIdx = 0;
  _procChords = _getChords(song);
  _procActive = true;

  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(440, ctx.currentTime);
    o.type = 'sine';
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.2);
  } catch(e) { console.error('Test beep failed:', e); }
}

function stopRoundAudio() {
  _procActive = false;
}

function updateProceduralAudio(ctx, song, songTime) {
  if (!ctx || !_procActive || !song) return;

  if (ctx.state === 'suspended') { ctx.resume(); return; }
  if (ctx.state === 'closed') return;

  const beatDur = 60 / song.bpm;
  const beat = Math.floor(songTime / beatDur);
  if (beat === _procLastBeat || beat < 0) return;
  _procLastBeat = beat;

  try {
    const now = ctx.currentTime;
    const bm = beat % 4;
    const ci = Math.floor(beat / 4) % _procChords.length;
    const chord = _procChords[ci];

    if (bm === 0) _pKick(ctx, now, 1.0);
    else if (bm === 2) _pKick(ctx, now, 0.7);
    if (bm === 1 || bm === 3) _pClap(ctx, now, 0.6);
    _pHat(ctx, now, 0.7);

    if (bm === 0) _pBass(ctx, chord.root, now, beatDur * 1.5);
    else if (bm === 2) _pBass(ctx, chord.root * 2, now, beatDur * 0.8);

    if (chord && chord.notes && chord.notes.length > 0) {
      const ni = _procLeadIdx % chord.notes.length;
      const oct = Math.floor(_procLeadIdx / chord.notes.length) % 2;
      const freq = chord.notes[ni] * (oct > 0 ? 2 : 1);
      _pLead(ctx, freq * 2, now, beatDur * 0.7);
      _procLeadIdx++;
    }
  } catch(e) { console.error('updateProceduralAudio error:', e); }
}
