import {
  speakWord,
  speakWordAsync,
  speakTextInLangAsync,
  stopAllAudio,
  preloadWordAudio,
  playSuccessSound,
  playErrorSound,
  playCasinoRollSound,
  playCoinDropSound,
  playStopwatchTickSound,
  playFartSound,
  isWordAudioPlaying,
  isSfxMuted,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  startSilentAudioAnchor,
  stopSilentAudioAnchor,
  startNativeBackgroundPlayback,
  updateNativeBackgroundPlayback,
  stopNativeBackgroundPlayback,
  updateMediaSessionStatus,
  primeAudioForAutoplay,
  triggerHaptic,
} from '../../services/audioService.js?v=378.0';
import {
  saveProgress,
  toggleFavoriteApi,
  getUserFavorites,
  getUserProgress,
  isWordMastered,
  prepareTrainingBatch,
  getActiveConveyorBatch,
  clearActiveConveyorBatch,
  transcribeAudio,
  transcribePingAudio,
} from '../../services/api.js?v=383.1';
import { t, getInterfaceLanguage, getWordTranslation, getWordNotes } from '../../services/i18n.js?v=378.0';

function sanitizeCategory(cat) {
  if (!cat) return 'Общие';
  return (
    String(cat)
      .replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '')
      .trim() || String(cat).trim()
  );
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const AUTOPLAY_HEADPHONES_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>`;

const AUTOPLAY_PAUSE_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display: block;"><rect x="5" y="4" width="4.5" height="16" rx="1.5"></rect><rect x="14.5" y="4" width="4.5" height="16" rx="1.5"></rect></svg>`;

const FC_SOUND_ICON_HTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;

