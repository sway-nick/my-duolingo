import { WIDGET_TRANSLATIONS } from './widgetTranslations.js?v=423.0';
import { isRtlLocale, SUPPORTED_LOCALES, SUPPORTED_LOCALE_CODES, isLocaleSupported } from '../config/locales.js?v=423.0';

export { SUPPORTED_LOCALES, SUPPORTED_LOCALE_CODES, isLocaleSupported };

const translations = {};
const _localeLoadPromises = new Map();

function normalizeLocaleCode(lang) {
  if (!lang || typeof lang !== 'string') return '';
  const lower = lang.trim().toLowerCase();
  const base = lower.startsWith('zh') ? 'zh' : lower.split(/[-_]/)[0];
  return isLocaleSupported(base) ? base : '';
}

function loadLocaleSyncInNode(lang) {
  const code = normalizeLocaleCode(lang) || 'ru';
  if (translations[code]) return translations[code];
  if (typeof process === 'undefined' || !process.versions || !process.versions.node || typeof process.getBuiltinModule !== 'function') {
    return null;
  }
  try {
    const fs = process.getBuiltinModule('node:fs');
    const path = process.getBuiltinModule('node:path');
    const url = process.getBuiltinModule('node:url');
    if (!fs || !path || !url) return null;
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const shardPath = path.join(__dirname, '..', 'assets', 'data', 'i18n_lang', `${code}.json`);
    if (!fs.existsSync(shardPath)) return null;
    const parsed = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
    if (parsed && typeof parsed === 'object') {
      translations[code] = parsed;
      return parsed;
    }
  } catch (e) {}
  return null;
}

export async function ensureLocaleLoaded(lang) {
  const code = normalizeLocaleCode(lang) || 'ru';
  if (translations[code]) return translations[code];

  const nodeDict = loadLocaleSyncInNode(code);
  if (nodeDict) return nodeDict;

  if (_localeLoadPromises.has(code)) {
    return _localeLoadPromises.get(code);
  }

  const loadPromise = (async () => {
    const candidates = [
      `./assets/data/i18n_lang/${code}.json?v=423.0`,
      `assets/data/i18n_lang/${code}.json?v=423.0`,
      `/assets/data/i18n_lang/${code}.json?v=423.0`,
    ];
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (res && res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            translations[code] = data;
            return data;
          }
        }
      } catch (e) {}
    }

    for (const fb of ['en', 'ru']) {
      if (fb === code) continue;
      if (translations[fb]) return translations[fb];
      const fbCandidates = [
        `./assets/data/i18n_lang/${fb}.json?v=423.0`,
        `assets/data/i18n_lang/${fb}.json?v=423.0`,
        `/assets/data/i18n_lang/${fb}.json?v=423.0`,
      ];
      for (const url of fbCandidates) {
        try {
          const res = await fetch(url);
          if (res && res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object') {
              translations[fb] = data;
              return data;
            }
          }
        } catch (e) {}
      }
    }
    return null;
  })().finally(() => {
    _localeLoadPromises.delete(code);
  });

  _localeLoadPromises.set(code, loadPromise);
  return loadPromise;
}

export function getInterfaceLanguage() {
  if (typeof localStorage === 'undefined') return 'ru';

  // 1. Explicit user choice or saved setting in localStorage always takes precedence
  try {
    const saved = localStorage.getItem('myduo_interface_lang');
    const code = normalizeLocaleCode(saved);
    if (code && isLocaleSupported(code)) {
      return code;
    }
  } catch (e) {}

  // 2. Check previously detected system language
  try {
    const detected = localStorage.getItem('myduo_detected_lang');
    const code = normalizeLocaleCode(detected);
    if (code && isLocaleSupported(code)) {
      return code;
    }
  } catch (e) {}

  // 3. Native Android system language check (most reliable on Android devices)
  try {
    if (typeof window !== 'undefined' && window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.getSystemLanguage === 'function') {
      const nativeLang = window.AndroidWidgetBridge.getSystemLanguage();
      const code = normalizeLocaleCode(nativeLang);
      if (code && isLocaleSupported(code)) {
        try {
          localStorage.setItem('myduo_detected_lang', code);
        } catch (err) {}
        return code;
      }
    }
  } catch (e) {}

  // 4. Detect system language from navigator
  try {
    const navLangs = (typeof navigator !== 'undefined' && Array.isArray(navigator.languages) && navigator.languages.length > 0)
      ? navigator.languages
      : (typeof navigator !== 'undefined' ? [navigator.language || navigator.userLanguage] : []);

    for (const rawLang of navLangs) {
      if (!rawLang || typeof rawLang !== 'string') continue;
      const code = normalizeLocaleCode(rawLang);
      if (code && isLocaleSupported(code)) {
        try {
          localStorage.setItem('myduo_detected_lang', code);
        } catch (err) {}
        return code;
      }
    }
  } catch (e) {
    console.warn('System language detection failed:', e);
  }

  // 5. Default to Russian for English Breakfast app
  return 'ru';
}


export function applyInterfaceDirection(lang) {
  if (typeof document !== 'undefined' && document.documentElement) {
    if (isRtlLocale(lang)) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.classList.add('is-rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang || 'en');
      document.documentElement.classList.remove('is-rtl');
    }
  }
}

// Immediately apply direction on script initialization
if (typeof document !== 'undefined') {
  try {
    applyInterfaceDirection(getInterfaceLanguage());
  } catch (e) {}
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('myduo:lang_changed', () => {
    try {
      applyInterfaceDirection(getInterfaceLanguage());
    } catch (e) {}
  });
}

export function setInterfaceLanguage(lang) {
  if (!lang) return;
  const code = normalizeLocaleCode(lang) || lang;
  try {
    localStorage.setItem('myduo_lang_manual', 'true');
    localStorage.setItem('myduo_interface_lang', code);
  } catch (e) {}
  applyInterfaceDirection(code);
  if (!translations[code]) {
    loadLocaleSyncInNode(code);
  }
  if (translations[code]) {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('myduo:lang_changed'));
    }
  } else {
    ensureLocaleLoaded(code)
      .then(() => {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new Event('myduo:lang_changed'));
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new Event('myduo:lang_changed'));
        }
      });
  }
}

export const SPEECH_PROMPTS = {
  listening: {
    ru: 'Слушаю! Говорите...',
    uk: 'Слухаю! Говоріть...',
    en: 'Listening! Speak now...',
    de: 'Höre zu! Jetzt sprechen...',
    es: '¡Escuchando! Habla ahora...',
    fr: "À l'écoute ! Parlez maintenant...",
    pl: 'Słucham! Mów teraz...',
    it: 'In ascolto! Parla ora...',
    tr: 'Dinliyorum! Şimdi konuşun...',
    pt: 'Ouvindo! Fale agora...',
    ro: 'Ascult! Vorbiți acum...',
    bg: 'Слушам! Говорете сега...',
    cs: 'Poslouchám! Mluvte...',
    sk: 'Počúvam! Hovorte...',
    hu: 'Hallgatom! Beszéljen most...',
    el: 'Ακούω! Μιλήστε τώρα...',
    sl: 'Poslušam! Govorite zdaj...',
    et: 'Kuulan! Rääkige nüüd...',
    lt: 'Klausau! Kalbėkite dabar...',
    da: "Lytter! Tal nu...",
    lv: "Klausos! Runājiet tagad...",
    fi: "Kuuntelen! Puhu nyt...",
    hr: "Slušam! Govorite sada...",
    sv: "Lyssnar! Tala nu...",
    hi: 'सुन रहा हूँ! अब बोलिए...',
    bn: 'শুনছি! এখন বলুন...',
    ar: 'أستمع! تحدث الآن...',
    fa: 'گوش می‌دهم! اکنون صحبت کنید...',
    ur: 'سن رہا ہوں! اب بولیں...',
    id: 'Mendengarkan! Bicara sekarang...',
    vi: 'Đang nghe! Hãy nói ngay...',
    th: 'กำลังฟัง! พูดเลย...',
    ko: '듣고 있어요! 지금 말하세요...',
    ja: '聞いています！今話してください...',
    zh: '正在聆听！请说话...',
    kk: 'Тыңдап тұрмын! Сөйлеңіз...'
  },
  evaluating: {
    ru: 'AI оценивает произношение...',
    uk: 'AI оцінює вимову...',
    en: 'AI is evaluating pronunciation...',
    de: 'KI bewertet die Aussprache...',
    es: 'La IA evalúa la pronunciación...',
    fr: "L'IA évalue la prononciation...",
    pl: 'AI ocenia wymowę...',
    it: "L'IA valuta la pronuncia...",
    tr: 'Yapay zeka telaffuzu değerlendiriyor...',
    pt: 'A IA está avaliando a pronúncia...',
    ro: 'IA evaluează pronunția...',
    bg: 'ИИ оценява произношението...',
    cs: 'AI hodnotí výslovnost...',
    sk: 'AI hodnotí výslovnosť...',
    hu: 'Az AI értékeli a kiejtést...',
    el: 'Η τεχνητή νοημοσύνη αξιολογεί την προφορά...',
    sl: 'UI ocenjuje izgovorjavo...',
    et: 'Tehisintellekt hindab hääldust...',
    lt: 'DI vertina tarimą...',
    da: "AI vurderer udtalen...",
    lv: "AI novērtē izrunu...",
    fi: "Tekoäly arvioi ääntämistä...",
    hr: "AI procjenjuje izgovor...",
    sv: "AI bedömer uttalet...",
    hi: 'एआई उच्चारण का मूल्यांकन कर रहा है...',
    bn: 'AI উচ্চারণ মূল্যায়ন করছে...',
    ar: 'الذكاء الاصطناعي يقيّم النطق...',
    fa: 'هوش مصنوعی در حال ارزیابی تلفظ است...',
    ur: 'AI تلفظ کا جائزہ لے رہا ہے...',
    id: 'AI sedang mengevaluasi pengucapan...',
    vi: 'AI đang đánh giá phát âm...',
    th: 'AI กำลังประเมินการออกเสียง...',
    ko: 'AI가 발음을 평가하고 있습니다...',
    ja: 'AIが発音を評価しています...',
    zh: 'AI 正在评估发音...',
    kk: 'ЖИ айтылуды бағалауда...'
  },
  retry: {
    ru: 'Голос не распознан. Нажмите 🎙️ для повтора',
    uk: 'Голос не розпізнано. Натисніть 🎙️ для повтору',
    en: 'Voice not recognized. Tap 🎙️ to retry',
    de: 'Stimme nicht erkannt. 🎙️ zum Wiederholen tippen',
    es: 'Voz no reconocida. Toca 🎙️ para reintentar',
    fr: 'Voix non reconnue. Appuyez sur 🎙️ pour réessayer',
    pl: 'Nie rozpoznano głosu. Dotknij 🎙️, aby ponowić',
    it: 'Voce non riconosciuta. Tocca 🎙️ per riprovare',
    tr: 'Ses tanınmadı. Tekrar denemek için 🎙️ dokunun',
    pt: 'Voz não reconhecida. Toque em 🎙️ para tentar de novo',
    ro: 'Voce nerecunoscută. Atingeți 🎙️ pentru a reîncerca',
    bg: 'Гласът не е разпознат. Натиснете 🎙️ за повторение',
    cs: 'Hlas nerozpoznán. Klepněte na 🎙️ pro opakování',
    sk: 'Hlas nebol rozpoznaný. Klepnite na 🎙️ pre opakovanie',
    hu: 'Nem sikerült felismerni a hangot. Koppintson a 🎙️ gombra',
    el: 'Η φωνή δεν αναγνωρίστηκε. Πατήστε 🎙️ για επανάληψη',
    sl: 'Glas ni bil prepoznan. Tapnite 🎙️ za ponovni poskus',
    et: 'Häält ei tuvastatud. Puudutage 🎙️ uuesti proovimiseks',
    lt: 'Balsas neatpažintas. Bakstelėkite 🎙️, kad pakartotumėte',
    da: "Ingen stemme genkendt. Tryk på 🎙️ for at prøve igen",
    lv: "Balss nav atpazīta. Pieskarieties 🎙️, lai mēģinātu vēlreiz",
    fi: "Ääntä ei tunnistettu. Napauta 🎙️ yrittääksesi uudelleen",
    hr: "Glas nije prepoznat. Dodirnite 🎙️ za ponovni pokušaj",
    sv: "Röst kändes inte igen. Tryck på 🎙️ för att försöka igen",
    hi: 'आवाज पहचानी नहीं गई। पुनः प्रयास करने के लिए 🎙️ दबाएं',
    bn: 'কণ্ঠস্বর চেনা যায়নি। আবার চেষ্টা করতে 🎙️ চাপুন',
    ar: 'لم يتم التعرف على الصوت. اضغط على 🎙️ للمحاولة مرة أخرى',
    fa: 'صدا تشخیص داده نشد. برای تلاش مجدد روی 🎙️ بزنید',
    ur: 'آواز کی شناخت نہیں ہو سکی۔ دوبارہ کوشش کے لیے 🎙️ دبائیں',
    id: 'Suara tidak dikenali. Ketuk 🎙️ untuk coba lagi',
    vi: 'Không nhận dạng được giọng nói. Nhấn 🎙️ để thử lại',
    th: 'ไม่รู้จักเสียง กด 🎙️ เพื่อลองใหม่',
    ko: '음성을 인식하지 못했습니다. 🎙️를 눌러 다시 시도하세요',
    ja: '音声を認識できませんでした。🎙️をタップしてやり直してください',
    zh: '未识别到语音，请点击 🎙️ 重试',
    kk: 'Дауыс танылмады. Қайталау үшін 🎙️ басыңыз'
  },
  tap_to_speak: {
    ru: 'Нажмите на микрофон и скажите слово',
    uk: 'Натисніть на мікрофон і скажіть слово',
    en: 'Tap the microphone and say the word',
    de: 'Tippen Sie auf das Mikrofon und sprechen Sie das Wort',
    es: 'Toca el micrófono y di la palabra',
    fr: 'Appuyez sur le micro et prononcez le mot',
    pl: 'Dotknij mikrofonu i powiedz słowo',
    it: 'Tocca il microfono e pronuncia la parola',
    tr: 'Mikrofona dokunun ve kelimeyi söyleyin',
    pt: 'Toque no microfone e diga a palavra',
    ro: 'Atingeți microfonul și rostiți cuvântul',
    bg: 'Натиснете микрофона и кажете думата',
    cs: 'Klepněte na mikrofon a řekněte slovo',
    sk: 'Klepnite na mikrofón a povedzte slovo',
    hu: 'Koppintson a mikrofonra és mondja ki a szót',
    el: 'Πατήστε το μικρόφωνο και πείτε τη λέξη',
    sl: 'Tapnite mikrofon in izgovorite besedo',
    et: 'Puudutage mikrofoni ja öelge sõna',
    lt: 'Bakstelėkite mikrofoną ir ištarkite žodį',
    da: "Tryk på mikrofonen og sig ordet",
    lv: "Pieskarieties mikrofonam un pasakiet vārdu",
    fi: "Napauta mikrofonia ja sano sana",
    hr: "Dodirnite mikrofon i izgovorite riječ",
    sv: "Tryck på mikrofonen och säg ordet",
    hi: 'माइक्रोफ़ोन पर टैप करें और शब्द बोलें',
    bn: 'মাইক্রোফোনে ট্যাপ করুন এবং শব্দটি বলুন',
    ar: 'اضغط على الميكروفون وانطق الكلمة',
    fa: 'روی میکروفون بزنید و کلمه را بگویید',
    ur: 'مائیکروفون پر ٹیپ کریں اور لفظ بولیں',
    id: 'Ketuk mikrofon dan ucapkan katanya',
    vi: 'Nhấn vào micrô và nói từ',
    th: 'แตะไมโครโฟนแล้วพูดคำศัพท์',
    ko: '마이크를 탭하고 단어를 말하세요',
    ja: 'マイクをタップして単語を話してください',
    zh: '点击麦克风并说出单词',
    kk: 'Микрофонды басып, сөзді айтыңыз'
  },
  review_repeat: {
    ru: 'Повторить',
    uk: 'Повторити',
    en: 'Repeat',
    de: 'Wiederholen',
    es: 'Repetir',
    fr: 'Répéter',
    pl: 'Powtórz',
    it: 'Ripeti',
    tr: 'Tekrar et',
    pt: 'Repetir',
    ro: 'Repetă',
    bg: 'Повтори',
    cs: 'Opakovat',
    sk: 'Opakovať',
    hu: 'Ismétlés',
    el: 'Επανάληψη',
    sl: 'Ponovi',
    et: 'Korda',
    lt: 'Pakartoti',
    da: "Gentag (1-3)",
    lv: "Atkārtot (1-3)",
    fi: "Kertaa (1-3)",
    hr: "Ponovi (1-3)",
    sv: "Repetera (1-3)",
    hi: 'दोहराएं (1-3)',
    bn: 'পুনরাবৃত্তি',
    ar: 'تكرار',
    fa: 'تکرار',
    ur: 'دہرائیں',
    id: 'Ulangi (1-3)',
    vi: 'Lặp lại (1-3)',
    th: 'ทำซ้ำ (1-3)',
    ko: '복습하기',
    ja: '復習 (1-3)',
    zh: '重复复习',
    kk: 'Қайталау'
  },
  review_know: {
    ru: 'Знаю',
    uk: 'Знаю',
    en: 'I know',
    de: 'Ich weiß',
    es: 'Lo sé',
    fr: 'Je sais',
    pl: 'Znam',
    it: 'Lo so',
    tr: 'Biliyorum',
    pt: 'Eu sei',
    ro: 'Știu',
    bg: 'Знам',
    cs: 'Vím',
    sk: 'Viem',
    hu: 'Tudom',
    el: 'Το ξέρω',
    sl: 'Vem',
    et: 'Tean',
    lt: 'Žinau',
    da: "Ved (4-5)",
    lv: "Zinu (4-5)",
    fi: "Tiedän (4-5)",
    hr: "Znam (4-5)",
    sv: "Vet (4-5)",
    hi: 'मुझे पता है (4-5)',
    bn: 'আমি জানি',
    ar: 'أعرف',
    fa: 'می‌دانم',
    ur: 'میں جانتا ہوں',
    id: 'Tahu (4-5)',
    vi: 'Đã biết (4-5)',
    th: 'รู้แล้ว (4-5)',
    ko: '알아요',
    ja: '知っている (4-5)',
    zh: '已掌握',
    kk: 'Білемін'
  },
};

