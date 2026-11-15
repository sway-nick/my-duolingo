/**
 * Масштабируемая мультиязычная рассылка English Breakfast (Вариант 2)
 * Запускать из аккаунта: lipniagovnikola@gmail.com
 *
 * База из Firebase: 488 реальных игроков (после исключения тестовых ботов и sway1976@gmail.com).
 * Язык каждого игрока взят из его настроек в Firestore (поддерживаются все 36 локалей).
 *
 * КАК ЗАПУСТИТЬ:
 * 1. Вставьте этот код в script.google.com (вместо старого) и нажмите Ctrl+S.
 * 2. В верхнем меню выберите функцию "runDailyCampaign" и нажмите "Выполнить" (Run).
 *    -> Скрипт сразу отправит первую партию (до 95 писем с учётом остатка дневного лимита Gmail)
 *       и автоматически поставит ежедневный таймер на отправку остальных партий раз в сутки!
 * 3. Никаких таблиц создавать не нужно: прогресс надёжно сохраняется внутри проекта Apps Script,
 *    повторно одному и тому же человеку письмо НИКОГДА не уйдёт.
 */

var ADMIN_REPORT_EMAIL = "sway1976@gmail.com";
var PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.englishbreakfast.app";
var MAX_PER_RUN = 95; // Безопасный пакет в сутки для бесплатного Gmail