function getCardFavIconHtml(isFav) {
  if (isFav) {
    return `<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
  }
  return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
}

function getFavsAutoplayBtnContent(isPlaying) {
  const icon = isPlaying ? AUTOPLAY_PAUSE_SVG : AUTOPLAY_HEADPHONES_SVG;
  const label = isPlaying ? t('fav_autoplay_stop') : t('fav_autoplay_listen');
  return `
    <span class="autoplay-btn-icon-wrapper" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); display: inline-flex; align-items: center; justify-content: center; pointer-events: none;">
      ${icon}
    </span>
    <span class="autoplay-btn-text" style="width: 100%; text-align: center; pointer-events: none;">
      ${label}
    </span>
  `;
}

function onNextAfterSpeech(onNext, minDelay = 1000, maxWait = 8000) {
  const start = Date.now();
  let speechEverActive = false;
  try {
    speechEverActive = typeof isWordAudioPlaying === 'function' ? isWordAudioPlaying() : false;
  } catch (e) {
    speechEverActive = false;
  }
  let speechEndedTimestamp = null;
  let hasTriggered = false;

  function trigger() {
    if (hasTriggered) return;
    hasTriggered = true;
    try {
      onNext();
    } catch (err) {
      console.error('Error advancing to next card in onNext:', err);
    }
  }

  function check() {
    if (hasTriggered) return;
    try {
      const elapsed = Date.now() - start;
      let currentlySpeaking = false;
      try {
        currentlySpeaking = typeof isWordAudioPlaying === 'function' ? isWordAudioPlaying() : false;
      } catch (e) {
        currentlySpeaking = false;
      }

      if (currentlySpeaking) {
        speechEverActive = true;
        speechEndedTimestamp = null; // Still playing
      } else if (speechEverActive && speechEndedTimestamp === null) {
        speechEndedTimestamp = Date.now(); // Speech just finished!
      }

      // 1. If audio was playing, give a full 1.0s (1000ms) pause AFTER audio finishes completely
      if (speechEndedTimestamp !== null) {
        if (Date.now() - speechEndedTimestamp >= 1000) {
          trigger();
          return;
        }
      } else if (!speechEverActive && elapsed >= minDelay) {
        // 2. If no audio was active, wait at least minDelay (defaults to 1000ms)
        trigger();
        return;
      }

      // 3. Safety timeout to prevent getting stuck
      if (elapsed >= maxWait) {
        trigger();
        return;
      }

      setTimeout(check, 50);
    } catch (err) {
      console.error('Error in onNextAfterSpeech check loop:', err);
      trigger();
    }
  }

  setTimeout(check, 50);
}

function calculateLevenshtein(a, b) {
  if (!a || !b) return (a || b || '').length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1),
            );
    }
  }
  return matrix[b.length][a.length];
}

function cyrillicToLatinPhonetic(str) {
  if (!str) return '';
  const lang = getInterfaceLanguage();
  const map =
    lang === 'uk'
      ? {
          а: 'a',
          б: 'b',
          в: 'v',
          г: 'h',
          ґ: 'g',
          д: 'd',
          е: 'e',
          є: 'ye',
          ж: 'zh',
          з: 'z',
          и: 'y',
          і: 'i',
          ї: 'yi',
          й: 'y',
          к: 'k',
          л: 'l',
          м: 'm',
          н: 'n',
          о: 'o',
          п: 'p',
          р: 'r',
          с: 's',
          т: 't',
          у: 'u',
          ф: 'f',
          х: 'kh',
          ц: 'ts',
          ч: 'ch',
          ш: 'sh',
          щ: 'shch',
          ь: '',
          ю: 'yu',
          я: 'ya',
        }
      : {
          а: 'a',
          б: 'b',
          в: 'v',
          г: 'g',
          д: 'd',
          е: 'e',
          ё: 'e',
          ж: 'zh',
          з: 'z',
          и: 'i',
          й: 'y',
          к: 'k',
          л: 'l',
          м: 'm',
          н: 'n',
          о: 'o',
          п: 'p',
          р: 'r',
          с: 's',
          т: 't',
          у: 'u',
          ф: 'f',
          х: 'h',
          ц: 'ts',
          ч: 'ch',
          ш: 'sh',
          щ: 'sch',
          ъ: '',
          ы: 'y',
          ь: '',
          э: 'e',
          ю: 'yu',
          я: 'ya',
        };
  return String(str)
    .toLowerCase()
    .split('')
    .map((c) => map[c] || c)
    .join('');
}

function normalizeEnglish(str, preserveArticles = false) {
  if (!str) return '';
  let cleaned = String(str)
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!preserveArticles) {
    const stripped = cleaned.replace(/\b(a|an|the|to)\b/gi, '').replace(/\s+/g, ' ').trim();
    if (stripped.length > 0) {
      cleaned = stripped;
    }
  }
  return cleaned;
}

function checkSpeechMatch(spokenList, targetWord) {
  if (!targetWord || !spokenList || spokenList.length === 0) return false;
  const rawTarget = String(targetWord).toLowerCase().trim();
  const isTargetArticleOrShort = /^(a|an|the|to|in|on|of|at|by|it|is|as|or|and)$/i.test(rawTarget);

  const normTarget = normalizeEnglish(targetWord, isTargetArticleOrShort);
  if (!normTarget) return false;

  for (const rawSpoken of spokenList) {
    const normSpoken = normalizeEnglish(rawSpoken, isTargetArticleOrShort);
    if (!normSpoken) continue;

    // 1. Точное совпадение
    if (normSpoken === normTarget) return true;

    // 2. Внутри сказанного (например, "it's the" или "the word")
    const wordsInSpoken = normSpoken.split(/\s+/).filter(Boolean);
    if (wordsInSpoken.includes(normTarget)) {
      return true;
    }
    const rawWords = String(rawSpoken)
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
      .split(/\s+/)
      .filter(Boolean);
    if (rawWords.includes(rawTarget)) {
      return true;
    }

    // 3. Фонетические эквиваленты для сложных коротких звуков
    if (normTarget === 'the' && /^(the|dee|duh|tha|zee|th|da|de|d)$/i.test(normSpoken)) {
      return true;
    }
    if (normTarget === 'of' && /^(of|off|ov|uv|have)$/i.test(normSpoken)) {
      return true;
    }
    if (normTarget === 'and' && /^(and|end|an|und)$/i.test(normSpoken)) {
      return true;
    }
    if (normTarget === 'in' && /^(in|inn|en|an)$/i.test(normSpoken)) {
      return true;
    }

    // 4. Допуск на опечатку/небольшую неточность для слов от 4 букв
    if (normTarget.length >= 4) {
      const dist = calculateLevenshtein(normSpoken, normTarget);
      const maxDist = Math.max(1, Math.floor(normTarget.length * 0.25));
      if (dist <= maxDist && dist <= 2) return true;
    }

    // 5. Транслитерация / кириллица
    const latinized = cyrillicToLatinPhonetic(rawSpoken.trim());
    if (latinized) {
      const normLatinized = normalizeEnglish(latinized, isTargetArticleOrShort);
      if (normLatinized === normTarget) return true;
      if (normTarget.length >= 4) {
        const distTranslit = calculateLevenshtein(normLatinized, normTarget);
        if (distTranslit <= Math.max(1, Math.floor(normTarget.length * 0.25))) return true;
      }
    }
  }
  return false;
}

function showWordNotesModal(notes) {
  let modal = document.getElementById('word-notes-modal-overlay');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'word-notes-modal-overlay';
  modal.className = 'word-notes-modal-overlay';
  modal.innerHTML = `
    <div class="word-notes-modal-card">
      <div class="word-notes-modal-header">
        <h3 class="word-notes-modal-title">
          <span class="word-notes-modal-icon">i</span>
          <span class="word-notes-modal-title-text">${t('word_notes_title') || 'Примечание'}</span>
        </h3>
        <button type="button" class="word-notes-modal-close" id="word-notes-close-btn" aria-label="${t('word_notes_close')}">✕</button>
      </div>
      <div class="word-notes-modal-body">
        <p class="word-notes-modal-text"></p>
      </div>
    </div>
  `;
  const textEl = modal.querySelector('.word-notes-modal-text');
  if (textEl) {
    textEl.textContent = String(notes || '').trim();
  }
  document.body.appendChild(modal);

  const closeModal = () => {
    modal.classList.add('closing');
    setTimeout(() => { if (modal && modal.parentNode) modal.remove(); }, 180);
    document.removeEventListener('keydown', handleEsc);
  };

  const handleEsc = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  modal.querySelector('#word-notes-close-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', handleEsc);
}

function renderTrainingCard(currentWord, allWords = [], options = {}) {
  const container = document.querySelector('#training');
  if (!container) return;

  if (window.__activePairsTimerInterval) {
    clearInterval(window.__activePairsTimerInterval);
    window.__activePairsTimerInterval = null;
  }

  if (currentWord && currentWord.word) {
    preloadWordAudio(currentWord.word);
  }

  const {
    currentMethod = 'quiz',
    isBatchReview = false,
    selectedCategory = 'Elementary',
    categories = [],
    isFavorite = false,
    onFavoriteToggle = () => {},
    onMethodChange = () => {},
    onCategoryChange = () => {},
    onCategoryBadgeClick = null,
    onNext = () => {},
    onPrev = null,
    canGoPrev = false,
    learningCount = 0,
    dailyGoal = 5,
    activeWords = [],
    currentWordIndex = 0,
    isLastWord = false,
    isSingleRemaining = false,
    availableModes = { cards: true, quiz: true, pairs: true, input: true },
    isFavPractice = false,
  } = options;

  if (activeWords && activeWords.length > 0) {
    activeWords.slice(0, 3).forEach((w) => {
      if (w && w.word) preloadWordAudio(w.word);
    });
  }

  let favorited = isFavorite;

  const progressMap = getUserProgress() || {};
  const currentProg = progressMap[currentWord?.id] || {};
  const rawQuizStage = isWordMastered(currentProg) ? 0 : (currentProg.quizCorrect || 0);

  // Accessibility for deaf / hard-of-hearing / mute users:
  // When sound effects are turned off, exclude stage 1 (Audio/Listening) and stage 3 (Microphone/Speech) in conveyor
  const isAccessibilityMuted = Boolean(typeof isSfxMuted === 'function' && isSfxMuted() && !isFavPractice);

  let quizStage = rawQuizStage;
  if (isAccessibilityMuted) {
    const step = rawQuizStage % 3;
    if (step === 0) quizStage = 0; // En -> Ru choices
    else if (step === 1) quizStage = 2; // Ru -> En choices
    else quizStage = 4; // Consonants / Letter tiles
  } else if (quizStage === 3) {
    // Stage 3 (Microphone / AI speech recognition) is temporarily disabled per user request
    quizStage = 4;
  }

  const isCardsMode = currentMethod === 'cards';
  const isPairsMode = currentMethod === 'pairs';
  const isInputMode = currentMethod === 'input';

  let cardsBadgeText = '';
  if (isCardsMode && !isFavPractice) {
    const catWords = (selectedCategory === 'All' || !selectedCategory)
      ? (allWords || [])
      : (allWords || []).filter((w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory));
    const favList = getUserFavorites() || [];
    const favSet = new Set(favList.map(String));

    const totalUnmastered = catWords.filter((w) => {
      const p = progressMap[w.id] || progressMap[String(w.id)];
      return !favSet.has(String(w.id)) && (!p || !isWordMastered(p));
    });

    const pickedCount = catWords.filter((w) => {
      const p = progressMap[w.id] || progressMap[String(w.id)];
      return !favSet.has(String(w.id)) && p && p.roundCardsDone === true && !isWordMastered(p);
    }).length;

    const targetCount = Math.min(10, totalUnmastered.length || 10);
    const currentDisplay = Math.min(pickedCount, targetCount);
    cardsBadgeText = t('conveyor_in_learning', { current: currentDisplay, total: targetCount });
  }

  const wordNotes = getWordNotes(currentWord);
  const hasNotes = Boolean(wordNotes && String(wordNotes).trim().length > 0);
  const notesBtnHtml = hasNotes
    ? `<button type="button" class="word-notes-btn" id="word-notes-btn" title="${t('word_notes_title') || 'Примечание'}" aria-label="${t('word_notes_title') || 'Примечание'}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>`
    : '';

  function formatWordCount(cnt) {
    const lang = getInterfaceLanguage();
    if (lang === 'ru' || lang === 'uk') {
      const lastDigit = cnt % 10;
      const lastTwo = cnt % 100;
      if (lastTwo >= 11 && lastTwo <= 19) return `${cnt} ${t('words')}`;
      if (lastDigit === 1) return `${cnt} ${t('word_1')}`;
      if (lastDigit >= 2 && lastDigit <= 4) return `${cnt} ${t('word_2')}`;
      return `${cnt} ${t('words')}`;
    }
    return `${cnt} ${t('words')}`;
  }

  const existingCardContainer = container.querySelector('.word-card-container');
  const isSameCardsLayout = Boolean(
    existingCardContainer &&
    container.dataset.trainingMethod === 'cards' &&
    isCardsMode &&
    container.dataset.isFavPractice === String(isFavPractice) &&
    container.querySelector('#practice-area')
  );

  if (!isSameCardsLayout) {
    container.dataset.trainingMethod = currentMethod;
    container.dataset.isFavPractice = String(isFavPractice);

    container.innerHTML = `
      <section class="word-card-container">
        
        <div class="card-header-bar">
          <div class="mode-switch-pills" id="mode-switch-pills">
            <div class="mode-pill-glider" id="mode-pill-glider"></div>
            <button type="button" class="mode-pill-btn ${isCardsMode ? 'active' : ''} ${!availableModes.cards ? 'disabled' : ''}" data-mode="cards" ${!availableModes.cards ? 'disabled' : ''}>
              ${t('train_cards_chip')}
            </button>
            <button type="button" class="mode-pill-btn ${currentMethod === 'quiz' ? 'active' : ''} ${!availableModes.quiz ? 'disabled' : ''}" data-mode="quiz" ${!availableModes.quiz ? 'disabled' : ''}>
              ${t('dict_stage_quiz')}
            </button>
            <button type="button" class="mode-pill-btn ${isPairsMode ? 'active' : ''} ${!availableModes.pairs ? 'disabled' : ''}" data-mode="pairs" ${!availableModes.pairs ? 'disabled' : ''}>
              ${t('dict_stage_pairs')}
            </button>
            <button type="button" class="mode-pill-btn ${isInputMode ? 'active' : ''} ${!availableModes.input ? 'disabled' : ''}" data-mode="input" ${!availableModes.input ? 'disabled' : ''}>
              ${t('dict_stage_test')}
            </button>
          </div>
        </div>

        <div class="word-main-display">
          ${
            isCardsMode
              ? (
                isFavPractice
                  ? `
                  <div class="train-left-badge" id="fav-counter-badge">
                    ${t('train_favs_chip')}: <strong>${activeWords.length > 0 ? (currentWordIndex % activeWords.length) + 1 : 1}/${activeWords.length}</strong>
                  </div>
                `
                  : `
                  <div class="train-left-badge cards-learning-badge">
                    <strong>${cardsBadgeText}</strong>
                  </div>
                `
              )
              : isPairsMode
                ? `
              <div class="pairs-header-box" style="margin: 2px 0 6px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <h2 class="pairs-title">
                  <span style="font-size: 18px; line-height: 1; flex-shrink: 0;">🧩</span>
                  <span>${t('train_find_pairs')}</span>
                </h2>
                <div class="pairs-timer-badge" id="pairs-timer-badge" title="Round timer">
                  <span class="pairs-timer-icon">⏱️</span>
                  <span class="pairs-timer-val" id="pairs-timer-val">00:00</span>
                </div>
              </div>
            `
                : isInputMode
                  ? `
              <button type="button" class="favorite-button" id="speak-sound-btn" title="Speak word" style="right: auto; left: -4px;">🔊</button>
              <div class="train-left-badge">
                ✍️ ${t('train_left')}: <strong>${activeWords.length}</strong>
              </div>
              <div class="word-header-row">
                <div class="training-word-container">
                  <h2 class="training-word" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                    ${getWordTranslation(currentWord)}
                  </h2>
                  ${notesBtnHtml}
                </div>
                <button type="button" class="favorite-button ${favorited ? 'is-favorite' : ''}" id="fav-toggle-btn" title="Add to Favorites">
                  ${favorited ? '❤️' : '🤍'}
                </button>
              </div>
            `
                  : `
              ${quizStage === 0 || quizStage === 1 || quizStage === 3 || quizStage === 4 ? `<button type="button" class="favorite-button" id="speak-sound-btn" title="Speak word" style="right: auto; left: -4px;">🔊</button>` : ''}
              <div class="train-left-badge">
                🎯 ${t('train_left')}: <strong>${activeWords.length}</strong>
              </div>
              <div class="word-header-row">
                ${
                  quizStage === 0
                    ? `
                  <div class="training-word-container">
                    <h2 class="training-word clickable-word-box" id="speak-word-trigger" title="Tap to speak word" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                      <span class="training-word-text">${escapeHtml(currentWord.word)}</span>
                    </h2>
                    ${notesBtnHtml}
                  </div>
                `
                    : quizStage === 1
                      ? `
                  <div class="training-word-container">
                    <div class="listening-word-box clickable-word-box" id="speak-word-trigger" title="Tap to speak word">
                      <span class="listening-audio-icon">🎧</span>
                      <span class="listening-word-text" id="listening-word-text">${t('train_listen_chip')}</span>
                    </div>
                    ${notesBtnHtml}
                  </div>
                `
                      : quizStage === 2
                        ? `
                  <div class="training-word-container">
                    <h2 class="training-word" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                      ${escapeHtml(getWordTranslation(currentWord))}
                    </h2>
                    ${notesBtnHtml}
                  </div>
                `
                        : `
                  <div class="training-word-container">
                    <h2 class="training-word" style="font-size: 22px; margin: 0; color: var(--text-main); line-height: 1.2;">
                      ${escapeHtml(getWordTranslation(currentWord))}
                    </h2>
                    ${notesBtnHtml}
                  </div>
                `
                }
                <button type="button" class="favorite-button ${favorited ? 'is-favorite' : ''}" id="fav-toggle-btn" title="Add to Favorites">
                  ${favorited ? '❤️' : '🤍'}
                </button>
              </div>
            `
          }
        </div>

        <div id="practice-area" class="practice-area"></div>

      </section>
    `;

    const pillBar = container.querySelector('#mode-switch-pills');
    const glider = container.querySelector('#mode-pill-glider');
    const modePills = container.querySelectorAll('.mode-pill-btn');

    function positionGlider(targetBtn, animate = true) {
      if (!targetBtn || !glider || !pillBar) return;
      const offsetLeft = targetBtn.offsetLeft;
      const btnWidth = targetBtn.offsetWidth;
      if (btnWidth === 0) return;
      if (!animate) glider.style.transition = 'none';
      else
        glider.style.transition =
          'transform 0.32s cubic-bezier(0.34, 1.35, 0.7, 1), width 0.25s ease';
      glider.style.transform = `translateX(${offsetLeft}px)`;
      glider.style.width = `${btnWidth}px`;
    }

    const initialActive = container.querySelector('.mode-pill-btn.active');
    if (initialActive) {
      requestAnimationFrame(() => positionGlider(initialActive, false));
      setTimeout(() => positionGlider(initialActive, false), 50);
    }

    window.addEventListener(
      'resize',
      () => {
        const activeBtn = container.querySelector('.mode-pill-btn.active');
        if (activeBtn) positionGlider(activeBtn, false);
      },
      { passive: true },
    );

    modePills.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (btn.disabled || btn.classList.contains('disabled')) return;
        const selectedMode = btn.getAttribute('data-mode');
        if (selectedMode && selectedMode !== currentMethod) {
          if (window.__activePairsTimerInterval) {
            clearInterval(window.__activePairsTimerInterval);
            window.__activePairsTimerInterval = null;
          }
          modePills.forEach((p) => p.classList.remove('active'));
          btn.classList.add('active');
          positionGlider(btn, true);
          setTimeout(() => onMethodChange(selectedMode), 150);
        }
      });
    });
  } else {
    const leftBadge = container.querySelector('.cards-learning-badge') || container.querySelector('.train-left-badge');
    if (leftBadge) {
      if (isFavPractice) {
        const favLabel = t('fav_title') || 'Избранное';
        leftBadge.innerHTML = `${favLabel}: <strong>${activeWords.length > 0 ? (currentWordIndex % activeWords.length) + 1 : 1}/${activeWords.length}</strong>`;
      } else if (isCardsMode) {
        leftBadge.innerHTML = `<strong>${cardsBadgeText}</strong>`;
      } else {
        leftBadge.innerHTML = `🎯 <strong>${activeWords.length > 0 ? (currentWordIndex % activeWords.length) + 1 : 1} / ${activeWords.length}</strong>`;
      }
    }
  }

  const speakTrigger = container.querySelector('#speak-word-trigger');
  const soundBtn = container.querySelector('#speak-sound-btn');
  const handleSpeak = () => speakWord(currentWord.word, currentWord.id);
  if (speakTrigger && !isPairsMode) speakTrigger.addEventListener('click', handleSpeak);
  if (soundBtn && !isPairsMode) soundBtn.addEventListener('click', handleSpeak);

  if (!isFavPractice && !window.__favsAutoplayRunning && !isAccessibilityMuted && (currentMethod === 'cards' || (currentMethod === 'quiz' && quizStage <= 1))) {
    setTimeout(() => {
      try {
        if (!isFavPractice && !window.__favsAutoplayRunning && !isAccessibilityMuted) {
          speakWord(currentWord.word, currentWord.id);
        }
      } catch (e) {}
    }, 100);
  }

  const notesBtn = container.querySelector('#word-notes-btn');
  if (notesBtn && hasNotes) {
    notesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showWordNotesModal(wordNotes);
    });
  }

  const favBtn = container.querySelector('#fav-toggle-btn');
  if (favBtn) {
    favBtn.addEventListener('click', async () => {
      favBtn.classList.remove('heart-hint-blink');
      favorited = !favorited;
      favBtn.textContent = favorited ? '❤️' : '🤍';
      favBtn.classList.toggle('is-favorite', favorited);
      await toggleFavoriteApi(currentWord.id, favorited);
      onFavoriteToggle(currentWord.id, favorited);
    });
  }

  const practiceArea = container.querySelector('#practice-area');

  if (currentMethod === 'quiz') {
    function isNotebookThemeActive() {
      return document.body.classList.contains('notebook-theme') || (localStorage.getItem('myduo_theme') === 'notebook');
    }

    function getQuizOptionStyle(text) {
      const clean = String(text || '').trim();
      const words = clean.split(/\s+/);
      const maxWordLen = Math.max(...words.map((w) => w.replace(/[,\.?!;:]/g, '').length), 0);
      const totalLen = clean.length;
      const isNotebook = isNotebookThemeActive();

      if (isNotebook) {
        if (maxWordLen >= 17 || totalLen > 45) return 'font-size: 15px; line-height: 1.12; font-weight: 700;';
        if (maxWordLen >= 14 || totalLen > 32) return 'font-size: 17px; line-height: 1.15; font-weight: 700;';
        if (maxWordLen >= 12 || totalLen > 22) return 'font-size: 19.5px; line-height: 1.18; font-weight: 700;';
        if (maxWordLen >= 9 || totalLen > 14) return 'font-size: 21.5px; line-height: 1.2; font-weight: 700;';
        return 'font-size: 24px; line-height: 1.22; font-weight: 700;';
      }

      if (maxWordLen >= 17 || totalLen > 55) return 'font-size: 11.5px; line-height: 1.15;';
      if (maxWordLen >= 14 || totalLen > 40) return 'font-size: 12.5px; line-height: 1.18;';
      if (maxWordLen >= 12 || totalLen > 28) return 'font-size: 14px; line-height: 1.2;';
      if (maxWordLen >= 10 || totalLen > 20) return 'font-size: 15.2px; line-height: 1.22;';
      return 'font-size: 16.5px; line-height: 1.25; font-weight: 600;';
    }

    function getQuizDistractorWords() {
      const currentIdStr = String(currentWord.id);
      const currentWordText = String(currentWord.word || '').toLowerCase().trim();
      const currentTransText = String(getWordTranslation(currentWord) || '').toLowerCase().trim();

      const seenIds = new Set([currentIdStr]);
      const seenWords = new Set([currentWordText]);
      const seenTranslations = new Set([currentTransText]);
      const result = [];

      function isValidCandidate(w) {
        if (!w) return false;
        const idStr = String(w.id);
        if (seenIds.has(idStr)) return false;
        const wText = String(w.word || '').toLowerCase().trim();
        if (!wText || seenWords.has(wText)) return false;
        const wTrans = String(getWordTranslation(w) || '').toLowerCase().trim();
        if (!wTrans || seenTranslations.has(wTrans)) return false;
        return true;
      }

      function addCandidate(w) {
        seenIds.add(String(w.id));
        seenWords.add(String(w.word || '').toLowerCase().trim());
        seenTranslations.add(String(getWordTranslation(w) || '').toLowerCase().trim());
        result.push(w);
      }

      // 1. Приоритет: слова из текущей изучаемой партии (activeWords), отобранной в Карточках
      const shuffledActive = shuffleArray(activeWords || []);
      for (const w of shuffledActive) {
        if (isValidCandidate(w)) {
          addCandidate(w);
          if (result.length >= 5) return result;
        }
      }

      // 2. ИСКЛЮЧИТЕЛЬНО из текущей категории (selectedCategory)! Слова других категорий не подмешиваем
      const categoryFiltered =
        selectedCategory === 'All' || selectedCategory === 'Все категории' || !selectedCategory
          ? (allWords || [])
          : (allWords || []).filter(
              (w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory),
            );

      const userProgress = getUserProgress();
      const knownWords = categoryFiltered.filter((w) => {
        if (!isValidCandidate(w)) return false;
        const p = userProgress[w.id] || userProgress[String(w.id)];
        return p && (p.seenInCards === true || isWordMastered(p));
      });

      for (const w of shuffleArray(knownWords)) {
        if (isValidCandidate(w)) {
          addCandidate(w);
          if (result.length >= 5) return result;
        }
      }

      // 3. Fallback строго внутри текущей категории
      for (const w of shuffleArray(categoryFiltered)) {
        if (isValidCandidate(w)) {
          addCandidate(w);
          if (result.length >= 5) return result;
        }
      }

      // 4. Аварийный fallback (только если в категории физически не хватает уникальных слов)
      if (result.length < 5) {
        for (const w of shuffleArray(allWords || [])) {
          if (isValidCandidate(w)) {
            addCandidate(w);
            if (result.length >= 5) return result;
          }
        }
      }

      return result;
    }

    function renderStandardQuiz() {
      const currentTrans = getWordTranslation(currentWord);
      const distractorWords = getQuizDistractorWords();
      const otherTranslations = distractorWords.map((w) => getWordTranslation(w));
      // Гарантия абсолютной уникальности вариантов ответов в Quiz
      const seenSet = new Set([String(currentTrans).toLowerCase().trim()]);
      const uniqueDistractors = [];
      for (const t of otherTranslations) {
        const norm = String(t || '').toLowerCase().trim();
        if (norm && !seenSet.has(norm)) {
          seenSet.add(norm);
          uniqueDistractors.push(t);
        }
      }
      const choices = shuffleArray([currentTrans, ...uniqueDistractors]);

      practiceArea.innerHTML = `<div class="quiz-grid">${choices.map((choice) => `<button type="button" class="quiz-option" data-choice="${choice}"><span class="quiz-option-inner" style="${getQuizOptionStyle(choice)}">${choice}</span></button>`).join('')}</div>`;
      practiceArea.querySelectorAll('.quiz-option').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const optionBtn = e.currentTarget;
          const isCorrect =
            String(optionBtn.getAttribute('data-choice')).trim() ===
            String(currentTrans).trim();

          const listenText = container.querySelector('#listening-word-text');
          if (listenText) {
            listenText.textContent = currentWord.word;
            listenText.style.fontWeight = '800';
            listenText.style.letterSpacing = '0.5px';
          }

          practiceArea.querySelectorAll('.quiz-option').forEach((b) => {
            b.disabled = true;
            if (b.getAttribute('data-choice') === currentTrans)
              b.classList.add('correct');
            else if (b === optionBtn && !isCorrect) b.classList.add('wrong');
          });

          if (isCorrect) {
            playSuccessSound();
            speakWord(currentWord.word, currentWord.id);
          } else {
            playErrorSound();
            speakWord(currentWord.word, currentWord.id);
          }

          await saveProgress(currentWord.id, isCorrect, 'quiz', { isFavPractice });
          onNextAfterSpeech(onNext, 1000, 8000);
        });
      });
    }

    function renderReverseQuiz(isFromSpeechFallback = false) {
      const distractorWords = getQuizDistractorWords();
      const otherWords = distractorWords.map((w) => w.word);
      // Гарантия абсолютной уникальности вариантов ответов в Reverse Quiz
      const seenSet = new Set([String(currentWord.word).toLowerCase().trim()]);
      const uniqueDistractors = [];
      for (const w of otherWords) {
        const norm = String(w || '').toLowerCase().trim();
        if (norm && !seenSet.has(norm)) {
          seenSet.add(norm);
          uniqueDistractors.push(w);
        }
      }
      const choices = shuffleArray([currentWord.word, ...uniqueDistractors]);

      practiceArea.innerHTML = `<div class="quiz-grid">${choices.map((choice) => `<button type="button" class="quiz-option" data-choice="${choice}"><span class="quiz-option-inner" style="${getQuizOptionStyle(choice)}">${choice}</span></button>`).join('')}</div>`;
      practiceArea.querySelectorAll('.quiz-option').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const optionBtn = e.currentTarget;
          const isCorrect =
            String(optionBtn.getAttribute('data-choice')).trim() ===
            String(currentWord.word).trim();
          practiceArea.querySelectorAll('.quiz-option').forEach((b) => {
            b.disabled = true;
            if (b.getAttribute('data-choice') === currentWord.word) b.classList.add('correct');
            else if (b === optionBtn && !isCorrect) b.classList.add('wrong');
          });
          speakWord(currentWord.word, currentWord.id);
          if (isCorrect) playSuccessSound();
          else playErrorSound();
          await saveProgress(currentWord.id, isCorrect, 'quiz', { skipXp: isFromSpeechFallback, isFavPractice });
          onNextAfterSpeech(onNext, 1000, 8000);
        });
      });
    }

    function renderSpeechQuiz() {
      let speechAttempts = 0;

      const CUTE_AI_ROBOT_HTML = `<img src="./assets/icons/cute_ai_robot.png" alt="AI Robot" class="cute-ai-robot-img" />`;

      practiceArea.innerHTML = `
        <div class="speech-quiz-container">
          <button type="button" class="speech-mic-btn" id="speech-mic-btn" title="Tap to speak word">
            🎙️
          </button>
          <div class="speech-hold-hint" id="speech-hold-hint">
            ${t('speech_tap_to_speak')}
          </div>
          <div class="speech-transcript-box" id="speech-transcript-box" style="display: none; margin-top: 10px;"></div>
          <button type="button" class="primary-button btn-green" id="mic-fallback-quiz-btn" style="margin-top: 12px; width: 100%; max-width: 220px; min-height: 42px; font-size: 15px; padding: 8px 18px; border-radius: 12px; font-weight: 700; cursor: pointer;">
            ${t('train_answer_quiz')}
          </button>
          <button type="button" class="primary-button btn-green" id="speech-continue-btn" style="display: none; margin-top: 12px; width: 100%; max-width: 220px; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer;">
            ${t('train_next_btn')}
          </button>
          <button type="button" class="card-bottom-diag-btn" id="speech-diag-trigger-btn" title="Check microphone" style="position: absolute; bottom: 8px; left: 8px; margin: 0;">
            ⚙️
          </button>
        </div>
      `;

      const micBtn = practiceArea.querySelector('#speech-mic-btn');
      const holdHint = practiceArea.querySelector('#speech-hold-hint');
      const transcriptBox = practiceArea.querySelector('#speech-transcript-box');
      const fallbackBtn = practiceArea.querySelector('#mic-fallback-quiz-btn');
      const continueBtn = practiceArea.querySelector('#speech-continue-btn');
      const diagBtn = practiceArea.querySelector('#speech-diag-trigger-btn');

      if (fallbackBtn) {
        fallbackBtn.addEventListener('click', () => renderConsonantsQuiz());
      }

      function showFallbackButton(errorText = null) {
        if (errorText && transcriptBox) {
          transcriptBox.style.display = 'block';
          transcriptBox.innerHTML = `<span style="color: #ef4444; font-size: 14px; font-weight: 500;">⚠️ ${errorText}</span>`;
        }
        if (fallbackBtn) fallbackBtn.style.display = 'block';
      }

      showFallbackButton();

      if (diagBtn) {
        diagBtn.addEventListener('click', () => {
          openMicDiagnosticModal();
        });
      }

      const isMobileDevice = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent || '',
      );
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const preferNativeSpeech = !isMobileDevice && Boolean(SpeechRecognition);

      let mediaStream = null;
      let audioContext = null;
      let mediaRecorder = null;
      let nativeRecognition = null;
      let recordedChunks = [];
      let isListening = false;
      let isProcessing = false;
      let isCompleted = false;
      let autoStopTimer = null;
      let safetyWatchdog = null;

      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const mimeCandidates = isIOS
        ? [
            'audio/mp4',
            'audio/aac',
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg',
            'audio/wav',
          ]
        : [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/aac',
            'audio/ogg',
            'audio/wav',
          ];
      let supportedMimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        supportedMimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';
      }

      function clearAllTimers() {
        if (autoStopTimer) clearTimeout(autoStopTimer);
        if (safetyWatchdog) clearTimeout(safetyWatchdog);
        autoStopTimer = null;
        safetyWatchdog = null;
      }

      function stopSensorStreams() {
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          mediaStream = null;
        }
        if (nativeRecognition) {
          try {
            nativeRecognition.stop();
          } catch (e) {}
          nativeRecognition = null;
        }
        if (audioContext && audioContext.state !== 'closed') {
          try {
            audioContext.close();
          } catch (e) {}
          audioContext = null;
        }
      }

      // ===== ИСПРАВЛЕННАЯ handleNoSpeechHeard с разделением счётчиков =====
      function handleNoSpeechHeard(customMsg = null, isTechnical = false) {
        clearAllTimers();
        stopSensorStreams();
        if (isCompleted) return;
        isProcessing = false;
        isListening = false;
        if (micBtn) {
          micBtn.classList.remove('listening', 'processing', 'holding', 'ai-thinking');
          micBtn.innerHTML = '🎙️';
        }

        // Увеличиваем speechAttempts только если это НЕ техническая ошибка
        if (!isTechnical) {
          speechAttempts++;
        }

        const defaultRetryText = t('speech_not_recognized');

        // Filter out any raw technical JSON from customMsg
        let cleanErrorText = customMsg || defaultRetryText;
        if (cleanErrorText.includes('{') || cleanErrorText.includes('Key #') || cleanErrorText.includes('error (') || cleanErrorText.includes('failed across') || cleanErrorText.includes('ModelService')) {
          cleanErrorText = defaultRetryText;
        }

        if (speechAttempts < 5) {
          if (holdHint) {
            const attemptText = isTechnical
              ? t('train_try_again_mic')
              : t('train_try_n_of_m').replace('{n}', speechAttempts).replace('{m}', '5');
            holdHint.innerHTML = attemptText;
          }
          showFallbackButton(cleanErrorText);
        } else {
          // Достигнут лимит реальных попыток (5) – штраф
          isCompleted = true;
          if (micBtn) {
            micBtn.disabled = true;
            micBtn.classList.remove('listening', 'processing', 'holding', 'ai-thinking');
            micBtn.classList.add('wrong');
            micBtn.innerHTML = '❌';
          }
          if (holdHint) {
            holdHint.innerHTML = `<span style="color: #ef4444; font-weight: 700;">${t('train_penalty_xp')} <strong>${escapeHtml(currentWord.word)}</strong></span>`;
          }
          saveProgress(currentWord.id, false, 'quiz', { isFavPractice });
          if (continueBtn) {
            continueBtn.style.display = 'block';
            continueBtn.onclick = () => onNext();
          }
          if (fallbackBtn) fallbackBtn.style.display = 'none';
          if (transcriptBox) {
            transcriptBox.style.display = 'block';
            transcriptBox.innerHTML = `<span style="color: #ef4444; font-size: 14px; font-weight: 500;">⚠️ ${t('train_attempts_exhausted')}</span>`;
          }
        }
      }

      let isEvaluated = false;

      function startDesktopNativeSpeech() {
        if (isProcessing || isCompleted) return;
        clearAllTimers();
        isListening = true;
        isEvaluated = false;

        try {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch (e) {}

        setTimeout(() => {
          if (isProcessing || isCompleted || !isListening) {
            return;
          }

          try {
            nativeRecognition = new SpeechRecognition();
            nativeRecognition.lang = 'en-US';
            nativeRecognition.continuous = false;
            nativeRecognition.interimResults = true;
            nativeRecognition.maxAlternatives = 5;

            nativeRecognition.onstart = () => {
              if (micBtn) {
                micBtn.classList.remove('processing', 'success', 'ai-thinking');
                micBtn.classList.add('listening');
                micBtn.innerHTML = '🎙️';
              }
              if (holdHint) {
                holdHint.innerHTML = `<span class="speech-listening-text"><span class="speech-live-dot">●</span> ${t('speech_listening')}</span>`;
              }

              // Даем комфортные 6 секунд на произнесение слова
              const timeoutMs = 6000;
              autoStopTimer = setTimeout(() => {
                if (isListening && !isEvaluated) {
                  if (micBtn) {
                    micBtn.classList.remove('listening', 'processing');
                    micBtn.classList.add('ai-thinking');
                    micBtn.innerHTML = CUTE_AI_ROBOT_HTML;
                  }
                  if (holdHint) {
                    holdHint.innerHTML = `<span class="ai-thinking-text">✨ ${t('speech_evaluating')}</span>`;
                  }
                  try {
                    nativeRecognition.stop();
                  } catch (e) {}

                  // Watchdog: если Web Speech API завис и не вызвал onend/onresult
                  if (safetyWatchdog) clearTimeout(safetyWatchdog);
                  safetyWatchdog = setTimeout(() => {
                    if (!isEvaluated && !isCompleted) {
                      isListening = false;
                      isProcessing = false;
                      handleNoSpeechHeard(t('speech_not_recognized'), true);
                    }
                  }, 3000);
                }
              }, timeoutMs);
            };

            nativeRecognition.onspeechend = () => {
              if (isEvaluated || isCompleted || isProcessing) return;
              if (isListening && !isEvaluated) {
                if (micBtn) {
                  micBtn.classList.remove('listening', 'processing');
                  micBtn.classList.add('ai-thinking');
                  micBtn.innerHTML = CUTE_AI_ROBOT_HTML;
                }
                if (holdHint) {
                  holdHint.innerHTML = `<span class="ai-thinking-text">✨ ${t('speech_evaluating')}</span>`;
                }
                setTimeout(() => {
                  if (isListening && !isEvaluated) {
                    try {
                      nativeRecognition.stop();
                    } catch (e) {}
                  }
                }, 2000);
              }
            };

            nativeRecognition.onresult = (event) => {
              if (isEvaluated || isCompleted || isProcessing) return;

              const allResults = [];
              const finalResults = [];
              let isAnyFinal = false;

              for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) isAnyFinal = true;
                for (let j = 0; j < result.length; j++) {
                  const text = (result[j].transcript || '').trim();
                  if (text) {
                    allResults.push(text);
                    if (result.isFinal) finalResults.push(text);
                  }
                }
              }

              if (allResults.length > 0 && transcriptBox) {
                transcriptBox.style.display = 'block';
                transcriptBox.innerHTML = `🎤 <strong>«${allResults[0]}»</strong>`;
              }

              // Мгновенная проверка: если уже есть верное произношение, сразу засчитываем!
              if (checkSpeechMatch(allResults, currentWord.word)) {
                isEvaluated = true;
                clearAllTimers();
                isListening = false;
                try {
                  nativeRecognition.stop();
                } catch (e) {}
                evaluateSpeech(allResults, true);
                return;
              }

              // Финальная оценка после завершения распознавания фразы
              if (isAnyFinal && (finalResults.length > 0 || allResults.length > 0)) {
                isEvaluated = true;
                clearAllTimers();
                isListening = false;
                try {
                  nativeRecognition.stop();
                } catch (e) {}
                evaluateSpeech(finalResults.length > 0 ? finalResults : allResults);
              }
            };

            nativeRecognition.onerror = (err) => {
              if (isEvaluated || isCompleted || isProcessing) return;
              console.warn('Native speech error:', err.error);
              clearAllTimers();
              isListening = false;

              // Технические ошибки – не списываем попытку
              if (err.error === 'not-allowed' || err.error === 'audio-capture') {
                isEvaluated = true;
                handleNoSpeechHeard(t('train_mic_allow_browser'), true);
                return;
              }

              // Сетевые ошибки или блокировка сервиса Google Speech — переключаем на Gemini AI (MediaRecorder)
              if (err.error === 'network' || err.error === 'service-not-allowed') {
                isEvaluated = true;
                console.warn('Native speech network/service error, falling back to Gemini AI via MediaRecorder');
                if (transcriptBox) {
                  transcriptBox.style.display = 'block';
                  transcriptBox.innerHTML = t('train_switching_alt');
                }
                if (holdHint) {
                  holdHint.innerHTML = t('train_switching_alt');
                }
                startMobileMediaRecorder();
                return;
              }

              if (err.error === 'no-speech') {
                isEvaluated = true;
                handleNoSpeechHeard(t('train_voice_not_detected'), true);
                return;
              }

              // Остальные технические ошибки – переключаем на MediaRecorder (тоже не списываем)
              isEvaluated = true;
              console.warn('Переключение на MediaRecorder (ошибка:', err.error, ')');
              if (transcriptBox) {
                transcriptBox.style.display = 'block';
                transcriptBox.innerHTML = t('train_switching_alt');
              }
              if (holdHint) {
                holdHint.innerHTML = t('train_switching_alt');
              }
              startMobileMediaRecorder();
            };

            nativeRecognition.onend = () => {
              clearAllTimers();
              if (!isEvaluated && !isCompleted && !isProcessing) {
                isListening = false;
                handleNoSpeechHeard(t('train_voice_not_detected'), true);
              }
            };

            nativeRecognition.start();
          } catch (e) {
            console.warn('Native speech launch failed, using MediaRecorder:', e);
            if (transcriptBox) {
              transcriptBox.style.display = 'block';
              transcriptBox.innerHTML = t('train_switching_alt');
            }
            if (holdHint) {
              holdHint.innerHTML = t('train_switching_alt');
            }
            startMobileMediaRecorder();
          }
        }, 150);
      }

      async function inspectAudioBlob(blob) {
        return new Promise((resolve) => {
          try {
            const url = URL.createObjectURL(blob);
            const audio = new Audio();
            const cleanup = () => {
              try {
                URL.revokeObjectURL(url);
              } catch (e) {}
            };
            const timer = setTimeout(() => {
              cleanup();
              resolve({ ok: true, duration: 0, size: blob.size, type: blob.type });
            }, 600);

            audio.onloadedmetadata = () => {
              clearTimeout(timer);
              const result = {
                ok: true,
                duration: Math.round((audio.duration || 0) * 10) / 10,
                size: blob.size,
                type: blob.type,
              };
              cleanup();
              resolve(result);
            };

            audio.onerror = () => {
              clearTimeout(timer);
              cleanup();
              resolve({
                ok: false,
                duration: 0,
                size: blob.size,
                type: blob.type,
              });
            };

            audio.src = url;
            audio.load();
          } catch (e) {
            resolve({ ok: true, duration: 0, size: blob.size, type: blob.type });
          }
        });
      }

      async function startMobileMediaRecorder() {
        if (isProcessing || isCompleted) return;

        if (isListening && mediaRecorder && mediaRecorder.state === 'recording') {
          stopAndTranscribe();
          return;
        }

        clearAllTimers();
        isListening = true;

        try {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch (e) {}

        await new Promise((resolve) => setTimeout(resolve, 150));

        if (isProcessing || isCompleted || !isListening) {
          return;
        }

        if (!localStorage.getItem('myduo_mic_prompt_seen')) {
          await new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-backdrop';
            modal.id = 'mic-explainer-modal';
            modal.innerHTML = `
              <div class="modal-content" style="text-align: center; max-width: 340px; padding: 26px 20px; box-sizing: border-box; animation: scaleUp 0.2s ease;">
                <div style="font-size: 48px; margin-bottom: 12px; line-height: 1;">🎙️</div>
                <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 10px; color: var(--text-main);">${t('mic_modal_title')}</h3>
                <p style="font-size: 14px; color: var(--text-muted); line-height: 1.45; margin: 0 0 20px;">
                  ${t('mic_modal_desc')}
                </p>
                <button class="primary-button btn-green" id="mic-explainer-allow-btn" style="min-height: 46px; height: 46px; font-size: 15px; font-weight: 700; width: 100%;">
                  ${t('mic_modal_allow')}
                </button>
              </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('#mic-explainer-allow-btn').addEventListener('click', () => {
              localStorage.setItem('myduo_mic_prompt_seen', 'true');
              modal.remove();
              resolve(true);
            });
          });
        }

        try {
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (cErr) {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          }

          if (!isListening) {
            if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
            return;
          }

          let options = {};
          if (supportedMimeType) {
            options.mimeType = supportedMimeType;
          }

          try {
            mediaRecorder = new MediaRecorder(mediaStream, options);
          } catch (e1) {
            mediaRecorder = new MediaRecorder(mediaStream);
          }

          recordedChunks = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            clearAllTimers();
            isListening = false;
            isProcessing = true;

            const mime = mediaRecorder.mimeType || supportedMimeType || 'audio/webm';
            const audioBlob = new Blob(recordedChunks, { type: mime });
            stopSensorStreams();

            if (micBtn) {
              micBtn.classList.remove('listening', 'processing');
              micBtn.classList.add('ai-thinking');
              micBtn.innerHTML = CUTE_AI_ROBOT_HTML;
            }
            if (holdHint) {
              holdHint.innerHTML = `<span class="ai-thinking-text">✨ ${t('speech_evaluating')}</span>`;
            }

            try {
              const result = await transcribeAudio(audioBlob, mime, currentWord.word);
              const isAiCorrect = !!(result && result.isCorrect);
              const spokenWord = (result && (result.transcribed || result.heard || result.text) ? (result.transcribed || result.heard || result.text) : '').trim();
              const score = result && result.score !== undefined ? result.score : null;
              const feedback = result && result.feedback ? result.feedback : '';

              if (spokenWord || isAiCorrect) {
                if (transcriptBox) {
                  transcriptBox.style.display = 'block';
                  let heardHtml = '';
                  if (spokenWord) {
                    heardHtml += `🎤 «<strong>${escapeHtml(spokenWord)}</strong>»`;
                  }
                  if (score !== null) {
                    heardHtml += `${heardHtml ? ' — ' : ''}${t('stats_accuracy')}: <strong>${score}%</strong>`;
                  }
                  if (feedback) {
                    const fbColor = isAiCorrect ? '#16a34a' : '#d97706';
                    heardHtml += `<br><span style="font-size: 13px; color: ${fbColor}; font-style: italic;">💡 ${escapeHtml(feedback)}</span>`;
                  }
                  transcriptBox.innerHTML = heardHtml;
                }
                await evaluateSpeech([spokenWord], isAiCorrect);
              } else {
                handleNoSpeechHeard(t('train_voice_not_detected'), true);
              }
            } catch (transcribeErr) {
              console.warn('AI Transcribe error:', transcribeErr);
              const errMsg =
                transcribeErr && transcribeErr.message
                  ? transcribeErr.message
                  : t('train_try_again_mic');
              handleNoSpeechHeard(errMsg, true);
            }
          };

          // One-shot запись без timeslice (дает цельный закрытый медиа-контейнер)
          mediaRecorder.start();

          if (micBtn) {
            micBtn.classList.remove('processing', 'success', 'ai-thinking');
            micBtn.classList.add('listening');
            micBtn.innerHTML = '🎙️';
          }
          if (holdHint) {
            holdHint.innerHTML = `<span class="speech-listening-text"><span class="speech-live-dot">●</span> ${t('speech_listening')}</span>`;
          }

          const isPhrase = currentWord.word && currentWord.word.includes(' ');
          const timeoutMs = isPhrase ? 4500 : 3500;
          autoStopTimer = setTimeout(() => {
            if (isListening && mediaRecorder && mediaRecorder.state === 'recording') {
              stopAndTranscribe();
            }
          }, timeoutMs);
        } catch (micErr) {
          isListening = false;
          console.warn('Microphone access failed:', micErr);
          if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
            handleNoSpeechHeard(
              t('train_mic_allow_browser'),
              true,
            );
          } else {
            handleNoSpeechHeard(t('train_mic_launch_failed'), true);
          }
        }
      }

      function startSpeechSession() {
        if (typeof MediaRecorder !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          startMobileMediaRecorder();
        } else if (SpeechRecognition) {
          startDesktopNativeSpeech();
        } else {
          startMobileMediaRecorder();
        }
      }

      function stopAndTranscribe() {
        clearAllTimers();
        isListening = false;
        if (micBtn) {
          micBtn.classList.remove('listening', 'processing');
          micBtn.classList.add('ai-thinking');
          micBtn.innerHTML = CUTE_AI_ROBOT_HTML;
        }
        if (holdHint) {
          holdHint.innerHTML = `<span class="ai-thinking-text">✨ ${t('speech_evaluating')}</span>`;
        }

        if (nativeRecognition) {
          try {
            nativeRecognition.stop();
          } catch (e) {}
        }
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          try {
            mediaRecorder.stop();
          } catch (e) {}
        }
      }

      function openMicDiagnosticModal() {
        const modalEl = document.createElement('div');
        modalEl.className = 'speech-diag-modal';
        modalEl.innerHTML = `
          <div class="speech-diag-card">
            <h3 class="speech-diag-title">🛠️ Проверка микрофона</h3>
            
            <div class="speech-diag-item">
              <span>MediaRecorder STT:</span>
              <strong style="color: #16a34a;">${typeof MediaRecorder !== 'undefined' ? '✅ Поддерживается' : '❌ Не поддерживается'}</strong>
            </div>

            <div class="speech-diag-item">
              <span>Доступ к микрофону:</span>
              <strong id="diag-perm-status" style="color: #d97706;">⏳ Проверка...</strong>
            </div>

            <div style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">
              Датчик звука (скажите что-нибудь):
            </div>
            <div class="speech-volume-meter-container">
              <div class="speech-volume-meter-bar" id="diag-volume-bar"></div>
            </div>

            <div class="speech-diag-live-box" id="diag-transcript-box" style="display: none;"></div>

            <div style="display: flex; gap: 8px; margin-top: 4px; width: 100%;">
              <button type="button" class="primary-button btn-blue" id="diag-start-test-btn" style="flex: 1 1 0; min-width: 0; min-height: 42px; font-size: clamp(12px, 3.4vw, 13.5px); font-weight: 600; padding: 6px 4px; white-space: nowrap; display: flex; align-items: center; justify-content: center; text-align: center;">
                Test AI
              </button>
              <button type="button" class="primary-button" id="diag-ping-btn" style="flex: 1 1 0; min-width: 0; min-height: 42px; font-size: clamp(12px, 3.4vw, 13.5px); font-weight: 600; padding: 6px 4px; white-space: nowrap; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; display: flex; align-items: center; justify-content: center; text-align: center;">
                Ping
              </button>
              <button type="button" class="primary-button" id="diag-close-btn" style="flex: 1 1 0; min-width: 0; min-height: 42px; font-size: clamp(12px, 3.4vw, 13.5px); font-weight: 600; padding: 6px 4px; white-space: nowrap; background: rgba(0,0,0,0.08); color: var(--text-main); display: flex; align-items: center; justify-content: center; text-align: center;">
                Закрыть
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modalEl);

        let diagAudioCtx = null;
        let diagAnalyser = null;
        let diagStream = null;
        let diagAnimFrame = null;
        let diagRecorder = null;
        let diagChunks = [];

        const permStatus = modalEl.querySelector('#diag-perm-status');
        const volBar = modalEl.querySelector('#diag-volume-bar');
        const transcriptBox = modalEl.querySelector('#diag-transcript-box');
        const startBtn = modalEl.querySelector('#diag-start-test-btn');
        const pingBtn = modalEl.querySelector('#diag-ping-btn');
        const closeBtn = modalEl.querySelector('#diag-close-btn');

        async function initMicSensor() {
          try {
            diagStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (permStatus)
              permStatus.innerHTML = '<span style="color: #16a34a;">✅ Разрешено</span>';

            diagAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            diagAnalyser = diagAudioCtx.createAnalyser();
            diagAnalyser.fftSize = 256;
            const source = diagAudioCtx.createMediaStreamSource(diagStream);
            source.connect(diagAnalyser);

            const dataArray = new Uint8Array(diagAnalyser.frequencyBinCount);

            function updateMeter() {
              if (!diagAnalyser) return;
              diagAnalyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              const volumePercent = Math.min(100, Math.round((average / 100) * 100));
              if (volBar) volBar.style.width = `${Math.max(4, volumePercent * 1.5)}%`;
              diagAnimFrame = requestAnimationFrame(updateMeter);
            }
            updateMeter();
          } catch (err) {
            console.warn('Diag mic access failed:', err);
            if (permStatus)
              permStatus.innerHTML = '<span style="color: #ef4444;">🔒 Заблокировано</span>';
          }
        }

        initMicSensor();

        function stopDiagSensorStreams() {
          if (diagAnimFrame) {
            cancelAnimationFrame(diagAnimFrame);
            diagAnimFrame = null;
          }
          if (diagStream) {
            diagStream.getTracks().forEach((t) => t.stop());
            diagStream = null;
          }
          if (diagAudioCtx) {
            try {
              diagAudioCtx.close();
            } catch (e) {}
            diagAudioCtx = null;
          }
          if (volBar) volBar.style.width = '0%';
        }

        async function runDiagRecording(isPingOnly = false) {
          const expectedTarget = (currentWord && currentWord.word ? currentWord.word : 'hello').trim();

          transcriptBox.style.display = 'block';
          transcriptBox.innerHTML = isPingOnly
            ? `<span style="color: #0284c7; font-weight: 700;">🟡 Запись (2.5 сек)... Проверяю связь без AI</span>`
            : `<span style="color: #d97706; font-weight: 700;">🟡 Запись (2.5 сек)... Чётко скажите: «${expectedTarget}»!</span>`;

          startBtn.disabled = true;
          pingBtn.disabled = true;
          if (isPingOnly) {
            pingBtn.textContent = 'Ping...';
          } else {
            startBtn.textContent = 'Слушаю...';
          }

          try {
            let testStream = diagStream;
            if (!testStream || !testStream.active) {
              testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              diagStream = testStream;
            }

            let testOptions = {};
            if (supportedMimeType) testOptions.mimeType = supportedMimeType;

            try {
              diagRecorder = new MediaRecorder(testStream, testOptions);
            } catch (e) {
              diagRecorder = new MediaRecorder(testStream);
            }

            diagChunks = [];
            diagRecorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) diagChunks.push(e.data);
            };

            diagRecorder.onstop = async () => {
              await new Promise((r) => setTimeout(r, 80));
              testStream.getTracks().forEach((t) => t.stop());
              transcriptBox.innerHTML = isPingOnly ? '⏳ Проверяю связь с сервером (Ping)...' : '⏳ Проверяю через AI Gemini...';

              const mime = diagRecorder.mimeType || supportedMimeType || 'audio/webm';
              const blob = new Blob(diagChunks, { type: mime });

              const inspect = await inspectAudioBlob(blob);
              console.log('DIAG AUDIO INSPECT', inspect);

              try {
                if (isPingOnly) {
                  const pingRes = await transcribePingAudio(blob, mime, expectedTarget);
                  const keysInfo = pingRes.keysFoundCount !== undefined
                    ? `🔑 Ключей Gemini на сервере: <strong>${pingRes.keysFoundCount}</strong> (${pingRes.keysPreview || ''})<br>`
                    : '';
                  transcriptBox.innerHTML = `
                    <span style="color: #16a34a; font-weight: 700;">⚡ Ping успешен!</span><br>
                    <span style="font-size: 13px; color: var(--text-main);">
                      ${keysInfo}
                      Размер: <strong>${Math.round(blob.size / 1024 * 10) / 10} КБ</strong> | Длительность: <strong>${inspect.duration}с</strong> (${blob.type})<br>
                      Клиентский Roundtrip: <strong>${pingRes.totalClientMs} мс</strong> | Серверный парсинг: <strong>${pingRes.serverParseMs} мс</strong>
                    </span>
                  `;
                } else {
                  const res = await transcribeAudio(blob, mime, expectedTarget);
                  const heardWord = (res && (res.transcribed || res.heard || res.text)) || '';
                  if (heardWord) {
                    const scoreHtml = res.score !== undefined ? ` (Точность: <strong>${res.score}%</strong>)` : '';
                    const fbHtml = res.feedback ? `<br><span style="font-size: 13px; color: #16a34a; font-style: italic;">💡 ${res.feedback}</span>` : '';
                    let timeInfo = '';
                    if (res.timings) {
                      const totalSec = Math.round((res.timings.totalClientMs || res.timings.totalServerMs || 0) / 100) / 10;
                      const geminiSec = Math.round((res.timings.geminiMs || 0) / 100) / 10;
                      timeInfo = `<br><span style="font-size: 12px; color: var(--text-muted);">⏱️ Время: ${totalSec}с (Gemini: ${geminiSec}с, модель: ${res.modelUsed || '3.5-transcribe'})</span>`;
                    }
                    let debugInfo = '';
                    if (res.debug) {
                      debugInfo = `<br><span style="font-size: 11px; color: var(--text-muted);">Размер: ${Math.round(blob.size / 1024 * 10) / 10}КБ, ${inspect.duration}с | Raw: "${res.debug.rawText || ''}"</span>`;
                    }
                    transcriptBox.innerHTML = `Услышано AI: <strong style="color: #16a34a; font-size: 16px;">«${heardWord}»</strong>${scoreHtml}${fbHtml}${timeInfo}${debugInfo}`;
                  } else {
                    let debugInfo = '';
                    if (res && res.debug) {
                      debugInfo = `<br><span style="font-size: 11px; color: var(--text-muted);">Аудио: ${Math.round(blob.size / 1024 * 10) / 10}КБ, ${inspect.duration}с | Raw: "${res.debug.rawText || ''}" (${res.modelUsed})</span>`;
                    }
                    transcriptBox.innerHTML =
                      `<span style="color: var(--text-muted);">Голос не распознан. Попробуйте произнести громче «${expectedTarget}».</span>${debugInfo}`;
                  }
                }
              } catch (transErr) {
                transcriptBox.innerHTML = `<span style="color: #ef4444; font-weight: 600;">Ошибка: ${transErr.message}</span>`;
              }

              startBtn.disabled = false;
              pingBtn.disabled = false;
              startBtn.textContent = 'Test AI';
              pingBtn.textContent = 'Ping';
            };

            // One-shot запись без timeslice
            diagRecorder.start();

            setTimeout(() => {
              if (diagRecorder && diagRecorder.state === 'recording') {
                diagRecorder.stop();
              }
            }, 2500);
          } catch (err) {
            transcriptBox.innerHTML = `<span style="color: #ef4444;">Ошибка микрофона: ${err.message}</span>`;
            startBtn.disabled = false;
            pingBtn.disabled = false;
            startBtn.textContent = 'Test AI';
            pingBtn.textContent = 'Ping';
          }
        }

        startBtn.addEventListener('click', () => runDiagRecording(false));
        pingBtn.addEventListener('click', () => runDiagRecording(true));

        function cleanupDiag() {
          stopDiagSensorStreams();
          if (diagRecorder && diagRecorder.state === 'recording') {
            try {
              diagRecorder.stop();
            } catch (e) {}
          }
          modalEl.remove();
        }

        closeBtn.addEventListener('click', cleanupDiag);
        modalEl.addEventListener('click', (e) => {
          if (e.target === modalEl) cleanupDiag();
        });
      }

      async function evaluateSpeech(alternatives, forceCorrect = false) {
        if (isCompleted) return;
        clearAllTimers();
        isProcessing = true;
        const isMatch = forceCorrect || checkSpeechMatch(alternatives, currentWord.word);

        if (isMatch) {
          isCompleted = true;
          playSuccessSound();
          micBtn.classList.remove('listening', 'processing', 'ai-thinking');
          micBtn.classList.add('success');
          micBtn.innerHTML = '✓';
          if (holdHint) {
            holdHint.innerHTML = `<span style="color: #16a34a; font-weight: 700; font-size: 16px;">${t('train_speech_correct')}</span>`;
          }

          await saveProgress(currentWord.id, true, 'quiz', { isFavPractice });
          if (continueBtn) {
            continueBtn.style.display = 'block';
            continueBtn.onclick = () => onNext();
          }
          if (fallbackBtn) fallbackBtn.style.display = 'none';
        } else {
          // РЕАЛЬНАЯ ошибка произношения – списываем попытку
          speechAttempts++;
          micBtn.classList.remove('listening', 'processing', 'ai-thinking');

          if (speechAttempts < 5) {
            micBtn.innerHTML = '🎙️';
            if (holdHint) {
              holdHint.innerHTML = t('train_try_n_of_m', { n: speechAttempts, m: 5 });
            }
            setTimeout(() => {
              isProcessing = false;
            }, 1200);
          } else {
            isCompleted = true;
            micBtn.disabled = true;
            micBtn.classList.add('wrong');
            micBtn.innerHTML = '❌';

            if (holdHint) {
              holdHint.innerHTML = `<span style="color: #ef4444; font-weight: 700;">${t('train_penalty_xp')} <strong>${escapeHtml(currentWord.word)}</strong></span>`;
            }
            await saveProgress(currentWord.id, false, 'quiz', { isFavPractice });
            if (continueBtn) {
              continueBtn.style.display = 'block';
              continueBtn.onclick = () => onNext();
            }
            if (fallbackBtn) fallbackBtn.style.display = 'none';
          }
        }
      }

      micBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isProcessing || isCompleted) return;
        if (isListening) {
          stopAndTranscribe();
        } else {
          startSpeechSession();
        }
      });
    }

    function renderConsonantsQuiz() {
      const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
      const isVowel = (c) => VOWELS.has(c.toLowerCase());
      const isLetter = (c) => /[a-zA-Z]/.test(c);

      // Strip invisible/soft-hyphen characters (U+00AD, U+200B, U+FEFF) before processing
      const wordText = (currentWord.word || '').replace(/[\u00ad\u200b\ufeff]/g, '');

      // Split by words to prevent awkward mid-word breaks and avoid rendering giant space boxes
      const rawWords = wordText.split(/\s+/).filter(Boolean);

      // Suffix patterns for natural English syllable breaks
      const SUFFIX_PATTERNS = [
        /(tional|tionally)$/i,
        /(tion|sion|tions|sions)$/i,
        /(ment|ments)$/i,
        /(ship|ships)$/i,
        /(ness)$/i,
        /(less)$/i,
        /(ance|ence|ances|ences)$/i,
        /(able|ible|ably|ibly)$/i,
        /(tial|cial|tially|cially)$/i,
        /(tious|cious|tiously|ciously)$/i,
        /(ture|tures)$/i,
        /(tive|sive|tively|sively)$/i,
        /(nity|city|lity|rity|vity)$/i,
        /(fully|fulness)$/i,
        /(ing|ings)$/i,
        /(ize|ise|ized|ised)$/i,
        /(cal|ful|ous|ish)$/i,
        /(est|ier|iest)$/i,
        /([bcdfghjklmnpqrstvwxz]ly)$/i,
        /(ed)$/i,
        /(al|ally)$/i
      ];

      // Break long single words (>= 11 chars) by syllables so tiles never overflow screen width
      function splitWordSyllables(word) {
        if (word.length < 11) return [word];

        if (word.includes('-')) {
          const parts = word.split('-');
          let p1 = '', p2 = '';
          for (let i = 0; i < parts.length; i++) {
            if ((p1 + (p1 ? '-' : '') + parts[i]).length <= 9) {
              p1 += (p1 ? '-' : '') + parts[i];
            } else {
              p2 = parts.slice(i).join('-');
              break;
            }
          }
          if (p1 && p2) return [p1 + '-', p2];
        }

        for (const pat of SUFFIX_PATTERNS) {
          const m = word.match(pat);
          if (m && m.index > 0 && m.index >= 4 && (word.length - m.index <= 6)) {
            const p1 = word.slice(0, m.index);
            const p2 = word.slice(m.index);
            if (p1.length <= 10 && p2.length <= 10) return [p1, p2];
          }
        }

        const phonetic = word.match(/([bcdfghjklmnpqrstvwxz]{1,2}[aeiouy]+[bcdfghjklmnpqrstvwxz]*)$/i);
        if (phonetic && phonetic.index >= 4 && phonetic[0].length >= 2 && phonetic[0].length <= 5) {
          const p1 = word.slice(0, phonetic.index);
          const p2 = word.slice(phonetic.index);
          if (p1.length <= 10 && p2.length <= 10) return [p1, p2];
        }

        const target = Math.floor(word.length * 0.6);
        let bestSplit = target;
        for (let offset = 0; offset <= 3; offset++) {
          for (const sign of [-1, 1]) {
            const idx = target + sign * offset;
            if (idx >= 4 && idx <= word.length - 3) {
              const c1 = word[idx - 1], c2 = word[idx];
              const isV1 = /[aeiouy]/i.test(c1), isV2 = /[aeiouy]/i.test(c2);
              if (!isV1 && !isV2) { bestSplit = idx; break; }
              if (isV1 && !isV2) { bestSplit = idx; break; }
            }
          }
        }
        return [word.slice(0, bestSplit), word.slice(bestSplit)];
      }

      const wordSegments = [];
      rawWords.forEach((w, wIdx) => {
        const parts = splitWordSyllables(w);
        parts.forEach((p, pIdx) => {
          wordSegments.push({
            text: p,
            isSyllableBreak: pIdx < parts.length - 1,
            isWordBreak: pIdx === parts.length - 1 && wIdx < rawWords.length - 1,
          });
        });
      });

      // Adaptive tile sizing based on maximum segment character count
      const maxSegmentChars = Math.max(...wordSegments.map((s) => s.text.length));
      let tileWidth = 32;
      let tileHeight = 38;
      let fontSize = 18;
      let gap = 4;

      if (maxSegmentChars > 8) {
        tileWidth = 28;
        tileHeight = 36;
        fontSize = 16;
        gap = 3;
      } else if (maxSegmentChars > 6) {
        tileWidth = 30;
        tileHeight = 36;
        fontSize = 17;
        gap = 4;
      }

      let globalCharIndex = 0;
      let wordsHtml = '';

      wordSegments.forEach((seg) => {
        const lettersHtml = seg.text
          .split('')
          .map((char) => {
            const index = globalCharIndex++;
            if (!isLetter(char) || isVowel(char)) {
              return `<span class="letter-box vowel" style="display: inline-flex; align-items: center; justify-content: center; width: ${tileWidth}px; height: ${tileHeight}px; border-radius: 6px; font-size: ${fontSize}px; font-weight: 700; margin: 0; padding: 0 !important; text-align: center; vertical-align: middle; box-sizing: border-box; line-height: 1; background: rgba(255, 255, 255, 0.08); color: var(--text-main); border: 1.5px solid var(--border-color);">${char}</span>`;
            } else {
              return `<input type="text" class="letter-box consonant-input" data-index="${index}" data-correct="${char.toLowerCase()}" maxlength="1" autocomplete="off" autocapitalize="none" spellcheck="false" inputmode="text" style="display: inline-flex; align-items: center; justify-content: center; width: ${tileWidth}px; height: ${tileHeight}px; border-radius: 6px; font-size: ${fontSize}px; font-weight: 700; margin: 0; padding: 0 !important; -webkit-appearance: none; -moz-appearance: none; appearance: none; text-indent: 0; line-height: 1; text-align: center; vertical-align: middle; box-sizing: border-box; background: var(--bg-main); color: var(--text-main); border: 1.5px solid var(--border-color); caret-color: var(--text-main); outline: none; text-transform: lowercase; cursor: text;" />`;
            }
          })
          .join('');

        wordsHtml += `<div class="consonants-word-group" style="display: inline-flex; gap: ${gap}px; align-items: center; white-space: nowrap;">${lettersHtml}</div>`;

        if (seg.isSyllableBreak) {
          wordsHtml += `<div class="consonants-syllable-break" style="flex-basis: 100%; width: 100%; height: 6px;"></div>`;
        } else if (seg.isWordBreak) {
          globalCharIndex++;
          wordsHtml += `<div class="consonants-word-spacer" style="width: 10px; height: ${tileHeight}px; flex-shrink: 0;"></div>`;
        }
      });

      practiceArea.innerHTML = `
        <div class="consonants-quiz-container" style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; max-width: 400px; margin: 0 auto; padding: 10px 0;">
          <div class="consonants-word-grid" style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px 8px; margin-bottom: 10px; width: 100%;">
            ${wordsHtml}
          </div>
        </div>
      `;

      const inputs = Array.from(practiceArea.querySelectorAll('.consonant-input'));

      function focusNext(currentIndex) {
        const nextInput = inputs.find(
          (input) => parseInt(input.getAttribute('data-index')) > currentIndex,
        );
        if (nextInput) {
          nextInput.focus();
        }
      }

      if (inputs.length > 0) {
        setTimeout(() => {
          if (inputs[0]) inputs[0].focus();
        }, 200);
      }

      inputs.forEach((input) => {
        const correctChar = input.getAttribute('data-correct');
        const index = parseInt(input.getAttribute('data-index'));

        input.addEventListener('input', async (e) => {
          const val = input.value.trim().toLowerCase();
          if (!val) return;

          if (val === correctChar) {
            input.classList.remove('wrong');
            input.classList.add('correct');
            input.style.setProperty('background', 'rgba(16, 185, 129, 0.2)', 'important');
            input.style.setProperty('border-color', '#10b981', 'important');
            input.style.setProperty('color', '#10b981', 'important');
            input.setAttribute('readonly', 'true');
            input.disabled = true;

            const allCorrect = inputs.every((inp) => inp.classList.contains('correct'));
            if (allCorrect) {
              playSuccessSound();
              speakWord(currentWord.word, currentWord.id);
              await saveProgress(currentWord.id, true, 'quiz', { isFavPractice });
              onNextAfterSpeech(onNext, 1000, 8000);
            } else {
              focusNext(index);
            }
          } else {
            input.value = '';
            input.classList.add('wrong');
            input.style.setProperty('background', 'rgba(239, 68, 68, 0.2)', 'important');
            input.style.setProperty('border-color', '#ef4444', 'important');
            input.style.setProperty('color', '#ef4444', 'important');
            playErrorSound();

            setTimeout(() => {
              input.classList.remove('wrong');
              if (!input.classList.contains('correct')) {
                input.style.background = 'var(--bg-main)';
                input.style.borderColor = 'var(--border-color)';
                input.style.color = 'var(--text-main)';
              }
            }, 300);
          }
        });

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && input.hasAttribute('readonly')) {
            e.preventDefault();
          }
        });
      });
    }

    if (quizStage < 2) {
      renderStandardQuiz();
    } else if (quizStage === 2) {
      renderReverseQuiz();
    } else if (quizStage === 3) {
      // Stage 3 (Microphone / AI speech recognition) is temporarily disabled per user request
      renderConsonantsQuiz();
    } else {
      renderConsonantsQuiz();
    }
  } else if (currentMethod === 'pairs') {
    const TARGET_PAIRS_COUNT = 5;
    const roundWords = [currentWord];
    const usedIds = new Set([String(currentWord.id)]);

    // 1. Сначала берем слова из текущей очереди Пар (activeWords)
    if (activeWords && activeWords.length > 0) {
      const activeOthers = shuffleArray(activeWords.filter((w) => !usedIds.has(String(w.id))));
      for (const w of activeOthers) {
        if (roundWords.length >= TARGET_PAIRS_COUNT) break;
        roundWords.push(w);
        usedIds.add(String(w.id));
      }
    }

    // 2. Если в очереди осталось меньше 5 пар (например, в конце конвейера),
    // гарантированно дополняем до 5 пар по нашему принципу:
    // сначала самые старые по времени повторения Избранные, затем самые старые выученные слова
    if (roundWords.length < TARGET_PAIRS_COUNT) {
      const favList = getUserFavorites() || [];
      const favSet = new Set(favList.map(String));
      const userProgress = getUserProgress() || {};

      const categoryWords = (selectedCategory === 'All' || !selectedCategory)
        ? (allWords || [])
        : (allWords || []).filter((w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory));

      // A) Избранные слова категории, которых еще нет в раунде (от самых старых к новым)
      const candidateFavs = categoryWords.filter((w) => favSet.has(String(w.id)) && !usedIds.has(String(w.id)));
      candidateFavs.sort((a, b) => {
        const pA = userProgress[a.id] || userProgress[String(a.id)];
        const pB = userProgress[b.id] || userProgress[String(b.id)];
        return (pA?.lastPracticed || 0) - (pB?.lastPracticed || 0);
      });
      for (const w of candidateFavs) {
        if (roundWords.length >= TARGET_PAIRS_COUNT) break;
        roundWords.push(w);
        usedIds.add(String(w.id));
      }

      // Б) Ранее выученные слова (mastered) (от самых старых к новым)
      if (roundWords.length < TARGET_PAIRS_COUNT) {
        const candidateMastered = categoryWords.filter((w) => {
          const p = userProgress[w.id] || userProgress[String(w.id)];
          return p && isWordMastered(p) && !usedIds.has(String(w.id));
        });
        candidateMastered.sort((a, b) => {
          const pA = userProgress[a.id] || userProgress[String(a.id)];
          const pB = userProgress[b.id] || userProgress[String(b.id)];
          return (pA?.lastPracticed || pA?.masteredAt || 0) - (pB?.lastPracticed || pB?.masteredAt || 0);
        });
        for (const w of candidateMastered) {
          if (roundWords.length >= TARGET_PAIRS_COUNT) break;
          roundWords.push(w);
          usedIds.add(String(w.id));
        }
      }

      // В) Любые другие слова категории (на случай первых прохождений)
      if (roundWords.length < TARGET_PAIRS_COUNT) {
        const otherPool = shuffleArray(categoryWords.filter((w) => !usedIds.has(String(w.id))));
        for (const w of otherPool) {
          if (roundWords.length >= TARGET_PAIRS_COUNT) break;
          roundWords.push(w);
          usedIds.add(String(w.id));
        }
      }
    }

    function setupPairsRound() {
      if (window.__activePairsTimerInterval) {
        clearInterval(window.__activePairsTimerInterval);
        window.__activePairsTimerInterval = null;
      }

      const totalPairs = roundWords.length;
      const initialSeconds = totalPairs * 2 + 2;

      let timerStarted = false;
      let timeRemaining = initialSeconds;
      let isRoundFinished = false;
      let selectedLeft = null;
      let selectedRight = null;
      let matchedCount = 0;
      let errorsInRound = 0;

      const timerBadge = container.querySelector('#pairs-timer-badge');
      const timerVal = container.querySelector('#pairs-timer-val');

      function formatTimerStr(sec) {
        const s = Math.max(0, sec);
        const mins = Math.floor(s / 60);
        const remSecs = s % 60;
        return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
      }

      if (timerVal) {
        timerVal.textContent = formatTimerStr(initialSeconds);
      }
      if (timerBadge) {
        timerBadge.classList.remove('timer-active', 'timer-warning', 'timer-expired');
      }

      const leftItems = shuffleArray(
        roundWords.map((w) => ({ id: w.id, text: w.word, word: w.word, side: 'left' })),
      );

      function shuffleDerangement(items, leftReference) {
        if (items.length <= 1) return [...items];
        let shuffled = shuffleArray(items);
        for (let attempt = 0; attempt < 80; attempt++) {
          let hasDirectOpposite = false;
          for (let i = 0; i < shuffled.length; i++) {
            if (String(shuffled[i].id) === String(leftReference[i].id)) {
              hasDirectOpposite = true;
              break;
            }
          }
          if (!hasDirectOpposite) {
            return shuffled;
          }
          shuffled = shuffleArray(items);
        }

        const mapById = {};
        items.forEach((item) => {
          mapById[String(item.id)] = item;
        });
        return leftReference.map((leftItem, idx) => {
          const nextIdx = (idx + 1) % leftReference.length;
          const targetId = String(leftReference[nextIdx].id);
          return mapById[targetId] || items[idx];
        });
      }

      const rawRightItems = roundWords.map((w) => ({
        id: w.id,
        text: getWordTranslation(w),
        word: w.word,
        side: 'right',
      }));
      const rightItems = shuffleDerangement(rawRightItems, leftItems);

      function getPairFontSize(text) {
        const clean = String(text || '').trim();
        const words = clean.split(/\s+/);
        const maxWordLen = Math.max(...words.map((w) => w.replace(/[,\.?!;:]/g, '').length), 0);
        const totalLen = clean.length;
        const isNotebook = document.body.classList.contains('notebook-theme') || (localStorage.getItem('myduo_theme') === 'notebook');

        if (isNotebook) {
          if (maxWordLen >= 17 || totalLen > 35) return '15.5px';
          if (maxWordLen >= 14 || totalLen > 22) return '17.5px';
          if (maxWordLen >= 11 || totalLen > 15) return '19.5px';
          if (maxWordLen >= 8 || totalLen > 9) return '21.5px';
          return '24px';
        }

        if (maxWordLen >= 17 || totalLen > 55) return '12.5px';
        if (maxWordLen >= 14 || totalLen > 40) return '13.5px';
        if (maxWordLen >= 12 || totalLen > 28) return '15px';
        if (maxWordLen >= 10 || totalLen > 20) return '16px';
        return '17.5px';
      }

      practiceArea.innerHTML = `
        <div class="pairs-grid-container" style="position: relative;">
          <div class="pairs-grid">
            <div class="pairs-col" id="pairs-left-col">
              ${leftItems
                .map(
                  (item) => `
                <button type="button" class="pairs-card" data-id="${item.id}" data-side="left" data-word="${item.word}" style="font-size: ${getPairFontSize(item.text)};">
                  <span class="pairs-card-inner">${item.text}</span>
                </button>
              `,
                )
                .join('')}
            </div>
            <div class="pairs-col" id="pairs-right-col">
              ${rightItems
                .map(
                  (item) => `
                <button type="button" class="pairs-card" data-id="${item.id}" data-side="right" data-word="${item.word}" style="font-size: ${getPairFontSize(item.text)};">
                  <span class="pairs-card-inner">${item.text}</span>
                </button>
              `,
                )
                .join('')}
            </div>
          </div>
          <div id="pairs-timeout-container"></div>
        </div>
      `;

      requestAnimationFrame(() => {
        practiceArea.querySelectorAll('.pairs-card').forEach((card) => {
          const inner = card.querySelector('.pairs-card-inner');
          if (!inner) return;

          let size = parseFloat(window.getComputedStyle(card).fontSize) || 17.5;
          const maxHeight = card.clientHeight - 8;
          const maxWidth = card.clientWidth - 8;

          while ((inner.scrollHeight > maxHeight || inner.scrollWidth > maxWidth) && size > 9.5) {
            size -= 0.5;
            card.style.fontSize = `${size}px`;
          }
        });
      });

      const leftBtns = practiceArea.querySelectorAll('.pairs-card[data-side="left"]');
      const rightBtns = practiceArea.querySelectorAll('.pairs-card[data-side="right"]');

      function startTimerOnFirstAction() {
        if (timerStarted || isRoundFinished) return;
        timerStarted = true;
        if (timerBadge) {
          timerBadge.classList.add('timer-active');
        }
        playStopwatchTickSound(false);

        window.__activePairsTimerInterval = setInterval(() => {
          if (isRoundFinished) {
            clearInterval(window.__activePairsTimerInterval);
            window.__activePairsTimerInterval = null;
            return;
          }

          timeRemaining--;
          if (timerVal) {
            timerVal.textContent = formatTimerStr(timeRemaining);
          }

          if (timeRemaining <= 5 && timeRemaining > 0) {
            if (timerBadge) {
              timerBadge.classList.add('timer-warning');
            }
            playStopwatchTickSound(true);
          } else if (timeRemaining > 5) {
            playStopwatchTickSound(false);
          }

          if (timeRemaining <= 0) {
            clearInterval(window.__activePairsTimerInterval);
            window.__activePairsTimerInterval = null;
            triggerTimeout();
          }
        }, 1000);
      }

      async function triggerTimeout() {
        if (isRoundFinished) return;
        isRoundFinished = true;

        if (timerBadge) {
          timerBadge.classList.remove('timer-active');
          timerBadge.classList.add('timer-warning', 'timer-expired');
        }

        playFartSound();

        practiceArea.querySelectorAll('.pairs-card:not(.matched)').forEach((card) => {
          card.classList.remove('selected');
          card.classList.add('timeout-failed');
        });

        await saveProgress(currentWord.id, false, 'pairs', { isPairMistake: true, isFavPractice });

        const timeoutContainer = practiceArea.querySelector('#pairs-timeout-container');
        if (timeoutContainer) {
          timeoutContainer.innerHTML = `
            <div class="pairs-timeout-overlay">
              <div class="pairs-timeout-card">
                <div style="font-size: 42px; margin-bottom: 8px; line-height: 1;">⏱️</div>
                <h3 style="font-size: 22px; font-weight: 800; margin: 0 0 8px; color: #ef4444;">${t('train_time_up')}</h3>
                <div style="font-size: 14px; font-weight: 700; color: #dc2626; margin-bottom: 18px; background: rgba(239, 68, 68, 0.1); padding: 5px 14px; border-radius: 8px; display: inline-block;">
                  ${t('train_penalty_5xp')}
                </div>
                <button class="primary-button btn-green" id="retry-pairs-btn" style="min-height: 46px; font-size: 16px; font-weight: 700; width: 100%;">
                  ${t('train_try_again')}
                </button>
              </div>
            </div>
          `;

          const retryBtn = timeoutContainer.querySelector('#retry-pairs-btn');
          if (retryBtn) {
            retryBtn.addEventListener('click', () => {
              setupPairsRound();
            });
          }
        }
      }

      const checkPairMatch = async () => {
        if (!selectedLeft || !selectedRight || isRoundFinished) return;

        const leftId = selectedLeft.getAttribute('data-id');
        const rightId = selectedRight.getAttribute('data-id');

        const isMatch = String(leftId) === String(rightId);

        const curLeft = selectedLeft;
        const curRight = selectedRight;
        selectedLeft = null;
        selectedRight = null;

        if (isMatch) {
          if (matchedCount + 1 < totalPairs) {
            playSuccessSound();
          }
          curLeft.classList.remove('selected');
          curRight.classList.remove('selected');
          curLeft.classList.add('matched');
          curRight.classList.add('matched');

          await saveProgress(leftId, true, 'pairs', { isFavPractice });
          matchedCount++;

          if (matchedCount === totalPairs) {
            isRoundFinished = true;
            if (window.__activePairsTimerInterval) {
              clearInterval(window.__activePairsTimerInterval);
              window.__activePairsTimerInterval = null;
            }
            if (timerBadge) {
              timerBadge.classList.remove('timer-active', 'timer-warning');
            }

            playCasinoRollSound();

            const allCards = Array.from(practiceArea.querySelectorAll('.pairs-card'));
            allCards.forEach((card, idx) => {
              card.classList.remove('matched', 'selected', 'wrong');
              setTimeout(() => {
                card.classList.add('casino-flipping');
              }, idx * 80);
            });

            setTimeout(async () => {
              if (errorsInRound === 0 && !isFavPractice) {
                playCoinDropSound();
                try {
                  const uid = (typeof getEffectiveUserId === 'function') ? getEffectiveUserId() : null;
                  if (typeof addWeeklyXP === 'function') addWeeklyXP(5, uid);
                } catch (e) {}
              }
            }, 1350);

            setTimeout(() => {
              onNext();
            }, 2050);
          }
        } else {
          errorsInRound++;
          playErrorSound();
          curLeft.classList.add('wrong');
          curRight.classList.add('wrong');
          await saveProgress(leftId, false, 'pairs', { isPairMistake: true, isFavPractice });

          setTimeout(() => {
            if (!isRoundFinished) {
              curLeft.classList.remove('wrong', 'selected');
              curRight.classList.remove('wrong', 'selected');
            }
          }, 1950);
        }
      };

      leftBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          if (
            isRoundFinished ||
            btn.classList.contains('matched') ||
            btn.classList.contains('wrong')
          )
            return;
          startTimerOnFirstAction();

          leftBtns.forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedLeft = btn;

          if (selectedRight) {
            checkPairMatch();
          }
        });
      });

      rightBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          if (
            isRoundFinished ||
            btn.classList.contains('matched') ||
            btn.classList.contains('wrong')
          )
            return;
          startTimerOnFirstAction();

          rightBtns.forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedRight = btn;

          if (selectedLeft) {
            checkPairMatch();
          }
        });
      });
    }

    setupPairsRound();
  } else if (currentMethod === 'input') {
    practiceArea.innerHTML = `
      <div class="input-form-row">
        <div class="answer-input" id="answer-input" contenteditable="true" role="textbox" aria-placeholder="${t('train_input_placeholder')}" spellcheck="false" autocomplete="off" autocapitalize="none"></div>
        <button type="button" class="check-button" id="check-answer-btn">${t('train_check')}</button>
      </div>
      <div id="input-feedback" class="input-feedback" style="display: none; margin-top: 10px; font-weight: 600; text-align: center; font-size: 15px;"></div>
    `;

    const input = practiceArea.querySelector('#answer-input');
    const checkBtn = practiceArea.querySelector('#check-answer-btn');
    const feedback = practiceArea.querySelector('#input-feedback');
    let hasSecondChance = false;

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') return;
      if (input.textContent.length >= 40) {
        e.preventDefault();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (
        e.clipboardData ||
        window.clipboardData ||
        e.originalEvent?.clipboardData
      ).getData('text/plain');
      const sanitized = text.replace(/<[^>]*>?/gm, '').slice(0, 40);
      document.execCommand('insertText', false, sanitized);
    });

    input.addEventListener('input', () => {
      const text = input.textContent || '';
      const sanitized = text.replace(/<[^>]*>?/gm, '');
      if (text !== sanitized || text.length > 40) {
        input.textContent = sanitized.slice(0, 40);
        placeCaretAtEnd(input);
      }
    });

    function getCaretCharacterOffsetWithin(element) {
      let caretOffset = 0;
      try {
        const doc = element.ownerDocument || document;
        const win = doc.defaultView || window;
        const sel = win.getSelection();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          caretOffset = preCaretRange.toString().length;
        }
      } catch (e) {
        console.warn(e);
      }
      return caretOffset;
    }

    function setCaretCharacterOffsetWithin(element, offset) {
      if (!element) return;
      try {
        element.focus({ preventScroll: true });
        const textNode = element.firstChild;
        if (!textNode) {
          const range = document.createRange();
          range.selectNodeContents(element);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }
        const range = document.createRange();
        const safeOffset = Math.min(offset, textNode.length);
        range.setStart(textNode, safeOffset);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {
        console.warn(e);
      }
    }

    function placeCaretAtEnd(el) {
      if (!el) return;
      try {
        el.focus({ preventScroll: true });
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {}
    }

    function placeCaretAfterFirstMismatch(el) {
      if (!el) return;
      try {
        el.focus({ preventScroll: true });
        const firstMismatch = el.querySelector('.diff-char-inline.mismatch');
        if (firstMismatch) {
          const range = document.createRange();
          range.setStartAfter(firstMismatch);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }
        const matches = el.querySelectorAll('.diff-char-inline.match');
        if (matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
          const range = document.createRange();
          range.setStartAfter(lastMatch);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }
      } catch (e) {
        console.warn('Error placing caret after mismatch:', e);
      }
      placeCaretAtEnd(el);
    }

    function focusAndPlaceCaret(el) {
      if (!el) return;
      try {
        el.focus({ preventScroll: true });
      } catch (e) {}
      placeCaretAtEnd(el);
      requestAnimationFrame(() => {
        try {
          el.focus({ preventScroll: true });
        } catch (e) {}
        placeCaretAtEnd(el);
      });
      setTimeout(() => {
        try {
          el.focus({ preventScroll: true });
        } catch (e) {}
        placeCaretAtEnd(el);
      }, 50);
      setTimeout(() => {
        try {
          el.focus({ preventScroll: true });
        } catch (e) {}
        placeCaretAtEnd(el);
      }, 150);
    }

    function calculateLevenshtein(a, b) {
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          matrix[i][j] =
            b.charAt(i - 1) === a.charAt(j - 1)
              ? matrix[i - 1][j - 1]
              : Math.min(
                  matrix[i - 1][j - 1] + 1,
                  Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1),
                );
        }
      }
      return matrix[b.length][a.length];
    }

    function renderDiffHtml(userText, targetText) {
      let html = '';
      for (let i = 0; i < userText.length; i++) {
        const u = userText[i];
        const t = targetText[i];
        if (u === t) {
          html += `<span class="diff-char-inline match">${u}</span>`;
        } else {
          html += `<span class="diff-char-inline mismatch">${u}</span>`;
        }
      }
      if (userText.length < targetText.length) {
        const missingCount = targetText.length - userText.length;
        for (let j = 0; j < missingCount; j++) {
          html += `<span class="diff-missing-dash" contenteditable="false" aria-hidden="true"></span>`;
        }
      }
      return html;
    }

    const handleCheck = async () => {
      const rawText = input.textContent || '';
      const userAns = rawText
        .replace(/\u00a0/g, ' ')
        .replace(/_/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      const correctAns = currentWord.word.trim().toLowerCase();
      const isCorrect = userAns === correctAns;

      let isManyMistakes = false;
      if (!isCorrect && !hasSecondChance && userAns.length > 0) {
        const lev = calculateLevenshtein(userAns, correctAns);
        const maxAllowedDistance = Math.max(2, Math.floor(correctAns.length * 0.38));

        if (lev <= maxAllowedDistance) {
          hasSecondChance = true;
          playErrorSound();

          input.classList.remove('shake-input');
          void input.offsetWidth;
          input.classList.add('shake-input', 'correction-mode');

          feedback.style.display = 'block';
          feedback.style.color = '#ef4444';
          feedback.innerHTML = `
            <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px; color: var(--text-main);">
              ${t('train_typo_warning')}
            </div>
            <div class="diff-letters-row" style="letter-spacing: 5px; font-size: 20px; font-weight: 700; display: inline-block; margin-top: 4px;">
              ${renderDiffHtml(userAns, correctAns)}
            </div>
          `;

          checkBtn.textContent = t('train_fix_penalty');
          placeCaretAtEnd(input);
          return;
        } else {
          isManyMistakes = true;
        }
      }

      input.classList.remove('correction-mode');
      input.setAttribute('contenteditable', 'false');
      input.classList.add('disabled');
      checkBtn.disabled = true;

      // 1. INSTANT UI FEEDBACK & SPEECH (0ms delay)
      speakWord(currentWord.word, currentWord.id);

      if (isCorrect) {
        input.classList.remove('wrong', 'shake-input');
        input.classList.add('correct');
        input.textContent = currentWord.word;
        feedback.style.display = 'block';
        feedback.style.color = 'var(--success-color, #16a34a)';

        const isSecondChanceFix = isCorrect && hasSecondChance;
        const successMsg = isSecondChanceFix ? t('train_fixed_success') : t('train_correct_xp');

        feedback.innerHTML = `
          <div style="font-size: 18px; font-weight: 700; color: var(--success-color, #16a34a);">
            ${successMsg}
          </div>
        `;
      } else {
        input.classList.add('wrong');
        feedback.style.display = 'block';
        feedback.innerHTML = `
          <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 4px;">${t('train_correct_label')}</div>
          <div style="font-size: 32px; font-weight: 800; color: var(--error-color, #dc2626); letter-spacing: 0.5px; line-height: 1.2;">
            ${escapeHtml(currentWord.word)}
          </div>
        `;

        const favBtn = container.querySelector('#fav-toggle-btn');
        if (favBtn) {
          if (favorited || isManyMistakes) {
            favBtn.textContent = '❤️';
            favBtn.classList.add('is-favorite');
          } else {
            favBtn.classList.add('heart-hint-blink');
          }
        }
      }

      // 2. NON-BLOCKING ASYNC PROGRESS SYNC
      const isSecondChanceFix = isCorrect && hasSecondChance;
      const isSingleWordMode = Boolean(
        isSingleRemaining ||
        (activeWords && activeWords.length <= 1)
      );

      saveProgress(currentWord.id, isCorrect, 'input', {
        secondChanceFix: isSecondChanceFix,
        isSingleRemaining: isSingleWordMode,
        isFavPractice,
      }).then((prog) => {
        const inputCount = prog?.inputCorrect || (isCorrect ? 1 : 0);
        if (isCorrect) {
          if ((prog?.mastered || inputCount >= 2) && !favorited) {
            feedback.innerHTML = `<div style="font-size: 18px; font-weight: 700; color: var(--success-color, #16a34a);">${t('train_word_mastered')}</div>`;
          }
        }
        if (isManyMistakes) {
          favorited = true;
          toggleFavoriteApi(currentWord.id, true).catch(() => {});
          onFavoriteToggle(currentWord.id, true);
        } else if (prog?.autoFavorited) {
          favorited = true;
          onFavoriteToggle(currentWord.id, true);
        }
      }).catch((e) => console.warn(e));

      // 3. EXTENDED DISPLAY DURATION FOR MISTAKES (4200ms)
      // For correct answers: 1600ms
      // For wrong answers: 4200ms so user has ample time to review and memorize correct spelling
      const minDelay = isCorrect ? 1600 : 4200;
      const maxWait = isCorrect ? 3500 : 7000;

      const isFinalCard = (isSingleWordMode && isCorrect) || (isLastWord && isCorrect && activeWords.length <= 1);
      if (isFinalCard) {
        window._trainingRoundJustCompleted = true;
      }

      onNextAfterSpeech(onNext, minDelay, maxWait);
    };

    checkBtn.addEventListener('click', handleCheck);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCheck();
      }
    });

    input.addEventListener('focus', () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });

    focusAndPlaceCaret(input);
  } else {
    const startFlipped = Boolean(isFavPractice && window.__favsAutoplayRunning);
    const cardHtml = `
      <div class="flashcard-3d-wrapper">
        <div class="flashcard-3d ${startFlipped ? 'is-flipped' : ''}" id="flashcard-3d" title="${t('train_flip_card_hint')}">
          <div class="flashcard-face flashcard-front">
            <div class="flashcard-face-top">
              <button type="button" class="flashcard-sound-btn" id="fc-sound-front" title="${t('train_listen_audio')}">${FC_SOUND_ICON_HTML}</button>
              <button type="button" class="flashcard-fav-btn ${favorited ? 'is-favorite' : ''}" id="fc-fav-front" title="${t('train_to_favorites')}">
                ${getCardFavIconHtml(favorited)}
              </button>
            </div>
            <div class="flashcard-face-body">
              <h2 class="flashcard-word">${escapeHtml(currentWord.word)}</h2>
              ${(() => { const _rt = escapeHtml(String(currentWord.transcription || '').replace(/[\[\]]/g, '').replace(/^\/+|\/+$/g, '').trim()); return _rt ? `<p class="flashcard-transcription">/${_rt}/</p>` : ''; })()}
            </div>
            <div class="flashcard-face-bottom">
              <span class="flashcard-flip-prompt">${t('flip_for_translation')}</span>
            </div>
          </div>

          <div class="flashcard-face flashcard-back">
            <div class="flashcard-face-top">
              <button type="button" class="flashcard-sound-btn" id="fc-sound-back" title="${t('train_listen_audio')}">${FC_SOUND_ICON_HTML}</button>
              <button type="button" class="flashcard-fav-btn ${favorited ? 'is-favorite' : ''}" id="fc-fav-back" title="${t('train_to_favorites')}">
                ${getCardFavIconHtml(favorited)}
              </button>
            </div>
            <div class="flashcard-face-body">
              <h2 class="flashcard-translation">${escapeHtml(getWordTranslation(currentWord))}</h2>
              ${getWordNotes(currentWord) ? `<p class="flashcard-notes">${escapeHtml(getWordNotes(currentWord))}</p>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    const existingAutoplayBtn = practiceArea.querySelector('#favs-autoplay-toggle-btn');
    const existingWrapper = practiceArea.querySelector('.flashcard-3d-wrapper');

    if (isFavPractice && existingAutoplayBtn && existingWrapper) {
      existingWrapper.outerHTML = cardHtml;
      const favBadge = container.querySelector('#fav-counter-badge') || container.querySelector('.train-left-badge');
      if (favBadge) {
        const favLabel = t('favorites');
        const currentNum = activeWords.length > 0 ? (currentWordIndex % activeWords.length) + 1 : 1;
        favBadge.innerHTML = `${favLabel}: <strong>${currentNum}/${activeWords.length}</strong>`;
      }
    } else {
      practiceArea.innerHTML = `
        ${cardHtml}
        ${
          isFavPractice
            ? `
          <div class="difficulty-buttons" style="display: flex; margin-top: 34px; width: 100%;">
            <button type="button" class="autoplay-favs-btn-bottom ${window.__favsAutoplayRunning ? 'is-playing' : ''}" id="favs-autoplay-toggle-btn">
              ${getFavsAutoplayBtnContent(window.__favsAutoplayRunning)}
            </button>
          </div>
        `
            : `
          <div class="difficulty-buttons" id="card-feedback-btns">
            <button type="button" class="btn-learn" id="btn-learn">
              ${t('train_learn')}
            </button>
            <button type="button" class="btn-know" id="btn-know">
              ${t('train_know')}
            </button>
          </div>
        `
        }
      `;
    }

    const flashcardWrapper = practiceArea.querySelector('.flashcard-3d-wrapper');
    const flashcard = practiceArea.querySelector('#flashcard-3d');
    const feedbackBtns = practiceArea.querySelector('#card-feedback-btns');
    let isFlipped = startFlipped;
    let flipCount = 0;
    let shimmerTriggered = false;

    // Fan Swipe gesture support (Touch Events for iOS Safari + Pointer Events for Desktop)
    let startX = 0;
    let startY = 0;
    let targetDx = 0;
    let targetDy = 0;
    let isTouchActive = false;
    let isLockedSwipe = false;
    let hasSwiped = false;
    let rafId = null;

    function applyCardTransform() {
      if (!flashcardWrapper || !isLockedSwipe) return;
      const rot = targetDx * 0.055;
      flashcardWrapper.style.transform = `translate3d(${targetDx}px, ${targetDy * 0.15}px, 0) rotate(${rot}deg)`;
      rafId = null;
    }

    function onStart(clientX, clientY, target) {
      if (target.closest('.flashcard-sound-btn') || target.closest('.flashcard-fav-btn') || target.closest('#speech-diag-trigger-btn')) {
        return false;
      }
      isTouchActive = true;
      isLockedSwipe = false;
      targetDx = 0;
      targetDy = 0;
      startX = clientX;
      startY = clientY;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (flashcardWrapper) {
        flashcardWrapper.style.transition = 'none';
        flashcardWrapper.style.willChange = 'transform, opacity';
      }
      return true;
    }

    function onMove(clientX, clientY, cancelableEvent = null) {
      if (!isTouchActive) return;
      targetDx = clientX - startX;
      targetDy = clientY - startY;

      if (!isLockedSwipe) {
        const absX = Math.abs(targetDx);
        const absY = Math.abs(targetDy);
        if (absY > 8 && absY > absX * 1.1) {
          // Vertical scroll - abandon swipe
          isTouchActive = false;
          if (flashcardWrapper) {
            flashcardWrapper.style.transition = 'transform 0.2s ease';
            flashcardWrapper.style.transform = '';
          }
          return;
        }
        if (absX > 6) {
          isLockedSwipe = true;
        }
      }

      if (isLockedSwipe) {
        if (cancelableEvent && cancelableEvent.cancelable) {
          cancelableEvent.preventDefault();
        }
        if (flashcardWrapper && !rafId) {
          rafId = requestAnimationFrame(applyCardTransform);
        }
      }
    }

    const handleLearnCard = async () => {
      triggerHaptic('light');
      stopAllAudio();
      await saveProgress(currentWord.id, true, 'cards_learn', { isFavPractice });
      if (!isFavPractice) {
        const freshProg = getUserProgress();
        const catWords = (selectedCategory === 'All' || !selectedCategory)
          ? (allWords || [])
          : (allWords || []).filter((w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory));
        const favList = getUserFavorites();
        const favSet = new Set(favList.map(String));
        const totalUnmastered = catWords.filter((w) => {
          const p = freshProg[w.id] || freshProg[String(w.id)];
          return !favSet.has(String(w.id)) && (!p || !isWordMastered(p));
        });
        const pickedCount = catWords.filter((w) => {
          const p = freshProg[w.id] || freshProg[String(w.id)];
          return !favSet.has(String(w.id)) && p && p.roundCardsDone === true && !isWordMastered(p);
        }).length;
        const targetCount = Math.min(10, totalUnmastered.length || 10);
        if (pickedCount >= targetCount && targetCount > 0) {
          clearActiveConveyorBatch(catWords, true);
          getActiveConveyorBatch(catWords, freshProg, favList);
          if (typeof onMethodChange === 'function') {
            onMethodChange('quiz');
            return;
          }
        }
      }
      onNext();
    };

    const handleKnowCard = async () => {
      playSuccessSound();
      stopAllAudio();
      await saveProgress(currentWord.id, true, 'cards_know', { isFavPractice });
      setTimeout(() => {
        if (!isFavPractice) {
          const freshProg = getUserProgress();
          const catWords = (selectedCategory === 'All' || !selectedCategory)
            ? (allWords || [])
            : (allWords || []).filter((w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory));
          const favList = getUserFavorites();
          const favSet = new Set(favList.map(String));
          const remainingCandidates = catWords.filter((w) => {
            const p = freshProg[w.id] || freshProg[String(w.id)];
            return !favSet.has(String(w.id)) && (!p || !p.roundCardsDone) && !isWordMastered(p);
          });
          const pickedCount = catWords.filter((w) => {
            const p = freshProg[w.id] || freshProg[String(w.id)];
            return !favSet.has(String(w.id)) && p && p.roundCardsDone === true && !isWordMastered(p);
          }).length;
          if (remainingCandidates.length === 0 && pickedCount > 0) {
            clearActiveConveyorBatch(catWords, true);
            getActiveConveyorBatch(catWords, freshProg, favList);
            if (typeof onMethodChange === 'function') {
              onMethodChange('quiz');
              return;
            }
          }
        }
        onNext();
      }, 150);
    };

    async function onEnd() {
      if (!isTouchActive) return;
      isTouchActive = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const absDx = Math.abs(targetDx);

      if (isLockedSwipe && absDx > 45) {
        hasSwiped = true;
        stopAllAudio();

        if (targetDx < 0) {
          // SWIPE LEFT -> Next Word ("Знаю")
          if (flashcardWrapper) {
            flashcardWrapper.style.transition = 'transform 0.18s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.16s ease';
            flashcardWrapper.style.transform = `translate3d(-120vw, ${targetDy * 0.15}px, 0) rotate(-22deg)`;
            flashcardWrapper.style.opacity = '0';
          }
          await handleKnowCard();
        } else {
          // SWIPE RIGHT:
          if (isCardsMode && !isFavPractice) {
            // In conveyor Cards mode: SWIPE RIGHT -> "Учить"
            if (flashcardWrapper) {
              flashcardWrapper.style.transition = 'transform 0.18s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.16s ease';
              flashcardWrapper.style.transform = `translate3d(120vw, ${targetDy * 0.15}px, 0) rotate(22deg)`;
              flashcardWrapper.style.opacity = '0';
            }
            await handleLearnCard();
          } else if (canGoPrev && typeof onPrev === 'function') {
            triggerHaptic('light');
            if (flashcardWrapper) {
              flashcardWrapper.style.transition = 'transform 0.18s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.16s ease';
              flashcardWrapper.style.transform = `translate3d(120vw, ${targetDy * 0.15}px, 0) rotate(22deg)`;
              flashcardWrapper.style.opacity = '0';
            }
            setTimeout(() => {
              onPrev();
            }, 150);
          } else {
            // First card: bounce back smoothly
            if (flashcardWrapper) {
              flashcardWrapper.style.transition = 'transform 0.24s cubic-bezier(0.25, 1, 0.5, 1)';
              flashcardWrapper.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
            }
            setTimeout(() => { hasSwiped = false; }, 120);
          }
        }
      } else {
        if (flashcardWrapper) {
          flashcardWrapper.style.transition = 'transform 0.24s cubic-bezier(0.25, 1, 0.5, 1)';
          flashcardWrapper.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        }
        if (isLockedSwipe) {
          hasSwiped = true;
          setTimeout(() => { hasSwiped = false; }, 120);
        }
      }
      isLockedSwipe = false;
    }

    function onCancel() {
      if (!isTouchActive) return;
      isTouchActive = false;
      isLockedSwipe = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (flashcardWrapper) {
        flashcardWrapper.style.transition = 'transform 0.22s ease';
        flashcardWrapper.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
      }
    }

    if (flashcard) {
      // Touch events (iOS Safari & Android touchscreens)
      flashcard.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
          onStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
        }
      }, { passive: true });

      flashcard.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length === 1) {
          onMove(e.touches[0].clientX, e.touches[0].clientY, e);
        }
      }, { passive: false });

      flashcard.addEventListener('touchend', () => {
        onEnd();
      }, { passive: true });

      flashcard.addEventListener('touchcancel', () => {
        onCancel();
      }, { passive: true });

      // Pointer events for desktop mice
      flashcard.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') {
          onStart(e.clientX, e.clientY, e.target);
        }
      });
      flashcard.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse') {
          onMove(e.clientX, e.clientY, e);
        }
      });
      flashcard.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse') {
          onEnd();
        }
      });
      flashcard.addEventListener('pointercancel', (e) => {
        if (e.pointerType === 'mouse') {
          onCancel();
        }
      });
    }

    flashcard.addEventListener('click', (e) => {
      if (hasSwiped) {
        hasSwiped = false;
        return;
      }
      if (e.target.closest('.flashcard-sound-btn') || e.target.closest('.flashcard-fav-btn')) {
        return;
      }
      isFlipped = !isFlipped;
      flipCount++;
      flashcard.classList.toggle('is-flipped', isFlipped);

      if (feedbackBtns && feedbackBtns.style.display === 'none') {
        feedbackBtns.style.display = 'flex';
      }

      if (flipCount > 2 && !shimmerTriggered && !favorited) {
        shimmerTriggered = true;
        const favFront = practiceArea.querySelector('#fc-fav-front');
        const favBack = practiceArea.querySelector('#fc-fav-back');
        if (favFront) favFront.classList.add('heart-shimmer-45');
        if (favBack) favBack.classList.add('heart-shimmer-45');
      }

      if (!isFlipped) {
        speakWord(currentWord.word, currentWord.id);
      }
    });

    const handleCardSpeak = (e) => {
      e.stopPropagation();
      speakWord(currentWord.word, currentWord.id);
    };
    practiceArea.querySelector('#fc-sound-front')?.addEventListener('click', handleCardSpeak);
    practiceArea.querySelector('#fc-sound-back')?.addEventListener('click', handleCardSpeak);

    const handleCardFav = async (e) => {
      e.stopPropagation();
      favorited = !favorited;
      const favFront = practiceArea.querySelector('#fc-fav-front');
      const favBack = practiceArea.querySelector('#fc-fav-back');
      if (favFront) {
        favFront.innerHTML = getCardFavIconHtml(favorited);
        favFront.classList.toggle('is-favorite', favorited);
      }
      if (favBack) {
        favBack.innerHTML = getCardFavIconHtml(favorited);
        favBack.classList.toggle('is-favorite', favorited);
      }
      await toggleFavoriteApi(currentWord.id, favorited);
      onFavoriteToggle(currentWord.id, favorited);
    };
    practiceArea.querySelector('#fc-fav-front')?.addEventListener('click', handleCardFav);
    practiceArea.querySelector('#fc-fav-back')?.addEventListener('click', handleCardFav);

    practiceArea.querySelector('#btn-learn')?.addEventListener('click', handleLearnCard);
    practiceArea.querySelector('#btn-know')?.addEventListener('click', handleKnowCard);

    // Autoplay Loop handler for Favorites in Cards mode
    if (isCardsMode && isFavPractice) {
      if (typeof window.__favsAutoplayCycleId === 'undefined') {
        window.__favsAutoplayCycleId = 0;
      }
      const autoplayBtn = container.querySelector('#favs-autoplay-toggle-btn');

      function autoplayDelay(ms) {
        return new Promise((res) => {
          const t = setTimeout(res, ms);
          window.__favsAutoplayTimer = t;
        });
      }

      async function runAutoplayCycle() {
        if (!window.__favsAutoplayRunning) return;
        requestScreenWakeLock();
        startSilentAudioAnchor();
        const translation = getWordTranslation(currentWord);
        updateNativeBackgroundPlayback(currentWord.word, translation, true);
        updateMediaSessionStatus(true, currentWord, translation);
        const cycleId = ++window.__favsAutoplayCycleId;

        // 1. Show Translation (back face)
        if (flashcard) {
          isFlipped = true;
          if (!flashcard.classList.contains('is-flipped')) {
            flashcard.classList.add('is-flipped');
            await autoplayDelay(120);
          }
        }
        if (!window.__favsAutoplayRunning || window.__favsAutoplayCycleId !== cycleId) return;

        const userLang = getInterfaceLanguage() || 'ru';
        await speakTextInLangAsync(translation, userLang);

        if (!window.__favsAutoplayRunning || window.__favsAutoplayCycleId !== cycleId) return;

        // 2. Distinct Pause 2.4s between translation and English for recall
        await autoplayDelay(2400);
        if (!window.__favsAutoplayRunning || window.__favsAutoplayCycleId !== cycleId) return;

        // 3. Show English (front face) and speak
        if (flashcard) {
          isFlipped = false;
          flashcard.classList.remove('is-flipped');
        }
        await autoplayDelay(120);
        if (!window.__favsAutoplayRunning || window.__favsAutoplayCycleId !== cycleId) return;

        await speakWordAsync(currentWord.word);
        if (!window.__favsAutoplayRunning || window.__favsAutoplayCycleId !== cycleId) return;

        // 4. Distinct Pause 1.5s between 1st and 2nd English pronunciation
        await autoplayDelay(1500);
        if (!window.__favsAutoplayRunning || window.__favsAutoplayCycleId !== cycleId) return;

        // 5. Repeat English word (2nd pronunciation)
        await speakWordAsync(currentWord.word);
        if (!window.__favsAutoplayRunning || window.__favsAutoplayCycleId !== cycleId) return;

        // 6. Distinct Pause 2.2s before flipping to next card
        await autoplayDelay(2200);
        if (!window.__favsAutoplayRunning || window.__favsAutoplayCycleId !== cycleId) return;

        // 7. Advance to next card in loop
        onNext();
      }

      if (autoplayBtn) {
        const newAutoplayBtn = autoplayBtn.cloneNode(true);
        autoplayBtn.parentNode.replaceChild(newAutoplayBtn, autoplayBtn);

        // Global listeners for lock-screen/headphone/notification actions
        window.onBackgroundAudioNext = () => {
          if (window.__favsAutoplayRunning) {
            stopAllAudio();
            onNext();
          }
        };
        window.onBackgroundAudioPrev = () => {
          if (window.__favsAutoplayRunning && typeof onPrev === 'function') {
            stopAllAudio();
            onPrev();
          }
        };
        window.onBackgroundAudioToggle = (forcePlay) => {
          if (newAutoplayBtn) {
            if (forcePlay === true && !window.__favsAutoplayRunning) {
              newAutoplayBtn.click();
            } else if (forcePlay === false && window.__favsAutoplayRunning) {
              newAutoplayBtn.click();
            } else if (typeof forcePlay === 'undefined') {
              newAutoplayBtn.click();
            }
          }
        };

        newAutoplayBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.__favsAutoplayRunning) {
            window.__favsAutoplayRunning = false;
            window.__favsAutoplayCycleId = (window.__favsAutoplayCycleId || 0) + 1;
            if (window.__favsAutoplayTimer) clearTimeout(window.__favsAutoplayTimer);
            if (window.__favsAutoplayStartTimeout) clearTimeout(window.__favsAutoplayStartTimeout);
            stopAllAudio();
            stopSilentAudioAnchor();
            const translation = getWordTranslation(currentWord);
            updateNativeBackgroundPlayback(currentWord.word, translation, false);
            releaseScreenWakeLock();
            updateMediaSessionStatus(false, currentWord, translation);
            newAutoplayBtn.classList.remove('is-playing');
            newAutoplayBtn.innerHTML = getFavsAutoplayBtnContent(false);
            if (flashcard) {
              isFlipped = false;
              flashcard.classList.remove('is-flipped');
            }
          } else {
            primeAudioForAutoplay();
            window.__favsAutoplayRunning = true;
            window.__favsAutoplayCycleId = (window.__favsAutoplayCycleId || 0) + 1;
            requestScreenWakeLock();
            startSilentAudioAnchor();
            const translation = getWordTranslation(currentWord);
            startNativeBackgroundPlayback(currentWord.word, translation);
            updateMediaSessionStatus(true, currentWord, translation);
            newAutoplayBtn.classList.add('is-playing');
            newAutoplayBtn.innerHTML = getFavsAutoplayBtnContent(true);
            runAutoplayCycle();
          }
        });
      }

      if (window.__favsAutoplayRunning) {
        if (window.__favsAutoplayStartTimeout) clearTimeout(window.__favsAutoplayStartTimeout);
        window.__favsAutoplayStartTimeout = setTimeout(() => {
          if (window.__favsAutoplayRunning) runAutoplayCycle();
        }, 80);
      }
    }
  }
}

export { renderTrainingCard, sanitizeCategory };
