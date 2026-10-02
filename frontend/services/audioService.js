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

function triggerHaptic(type = 'light') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(22);
      else if (type === 'success') navigator.vibrate([12, 35, 18]);
      else if (type === 'error') navigator.vibrate([30, 40, 30]);
    } catch (e) {}
  }
}

let lastSuccessSoundTime = 0;

/**
 * Plays a cute, sweet sparkling crystal bell chime upon correct answer (Web Audio API)
 */
function playSuccessSound() {
  triggerHaptic('success');
  if (isAudioMuted() || isSfxMuted()) return;
  const nowMs = Date.now();
  if (nowMs - lastSuccessSoundTime < 600) return;
  lastSuccessSoundTime = nowMs;
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
 * Plays a triumphant celebratory fanfare sound for podium prize achievements / round completion (Web Audio API)
 */
function playFanfareSound() {
  if (isAudioMuted() || isSfxMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Victory Fanfare: Triplet G4 -> C5 -> E5 -> G5 -> C6 Big Brass & Grand Chord
    const notes = [
      { f: 392.00, t: 0.00, d: 0.12, v: 0.18, type: 'triangle' },
      { f: 523.25, t: 0.11, d: 0.12, v: 0.20, type: 'triangle' },
      { f: 659.25, t: 0.22, d: 0.14, v: 0.22, type: 'triangle' },
      { f: 783.99, t: 0.35, d: 0.16, v: 0.24, type: 'triangle' },
      // Grand chord
      { f: 1046.50, t: 0.50, d: 1.00, v: 0.28, type: 'triangle' },
      { f: 523.25, t: 0.50, d: 1.00, v: 0.20, type: 'triangle' },
      { f: 659.25, t: 0.50, d: 1.00, v: 0.18, type: 'triangle' },
      { f: 783.99, t: 0.50, d: 1.00, v: 0.16, type: 'triangle' }
    ];

    notes.forEach(({ f, t, d, v, type }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type || 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.linearRampToValueAtTime(v, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d);
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

const CDN_AUDIO_BASE = 'https://english-breakfast.pages.dev/assets/audio';
const AUDIO_CACHE_NAME = 'myduo_audio_cache_v1';

function getAudioUrls(text, isUk) {
  const cleanQuery = text.replace(/[^\w\s'-]/g, ' ').replace(/\s+/g, ' ').trim() || text.trim();
  const langCode = isUk ? 'en-GB' : 'en-US';
  const voiceType = isUk ? 1 : 2;
  const accentFolder = isUk ? 'uk' : 'us';

  const cleanFilename = text.toLowerCase().trim()
    .replace(/[^a-z0-9\s'-]/g, '')
    .replace(/\s+/g, '_');
  const localPath = `./assets/audio/${accentFolder}/${cleanFilename}.mp3`;
  const cdnPath = `${CDN_AUDIO_BASE}/${accentFolder}/${cleanFilename}.mp3`;

  return {
    local: localPath,
    cdn: cdnPath,
    primary: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(cleanQuery)}`,
    fallback: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanQuery)}&type=${voiceType}`,
    cleanQuery,
    langCode,
    cleanFilename,
    accentFolder,
  };
}

/**
 * Cache audio response in CacheStorage for instant subsequent offline playback
 */
async function cacheAudioOnline(url) {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const match = await cache.match(url);
    if (!match) {
      const resp = await fetch(url, { mode: 'cors' });
      if (resp.ok) {
        await cache.put(url, resp);
      }
    }
  } catch (e) {}
}

/**
 * Plays audio from CacheStorage blob if available offline, otherwise streams from CDN
 */
async function playAudioWithCacheFallback(targetAudio, cdnUrl, onFail) {
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const match = await cache.match(cdnUrl);
      if (match) {
        const blob = await match.blob();
        targetAudio.src = URL.createObjectURL(blob);
        targetAudio.currentTime = 0;
        trackPlayingAudio(targetAudio);
        const p = targetAudio.play();
        if (p !== undefined) p.catch(() => onFail());
        return;
      }
    } catch (e) {}
  }
  targetAudio.src = cdnUrl;
  targetAudio.currentTime = 0;
  trackPlayingAudio(targetAudio);
  const p = targetAudio.play();
  if (p !== undefined) {
    p.then(() => cacheAudioOnline(cdnUrl)).catch(() => onFail());
  }
}

/**
 * Check if a pack is downloaded
 */
function isVoicePackDownloaded(accent = 'us') {
  if (accent === 'us' || accent === 'us_base') return true; // Pre-packaged in APK!
  try {
    return localStorage.getItem(`myduo_pack_${accent}_downloaded`) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Check if audio for a specific category is already downloaded (or pre-packaged)
 */
function isCategoryAudioDownloaded(accent = 'us', category = 'Elementary') {
  const norm = String(category || '').toLowerCase().trim();
  const isUk = accent === 'uk' || accent === 'gb' || accent === 'male';
  const targetAccent = isUk ? 'uk' : 'us';
  if (norm.includes('elementary')) {
    // US Elementary is pre-packaged in APK; UK Elementary must be downloaded
    if (!isUk) return true;
  }

  try {
    return localStorage.getItem(`myduo_cat_downloaded_${targetAccent}_${norm}`) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Download voice pack in background with progress callback
 */
async function downloadVoicePack(accent = 'us', wordList = [], onProgress = () => {}) {
  if (typeof window === 'undefined' || !('caches' in window)) {
    throw new Error('Cache API not supported');
  }
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const words = Array.isArray(wordList) && wordList.length > 0 ? wordList : [];
  if (words.length === 0) return { downloaded: 0, total: 0 };

  const isUk = accent === 'uk' || accent === 'gb' || accent === 'male';
  const targetAccent = isUk ? 'uk' : 'us';
  let completed = 0;
  const total = words.length;
  const batchSize = 12;

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (w) => {
        const wordText = typeof w === 'string' ? w : (w.word || '');
        if (!wordText) return;
        const { cdn, fallback } = getAudioUrls(wordText, isUk);
        try {
          const match = await cache.match(cdn);
          if (!match) {
            let resp = null;
            try {
              resp = await fetch(cdn, { mode: 'cors' });
            } catch (e) {}
            if (!resp || !resp.ok) {
              try {
                resp = await fetch(fallback, { mode: 'cors' });
              } catch (e) {}
            }
            if (resp && resp.ok) {
              await cache.put(cdn, resp);
            }
          }
        } catch (e) {}
        completed++;
        onProgress(Math.round((completed / total) * 100), completed, total);
      })
    );
  }

  localStorage.setItem(`myduo_pack_${accent}_downloaded`, 'true');
  return { downloaded: completed, total };
}

/**
 * Download voice pack for a specific category
 */
async function downloadCategoryVoicePack(accent = 'us', category = 'Pattern', wordList = [], onProgress = () => {}) {
  const norm = String(category || '').toLowerCase().trim();
  const isUk = accent === 'uk' || accent === 'gb' || accent === 'male';
  const targetAccent = isUk ? 'uk' : 'us';
  const res = await downloadVoicePack(targetAccent, wordList, onProgress);
  try {
    localStorage.setItem(`myduo_cat_downloaded_${targetAccent}_${norm}`, 'true');
  } catch (e) {}
  return res;
}

/**
 * Preloads audio in the background so that clicking or flipping cards has 0ms latency.
 */
function preloadWordAudio(text, voiceAccentOverride = null) {
  if (!text || typeof window === 'undefined') return;
  try {
    const accent = voiceAccentOverride || getSavedVoiceAccent();
    const isUk = accent === 'uk' || accent === 'gb' || accent === 'male';
    const { local, cleanQuery } = getAudioUrls(text, isUk);
    const cacheKey = `${cleanQuery}_${isUk ? 'uk' : 'us'}`;

    if (audioCache.has(cacheKey)) return;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = local;

    if (audioCache.size > 80) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, audio);
  } catch (e) {}
}

let sharedWordAudioPlayer = null;
let currentPlayingWordAudio = null;
let activeAutoplayAudio = null;

function trackPlayingAudio(audio) {
  currentPlayingWordAudio = audio;
  if (!audio) return;
  const clear = () => {
    if (currentPlayingWordAudio === audio) {
      currentPlayingWordAudio = null;
    }
  };
  audio.addEventListener('ended', clear, { once: true });
  audio.addEventListener('pause', clear, { once: true });
  audio.addEventListener('error', clear, { once: true });
}

function getSharedWordAudioPlayer() {
  if (!sharedWordAudioPlayer && typeof window !== 'undefined') {
    sharedWordAudioPlayer = new Audio();
    sharedWordAudioPlayer.preload = 'auto';
  }
  return sharedWordAudioPlayer;
}

function speakWithSpeechSynthesis(text, lang, isTurtleMode, gender) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
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

  // 2. Track consecutive clicks for Turtle Mode (🐢 slow speed on every 3rd playback: 3, 6, 9...)
  try {
    const user = JSON.parse(localStorage.getItem('myduo_current_user') || 'null');
    const userId = user && user.id ? String(user.id) : (localStorage.getItem('myduo_guest_device_id') || 'guest');
    const audioKey = `myduo_audio_clicks_${userId}`;
    localStorage.setItem(audioKey, String(Number(localStorage.getItem(audioKey) || 0) + 1));
  } catch (e) {}

  const key = wordId || text;
  if (currentWordKey === key) {
    clickCount += 1;
  } else {
    currentWordKey = key;
    clickCount = 1;
  }

  const isTurtleMode = clickCount > 0 && (clickCount % 3 === 0);
  const accent = voiceAccentOverride || getSavedVoiceAccent();
  const isUk = accent === 'uk' || accent === 'gb' || accent === 'male';
  const targetLang = lang || (isUk ? 'en-GB' : 'en-US');

  const { local, cdn, primary, fallback, cleanQuery } = getAudioUrls(text, isUk);
  const cacheKey = `${cleanQuery}_${isUk ? 'uk' : 'us'}`;
  const cachedAudio = audioCache.get(cacheKey);
  if (cachedAudio) {
    if (player) {
      try { player.pause(); } catch (e) {}
    }
    try {
      cachedAudio.playbackRate = isTurtleMode ? 0.62 : 1.0;
      trackPlayingAudio(cachedAudio);
      
      let fallbackStage = 0; // 0 = local, 1 = cdn, 2 = primary, 3 = fallback, 4 = speech synthesis
      cachedAudio.onerror = () => {
        if (fallbackStage === 0) {
          fallbackStage = 1;
          playAudioWithCacheFallback(cachedAudio, cdn, () => cachedAudio.onerror());
        } else if (fallbackStage === 1) {
          fallbackStage = 2;
          cachedAudio.src = primary;
          cachedAudio.currentTime = 0;
          trackPlayingAudio(cachedAudio);
          cachedAudio.play().catch(() => cachedAudio.onerror());
        } else if (fallbackStage === 2) {
          fallbackStage = 3;
          cachedAudio.src = fallback;
          cachedAudio.currentTime = 0;
          trackPlayingAudio(cachedAudio);
          cachedAudio.play().catch(() => cachedAudio.onerror());
        } else {
          speakWithSpeechSynthesis(text, targetLang, isTurtleMode, isUk ? 'uk' : 'us');
        }
      };

      const playPromise = cachedAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err && err.name === 'AbortError') return;
          if (fallbackStage === 0) {
            fallbackStage = 1;
            playAudioWithCacheFallback(cachedAudio, cdn, () => cachedAudio.onerror());
          }
        });
      }
    } catch (e) {
      speakWithSpeechSynthesis(text, targetLang, isTurtleMode, isUk ? 'uk' : 'us');
    }
    return isTurtleMode;
  }

  if (!player) {
    speakWithSpeechSynthesis(text, targetLang, isTurtleMode, isUk ? 'uk' : 'us');
    return isTurtleMode;
  }

  try {
    player.playbackRate = isTurtleMode ? 0.62 : 1.0;
    player.src = local;
    player.currentTime = 0;
    trackPlayingAudio(player);

    let fallbackStage = 0; // 0 = local, 1 = cdn, 2 = primary, 3 = fallback, 4 = speech synthesis

    player.onerror = () => {
      if (fallbackStage === 0) {
        fallbackStage = 1;
        playAudioWithCacheFallback(player, cdn, () => player.onerror());
      } else if (fallbackStage === 1) {
        fallbackStage = 2;
        player.src = primary;
        player.currentTime = 0;
        trackPlayingAudio(player);
        player.play().catch(() => player.onerror());
      } else if (fallbackStage === 2) {
        fallbackStage = 3;
        player.src = fallback;
        player.currentTime = 0;
        trackPlayingAudio(player);
        player.play().catch(() => player.onerror());
      } else {
        speakWithSpeechSynthesis(text, targetLang, isTurtleMode, isUk ? 'uk' : 'us');
      }
    };

    const playPromise = player.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err && err.name === 'AbortError') return;
        if (fallbackStage === 0) {
          fallbackStage = 1;
          playAudioWithCacheFallback(player, cdn, () => player.onerror());
        }
      });
    }
  } catch (e) {
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

function isWordAudioPlaying() {
  if (currentPlayingWordAudio && !currentPlayingWordAudio.paused && !currentPlayingWordAudio.ended && currentPlayingWordAudio.currentTime > 0) {
    return true;
  }
  const player = sharedWordAudioPlayer;
  if (player && !player.paused && !player.ended && player.currentTime > 0) {
    return true;
  }
  if (activeAutoplayAudio && !activeAutoplayAudio.paused && !activeAutoplayAudio.ended && activeAutoplayAudio.currentTime > 0) {
    return true;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.speaking) return true;
  }
  return false;
}

