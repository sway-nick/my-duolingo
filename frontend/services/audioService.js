let currentWordKey = null;
let clickCount = 0;
let audioCtx = null;

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
 * Plays a casino slot machine reel spinning / cascading ratchet sound with a jackpot chime
 */
function playCasinoRollSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const clickCount = 14;
    const interval = 0.045; // 45ms between clicks

    // 1. Rapid slot machine mechanical ratchet reel ticks
    for (let i = 0; i < clickCount; i++) {
      const clickTime = now + i * interval;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Rising pitch like an accelerating/spinning slot machine wheel
      const freq = 450 + i * 45;
      osc.frequency.setValueAtTime(freq, clickTime);
      osc.frequency.exponentialRampToValueAtTime(freq + 60, clickTime + 0.03);

      gain.gain.setValueAtTime(0.001, clickTime);
      gain.gain.linearRampToValueAtTime(0.16, clickTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(clickTime);
      osc.stop(clickTime + 0.035);
    }

    // 2. Victory jackpot chime at the end of the roll
    const chimeStart = now + clickCount * interval;
    const victoryNotes = [
      { freq: 1046.5, delay: 0.00, vol: 0.15 },
      { freq: 1318.5, delay: 0.05, vol: 0.16 },
      { freq: 1567.98, delay: 0.10, vol: 0.18 },
      { freq: 2093.0, delay: 0.15, vol: 0.15 },
    ];

    victoryNotes.forEach(({ freq, delay, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chimeStart + delay);

      gain.gain.setValueAtTime(0.001, chimeStart + delay);
      gain.gain.linearRampToValueAtTime(vol, chimeStart + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, chimeStart + delay + 0.50);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(chimeStart + delay);
      osc.stop(chimeStart + delay + 0.50);
    });
  } catch (e) {
    console.warn('Casino audio effect skipped:', e);
  }
}

/**
 * Plays a gentle, distinct error sound upon incorrect answer (Web Audio API)
 */
function playErrorSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual descending low tone (subtle buzz indicating error)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';

    // Descending frequency: 180Hz -> 110Hz
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.30);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.30);
  } catch (e) {
    console.warn('Audio error effect playback skipped:', e);
  }
}

/**
 * Speaks the given text using SpeechSynthesis.
 * Automatically switches to slow "turtle" mode on the 3rd consecutive play of the same word.
 *
 * @param {string} text - The word or text to pronounce (e.g. English word)
 * @param {string} wordId - Optional unique ID for tracking consecutive clicks on the same word
 * @param {string} lang - Language code (default 'en-US')
 * @returns {boolean} isTurtleMode - True if playing in slow speed
 */
function speakWord(text, wordId = null, lang = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  // Prevent browser warning if page is freshly opened and user hasn't tapped yet
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
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
    utterance.rate = isTurtleMode ? 0.40 : 0.80; // Turtle rate: 0.40, Normal: 0.80

    window.speechSynthesis.speak(utterance);

    return isTurtleMode;
  } catch (e) {
    console.warn('SpeechSynthesis speak warning:', e);
    return false;
  }
}

function resetAudioCounter() {
  currentWordKey = null;
  clickCount = 0;
}

export { speakWord, resetAudioCounter, playSuccessSound, playErrorSound, playCasinoRollSound };
