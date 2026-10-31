const fs = require('fs');
const path = require('path');

// 1. Load parsed 37 dialogues
const dialogues = JSON.parse(fs.readFileSync(path.join(__dirname, 'parsed_37_dialogues.json'), 'utf8'));

console.log(`Loaded ${dialogues.length} dialogues.`);

// 2. Exact 36 locales modal title translations
const MODAL_TITLE_TRANSLATIONS = {
  ru: "Поздравляем! Вы открыли следующий текст",
  uk: "Вітаємо! Ви відкрили наступний текст",
  en: "Congratulations! You have unlocked the next text",
  de: "Herzlichen Glückwunsch! Du hast den nächsten Text freigeschaltet",
  es: "¡Felicitaciones! Has desbloqueado el siguiente texto",
  fr: "Félicitations ! Vous avez débloqué le texte suivant",
  pl: "Gratulacje! Odblokowałeś kolejny tekst",
  tr: "Tebrikler! Bir sonraki metnin kilidini açtınız",
  it: "Congratulazioni! Hai sbloccato il testo successivo",
  ro: "Felicitări! Ai deblocat următorul text",
  bg: "Поздравления! Отключихте следващия текст",
  hu: "Gratulálunk! Feloldottad a következő szöveget",
  el: "Συγχαρητήρια! Ξεκλειδώσατε το επόμενο κείμενο",
  da: "Tillykke! Du har låst op for den næste tekst",
  lv: "Apsveicam! Jūs esat atbloķējis nākamo tekstu",
  lt: "Sveikiname! Atrakinote kitą tekstą",
  pt: "Parabéns! Você desbloqueou o próximo texto",
  sk: "Gratulujeme! Odomkli ste ďalší text",
  sl: "Čestitamo! Odklenili ste naslednje besedilo",
  fi: "Onnittelut! Olet avannut seuraavan tekstin",
  hr: "Čestitamo! Otključali ste sljedeći tekst",
  cs: "Gratulujeme! Odemkli jste další text",
  sv: "Grattis! Du har låst upp nästa text",
  et: "Õnnitleme! Olete avanud järgmise teksti",
  hi: "बधाई हो! आपने अगला पाठ अनलॉक कर लिया है",
  bn: "অভিনন্দন! আপনি পরবর্তী পাঠ আনলক করেছেন",
  ar: "تهانينا! لقد قمت بفتح النص التالي",
  fa: "تبریک! شما متن بعدی را باز کردید",
  ur: "مبارک ہو! آپ نے اگلا متن کھول لیا ہے",
  id: "Selamat! Anda telah membuka teks berikutnya",
  vi: "Chúc mừng! Bạn đã mở khóa văn bản tiếp theo",
  th: "ยินดีด้วย! คุณได้ปลดล็อกข้อความถัดไปแล้ว",
  ko: "축하합니다! 다음 텍스트를 잠금 해제했습니다",
  ja: "おめでとうございます！次のテキストがアンロックされました",
  zh: "恭喜！您已解锁下一篇文章",
  kk: "Құттықтаймыз! Келесі мәтінді аштыңыз"
};

const DIALOGUES_FOLDER_TITLE = {
  ru: "Диалоги",
  uk: "Діалоги",
  en: "Dialogues",
  de: "Dialoge",
  es: "Diálogos",
  fr: "Dialogues",
  pl: "Dialogi",
  tr: "Diyaloglar",
  it: "Dialoghi",
  ro: "Dialoguri",
  bg: "Диалози",
  hu: "Párbeszédek",
  el: "Διάλογοι",
  da: "Dialoger",
  lv: "Dialogi",
  lt: "Dialogai",
  pt: "Diálogos",
  sk: "Dialógy",
  sl: "Dialogi",
  fi: "Vuoropuhelut",
  hr: "Dijalozi",
  cs: "Dialogy",
  sv: "Dialoger",
  et: "Dialoogid",
  hi: "संवाद",
  bn: "কথোপকথন",
  ar: "حوارات",
  fa: "گفتگوها",
  ur: "مکالمات",
  id: "Dialog",
  vi: "Hội thoại",
  th: "บทสนทนา",
  ko: "대화",
  ja: "対話",
  zh: "对话",
  kk: "Диалогтар"
};

