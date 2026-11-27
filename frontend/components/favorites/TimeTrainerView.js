import {
  speakTextInLangAsync,
  stopAllAudio,
  playSuccessSound,
  playErrorSound,
  playFanfareSound,
  getSavedVoiceAccent,
  triggerHaptic,
} from '../../services/audioService.js?v=423.0';
import { getInterfaceLanguage } from '../../services/i18n.js?v=423.0';

export const TIME_TRAINER_TRANSLATIONS = {
  ru: {
    folderTitle: 'Время',
    folderSubtitle: '6 режимов на слух',
    hubTitle: 'Время на слух',
    hubSubtitle: 'Выберите тип тренировки: слушайте время на английском и отмечайте точный вариант',
    backBtn: 'Назад',
    modeAmTitle: 'До обеда (AM)',
    modeAmDesc: 'Утренние часы · 01:00–11:00 AM',
    modePmTitle: 'После обеда (PM)',
    modePmDesc: 'День и вечер · 1:00–11:00 PM',
    modeHalvesTitle: 'Половины',
    modeHalvesDesc: 'Half past · :30 минут',
    modeQuartersTitle: 'Четверти',
    modeQuartersDesc: 'Quarter past / to · :15 и :45',
    modeTenTitle: 'По 10 минут',
    modeTenDesc: 'Десятки минут · :10, :20, :40, :50',
    modeFiveTitle: 'По 5 минут',
    modeFiveDesc: 'Все пятиминутные интервалы',
    listenPrompt: 'Какое время прозвучало?',
    replayHint: 'Нажмите на динамик, чтобы прослушать ещё раз',
    doneTitle: 'Тренировка завершена!',
    scoreLabel: 'Верных ответов',
    playAgainBtn: 'Ещё раз',
    changeModeBtn: 'Другие режимы',
  },
  uk: {
    folderTitle: 'Час',
    folderSubtitle: '6 режимів на слух',
    hubTitle: 'Час на слух',
    hubSubtitle: 'Оберіть тип тренування: слухайте час англійською та вибирайте точний варіант',
    backBtn: 'Назад',
    modeAmTitle: 'До обіду (AM)',
    modeAmDesc: 'Ранкові години · 01:00–11:00 AM',
    modePmTitle: 'Після обіду (PM)',
    modePmDesc: 'День і вечір · 1:00–11:00 PM',
    modeHalvesTitle: 'Половини',
    modeHalvesDesc: 'Half past · :30 хвилин',
    modeQuartersTitle: 'Чверті',
    modeQuartersDesc: 'Quarter past / to · :15 та :45',
    modeTenTitle: 'По 10 хвилин',
    modeTenDesc: 'Десятки хвилин · :10, :20, :40, :50',
    modeFiveTitle: 'По 5 хвилин',
    modeFiveDesc: 'Усі п’ятихвилинні інтервали',
    listenPrompt: 'Який час пролунав?',
    replayHint: 'Натисніть на динамік, щоб прослухати ще раз',
    doneTitle: 'Тренування завершено!',
    scoreLabel: 'Правильних відповідей',
    playAgainBtn: 'Ще раз',
    changeModeBtn: 'Інші режими',
  },
  en: {
    folderTitle: 'Time',
    folderSubtitle: '6 listening modes',
    hubTitle: 'Time Listening Lab',
    hubSubtitle: 'Pick a practice mode, listen to the spoken time, and tap the matching clock',
    backBtn: 'Back',
    modeAmTitle: 'Morning (AM)',
    modeAmDesc: 'Before noon · 01:00–11:00 AM',
    modePmTitle: 'Afternoon & Evening (PM)',
    modePmDesc: 'After noon · 1:00–11:00 PM',
    modeHalvesTitle: 'Half Hours',
    modeHalvesDesc: 'Half past · :30 minutes',
    modeQuartersTitle: 'Quarters',
    modeQuartersDesc: 'Quarter past / to · :15 & :45',
    modeTenTitle: 'Every 10 Minutes',
    modeTenDesc: 'Ten-minute steps · :10, :20, :40, :50',
    modeFiveTitle: 'Every 5 Minutes',
    modeFiveDesc: 'Full 5-minute intervals',
    listenPrompt: 'What time did you hear?',
    replayHint: 'Tap the speaker button to listen again',
    doneTitle: 'Session Complete!',
    scoreLabel: 'Correct answers',
    playAgainBtn: 'Practice Again',
    changeModeBtn: 'All Modes',
  },
  de: {
    folderTitle: 'Uhrzeit',
    folderSubtitle: '6 Hörübungen',
    hubTitle: 'Uhrzeit hören',
    hubSubtitle: 'Wähle einen Modus, höre die englische Uhrzeit und tippe die richtige Zeit an',
    backBtn: 'Zurück',
    modeAmTitle: 'Vormittag (AM)',
    modeAmDesc: 'Morgenstunden · 01:00–11:00 AM',
    modePmTitle: 'Nachmittag (PM)',
    modePmDesc: 'Nachmittag & Abend · 1:00–11:00 PM',
    modeHalvesTitle: 'Halbe Stunden',
    modeHalvesDesc: 'Half past · :30 Minuten',
    modeQuartersTitle: 'Viertelstunden',
    modeQuartersDesc: 'Quarter past / to · :15 & :45',
    modeTenTitle: '10-Minuten-Schritte',
    modeTenDesc: 'Zehnerschritte · :10, :20, :40, :50',
    modeFiveTitle: '5-Minuten-Schritte',
    modeFiveDesc: 'Alle 5-Minuten-Intervalle',
    listenPrompt: 'Welche Uhrzeit hast du gehört?',
    replayHint: 'Tippe auf den Lautsprecher zum Wiederholen',
    doneTitle: 'Übung abgeschlossen!',
    scoreLabel: 'Richtige Antworten',
    playAgainBtn: 'Nochmal üben',
    changeModeBtn: 'Andere Modi',
  },
  es: {
    folderTitle: 'La hora',
    folderSubtitle: '6 modos de audio',
    hubTitle: 'Aprende la hora',
    hubSubtitle: 'Elige un modo, escucha la hora en inglés y pulsa la opción correcta',
    backBtn: 'Atrás',
    modeAmTitle: 'Por la mañana (AM)',
    modeAmDesc: 'Antes del mediodía · 01:00–11:00 AM',
    modePmTitle: 'Por la tarde (PM)',
    modePmDesc: 'Después del mediodía · 1:00–11:00 PM',
    modeHalvesTitle: 'Medias horas',
    modeHalvesDesc: 'Half past · :30 minutos',
    modeQuartersTitle: 'Cuartos',
    modeQuartersDesc: 'Quarter past / to · :15 y :45',
    modeTenTitle: 'Cada 10 minutos',
    modeTenDesc: 'Intervalos de 10 min · :10, :20, :40, :50',
    modeFiveTitle: 'Cada 5 minutos',
    modeFiveDesc: 'Todos los intervalos de 5 min',
    listenPrompt: '¿Qué hora escuchaste?',
    replayHint: 'Pulsa el altavoz para escuchar de nuevo',
    doneTitle: '¡Práctica completada!',
    scoreLabel: 'Respuestas correctas',
    playAgainBtn: 'Repetir',
    changeModeBtn: 'Otros modos',
  },
  'es-mx': {
    folderTitle: 'La hora',
    folderSubtitle: '6 modos de audio',
    hubTitle: 'Practica la hora',
    hubSubtitle: 'Elige un modo, escucha la hora en inglés y toca la respuesta correcta',
    backBtn: 'Atrás',
    modeAmTitle: 'En la mañana (AM)',
    modeAmDesc: 'Antes del mediodía · 01:00–11:00 AM',
    modePmTitle: 'En la tarde (PM)',
    modePmDesc: 'Después del mediodía · 1:00–11:00 PM',
    modeHalvesTitle: 'Medias horas',
    modeHalvesDesc: 'Half past · :30 minutos',
    modeQuartersTitle: 'Cuartos de hora',
    modeQuartersDesc: 'Quarter past / to · :15 y :45',
    modeTenTitle: 'De 10 en 10 min',
    modeTenDesc: 'Cada 10 minutos · :10, :20, :40, :50',
    modeFiveTitle: 'De 5 en 5 min',
    modeFiveDesc: 'Todos los múltiplos de 5 min',
    listenPrompt: '¿Qué hora escuchaste?',
    replayHint: 'Toca la bocina para volver a escuchar',
    doneTitle: '¡Práctica terminada!',
    scoreLabel: 'Aciertos',
    playAgainBtn: 'Otra vez',
    changeModeBtn: 'Ver modos',
  },
  fr: {
    folderTitle: 'L’heure',
    folderSubtitle: '6 modes audio',
    hubTitle: 'Comprendre l’heure',
    hubSubtitle: 'Choisissez un mode, écoutez l’heure en anglais et touchez la bonne réponse',
    backBtn: 'Retour',
    modeAmTitle: 'Matin (AM)',
    modeAmDesc: 'Avant midi · 01:00–11:00 AM',
    modePmTitle: 'Après-midi / Soir (PM)',
    modePmDesc: 'Après midi · 1:00–11:00 PM',
    modeHalvesTitle: 'Demi-heures',
    modeHalvesDesc: 'Half past · :30 minutes',
    modeQuartersTitle: 'Quarts d’heure',
    modeQuartersDesc: 'Quarter past / to · :15 et :45',
    modeTenTitle: 'Par tranches de 10 min',
    modeTenDesc: 'Dizaines · :10, :20, :40, :50',
    modeFiveTitle: 'Par tranches de 5 min',
    modeFiveDesc: 'Tous les paliers de 5 min',
    listenPrompt: 'Quelle heure avez-vous entendue ?',
    replayHint: 'Appuyez sur le haut-parleur pour réécouter',
    doneTitle: 'Séance terminée !',
    scoreLabel: 'Bonnes réponses',
    playAgainBtn: 'Recommencer',
    changeModeBtn: 'Autres modes',
  },
  pl: {
    folderTitle: 'Czas',
    folderSubtitle: '6 trybów ze słuchu',
    hubTitle: 'Godziny ze słuchu',
    hubSubtitle: 'Wybierz tryb, posłuchaj godziny po angielsku i wskaż właściwą odpowiedź',
    backBtn: 'Wstecz',
    modeAmTitle: 'Przed południem (AM)',
    modeAmDesc: 'Godziny poranne · 01:00–11:00 AM',
    modePmTitle: 'Po południu (PM)',
    modePmDesc: 'Popołudnie i wieczór · 1:00–11:00 PM',
    modeHalvesTitle: 'Połówki',
    modeHalvesDesc: 'Half past · :30',
    modeQuartersTitle: 'Kwadranse',
    modeQuartersDesc: 'Quarter past / to · :15 i :45',
    modeTenTitle: 'Co 10 minut',
    modeTenDesc: 'Dziesiątki minut · :10, :20, :40, :50',
    modeFiveTitle: 'Co 5 minut',
    modeFiveDesc: 'Wszystkie odstępy 5-minutowe',
    listenPrompt: 'Którą godzinę usłyszałeś?',
    replayHint: 'Dotknij głośnika, aby odsłuchać ponownie',
    doneTitle: 'Ćwiczenie ukończone!',
    scoreLabel: 'Poprawne odpowiedzi',
    playAgainBtn: 'Jeszcze raz',
    changeModeBtn: 'Inne tryby',
  },
  tr: {
    folderTitle: 'Saatler',
    folderSubtitle: '6 dinleme modu',
    hubTitle: 'Dinleyerek Saat Öğren',
    hubSubtitle: 'Bir mod seçin, İngilizce saati dinleyin ve doğru seçeneğe dokunun',
    backBtn: 'Geri',
    modeAmTitle: 'Öğleden önce (AM)',
    modeAmDesc: 'Sabah saatleri · 01:00–11:00 AM',
    modePmTitle: 'Öğleden sonra (PM)',
    modePmDesc: 'Öğlen ve akşam · 1:00–11:00 PM',
    modeHalvesTitle: 'Buçuklar',
    modeHalvesDesc: 'Half past · :30 dakika',
    modeQuartersTitle: 'Çeyrekler',
    modeQuartersDesc: 'Quarter past / to · :15 ve :45',
    modeTenTitle: '10 Dakikalık',
    modeTenDesc: 'Onar dakika · :10, :20, :40, :50',
    modeFiveTitle: '5 Dakikalık',
    modeFiveDesc: 'Tüm 5 dakikalık aralıklar',
    listenPrompt: 'Hangi saati duydunuz?',
    replayHint: 'Tekrar dinlemek için hoparlöre dokunun',
    doneTitle: 'Alıştırma tamamlandı!',
    scoreLabel: 'Doğru cevaplar',
    playAgainBtn: 'Tekrar Oyna',
    changeModeBtn: 'Diğer Modlar',
  },
  it: {
    folderTitle: 'L’ora',
    folderSubtitle: '6 modalità audio',
    hubTitle: 'Allenamento sull’ora',
    hubSubtitle: 'Scegli una modalità, ascolta l’ora in inglese e seleziona l’orario corretto',
    backBtn: 'Indietro',
    modeAmTitle: 'Mattina (AM)',
    modeAmDesc: 'Prima di mezzogiorno · 01:00–11:00 AM',
    modePmTitle: 'Pomeriggio / Sera (PM)',
    modePmDesc: 'Dopo mezzogiorno · 1:00–11:00 PM',
    modeHalvesTitle: 'Mezz’ore',
    modeHalvesDesc: 'Half past · :30 minuti',
    modeQuartersTitle: 'Quarti d’ora',
    modeQuartersDesc: 'Quarter past / to · :15 e :45',
    modeTenTitle: 'Ogni 10 minuti',
    modeTenDesc: 'Scatti di 10 min · :10, :20, :40, :50',
    modeFiveTitle: 'Ogni 5 minuti',
    modeFiveDesc: 'Tutti gli intervalli di 5 minuti',
    listenPrompt: 'Che ora hai sentito?',
    replayHint: 'Tocca l’altoparlante per riascoltare',
    doneTitle: 'Allenamento completato!',
    scoreLabel: 'Risposte corrette',
    playAgainBtn: 'Riprova',
    changeModeBtn: 'Altre modalità',
  },
  ro: {
    folderTitle: 'Ora',
    folderSubtitle: '6 moduri audio',
    hubTitle: 'Exersare oră',
    hubSubtitle: 'Alege un mod, ascultă ora în engleză și atinge varianta corectă',
    backBtn: 'Înapoi',
    modeAmTitle: 'Înainte de prânz (AM)',
    modeAmDesc: 'Orele dimineții · 01:00–11:00 AM',
    modePmTitle: 'După prânz (PM)',
    modePmDesc: 'După-amiaza și seara · 1:00–11:00 PM',
    modeHalvesTitle: 'Jumătăți',
    modeHalvesDesc: 'Half past · :30 minute',
    modeQuartersTitle: 'Sferturi',
    modeQuartersDesc: 'Quarter past / to · :15 și :45',
    modeTenTitle: 'Din 10 în 10 min',
    modeTenDesc: 'Intervale de 10 min · :10, :20, :40, :50',
    modeFiveTitle: 'Din 5 în 5 min',
    modeFiveDesc: 'Toate intervalele de 5 minute',
    listenPrompt: 'Ce oră ai auzit?',
    replayHint: 'Atinge difuzorul pentru a asculta din nou',
    doneTitle: 'Antrenament finalizat!',
    scoreLabel: 'Răspunsuri corecte',
    playAgainBtn: 'Din nou',
    changeModeBtn: 'Alte moduri',
  },
  bg: {
    folderTitle: 'Часът',
    folderSubtitle: '6 аудио режима',
    hubTitle: 'Часът на английски',
    hubSubtitle: 'Изберете режим, чуйте часа на английски и натиснете верния отговор',
    backBtn: 'Назад',
    modeAmTitle: 'Преди обяд (AM)',
    modeAmDesc: 'Сутрешни часове · 01:00–11:00 AM',
    modePmTitle: 'След обяд (PM)',
    modePmDesc: 'Следобед и вечер · 1:00–11:00 PM',
    modeHalvesTitle: 'Половини',
    modeHalvesDesc: 'Half past · :30 минути',
    modeQuartersTitle: 'Четвъртини',
    modeQuartersDesc: 'Quarter past / to · :15 и :45',
    modeTenTitle: 'През 10 минути',
    modeTenDesc: 'Десетки минути · :10, :20, :40, :50',
    modeFiveTitle: 'През 5 минути',
    modeFiveDesc: 'Всички 5-минутни интервали',
    listenPrompt: 'Кой час чухте?',
    replayHint: 'Натиснете високоговорителя, за да чуете отново',
    doneTitle: 'Тренировката завърши!',
    scoreLabel: 'Верни отговори',
    playAgainBtn: 'Още веднъж',
    changeModeBtn: 'Други режими',
  },
  hu: {
    folderTitle: 'Idő',
    folderSubtitle: '6 hallás utáni mód',
    hubTitle: 'Idő gyakorlása hallás után',
    hubSubtitle: 'Válassz módot, hallgasd meg az időt angolul, és válaszd ki a helyeset',
    backBtn: 'Vissza',
    modeAmTitle: 'Délelőtt (AM)',
    modeAmDesc: 'Délelőtti órák · 01:00–11:00 AM',
    modePmTitle: 'Délután (PM)',
    modePmDesc: 'Délután és este · 1:00–11:00 PM',
    modeHalvesTitle: 'Fél órák',
    modeHalvesDesc: 'Half past · :30 perc',
    modeQuartersTitle: 'Negyedek',
    modeQuartersDesc: 'Quarter past / to · :15 és :45',
    modeTenTitle: '10 percenként',
    modeTenDesc: 'Tízes percek · :10, :20, :40, :50',
    modeFiveTitle: '5 percenként',
    modeFiveDesc: 'Minden 5 perces időköz',
    listenPrompt: 'Milyen időt hallottál?',
    replayHint: 'Érintsd meg a hangszórót az újrahallgatáshoz',
    doneTitle: 'Gyakorlás kész!',
    scoreLabel: 'Helyes válaszok',
    playAgainBtn: 'Újra',
    changeModeBtn: 'Más módok',
  },
  el: {
    folderTitle: 'Ώρα',
    folderSubtitle: '6 λειτουργίες ήχου',
    hubTitle: 'Εξάσκηση ώρας',
    hubSubtitle: 'Επιλέξτε λειτουργία, ακούστε την ώρα στα αγγλικά και διαλέξτε τη σωστή',
    backBtn: 'Πίσω',
    modeAmTitle: 'Πρωί (AM)',
    modeAmDesc: 'Πριν το μεσημέρι · 01:00–11:00 AM',
    modePmTitle: 'Απόγευμα / Βράδυ (PM)',
    modePmDesc: 'Μετά το μεσημέρι · 1:00–11:00 PM',
    modeHalvesTitle: 'Μισές ώρες',
    modeHalvesDesc: 'Half past · :30 λεπτά',
    modeQuartersTitle: 'Τέταρτα',
    modeQuartersDesc: 'Quarter past / to · :15 και :45',
    modeTenTitle: 'Ανά 10 λεπτά',
    modeTenDesc: 'Δεκάλεπτα · :10, :20, :40, :50',
    modeFiveTitle: 'Ανά 5 λεπτά',
    modeFiveDesc: 'Όλα τα διαστήματα 5 λεπτών',
    listenPrompt: 'Ποια ώρα ακούσατε;',
    replayHint: 'Πατήστε το ηχείο για να ακούσετε ξανά',
    doneTitle: 'Η άσκηση ολοκληρώθηκε!',
    scoreLabel: 'Σωστές απαντήσεις',
    playAgainBtn: 'Ξανά',
    changeModeBtn: 'Άλλες λειτουργίες',
  },
  da: {
    folderTitle: 'Klokken',
    folderSubtitle: '6 lyttetilstande',
    hubTitle: 'Øv klokkeslæt',
    hubSubtitle: 'Vælg en tilstand, lyt til tiden på engelsk og tryk på det rigtige svar',
    backBtn: 'Tilbage',
    modeAmTitle: 'Formiddag (AM)',
    modeAmDesc: 'Før middag · 01:00–11:00 AM',
    modePmTitle: 'Eftermiddag / Aften (PM)',
    modePmDesc: 'Efter middag · 1:00–11:00 PM',
    modeHalvesTitle: 'Halve timer',
    modeHalvesDesc: 'Half past · :30 minutter',
    modeQuartersTitle: 'Kvarter',
    modeQuartersDesc: 'Quarter past / to · :15 og :45',
    modeTenTitle: 'Hvert 10. minut',
    modeTenDesc: '10-minutters trin · :10, :20, :40, :50',
    modeFiveTitle: 'Hvert 5. minut',
    modeFiveDesc: 'Alle 5-minutters intervaller',
    listenPrompt: 'Hvad var klokken?',
    replayHint: 'Tryk på højttaleren for at lytte igen',
    doneTitle: 'Træning fuldført!',
    scoreLabel: 'Rigtige svar',
    playAgainBtn: 'Spil igen',
    changeModeBtn: 'Andre tilstande',
  },
  lv: {
    folderTitle: 'Laiks',
    folderSubtitle: '6 klausīšanās režīmi',
    hubTitle: 'Pulksteņa laiks pēc dzirdes',
    hubSubtitle: 'Izvēlieties režīmu, noklausieties laiku angļu valodā un norādiet pareizo',
    backBtn: 'Atpakaļ',
    modeAmTitle: 'Pirms pusdienām (AM)',
    modeAmDesc: 'Rīta stundas · 01:00–11:00 AM',
    modePmTitle: 'Pēc pusdienām (PM)',
    modePmDesc: 'Diena un vakars · 1:00–11:00 PM',
    modeHalvesTitle: 'Pusstundas',
    modeHalvesDesc: 'Half past · :30 minūtes',
    modeQuartersTitle: 'Ceturkšņi',
    modeQuartersDesc: 'Quarter past / to · :15 un :45',
    modeTenTitle: 'Ik pēc 10 minūtēm',
    modeTenDesc: '10 minūšu soļi · :10, :20, :40, :50',
    modeFiveTitle: 'Ik pēc 5 minūtēm',
    modeFiveDesc: 'Visi 5 minūšu intervāli',
    listenPrompt: 'Kāds laiks izskanēja?',
    replayHint: 'Nospiediet skaļruni, lai noklausītos vēlreiz',
    doneTitle: 'Treniņš pabeigts!',
    scoreLabel: 'Pareizās atbildes',
    playAgainBtn: 'Vēlreiz',
    changeModeBtn: 'Citi režīmi',
  },
  lt: {
    folderTitle: 'Laikas',
    folderSubtitle: '6 klausymo režimai',
    hubTitle: 'Laiko klausymo pratimai',
    hubSubtitle: 'Pasirinkite režimą, išgirskite laiką angliškai ir pasirinkite teisingą atsakymą',
    backBtn: 'Atgal',
    modeAmTitle: 'Prieš pietus (AM)',
    modeAmDesc: 'Ryto valandos · 01:00–11:00 AM',
    modePmTitle: 'Po pietų (PM)',
    modePmDesc: 'Popietė ir vakaras · 1:00–11:00 PM',
    modeHalvesTitle: 'Pusvalandžiai',
    modeHalvesDesc: 'Half past · :30 minučių',
    modeQuartersTitle: 'Ketvirčiai',
    modeQuartersDesc: 'Quarter past / to · :15 ir :45',
    modeTenTitle: 'Kas 10 minučių',
    modeTenDesc: 'Dešimtys minučių · :10, :20, :40, :50',
    modeFiveTitle: 'Kas 5 minutes',
    modeFiveDesc: 'Visi 5 minučių intervalai',
    listenPrompt: 'Kokį laiką išgirdote?',
    replayHint: 'Bakstelėkite garsiakalbį, kad paklausytumėte dar kartą',
    doneTitle: 'Treniruotė baigta!',
    scoreLabel: 'Teisingi atsakymai',
    playAgainBtn: 'Dar kartą',
    changeModeBtn: 'Kiti režimai',
  },
  pt: {
    folderTitle: 'Horas',
    folderSubtitle: '6 modos de áudio',
    hubTitle: 'Treino de horas',
    hubSubtitle: 'Escolha um modo, oiça a hora em inglês e selecione a opção correta',
    backBtn: 'Voltar',
    modeAmTitle: 'Manhã (AM)',
    modeAmDesc: 'Antes do meio-dia · 01:00–11:00 AM',
    modePmTitle: 'Tarde e Noite (PM)',
    modePmDesc: 'Depois do meio-dia · 1:00–11:00 PM',
    modeHalvesTitle: 'Meias horas',
    modeHalvesDesc: 'Half past · :30 minutos',
    modeQuartersTitle: 'Quartos de hora',
    modeQuartersDesc: 'Quarter past / to · :15 e :45',
    modeTenTitle: 'De 10 em 10 min',
    modeTenDesc: 'Passos de 10 min · :10, :20, :40, :50',
    modeFiveTitle: 'De 5 em 5 min',
    modeFiveDesc: 'Todos os intervalos de 5 min',
    listenPrompt: 'Que horas ouviu?',
    replayHint: 'Toque no altifalante para ouvir novamente',
    doneTitle: 'Treino concluído!',
    scoreLabel: 'Respostas certas',
    playAgainBtn: 'Repetir',
    changeModeBtn: 'Outros modos',
  },
  'pt-br': {
    folderTitle: 'Horas',
    folderSubtitle: '6 modos em áudio',
    hubTitle: 'Treinar horas no ouvido',
    hubSubtitle: 'Escolha um modo, ouça o horário em inglês e toque na opção certa',
    backBtn: 'Voltar',
    modeAmTitle: 'Manhã (AM)',
    modeAmDesc: 'Antes do meio-dia · 01:00–11:00 AM',
    modePmTitle: 'Tarde e Noite (PM)',
    modePmDesc: 'Depois do meio-dia · 1:00–11:00 PM',
    modeHalvesTitle: 'Meias horas',
    modeHalvesDesc: 'Half past · :30 minutos',
    modeQuartersTitle: 'Quartos de hora',
    modeQuartersDesc: 'Quarter past / to · :15 e :45',
    modeTenTitle: 'De 10 em 10 min',
    modeTenDesc: 'Intervalos de 10 min · :10, :20, :40, :50',
    modeFiveTitle: 'De 5 em 5 min',
    modeFiveDesc: 'Todos os intervalos de 5 min',
    listenPrompt: 'Qual horário você ouviu?',
    replayHint: 'Toque no alto-falante para ouvir de novo',
    doneTitle: 'Treino concluído!',
    scoreLabel: 'Acertos',
    playAgainBtn: 'Jogar de novo',
    changeModeBtn: 'Outros modos',
  },
  sk: {
    folderTitle: 'Čas',
    folderSubtitle: '6 režimov posluchu',
    hubTitle: 'Čas na posluch',
    hubSubtitle: 'Vyberte režim, vypočujte si čas po anglicky a klepnite na správnu možnosť',
    backBtn: 'Späť',
    modeAmTitle: 'Dopoludnia (AM)',
    modeAmDesc: 'Ranné hodiny · 01:00–11:00 AM',
    modePmTitle: 'Popoludní (PM)',
    modePmDesc: 'Popoludnie a večer · 1:00–11:00 PM',
    modeHalvesTitle: 'Polovice',
    modeHalvesDesc: 'Half past · :30 minút',
    modeQuartersTitle: 'Štvrťhodiny',
    modeQuartersDesc: 'Quarter past / to · :15 a :45',
    modeTenTitle: 'Po 10 minútach',
    modeTenDesc: 'Desaťminútové kroky · :10, :20, :40, :50',
    modeFiveTitle: 'Po 5 minútach',
    modeFiveDesc: 'Všetky 5-minútové intervaly',
    listenPrompt: 'Aký čas ste počuli?',
    replayHint: 'Pre opätovné prehratie klepnite na reproduktor',
    doneTitle: 'Tréning dokončený!',
    scoreLabel: 'Správne odpovede',
    playAgainBtn: 'Znova',
    changeModeBtn: 'Iné režimy',
  },
  sl: {
    folderTitle: 'Čas',
    folderSubtitle: '6 slušnih načinov',
    hubTitle: 'Poslušanje časa',
    hubSubtitle: 'Izberite način, poslušajte uro v angleščini in tapnite pravilen odgovor',
    backBtn: 'Nazaj',
    modeAmTitle: 'Dopoldne (AM)',
    modeAmDesc: 'Jutranje ure · 01:00–11:00 AM',
    modePmTitle: 'Popoldne (PM)',
    modePmDesc: 'Popoldan in večer · 1:00–11:00 PM',
    modeHalvesTitle: 'Polovice',
    modeHalvesDesc: 'Half past · :30 minut',
    modeQuartersTitle: 'Četrtine',
    modeQuartersDesc: 'Quarter past / to · :15 in :45',
    modeTenTitle: 'Na 10 minut',
    modeTenDesc: 'Desetminutni koraki · :10, :20, :40, :50',
    modeFiveTitle: 'Na 5 minut',
    modeFiveDesc: 'Vsi 5-minutni intervali',
    listenPrompt: 'Katero uro ste slišali?',
    replayHint: 'Tapnite zvočnik za ponovno poslušanje',
    doneTitle: 'Vadba končana!',
    scoreLabel: 'Pravilni odgovori',
    playAgainBtn: 'Še enkrat',
    changeModeBtn: 'Drugi načini',
  },
  fi: {
    folderTitle: 'Kellonajat',
    folderSubtitle: '6 kuuntelutilaa',
    hubTitle: 'Kellonajat kuunnellen',
    hubSubtitle: 'Valitse harjoitustila, kuuntele kellonaika englanniksi ja valitse oikea',
    backBtn: 'Takaisin',
    modeAmTitle: 'Aamupäivä (AM)',
    modeAmDesc: 'Ennen puolta päivää · 01:00–11:00 AM',
    modePmTitle: 'Iltapäivä / Ilta (PM)',
    modePmDesc: 'Puolenpäivän jälkeen · 1:00–11:00 PM',
    modeHalvesTitle: 'Puolitunnit',
    modeHalvesDesc: 'Half past · :30 minuuttia',
    modeQuartersTitle: 'Neljännestunnit',
    modeQuartersDesc: 'Quarter past / to · :15 ja :45',
    modeTenTitle: '10 minuutin välein',
    modeTenDesc: 'Kymmenen minuutin askel · :10, :20, :40, :50',
    modeFiveTitle: '5 minuutin välein',
    modeFiveDesc: 'Kaikki 5 minuutin välit',
    listenPrompt: 'Minkä kellonajan kuulit?',
    replayHint: 'Kuuntele uudelleen napauttamalla kaiutinta',
    doneTitle: 'Harjoitus valmis!',
    scoreLabel: 'Oikeat vastaukset',
    playAgainBtn: 'Uudestaan',
    changeModeBtn: 'Muut tilat',
  },
  hr: {
    folderTitle: 'Vrijeme',
    folderSubtitle: '6 slušnih načina',
    hubTitle: 'Slušanje vremena',
    hubSubtitle: 'Odaberite način, poslušajte vrijeme na engleskom i dodirnite točan odgovor',
    backBtn: 'Natrag',
    modeAmTitle: 'Prijepodne (AM)',
    modeAmDesc: 'Jutarnji sati · 01:00–11:00 AM',
    modePmTitle: 'Poslijepodne (PM)',
    modePmDesc: 'Popodne i večer · 1:00–11:00 PM',
    modeHalvesTitle: 'Polovice',
    modeHalvesDesc: 'Half past · :30 minuta',
    modeQuartersTitle: 'Četvrtine',
    modeQuartersDesc: 'Quarter past / to · :15 i :45',
    modeTenTitle: 'Svakih 10 minuta',
    modeTenDesc: 'Desetice minuta · :10, :20, :40, :50',
    modeFiveTitle: 'Svakih 5 minuta',
    modeFiveDesc: 'Svi 5-minutni intervali',
    listenPrompt: 'Koje ste vrijeme čuli?',
    replayHint: 'Dodirnite zvučnik za ponovno slušanje',
    doneTitle: 'Vježba dovršena!',
    scoreLabel: 'Točni odgovori',
    playAgainBtn: 'Ponovi',
    changeModeBtn: 'Drugi načini',
  },
  cs: {
    folderTitle: 'Čas',
    folderSubtitle: '6 poslechových režimů',
    hubTitle: 'Čas na poslech',
    hubSubtitle: 'Vyberte režim, poslechněte si čas anglicky a vyberte správnou možnost',
    backBtn: 'Zpět',
    modeAmTitle: 'Dopoledne (AM)',
    modeAmDesc: 'Ranní hodiny · 01:00–11:00 AM',
    modePmTitle: 'Odpoledne (PM)',
    modePmDesc: 'Odpoledne a večer · 1:00–11:00 PM',
    modeHalvesTitle: 'Poloviny',
    modeHalvesDesc: 'Half past · :30 minut',
    modeQuartersTitle: 'Čtvrtiny',
    modeQuartersDesc: 'Quarter past / to · :15 a :45',
    modeTenTitle: 'Po 10 minutách',
    modeTenDesc: 'Desítky minut · :10, :20, :40, :50',
    modeFiveTitle: 'Po 5 minutách',
    modeFiveDesc: 'Všechny 5minutové intervaly',
    listenPrompt: 'Jaký čas jste slyšeli?',
    replayHint: 'Klepnutím na reproduktor si čas pustíte znovu',
    doneTitle: 'Procvičování dokončeno!',
    scoreLabel: 'Správné odpovědi',
    playAgainBtn: 'Znovu',
    changeModeBtn: 'Jiné režimy',
  },
  sv: {
    folderTitle: 'Klockan',
    folderSubtitle: '6 lyssningslägen',
    hubTitle: 'Öva klockslag',
    hubSubtitle: 'Välj ett läge, lyssna på tiden på engelska och tryck på rätt alternativ',
    backBtn: 'Tillbaka',
    modeAmTitle: 'Förmiddag (AM)',
    modeAmDesc: 'Före lunch · 01:00–11:00 AM',
    modePmTitle: 'Eftermiddag (PM)',
    modePmDesc: 'Efter lunch · 1:00–11:00 PM',
    modeHalvesTitle: 'Halvtimmar',
    modeHalvesDesc: 'Half past · :30 minuter',
    modeQuartersTitle: 'Kvartar',
    modeQuartersDesc: 'Quarter past / to · :15 och :45',
    modeTenTitle: 'Var 10:e minut',
    modeTenDesc: 'Tiominuterssteg · :10, :20, :40, :50',
    modeFiveTitle: 'Var 5:e minut',
    modeFiveDesc: 'Alla 5-minutersintervall',
    listenPrompt: 'Vilken tid hörde du?',
    replayHint: 'Tryck på högtalaren för att lyssna igen',
    doneTitle: 'Övning klar!',
    scoreLabel: 'Rätta svar',
    playAgainBtn: 'Spela igen',
    changeModeBtn: 'Andra lägen',
  },
  et: {
    folderTitle: 'Kellaaeg',
    folderSubtitle: '6 kuulamisrežiimi',
    hubTitle: 'Kellaaeg kuulmise järgi',
    hubSubtitle: 'Vali režiim, kuula ingliskeelset kellaaega ja vali õige variant',
    backBtn: 'Tagasi',
    modeAmTitle: 'Enne lõunat (AM)',
    modeAmDesc: 'Hommikutunnid · 01:00–11:00 AM',
    modePmTitle: 'Pärast lõunat (PM)',
    modePmDesc: 'Päev ja õhtu · 1:00–11:00 PM',
    modeHalvesTitle: 'Pooltunnid',
    modeHalvesDesc: 'Half past · :30 minutit',
    modeQuartersTitle: 'Veerandtunnid',
    modeQuartersDesc: 'Quarter past / to · :15 ja :45',
    modeTenTitle: '10 min kaupa',
    modeTenDesc: '10-minutilised sammud · :10, :20, :40, :50',
    modeFiveTitle: '5 min kaupa',
    modeFiveDesc: 'Kõik 5-minutilised vahemikud',
    listenPrompt: 'Mis kellaaega kuulsid?',
    replayHint: 'Uuesti kuulamiseks vajuta kõlarile',
    doneTitle: 'Harjutus lõpetatud!',
    scoreLabel: 'Õiged vastused',
    playAgainBtn: 'Uuesti',
    changeModeBtn: 'Teised režiimid',
  },
  hi: {
    folderTitle: 'समय',
    folderSubtitle: '6 सुनने के मोड',
    hubTitle: 'समय सुनकर पहचानें',
    hubSubtitle: 'अभ्यास मोड चुनें, अंग्रेज़ी में समय सुनें और सही विकल्प पर टैप करें',
    backBtn: 'वापस',
    modeAmTitle: 'सुबह (AM)',
    modeAmDesc: 'दोपहर से पहले · 01:00–11:00 AM',
    modePmTitle: 'दोपहर व शाम (PM)',
    modePmDesc: 'दोपहर के बाद · 1:00–11:00 PM',
    modeHalvesTitle: 'आधे घंटे (साढ़े)',
    modeHalvesDesc: 'Half past · :30 मिनट',
    modeQuartersTitle: 'चौथाई घंटे (सवा/पौने)',
    modeQuartersDesc: 'Quarter past / to · :15 और :45',
    modeTenTitle: 'हर 10 मिनट',
    modeTenDesc: '10 मिनट के अंतराल · :10, :20, :40, :50',
    modeFiveTitle: 'हर 5 मिनट',
    modeFiveDesc: 'सभी 5-मिनट के अंतराल',
    listenPrompt: 'आपने कौन-सा समय सुना?',
    replayHint: 'दोबारा सुनने के लिए स्पीकर पर टैप करें',
    doneTitle: 'अभ्यास पूरा हुआ!',
    scoreLabel: 'सही उत्तर',
    playAgainBtn: 'फिर से खेलें',
    changeModeBtn: 'अन्य मोड',
  },
  bn: {
    folderTitle: 'সময়',
    folderSubtitle: '৬টি শোনার মোড',
    hubTitle: 'শুনে সময় চেনা',
    hubSubtitle: 'মোড বেছে নিন, ইংরেজিতে সময় শুনুন এবং সঠিক উত্তরটি নির্বাচন করুন',
    backBtn: 'ফিরুন',
    modeAmTitle: 'সকাল (AM)',
    modeAmDesc: 'দুপুরের আগে · 01:00–11:00 AM',
    modePmTitle: 'বিকাল ও সন্ধ্যা (PM)',
    modePmDesc: 'দুপুরের পরে · 1:00–11:00 PM',
    modeHalvesTitle: 'সাড়ে / অর্ধেক',
    modeHalvesDesc: 'Half past · :30 মিনিট',
    modeQuartersTitle: 'সোয়া ও পৌনে',
    modeQuartersDesc: 'Quarter past / to · :15 এবং :45',
    modeTenTitle: '১০ মিনিট পরপর',
    modeTenDesc: '১০ মিনিটের ধাপ · :10, :20, :40, :50',
    modeFiveTitle: '৫ মিনিট পরপর',
    modeFiveDesc: 'সব ৫-মিনিটের ব্যবধান',
    listenPrompt: 'কোন সময়টি শুনেছেন?',
    replayHint: 'আবার শুনতে স্পিকারে ট্যাপ করুন',
    doneTitle: 'অনুশীলন সম্পন্ন!',
    scoreLabel: 'সঠিক উত্তর',
    playAgainBtn: 'আবার খেলুন',
    changeModeBtn: 'অন্যান্য মোড',
  },
  ar: {
    folderTitle: 'الوقت',
    folderSubtitle: '6 أنماط استماع',
    hubTitle: 'تدريب الوقت سماعياً',
    hubSubtitle: 'اختر نمطاً، استمع إلى الوقت بالإنجليزية واختر الإجابة الصحيحة',
    backBtn: 'رجوع',
    modeAmTitle: 'صباحاً (AM)',
    modeAmDesc: 'قبل الظهر · 01:00–11:00 AM',
    modePmTitle: 'مساءً (PM)',
    modePmDesc: 'بعد الظهر والمساء · 1:00–11:00 PM',
    modeHalvesTitle: 'الأنصاف',
    modeHalvesDesc: 'Half past · :30 دقيقة',
    modeQuartersTitle: 'الأرباع',
    modeQuartersDesc: 'Quarter past / to · :15 و :45',
    modeTenTitle: 'كل 10 دقائق',
    modeTenDesc: 'فواصل 10 دقائق · :10، :20، :40، :50',
    modeFiveTitle: 'كل 5 دقائق',
    modeFiveDesc: 'جميع فواصل 5 دقائق',
    listenPrompt: 'ما الوقت الذي سمعته؟',
    replayHint: 'اضغط على مكبر الصوت للاستماع مجدداً',
    doneTitle: 'اكتمل التدريب!',
    scoreLabel: 'الإجابات الصحيحة',
    playAgainBtn: 'مرة أخرى',
    changeModeBtn: 'أنماط أخرى',
  },
  fa: {
    folderTitle: 'زمان',
    folderSubtitle: '۶ حالت شنیداری',
    hubTitle: 'تمرین شنیداری ساعت',
    hubSubtitle: 'یک حالت را انتخاب کنید، ساعت را به انگلیسی بشنوید و گزینه درست را بزنید',
    backBtn: 'بازگشت',
    modeAmTitle: 'قبل از ظهر (AM)',
    modeAmDesc: 'ساعات صبح · 01:00–11:00 AM',
    modePmTitle: 'بعد از ظهر (PM)',
    modePmDesc: 'عصر و شب · 1:00–11:00 PM',
    modeHalvesTitle: 'نیم‌ساعت‌ها',
    modeHalvesDesc: 'Half past · :30 دقیقه',
    modeQuartersTitle: 'ربع‌ساعت‌ها',
    modeQuartersDesc: 'Quarter past / to · :15 و :45',
    modeTenTitle: 'هر ۱۰ دقیقه',
    modeTenDesc: 'گام‌های ۱۰ دقیقه‌ای · :10، :20، :40، :50',
    modeFiveTitle: 'هر ۵ دقیقه',
    modeFiveDesc: 'همه بازه‌های ۵ دقیقه‌ای',
    listenPrompt: 'چه ساعتی را شنیدید؟',
    replayHint: 'برای شنیدن دوباره روی بلندگو بزنید',
    doneTitle: 'تمرین کامل شد!',
    scoreLabel: 'پاسخ‌های درست',
    playAgainBtn: 'دوباره',
    changeModeBtn: 'سایر حالت‌ها',
  },
  ur: {
    folderTitle: 'وقت',
    folderSubtitle: '6 سماعتی موڈز',
    hubTitle: 'سن کر وقت پہچانیں',
    hubSubtitle: 'موڈ منتخب کریں، انگریزی میں وقت سنیں اور درست جواب چنیں',
    backBtn: 'واپس',
    modeAmTitle: 'دوپہر سے پہلے (AM)',
    modeAmDesc: 'صبح کے اوقات · 01:00–11:00 AM',
    modePmTitle: 'دوپہر کے بعد (PM)',
    modePmDesc: 'سہ پہر اور شام · 1:00–11:00 PM',
    modeHalvesTitle: 'نصف گھنٹے (ساڑھے)',
    modeHalvesDesc: 'Half past · :30 منٹ',
    modeQuartersTitle: 'چوتھائی گھنٹے (سوا / پونے)',
    modeQuartersDesc: 'Quarter past / to · :15 اور :45',
    modeTenTitle: 'ہر 10 منٹ',
    modeTenDesc: 'دس منٹ کے وقفے · :10، :20، :40، :50',
    modeFiveTitle: 'ہر 5 منٹ',
    modeFiveDesc: 'تمام 5 منٹ کے وقفے',
    listenPrompt: 'آپ نے کون سا وقت سنا؟',
    replayHint: 'دوبارہ سننے کے لیے اسپیکر پر ٹیپ کریں',
    doneTitle: 'مشق مکمل ہو گئی!',
    scoreLabel: 'درست جوابات',
    playAgainBtn: 'دوبارہ کھیلیں',
    changeModeBtn: 'دیگر موڈز',
  },
  id: {
    folderTitle: 'Waktu',
    folderSubtitle: '6 mode dengar',
    hubTitle: 'Latihan Jam (Audio)',
    hubSubtitle: 'Pilih mode, dengarkan jam dalam bahasa Inggris, lalu pilih jawaban yang tepat',
    backBtn: 'Kembali',
    modeAmTitle: 'Pagi / Sebelum Siang (AM)',
    modeAmDesc: 'Pukul 01:00–11:00 AM',
    modePmTitle: 'Siang & Malam (PM)',
    modePmDesc: 'Pukul 1:00–11:00 PM',
    modeHalvesTitle: 'Setengah Jam',
    modeHalvesDesc: 'Half past · :30 menit',
    modeQuartersTitle: 'Seperempat Jam',
    modeQuartersDesc: 'Quarter past / to · :15 & :45',
    modeTenTitle: 'Tiap 10 Menit',
    modeTenDesc: 'Kelipatan 10 mnt · :10, :20, :40, :50',
    modeFiveTitle: 'Tiap 5 Menit',
    modeFiveDesc: 'Semua interval 5 menit',
    listenPrompt: 'Jam berapa yang Anda dengar?',
    replayHint: 'Ketuk speaker untuk mendengar ulang',
    doneTitle: 'Latihan selesai!',
    scoreLabel: 'Jawaban benar',
    playAgainBtn: 'Ulangi',
    changeModeBtn: 'Mode lain',
  },
  vi: {
    folderTitle: 'Giờ giấc',
    folderSubtitle: '6 chế độ nghe',
    hubTitle: 'Luyện nghe giờ tiếng Anh',
    hubSubtitle: 'Chọn chế độ, nghe giờ bằng tiếng Anh và chạm vào đáp án đúng',
    backBtn: 'Quay lại',
    modeAmTitle: 'Buổi sáng (AM)',
    modeAmDesc: 'Trước trưa · 01:00–11:00 AM',
    modePmTitle: 'Buổi chiều / tối (PM)',
    modePmDesc: 'Sau trưa · 1:00–11:00 PM',
    modeHalvesTitle: 'Giờ rưỡi',
    modeHalvesDesc: 'Half past · :30 phút',
    modeQuartersTitle: 'Giờ kém / hơn 15',
    modeQuartersDesc: 'Quarter past / to · :15 & :45',
    modeTenTitle: 'Mỗi 10 phút',
    modeTenDesc: 'Bước 10 phút · :10, :20, :40, :50',
    modeFiveTitle: 'Mỗi 5 phút',
    modeFiveDesc: 'Tất cả mốc 5 phút',
    listenPrompt: 'Bạn nghe thấy mấy giờ?',
    replayHint: 'Chạm vào loa để nghe lại',
    doneTitle: 'Hoàn thành luyện tập!',
    scoreLabel: 'Câu trả lời đúng',
    playAgainBtn: 'Làm lại',
    changeModeBtn: 'Chế độ khác',
  },
  th: {
    folderTitle: 'เวลา',
    folderSubtitle: '6 โหมดการฟัง',
    hubTitle: 'ฝึกฟังเวลาภาษาอังกฤษ',
    hubSubtitle: 'เลือกโหมด ฟังเสียงเวลาภาษาอังกฤษ แล้วแตะตัวเลือกที่ถูกต้อง',
    backBtn: 'กลับ',
    modeAmTitle: 'ช่วงเช้า (AM)',
    modeAmDesc: 'ก่อนเที่ยง · 01:00–11:00 AM',
    modePmTitle: 'ช่วงบ่ายและค่ำ (PM)',
    modePmDesc: 'หลังเที่ยง · 1:00–11:00 PM',
    modeHalvesTitle: 'ครึ่งชั่วโมง',
    modeHalvesDesc: 'Half past · :30 นาที',
    modeQuartersTitle: '15 และ 45 นาที',
    modeQuartersDesc: 'Quarter past / to · :15 และ :45',
    modeTenTitle: 'ทุก 10 นาที',
    modeTenDesc: 'ช่วงละ 10 นาที · :10, :20, :40, :50',
    modeFiveTitle: 'ทุก 5 นาที',
    modeFiveDesc: 'ทุกช่วงเวลา 5 นาที',
    listenPrompt: 'คุณได้ยินเวลาใด?',
    replayHint: 'แตะลำโพงเพื่อฟังซ้ำอีกครั้ง',
    doneTitle: 'ฝึกจบแล้ว!',
    scoreLabel: 'ตอบถูก',
    playAgainBtn: 'เล่นอีกครั้ง',
    changeModeBtn: 'โหมดอื่น',
  },
  ko: {
    folderTitle: '시간',
    folderSubtitle: '6가지 듣기 모드',
    hubTitle: '영어 시간 듣기',
    hubSubtitle: '모드를 선택하고 영어 시간을 들은 뒤 알맞은 시각을 고르세요',
    backBtn: '뒤로',
    modeAmTitle: '오전 (AM)',
    modeAmDesc: '정오 전 · 01:00–11:00 AM',
    modePmTitle: '오후 (PM)',
    modePmDesc: '정오 이후 · 1:00–11:00 PM',
    modeHalvesTitle: '30분 (반)',
    modeHalvesDesc: 'Half past · :30분',
    modeQuartersTitle: '15분 / 45분',
    modeQuartersDesc: 'Quarter past / to · :15 & :45',
    modeTenTitle: '10분 단위',
    modeTenDesc: '10분 간격 · :10, :20, :40, :50',
    modeFiveTitle: '5분 단위',
    modeFiveDesc: '모든 5분 단위 시각',
    listenPrompt: '들린 시간은 몇 시인가요?',
    replayHint: '다시 들으려면 스피커를 누르세요',
    doneTitle: '연습 완료!',
    scoreLabel: '정답 수',
    playAgainBtn: '다시 하기',
    changeModeBtn: '다른 모드',
  },
  ja: {
    folderTitle: '時間',
    folderSubtitle: '6つのリスニングモード',
    hubTitle: '英語の時刻リスニング',
    hubSubtitle: 'モードを選び、英語の時刻を聞いて正しい時計をタップしましょう',
    backBtn: '戻る',
    modeAmTitle: '午前 (AM)',
    modeAmDesc: '正午前 · 01:00–11:00 AM',
    modePmTitle: '午後 (PM)',
    modePmDesc: '正午後 · 1:00–11:00 PM',
    modeHalvesTitle: '半（30分）',
    modeHalvesDesc: 'Half past · :30分',
    modeQuartersTitle: '15分 / 45分',
    modeQuartersDesc: 'Quarter past / to · :15 & :45',
    modeTenTitle: '10分刻み',
    modeTenDesc: '10分間隔 · :10, :20, :40, :50',
    modeFiveTitle: '5分刻み',
    modeFiveDesc: 'すべての5分間隔',
    listenPrompt: '聞こえた時刻はどれですか？',
    replayHint: 'スピーカーを押すともう一度聞けます',
    doneTitle: 'トレーニング完了！',
    scoreLabel: '正解数',
    playAgainBtn: 'もう一度',
    changeModeBtn: 'ほかのモード',
  },
  zh: {
    folderTitle: '时间表达',
    folderSubtitle: '6种听力训练',
    hubTitle: '英语时间听力训练',
    hubSubtitle: '选择训练模式，听英语报时并选出对应的时间',
    backBtn: '返回',
    modeAmTitle: '上午 (AM)',
    modeAmDesc: '午饭前 · 01:00–11:00 AM',
    modePmTitle: '下午与晚上 (PM)',
    modePmDesc: '午饭后 · 1:00–11:00 PM',
    modeHalvesTitle: '半点',
    modeHalvesDesc: 'Half past · :30分',
    modeQuartersTitle: '刻钟',
    modeQuartersDesc: 'Quarter past / to · :15 与 :45',
    modeTenTitle: '整10分钟',
    modeTenDesc: '10分钟间隔 · :10, :20, :40, :50',
    modeFiveTitle: '每5分钟',
    modeFiveDesc: '全部5分钟间隔',
    listenPrompt: '你听到了几点？',
    replayHint: '点击喇叭图标可重新收听',
    doneTitle: '训练完成！',
    scoreLabel: '答对题数',
    playAgainBtn: '再来一轮',
    changeModeBtn: '切换模式',
  },
  kk: {
    folderTitle: 'Уақыт',
    folderSubtitle: '6 тыңдау режимі',
    hubTitle: 'Уақытты тыңдап үйрену',
    hubSubtitle: 'Жаттығу түрін таңдаңыз, ағылшынша уақытты тыңдап, дұрыс нұсқаны басыңыз',
    backBtn: 'Артқа',
    modeAmTitle: 'Түске дейін (AM)',
    modeAmDesc: 'Таңертеңгі сағаттар · 01:00–11:00 AM',
    modePmTitle: 'Түстен кейін (PM)',
    modePmDesc: 'Күндіз және кеш · 1:00–11:00 PM',
    modeHalvesTitle: 'Жарты сағаттар',
    modeHalvesDesc: 'Half past · :30 минут',
    modeQuartersTitle: 'Ширектер',
    modeQuartersDesc: 'Quarter past / to · :15 және :45',
    modeTenTitle: '10 минут сайын',
    modeTenDesc: 'Ондық минуттар · :10, :20, :40, :50',
    modeFiveTitle: '5 минут сайын',
    modeFiveDesc: 'Барлық 5 минуттық аралықтар',
    listenPrompt: 'Қандай уақыт айтылды?',
    replayHint: 'Қайта тыңдау үшін динамикті басыңыз',
    doneTitle: 'Жаттығу аяқталды!',
    scoreLabel: 'Дұрыс жауаптар',
    playAgainBtn: 'Тағы қайталау',
    changeModeBtn: 'Басқа режимдер',
  },
};

