import { getStoryStrings } from './storyTranslations.js?v=386.0';
import { getInterfaceLanguage, getWordTranslation } from '../../services/i18n.js?v=386.0';
import { speakWord } from '../../services/audioService.js?v=386.0';
import { toggleFavoriteApi, getUserFavorites, getWords, addWeeklyXP } from '../../services/api.js?v=386.0';
import { AdService } from '../../services/adService.js?v=386.0';

export const MILESTONE_STORIES = {
  100: {
    milestone: 100,
    titleKey: 'storyTitle100',
    translationKey: 'storyFull100',
    badgeKey: 'badge100',
    title: 'Lunch by the Coast',
    paragraphs: [
      'A professor and his colleague organize lunch by the coast.',
      'The rain was slow, and soft clouds surround the tall bridge.',
      'They select tea, sugar, and chicken on a comfortable plate.',
      'Their boss is busy in the studio, but he prefers an email.',
      'A colleague repeats a joke, and the host confirms the lunch.',
      'The moon was grand on the ocean, and soft flowers surround the pool.',
      'It was a unique beginning for the united community.'
    ]
  },
  200: {
    milestone: 200,
    titleKey: 'storyTitle200',
    translationKey: 'storyFull200',
    badgeKey: 'badge200',
    title: 'A Holiday on Campus',
    paragraphs: [
      'A professor and his uncle celebrate a birthday on campus.',
      'The rain was slow, and soft yellow clouds surround the tall bridge by the coast.',
      'They organize a comfortable lunch with tea, sugar, fruit, and chicken on a brown plate.',
      'A colleague knocks on the desk and repeats a joke.',
      'A gentleman in a golden shirt and a brown hat selects a package from his pocket.',
      'In the package is an album of unique beauty and rare flowers.',
      'They dance, mix tea with sugar, and celebrate with confidence.',
      'It was a proper holiday for the united community.'
    ]
  },
  300: {
    milestone: 300,
    titleKey: 'storyTitle300',
    translationKey: 'storyFull300',
    badgeKey: 'badge300',
    title: 'A Relaxing Breakfast',
    paragraphs: [
      'An engineer and his girlfriend organize breakfast by the gate.',
      'They wash round dishes and pour milk into a brown pot.',
      'They select soft bread, cheese, yellow fruit, and cake.',
      'They taste the meal and relax on the soft grass by the sand.',
      'A designer in a brown cap repeats an awesome joke with confidence.',
      'It was a comfortable holiday for their united community.'
    ]
  },
  400: {
    milestone: 400,
    titleKey: 'storyTitle400',
    translationKey: 'storyFull400',
    badgeKey: 'badge400',
    title: 'A Friendly Chef on Vacation',
    paragraphs: [
      'A friendly chef and his aunt organize a vacation by the port.',
      'They select a brown jacket and a pink coat in the rain.',
      'A hungry tourist borrows a mobile phone.',
      'The chef selects round potatoes, butter, tomatoes, and juice.',
      'They pack a package with bread, cheese, and cake.',
      'A singer repeats a poem at the concert by the historic tower.',
      'They celebrate their friendship with joy and fortune.'
    ]
  },
  500: {
    milestone: 500,
    titleKey: 'storyTitle500',
    translationKey: 'storyFull500',
    badgeKey: 'badge500',
    title: 'A Creative Celebration',
    paragraphs: [
      'A calm photographer and a poet organize a celebration.',
      'They bake bread in the oven and select soup.',
      'A wooden shelf displays orange juice, salad, and beef.',
      'They mix lemon, onion, and chicken in a round pan.',
      'A poet repeats a poem with a wooden guitar.',
      'The studio shines with happiness and magic.'
    ]
  },
  600: {
    milestone: 600,
    titleKey: 'storyTitle600',
    translationKey: 'storyFull600',
    badgeKey: 'badge600',
    title: 'A Sunny Weekend at the Cafe',
    paragraphs: [
      'On a sunny weekend, a dancer and a runner hurry to a cafe with a bicycle.',
      'A clever runner selects comfortable jeans and a purple t-shirt.',
      'They select bananas, cake, and tea by the soft curtain.',
      'A dancer tunes the piano in the cafe.',
      'They scan a laptop screen, chat with colleagues, and celebrate.'
    ]
  },
  700: {
    milestone: 700,
    titleKey: 'storyTitle700',
    translationKey: 'storyFull700',
    badgeKey: 'badge700',
    title: 'Morning Coffee in the Garden',
    paragraphs: [
      'In the morning, a father and his sister select coffee in the garden.',
      'A friendly neighbor supplies fruit from the public market.',
      'A doctor contacts the family, and they chat together with respect.',
      'They finish writing an analysis for a hospital client.',
      'It was a calm morning for the united family.'
    ]
  },
  800: {
    milestone: 800,
    titleKey: 'storyTitle800',
    translationKey: 'storyFull800',
    badgeKey: 'badge800',
    title: 'A Walk with the Dog',
    paragraphs: [
      'In the quiet morning, a dad and his kid walk with their dog.',
      'The dog walks under the tall tree and enjoys a fun game.',
      'They talk together and feed the dog by a store.',
      'They rest on a rock in the sun.',
      'At the store, they select a cup of tea at a table.',
      'It was an easy walk with joy and fun for the family.'
    ]
  }
};

