let currentWordKey = null;
let clickCount = 0;
let audioCtx = null;

function isAudioMuted() {
  try {
    const direct = localStorage.getItem('myduo_silent_mode');
    if (direct !== null) return direct === 'true';
    const user = JSON.parse(localStorage.getItem('myduo_current_user') || 'null');
    const userId = user && user.id ? String(user.id) : (localStorage.getItem('myduo_guest_device_id') || 'guest');
    const settings = JSON.parse(localStorage.getItem(`settings_${userId}`) || '{}');
    return Boolean(settings.silentMode);
  } catch (e) {
    return false;
  }
}

function setSavedSilentMode(silent) {
  try {
    localStorage.setItem('myduo_silent_mode', silent ? 'true' : 'false');
  } catch (e) {}
}

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a cute, sweet sparkling crystal bell chime upon correct answer (Web Audio API)
 */
function playSuccessSound() {
  if (isAudioMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sweet sparkling crystal bell chord: C6 (1046.5Hz) -> E6 (1318.5Hz) -> G6 (1567.98Hz) -> C7 (2093Hz)
    const notes = [
      { freq: 1046.5, delay: 0.00, vol: 0.14 },
      { freq: 1318.5, delay: 0.04, vol: 0.15 },
      { freq: 1567.98, delay: 0.08, vol: 0.16 },
      { freq: 2093.0, delay: 0.12, vol: 0.12 },
    ];

    notes.forEach(({ freq, delay, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(vol, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.45);
    });
  } catch (e) {
    console.warn('Audio effect playback skipped:', e);
  }
}

/**
 * Plays a casino slot machine reel spinning / cascading ratchet sound (Web Audio API)
 */
function playCasinoRollSound() {
  if (isAudioMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const clickCount = 18;
    const interval = 0.045; // 45ms between clicks

    // Rapid slot machine mechanical ratchet reel ticks
    for (let i = 0; i < clickCount; i++) {
      const clickTime = now + i * interval;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Rising pitch like an accelerating/spinning mechanical slot machine wheel
      const freq = 420 + i * 42;
      osc.frequency.setValueAtTime(freq, clickTime);
      osc.frequency.exponentialRampToValueAtTime(freq + 60, clickTime + 0.03);

      gain.gain.setValueAtTime(0.001, clickTime);
      gain.gain.linearRampToValueAtTime(0.16, clickTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(clickTime);
      osc.stop(clickTime + 0.035);
    }
  } catch (e) {
    console.warn('Casino audio effect skipped:', e);
  }
}

/**
 * Plays a gentle, distinct error sound upon incorrect answer (Web Audio API)
 */
function playErrorSound() {
  if (isAudioMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Descending tone with rich harmonic buzz
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';

    // Descending frequency: 190Hz -> 95Hz
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.32);

    // Boosted volume: peak 0.28 (up from 0.12)
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.28, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn('Audio error effect playback skipped:', e);
  }
}

/**
 * Plays a triumphant celebratory fanfare sound for podium prize achievements (Web Audio API)
 */
function playFanfareSound() {
  if (isAudioMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Triumphant orchestral brass fanfare melody:
    // C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz) -> Hold majestic C6 chord (1046.5Hz + 1318.5Hz + 1567.98Hz + 2093Hz)
    const melody = [
      { freq: 523.25, time: 0.00, dur: 0.12, vol: 0.18 },
      { freq: 659.25, time: 0.13, dur: 0.12, vol: 0.20 },
      { freq: 783.99, time: 0.26, dur: 0.14, vol: 0.22 },
      { freq: 1046.50, time: 0.42, dur: 1.20, vol: 0.26 }, // Main high root
      { freq: 1318.51, time: 0.42, dur: 1.20, vol: 0.18 }, // Major third harmony
      { freq: 1567.98, time: 0.42, dur: 1.20, vol: 0.16 }, // Fifth harmony
      { freq: 2093.00, time: 0.42, dur: 1.00, vol: 0.12 }, // Sparkling octave
    ];

    melody.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Warm brassy trumpet synth
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(vol, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (e) {
    console.warn('Fanfare audio effect skipped:', e);
  }
}

let cachedVoices = [];

function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const list = window.speechSynthesis.getVoices();
      if (list && list.length > 0) {
        cachedVoices = list;
      }
    } catch (e) {}
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }
}

function getSavedVoiceGender() {
  try {
    const direct = localStorage.getItem('myduo_voice_gender');
    if (direct) return direct;
    const user = JSON.parse(localStorage.getItem('myduo_current_user') || 'null');
    const userId = user && user.id ? String(user.id) : (localStorage.getItem('myduo_guest_device_id') || 'guest');
    const settings = JSON.parse(localStorage.getItem(`settings_${userId}`) || '{}');
    return settings.voiceGender || 'female';
  } catch (e) {
    return 'female';
  }
}

function setSavedVoiceGender(gender) {
  try {
    localStorage.setItem('myduo_voice_gender', gender);
  } catch (e) {}
}

const MALE_VOICE_KEYWORDS = [
  'google uk english male', 'microsoft david', 'david', 'microsoft guy', 'guy',
  'microsoft mark', 'mark', 'daniel', 'alex', 'george', 'arthur', 'fred',
  'ryan', 'oliver', 'stefan', 'thomas', 'matthew', 'james', 'john', 'richard',
  'brian', 'steven', 'tom', 'steve', 'martin', 'male', 'en-us-x-sfg#male',
  'en-us-x-tpf#male', 'en-us-x-iom#male'
];

