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

const ROBOTIC_NOVELTY_VOICES = [
  'fred', 'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos',
  'deranged', 'good news', 'hysterical', 'pipe organ', 'trinoids', 'whisper',
  'zarvox', 'junior', 'ralph', 'grandma', 'grandpa', 'organ'
];

const MALE_VOICE_KEYWORDS = [
  // Android Google TTS Male high-quality engines
  'en-us-x-iom', 'en-us-x-tpf', 'en-gb-x-rjs', 'google uk english male', 'en-au-x-aub',
  'en-in-x-cfl', 'en-us-x-sfg#male', 'en-us-x-tpf#male', 'en-us-x-iom#male',
  // iOS / macOS natural Apple male voices
  'aaron', 'arthur', 'daniel', 'rishi', 'oliver', 'gordon', 'george', 'nathan', 'evan',
  // Windows / Desktop natural voices
  'microsoft david', 'david', 'microsoft guy', 'guy', 'microsoft mark', 'mark',
  'microsoft ryan', 'alex', 'matthew', 'james', 'john', 'richard', 'brian',
  'steven', 'tom', 'steve', 'martin', 'male'
];

const FEMALE_VOICE_KEYWORDS = [
  // Android Google TTS Female high-quality engines
  'google us english', 'google uk english female', 'en-us-x-sfg', 'en-us-x-tpc',
  'en-gb-x-fis', 'en-au-x-afh', 'en-us-x-sfg#female', 'en-us-x-tpf#female',
  // iOS / macOS natural Apple female voices
  'samantha', 'siri', 'karen', 'moira', 'tessa', 'fiona', 'victoria', 'ava',
  'allison', 'kate', 'serena', 'stephanie', 'zoe', 'nicky',
  // Windows / Desktop natural voices
  'microsoft zira', 'zira', 'microsoft jenny', 'jenny', 'microsoft aria', 'aria',
  'susan', 'catherine', 'hazel', 'female'
];

function getPreferredVoice(gender = 'female') {
  loadVoices();
  // Filter out non-English and legacy robotic voices
  const englishVoices = cachedVoices.filter((v) => {
    if (!v.lang || (!v.lang.toLowerCase().startsWith('en') && !v.lang.toLowerCase().startsWith('en-'))) {
      return false;
    }
    const name = (v.name || '').toLowerCase();
    return !ROBOTIC_NOVELTY_VOICES.some((rv) => name.includes(rv));
  });

  if (englishVoices.length === 0) {
    if (cachedVoices.length === 0) return null;
    return cachedVoices[0];
  }

  const target = (gender || 'female').toLowerCase();

  if (target === 'male') {
    // 1. Explicit male voice match by priority order
    for (const kw of MALE_VOICE_KEYWORDS) {
      const found = englishVoices.find((v) => (v.name || '').toLowerCase().includes(kw));
      if (found) return found;
    }

    // 2. Non-female voice fallback
    const nonFemale = englishVoices.find((v) => {
      const name = (v.name || '').toLowerCase();
      return !FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
    });
    if (nonFemale) return nonFemale;

    return englishVoices[0];
  } else {
    // 1. Explicit female voice match by priority order
    for (const kw of FEMALE_VOICE_KEYWORDS) {
      const found = englishVoices.find((v) => (v.name || '').toLowerCase().includes(kw));
      if (found) return found;
    }

    return englishVoices[0];
  }
}

/**
 * Speaks the given text using SpeechSynthesis.
 * Automatically switches to slow "turtle" mode on the 3rd consecutive play of the same word.
 *
 * @param {string} text - The word or text to pronounce (e.g. English word)
 * @param {string} wordId - Optional unique ID for tracking consecutive clicks on the same word
 * @param {string} lang - Language code (default 'en-US')
 * @param {string} voiceGenderOverride - Optional gender override ('male' | 'female')
 * @returns {boolean} isTurtleMode - True if playing in slow speed
 */
function speakWord(text, wordId = null, lang = 'en-US', voiceGenderOverride = null, forcePlay = false) {
  if (isAudioMuted() && !forcePlay) {
    return false;
  }

  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const key = wordId || text;
    if (currentWordKey === key) {
      clickCount += 1;
    } else {
      currentWordKey = key;
      clickCount = 1;
    }

    const isTurtleMode = clickCount >= 3;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const gender = voiceGenderOverride || getSavedVoiceGender();
    const voice = getPreferredVoice(gender);
    if (voice) {
      utterance.voice = voice;
      if (voice.lang) utterance.lang = voice.lang;
    }

    // Natural 1.0 pitch for 100% pure acoustic clarity without DSP robotic artifacts
    utterance.pitch = 1.0;
    utterance.rate = isTurtleMode ? 0.40 : (gender === 'male' ? 0.82 : 0.84);

    window.speechSynthesis.speak(utterance);

    return isTurtleMode;
  } catch (e) {
    console.warn('SpeechSynthesis speak warning:', e);
    return false;
  }
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
  setSavedVoiceGender,
  getSavedVoiceGender,
  isAudioMuted,
  setSavedSilentMode,
};