export function getSpeechPrompt(type = 'listening') {
  const lang = getInterfaceLanguage();
  const bundle = SPEECH_PROMPTS[type] || SPEECH_PROMPTS['listening'];
  return bundle[lang] || bundle['en'] || bundle['ru'];
}

export function t(key, params = null) {
  let val = '';
  const lang = getInterfaceLanguage();

  if (typeof WIDGET_TRANSLATIONS !== 'undefined' && WIDGET_TRANSLATIONS) {
    if (WIDGET_TRANSLATIONS[lang] && typeof WIDGET_TRANSLATIONS[lang][key] === 'string') {
      return WIDGET_TRANSLATIONS[lang][key];
    }
    if (WIDGET_TRANSLATIONS['en'] && typeof WIDGET_TRANSLATIONS['en'][key] === 'string') {
      return WIDGET_TRANSLATIONS['en'][key];
    }
  }

  if (!translations[lang]) {
    loadLocaleSyncInNode(lang);
  }
  if (!translations['en']) {
    loadLocaleSyncInNode('en');
  }
  const dict = translations[lang] || translations['en'];

  if (dict && typeof dict[key] === 'string' && dict[key].length > 0) {
    val = dict[key];
  } else if (key === 'speech_listening') {
    val = getSpeechPrompt('listening');
  } else if (key === 'speech_evaluating') {
    val = getSpeechPrompt('evaluating');
  } else if (key === 'speech_not_recognized') {
    val = getSpeechPrompt('retry');
  } else if (key === 'speech_tap_to_speak') {
    val = getSpeechPrompt('tap_to_speak');
  } else if (key === 'review_repeat') {
    val = getSpeechPrompt('review_repeat');
  } else if (key === 'review_know') {
    val = getSpeechPrompt('review_know');
  } else if (key === 'fav_autoplay_listen') {
    const map = {
      ru: "Слушать", uk: "Слухати", en: "Listen", de: "Anhören", es: "Escuchar",
      fr: "Écouter", pl: "Słuchaj", tr: "Dinle", it: "Ascolta", ro: "Ascultă",
      bg: "Слушай", hu: "Hallgatás", el: "Ακούστε", da: "Lyt",
      lv: "Klausīties", lt: "Klausytis", pt: "Ouvir", sk: "Počúvať",
      sl: "Poslušaj", fi: "Kuuntele", hr: "Slušaj", cs: "Poslouchat", sv: "Lyssna",
      et: "Kuula", hi: "सुनें", bn: "শুনুন", ar: "استماع", fa: "گوش دادن", ur: "سنیں",
      id: "Dengarkan", vi: "Nghe", th: "ฟัง", ko: "듣기", ja: "再生", zh: "收听", kk: "Тыңдау"
    };
    val = map[lang] || map['en'] || "Listen";
  } else if (key === 'fav_autoplay_stop') {
    const map = {
      ru: "Пауза", uk: "Пауза", en: "Stop", de: "Stopp", es: "Parar",
      fr: "Arrêter", pl: "Stop", tr: "Durdur", it: "Stop", ro: "Stop",
      bg: "Стоп", hu: "Állj", el: "Διακοπή", da: "Stop",
      lv: "Apturēt", lt: "Sustabdyti", pt: "Parar", sk: "Stop",
      sl: "Ustavi", fi: "Pysäytä", hr: "Stop", cs: "Stop", sv: "Stopp",
      et: "Peata", hi: "रोकें", bn: "থামান", ar: "إيقاف", fa: "توقف", ur: "روکیں",
      id: "Berhenti", vi: "Dừng", th: "หยุด", ko: "정지", ja: "停止", zh: "暂停", kk: "Тоқтату"
    };
    val = map[lang] || map['en'] || "Stop";
  } else if (key === 'conveyor_in_learning') {
    const map = {
      ru: "В изучении {current}/{total}",
      uk: "У вивченні {current}/{total}",
      en: "In learning {current}/{total}",
      de: "Beim Lernen {current}/{total}",
      es: "En aprendizaje {current}/{total}",
      fr: "En apprentissage {current}/{total}",
      it: "In apprendimento {current}/{total}",
      pl: "W nauce {current}/{total}",
      pt: "Em aprendizagem {current}/{total}",
      tr: "Öğrenimde {current}/{total}",
      ro: "În învățare {current}/{total}",
      bg: "В обучение {current}/{total}",
      cs: "V učení {current}/{total}",
      sk: "V učení {current}/{total}",
      hu: "Tanulásban {current}/{total}",
      el: "Σε μάθηση {current}/{total}",
      sl: "V učenju {current}/{total}",
      et: "Õppimisel {current}/{total}",
      lt: "Mokomasi {current}/{total}",
      lv: "Mācībās {current}/{total}",
      da: "I læring {current}/{total}",
      fi: "Opiskelussa {current}/{total}",
      sv: "I inlärning {current}/{total}",
      hr: "U učenju {current}/{total}",
      hi: "सीखने में {current}/{total}",
      bn: "শেখা হচ্ছে {current}/{total}",
      ar: "قيد التعلم {current}/{total}",
      fa: "در حال یادگیری {current}/{total}",
      ur: "سیکھنے میں {current}/{total}",
      id: "Sedang dipelajari {current}/{total}",
      vi: "Đang học {current}/{total}",
      th: "กำลังเรียนรู้ {current}/{total}",
      ko: "학습 중 {current}/{total}",
      ja: "学習中 {current}/{total}",
      zh: "学习中 {current}/{total}",
      kk: "Үйренуде {current}/{total}"
    };
    val = map[lang] || map['en'] || "In learning {current}/{total}";
  } else if (key === 'sound_on') {
    const map = {
      ru: "Озвучить слово", uk: "Озвучити слово", en: "Pronounce word", de: "Wort anhören",
      es: "Pronunciar palabra", fr: "Prononcer le mot", pl: "Wymów słowo", it: "Pronuncia parola",
      tr: "Kelimeyi seslendir", pt: "Pronunciar palavra", ro: "Pronunță cuvântul", bg: "Произнеси думата",
      cs: "Vyslovit slovo", sk: "Vysloviť slovo", hu: "Szó kiejtése", el: "Προφορά λέξης",
      da: "Udtal ord", lv: "Izrunāt vārdu", lt: "Ištarti žodį", sl: "Izgovori besedo",
      fi: "Lausu sana", hr: "Izgovori riječ", sv: "Uttala ord", et: "Häälda sõna",
      hi: "शब्द का उच्चारण करें", bn: "শব্দটি উচ্চারণ করুন", ar: "نطق الكلمة", fa: "تلفظ کلمه",
      ur: "لفظ کا تلفظ سنیں", id: "Ucapkan kata", vi: "Phát âm từ",
      th: "ออกเสียงคำ", ko: "단어 발음 듣기", ja: "単語を発音する", zh: "朗读单词", kk: "Сөзді дыбыстау"
    };
    val = map[lang] || map['en'] || "Pronounce word";
  } else if (key === 'train_blocks_badge') {
    const map = {
      ru: "Кубики", uk: "Кубики", en: "Blocks", de: "Bausteine",
      es: "Bloques", fr: "Blocs", pl: "Klocki", tr: "Bloklar",
      it: "Blocchi", ro: "Blocuri", bg: "Кубчета", hu: "Kockák",
      el: "Κύβοι", da: "Brikker", lv: "Klucīši", lt: "Kaladėlės",
      pt: "Blocos", sk: "Kocky", sl: "Kocke", fi: "Palat",
      hr: "Kockice", cs: "Kostky", sv: "Klossar", et: "Klotsid",
      hi: "ब्लॉक", bn: "ব্লক", ar: "مكعبات", fa: "مکعب‌ها",
      ur: "بلاکس", id: "Balok", vi: "Khối", th: "บล็อก",
      ko: "블록", ja: "ブロック", zh: "积木", kk: "Текшелер"
    };
    val = map[lang] || map['en'] || "Blocks";
  } else if (key === 'train_blocks_hint') {
    const map = {
      ru: "Соберите слово из кубиков", uk: "Зберіть слово з кубиків", en: "Assemble the word from blocks",
      de: "Bilde das Wort aus den Bausteinen", es: "Arma la palabra con los bloques", fr: "Assemblez le mot avec les blocs",
      pl: "Ułóż słowo z klocków", tr: "Kelimeyi bloklardan oluşturun", it: "Componi la parola con i blocchi",
      ro: "Formează cuvântul din blocuri", bg: "Сглобете думата от кубчета", hu: "Rakd ki a szót a kockákból",
      el: "Συναρμολογήστε τη λέξη από τους κύβους", da: "Saml ordet fra brikkerne", lv: "Salieciet vārdu no klucīšiem",
      lt: "Sudėkite žodį iš kaladėlių", pt: "Monte a palavra com os blocos", sk: "Zložte slovo z kociek",
      sl: "Sestavite besedo iz kock", fi: "Kokoa sana paloista", hr: "Sastavite riječ od kockica",
      cs: "Sestavte slovo z kostek", sv: "Bygg ordet från klossarna", et: "Pange sõna klotsidest kokku",
      hi: "ब्लॉक से शब्द बनाएं", bn: "ব্লক দিয়ে শব্দটি তৈরি করুন", ar: "قم بتجميع الكلمة من المكعبات",
      fa: "کلمه را از مکعب‌ها بسازید", ur: "بلاکس سے لفظ بنائیں", id: "Susun kata dari balok",
      vi: "Ghép từ các khối", th: "ประกอบคำจากบล็อก", ko: "블록으로 단어를 완성하세요",
      ja: "ブロックから単語を組み立ててください", zh: "用积木拼出单词", kk: "Сөзді текшелерден құрастырыңыз"
    };
    val = map[lang] || map['en'] || "Assemble the word from blocks";
  } else if (key === 'ad_loading' || key === 'common_loading') {
    const map = {
      ru: "Загрузка", uk: "Завантаження", en: "Loading", de: "Laden",
      es: "Cargando", fr: "Chargement", pl: "Ładowanie", tr: "Yükleniyor",
      it: "Caricamento", ro: "Încărcare", bg: "Зареждане", hu: "Betöltés",
      el: "Φόρτωση", da: "Indlæser", lv: "Ielāde", lt: "Įkeliama",
      pt: "Carregando", sk: "Načítava sa", sl: "Nalaganje", fi: "Ladataan",
      hr: "Učitavanje", cs: "Načítání", sv: "Laddar", et: "Laadimine",
      hi: "लोड हो रहा है", bn: "লোড হচ্ছে", ar: "جارٍ التحميل", fa: "در حال بارگذاری",
      ur: "لوڈ ہو رہا ہے", id: "Memuat", vi: "Đang tải", th: "กำลังโหลด",
      ko: "로딩 중", ja: "読み込み中", zh: "加载中", kk: "Жүктелуде"
    };
    val = map[lang] || map['en'] || "Loading";
  } else if (key === 'fav_toggle') {
    const map = {
      ru: "В избранное", uk: "До обраного", en: "To favorites", de: "Zu Favoriten",
      es: "A favoritos", fr: "Aux favoris", pl: "Do ulubionych", it: "Ai preferiti",
      tr: "Favorilere", pt: "Aos favoritos", ro: "La favorite", bg: "Към любими",
      cs: "Do oblíbených", sk: "Do obľúbených", hu: "Kedvencekhez", el: "Στα αγαπημένα",
      da: "Til favoritter", lv: "Uz izlases", lt: "Į mėgstamiausius", sl: "Med priljubljene",
      fi: "Suosikkeihin", hr: "U favorite", sv: "Till favoriter", et: "Lemmikutesse",
      hi: "पसंदीदा में जोड़ें", bn: "পছন্দে যোগ করুন", ar: "إلى المفضلة", fa: "افزودن به علاقه‌مندی‌ها",
      ur: "پسندیدہ میں شامل کریں", id: "Ke favorit", vi: "Vào mục yêu thích",
      th: "เพิ่มในรายการโปรด", ko: "즐겨찾기에 추가", ja: "お気に入りへ", zh: "加入收藏", kk: "Таңдаулыға қосу"
    };
    val = map[lang] || map['en'] || "To favorites";
  } else if (key === 'modal_close') {
    const map = {
      ru: 'Закрыть', uk: 'Закрити', en: 'Close', de: 'Schließen', es: 'Cerrar',
      fr: 'Fermer', pl: 'Zamknij', tr: 'Kapat', it: 'Chiudi', ro: 'Închide',
      bg: 'Затвори', hu: 'Bezárás', el: 'Κλείσιμο', da: 'Luk', lv: 'Aizvērt',
      lt: 'Uždaryti', pt: 'Fechar', sk: 'Zavrieť', sl: 'Zapri', fi: 'Sulje',
      hr: 'Zatvori', cs: 'Zavřít', sv: 'Stäng', et: 'Sulge',
      hi: 'बंद करें', bn: 'বন্ধ করুন', ar: 'إغلاق', fa: 'بستن', ur: 'بند کریں',
      id: 'Tutup', vi: 'Đóng', th: 'ปิด', ko: '닫기', ja: '閉じる', zh: '关闭', kk: 'Жабу'
    };
    val = map[lang] || 'Close';
  } else if (key === 'word_notes_title') {
    const map = {
      ru: 'Примечание', uk: 'Примітка', en: 'Note', de: 'Hinweis', es: 'Nota',
      fr: 'Remarque', pl: 'Uwaga', tr: 'Not', it: 'Nota', ro: 'Notă',
      bg: 'Бележка', hu: 'Megjegyzés', el: 'Σημείωση', da: 'Bemærkning', lv: 'Piezīme',
      lt: 'Pastaba', pt: 'Nota', sk: 'Poznámka', sl: 'Opomba', fi: 'Huomautus',
      hr: 'Bilješka', cs: 'Poznámka', sv: 'Anteckning', et: 'Märkus',
      hi: 'टिप्पणी', bn: 'টীকা', ar: 'ملاحظة', fa: 'یادداشت', ur: 'نوٹ',
      id: 'Catatan', vi: 'Ghi chú', th: 'บันทึก', ko: '메모', ja: 'メモ', zh: '备注', kk: 'Ескертпе'
    };
    val = map[lang] || 'Note';
  } else {
    val = (translations['en'] && translations['en'][key]) || key;
  }

  if (params && typeof params === 'object' && typeof val === 'string') {
    val = val.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, prop) => {
      return Object.prototype.hasOwnProperty.call(params, prop) && params[prop] !== undefined && params[prop] !== null
        ? String(params[prop])
        : match;
    });
  }

  return val;
}

