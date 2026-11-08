import AudioService from '../../services/audioService.js?v=386.0';
import { t } from '../../services/i18n.js?v=386.0';

/**
 * Shuffles an array in place with Fisher-Yates algorithm.
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates 3 realistic trap/decoy letters:
 * - Taken from neighbor words in the round or popular letters (E, A, O, T, S, R, N, etc.)
 * - Never includes letters already present in the target word.
 */
export function getTrapLetters(targetWord, allWords = []) {
  const targetLettersSet = new Set(
    (targetWord || '')
      .toUpperCase()
      .split('')
      .filter((ch) => /[A-Z]/.test(ch))
  );

  const neighborCandidates = [];
  if (Array.isArray(allWords)) {
    for (const w of allWords) {
      const text = String(w?.word || '').toUpperCase();
      for (const ch of text) {
        if (/[A-Z]/.test(ch) && !targetLettersSet.has(ch) && !neighborCandidates.includes(ch)) {
          neighborCandidates.push(ch);
        }
      }
    }
  }

  const POPULAR_LETTERS = [
    'E', 'A', 'O', 'T', 'S', 'R', 'N',
    'I', 'L', 'D', 'C', 'U', 'M', 'P',
    'H', 'Y', 'B', 'G', 'K', 'V', 'F', 'W'
  ];

  const pool = [...neighborCandidates];
  for (const ch of POPULAR_LETTERS) {
    if (!targetLettersSet.has(ch) && !pool.includes(ch)) {
      pool.push(ch);
    }
  }

  shuffleArray(pool);
  return pool.slice(0, 3);
}

/**
 * Evaluates a guess against target word using standard Wordle frequency counting.
 * Returns an array of statuses ('green' | 'yellow' | 'gray') for each position.
 */
export function evaluateWordleStatuses(guessLetters, targetLetters) {
  const len = targetLetters.length;
  const statuses = new Array(len).fill(null);
  const remainingCounts = {};

  for (let i = 0; i < len; i++) {
    const tCh = targetLetters[i];
    remainingCounts[tCh] = (remainingCounts[tCh] || 0) + 1;
  }

  // Pass 1: exact matches (Green)
  for (let i = 0; i < len; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      statuses[i] = 'green';
      remainingCounts[targetLetters[i]]--;
    }
  }

  // Pass 2: wrong positions (Yellow) or absent (Gray)
  for (let i = 0; i < len; i++) {
    if (statuses[i] === 'green') continue;
    const gCh = guessLetters[i];
    if (remainingCounts[gCh] && remainingCounts[gCh] > 0) {
      statuses[i] = 'yellow';
      remainingCounts[gCh]--;
    } else {
      statuses[i] = 'gray';
    }
  }

  return statuses;
}

/**
 * Renders the Word Blocks ("Кубики-слова") interactive exercise inside `container`.
 */
