let currentWordKey = null;
let clickCount = 0;
let audioCtx = null;

function isAudioMuted() {
  return false;
}

function setSavedSilentMode(silent) {
  // pronunciation is always enabled
}

function isSfxMuted() {
  try {
    const directSfx = localStorage.getItem('myduo_sfx_muted');
    if (directSfx !== null) return directSfx === 'true';
    const user = JSON.parse(localStorage.getItem('myduo_current_user') || 'null');
    const userId = user && user.id ? String(user.id) : (localStorage.getItem('myduo_guest_device_id') || 'guest');
    const settings = JSON.parse(localStorage.getItem(`settings_${userId}`) || '{}');
    return Boolean(settings.sfxMuted);
  } catch (e) {
    return false;
  }
}

function setSavedSfxMuted(muted) {
  try {
    localStorage.setItem('myduo_sfx_muted', muted ? 'true' : 'false');
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
  if (isAudioMuted() || isSfxMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sweet sparkling crystal bell chord (whisper-soft volume): C6 (1046.5Hz) -> E6 (1318.5Hz) -> G6 (1567.98Hz) -> C7 (2093Hz)
    const notes = [
      { freq: 1046.5, delay: 0.00, vol: 0.02 },
      { freq: 1318.5, delay: 0.04, vol: 0.022 },
      { freq: 1567.98, delay: 0.08, vol: 0.025 },
      { freq: 2093.0, delay: 0.12, vol: 0.018 },
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
  if (isAudioMuted() || isSfxMuted()) return;
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
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(200);
    } catch (e) {}
  }
  if (isAudioMuted() || isSfxMuted()) return;
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
  if (isAudioMuted() || isSfxMuted()) return;
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

function getSavedVoiceAccent() {
  try {
    const direct = localStorage.getItem('myduo_voice_accent');
    if (direct) return direct;
    const gender = localStorage.getItem('myduo_voice_gender');
    if (gender === 'male' || gender === 'uk') return 'uk';
    const user = JSON.parse(localStorage.getItem('myduo_current_user') || 'null');
    const userId = user && user.id ? String(user.id) : (localStorage.getItem('myduo_guest_device_id') || 'guest');
    const settings = JSON.parse(localStorage.getItem(`settings_${userId}`) || '{}');
    return settings.voiceAccent || (settings.voiceGender === 'male' ? 'uk' : 'us');
  } catch (e) {
    return 'us';
  }
}

function setSavedVoiceAccent(accent) {
  try {
    localStorage.setItem('myduo_voice_accent', accent);
    localStorage.setItem('myduo_voice_gender', accent === 'uk' ? 'male' : 'female');
  } catch (e) {}
}

function getSavedVoiceGender() {
  return getSavedVoiceAccent();
}

function setSavedVoiceGender(gender) {
  setSavedVoiceAccent(gender === 'male' || gender === 'uk' ? 'uk' : 'us');
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

  if (target === 'male' || target === 'uk') {
    // 1. Explicit male / British voice match by priority
    for (const kw of MALE_VOICE_KEYWORDS) {
      const found = englishVoices.find((v) => (v.name || '').toLowerCase().includes(kw));
      if (found) return found;
    }

    const ukVoice = englishVoices.find((v) => (v.lang || '').toLowerCase().includes('gb') || (v.lang || '').toLowerCase().includes('uk'));
    if (ukVoice) return ukVoice;

    return englishVoices[0];
  } else {
    // 1. Explicit female / US voice match by priority
    for (const kw of FEMALE_VOICE_KEYWORDS) {
      const found = englishVoices.find((v) => (v.name || '').toLowerCase().includes(kw));
      if (found) return found;
    }

    return englishVoices[0];
  }
}

let currentAudioPlayer = null;
const audioCache = new Map();

function getAudioUrls(text, isUk) {
  const cleanQuery = text.replace(/[^\w\s'-]/g, ' ').replace(/\s+/g, ' ').trim() || text.trim();
  const langCode = isUk ? 'en-GB' : 'en-US';
  const voiceType = isUk ? 1 : 2;

  return {
    primary: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(cleanQuery)}`,
    fallback: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanQuery)}&type=${voiceType}`,
    cleanQuery,
    langCode,
  };
}

/**
 * Preloads audio in the background so that clicking or flipping cards has 0ms latency.
 */
function preloadWordAudio(text, voiceAccentOverride = null) {
  if (!text || typeof window === 'undefined') return;
  try {
    const accent = voiceAccentOverride || getSavedVoiceAccent();
    const isUk = accent === 'uk' || accent === 'gb' || accent === 'male';
    const { primary, cleanQuery } = getAudioUrls(text, isUk);
    const cacheKey = `${cleanQuery}_${isUk ? 'uk' : 'us'}`;

    if (audioCache.has(cacheKey)) return;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = primary;

    if (audioCache.size > 80) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, audio);
  } catch (e) {}
}

let sharedWordAudioPlayer = null;

function getSharedWordAudioPlayer() {
  if (!sharedWordAudioPlayer && typeof window !== 'undefined') {
    sharedWordAudioPlayer = new Audio();
    sharedWordAudioPlayer.preload = 'auto';
  }
  return sharedWordAudioPlayer;
}

function speakWithSpeechSynthesis(text, lang, isTurtleMode, gender) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (typeof navigator !== 'undefined' && navigator.onLine) return; // Do not use robot voice when online
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || 'en-US';

    const voice = getPreferredVoice(gender);
    if (voice) {
      utterance.voice = voice;
      if (voice.lang) utterance.lang = voice.lang;
    }

    if (gender === 'male' || gender === 'uk') {
      utterance.pitch = 0.95;
      utterance.rate = isTurtleMode ? 0.45 : 0.88;
    } else {
      utterance.pitch = 1.02;
      utterance.rate = isTurtleMode ? 0.45 : 0.90;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}

/**
 * Speaks the given text exclusively with high-definition studio cloud audio,
 * supporting British and American accents without any dual-voice overlap.
 */
function speakWord(text, wordId = null, lang = null, voiceAccentOverride = null, forcePlay = false) {
  if (!text || (isAudioMuted() && !forcePlay)) {
    return false;
  }

  // 1. Unconditionally kill any robotic voice and previous audio to guarantee only 1 voice plays
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  const player = getSharedWordAudioPlayer();
  if (player) {
    try {
      player.pause();
      player.currentTime = 0;
    } catch (e) {}
  }

  // 2. Track consecutive clicks for Turtle Mode (🐢 slow speed on 3rd click, then alternating fast/slow)
  const key = wordId || text;
  if (currentWordKey === key) {
    clickCount += 1;
  } else {
    currentWordKey = key;
    clickCount = 1;
  }

  const isTurtleMode = clickCount >= 3 && (clickCount % 2 === 1);
  const accent = voiceAccentOverride || getSavedVoiceAccent();
  const isUk = accent === 'uk' || accent === 'gb' || accent === 'male';
  const targetLang = lang || (isUk ? 'en-GB' : 'en-US');

  const { primary, fallback } = getAudioUrls(text, isUk);

  if (!player) {
    speakWithSpeechSynthesis(text, targetLang, isTurtleMode, isUk ? 'uk' : 'us');
    return isTurtleMode;
  }

  try {
    player.playbackRate = isTurtleMode ? 0.62 : 1.0;
    player.src = primary;
    player.currentTime = 0;

    let hasTriedFallback = false;

    player.onerror = () => {
      if (!hasTriedFallback) {
        hasTriedFallback = true;
        player.src = fallback;
        player.currentTime = 0;
        player.play().catch(() => {
          speakWithSpeechSynthesis(text, targetLang, isTurtleMode, isUk ? 'uk' : 'us');
        });
      } else {
        speakWithSpeechSynthesis(text, targetLang, isTurtleMode, isUk ? 'uk' : 'us');
      }
    };

    const playPromise = player.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // AbortError happens when user taps quickly — ignore it cleanly without playing robot voice
        if (err && err.name === 'AbortError') return;

        if (!hasTriedFallback) {
          hasTriedFallback = true;
          player.src = fallback;
          player.currentTime = 0;
          player.play().catch(() => {
            speakWithSpeechSynthesis(text, targetLang, isTurtleMode, isUk ? 'uk' : 'us');
          });
        }
      });
    }
  } catch (err) {
    speakWithSpeechSynthesis(text, targetLang, isTurtleMode, isUk ? 'uk' : 'us');
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
  if (isAudioMuted() || isSfxMuted()) return;
  try {
    const audio = getCoinAudio();
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.4;
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

/**
 * Plays a mechanical stopwatch ticking sound (Web Audio API)
 */
function playStopwatchTickSound(isUrgent = false) {
  if (isAudioMuted() || isSfxMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isUrgent ? 'sawtooth' : 'triangle';
    const freq = isUrgent ? 1100 : 820;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.035);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(isUrgent ? 0.24 : 0.16, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  } catch (e) {
    console.warn('Tick audio skipped:', e);
  }
}

/**
 * Plays a funny comic synthesized fart sound upon pairs timeout failure (Web Audio API)
 */
function playFartSound() {
  if (isAudioMuted() || isSfxMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Low frequency carrier oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(108, now);
    osc.frequency.linearRampToValueAtTime(76, now + 0.18);
    osc.frequency.linearRampToValueAtTime(88, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.68);

    // 2. LFO for fluttering/rippling vibration effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sawtooth';
    lfo.frequency.setValueAtTime(32, now);
    lfo.frequency.linearRampToValueAtTime(22, now + 0.68);
    lfoGain.gain.setValueAtTime(42, now);
    lfo.connect(osc.frequency);

    // 3. Lowpass filter with juicy resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, now);
    filter.frequency.exponentialRampToValueAtTime(140, now + 0.68);
    filter.Q.setValueAtTime(4.2, now);

    oscGain.gain.setValueAtTime(0.01, now);
    oscGain.gain.linearRampToValueAtTime(0.48, now + 0.04);
    oscGain.gain.linearRampToValueAtTime(0.38, now + 0.35);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.68);
    osc.stop(now + 0.68);
  } catch (e) {
    console.warn('Fart audio effect skipped:', e);
  }
}

function resetAudioCounter() {
  currentWordKey = null;
  clickCount = 0;
}

const playAudio = speakWord;

export {
  speakWord,
  playAudio,
  preloadWordAudio,
  resetAudioCounter,
  playSuccessSound,
  playErrorSound,
  playCasinoRollSound,
  playCoinDropSound,
  playFanfareSound,
  playStopwatchTickSound,
  playFartSound,
  setSavedVoiceGender,
  getSavedVoiceGender,
  setSavedVoiceAccent,
  getSavedVoiceAccent,
  isAudioMuted,
  setSavedSilentMode,
  isSfxMuted,
  setSavedSfxMuted,
};