const DIALOGUES_FOLDER_DESC = {
  ru: "Диалоги по выученным словам",
  uk: "Діалоги за вивченими словами",
  en: "Dialogues from learned words",
  de: "Dialoge basierend auf gelernten Wörtern",
  es: "Diálogos con palabras aprendidas",
  fr: "Dialogues à partir des mots appris",
  pl: "Dialogi z poznanych słów",
  tr: "Öğrenilen kelimelerle diyaloglar",
  it: "Dialoghi con le parole imparate",
  ro: "Dialoguri cu cuvintele învățate",
  bg: "Диалози от научените думи",
  hu: "Párbeszédek a megtanult szavakból",
  el: "Διάλογοι από τις λέξεις που μάθατε",
  da: "Dialoger fra lærte ord",
  lv: "Dialogi no iemācītajiem vārdiem",
  lt: "Dialogai iš išmoktų žodžių",
  pt: "Diálogos com palavras aprendidas",
  sk: "Dialógy z naučených slov",
  sl: "Dialogi iz naučenih besed",
  fi: "Vuoropuhelut opituista sanoista",
  hr: "Dijalozi iz naučenih riječi",
  cs: "Dialogy z naučených slov",
  sv: "Dialoger med inlärda ord",
  et: "Dialoogid õpitud sõnadest",
  hi: "सीखे गए शब्दों से संवाद",
  bn: "শেখা शब्द দিয়ে কথোপকথন",
  ar: "حوارات من الكلمات المكتسبة",
  fa: "گفتگوها با کلمات آموخته‌شده",
  ur: "سیکھے گئے الفاظ سے مکالمات",
  id: "Dialog dari kata yang dipelajari",
  vi: "Hội thoại từ các từ đã học",
  th: "บทสนทนาจากคำศัพท์ที่เรียนรู้",
  ko: "학습한 단어로 이루어진 대화",
  ja: "学習した単語による対話",
  zh: "基于已学单词的对话",
  kk: "Үйренген сөздерден құралған диалогтар"
};

const SETTINGS_BTN_TRANSLATIONS = {
  ru: "💬 Диалоги по рубежам",
  uk: "💬 Діалоги за рубежами",
  en: "💬 Milestone Dialogues",
  de: "💬 Meilenstein-Dialoge",
  es: "💬 Diálogos por hitos",
  fr: "💬 Dialogues d'étapes",
  pl: "💬 Dialogi według kamieni milowych",
  tr: "💬 Hedef Diyalogları",
  it: "💬 Dialoghi dei traguardi",
  ro: "💬 Dialoguri pe etape",
  bg: "💬 Диалози по рубежи",
  hu: "💬 Mérföldkő párbeszédek",
  el: "💬 Διάλογοι οροσήμων",
  da: "💬 Milepæl-dialoger",
  lv: "💬 Pavērsienu dialogi",
  lt: "💬 Gairių dialogai",
  pt: "💬 Diálogos por marcos",
  sk: "💬 Míľnikové dialógy",
  sl: "💬 Mejniški dialogi",
  fi: "💬 Virstanpylväsvuoropuhelut",
  hr: "💬 Dijalozi po prekretnicama",
  cs: "💬 Milníkové dialogy",
  sv: "💬 Milstolpedialoger",
  et: "💬 Teetähiste dialoogid",
  hi: "💬 मील का पत्थर संवाद",
  bn: "💬 মাইলফলক কথোপকথন",
  ar: "💬 حوارات الإنجازات",
  fa: "💬 گفتگوهای نقطه عطف",
  ur: "💬 سنگ میل مکالمات",
  id: "💬 Dialog Pencapaian",
  vi: "💬 Hội thoại cột mốc",
  th: "💬 บทสนทนาก้าวสำคัญ",
  ko: "💬 이정표 대화",
  ja: "💬 マイルストーン対話",
  zh: "💬 里程碑对话",
  kk: "💬 Межелік диалогтар"
};