export function getTimeTrainerStrings(lang) {
  const raw = (lang || (typeof getInterfaceLanguage === 'function' ? getInterfaceLanguage() : 'ru') || 'ru')
    .toLowerCase()
    .trim()
    .replace('_', '-');
  return TIME_TRAINER_TRANSLATIONS[raw] || TIME_TRAINER_TRANSLATIONS[raw.split('-')[0]] || TIME_TRAINER_TRANSLATIONS.en;
}

export const TIME_TRAINER_MODES = [
  {
    id: 'am_hours',
    icon: '🌅',
    sample: '09:00 AM',
    accentColor: '#38bdf8',
    titleKey: 'modeAmTitle',
    descKey: 'modeAmDesc',
  },
  {
    id: 'pm_hours',
    icon: '🌇',
    sample: '4:00 PM',
    accentColor: '#f59e0b',
    titleKey: 'modePmTitle',
    descKey: 'modePmDesc',
  },
  {
    id: 'halves',
    icon: '🌗',
    sample: '4:30',
    accentColor: '#10b981',
    titleKey: 'modeHalvesTitle',
    descKey: 'modeHalvesDesc',
  },
  {
    id: 'quarters',
    icon: '◔',
    sample: '6:45',
    accentColor: '#a855f7',
    titleKey: 'modeQuartersTitle',
    descKey: 'modeQuartersDesc',
  },
  {
    id: 'ten_mins',
    icon: '🔟',
    sample: '8:20',
    accentColor: '#ec4899',
    titleKey: 'modeTenTitle',
    descKey: 'modeTenDesc',
  },
  {
    id: 'five_mins',
    icon: '⏱️',
    sample: '7:35',
    accentColor: '#14b8a6',
    titleKey: 'modeFiveTitle',
    descKey: 'modeFiveDesc',
  },
];

