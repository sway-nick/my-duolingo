// Audio Listening Trainer for Cardinal Numbers (numbers) & Ordinal Numbers (ordinal_numbers)
// TimeTrainer-style 20-round listening quiz with 4 choices & 36-locale UI.

import {
  speakWordAsync,
  stopAllAudio,
  triggerHaptic,
  playSuccessSound,
  playErrorSound,
  playFanfareSound,
} from '../../services/audioService.js?v=423.0';
import { getInterfaceLanguage } from '../../services/i18n.js?v=423.0';
import { RTL_LOCALES } from '../../config/locales.js?v=423.0';
import { getCollectionWords } from '../../services/collectionsService.js?v=423.0';
import {
  getEffectiveUserId,
  getUserProgress,
  addWeeklyXP,
  pushUserDataToCloud,
} from '../../services/api.js?v=423.0';

export const NUMBER_AUDIO_ROUND_SIZE = 20;

export const NUMBER_AUDIO_TRAINER_I18N = {
  ar: { backBtn: 'رجوع', cardinalsTitle: 'اختبار الأرقام بالاستماع', ordinalsTitle: 'اختبار الأعداد الترتيبية بالاستماع', listenPrompt: 'استمع واختر الرقم الصحيح', replayHint: 'اضغط على السماعة للاستماع مجدداً', passTitle: 'ممتاز! تم اجتياز الاختبار', failTitle: 'جرّب مرة أخرى (المطلوب 80% فأكثر)', scoreLabel: 'النتيجة', bestLabel: 'أفضل نتيجة', retryBtn: '🔄 إعادة الاختبار', doneBtn: '✓ تم' },
  bn: { backBtn: 'ফিরে যান', cardinalsTitle: 'সংখ্যা শ্রবণ পরীক্ষা', ordinalsTitle: 'ক্রমবাচক সংখ্যা শ্রবণ পরীক্ষা', listenPrompt: 'শুনুন এবং সঠিক সংখ্যা বেছে নিন', replayHint: 'আবার শুনতে স্পিকারে ট্যাপ করুন', passTitle: 'দারুণ! পরীক্ষা উত্তীর্ণ', failTitle: 'আবার চেষ্টা করুন (৮০%+ প্রয়োজন)', scoreLabel: 'স্কোর', bestLabel: 'সেরা স্কোর', retryBtn: '🔄 আবার খেলুন', doneBtn: '✓ সম্পন্ন' },
  bg: { backBtn: 'Назад', cardinalsTitle: 'Аудио тест: Числа', ordinalsTitle: 'Аудио тест: Редни числителни', listenPrompt: 'Чуйте и изберете правилното число', replayHint: 'Натиснете високоговорителя за повторение', passTitle: 'Отлично! Тестът е преминат', failTitle: 'Опитайте отново (нужни са ≥ 80%)', scoreLabel: 'Резултат', bestLabel: 'Най-добър', retryBtn: '🔄 Опитай отново', doneBtn: '✓ Готово' },
  zh: { backBtn: '返回', cardinalsTitle: '基数词听力测试', ordinalsTitle: '序数词听力测试', listenPrompt: '听发音并选择正确的数字', replayHint: '点击喇叭可再次收听', passTitle: '太棒了！测试通过', failTitle: '再试一次（需达到 80% 以上）', scoreLabel: '得分', bestLabel: '最高分', retryBtn: '🔄 再测一次', doneBtn: '✓ 完成' },
  hr: { backBtn: 'Natrag', cardinalsTitle: 'Audio test: Brojevi', ordinalsTitle: 'Audio test: Redni brojevi', listenPrompt: 'Poslušajte i odaberite točan broj', replayHint: 'Dodirnite zvučnik za ponavljanje', passTitle: 'Odlično! Test je položen', failTitle: 'Pokušajte ponovno (potrebno ≥ 80%)', scoreLabel: 'Rezultat', bestLabel: 'Najbolji', retryBtn: '🔄 Pokušaj ponovno', doneBtn: '✓ Gotovo' },
  cs: { backBtn: 'Zpět', cardinalsTitle: 'Poslechový test: Čísla', ordinalsTitle: 'Poslechový test: Řadové číslovky', listenPrompt: 'Poslouchejte a vyberte správné číslo', replayHint: 'Klepněte na reproduktor pro zopakování', passTitle: 'Skvělé! Test splněn', failTitle: 'Zkuste to znovu (potřeba ≥ 80 %)', scoreLabel: 'Skóre', bestLabel: 'Nejlepší', retryBtn: '🔄 Zkusit znovu', doneBtn: '✓ Hotovo' },
  da: { backBtn: 'Tilbage', cardinalsTitle: 'Lyttetest: Tal', ordinalsTitle: 'Lyttetest: Ordenstal', listenPrompt: 'Lyt og vælg det rigtige tal', replayHint: 'Tryk på højttaleren for at høre igen', passTitle: 'Flot! Test bestået', failTitle: 'Prøv igen (kræver ≥ 80%)', scoreLabel: 'Resultat', bestLabel: 'Bedste', retryBtn: '🔄 Prøv igen', doneBtn: '✓ Færdig' },
  en: { backBtn: 'Back', cardinalsTitle: 'Numbers Audio Test', ordinalsTitle: 'Ordinals Audio Test', listenPrompt: 'Listen and choose the correct number', replayHint: 'Tap the speaker to hear again', passTitle: 'Great! Test passed', failTitle: 'Try again (80%+ required)', scoreLabel: 'Score', bestLabel: 'Best', retryBtn: '🔄 Try again', doneBtn: '✓ Done' },
  et: { backBtn: 'Tagasi', cardinalsTitle: 'Kuulamistest: Arvud', ordinalsTitle: 'Kuulamistest: Järgarvud', listenPrompt: 'Kuula ja vali õige arv', replayHint: 'Kordamiseks puuduta kõlarit', passTitle: 'Suurepärane! Test läbitud', failTitle: 'Proovi uuesti (vaja ≥ 80%)', scoreLabel: 'Tulemus', bestLabel: 'Parim', retryBtn: '🔄 Proovi uuesti', doneBtn: '✓ Valmis' },
  fi: { backBtn: 'Takaisin', cardinalsTitle: 'Kuuntelutesti: Numerot', ordinalsTitle: 'Kuuntelutesti: Järjestysluvut', listenPrompt: 'Kuuntele ja valitse oikea numero', replayHint: 'Kuuntele uudelleen napauttamalla kaiutinta', passTitle: 'Hienoa! Testi läpäisty', failTitle: 'Yritä uudelleen (vähintään 80 %)', scoreLabel: 'Pisteet', bestLabel: 'Paras', retryBtn: '🔄 Yritä uudelleen', doneBtn: '✓ Valmis' },
  fr: { backBtn: 'Retour', cardinalsTitle: 'Test audio : Nombres', ordinalsTitle: 'Test audio : Ordinaux', listenPrompt: 'Écoutez et choisissez le bon nombre', replayHint: 'Touchez le haut-parleur pour réécouter', passTitle: 'Bravo ! Test réussi', failTitle: 'Réessayez (≥ 80 % requis)', scoreLabel: 'Score', bestLabel: 'Meilleur', retryBtn: '🔄 Recommencer', doneBtn: '✓ Terminer' },
  de: { backBtn: 'Zurück', cardinalsTitle: 'Hörtest: Zahlen', ordinalsTitle: 'Hörtest: Ordnungszahlen', listenPrompt: 'Höre zu und wähle die richtige Zahl', replayHint: 'Tippe auf den Lautsprecher zum Wiederholen', passTitle: 'Super! Test bestanden', failTitle: 'Nochmal versuchen (mind. 80 %)', scoreLabel: 'Ergebnis', bestLabel: 'Bestwert', retryBtn: '🔄 Nochmal', doneBtn: '✓ Fertig' },
  el: { backBtn: 'Πίσω', cardinalsTitle: 'Ακουστικό τεστ: Αριθμοί', ordinalsTitle: 'Ακουστικό τεστ: Τακτικοί αριθμοί', listenPrompt: 'Ακούστε και επιλέξτε τον σωστό αριθμό', replayHint: 'Πατήστε το ηχείο για επανάληψη', passTitle: 'Μπράβο! Περάσατε το τεστ', failTitle: 'Δοκιμάστε ξανά (απαιτείται ≥ 80%)', scoreLabel: 'Βαθμολογία', bestLabel: 'Καλύτερο', retryBtn: '🔄 Ξανά', doneBtn: '✓ Τέλος' },
  hi: { backBtn: 'वापस', cardinalsTitle: 'संख्या श्रवण परीक्षण', ordinalsTitle: 'क्रमवाचक संख्या श्रवण परीक्षण', listenPrompt: 'सुनें और सही संख्या चुनें', replayHint: 'फिर सुनने के लिए स्पीकर पर टैप करें', passTitle: 'बढ़िया! टेस्ट पास हो गया', failTitle: 'फिर प्रयास करें (80%+ आवश्यक)', scoreLabel: 'स्कोर', bestLabel: 'सर्वश्रेष्ठ', retryBtn: '🔄 फिर से करें', doneBtn: '✓ पूर्ण' },
  hu: { backBtn: 'Vissza', cardinalsTitle: 'Hallás utáni teszt: Számok', ordinalsTitle: 'Hallás utáni teszt: Sorszámnevek', listenPrompt: 'Hallgasd meg, és válaszd ki a helyes számot', replayHint: 'Koppints a hangszóróra az ismétléshez', passTitle: 'Remek! Teszt teljesítve', failTitle: 'Próbáld újra (legalább 80% kell)', scoreLabel: 'Eredmény', bestLabel: 'Legjobb', retryBtn: '🔄 Újra', doneBtn: '✓ Kész' },
  id: { backBtn: 'Kembali', cardinalsTitle: 'Tes Audio: Angka', ordinalsTitle: 'Tes Audio: Bilangan Bertingkat', listenPrompt: 'Dengarkan dan pilih angka yang tepat', replayHint: 'Ketuk speaker untuk mendengar lagi', passTitle: 'Hebat! Tes lulus', failTitle: 'Coba lagi (perlu ≥ 80%)', scoreLabel: 'Skor', bestLabel: 'Terbaik', retryBtn: '🔄 Coba lagi', doneBtn: '✓ Selesai' },
  it: { backBtn: 'Indietro', cardinalsTitle: 'Test audio: Numeri', ordinalsTitle: 'Test audio: Ordinali', listenPrompt: 'Ascolta e scegli il numero corretto', replayHint: 'Tocca l’altoparlante per riascoltare', passTitle: 'Ottimo! Test superato', failTitle: 'Riprova (serve ≥ 80%)', scoreLabel: 'Punteggio', bestLabel: 'Migliore', retryBtn: '🔄 Riprova', doneBtn: '✓ Fine' },
  ja: { backBtn: '戻る', cardinalsTitle: '数字リスニングテスト', ordinalsTitle: '序数リスニングテスト', listenPrompt: '音声を聞いて正しい数字を選んでください', replayHint: 'スピーカーをタップしてもう一度再生', passTitle: 'すばらしい！合格です', failTitle: 'もう一度挑戦しましょう（80%以上で合格）', scoreLabel: 'スコア', bestLabel: 'ベスト', retryBtn: '🔄 もう一度', doneBtn: '✓ 完了' },
  kk: { backBtn: 'Артқа', cardinalsTitle: 'Аудио тест: Сандар', ordinalsTitle: 'Аудио тест: Реттік сан есімдер', listenPrompt: 'Тыңдап, дұрыс санды таңдаңыз', replayHint: 'Қайта тыңдау үшін динамикті басыңыз', passTitle: 'Керемет! Тест сәтті өтті', failTitle: 'Қайта көріңіз (≥ 80% қажет)', scoreLabel: 'Нәтиже', bestLabel: 'Үздік', retryBtn: '🔄 Қайта өту', doneBtn: '✓ Дайын' },
  ko: { backBtn: '뒤로', cardinalsTitle: '숫자 듣기 테스트', ordinalsTitle: '서수 듣기 테스트', listenPrompt: '듣고 올바른 숫자를 선택하세요', replayHint: '다시 들으려면 스피커를 탭하세요', passTitle: '훌륭해요! 테스트 통과', failTitle: '다시 도전해 보세요 (80% 이상 필요)', scoreLabel: '점수', bestLabel: '최고 기록', retryBtn: '🔄 다시 풀기', doneBtn: '✓ 완료' },
  lv: { backBtn: 'Atpakaļ', cardinalsTitle: 'Audio tests: Skaitļi', ordinalsTitle: 'Audio tests: Kārtas skaitļi', listenPrompt: 'Klausies un izvēlies pareizo skaitli', replayHint: 'Pieskaries skaļrunim, lai atkārtotu', passTitle: 'Lieliski! Tests nokārtots', failTitle: 'Mēģini vēlreiz (vajag ≥ 80%)', scoreLabel: 'Rezultāts', bestLabel: 'Labākais', retryBtn: '🔄 Mēģināt vēlreiz', doneBtn: '✓ Gatavs' },
  lt: { backBtn: 'Atgal', cardinalsTitle: 'Garso testas: Skaičiai', ordinalsTitle: 'Garso testas: Kelintiniai skaitvardžiai', listenPrompt: 'Klausykitės ir pasirinkite teisingą skaičių', replayHint: 'Palieskite garsiakalbį, kad pakartotumėte', passTitle: 'Puiku! Testas išlaikytas', failTitle: 'Bandykite dar kartą (reikia ≥ 80%)', scoreLabel: 'Rezultatas', bestLabel: 'Geriausias', retryBtn: '🔄 Bandyti dar kartą', doneBtn: '✓ Baigta' },
  fa: { backBtn: 'بازگشت', cardinalsTitle: 'آزمون شنیداری اعداد', ordinalsTitle: 'آزمون شنیداری اعداد ترتیبی', listenPrompt: 'گوش دهید و عدد درست را انتخاب کنید', replayHint: 'برای پخش مجدد روی بلندگو بزنید', passTitle: 'عالی! آزمون قبول شدید', failTitle: 'دوباره تلاش کنید (حداقل ۸۰٪ لازم است)', scoreLabel: 'امتیاز', bestLabel: 'بهترین', retryBtn: '🔄 تلاش مجدد', doneBtn: '✓ تمام' },
  pl: { backBtn: 'Wstecz', cardinalsTitle: 'Test ze słuchu: Liczby', ordinalsTitle: 'Test ze słuchu: Liczebniki porządkowe', listenPrompt: 'Posłuchaj i wybierz właściwą liczbę', replayHint: 'Dotknij głośnika, aby odsłuchać ponownie', passTitle: 'Świetnie! Test zaliczony', failTitle: 'Spróbuj ponownie (wymagane ≥ 80%)', scoreLabel: 'Wynik', bestLabel: 'Najlepszy', retryBtn: '🔄 Spróbuj ponownie', doneBtn: '✓ Gotowe' },
  pt: { backBtn: 'Voltar', cardinalsTitle: 'Teste de Áudio: Números', ordinalsTitle: 'Teste de Áudio: Ordinais', listenPrompt: 'Ouça e escolha o número correto', replayHint: 'Toque no alto-falante para ouvir novamente', passTitle: 'Ótimo! Teste aprovado', failTitle: 'Tente novamente (necessário ≥ 80%)', scoreLabel: 'Pontuação', bestLabel: 'Melhor', retryBtn: '🔄 Tentar novamente', doneBtn: '✓ Concluir' },
  ro: { backBtn: 'Înapoi', cardinalsTitle: 'Test audio: Numere', ordinalsTitle: 'Test audio: Numerale ordinale', listenPrompt: 'Ascultă și alege numărul corect', replayHint: 'Atinge difuzorul pentru a asculta din nou', passTitle: 'Excelent! Test trecut', failTitle: 'Încearcă din nou (necesar ≥ 80%)', scoreLabel: 'Scor', bestLabel: 'Cel mai bun', retryBtn: '🔄 Încearcă din nou', doneBtn: '✓ Gata' },
  ru: { backBtn: 'Назад', cardinalsTitle: 'Аудио-тест: Числа', ordinalsTitle: 'Аудио-тест: Порядковые числа', listenPrompt: 'Прослушайте и выберите правильное число', replayHint: 'Нажмите на динамик, чтобы прослушать ещё раз', passTitle: 'Отлично! Тест пройден', failTitle: 'Попробуйте ещё раз (нужно ≥ 80%)', scoreLabel: 'Результат', bestLabel: 'Лучший', retryBtn: '🔄 Пройти ещё раз', doneBtn: '✓ Готово' },
  sk: { backBtn: 'Späť', cardinalsTitle: 'Posluchový test: Čísla', ordinalsTitle: 'Posluchový test: Radové číslovky', listenPrompt: 'Počúvajte a vyberte správne číslo', replayHint: 'Klepnite na reproduktor pre zopakovanie', passTitle: 'Skvelé! Test splnený', failTitle: 'Skúste znova (potrebné ≥ 80 %)', scoreLabel: 'Skóre', bestLabel: 'Najlepšie', retryBtn: '🔄 Skúsiť znova', doneBtn: '✓ Hotovo' },
  sl: { backBtn: 'Nazaj', cardinalsTitle: 'Zvočni test: Števila', ordinalsTitle: 'Zvočni test: Vrstilni števniki', listenPrompt: 'Poslušajte in izberite pravilno število', replayHint: 'Tapnite zvočnik za ponovno predvajanje', passTitle: 'Odlično! Test opravljen', failTitle: 'Poskusite znova (potrebnih ≥ 80 %)', scoreLabel: 'Rezultat', bestLabel: 'Najboljši', retryBtn: '🔄 Poskusi znova', doneBtn: '✓ Končano' },
  es: { backBtn: 'Atrás', cardinalsTitle: 'Test de audio: Números', ordinalsTitle: 'Test de audio: Ordinales', listenPrompt: 'Escucha y elige el número correcto', replayHint: 'Toca el altavoz para escuchar de nuevo', passTitle: '¡Excelente! Test aprobado', failTitle: 'Inténtalo de nuevo (se requiere ≥ 80%)', scoreLabel: 'Puntuación', bestLabel: 'Mejor', retryBtn: '🔄 Reintentar', doneBtn: '✓ Listo' },
  sv: { backBtn: 'Tillbaka', cardinalsTitle: 'Lyssningstest: Tal', ordinalsTitle: 'Lyssningstest: Ordningstal', listenPrompt: 'Lyssna och välj rätt tal', replayHint: 'Tryck på högtalaren för att höra igen', passTitle: 'Toppen! Test godkänt', failTitle: 'Försök igen (minst 80 % krävs)', scoreLabel: 'Resultat', bestLabel: 'Bästa', retryBtn: '🔄 Försök igen', doneBtn: '✓ Klar' },
  th: { backBtn: 'กลับ', cardinalsTitle: 'แบบทดสอบฟัง: ตัวเลข', ordinalsTitle: 'แบบทดสอบฟัง: เลขลำดับที่', listenPrompt: 'ฟังและเลือกตัวเลขที่ถูกต้อง', replayHint: 'แตะลำโพงเพื่อฟังอีกครั้ง', passTitle: 'ยอดเยี่ยม! ผ่านการทดสอบ', failTitle: 'ลองอีกครั้ง (ต้องได้ ≥ 80%)', scoreLabel: 'คะแนน', bestLabel: 'ดีที่สุด', retryBtn: '🔄 ลองอีกครั้ง', doneBtn: '✓ เสร็จสิ้น' },
  tr: { backBtn: 'Geri', cardinalsTitle: 'Dinleme Testi: Sayılar', ordinalsTitle: 'Dinleme Testi: Sıra Sayıları', listenPrompt: 'Dinleyin ve doğru sayıyı seçin', replayHint: 'Tekrar dinlemek için hoparlöre dokunun', passTitle: 'Harika! Test geçildi', failTitle: 'Tekrar deneyin (≥ %80 gerekli)', scoreLabel: 'Puan', bestLabel: 'En iyi', retryBtn: '🔄 Tekrar dene', doneBtn: '✓ Tamam' },
  uk: { backBtn: 'Назад', cardinalsTitle: 'Аудіо-тест: Числа', ordinalsTitle: 'Аудіо-тест: Порядкові числівники', listenPrompt: 'Прослухайте та оберіть правильне число', replayHint: 'Натисніть на динамік, щоб прослухати ще раз', passTitle: 'Чудово! Тест пройдено', failTitle: 'Спробуйте ще раз (потрібно ≥ 80%)', scoreLabel: 'Результат', bestLabel: 'Найкращий', retryBtn: '🔄 Пройти ще раз', doneBtn: '✓ Готово' },
  ur: { backBtn: 'واپس', cardinalsTitle: 'اعداد کا آڈیو ٹیسٹ', ordinalsTitle: 'ترتیبی اعداد کا آڈیو ٹیسٹ', listenPrompt: 'سنیں اور صحیح عدد منتخب کریں', replayHint: 'دوبارہ سننے کے لیے اسپیکر پر ٹیپ کریں', passTitle: 'بہت خوب! ٹیسٹ پاس ہو گیا', failTitle: 'دوبارہ کوشش کریں (80%+ درکار)', scoreLabel: 'اسکور', bestLabel: 'بہترین', retryBtn: '🔄 دوبارہ کوشش کریں', doneBtn: '✓ مکمل' },
  vi: { backBtn: 'Quay lại', cardinalsTitle: 'Kiểm tra nghe: Số đếm', ordinalsTitle: 'Kiểm tra nghe: Số thứ tự', listenPrompt: 'Nghe và chọn đúng con số', replayHint: 'Chạm vào loa để nghe lại', passTitle: 'Tuyệt vời! Đã vượt qua', failTitle: 'Thử lại nhé (cần ≥ 80%)', scoreLabel: 'Điểm', bestLabel: 'Cao nhất', retryBtn: '🔄 Làm lại', doneBtn: '✓ Xong' },
};