// Badges helper
function getBadge(loc, m) {
  if (m === 0) {
    const startBadges = {
      ru: "🏆 Старт: 0 слов",
      uk: "🏆 Старт: 0 слів",
      en: "🏆 Start: 0 Words",
      de: "🏆 Start: 0 Wörter",
      es: "🏆 Inicio: 0 palabras",
      fr: "🏆 Début : 0 mots",
      pl: "🏆 Start: 0 słów",
      it: "🏆 Inizio: 0 parole",
      pt: "🏆 Início: 0 palavras",
      tr: "🏆 Başlangıç: 0 Kelime",
      ro: "🏆 Start: 0 cuvinte",
      bg: "🏆 Старт: 0 думи",
      hu: "🏆 Start: 0 szó",
      el: "🏆 Έναρξη: 0 λέξεις",
      da: "🏆 Start: 0 ord",
      lv: "🏆 Sākums: 0 vārdu",
      lt: "🏆 Pradžia: 0 žodžių",
      sk: "🏆 Štart: 0 slov",
      sl: "🏆 Začetek: 0 besed",
      fi: "🏆 Aloitus: 0 sanaa",
      hr: "🏆 Početak: 0 riječi",
      cs: "🏆 Start: 0 slov",
      sv: "🏆 Start: 0 ord",
      et: "🏆 Algus: 0 sõna",
      hi: "🏆 शुरुआत: 0 शब्द",
      bn: "🏆 শুরু: 0 শব্দ",
      ar: "🏆 البداية: 0 كلمة",
      fa: "🏆 شروع: 0 کلمه",
      ur: "🏆 آغاز: 0 الفاظ",
      id: "🏆 Mulai: 0 Kata",
      vi: "🏆 Bắt đầu: 0 từ",
      th: "🏆 เริ่มต้น: 0 คำ",
      ko: "🏆 시작: 0단어",
      ja: "🏆 スタート：0単語",
      zh: "🏆 起点：0个单词",
      kk: "🏆 Бастау: 0 сөз"
    };
    return startBadges[loc] || `🏆 Start: 0 Words`;
  }

  const milestoneBadges = {
    ru: `🏆 Рубеж: ${m} слов`,
    uk: `🏆 Рубіж: ${m} слів`,
    en: `🏆 Milestone: ${m} Words`,
    de: `🏆 Meilenstein: ${m} Wörter`,
    es: `🏆 Hito: ${m} palabras`,
    fr: `🏆 Étape : ${m} mots`,
    pl: `🏆 Kamień milowy: ${m} słów`,
    it: `🏆 Traguardo: ${m} parole`,
    pt: `🏆 Marco: ${m} palavras`,
    tr: `🏆 Hedef: ${m} Kelime`,
    ro: `🏆 Etapă: ${m} cuvinte`,
    bg: `🏆 Рубеж: ${m} думи`,
    hu: `🏆 Mérföldkő: ${m} szó`,
    el: `🏆 Ορόσημο: ${m} λέξεις`,
    da: `🏆 Milepæl: ${m} ord`,
    lv: `🏆 Pavērsiens: ${m} vārdu`,
    lt: `🏆 Gairė: ${m} žodžių`,
    sk: `🏆 Míľnik: ${m} slov`,
    sl: `🏆 Mejnik: ${m} besed`,
    fi: `🏆 Virstanpylväs: ${m} sanaa`,
    hr: `🏆 Prekretnica: ${m} riječi`,
    cs: `🏆 Milník: ${m} slov`,
    sv: `🏆 Milstolpe: ${m} ord`,
    et: `🏆 Teetähis: ${m} sõna`,
    hi: `🏆 मील का पत्थर: ${m} शब्द`,
    bn: `🏆 মাইলফলক: ${m} শব্দ`,
    ar: `🏆 إنجاز: ${m} كلمة`,
    fa: `🏆 نقطه عطف: ${m} کلمه`,
    ur: `🏆 سنگ میل: ${m} الفاظ`,
    id: `🏆 Pencapaian: ${m} Kata`,
    vi: `🏆 Cột mốc: ${m} từ`,
    th: `🏆 ก้าวสำคัญ: ${m} คำ`,
    ko: `🏆 이정표: ${m}단어`,
    ja: `🏆 マイルストーン：${m}単語`,
    zh: `🏆 里程碑：${m}个单词`,
    kk: `🏆 Меже: ${m} сөз`
  };
  return milestoneBadges[loc] || `🏆 Milestone: ${m} Words`;
}

