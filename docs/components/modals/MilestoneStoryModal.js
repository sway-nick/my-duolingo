import { getStoryStrings } from './storyTranslations.js?v=386.0';
import { getInterfaceLanguage, getWordTranslation } from '../../services/i18n.js?v=386.0';
import { speakWord } from '../../services/audioService.js?v=386.0';
import { toggleFavoriteApi, getUserFavorites, getWords, addWeeklyXP } from '../../services/api.js?v=386.0';

const STORY_DATA_200 = {
  milestone: 200,
  title: 'A Morning at the Friendly Cafe',
  paragraphs: [
    'One warm morning, a man and a woman walk into a small cafe in the city.',
    'They sit at a table near the window and look out at the street.',
    'The sun is up, and people are walking with their dogs.',
    'A little black cat comes to the door and looks at them with big eyes.',
    'The woman smiles and says, "Look, what a good cat!"',
    'The man gives the cat some food, and the cat is very happy.',
    'They drink their hot coffee, talk about life, and enjoy the day.',
    'It is a simple time, but it brings great joy to their hearts.'
  ]
};

// Fallback grammatical words translations across languages for smooth tap experience
const FUNCTION_WORDS_MAP = {
  'a': { ru: 'артикль (один, какой-то)', en: 'article (one/any)', es: 'artículo (un/una)', de: 'Artikel (ein/eine)', fr: 'article (un/une)', uk: 'артикль (один, якийсь)', cs: 'člen (jeden/nějaký)' },
  'an': { ru: 'артикль (один)', en: 'article (one)', es: 'artículo (un/una)', de: 'Artikel (ein/eine)', fr: 'article (un/une)', uk: 'артикль (один)', cs: 'člen (jeden)' },
  'the': { ru: 'определенный артикль (этот)', en: 'definite article (this/that)', es: 'el/la/los/las', de: 'der/die/das', fr: 'le/la/les', uk: 'визначений артикль (цей)', cs: 'určitý člen (ten/ta/to)' },
  'to': { ru: 'к, в, по направлению к', en: 'towards, to', es: 'a, hacia', de: 'zu, nach', fr: 'à, vers', uk: 'до, в, назустріч', cs: 'k, do, směrem k' },
  'is': { ru: 'есть, является (быть)', en: 'is (to be)', es: 'es, está (ser/estar)', de: 'ist (sein)', fr: 'est (être)', uk: 'є, знаходиться (бути)', cs: 'je (být)' },
  'are': { ru: 'есть, находятся (быть)', en: 'are (to be)', es: 'son, están (ser/estar)', de: 'sind (sein)', fr: 'sont (être)', uk: 'є, знаходяться (бути)', cs: 'jsou (být)' },
  'it': { ru: 'оно, это', en: 'it', es: 'eso, ello', de: 'es', fr: 'il/elle, cela', uk: 'воно, це', cs: 'to, ono' }
};

let _dictionaryCache = null;
let _wordLookupMap = null;

async function getOrBuildDictionary() {
  if (_wordLookupMap) return _wordLookupMap;
  try {
    const res = await getWords();
    const list = Array.isArray(res) ? res : (res?.data || []);
    _dictionaryCache = list;
    _wordLookupMap = new Map();
    list.forEach(w => {
      if (w && w.word) {
        _wordLookupMap.set(String(w.word).toLowerCase().trim(), w);
      }
    });
  } catch (e) {
    _wordLookupMap = new Map();
  }
  return _wordLookupMap;
}