function resetAudioCounter() {
  currentWordKey = null;
  clickCount = 0;
}

let sharedAutoplayAudio = null;

function getAutoplayAudio() {
  if (!sharedAutoplayAudio && typeof window !== 'undefined') {
    try {
      sharedAutoplayAudio = new Audio();
      sharedAutoplayAudio.preload = 'auto';
    } catch (e) {}
  }
  return sharedAutoplayAudio;
}

/**
 * Primes and unlocks audio context and speech synthesis during user gesture (e.g. tapping "Слушать")
 */
function primeAudioForAutoplay() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (e) {}

  try {
    const audio = getAutoplayAudio();
    if (audio) {
      audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(() => {});
      }
    }
  } catch (e) {}

  if ('speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0.01;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
}

function stopAllAudio() {
  if (activeAutoplayAudio) {
    try {
      activeAutoplayAudio.pause();
      activeAutoplayAudio.currentTime = 0;
    } catch (e) {}
    activeAutoplayAudio = null;
  }
  if (sharedAutoplayAudio) {
    try {
      sharedAutoplayAudio.pause();
      sharedAutoplayAudio.currentTime = 0;
    } catch (e) {}
  }
  if (sharedWordAudioPlayer) {
    try {
      sharedWordAudioPlayer.pause();
      sharedWordAudioPlayer.currentTime = 0;
    } catch (e) {}
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  }
}