// 3. Read base strings from current storyTranslations.js
async function run() {
  const currentTranslationsModule = await import('../frontend/components/modals/storyTranslations.js');
  const currentTranslations = currentTranslationsModule.STORY_TRANSLATIONS;

  const baseKeys = [
    'btnShowTranslation',
    'btnHideTranslation',
    'btnUnderstood',
    'translationTitle',
    'xpAwarded',
    'favAdded',
    'favRemoved',
    'storiesFolderTitle',
    'storiesFolderDesc',
    'storiesEmptyTitle',
    'storiesEmptyDesc',
    'readStoryBtn',
    'statusUnlocked',
    'statusLocked',
    'settingsBtn'
  ];

  const newTranslations = {};
  const targetLocales = Object.keys(MODAL_TITLE_TRANSLATIONS);

  for (const loc of targetLocales) {
    const existing = currentTranslations[loc] || currentTranslations['en'] || {};
    const obj = {};
    for (const k of baseKeys) {
      obj[k] = existing[k] || currentTranslations['en'][k] || '';
    }
    // Update modalTitle, storiesFolderTitle, storiesFolderDesc, settingsBtn
    obj['modalTitle'] = MODAL_TITLE_TRANSLATIONS[loc];
    obj['storiesFolderTitle'] = DIALOGUES_FOLDER_TITLE[loc] || 'Dialogues';
    obj['storiesFolderDesc'] = DIALOGUES_FOLDER_DESC[loc] || 'Dialogues from learned words';
    obj['settingsBtn'] = SETTINGS_BTN_TRANSLATIONS[loc] || '💬 Milestone Dialogues';

    // Add all 37 dialogues
    dialogues.forEach((d, idx) => {
      const m = (d.id - 1) * 50;
      const locData = d.locales[loc] || d.locales['en'];
      const rawLines = locData.content.split('\n').map(l => l.trim()).filter(Boolean);
      obj[`badge${m}`] = getBadge(loc, m);
      obj[`storyTitle${m}`] = locData.title || `Dialogue ${d.id}`;
      obj[`storyFull${m}`] = rawLines;
    });

    newTranslations[loc] = obj;
  }

  // Generate frontend/components/modals/storyTranslations.js
  const translationsFileContent = `// Single Source of Truth for Milestone Story Translations
// Exactly 36 official locales supported (milestones 0 to 1800, every 50 words)

export const STORY_TRANSLATIONS = ${JSON.stringify(newTranslations, null, 2)};

export function getStoryStrings(lang = 'ru') {
  if (lang === 'pt-br') lang = 'pt';
  if (lang === 'es-mx') lang = 'es';
  return STORY_TRANSLATIONS[lang] || STORY_TRANSLATIONS['ru'] || STORY_TRANSLATIONS['en'];
}
`;

  fs.writeFileSync(path.join(__dirname, '../frontend/components/modals/storyTranslations.js'), translationsFileContent, 'utf8');
  console.log('Successfully written frontend/components/modals/storyTranslations.js');

  // 4. Generate MILESTONE_STORIES for MilestoneStoryModal.js
  const storiesMap = {};
  dialogues.forEach(d => {
    const m = (d.id - 1) * 50;
    const enData = d.locales['en'];
    const rawLines = enData.content.split('\n').map(l => l.trim()).filter(Boolean);
    storiesMap[m] = {
      milestone: m,
      titleKey: `storyTitle${m}`,
      translationKey: `storyFull${m}`,
      badgeKey: `badge${m}`,
      title: enData.title,
      paragraphs: rawLines
    };
  });

  // Read current MilestoneStoryModal.js
  let modalJs = fs.readFileSync(path.join(__dirname, '../frontend/components/modals/MilestoneStoryModal.js'), 'utf8');

  // Replace MILESTONE_STORIES object
  const storiesMapJson = JSON.stringify(storiesMap, null, 2);
  const regexStories = /export const MILESTONE_STORIES = \{[\s\S]*?\n\};\n\n\/\/ Fallback/m;
  if (!regexStories.test(modalJs)) {
    throw new Error('Could not find MILESTONE_STORIES block in MilestoneStoryModal.js');
  }
  modalJs = modalJs.replace(regexStories, `export const MILESTONE_STORIES = ${storiesMapJson};\n\n// Fallback`);

  // Update default milestone from 100 to 0
  modalJs = modalJs.replace(/export async function showMilestoneStoryModal\(milestone = 100\)/g, 'export async function showMilestoneStoryModal(milestone = 0)');
  modalJs = modalJs.replace(/const storyData = MILESTONE_STORIES\[currentMilestone\] \|\| MILESTONE_STORIES\[100\];/g, 'const storyData = MILESTONE_STORIES[currentMilestone] || MILESTONE_STORIES[0];');

  // Check default badgeText
  modalJs = modalJs.replace(/const badgeText = strings\[storyData\.badgeKey\] \|\| `🏆 \$\{currentMilestone\} words`;/g, 'const badgeText = strings[storyData.badgeKey] || `🏆 ${currentMilestone} words`;');

  // Remove "Все понятно" button from HTML template and style translation button orange
  const oldFooterHtml = `      <div class="milestone-story-footer">
        <button class="story-btn-secondary" id="story-toggle-translation-btn">
          🎬 <span id="story-translation-btn-label">\${strings.btnShowTranslation}</span>
        </button>
        <button class="story-btn-primary" id="story-understood-btn">
          \${strings.btnUnderstood}
        </button>
      </div>`;

  const newFooterHtml = `      <div class="milestone-story-footer">
        <button class="story-btn-translation btn-orange" id="story-toggle-translation-btn">
          🎬 <span id="story-translation-btn-label">\${strings.btnShowTranslation}</span>
        </button>
      </div>`;

  modalJs = modalJs.replace(oldFooterHtml, newFooterHtml);

  // Add styles for .story-btn-translation
  const oldBtnSecStyle = `      .story-btn-secondary {
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
      }`;

  const newBtnSecStyle = `      .story-btn-translation {
        background: linear-gradient(180deg, #fb923c 0%, #ea580c 100%) !important;
        border: none !important;
        color: #ffffff !important;
        font-size: 15px !important;
        font-weight: 700 !important;
        padding: 13px 20px !important;
        min-height: 48px !important;
        border-radius: 16px !important;
        cursor: pointer !important;
        box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.45) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease !important;
        width: 100% !important;
      }
      .story-btn-translation:hover:not(:disabled) {
        filter: brightness(1.05) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 18px rgba(234, 88, 12, 0.45) !important;
      }
      .story-btn-translation:active:not(:disabled) {
        transform: translateY(1.5px) !important;
        box-shadow: 0 2px 6px rgba(234, 88, 12, 0.25) !important;
      }`;

  modalJs = modalJs.replace(oldBtnSecStyle, newBtnSecStyle);

  // Update understoodBtn event handling
  const oldUnderstoodLogic = `  // Button: Understood (+25 XP)
  understoodBtn.addEventListener('click', () => {
    localStorage.setItem(\`myduo_milestone_story_\${currentMilestone}_completed\`, 'true');
    localStorage.setItem(\`myduo_milestone_story_\${currentMilestone}_shown\`, 'true');

    // Award +25 XP
    try {
      addWeeklyXP(25);
    } catch (e) {}

    showStoryToast(strings.xpAwarded);
    closeModal();
  });`;

  const newUnderstoodLogic = `  // Mark story as viewed & completed on modal open
  localStorage.setItem(\`myduo_milestone_story_\${currentMilestone}_shown\`, 'true');
  const wasAlreadyCompleted = localStorage.getItem(\`myduo_milestone_story_\${currentMilestone}_completed\`) === 'true';
  if (!wasAlreadyCompleted) {
    localStorage.setItem(\`myduo_milestone_story_\${currentMilestone}_completed\`, 'true');
    try {
      addWeeklyXP(25);
      showStoryToast(strings.xpAwarded);
    } catch (e) {}
  }`;

  modalJs = modalJs.replace('const understoodBtn = overlay.querySelector(\'#story-understood-btn\');\n', '');
  modalJs = modalJs.replace(oldUnderstoodLogic, newUnderstoodLogic);

  fs.writeFileSync(path.join(__dirname, '../frontend/components/modals/MilestoneStoryModal.js'), modalJs, 'utf8');
  console.log('Successfully written frontend/components/modals/MilestoneStoryModal.js');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