let _cachedWordOverridesRaw = null;
let _cachedWordOverridesMap = {};

/**
 * Returns the user's personal override ({ translation, translations, category, notes })
 * for a given word object from localStorage (`myduo_user_word_overrides`), if any.
 */
export function getUserWordOverride(wordObj) {
  if (!wordObj) return null;
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('myduo_user_word_overrides') || '';
      if (raw !== _cachedWordOverridesRaw) {
        _cachedWordOverridesRaw = raw;
        _cachedWordOverridesMap = raw ? JSON.parse(raw) : {};
      }
      if (_cachedWordOverridesMap && typeof _cachedWordOverridesMap === 'object') {
        const wId = wordObj.id ? String(wordObj.id) : '';
        const wText = wordObj.word ? String(wordObj.word).trim().toLowerCase() : '';
        const ov = (wId && _cachedWordOverridesMap[wId]) || (wText && _cachedWordOverridesMap[wText]);
        if (ov && typeof ov === 'object') return ov;
      }
    }
  } catch (e) {}
  return null;
}

export function getWordTranslation(wordObj, explicitLang) {
  if (!wordObj) return '';
  const lang = explicitLang || getInterfaceLanguage();
  const rawWord = String(wordObj.word || '').trim().toLowerCase();

  const isInvalidTranslation = (val) => {
    if (!val || typeof val !== 'string') return true;
    const clean = val.trim().toLowerCase();
    if (clean.includes('\ufffd')) return true;
    if (rawWord && clean === rawWord) return true;
    return false;
  };

  // 0. Personal user translation override (strictly per-user)
  const personalOverride = getUserWordOverride(wordObj);
  if (personalOverride) {
    const ovLangTrans = personalOverride.translations && personalOverride.translations[lang];
    if (typeof ovLangTrans === 'string' && ovLangTrans.trim() && !ovLangTrans.includes('\ufffd')) {
      return ovLangTrans.trim();
    }
    if (!personalOverride.translations && typeof personalOverride.translation === 'string' && personalOverride.translation.trim() && !personalOverride.translation.includes('\ufffd')) {
      return personalOverride.translation.trim();
    }
  }
  if (wordObj.user_translations && typeof wordObj.user_translations[lang] === 'string' && wordObj.user_translations[lang].trim() && !wordObj.user_translations[lang].includes('\ufffd')) {
    return wordObj.user_translations[lang].trim();
  }
  if (!wordObj.user_translations && typeof wordObj.user_translation === 'string' && wordObj.user_translation.trim() && !wordObj.user_translation.includes('\ufffd')) {
    return wordObj.user_translation.trim();
  }

  // 1. Localized translation for active interface language
  if (wordObj.translations && wordObj.translations[lang]) {
    const localized = wordObj.translations[lang];
    if (!isInvalidTranslation(localized)) {
      return localized;
    }
  }

  // 2. Base translation field: for Russian and English interface, or custom user-created words
  if ((lang === 'ru' || lang === 'en' || String(wordObj.id || '').startsWith('custom_')) && typeof wordObj.translation === 'string' && !isInvalidTranslation(wordObj.translation)) {
    return wordObj.translation;
  }

  // 3. Fallback: check Russian translation ONLY for Russian interface
  if (wordObj.translations && typeof wordObj.translations === 'object') {
    if (lang === 'ru' && wordObj.translations.ru && !isInvalidTranslation(wordObj.translations.ru)) {
      return wordObj.translations.ru;
    }
  }

  // 4. Default: return empty string so callers can handle cleanly without Russian/English bleeding
  return '';
}

let _cachedUserNotesRaw = null;
let _cachedUserNotesObj = {};

const IT_TERM_WORD_KEYS_SET = new Set([
  "abstraction", "accuracy", "affordance", "aggregation", "agile", "algorithm", "alignment",
  "analytics", "anomaly", "architecture", "argument", "array", "assessment", "asset",
  "asynchronous", "attribution", "authentication", "authorization", "avatar", "backend",
  "backlog", "badge", "banner", "benchmark", "blocker", "boilerplate", "bottleneck",
  "branch", "breakpoint", "bug", "burnout", "button", "cache", "candidate", "canvas",
  "capacity", "carousel", "challenge", "checkout", "churn", "classification", "client",
  "cohort", "commit", "compensation", "compiler", "concurrency", "container", "contrast",
  "conversion", "correlation", "dashboard", "database", "dataset", "deadline", "debugger",
  "deliverable", "dependency", "deploy", "deployment", "deprecated", "dimension", "dropdown",
  "encapsulation", "endpoint", "environment", "epic", "estimation", "event", "exception",
  "experience", "feature", "feedback", "firewall", "font", "footer", "framework", "frontend",
  "fullstack", "funnel", "gateway", "gradient", "grid", "header", "hierarchy", "hotfix",
  "hypothesis", "icon", "impediment", "incident", "index", "inference", "inheritance",
  "interaction", "interface", "interpreter", "interview", "issue", "kanban", "lakehouse",
  "latency", "layout", "legacy", "library", "logging", "metric", "microservice", "middleware",
  "migration", "milestone", "mockup", "modal", "model", "module", "monolith", "navigation",
  "offer", "onboarding", "package", "palette", "parameter", "patch", "payload", "pipeline",
  "polymorphism", "popup", "postmortem", "precision", "prediction", "probation", "production",
  "promotion", "protocol", "prototype", "proxy", "query", "queue", "recall", "recruiter",
  "refactor", "regression", "repository", "requirement", "resolution", "responsive",
  "retention", "retrospective", "roadmap", "rollback", "runtime", "salary", "scaffolding",
  "schema", "scrum", "security", "segmentation", "server", "serverless", "sidebar", "slider",
  "spacing", "sprint", "stack", "staging", "stakeholder", "standup", "streaming",
  "synchronous", "syntax", "telemetry", "throughput", "thumbnail", "ticket", "toggle",
  "tooltip", "trade-off", "typography", "usability", "vector", "velocity", "version",
  "viewport", "vulnerability", "warehouse", "waterfall", "whitespace", "wireframe"
]);

export function isItTermWord(wordObj) {
  if (!wordObj) return false;
  if (wordObj.it_note === true || String(wordObj.category || '').trim() === 'IT') return true;
  const wText = wordObj.word ? String(wordObj.word).toLowerCase().trim() : '';
  return Boolean(wText && IT_TERM_WORD_KEYS_SET.has(wText));
}

