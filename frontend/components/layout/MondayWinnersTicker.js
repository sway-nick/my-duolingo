import { getCachedLeaderboard, getLeaderboard, formatCompactXp } from '../../services/api.js?v=386.0';
import { getRecentWeekKeys, getIsoWeekKey } from '../../services/weekKey.js?v=386.0';
import { t, getInterfaceLanguage } from '../../services/i18n.js?v=386.0';

const TICKER_TEXTS = {
  ru: { badge: 'ТОП-4', badgeTitle: 'Лига недели завершена', intro: 'Лига недели завершена! Поздравляем лидеров:', rank1: '1 место', rank2: '2 место', rank3: '3 место', rank4: '4 место', outro: 'Началась новая лига! Удачи в тренировках!', close: 'Закрыть' },
  uk: { badge: 'ТОП-4', badgeTitle: 'Ліга тижня завершена', intro: 'Ліга тижня завершена! Вітаємо лідерів:', rank1: '1 місце', rank2: '2 місце', rank3: '3 місце', rank4: '4 місце', outro: 'Розпочалася нова ліга! Успіхів у тренуваннях!', close: 'Закрити' },
  en: { badge: 'TOP-4', badgeTitle: 'Weekly League finished', intro: 'Weekly League completed! Congratulations to the leaders:', rank1: '1st place', rank2: '2nd place', rank3: '3rd place', rank4: '4th place', outro: 'A new league has begun! Good luck with training!', close: 'Close' },
  de: { badge: 'TOP-4', badgeTitle: 'Wochenliga beendet', intro: 'Wochenliga beendet! Herzlichen Glückwunsch an die Besten:', rank1: '1. Platz', rank2: '2. Platz', rank3: '3. Platz', rank4: '4. Platz', outro: 'Eine neue Liga hat begonnen! Viel Erfolg!', close: 'Schließen' },
  es: { badge: 'TOP-4', badgeTitle: 'Liga semanal finalizada', intro: '¡Liga semanal finalizada! Felicitaciones a los líderes:', rank1: '1.er puesto', rank2: '2.º puesto', rank3: '3.er puesto', rank4: '4.º puesto', outro: '¡Comenzó una nueva liga! ¡Éxito en el aprendizaje!', close: 'Cerrar' },
  fr: { badge: 'TOP-4', badgeTitle: 'Ligue hebdomadaire terminée', intro: 'Ligue hebdomadaire terminée ! Félicitations aux vainqueurs :', rank1: '1ère place', rank2: '2e place', rank3: '3e place', rank4: '4e place', outro: 'Une nouvelle ligue commence ! Bon apprentissage !', close: 'Fermer' },
  pl: { badge: 'TOP-4', badgeTitle: 'Liga tygodnia zakończona', intro: 'Liga tygodnia zakończona! Gratulacje dla liderów:', rank1: '1. miejsce', rank2: '2. miejsce', rank3: '3. miejsce', rank4: '4. miejsce', outro: 'Rozpoczęła się nowa liga! Powodzenia w nauce!', close: 'Zamknij' },
  tr: { badge: 'TOP-4', badgeTitle: 'Haftalık Lig tamamlandı', intro: 'Haftalık Lig tamamlandı! Liderleri tebrik ederiz:', rank1: '1. sıra', rank2: '2. sıra', rank3: '3. sıra', rank4: '4. sıra', outro: 'Yeni bir lig başladı! Eğitimde başarılar!', close: 'Kapat' },
  it: { badge: 'TOP-4', badgeTitle: 'Lega settimanale conclusa', intro: 'Lega settimanale conclusa! Congratulazioni ai leader:', rank1: '1º posto', rank2: '2º posto', rank3: '3º posto', rank4: '4º posto', outro: 'È iniziata una nuova lega! Buono studio!', close: 'Chiudi' },
  ro: { badge: 'TOP-4', badgeTitle: 'Liga săptămânii s-a încheiat', intro: 'Liga săptămânii s-a încheiat! Felicitări liderilor:', rank1: 'Locul 1', rank2: 'Locul 2', rank3: 'Locul 3', rank4: 'Locul 4', outro: 'A început o nouă ligă! Succes la antrenamente!', close: 'Închide' },
  bg: { badge: 'ТОП-4', badgeTitle: 'Седмичната лига приключи', intro: 'Седмичната лига приключи! Поздравления за лидерите:', rank1: '1-во място', rank2: '2-ро място', rank3: '3-то място', rank4: '4-то място', outro: 'Започна нова лига! Успех в тренировките!', close: 'Затвори' },
  hu: { badge: 'TOP-4', badgeTitle: 'A heti liga véget ért', intro: 'A heti liga véget ért! Gratulálunk a vezetőknek:', rank1: '1. hely', rank2: '2. hely', rank3: '3. hely', rank4: '4. hely', outro: 'Új liga indult! Sok sikert a tanuláshoz!', close: 'Bezárás' },
  el: { badge: 'TOP-4', badgeTitle: 'Το εβδομαδιαίο πρωτάθλημα ολοκληρώθηκε', intro: 'Το εβδομαδιαίο πρωτάθλημα ολοκληρώθηκε! Συγχαρητήρια στους νικητές:', rank1: '1η θέση', rank2: '2η θέση', rank3: '3η θέση', rank4: '4η θέση', outro: 'Ξεκίνησε νέο πρωτάθλημα! Καλή επιτυχία!', close: 'Κλείσιμο' },
  da: { badge: 'TOP-4', badgeTitle: 'Ugeligaen er afsluttet', intro: 'Ugeligaen er afsluttet! Tillykke til vinderne:', rank1: '1. plads', rank2: '2. plads', rank3: '3. plads', rank4: '4. plads', outro: 'En ny liga er begyndt! Held og lykke med træningen!', close: 'Luk' },
  lv: { badge: 'TOP-4', badgeTitle: 'Nedēļas līga ir noslēgusies', intro: 'Nedēļas līga ir noslēgusies! Apsveicam līderus:', rank1: '1. vieta', rank2: '2. vieta', rank3: '3. vieta', rank4: '4. vieta', outro: 'Ir sākusies jauna līga! Veiksmi treniņos!', close: 'Aizvērt' },
  lt: { badge: 'TOP-4', badgeTitle: 'Savaitės lyga baigėsi', intro: 'Savaitės lyga baigėsi! Sveikiname lyderius:', rank1: '1 vieta', rank2: '2 vieta', rank3: '3 vieta', rank4: '4 vieta', outro: 'Prasidėjo nauja lyga! Sėkmės treniruotėse!', close: 'Uždaryti' },
  pt: { badge: 'TOP-4', badgeTitle: 'Liga semanal encerrada', intro: 'Liga semanal concluída! Parabéns aos líderes:', rank1: '1º lugar', rank2: '2º lugar', rank3: '3º lugar', rank4: '4º lugar', outro: 'Uma nova liga começou! Boa sorte nos treinos!', close: 'Fechar' },
  sk: { badge: 'TOP-4', badgeTitle: 'Týždenná liga skončila', intro: 'Týždenná liga skončila! Gratulujeme lídrom:', rank1: '1. miesto', rank2: '2. miesto', rank3: '3. miesto', rank4: '4. miesto', outro: 'Začala sa nová liga! Veľa šťastia v tréningu!', close: 'Zavrieť' },
  sl: { badge: 'TOP-4', badgeTitle: 'Tedenska liga je končana', intro: 'Tedenska liga je končana! Čestitke vodilnim:', rank1: '1. mesto', rank2: '2. mesto', rank3: '3. mesto', rank4: '4. mesto', outro: 'Začela se je nova liga! Srečno pri učenju!', close: 'Zapri' },
  fi: { badge: 'TOP-4', badgeTitle: 'Viikkoliiga on päättynyt', intro: 'Viikkoliiga on päättynyt! Onnittelut kärkinelikolle:', rank1: '1. sija', rank2: '2. sija', rank3: '3. sija', rank4: '4. sija', outro: 'Uusi liiga on alkanut! Onnea harjoitteluun!', close: 'Sulje' },
  hr: { badge: 'TOP-4', badgeTitle: 'Tjedna liga je završena', intro: 'Tjedna liga je završena! Čestitamo vodećima:', rank1: '1. mjesto', rank2: '2. mjesto', rank3: '3. mjesto', rank4: '4. mjesto', outro: 'Počela je nova liga! Sretno s vježbanjem!', close: 'Zatvori' },
  cs: { badge: 'TOP-4', badgeTitle: 'Týdenní liga skončila', intro: 'Týdenní liga skončila! Gratulujeme vítězům:', rank1: '1. místo', rank2: '2. místo', rank3: '3. místo', rank4: '4. místo', outro: 'Začala nová liga! Hodně štěstí při tréninku!', close: 'Zavřít' },
  sv: { badge: 'TOP-4', badgeTitle: 'Veckoligan är avslutad', intro: 'Veckoligan är avslutad! Grattis till ledarna:', rank1: '1:a plats', rank2: '2:a plats', rank3: '3:e plats', rank4: '4:e plats', outro: 'En ny liga har börjat! Lycka till med träningen!', close: 'Stäng' },
  et: { badge: 'TOP-4', badgeTitle: 'Nädalaliiga on lõppenud', intro: 'Nädalaliiga on lõppenud! Õnnitleme liidreid:', rank1: '1. koht', rank2: '2. koht', rank3: '3. koht', rank4: '4. koht', outro: 'Uus liiga on alanud! Edu treeningutel!', close: 'Sulge' },
  hi: { badge: 'TOP-4', badgeTitle: 'साप्ताहिक लीग समाप्त', intro: 'साप्ताहिक लीग पूरी हुई! विजेताओं को बधाई:', rank1: '1ला स्थान', rank2: '2रा स्थान', rank3: '3रा स्थान', rank4: '4था स्थान', outro: 'नई लीग शुरू हो गई है! अभ्यास के लिए शुभकामनाएँ!', close: 'बंद करें' },
  bn: { badge: 'TOP-4', badgeTitle: 'সাপ্তাহিক লীগ সমাপ্ত', intro: 'সাপ্তাহিক লীগ সম্পন্ন হয়েছে! বিজয়ীদের অভিনন্দন:', rank1: '১ম স্থান', rank2: '২য় স্থান', rank3: '৩য় স্থান', rank4: '৪র্থ স্থান', outro: 'নতুন লীগ শুরু হয়েছে! অনুশীলনের জন্য শুভকামনা!', close: 'বন্ধ করুন' },
  ar: { badge: 'TOP-4', badgeTitle: 'انتهى دوري الأسبوع', intro: 'اكتمل دوري الأسبوع! تهانينا للمتصدرين:', rank1: 'المركز 1', rank2: 'المركز 2', rank3: 'المركز 3', rank4: 'المركز 4', outro: 'بدأ دوري جديد! حظاً موفقاً في التدريب!', close: 'إغلاق' },
  fa: { badge: 'TOP-4', badgeTitle: 'لیگ هفتگی به پایان رسید', intro: 'لیگ هفتگی تکمیل شد! تبریک به نفرات برتر:', rank1: 'مقام ۱', rank2: 'مقام ۲', rank3: 'مقام ۳', rank4: 'مقام ۴', outro: 'لیگ جدید آغاز شد! در تمرینات موفق باشید!', close: 'بستن' },
  ur: { badge: 'TOP-4', badgeTitle: 'ہفتہ وار لیگ مکمل', intro: 'ہفتہ وار لیگ مکمل ہو گئی! سرفہرست کھلاڑیوں کو مبارکباد:', rank1: 'پہلی پوزیشن', rank2: 'دوسری پوزیشن', rank3: 'تیسری پوزیشن', rank4: 'چوتھی پوزیشن', outro: 'نئی لیگ شروع ہو گئی ہے! مشق کے لیے نیک تمنائیں!', close: 'بند کریں' },
  id: { badge: 'TOP-4', badgeTitle: 'Liga Mingguan selesai', intro: 'Liga Mingguan selesai! Selamat kepada para pemimpin:', rank1: 'Juara 1', rank2: 'Juara 2', rank3: 'Juara 3', rank4: 'Juara 4', outro: 'Liga baru telah dimulai! Semoga sukses berlatih!', close: 'Tutup' },
  vi: { badge: 'TOP-4', badgeTitle: 'Giải đấu tuần đã kết thúc', intro: 'Giải đấu tuần đã hoàn thành! Chúc mừng những người dẫn đầu:', rank1: 'Hạng 1', rank2: 'Hạng 2', rank3: 'Hạng 3', rank4: 'Hạng 4', outro: 'Giải đấu mới đã bắt đầu! Chúc bạn luyện tập tốt!', close: 'Đóng' },
  th: { badge: 'TOP-4', badgeTitle: 'ลีกประจำสัปดาห์สิ้นสุดแล้ว', intro: 'ลีกประจำสัปดาห์เสร็จสิ้นแล้ว! ขอแสดงความยินดีกับผู้นำ:', rank1: 'อันดับ 1', rank2: 'อันดับ 2', rank3: 'อันดับ 3', rank4: 'อันดับ 4', outro: 'ลีกใหม่เริ่มขึ้นแล้ว! ขอให้โชคดีในการฝึกฝน!', close: 'ปิด' },
  ko: { badge: 'TOP-4', badgeTitle: '주간 리그 종료', intro: '주간 리그가 완료되었습니다! 선두 주자들에게 축하를 보냅니다:', rank1: '1위', rank2: '2위', rank3: '3위', rank4: '4위', outro: '새로운 리그가 시작되었습니다! 학습에 행운을 빕니다!', close: '닫기' },
  ja: { badge: 'TOP-4', badgeTitle: '週間リーグ終了', intro: '週間リーグが終了しました！上位入賞者のみなさんおめでとうございます：', rank1: '1位', rank2: '2位', rank3: '3位', rank4: '4位', outro: '新しいリーグが始まりました！トレーニング頑張ってください！', close: '閉じる' },
  zh: { badge: 'TOP-4', badgeTitle: '本周联赛已结束', intro: '本周联赛圆满结束！祝贺领先榜前四名：', rank1: '第1名', rank2: '第2名', rank3: '第3名', rank4: '第4名', outro: '新一轮联赛已开启！祝学习顺利！', close: '关闭' },
  kk: { badge: 'ТОП-4', badgeTitle: 'Апта лигасы аяқталды', intro: 'Апта лигасы аяқталды! Көшбасшыларды құттықтаймыз:', rank1: '1 орын', rank2: '2 орын', rank3: '3 орын', rank4: '4 орын', outro: 'Жаңа лига басталды! Жаттығуларға сәттілік!', close: 'Жабу' },
};

