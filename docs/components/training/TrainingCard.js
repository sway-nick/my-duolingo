import { speakWord, playSuccessSound, playErrorSound } from '../../services/audioService.js?v=14.0';
import { saveProgress, toggleFavoriteApi } from '../../services/api.js?v=14.0';

function sanitizeCategory(cat) {
  if (!cat) return 'Общие';
  return String(cat)
    .replace(/\s*[•\-–—]?\s*[A-C][1-2].*$/i, '')
    .trim() || String(cat).trim();
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function renderTrainingCard(currentWord, allWords = [], options = {}) {
  const container = document.querySelector('#training');
  if (!container) return;

  const {
    currentMethod = 'quiz',
    selectedCategory = 'All',
    categories = [],
    onMethodChange = () => {},
    onCategoryChange = () => {},
    onNext = () => {},
    onFavoriteToggle = () => {},
    isFavorite = false,
  } = options;

  const isInputMode = currentMethod === 'input';
  const isPairsMode = currentMethod === 'pairs';
  let favorited = isFavorite;

  container.innerHTML = `
    <section class="word-card-container">
      
      <!-- Top card bar: Mode Switch (Карточки / Квиз / Пары / Тест) on Left, Favorite Heart on Right -->
      <div class="card-header-bar">
        <div class="mode-switch-pills">
          <button type="button" class="mode-pill-btn ${currentMethod === 'cards' ? 'active' : ''}" data-mode="cards" title="Режим Карточки">
            Карточки
          </button>
          <button type="button" class="mode-pill-btn ${currentMethod === 'quiz' ? 'active' : ''}" data-mode="quiz" title="Режим Квиз">
            Квиз
          </button>
          <button type="button" class="mode-pill-btn ${currentMethod === 'pairs' ? 'active' : ''}" data-mode="pairs" title="Режим Пары">
            Пары
          </button>
          <button type="button" class="mode-pill-btn ${currentMethod === 'input' ? 'active' : ''}" data-mode="input" title="Режим Тест">
            Тест
          </button>
        </div>

        ${
          !isPairsMode
            ? `
          <button type="button" class="favorite-button ${favorited ? 'is-favorite' : ''}" id="fav-toggle-btn" title="Добавить в Избранное">
            ${favorited ? '❤️' : '🤍'}
          </button>
        `
            : ''
        }
      </div>

      <!-- Word Display & Audio Button -->
      <div class="word-main-display">
        ${
          isPairsMode
            ? `
            <div class="pairs-header-box" style="margin-bottom: 6px;">
              <h2 class="training-word" style="font-size: 20px; margin: 2px 0 4px;">🧩 Найдите пары слов</h2>
              <p class="training-transcription" style="margin: 0; font-size: 13px; color: var(--text-muted);">
                Соедините английские слова с их переводом
              </p>
            </div>
          `
            : isInputMode
            ? `
            <h1 class="training-word" style="color: var(--text-main); font-size: 28px; line-height: 1.25; margin: 12px 0 6px;">
              ${currentWord.translation}
            </h1>
          `
            : `
            <button type="button" class="sound-button" id="speak-btn" title="Прослушать слово">
              🔊
            </button>
            <h1 class="training-word">${currentWord.word}</h1>
            <p class="training-transcription">${currentWord.transcription || ''}</p>
          `
        }
      </div>

      <!-- Practice Area based on active method -->
      <div id="practice-area" class="practice-area"></div>

    </section>
  `;

  // Bind mode switcher pills (Карточки / Квиз / Пары / Тест)
  const modePills = container.querySelectorAll('.mode-pill-btn');
  modePills.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedMode = btn.getAttribute('data-mode');
      if (selectedMode) {
        onMethodChange(selectedMode);
      }
    });
  });

  // Bind audio speak button (for cards/quiz modes)
  const speakBtn = container.querySelector('#speak-btn');

  if (speakBtn && !isPairsMode) {
    speakBtn.addEventListener('click', () => {
      speakWord(currentWord.word, currentWord.id);
    });

    // Auto-pronounce word on card appearance only if NOT in text input or pairs mode
    setTimeout(() => {
      try {
        speakWord(currentWord.word, currentWord.id);
      } catch (e) {
        console.warn('Auto-speak failed:', e);
      }
    }, 100);
  }

  // Bind favorite toggle
  const favBtn = container.querySelector('#fav-toggle-btn');
  if (favBtn) {
    favBtn.addEventListener('click', async () => {
      favorited = !favorited;
      favBtn.textContent = favorited ? '❤️' : '🤍';
      favBtn.classList.toggle('is-favorite', favorited);
      await toggleFavoriteApi(currentWord.id, favorited);
      onFavoriteToggle(currentWord.id, favorited);
    });
  }

  const practiceArea = container.querySelector('#practice-area');

  // --- RENDER ACCORDING TO CURRENT METHOD ---

  if (currentMethod === 'quiz') {
    // Generate 6 multiple-choice options (1 correct + 5 incorrect)
    const categoryFilteredWords =
      selectedCategory === 'All' || selectedCategory === 'Все категории'
        ? allWords
        : allWords.filter(
            (w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory)
          );

    const pool = categoryFilteredWords.length >= 6 ? categoryFilteredWords : allWords;
    const otherTranslations = pool
      .filter((w) => w.id !== currentWord.id)
      .map((w) => w.translation);
    const shuffledOthers = shuffleArray(otherTranslations).slice(0, 5);
    const choices = shuffleArray([currentWord.translation, ...shuffledOthers]);

    function getQuizFontSize(text) {
      if (!text) return '17.5px';
      const len = text.length;
      if (len > 55) return '12px';
      if (len > 38) return '13.5px';
      if (len > 24) return '15px';
      return '17px';
    }

    practiceArea.innerHTML = `
      <div class="quiz-grid">
        ${choices
          .map(
            (choice) => `
          <button type="button" class="quiz-option" data-choice="${choice}" style="font-size: ${getQuizFontSize(choice)};">
            <span class="quiz-option-inner">${choice}</span>
          </button>
        `,
          )
          .join('')}
      </div>
    `;

    practiceArea.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const selected = e.target.getAttribute('data-choice');
        const isCorrect = selected === currentWord.translation;

        // Disable all options immediately to prevent double-clicks
        practiceArea.querySelectorAll('.quiz-option').forEach((b) => {
          b.disabled = true;
          if (b.getAttribute('data-choice') === currentWord.translation) {
            b.classList.add('correct');
          } else if (b === e.target && !isCorrect) {
            b.classList.add('wrong');
          }
        });

        if (isCorrect) {
          playSuccessSound();
        } else {
          playErrorSound();
        }

        await saveProgress(currentWord.id, isCorrect, 'quiz');

        // Lightning-fast delay: 160ms on correct (cut in half), 12.6s on error
        const delay = isCorrect ? 160 : 12600;
        setTimeout(() => {
          onNext();
        }, delay);
      });
    });
  } else if (currentMethod === 'pairs') {
    // Pairs Matching Mode (8 words per round strictly from selected category)
    const categoryFilteredWords =
      selectedCategory === 'All' || selectedCategory === 'Все категории'
        ? allWords
        : allWords.filter(
            (w) => sanitizeCategory(w.category) === sanitizeCategory(selectedCategory)
          );

    const otherWords = categoryFilteredWords.filter((w) => w.id !== currentWord.id);
    const roundWords = [currentWord, ...shuffleArray(otherWords).slice(0, 5)];
    const leftItems = shuffleArray(
      roundWords.map((w) => ({ id: w.id, text: w.word, word: w.word, side: 'left' }))
    );
    const rightItems = shuffleArray(
      roundWords.map((w) => ({ id: w.id, text: w.translation, word: w.word, side: 'right' }))
    );

    function getPairFontSize(text) {
      if (!text) return '17.5px';
      const len = text.length;
      if (len > 35) return '13.5px';
      if (len > 24) return '15px';
      if (len > 16) return '16.5px';
      return '17.5px';
    }

    practiceArea.innerHTML = `
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
      <div id="pairs-celebration" style="display: none; margin-top: 12px; font-weight: 700; color: var(--success-color, #16a34a); text-align: center; font-size: 16px;">
        🎉 Отлично! Все пары найдены!
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

    let selectedLeft = null;
    let selectedRight = null;
    let matchedCount = 0;
    const totalPairs = roundWords.length;

    const leftBtns = practiceArea.querySelectorAll('.pairs-card[data-side="left"]');
    const rightBtns = practiceArea.querySelectorAll('.pairs-card[data-side="right"]');

    const checkPairMatch = async () => {
      if (!selectedLeft || !selectedRight) return;

      const leftId = selectedLeft.getAttribute('data-id');
      const rightId = selectedRight.getAttribute('data-id');

      const isMatch = String(leftId) === String(rightId);

      const curLeft = selectedLeft;
      const curRight = selectedRight;
      selectedLeft = null;
      selectedRight = null;

      if (isMatch) {
        playSuccessSound();
        curLeft.classList.remove('selected');
        curRight.classList.remove('selected');
        curLeft.classList.add('matched');
        curRight.classList.add('matched');

        // No duplicate audio call here: English word is already spoken when tapped
        await saveProgress(leftId, true, 'pairs');
        matchedCount++;

        if (matchedCount === totalPairs) {
          const celeb = practiceArea.querySelector('#pairs-celebration');
          if (celeb) celeb.style.display = 'block';
          setTimeout(() => {
            onNext();
          }, 450);
        }
      } else {
        playErrorSound();
        curLeft.classList.add('wrong');
        curRight.classList.add('wrong');
        await saveProgress(leftId, false, 'pairs');

        // 3x Increased delay on wrong mismatch: 1950ms
        setTimeout(() => {
          curLeft.classList.remove('wrong', 'selected');
          curRight.classList.remove('wrong', 'selected');
        }, 1950);
      }
    };

    leftBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('matched') || btn.classList.contains('wrong')) return;

        leftBtns.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedLeft = btn;

        const w = btn.getAttribute('data-word');
        const id = btn.getAttribute('data-id');
        speakWord(w, id);

        if (selectedRight) {
          checkPairMatch();
        }
      });
    });

    rightBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('matched') || btn.classList.contains('wrong')) return;

        rightBtns.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedRight = btn;

        if (selectedLeft) {
          checkPairMatch();
        }
      });
    });
  } else if (currentMethod === 'input') {
    // Test mode: Russian prompt on top -> user types in English
    practiceArea.innerHTML = `
      <div class="input-form-row">
        <input class="answer-input" id="answer-input" placeholder="Введите на английском..." autocomplete="off" autocapitalize="none" spellcheck="false" />
        <button type="button" class="check-button" id="check-answer-btn">Проверить</button>
      </div>
      <div id="input-feedback" class="input-feedback" style="display: none; margin-top: 10px; font-weight: 600; text-align: center; font-size: 15px;"></div>
    `;

    const input = practiceArea.querySelector('#answer-input');
    const checkBtn = practiceArea.querySelector('#check-answer-btn');
    const feedback = practiceArea.querySelector('#input-feedback');

    const handleCheck = async () => {
      const userAns = input.value.trim().toLowerCase();
      const correctAns = currentWord.word.trim().toLowerCase();
      const isCorrect = userAns === correctAns;

      input.disabled = true;
      checkBtn.disabled = true;

      // Pronounce English word after answer submission
      speakWord(currentWord.word, currentWord.id);

      const prog = await saveProgress(currentWord.id, isCorrect, 'input');
      const inputCount = prog?.inputCorrect || (isCorrect ? 1 : 0);

      if (isCorrect) {
        input.classList.add('correct');
        feedback.style.display = 'block';
        feedback.style.color = 'var(--success-color, #16a34a)';
        feedback.innerHTML = `
          <div style="font-size: 18px; font-weight: 700; color: var(--success-color, #16a34a);">
            ${inputCount >= 3 ? '🎉 Слово выучено! (3/3) и убрано из обучения!' : `✓ Верно! (${inputCount}/3 для выучивания)`}
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
      }

      // Fast delay: 750ms (1200ms on 3/3 mastered) on correct, 14.4s on error
      const delay = isCorrect ? (inputCount >= 3 ? 1200 : 750) : 14400;
      setTimeout(() => {
        onNext();
      }, delay);
    };

    checkBtn.addEventListener('click', handleCheck);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleCheck();
    });
    input.focus();
  } else {
    // Flashcard Mode ('cards')
    practiceArea.innerHTML = `
      <div class="flashcard-box" id="flashcard">
        <p style="margin: 0 0 8px; color: var(--text-muted); font-size: 13px;">Нажмите, чтобы увидеть перевод</p>
        <div class="flashcard-back" id="flashcard-back" style="display:none;">
          <h2 class="card-translation" style="font-size: 24px; margin: 4px 0;">${currentWord.translation}</h2>
        </div>
      </div>
      
      <div class="difficulty-buttons" id="card-feedback-btns" style="display:none; margin-top: 10px;">
        <button type="button" class="btn-repeat" id="btn-repeat">🔴 Сложно</button>
        <button type="button" class="btn-easy" id="btn-easy">🟢 Легко</button>
      </div>
    `;

    const flashcard = practiceArea.querySelector('#flashcard');
    const flashcardBack = practiceArea.querySelector('#flashcard-back');
    const feedbackBtns = practiceArea.querySelector('#card-feedback-btns');

    flashcard.addEventListener('click', () => {
      flashcardBack.style.display = 'block';
      feedbackBtns.style.display = 'flex';
    });

    practiceArea.querySelector('#btn-repeat').addEventListener('click', async () => {
      const prog = await saveProgress(currentWord.id, false, 'cards');
      if (prog && prog.autoFavorited) {
        onFavoriteToggle(currentWord.id, true);
        const favBtn = container.querySelector('#fav-toggle-btn');
        if (favBtn) {
          favBtn.textContent = '❤️';
          favBtn.classList.add('is-favorite');
        }
      }
      onNext({ repeatSoon: true });
    });

    practiceArea.querySelector('#btn-easy').addEventListener('click', async () => {
      await saveProgress(currentWord.id, true, 'cards');
      onNext({ repeatSoon: false });
    });
  }
}

export { renderTrainingCard, sanitizeCategory };