/**
 * Intelligently scores and selects the most natural, human-sounding neural voice
 * for the target language, heavily prioritizing Neural/Natural voices (Edge Natural, Chrome Google Neural, Apple Siri)
 * and filtering out robotic legacy desktop voices (like Microsoft Irina / Pavel SAPI).
 */
function getPreferredVoiceForTargetLang(langCode = 'ru', fullLang = 'ru-RU', preferredGender = 'female') {
  loadVoices();
  const voices = (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.getVoices().length > 0)
    ? window.speechSynthesis.getVoices()
    : cachedVoices;

  if (!voices || voices.length === 0) return { voice: null, isRobotic: false };

  const targetCode = (langCode || 'ru').toLowerCase().trim();
  const fullCode = (fullLang || 'ru-RU').toLowerCase().trim();
  const targetGender = (preferredGender || 'female').toLowerCase();

  const candidates = voices.filter(v => {
    if (!v.lang) return false;
    const l = v.lang.toLowerCase().replace('_', '-');
    return l === fullCode || l.startsWith(targetCode + '-') || l === targetCode;
  });

  if (candidates.length === 0) return { voice: null, isRobotic: false };

  function scoreVoice(v) {
    const name = (v.name || '').toLowerCase();
    const l = (v.lang || '').toLowerCase().replace('_', '-');
    let pts = 0;

    // 1. Extreme bonus for Modern Neural / Natural voices (Edge Natural, Windows 11 Neural, Chrome Neural)
    if (name.includes('natural')) pts += 160;
    if (name.includes('neural')) pts += 140;
    if (name.includes('online')) pts += 120;

    // 2. High bonus for Google Cloud / Android Speech Services / Apple Siri / Yandex
    if (name.includes('google')) pts += 100;
    if (name.includes('premium') || name.includes('enhanced')) pts += 80;
    if (name.includes('siri') || name.includes('yandex') || name.includes('alisa')) pts += 70;

    // 3. Gender matching bonus
    const isMaleKeyword = name.includes('dmitriy') || name.includes('david') || name.includes('pavel') || name.includes('guy') || name.includes('filipp') || name.includes('maxim') || name.includes('male');
    const isFemaleKeyword = name.includes('svetlana') || name.includes('daria') || name.includes('zira') || name.includes('irina') || name.includes('tatyana') || name.includes('milena') || name.includes('alena') || name.includes('female');

    if (targetGender === 'male' || targetGender === 'uk') {
      if (isMaleKeyword) pts += 40;
      if (isFemaleKeyword) pts -= 20;
    } else {
      if (isFemaleKeyword) pts += 40;
      if (isMaleKeyword) pts -= 20;
    }

    // 4. Heavy penalty for legacy robotic SAPI / Desktop synthesizer voices (Irina, Pavel, etc.)
    if (name.includes('desktop') || name.includes('irina') || name.includes('pavel') || name.includes('sapi')) {
      pts -= 90;
    }

    // 5. Exact locale match bonus
    if (l === fullCode) pts += 15;
    if (v.default) pts += 5;

    return pts;
  }

  candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));
  const bestVoice = candidates[0];
  const isRobotic = scoreVoice(bestVoice) <= 0;

  return { voice: bestVoice, isRobotic };
}