var TEMPLATES = {
  "ru": {
    "subject": "Обновление English Breakfast: разбираем сложные слова и запускаем конкурс",
    "greeting": "Привет!",
    "intro": "Делимся главными новостями <b>English Breakfast</b> за последнее время:",
    "item1": "<b>1. Сложные слова теперь учить проще:</b> мы добавили «Кубики» — режим сборки слова из букв, который мягко помогает запомнить слова, вызвавшие затруднения.",
    "item2": "<b>2. Две новые подборки:</b> для тех, кто работает в IT (187 терминов с короткими объяснениями), и для тех, кто хочет понимать живую речь (100 популярных идиом).",
    "item3": "<b>3. Конкурс видео:</b> ждём ваши 10-секундные ролики (включая AI-видео)! Победителей покажем прямо на Золотой карте.",
    "reminder": "Чтобы все новые функции работали стабильно, не забывайте обновлять приложение.",
    "cta": "Обновить приложение в Google Play",
    "signoff": "Команда English Breakfast ☕🐱"
  },
  "uk": {
    "subject": "Оновлення English Breakfast: розбираємо складні слова та запускаємо конкурс",
    "greeting": "Привіт!",
    "intro": "Ділимося головними новинами <b>English Breakfast</b> за останній час:",
    "item1": "<b>1. Складні слова тепер вчити простіше:</b> ми додали «Кубики» — режим складання слова з літер, який м’яко допомагає запам’ятати слова, що викликали труднощі.",
    "item2": "<b>2. Дві нові добірки:</b> для тих, хто працює в IT (187 термінів із короткими поясненнями), та для тих, хто хоче розуміти живу мову (100 популярних ідіом).",
    "item3": "<b>3. Конкурс відео:</b> чекаємо на ваші 10-секундні ролики (включно з AI-відео)! Переможців покажемо прямо на Золотій карті.",
    "reminder": "Щоб усі нові функції працювали стабільно, не забувайте оновлювати застосунок.",
    "cta": "Оновити застосунок у Google Play",
    "signoff": "Команда English Breakfast ☕🐱"
  },
  "en": {
    "subject": "English Breakfast Update: master tricky words & join our video challenge",
    "greeting": "Hi there!",
    "intro": "Here are the latest updates from <b>English Breakfast</b>:",
    "item1": "<b>1. Tricky words made easier:</b> we added \"Word Blocks\" — a letter-building mode that gently helps you memorize words you found challenging.",
    "item2": "<b>2. Two new collections:</b> 187 essential terms with clear explanations for IT professionals, plus 100 popular idioms for understanding real-life English.",
    "item3": "<b>3. Video Challenge:</b> send us your 10-second clips (including AI videos)! Winners will be featured right on the Gold Card.",
    "reminder": "To make sure all new features run smoothly, please keep your app updated.",
    "cta": "Update on Google Play",
    "signoff": "The English Breakfast Team ☕🐱"
  },
  "de": {
    "subject": "English Breakfast Update: Schwierige Wörter leichter lernen & Video-Wettbewerb",
    "greeting": "Hallo!",
    "intro": "Hier sind die wichtigsten Neuigkeiten von <b>English Breakfast</b>:",
    "item1": "<b>1. Schwierige Wörter einfacher meistern:</b> Wir haben „Wortblöcke“ hinzugefügt — einen Buchstaben-Modus, der dir sanft hilft, knifflige Wörter zu verinnerlichen.",
    "item2": "<b>2. Zwei neue Sammlungen:</b> 187 Begriffe mit kurzen Erklärungen für IT-Profis sowie 100 beliebte Redewendungen (Idioms) für echtes Alltagsenglisch.",
    "item3": "<b>3. Video-Challenge:</b> Wir freuen uns auf deine 10-Sekunden-Clips (auch KI-Videos)! Die Gewinner zeigen wir direkt auf der Gold-Karte.",
    "reminder": "Damit alle neuen Funktionen stabil laufen, vergiss bitte nicht, die App zu aktualisieren.",
    "cta": "App bei Google Play aktualisieren",
    "signoff": "Dein English Breakfast Team ☕🐱"
  },
  "es": {
    "subject": "Actualización de English Breakfast: domina palabras difíciles y participa en el reto de video",
    "greeting": "¡Hola!",
    "intro": "Te compartimos las últimas novedades de <b>English Breakfast</b>:",
    "item1": "<b>1. Las palabras difíciles ahora son más fáciles:</b> agregamos «Bloques de letras», un modo para armar palabras letra por letra que te ayuda a memorizar las que más te cuestan.",
    "item2": "<b>2. Dos nuevas colecciones:</b> 187 términos con explicaciones breves para quienes trabajan en TI y 100 modismos (idioms) populares para entender el inglés real.",
    "item3": "<b>3. Reto de video:</b> ¡esperamos tus videos de 10 segundos (incluidos videos con IA)! Mostraremos a los ganadores directamente en la Tarjeta Dorada.",
    "reminder": "Para que todas las funciones nuevas trabajen de forma estable, no olvides actualizar la aplicación.",
    "cta": "Actualizar en Google Play",
    "signoff": "El equipo de English Breakfast ☕🐱"
  },
  "fr": {
    "subject": "Mise à jour English Breakfast : mémorisez les mots difficiles et participez au concours vidéo",
    "greeting": "Bonjour !",
    "intro": "Voici les dernières nouveautés d’<b>English Breakfast</b> :",
    "item1": "<b>1. Les mots difficiles deviennent plus simples :</b> nous avons ajouté les « Blocs de lettres », un mode de construction mot à mot qui aide à retenir les mots complexes.",
    "item2": "<b>2. Deux nouvelles collections :</b> 187 termes expliqués pour les professionnels de l’IT et 100 expressions idiomatiques incontournables.",
    "item3": "<b>3. Concours vidéo :</b> envoyez-nous vos clips de 10 secondes (vidéos IA incluses) ! Les gagnants seront affichés directement sur la Carte d’Or.",
    "reminder": "Pour profiter pleinement de toutes les nouveautés, pensez à mettre à jour l’application.",
    "cta": "Mettre à jour sur Google Play",
    "signoff": "L’équipe English Breakfast ☕🐱"
  },
  "pl": {
    "subject": "Aktualizacja English Breakfast: łatwiejsza nauka trudnych słów i konkurs wideo",
    "greeting": "Cześć!",
    "intro": "Dzielimy się najważniejszymi nowościami w <b>English Breakfast</b>:",
    "item1": "<b>1. Trudne słowa wchodzą łatwiej:</b> dodaliśmy „Klocki” — tryb układania słów z liter, który pomaga spokojnie zapamiętać trudniejsze słówka.",
    "item2": "<b>2. Dwa nowe zestawy:</b> dla osób z branży IT (187 terminów z krótkimi wyjaśnieniami) oraz dla tych, którzy chcą rozumieć żywy język (100 popularnych idiomów).",
    "item3": "<b>3. Konkurs wideo:</b> czekamy na Wasze 10-sekundowe filmy (również stworzone z AI)! Zwycięzców pokażemy bezpośrednio na Złotej Karcie.",
    "reminder": "Aby wszystkie nowe funkcje działały stabilnie, pamiętaj o aktualizacji aplikacji.",
    "cta": "Zaktualizuj w Google Play",
    "signoff": "Zespół English Breakfast ☕🐱"
  },
  "tr": {
    "subject": "English Breakfast Güncellemesi: Zor kelimeleri kolayca öğrenin ve video yarışmasına katılın",
    "greeting": "Merhaba!",
    "intro": "<b>English Breakfast</b>’taki en son yenilikleri seninle paylaşıyoruz:",
    "item1": "<b>1. Zor kelimeleri öğrenmek artık daha kolay:</b> Zorlandığın kelimeleri harflerden oluşturarak akılda tutmanı sağlayan \"Kelime Blokları\" modunu ekledik.",
    "item2": "<b>2. İki yeni koleksiyon:</b> Bilişim (IT) alanında çalışanlar için kısa açıklamalı 187 terim ve günlük konuşmaları anlamak isteyenler için 100 popüler deyim (idioms).",
    "item3": "<b>3. Video yarışması:</b> 10 saniyelik videolarınızı (yapay zeka videoları dahil) bekliyoruz! Kazananları doğrudan Altın Kart’ta göstereceğiz.",
    "reminder": "Tüm yeni özelliklerin sorunsuz çalışması için uygulamayı güncellemeyi unutmayın.",
    "cta": "Google Play’de Güncelle",
    "signoff": "English Breakfast Ekibi ☕🐱"
  },
  "it": {
    "subject": "Aggiornamento English Breakfast: impara le parole difficili e partecipa al concorso video",
    "greeting": "Ciao!",
    "intro": "Ecco le ultime novità di <b>English Breakfast</b>:",
    "item1": "<b>1. Le parole difficili ora sono più semplici:</b> abbiamo aggiunto i \"Blocchi di lettere\", una modalità che ti aiuta a memorizzare con facilità i vocaboli più complessi.",
    "item2": "<b>2. Due nuove raccolte:</b> 187 termini con brevi spiegazioni per chi lavora nell’IT e 100 espressioni idiomatiche per capire l’inglese parlato.",
    "item3": "<b>3. Concorso video:</b> aspettiamo le vostre clip da 10 secondi (inclusi video creati con l’IA)! I vincitori saranno mostrati direttamente sulla Carta d’Oro.",
    "reminder": "Per assicurarti che tutte le nuove funzioni siano stabili, ricorda di aggiornare l’app.",
    "cta": "Aggiorna su Google Play",
    "signoff": "Il team di English Breakfast ☕🐱"
  },
  "ro": {
    "subject": "Actualizare English Breakfast: învață mai ușor cuvintele dificile și participă la concursul video",
    "greeting": "Salut!",
    "intro": "Îți împărtășim cele mai importante noutăți din <b>English Breakfast</b>:",
    "item1": "<b>1. Cuvintele dificile sunt acum mai ușor de învățat:</b> am adăugat „Cuburile” — un mod de compunere a cuvintelor din litere care te ajută să reții termenii mai grei.",
    "item2": "<b>2. Două colecții noi:</b> 187 de termeni cu explicații scurte pentru cei din IT și 100 de expresii idiomatice populare pentru engleza de zi cu zi.",
    "item3": "<b>3. Concurs video:</b> așteptăm clipurile voastre de 10 secunde (inclusiv video AI)! Câștigătorii vor apărea direct pe Cardul de Aur.",
    "reminder": "Pentru ca toate funcțiile noi să ruleze stabil, nu uita să actualizezi aplicația.",
    "cta": "Actualizează pe Google Play",
    "signoff": "Echipa English Breakfast ☕🐱"
  },
  "bg": {
    "subject": "Обновление на English Breakfast: научете трудните думи по-лесно и се включете във видео конкурса",
    "greeting": "Здравейте!",
    "intro": "Споделяме най-важните новости в <b>English Breakfast</b>:",
    "item1": "<b>1. Трудните думи вече се учат по-лесно:</b> добавихме „Кубчета“ — режим за сглобяване на дума от букви, който помага да запомните думите, които ви затрудняват.",
    "item2": "<b>2. Две нови колекции:</b> 187 термина с кратки обяснения за работещите в IT и 100 популярни идиома за разбиране на живата реч.",
    "item3": "<b>3. Видео конкурс:</b> очакваме вашите 10-секундни клипове (включително AI видео)! Победителите ще покажем директно на Златната карта.",
    "reminder": "За да работят стабилно всички нови функции, не забравяйте да обновите приложението.",
    "cta": "Обновете в Google Play",
    "signoff": "Екипът на English Breakfast ☕🐱"
  },
  "hu": {
    "subject": "English Breakfast frissítés: tanuld meg könnyebben a nehéz szavakat és nevezz a videóversenyre",
    "greeting": "Szia!",
    "intro": "Megosztjuk veled az <b>English Breakfast</b> legújabb fejlesztéseit:",
    "item1": "<b>1. A nehéz szavak tanulása mostantól egyszerűbb:</b> hozzáadtuk a „Kockák” módot, amellyel betűkből rakhatod össze a nehezebb szavakat.",
    "item2": "<b>2. Két új gyűjtemény:</b> 187 IT-kifejezés rövid magyarázattal, valamint 100 népszerű angol szólás (idioms) az élő beszéd megértéséhez.",
    "item3": "<b>3. Videóverseny:</b> várjuk a 10 másodperces videóidat (MI-videókat is)! A nyerteseket közvetlenül az Aranykártyán mutatjuk be.",
    "reminder": "Hogy minden új funkció stabilan működjön, ne felejtsd el frissíteni az alkalmazást.",
    "cta": "Frissítés a Google Playen",
    "signoff": "Az English Breakfast csapata ☕🐱"
  },
  "el": {
    "subject": "Ενημέρωση English Breakfast: μάθετε εύκολα τις δύσκολες λέξεις & πάρτε μέρος στον διαγωνισμό βίντεο",
    "greeting": "Γεια σας!",
    "intro": "Μοιραζόμαστε μαζί σας τα τελευταία νέα του <b>English Breakfast</b>:",
    "item1": "<b>1. Οι δύσκολες λέξεις γίνονται πιο εύκολες:</b> προσθέσαμε τα «Κύβοι γραμμάτων» — μια λειτουργία σύνθεσης λέξεων που βοηθά στην απομνημόνευση απαιτητικών λέξεων.",
    "item2": "<b>2. Δύο νέες συλλογές:</b> 187 όροι πληροφορικής (IT) με σύντομες επεξηγήσεις και 100 δημοφιλείς ιδιωματισμοί (idioms) της καθημερινής γλώσσας.",
    "item3": "<b>3. Διαγωνισμός βίντεο:</b> περιμένουμε τα βίντεό σας διάρκειας 10 δευτερολέπτων (και με AI)! Οι νικητές θα εμφανιστούν στη Χρυσή Κάρτα.",
    "reminder": "Για να λειτουργούν ομαλά όλες οι νέες δυνατότητες, μην ξεχάσετε να ενημερώσετε την εφαρμογή.",
    "cta": "Ενημέρωση στο Google Play",
    "signoff": "Η ομάδα του English Breakfast ☕🐱"
  },
  "da": {
    "subject": "English Breakfast-opdatering: lær svære ord lettere og deltag i videokonkurrencen",
    "greeting": "Hej!",
    "intro": "Her er de seneste nyheder fra <b>English Breakfast</b>:",
    "item1": "<b>1. Svære ord er blevet nemmere:</b> Vi har tilføjet \"Ordklodser\" — en tilstand, hvor du bygger ordet af bogstaver, så det sidder bedre fast.",
    "item2": "<b>2. To nye samlinger:</b> 187 IT-begreber med korte forklaringer samt 100 populære talemåder (idioms) til hverdagsengelsk.",
    "item3": "<b>3. Videokonkurrence:</b> Send os dit 10-sekunders klip (også AI-videoer)! Vinderne vises direkte på Guldkortet.",
    "reminder": "Husk at opdatere appen, så alle nye funktioner kører stabilt.",
    "cta": "Opdater i Google Play",
    "signoff": "English Breakfast-teamet ☕🐱"
  },
  "lv": {
    "subject": "English Breakfast atjauninājums: vieglāk apgūsti sarežģītus vārdus un piedalies video konkursā",
    "greeting": "Sveiki!",
    "intro": "Dalāmies ar jaunākajām <b>English Breakfast</b> ziņām:",
    "item1": "<b>1. Sarežģītus vārdus tagad iemācīties ir vieglāk:</b> pievienojām „Klučus” — vārdu salikšanas režīmu no burtiem, kas palīdz iegaumēt grūtākus vārdus.",
    "item2": "<b>2. Divas jaunas izlases:</b> 187 IT termini ar īsiem skaidrojumiem un 100 populāras idiomaticas izteiksmes dzīvai valodai.",
    "item3": "<b>3. Video konkurss:</b> gaidām jūsu 10 sekunžu video (tostarp AI video)! Uzvarētājus parādīsim tieši Zelta kartē.",
    "reminder": "Lai visas jaunās funkcijas darbotos stabili, neaizmirstiet atjaunināt lietotni.",
    "cta": "Atjaunināt Google Play",
    "signoff": "English Breakfast komanda ☕🐱"
  },
  "lt": {
    "subject": "„English Breakfast“ atnaujinimas: lengviau įsiminkite sunkius žodžius ir dalyvaukite vaizdo konkurse",
    "greeting": "Sveiki!",
    "intro": "Dalinamės svarbiausiomis pastarojo meto <b>English Breakfast</b> naujienomis:",
    "item1": "<b>1. Sunkius žodžius išmokti tapo lengviau:</b> pridėjome „Kaladėles“ — žodžių dėliojimo iš raidžių režimą, padedantį įsiminti sudėtingesnius žodžius.",
    "item2": "<b>2. Du nauji rinkiniai:</b> 187 IT terminai su trumpais paaiškinimais ir 100 populiarių idiomų gyvai kalbai suprasti.",
    "item3": "<b>3. Vaizdo konkursas:</b> laukiame jūsų 10 sekundžių klipų (įskaitant DI vaizdo įrašus)! Nugalėtojus parodysime tiesiai Auksinėje kortelėje.",
    "reminder": "Kad visos naujos funkcijos veiktų stabiliai, nepamirškite atnaujinti programėlės.",
    "cta": "Atnaujinti „Google Play“",
    "signoff": "„English Breakfast“ komanda ☕🐱"
  },
  "pt": {
    "subject": "Atualização do English Breakfast: domine palavras difíceis e participe do desafio de vídeo",
    "greeting": "Olá!",
    "intro": "Confira as principais novidades do <b>English Breakfast</b>:",
    "item1": "<b>1. Palavras difíceis ficaram mais fáceis:</b> adicionamos os \"Blocos de Letras\", um modo de montar palavras letra por letra que ajuda a fixar os termos mais complicados.",
    "item2": "<b>2. Duas novas coleções:</b> 187 termos com explicações curtas para quem trabalha com TI e 100 expressões idiomáticas (idioms) populares do inglês real.",
    "item3": "<b>3. Desafio de vídeo:</b> estamos esperando seus vídeos de 10 segundos (inclusive vídeos feitos com IA)! Os vencedores aparecerão direto no Cartão Dourado.",
    "reminder": "Para garantir que todos os novos recursos funcionem perfeitamente, não se esqueça de atualizar o aplicativo.",
    "cta": "Atualizar na Google Play",
    "signoff": "Equipe English Breakfast ☕🐱"
  },
  "sk": {
    "subject": "Aktualizácia English Breakfast: naučte sa ťažké slová ľahšie a zapojte sa do videosúťaže",
    "greeting": "Ahoj!",
    "intro": "Prinášame ti hlavné novinky v <b>English Breakfast</b>:",
    "item1": "<b>1. Ťažké slová sa teraz učia ľahšie:</b> pridali sme „Kocky“ — režim skladania slov z písmen, ktorý ti pomôže zapamätať si náročnejšie slovíčka.",
    "item2": "<b>2. Dva nové výbery:</b> 187 IT pojmov s krátkym vysvetlením a 100 obľúbených idiómov pre porozumenie živej reči.",
    "item3": "<b>3. Videosúťaž:</b> čakáme na vaše 10-sekundové videá (vrátane AI videí)! Víťazov ukážeme priamo na Zlatej karte.",
    "reminder": "Aby všetky nové funkcie fungovali spoľahlivo, nezabudnite si aplikáciu aktualizovať.",
    "cta": "Aktualizovať v Google Play",
    "signoff": "Tím English Breakfast ☕🐱"
  },
  "sl": {
    "subject": "Posodobitev English Breakfast: lažje učenje težkih besed in video natečaj",
    "greeting": "Živjo!",
    "intro": "Delimo glavne novosti v aplikaciji <b>English Breakfast</b>:",
    "item1": "<b>1. Težke besede se zdaj učijo lažje:</b> dodali smo »Kocke« — način sestavljanja besed iz črk, ki vam pomaga zapomniti zahtevnejše besede.",
    "item2": "<b>2. Dve novi zbirki:</b> 187 izrazov s kratkimi razlagami za delo v IT ter 100 priljubljenih idiomov za razumevanje živega jezika.",
    "item3": "<b>3. Video natečaj:</b> pričakujemo vaše 10-sekundne posnetke (tudi AI-videe)! Zmagovalce bomo pokazali kar na Zlati kartici.",
    "reminder": "Za stabilno delovanje vseh novih funkcij ne pozabite posodobiti aplikacije.",
    "cta": "Posodobi v Google Play",
    "signoff": "Ekipa English Breakfast ☕🐱"
  },
  "fi": {
    "subject": "English Breakfast -päivitys: opi vaikeat sanat helpommin ja osallistu videokisaan",
    "greeting": "Hei!",
    "intro": "Tässä ovat <b>English Breakfastin</b> tuoreimmat uutiset:",
    "item1": "<b>1. Vaikeiden sanojen oppiminen on nyt helpompaa:</b> lisäsimme ”Sanapalikat”-tilan, jossa sana kootaan kirjaimista muistin tueksi.",
    "item2": "<b>2. Kaksi uutta kokoelmaa:</b> 187 IT-termiä lyhyillä selityksillä sekä 100 suosittua idiomia arkikielen ymmärtämiseen.",
    "item3": "<b>3. Videokilpailu:</b> odotamme 10 sekunnin videoitanne (myös tekoälyvideot käyvät)! Voittajat esitellään suoraan Kultakortissa.",
    "reminder": "Muista päivittää sovellus, jotta kaikki uudet ominaisuudet toimivat vakaasti.",
    "cta": "Päivitä Google Playssa",
    "signoff": "English Breakfast -tiimi ☕🐱"
  },
  "hr": {
    "subject": "Ažuriranje za English Breakfast: lakše naučite teške riječi i sudjelujte u video natječaju",
    "greeting": "Pozdrav!",
    "intro": "Dijelimo najvažnije novosti iz aplikacije <b>English Breakfast</b>:",
    "item1": "<b>1. Teške riječi sada se uče lakše:</b> dodali smo „Kockice” — način slaganja riječi od slova koji pomaže zapamtiti zahtjevnije riječi.",
    "item2": "<b>2. Dvije nove kolekcije:</b> 187 IT pojmova s kratkim objašnjenjima i 100 popularnih idioma za razumijevanje svakodnevnog govora.",
    "item3": "<b>3. Video natječaj:</b> čekamo vaše 10-sekundne videozapise (uključujući AI video)! Pobjednike ćemo prikazati izravno na Zlatnoj kartici.",
    "reminder": "Kako bi sve nove značajke radile stabilno, ne zaboravite ažurirati aplikaciju.",
    "cta": "Ažuriraj na Google Playu",
    "signoff": "Tim English Breakfast ☕🐱"
  },
  "cs": {
    "subject": "Aktualizace English Breakfast: naučte se těžká slovíčka snáz a zapojte se do videosoutěže",
    "greeting": "Ahoj!",
    "intro": "Přinášíme hlavní novinky z <b>English Breakfast</b> za poslední dobu:",
    "item1": "<b>1. Těžká slovíčka se teď učí snáz:</b> přidali jsme „Kostky“ — režim skládání slov z písmen, který ti pomůže zapamatovat si náročnější výrazy.",
    "item2": "<b>2. Dva nové výběry:</b> 187 IT pojmů s krátkým vysvětlením a 100 oblíbených idiomů pro porozumění živé angličtině.",
    "item3": "<b>3. Videosoutěž:</b> těšíme se na vaše 10sekundová videa (včetně AI videí)! Vítěze ukážeme přímo na Zlaté kartě.",
    "reminder": "Aby všechny nové funkce běžely spolehlivě, nezapomeňte si aplikaci aktualizovat.",
    "cta": "Aktualizovat na Google Play",
    "signoff": "Tým English Breakfast ☕🐱"
  },
  "sv": {
    "subject": "English Breakfast-uppdatering: lär dig svåra ord enklare och delta i videotävlingen",
    "greeting": "Hej!",
    "intro": "Här är de senaste nyheterna från <b>English Breakfast</b>:",
    "item1": "<b>1. Svåra ord har blivit enklare:</b> vi har lagt till ”Ordklossar” — ett läge där du bygger ord av bokstäver för att lättare minnas kluriga ord.",
    "item2": "<b>2. Två nya samlingar:</b> 187 IT-termer med korta förklaringar samt 100 populära idiom för att förstå vardagsengelska.",
    "item3": "<b>3. Videotävling:</b> skicka in dina 10-sekundersklipp (även AI-videor)! Vinnarna visas direkt på Guldkortet.",
    "reminder": "Kom ihåg att uppdatera appen så att alla nya funktioner fungerar stabilt.",
    "cta": "Uppdatera på Google Play",
    "signoff": "English Breakfast-teamet ☕🐱"
  },
  "et": {
    "subject": "English Breakfasti uuendus: õpi raskeid sõnu lihtsamalt ja osale videovõistlusel",
    "greeting": "Tere!",
    "intro": "Jagame <b>English Breakfasti</b> viimase aja olulisemaid uudiseid:",
    "item1": "<b>1. Raskeid sõnu on nüüd lihtsam õppida:</b> lisasime „Klotsid” — tähtedest sõnade kokkupanemise režiimi, mis aitab keerulisemaid sõnu paremini meelde jätta.",
    "item2": "<b>2. Kaks uut kogumikku:</b> 187 lühikese selgitusega IT-terminit ning 100 populaarset idioomi elava kõne mõistmiseks.",
    "item3": "<b>3. Videovõistlus:</b> ootame teie 10-sekundilisi klippe (sh AI-videoid)! Võitjaid näitame otse Kuldkaardil.",
    "reminder": "Et kõik uued funktsioonid töötaksid stabiilselt, ära unusta rakendust uuendada.",
    "cta": "Uuenda Google Plays",
    "signoff": "English Breakfasti tiim ☕🐱"
  },
  "hi": {
    "subject": "English Breakfast अपडेट: कठिन शब्दों को आसानी से सीखें और वीडियो चैलेंज में भाग लें",
    "greeting": "नमस्ते!",
    "intro": "<b>English Breakfast</b> के ताज़ा अपडेट्स आपके लिए:",
    "item1": "<b>1. कठिन शब्द सीखना अब और आसान:</b> हमने \"वर्ड ब्लॉक्स\" (Word Blocks) जोड़ा है — अक्षरों को जोड़कर शब्द बनाने वाला मोड, जो मुश्किल शब्दों को याद रखने में मदद करता है।",
    "item2": "<b>2. दो नए संग्रह:</b> IT क्षेत्र से जुड़े लोगों के लिए 187 ज़रूरी शब्द (आसान व्याख्या के साथ) और बोलचाल की अंग्रेज़ी समझने के लिए 100 लोकप्रिय मुहावरे (Idioms)।",
    "item3": "<b>3. वीडियो चैलेंज:</b> अपने 10-सेकंड के वीडियो (AI वीडियो सहित) हमें भेजें! विजेताओं को सीधे गोल्ड कार्ड पर दिखाया जाएगा।",
    "reminder": "सभी नए फ़ीचर्स सुचारू रूप से काम करें, इसके लिए कृपया ऐप को अपडेट करना न भूलें।",
    "cta": "Google Play पर ऐप अपडेट करें",
    "signoff": "English Breakfast टीम ☕🐱"
  },
  "bn": {
    "subject": "English Breakfast আপডেট: কঠিন শব্দ সহজে শিখুন এবং ভিডিও প্রতিযোগিতায় অংশ নিন",
    "greeting": "হ্যালো!",
    "intro": "<b>English Breakfast</b>-এর সাম্প্রতিক প্রধান খবরগুলো আপনাদের সাথে শেয়ার করছি:",
    "item1": "<b>1. কঠিন শব্দ শেখা এখন আরও সহজ:</b> আমরা \"ওয়ার্ড ব্লকস\" যোগ করেছি — অক্ষর সাজিয়ে শব্দ তৈরির এই মোডটি কঠিন শব্দ মনে রাখতে দারুণ সাহায্য করে।",
    "item2": "<b>2. দুটি নতুন কালেকশন:</b> যারা IT-তে কাজ করেন তাদের জন্য সংক্ষিপ্ত ব্যাখ্যাসহ ১৮৭টি টার্ম এবং দৈনন্দিন ইংরেজি বোঝার জন্য ১০০টি জনপ্রিয় বাগধারা (Idioms)।",
    "item3": "<b>3. ভিডিও প্রতিযোগিতা:</b> আপনার ১০ সেকেন্ডের ভিডিও क्लिपের (AI ভিডিওসহ) অপেক্ষায় আছি! বিজয়ীদের সরাসরি গোল্ড কার্ডে দেখানো হবে।",
    "reminder": "সব নতুন ফিচার যেন সঠিকভাবে কাজ করে, তাই অ্যাপটি আপডেট করতে ভুলবেন না।",
    "cta": "Google Play থেকে আপডেট করুন",
    "signoff": "English Breakfast টিম ☕🐱"
  },
  "ar": {
    "rtl": true,
    "subject": "تحديث English Breakfast: تعلّم الكلمات الصعبة بسهولة وشارك في مسابقة الفيديو",
    "greeting": "مرحباً!",
    "intro": "نشارككم أهم مستجدات <b>English Breakfast</b> الأخيرة:",
    "item1": "<b>1. تعلّم الكلمات الصعبة أصبح أسهل:</b> أضفنا وضع «مكعبات الحروف» لتكوين الكلمات حرفاً بحرف، مما يساعدك بلطف على ترسيخ الكلمات التي واجهت صعوبة فيها.",
    "item2": "<b>2. مجموعتان جديدتان:</b> للعاملين في مجال تقنية المعلومات IT (187 مصطلحاً مع شرح مبسط)، ولمن يرغب في فهم الإنجليزية اليومية الحية (100 تعبير اصطلاحي شائع).",
    "item3": "<b>3. مسابقة الفيديو:</b> ننتظر مقاطعكم القصيرة ذات الـ 10 ثوانٍ (بما في ذلك فيديوهات الذكاء الاصطناعي AI)! سنعرض الفائزين مباشرة على البطاقة الذهبية.",
    "reminder": "لضمان عمل جميع الميزات الجديدة باستقرار، لا تنسَ تحديث التطبيق.",
    "cta": "تحديث التطبيق على Google Play",
    "signoff": "فريق English Breakfast ☕🐱"
  },
  "fa": {
    "rtl": true,
    "subject": "به‌روزرسانی English Breakfast: یادگیری آسان‌تر واژه‌های دشوار و مسابقه ویدیویی",
    "greeting": "سلام!",
    "intro": "مهم‌ترین خبرهای جدید <b>English Breakfast</b> را با شما به اشتراک می‌گذاریم:",
    "item1": "<b>۱. یادگیری واژه‌های دشوار آسان‌تر شد:</b> حالت «مکعب‌های حروف» را اضافه کردیم؛ روشی برای ساختن کلمه با حروف که کمک می‌کند لغات سخت را راحت‌تر به خاطر بسپارید.",
    "item2": "<b>۲. دو مجموعه جدید:</b> برای فعالان حوزه IT (۱۸۷ اصطلاح تخصصی با توضیحات کوتاه) و برای کسانی که می‌خواهند انگلیسی روزمره را بهتر بفهمند (۱۰۰ اصطلاح پرکاربرد).",
    "item3": "<b>۳. مسابقه ویدیویی:</b> منتظر ویدیوهای ۱۰ ثانیه‌ای شما (از جمله ویدیوهای ساخته‌شده با هوش مصنوعی) هستیم! برندگان را مستقیماً روی کارت طلایی نمایش می‌دهیم.",
    "reminder": "برای اینکه همه قابلیت‌های جدید به‌خوبی کار کنند، لطفاً برنامه را به‌روزرسانی کنید.",
    "cta": "به‌روزرسانی در Google Play",
    "signoff": "تیم English Breakfast ☕🐱"
  },
  "ur": {
    "rtl": true,
    "subject": "English Breakfast اپ ڈیٹ: مشکل الفاظ آسانی سے سیکھیں اور ویڈیو مقابلے میں حصہ لیں",
    "greeting": "السلام علیکم!",
    "intro": "ہم آپ کے ساتھ <b>English Breakfast</b> کی تازہ ترین اپ ڈیٹس شیئر کر رہے ہیں:",
    "item1": "<b>1. مشکل الفاظ سیکھنا اب مزید آسان:</b> ہم نے \"ورڈ بلاکس\" شامل کیا ہے — حروف جوڑ کر لفظ بنانے کا یہ موڈ مشکل الفاظ کو ذہن نشین کرنے میں مدد دیتا ہے۔",
    "item2": "<b>2. دو نئے مجموعے:</b> IT میں کام کرنے والوں کے لیے مختصر وضاحت کے ساتھ 187 اصطلاحات، اور روزمرہ انگریزی سمجھنے کے لیے 100 مشہور محاورے (Idioms)۔",
    "item3": "<b>3. ویڈیو مقابلہ:</b> ہمیں آپ کی 10 سیکنڈ کی ویڈیوز (بشمول AI ویڈیوز) کا انتظار ہے! جیتنے والوں کو براہِ راست گولڈ کارڈ پر دکھایا جائے گا۔",
    "reminder": "تمام نئے فیچرز کے بہترین استعمال کے لیے ایپ کو اپ ڈیٹ کرنا نہ بھولیں۔",
    "cta": "Google Play پر اپ ڈیٹ کریں",
    "signoff": "English Breakfast ٹیم ☕🐱"
  },
  "id": {
    "subject": "Update English Breakfast: kuasai kata sulit lebih mudah & ikuti tantangan video",
    "greeting": "Halo!",
    "intro": "Berikut kabar terbaru dari <b>English Breakfast</b> untukmu:",
    "item1": "<b>1. Kata sulit kini lebih mudah dipelajari:</b> kami menambahkan \"Balok Kata\" — mode menyusun kata dari huruf yang membantumu mengingat kosakata yang menantang.",
    "item2": "<b>2. Dua koleksi baru:</b> untuk kamu yang bekerja di bidang IT (187 istilah dengan penjelasan singkat) dan untuk memahami percakapan sehari-hari (100 idiom populer).",
    "item3": "<b>3. Tantangan Video:</b> kami menunggu video 10 detik buatanmu (termasuk video AI)! Para pemenang akan ditampilkan langsung di Kartu Emas.",
    "reminder": "Agar semua fitur baru berjalan lancar, jangan lupa perbarui aplikasimu.",
    "cta": "Perbarui di Google Play",
    "signoff": "Tim English Breakfast ☕🐱"
  },
  "vi": {
    "subject": "Cập nhật English Breakfast: học từ khó dễ hơn & tham gia thử thách video",
    "greeting": "Xin chào!",
    "intro": "Chia sẻ cùng bạn những điểm mới nổi bật gần đây của <b>English Breakfast</b>:",
    "item1": "<b>1. Học từ khó nay dễ dàng hơn:</b> chúng tôi đã thêm chế độ \"Ghép chữ\" giúp bạn ghép từng chữ cái để nhớ lâu hơn những từ vựng khó.",
    "item2": "<b>2. Hai bộ từ vựng mới:</b> dành cho dân IT (187 thuật ngữ kèm giải thích ngắn gọn) và dành cho người muốn hiểu tiếng Anh giao tiếp tự nhiên (100 thành ngữ phổ biến).",
    "item3": "<b>3. Cuộc thi video:</b> chờ đón các clip 10 giây của bạn (bao gồm cả video AI)! Người chiến thắng sẽ được vinh danh ngay trên Thẻ Vàng.",
    "reminder": "Để mọi tính năng mới hoạt động ổn định, bạn đừng quên cập nhật ứng dụng nhé.",
    "cta": "Cập nhật trên Google Play",
    "signoff": "Đội ngũ English Breakfast ☕🐱"
  },
  "th": {
    "subject": "อัปเดต English Breakfast: จำศัพท์ยากได้ง่ายขึ้น & ร่วมสนุกกับกิจกรรมประกวดวิดีโอ",
    "greeting": "สวัสดี!",
    "intro": "เราขอแชร์อัปเดตสำคัญล่าสุดของ <b>English Breakfast</b>:",
    "item1": "<b>1. คำศัพท์ยากๆ จำง่ายขึ้นกว่าเดิม:</b> เราเพิ่มโหมด \"บล็อกตัวอักษร\" ให้คุณประกอบคำศัพท์จากตัวอักษร ช่วยให้จำคำที่เคยตอบผิดได้แม่นยำขึ้น",
    "item2": "<b>2. สองหมวดคำศัพท์ใหม่:</b> สำหรับสาย IT (187 คำศัพท์พร้อมคำอธิบายสั้นๆ) และสำหรับผู้ที่อยากเข้าใจภาษาพูดจริง (100 สำนวน Idioms ยอดฮิต)",
    "item3": "<b>3. กิจกรรมประกวดวิดีโอ:</b> ส่งคลิปสั้น 10 วินาทีของคุณเข้ามาได้เลย (รวมถึงวิดีโอจาก AI)! ผู้ชนะจะได้ขึ้นโชว์บนการ์ดทองคำโดยตรง",
    "reminder": "เพื่อให้ฟีเจอร์ใหม่ทั้งหมดทำงานได้อย่างราบรื่น อย่าลืมอัปเดตแอปของคุณนะ",
    "cta": "อัปเดตบน Google Play",
    "signoff": "ทีมงาน English Breakfast ☕🐱"
  },
  "ko": {
    "subject": "English Breakfast 업데이트: 어려운 단어를 더 쉽게 외우고 비디오 챌린지에 참여하세요",
    "greeting": "안녕하세요!",
    "intro": "<b>English Breakfast</b>의 최신 소식을 전해드립니다:",
    "item1": "<b>1. 어려운 단어 암기가 더 쉬워졌어요:</b> 글자를 조합해 단어를 완성하며 헷갈리는 단어를 자연스럽게 익히는 ‘워드 블록’ 모드를 추가했습니다.",
    "item2": "<b>2. 두 가지 신규 단어장:</b> IT 종사자를 위한 필수 용어 187개(간단한 설명 포함)와 생생한 원어민 표현을 익히는 인기 관용구(Idioms) 100개가 추가되었습니다.",
    "item3": "<b>3. 비디오 챌린지:</b> 여러분의 10초 영상을 기다립니다(AI 제작 영상 포함)! 우승작은 골드 카드에 직접 소개됩니다.",
    "reminder": "모든 새로운 기능을 안정적으로 이용하려면 앱을 최신 버전으로 업데이트해 주세요.",
    "cta": "Google Play에서 업데이트",
    "signoff": "English Breakfast 팀 ☕🐱"
  },
  "ja": {
    "subject": "English Breakfast アップデート：難しい単語も楽しく暗記＆動画コンテスト開催",
    "greeting": "こんにちは！",
    "intro": "<b>English Breakfast</b> の最新アップデートをお届けします：",
    "item1": "<b>1. 難しい単語が覚えやすくなりました：</b>文字を並べて単語を組み立てる「ワードブロック」モードを追加！苦手な単語も無理なく記憶に定着します。",
    "item2": "<b>2. 2つの新しい単語コレクション：</b>IT分野で働く方向けの187語（簡潔な解説付き）と、生きた英語表現が身につく定番イディオム100選。",
    "item3": "<b>3. 動画コンテスト：</b>10秒間のショート動画（AI生成動画もOK！）を募集中！優秀作品はゴールドカード上で直接紹介されます。",
    "reminder": "すべての新機能を快適にご利用いただくため、アプリのアップデートをお忘れなく。",
    "cta": "Google Play でアップデート",
    "signoff": "English Breakfast チーム ☕🐱"
  },
  "zh": {
    "subject": "English Breakfast 更新：轻松攻克难词 & 参与短视频挑战赛",
    "greeting": "你好！",
    "intro": "为你带来 <b>English Breakfast</b> 近期的重要更新：",
    "item1": "<b>1. 难词记忆更轻松：</b>我们新增了“字母积木”模式，通过拼搭字母组合单词，温和帮助你牢记容易出错的词汇。",
    "item2": "<b>2. 两大全新词库：</b>专为 IT 从业者准备的 187 个核心术语（附简明释义），以及助你听懂地道表达的 100 个常用习语（Idioms）。",
    "item3": "<b>3. 短视频挑战赛：</b>期待你的 10 秒创意短片（包括 AI 视频）！获胜作品将直接展示在黄金卡片上。",
    "reminder": "为了确保所有新功能稳定运行，别忘了更新应用哦。",
    "cta": "在 Google Play 更新应用",
    "signoff": "English Breakfast 团队 ☕🐱"
  },
  "kk": {
    "subject": "English Breakfast жаңартуы: қиын сөздерді оңай жаттаңыз және видео байқауға қатысыңыз",
    "greeting": "Сәлем!",
    "intro": "<b>English Breakfast</b> қосымшасының соңғы жаңалықтарымен бөлісеміз:",
    "item1": "<b>1. Қиын сөздерді жаттау оңайырақ болды:</b> біз әріптерден сөз құрастыруға арналған «Текшелер» режимін қостық — ол қиындық тудырған сөздерді есте сақтауға көмектеседі.",
    "item2": "<b>2. Екі жаңа топтама:</b> IT саласында жұмыс істейтіндерге арналған 187 термин (қысқаша түсіндірмесімен) және жанды сөйлеу тілін түсіنگісі келетіндерге арналған 100 танымал идиома.",
    "item3": "<b>3. Видео байқау:</b> сіздерден 10 секундтық роликтерді (соның ішінде AI-видеоларды) күтеміз! Жеңімпаздарды тікелей Алтын картада көрсетеміз.",
    "reminder": "Барлық жаңа функциялар тұрақты жұмыс істеуі үшін қосымшаны жаңартуды ұмытпаңыз.",
    "cta": "Google Play арқылы жаңарту",
    "signoff": "English Breakfast командасы ☕🐱"
  }
};