export function renderWordBlocksExercise(container, wordObj, allWords, onWordSolved, options = {}) {
  if (!container || !wordObj) return;

  const rawWord = String(wordObj.word || '').trim();
  const chars = rawWord.split('');

  // 1. Build slots structure
  // Punctuation and spaces are pre-locked so user only focuses on alphabet letters
  const slots = chars.map((char, index) => {
    const isLetter = /[a-zA-Z]/.test(char);
    return {
      index,
      char: char.toUpperCase(),
      originalChar: char,
      isPunctuation: !isLetter,
      isLocked: !isLetter,
      currentTileId: null,
      status: null,
    };
  });

  // 2. Build letter tiles (target letters + 3 traps)
  const letterChars = chars.filter((c) => /[a-zA-Z]/.test(c)).map((c) => c.toUpperCase());
  const trapLetters = getTrapLetters(rawWord, allWords);

  let tileCounter = 0;
  const tiles = [];

  letterChars.forEach((ch) => {
    tiles.push({
      id: `tile_${tileCounter++}`,
      letter: ch,
      isTrap: false,
      isPlaced: false,
      isLocked: false,
      isYellow: false,
      isGray: false,
    });
  });

  trapLetters.forEach((ch) => {
    tiles.push({
      id: `tile_${tileCounter++}`,
      letter: ch,
      isTrap: true,
      isPlaced: false,
      isLocked: false,
      isYellow: false,
      isGray: false,
    });
  });

  shuffleArray(tiles);

  // 3. State
  let failedAttempts = 0;
  let isChecking = false;
  let isCompleted = false;

  // 4. Initial DOM layout
  container.innerHTML = `
    <div class="wb-exercise-root" id="wb-exercise-root">
      <div class="wb-instruction-hint">${t('train_blocks_hint') || 'Соберите слово из кубиков'}</div>
      <div class="wb-slots-row" id="wb-slots-row" role="region" aria-label="Word slots"></div>
      <div class="wb-pool-wrapper">
        <div class="wb-pool-grid" id="wb-pool-grid" role="group" aria-label="Letter tiles pool"></div>
      </div>
    </div>
  `;

  const slotsRowEl = container.querySelector('#wb-slots-row');
  const poolGridEl = container.querySelector('#wb-pool-grid');

  function renderSlots() {
    if (!slotsRowEl) return;
    slotsRowEl.innerHTML = '';

    slots.forEach((s) => {
      const slotEl = document.createElement('div');
      slotEl.className = 'wb-slot';
      slotEl.dataset.slotIndex = String(s.index);

      if (s.isPunctuation) {
        slotEl.classList.add('wb-slot-punctuation');
        slotEl.textContent = s.originalChar;
      } else if (s.isLocked) {
        slotEl.classList.add('wb-slot-locked', 'wb-slot-green');
        slotEl.textContent = s.char;
      } else if (s.status === 'wrong') {
        const tObj = tiles.find((tile) => tile.id === s.currentTileId);
        slotEl.classList.add('wb-slot-wrong');
        slotEl.textContent = tObj ? tObj.letter : '';
      } else if (s.currentTileId) {
        const tObj = tiles.find((tile) => tile.id === s.currentTileId);
        slotEl.classList.add('wb-slot-filled');
        slotEl.textContent = tObj ? tObj.letter : '';
      } else {
        slotEl.classList.add('wb-slot-empty');
        slotEl.textContent = '';
      }

      slotsRowEl.appendChild(slotEl);
    });
  }

  function renderPool() {
    if (!poolGridEl) return;
    poolGridEl.innerHTML = '';

    tiles.forEach((tObj) => {
      const tileBtn = document.createElement('button');
      tileBtn.type = 'button';
      tileBtn.className = 'wb-tile';
      tileBtn.dataset.tileId = tObj.id;
      tileBtn.textContent = tObj.letter;

      if (tObj.isPlaced) {
        tileBtn.classList.add('wb-tile-placed');
        tileBtn.disabled = true;
      } else if (tObj.isGray) {
        tileBtn.classList.add('wb-tile-gray');
        tileBtn.disabled = true;
      } else {
        if (tObj.isYellow) {
          tileBtn.classList.add('wb-tile-yellow');
        }
        tileBtn.disabled = isChecking || isCompleted;
      }

      tileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        onTileClick(tObj);
      });

      poolGridEl.appendChild(tileBtn);
    });
  }

  function onTileClick(tile) {
    if (isChecking || isCompleted) return;
    if (tile.isPlaced || tile.isGray || tile.isLocked) return;

    // Find first unlocked & non-punctuation slot
    const targetSlot = slots.find((s) => !s.isLocked && !s.isPunctuation);
    if (!targetSlot) return;

    // Put tile in slot
    targetSlot.currentTileId = tile.id;
    tile.isPlaced = true;

    // Immediate check: is this letter correct for this position?
    // "неправильная буква в Кубиках должна отваливаться сама буквально сразу после ее установки"
    const isCorrect = (tile.letter === targetSlot.char);

    if (isCorrect) {
      // 1. CORRECT: locks green immediately in slot
      targetSlot.isLocked = true;
      targetSlot.status = 'green';
      tile.isLocked = true;

      renderSlots();
      renderPool();

      // Check if word is complete
      const allDone = slots.every((s) => s.isLocked || s.isPunctuation);
      if (allDone) {
        finishWordSuccess();
      }
    } else {
      // 2. INCORRECT: shakes and drops back immediately!
      isChecking = true;
      failedAttempts++;
      targetSlot.status = 'wrong';

      renderSlots();
      renderPool();

      // Shake animation on incorrect slot
      const slotEls = slotsRowEl.querySelectorAll('.wb-slot');
      if (slotEls[targetSlot.index]) {
        slotEls[targetSlot.index].classList.add('wb-shake');
      }

      if (AudioService && typeof AudioService.playErrorSound === 'function') {
        AudioService.playErrorSound();
      }

      setTimeout(() => {
        // Return tile back to pool
        targetSlot.currentTileId = null;
        targetSlot.status = null;
        tile.isPlaced = false;

        // Mark tile: yellow if in word, gray if absent / trap
        if (letterChars.includes(tile.letter)) {
          tile.isYellow = true;
        } else {
          tile.isGray = true;
        }

        // Brute force protection:
        // "После каждых 2 неудачных проверок автоматически открывается одна буква"
        if (failedAttempts % 2 === 0) {
          revealFirstUnlockedPosition();
        }

        isChecking = false;
        renderSlots();
        renderPool();

        // Check if hint finished the word
        const allDoneAfterHint = slots.every((s) => s.isLocked || s.isPunctuation);
        if (allDoneAfterHint) {
          finishWordSuccess();
        }
      }, 380);
    }
  }

  function finishWordSuccess() {
    if (isCompleted) return;
    isCompleted = true;

    // Bounce animation in sequence
    const slotEls = slotsRowEl.querySelectorAll('.wb-slot');
    slotEls.forEach((el, idx) => {
      el.classList.add('wb-bounce');
      el.style.animationDelay = `${idx * 60}ms`;
    });

    if (AudioService && typeof AudioService.playSuccessSound === 'function') {
      AudioService.playSuccessSound();
    }
    if (AudioService && typeof AudioService.playWord === 'function') {
      AudioService.playWord(rawWord);
    }

    setTimeout(() => {
      isChecking = false;
      if (typeof onWordSolved === 'function') {
        onWordSolved(wordObj);
      }
    }, 1100);
  }

  function revealFirstUnlockedPosition() {
    const targetSlot = slots.find((s) => !s.isLocked && !s.isPunctuation);
    if (!targetSlot) return;

    const neededChar = targetSlot.char;
    let matchingTile = tiles.find((t) => t.letter === neededChar && !t.isLocked);
    if (!matchingTile) {
      matchingTile = tiles.find((t) => t.letter === neededChar);
    }

    if (matchingTile) {
      if (matchingTile.isPlaced) {
        const oldSlot = slots.find((s) => s.currentTileId === matchingTile.id);
        if (oldSlot) oldSlot.currentTileId = null;
      }
      matchingTile.isPlaced = true;
      matchingTile.isLocked = true;
      matchingTile.isGray = false;
      matchingTile.isYellow = false;

      targetSlot.currentTileId = matchingTile.id;
      targetSlot.isLocked = true;
      targetSlot.status = 'green';
    }
  }

  // Initial draw
  renderSlots();
  renderPool();
}