const FINANCE_TERM_WORD_KEYS_SET = new Set([
  "account", "allowance", "atm", "balance", "bank", "banknote", "bargain", "bill",
  "bonus", "borrow", "budget", "cash", "cashback", "charge", "check", "coin",
  "commission", "credit card", "consumer", "contract", "cost", "credit", "currency", "customer",
  "debit", "debt", "deposit", "discount", "donate", "earn", "economy", "expense",
  "fee", "finance", "fine", "fund", "grant", "guarantee", "income", "installment",
  "insurance", "interest", "invest", "invoice", "lend", "loan", "loss", "market",
  "money", "mortgage", "overdraft", "owe", "pay", "paycheck", "payment", "payroll",
  "pension", "percent", "pin", "poverty", "price", "profit", "purchase", "quote",
  "rate", "receipt", "refund", "rent", "repay", "retail", "sale", "save",
  "savings", "spend", "statement", "tax", "transfer", "wage", "wealth", "withdrawal",
  "accounting", "acquisition", "allocation", "amortization", "annuity", "appraisal", "arbitrage", "arrears",
  "auction", "audit", "bailout", "bankruptcy", "bear market", "beneficiary", "bid", "bond",
  "boom", "broker", "brokerage", "bull market", "buyout", "capital", "cash flow", "central bank",
  "clearing", "collateral", "commodity", "compliance", "compound interest", "consolidation", "corporate", "coupon",
  "credit score", "creditor", "crisis", "crowdfunding", "cryptocurrency", "customs", "debtor", "default",
  "deficit", "deflation", "depreciation", "derivative", "devaluation", "diversification", "dividend", "downturn",
  "duty", "earnings", "enterprise", "equity", "escrow", "estate", "exchange", "exchange rate",
  "excise", "expenditure", "export", "fiscal", "fixed income", "fluctuation", "forecast", "forex",
  "franchise", "fraud", "futures", "gdp", "gross", "growth", "guarantor", "hedge",
  "import", "inflation", "insolvency", "interest rate", "inventory", "investment", "investor", "ipo",
  "ledger", "leverage", "liability", "liquidation", "liquidity", "margin", "maturity", "merger",
  "monetary", "monopoly", "mutual fund", "net", "net worth", "option", "overhead", "portfolio",
  "premium", "principal", "recession", "remittance", "reserve", "return", "revenue", "risk",
  "royalty", "share", "shareholder", "solvency", "speculation", "spread", "stimulus", "stock",
  "subsidy", "surplus", "tariff", "taxation", "treasury", "turnover", "valuation", "venture capital"
]);

export function isFinanceTermWord(wordObj) {
  if (!wordObj) return false;
  if (wordObj.finance_note === true || String(wordObj.category || '').trim() === 'Finance') return true;
  const wText = wordObj.word ? String(wordObj.word).toLowerCase().trim() : '';
  return Boolean(wText && FINANCE_TERM_WORD_KEYS_SET.has(wText));
}

export function getWordNotes(wordObj, explicitLang, options = {}) {
  if (!wordObj) return '';

  // 1. Personal user note has highest priority (always shown even if hideItNotes is true)
  if (typeof wordObj.user_note === 'string' && wordObj.user_note.trim().length > 0) {
    return wordObj.user_note.trim();
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const rawNotes = localStorage.getItem('myduo_user_notes') || '{}';
      if (rawNotes !== _cachedUserNotesRaw) {
        _cachedUserNotesRaw = rawNotes;
        _cachedUserNotesObj = JSON.parse(rawNotes);
      }
      const userNotes = _cachedUserNotesObj;
      const wId = wordObj.id ? String(wordObj.id) : '';
      const wText = wordObj.word ? String(wordObj.word).toLowerCase().trim() : '';
      const personalNote = (wId && userNotes[wId]) || (wText && userNotes[wText]);
      if (personalNote && typeof personalNote === 'string' && personalNote.trim().length > 0) {
        return personalNote.trim();
      }
    } catch (e) {}
  }

  // 2. Isolate IT & Finance specialized collection notes from the general Dictionary and general Training
  const hideIt = Boolean(options && options.hideItNotes);
  const hideFinance = options && options.hideFinanceNotes !== undefined
    ? Boolean(options.hideFinanceNotes)
    : hideIt;
  if (hideIt && isItTermWord(wordObj)) {
    return '';
  }
  if (hideFinance && isFinanceTermWord(wordObj)) {
    return '';
  }

  const lang = explicitLang || getInterfaceLanguage();
  if (wordObj.all_notes && typeof wordObj.all_notes === 'object') {
    const n = wordObj.all_notes[lang];
    if (n && typeof n === 'string' && n.trim().length > 0) return n.trim();
  }
  // Check direct column properties (e.g. notes for ru, notes_uk, notes_de, notes_es, etc.)
  if (lang === 'ru') {
    return (wordObj.notes && typeof wordObj.notes === 'string') ? wordObj.notes.trim() : '';
  }
  const langKey = `notes_${lang}`;
  if (wordObj[langKey] && typeof wordObj[langKey] === 'string' && wordObj[langKey].trim().length > 0) {
    return wordObj[langKey].trim();
  }
  return '';
}

