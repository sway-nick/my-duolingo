import { speakWord } from '../../services/audioService.js';
import { saveProgress, toggleFavoriteApi } from '../../services/api.js';

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
  let currentMethod = options.forcedMethod || enabledMethods[0] || 'quiz';
  if (!enabledMethods.includes(currentMethod) && enabledMethods.length > 0) {
    currentMethod = enabledMethods[0];
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

      <!-- Feedback / Result Section -->
      <div id="result-box" class="result-card" style="display: none;"></div>

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
  const resultBox = container.querySelector('#result-box');

  const showResult = (isCorrect, correctTranslation) => {
    saveProgress(currentWord.id, isCorrect);

    resultBox.style.display = 'block';
    resultBox.className = `result-card ${isCorrect ? 'result-success' : 'result-error'}`;
    resultBox.innerHTML = `
      <h3>${isCorrect ? '✓ Отлично, правильно!' : '✕ Не совсем верно'}</h3>
      <p><strong>${currentWord.word}</strong> — ${correctTranslation}</p>
      <button class="next-button" id="next-word-btn">Следующее слово →</button>
    `;

    resultBox.querySelector('#next-word-btn').addEventListener('click', () => {
      onNext();
    });
  };

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

        practiceArea.querySelectorAll('.quiz-option').forEach((b) => {
          b.disabled = true;
          if (b.getAttribute('data-choice') === currentWord.translation) {
            b.classList.add('correct');
          } else if (b === e.target && !isCorrect) {
            b.classList.add('wrong');
          }
        });

        showResult(isCorrect, currentWord.translation);
      });
    });
  } else if (currentMethod === 'input') {
    practiceArea.innerHTML = `
      <p class="hint">Введите перевод слова на русский:</p>
      <div class="input-form-row">
        <input class="answer-input" id="answer-input" placeholder="Перевод..." autocomplete="off" />
        <button class="check-button" id="check-answer-btn">Проверить</button>
      </div>
    `;

    const input = practiceArea.querySelector('#answer-input');
    const checkBtn = practiceArea.querySelector('#check-answer-btn');

    const handleCheck = () => {
      const userAns = input.value.trim().toLowerCase();
      const correctAns = currentWord.translation.trim().toLowerCase();
      const isCorrect = userAns === correctAns;
      input.disabled = true;
      checkBtn.disabled = true;
      showResult(isCorrect, currentWord.translation);
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
        <button class="btn-repeat" id="btn-repeat">🔴 Не помню</button>
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
      showResult(false, currentWord.translation);
    });

    practiceArea.querySelector('#btn-easy').addEventListener('click', () => {
      showResult(true, currentWord.translation);
    });
  }
}

export { renderTrainingCard };
