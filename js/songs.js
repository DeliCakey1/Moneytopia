const SONGS = [
  {
    id: 'neon_nights',
    name: 'Neon Nights',
    bpm: 128,
    duration: 45,
    rootNote: 110,
    chords: [
      { root: 110, notes: [110, 130.81, 164.81] },
      { root: 130.81, notes: [130.81, 164.81, 196] },
      { root: 110, notes: [110, 130.81, 164.81] },
      { root: 130.81, notes: [130.81, 164.81, 196] },
      { root: 174.61, notes: [174.61, 220, 261.63] },
      { root: 130.81, notes: [130.81, 164.81, 196] },
      { root: 174.61, notes: [174.61, 220, 261.63] },
      { root: 146.83, notes: [146.83, 174.61, 220] },
    ],
    beatsPerChord: 4,
    drumStyle: 'four_on_floor',
    density: 0.55,
    melodyOctave: 4
  },
  {
    id: 'cyber_pulse',
    name: 'Cyber Pulse',
    bpm: 145,
    duration: 45,
    rootNote: 98,
    chords: [
      { root: 98, notes: [98, 123.47, 146.83] },
      { root: 98, notes: [98, 123.47, 146.83] },
      { root: 110, notes: [110, 130.81, 164.81] },
      { root: 110, notes: [110, 130.81, 164.81] },
      { root: 130.81, notes: [130.81, 164.81, 196] },
      { root: 130.81, notes: [130.81, 164.81, 196] },
      { root: 98, notes: [98, 123.47, 146.83] },
      { root: 146.83, notes: [146.83, 174.61, 220] },
    ],
    beatsPerChord: 4,
    drumStyle: 'heavy',
    density: 0.7,
    melodyOctave: 3
  },
  {
    id: 'dreamscape',
    name: 'Dreamscape',
    bpm: 100,
    duration: 45,
    rootNote: 130.81,
    chords: [
      { root: 130.81, notes: [130.81, 164.81, 196] },
      { root: 98, notes: [98, 123.47, 146.83] },
      { root: 110, notes: [110, 130.81, 164.81] },
      { root: 174.61, notes: [174.61, 220, 261.63] },
      { root: 130.81, notes: [130.81, 164.81, 196] },
      { root: 98, notes: [98, 123.47, 146.83] },
      { root: 110, notes: [110, 130.81, 164.81] },
      { root: 174.61, notes: [174.61, 220, 261.63] },
    ],
    beatsPerChord: 4,
    drumStyle: 'light',
    density: 0.4,
    melodyOctave: 4
  }
];

let _noiseBuffer = null;

function getNoiseBuffer(ctx) {
  if (!_noiseBuffer) {
    const len = ctx.sampleRate * 0.2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    _noiseBuffer = buf;
  }
  return _noiseBuffer;
}

function schKick(ctx, t, vol) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(30, t + 0.12);
  o.type = 'sine';
  g.gain.setValueAtTime(vol * 0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  o.start(t); o.stop(t + 0.2);
}

function schSnare(ctx, t, vol) {
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 600;
  const g = ctx.createGain();
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(vol * 0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  src.start(t); src.stop(t + 0.15);
}

function schHat(ctx, t, vol) {
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 5000;
  const g = ctx.createGain();
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(vol * 0.06, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  src.start(t); src.stop(t + 0.06);
}

function schClap(ctx, t, vol) {
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = 2000; f.Q.value = 1.5;
  const g = ctx.createGain();
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(vol * 0.1, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  src.start(t); src.stop(t + 0.1);
}

function schBassNote(ctx, freq, t, dur) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.setValueAtTime(freq, t);
  o.type = 'sawtooth';
  g.gain.setValueAtTime(0.06, t);
  g.gain.linearRampToValueAtTime(0.04, t + dur * 0.5);
  g.gain.setValueAtTime(0.04, t + dur - 0.03);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
}

function schLeadNote(ctx, freq, t, dur) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.setValueAtTime(freq, t);
  o.type = 'square';
  g.gain.setValueAtTime(0.035, t);
  g.gain.linearRampToValueAtTime(0.025, t + dur * 0.3);
  g.gain.setValueAtTime(0.025, t + dur - 0.04);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
}

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
    if (song.drumStyle === 'heavy') {
      chance = isDownbeat ? 0.85 : isStrong ? 0.7 : isOffbeat ? 0.45 : 0.25;
    } else if (song.drumStyle === 'light') {
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

    if (song.drumStyle === 'heavy' && Math.random() < 0.2) {
      const beatDur = 60 / song.bpm;
      const time = beat * beatDur + beatDur / 2;
      const lane = Math.floor(Math.random() * 4);
      notes.push({ id: id++, lane, time, hit: false, missed: false });
    }
  }

  notes.sort((a, b) => a.time - b.time);
  return notes;
}

let scheduledNodes = [];

function playSong(ctx, song, startTime) {
  const beatDur = 60 / song.bpm;
  const beats = getBeatsInSong(song);
  const chordChanges = Math.floor(beats / song.beatsPerChord);

  for (let beat = 0; beat < beats; beat++) {
    const t = startTime + beat * beatDur;
    const beatInMeasure = beat % 4;
    const chordIdx = Math.floor(beat / song.beatsPerChord) % song.chords.length;
    const chord = song.chords[chordIdx];

    if (beatInMeasure === 0) {
      schKick(ctx, t, 1.0);
    }
    if (beatInMeasure === 2) {
      schKick(ctx, t, 0.7);
    }
    if (song.drumStyle !== 'light') {
      schHat(ctx, t, 0.8);
      schHat(ctx, t + beatDur / 2, 0.5);
    } else {
      if (beatInMeasure % 2 === 0) schHat(ctx, t, 0.5);
    }
    if (song.drumStyle === 'heavy') {
      if (beatInMeasure === 2) schSnare(ctx, t, 1.0);
      if (beatInMeasure === 0) schClap(ctx, t, 0.7);
    } else {
      if (beatInMeasure === 1 || beatInMeasure === 3) {
        schClap(ctx, t, 0.6);
      }
    }

    if (beatInMeasure === 0) {
      schBassNote(ctx, chord.root, t, beatDur * 1.5);
    } else if (beatInMeasure === 2) {
      schBassNote(ctx, chord.root * 2, t, beatDur * 0.8);
    }
  }

  for (let chordIdx = 0; chordIdx < chordChanges; chordIdx++) {
    const startBeat = chordIdx * song.beatsPerChord;
    const chord = song.chords[chordIdx % song.chords.length];
    const chordStart = startTime + startBeat * beatDur;

    const arpNotes = [];
    for (let i = 0; i < 8; i++) {
      const noteIdx = i % chord.notes.length;
      const octave = Math.floor(i / chord.notes.length);
      const freq = chord.notes[noteIdx] * (octave > 0 ? 2 : 1);
      const noteTime = chordStart + i * beatDur * 0.5;
      if (noteTime - startTime < song.duration) {
        arpNotes.push({ freq, time: noteTime });
      }
    }

    for (const n of arpNotes) {
      schLeadNote(ctx, n.freq * 2, n.time, beatDur * 0.4);
    }
  }
}

function stopSong() {
  for (const n of scheduledNodes) {
    try { n.stop(); } catch (e) {}
  }
  scheduledNodes = [];
}
