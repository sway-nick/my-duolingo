import { speakWord } from '../../services/audioService.js?v=10.0';
import { saveProgress, toggleFavoriteApi } from '../../services/api.js?v=10.0';

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

        <button type="button" class="favorite-button ${favorited ? 'is-favorite' : ''}" id="fav-toggle-btn" title="Добавить в Избранное">
          ${favorited ? '❤️' : '🤍'}
        </button>
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
            <div class="sound-placeholder" style="height: 38px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px;">
              <small style="color: var(--text-muted); font-size: 12px;">🎧 Озвучка после ответа</small>
            </div>
            <h1 class="training-word" style="color: var(--text-main); font-size: 24px; line-height: 1.25;">
              ${currentWord.translation}
            </h1>
          `
            : `
            <button type="button" class="sound-button" id="speak-btn" title="Прослушать слово">
              🔊
            </button>
            <span class="turtle-indicator" id="turtle-indicator" style="display: none;">🐢 Медленно</span>
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
  const turtleIndicator = container.querySelector('#turtle-indicator');

  if (speakBtn && !isPairsMode) {
    speakBtn.addEventListener('click', () => {
      const isTurtle = speakWord(currentWord.word, currentWord.id);
      if (turtleIndicator) {
        turtleIndicator.style.display = isTurtle ? 'inline-block' : 'none';
      }
    });

    // Auto-pronounce word on card appearance only if NOT in text input or pairs mode
    setTimeout(() => {
      try {
        const isTurtle = speakWord(currentWord.word, currentWord.id);
        if (turtleIndicator) {
          turtleIndicator.style.display = isTurtle ? 'inline-block' : 'none';
        }
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

    practiceArea.innerHTML = `
      <div class="quiz-grid">
        ${choices
          .map(
            (choice) => `
          <button type="button" class="quiz-option" data-choice="${choice}">${choice}</button>
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

        await saveProgress(currentWord.id, isCorrect, 'quiz');

        // 2.2s on correct, 4.2s on error to comfortably study the result
        const delay = isCorrect ? 2200 : 4200;
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
    const roundWords = [currentWord, ...shuffleArray(otherWords).slice(0, 7)];
    const leftItems = shuffleArray(
      roundWords.map((w) => ({ id: w.id, text: w.word, word: w.word, side: 'left' }))
    );
    const rightItems = shuffleArray(
      roundWords.map((w) => ({ id: w.id, text: w.translation, word: w.word, side: 'right' }))
    );

    practiceArea.innerHTML = `
      <div class="pairs-grid">
        <div class="pairs-col" id="pairs-left-col">
          ${leftItems
            .map(
              (item) => `
            <button type="button" class="pairs-card" data-id="${item.id}" data-side="left" data-word="${item.word}">
              ${item.text}
            </button>
          `
            )
            .join('')}
        </div>
        <div class="pairs-col" id="pairs-right-col">
          ${rightItems
            .map(
              (item) => `
            <button type="button" class="pairs-card" data-id="${item.id}" data-side="right" data-word="${item.word}">
              ${item.text}
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
          }, 1200);
        }
      } else {
        curLeft.classList.add('wrong');
        curRight.classList.add('wrong');
        await saveProgress(leftId, false, 'pairs');

        setTimeout(() => {
          curLeft.classList.remove('wrong', 'selected');
          curRight.classList.remove('wrong', 'selected');
        }, 650);
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
        if (inputCount >= 3) {
          feedback.textContent = `🎉 Слово выучено! (3/3) и убрано из обучения!`;
        } else {
          feedback.textContent = `✓ Верно! (${inputCount}/3 для выучивания)`;
        }
      } else {
        input.classList.add('wrong');
        feedback.style.display = 'block';
        feedback.style.color = 'var(--error-color, #dc2626)';
        feedback.textContent = `Правильно: ${currentWord.word} (${currentWord.transcription || ''})`;
      }

      // 2.5s / 3.5s on correct, 4.8s on error for listening & reading
      const delay = isCorrect ? (inputCount >= 3 ? 3500 : 2500) : 4800;
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