const CATEGORY_LOCALIZATIONS = {
  elementary: {
    ru: { title: "Базовая лексика", desc: "Самые частотные и нужные слова повседневного английского" },
    uk: { title: "Базова лексика", desc: "Найчастотніші та найпотрібніші слова повсякденної англійської" },
    de: { title: "Grundwortschatz", desc: "Häufigste und wichtigste Wörter des alltäglichen Englisch" },
    es: { title: "Vocabulario básico", desc: "Las palabras más frecuentes y esenciales del inglés diario" },
    fr: { title: "Vocabulaire de base", desc: "Les mots les plus fréquents et essentiels de l'anglais quotidien" },
    pl: { title: "Podstawowe słownictwo", desc: "Najczęstsze i najważniejsze słowa codziennego angielskiego" },
    it: { title: "Vocabolario di base", desc: "Le parole più frequenti ed essenziali dell'inglese quotidiano" },
    tr: { title: "Temel Kelimeler", desc: "Günlük İngilizcenin en sık kullanılan temel kelimeleri" },
    pt: { title: "Vocabulário básico", desc: "As palavras mais frequentes e essenciais do inglês cotidiano" },
    en: { title: "Elementary Vocabulary", desc: "Most frequent and essential everyday English words" },
    ro: { title: "Vocabular de bază", desc: "Cele mai frecvente și esențiale cuvinte ale limbii engleze" },
    bg: { title: "Основна лексика", desc: "Най-често срещаните и важни думи в ежедневния английски" },
    cs: { title: "Základní slovní zásoba", desc: "Nejčastější a nejdůležitější slova každodenní angličtiny" },
    sk: { title: "Základná slovná zásoba", desc: "Najčastejšie a najdôležitejšie slová každodennej angličtiny" },
    hu: { title: "Alapszókincs", desc: "A mindennapi angol leggyakoribb és legfontosabb szavai" },
    el: { title: "Βασικό λεξιλόγιο", desc: "Οι πιο συχνές και απαραίτητες λέξεις των καθημερινών αγγλικών" },
    sl: { title: "Osnovno besedišče", desc: "Najpogostejše in najpomembnejše besede vsakdanje angleščine" },
    et: { title: "Põhisõnavara", desc: "Igapäevase inglise keele kõige sagedasemad ja vajalikumad sõnad" },
    lt: { title: "Baziniai žodžiai", desc: "Dažniausiai vartojami ir svarbiausi kasdienės anglų kalbos žodžiai" },
    lv: { title: "Pamatvārdi", desc: "Visbiežāk lietotie un svarīgākie ikdienas angļu valodas vārdi" },
    da: { title: "Basalt ordforråd", desc: "De mest hyppige og vigtige ord i hverdagsengelsk" },
    fi: { title: "Perussanasto", desc: "Yleisimmät ja tärkeimmät jokapäiväisen englannin sanat" },
    sv: { title: "Grundordförråd", desc: "De vanligaste och viktigaste orden i vardagsengelska" },
    hr: { title: "Temeljni rječnik", desc: "Najčešće i najvažnije riječi svakodnevnog engleskog" },
    hi: { title: "बुनियादी शब्दावली", desc: "दैनिक अंग्रेजी के सबसे आम और महत्वपूर्ण शब्द" },
    bn: { title: "প্রাথমিক শব্দভাণ্ডার", desc: "দৈনন্দিন ইংরেজির সবচেয়ে বেশি ব্যবহৃত এবং অপরিহার্য শব্দসমূহ" },
    ar: { title: "المفردات الأساسية", desc: "أهم الكلمات وأكثرها شيوعاً في اللغة الإنجليزية اليومية" },
    fa: { title: "واژگان پایه", desc: "پرکاربردترین و ضروری‌ترین کلمات انگلیسی روزمره" },
    id: { title: "Kosakata Dasar", desc: "Kata-kata bahasa Inggris sehari-hari yang paling sering digunakan dan penting" },
    vi: { title: "Từ vựng cơ bản", desc: "Những từ tiếng Anh thông dụng và cần thiết nhất hàng ngày" },
    th: { title: "คำศัพท์พื้นฐาน", desc: "คำศัพท์ภาษาอังกฤษในชีวิตประจำวันที่มีประโยชน์และพบบ่อยที่สุด" },
    ko: { title: "기초 어휘", desc: "일상 영어에서 가장 자주 쓰이고 필수적인 단어들" },
    ja: { title: "基本単語", desc: "日常会話で最も頻出する重要英単語" },
    zh: { title: "基础词汇", desc: "日常英语中最常用、最核心的必备词汇" },
    ur: { title: "بنیادی الفاظ", desc: "روزمرہ کی ضروری اور عام انگریزی الفاظ" },
    kk: { title: "Базалық лексика", desc: "Күнделікті ағылшын тіліндегі ең жиі қолданылатын және қажетті сөздер" },
  },
  irregular: {
    ru: { title: "Неправильные глаголы", desc: "Ключевые формы и значения всех неправильных глаголов" },
    uk: { title: "Неправильні дієслова", desc: "Ключові форми та значення всіх неправильних дієслів" },
    de: { title: "Unregelmäßige Verben", desc: "Wichtige Formen und Bedeutungen unregelmäßiger Verben" },
    es: { title: "Verbos irregulares", desc: "Formas clave y significados de verbos irregulares" },
    fr: { title: "Verbes irréguliers", desc: "Formes clés et sens des verbes irréguliers" },
    pl: { title: "Czasowniki nieregularne", desc: "Kluczowe formy i znaczenia czasowników nieregularnych" },
    it: { title: "Verbi irregolari", desc: "Forme chiave e significati dei verbi irregolari" },
    tr: { title: "Düzensiz Fiiller", desc: "Tüm düzensiz fiillerin temel formları ve anlamları" },
    pt: { title: "Verbos irregulares", desc: "Formas essenciais e significados de verbos irregulares" },
    en: { title: "Irregular Verbs", desc: "Key forms and meanings of all irregular English verbs" },
    ro: { title: "Verbe neregulate", desc: "Forme cheie și sensuri ale verbelor neregulate" },
    bg: { title: "Неправилни глаголи", desc: "Основни форми и значения на всички неправилни глаголи" },
    cs: { title: "Nepravidelná slovesa", desc: "Klíčové tvary a významy nepravidelných sloves" },
    sk: { title: "Nepravidelné slovesá", desc: "Kľúčové tvary a významy nepravidelných slovies" },
    hu: { title: "Rendhagyó igék", desc: "A rendhagyó igék kulcsfontosságú alakjai és jelentései" },
    el: { title: "Ανώμαλα ρήματα", desc: "Βασικές μορφές και σημασίες των ανώμαλων ρημάτων" },
    sl: { title: "Nepravilni glagoli", desc: "Ključne oblike in pomeni nepravilnih glagolov" },
    et: { title: "Ebareeglipärased tegusõnad", desc: "Ebareeglipäraste tegusõnade põhivormid ja tähendused" },
    lt: { title: "Netaisyklingi veiksmažodžiai", desc: "Svarbiausios netaisyklingų veiksmažodžių formos ir reikšmės" },
    lv: { title: "Neregulāri darbības vārdi", desc: "Galvenās neregulāro darbības vārdu formas un nozīmes" },
    da: { title: "Uregelmæssige verber", desc: "Nøgleformer og betydninger af uregelmæssige verber" },
    fi: { title: "Epäsäännölliset verbit", desc: "Epäsäännöllisten verbien keskeiset muodot ja merkitykset" },
    sv: { title: "Oregelbundna verb", desc: "Viktiga former och betydelser för oregelbundna verb" },
    hr: { title: "Nepravilni glagoli", desc: "Ključni oblici i značenja nepravilnih glagola" },
    hi: { title: "अनियमित क्रियाएं", desc: "सभी अंग्रेजी अनियमित क्रियाओं के मुख्य रूप और अर्थ" },
    bn: { title: "অনিয়মিত ক্রিয়াপদ", desc: "ইংরেজির সকল অনিয়মিত ক্রিয়াপদের মূল রূপ ও অর্থ" },
    ar: { title: "الأفعال الشاذة", desc: "الأشكال الرئيسية ومعاني جميع الأفعال غير القياسية في اللغة الإنجليزية" },
    fa: { title: "افعال بی‌قاعده", desc: "شکل‌های کلیدی و معانی تمام افعال بی‌قاعده انگلیسی" },
    id: { title: "Kata Kerja Tidak Beraturan", desc: "Bentuk utama dan arti dari semua kata kerja tidak beraturan bahasa Inggris" },
    vi: { title: "Động từ bất quy tắc", desc: "Các dạng chính và ý nghĩa của tất cả động từ bất quy tắc trong tiếng Anh" },
    th: { title: "กริยาไม่ปกติ", desc: "รูปสำคัญและความหมายของกริยาไม่ปกติภาษาอังกฤษทั้งหมด" },
    ko: { title: "불규칙 동사", desc: "모든 영어 불규칙 동사의 주요 형태와 의미" },
    ja: { title: "不規則動詞", desc: "すべての英語不規則動詞の重要変化形と意味" },
    zh: { title: "不规则动词", desc: "所有英语不规则动词的核心变形与含义" },
    ur: { title: "بے قاعدہ افعال", desc: "انگریزی کے تمام اہم بے قاعدہ افعال کی شکلیں اور معانی" },
    kk: { title: "Бұрыс етістіктер", desc: "Барлық ағылшын бұрыс етістіктерінің негізгі формалары мен мағыналары" },
  },
  pattern: {
    ru: { title: "Разговорные паттерны", desc: "Устойчивые фразы, речевые связки и идиоматические конструкции" },
    uk: { title: "Розмовні патерни", desc: "Стійкі фрази, мовні зв'язки та ідіоматичні конструкції" },
    de: { title: "Gesprächsmuster", desc: "Feste Redewendungen, Satzmuster und idiomatische Ausdrücke" },
    es: { title: "Patrones conversacionales", desc: "Frases hechas, conectores y expresiones idiomáticas" },
    fr: { title: "Modèles de conversation", desc: "Expressions courantes, tournures de phrases et idiomes" },
    pl: { title: "Wzorce konwersacyjne", desc: "Utarte zwroty, wyrażenia łączące i idiomy" },
    it: { title: "Pattern di conversazione", desc: "Frasi fatte, connettivi ed espressioni idiomatiche" },
    tr: { title: "Konuşma Kalıpları", desc: "Kalıplaşmış ifadeler, konuşma bağlaçları ve deyimler" },
    pt: { title: "Padrões de conversação", desc: "Frases feitas, conectivos e expressões idiomáticas" },
    en: { title: "Phrasal Patterns", desc: "Common phrases, conversational collocations and idioms" },
    ro: { title: "Modele conversaționale", desc: "Expresii uzuale, conectori de vorbire și locuțiuni idiomatice" },
    bg: { title: "Разговорни модели", desc: "Устойчиви фрази, разговорни връзки и идиоматични изрази" },
    cs: { title: "Konverzační vzorce", desc: "Ustálené fráze, řečová spojení a idiomy" },
    sk: { title: "Konverzačné vzorce", desc: "Ustálené frázy, rečové spojenia a frazeologizmy" },
    hu: { title: "Beszédminták", desc: "Gyakori kifejezések, társalgási fordulatok és idiómák" },
    el: { title: "Μοτίβα συνομιλίας", desc: "Συνηθισμένες φράσεις, συνδετικές λέξεις και ιδιωματισμοί" },
    sl: { title: "Pogovorni vzorci", desc: "Pogoste fraze, pogovorne zveze in idiomi" },
    et: { title: "Vestlusmustrid", desc: "Tavalised fraasid, kõneühendused ja idioomid" },
    lt: { title: "Pokalbių modeliai", desc: "Nusistovėjusios frazės, šnekamosios kalbos jungtys ir idiomos" },
    lv: { title: "Sarunvalodas modeļi", desc: "Biežāk lietotās frāzes, runas saikļi un idiomas" },
    da: { title: "Samtalemønstre", desc: "Faste udtryk, talemønstre og idiomatiske vendinger" },
    fi: { title: "Keskustelumallit", desc: "Yleiset fraasit, puheen liitosilmaukset ja idiomit" },
    sv: { title: "Konversationsmönster", desc: "Vanliga fraser, samtalsbindningar och idiom" },
    hr: { title: "Razgovorni obrasci", desc: "Uobičajene fraze, govorni veznici i idiomi" },
    hi: { title: "बातचीत के पैटर्न", desc: "सामान्य वाक्यांश, संवादात्मक संयोजन और मुहावरे" },
    bn: { title: "কথোপকথনের প্যাটার্ন", desc: "সাধারণ বাক্যাংশ, কথোপকথনের শব্দবন্ধ এবং বাগধারা" },
    ar: { title: "أنماط المحادثة", desc: "العبارات الشائعة والمتلازمات اللفظية والتعابير الاصطلاحية" },
    fa: { title: "الگوهای مکالمه", desc: "عبارات رایج، ترکیب‌های محاوره‌ای و اصطلاحات" },
    id: { title: "Pola Percakapan", desc: "Frasa umum, kolokasi percakapan dan idiom" },
    vi: { title: "Mẫu câu giao tiếp", desc: "Các cụm từ thông dụng, cách diễn đạt hội thoại và thành ngữ" },
    th: { title: "รูปแบบบทสนทนา", desc: "วลีที่ใช้บ่อย การเชื่อมประโยค และสำนวนภาษาอังกฤษ" },
    ko: { title: "회화 패턴", desc: "자주 쓰이는 표현, 회화 구문 및 관용구" },
    ja: { title: "会話パターン", desc: "よく使われる定型フレーズ、コロケーション、慣用句" },
    zh: { title: "日常口语表达", desc: "常用表达、地道搭配与高频习语结构" },
    ur: { title: "گفتگو کے سانچے", desc: "عام فقرات، روزمرہ بول چال اور محاورات" },
    kk: { title: "Сөйлесу үлгілері", desc: "Тұрақты тіркестер, сөйлеу байланыстары және идиомалар" },
  },
  intermediate: {
    ru: { title: "Средний уровень", desc: "Слова для свободного общения, работы и чтения статей" },
    uk: { title: "Середній рівень", desc: "Слова для вільного спілкування, роботи та читання статей" },
    de: { title: "Mittelstufe", desc: "Wortschatz für fließende Gespräche, Beruf und Lektüre" },
    es: { title: "Nivel intermedio", desc: "Vocabulario para conversar con fluidez, trabajar y leer" },
    fr: { title: "Niveau intermédiaire", desc: "Mots pour communiquer avec aisance, travailler et lire" },
    pl: { title: "Średnio zaawansowany", desc: "Słownictwo do swobodnej rozmowy, pracy i czytania artykułów" },
    it: { title: "Livello intermedio", desc: "Parole per conversare fluentemente, lavorare e leggere" },
    tr: { title: "Orta Düzey", desc: "Akıcı iletişim, iş hayatı ve okuma için gerekli kelimeler" },
    pt: { title: "Nível intermediário", desc: "Vocabulário para conversar fluentemente, trabalhar e ler" },
    en: { title: "Intermediate Vocabulary", desc: "Vocabulary for fluent conversation, work and reading" },
    ro: { title: "Nivel intermediar", desc: "Cuvinte pentru conversație fluentă, muncă și lectură" },
    bg: { title: "Средно ниво", desc: "Думи за свободно общуване, работа и четене на статии" },
    cs: { title: "Středně pokročilý", desc: "Slova pro plynulou konverzaci, práci a četbu" },
    sk: { title: "Stredne pokročilý", desc: "Slová na plynulú konverzáciu, prácu a čítanie" },
    hu: { title: "Középhaladó", desc: "Szavak a folyékony beszélgetéshez, munkához és olvasáshoz" },
    el: { title: "Μεσαίο επίπεδο", desc: "Λέξεις για άπταιστη επικοινωνία, εργασία και ανάγνωση" },
    sl: { title: "Srednja raven", desc: "Besede za tekoč pogovor, delo in branje" },
    et: { title: "Keskaste", desc: "Sõnad soravaks vestluseks, tööks ja lugemiseks" },
    lt: { title: "Vidurinis lygis", desc: "Žodžiai laisvam bendravimui, darbui ir skaitymui" },
    lv: { title: "Vidējais līmenis", desc: "Vārdi brīvai sarunai, darbam un lasīšanai" },
    da: { title: "Mellemniveau", desc: "Ord til flydende samtale, arbejde og læsning" },
    fi: { title: "Keskitaso", desc: "Sanat sujuvaan keskusteluun, työhön ja lukemiseen" },
    sv: { title: "Medelnivå", desc: "Ord för flytande samtal, arbete och läsning" },
    hr: { title: "Srednja razina", desc: "Riječi za tečan razgovor, posao i čitanje" },
    hi: { title: "मध्यम स्तर", desc: "धाराप्रवाह बातचीत, काम और अध्ययन के लिए शब्दावली" },
    bn: { title: "মধ্যবর্তী স্তর", desc: "সাবলীল কথোপকথন, কাজ এবং পড়ার জন্য শব্দভাণ্ডার" },
    ar: { title: "المستوى المتوسط", desc: "مفردات للتحدث بطلاقة والعمل والقراءة" },
    fa: { title: "سطح متوسط", desc: "واژگان برای مکالمه روان، کار و مطالعه" },
    id: { title: "Tingkat Menengah", desc: "Kosakata untuk percakapan lancar, pekerjaan, dan membaca" },
    vi: { title: "Trình độ trung cấp", desc: "Từ vựng để giao tiếp lưu loát, làm việc và đọc hiểu" },
    th: { title: "ระดับกลาง", desc: "คำศัพท์สำหรับการสนทนาอย่างคล่องแคล่ว การทำงาน และการอ่าน" },
    ko: { title: "중급 어휘", desc: "유창한 대화, 업무 및 독서를 위한 어휘" },
    ja: { title: "中級語彙", desc: "流暢な会話、仕事、読書のための実践的英単語" },
    zh: { title: "中级进阶词汇", desc: "适用于流畅对话、职场沟通与文章阅读的实用词汇" },
    ur: { title: "درمیانہ درجہ", desc: "روانی سے گفتگو، کام اور مطالعہ کے لیے الفاظ" },
    kk: { title: "Орта деңгей", desc: "Еркін сөйлесу, жұмыс және мақалалар оқуға арналған сөздер" },
  },
  advanced: {
    ru: { title: "Продвинутый уровень", desc: "Редкая, нюансная и академическая лексика высокого уровня" },
    uk: { title: "Просунутий рівень", desc: "Рідкісна, нюансна та академічна лексика високого рівня" },
    de: { title: "Oberstufe", desc: "Nuancierter und anspruchsvoller akademischer Wortschatz" },
    es: { title: "Nivel avanzado", desc: "Léxico avanzado, matices sutiles y vocabulario académico" },
    fr: { title: "Niveau avancé", desc: "Vocabulaire riche, nuances subtiles et termes académiques" },
    pl: { title: "Zaawansowany", desc: "Bogate słownictwo, niuanse językowe i styl akademicki" },
    it: { title: "Livello avanzato", desc: "Lessico ricco, sfumature sottili e linguaggio accademico" },
    tr: { title: "İleri Düzey", desc: "İleri seviye, nüanslı ve akademik kelime dağarcığı" },
    pt: { title: "Nível avançado", desc: "Léxico sofisticado, nuances expressivas e acadêmicas" },
    en: { title: "Advanced Vocabulary", desc: "Nuanced, expressive and academic advanced vocabulary" },
    ro: { title: "Nivel avansat", desc: "Lexic avansat, nuanțat și academic de nivel înalt" },
    bg: { title: "Напреднало ниво", desc: "Богат, нюансиран и академичен речник на високо ниво" },
    cs: { title: "Pokročilá úroveň", desc: "Vytříbená, nuancovaná a akademická slovní zásoba" },
    sk: { title: "Pokročilá úroveň", desc: "Vybrúsená, nuansovaná a akademická slovná zásoba" },
    hu: { title: "Haladó szint", desc: "Árnyalt, kifejező és akadémiai szintű szókincs" },
    el: { title: "Προχωρημένο επίπεδο", desc: "Εξειδικευμένο, λεπτομερές και ακαδημαϊκό λεξιλόγιο" },
    sl: { title: "Nadaljevalna raven", desc: "Zahtevno, niansirano in akademsko besedišče" },
    et: { title: "Kõrgtase", desc: "Nüansikas, väljendusrikas ja akadeemiline sõnavara" },
    lt: { title: "Pažengęs lygis", desc: "Turtingas, niuansuotas ir akademinis žodynas" },
    lv: { title: "Padziļināts līmenis", desc: "Niansēta, izteiksmīga un akadēmiska vārdu krājuma kopa" },
    da: { title: "Avanceret niveau", desc: "Nuanceret, udtryksfuldt og akademisk ordforråd" },
    fi: { title: "Edistynyt taso", desc: "Monipuolinen, vivahteikas ja akateeminen sanasto" },
    sv: { title: "Avancerad nivå", desc: "Nyanserat, uttrycksfullt och akademiskt ordförråd" },
    hr: { title: "Napredna razina", desc: "Nijansiran, izražajan i akademski vokabular visoke razine" },
    hi: { title: "उन्नत स्तर", desc: "गहरी, सूक्ष्म और शैक्षणिक उन्नत शब्दावली" },
    bn: { title: "উন্নত স্তর", desc: "সূক্ষ্ম, প্রকাশভঙ্গিময় এবং একাডেমিক উন্নত শব্দভাণ্ডার" },
    ar: { title: "المستوى المتقدم", desc: "مفردات متقدمة وأكاديمية دقيقة ومعبرة" },
    fa: { title: "سطح پیشرفته", desc: "واژگان پیشرفته، دقیق و دانشگاهی" },
    id: { title: "Tingkat Lanjut", desc: "Kosakata tingkat lanjut bernuansa ekspresif dan akademis" },
    vi: { title: "Trình độ nâng cao", desc: "Từ vựng nâng cao giàu sắc thái và mang tính học thuật" },
    th: { title: "ระดับสูง", desc: "คำศัพท์ขั้นสูงเชิงวิชาการที่ลึกซึ้งและสื่อความหมายเฉพาะเจาะจง" },
    ko: { title: "고급 어휘", desc: "뉘앙스가 풍부하고 표현력 있는 학술적 고급 어휘" },
    ja: { title: "上級語彙", desc: "ニュアンス豊かで表現力のある学術・高度語彙" },
    zh: { title: "高级精通词汇", desc: "更丰富、细腻且具学术深度的进阶高阶词汇" },
    ur: { title: "اعلیٰ سطح", desc: "جامع، باریک اور اعلیٰ علمی الفاظ کا ذخیرہ" },
    kk: { title: "Жоғары деңгей", desc: "Сирек, мағынасы терең және академиялық жоғары деңгейлі лексика" },
  },
};