// Fallback grammatical words translations across languages for smooth tap experience
const FUNCTION_WORDS_MAP = {
  'a': { ru: 'артикль (один, какой-то)', en: 'article (one/any)', es: 'artículo (un/una)', de: 'Artikel (ein/eine)', fr: 'article (un/une)', uk: 'артикль (один, якийсь)', cs: 'člen (jeden/nějaký)' },
  'an': { ru: 'артикль (один)', en: 'article (one)', es: 'artículo (un/una)', de: 'Artikel (ein/eine)', fr: 'article (un/une)', uk: 'артикль (один)', cs: 'člen (jeden)' },
  'the': { ru: 'определенный артикль (этот)', en: 'definite article (this/that)', es: 'el/la/los/las', de: 'der/die/das', fr: 'le/la/les', uk: 'визначений артикль (цей)', cs: 'určitý člen (ten/ta/to)' },
  'to': { ru: 'к, в, по направлению к', en: 'towards, to', es: 'a, hacia', de: 'zu, nach', fr: 'à, vers', uk: 'до, в, назустріч', cs: 'k, do, směrem k' },
  'is': { ru: 'есть, является (быть)', en: 'is (to be)', es: 'es, está (ser/estar)', de: 'ist (sein)', fr: 'est (être)', uk: 'є, знаходиться (бути)', cs: 'je (být)' },
  'are': { ru: 'есть, находятся (быть)', en: 'are (to be)', es: 'son, están (ser/estar)', de: 'sind (sein)', fr: 'sont (être)', uk: 'є, знаходяться (бути)', cs: 'jsou (být)' },
  'was': { ru: 'был, была, было (быть)', en: 'was (to be)', es: 'era, fue, estaba (ser/estar)', de: 'war (sein)', fr: 'était (être)', uk: 'був, була, було (бути)', cs: 'byl/byla/bylo (být)' },
  'it': { ru: 'оно, это', en: 'it', es: 'eso, ello', de: 'es', fr: 'il/elle, cela', uk: 'воно, це', cs: 'to, ono' },
  'his': { ru: 'его', en: 'his', es: 'su, de él', de: 'sein', fr: 'son/sa/ses (à lui)', uk: 'його', cs: 'jeho' },
  'her': { ru: 'её', en: 'her', es: 'su, de ella', de: 'ihr', fr: 'son/sa/ses (à elle)', uk: 'її', cs: 'její' },
  'they': { ru: 'они', en: 'they', es: 'ellos/ellas', de: 'sie', fr: 'ils/elles', uk: 'вони', cs: 'oni' },
  'their': { ru: 'их', en: 'their', es: 'su, sus (de ellos)', de: 'ihr', fr: 'leur/leurs', uk: 'їхній, їх', cs: 'jejich' },
  'and': { ru: 'и, а', en: 'and', es: 'y, e', de: 'und', fr: 'et', uk: 'і, й, та', cs: 'a, i' },
  'in': { ru: 'в, внутри', en: 'in, inside', es: 'en, dentro de', de: 'in', fr: 'dans, en', uk: 'в, у, всередині', cs: 'v, ve' },
  'on': { ru: 'на, по', en: 'on, upon', es: 'sobre, en', de: 'auf, an', fr: 'sur', uk: 'на', cs: 'na' },
  'at': { ru: 'у, при, в', en: 'at', es: 'en, junto a', de: 'bei, an', fr: 'à, chez', uk: 'біля, при, в', cs: 'u, při, v' },
  'by': { ru: 'у, около, возле', en: 'by, near', es: 'junto a, por', de: 'bei, neben', fr: 'près de, par', uk: 'біля, поруч', cs: 'u, vedle' },
  'of': { ru: 'из, о, (родительный падеж)', en: 'of', es: 'de', de: 'von', fr: 'de', uk: 'з, про, (родовий відмінок)', cs: 'z, ze, o' },
  'for': { ru: 'для, ради', en: 'for', es: 'para, por', de: 'für', fr: 'pour', uk: 'для, заради', cs: 'pro' },
  'with': { ru: 'с, вместе с', en: 'with', es: 'con', de: 'mit', fr: 'avec', uk: 'з, разом з', cs: 's, se' },
  'under': { ru: 'под', en: 'under', es: 'debajo de, bajo', de: 'unter', fr: 'sous', uk: 'під', cs: 'pod' }
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

  // Fallback function words (checked before lemmatization to prevent false stems like 'his' -> 'hi')
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

  return {
    id: null,
    word: clean,
    transcription: '',
    translation: clean,
    isFromDict: false,
    rawObj: null
  };
}