var RECIPIENTS = [
  {"idx":1,"e":"lipa2412@gmail.com","l":"ru","reg":"2026-09-23"},
  {"idx":2,"e":"mahotenko1953@gmail.com","l":"ru","reg":"2026-09-24"},
  {"idx":3,"e":"yrichs@gmail.com","l":"ru","reg":"2026-09-24"},
  {"idx":4,"e":"ayatullahs129@gmail.com","l":"en","reg":"2026-09-26"},
  {"idx":5,"e":"mohamad.a.yehia@gmail.com","l":"en","reg":"2026-09-26"},
  {"idx":6,"e":"micheleitask@gmail.com","l":"it","reg":"2026-09-29"},
  {"idx":7,"e":"russtalk1@gmail.com","l":"en","reg":"2026-09-30"},
  {"idx":8,"e":"gundoganeemre@gmail.com","l":"tr","reg":"2026-10-01"},
  {"idx":9,"e":"gpt2boracay.test1@gmail.com","l":"en","reg":"2026-10-11"},
  {"idx":10,"e":"iratonyavska02112016@gmail.com","l":"uk","reg":"2026-10-13"},
  {"idx":11,"e":"a61293512@gmail.com","l":"uk","reg":"2026-10-13"},
  {"idx":12,"e":"dila86801@gmail.com","l":"ru","reg":"2026-10-13"},
  {"idx":13,"e":"rradogra@gmail.com","l":"uk","reg":"2026-10-13"},
  {"idx":14,"e":"luhadiamayur703@gmail.com","l":"hi","reg":"2026-10-14"},
  {"idx":15,"e":"balasagun2011@gmail.com","l":"ru","reg":"2026-10-14"},
  {"idx":16,"e":"os80929@gmail.com","l":"uk","reg":"2026-10-14"},
  {"idx":17,"e":"jaroslavasokoljsvs@gmail.com","l":"ru","reg":"2026-10-15"},
  {"idx":18,"e":"wumochkalazza@gmail.com","l":"ru","reg":"2026-10-15"},
  {"idx":19,"e":"laurakushieva230714.7@gmail.com","l":"ru","reg":"2026-10-15"},
  {"idx":20,"e":"olegpetriga88@gmail.com","l":"uk","reg":"2026-10-15"},
  {"idx":21,"e":"latsadaniil13@gmail.com","l":"ru","reg":"2026-10-15"},
  {"idx":22,"e":"imtz67933@gmail.com","l":"en","reg":"2026-10-15"},
  {"idx":23,"e":"musyarywibisono321@gmail.com","l":"id","reg":"2026-10-15"},
  {"idx":24,"e":"olicea.valadares52@gmail.com","l":"pt","reg":"2026-10-15"},
  {"idx":25,"e":"alicesoler686@gmail.com","l":"pt","reg":"2026-10-15"},
  {"idx":26,"e":"vazeduardo240@gmail.com","l":"pt","reg":"2026-10-15"},
  {"idx":27,"e":"pao.lopez3062@gmail.com","l":"es","reg":"2026-10-15"},
  {"idx":28,"e":"luiscarlossouzasantos99@gmail.com","l":"pt","reg":"2026-10-16"},
  {"idx":29,"e":"cprata695@gmail.com","l":"pt","reg":"2026-10-16"},
  {"idx":30,"e":"almiratiaradewi@gmail.com","l":"id","reg":"2026-10-16"},
  {"idx":31,"e":"alexalexsitanggang6@gmail.com","l":"id","reg":"2026-10-16"},
  {"idx":32,"e":"azeinabdullah2701@gmail.com","l":"id","reg":"2026-10-16"},
  {"idx":33,"e":"valeonov789@gmail.com","l":"en","reg":"2026-10-16"},
  {"idx":34,"e":"nikita.2019laptev@gmail.com","l":"en","reg":"2026-10-16"},
  {"idx":35,"e":"savablks@gmail.com","l":"ru","reg":"2026-10-16"},
  {"idx":36,"e":"dasasirica428@gmail.com","l":"uk","reg":"2026-10-16"},
  {"idx":37,"e":"andrey.korlyakov@gmail.com","l":"ru","reg":"2026-10-16"},
  {"idx":38,"e":"sinroten@gmail.com","l":"vi","reg":"2026-10-17"},
  {"idx":39,"e":"tpulung01@gmail.com","l":"id","reg":"2026-10-17"},
  {"idx":40,"e":"giacmochapi1831989@gmail.com","l":"vi","reg":"2026-10-17"},
  {"idx":41,"e":"saabsodhi7868@gmail.com","l":"hi","reg":"2026-10-17"},
  {"idx":42,"e":"nitnhantran@gmail.com","l":"en","reg":"2026-10-17"},
  {"idx":43,"e":"anchalmamta392@gmail.com","l":"en","reg":"2026-10-17"},
  {"idx":44,"e":"muralid25487@gmail.com","l":"en","reg":"2026-10-17"},
  {"idx":45,"e":"avastar.ovcharenko@gmail.com","l":"ru","reg":"2026-10-17"},
  {"idx":46,"e":"toandd.htc3d@gmail.com","l":"vi","reg":"2026-10-17"},
  {"idx":47,"e":"bilyavka2006@gmail.com","l":"uk","reg":"2026-10-17"},
  {"idx":48,"e":"truongtrongsang010705@gmail.com","l":"vi","reg":"2026-10-17"},
  {"idx":49,"e":"ajkerim769@gmail.com","l":"ru","reg":"2026-10-17"},
  {"idx":50,"e":"baongoc060512dt@gmail.com","l":"vi","reg":"2026-10-17"},
  {"idx":51,"e":"alinagrebencenko853@gmail.com","l":"uk","reg":"2026-10-17"},
  {"idx":52,"e":"sab67686@gmail.com","l":"ru","reg":"2026-10-17"},
  {"idx":53,"e":"hatambekovay@gmail.com","l":"ru","reg":"2026-10-17"},
  {"idx":54,"e":"galynawakar@gmail.com","l":"uk","reg":"2026-10-17"},
  {"idx":55,"e":"violetamoris13@gmail.com","l":"uk","reg":"2026-10-17"},
  {"idx":56,"e":"sharptopoleg@gmail.com","l":"ru","reg":"2026-10-17"},
  {"idx":57,"e":"tsadov1704@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":58,"e":"anderson.290877@gmail.com","l":"pt","reg":"2026-10-18"},
  {"idx":59,"e":"deepasc.1985@gmail.com","l":"en","reg":"2026-10-18"},
  {"idx":60,"e":"camilajustoflores@gmail.com","l":"es","reg":"2026-10-18"},
  {"idx":61,"e":"minnie.yoomee@gmail.com","l":"id","reg":"2026-10-18"},
  {"idx":62,"e":"zigmund4791frejd@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":63,"e":"leonidmatevosov2016@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":64,"e":"lethisau220568@gmail.com","l":"vi","reg":"2026-10-18"},
  {"idx":65,"e":"annazhel505@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":66,"e":"akylbekana877@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":67,"e":"akarsha855@gmail.com","l":"en","reg":"2026-10-18"},
  {"idx":68,"e":"sevastana77@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":69,"e":"nurila83663@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":70,"e":"ducphat49@gmail.com","l":"vi","reg":"2026-10-18"},
  {"idx":71,"e":"maju69037@gmail.com","l":"pt","reg":"2026-10-18"},
  {"idx":72,"e":"gaureshdeshmukh711@gmail.com","l":"en","reg":"2026-10-18"},
  {"idx":73,"e":"aliioealves07@gmail.com","l":"pt","reg":"2026-10-18"},
  {"idx":74,"e":"barkov12057755@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":75,"e":"a13877491@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":76,"e":"kseniastennikova894@gmail.com","l":"ru","reg":"2026-10-18"},
  {"idx":77,"e":"yohanesoktovian22@gmail.com","l":"id","reg":"2026-10-19"},
  {"idx":78,"e":"kimchonga98@gmail.com","l":"id","reg":"2026-10-19"},
  {"idx":79,"e":"vania.vavc@gmail.com","l":"pt","reg":"2026-10-19"},
  {"idx":80,"e":"tolentino142002@gmail.com","l":"es","reg":"2026-10-19"},
  {"idx":81,"e":"maraamani555@gmail.com","l":"en","reg":"2026-10-19"},
  {"idx":82,"e":"arentdiana0@gmail.com","l":"uk","reg":"2026-10-19"},
  {"idx":83,"e":"nargesmehrabaninia@gmail.com","l":"en","reg":"2026-10-19"},
  {"idx":84,"e":"savashifa4u@gmail.com","l":"en","reg":"2026-10-19"},
  {"idx":85,"e":"tosik5209@gmail.com","l":"uk","reg":"2026-10-19"},
  {"idx":86,"e":"nengtrade27@gmail.com","l":"id","reg":"2026-10-19"},
  {"idx":87,"e":"pawarvedika26@gmail.com","l":"hi","reg":"2026-10-19"},
  {"idx":88,"e":"sofikaromanenko@gmail.com","l":"uk","reg":"2026-10-19"},
  {"idx":89,"e":"khanhnganhuynh3@gmail.com","l":"vi","reg":"2026-10-19"},
  {"idx":90,"e":"aknur3776@gmail.com","l":"ru","reg":"2026-10-19"},
  {"idx":91,"e":"ocamposneto@gmail.com","l":"pt","reg":"2026-10-19"},
  {"idx":92,"e":"bbagerzade3@gmail.com","l":"en","reg":"2026-10-19"},
  {"idx":93,"e":"songforkids67@gmail.com","l":"ru","reg":"2026-10-19"},
  {"idx":94,"e":"tatyana.erm1956@gmail.com","l":"ru","reg":"2026-10-19"},
  {"idx":95,"e":"marbergster@gmail.com","l":"pt","reg":"2026-10-20"},
  {"idx":96,"e":"scorredor389@gmail.com","l":"es","reg":"2026-10-20"},
  {"idx":97,"e":"denisesilvasantos031@gmail.com","l":"pt","reg":"2026-10-20"},
  {"idx":98,"e":"seraj.ahmadi2002@gmail.com","l":"ar","reg":"2026-10-20"},
  {"idx":99,"e":"ali.israil30@gmail.com","l":"en","reg":"2026-10-20"},
  {"idx":100,"e":"sulfinawow@gmail.com","l":"id","reg":"2026-10-20"},
  {"idx":101,"e":"tiarayolo270@gmail.com","l":"id","reg":"2026-10-20"},
  {"idx":102,"e":"duaaanaaz377@gmail.com","l":"en","reg":"2026-10-20"},
  {"idx":103,"e":"gatello.ao@gmail.com","l":"uk","reg":"2026-10-20"},
  {"idx":104,"e":"hafez651361@gmail.com","l":"en","reg":"2026-10-20"},
  {"idx":105,"e":"aleksaileyko@gmail.com","l":"uk","reg":"2026-10-20"},
  {"idx":106,"e":"pepux888@gmail.com","l":"ru","reg":"2026-10-20"},
  {"idx":107,"e":"singhkuriaarvind@gmail.com","l":"en","reg":"2026-10-20"},
  {"idx":108,"e":"aquascaper2022@gmail.com","l":"ru","reg":"2026-10-20"},
  {"idx":109,"e":"bmt633@gmail.com","l":"en","reg":"2026-10-20"},
  {"idx":110,"e":"sarala833@gmail.com","l":"en","reg":"2026-10-20"},
  {"idx":111,"e":"ksenia.office123@gmail.com","l":"ru","reg":"2026-10-20"},
  {"idx":112,"e":"frankvallmore@gmail.com","l":"es","reg":"2026-10-20"},
  {"idx":113,"e":"sthefanyevaristo2005@gmail.com","l":"pt","reg":"2026-10-20"},
  {"idx":114,"e":"babylookruiz2011@gmail.com","l":"es","reg":"2026-10-20"},
  {"idx":115,"e":"learningdianaleanguaje@gmail.com","l":"es","reg":"2026-10-20"},
  {"idx":116,"e":"sararojasdiaz123@gmail.com","l":"es","reg":"2026-10-20"},
  {"idx":117,"e":"robert.zact@gmail.com","l":"en","reg":"2026-10-20"},
  {"idx":118,"e":"adityaray119061@gmail.com","l":"en","reg":"2026-10-21"},
  {"idx":119,"e":"hojjatmakhlough@gmail.com","l":"ar","reg":"2026-10-21"},
  {"idx":120,"e":"yasmin93412@gmail.com","l":"en","reg":"2026-10-21"},
  {"idx":121,"e":"posmituhaigor24@gmail.com","l":"uk","reg":"2026-10-21"},
  {"idx":122,"e":"jordanfamily5787@gmail.com","l":"es","reg":"2026-10-21"},
  {"idx":123,"e":"sanakambarova@gmail.com","l":"ru","reg":"2026-10-21"},
  {"idx":124,"e":"stocanskaolena@gmail.com","l":"uk","reg":"2026-10-21"},
  {"idx":125,"e":"nikipeloval@mail.ru","l":"ru","reg":"2026-10-21"},
  {"idx":126,"e":"manojkumarkharwar23d@gmail.com","l":"en","reg":"2026-10-21"},
  {"idx":127,"e":"sara75shah@gmail.com","l":"hi","reg":"2026-10-21"},
  {"idx":128,"e":"geldiyewa@gmail.com","l":"ru","reg":"2026-10-21"},
  {"idx":129,"e":"geldiyewaneslihan@gmail.com","l":"tr","reg":"2026-10-21"},
  {"idx":130,"e":"santhisrinimmagadda@gmail.com","l":"en","reg":"2026-10-21"},
  {"idx":131,"e":"tademosalg16@gmail.com","l":"es","reg":"2026-10-21"},
  {"idx":132,"e":"franizuisa@gmail.com","l":"es","reg":"2026-10-21"},
  {"idx":133,"e":"deiwsonribeiro622@gmail.com","l":"pt","reg":"2026-10-22"},
  {"idx":134,"e":"nasir.manaf814@gmail.com","l":"ar","reg":"2026-10-22"},
  {"idx":135,"e":"dangcanhck@gmail.com","l":"vi","reg":"2026-10-22"},
  {"idx":136,"e":"naycthings@gmail.com","l":"id","reg":"2026-10-22"},
  {"idx":137,"e":"khalafi9630@gmail.com","l":"fa","reg":"2026-10-22"},
  {"idx":138,"e":"anamakogin8@gmail.com","l":"uk","reg":"2026-10-22"},
  {"idx":139,"e":"sahilkhan923462@gmail.com","l":"hi","reg":"2026-10-22"},
  {"idx":140,"e":"mahikarmawat469@gmail.com","l":"en","reg":"2026-10-22"},
  {"idx":141,"e":"stevesanthosh0502@gmail.com","l":"en","reg":"2026-10-22"},
  {"idx":142,"e":"monokaaksterman@gmail.com","l":"uk","reg":"2026-10-22"},
  {"idx":143,"e":"evakostinak02@gmail.com","l":"uk","reg":"2026-10-22"},
  {"idx":144,"e":"ri5445920@gmail.com","l":"en","reg":"2026-10-23"},
  {"idx":145,"e":"ayzharkyn21@gmail.com","l":"ru","reg":"2026-10-23"},
  {"idx":146,"e":"emmastore.oficial1@gmail.com","l":"es","reg":"2026-10-23"},
  {"idx":147,"e":"vvv17757@gmail.com","l":"uk","reg":"2026-10-23"},
  {"idx":148,"e":"aguiralves@gmail.com","l":"pt","reg":"2026-10-23"},
  {"idx":149,"e":"fikiriyoshua1@gmail.com","l":"en","reg":"2026-10-23"},
  {"idx":150,"e":"andressacarolinatomas@gmail.com","l":"fr","reg":"2026-10-24"},
  {"idx":151,"e":"vaibhavrathore2208@gmail.com","l":"en","reg":"2026-10-24"},
  {"idx":152,"e":"diegosalomao06@gmail.com","l":"pt","reg":"2026-10-24"},
  {"idx":153,"e":"elhamkhojasteh64@gmail.com","l":"en","reg":"2026-10-24"},
  {"idx":154,"e":"bhavanisaparay@gmail.com","l":"en","reg":"2026-10-24"},
  {"idx":155,"e":"dishagayakawad1631@gmail.com","l":"en","reg":"2026-10-24"},
  {"idx":156,"e":"kakheliboro5@gmail.com","l":"en","reg":"2026-10-24"},
  {"idx":157,"e":"danilosouzamatos89@gmail.com","l":"pt","reg":"2026-10-24"},
  {"idx":158,"e":"missyakmx20@gmail.com","l":"pt","reg":"2026-10-24"},
  {"idx":159,"e":"brunohvilla95@gmail.com","l":"pt","reg":"2026-10-24"},
  {"idx":160,"e":"izuukhyuga@gmail.com","l":"pt","reg":"2026-10-24"},
  {"idx":161,"e":"hjhbbnh@gmail.com","l":"pt","reg":"2026-10-24"},
  {"idx":162,"e":"poonamrathore36835@gmail.com","l":"hi","reg":"2026-10-24"},
  {"idx":163,"e":"bia.p.freitas2001@gmail.com","l":"pt","reg":"2026-10-25"},
  {"idx":164,"e":"shiva1996nn@gmail.com","l":"bg","reg":"2026-10-25"},
  {"idx":165,"e":"yimekiw905@gmail.com","l":"en","reg":"2026-10-25"},
  {"idx":166,"e":"pasymlaxmidevi@gmail.com","l":"en","reg":"2026-10-25"},
  {"idx":167,"e":"openthedooor396@gmail.com","l":"ru","reg":"2026-10-25"},
  {"idx":168,"e":"veravivchar@gmail.com","l":"uk","reg":"2026-10-25"},
  {"idx":169,"e":"olegivna655@gmail.com","l":"uk","reg":"2026-10-25"},
  {"idx":170,"e":"sanyogitakhedkar9@gmail.com","l":"hi","reg":"2026-10-25"},
  {"idx":171,"e":"jhessycafernandes6@gmail.com","l":"pt","reg":"2026-10-25"},
  {"idx":172,"e":"cs16killa@gmail.com","l":"ru","reg":"2026-10-25"},
  {"idx":173,"e":"hinakhatoon130@gmail.com","l":"en","reg":"2026-10-26"},
  {"idx":174,"e":"ratikantsuman2@gmail.com","l":"hi","reg":"2026-10-26"},
  {"idx":175,"e":"svetikk@email.cz","l":"en","reg":"2026-10-26"},
  {"idx":176,"e":"marvell5alexei@gmail.com","l":"es","reg":"2026-10-26"},
  {"idx":177,"e":"starjasmine102@gmail.com","l":"en","reg":"2026-10-26"},
  {"idx":178,"e":"i93691772@gmail.com","l":"uk","reg":"2026-10-26"},
  {"idx":179,"e":"irash2016@gmail.com","l":"uk","reg":"2026-10-26"},
  {"idx":180,"e":"kashishh874@gmail.com","l":"hi","reg":"2026-10-26"},
  {"idx":181,"e":"suryabiswal1432@gmail.com","l":"en","reg":"2026-10-26"},
  {"idx":182,"e":"la7269514@gmail.com","l":"pt","reg":"2026-10-26"},
  {"idx":183,"e":"dukinvlad4422@gmail.com","l":"uk","reg":"2026-10-26"},
  {"idx":184,"e":"nanusik843@gmail.com","l":"uk","reg":"2026-10-26"},
  {"idx":185,"e":"tanjgrynyshyn@gmail.com","l":"uk","reg":"2026-10-26"},
  {"idx":186,"e":"zigo2205@gmail.com","l":"uk","reg":"2026-10-26"},
  {"idx":187,"e":"asel71369@gmail.com","l":"ru","reg":"2026-10-27"},
  {"idx":188,"e":"kuswahalakhana24@gmail.com","l":"hi","reg":"2026-10-27"},
  {"idx":189,"e":"puspameena25671@gmail.com","l":"en","reg":"2026-10-27"},
  {"idx":190,"e":"eoero67@gmail.com","l":"uk","reg":"2026-10-27"},
  {"idx":191,"e":"aryadaneshvar@gmail.com","l":"fa","reg":"2026-10-27"},
  {"idx":192,"e":"matianacruz2014@gmail.com","l":"es","reg":"2026-10-27"},
  {"idx":193,"e":"vanildomessias@uol.com.br","l":"pt","reg":"2026-10-28"},
  {"idx":194,"e":"myrzahanaktolkyn9@gmail.com","l":"ru","reg":"2026-10-28"},
  {"idx":195,"e":"klimcukserhey6.com@gmail.com","l":"en","reg":"2026-10-28"},
  {"idx":196,"e":"andidepari7@gmail.com","l":"id","reg":"2026-10-28"},
  {"idx":197,"e":"pnuriyandini@gmail.com","l":"id","reg":"2026-10-28"},
  {"idx":198,"e":"fathima.rabail.111@gmail.com","l":"en","reg":"2026-10-28"},
  {"idx":199,"e":"h1975kutlu@gmail.com","l":"de","reg":"2026-10-28"},
  {"idx":200,"e":"ikara80834@gmail.com","l":"tr","reg":"2026-10-28"},
  {"idx":201,"e":"fahriyezgiyucel@gmail.com","l":"tr","reg":"2026-10-28"},
  {"idx":202,"e":"meyyowvly@gmail.com","l":"en","reg":"2026-10-28"},
  {"idx":203,"e":"atakeny370@gmail.com","l":"ru","reg":"2026-10-28"},
  {"idx":204,"e":"ivon65632@gmail.com","l":"uk","reg":"2026-10-28"},
  {"idx":205,"e":"ikrosasya156@gmail.com","l":"tr","reg":"2026-10-28"},
  {"idx":206,"e":"sophiagomez9991@gmail.com","l":"es","reg":"2026-10-28"},
  {"idx":207,"e":"sandygaitan98@gmail.com","l":"es","reg":"2026-10-29"},
  {"idx":208,"e":"kyiranaamalnd@gmail.com","l":"id","reg":"2026-10-29"},
  {"idx":209,"e":"sartini0519@gmail.com","l":"id","reg":"2026-10-29"},
  {"idx":210,"e":"tasyarusli258@gmail.com","l":"id","reg":"2026-10-29"},
  {"idx":211,"e":"venatrixasteria@gmail.com","l":"id","reg":"2026-10-29"},
  {"idx":212,"e":"lilonbishop@gmail.com","l":"es","reg":"2026-10-29"},
  {"idx":213,"e":"ramazanaslan1b9j0k33@gmail.com","l":"tr","reg":"2026-10-29"},
  {"idx":214,"e":"tiaaalimbong@gmail.com","l":"id","reg":"2026-10-29"},
  {"idx":215,"e":"zahiranajwa242@gmail.com","l":"id","reg":"2026-10-29"},
  {"idx":216,"e":"hjhbhbnjbnh@gmail.com","l":"pt","reg":"2026-10-29"},
  {"idx":217,"e":"seruanhati781@gmail.com","l":"id","reg":"2026-10-29"},
  {"idx":218,"e":"putudavina5@gmail.com","l":"en","reg":"2026-10-29"},
  {"idx":219,"e":"liuweichanshin@gmail.com","l":"en","reg":"2026-10-29"},
  {"idx":220,"e":"waktobi13adgj@gmail.com","l":"id","reg":"2026-10-29"},
  {"idx":221,"e":"kimkpopyonchae@gmail.com","l":"en","reg":"2026-10-29"},
  {"idx":222,"e":"lydsrw96@gmail.com","l":"en","reg":"2026-10-29"},
  {"idx":223,"e":"muhammadfaizdinartyo@gmail.com","l":"id","reg":"2026-10-29"},
  {"idx":224,"e":"m.eslami2010@gmail.com","l":"en","reg":"2026-10-29"},
  {"idx":225,"e":"huang10781078@gmail.com","l":"pt","reg":"2026-10-29"},
  {"idx":226,"e":"paquiniguez@gmail.com","l":"es","reg":"2026-10-29"},
  {"idx":227,"e":"pricilliasaputra12@gmail.com","l":"id","reg":"2026-10-30"},
  {"idx":228,"e":"kyoshitsubungasan@gmail.com","l":"id","reg":"2026-10-30"},
  {"idx":229,"e":"aaniarbek@gmail.com","l":"ru","reg":"2026-10-30"},
  {"idx":230,"e":"kurilkovictoria28@gmail.com","l":"uk","reg":"2026-10-30"},
  {"idx":231,"e":"hosseinishima204@gmail.com","l":"en","reg":"2026-10-30"},
  {"idx":232,"e":"naabafarin@gmail.com","l":"en","reg":"2026-10-31"},
  {"idx":233,"e":"ainurabaizigit@gmail.com","l":"ru","reg":"2026-10-31"},
  {"idx":234,"e":"thaikhangchau16@gmail.com","l":"vi","reg":"2026-10-31"},
  {"idx":235,"e":"surbaktijudan@gmail.com","l":"id","reg":"2026-10-31"},
  {"idx":236,"e":"krnkonko@gmail.com","l":"uk","reg":"2026-10-31"},
  {"idx":237,"e":"glenna.ac@gmail.com","l":"pt","reg":"2026-10-31"},
  {"idx":238,"e":"ffg161460@gmail.com","l":"en","reg":"2026-10-31"},
  {"idx":239,"e":"eserioissoyt@gmail.com","l":"pt","reg":"2026-11-01"},
  {"idx":240,"e":"carlosandres.ocampourbano2022@gmail.com","l":"es","reg":"2026-11-01"},
  {"idx":241,"e":"sedamami7@gmail.com","l":"tr","reg":"2026-11-01"},
  {"idx":242,"e":"3674150@gmail.com","l":"uk","reg":"2026-11-01"},
  {"idx":243,"e":"mohadenamrata385@gmail.com","l":"en","reg":"2026-11-01"},
  {"idx":244,"e":"rawatshubham3434@gmail.com","l":"en","reg":"2026-11-01"},
  {"idx":245,"e":"tranminhhanh135@gmail.com","l":"vi","reg":"2026-11-01"},
  {"idx":246,"e":"taibofg@yahoo.com.ar","l":"es","reg":"2026-11-01"},
  {"idx":247,"e":"hariri.crypto2020@gmail.com","l":"en","reg":"2026-11-02"},
  {"idx":248,"e":"wildpostman88@gmail.com","l":"uk","reg":"2026-11-02"},
  {"idx":249,"e":"ggap19799@gmail.com","l":"ru","reg":"2026-11-02"},
  {"idx":250,"e":"zxl1363205360@gmail.com","l":"zh","reg":"2026-11-02"},
  {"idx":251,"e":"tursinbaevaaydana99@gmail.com","l":"ru","reg":"2026-11-02"},
  {"idx":252,"e":"adarouzz@gmail.com","l":"uk","reg":"2026-11-02"},
  {"idx":253,"e":"krkbekir3@gmail.com","l":"tr","reg":"2026-11-02"},
  {"idx":254,"e":"aldito0932@gmail.com","l":"es","reg":"2026-11-02"},
  {"idx":255,"e":"chennitanais2@gmail.com","l":"en","reg":"2026-11-02"},
  {"idx":256,"e":"gddftgfdhj@gmail.com","l":"ar","reg":"2026-11-02"},
  {"idx":257,"e":"kimoashraf1472@gmail.com","l":"ar","reg":"2026-11-02"},
  {"idx":258,"e":"bachrain12@gmail.com","l":"id","reg":"2026-11-02"},
  {"idx":259,"e":"shevavaleria2203@gmail.com","l":"uk","reg":"2026-11-02"},
  {"idx":260,"e":"eoul0774@gmail.com","l":"ar","reg":"2026-11-02"},
  {"idx":261,"e":"osbalgoldin@gmail.com","l":"ar","reg":"2026-11-02"},
  {"idx":262,"e":"yaso2008bdr@gmail.com","l":"ar","reg":"2026-11-02"},
  {"idx":263,"e":"nailatuzzahra5@gmail.com","l":"id","reg":"2026-11-03"},
  {"idx":264,"e":"tir.mohammed.said@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":265,"e":"jomorodion124@gmail.com","l":"es","reg":"2026-11-03"},
  {"idx":266,"e":"sadullayevagulchehra945@gmail.com","l":"ru","reg":"2026-11-03"},
  {"idx":267,"e":"d.r.a.g.o.n.030413@gmail.com","l":"id","reg":"2026-11-03"},
  {"idx":268,"e":"imaneelamrani.pro2@gmail.com","l":"en","reg":"2026-11-03"},
  {"idx":269,"e":"windysalsa09@gmail.com","l":"id","reg":"2026-11-03"},
  {"idx":270,"e":"omaeshayosry@yahoo.com","l":"ar","reg":"2026-11-03"},
  {"idx":271,"e":"manusiasaya968@gmail.com","l":"id","reg":"2026-11-03"},
  {"idx":272,"e":"zht140279@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":273,"e":"muntaqoy@gmail.com","l":"id","reg":"2026-11-03"},
  {"idx":274,"e":"saragt03101999@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":275,"e":"abduraxmonovamumina@gmail.com","l":"en","reg":"2026-11-03"},
  {"idx":276,"e":"naglaakhayrat@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":277,"e":"hurera.khan980980@gmail.com","l":"en","reg":"2026-11-03"},
  {"idx":278,"e":"sarahonor010@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":279,"e":"ahmedalqoronpy1@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":280,"e":"sindhu.12.ala@gmail.com","l":"ur","reg":"2026-11-03"},
  {"idx":281,"e":"liliaabed05@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":282,"e":"nurzoda.bakhodirova8@gmail.com","l":"ru","reg":"2026-11-03"},
  {"idx":283,"e":"daniljhon559@gmail.com","l":"id","reg":"2026-11-03"},
  {"idx":284,"e":"pujakumari246820@gmail.com","l":"en","reg":"2026-11-03"},
  {"idx":285,"e":"katirinbengkulu26@gmail.com","l":"id","reg":"2026-11-03"},
  {"idx":286,"e":"asgdhshfhm@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":287,"e":"noberpalelleng05@gmail.com","l":"id","reg":"2026-11-03"},
  {"idx":288,"e":"rouk150878@gmail.com","l":"uk","reg":"2026-11-03"},
  {"idx":289,"e":"ihsangulsher@gmail.com","l":"en","reg":"2026-11-03"},
  {"idx":290,"e":"saghi6915@gmail.com","l":"fa","reg":"2026-11-03"},
  {"idx":291,"e":"ar9751602@gmail.com","l":"en","reg":"2026-11-03"},
  {"idx":292,"e":"jejenaty95@gmail.com","l":"pt","reg":"2026-11-03"},
  {"idx":293,"e":"lmrbdrrzklaz@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":294,"e":"pargol92gol@gmail.com","l":"fa","reg":"2026-11-03"},
  {"idx":295,"e":"dennilchristiannautani@gmail.com","l":"id","reg":"2026-11-03"},
  {"idx":296,"e":"merocu69@gmail.com","l":"es","reg":"2026-11-03"},
  {"idx":297,"e":"bilhajaraja@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":298,"e":"ignaciodavidlazaroparitintaya@gmail.com","l":"es","reg":"2026-11-03"},
  {"idx":299,"e":"salmabouya9@gmail.com","l":"fr","reg":"2026-11-03"},
  {"idx":300,"e":"trungtrong777@gmail.com","l":"vi","reg":"2026-11-03"},
  {"idx":301,"e":"fabiorganista1977@gmail.com","l":"pt","reg":"2026-11-03"},
  {"idx":302,"e":"andre19690615@gmail.com","l":"ru","reg":"2026-11-03"},
  {"idx":303,"e":"noctilus55@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":304,"e":"ajzere577z@gmail.com","l":"ru","reg":"2026-11-03"},
  {"idx":305,"e":"kausarbekmuratova66@gmail.com","l":"ru","reg":"2026-11-03"},
  {"idx":306,"e":"ea1235879@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":307,"e":"aysimaaas12@gmail.com","l":"tr","reg":"2026-11-03"},
  {"idx":308,"e":"zahrazinebma@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":309,"e":"wxsde1982@gmail.com","l":"fa","reg":"2026-11-03"},
  {"idx":310,"e":"gh8844740@gmail.com","l":"ru","reg":"2026-11-03"},
  {"idx":311,"e":"luciano.de.o.lima@gmail.com","l":"pt","reg":"2026-11-03"},
  {"idx":312,"e":"smart.azzurro6@gmail.com","l":"ro","reg":"2026-11-03"},
  {"idx":313,"e":"mhmehdi600@gmail.com","l":"en","reg":"2026-11-03"},
  {"idx":314,"e":"nagygaber552@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":315,"e":"bekkimaroua22@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":316,"e":"safaeamedah@gmail.com","l":"ar","reg":"2026-11-03"},
  {"idx":317,"e":"khe.zou.nas@gmail.com","l":"fr","reg":"2026-11-03"},
  {"idx":318,"e":"mahnooragha557@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":319,"e":"yej26237@gmail.com","l":"id","reg":"2026-11-04"},
  {"idx":320,"e":"lilian.sipac12@gmail.com","l":"es","reg":"2026-11-04"},
  {"idx":321,"e":"ahmedfadelhelal6@gmail.com","l":"ar","reg":"2026-11-04"},
  {"idx":322,"e":"shaziaslm23@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":323,"e":"ruth.10.rfr@gmail.com","l":"es","reg":"2026-11-04"},
  {"idx":324,"e":"stocksaya01@gmail.com","l":"id","reg":"2026-11-04"},
  {"idx":325,"e":"agiesnakhaerani@gmail.com","l":"id","reg":"2026-11-04"},
  {"idx":326,"e":"deaamelia1420@gmail.com","l":"id","reg":"2026-11-04"},
  {"idx":327,"e":"najiayoub934@gmail.com","l":"ar","reg":"2026-11-04"},
  {"idx":328,"e":"naziaqueen218@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":329,"e":"ameemakhan824@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":330,"e":"w1986doy@gmail.com","l":"ar","reg":"2026-11-04"},
  {"idx":331,"e":"royalvishal335@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":332,"e":"saidahmedovnazazira@gmail.com","l":"ru","reg":"2026-11-04"},
  {"idx":333,"e":"aferuza928@gmail.com","l":"ru","reg":"2026-11-04"},
  {"idx":334,"e":"sajidiqba72@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":335,"e":"huyenahh31@gmail.com","l":"vi","reg":"2026-11-04"},
  {"idx":336,"e":"ag5240095@gmail.com","l":"ru","reg":"2026-11-04"},
  {"idx":337,"e":"aditiamaolana1@gmail.com","l":"id","reg":"2026-11-04"},
  {"idx":338,"e":"vaatheist888@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":339,"e":"maida.iqbal1122@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":340,"e":"au5514670@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":341,"e":"skchk.vk@gmail.com","l":"uk","reg":"2026-11-04"},
  {"idx":342,"e":"singhtajbeer160@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":343,"e":"hayitboyevna2021@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":344,"e":"inforajesh0026@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":345,"e":"mf9711336@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":346,"e":"kinnerabhavitha4@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":347,"e":"oksanagavchuk@gmail.com","l":"uk","reg":"2026-11-04"},
  {"idx":348,"e":"voronovatatana429@gmail.com","l":"ru","reg":"2026-11-04"},
  {"idx":349,"e":"topsoyozer@gmail.com","l":"tr","reg":"2026-11-04"},
  {"idx":350,"e":"mahampahore2@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":351,"e":"hamnasajad321@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":352,"e":"shimbay486@gmail.com","l":"en","reg":"2026-11-04"},
  {"idx":353,"e":"aosadcuk488@gmail.com","l":"uk","reg":"2026-11-04"},
  {"idx":354,"e":"askolddemeshko@gmail.com","l":"uk","reg":"2026-11-04"},
  {"idx":355,"e":"ishakalimessaoud132@gmail.com","l":"ar","reg":"2026-11-04"},
  {"idx":356,"e":"divinohfsantana@gmail.com","l":"pt","reg":"2026-11-04"},
  {"idx":357,"e":"yasminekhayi4@gmail.com","l":"ar","reg":"2026-11-04"},
  {"idx":358,"e":"christina3452852@gmail.com","l":"uk","reg":"2026-11-04"},
  {"idx":359,"e":"amirsoori@gmail.com","l":"fa","reg":"2026-11-04"},
  {"idx":360,"e":"koreauniversity977@gmail.com","l":"es","reg":"2026-11-04"},
  {"idx":361,"e":"rusikblyk@gmail.com","l":"uk","reg":"2026-11-04"},
  {"idx":362,"e":"kikalaila524@gmail.com","l":"ar","reg":"2026-11-04"},
  {"idx":363,"e":"ralviaf@gmail.com","l":"id","reg":"2026-11-05"},
  {"idx":364,"e":"ernayunikaa@gmail.com","l":"id","reg":"2026-11-05"},
  {"idx":365,"e":"farangizkamilova807@gmail.com","l":"en","reg":"2026-11-05"},
  {"idx":366,"e":"bakduletomarbek@gmail.com","l":"en","reg":"2026-11-05"},
  {"idx":367,"e":"kellylopez2596@gmail.com","l":"en","reg":"2026-11-05"},
  {"idx":368,"e":"tellodilan667@gmail.com","l":"es","reg":"2026-11-05"},
  {"idx":369,"e":"evannaheven@gmail.com","l":"en","reg":"2026-11-05"},
  {"idx":370,"e":"yayastar342@gmail.com","l":"id","reg":"2026-11-05"},
  {"idx":371,"e":"jaiswalmansi416@gmail.com","l":"en","reg":"2026-11-05"},
  {"idx":372,"e":"artemsudilovskij6@gmail.com","l":"en","reg":"2026-11-05"},
  {"idx":373,"e":"am6902302@gmail.com","l":"ar","reg":"2026-11-05"},
  {"idx":374,"e":"luckystrike3326@gmail.com","l":"ja","reg":"2026-11-05"},
  {"idx":375,"e":"erbolataizere2013@gmail.com","l":"ru","reg":"2026-11-05"},
  {"idx":376,"e":"spooow943@gmail.com","l":"uk","reg":"2026-11-05"},
  {"idx":377,"e":"nawelspace@gmail.com","l":"en","reg":"2026-11-05"},
  {"idx":378,"e":"baconnma1234@gmail.com","l":"en","reg":"2026-11-05"},
  {"idx":379,"e":"oumaimamkh85@gmail.com","l":"ar","reg":"2026-11-05"},
  {"idx":380,"e":"salahsalah648@gmail.com","l":"ar","reg":"2026-11-05"},
  {"idx":381,"e":"gianghit389@gmail.com","l":"vi","reg":"2026-11-05"},
  {"idx":382,"e":"lakime1599@gmail.com","l":"ar","reg":"2026-11-05"},
  {"idx":383,"e":"samnankhan@gmail.com","l":"ur","reg":"2026-11-05"},
  {"idx":384,"e":"baayasser.20@gmail.com","l":"ar","reg":"2026-11-06"},
  {"idx":385,"e":"hajar.asadsangabi@gmail.com","l":"fa","reg":"2026-11-06"},
  {"idx":386,"e":"pablo.bagio@gmail.com","l":"fr","reg":"2026-11-06"},
  {"idx":387,"e":"bhatigunjan529@gmail.com","l":"en","reg":"2026-11-06"},
  {"idx":388,"e":"olya23larina12@gmail.com","l":"uk","reg":"2026-11-06"},
  {"idx":389,"e":"azu.salazar13@gmail.com","l":"es","reg":"2026-11-06"},
  {"idx":390,"e":"millyntt@gmail.com","l":"id","reg":"2026-11-06"},
  {"idx":391,"e":"iradasaparbayewa9@gmail.com","l":"tr","reg":"2026-11-06"},
  {"idx":392,"e":"imankerja123@gmail.com","l":"id","reg":"2026-11-07"},
  {"idx":393,"e":"antropologia2011@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":394,"e":"fatibati1982@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":395,"e":"tengkoe.muda@gmail.com","l":"id","reg":"2026-11-07"},
  {"idx":396,"e":"mereut9@gmail.com","l":"en","reg":"2026-11-07"},
  {"idx":397,"e":"samyalqlyny65@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":398,"e":"jayeto29@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":399,"e":"mk4770228@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":400,"e":"tobbechea2@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":401,"e":"brbyshnsar@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":402,"e":"prasetyayudha2005@gmail.com","l":"id","reg":"2026-11-07"},
  {"idx":403,"e":"faredaa702@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":404,"e":"aha782334@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":405,"e":"jwnywrbdy@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":406,"e":"dilnazmausumbaeva04@gmail.com","l":"ru","reg":"2026-11-07"},
  {"idx":407,"e":"mhmdyahmdyahmdy@gmail.com","l":"fa","reg":"2026-11-07"},
  {"idx":408,"e":"juanroig135@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":409,"e":"sapargalisadikhan@gmail.com","l":"en","reg":"2026-11-07"},
  {"idx":410,"e":"maximunoz506@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":411,"e":"zehrakendirci9@gmail.com","l":"tr","reg":"2026-11-07"},
  {"idx":412,"e":"maulqolbi609@gmail.com","l":"id","reg":"2026-11-07"},
  {"idx":413,"e":"handarpinar@gmail.com","l":"tr","reg":"2026-11-07"},
  {"idx":414,"e":"hujungalam@gmail.com","l":"id","reg":"2026-11-07"},
  {"idx":415,"e":"faqihhidayat1212@gmail.com","l":"id","reg":"2026-11-07"},
  {"idx":416,"e":"nabiaverkalets@gmail.com","l":"uk","reg":"2026-11-07"},
  {"idx":417,"e":"lysytsja@gmail.com","l":"uk","reg":"2026-11-07"},
  {"idx":418,"e":"ruhshona763@gmail.com","l":"en","reg":"2026-11-07"},
  {"idx":419,"e":"mehdisaeedi851@gmail.com","l":"tr","reg":"2026-11-07"},
  {"idx":420,"e":"barillasjaylynn@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":421,"e":"vladavenam4ik@gmail.com","l":"ru","reg":"2026-11-07"},
  {"idx":422,"e":"botakoz3333@gmail.com","l":"ru","reg":"2026-11-07"},
  {"idx":423,"e":"maykelganchozo034@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":424,"e":"kimlili19950000@gmail.com","l":"ru","reg":"2026-11-07"},
  {"idx":425,"e":"ulavdovak17@gmail.com","l":"uk","reg":"2026-11-07"},
  {"idx":426,"e":"olegvojtov192@gmail.com","l":"ru","reg":"2026-11-07"},
  {"idx":427,"e":"d2mixalych@gmail.com","l":"en","reg":"2026-11-07"},
  {"idx":428,"e":"ersovasofia650@gmail.com","l":"ru","reg":"2026-11-07"},
  {"idx":429,"e":"adibamamaeva@gmail.com","l":"en","reg":"2026-11-07"},
  {"idx":430,"e":"darisinspectorasst@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":431,"e":"thiagosantiago914@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":432,"e":"alejandroherrerasuarez42@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":433,"e":"sarahmarianunesdealmeida12@gmail.com","l":"pt","reg":"2026-11-07"},
  {"idx":434,"e":"alburezdeflores32@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":435,"e":"josechavez.asp@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":436,"e":"rodrigozambranalima@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":437,"e":"jeancarloschaponan7@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":438,"e":"sofiaosadchya555@gmail.com","l":"uk","reg":"2026-11-07"},
  {"idx":439,"e":"ahmetkadirozkaya@gmail.com","l":"tr","reg":"2026-11-07"},
  {"idx":440,"e":"gsmmouh25@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":441,"e":"nirwanaprinces4@gmail.com","l":"en","reg":"2026-11-07"},
  {"idx":442,"e":"gannaahmed677@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":443,"e":"ivettedelacruz007@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":444,"e":"diniiandriyani123@gmail.com","l":"id","reg":"2026-11-07"},
  {"idx":445,"e":"houdaaz2008@gmail.com","l":"de","reg":"2026-11-07"},
  {"idx":446,"e":"chmutte@gmail.com","l":"en","reg":"2026-11-07"},
  {"idx":447,"e":"yorkamorn@gmail.com","l":"es","reg":"2026-11-07"},
  {"idx":448,"e":"mhmd423153@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":449,"e":"oussamanadji9@gmail.com","l":"en","reg":"2026-11-07"},
  {"idx":450,"e":"heer125@gmail.com","l":"en","reg":"2026-11-07"},
  {"idx":451,"e":"dzair3c@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":452,"e":"sekkaouiaref9@gmail.com","l":"ar","reg":"2026-11-07"},
  {"idx":453,"e":"rodrigo.arteaga.q.q29@gmail.com","l":"en","reg":"2026-11-08"},
  {"idx":454,"e":"maykelcamacho131@gmail.com","l":"es","reg":"2026-11-08"},
  {"idx":455,"e":"sher.severiano@gmail.com","l":"es","reg":"2026-11-08"},
  {"idx":456,"e":"alexanderberzosa165@gmail.com","l":"es","reg":"2026-11-08"},
  {"idx":457,"e":"mariagioconda63@gmail.com","l":"it","reg":"2026-11-08"},
  {"idx":458,"e":"isma49103@gmail.com","l":"ar","reg":"2026-11-08"},
  {"idx":459,"e":"444979729l@gmail.com","l":"ar","reg":"2026-11-08"},
  {"idx":460,"e":"romyna.reyes.rodriguez13@gmail.com","l":"es","reg":"2026-11-08"},
  {"idx":461,"e":"lethuyhanh58@gmail.com","l":"vi","reg":"2026-11-08"},
  {"idx":462,"e":"dalayanalucano21@gmail.com","l":"en","reg":"2026-11-08"},
  {"idx":463,"e":"mazeemamin277@gmail.com","l":"en","reg":"2026-11-08"},
  {"idx":464,"e":"asanchezr_3@uqvirtual.edu.co","l":"es","reg":"2026-11-08"},
  {"idx":465,"e":"bannabinachsan@gmail.com","l":"id","reg":"2026-11-08"},
  {"idx":466,"e":"m7345998@gmail.com","l":"ar","reg":"2026-11-08"},
  {"idx":467,"e":"n0na.kaj0l@gmail.com","l":"id","reg":"2026-11-08"},
  {"idx":468,"e":"vianiirhmataan@gmail.com","l":"id","reg":"2026-11-08"},
  {"idx":469,"e":"erzalinkar965@gmail.com","l":"ru","reg":"2026-11-08"},
  {"idx":470,"e":"tuxaaanya@gmail.com","l":"ru","reg":"2026-11-08"},
  {"idx":471,"e":"anastasiabocan522@gmail.com","l":"ru","reg":"2026-11-08"},
  {"idx":472,"e":"jdhdhjehshwjsbbsjsbsvsbs@gmail.com","l":"uk","reg":"2026-11-08"},
  {"idx":473,"e":"alizajabbaraliza@gmail.com","l":"en","reg":"2026-11-08"},
  {"idx":474,"e":"xxmuroxx664173@hotmail.com","l":"tr","reg":"2026-11-08"},
  {"idx":475,"e":"zabedeen248@gmail.com","l":"en","reg":"2026-11-08"},
  {"idx":476,"e":"aselbalgali016@gmail.com","l":"ru","reg":"2026-11-08"},
  {"idx":477,"e":"defilippogiovanna70@gmail.com","l":"it","reg":"2026-11-08"},
  {"idx":478,"e":"eriveltonbrigido9722@gmail.com","l":"pt","reg":"2026-11-08"},
  {"idx":479,"e":"dellenindyaa@gmail.com","l":"id","reg":"2026-11-08"},
  {"idx":480,"e":"udo.szeppeck@gmail.com","l":"de","reg":"2026-11-08"},
  {"idx":481,"e":"kumarparani97@gmail.com","l":"en","reg":"2026-11-08"},
  {"idx":482,"e":"boomikamurugan786@gmail.com","l":"en","reg":"2026-11-08"},
  {"idx":483,"e":"alexia.zamfirescu15@gmail.com","l":"ro","reg":"2026-11-08"},
  {"idx":484,"e":"manuelacanterosledesma@gmail.com","l":"es","reg":"2026-11-08"},
  {"idx":485,"e":"maubiomol@gmail.com","l":"it","reg":"2026-11-08"},
  {"idx":486,"e":"tomaszpoltorak77@gmail.com","l":"pl","reg":"2026-11-08"},
  {"idx":487,"e":"thevoice11144@gmail.com","l":"es","reg":"2026-11-08"}
];

