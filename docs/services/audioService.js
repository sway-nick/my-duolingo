let currentWordKey = null;
let clickCount = 0;

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

export { speakWord, resetAudioCounter };