function resolveWord(rawWord, dictMap, lang) {
  const clean = rawWord.toLowerCase().replace(/[^a-z'-]/g, '').trim();
  if (!clean) return null;

  if (dictMap.has(clean)) {
    const w = dictMap.get(clean);
    return {
      id: w.id,
      word: clean,
      transcription: w.transcription || '',
      translation: getWordTranslation(w, lang) || w.translation || '',
      isFromDict: true,
      rawObj: w
    };
  }

  // Lemmatization: plurals & 3rd person -s/-es
  let baseCandidate = null;
  if (clean.endsWith('ies') && dictMap.has(clean.slice(0, -3) + 'y')) baseCandidate = clean.slice(0, -3) + 'y';
  else if (clean.endsWith('es') && dictMap.has(clean.slice(0, -2))) baseCandidate = clean.slice(0, -2);
  else if (clean.endsWith('s') && !clean.endsWith('ss') && dictMap.has(clean.slice(0, -1))) baseCandidate = clean.slice(0, -1);
  else if (clean.endsWith('ing') && dictMap.has(clean.slice(0, -3))) baseCandidate = clean.slice(0, -3);
  else if (clean.endsWith('ing') && dictMap.has(clean.slice(0, -3) + 'e')) baseCandidate = clean.slice(0, -3) + 'e';
  else if (clean.endsWith('ed') && dictMap.has(clean.slice(0, -2))) baseCandidate = clean.slice(0, -2);
  else if (clean.endsWith('ed') && dictMap.has(clean.slice(0, -1))) baseCandidate = clean.slice(0, -1);

  // Common irregulars
  const irregulars = {
    'is': 'be', 'are': 'be', 'was': 'be', 'were': 'be', 'been': 'be',
    'has': 'have', 'had': 'have',
    'does': 'do', 'did': 'do',
    'goes': 'go', 'went': 'go', 'gone': 'go',
    'said': 'say', 'says': 'say',
    'gave': 'give', 'given': 'give', 'gives': 'give',
    'came': 'come', 'comes': 'come',
    'drank': 'drink', 'drunk': 'drink', 'drinks': 'drink',
    'saw': 'see', 'seen': 'see', 'sees': 'see',
    'men': 'man men', 'man': 'man men',
    'smiles': 'smile at', 'smile': 'smile at'
  };
  if (!baseCandidate && irregulars[clean] && dictMap.has(irregulars[clean])) {
    baseCandidate = irregulars[clean];
  }

  if (baseCandidate && dictMap.has(baseCandidate)) {
    const w = dictMap.get(baseCandidate);
    return {
      id: w.id,
      word: clean,
      transcription: w.transcription || '',
      translation: getWordTranslation(w, lang) || w.translation || '',
      isFromDict: true,
      rawObj: w
    };
  }

  // Fallback function words
  if (FUNCTION_WORDS_MAP[clean]) {
    const trans = FUNCTION_WORDS_MAP[clean][lang] || FUNCTION_WORDS_MAP[clean]['en'] || FUNCTION_WORDS_MAP[clean]['ru'];
    return {
      id: null,
      word: clean,
      transcription: '',
      translation: trans,
      isFromDict: false,
      rawObj: null
    };
  }

  return {
    id: null,
    word: clean,
    transcription: '',
    translation: clean,
    isFromDict: false,
    rawObj: null
  };
}

/**
 * Show a floating quick toast inside or over the story modal
 */
function showStoryToast(msg) {
  let toast = document.querySelector('#story-reader-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'story-reader-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(15, 23, 42, 0.95);
      color: #f8fafc;
      padding: 12px 20px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      border: 1px solid rgba(251, 191, 36, 0.4);
      z-index: 1000002;
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2400);
}

/**
 * Render and display the Milestone Story Modal
 */
export async function showMilestoneStoryModal(milestone = 200) {
  const existing = document.querySelector('#milestone-story-modal-overlay');
  if (existing) existing.remove();

  const lang = getInterfaceLanguage();
  const strings = getStoryStrings(lang);
  const dictMap = await getOrBuildDictionary();

  // Load user favorites set for heart states
  let favSet = new Set();
  try {
    const favs = await getUserFavorites();
    if (Array.isArray(favs)) {
      favs.forEach(f => favSet.add(String(f.id || f)));
    }
  } catch (e) {}

  const clickedWords = new Set();
  const overlay = document.createElement('div');
  overlay.id = 'milestone-story-modal-overlay';
  overlay.className = 'milestone-story-modal-overlay';

  // Build story HTML tokens
  const paragraphsHtml = STORY_DATA_200.paragraphs.map((p, pIdx) => {
    // Split paragraph preserving words and punctuation
    const tokens = p.match(/[a-zA-Z'-]+|[^a-zA-Z'-]+/g) || [p];
    const tokensHtml = tokens.map((token, tIdx) => {
      const isWord = /[a-zA-Z]/.test(token);
      if (!isWord) {
        return `<span class="story-punct">${token}</span>`;
      }
      return `<span class="story-word-token" data-word="${token}" data-pidx="${pIdx}" data-tidx="${tIdx}">${token}</span>`;
    }).join('');
    return `<p class="story-paragraph">${tokensHtml}</p>`;
  }).join('');

  overlay.innerHTML = `
    <style>
      .milestone-story-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 15, 29, 0.85);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        padding: 16px;
        box-sizing: border-box;
        animation: storyOverlayFadeIn 0.25s ease-out;
      }
      @keyframes storyOverlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes storyCardSlideUp {
        from { opacity: 0; transform: translateY(24px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .milestone-story-card {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(251, 191, 36, 0.3);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.15);
        border-radius: 24px;
        width: 100%;
        max-width: 520px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: storyCardSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        box-sizing: border-box;
      }
      .milestone-story-header {
        padding: 20px 20px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        position: relative;
      }
      .milestone-story-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #fcd34d;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 4px 10px;
        border-radius: 9999px;
        margin-bottom: 6px;
      }
      .milestone-story-title {
        font-size: 18px;
        font-weight: 800;
        color: #f8fafc;
        line-height: 1.25;
        margin: 0 0 4px;
      }
      .milestone-story-sub {
        font-size: 12.5px;
        color: #94a3b8;
        line-height: 1.4;
        margin: 0;
      }
      .milestone-story-close {
        background: rgba(255, 255, 255, 0.08);
        border: none;
        color: #94a3b8;
        width: 32px;
        height: 32px;
        min-width: 32px;
        border-radius: 50%;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .milestone-story-close:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #f8fafc;
      }
      .milestone-story-body {
        padding: 16px 20px;
        overflow-y: auto;
        flex: 1;
        -webkit-overflow-scrolling: touch;
      }
      .story-hint-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(56, 189, 248, 0.1);
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-radius: 12px;
        padding: 8px 12px;
        margin-bottom: 16px;
        font-size: 12px;
        color: #7dd3fc;
        line-height: 1.35;
      }
      .story-title-banner {
        font-size: 16px;
        font-weight: 800;
        color: #fbbf24;
        margin-bottom: 12px;
        text-align: center;
        font-family: inherit;
        letter-spacing: -0.2px;
      }
      .story-text-container {
        font-size: 16px;
        line-height: 1.8;
        color: #e2e8f0;
        user-select: text;
        -webkit-user-select: text;
      }
      .story-paragraph {
        margin: 0 0 14px;
        text-align: left;
      }
      .story-word-token {
        display: inline-block;
        padding: 1px 3px;
        margin: 0 1px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.15s ease, color 0.15s ease;
        border-bottom: 1.5px dashed rgba(245, 158, 11, 0.35);
      }
      .story-word-token:hover {
        background: rgba(245, 158, 11, 0.2);
        color: #fef08a;
      }
      .story-word-token.active-token {
        background: #f59e0b !important;
        color: #0f172a !important;
        font-weight: 700;
        border-bottom-color: transparent;
      }
      .story-word-token.clicked-token {
        background: rgba(245, 158, 11, 0.15);
        color: #fde68a;
        border-bottom: 1.5px solid rgba(245, 158, 11, 0.8);
      }
      .story-popover-card {
        display: none;
        background: #0f172a;
        border: 1.5px solid #f59e0b;
        border-radius: 14px;
        padding: 10px 14px;
        box-shadow: 0 12px 28px rgba(0,0,0,0.6);
        margin: 10px 0 16px;
        animation: storyPopoverPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes storyPopoverPop {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .story-popover-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .story-popover-word {
        font-size: 17px;
        font-weight: 800;
        color: #f8fafc;
      }
      .story-popover-transcription {
        font-size: 13px;
        color: #94a3b8;
        margin-left: 8px;
        font-family: monospace;
      }
      .story-popover-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .popover-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #f8fafc;
        font-size: 15px;
        transition: all 0.15s ease;
      }
      .popover-btn:hover {
        background: rgba(255, 255, 255, 0.18);
      }
      .popover-btn.is-favorited {
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.15);
      }
      .story-popover-translation {
        font-size: 14.5px;
        color: #38bdf8;
        font-weight: 600;
        line-height: 1.35;
      }
      .milestone-story-footer {
        padding: 14px 20px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: rgba(15, 23, 42, 0.7);
      }
      .story-btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: none;
        color: #ffffff;
        font-size: 15px;
        font-weight: 700;
        padding: 14px 20px;
        border-radius: 14px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .story-btn-primary:active {
        transform: scale(0.98);
      }
      .story-btn-secondary {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #94a3b8;
        font-size: 14px;
        font-weight: 600;
        padding: 11px 16px;
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      .story-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #e2e8f0;
      }
      .review-count-badge {
        font-size: 12px;
        color: #f59e0b;
        text-align: center;
        margin: 0;
      }
    </style>

    <div class="milestone-story-card" role="dialog" aria-modal="true">
      <div class="milestone-story-header">
        <div>
          <div class="milestone-story-badge">${strings.badge}</div>
          <h2 class="milestone-story-title">${strings.modalTitle}</h2>
          <p class="milestone-story-sub">${strings.modalSub}</p>
        </div>
        <button class="milestone-story-close" id="story-close-btn" aria-label="Close">&times;</button>
      </div>

      <div class="milestone-story-body">
        <div class="story-hint-banner">
          <span>💡</span>
          <span>${strings.tapHint}</span>
        </div>

        <div class="story-title-banner">📖 ${strings.storyTitle}</div>

        <div class="story-popover-card" id="story-popover">
          <div class="story-popover-top">
            <div style="display: flex; align-items: baseline;">
              <span class="story-popover-word" id="popover-word-text"></span>
              <span class="story-popover-transcription" id="popover-transcription-text"></span>
            </div>
            <div class="story-popover-actions">
              <button class="popover-btn" id="popover-audio-btn" title="Speak" aria-label="Audio">🔊</button>
              <button class="popover-btn" id="popover-heart-btn" title="Add to favorites" aria-label="Favorite">❤️</button>
            </div>
          </div>
          <div class="story-popover-translation" id="popover-translation-text"></div>
        </div>

        <div class="story-text-container" id="story-tokens-wrapper">
          ${paragraphsHtml}
        </div>
      </div>

      <div class="milestone-story-footer">
        <div class="review-count-badge" id="story-review-badge" style="display: none;"></div>
        <button class="story-btn-primary" id="story-understood-btn">
          ${strings.btnUnderstood}
        </button>
        <button class="story-btn-secondary" id="story-difficult-btn">
          ${strings.btnDifficult}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Element handles
  const closeBtn = overlay.querySelector('#story-close-btn');
  const understoodBtn = overlay.querySelector('#story-understood-btn');
  const difficultBtn = overlay.querySelector('#story-difficult-btn');
  const popover = overlay.querySelector('#story-popover');
  const popoverWord = overlay.querySelector('#popover-word-text');
  const popoverTrans = overlay.querySelector('#popover-transcription-text');
  const popoverMeaning = overlay.querySelector('#popover-translation-text');
  const popoverAudio = overlay.querySelector('#popover-audio-btn');
  const popoverHeart = overlay.querySelector('#popover-heart-btn');
  const reviewBadge = overlay.querySelector('#story-review-badge');

  let activeTokenEl = null;
  let activeResolvedWord = null;

  function updateReviewBadge() {
    if (clickedWords.size > 0) {
      reviewBadge.style.display = 'block';
      reviewBadge.textContent = `${strings.wordsToReview}${clickedWords.size}`;
    } else {
      reviewBadge.style.display = 'none';
    }
  }

  // Token click binding
  overlay.querySelectorAll('.story-word-token').forEach(tokenEl => {
    tokenEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const rawText = tokenEl.getAttribute('data-word') || tokenEl.textContent;
      const resolved = resolveWord(rawText, dictMap, lang);
      if (!resolved) return;

      // Unset previous active token
      if (activeTokenEl) activeTokenEl.classList.remove('active-token');
      tokenEl.classList.add('active-token');
      tokenEl.classList.add('clicked-token');
      activeTokenEl = tokenEl;
      activeResolvedWord = resolved;

      // Add to tracking set
      clickedWords.add(resolved.word);
      updateReviewBadge();

      // Update Popover
      popoverWord.textContent = resolved.word;
      popoverTrans.textContent = resolved.transcription ? `/${resolved.transcription.replace(/^\/|\/$/g, '')}/` : '';
      popoverMeaning.textContent = resolved.translation || resolved.word;

      // Check favorite status
      const isFav = resolved.id ? favSet.has(String(resolved.id)) : false;
      popoverHeart.classList.toggle('is-favorited', isFav);
      popoverHeart.style.display = resolved.id ? 'flex' : 'none';

      popover.style.display = 'block';

      // Automatically speak the word softly on first tap
      speakWord(resolved.word, resolved.id);
    });
  });

  // Audio button in popover
  popoverAudio.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeResolvedWord) {
      speakWord(activeResolvedWord.word, activeResolvedWord.id);
    }
  });

  // Heart button in popover
  popoverHeart.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!activeResolvedWord || !activeResolvedWord.id) return;
    const wId = String(activeResolvedWord.id);
    const wasFav = favSet.has(wId);
    const newFav = !wasFav;
    try {
      await toggleFavoriteApi(wId, newFav);
      if (newFav) {
        favSet.add(wId);
        popoverHeart.classList.add('is-favorited');
        showStoryToast(strings.favAdded);
      } else {
        favSet.delete(wId);
        popoverHeart.classList.remove('is-favorited');
        showStoryToast(strings.favRemoved);
      }
    } catch (err) {
      console.warn('Favorite toggle error:', err);
    }
  });

  // Click outside word popover to dismiss it
  overlay.querySelector('.milestone-story-card').addEventListener('click', (e) => {
    if (!e.target.closest('.story-word-token') && !e.target.closest('#story-popover')) {
      popover.style.display = 'none';
      if (activeTokenEl) {
        activeTokenEl.classList.remove('active-token');
        activeTokenEl = null;
      }
    }
  });

  function closeModal() {
    overlay.remove();
  }

  // Close X
  closeBtn.addEventListener('click', closeModal);

  // Click background overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Button 1: Understood (+25 XP)
  understoodBtn.addEventListener('click', () => {
    localStorage.setItem(`myduo_milestone_story_${milestone}_completed`, 'true');
    localStorage.setItem(`myduo_milestone_story_${milestone}_shown`, 'true');

    // Award +25 XP
    try {
      addWeeklyXP(25);
    } catch (e) {}

    showStoryToast(strings.xpAwarded);
    closeModal();
  });

  // Button 2: Difficult (auto-save clicked words to favorites if any)
  difficultBtn.addEventListener('click', async () => {
    localStorage.setItem(`myduo_milestone_story_${milestone}_shown`, 'true');

    if (clickedWords.size > 0) {
      let savedCount = 0;
      for (const wordText of clickedWords) {
        const entry = dictMap.get(wordText);
        if (entry && entry.id) {
          try {
            await toggleFavoriteApi(entry.id, true);
            savedCount++;
          } catch (e) {}
        }
      }
      if (savedCount > 0) {
        showStoryToast(`❤️ ${savedCount} ${strings.wordsToReview.toLowerCase()}`);
      }
    }
    closeModal();
  });

  return overlay;
}

// Export for global invocation (console, settings, or automatic round trigger)
if (typeof window !== 'undefined') {
  window.showMilestoneStoryModal = showMilestoneStoryModal;
}