function buildHtml(lang) {
  var t = TEMPLATES[lang] || TEMPLATES["en"];
  var dirAttr = t.rtl ? ' dir="rtl"' : '';
  var alignStyle = t.rtl ? 'text-align: right;' : 'text-align: left;';
  return '' +
    '<div' + dirAttr + ' style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px 24px; color: #1f2937; line-height: 1.65; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; ' + alignStyle + '">' +
      '<p style="font-size: 16px; margin-top: 0;">' + t.greeting + '</p>' +
      '<p style="font-size: 15px;">' + t.intro + '</p>' +
      '<div style="background: #f9fafb; border-radius: 12px; padding: 16px 18px; margin: 18px 0;">' +
        '<p style="font-size: 15px; margin: 0 0 12px 0;">' + t.item1 + '</p>' +
        '<p style="font-size: 15px; margin: 0 0 12px 0;">' + t.item2 + '</p>' +
        '<p style="font-size: 15px; margin: 0;">' + t.item3 + '</p>' +
      '</div>' +
      '<p style="font-size: 15px;">' + t.reminder + '</p>' +
      '<div style="margin: 26px 0;">' +
        '<a href="' + PLAY_STORE_URL + '" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">' +
          t.cta +
        '</a>' +
      '</div>' +
      '<p style="font-size: 14px; color: #6b7280; margin-top: 28px; margin-bottom: 0;">' +
        t.signoff +
      '</p>' +
    '</div>';
}

