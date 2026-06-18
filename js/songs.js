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