const HOUR_WORDS = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
};

function shuffleArr(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function nextHour12(h) {
  return h === 12 ? 1 : h + 1;
}

function prevHour12(h) {
  return h === 1 ? 12 : h - 1;
}

function formatClock(h, m, suffix = '') {
  const base = suffix === 'AM' ? `${pad2(h)}:${pad2(m)}` : `${h}:${pad2(m)}`;
  return suffix ? `${base} ${suffix}` : base;
}

function buildSpokenTimePhrase(modeId, h, m) {
  const hw = HOUR_WORDS[h];
  const nhw = HOUR_WORDS[nextHour12(h)];

  if (modeId === 'am_hours') {
    if (h >= 1 && h <= 5) {
      return `It's ${hw} AM`;
    }
    return Math.random() < 0.5
      ? `It's ${hw} o'clock in the morning`
      : `It's ${hw} AM`;
  }

  if (modeId === 'pm_hours') {
    if (h >= 1 && h <= 5) {
      return Math.random() < 0.6
        ? `It's ${hw} o'clock in the afternoon`
        : `It's ${hw} PM`;
    }
    if (h >= 6 && h <= 9) {
      return Math.random() < 0.6
        ? `It's ${hw} o'clock in the evening`
        : `It's ${hw} PM`;
    }
    return Math.random() < 0.5
      ? `It's ${hw} o'clock at night`
      : `It's ${hw} PM`;
  }

  if (m === 30) return `It's half past ${hw}`;
  if (m === 15) return `It's a quarter past ${hw}`;
  if (m === 45) return `It's a quarter to ${nhw}`;
  if (m === 5) return `It's five past ${hw}`;
  if (m === 10) return `It's ten past ${hw}`;
  if (m === 20) return `It's twenty past ${hw}`;
  if (m === 25) return `It's twenty-five past ${hw}`;
  if (m === 35) return `It's twenty-five to ${nhw}`;
  if (m === 40) return `It's twenty to ${nhw}`;
  if (m === 50) return `It's ten to ${nhw}`;
  if (m === 55) return `It's five to ${nhw}`;
  return `It's ${hw} o'clock`;
}

function getPoolForMode(modeId) {
  if (modeId === 'am_hours') {
    return Array.from({ length: 11 }, (_, i) => ({ h: i + 1, m: 0, suffix: 'AM' }));
  }
  if (modeId === 'pm_hours') {
    return Array.from({ length: 11 }, (_, i) => ({ h: i + 1, m: 0, suffix: 'PM' }));
  }
  if (modeId === 'halves') {
    return Array.from({ length: 12 }, (_, i) => ({ h: i + 1, m: 30, suffix: '' }));
  }
  if (modeId === 'quarters') {
    const res = [];
    for (let h = 1; h <= 12; h++) {
      res.push({ h, m: 15, suffix: '' });
      res.push({ h, m: 45, suffix: '' });
    }
    return res;
  }
  if (modeId === 'ten_mins') {
    const mins = [10, 20, 40, 50];
    const res = [];
    for (let h = 1; h <= 12; h++) {
      for (const m of mins) {
        res.push({ h, m, suffix: '' });
      }
    }
    return res;
  }
  // five_mins: prioritize non-quarter/half steps slightly while still covering all 5-min marks
  const mins5 = [5, 25, 35, 55, 5, 25, 35, 55, 10, 15, 20, 30, 40, 45, 50];
  const res = [];
  for (let h = 1; h <= 12; h++) {
    for (const m of mins5) {
      res.push({ h, m, suffix: '' });
    }
  }
  return res;
}

export function generateTimeQuestion(modeId = 'halves', excludedDisplayTimes = new Set()) {
  const pool = getPoolForMode(modeId);
  const candidates = pool.filter((item) => !excludedDisplayTimes.has(formatClock(item.h, item.m, item.suffix)));
  const activePool = candidates.length > 0 ? candidates : pool;
  const chosen = activePool[Math.floor(Math.random() * activePool.length)];
  const displayTime = formatClock(chosen.h, chosen.m, chosen.suffix);
  const spokenText = buildSpokenTimePhrase(modeId, chosen.h, chosen.m);

  const distractorSet = new Set([displayTime]);
  const nh = nextHour12(chosen.h);
  const ph = prevHour12(chosen.h);

  // Add pedagogically tricky nearby candidates first so learners cannot guess trivially
  const smartNear = [];
  if (modeId === 'quarters') {
    smartNear.push(
      formatClock(chosen.h, chosen.m === 45 ? 15 : 45, ''),
      formatClock(nh, 15, ''),
      formatClock(nh, 45, ''),
      formatClock(ph, 45, ''),
    );
  } else if (modeId === 'halves') {
    smartNear.push(
      formatClock(nh, 30, ''),
      formatClock(ph, 30, ''),
    );
  } else if (modeId === 'ten_mins') {
    smartNear.push(
      formatClock(chosen.h, 60 - chosen.m, ''),
      formatClock(nh, chosen.m, ''),
      formatClock(nh, 60 - chosen.m, ''),
    );
  } else if (modeId === 'five_mins') {
    smartNear.push(
      formatClock(chosen.h, 60 - chosen.m, ''),
      formatClock(nh, chosen.m, ''),
      formatClock(nh, 60 - chosen.m, ''),
    );
  }

  for (const near of shuffleArr(smartNear)) {
    if (distractorSet.size >= 4) break;
    distractorSet.add(near);
  }

  for (const item of shuffleArr(pool)) {
    if (distractorSet.size >= 4) break;
    distractorSet.add(formatClock(item.h, item.m, item.suffix));
  }

  const choices = shuffleArr(Array.from(distractorSet).slice(0, 4));

  return {
    id: `${modeId}_${chosen.h}_${chosen.m}`,
    modeId,
    displayTime,
    periodBadge: chosen.suffix || '',
    spokenText,
    choices,
  };
}

function buildRoundQuestions(modeId, count = 10) {
  const used = new Set();
  const list = [];
  for (let i = 0; i < count; i++) {
    const q = generateTimeQuestion(modeId, used);
    used.add(q.displayTime);
    list.push(q);
  }
  return list;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderTimeTrainerView(containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { onBack = () => {} } = options;
  const lang = getInterfaceLanguage();
  const strings = getTimeTrainerStrings(lang);

  let selectedModeId = null;
  let roundQuestions = [];
  let qIndex = 0;
  let correctCount = 0;
  let isAnswered = false;
  let autoNextTimer = null;
  let activeSessionToken = 0;

  function clearTimersAndAudio() {
    activeSessionToken += 1;
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
    try {
      stopAllAudio();
    } catch (_) {}
  }

  function speakCurrentQuestion(spokenText, speakerBtn) {
    const token = activeSessionToken;
    const accent = typeof getSavedVoiceAccent === 'function' ? getSavedVoiceAccent() : 'us';
    const langTag = accent === 'uk' ? 'en-GB' : 'en-US';
    if (speakerBtn) speakerBtn.classList.add('is-speaking');
    try {
      speakTextInLangAsync(spokenText, langTag)
        .catch(() => {})
        .finally(() => {
          if (token === activeSessionToken && speakerBtn && speakerBtn.isConnected) {
            speakerBtn.classList.remove('is-speaking');
          }
        });
    } catch (_) {
      if (speakerBtn) speakerBtn.classList.remove('is-speaking');
    }
  }

  function getStylesHtml() {
    return `
      <style>
        .tt-page {
          padding: 4px 16px 24px;
          max-width: 640px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .tt-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }
        .tt-back-btn {
          background: var(--card-bg, rgba(30, 41, 59, 0.85));
          border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.25));
          color: var(--text-main, #f8fafc);
          border-radius: 12px;
          padding: 7px 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .tt-back-btn:active { transform: scale(0.97); }
        .tt-progress-pill {
          font-size: 13px;
          font-weight: 800;
          color: var(--primary-color, #2563eb);
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 6px 12px;
          border-radius: 999px;
          font-variant-numeric: tabular-nums;
        }
        body.dark-theme .tt-progress-pill,
        .dark-theme .tt-progress-pill,
        [data-theme="dark"] .tt-progress-pill {
          color: #38bdf8;
        }
        .tt-hero {
          margin-bottom: 16px;
        }
        .tt-hero-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 6px;
        }
        .tt-hero-sub {
          font-size: 13.5px;
          line-height: 1.45;
          color: var(--text-muted);
          margin: 0;
        }
        .tt-modes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .tt-mode-card {
          position: relative;
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
          border: 1.5px solid #cbd5e1;
          border-top: 4px solid var(--tt-accent, #38bdf8);
          border-radius: 18px;
          padding: 14px 12px 13px;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          color: inherit;
          box-sizing: border-box;
        }
        .tt-mode-card:active {
          transform: scale(0.97);
        }
        .dark-theme .tt-mode-card,
        [data-theme='dark'] .tt-mode-card {
          background: linear-gradient(180deg, #1e293b 0%, #162032 100%);
          border-color: #334155;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.32);
        }
        .tt-mode-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .tt-mode-icon {
          font-size: 24px;
          line-height: 1;
        }
        .tt-mode-sample {
          font-size: 12.5px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          color: var(--tt-accent, #38bdf8);
          background: rgba(56, 189, 248, 0.12);
          padding: 4px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .tt-mode-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 3px;
          line-height: 1.25;
        }
        .tt-mode-desc {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.3;
        }
        .tt-mode-best {
          font-size: 11.5px;
          font-weight: 700;
          color: #10b981;
        }
        .tt-quiz-card {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 20px 16px 18px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.1);
          text-align: center;
        }
        .dark-theme .tt-quiz-card,
        [data-theme='dark'] .tt-quiz-card {
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          border-color: #334155;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.45);
        }
        .tt-speaker-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 6px 0 18px;
        }
        .tt-speaker-btn {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(14, 165, 233, 0.35);
          transition: transform 0.15s ease, box-shadow 0.2s ease;
          position: relative;
        }
        .tt-speaker-btn:active {
          transform: scale(0.94);
        }
        .tt-speaker-btn.is-speaking {
          animation: ttSpeakerPulse 1.1s ease-in-out infinite;
        }
        @keyframes ttSpeakerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.55); transform: scale(1); }
          50% { box-shadow: 0 0 0 16px rgba(14, 165, 233, 0); transform: scale(1.04); }
        }
        .tt-listen-prompt {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-main);
          margin: 12px 0 4px;
        }
        .tt-replay-hint {
          font-size: 12.5px;
          color: var(--text-muted);
          margin: 0;
        }
        .tt-choices-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .tt-choice-btn {
          min-height: 76px;
          border-radius: 16px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: var(--text-main);
          font-size: 23px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          transition: transform 0.12s ease, border-color 0.15s ease, background 0.15s ease;
          box-sizing: border-box;
        }
        .tt-choice-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .dark-theme .tt-choice-btn,
        [data-theme='dark'] .tt-choice-btn {
          background: rgba(30, 41, 59, 0.85);
          border-color: #334155;
          color: #f8fafc;
        }
        .tt-choice-btn.is-correct {
          background: rgba(16, 185, 129, 0.2) !important;
          border-color: #10b981 !important;
          color: #10b981 !important;
        }
        .tt-choice-btn.is-wrong {
          background: rgba(239, 68, 68, 0.18) !important;
          border-color: #ef4444 !important;
          color: #ef4444 !important;
        }
        .tt-choice-period {
          font-size: 12px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(148, 163, 184, 0.18);
          color: var(--text-muted);
        }
        .tt-revealed-phrase {
          margin-top: 14px;
          min-height: 24px;
          font-size: 15px;
          font-weight: 700;
          color: #38bdf8;
        }
        .tt-summary-box {
          padding: 26px 18px;
          text-align: center;
        }
        .tt-summary-score {
          font-size: 40px;
          font-weight: 900;
          color: #10b981;
          margin: 10px 0 6px;
          font-variant-numeric: tabular-nums;
        }
        .tt-summary-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .tt-summary-actions button {
          flex: 1;
          padding: 13px 12px;
          border-radius: 14px;
          font-size: 14.5px;
          font-weight: 800;
          cursor: pointer;
          border: none;
        }
        .tt-btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
        }
        .tt-btn-secondary {
          background: rgba(148, 163, 184, 0.18);
          color: var(--text-main);
          border: 1.5px solid var(--border-color, #475569) !important;
        }
      </style>
    `;
  }

  function renderModeSelection() {
    clearTimersAndAudio();
    selectedModeId = null;

    if (window.trackScreen) {
      window.trackScreen('time_trainer_hub', 'TimeTrainerView');
    }

    const cardsHtml = TIME_TRAINER_MODES.map((m) => {
      let bestScore = null;
      try {
        const raw = localStorage.getItem(`myduo_time_best_${m.id}`);
        if (raw !== null && raw !== '') bestScore = Number(raw);
      } catch (_) {}

      return `
        <button type="button" class="tt-mode-card" data-time-mode="${m.id}" style="--tt-accent: ${m.accentColor};">
          <div class="tt-mode-top">
            <span class="tt-mode-icon">${m.icon}</span>
            <span class="tt-mode-sample">${escapeHtml(m.sample)}</span>
          </div>
          <div>
            <h3 class="tt-mode-title">${escapeHtml(strings[m.titleKey] || m.id)}</h3>
            <p class="tt-mode-desc">${escapeHtml(strings[m.descKey] || '')}</p>
          </div>
          ${bestScore !== null ? `<div class="tt-mode-best">★ ${bestScore} / 10</div>` : ''}
        </button>
      `;
    }).join('');

    container.innerHTML = `
      ${getStylesHtml()}
      <div class="tt-page">
        <div class="tt-topbar">
          <button type="button" class="tt-back-btn" id="fav-view-back-btn">‹ ${escapeHtml(strings.backBtn || 'Назад')}</button>
        </div>
        <div class="tt-hero">
          <h2 class="tt-hero-title">🕒 ${escapeHtml(strings.hubTitle)}</h2>
          <p class="tt-hero-sub">${escapeHtml(strings.hubSubtitle)}</p>
        </div>
        <div class="tt-modes-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
      clearTimersAndAudio();
      try { window._cancelSmartPathReturn?.(); } catch (_) {}
      onBack();
    });

    container.querySelectorAll('.tt-mode-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modeId = btn.getAttribute('data-time-mode');
        if (modeId) startModeRound(modeId);
      });
    });
  }

  function startModeRound(modeId) {
    selectedModeId = modeId;
    roundQuestions = buildRoundQuestions(modeId, 10);
    qIndex = 0;
    correctCount = 0;
    if (window.trackScreen) {
      window.trackScreen(`time_trainer_${modeId}`, 'TimeTrainerView');
    }
    if (window.trackEvent) {
      window.trackEvent('time_trainer_start', { mode: modeId });
    }
    renderQuestion();
  }

  function formatChoiceInner(choiceStr) {
    const parts = String(choiceStr || '').split(' ');
    if (parts.length === 2 && (parts[1] === 'AM' || parts[1] === 'PM')) {
      return `<span>${escapeHtml(parts[0])}</span><span class="tt-choice-period">${escapeHtml(parts[1])}</span>`;
    }
    return `<span>${escapeHtml(choiceStr)}</span>`;
  }

  function renderQuestion() {
    clearTimersAndAudio();
    isAnswered = false;
    const question = roundQuestions[qIndex];
    const modeMeta = TIME_TRAINER_MODES.find((m) => m.id === selectedModeId) || TIME_TRAINER_MODES[0];

    container.innerHTML = `
      ${getStylesHtml()}
      <div class="tt-page">
        <div class="tt-topbar">
          <button type="button" class="tt-back-btn" id="fav-view-back-btn">‹ ${escapeHtml(strings.backBtn || 'Назад')}</button>
          <div class="tt-progress-pill">${qIndex + 1} / ${roundQuestions.length}</div>
        </div>

        <div class="tt-quiz-card">
          <div style="font-size: 13px; font-weight: 700; color: ${modeMeta.accentColor}; margin-bottom: 10px;">
            ${modeMeta.icon} ${escapeHtml(strings[modeMeta.titleKey] || '')}
          </div>

          <div class="tt-speaker-wrap">
            <button type="button" class="tt-speaker-btn" id="time-replay-audio-btn" aria-label="Replay audio">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </button>
            <p class="tt-listen-prompt">${escapeHtml(strings.listenPrompt)}</p>
            <p class="tt-replay-hint">${escapeHtml(strings.replayHint)}</p>
          </div>

          <div class="tt-choices-grid">
            ${question.choices
              .map(
                (choice) => `
              <button type="button" class="tt-choice-btn" data-choice="${escapeHtml(choice)}">
                ${formatChoiceInner(choice)}
              </button>
            `,
              )
              .join('')}
          </div>

          <div class="tt-revealed-phrase" id="tt-revealed-phrase"></div>
        </div>
      </div>
    `;

    const backBtn = container.querySelector('#fav-view-back-btn');
    const speakerBtn = container.querySelector('#time-replay-audio-btn');
    const phraseEl = container.querySelector('#tt-revealed-phrase');
    const choiceBtns = container.querySelectorAll('.tt-choice-btn');

    backBtn?.addEventListener('click', () => {
      renderModeSelection();
    });

    speakerBtn?.addEventListener('click', () => {
      try { triggerHaptic('light'); } catch (_) {}
      speakCurrentQuestion(question.spokenText, speakerBtn);
    });

    choiceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isAnswered) return;
        isAnswered = true;
        const picked = btn.getAttribute('data-choice');
        const isCorrect = picked === question.displayTime;

        choiceBtns.forEach((b) => {
          b.disabled = true;
          const val = b.getAttribute('data-choice');
          if (val === question.displayTime) {
            b.classList.add('is-correct');
          } else if (b === btn && !isCorrect) {
            b.classList.add('is-wrong');
          }
        });

        if (isCorrect) {
          correctCount += 1;
          try { playSuccessSound(); } catch (_) {}
        } else {
          try { playErrorSound(); } catch (_) {}
        }

        if (phraseEl) {
          phraseEl.textContent = `«${question.spokenText}»`;
        }

        const token = activeSessionToken;
        autoNextTimer = setTimeout(() => {
          if (token !== activeSessionToken) return;
          qIndex += 1;
          if (qIndex < roundQuestions.length) {
            renderQuestion();
          } else {
            renderSummary();
          }
        }, 1450);
      });
    });

    speakCurrentQuestion(question.spokenText, speakerBtn);
  }

  function renderSummary() {
    clearTimersAndAudio();
    try { playFanfareSound(); } catch (_) {}

    try {
      const prevBest = Number(localStorage.getItem(`myduo_time_best_${selectedModeId}`) || 0);
      if (correctCount > prevBest) {
        localStorage.setItem(`myduo_time_best_${selectedModeId}`, String(correctCount));
      }
    } catch (_) {}

    if (window.trackEvent) {
      window.trackEvent('time_trainer_complete', {
        mode: selectedModeId,
        score: correctCount,
        total: roundQuestions.length,
      });
    }

    if (typeof window !== 'undefined' && window._returnToSmartPath && typeof window._completeSmartPathStep === 'function') {
      window._completeSmartPathStep({ delayMs: 1200 });
    }

    container.innerHTML = `
      ${getStylesHtml()}
      <div class="tt-page">
        <div class="tt-topbar">
          <button type="button" class="tt-back-btn" id="fav-view-back-btn">‹ ${escapeHtml(strings.backBtn || 'Назад')}</button>
        </div>

        <div class="tt-quiz-card tt-summary-box">
          <div style="font-size: 48px;">🕒</div>
          <h2 class="tt-hero-title" style="margin-top: 8px;">${escapeHtml(strings.doneTitle)}</h2>
          <p class="tt-hero-sub">${escapeHtml(strings.scoreLabel)}</p>
          <div class="tt-summary-score">${correctCount} / ${roundQuestions.length}</div>
          <div class="tt-summary-actions">
            <button type="button" class="tt-btn-secondary" id="tt-change-mode-btn">${escapeHtml(strings.changeModeBtn)}</button>
            <button type="button" class="tt-btn-primary" id="tt-replay-mode-btn">${escapeHtml(strings.playAgainBtn)}</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#fav-view-back-btn')?.addEventListener('click', () => {
      try { window._cancelSmartPathReturn?.(); } catch (_) {}
      renderModeSelection();
    });
    container.querySelector('#tt-change-mode-btn')?.addEventListener('click', () => {
      try { window._cancelSmartPathReturn?.(); } catch (_) {}
      renderModeSelection();
    });
    container.querySelector('#tt-replay-mode-btn')?.addEventListener('click', () => {
      try { window._cancelSmartPathReturn?.(); } catch (_) {}
      startModeRound(selectedModeId);
    });
  }

  renderModeSelection();
}
