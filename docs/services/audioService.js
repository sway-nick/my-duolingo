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
 * Plays a pleasant celebratory chime upon correct answer (Web Audio API)
 */
function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual-tone harmonious pleasant chime (Duolingo-style ding)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    // Tone 1: E5 (659.25Hz) -> Tone 2: A5 (880Hz)
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.setValueAtTime(880, now + 0.08);

    osc2.frequency.setValueAtTime(1318.5, now); // Higher harmonic (E6)
    osc2.frequency.setValueAtTime(1760, now + 0.08); // (A6)

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.20, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.warn('Audio effect playback skipped:', e);
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

export { speakWord, resetAudioCounter, playSuccessSound, playErrorSound };