/**
 * Speaks arbitrary text in specified language (e.g. 'ru', 'uk', 'en') and returns a Promise that resolves ONLY when speech completely ends.
 */
function speakTextInLangAsync(text, langCode = 'ru') {
  return new Promise((resolve) => {
    if (!text || typeof window === 'undefined') {
      return resolve();
    }

    stopAllAudio();

    // Sanitize punctuation for TTS: do NOT pronounce signs (commas, brackets, dashes, slashes, etc.)
    // Convert brackets, slashes, and standalone dashes into commas/dots so TTS naturally breathes and pauses without vocalizing sign names
    let clean = String(text);
    // 1. Remove quotes and decorative marks
    clean = clean.replace(/["'«»`“”„]/g, '');
    // 2. Replace slashes, semicolons, colons, vertical bars with commas for natural pause (avoids saying "дробь" / "слэш")
    clean = clean.replace(/[\/\\;:|]/g, ', ');
    // 3. Replace standalone dashes or em-dashes (surrounded by spaces) with comma for natural pause (avoids saying "тире")
    // while preserving word-internal hyphens like "кем-то", "кое-кто", "из-за"
    clean = clean.replace(/\s+[-–—]+\s+/g, ', ');
    clean = clean.replace(/(^|\s)[-–—]+/g, '$1, ');
    clean = clean.replace(/[-–—]+(\s|$)/g, ', $1');
    // 4. Replace brackets/parentheses with commas so speech engine pauses naturally around explanations without saying "скобка"
    clean = clean.replace(/[\(\)\[\]\{\}]/g, ', ');
    // 5. Remove symbols that could be vocalized as words
    clean = clean.replace(/[_*~^#@<>=+]/g, ' ');
    // 6. Clean up duplicate punctuation and spacing
    clean = clean.replace(/\s+([,.:!?])/g, '$1');
    clean = clean.replace(/,\s*,+/g, ',');
    clean = clean.replace(/\.\s*\.+/g, '.');
    clean = clean.replace(/,\s*\./g, '.');
    clean = clean.replace(/\.\s*,/g, '.');
    clean = clean.replace(/[!?]\s*,\s*/g, ' ');
    // 7. Ensure space after punctuation
    clean = clean.replace(/,([^\s])/g, ', $1');
    clean = clean.replace(/\.([^\s])/g, '. $1');
    // 8. Trim leading/trailing punctuation and whitespace
    clean = clean.replace(/^[\s,.-]+|[\s,.-]+$/g, '').trim();
    clean = clean.replace(/\s+/g, ' ');

    if (!clean) return resolve();

    const spokenText = clean;

    const BCP47_LANG_MAP = {
      ru: 'ru-RU',
      uk: 'uk-UA',
      en: 'en-US',
      de: 'de-DE',
      es: 'es-ES',
      fr: 'fr-FR',
      pl: 'pl-PL',
      tr: 'tr-TR',
      it: 'it-IT',
      ro: 'ro-RO',
      bg: 'bg-BG',
      hu: 'hu-HU',
      el: 'el-GR',
      da: 'da-DK',
      ga: 'ga-IE',
      lv: 'lv-LV',
      lt: 'lt-LT',
      pt: 'pt-PT',
      sk: 'sk-SK',
      sl: 'sl-SI',
      fi: 'fi-FI',
      hr: 'hr-HR',
      cs: 'cs-CZ',
      sv: 'sv-SE',
      et: 'et-EE',
      mt: 'mt-MT',
    };
    const normLang = String(langCode || 'ru').toLowerCase().trim();
    const fullLang = BCP47_LANG_MAP[normLang] || (normLang.includes('-') ? normLang : `${normLang}-${normLang.toUpperCase()}`);

    let resolved = false;
    let resumeInterval = null;

    const finish = () => {
      if (!resolved) {
        resolved = true;
        if (resumeInterval) {
          clearInterval(resumeInterval);
          resumeInterval = null;
        }
        window.__activeSpeechUtterance = null;
        if (window.__activeSpeechTimer) {
          clearTimeout(window.__activeSpeechTimer);
          window.__activeSpeechTimer = null;
        }
        setTimeout(resolve, 350); // 350ms guaranteed natural cadence gap
      }
    };

    function playNetworkTts(onFail = null) {
      if (resolved) return;
      try {
        const audio = getAutoplayAudio() || new Audio();
        activeAutoplayAudio = audio;
        audio.playbackRate = 1.0;

        // Primary online TTS: Google Translate modern TTS provides natural neural cloud voice
        const googleUrl1 = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(normLang)}&client=gtx&q=${encodeURIComponent(spokenText)}`;
        const googleUrl2 = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(normLang)}&client=tw-ob&q=${encodeURIComponent(spokenText)}`;

        let triedFallback = false;
        audio.src = googleUrl1;
        audio.currentTime = 0;

        const maxDurationMs = Math.max(5000, spokenText.length * 220);
        const fallbackTimer = setTimeout(finish, maxDurationMs);
        window.__activeSpeechTimer = fallbackTimer;

        audio.onended = () => {
          clearTimeout(fallbackTimer);
          finish();
        };

        const tryFallbackOrFinish = () => {
          if (!triedFallback) {
            triedFallback = true;
            try {
              audio.src = googleUrl2;
              audio.currentTime = 0;
              const p2 = audio.play();
              if (p2 !== undefined) {
                p2.catch(() => {
                  clearTimeout(fallbackTimer);
                  if (typeof onFail === 'function') onFail();
                  else finish();
                });
              }
            } catch (e) {
              clearTimeout(fallbackTimer);
              if (typeof onFail === 'function') onFail();
              else finish();
            }
          } else {
            clearTimeout(fallbackTimer);
            if (typeof onFail === 'function') onFail();
            else finish();
          }
        };

        audio.onerror = tryFallbackOrFinish;

        const p = audio.play();
        if (p !== undefined) {
          p.catch(tryFallbackOrFinish);
        }
      } catch (e) {
        if (typeof onFail === 'function') onFail();
        else finish();
      }
    }

    function speakWithSynthesis(voice) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return playNetworkTts();
      }
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = fullLang;
        utterance.rate = 1.0; // Steady, natural, unhurried cadence matching normal human speech
        utterance.pitch = (gender === 'male' || gender === 'uk') ? 0.98 : 1.0;
        if (voice) {
          utterance.voice = voice;
          if (voice.lang) utterance.lang = voice.lang;
        }

        // Global reference to prevent Chrome garbage-collection bug
        window.__activeSpeechUtterance = utterance;

        utterance.onend = finish;
        utterance.onerror = () => {
          if (resumeInterval) {
            clearInterval(resumeInterval);
            resumeInterval = null;
          }
          if (window.__activeSpeechTimer) {
            clearTimeout(window.__activeSpeechTimer);
            window.__activeSpeechTimer = null;
          }
          window.__activeSpeechUtterance = null;
          playNetworkTts();
        };

        // iOS keep-alive while speech synthesis runs
        resumeInterval = setInterval(() => {
          if (window.speechSynthesis && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 200);

        const expectedMs = Math.max(3500, spokenText.length * 180);
        window.__activeSpeechTimer = setTimeout(finish, expectedMs);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        playNetworkTts();
      }
    }

    const gender = getSavedVoiceGender();
    const { voice: matchedVoice, isRobotic } = getPreferredVoiceForTargetLang(normLang, fullLang, gender);

    // If only legacy robotic desktop synthesizer voices (like Windows Microsoft Irina) are installed,
    // play Google Cloud neural online audio first so speech sounds human and warm!
    // If offline, it smoothly falls back to local synthesis.
    if (isRobotic) {
      playNetworkTts(() => {
        speakWithSynthesis(matchedVoice);
      });
      return;
    }

    if (matchedVoice) {
      speakWithSynthesis(matchedVoice);
      return;
    }

    // No voice in local list, use network TTS
    playNetworkTts();
  });
}

/**
 * Speaks an English word asynchronously and returns a Promise ONLY when speech completely ends.
 */
function speakWordAsync(text, isUk = null) {
  return new Promise((resolve) => {
    if (!text || typeof window === 'undefined') return resolve();

    stopAllAudio();

    const accent = isUk !== null ? (isUk ? 'uk' : 'us') : getSavedVoiceAccent();
    const isUkAccent = accent === 'uk' || accent === 'gb' || accent === 'male';
    const { local, cdn, primary, fallback } = getAudioUrls(text, isUkAccent);

    let resolved = false;
    let resumeInterval = null;

    const finish = () => {
      if (!resolved) {
        resolved = true;
        if (resumeInterval) {
          clearInterval(resumeInterval);
          resumeInterval = null;
        }
        if (activeAutoplayAudio === audio) {
          activeAutoplayAudio = null;
        }
        window.__activeSpeechUtterance = null;
        if (window.__activeSpeechTimer) {
          clearTimeout(window.__activeSpeechTimer);
          window.__activeSpeechTimer = null;
        }
        setTimeout(resolve, 150);
      }
    };

    const maxTimer = setTimeout(finish, 6500);
    window.__activeSpeechTimer = maxTimer;

    const audio = getAutoplayAudio() || new Audio();
    activeAutoplayAudio = audio;
    audio.playbackRate = 1.0;
    audio.src = local;
    audio.currentTime = 0;
    let fallbackStage = 0; // 0 = local, 1 = cdn, 2 = primary, 3 = fallback, 4 = speech synthesis
    let stageLock = false;

    function playSpeechFallback() {
      clearTimeout(maxTimer);
      if ('speechSynthesis' in window) {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = isUkAccent ? 'en-GB' : 'en-US';
          utterance.rate = 0.90;
          window.__activeSpeechUtterance = utterance;
          utterance.onend = finish;
          utterance.onerror = finish;

          resumeInterval = setInterval(() => {
            if (window.speechSynthesis && window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          }, 200);

          window.speechSynthesis.speak(utterance);
        } catch (e) {
          finish();
        }
      } else {
        finish();
      }
    }

    const handleStageError = () => {
      if (stageLock || resolved) return;
      stageLock = true;
      setTimeout(() => { stageLock = false; }, 50);

      if (fallbackStage === 0) {
        fallbackStage = 1;
        audio.src = cdn;
        audio.currentTime = 0;
        const pCdn = audio.play();
        if (pCdn !== undefined) pCdn.then(() => cacheAudioOnline(cdn)).catch(handleStageError);
      } else if (fallbackStage === 1) {
        fallbackStage = 2;
        audio.src = primary;
        audio.currentTime = 0;
        const p1 = audio.play();
        if (p1 !== undefined) p1.catch(handleStageError);
      } else if (fallbackStage === 2) {
        fallbackStage = 3;
        audio.src = fallback;
        audio.currentTime = 0;
        const p2 = audio.play();
        if (p2 !== undefined) p2.catch(handleStageError);
      } else {
        playSpeechFallback();
      }
    };

    audio.onended = () => {
      clearTimeout(maxTimer);
      finish();
    };

    audio.onerror = handleStageError;

    const p = audio.play();
    if (p !== undefined) {
      p.catch(handleStageError);
    }
  });
}

let activeWakeLock = null;

/**
 * Requests a screen wake lock to prevent the mobile screen from sleeping/locking during card autoplay.
 */
async function requestScreenWakeLock() {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
  try {
    if (!activeWakeLock || activeWakeLock.released) {
      activeWakeLock = await navigator.wakeLock.request('screen');
      activeWakeLock.addEventListener('release', () => {
        activeWakeLock = null;
      });
    }
  } catch (err) {}
}

/**
 * Releases the screen wake lock when autoplay stops or finishes.
 */
function releaseScreenWakeLock() {
  if (activeWakeLock) {
    try {
      activeWakeLock.release();
    } catch (e) {}
    activeWakeLock = null;
  }
}

// Automatically re-acquire wake lock if page visibility returns while autoplay is active
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && typeof window !== 'undefined' && window.__favsAutoplayRunning) {
      requestScreenWakeLock();
    }
  });
}