function showStoryToast(message) {
  const existing = document.querySelector('.story-milestone-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'story-milestone-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

/**
 * Show the Milestone Story Reader modal
 * @param {number} milestone - 100 to 800
 */
export async function showMilestoneStoryModal(milestone = 100) {
  const existing = document.querySelector('#milestone-story-modal-overlay');
  if (existing) existing.remove();

  const currentMilestone = Number(milestone) || 100;
  const storyData = MILESTONE_STORIES[currentMilestone] || MILESTONE_STORIES[100];

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
  const paragraphsHtml = storyData.paragraphs.map((p, pIdx) => {
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

  // Full translation HTML
  const translatedParas = strings[storyData.translationKey] || [];
  const translationParagraphsHtml = Array.isArray(translatedParas)
    ? translatedParas.map(tp => `<p class="story-translation-para">${tp}</p>`).join('')
    : `<p class="story-translation-para">${translatedParas}</p>`;

  const badgeText = strings[storyData.badgeKey] || strings.badge || `🏆 ${currentMilestone} слов`;
  const storyTitleText = strings[storyData.titleKey] || storyData.title;

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
        padding: 18px 20px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
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
        margin-bottom: 4px;
      }
      .milestone-story-title {
        font-size: 17px;
        font-weight: 800;
        color: #f8fafc;
        line-height: 1.25;
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
        position: relative;
        -webkit-overflow-scrolling: touch;
      }
      .story-title-banner {
        font-size: 16px;
        font-weight: 800;
        color: #fbbf24;
        margin-bottom: 14px;
        text-align: center;
        font-family: inherit;
        letter-spacing: -0.2px;
      }
      .story-text-container {
        font-size: 16px;
        line-height: 1.85;
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
        background: rgba(245, 158, 11, 0.25);
        color: #fde68a;
        border-bottom: 1.5px solid #f59e0b;
      }

      /* Floating Popover Tooltip positioned directly above the word */
      .story-floating-popover {
        position: absolute;
        z-index: 1000;
        display: none;
        background: #0f172a;
        border: 1.5px solid #f59e0b;
        border-radius: 14px;
        padding: 10px 14px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.75), 0 0 15px rgba(245, 158, 11, 0.25);
        min-width: 170px;
        max-width: 290px;
        box-sizing: border-box;
        pointer-events: auto;
        animation: storyPopoverFade 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes storyPopoverFade {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      .story-popover-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      }
      .story-popover-word {
        font-size: 16.5px;
        font-weight: 800;
        color: #f8fafc;
      }
      .story-popover-transcription {
        font-size: 12.5px;
        color: #94a3b8;
        margin-left: 6px;
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
        color: #94a3b8;
        font-size: 14px;
        transition: all 0.15s ease;
      }
      .popover-btn:hover {
        background: rgba(255, 255, 255, 0.18);
        color: #f8fafc;
      }
      .popover-btn.is-favorited {
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.15);
      }
      .story-popover-translation {
        font-size: 14px;
        color: #38bdf8;
        font-weight: 600;
        line-height: 1.35;
      }
      .story-popover-arrow {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #0f172a;
        border-right: 1.5px solid #f59e0b;
        border-bottom: 1.5px solid #f59e0b;
        transform: rotate(45deg);
        bottom: -6px;
        left: 50%;
        margin-left: -5px;
      }
      .story-floating-popover.place-below .story-popover-arrow {
        top: -6px;
        bottom: auto;
        border-right: none;
        border-bottom: none;
        border-left: 1.5px solid #f59e0b;
        border-top: 1.5px solid #f59e0b;
      }

      /* Full translation block */
      .story-full-translation-card {
        margin-top: 18px;
        padding: 14px 16px;
        background: rgba(56, 189, 248, 0.08);
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-left: 4px solid #38bdf8;
        border-radius: 14px;
        animation: storyTranslationFade 0.2s ease-out;
      }
      @keyframes storyTranslationFade {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .story-full-translation-header {
        font-size: 13px;
        font-weight: 700;
        color: #7dd3fc;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 10px;
      }
      .story-translation-para {
        font-size: 14.5px;
        line-height: 1.6;
        color: #cbd5e1;
        margin: 0 0 10px;
      }
      .story-translation-para:last-child {
        margin-bottom: 0;
      }

      /* Footer */
      .milestone-story-footer {
        padding: 14px 20px 18px;
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
        padding: 13px 20px;
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
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #cbd5e1;
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
        background: rgba(255, 255, 255, 0.08);
        color: #f8fafc;
      }

      .story-milestone-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #1e293b;
        color: #f8fafc;
        border: 1px solid #10b981;
        border-radius: 12px;
        padding: 10px 18px;
        font-size: 13.5px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        z-index: 100001;
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      }
      .story-milestone-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    </style>

    <div class="milestone-story-card" role="dialog" aria-modal="true">
      <div class="milestone-story-header">
        <div>
          <div class="milestone-story-badge">${badgeText}</div>
          <h2 class="milestone-story-title">${strings.modalTitle}</h2>
        </div>
        <button class="milestone-story-close" id="story-close-btn" aria-label="Close">&times;</button>
      </div>

      <div class="milestone-story-body" id="story-modal-body">
        <div class="story-title-banner">📖 ${storyTitleText}</div>

        <!-- Floating Popover over the tapped word -->
        <div class="story-floating-popover" id="story-popover">
          <div class="story-popover-top">
            <div style="display: flex; align-items: baseline;">
              <span class="story-popover-word" id="popover-word-text"></span>
              <span class="story-popover-transcription" id="popover-transcription-text"></span>
            </div>
            <div class="story-popover-actions">
              <button class="popover-btn" id="popover-audio-btn" title="Speak" aria-label="Audio">🔊</button>
              <button class="popover-btn" id="popover-heart-btn" title="Add to favorites" aria-label="Favorite">
                <svg id="popover-heart-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="story-popover-translation" id="popover-translation-text"></div>
          <div class="story-popover-arrow" id="popover-arrow"></div>
        </div>

        <div class="story-text-container" id="story-tokens-wrapper">
          ${paragraphsHtml}
        </div>

        <!-- Full translation block toggled by button -->
        <div class="story-full-translation-card" id="story-full-translation" style="display: none;">
          <div class="story-full-translation-header">🌐 ${strings.translationTitle || 'Полный перевод'}</div>
          ${translationParagraphsHtml}
        </div>
      </div>

      <div class="milestone-story-footer">
        <button class="story-btn-secondary" id="story-toggle-translation-btn">
          🎬 <span id="story-translation-btn-label">${strings.btnShowTranslation}</span>
        </button>
        <button class="story-btn-primary" id="story-understood-btn">
          ${strings.btnUnderstood}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Element handles
  const closeBtn = overlay.querySelector('#story-close-btn');
  const understoodBtn = overlay.querySelector('#story-understood-btn');
  const toggleTranslationBtn = overlay.querySelector('#story-toggle-translation-btn');
  const translationBtnLabel = overlay.querySelector('#story-translation-btn-label');
  const translationBlock = overlay.querySelector('#story-full-translation');
  const storyBody = overlay.querySelector('#story-modal-body');
  const popover = overlay.querySelector('#story-popover');
  const popoverWord = overlay.querySelector('#popover-word-text');
  const popoverTrans = overlay.querySelector('#popover-transcription-text');
  const popoverMeaning = overlay.querySelector('#popover-translation-text');
  const popoverAudio = overlay.querySelector('#popover-audio-btn');
  const popoverHeart = overlay.querySelector('#popover-heart-btn');
  const popoverHeartIcon = overlay.querySelector('#popover-heart-icon');

  let activeTokenEl = null;
  let activeResolvedWord = null;
  let isTranslationShown = false;
  let isTranslationUnlocked = false;

  function updateHeartVisual(isFav) {
    if (isFav) {
      popoverHeart.classList.add('is-favorited');
      popoverHeartIcon.setAttribute('fill', '#ef4444');
      popoverHeartIcon.setAttribute('stroke', '#ef4444');
    } else {
      popoverHeart.classList.remove('is-favorited');
      popoverHeartIcon.setAttribute('fill', 'none');
      popoverHeartIcon.setAttribute('stroke', '#94a3b8');
    }
  }

  function positionPopoverAboveToken(tokenEl) {
    const bodyRect = storyBody.getBoundingClientRect();
    const tokenRect = tokenEl.getBoundingClientRect();

    popover.style.display = 'block';
    popover.classList.remove('place-below');

    const popWidth = popover.offsetWidth || 200;
    const popHeight = popover.offsetHeight || 65;

    // Token coordinates relative to storyBody taking scroll into account
    const tokenTop = tokenRect.top - bodyRect.top + storyBody.scrollTop;
    const tokenLeft = tokenRect.left - bodyRect.left;
    const tokenCenter = tokenLeft + (tokenRect.width / 2);

    let leftPos = tokenCenter - (popWidth / 2);
    const minLeft = 10;
    const maxLeft = bodyRect.width - popWidth - 10;
    leftPos = Math.max(minLeft, Math.min(maxLeft, leftPos));

    let topPos = tokenTop - popHeight - 8;
    let placeBelow = false;

    // If near the top, show below the word
    if (topPos < storyBody.scrollTop + 4) {
      topPos = tokenTop + tokenRect.height + 8;
      placeBelow = true;
    }

    if (placeBelow) {
      popover.classList.add('place-below');
    }

    popover.style.top = `${topPos}px`;
    popover.style.left = `${leftPos}px`;

    // Position arrow directly over the token center
    const arrowEl = popover.querySelector('#popover-arrow');
    if (arrowEl) {
      const arrowLeft = Math.max(14, Math.min(popWidth - 14, tokenCenter - leftPos));
      arrowEl.style.left = `${arrowLeft}px`;
    }
  }

  // Token click binding: clicking toggles highlight
  overlay.querySelectorAll('.story-word-token').forEach(tokenEl => {
    tokenEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const rawText = tokenEl.getAttribute('data-word') || tokenEl.textContent;
      const resolved = resolveWord(rawText, dictMap, lang);
      if (!resolved) return;

      // Toggle clicked highlight state
      if (tokenEl.classList.contains('clicked-token')) {
        tokenEl.classList.remove('clicked-token');
        clickedWords.delete(resolved.word);
      } else {
        tokenEl.classList.add('clicked-token');
        clickedWords.add(resolved.word);
      }

      // Active token state
      if (activeTokenEl) activeTokenEl.classList.remove('active-token');
      tokenEl.classList.add('active-token');
      activeTokenEl = tokenEl;
      activeResolvedWord = resolved;

      // Update Popover content
      popoverWord.textContent = resolved.word;
      popoverTrans.textContent = resolved.transcription ? `/${resolved.transcription.replace(/^\/|\/$/g, '')}/` : '';
      popoverMeaning.textContent = resolved.translation || resolved.word;

      // Favorite button: check actual user favorites
      if (resolved.id) {
        popoverHeart.style.display = 'flex';
        const isFav = favSet.has(String(resolved.id));
        updateHeartVisual(isFav);
      } else {
        // Grammatical function words without dictionary IDs
        popoverHeart.style.display = 'none';
      }

      // Position popover floating over the word
      positionPopoverAboveToken(tokenEl);

      // Speak word audio
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
        updateHeartVisual(true);
        showStoryToast(strings.favAdded);
      } else {
        favSet.delete(wId);
        updateHeartVisual(false);
        showStoryToast(strings.favRemoved);
      }
    } catch (err) {
      console.warn('Favorite toggle error:', err);
    }
  });

  // Full translation toggle button with Rewarded Video Ad trigger
  toggleTranslationBtn.addEventListener('click', async () => {
    if (!isTranslationUnlocked) {
      toggleTranslationBtn.disabled = true;
      toggleTranslationBtn.style.opacity = '0.7';
      try {
        const adResult = await AdService.showStoryTranslationRewardedAd(storyTitleText);
        if (adResult && (adResult.success || adResult.rewardEarned)) {
          isTranslationUnlocked = true;
        } else {
          showStoryToast('📺 Посмотрите видео до конца, чтобы открыть перевод');
          toggleTranslationBtn.disabled = false;
          toggleTranslationBtn.style.opacity = '1';
          return;
        }
      } catch (adErr) {
        console.warn('Ad playback fallback:', adErr);
        isTranslationUnlocked = true;
      } finally {
        toggleTranslationBtn.disabled = false;
        toggleTranslationBtn.style.opacity = '1';
      }
    }

    isTranslationShown = !isTranslationShown;
    if (isTranslationShown) {
      translationBlock.style.display = 'block';
      translationBtnLabel.textContent = strings.btnHideTranslation;
      // Scroll to translation smoothly
      setTimeout(() => {
        translationBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    } else {
      translationBlock.style.display = 'none';
      translationBtnLabel.textContent = strings.btnShowTranslation;
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

  // Button: Understood (+25 XP)
  understoodBtn.addEventListener('click', () => {
    localStorage.setItem(`myduo_milestone_story_${currentMilestone}_completed`, 'true');
    localStorage.setItem(`myduo_milestone_story_${currentMilestone}_shown`, 'true');

    // Award +25 XP
    try {
      addWeeklyXP(25);
    } catch (e) {}

    showStoryToast(strings.xpAwarded);
    closeModal();
  });

  // Android hardware Back Button handler
  const handleAndroidBack = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', handleAndroidBack);
    }
  };
  window.addEventListener('keydown', handleAndroidBack);
}