export function getNumberAudioTrainerStrings(lang = 'ru') {
  const raw = String(lang || 'ru').toLowerCase().trim();
  const base = raw.split(/[-_]/)[0];
  return NUMBER_AUDIO_TRAINER_I18N[raw] || NUMBER_AUDIO_TRAINER_I18N[base] || NUMBER_AUDIO_TRAINER_I18N.en;
}

const CARDINAL_POOL = [
  { display: '1', spoken: 'one', traps: ['11', '10', '2'] },
  { display: '2', spoken: 'two', traps: ['12', '20', '3'] },
  { display: '3', spoken: 'three', traps: ['13', '30', '2'] },
  { display: '4', spoken: 'four', traps: ['14', '40', '5'] },
  { display: '5', spoken: 'five', traps: ['15', '50', '4'] },
  { display: '6', spoken: 'six', traps: ['16', '60', '7'] },
  { display: '7', spoken: 'seven', traps: ['17', '70', '6'] },
  { display: '8', spoken: 'eight', traps: ['18', '80', '9'] },
  { display: '9', spoken: 'nine', traps: ['19', '90', '8'] },
  { display: '10', spoken: 'ten', traps: ['20', '12', '100'] },
  { display: '11', spoken: 'eleven', traps: ['12', '7', '21'] },
  { display: '12', spoken: 'twelve', traps: ['20', '2', '11'] },
  { display: '13', spoken: 'thirteen', traps: ['30', '14', '3'] },
  { display: '14', spoken: 'fourteen', traps: ['40', '15', '4'] },
  { display: '15', spoken: 'fifteen', traps: ['50', '14', '5'] },
  { display: '16', spoken: 'sixteen', traps: ['60', '17', '6'] },
  { display: '17', spoken: 'seventeen', traps: ['70', '16', '7'] },
  { display: '18', spoken: 'eighteen', traps: ['80', '19', '8'] },
  { display: '19', spoken: 'nineteen', traps: ['90', '18', '9'] },
  { display: '20', spoken: 'twenty', traps: ['12', '30', '22'] },
  { display: '30', spoken: 'thirty', traps: ['13', '40', '20'] },
  { display: '40', spoken: 'forty', traps: ['14', '50', '30'] },
  { display: '50', spoken: 'fifty', traps: ['15', '60', '40'] },
  { display: '60', spoken: 'sixty', traps: ['16', '70', '50'] },
  { display: '70', spoken: 'seventy', traps: ['17', '80', '60'] },
  { display: '80', spoken: 'eighty', traps: ['18', '90', '70'] },
  { display: '90', spoken: 'ninety', traps: ['19', '80', '100'] },
  { display: '100', spoken: 'hundred', traps: ['1,000', '10', '90'] },
  { display: '1,000', spoken: 'thousand', traps: ['100', '10,000', '1,000,000'] },
  { display: '1,000,000', spoken: 'million', traps: ['1,000', '100,000', '100'] },
];