let silentAudioLoopElement = null;

/**
 * Starts a silent audio loop to keep mobile browsers (Safari/Chrome/WebView)
 * and OS audio sessions active without throttling JS timers when screen turns off.
 */
function startSilentAudioAnchor() {
  if (typeof window === 'undefined') return;
  try {
    if (!silentAudioLoopElement) {
      // 1-second silent WAV audio data URI
      const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      silentAudioLoopElement = new Audio(silentWav);
      silentAudioLoopElement.loop = true;
      silentAudioLoopElement.volume = 0.001; // virtually silent, keeps hardware audio pipeline open
    }
    const p = silentAudioLoopElement.play();
    if (p !== undefined) p.catch(() => {});
  } catch (e) {}
}

/**
 * Stops and resets the silent audio anchor.
 */
function stopSilentAudioAnchor() {
  if (silentAudioLoopElement) {
    try {
      silentAudioLoopElement.pause();
      silentAudioLoopElement.currentTime = 0;
    } catch (e) {}
  }
}

/**
 * Interfaces with native Android foreground service bridge if running in APK
 */
function startNativeBackgroundPlayback(word = '', translation = '') {
  if (typeof window !== 'undefined' && window.AndroidAudioBridge && typeof window.AndroidAudioBridge.startBackgroundMode === 'function') {
    try {
      window.AndroidAudioBridge.startBackgroundMode(String(word || ''), String(translation || ''));
    } catch (e) {}
  }
}

