import { speakWord, playSuccessSound, playErrorSound, playCasinoRollSound, playCoinDropSound } from '../../services/audioService.js?v=21.0';
import { saveProgress, toggleFavoriteApi } from '../../services/api.js?v=21.0';

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
    isFavorite = false,
    onFavoriteToggle = () => {},
    onMethodChange = () => {},
    onCategoryChange = () => {},
    onNext = () => {},
    activeWords = [],
    learningCount = 0,
    dailyGoal = 10,
    availableModes = { cards: true, quiz: true, pairs: true, input: true },
  } = options;

  let favorited = isFavorite;
  const isInputMode = currentMethod === 'input';
  const isPairsMode = currentMethod === 'pairs';
  const isCardsMode = currentMethod === 'cards';

  function formatWordCount(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return `${n} слов`;
    if (mod10 === 1) return `${n} слово`;
    if (mod10 >= 2 && mod10 <= 4) return `${n} слова`;
    return `${n} слов`;
  }

  container.innerHTML = `
    <section class="word-card-container">
      
      <!-- Top card bar: Mode Switch full width -->
      <div class="card-header-bar">
        <div class="mode-switch-pills" id="mode-switch-pills">
          <div class="mode-pill-glider" id="mode-pill-glider"></div>
          <button type="button" class="mode-pill-btn ${currentMethod === 'cards' ? 'active' : ''} ${!availableModes.cards && currentMethod !== 'cards' ? 'disabled-mode' : ''}" data-mode="cards" ${!availableModes.cards && currentMethod !== 'cards' ? 'disabled' : ''} title="Режим Карточки">
            Карточки
          </button>
          <button type="button" class="mode-pill-btn ${currentMethod === 'quiz' ? 'active' : ''} ${!availableModes.quiz && currentMethod !== 'quiz' ? 'disabled-mode' : ''}" data-mode="quiz" ${!availableModes.quiz && currentMethod !== 'quiz' ? 'disabled' : ''} title="Режим Квиз">
            Квиз
          </button>
          <button type="button" class="mode-pill-btn ${currentMethod === 'pairs' ? 'active' : ''} ${!availableModes.pairs && currentMethod !== 'pairs' ? 'disabled-mode' : ''}" data-mode="pairs" ${!availableModes.pairs && currentMethod !== 'pairs' ? 'disabled' : ''} title="Режим Пары">
            Пары
          </button>
          <button type="button" class="mode-pill-btn ${currentMethod === 'input' ? 'active' : ''} ${!availableModes.input && currentMethod !== 'input' ? 'disabled-mode' : ''}" data-mode="input" ${!availableModes.input && currentMethod !== 'input' ? 'disabled' : ''} title="Режим Тест">
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
            <div class="pairs-header-box" style="margin: 4px 0 6px;">
              <h2 class="training-word" style="font-size: 20px; margin: 0;">🧩 Найдите пары слов</h2>
            </div>
          `
            : isInputMode
            ? `
            <div style="font-size: 13px; font-weight: 600; color: #16a34a; margin-bottom: 8px; background: rgba(22, 163, 74, 0.08); padding: 4px 12px; border-radius: 12px; display: inline-block;">
              ✍️ Осталось в Тесте: <strong>${formatWordCount(activeWords.length)}</strong>
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
              🎯 Осталось в Квизе: <strong>${formatWordCount(activeWords.length)}</strong>
            </div>
            <div class="word-header-row">
              <button type="button" class="word-side-icon-btn" id="speak-sound-btn" title="Прослушать слово">🔊</button>
              <h2 class="training-word clickable-word-box" id="speak-word-trigger" title="Нажмите, чтобы прослушать слово" style="font-size: 20px; margin: 0; color: var(--text-main); line-height: 1.25;">
                <span class="training-word-text">${currentWord.word}</span>
              </h2>
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

  // Bind mode switcher pills with animated smooth sliding glider
  const pillBar = container.querySelector('#mode-switch-pills');
  const glider = container.querySelector('#mode-pill-glider');
  const modePills = container.querySelectorAll('.mode-pill-btn');

  function positionGlider(targetBtn, animate = true) {
    if (!targetBtn || !glider || !pillBar) return;
    const offsetLeft = targetBtn.offsetLeft;
    const btnWidth = targetBtn.offsetWidth;
    if (btnWidth === 0) return;

    if (!animate) {
      glider.style.transition = 'none';
    } else {
      glider.style.transition = 'transform 0.32s cubic-bezier(0.34, 1.35, 0.7, 1), width 0.25s ease';
    }

    glider.style.transform = `translateX(${offsetLeft}px)`;
    glider.style.width = `${btnWidth}px`;
  }

  // Initial positioning
  const initialActive = container.querySelector('.mode-pill-btn.active');
  if (initialActive) {
    requestAnimationFrame(() => {
      positionGlider(initialActive, false);
    });
    setTimeout(() => {
      positionGlider(initialActive, false);
    }, 50);
  }

  // Handle responsive resizing / device orientation changes
  const handleResize = () => {
    const activeBtn = container.querySelector('.mode-pill-btn.active');
    if (activeBtn) positionGlider(activeBtn, false);
  };
  window.addEventListener('resize', handleResize, { passive: true });

  modePills.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedMode = btn.getAttribute('data-mode');
      if (selectedMode && selectedMode !== currentMethod) {
        modePills.forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        positionGlider(btn, true);
        setTimeout(() => {
          onMethodChange(selectedMode);
        }, 150);
      }
    });
  });

  // Bind audio speak trigger (tapping word or sound icon)
  const speakTrigger = container.querySelector('#speak-word-trigger');
  const soundBtn = container.querySelector('#speak-sound-btn');

  const handleSpeak = () => {
    speakWord(currentWord.word, currentWord.id);
  };

  if (speakTrigger && !isPairsMode) {
    speakTrigger.addEventListener('click', handleSpeak);
  }
  if (soundBtn && !isPairsMode) {
    soundBtn.addEventListener('click', handleSpeak);
  }

  if (!isPairsMode && !isInputMode) {
    // Auto-pronounce word on card appearance
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
      favBtn.classList.remove('heart-hint-blink');
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
        const optionBtn = e.currentTarget || btn;
        const selected = optionBtn.getAttribute('data-choice');
        const isCorrect = String(selected).trim() === String(currentWord.translation).trim();

        // Disable all options immediately to prevent double-clicks
        practiceArea.querySelectorAll('.quiz-option').forEach((b) => {
          b.disabled = true;
          if (b.getAttribute('data-choice') === currentWord.translation) {
            b.classList.add('correct');
          } else if (b === optionBtn && !isCorrect) {
            b.classList.add('wrong');
          }
        });

        if (isCorrect) {
          playSuccessSound();
        } else {
          playErrorSound();
        }

        await saveProgress(currentWord.id, isCorrect, 'quiz');

        // Exact delay: 1s (1000ms) on correct, 4s (4000ms) on error (doubled for comfortable reading)
        const delay = isCorrect ? 1000 : 4000;
        setTimeout(() => {
          onNext();
        }, delay);
      });
    });
  } else if (currentMethod === 'pairs') {
    // Pairs Matching Mode: strictly use words eligible for Pairs (quiz >= 5 or 'know' + favorites)
    const eligiblePool = activeWords && activeWords.length > 0 ? activeWords : allWords;
    const otherWords = eligiblePool.filter((w) => String(w.id) !== String(currentWord.id));
    const countNeeded = Math.min(5, otherWords.length);
    const roundWords = [currentWord, ...shuffleArray(otherWords).slice(0, countNeeded)];
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
    let errorsInRound = 0;
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
        if (matchedCount + 1 < totalPairs) {
          playSuccessSound();
        }
        curLeft.classList.remove('selected');
        curRight.classList.remove('selected');
        curLeft.classList.add('matched');
        curRight.classList.add('matched');

        // No duplicate audio call here: English word is already spoken when tapped
        await saveProgress(leftId, true, 'pairs');
        matchedCount++;

        if (matchedCount === totalPairs) {
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
      el.focus();
      try {
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
      el.focus();
      try {
        const firstMismatch = el.querySelector('.diff-char-inline.mismatch, .diff-char-inline.missing');
        if (firstMismatch) {
          const range = document.createRange();
          if (firstMismatch.classList.contains('missing')) {
            range.setStartBefore(firstMismatch);
          } else {
            range.setStartAfter(firstMismatch);
          }
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
      el.focus();
      placeCaretAtEnd(el);
      requestAnimationFrame(() => {
        el.focus();
        placeCaretAtEnd(el);
      });
      setTimeout(() => {
        el.focus();
        placeCaretAtEnd(el);
      }, 50);
      setTimeout(() => {
        el.focus();
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
      const maxLen = Math.max(userText.length, targetText.length);
      for (let i = 0; i < maxLen; i++) {
        const u = userText[i] || '';
        const t = targetText[i] || '';
        if (i < userText.length) {
          if (u === t) {
            html += `<span class="diff-char-inline match">${u}</span>`;
          } else {
            html += `<span class="diff-char-inline mismatch">${u}</span>`;
          }
        } else {
          html += `<span class="diff-char-inline missing">_</span>`;
        }
      }
      return html;
    }

    const handleCheck = async () => {
      const rawText = input.textContent || '';
      const userAns = rawText.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
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
          input.classList.add('shake-input');

          // Highlight letters directly inside the input window!
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

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, text);
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
              <span class="flashcard-flip-prompt">🔄 Нажми, чтобы увидеть перевод</span>
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
              <p class="flashcard-subword">${currentWord.word}</p>
            </div>
            <div class="flashcard-face-bottom">
              <span class="flashcard-flip-prompt">🔄 Нажми, чтобы перевернуть обратно</span>
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