const ORDINAL_POOL = [
  { display: '1st', spoken: 'first', traps: ['11th', '21st', '3rd'] },
  { display: '2nd', spoken: 'second', traps: ['12th', '22nd', '20th'] },
  { display: '3rd', spoken: 'third', traps: ['13th', '30th', '33rd'] },
  { display: '4th', spoken: 'fourth', traps: ['14th', '40th', '5th'] },
  { display: '5th', spoken: 'fifth', traps: ['15th', '50th', '4th'] },
  { display: '6th', spoken: 'sixth', traps: ['16th', '60th', '7th'] },
  { display: '7th', spoken: 'seventh', traps: ['17th', '70th', '6th'] },
  { display: '8th', spoken: 'eighth', traps: ['18th', '80th', '9th'] },
  { display: '9th', spoken: 'ninth', traps: ['19th', '90th', '8th'] },
  { display: '10th', spoken: 'tenth', traps: ['20th', '12th', '100th'] },
  { display: '11th', spoken: 'eleventh', traps: ['1st', '12th', '21st'] },
  { display: '12th', spoken: 'twelfth', traps: ['2nd', '20th', '11th'] },
  { display: '13th', spoken: 'thirteenth', traps: ['30th', '3rd', '14th'] },
  { display: '14th', spoken: 'fourteenth', traps: ['40th', '4th', '15th'] },
  { display: '15th', spoken: 'fifteenth', traps: ['50th', '5th', '14th'] },
  { display: '16th', spoken: 'sixteenth', traps: ['60th', '6th', '17th'] },
  { display: '17th', spoken: 'seventeenth', traps: ['70th', '7th', '16th'] },
  { display: '18th', spoken: 'eighteenth', traps: ['80th', '8th', '19th'] },
  { display: '19th', spoken: 'nineteenth', traps: ['90th', '9th', '18th'] },
  { display: '20th', spoken: 'twentieth', traps: ['12th', '30th', '2nd'] },
];

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildNumberAudioQuestions(mode = 'cardinals', count = null) {
  const pool = mode === 'ordinals' ? ORDINAL_POOL : CARDINAL_POOL;
  const limit = Number.isFinite(count) && count > 0 ? Math.min(count, pool.length) : pool.length;
  const picked = shuffleArray(pool).slice(0, limit);
  return picked.map((item) => {
    const choices = shuffleArray([item.display, ...item.traps.slice(0, 3)]);
    return {
      display: item.display,
      spoken: item.spoken,
      choices,
    };
  });
}