function updateNativeBackgroundPlayback(word = '', translation = '', isPlaying = true) {
  if (typeof window !== 'undefined' && window.AndroidAudioBridge && typeof window.AndroidAudioBridge.updateNotification === 'function') {
    try {
      window.AndroidAudioBridge.updateNotification(String(word || ''), String(translation || ''), Boolean(isPlaying));
    } catch (e) {}
  }
}

function stopNativeBackgroundPlayback() {
  if (typeof window !== 'undefined' && window.AndroidAudioBridge && typeof window.AndroidAudioBridge.stopBackgroundMode === 'function') {
    try {
      window.AndroidAudioBridge.stopBackgroundMode();
    } catch (e) {}
  }
}

let mediaSessionHandlersRegistered = false;

function setupMediaSessionHandlers() {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  if (mediaSessionHandlersRegistered) return;
  mediaSessionHandlersRegistered = true;

  try {
    navigator.mediaSession.setActionHandler('play', () => {
      if (typeof window.onBackgroundAudioToggle === 'function') {
        window.onBackgroundAudioToggle(true);
      }
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      if (typeof window.onBackgroundAudioToggle === 'function') {
        window.onBackgroundAudioToggle(false);
      }
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (typeof window.onBackgroundAudioNext === 'function') {
        window.onBackgroundAudioNext();
      }
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (typeof window.onBackgroundAudioPrev === 'function') {
        window.onBackgroundAudioPrev();
      }
    });
  } catch (e) {}
}