function buildPlainText(lang) {
  var t = TEMPLATES[lang] || TEMPLATES["en"];
  var strip = function(s) { return s.replace(/<[^>]+>/g, ""); };
  return [
    strip(t.greeting),
    "",
    strip(t.intro),
    "",
    strip(t.item1),
    strip(t.item2),
    strip(t.item3),
    "",
    strip(t.reminder),
    PLAY_STORE_URL,
    "",
    strip(t.signoff)
  ].join("\n");
}

/**
 * ГЛАВНАЯ ФУНКЦИЯ: Отправляет дневную партию писем и сохраняет прогресс
 */
function runDailyCampaign() {
  var props = PropertiesService.getScriptProperties();
  var sentJson = props.getProperty("SENT_EMAILS_JSON");
  var sentMap = sentJson ? JSON.parse(sentJson) : {};

  var quota = MailApp.getRemainingDailyQuota();
  Logger.log("Доступный дневной лимит Gmail: " + quota);

  // Оставляем резерв 2 письма (на отчёт админу и личные нужды)
  var allowedToSend = Math.min(MAX_PER_RUN, Math.max(0, quota - 2));
  if (allowedToSend <= 0) {
    Logger.log("Лимит на сегодня исчерпан (осталось " + quota + "). Следующая партия уйдёт завтра.");
    return;
  }

  var sentThisRun = 0;
  var langSummary = {};
  var errors = [];

  for (var i = 0; i < RECIPIENTS.length; i++) {
    if (sentThisRun >= allowedToSend) break;

    var item = RECIPIENTS[i];
    var email = item.e;
    var lang = item.l || "en";

    if (sentMap[email]) continue; // Уже отправлено ранее

    var t = TEMPLATES[lang] || TEMPLATES["en"];
    try {
      MailApp.sendEmail({
        to: email,
        subject: t.subject,
        body: buildPlainText(lang),
        htmlBody: buildHtml(lang),
        name: "English Breakfast"
      });
      sentMap[email] = 1;
      sentThisRun++;
      langSummary[lang] = (langSummary[lang] || 0) + 1;

      // Сохраняем прогресс каждые 10 писем на случай прерывания
      if (sentThisRun % 10 === 0) {
        props.setProperty("SENT_EMAILS_JSON", JSON.stringify(sentMap));
      }
      Utilities.sleep(400); // Пауза 0.4 сек между письмами для плавной отправки
    } catch (err) {
      Logger.log("Ошибка отправки на " + email + ": " + err);
      errors.push(email + " (" + err.message + ")");
      // Помечаем невалидный адрес, чтобы не застревать на нём
      sentMap[email] = -1;
    }
  }

  props.setProperty("SENT_EMAILS_JSON", JSON.stringify(sentMap));

  var totalProcessed = Object.keys(sentMap).length;
  var remaining = RECIPIENTS.length - totalProcessed;

  Logger.log("Отправлено в этом запуске: " + sentThisRun);
  Logger.log("Всего обработано: " + totalProcessed + " из " + RECIPIENTS.length + " (осталось: " + remaining + ")");
  Logger.log("По языкам в этом запуске: " + JSON.stringify(langSummary));

  // Отправляем краткий отчёт на sway1976@gmail.com
  if (MailApp.getRemainingDailyQuota() > 0 && sentThisRun > 0) {
    MailApp.sendEmail({
      to: ADMIN_REPORT_EMAIL,
      subject: "[Отчёт рассылки] Отправлено " + sentThisRun + " писем (Всего: " + totalProcessed + "/" + RECIPIENTS.length + ")",
      body: "Партия рассылки English Breakfast успешно отправлена!\n\n" +
            "• Отправлено сейчас: " + sentThisRun + "\n" +
            "• По языкам: " + JSON.stringify(langSummary) + "\n" +
            "• Всего отправлено: " + totalProcessed + " из " + RECIPIENTS.length + "\n" +
            "• Осталось отправить: " + remaining + "\n" +
            "• Ошибок: " + errors.length + (errors.length ? " (" + errors.join(", ") + ")" : "")
    });
  }
}

/**
 * Проверить текущий статус рассылки в Журнале выполнения (без отправки писем)
 */
function checkStatus() {
  var props = PropertiesService.getScriptProperties();
  var sentJson = props.getProperty("SENT_EMAILS_JSON");
  var sentMap = sentJson ? JSON.parse(sentJson) : {};
  var totalProcessed = Object.keys(sentMap).length;
  Logger.log("Всего в базе: " + RECIPIENTS.length);
  Logger.log("Уже отправлено: " + totalProcessed);
  Logger.log("Осталось отправить: " + (RECIPIENTS.length - totalProcessed));
  Logger.log("Остаток дневной квоты Gmail сегодня: " + MailApp.getRemainingDailyQuota());
}