export function getCategoryDetails(rawCategory) {
  const cat = String(rawCategory || '').toLowerCase();
  let key = null;
  if (cat.includes('elementary')) key = 'elementary';
  else if (cat.includes('irregular')) key = 'irregular';
  else if (cat.includes('pattern')) key = 'pattern';
  else if (cat.includes('intermediate')) key = 'intermediate';
  else if (cat.includes('advanced')) key = 'advanced';

  const lang = getInterfaceLanguage();
  if (key && CATEGORY_LOCALIZATIONS[key]) {
    const entry = CATEGORY_LOCALIZATIONS[key];
    return entry[lang] || entry['en'] || entry['ru'];
  }

  // Fallback for custom user categories added to Google Sheet
  const fallbackDesc = lang === 'ru'
    ? `Слова из категории «${rawCategory}»`
    : lang === 'uk'
      ? `Слова з категорії «${rawCategory}»`
      : lang === 'ar'
        ? `كلمات من فئة «${rawCategory}»`
        : lang === 'fa'
          ? `کلمات از دسته‌بندی «${rawCategory}»`
          : lang === 'ur'
            ? `زمرہ «${rawCategory}» کے الفاظ`
            : lang === 'pt'
              ? `Palavras da categoria «${rawCategory}»`
              : lang === 'hi'
                ? `श्रेणी "${rawCategory}" के शब्द`
                : lang === 'ko'
                  ? `'${rawCategory}' 카테고리의 단어`
                  : lang === 'es'
                    ? `Palabras de la categoría "${rawCategory}"`
                    : `Words from "${rawCategory}" category`;
  return { title: rawCategory || 'Category', desc: fallbackDesc };
}

const UK_VOICE_MODAL_I18N = {
  ru: {
    title: "Британская озвучка",
    desc: "Для использования британского акцента необходимо загрузить файлы озвучки (Базовая лексика и Неправильные глаголы, ~23 МБ). Скачать сейчас?",
    downloadBtn: "📥 Скачать (~23 МБ)",
    cancelBtn: "Отмена",
    retryBtn: "Повторить",
    downloading: "Загрузка аудиофайлов..."
  },
  bn: {
    title: "ব্রিটিশ উচ্চারণ",
    desc: "ব্রিটিশ অ্যাকসেন্ট ব্যবহার করার জন্য ভয়েস ফাইল ডাউনলোড করতে হবে (প্রাথমিক শব্দভাণ্ডার এবং অনিয়মিত ক্রিয়াপদ, ~23 MB)। এখন ডাউনলোড করবেন?",
    downloadBtn: "📥 ডাউনলোড করুন (~23 MB)",
    cancelBtn: "বাতিল",
    retryBtn: "পুনরায় চেষ্টা করুন",
    downloading: "অডিও ফাইল ডাউনলোড হচ্ছে..."
  },
  fa: {
    title: "تلفظ بریتانیایی",
    desc: "برای استفاده از لهجه بریتانیایی، باید فایل‌های صوتی (واژگان پایه و افعال بی‌قاعده، ~23 MB) را دانلود کنید. اکنون دانلود شود؟",
    downloadBtn: "📥 دانلود (~23 MB)",
    cancelBtn: "لغو",
    retryBtn: "تلاش مجدد",
    downloading: "در حال دانلود فایل‌های صوتی..."
  },
  ur: {
    title: "برطانوی تلفظ",
    desc: "برطانوی لہجے کے لیے آڈیو فائلیں ڈاؤن لوڈ کرنا ضروری ہیں (بنیادی الفاظ اور بے قاعدہ افعال، ~23 MB)۔ کیا ابھی ڈاؤن لوڈ کریں؟",
    downloadBtn: "📥 ڈاؤن لوڈ کریں (~23 MB)",
    cancelBtn: "منسوخ",
    retryBtn: "دوبارہ کوشش کریں",
    downloading: "آڈیو فائلیں ڈاؤن لوڈ ہو رہی ہیں..."
  },
  uk: {
    title: "Британське озвучення",
    desc: "Для використання британського акценту необхідно завантажити файли озвучення (Базова лексика та Неправильні дієслова, ~23 МБ). Завантажити зараз?",
    downloadBtn: "📥 Завантажити (~23 МБ)",
    cancelBtn: "Скасувати",
    retryBtn: "Повторити",
    downloading: "Завантаження аудіофайлів..."
  },
  en: {
    title: "British Voice",
    desc: "To use the British accent, you need to download the voice files (Elementary & Irregular Verbs, ~23 MB). Download now?",
    downloadBtn: "📥 Download (~23 MB)",
    cancelBtn: "Cancel",
    retryBtn: "Retry",
    downloading: "Downloading audio files..."
  },
  de: {
    title: "Britische Aussprache",
    desc: "Um den britischen Akzent zu nutzen, müssen Sie die Sprachdateien herunterladen (Grundwortschatz & Unregelmäßige Verben, ~23 MB). Jetzt herunterladen?",
    downloadBtn: "📥 Herunterladen (~23 MB)",
    cancelBtn: "Abbrechen",
    retryBtn: "Wiederholen",
    downloading: "Audiodateien werden heruntergeladen..."
  },
  es: {
    title: "Voz británica",
    desc: "Para usar el acento británico, debes descargar los archivos de voz (Vocabulario básico y Verbos irregulares, ~23 MB). ¿Descargar ahora?",
    downloadBtn: "📥 Descargar (~23 MB)",
    cancelBtn: "Cancelar",
    retryBtn: "Reintentar",
    downloading: "Descargando archivos de audio..."
  },
  fr: {
    title: "Voix britannique",
    desc: "Pour utiliser l'accent britannique, vous devez télécharger les fichiers vocaux (Vocabulaire de base et Verbes irréguliers, ~23 Mo). Télécharger maintenant ?",
    downloadBtn: "📥 Télécharger (~23 Mo)",
    cancelBtn: "Annuler",
    retryBtn: "Réessayer",
    downloading: "Téléchargement des fichiers audio..."
  },
  pl: {
    title: "Brytyjski lektor",
    desc: "Aby używać brytyjskiego akcentu, musisz pobrać pliki dźwiękowe (Podstawowe słownictwo i Czasowniki nieregularne, ~23 MB). Pobrać teraz?",
    downloadBtn: "📥 Pobierz (~23 MB)",
    cancelBtn: "Anuluj",
    retryBtn: "Ponów",
    downloading: "Pobieranie plików dźwiękowych..."
  },
  tr: {
    title: "İngiliz Telaffuzu",
    desc: "İngiliz aksanını kullanmak için ses dosyalarını indirmeniz gerekir (Temel Kelimeler ve Düzensiz Fiiller, ~23 MB). Şimdi indirilsin mi?",
    downloadBtn: "📥 İndir (~23 MB)",
    cancelBtn: "İptal",
    retryBtn: "Yeniden dene",
    downloading: "Ses dosyaları indiriliyor..."
  },
  it: {
    title: "Voce britannica",
    desc: "Per utilizzare l'accento britannico, è necessario scaricare i file vocali (Vocabolario di base e Verbi irregolari, ~23 MB). Scaricare ora?",
    downloadBtn: "📥 Scarica (~23 MB)",
    cancelBtn: "Annulla",
    retryBtn: "Riprova",
    downloading: "Download dei file audio in corso..."
  },
  ro: {
    title: "Voce britanică",
    desc: "Pentru a folosi accentul britanic, trebuie să descărcați fișierele audio (Vocabular de bază și Verbe neregulate, ~23 MB). Descărcați acum?",
    downloadBtn: "📥 Descărcare (~23 MB)",
    cancelBtn: "Anulare",
    retryBtn: "Reîncearcă",
    downloading: "Se descarcă fișierele audio..."
  },
  bg: {
    title: "Британски глас",
    desc: "За да използвате британския акцент, трябва да изтеглите аудио файловете (Основен речник и Неправилни глаголи, ~23 MB). Изтегляне сега?",
    downloadBtn: "📥 Изтегляне (~23 MB)",
    cancelBtn: "Отказ",
    retryBtn: "Повторен опит",
    downloading: "Изтегляне на аудио файлове..."
  },
  hu: {
    title: "Brit kiejtés",
    desc: "A brit kiejtés használatához le kell töltenie a hangfájlokat (Alapszókincs és Rendhagyó igék, ~23 MB). Letölti most?",
    downloadBtn: "📥 Letöltés (~23 MB)",
    cancelBtn: "Mégse",
    retryBtn: "Újra",
    downloading: "Hangfájlok letöltése..."
  },
  el: {
    title: "Βρετανική προφορά",
    desc: "Για να χρησιμοποιήσετε τη βρετανική προφορά, πρέπει να κατεβάσετε τα αρχεία ήχου (Βασικό λεξιλόγιο & Ανώμαλα ρήματα, ~23 MB). Λήψη τώρα;",
    downloadBtn: "📥 Λήψη (~23 MB)",
    cancelBtn: "Άκυρο",
    retryBtn: "Δοκιμάστε ξανά",
    downloading: "Λήψη αρχείων ήχου..."
  },
  da: {
    title: "Britisk stemme",
    desc: "For at bruge britisk accent skal du downloade lydfilerne (Grundlæggende ordforråd og Uregelmæssige verber, ~23 MB). Hent nu?",
    downloadBtn: "📥 Hent (~23 MB)",
    cancelBtn: "Annuller",
    retryBtn: "Prøv igen",
    downloading: "Downloader lydfiler..."
  },
  lv: {
    title: "Britu balss",
    desc: "Lai izmantotu britu akcentu, nepieciešams lejupielādēt balss failus (Pamatvārdi un Neregulārie darbības vārdi, ~23 MB). Lejupielādēt tagad?",
    downloadBtn: "📥 Lejupielādēt (~23 MB)",
    cancelBtn: "Atcelt",
    retryBtn: "Mēģināt vēlreiz",
    downloading: "Lejupielādē audio failus..."
  },
  lt: {
    title: "Britų balsas",
    desc: "Norėdami naudoti britų akcentą, turite atsisiųsti balso failus (Pagrindinis žodynas ir Netaisyklingi veiksmažodžiai, ~23 MB). Atsisiųsti dabar?",
    downloadBtn: "📥 Atsisiųsti (~23 MB)",
    cancelBtn: "Atšaukti",
    retryBtn: "Bandyti dar kartą",
    downloading: "Atsisiunčiami garso failai..."
  },
  pt: {
    title: "Voz britânica",
    desc: "Para usar o sotaque britânico, você precisa baixar os arquivos de voz (Vocabulário básico e Verbos irregulares, ~23 MB). Baixar agora?",
    downloadBtn: "📥 Baixar (~23 MB)",
    cancelBtn: "Cancelar",
    retryBtn: "Tentar novamente",
    downloading: "Baixando arquivos de áudio..."
  },
  sk: {
    title: "Britský hlas",
    desc: "Pre britský prízvuk je potrebné stiahnuť zvukové súbory (Základná slovná zásoba a Nepravidelné slovesá, ~23 MB). Stiahnuť teraz?",
    downloadBtn: "📥 Stiahnuť (~23 MB)",
    cancelBtn: "Zrušiť",
    retryBtn: "Skúsiť znova",
    downloading: "Sťahujú sa zvukové súbory..."
  },
  sl: {
    title: "Britanski glas",
    desc: "Za uporabo britanskega naglasa morate prenesti zvočne datoteke (Osnovno besedišče in Nepravilni glagoli, ~23 MB). Prenesi zdaj?",
    downloadBtn: "📥 Prenesi (~23 MB)",
    cancelBtn: "Prekliči",
    retryBtn: "Poskusi znova",
    downloading: "Prenašanje zvočnih datotek..."
  },
  fi: {
    title: "Brittiläinen ääni",
    desc: "Brittiläisen aksentin käyttämiseksi sinun on ladattava äänitiedostot (Perussanasto ja Epäsäännölliset verbit, ~23 Mt). Lataa nyt?",
    downloadBtn: "📥 Lataa (~23 Mt)",
    cancelBtn: "Peruuta",
    retryBtn: "Yritä uudelleen",
    downloading: "Ladataan äänitiedostoja..."
  },
  hr: {
    title: "Britanski glas",
    desc: "Za korištenje britanskog naglaska potrebno je preuzeti audio datoteke (Osnovni vokabular i Nepravilni glagoli, ~23 MB). Preuzeti sada?",
    downloadBtn: "📥 Preuzmi (~23 MB)",
    cancelBtn: "Odustani",
    retryBtn: "Pokušaj ponovno",
    downloading: "Preuzimanje audio datoteka..."
  },
  cs: {
    title: "Britský hlas",
    desc: "Pro použití britského přízvuku je potřeba stáhnout hlasové soubory (Základní slovní zásoba a Nepravidelná slovesa, ~23 MB). Stáhnout nyní?",
    downloadBtn: "📥 Stáhnout (~23 MB)",
    cancelBtn: "Zrušit",
    retryBtn: "Zkusit znovu",
    downloading: "Stahování zvukových souborů..."
  },
  sv: {
    title: "Brittisk röst",
    desc: "För att använda brittisk accent behöver du ladda ner röstfilerna (Grundläggande ordförråd och Oregelbundna verb, ~23 MB). Ladda ner nu?",
    downloadBtn: "📥 Ladda ner (~23 MB)",
    cancelBtn: "Avbryt",
    retryBtn: "Försök igen",
    downloading: "Laddar ner ljudfiler..."
  },
  et: {
    title: "Briti hääl",
    desc: "Briti aktsendi kasutamiseks peate alla laadima helifailid (Põhisõnavara ja Ebareeglipärased tegusõnad, ~23 MB). Laadi alla kohe?",
    downloadBtn: "📥 Laadi alla (~23 MB)",
    cancelBtn: "Loobu",
    retryBtn: "Proovi uuesti",
    downloading: "Helifailide allalaadimine..."
  },
  ja: {
    title: "イギリス英語の音声",
    desc: "イギリス英語のアクセントを使用するには、音声ファイル（基本単語と不規則動詞、約23 MB）をダウンロードする必要があります。今すぐダウンロードしますか？",
    downloadBtn: "📥 ダウンロード (~23 MB)",
    cancelBtn: "キャンセル",
    retryBtn: "再試行",
    downloading: "音声ファイルをダウンロード中..."
  },
  ko: {
    title: "영국식 음성",
    desc: "영국식 억양을 사용하려면 음성 파일(기초 어휘 및 불규칙 동사, 약 23 MB)을 다운로드해야 합니다. 지금 다운로드하시겠습니까?",
    downloadBtn: "📥 다운로드 (~23 MB)",
    cancelBtn: "취소",
    retryBtn: "다시 시도",
    downloading: "오디오 파일 다운로드 중..."
  },
  hi: {
    title: "ब्रिटिश उच्चारण आवाज़",
    desc: "ब्रिटिश उच्चारण का उपयोग करने के लिए, आपको ऑडियो फ़ाइलें (बुनियादी शब्दावली और अनियमित क्रियाएं, ~23 MB) डाउनलोड करनी होंगी। क्या अभी डाउनलोड करें?",
    downloadBtn: "📥 डाउनलोड करें (~23 MB)",
    cancelBtn: "रद्द करें",
    retryBtn: "पुनः प्रयास करें",
    downloading: "ऑडियो फाइलें डाउनलोड हो रही हैं..."
  },
  ar: {
    title: "النطق البريطاني",
    desc: "لاستخدام اللكنة البريطانية، تحتاج إلى تنزيل الملفات الصوتية (المفردات الأساسية والأفعال الشاذة، ~23 ميجابايت). هل تريد التنزيل الآن؟",
    downloadBtn: "📥 تنزيل (~23 MB)",
    cancelBtn: "إلغاء",
    retryBtn: "إعادة المحاولة",
    downloading: "جارٍ تنزيل الملفات الصوتية..."
  },
  id: {
    title: "Suara British",
    desc: "Untuk menggunakan aksen British, Anda perlu mengunduh file audio (Kosakata Dasar dan Kata Kerja Tidak Beraturan, ~23 MB). Unduh sekarang?",
    downloadBtn: "📥 Unduh (~23 MB)",
    cancelBtn: "Batal",
    retryBtn: "Coba lagi",
    downloading: "Mengunduh file audio..."
  },
  vi: {
    title: "Giọng Anh-Anh",
    desc: "Để sử dụng giọng Anh-Anh, bạn cần tải xuống các tệp âm thanh (Từ vựng cơ bản và Động từ bất quy tắc, ~23 MB). Tải xuống ngay bây giờ?",
    downloadBtn: "📥 Tải xuống (~23 MB)",
    cancelBtn: "Hủy",
    retryBtn: "Thử lại",
    downloading: "Đang tải tệp âm thanh..."
  },
  th: {
    title: "เสียงสำเนียงบริติช",
    desc: "หากต้องการใช้สำเนียงบริติช คุณต้องดาวน์โหลดไฟล์เสียง (คำศัพท์พื้นฐานและกริยาไม่ปกติ, ~23 MB) ดาวน์โหลดเลยหรือไม่?",
    downloadBtn: "📥 ดาวน์โหลด (~23 MB)",
    cancelBtn: "ยกเลิก",
    retryBtn: "ลองใหม่",
    downloading: "กำลังดาวน์โหลดไฟล์เสียง..."
  },

  zh: {
    title: "英式发音语音包",
    desc: "使用英式发音需要下载语音文件（基础词汇与不规则动词，约 23 MB）。现在下载吗？",
    downloadBtn: "📥 下载语音包（约 23 MB）",
    cancelBtn: "取消",
    retryBtn: "重试",
    downloading: "正在下载音频文件..."
  },

  kk: {
    title: "Британдық дыбыстау",
    desc: "Британдық акцентті пайдалану үшін дыбыстау файлдарын жүктеп алу қажет (Базалық сөздік және Бұрыс етістіктер, ~23 МБ). Қазір жүктейсіз бе?",
    downloadBtn: "📥 Жүктеп алу (~23 МБ)",
    cancelBtn: "Бас тарту",
    retryBtn: "Қайталау",
    downloading: "Аудиофайлдар жүктелуде..."
  },
};