function getTickerTexts() {
  const lang = (getInterfaceLanguage ? getInterfaceLanguage() : 'ru').toLowerCase();
  return TICKER_TEXTS[lang] || TICKER_TEXTS.en || TICKER_TEXTS.ru;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTop4Winners(weekKey) {
  let lb = getCachedLeaderboard(weekKey, 'week');
  let players = (lb && Array.isArray(lb.data)) ? lb.data.filter((p) => p && p.name) : [];

  if (players.length < 4) {
    const curWeekKey = getIsoWeekKey();
    if (weekKey !== curWeekKey) {
      const curLb = getCachedLeaderboard(curWeekKey, 'week');
      const curPlayers = (curLb && Array.isArray(curLb.data)) ? curLb.data.filter((p) => p && p.name) : [];
      if (curPlayers.length > players.length) {
        players = curPlayers;
      }
    }
  }

  const defaultWinners = [
    { name: 'Elena', xp: 2450 },
    { name: 'Alex', xp: 1980 },
    { name: 'Max', xp: 1620 },
    { name: 'Anna', xp: 1350 },
  ];

  const winners = [];
  for (let i = 0; i < 4; i++) {
    if (players[i] && Number(players[i].xp || 0) > 0) {
      winners.push({
        name: players[i].name || defaultWinners[i].name,
        xp: Number(players[i].xp || 0),
        isCurrentUser: Boolean(players[i].isCurrentUser),
      });
    } else {
      winners.push(defaultWinners[i]);
    }
  }

  return winners;
}

function buildMarqueeHtml(winners, texts) {
  const medals = ['🥇', '🥈', '🥉', '🎖️'];

  const items = winners.map((w, idx) => {
    const medal = medals[idx] || '🎖️';
    const xpFormatted = formatCompactXp ? formatCompactXp(w.xp) : `${w.xp}`;
    const highlightClass = w.isCurrentUser ? 'ticker-player-you' : '';
    const youLabel = (t('lead_guest_name') || 'You').replace(/\s*\([^)]*\)/g, '');
    const youSuffix = w.isCurrentUser ? ` <span>(${escapeHtml(youLabel)})</span>` : '';

    return `
      <span class="ticker-player-item ${highlightClass}">
        <span class="ticker-medal">${medal}</span>
        <strong class="ticker-player-name">${escapeHtml(w.name)}${youSuffix}</strong>
        <span class="ticker-player-xp">${xpFormatted} XP</span>
      </span>
    `;
  });

  return `
    <span class="ticker-intro">🏆 ${texts.intro}</span>
    <span class="ticker-bullet">•</span>
    ${items.join(' <span class="ticker-bullet">•</span> ')}
    <span class="ticker-bullet">•</span>
    <span class="ticker-outro">🎉 ${texts.outro}</span>
    <span class="ticker-spacer">✦</span>
  `;
}