function getStylesHtml() {
  return `
    <style>
      .nat-page {
        max-width: 680px;
        margin: 0 auto;
        padding: 10px 14px 36px;
        color: var(--text-main, #1e293b);
      }
      .nat-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 14px;
      }
      .nat-back-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: rgba(148, 163, 184, 0.12);
        color: inherit;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
      }
      .nat-progress-pill {
        font-size: 13px;
        font-weight: 800;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.16);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.35);
      }
      .nat-card {
        background: var(--card-bg, #ffffff);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 22px;
        padding: 22px 18px 24px;
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
        text-align: center;
      }
      body.dark-theme .nat-card,
      .dark-theme .nat-card,
      [data-theme="dark"] .nat-card {
        background: rgba(15, 23, 42, 0.82);
        border-color: rgba(148, 163, 184, 0.2);
      }
      .nat-title {
        font-size: 17px;
        font-weight: 800;
        margin: 0 0 14px;
      }
      .nat-progress-bar {
        width: 100%;
        height: 7px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.2);
        overflow: hidden;
        margin-bottom: 20px;
      }
      .nat-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #38bdf8, #22c55e);
        transition: width 0.25s ease;
      }
      .nat-speaker-btn {
        width: 84px;
        height: 84px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #0ea5e9, #2563eb);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(37, 99, 235, 0.35);
        transition: transform 0.14s ease, box-shadow 0.14s ease;
        margin: 4px auto 12px;
      }
      .nat-speaker-btn:active {
        transform: scale(0.94);
      }
      .nat-speaker-btn.is-playing {
        transform: scale(1.06);
        box-shadow: 0 0 0 8px rgba(56, 189, 248, 0.25), 0 10px 24px rgba(37, 99, 235, 0.45);
      }
      .nat-listen-prompt {
        font-size: 15px;
        font-weight: 700;
        margin: 4px 0 4px;
      }
      .nat-replay-hint {
        font-size: 12.5px;
        opacity: 0.7;
        margin: 0 0 20px;
      }
      .nat-choices-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        max-width: 420px;
        margin: 0 auto;
      }
      .nat-choice-btn {
        min-height: 64px;
        padding: 12px 10px;
        border-radius: 16px;
        border: 2px solid rgba(148, 163, 184, 0.3);
        background: rgba(148, 163, 184, 0.08);
        color: inherit;
        font-size: 24px;
        font-weight: 800;
        cursor: pointer;
        transition: transform 0.12s ease, border-color 0.15s ease, background 0.15s ease;
      }
      .nat-choice-btn:active:not(:disabled) {
        transform: scale(0.97);
      }
      .nat-choice-btn.is-correct {
        border-color: #22c55e !important;
        background: rgba(34, 197, 94, 0.2) !important;
        color: #16a34a !important;
      }
      body.dark-theme .nat-choice-btn.is-correct,
      .dark-theme .nat-choice-btn.is-correct,
      [data-theme="dark"] .nat-choice-btn.is-correct {
        color: #4ade80 !important;
      }
      .nat-choice-btn.is-wrong {
        border-color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.18) !important;
        color: #dc2626 !important;
      }
      body.dark-theme .nat-choice-btn.is-wrong,
      .dark-theme .nat-choice-btn.is-wrong,
      [data-theme="dark"] .nat-choice-btn.is-wrong {
        color: #f87171 !important;
      }
      .nat-revealed {
        min-height: 28px;
        margin-top: 16px;
        font-size: 16px;
        font-weight: 700;
        color: #38bdf8;
      }
      .nat-summary-score {
        font-size: 40px;
        font-weight: 900;
        margin: 10px 0 6px;
      }
      .nat-summary-best {
        font-size: 14px;
        opacity: 0.8;
        margin-bottom: 20px;
      }
      .nat-summary-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
      }
      .nat-btn-primary {
        padding: 12px 22px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #ffffff;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
      }
      .nat-btn-secondary {
        padding: 12px 20px;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        background: rgba(148, 163, 184, 0.12);
        color: inherit;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
      }
    </style>
  `;
}

