import {
  speakWord,
  preloadWordAudio,
  playSuccessSound,
  playErrorSound,
  playCasinoRollSound,
  playCoinDropSound,
  playStopwatchTickSound,
  playFartSound,
  isWordAudioPlaying,
} from '../../services/audioService.js?v=25.0';
import {
  saveProgress,
  toggleFavoriteApi,
  getUserFavorites,
  getUserProgress,
  transcribeAudio,
} from '../../services/api.js?v=21.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=130.0';

function sanitizeCategory(cat) {
  if (!cat) return 'Общие';
  return (
    String(cat)
      .replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '')
      .trim() || String(cat).trim()
  );
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function onNextAfterSpeech(onNext, minDelay = 600, maxWait = 4000) {
  const start = Date.now();
  const adjustedDelay = minDelay + 500;
  const adjustedMaxWait = maxWait + 500;

  function check() {
    const elapsed = Date.now() - start;
    const stillSpeaking = isWordAudioPlaying();

    if (!stillSpeaking && elapsed >= adjustedDelay) {
      onNext();
    } else if (elapsed >= adjustedMaxWait) {
      onNext();
    } else {
      setTimeout(check, 80);
    }
  }

  setTimeout(check, adjustedDelay);
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

function normalizeEnglish(str) {
  if (!str) return '';
  const stripped = String(str)
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
    .replace(/\b(a|an|the|to)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped === '' && str.trim().length > 0) {
    return String(str)
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return stripped;
}

function checkSpeechMatch(spokenList, targetWord) {
  const normTarget = normalizeEnglish(targetWord);
  if (!normTarget) return false;

  for (const rawSpoken of spokenList) {
    const normSpoken = normalizeEnglish(rawSpoken);
    if (!normSpoken) continue;

    if (normSpoken === normTarget) return true;

    // Сравнение по отдельным словам (строго до 2 слов в ответе)
    const wordsInSpoken = normSpoken.split(/\s+/).filter(Boolean);
    if (wordsInSpoken.length <= 2 && wordsInSpoken.includes(normTarget)) {
      return true;
    }

    // Для коротких слов (<= 4 букв, например ship, dog, art) не допускаем замену одной буквы на произвольную (ship -> shop)
    if (normTarget.length > 4) {
      const dist = calculateLevenshtein(normSpoken, normTarget);
      const maxDist = Math.max(1, Math.floor(normTarget.length * 0.25));
      if (dist <= maxDist && dist <= 2) return true;
    }

    const latinized = cyrillicToLatinPhonetic(rawSpoken.trim());
    if (latinized) {
      const normLatinized = normalizeEnglish(latinized);
      if (normLatinized === normTarget) return true;
      if (normTarget.length > 4) {
        const distTranslit = calculateLevenshtein(normLatinized, normTarget);
        if (distTranslit <= Math.max(1, Math.floor(normTarget.length * 0.25))) return true;
      }
    }
  }
  return false;
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
    selectedCategory = 'All',
    categories = [],
    isFavorite = false,
    onFavoriteToggle = () => {},
    onMethodChange = () => {},
    onCategoryChange = () => {},
    onNext = () => {},
    learningCount = 0,
    dailyGoal = 5,
    activeWords = [],
    availableModes = { cards: true, quiz: true, pairs: true, input: true },
  } = options;

  if (activeWords && activeWords.length > 0) {
    activeWords.slice(0, 3).forEach((w) => {
      if (w && w.word) preloadWordAudio(w.word);
    });
  }

  let favorited = isFavorite;

  const progressMap = getUserProgress() || {};
  const currentProg = progressMap[currentWord?.id] || {};
  const quizStage = currentProg.quizCorrect || 0;

  const isCardsMode = currentMethod === 'cards';
  const isPairsMode = currentMethod === 'pairs';
  const isInputMode = currentMethod === 'input';

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

  container.innerHTML = `
    <section class="word-card-container">
      
      <div class="card-header-bar">
        <div class="mode-switch-pills" id="mode-switch-pills">
          <div class="mode-pill-glider" id="mode-pill-glider"></div>
          <button type="button" class="mode-pill-btn ${isCardsMode ? 'active' : ''} ${!availableModes.cards ? 'disabled' : ''}" data-mode="cards" ${!availableModes.cards ? 'disabled' : ''}>
            ${getInterfaceLanguage() === 'ru' ? 'Карточки' : getInterfaceLanguage() === 'uk' ? 'Картки' : 'Cards'}
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
            ? `
            <div style="font-size: 13px; font-weight: 600; color: #16a34a; margin-bottom: 8px; background: rgba(22, 163, 74, 0.08); padding: 4px 12px; border-radius: 12px; display: inline-block;">
              🎯 ${t('train_in_progress')}: <strong>${learningCount} / ${dailyGoal}</strong> ${t('words')}
            </div>
          `
            : isPairsMode
              ? `
            <div class="pairs-header-box" style="margin: 4px 0 6px; display: flex; justify-content: space-between; align-items: center;">
              <h2 class="training-word" style="font-size: 20px; margin: 0;">🧩 ${getInterfaceLanguage() === 'ru' ? 'Найдите пары' : getInterfaceLanguage() === 'uk' ? 'Знайдіть пари' : 'Find the pairs'}</h2>
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
              <h2 class="training-word" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                ${currentWord.translation}
              </h2>
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
                <h2 class="training-word clickable-word-box" id="speak-word-trigger" title="Tap to speak word" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                  <span class="training-word-text">${currentWord.word}</span>
                </h2>
              `
                  : quizStage === 1
                    ? `
                <div class="listening-word-box clickable-word-box" id="speak-word-trigger" title="Tap to speak word">
                  <span class="listening-audio-icon">🎧</span>
                  <span class="listening-word-text" id="listening-word-text">${getInterfaceLanguage() === 'ru' ? 'Слушайте...' : getInterfaceLanguage() === 'uk' ? 'Слухайте...' : 'Listen...'}</span>
                </div>
              `
                    : quizStage === 2
                      ? `
                <h2 class="training-word" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                  ${currentWord.translation}
                </h2>
              `
                      : `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <h2 class="training-word" style="font-size: 22px; margin: 0; color: var(--text-main); line-height: 1.2;">
                    ${currentWord.translation}
                  </h2>
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

  const speakTrigger = container.querySelector('#speak-word-trigger');
  const soundBtn = container.querySelector('#speak-sound-btn');
  const handleSpeak = () => speakWord(currentWord.word, currentWord.id);
  if (speakTrigger && !isPairsMode) speakTrigger.addEventListener('click', handleSpeak);
  if (soundBtn && !isPairsMode) soundBtn.addEventListener('click', handleSpeak);

  if (currentMethod === 'cards' || (currentMethod === 'quiz' && quizStage <= 1)) {
    setTimeout(() => {
      try {
        speakWord(currentWord.word, currentWord.id);
      } catch (e) {}
    }, 100);
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
    function renderStandardQuiz() {
      const categoryFilteredWords =
        selectedCategory === 'All' || selectedCategory === 'Все категории'
          ? allWords
          : allWords.filter(
              (w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory),
            );
      const pool = categoryFilteredWords.length >= 6 ? categoryFilteredWords : allWords;
      const otherTranslations = pool
        .filter((w) => w.id !== currentWord.id)
        .map((w) => w.translation);
      const shuffledOthers = shuffleArray(otherTranslations).slice(0, 5);
      const choices = shuffleArray([currentWord.translation, ...shuffledOthers]);

      practiceArea.innerHTML = `<div class="quiz-grid">${choices.map((choice) => `<button type="button" class="quiz-option" data-choice="${choice}">${choice}</button>`).join('')}</div>`;
      practiceArea.querySelectorAll('.quiz-option').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const optionBtn = e.currentTarget;
          const isCorrect =
            String(optionBtn.getAttribute('data-choice')).trim() ===
            String(currentWord.translation).trim();

          const listenText = container.querySelector('#listening-word-text');
          if (listenText) {
            listenText.textContent = currentWord.word;
            listenText.style.fontWeight = '800';
            listenText.style.letterSpacing = '0.5px';
          }

          practiceArea.querySelectorAll('.quiz-option').forEach((b) => {
            b.disabled = true;
            if (b.getAttribute('data-choice') === currentWord.translation)
              b.classList.add('correct');
            else if (b === optionBtn && !isCorrect) b.classList.add('wrong');
          });

          if (isCorrect) playSuccessSound();
          else {
            playErrorSound();
            speakWord(currentWord.word, currentWord.id);
          }

          await saveProgress(currentWord.id, isCorrect, 'quiz');
          if (isCorrect) {
            onNextAfterSpeech(onNext, 800, 3500);
          } else {
            onNextAfterSpeech(onNext, 1200, 4500);
          }
        });
      });
    }

    function renderReverseQuiz(isFromSpeechFallback = false) {
      const categoryFilteredWords =
        selectedCategory === 'All' || selectedCategory === 'Все категории'
          ? allWords
          : allWords.filter(
              (w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory),
            );
      const pool = categoryFilteredWords.length >= 6 ? categoryFilteredWords : allWords;
      const otherWords = pool.filter((w) => w.id !== currentWord.id).map((w) => w.word);
      const shuffledOthers = shuffleArray(otherWords).slice(0, 5);
      const choices = shuffleArray([currentWord.word, ...shuffledOthers]);

      practiceArea.innerHTML = `<div class="quiz-grid">${choices.map((choice) => `<button type="button" class="quiz-option" data-choice="${choice}">${choice}</button>`).join('')}</div>`;
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
          await saveProgress(currentWord.id, isCorrect, 'quiz', { skipXp: isFromSpeechFallback });
          if (isCorrect) {
            onNextAfterSpeech(onNext, 800, 3500);
          } else {
            onNextAfterSpeech(onNext, 1200, 4500);
          }
        });
      });
    }

    function renderSpeechQuiz() {
      let speechAttempts = 0;

      practiceArea.innerHTML = `
        <div class="speech-quiz-container">
          <button type="button" class="speech-mic-btn" id="speech-mic-btn" title="Tap to speak word">
            🎙️
          </button>
          <div class="speech-hold-hint" id="speech-hold-hint">
            ${getInterfaceLanguage() === 'ru' ? 'Нажмите на микрофон и скажите слово' : getInterfaceLanguage() === 'uk' ? 'Натисніть на мікрофон і скажіть слово' : 'Tap the microphone and say the word'}
          </div>
          <div class="speech-transcript-box" id="speech-transcript-box" style="margin-top: 10px;"></div>
          <button type="button" class="primary-button btn-green" id="speech-continue-btn" style="display: none; margin-top: 12px; width: 100%; max-width: 220px; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer;">
            ${getInterfaceLanguage() === 'ru' ? 'Дальше' : getInterfaceLanguage() === 'uk' ? 'Далі' : 'Next'}
          </button>
          <button type="button" class="card-bottom-diag-btn" id="speech-diag-trigger-btn" title="Check microphone" style="margin-top: 12px;">
            ⚙️
          </button>
        </div>
      `;

      const micBtn = practiceArea.querySelector('#speech-mic-btn');
      const holdHint = practiceArea.querySelector('#speech-hold-hint');
      const transcriptBox = practiceArea.querySelector('#speech-transcript-box');
      const continueBtn = practiceArea.querySelector('#speech-continue-btn');
      const diagBtn = practiceArea.querySelector('#speech-diag-trigger-btn');

      function showFallbackButton(errorText = null) {
        if (!transcriptBox) return;
        transcriptBox.style.display = 'block';
        let html = '';
        if (errorText) {
          html += `<div style="margin-bottom: 8px; color: #ef4444; font-size: 14px; font-weight: 500;">⚠️ ${errorText}</div>`;
        }
        html += `
          <button type="button" class="primary-button btn-green" id="mic-fallback-quiz-btn" style="min-height: 38px; font-size: 14px; padding: 6px 16px; width: 100%;">
            🎯 ${getInterfaceLanguage() === 'ru' ? 'Ответить карточками' : getInterfaceLanguage() === 'uk' ? 'Відповісти картками' : 'Answer with cards'}
          </button>
        `;
        transcriptBox.innerHTML = html;
        const fbBtn = transcriptBox.querySelector('#mic-fallback-quiz-btn');
        if (fbBtn) {
          fbBtn.addEventListener('click', () => renderReverseQuiz(true));
        }
      }

      showFallbackButton();

      if (diagBtn) {
        diagBtn.addEventListener('click', () => {
          openMicDiagnosticModal();
        });
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const preferNativeSpeech = Boolean(SpeechRecognition);

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
          micBtn.classList.remove('listening', 'processing', 'holding');
          micBtn.innerHTML = '🎙️';
        }

        // Увеличиваем speechAttempts только если это НЕ техническая ошибка
        if (!isTechnical) {
          speechAttempts++;
        }

        if (speechAttempts < 5) {
          if (holdHint) {
            const attemptText = isTechnical
              ? getInterfaceLanguage() === 'ru'
                ? 'Попробуйте еще раз 🎙️'
                : getInterfaceLanguage() === 'uk'
                  ? 'Спробуйте ще раз 🎙️'
                  : 'Try again 🎙️'
              : getInterfaceLanguage() === 'ru'
                ? `Попробуйте еще раз 🎙️ (Попытка ${speechAttempts} из 5)`
                : getInterfaceLanguage() === 'uk'
                  ? `Спробуйте ще раз 🎙️ (Спроба ${speechAttempts} з 5)`
                  : `Try again 🎙️ (Attempt ${speechAttempts} of 5)`;
            holdHint.innerHTML = attemptText;
          }
          const errorText =
            customMsg ||
            (getInterfaceLanguage() === 'ru'
              ? 'Голос не распознан. Нажмите 🎙️ для повтора'
              : 'Voice not recognized. Tap 🎙️ to retry');
          showFallbackButton(errorText);
        } else {
          // Достигнут лимит реальных попыток (5) – штраф
          isCompleted = true;
          if (micBtn) {
            micBtn.disabled = true;
            micBtn.classList.add('wrong');
            micBtn.innerHTML = '❌';
          }
          if (holdHint) {
            holdHint.innerHTML =
              getInterfaceLanguage() === 'ru'
                ? `<span style="color: #ef4444; font-weight: 700;">Штраф -1 XP. Правильно: <strong>${currentWord.word}</strong></span>`
                : getInterfaceLanguage() === 'uk'
                  ? `<span style="color: #ef4444; font-weight: 700;">Штраф -1 XP. Правильно: <strong>${currentWord.word}</strong></span>`
                  : `<span style="color: #ef4444; font-weight: 700;">Penalty -1 XP. Correct: <strong>${currentWord.word}</strong></span>`;
          }
          saveProgress(currentWord.id, false, 'quiz');
          if (continueBtn) {
            continueBtn.style.display = 'block';
            continueBtn.onclick = () => onNext();
          }
          if (transcriptBox) {
            transcriptBox.style.display = 'block';
            transcriptBox.innerHTML = `<span style="color: #ef4444; font-size: 14px; font-weight: 500;">⚠️ Попытки исчерпаны. Нажмите "Продолжить" для перехода к следующему слову.</span>`;
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
            nativeRecognition.maxAlternatives = 3;

            nativeRecognition.onstart = () => {
              if (micBtn) {
                micBtn.classList.remove('processing', 'success');
                micBtn.classList.add('listening');
                micBtn.innerHTML = '🎙️';
              }
              if (holdHint) {
                holdHint.innerHTML =
                  '<span style="color: #d97706; font-weight: 700;">🟡 Слушаю... Произнесите слово!</span>';
              }

              const wordLength = currentWord.word ? currentWord.word.length : 5;
              const timeoutMs = wordLength <= 4 ? 1400 : wordLength <= 7 ? 1750 : 2100;
              autoStopTimer = setTimeout(() => {
                if (isListening && !isEvaluated) {
                  if (micBtn) {
                    micBtn.classList.remove('listening');
                    micBtn.classList.add('processing');
                  }
                  if (holdHint) holdHint.innerHTML = '⏳ Проверяю произношение...';
                  try {
                    nativeRecognition.stop();
                  } catch (e) {}

                  // Watchdog: если Web Speech API завис и не вызвал onend/onresult
                  if (safetyWatchdog) clearTimeout(safetyWatchdog);
                  safetyWatchdog = setTimeout(() => {
                    if (!isEvaluated && !isCompleted) {
                      isListening = false;
                      isProcessing = false;
                      handleNoSpeechHeard('Голос не распознан. Нажмите 🎙️ для повтора', true);
                    }
                  }, 3500);
                }
              }, timeoutMs);
            };

            nativeRecognition.onresult = (event) => {
              const finalResults = [];
              const interimResults = [];

              for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                  for (let j = 0; j < result.length; j++) {
                    if (result[j].transcript) {
                      finalResults.push(result[j].transcript.trim());
                    }
                  }
                } else {
                  for (let j = 0; j < result.length; j++) {
                    if (result[j].transcript) {
                      interimResults.push(result[j].transcript.trim());
                    }
                  }
                }
              }

              if (interimResults.length > 0 && transcriptBox) {
                transcriptBox.style.display = 'block';
                transcriptBox.innerHTML = `🎤 <span style="color: #6b7280;">${interimResults[0]}</span>`;
              }

              if (finalResults.length > 0) {
                isEvaluated = true;
                clearAllTimers();
                isListening = false;

                if (micBtn) {
                  micBtn.classList.remove('listening');
                  micBtn.classList.add('processing');
                }
                if (holdHint) holdHint.innerHTML = '⏳ Проверяю произношение...';

                if (transcriptBox) {
                  transcriptBox.style.display = 'block';
                  transcriptBox.innerHTML = `Услышано: <strong>«${finalResults[0]}»</strong>`;
                }

                evaluateSpeech(finalResults);
              }
            };

            nativeRecognition.onerror = (err) => {
              console.warn('Native speech error:', err.error);
              clearAllTimers();
              isListening = false;

              // Технические ошибки – не списываем попытку
              if (err.error === 'not-allowed' || err.error === 'audio-capture') {
                isEvaluated = true;
                handleNoSpeechHeard('🔒 Разрешите микрофон в браузере', true);
                return;
              }

              if (err.error === 'no-speech') {
                isEvaluated = true;
                handleNoSpeechHeard('Голос не обнаружен. Нажмите 🎙️ для повтора', true);
                return;
              }

              // Остальные технические ошибки – переключаем на MediaRecorder (тоже не списываем)
              isEvaluated = true;
              console.warn('Переключение на MediaRecorder (ошибка:', err.error, ')');
              if (transcriptBox) {
                transcriptBox.style.display = 'block';
                transcriptBox.innerHTML = '⏳ Переключаемся на альтернативное распознавание...';
              }
              if (holdHint) {
                holdHint.innerHTML = '⏳ Подключаем запасной вариант...';
              }
              startMobileMediaRecorder();
            };

            nativeRecognition.onend = () => {
              clearAllTimers();
              if (!isEvaluated && !isCompleted && !isProcessing) {
                isListening = false;
                handleNoSpeechHeard('Голос не распознан. Нажмите 🎙️ для повтора', true);
              }
            };

            nativeRecognition.start();
          } catch (e) {
            console.warn('Native speech launch failed, using MediaRecorder:', e);
            if (transcriptBox) {
              transcriptBox.style.display = 'block';
              transcriptBox.innerHTML = '⏳ Переключаемся на альтернативное распознавание...';
            }
            if (holdHint) {
              holdHint.innerHTML = '⏳ Подключаем запасной вариант...';
            }
            startMobileMediaRecorder();
          }
        }, 150);
      }

      async function startMobileMediaRecorder() {
        if (isProcessing || isCompleted) return;

        if (isListening && mediaRecorder && mediaRecorder.state === 'recording') {
          stopAndTranscribe();
          return;
        }

        clearAllTimers();
        // Синхронно выставляем флаг
        isListening = true;

        try {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch (e) {}

        await new Promise((resolve) => setTimeout(resolve, 150));

        if (isProcessing || isCompleted || !isListening) {
          return;
        }

        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

          if (!isListening) {
            if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
            return;
          }

          let options = {};
          if (supportedMimeType) {
            options = { mimeType: supportedMimeType };
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
              micBtn.classList.remove('listening');
              micBtn.classList.add('processing');
              micBtn.innerHTML = '🎙️';
            }
            if (holdHint) holdHint.innerHTML = '⏳ Проверяю произношение...';

            try {
              const result = await transcribeAudio(audioBlob, mime, currentWord.word);
              const isAiCorrect = !!(result && result.isCorrect);
              const spokenWord = (result && result.transcribed ? result.transcribed : '').trim();
              const score = result && result.score !== undefined ? result.score : null;
              const feedback = result && result.feedback ? result.feedback : '';

              if (spokenWord || isAiCorrect) {
                if (transcriptBox) {
                  transcriptBox.style.display = 'block';
                  let heardHtml = '';
                  if (score !== null) {
                    heardHtml += `Точность произношения: <strong>${score}%</strong>`;
                  }
                  if (feedback) {
                    const fbColor = isAiCorrect ? '#16a34a' : '#d97706';
                    heardHtml += `${score !== null ? '<br>' : ''}<span style="font-size: 13px; color: ${fbColor}; font-style: italic;">💡 ${feedback}</span>`;
                  }
                  transcriptBox.innerHTML = heardHtml;
                }
                await evaluateSpeech([spokenWord], isAiCorrect);
              } else {
                // Техническая ошибка распознавания (AI не вернул текст) – не списываем попытку
                handleNoSpeechHeard('Голос не распознан. Нажмите 🎙️ для повтора', true);
              }
            } catch (transcribeErr) {
              console.warn('AI Transcribe error:', transcribeErr);
              const errMsg =
                transcribeErr && transcribeErr.message
                  ? transcribeErr.message
                  : 'Не удалось распознать. Нажмите 🎙️ для повтора';
              handleNoSpeechHeard(errMsg, true);
            }
          };

          mediaRecorder.start();

          if (micBtn) {
            micBtn.classList.remove('processing', 'success');
            micBtn.classList.add('listening');
            micBtn.innerHTML = '🎙️';
          }
          if (holdHint)
            holdHint.innerHTML =
              '<span style="color: #d97706; font-weight: 700;">🟡 Слушаю... Произнесите слово!</span>';

          const wordLength = currentWord.word ? currentWord.word.length : 5;
          const timeoutMs = wordLength <= 4 ? 1400 : wordLength <= 7 ? 1750 : 2100;
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
              '🔒 Доступ к микрофону заблокирован. Разрешите микрофон в браузере.',
              true,
            );
          } else {
            handleNoSpeechHeard('Не удалось запустить микрофон', true);
          }
        }
      }

      function startSpeechSession() {
        if (preferNativeSpeech) {
          startDesktopNativeSpeech();
        } else {
          startMobileMediaRecorder();
        }
      }

      function stopAndTranscribe() {
        clearAllTimers();
        isListening = false;

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

            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <button type="button" class="primary-button btn-blue" id="diag-start-test-btn" style="flex: 1; min-height: 42px; font-size: 14px;">
                🎙️ Начать тест
              </button>
              <button type="button" class="primary-button" id="diag-close-btn" style="flex: 1; min-height: 42px; font-size: 14px; background: rgba(0,0,0,0.08); color: var(--text-main);">
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

        startBtn.addEventListener('click', async () => {
          stopDiagSensorStreams();

          transcriptBox.style.display = 'block';
          transcriptBox.innerHTML =
            '<span style="color: #d97706; font-weight: 700;">🟡 Запись... Скажите слово в телефон!</span>';
          startBtn.disabled = true;
          startBtn.textContent = '🔴 Запись (2.5 сек)...';

          try {
            const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let testOptions = {};
            if (supportedMimeType) testOptions = { mimeType: supportedMimeType };

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
              testStream.getTracks().forEach((t) => t.stop());
              transcriptBox.innerHTML = '⏳ Проверяю через AI Gemini...';

              const mime = diagRecorder.mimeType || supportedMimeType || 'audio/webm';
              const blob = new Blob(diagChunks, { type: mime });

              try {
                const res = await transcribeAudio(blob, mime, 'hello');
                if (res && res.text) {
                  transcriptBox.innerHTML = `Услышано AI: <strong style="color: #16a34a; font-size: 16px;">«${res.text}»</strong>`;
                } else {
                  transcriptBox.innerHTML =
                    '<span style="color: var(--text-muted);">Голос не распознан. Попробуйте ещё раз.</span>';
                }
              } catch (transErr) {
                transcriptBox.innerHTML = `<span style="color: var(--text-muted);">Ошибка: ${transErr.message}</span>`;
              }

              startBtn.disabled = false;
              startBtn.textContent = '🎙️ Повторить тест';
            };

            diagRecorder.start();

            setTimeout(() => {
              if (diagRecorder && diagRecorder.state === 'recording') {
                diagRecorder.stop();
              }
            }, 2500);
          } catch (err) {
            transcriptBox.innerHTML = `<span style="color: var(--text-muted);">Ошибка микрофона: ${err.message}</span>`;
            startBtn.disabled = false;
            startBtn.textContent = '🎙️ Начать тест';
          }
        });

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
        clearAllTimers();
        isProcessing = true;
        const isMatch = forceCorrect || checkSpeechMatch(alternatives, currentWord.word);

        if (isMatch) {
          isCompleted = true;
          playSuccessSound();
          micBtn.classList.remove('listening', 'processing');
          micBtn.classList.add('success');
          micBtn.innerHTML = '✓';
          if (holdHint) {
            holdHint.innerHTML = `<span style="color: #16a34a; font-weight: 700; font-size: 16px;">${
              getInterfaceLanguage() === 'ru'
                ? '✓ Отлично! Произношение верное!'
                : getInterfaceLanguage() === 'uk'
                  ? '✓ Відмінно! Вимова правильна!'
                  : '✓ Perfect! Correct pronunciation!'
            }</span>`;
          }

          await saveProgress(currentWord.id, true, 'quiz');
          if (continueBtn) {
            continueBtn.style.display = 'block';
            continueBtn.onclick = () => onNext();
          }
        } else {
          // РЕАЛЬНАЯ ошибка произношения – списываем попытку
          speechAttempts++;
          micBtn.classList.remove('listening', 'processing');

          if (speechAttempts < 5) {
            micBtn.innerHTML = '🎙️';
            if (holdHint) {
              holdHint.innerHTML =
                getInterfaceLanguage() === 'ru'
                  ? `Попробуйте повторить 🎙️ (Попытка ${speechAttempts} из 5)`
                  : getInterfaceLanguage() === 'uk'
                    ? `Спробуйте повторити 🎙️ (Спроба ${speechAttempts} з 5)`
                    : `Try to repeat 🎙️ (Attempt ${speechAttempts} of 5)`;
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
              holdHint.innerHTML =
                getInterfaceLanguage() === 'ru'
                  ? `<span style="color: #ef4444; font-weight: 700;">Штраф -1 XP. Правильно: <strong>${currentWord.word}</strong></span>`
                  : getInterfaceLanguage() === 'uk'
                    ? `<span style="color: #ef4444; font-weight: 700;">Штраф -1 XP. Правильно: <strong>${currentWord.word}</strong></span>`
                    : `<span style="color: #ef4444; font-weight: 700;">Penalty -1 XP. Correct: <strong>${currentWord.word}</strong></span>`;
            }
            await saveProgress(currentWord.id, false, 'quiz');
            if (continueBtn) {
              continueBtn.style.display = 'block';
              continueBtn.onclick = () => onNext();
            }
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

      const wordText = currentWord.word;

      practiceArea.innerHTML = `
        <div class="consonants-quiz-container" style="display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; max-width: 400px; margin: 0 auto; padding: 12px 6px;">
          <div class="consonants-word-grid" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin-bottom: 12px; width: 100%;">
            ${wordText
              .split('')
              .map((char, index) => {
                if (!isLetter(char) || isVowel(char)) {
                  return `<span class="letter-box vowel" style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 38px; border-radius: 6px; font-size: 18px; font-weight: 700; margin: 1px; text-align: center; vertical-align: middle; box-sizing: border-box; background: rgba(255, 255, 255, 0.08); color: var(--text-main); border: 1.5px solid var(--border-color);">${char}</span>`;
                } else {
                  return `<input type="text" class="letter-box consonant-input" data-index="${index}" data-correct="${char.toLowerCase()}" maxlength="1" autocomplete="off" autocapitalize="none" spellcheck="false" inputmode="text" style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 38px; border-radius: 6px; font-size: 18px; font-weight: 700; margin: 1px; text-align: center; vertical-align: middle; box-sizing: border-box; background: var(--bg-main); color: var(--text-main); border: 1.5px solid var(--border-color); caret-color: var(--text-main); outline: none; text-transform: lowercase; cursor: text;" />`;
                }
              })
              .join('')}
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
              await saveProgress(currentWord.id, true, 'quiz');
              onNextAfterSpeech(onNext, 1200, 4500);
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
      renderSpeechQuiz();
    } else {
      renderConsonantsQuiz();
    }
  } else if (currentMethod === 'pairs') {
    // ... (без изменений, оставляем как было)
    const TARGET_PAIRS_COUNT = 6;
    const roundWords = [currentWord];
    const usedIds = new Set([String(currentWord.id)]);

    if (activeWords && activeWords.length > 0) {
      const activeOthers = shuffleArray(activeWords.filter((w) => !usedIds.has(String(w.id))));
      for (const w of activeOthers) {
        if (roundWords.length >= TARGET_PAIRS_COUNT) break;
        roundWords.push(w);
        usedIds.add(String(w.id));
      }
    }

    if (roundWords.length < TARGET_PAIRS_COUNT) {
      try {
        const favIds = new Set((getUserFavorites() || []).map(String));
        const favWords = shuffleArray(
          allWords.filter((w) => favIds.has(String(w.id)) && !usedIds.has(String(w.id))),
        );
        for (const w of favWords) {
          if (roundWords.length >= TARGET_PAIRS_COUNT) break;
          roundWords.push(w);
          usedIds.add(String(w.id));
        }
      } catch (e) {
        console.warn('Error fetching favorites for pairs filler:', e);
      }
    }

    if (roundWords.length < TARGET_PAIRS_COUNT && allWords.length > 0) {
      const categoryOthers = shuffleArray(
        allWords.filter(
          (w) =>
            !usedIds.has(String(w.id)) &&
            (selectedCategory === 'All' ||
              selectedCategory === 'Все категории' ||
              sanitizeCategory(w.category) === sanitizeCategory(selectedCategory)),
        ),
      );
      for (const w of categoryOthers) {
        if (roundWords.length >= TARGET_PAIRS_COUNT) break;
        roundWords.push(w);
        usedIds.add(String(w.id));
      }

      if (roundWords.length < TARGET_PAIRS_COUNT) {
        const remainingAll = shuffleArray(allWords.filter((w) => !usedIds.has(String(w.id))));
        for (const w of remainingAll) {
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
        text: w.translation,
        word: w.word,
        side: 'right',
      }));
      const rightItems = shuffleDerangement(rawRightItems, leftItems);

      function getPairFontSize(text) {
        if (!text) return '17.5px';
        const len = text.length;
        if (len > 35) return '13.5px';
        if (len > 24) return '15px';
        if (len > 16) return '16.5px';
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

        await saveProgress(currentWord.id, false, 'pairs', { isPairMistake: true });

        const timeoutContainer = practiceArea.querySelector('#pairs-timeout-container');
        if (timeoutContainer) {
          timeoutContainer.innerHTML = `
            <div class="pairs-timeout-overlay">
              <div class="pairs-timeout-card">
                <div style="font-size: 42px; margin-bottom: 8px; line-height: 1;">⏱️</div>
                <h3 style="font-size: 22px; font-weight: 800; margin: 0 0 8px; color: #ef4444;">Время вышло!</h3>
                <div style="font-size: 14px; font-weight: 700; color: #dc2626; margin-bottom: 18px; background: rgba(239, 68, 68, 0.1); padding: 5px 14px; border-radius: 8px; display: inline-block;">
                  Штраф -5 XP
                </div>
                <button class="primary-button btn-green" id="retry-pairs-btn" style="min-height: 46px; font-size: 16px; font-weight: 700; width: 100%;">
                  🔄 Попробовать снова
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

          await saveProgress(leftId, true, 'pairs');
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
              if (errorsInRound === 0) {
                playCoinDropSound();
              }
              await saveProgress(currentWord.id, true, 'pairs', {
                perfectRound: errorsInRound === 0,
              });
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
          await saveProgress(leftId, false, 'pairs', { isPairMistake: true });

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
        <div class="answer-input" id="answer-input" contenteditable="true" role="textbox" aria-placeholder="Введите на английском..." spellcheck="false" autocomplete="off" autocapitalize="none"></div>
        <button type="button" class="check-button" id="check-answer-btn">Проверить</button>
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
              ⚠️ Опечатка! Исправьте ошибку:
            </div>
            <div class="diff-letters-row" style="letter-spacing: 5px; font-size: 20px; font-weight: 700; display: inline-block; margin-top: 4px;">
              ${renderDiffHtml(userAns, correctAns)}
            </div>
          `;

          checkBtn.textContent = 'Исправить (-1 XP)';
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

      speakWord(currentWord.word, currentWord.id);

      const isSecondChanceFix = isCorrect && hasSecondChance;
      const prog = await saveProgress(currentWord.id, isCorrect, 'input', {
        secondChanceFix: isSecondChanceFix,
      });
      const inputCount = prog?.inputCorrect || (isCorrect ? 1 : 0);

      if (isManyMistakes) {
        favorited = true;
        await toggleFavoriteApi(currentWord.id, true).catch((e) => console.warn(e));
        onFavoriteToggle(currentWord.id, true);
      } else if (prog?.autoFavorited) {
        favorited = true;
        onFavoriteToggle(currentWord.id, true);
      }

      if (isCorrect) {
        input.classList.remove('wrong', 'shake-input');
        input.classList.add('correct');
        input.textContent = currentWord.word;
        feedback.style.display = 'block';
        feedback.style.color = 'var(--success-color, #16a34a)';

        let successMsg = '';
        if (isSecondChanceFix) {
          successMsg = '✓ Исправлено! (-1 XP)';
        } else if (favorited) {
          successMsg = '✓ Правильно! Слово в Избранном ❤️';
        } else if (inputCount >= 3) {
          successMsg = '🎉 Слово выучено!';
        } else {
          successMsg = '✓ Верно! (+3 XP)';
        }

        feedback.innerHTML = `
          <div style="font-size: 18px; font-weight: 700; color: var(--success-color, #16a34a);">
            ${successMsg}
          </div>
        `;
      } else {
        input.classList.add('wrong');
        feedback.style.display = 'block';
        feedback.innerHTML = `
          <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 4px;">Правильно:</div>
          <div style="font-size: 32px; font-weight: 800; color: var(--error-color, #dc2626); letter-spacing: 0.5px; line-height: 1.2;">
            ${currentWord.word}
          </div>
        `;

        const favBtn = container.querySelector('#fav-toggle-btn');
        if (favBtn) {
          if (favorited) {
            favBtn.textContent = '❤️';
            favBtn.classList.add('is-favorite');
          } else {
            favBtn.classList.add('heart-hint-blink');
          }
        }
      }

      const minDelay = isCorrect ? (inputCount >= 3 && !favorited ? 2200 : 1600) : 2800;
      const maxWait = isCorrect ? 3500 : 6000;
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
    practiceArea.innerHTML = `
      <div class="flashcard-3d-wrapper">
        <div class="flashcard-3d" id="flashcard-3d" title="Нажмите, чтобы перевернуть карточку">
          <div class="flashcard-face flashcard-front">
            <div class="flashcard-face-top">
              <button type="button" class="flashcard-sound-btn" id="fc-sound-front" title="Прослушать">🔊</button>
              <button type="button" class="flashcard-fav-btn ${favorited ? 'is-favorite' : ''}" id="fc-fav-front" title="В Избранное">
                ${favorited ? '❤️' : '🤍'}
              </button>
            </div>
            <div class="flashcard-face-body">
              <h2 class="flashcard-word">${currentWord.word}</h2>
              ${currentWord.transcription ? `<p class="flashcard-transcription">${currentWord.transcription}</p>` : ''}
            </div>
            <div class="flashcard-face-bottom">
              <span class="flashcard-flip-prompt">Нажми, чтобы увидеть перевод</span>
            </div>
          </div>

          <div class="flashcard-face flashcard-back">
            <div class="flashcard-face-top">
              <button type="button" class="flashcard-sound-btn" id="fc-sound-back" title="Прослушать">🔊</button>
              <button type="button" class="flashcard-fav-btn ${favorited ? 'is-favorite' : ''}" id="fc-fav-back" title="В Избранное">
                ${favorited ? '❤️' : '🤍'}
              </button>
            </div>
            <div class="flashcard-face-body">
              <h2 class="flashcard-translation">${currentWord.translation}</h2>
              ${currentWord.notes ? `<p class="flashcard-notes">${currentWord.notes}</p>` : ''}
            </div>
          </div>
        </div>
      </div>
      
      <div class="difficulty-buttons" id="card-feedback-btns" style="display:none; margin-top: 16px; gap: 12px;">
        <button type="button" class="btn-learn" id="btn-learn">
          Учить
        </button>
        <button type="button" class="btn-know" id="btn-know">
          Знаю
        </button>
      </div>
    `;

    const flashcard = practiceArea.querySelector('#flashcard-3d');
    const feedbackBtns = practiceArea.querySelector('#card-feedback-btns');
    let isFlipped = false;
    let flipCount = 0;
    let shimmerTriggered = false;

    flashcard.addEventListener('click', (e) => {
      if (e.target.closest('.flashcard-sound-btn') || e.target.closest('.flashcard-fav-btn')) {
        return;
      }
      isFlipped = !isFlipped;
      flipCount++;
      flashcard.classList.toggle('is-flipped', isFlipped);

      if (feedbackBtns.style.display === 'none') {
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
        favFront.textContent = favorited ? '❤️' : '🤍';
        favFront.classList.toggle('is-favorite', favorited);
      }
      if (favBack) {
        favBack.textContent = favorited ? '❤️' : '🤍';
        favBack.classList.toggle('is-favorite', favorited);
      }
      await toggleFavoriteApi(currentWord.id, favorited);
      onFavoriteToggle(currentWord.id, favorited);
    };
    practiceArea.querySelector('#fc-fav-front')?.addEventListener('click', handleCardFav);
    practiceArea.querySelector('#fc-fav-back')?.addEventListener('click', handleCardFav);

    practiceArea.querySelector('#btn-learn').addEventListener('click', async () => {
      await saveProgress(currentWord.id, true, 'cards_learn');
      onNextAfterSpeech(onNext, 400, 3000);
    });

    practiceArea.querySelector('#btn-know').addEventListener('click', async () => {
      playSuccessSound();
      await saveProgress(currentWord.id, true, 'cards_know');
      onNextAfterSpeech(onNext, 400, 3000);
    });
  }
}

export { renderTrainingCard, sanitizeCategory };