/**
 * Updates MediaSession status for mobile background audio priority, lock screen widget, and headphones controls
 */
function updateMediaSessionStatus(isPlaying, currentWord = null, translationText = '') {
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      setupMediaSessionHandlers();
      if (isPlaying) {
        navigator.mediaSession.playbackState = 'playing';
        if (currentWord && currentWord.word) {
          const artistText = translationText || currentWord.translation || 'English Breakfast';
          navigator.mediaSession.metadata = new MediaMetadata({
            title: currentWord.word,
            artist: artistText,
            album: 'English Breakfast • Избранное',
            artwork: [
              { src: 'apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
              { src: 'apple-touch-icon.png', sizes: '512x512', type: 'image/png' },
            ],
          });
        }
      } else {
        navigator.mediaSession.playbackState = 'paused';
      }
    } catch (e) {}
  }
}

const playAudio = speakWord;

export const AudioService = {
  speakWord,
  speakWordAsync,
  speakTextInLangAsync,
  stopAllAudio,
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
  isWordAudioPlaying,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  startSilentAudioAnchor,
  stopSilentAudioAnchor,
  startNativeBackgroundPlayback,
  updateNativeBackgroundPlayback,
  stopNativeBackgroundPlayback,
  setupMediaSessionHandlers,
  updateMediaSessionStatus,
  primeAudioForAutoplay,
  triggerHaptic,
  isVoicePackDownloaded,
  isCategoryAudioDownloaded,
  downloadVoicePack,
  downloadCategoryVoicePack,
};

export default AudioService;

export {
  speakWord,
  speakWordAsync,
  speakTextInLangAsync,
  stopAllAudio,
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
  isWordAudioPlaying,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  startSilentAudioAnchor,
  stopSilentAudioAnchor,
  startNativeBackgroundPlayback,
  updateNativeBackgroundPlayback,
  stopNativeBackgroundPlayback,
  setupMediaSessionHandlers,
  updateMediaSessionStatus,
  primeAudioForAutoplay,
  triggerHaptic,
  isVoicePackDownloaded,
  isCategoryAudioDownloaded,
  downloadVoicePack,
  downloadCategoryVoicePack,
};