const CAT_VOICE_MODAL_I18N = {
  ru: {
    title: "Загрузка аудиофайлов",
    formatDesc: (t, c, s) => `Для тренировки категории «<strong>${t}</strong>» требуется загрузить аудиофайлы (${c} слов, ~${s} МБ). Скачать сейчас?`,
    downloadBtn: (s) => `📥 Скачать (~${s} МБ)`,
    cancelBtn: "Отмена",
    retryBtn: "Повторить",
    downloading: "Загрузка аудиофайлов..."
  },
  uk: {
    title: "Завантаження аудіофайлів",
    formatDesc: (t, c, s) => `Для тренування категорії «<strong>${t}</strong>» потрібно завантажити аудіофайли (${c} слів, ~${s} МБ). Завантажити зараз?`,
    downloadBtn: (s) => `📥 Завантажити (~${s} МБ)`,
    cancelBtn: "Скасувати",
    retryBtn: "Повторити",
    downloading: "Завантаження аудіофайлів..."
  },
  en: {
    title: "Download Audio Files",
    formatDesc: (t, c, s) => `To practice "<strong>${t}</strong>", you need to download audio files (${c} words, ~${s} MB). Download now?`,
    downloadBtn: (s) => `📥 Download (~${s} MB)`,
    cancelBtn: "Cancel",
    retryBtn: "Retry",
    downloading: "Downloading audio files..."
  },
  de: {
    title: "Audiodateien herunterladen",
    formatDesc: (t, c, s) => `Um die Kategorie „<strong>${t}</strong>“ zu trainieren, müssen Audiodateien heruntergeladen werden (${c} Wörter, ~${s} MB). Jetzt herunterladen?`,
    downloadBtn: (s) => `📥 Herunterladen (~${s} MB)`,
    cancelBtn: "Abbrechen",
    retryBtn: "Wiederholen",
    downloading: "Audiodateien werden heruntergeladen..."
  },
  es: {
    title: "Descargar archivos de audio",
    formatDesc: (t, c, s) => `Para practicar la categoría "<strong>${t}</strong>", debes descargar los archivos de audio (${c} palabras, ~${s} MB). ¿Descargar ahora?`,
    downloadBtn: (s) => `📥 Descargar (~${s} MB)`,
    cancelBtn: "Cancelar",
    retryBtn: "Reintentar",
    downloading: "Descargando archivos de audio..."
  },
  fr: {
    title: "Télécharger les fichiers audio",
    formatDesc: (t, c, s) => `Pour pratiquer la catégorie « <strong>${t}</strong> », vous devez télécharger les fichiers audio (${c} mots, ~${s} Mo). Télécharger maintenant ?`,
    downloadBtn: (s) => `📥 Télécharger (~${s} Mo)`,
    cancelBtn: "Annuler",
    retryBtn: "Réessayer",
    downloading: "Téléchargement des fichiers audio..."
  },
  pl: {
    title: "Pobieranie plików audio",
    formatDesc: (t, c, s) => `Aby ćwiczyć kategorię „<strong>${t}</strong>”, należy pobrać pliki dźwiękowe (${c} słów, ~${s} MB). Pobrać teraz?`,
    downloadBtn: (s) => `📥 Pobierz (~${s} MB)`,
    cancelBtn: "Anuluj",
    retryBtn: "Ponów",
    downloading: "Pobieranie plików dźwiękowych..."
  },
  tr: {
    title: "Ses dosyalarını indir",
    formatDesc: (t, c, s) => `"<strong>${t}</strong>" kategorisini çalışmak için ses dosyalarını indirmeniz gerekir (${c} kelime, ~${s} MB). Şimdi indirilsin mi?`,
    downloadBtn: (s) => `📥 İndir (~${s} MB)`,
    cancelBtn: "İptal",
    retryBtn: "Yeniden dene",
    downloading: "Ses dosyaları indiriliyor..."
  },
  it: {
    title: "Scarica file audio",
    formatDesc: (t, c, s) => `Per allenare la categoria "<strong>${t}</strong>", è necessario scaricare i file audio (${c} parole, ~${s} MB). Scaricare ora?`,
    downloadBtn: (s) => `📥 Scarica (~${s} MB)`,
    cancelBtn: "Annulla",
    retryBtn: "Riprova",
    downloading: "Download dei file audio in corso..."
  },
  ro: {
    title: "Descărcare fișiere audio",
    formatDesc: (t, c, s) => `Pentru categoria "<strong>${t}</strong>", trebuie să descărcați fișierele audio (${c} cuvinte, ~${s} MB). Descărcați acum?`,
    downloadBtn: (s) => `📥 Descărcare (~${s} MB)`,
    cancelBtn: "Anulare",
    retryBtn: "Reîncearcă",
    downloading: "Se descarcă fișierele audio..."
  },
  bg: {
    title: "Изтегляне на аудио файлове",
    formatDesc: (t, c, s) => `За категория „<strong>${t}</strong>“ трябва да изтеглите аудио файлове (${c} думи, ~${s} MB). Изтегляне сега?`,
    downloadBtn: (s) => `📥 Изтегляне (~${s} MB)`,
    cancelBtn: "Отказ",
    retryBtn: "Повторен опит",
    downloading: "Изтегляне на аудио файлове..."
  },
  hu: {
    title: "Hangfájlok letöltése",
    formatDesc: (t, c, s) => `A(z) „<strong>${t}</strong>” kategória gyakorlásához le kell tölteni a hangfájlokat (${c} szó, ~${s} MB). Letölti most?`,
    downloadBtn: (s) => `📥 Letöltés (~${s} MB)`,
    cancelBtn: "Mégse",
    retryBtn: "Újra",
    downloading: "Hangfájlok letöltése..."
  },
  el: {
    title: "Λήψη αρχείων ήχου",
    formatDesc: (t, c, s) => `Για την κατηγορία «<strong>${t}</strong>», πρέπει να κατεβάσετε αρχεία ήχου (${c} λέξεις, ~${s} MB). Λήψη τώρα;`,
    downloadBtn: (s) => `📥 Λήψη (~${s} MB)`,
    cancelBtn: "Άκυρο",
    retryBtn: "Δοκιμάστε ξανά",
    downloading: "Λήψη αρχείων ήχου..."
  },
  da: {
    title: "Download lydfiler",
    formatDesc: (t, c, s) => `For at øve kategorien "<strong>${t}</strong>", skal du downloade lydfiler (${c} ord, ~${s} MB). Hent nu?`,
    downloadBtn: (s) => `📥 Hent (~${s} MB)`,
    cancelBtn: "Annuller",
    retryBtn: "Prøv igen",
    downloading: "Downloader lydfiler..."
  },
  lv: {
    title: "Lejupielādēt audio failus",
    formatDesc: (t, c, s) => `Lai trenētu kategoriju „<strong>${t}</strong>”, nepieciešams lejupielādēt audio failus (${c} vārdi, ~${s} MB). Lejupielādēt tagad?`,
    downloadBtn: (s) => `📥 Lejupielādēt (~${s} MB)`,
    cancelBtn: "Atcelt",
    retryBtn: "Mēģināt vēlreiz",
    downloading: "Lejupielādē audio failus..."
  },
  lt: {
    title: "Atsisiųsti garso failus",
    formatDesc: (t, c, s) => `Norint treniruotis kategoriją „<strong>${t}</strong>“, reikia atsisiųsti garso failus (${c} žodžiai, ~${s} MB). Atsisiųsti dabar?`,
    downloadBtn: (s) => `📥 Atsisiųsti (~${s} MB)`,
    cancelBtn: "Atšaukti",
    retryBtn: "Bandyti dar kartą",
    downloading: "Atsisiunčiami garso failai..."
  },
  pt: {
    title: "Baixar arquivos de áudio",
    formatDesc: (t, c, s) => `Para praticar a categoria "<strong>${t}</strong>", é necessário baixar os arquivos de áudio (${c} palavras, ~${s} MB). Baixar agora?`,
    downloadBtn: (s) => `📥 Baixar (~${s} MB)`,
    cancelBtn: "Cancelar",
    retryBtn: "Tentar novamente",
    downloading: "Baixando arquivos de áudio..."
  },
  sk: {
    title: "Stiahnuť zvukové súbory",
    formatDesc: (t, c, s) => `Pre precvičovanie kategórie „<strong>${t}</strong>“ je potrebné stiahnuť zvukové súbory (${c} slov, ~${s} MB). Stiahnuť teraz?`,
    downloadBtn: (s) => `📥 Stiahnuť (~${s} MB)`,
    cancelBtn: "Zrušiť",
    retryBtn: "Skúsiť znova",
    downloading: "Sťahujú sa zvukové súbory..."
  },
  sl: {
    title: "Prenos zvočnih datotek",
    formatDesc: (t, c, s) => `Za vadbo kategorije „<strong>${t}</strong>“ morate prenesti zvočne datoteke (${c} besed, ~${s} MB). Prenesi zdaj?`,
    downloadBtn: (s) => `📥 Prenesi (~${s} MB)`,
    cancelBtn: "Prekliči",
    retryBtn: "Poskusi znova",
    downloading: "Prenašanje zvočnih datotek..."
  },
  fi: {
    title: "Lataa äänitiedostot",
    formatDesc: (t, c, s) => `Harjoitellaksesi kategoriaa ”<strong>${t}</strong>” sinun on ladattava äänitiedostot (${c} sanaa, ~${s} Mt). Lataa nyt?`,
    downloadBtn: (s) => `📥 Lataa (~${s} Mt)`,
    cancelBtn: "Peruuta",
    retryBtn: "Yritä uudelleen",
    downloading: "Ladataan äänitiedostoja..."
  },
  hr: {
    title: "Preuzimanje audio datoteka",
    formatDesc: (t, c, s) => `Za vježbanje kategorije „<strong>${t}</strong>“ potrebno je preuzeti audio datoteke (${c} riječi, ~${s} MB). Preuzeti sada?`,
    downloadBtn: (s) => `📥 Preuzmi (~${s} MB)`,
    cancelBtn: "Odustani",
    retryBtn: "Pokušaj ponovno",
    downloading: "Preuzimanje audio datoteka..."
  },
  cs: {
    title: "Stáhnout zvukové soubory",
    formatDesc: (t, c, s) => `Pro procvičování kategorie „<strong>${t}</strong>“ je třeba stáhnout zvukové soubory (${c} slov, ~${s} MB). Stáhnout nyní?`,
    downloadBtn: (s) => `📥 Stáhnout (~${s} MB)`,
    cancelBtn: "Zrušit",
    retryBtn: "Zkusit znovu",
    downloading: "Stahování zvukových souborů..."
  },
  sv: {
    title: "Ladda ner ljudfiler",
    formatDesc: (t, c, s) => `För att öva på kategorin "<strong>${t}</strong>" behöver du ladda ner ljudfilerna (${c} ord, ~${s} MB). Ladda ner nu?`,
    downloadBtn: (s) => `📥 Ladda ner (~${s} MB)`,
    cancelBtn: "Avbryt",
    retryBtn: "Försök igen",
    downloading: "Laddar ner ljudfiler..."
  },
  et: {
    title: "Helifailide allalaadimine",
    formatDesc: (t, c, s) => `Kategooria „<strong>${t}</strong>“ harjutamiseks peate alla laadima helifailid (${c} sõna, ~${s} MB). Laadi alla kohe?`,
    downloadBtn: (s) => `📥 Laadi alla (~${s} MB)`,
    cancelBtn: "Loobu",
    retryBtn: "Proovi uuesti",
    downloading: "Helifailide allalaadimine..."
  },
    hi: {
    title: "ऑडियो फाइलें डाउनलोड करें",
    formatDesc: (t, c, s) => `श्रेणी «<strong>${t}</strong>» का अभ्यास करने के लिए ऑडियो फ़ाइलें (${c} शब्द, ~${s} MB) डाउनलोड करने की आवश्यकता है। क्या अभी डाउनलोड करें?`,
    downloadBtn: (s) => `📥 डाउनलोड करें (~${s} MB)`,
    cancelBtn: "रद्द करें",
    retryBtn: "पुनः प्रयास करें",
    downloading: "ऑडियो फाइलें डाउनलोड हो रही हैं..."
  },
  ar: {
    title: "تنزيل الملفات الصوتية",
    formatDesc: (t, c, s) => `للتدرب على فئة «<strong>${t}</strong>»، تحتاج إلى تنزيل ملفات صوتية (${c} كلمة، ~${s} ميجابايت). هل تريد التنزيل الآن؟`,
    downloadBtn: (s) => `📥 تنزيل (~${s} MB)`,
    cancelBtn: "إلغاء",
    retryBtn: "إعادة المحاولة",
    downloading: "جارٍ تنزيل الملفات الصوتية..."
  },
  id: {
    title: "Unduh file audio",
    formatDesc: (t, c, s) => `Untuk melatih kategori «<strong>${t}</strong>», Anda perlu mengunduh file audio (${c} kata, ~${s} MB). Unduh sekarang?`,
    downloadBtn: (s) => `📥 Unduh (~${s} MB)`,
    cancelBtn: "Batal",
    retryBtn: "Coba lagi",
    downloading: "Mengunduh file audio..."
  },
  vi: {
    title: "Tải tệp âm thanh",
    formatDesc: (t, c, s) => `Để luyện tập danh mục «<strong>${t}</strong>», bạn cần tải xuống tệp âm thanh (${c} từ, ~${s} MB). Tải xuống ngay?`,
    downloadBtn: (s) => `📥 Tải xuống (~${s} MB)`,
    cancelBtn: "Hủy",
    retryBtn: "Thử lại",
    downloading: "Đang tải tệp âm thanh..."
  },
  th: {
    title: "ดาวน์โหลดไฟล์เสียง",
    formatDesc: (t, c, s) => `เพื่อฝึกหมวดหมู่ «<strong>${t}</strong>» คุณต้องดาวน์โหลดไฟล์เสียง (${c} คำ, ~${s} MB) ดาวน์โหลดเลยหรือไม่?`,
    downloadBtn: (s) => `📥 ดาวน์โหลด (~${s} MB)`,
    cancelBtn: "ยกเลิก",
    retryBtn: "ลองใหม่",
    downloading: "กำลังดาวน์โหลดไฟล์เสียง..."
  },
  ko: {
    title: "오디오 파일 다운로드",
    formatDesc: (t, c, s) => `'<strong>${t}</strong>' 카테고리를 연습하려면 오디오 파일(${c}개 단어, 약 ${s} MB)을 다운로드해야 합니다. 지금 다운로드하시겠습니까?`,
    downloadBtn: (s) => `📥 다운로드 (~${s} MB)`,
    cancelBtn: "취소",
    retryBtn: "다시 시도",
    downloading: "오디오 파일 다운로드 중..."
  },
  ja: {
    title: "音声ファイルをダウンロード",
    formatDesc: (t, c, s) => `カテゴリー「<strong>${t}</strong>」を練習するには音声ファイル（${c}語、~${s} MB）のダウンロードが必要です。今すぐダウンロードしますか？`,
    downloadBtn: (s) => `📥 ダウンロード (~${s} MB)`,
    cancelBtn: "キャンセル",
    retryBtn: "再試行",
    downloading: "音声ファイルをダウンロード中..."
  },


  zh: {
    title: "下载音频文件",
    formatDesc: (t, c, s) => `练习“<strong>${t}</strong>”分类需要下载音频文件（${c} 个单词，约 ${s} MB）。现在下载吗？`,
    downloadBtn: (s) => `📥 下载（约 ${s} MB）`,
    cancelBtn: "取消",
    retryBtn: "重试",
    downloading: "正在下载音频文件..."
  },
  bn: {
    title: "অডিও ফাইল ডাউনলোড করুন",
    formatDesc: (t, c, s) => `«<strong>${t}</strong>» বিভাগটি অনুশীলনের জন্য অডিও ফাইল (${c}টি শব্দ, ~${s} MB) ডাউনলোড করতে হবে। এখন ডাউনলোড করবেন?`,
    downloadBtn: (s) => `📥 ডাউনলোড করুন (~${s} MB)`,
    cancelBtn: "বাতিল",
    retryBtn: "পুনরায় চেষ্টা করুন",
    downloading: "অডিও ফাইল ডাউনলোড হচ্ছে..."
  },
  fa: {
    title: "دانلود فایل‌های صوتی",
    formatDesc: (t, c, s) => `برای تمرین دسته‌بندی «<strong>${t}</strong>»، باید فایل‌های صوتی (${c} کلمه، ~${s} MB) را دانلود کنید. اکنون دانلود شود؟`,
    downloadBtn: (s) => `📥 دانلود (~${s} MB)`,
    cancelBtn: "لغو",
    retryBtn: "تلاش مجدد",
    downloading: "در حال دانلود فایل‌های صوتی..."
  },
  ur: {
    title: "آڈیو فائلیں ڈاؤن لوڈ کریں",
    formatDesc: (t, c, s) => `زمرہ "<strong>${t}</strong>" کی مشق کے لیے آڈیو فائلیں ڈاؤن لوڈ کرنا ضروری ہیں (${c} الفاظ، ~${s} MB)۔ کیا ابھی ڈاؤن لوڈ کریں؟`,
    downloadBtn: (s) => `📥 ڈاؤن لوڈ کریں (~${s} MB)`,
    cancelBtn: "منسوخ",
    retryBtn: "دوبارہ کوشش کریں",
    downloading: "آڈیو فائلیں ڈاؤن لوڈ ہو رہی ہیں..."
  },
  kk: {
    title: "Аудиофайлдарды жүктеу",
    formatDesc: (t, c, s) => `«<strong>${t}</strong>» санатын жаттықтыру үшін аудиофайлдарды жүктеп алу қажет (${c} сөз, ~${s} МБ). Қазір жүктейсіз бе?`,
    downloadBtn: (s) => `📥 Жүктеп алу (~${s} МБ)`,
    cancelBtn: "Бас тарту",
    retryBtn: "Қайталау",
    downloading: "Аудиофайлдар жүктелуде..."
  },
};

export function getUkVoiceModalStrings() {
  const lang = getInterfaceLanguage();
  return UK_VOICE_MODAL_I18N[lang] || UK_VOICE_MODAL_I18N['en'] || UK_VOICE_MODAL_I18N['ru'];
}

export function getCategoryVoiceModalStrings(categoryTitle, count, sizeMb) {
  const lang = getInterfaceLanguage();
  const entry = CAT_VOICE_MODAL_I18N[lang] || CAT_VOICE_MODAL_I18N['en'] || CAT_VOICE_MODAL_I18N['ru'];
  return {
    title: entry.title,
    desc: entry.formatDesc(categoryTitle, count, sizeMb),
    downloadBtn: entry.downloadBtn(sizeMb),
    cancelBtn: entry.cancelBtn,
    retryBtn: entry.retryBtn,
    downloading: entry.downloading
  };
}

try {
  if (typeof window !== 'undefined') {
    ensureLocaleLoaded(getInterfaceLanguage()).catch(() => {});
  }
} catch (e) {}