let isTickerActive = false;

export function shouldShowMondayTicker(force = false) {
  // Disabled per product decision
  return false;
}

export function renderMondayWinnersTicker(options = {}) {
  const { force = false } = options;
  if (!shouldShowMondayTicker(force)) {
    return;
  }

  const container = document.querySelector('#monday-ticker-container');
  if (!container) return;

  const curWeekKey = getIsoWeekKey();
  const seenKey = `myduo_ticker_seen_week_${curWeekKey}`;
  const dismissKey = `myduo_monday_ticker_dismissed_${curWeekKey}`;

  const recentWeeks = getRecentWeekKeys(2);
  const prevWeekKey = recentWeeks[1] || recentWeeks[0];

  const texts = getTickerTexts();
  let winners = getTop4Winners(prevWeekKey);

  // Remove existing ticker if already present
  const existingTicker = container.querySelector('#monday-winners-ticker');
  if (existingTicker) existingTicker.remove();

  const marqueeHtml = buildMarqueeHtml(winners, texts);

  const tickerEl = document.createElement('div');
  tickerEl.id = 'monday-winners-ticker';
  tickerEl.className = 'monday-winners-ticker';
  tickerEl.setAttribute('role', 'region');
  tickerEl.setAttribute('aria-label', texts.badgeTitle);
  tickerEl.title = `${texts.badgeTitle}. ${t('header_rank_click_hint') || 'Click to open leaderboard'}`;

  tickerEl.innerHTML = `
    <div class="ticker-badge" title="${texts.badgeTitle}">
      <span class="ticker-badge-trophy">🏆</span>
      <span class="ticker-badge-text">${texts.badge}</span>
    </div>
    <div class="ticker-marquee-wrapper" id="ticker-marquee-wrapper">
      <div class="ticker-track">
        <div class="ticker-content">${marqueeHtml}</div>
        <div class="ticker-content" aria-hidden="true">${marqueeHtml}</div>
      </div>
    </div>
    <button type="button" class="ticker-close-btn" id="ticker-close-btn" title="${texts.close}" aria-label="${texts.close}">✕</button>
  `;

  // Show ticker exactly 2 times (2 complete marquee passes), then smoothly dismiss
  let loopCount = 0;
  const track = tickerEl.querySelector('.ticker-track');
  if (track) {
    track.addEventListener('animationiteration', () => {
      loopCount++;
      if (loopCount >= 2) {
        tickerEl.classList.add('ticker-dismissing');
        setTimeout(() => {
          tickerEl.remove();
          isTickerActive = false;
        }, 350);
        try {
          localStorage.setItem(seenKey, '1');
        } catch (err) {}
      }
    });
  }

  // Click on ticker (except close button) -> Navigate to Leaderboard
  tickerEl.addEventListener('click', (e) => {
    if (e.target.closest('#ticker-close-btn')) return;
    if (typeof window.setActiveTab === 'function') {
      window.setActiveTab('leaderboard');
    }
  });

  // Close button dismiss handler
  const closeBtn = tickerEl.querySelector('#ticker-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      tickerEl.classList.add('ticker-dismissing');
      setTimeout(() => {
        tickerEl.remove();
        isTickerActive = false;
      }, 300);
      try {
        sessionStorage.setItem(dismissKey, '1');
        localStorage.setItem(seenKey, '1');
      } catch (err) {}
    });
  }

  container.appendChild(tickerEl);
  isTickerActive = true;

  // Background refresh from Firestore if available
  getLeaderboard(prevWeekKey, 'week').then((res) => {
    if (res && Array.isArray(res.data) && res.data.length >= 4) {
      const freshWinners = getTop4Winners(prevWeekKey);
      const freshHtml = buildMarqueeHtml(freshWinners, texts);
      const contents = tickerEl.querySelectorAll('.ticker-content');
      contents.forEach((c) => {
        c.innerHTML = freshHtml;
      });
    }
  }).catch(() => {});
}

export function updateMondayTickerTabVisibility(currentTab) {
  const container = document.querySelector('#monday-ticker-container');
  if (!container) return;

  // Show ticker specifically on the main training screen
  if (currentTab === 'training') {
    container.style.display = 'block';
    if (!container.querySelector('#monday-winners-ticker') && shouldShowMondayTicker(false)) {
      renderMondayWinnersTicker();
    }
  } else {
    // Hide ticker on other secondary tabs to keep dictionary/leaderboard/settings views clean
    container.style.display = 'none';
  }
}

export function initMondayWinnersTickerListener() {
  if (typeof window !== 'undefined') {
    window.addEventListener('myduo:show_monday_ticker', (e) => {
      const force = Boolean(e?.detail?.force);
      const container = document.querySelector('#monday-ticker-container');
      if (container) container.style.display = 'block';
      renderMondayWinnersTicker({ force: true });
    });
  }
}
