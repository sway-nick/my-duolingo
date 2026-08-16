import { speakWord } from '../../services/audioService.js?v=8.0';
import { saveProgress, toggleFavoriteApi } from '../../services/api.js?v=8.0';

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function renderTrainingCard(currentWord, allWords = [], options = {}) {
  const container = document.querySelector('#training');
  if (!container) return;

  const {
    enabledMethods = ['cards', 'quiz', 'input'],
    onNext = () => {},
    onFavoriteToggle = () => {},
    isFavorite = false,
  } = options;

  // Determine current method mode out of enabled methods
  let currentMethod = options.forcedMethod;
  if (!currentMethod || !enabledMethods.includes(currentMethod)) {
    currentMethod = enabledMethods[0] || 'quiz';
  }

  let favorited = isFavorite;

  container.innerHTML = `
    <section class="word-card-container">
      
      <!-- Top card bar: Category & Favorite toggle -->
      <div class="card-header-bar">
        <span class="category-badge">
          📂 ${currentWord.category || 'Общие'} • ${currentWord.level || 'A1'}
        </span>
        
        <button class="favorite-button ${favorited ? 'is-favorite' : ''}" id="fav-toggle-btn" title="Добавить в Избранное">
          ${favorited ? '❤️' : '🤍'}
        </button>
      </div>

      <!-- Word Display & Audio Button -->
      <div class="word-main-display">
        <button class="sound-button" id="speak-btn" title="Прослушать слово">
          🔊
        </button>
        <span class="turtle-indicator" id="turtle-indicator" style="display: none;">🐢 Медленно</span>

        <h1 class="training-word">${currentWord.word}</h1>
        <p class="training-transcription">${currentWord.transcription || ''}</p>
      </div>

      <!-- Practice Area based on active method -->
      <div id="practice-area" class="practice-area"></div>

    </section>
  `;

  // Bind audio speak button (3rd click auto-turtle mode!)
  const speakBtn = container.querySelector('#speak-btn');
  const turtleIndicator = container.querySelector('#turtle-indicator');

  speakBtn.addEventListener('click', () => {
    const isTurtle = speakWord(currentWord.word, currentWord.id);
    if (turtleIndicator) {
      turtleIndicator.style.display = isTurtle ? 'inline-block' : 'none';
    }
  });

  // Auto-pronounce word on initial card appearance
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

  // Bind favorite toggle
  const favBtn = container.querySelector('#fav-toggle-btn');
  favBtn.addEventListener('click', async () => {
    favorited = !favorited;
    favBtn.textContent = favorited ? '❤️' : '🤍';
    favBtn.classList.toggle('is-favorite', favorited);
    await toggleFavoriteApi(currentWord.id, favorited);
    onFavoriteToggle(currentWord.id, favorited);
  });

  const practiceArea = container.querySelector('#practice-area');

  // --- RENDER ACCORDING TO CURRENT METHOD ---

  if (currentMethod === 'quiz') {
    // Generate 4 multiple-choice options
    const otherTranslations = allWords
      .filter((w) => w.id !== currentWord.id)
      .map((w) => w.translation);
    const shuffledOthers = shuffleArray(otherTranslations).slice(0, 3);
    const choices = shuffleArray([currentWord.translation, ...shuffledOthers]);

    practiceArea.innerHTML = `
      <p class="hint">Выберите правильный перевод:</p>
      <div class="quiz-grid">
        ${choices
          .map(
            (choice) => `
          <button class="quiz-option" data-choice="${choice}">${choice}</button>
        `,
          )
          .join('')}
      </div>
    `;

    practiceArea.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.addEventListener('click', (e) => {
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

        saveProgress(currentWord.id, isCorrect);

        // Auto-advance: fast on correct (500ms), slightly longer on error so user sees the correct answer (1200ms)
        const delay = isCorrect ? 500 : 1200;
        setTimeout(() => {
          onNext();
        }, delay);
      });
    });
  } else if (currentMethod === 'input') {
    practiceArea.innerHTML = `
      <p class="hint">Введите перевод слова на русский:</p>
      <div class="input-form-row">
        <input class="answer-input" id="answer-input" placeholder="Перевод..." autocomplete="off" />
        <button class="check-button" id="check-answer-btn">Проверить</button>
      </div>
      <div id="input-feedback" class="input-feedback" style="display: none; margin-top: 12px; font-weight: 600;"></div>
    `;

    const input = practiceArea.querySelector('#answer-input');
    const checkBtn = practiceArea.querySelector('#check-answer-btn');
    const feedback = practiceArea.querySelector('#input-feedback');

    const handleCheck = () => {
      const userAns = input.value.trim().toLowerCase();
      const correctAns = currentWord.translation.trim().toLowerCase();
      const isCorrect = userAns === correctAns;

      input.disabled = true;
      checkBtn.disabled = true;

      if (isCorrect) {
        input.classList.add('correct');
        feedback.style.display = 'block';
        feedback.style.color = 'var(--success-color, #16a34a)';
        feedback.textContent = '✓ Верно!';
      } else {
        input.classList.add('wrong');
        feedback.style.display = 'block';
        feedback.style.color = 'var(--error-color, #dc2626)';
        feedback.textContent = `Правильно: ${currentWord.translation}`;
      }

      saveProgress(currentWord.id, isCorrect);

      const delay = isCorrect ? 500 : 1400;
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
        <p class="hint">Нажмите на карточку, чтобы увидеть перевод</p>
        <div class="flashcard-back" id="flashcard-back" style="display:none;">
          <h2 class="card-translation">${currentWord.translation}</h2>
        </div>
      </div>
      
      <div class="difficulty-buttons" id="card-feedback-btns" style="display:none;">
        <button class="btn-repeat" id="btn-repeat">🔴 Сложно</button>
        <button class="btn-easy" id="btn-easy">🟢 Легко</button>
      </div>
    `;

    const flashcard = practiceArea.querySelector('#flashcard');
    const flashcardBack = practiceArea.querySelector('#flashcard-back');
    const feedbackBtns = practiceArea.querySelector('#card-feedback-btns');

    flashcard.addEventListener('click', () => {
      flashcardBack.style.display = 'block';
      feedbackBtns.style.display = 'flex';
    });

    practiceArea.querySelector('#btn-repeat').addEventListener('click', () => {
      saveProgress(currentWord.id, false);
      onNext();
    });

    practiceArea.querySelector('#btn-easy').addEventListener('click', () => {
      saveProgress(currentWord.id, true);
      onNext();
    });
  }
}

export { renderTrainingCard };