export function renderNumberAudioTrainerView(containerSelector = '#app-content', options = {}) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;
  if (!container) return;

  const mode = options.mode === 'ordinals' ? 'ordinals' : 'cardinals';
  const colId = mode === 'ordinals' ? 'ordinal_numbers' : 'numbers';
  const allWords = Array.isArray(options.allWords) ? options.allWords : [];
  const onBack = typeof options.onBack === 'function' ? options.onBack : () => {};

  const rawLang = (getInterfaceLanguage() || 'ru').toLowerCase();
  const baseLang = rawLang.split('-')[0];
  const isRtl = RTL_LOCALES.has(baseLang);
  const s = getNumberAudioTrainerStrings(rawLang);
  const titleText = mode === 'ordinals' ? s.ordinalsTitle : s.cardinalsTitle;

  let roundQuestions = buildNumberAudioQuestions(mode);
  let qIndex = 0;
  let correctCount = 0;
  let autoNextTimer = null;
  let sessionToken = 0;

  function clearAudioAndTimers() {
    sessionToken += 1;
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
    try { stopAllAudio(); } catch (_) {}
  }

  async function speakCurrent(text, btnEl) {
    try { stopAllAudio(); } catch (_) {}
    if (btnEl) btnEl.classList.add('is-playing');
    try {
      await speakWordAsync(text, null, 1.0);
    } catch (_) {}
    if (btnEl) btnEl.classList.remove('is-playing');
  }

  function renderQuestion() {
    clearAudioAndTimers();
    const token = sessionToken;
    const q = roundQuestions[qIndex];
    if (!q) {
      renderSummary();
      return;
    }
    let isAnswered = false;
    const pct = Math.round((qIndex / roundQuestions.length) * 100);

    container.innerHTML = `
      ${getStylesHtml()}
      <div class="nat-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="nat-topbar">
          <button type="button" class="nat-back-btn" id="fav-view-back-btn">‹ ${escapeHtml(s.backBtn)}</button>
          <span class="nat-progress-pill">${qIndex + 1} / ${roundQuestions.length}</span>
        </div>
        <div class="nat-card">
          <h2 class="nat-title">${mode === 'ordinals' ? '🥇' : '🔢'} ${escapeHtml(titleText)}</h2>
          <div class="nat-progress-bar"><div class="nat-progress-fill" style="width:${pct}%"></div></div>
          <button type="button" class="nat-speaker-btn" id="nat-replay-btn" aria-label="Play audio">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
          <p class="nat-listen-prompt">${escapeHtml(s.listenPrompt)}</p>
          <p class="nat-replay-hint">${escapeHtml(s.replayHint)}</p>
          <div class="nat-choices-grid" dir="ltr">
            ${q.choices.map((ch) => `
              <button type="button" class="nat-choice-btn" data-choice="${escapeHtml(ch)}">${escapeHtml(ch)}</button>
            `).join('')}
          </div>
          <div class="nat-revealed" id="nat-revealed" dir="ltr"></div>
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#fav-view-back-btn');
    const replayBtn = container.querySelector('#nat-replay-btn');
    const revealedEl = container.querySelector('#nat-revealed');
    const choiceBtns = container.querySelectorAll('.nat-choice-btn');

    backBtn?.addEventListener('click', () => {
      clearAudioAndTimers();
      onBack();
    });

    replayBtn?.addEventListener('click', () => {
      try { triggerHaptic('light'); } catch (_) {}
      speakCurrent(q.spoken, replayBtn);
    });

    choiceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isAnswered) return;
        isAnswered = true;
        const picked = btn.getAttribute('data-choice');
        const isCorrect = picked === q.display;

        choiceBtns.forEach((b) => {
          b.disabled = true;
          const v = b.getAttribute('data-choice');
          if (v === q.display) b.classList.add('is-correct');
          else if (b === btn && !isCorrect) b.classList.add('is-wrong');
        });

        if (isCorrect) {
          correctCount += 1;
          try { playSuccessSound(); } catch (_) {}
        } else {
          try { playErrorSound(); } catch (_) {}
        }

        if (revealedEl) {
          revealedEl.textContent = `«${q.spoken}» — ${q.display}`;
        }

        autoNextTimer = setTimeout(() => {
          if (token !== sessionToken) return;
          qIndex += 1;
          if (qIndex < roundQuestions.length) {
            renderQuestion();
          } else {
            renderSummary();
          }
        }, 1250);
      });
    });

    speakCurrent(q.spoken, replayBtn);
  }

  function renderSummary() {
    clearAudioAndTimers();
    const total = roundQuestions.length;
    const pct = Math.round((correctCount / total) * 100);
    const passed = pct >= 80;

    const bestKey = `myduo_time_best_${colId}`;
    let bestScore = correctCount;
    try {
      const prevBest = Number(localStorage.getItem(bestKey) || 0);
      if (correctCount > prevBest) {
        localStorage.setItem(bestKey, String(correctCount));
      } else {
        bestScore = prevBest;
      }
    } catch (_) {}

    if (passed) {
      try { playFanfareSound(); } catch (_) {}
      // Mark collection completed + mark all collection words mastered so CEFR Matrix & Smart Course update
      try {
        const rawDone = localStorage.getItem('myduo_completed_collections');
        const parsedDone = rawDone ? JSON.parse(rawDone) : [];
        const doneSet = new Set(Array.isArray(parsedDone) ? parsedDone.map(String) : []);
        const wasAlreadyDone = doneSet.has(colId);
        doneSet.add(colId);
        localStorage.setItem('myduo_completed_collections', JSON.stringify([...doneSet]));

        if (allWords.length > 0) {
          const colWords = getCollectionWords(colId, allWords);
          const uId = getEffectiveUserId();
          const progKey = `progress_${uId}`;
          const progMap = getUserProgress() || {};
          for (const w of colWords) {
            if (!w || w.id == null) continue;
            const prev = progMap[w.id] || progMap[String(w.id)] || {};
            progMap[w.id] = {
              ...prev,
              mastered: true,
              stage: 'mastered',
              inputCorrect: Math.max(1, Number(prev.inputCorrect || 0)),
              lastReviewed: Date.now(),
            };
          }
          localStorage.setItem(progKey, JSON.stringify(progMap));
        }
        try { addWeeklyXP(wasAlreadyDone ? 5 : 15); } catch (_) {}
        try { pushUserDataToCloud(null, null, true); } catch (_) {}
      } catch (_) {}
    }

    container.innerHTML = `
      ${getStylesHtml()}
      <div class="nat-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="nat-topbar">
          <button type="button" class="nat-back-btn" id="fav-view-back-btn">‹ ${escapeHtml(s.backBtn)}</button>
        </div>
        <div class="nat-card">
          <div style="font-size: 52px;">${passed ? '🏆' : '🎧'}</div>
          <h2 class="nat-title" style="margin-top:8px;">${escapeHtml(passed ? s.passTitle : s.failTitle)}</h2>
          <div class="nat-summary-score">${correctCount} / ${total} (${pct}%)</div>
          <div class="nat-summary-best">${escapeHtml(s.bestLabel)}: ${bestScore} / ${total}</div>
          <div class="nat-summary-actions">
            <button type="button" class="nat-btn-secondary" id="nat-retry-btn">${escapeHtml(s.retryBtn)}</button>
            <button type="button" class="nat-btn-primary" id="nat-done-btn">${escapeHtml(s.doneBtn)}</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => onBack());
    container.querySelector('#nat-done-btn')?.addEventListener('click', () => onBack());
    container.querySelector('#nat-retry-btn')?.addEventListener('click', () => {
      roundQuestions = buildNumberAudioQuestions(mode);
      qIndex = 0;
      correctCount = 0;
      renderQuestion();
    });
  }

  renderQuestion();
}