const FEMALE_VOICE_KEYWORDS = [
  'microsoft zira', 'zira', 'microsoft jenny', 'jenny', 'samantha', 'victoria',
  'karen', 'aria', 'susan', 'catherine', 'fiona', 'hazel', 'moira', 'tessa', 'ava',
  'allison', 'kate', 'google us english', 'google uk english female', 'female',
  'en-us-x-sfg#female', 'en-us-x-tpf#female'
];

function getPreferredVoice(gender = 'female') {
  loadVoices();
  const englishVoices = cachedVoices.filter(
    (v) => v.lang && (v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().startsWith('en-'))
  );
  if (englishVoices.length === 0) {
    if (cachedVoices.length === 0) return null;
    return cachedVoices[0];
  }

  const target = (gender || 'female').toLowerCase();

  if (target === 'male') {
    // 1. Explicit male voice match by priority
    for (const kw of MALE_VOICE_KEYWORDS) {
      const found = englishVoices.find((v) => (v.name || '').toLowerCase().includes(kw));
      if (found) return found;
    }

    // 2. Non-female voice
    const nonFemale = englishVoices.find((v) => {
      const name = (v.name || '').toLowerCase();
      return !FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
    });
    if (nonFemale) return nonFemale;

    return englishVoices[0];
  } else {
    // 1. Explicit female voice match by priority
    for (const kw of FEMALE_VOICE_KEYWORDS) {
      const found = englishVoices.find((v) => (v.name || '').toLowerCase().includes(kw));
      if (found) return found;
    }

    return englishVoices[0];
  }
}

let currentAudioPlayer = null;
const audioUrlCache = new Map();

function speakWithSpeechSynthesis(text, lang, isTurtleMode, gender) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voice = getPreferredVoice(gender);
    if (voice) {
      utterance.voice = voice;
      if (voice.lang) utterance.lang = voice.lang;
    }

    if (gender === 'male') {
      utterance.pitch = 0.70;
      utterance.rate = isTurtleMode ? 0.38 : 0.80;
    } else {
      utterance.pitch = 1.05;
      utterance.rate = isTurtleMode ? 0.40 : 0.84;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('SpeechSynthesis fallback warning:', e);
  }
}

/**
 * Speaks the given text using high-definition natural Cloud Audio,
 * with automatic fallback to SpeechSynthesis when offline.
 * Automatically switches to slow "turtle" mode on the 3rd consecutive play of the same word.
 *
 * @param {string} text - The word or text to pronounce
 * @param {string} wordId - Optional unique ID for tracking consecutive clicks
 * @param {string} lang - Language code (default 'en-US')
 * @param {string} voiceGenderOverride - Optional gender override ('male' | 'female')
 * @param {boolean} forcePlay - Play even if silent mode is enabled
 * @returns {boolean} isTurtleMode - True if playing in slow speed
 */
function speakWord(text, wordId = null, lang = 'en-US', voiceGenderOverride = null, forcePlay = false) {
  if (!text || (isAudioMuted() && !forcePlay)) {
    return false;
  }

  // 1. Stop any currently playing audio
  if (currentAudioPlayer) {
    try {
      currentAudioPlayer.pause();
      currentAudioPlayer.currentTime = 0;
    } catch (e) {}
    currentAudioPlayer = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  // 2. Track consecutive clicks for Turtle Mode (🐢 slow speed on 3rd click)
  const key = wordId || text;
  if (currentWordKey === key) {
    clickCount += 1;
  } else {
    currentWordKey = key;
    clickCount = 1;
  }

  const isTurtleMode = clickCount >= 3;
  const gender = voiceGenderOverride || getSavedVoiceGender();
  const voiceType = gender === 'male' ? 1 : 2;

  // Clean text from punctuation (punctuation like ! or ? breaks dictionary audio endpoints)
  const cleanQuery = text.replace(/[^\w\s'-]/g, ' ').replace(/\s+/g, ' ').trim() || text.trim();

  // 3. Try high-definition natural studio cloud audio stream (Type 1 = Male UK/Standard, Type 2 = Female US)
  try {
    const cloudUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanQuery)}&type=${voiceType}`;
    const audio = new Audio(cloudUrl);
    currentAudioPlayer = audio;

    // Pitch-corrected slow down in turtle mode
    audio.playbackRate = isTurtleMode ? 0.62 : 1.0;

    let hasFallbackRun = false;
    const runFallback = () => {
      if (hasFallbackRun) return;
      hasFallbackRun = true;
      speakWithSpeechSynthesis(text, lang, isTurtleMode, gender);
    };

    audio.onerror = () => {
      runFallback();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Fallback to SpeechSynthesis if network/CORS or autoplay restricted
        runFallback();
      });
    }
  } catch (err) {
    speakWithSpeechSynthesis(text, lang, isTurtleMode, gender);
  }

  return isTurtleMode;
}

let coinAudio = null;

function getCoinAudio() {
  if (!coinAudio && typeof window !== 'undefined') {
    try {
      coinAudio = new Audio('./assets/audio/coin.mp3');
      coinAudio.preload = 'auto';
    } catch (e) {
      console.warn('Failed to initialize coin audio:', e);
    }
  }
  return coinAudio;
}

/**
 * Plays the exact metallic coin sound provided by user (coin.mp3)
 */
function playCoinDropSound() {
  if (isAudioMuted()) return;
  try {
    const audio = getCoinAudio();
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('Coin audio play prevented:', e);
        });
      }
    }
  } catch (e) {
    console.warn('Coin drop sound skipped:', e);
  }
}

function resetAudioCounter() {
  currentWordKey = null;
  clickCount = 0;
}

export {
  speakWord,
  resetAudioCounter,
  playSuccessSound,
  playErrorSound,
  playCasinoRollSound,
  playCoinDropSound,
  playFanfareSound,
  setSavedVoiceGender,
  getSavedVoiceGender,
  isAudioMuted,
  setSavedSilentMode,
};
