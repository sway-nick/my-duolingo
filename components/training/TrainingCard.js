import { speakWord, preloadWordAudio, playSuccessSound, playErrorSound, playCasinoRollSound, playCoinDropSound, playStopwatchTickSound, playFartSound } from '../../services/audioService.js?v=21.0';
import { saveProgress, toggleFavoriteApi, getUserFavorites, getUserProgress, transcribeAudio } from '../../services/api.js?v=21.0';

function sanitizeCategory(cat) {
  if (!cat) return 'Общие';
  return String(cat)
    .replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '')
    .trim() || String(cat).trim();
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function calculateLevenshtein(a, b) {
  if (!a || !b) return (a || b || '').length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1));
    }
  }
  return matrix[b.length][a.length];
}

function cyrillicToLatinPhonetic(str) {
  if (!str) return '';
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  return String(str).toLowerCase().split('').map(c => map[c] || c).join('');
}

function normalizeEnglish(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
    .replace(/\b(a|an|the|to)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkSpeechMatch(spokenList, targetWord) {
  const normTarget = normalizeEnglish(targetWord);
  if (!normTarget) return false;

  for (const rawSpoken of spokenList) {
    const normSpoken = normalizeEnglish(rawSpoken);
    if (!normSpoken) continue;

    if (normSpoken === normTarget) return true;

    // Check individual words in phrase
    const wordsInSpoken = normSpoken.split(' ');
    if (wordsInSpoken.includes(normTarget)) return true;

    // Check Levenshtein distance with tolerance
    const dist = calculateLevenshtein(normSpoken, normTarget);
    const maxDist = Math.max(1, Math.floor(normTarget.length * 0.35));
    if (dist <= maxDist) return true;

    // Check transliterated cyrillic match if browser captured speech in Russian
    const latinized = cyrillicToLatinPhonetic(rawSpoken.trim());
    if (latinized) {
      const normLatinized = normalizeEnglish(latinized);
      if (normLatinized === normTarget) return true;
      const distTranslit = calculateLevenshtein(normLatinized, normTarget);
      if (distTranslit <= Math.max(1, Math.floor(normTarget.length * 0.38))) return true;
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
    // Preload next 2 words in queue for instant 0ms audio latency
    activeWords.slice(0, 3).forEach((w) => {
      if (w && w.word) preloadWordAudio(w.word);
    });
  }

  let favorited = isFavorite;

  const progressMap = getUserProgress() || {};
  const currentProg = progressMap[currentWord?.id] || {};
  const quizStage = currentProg.quizCorrect || 0; // 0, 1 = EN->RU; 2 = RU->EN; 3 = Speak EN w/ prompt; 4 = Speak EN from memory

  const isCardsMode = currentMethod === 'cards';
  const isPairsMode = currentMethod === 'pairs';
  const isInputMode = currentMethod === 'input';

  function formatWordCount(cnt) {
    const lastDigit = cnt % 10;
    const lastTwo = cnt % 100;
    if (lastTwo >= 11 && lastTwo <= 19) return `${cnt} слов`;
    if (lastDigit === 1) return `${cnt} слово`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${cnt} слова`;
    return `${cnt} слов`;
  }

  container.innerHTML = `
    <section class="word-card-container">
      
      <!-- Top Mode Switcher Bar -->
      <div class="card-header-bar">
        <div class="mode-switch-pills" id="mode-switch-pills">
          <div class="mode-pill-glider" id="mode-pill-glider"></div>
          <button type="button" class="mode-pill-btn ${isCardsMode ? 'active' : ''} ${!availableModes.cards ? 'disabled' : ''}" data-mode="cards" ${!availableModes.cards ? 'disabled' : ''}>
            Карточки
          </button>
          <button type="button" class="mode-pill-btn ${currentMethod === 'quiz' ? 'active' : ''} ${!availableModes.quiz ? 'disabled' : ''}" data-mode="quiz" ${!availableModes.quiz ? 'disabled' : ''}>
            Квиз
          </button>
          <button type="button" class="mode-pill-btn ${isPairsMode ? 'active' : ''} ${!availableModes.pairs ? 'disabled' : ''}" data-mode="pairs" ${!availableModes.pairs ? 'disabled' : ''}>
            Пары
          </button>
          <button type="button" class="mode-pill-btn ${isInputMode ? 'active' : ''} ${!availableModes.input ? 'disabled' : ''}" data-mode="input" ${!availableModes.input ? 'disabled' : ''}>
            Тест
          </button>
        </div>
      </div>

      <!-- Word Display & Audio Button -->
      <div class="word-main-display">
        ${
          isCardsMode
            ? `
            <div style="font-size: 13px; font-weight: 600; color: #16a34a; margin-bottom: 8px; background: rgba(22, 163, 74, 0.08); padding: 4px 12px; border-radius: 12px; display: inline-block;">
              🎯 В обучении: <strong>${learningCount} / ${dailyGoal}</strong> слов
            </div>
          `
            : isPairsMode
            ? `
            <div class="pairs-header-box" style="margin: 4px 0 6px; display: flex; justify-content: space-between; align-items: center;">
              <h2 class="training-word" style="font-size: 20px; margin: 0;">🧩 Найдите пары</h2>
              <div class="pairs-timer-badge" id="pairs-timer-badge" title="Таймер раунда">
                <span class="pairs-timer-icon">⏱️</span>
                <span class="pairs-timer-val" id="pairs-timer-val">00:00</span>
              </div>
            </div>
          `
            : isInputMode
            ? `
            <div style="font-size: 13px; font-weight: 600; color: #16a34a; margin-bottom: 8px; background: rgba(22, 163, 74, 0.08); padding: 4px 12px; border-radius: 12px; display: inline-block;">
              ✍️ Осталось слов: <strong>${formatWordCount(activeWords.length)}</strong>
            </div>
            <div class="word-header-row">
              <button type="button" class="word-side-icon-btn" id="speak-sound-btn" title="Прослушать слово">🔊</button>
              <h2 class="training-word" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                ${currentWord.translation}
              </h2>
              <button type="button" class="favorite-button ${favorited ? 'is-favorite' : ''}" id="fav-toggle-btn" title="Добавить в Избранное">
                ${favorited ? '❤️' : '🤍'}
              </button>
            </div>
          `
            : `
            <div style="font-size: 13px; font-weight: 600; color: #16a34a; margin-bottom: 8px; background: rgba(22, 163, 74, 0.08); padding: 4px 12px; border-radius: 12px; display: inline-block;">
              🎯 Осталось слов: <strong>${formatWordCount(activeWords.length)}</strong>
            </div>
            <div class="word-header-row">
              ${
                quizStage === 0
                  ? `
                <button type="button" class="word-side-icon-btn" id="speak-sound-btn" title="Прослушать слово">🔊</button>
                <h2 class="training-word clickable-word-box" id="speak-word-trigger" title="Нажмите, чтобы прослушать слово" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                  <span class="training-word-text">${currentWord.word}</span>
                </h2>
              `
                  : quizStage === 1
                  ? `
                <button type="button" class="word-side-icon-btn" id="speak-sound-btn" title="Повторить звук">🔊</button>
                <div class="listening-word-box clickable-word-box" id="speak-word-trigger" title="Нажмите, чтобы прослушать слово">
                  <span class="listening-audio-icon">🎧</span>
                  <span class="listening-word-text" id="listening-word-text">Слушайте...</span>
                </div>
              `
                  : quizStage === 2
                  ? `
                <div style="width: 36px;"></div>
                <h2 class="training-word" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                  ${currentWord.translation}
                </h2>
              `
                  : quizStage === 3
                  ? `
                <button type="button" class="word-side-icon-btn" id="speak-sound-btn" title="Прослушать слово">🔊</button>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <h2 class="training-word clickable-word-box" id="speak-word-trigger" style="font-size: 22px; margin: 0; color: var(--text-main); line-height: 1.2;">
                    <span class="training-word-text">${currentWord.word}</span>
                  </h2>
                  <div style="font-size: 14px; font-weight: 600; color: var(--text-muted); margin-top: 4px;">${currentWord.translation}</div>
                </div>
              `
                  : `
                <div style="width: 36px;"></div>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <h2 class="training-word" style="font-size: 22px; margin: 0; color: var(--text-main); line-height: 1.2;">
                    ${currentWord.translation}
                  </h2>
                  <button type="button" class="speech-hint-btn" id="speech-hint-btn" style="margin-top: 6px; font-size: 13px; font-weight: 700; background: rgba(59, 130, 246, 0.12); color: var(--primary-color); border: 1px solid rgba(59, 130, 246, 0.25); padding: 3px 12px; border-radius: 12px; cursor: pointer;">
                    💡 Подсказка
                  </button>
                  <div id="speech-revealed-hint" style="display: none; font-size: 15px; font-weight: 800; color: var(--primary-color); margin-top: 4px;">${currentWord.word}</div>
                </div>
              `
              }
              <button type="button" class="favorite-button ${favorited ? 'is-favorite' : ''}" id="fav-toggle-btn" title="Добавить в Избранное">
                ${favorited ? '❤️' : '🤍'}
              </button>
            </div>
          `
        }
      </div>

      <!-- Practice Area based on active method -->
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
    else glider.style.transition = 'transform 0.32s cubic-bezier(0.34, 1.35, 0.7, 1), width 0.25s ease';
    glider.style.transform = `translateX(${offsetLeft}px)`;
    glider.style.width = `${btnWidth}px`;
  }

  const initialActive = container.querySelector('.mode-pill-btn.active');
  if (initialActive) {
    requestAnimationFrame(() => positionGlider(initialActive, false));
    setTimeout(() => positionGlider(initialActive, false), 50);
  }

  window.addEventListener('resize', () => {
    const activeBtn = container.querySelector('.mode-pill-btn.active');
    if (activeBtn) positionGlider(activeBtn, false);
  }, { passive: true });

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
    setTimeout(() => { try { speakWord(currentWord.word, currentWord.id); } catch (e) {} }, 100);
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
      const categoryFilteredWords = selectedCategory === 'All' || selectedCategory === 'Все категории' ? allWords : allWords.filter((w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory));
      const pool = categoryFilteredWords.length >= 6 ? categoryFilteredWords : allWords;
      const otherTranslations = pool.filter((w) => w.id !== currentWord.id).map((w) => w.translation);
      const shuffledOthers = shuffleArray(otherTranslations).slice(0, 5);
      const choices = shuffleArray([currentWord.translation, ...shuffledOthers]);

      practiceArea.innerHTML = `<div class="quiz-grid">${choices.map((choice) => `<button type="button" class="quiz-option" data-choice="${choice}">${choice}</button>`).join('')}</div>`;
      practiceArea.querySelectorAll('.quiz-option').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const optionBtn = e.currentTarget;
          const isCorrect = String(optionBtn.getAttribute('data-choice')).trim() === String(currentWord.translation).trim();

          const listenText = container.querySelector('#listening-word-text');
          if (listenText) {
            listenText.textContent = currentWord.word;
            listenText.style.fontWeight = '800';
            listenText.style.letterSpacing = '0.5px';
          }

          practiceArea.querySelectorAll('.quiz-option').forEach((b) => {
            b.disabled = true;
            if (b.getAttribute('data-choice') === currentWord.translation) b.classList.add('correct');
            else if (b === optionBtn && !isCorrect) b.classList.add('wrong');
          });

          if (isCorrect) playSuccessSound();
          else {
            playErrorSound();
            speakWord(currentWord.word, currentWord.id);
          }

          await saveProgress(currentWord.id, isCorrect, 'quiz');
          setTimeout(() => onNext(), isCorrect ? 1000 : 4000);
        });
      });
    }

    function renderReverseQuiz() {
      const categoryFilteredWords = selectedCategory === 'All' || selectedCategory === 'Все категории' ? allWords : allWords.filter((w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory));
      const pool = categoryFilteredWords.length >= 6 ? categoryFilteredWords : allWords;
      const otherWords = pool.filter((w) => w.id !== currentWord.id).map((w) => w.word);
      const shuffledOthers = shuffleArray(otherWords).slice(0, 5);
      const choices = shuffleArray([currentWord.word, ...shuffledOthers]);

      practiceArea.innerHTML = `<div class="quiz-grid">${choices.map((choice) => `<button type="button" class="quiz-option" data-choice="${choice}">${choice}</button>`).join('')}</div>`;
      practiceArea.querySelectorAll('.quiz-option').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const optionBtn = e.currentTarget;
          const isCorrect = String(optionBtn.getAttribute('data-choice')).trim() === String(currentWord.word).trim();
          practiceArea.querySelectorAll('.quiz-option').forEach((b) => { b.disabled = true; if (b.getAttribute('data-choice') === currentWord.word) b.classList.add('correct'); else if (b === optionBtn && !isCorrect) b.classList.add('wrong'); });
          speakWord(currentWord.word, currentWord.id);
          if (isCorrect) playSuccessSound(); else playErrorSound();
          await saveProgress(currentWord.id, isCorrect, 'quiz');
          setTimeout(() => onNext(), isCorrect ? 1200 : 4000);
        });
      });
    }

    function renderSpeechQuiz() {
      let speechAttempts = 0;

      practiceArea.innerHTML = `
        <div class="speech-quiz-container">
          <button type="button" class="speech-mic-btn" id="speech-mic-btn" title="Нажмите, чтобы сказать слово">
            🎙️
          </button>
          <div class="speech-hold-hint" id="speech-hold-hint">
            ${quizStage === 3 ? 'Нажмите на микрофон и прочитайте слово' : 'Нажмите на микрофон и скажите слово'}
          </div>
          <div class="speech-transcript-box" id="speech-transcript-box" style="display: none;"></div>
          <button type="button" class="speech-cant-speak-btn" id="speech-cant-speak-btn">
            Не могу говорить сейчас
          </button>
          <button type="button" class="card-bottom-diag-btn" id="speech-diag-trigger-btn" title="Проверить микрофон">
            ⚙️
          </button>
        </div>
      `;

      const micBtn = practiceArea.querySelector('#speech-mic-btn');
      const holdHint = practiceArea.querySelector('#speech-hold-hint');
      const transcriptBox = practiceArea.querySelector('#speech-transcript-box');
      const cantSpeakBtn = practiceArea.querySelector('#speech-cant-speak-btn');
      const diagBtn = practiceArea.querySelector('#speech-diag-trigger-btn');

      const hintBtn = container.querySelector('#speech-hint-btn');
      const revealedHint = container.querySelector('#speech-revealed-hint');
      if (hintBtn && revealedHint) {
        hintBtn.addEventListener('click', () => {
          hintBtn.style.display = 'none';
          revealedHint.style.display = 'block';
        });
      }

      if (cantSpeakBtn) {
        cantSpeakBtn.addEventListener('click', () => {
          renderReverseQuiz();
        });
      }

      if (diagBtn) {
        diagBtn.addEventListener('click', () => {
          openMicDiagnosticModal();
        });
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      function isMobileClient() {
        if (typeof navigator === 'undefined') return false;
        const ua = navigator.userAgent || navigator.vendor || window.opera || '';
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 1);
        const isSmallScreen = window.innerWidth <= 820;
        return isMobileUA || (isTouch && isSmallScreen);
      }

      const preferNativeSpeech = !isMobileClient() && Boolean(SpeechRecognition);

      let mediaStream = null;
      let mediaRecorder = null;
      let nativeRecognition = null;
      let recordedChunks = [];
      let isListening = false;
      let isProcessing = false;
      let isCompleted = false;
      let autoStopTimer = null;
      let safetyWatchdog = null;

      const mimeCandidates = [
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
          try { nativeRecognition.stop(); } catch (e) {}
          nativeRecognition = null;
        }
      }

      function handleNoSpeechHeard(customMsg = null) {
        clearAllTimers();
        stopSensorStreams();
        if (isCompleted) return;
        isProcessing = false;
        isListening = false;
        if (micBtn) {
          micBtn.classList.remove('listening', 'processing', 'holding');
          micBtn.innerHTML = '🎙️';
        }

        speechAttempts++;

        if (speechAttempts === 1) {
          speakWord(currentWord.word, currentWord.id);
          if (holdHint) holdHint.innerHTML = customMsg || 'Послушайте слово 🔊 и нажмите 🎙️ для повтора';
        } else if (speechAttempts === 2) {
          speakWord(currentWord.word, currentWord.id);
          if (holdHint) holdHint.innerHTML = 'Послушайте эталон 🔊 и повторите 🎙️';
        } else {
          isCompleted = true;
          if (micBtn) micBtn.disabled = true;
          if (holdHint) holdHint.innerHTML = `<span style="color: #ef4444; font-weight: 700;">Штраф -1 XP. Правильно: <strong>${currentWord.word}</strong></span>`;
          speakWord(currentWord.word, currentWord.id);
          saveProgress(currentWord.id, false, 'quiz');
          setTimeout(() => onNext(), 3500);
        }

        if (transcriptBox) {
          transcriptBox.style.display = 'block';
          transcriptBox.innerHTML = `
            <div style="margin-bottom: 6px; font-size: 13px; color: var(--text-muted);">Или ответьте текстом без микрофона:</div>
            <button type="button" class="primary-button btn-green" id="mic-fallback-quiz-btn" style="min-height: 38px; font-size: 14px; padding: 6px 16px; width: 100%;">
              🎯 Ответить карточками
            </button>
          `;
          const fbBtn = transcriptBox.querySelector('#mic-fallback-quiz-btn');
          if (fbBtn) fbBtn.addEventListener('click', () => renderReverseQuiz());
        }
      }

      // ==========================================
      // 1. DESKTOP NATIVE SPEECH (0 tokens, fast)
      // ==========================================
      let isEvaluated = false;

      function startDesktopNativeSpeech() {
        if (isProcessing || isCompleted) return;
        clearAllTimers();
        isListening = true;
        isEvaluated = false;

        try {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch (e) {}

        try {
          nativeRecognition = new SpeechRecognition();
          nativeRecognition.lang = 'en-US';
          nativeRecognition.continuous = false;
          nativeRecognition.interimResults = false;
          nativeRecognition.maxAlternatives = 3;

          nativeRecognition.onstart = () => {
            if (micBtn) {
              micBtn.classList.remove('processing', 'success');
              micBtn.classList.add('listening');
              micBtn.innerHTML = '🎙️';
            }
            if (holdHint) holdHint.innerHTML = '<span style="color: #d97706; font-weight: 700;">🟡 Слушаю... Произнесите слово!</span>';

            autoStopTimer = setTimeout(() => {
              if (isListening && !isEvaluated) {
                if (micBtn) {
                  micBtn.classList.remove('listening');
                  micBtn.classList.add('processing');
                }
                if (holdHint) holdHint.innerHTML = '⏳ Проверяю произношение...';
                try { nativeRecognition.stop(); } catch (e) {}
              }
            }, 3200);
          };

          nativeRecognition.onresult = async (event) => {
            isEvaluated = true;
            clearAllTimers();
            isListening = false;
            let alternatives = [];
            if (event.results && event.results[0]) {
              for (let i = 0; i < event.results[0].length; i++) {
                if (event.results[0][i].transcript) {
                  alternatives.push(event.results[0][i].transcript);
                }
              }
            }
            const spoken = (alternatives[0] || '').trim();
            if (spoken && transcriptBox) {
              transcriptBox.style.display = 'block';
              transcriptBox.innerHTML = `Услышано: <strong>«${spoken}»</strong>`;
            }
            if (micBtn) {
              micBtn.classList.remove('listening');
              micBtn.classList.add('processing');
            }
            if (holdHint) holdHint.innerHTML = '⏳ Проверяю произношение...';
            await evaluateSpeech(alternatives.length > 0 ? alternatives : [spoken]);
          };

          nativeRecognition.onerror = (err) => {
            console.warn('Native desktop speech error:', err.error);
            clearAllTimers();
            isListening = false;
            if (err.error === 'not-allowed') {
              isEvaluated = true;
              handleNoSpeechHeard('🔒 Разрешите микрофон в браузере');
            } else if (err.error === 'no-speech' || err.error === 'aborted') {
              isEvaluated = true;
              handleNoSpeechHeard('Голос не обнаружен. Нажмите 🎙️ для повтора');
            } else {
              // Fallback to Gemini AI transcription seamlessly
              isEvaluated = true;
              startMobileMediaRecorder();
            }
          };

          nativeRecognition.onend = () => {
            clearAllTimers();
            if (isListening && !isCompleted && !isProcessing) {
              isListening = false;
              handleNoSpeechHeard('Голос не распознан. Нажмите 🎙️ для повтора');
            }
          };

          nativeRecognition.start();
        } catch (e) {
          console.warn('Native speech launch failed, using MediaRecorder:', e);
          startMobileMediaRecorder();
        }
      }

      // ==========================================
      // 2. MOBILE MEDIARECORDER + GEMINI AI STT
      // ==========================================
      async function startMobileMediaRecorder() {
        if (isProcessing || isCompleted) return;

        if (isListening && mediaRecorder && mediaRecorder.state === 'recording') {
          stopAndTranscribe();
          return;
        }

        clearAllTimers();

        try {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch (e) {}

        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

          let options = {};
          if (supportedMimeType) {
            options = { mimeType: supportedMimeType };
          }

          try {
            mediaRecorder = new MediaRecorder(mediaStream, options);
          } catch (e) {
            mediaRecorder = new MediaRecorder(mediaStream);
          }

          recordedChunks = [];
          isListening = true;

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
              const spokenWord = (result && result.text ? result.text : '').trim();

              if (spokenWord) {
                if (transcriptBox) {
                  transcriptBox.style.display = 'block';
                  transcriptBox.innerHTML = `Услышано: <strong>«${spokenWord}»</strong>`;
                }
                await evaluateSpeech([spokenWord]);
              } else {
                handleNoSpeechHeard('Голос не распознан. Нажмите 🎙️ для повтора');
              }
            } catch (transcribeErr) {
              console.warn('AI Transcribe error:', transcribeErr);
              handleNoSpeechHeard('Не удалось распознать. Нажмите 🎙️ для повтора');
            }
          };

          mediaRecorder.start();

          if (micBtn) {
            micBtn.classList.remove('processing', 'success');
            micBtn.classList.add('listening');
            micBtn.innerHTML = '🎙️';
          }
          if (holdHint) holdHint.innerHTML = '<span style="color: #d97706; font-weight: 700;">🟡 Слушаю... Произнесите слово!</span>';

          // Auto-finalize recording after 2.5 seconds
          autoStopTimer = setTimeout(() => {
            if (isListening && mediaRecorder && mediaRecorder.state === 'recording') {
              stopAndTranscribe();
            }
          }, 2500);

        } catch (micErr) {
          console.warn('Microphone access failed:', micErr);
          if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
            handleNoSpeechHeard('🔒 Доступ к микрофону заблокирован. Разрешите микрофон в браузере.');
          } else {
            handleNoSpeechHeard('Не удалось запустить микрофон');
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
          try { nativeRecognition.stop(); } catch (e) {}
        }
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          try { mediaRecorder.stop(); } catch (e) {}
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
            if (permStatus) permStatus.innerHTML = '<span style="color: #16a34a;">✅ Разрешено</span>';

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
            if (permStatus) permStatus.innerHTML = '<span style="color: #ef4444;">🔒 Заблокировано</span>';
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
            try { diagAudioCtx.close(); } catch(e) {}
            diagAudioCtx = null;
          }
          if (volBar) volBar.style.width = '0%';
        }

        startBtn.addEventListener('click', async () => {
          stopDiagSensorStreams();

          transcriptBox.style.display = 'block';
          transcriptBox.innerHTML = '<span style="color: #d97706; font-weight: 700;">🟡 Запись... Скажите слово в телефон!</span>';
          startBtn.disabled = true;
          startBtn.textContent = '🔴 Запись (2.5 сек)...';

          try {
            const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let testOptions = {};
            if (supportedMimeType) testOptions = { mimeType: supportedMimeType };

            try {
              diagRecorder = new MediaRecorder(testStream, testOptions);
            } catch(e) {
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
                  transcriptBox.innerHTML = '<span style="color: #ef4444;">Голос не распознан.</span>';
                }
              } catch(transErr) {
                transcriptBox.innerHTML = `<span style="color: #ef4444;">Ошибка: ${transErr.message}</span>`;
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
            transcriptBox.innerHTML = `<span style="color: #ef4444;">Ошибка микрофона: ${err.message}</span>`;
            startBtn.disabled = false;
            startBtn.textContent = '🎙️ Начать тест';
          }
        });

        function cleanupDiag() {
          stopDiagSensorStreams();
          if (diagRecorder && diagRecorder.state === 'recording') {
            try { diagRecorder.stop(); } catch(e) {}
          }
          modalEl.remove();
        }

        closeBtn.addEventListener('click', cleanupDiag);
        modalEl.addEventListener('click', (e) => {
          if (e.target === modalEl) cleanupDiag();
        });
      }

      async function evaluateSpeech(alternatives) {
        clearAllTimers();
        isProcessing = true;
        const isMatch = checkSpeechMatch(alternatives, currentWord.word);

        if (isMatch) {
          isCompleted = true;
          playSuccessSound();
          micBtn.classList.remove('listening', 'processing');
          micBtn.classList.add('success');
          micBtn.innerHTML = '✓';
          if (holdHint) holdHint.innerHTML = `<span style="color: #16a34a; font-weight: 700; font-size: 16px;">✓ Отлично! Произношение верное!</span>`;

          await saveProgress(currentWord.id, true, 'quiz');
          setTimeout(() => {
            onNext();
          }, 1400);
        } else {
          speechAttempts++;
          micBtn.classList.remove('listening', 'processing');
          micBtn.innerHTML = '🎙️';

          if (speechAttempts === 1) {
            speakWord(currentWord.word, currentWord.id);
            if (holdHint) holdHint.innerHTML = `Послушайте эталон 🔊 и попробуйте ещё раз`;
            setTimeout(() => {
              isProcessing = false;
            }, 1200);
          } else if (speechAttempts === 2) {
            speakWord(currentWord.word, currentWord.id);
            if (holdHint) holdHint.innerHTML = `Послушайте эталон 🔊 и повторите 🎙️`;
            setTimeout(() => {
              isProcessing = false;
            }, 1200);
          } else {
            isCompleted = true;
            micBtn.disabled = true;
            if (holdHint) holdHint.innerHTML = `<span style="color: #ef4444; font-weight: 700;">Штраф -1 XP. Правильно: <strong>${currentWord.word}</strong></span>`;
            speakWord(currentWord.word, currentWord.id);
            await saveProgress(currentWord.id, false, 'quiz');
            setTimeout(() => {
              onNext();
            }, 3500);
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

    if (quizStage < 2) {
      renderStandardQuiz();
    } else if (quizStage === 2) {
      renderReverseQuiz();
    } else {
      renderSpeechQuiz();
    }
  } else if (currentMethod === 'pairs') {
    const TARGET_PAIRS_COUNT = 6;
    const roundWords = [currentWord];
    const usedIds = new Set([String(currentWord.id)]);

    // 1. First add from active Pairs queue
    if (activeWords && activeWords.length > 0) {
      const activeOthers = shuffleArray(
        activeWords.filter((w) => !usedIds.has(String(w.id)))
      );
      for (const w of activeOthers) {
        if (roundWords.length >= TARGET_PAIRS_COUNT) break;
        roundWords.push(w);
        usedIds.add(String(w.id));
      }
    }

    // 2. If fewer than 5, pull from User Favorites
    if (roundWords.length < TARGET_PAIRS_COUNT) {
      try {
        const favIds = new Set((getUserFavorites() || []).map(String));
        const favWords = shuffleArray(
          allWords.filter((w) => favIds.has(String(w.id)) && !usedIds.has(String(w.id)))
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

    // 3. If still fewer than 5, pull from current category
    if (roundWords.length < TARGET_PAIRS_COUNT && allWords.length > 0) {
      const categoryOthers = shuffleArray(
        allWords.filter(
          (w) =>
            !usedIds.has(String(w.id)) &&
            (selectedCategory === 'All' ||
              selectedCategory === 'Все категории' ||
              sanitizeCategory(w.category) === sanitizeCategory(selectedCategory))
        )
      );
      for (const w of categoryOthers) {
        if (roundWords.length >= TARGET_PAIRS_COUNT) break;
        roundWords.push(w);
        usedIds.add(String(w.id));
      }

      // 4. Fallback to any remaining words in allWords
      if (roundWords.length < TARGET_PAIRS_COUNT) {
        const remainingAll = shuffleArray(
          allWords.filter((w) => !usedIds.has(String(w.id)))
        );
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
      const initialSeconds = totalPairs * 2; // 2 sec per pair (e.g. 5 pairs = 10 sec)

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
        roundWords.map((w) => ({ id: w.id, text: w.word, word: w.word, side: 'left' }))
      );

      // Derangement Shuffle: Ensure NO word is directly opposite its translation in the same row
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

        // Guaranteed mathematical fallback: shift by 1 relative to left column
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
              `
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
              `
                )
                .join('')}
            </div>
          </div>
          <div id="pairs-timeout-container"></div>
        </div>
      `;

      // Dynamically auto-fit font size so all text 100% fits inside card without clipping
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

          if (timeRemaining <= 3 && timeRemaining > 0) {
            if (timerBadge) {
              timerBadge.classList.add('timer-warning');
            }
            playStopwatchTickSound(true);
          } else if (timeRemaining > 3) {
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

        // 1. Play comic fart sound
        playFartSound();

        // 2. Highlight all remaining unmatched cards in red
        practiceArea.querySelectorAll('.pairs-card:not(.matched)').forEach((card) => {
          card.classList.remove('selected');
          card.classList.add('timeout-failed');
        });

        // 3. Deduct 5 XP penalty
        await saveProgress(currentWord.id, false, 'pairs', { isPairMistake: true });

        // 4. Render Timeout Modal / Banner (clean Stopwatch icon without fart emoji)
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

            // Authentic casino slot machine reel roll sound
            playCasinoRollSound();

            // Cascade 3D flip animation across horizontal axis (Dollar green / white)
            const allCards = Array.from(practiceArea.querySelectorAll('.pairs-card'));
            allCards.forEach((card, idx) => {
              card.classList.remove('matched', 'selected', 'wrong');
              setTimeout(() => {
                card.classList.add('casino-flipping');
              }, idx * 80);
            });

            // Play realistic metallic ringing coin drop sound and award XP simultaneously (only on error-free perfect round)
            setTimeout(async () => {
              if (errorsInRound === 0) {
                playCoinDropSound();
              }
              await saveProgress(currentWord.id, true, 'pairs', { perfectRound: errorsInRound === 0 });
            }, 1350);

            // Advance to next round smoothly
            setTimeout(() => {
              onNext();
            }, 2050);
          }
        } else {
          errorsInRound++;
          playErrorSound();
          curLeft.classList.add('wrong');
          curRight.classList.add('wrong');
          // Deduct 1 XP for mistake
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
          if (isRoundFinished || btn.classList.contains('matched') || btn.classList.contains('wrong')) return;
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
          if (isRoundFinished || btn.classList.contains('matched') || btn.classList.contains('wrong')) return;
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
    // Test mode: Russian prompt on top -> user types in English
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
          matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
            ? matrix[i - 1][j - 1]
            : Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
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
      const userAns = rawText.replace(/\u00a0/g, ' ').replace(/_/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
      const correctAns = currentWord.word.trim().toLowerCase();
      const isCorrect = userAns === correctAns;

      // Check for typo and colorize letters directly inside the input box on 1st typo attempt
      if (!isCorrect && !hasSecondChance && userAns.length > 0) {
        const lev = calculateLevenshtein(userAns, correctAns);
        const maxAllowedDistance = Math.max(2, Math.floor(correctAns.length * 0.38));

        if (lev <= maxAllowedDistance) {
          hasSecondChance = true;
          playErrorSound();

          input.classList.remove('shake-input');
          void input.offsetWidth; // trigger reflow
          input.classList.add('shake-input', 'correction-mode');

          // Highlight letters directly inside the input window with missing letter dashes!
          input.innerHTML = renderDiffHtml(userAns, correctAns);

          feedback.style.display = 'none';
          feedback.innerHTML = '';

          checkBtn.textContent = 'Исправить (-1 XP)';
          
          // Place cursor automatically after the first incorrect letter!
          placeCaretAfterFirstMismatch(input);
          requestAnimationFrame(() => placeCaretAfterFirstMismatch(input));
          setTimeout(() => placeCaretAfterFirstMismatch(input), 50);
          return;
        }
      }

      input.classList.remove('correction-mode');
      input.setAttribute('contenteditable', 'false');
      input.classList.add('disabled');
      checkBtn.disabled = true;

      // Pronounce English word after answer submission
      speakWord(currentWord.word, currentWord.id);

      const isSecondChanceFix = isCorrect && hasSecondChance;
      const prog = await saveProgress(currentWord.id, isCorrect, 'input', { secondChanceFix: isSecondChanceFix });
      const inputCount = prog?.inputCorrect || (isCorrect ? 1 : 0);

      if (prog?.autoFavorited) {
        favorited = true;
        const favBtn = container.querySelector('#fav-toggle-btn');
        if (favBtn) {
          favBtn.textContent = '❤️';
          favBtn.classList.add('is-favorite');
        }
        onFavoriteToggle(currentWord.id, true);
      }

      if (isCorrect) {
        input.classList.remove('wrong', 'shake-input');
        input.classList.add('correct');
        input.textContent = currentWord.word; // clean display of correct word
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

        // Shimmer / blink heart as a prompt to favorite difficult word
        const favBtn = container.querySelector('#fav-toggle-btn');
        if (favBtn && !favorited) {
          favBtn.classList.add('heart-hint-blink');
        }
      }

      // Exact delay: 1.8s on correct (gives enough time for audio to finish playing), 4s on error
      const delay = isCorrect ? (inputCount >= 3 && !favorited ? 2200 : 1800) : 4000;
      setTimeout(() => {
        onNext();
      }, delay);
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
    // 3D Vertical Flippable Flashcard
    practiceArea.innerHTML = `
      <div class="flashcard-3d-wrapper">
        <div class="flashcard-3d" id="flashcard-3d" title="Нажмите, чтобы перевернуть карточку">
          <!-- Front Face: English word -->
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

          <!-- Back Face: Russian translation -->
          <div class="flashcard-face flashcard-back">
            <div class="flashcard-face-top">
              <button type="button" class="flashcard-sound-btn" id="fc-sound-back" title="Прослушать">🔊</button>
              <button type="button" class="flashcard-fav-btn ${favorited ? 'is-favorite' : ''}" id="fc-fav-back" title="В Избранное">
                ${favorited ? '❤️' : '🤍'}
              </button>
            </div>
            <div class="flashcard-face-body">
              <h2 class="flashcard-translation">${currentWord.translation}</h2>
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
      // Ignore clicks on inner sound or favorite buttons to prevent accidental flip
      if (e.target.closest('.flashcard-sound-btn') || e.target.closest('.flashcard-fav-btn')) {
        return;
      }
      isFlipped = !isFlipped;
      flipCount++;
      flashcard.classList.toggle('is-flipped', isFlipped);
      
      if (feedbackBtns.style.display === 'none') {
        feedbackBtns.style.display = 'flex';
      }

      // If user flips card more than 2 times, shimmer heart with red 45deg gradient once
      if (flipCount > 2 && !shimmerTriggered && !favorited) {
        shimmerTriggered = true;
        const favFront = practiceArea.querySelector('#fc-fav-front');
        const favBack = practiceArea.querySelector('#fc-fav-back');
        if (favFront) favFront.classList.add('heart-shimmer-45');
        if (favBack) favBack.classList.add('heart-shimmer-45');
      }

      // Pronounce English word whenever card flips back to English front side
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
      onNext();
    });

    practiceArea.querySelector('#btn-know').addEventListener('click', async () => {
      playSuccessSound();
      await saveProgress(currentWord.id, true, 'cards_know');
      onNext();
    });
  }
}

export { renderTrainingCard, sanitizeCategory };
