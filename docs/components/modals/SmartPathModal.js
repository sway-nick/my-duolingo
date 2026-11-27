import { getInterfaceLanguage, t } from '../../services/i18n.js?v=423.0';
import { RTL_LOCALES } from '../../config/locales.js?v=423.0';
import { buildSmartPathPlan } from '../../services/smartPathService.js?v=423.0';
import { AdService } from '../../services/adService.js?v=423.0';

export const SMART_PATH_I18N = {
  ar: {
    title: "الدورة الذكية",
    subtitle: 'هذا تقدم ذكي في الدورة (موصى به)',
    waveLabel: "الخطوة {wave} من {total}",
    progressLabel: 'المستوى {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "الهدف",
    goalVocab: "تعلّم {target} كلمة من مستوى {level}",
    goalMicroRule: "تعلّم القاعدة: {title}",
    goalTense: "أتقن الزمن: {title}",
    goalGrammarRef: "ادرس الموضوع: {title}",
    goalCollection: "تعلّم المجموعة: {title}",
    goalIrregular: "تعلّم الأفعال: {title}",
    goalSpoken: "تعلّم العبارات: {title}",
    goalExam: "اجتز اختبار مستوى {level}",
    upcomingLabel: 'الخطوات القادمة',
    startBtn: 'ابدأ',
    otherStepBtn: 'خطوة أخرى',
    openMatrixBtn: 'فتح مصفوفة المعرفة',
    closeLabel: 'إغلاق',
    typeVocab: 'المفردات',
    typeMicroRule: 'قاعدة مصغرة',
    typeTense: 'زمن الفعل',
    typeGrammarRef: 'مرجع القواعد',
    typeCollection: 'مجموعة كلمات',
    typeIrregular: 'الأفعال الشاذة',
    typeSpoken: 'الإنجليزية المحكية',
    typeExam: 'اختبار المستوى',
    vocabDesc: 'أتقِن الكلمات نحو هدف {target} ({current}/{target})',
    examDesc: 'أكمِل الاختبار الشامل لفتح مستوى {level}',
    allDoneTitle: 'اكتمل المسار حتى C1!',
    allDoneDesc: 'تم اجتياز جميع المستويات والاختبارات.',
  },
  bn: {
    title: "স্মার্ট কোর্স",
    subtitle: 'এটি কোর্সের স্মার্ট অগ্রগতি (সুপারিশকৃত)',
    waveLabel: "ধাপ {wave} / {total}",
    progressLabel: 'লেভেল {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "লক্ষ্য",
    goalVocab: "{level} স্তরের {target}টি শব্দ শিখুন",
    goalMicroRule: "নিয়ম শিখুন: {title}",
    goalTense: "কাল আয়ত্ত করুন: {title}",
    goalGrammarRef: "বিষয় পড়ুন: {title}",
    goalCollection: "সংগ্রহ শিখুন: {title}",
    goalIrregular: "ক্রিয়া শিখুন: {title}",
    goalSpoken: "কথ্য প্রকাশ শিখুন: {title}",
    goalExam: "{level} স্তরের পরীক্ষা পাস করুন",
    upcomingLabel: 'পরিকল্পনায় পরবর্তী',
    startBtn: 'শুরু করুন',
    otherStepBtn: 'অন্য ধাপ',
    openMatrixBtn: 'জ্ঞান ম্যাট্রিক্স খুলুন',
    closeLabel: 'বন্ধ করুন',
    typeVocab: 'শব্দভাণ্ডার',
    typeMicroRule: 'মাইক্রো-নিয়ম',
    typeTense: 'কাল ও গঠন',
    typeGrammarRef: 'ব্যাকরণ নির্দেশিকা',
    typeCollection: 'শব্দ সংগ্রহ',
    typeIrregular: 'অনিয়মিত ক্রিয়া',
    typeSpoken: 'কথ্য ইংরেজি',
    typeExam: 'লেভেল পরীক্ষা',
    vocabDesc: '{target} শব্দের লক্ষ্যে শব্দ শিখুন ({current}/{target})',
    examDesc: '{level} নিশ্চিত করতে সম্পূর্ণ পরীক্ষা পাস করুন',
    allDoneTitle: 'C1 পর্যন্ত সব ধাপ সম্পন্ন!',
    allDoneDesc: 'সব লেভেলের পরীক্ষা উত্তীর্ণ হয়েছে।',
  },
  bg: {
    title: "Умен курс",
    subtitle: 'Това е умно напредване по курса (препоръчано)',
    waveLabel: "Стъпка {wave} от {total}",
    progressLabel: 'Ниво {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Цел",
    goalVocab: "Научете {target} думи от ниво {level}",
    goalMicroRule: "Изучете правило: {title}",
    goalTense: "Усвоете време: {title}",
    goalGrammarRef: "Изучете тема: {title}",
    goalCollection: "Научете колекция: {title}",
    goalIrregular: "Научете глаголи: {title}",
    goalSpoken: "Научете изрази: {title}",
    goalExam: "Вземете теста за ниво {level}",
    upcomingLabel: 'По-нататък по план',
    startBtn: 'Започни',
    otherStepBtn: 'Друга стъпка',
    openMatrixBtn: 'Отвори матрицата на знания',
    closeLabel: 'Затвори',
    typeVocab: 'Речник',
    typeMicroRule: 'Микроправило',
    typeTense: 'Временна форма',
    typeGrammarRef: 'Справочник',
    typeCollection: 'Колекция',
    typeIrregular: 'Неправилни глаголи',
    typeSpoken: 'Жив английски',
    typeExam: 'Тест за ниво',
    vocabDesc: 'Натрупайте думи към целта {target} ({current}/{target})',
    examDesc: 'Вземете комплексния тест за потвърждаване на {level}',
    allDoneTitle: 'Курсът до C1 е завършен!',
    allDoneDesc: 'Всички нива и тестове са преминати.',
  },
  zh: {
    title: "智能课程",
    subtitle: '这是课程的智能进阶路线（推荐）',
    waveLabel: "第 {wave} / {total} 步",
    progressLabel: '等级 {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "目标",
    goalVocab: "掌握 {level} 级别 {target} 个单词",
    goalMicroRule: "学习规则：{title}",
    goalTense: "掌握时态：{title}",
    goalGrammarRef: "学习主题：{title}",
    goalCollection: "学习词集：{title}",
    goalIrregular: "学习动词：{title}",
    goalSpoken: "学习表达：{title}",
    goalExam: "通过 {level} 级别测试",
    upcomingLabel: '后续计划',
    startBtn: '开始',
    otherStepBtn: '换一步',
    openMatrixBtn: '打开知识矩阵',
    closeLabel: '关闭',
    typeVocab: '词汇',
    typeMicroRule: '微规则',
    typeTense: '时态结构',
    typeGrammarRef: '语法手册',
    typeCollection: '主题词集',
    typeIrregular: '不规则动词',
    typeSpoken: '地道口语',
    typeExam: '等级考试',
    vocabDesc: '向 {target} 词目标推进 ({current}/{target})',
    examDesc: '通过综合考试以认证 {level} 等级',
    allDoneTitle: '已完成至 C1 的全部课程！',
    allDoneDesc: '所有等级与考试均已通过。',
  },
  hr: {
    title: "Pametni tečaj",
    subtitle: 'Ovo je pametno napredovanje kroz tečaj (preporučeno)',
    waveLabel: "Korak {wave} od {total}",
    progressLabel: 'Razina {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Cilj",
    goalVocab: "Nauči {target} riječi razine {level}",
    goalMicroRule: "Nauči pravilo: {title}",
    goalTense: "Savladaj vrijeme: {title}",
    goalGrammarRef: "Prouči temu: {title}",
    goalCollection: "Nauči kolekciju: {title}",
    goalIrregular: "Nauči glagole: {title}",
    goalSpoken: "Nauči izraze: {title}",
    goalExam: "Položi ispit razine {level}",
    upcomingLabel: 'Slijedi u planu',
    startBtn: 'Započni',
    otherStepBtn: 'Drugi korak',
    openMatrixBtn: 'Otvori matricu znanja',
    closeLabel: 'Zatvori',
    typeVocab: 'Rječnik',
    typeMicroRule: 'Mikropravilo',
    typeTense: 'Glagolsko vrijeme',
    typeGrammarRef: 'Priručnik',
    typeCollection: 'Kolekcija',
    typeIrregular: 'Nepravilni glagoli',
    typeSpoken: 'Govorni engleski',
    typeExam: 'Ispit razine',
    vocabDesc: 'Učite riječi prema cilju {target} ({current}/{target})',
    examDesc: 'Položite sveobuhvatni ispit za razinu {level}',
    allDoneTitle: 'Tečaj do C1 je završen!',
    allDoneDesc: 'Sve razine i ispiti su položeni.',
  },
  cs: {
    title: "Chytrý kurz",
    subtitle: 'Toto je chytrý postup kurzem (doporučeno)',
    waveLabel: "Krok {wave} z {total}",
    progressLabel: 'Úroveň {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Cíl",
    goalVocab: "Naučit se {target} slov úrovně {level}",
    goalMicroRule: "Projít pravidlo: {title}",
    goalTense: "Zvládnout čas: {title}",
    goalGrammarRef: "Prostudovat téma: {title}",
    goalCollection: "Naučit se sadu: {title}",
    goalIrregular: "Naučit se slovesa: {title}",
    goalSpoken: "Naučit se fráze: {title}",
    goalExam: "Složit test úrovně {level}",
    upcomingLabel: 'Dále v plánu',
    startBtn: 'Začít',
    otherStepBtn: 'Jiný krok',
    openMatrixBtn: 'Otevřít matici znalostí',
    closeLabel: 'Zavřít',
    typeVocab: 'Slovní zásoba',
    typeMicroRule: 'Mikropravidlo',
    typeTense: 'Časová vazba',
    typeGrammarRef: 'Příručka',
    typeCollection: 'Sbírka',
    typeIrregular: 'Nepravidelná slovesa',
    typeSpoken: 'Mluvená angličtina',
    typeExam: 'Zkouška úrovně',
    vocabDesc: 'Doplňte slovíčka k cíli {target} ({current}/{target})',
    examDesc: 'Složte souhrnný test pro potvrzení {level}',
    allDoneTitle: 'Kurz až po C1 je hotový!',
    allDoneDesc: 'Všechny úrovně a testy jsou splněny.',
  },
  da: {
    title: "Smart kursus",
    subtitle: 'Dette er smart fremgang i kurset (anbefalet)',
    waveLabel: "Trin {wave} af {total}",
    progressLabel: 'Niveau {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Mål",
    goalVocab: "Lær {target} ord på niveau {level}",
    goalMicroRule: "Lær reglen: {title}",
    goalTense: "Mestre tiden: {title}",
    goalGrammarRef: "Studér emnet: {title}",
    goalCollection: "Lær samlingen: {title}",
    goalIrregular: "Lær verberne: {title}",
    goalSpoken: "Lær udtryk: {title}",
    goalExam: "Bestå {level}-niveauprøven",
    upcomingLabel: 'Næste i planen',
    startBtn: 'Start',
    otherStepBtn: 'Andet skridt',
    openMatrixBtn: 'Åbn vidensmatrice',
    closeLabel: 'Luk',
    typeVocab: 'Ordforråd',
    typeMicroRule: 'Mikroregel',
    typeTense: 'Tidsform',
    typeGrammarRef: 'Grammatikguide',
    typeCollection: 'Ordsamling',
    typeIrregular: 'Uregelmæssige verber',
    typeSpoken: 'Dagligdags engelsk',
    typeExam: 'Niveauprøve',
    vocabDesc: 'Byg ordforråd mod målet på {target} ({current}/{target})',
    examDesc: 'Bestå den samlede prøve for {level}',
    allDoneTitle: 'Hele ruten op til C1 er fuldført!',
    allDoneDesc: 'Alle niveauer og prøver er bestået.',
  },
  en: {
    title: "Smart Course",
    subtitle: 'Smart progression through the course (recommended)',
    waveLabel: "Step {wave} of {total}",
    progressLabel: 'Level {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Goal",
    goalVocab: "Learn {target} {level} words",
    goalMicroRule: "Learn rule: {title}",
    goalTense: "Master tense: {title}",
    goalGrammarRef: "Study topic: {title}",
    goalCollection: "Learn collection: {title}",
    goalIrregular: "Learn verbs: {title}",
    goalSpoken: "Learn phrases: {title}",
    goalExam: "Pass the {level} level test",
    upcomingLabel: 'Up next',
    startBtn: 'Start',
    otherStepBtn: 'Another step',
    openMatrixBtn: 'Open Knowledge Matrix',
    closeLabel: 'Close',
    typeVocab: 'Vocabulary',
    typeMicroRule: 'Micro-rule',
    typeTense: 'Tense construction',
    typeGrammarRef: 'Grammar guide',
    typeCollection: 'Collection',
    typeIrregular: 'Irregular verbs',
    typeSpoken: 'Spoken English',
    typeExam: 'Level exam',
    vocabDesc: 'Build vocabulary toward {target} words ({current}/{target})',
    examDesc: 'Pass the comprehensive test to complete {level}',
    allDoneTitle: 'Full path through C1 completed!',
    allDoneDesc: 'All levels and exams have been passed.',
  },
  et: {
    title: "Nutikas kursus",
    subtitle: 'See on nutikas edenemine kursusel (soovitatav)',
    waveLabel: "Samm {wave} / {total}",
    progressLabel: 'Tase {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Eesmärk",
    goalVocab: "Õpi {target} {level}-taseme sõna",
    goalMicroRule: "Õpi reegel: {title}",
    goalTense: "Omanda ajavorm: {title}",
    goalGrammarRef: "Õpi teema: {title}",
    goalCollection: "Õpi kogumik: {title}",
    goalIrregular: "Õpi tegusõnad: {title}",
    goalSpoken: "Õpi väljendid: {title}",
    goalExam: "Soorita taseme {level} test",
    upcomingLabel: 'Edasi kavas',
    startBtn: 'Alusta',
    otherStepBtn: 'Teine samm',
    openMatrixBtn: 'Ava teadmiste maatriks',
    closeLabel: 'Sulge',
    typeVocab: 'Sõnavara',
    typeMicroRule: 'Mikroreegel',
    typeTense: 'Ajavorm',
    typeGrammarRef: 'Teatmik',
    typeCollection: 'Kogumik',
    typeIrregular: 'Ebareeglipärased tegusõnad',
    typeSpoken: 'Kõnekeel',
    typeExam: 'Tasemetest',
    vocabDesc: 'Kogu sõnu eesmärgini {target} ({current}/{target})',
    examDesc: 'Läbi koondtest taseme {level} kinnitamiseks',
    allDoneTitle: 'Kogu tee kuni C1 on läbitud!',
    allDoneDesc: 'Kõik tasemed ja testid on sooritatud.',
  },
  fi: {
    title: "Älykäs kurssi",
    subtitle: 'Älykäs eteneminen kurssilla (suositeltu)',
    waveLabel: "Askel {wave} / {total}",
    progressLabel: 'Taso {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Tavoite",
    goalVocab: "Opi {target} {level}-tason sanaa",
    goalMicroRule: "Opi sääntö: {title}",
    goalTense: "Hallitse aikamuoto: {title}",
    goalGrammarRef: "Opiskele aihe: {title}",
    goalCollection: "Opi kokoelma: {title}",
    goalIrregular: "Opi verbit: {title}",
    goalSpoken: "Opi ilmaukset: {title}",
    goalExam: "Läpäise tason {level} koe",
    upcomingLabel: 'Seuraavaksi suunnitelmassa',
    startBtn: 'Aloita',
    otherStepBtn: 'Toinen askel',
    openMatrixBtn: 'Avaa osaamismatriisi',
    closeLabel: 'Sulje',
    typeVocab: 'Sanasto',
    typeMicroRule: 'Mikrosääntö',
    typeTense: 'Aikamuoto',
    typeGrammarRef: 'Kielioppiopas',
    typeCollection: 'Sanakokoelma',
    typeIrregular: 'Epäsäännölliset verbit',
    typeSpoken: 'Puhekieli',
    typeExam: 'Tasokoe',
    vocabDesc: 'Kerrytä sanastoa kohti {target} sanaa ({current}/{target})',
    examDesc: 'Suorita tason {level} koontikoe',
    allDoneTitle: 'Koko polku C1-tasolle suoritettu!',
    allDoneDesc: 'Kaikki tasot ja kokeet on läpäisty.',
  },
  fr: {
    title: "Cours intelligent",
    subtitle: 'Progression intelligente dans le cours (recommandé)',
    waveLabel: "Étape {wave} sur {total}",
    progressLabel: 'Niveau {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Objectif",
    goalVocab: "Apprendre {target} mots de niveau {level}",
    goalMicroRule: "Étudier la règle : {title}",
    goalTense: "Maîtriser le temps : {title}",
    goalGrammarRef: "Étudier le thème : {title}",
    goalCollection: "Apprendre la collection : {title}",
    goalIrregular: "Apprendre les verbes : {title}",
    goalSpoken: "Apprendre les expressions : {title}",
    goalExam: "Réussir le test de niveau {level}",
    upcomingLabel: 'À suivre',
    startBtn: 'Commencer',
    otherStepBtn: 'Autre étape',
    openMatrixBtn: 'Ouvrir la matrice',
    closeLabel: 'Fermer',
    typeVocab: 'Vocabulaire',
    typeMicroRule: 'Micro-règle',
    typeTense: 'Temps & structure',
    typeGrammarRef: 'Guide de grammaire',
    typeCollection: 'Collection',
    typeIrregular: 'Verbes irréguliers',
    typeSpoken: 'Anglais parlé',
    typeExam: 'Examen du niveau',
    vocabDesc: 'Atteindre l’objectif de {target} mots ({current}/{target})',
    examDesc: 'Réussir l’examen complet pour valider {level}',
    allDoneTitle: 'Parcours complet jusqu’au C1 terminé !',
    allDoneDesc: 'Tous les niveaux et examens sont validés.',
  },
  de: {
    title: "Smarter Kurs",
    subtitle: 'Das ist smarter Fortschritt im Kurs (empfohlen)',
    waveLabel: "Schritt {wave} von {total}",
    progressLabel: 'Stufe {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Ziel",
    goalVocab: "{target} Wörter der Stufe {level} lernen",
    goalMicroRule: "Regel lernen: {title}",
    goalTense: "Zeitform meistern: {title}",
    goalGrammarRef: "Thema lernen: {title}",
    goalCollection: "Sammlung lernen: {title}",
    goalIrregular: "Verben lernen: {title}",
    goalSpoken: "Ausdrücke lernen: {title}",
    goalExam: "Stufentest {level} bestehen",
    upcomingLabel: 'Als Nächstes geplant',
    startBtn: 'Starten',
    otherStepBtn: 'Anderer Schritt',
    openMatrixBtn: 'Wissensmatrix öffnen',
    closeLabel: 'Schließen',
    typeVocab: 'Wortschatz',
    typeMicroRule: 'Mikroregel',
    typeTense: 'Zeitform',
    typeGrammarRef: 'Grammatik-Guide',
    typeCollection: 'Sammlung',
    typeIrregular: 'Unregelmäßige Verben',
    typeSpoken: 'Gesprochenes Englisch',
    typeExam: 'Stufentest',
    vocabDesc: 'Wortschatz Richtung {target} Wörter aufbauen ({current}/{target})',
    examDesc: 'Gesamttest zum Abschluss von {level} bestehen',
    allDoneTitle: 'Der gesamte Weg bis C1 ist geschafft!',
    allDoneDesc: 'Alle Stufen und Prüfungen wurden bestanden.',
  },
  el: {
    title: "Έξυπνο μάθημα",
    subtitle: 'Έξυπνη πρόοδος στο πρόγραμμα (προτείνεται)',
    waveLabel: "Βήμα {wave} από {total}",
    progressLabel: 'Επίπεδο {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Στόχος",
    goalVocab: "Μάθε {target} λέξεις επιπέδου {level}",
    goalMicroRule: "Μάθε τον κανόνα: {title}",
    goalTense: "Κατάκτησε τον χρόνο: {title}",
    goalGrammarRef: "Μελέτησε το θέμα: {title}",
    goalCollection: "Μάθε τη συλλογή: {title}",
    goalIrregular: "Μάθε τα ρήματα: {title}",
    goalSpoken: "Μάθε εκφράσεις: {title}",
    goalExam: "Πέρασε το τεστ επιπέδου {level}",
    upcomingLabel: 'Στη συνέχεια',
    startBtn: 'Έναρξη',
    otherStepBtn: 'Άλλο βήμα',
    openMatrixBtn: 'Άνοιγμα πίνακα γνώσεων',
    closeLabel: 'Κλείσιμο',
    typeVocab: 'Λεξιλόγιο',
    typeMicroRule: 'Μικροκανόνας',
    typeTense: 'Χρόνος ρήματος',
    typeGrammarRef: 'Οδηγός γραμματικής',
    typeCollection: 'Συλλογή',
    typeIrregular: 'Ανώμαλα ρήματα',
    typeSpoken: 'Προφορικά αγγλικά',
    typeExam: 'Τεστ επιπέδου',
    vocabDesc: 'Μάθετε λέξεις προς τον στόχο {target} ({current}/{target})',
    examDesc: 'Περάστε το τεστ για ολοκλήρωση του {level}',
    allDoneTitle: 'Η πορεία έως το C1 ολοκληρώθηκε!',
    allDoneDesc: 'Όλα τα επίπεδα και τα τεστ ολοκληρώθηκαν.',
  },
  hi: {
    title: "स्मार्ट कोर्स",
    subtitle: 'यह कोर्स में स्मार्ट प्रगति है (अनुशंसित)',
    waveLabel: "कदम {wave} / {total}",
    progressLabel: 'स्तर {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "लक्ष्य",
    goalVocab: "{level} स्तर के {target} शब्द सीखें",
    goalMicroRule: "नियम सीखें: {title}",
    goalTense: "काल सीखें: {title}",
    goalGrammarRef: "विषय पढ़ें: {title}",
    goalCollection: "संग्रह सीखें: {title}",
    goalIrregular: "क्रियाएँ सीखें: {title}",
    goalSpoken: "बोलचाल सीखें: {title}",
    goalExam: "{level} स्तर की परीक्षा पास करें",
    upcomingLabel: 'आगे की योजना',
    startBtn: 'शुरू करें',
    otherStepBtn: 'दूसरा कदम',
    openMatrixBtn: 'नॉलेज मैट्रिक्स खोलें',
    closeLabel: 'बंद करें',
    typeVocab: 'शब्दावली',
    typeMicroRule: 'माइक्रो-नियम',
    typeTense: 'काल रचना',
    typeGrammarRef: 'व्याकरण गाइड',
    typeCollection: 'शब्द संग्रह',
    typeIrregular: 'अनियमित क्रियाएँ',
    typeSpoken: 'बोलचाल अंग्रेज़ी',
    typeExam: 'स्तर परीक्षा',
    vocabDesc: '{target} शब्दों के लक्ष्य की ओर बढ़ें ({current}/{target})',
    examDesc: '{level} पूरा करने के लिए समग्र परीक्षा पास करें',
    allDoneTitle: 'C1 तक पूरा कोर्स पथ पूरा हुआ!',
    allDoneDesc: 'सभी स्तर और परीक्षाएँ उत्तीर्ण हो गईं।',
  },
  hu: {
    title: "Okos kurzus",
    subtitle: 'Ez az okos haladás a kurzusban (ajánlott)',
    waveLabel: "{wave}. lépés / {total}",
    progressLabel: '{level} szint · {percent}% ({closed}/{total})',
    nextStepLabel: "Cél",
    goalVocab: "Tanulj meg {target} {level} szintű szót",
    goalMicroRule: "Szabály tanulása: {title}",
    goalTense: "Igeidő elsajátítása: {title}",
    goalGrammarRef: "Téma áttekintése: {title}",
    goalCollection: "Gyűjtemény tanulása: {title}",
    goalIrregular: "Igék tanulása: {title}",
    goalSpoken: "Kifejezések tanulása: {title}",
    goalExam: "{level} szintteszt teljesítése",
    upcomingLabel: 'Következik a tervben',
    startBtn: 'Indítás',
    otherStepBtn: 'Másik lépés',
    openMatrixBtn: 'Tudásmátrix megnyitása',
    closeLabel: 'Bezárás',
    typeVocab: 'Szókincs',
    typeMicroRule: 'Mikroszabály',
    typeTense: 'Igeidő',
    typeGrammarRef: 'Nyelvtani útmutató',
    typeCollection: 'Gyűjtemény',
    typeIrregular: 'Rendhagyó igék',
    typeSpoken: 'Élő angol',
    typeExam: 'Szintteszt',
    vocabDesc: 'Szókincs bővítése {target} szó felé ({current}/{target})',
    examDesc: 'Teljesítsd a(z) {level} összefoglaló tesztet',
    allDoneTitle: 'A teljes út C1-ig kész!',
    allDoneDesc: 'Minden szint és teszt sikeresen teljesítve.',
  },
  id: {
    title: "Kursus Cerdas",
    subtitle: 'Ini adalah kemajuan cerdas di kursus (direkomendasikan)',
    waveLabel: "Langkah {wave} dari {total}",
    progressLabel: 'Level {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Target",
    goalVocab: "Pelajari {target} kata level {level}",
    goalMicroRule: "Pelajari aturan: {title}",
    goalTense: "Kuasai bentuk waktu: {title}",
    goalGrammarRef: "Pelajari topik: {title}",
    goalCollection: "Pelajari koleksi: {title}",
    goalIrregular: "Pelajari kata kerja: {title}",
    goalSpoken: "Pelajari ungkapan: {title}",
    goalExam: "Lulus ujian level {level}",
    upcomingLabel: 'Berikutnya dalam rencana',
    startBtn: 'Mulai',
    otherStepBtn: 'Langkah lain',
    openMatrixBtn: 'Buka Matriks Pengetahuan',
    closeLabel: 'Tutup',
    typeVocab: 'Kosakata',
    typeMicroRule: 'Aturan mikro',
    typeTense: 'Bentuk waktu',
    typeGrammarRef: 'Panduan tata bahasa',
    typeCollection: 'Koleksi kata',
    typeIrregular: 'Kata kerja tak beraturan',
    typeSpoken: 'Bahasa Inggris lisan',
    typeExam: 'Ujian level',
    vocabDesc: 'Kumpulkan kosakata menuju target {target} ({current}/{target})',
    examDesc: 'Lulus ujian menyeluruh untuk menuntaskan {level}',
    allDoneTitle: 'Seluruh jalur hingga C1 selesai!',
    allDoneDesc: 'Semua level dan ujian telah lulus.',
  },
  it: {
    title: "Corso smart",
    subtitle: 'Avanzamento intelligente nel corso (consigliato)',
    waveLabel: "Passo {wave} di {total}",
    progressLabel: 'Livello {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Obiettivo",
    goalVocab: "Impara {target} parole di livello {level}",
    goalMicroRule: "Studia la regola: {title}",
    goalTense: "Padroneggia il tempo: {title}",
    goalGrammarRef: "Studia l’argomento: {title}",
    goalCollection: "Impara la raccolta: {title}",
    goalIrregular: "Impara i verbi: {title}",
    goalSpoken: "Impara le espressioni: {title}",
    goalExam: "Supera il test di livello {level}",
    upcomingLabel: 'In programma dopo',
    startBtn: 'Inizia',
    otherStepBtn: 'Altro passo',
    openMatrixBtn: 'Apri matrice conoscenze',
    closeLabel: 'Chiudi',
    typeVocab: 'Vocabolario',
    typeMicroRule: 'Micro-regola',
    typeTense: 'Tempo verbale',
    typeGrammarRef: 'Guida grammaticale',
    typeCollection: 'Raccolta',
    typeIrregular: 'Verbi irregolari',
    typeSpoken: 'Inglese parlato',
    typeExam: 'Esame di livello',
    vocabDesc: 'Avanza verso l’obiettivo di {target} parole ({current}/{target})',
    examDesc: 'Supera il test completo per confermare {level}',
    allDoneTitle: 'Percorso completo fino a C1 completato!',
    allDoneDesc: 'Tutti i livelli ed esami sono stati superati.',
  },
  ja: {
    title: "スマートコース",
    subtitle: 'コースを効率よく進めるスマートガイド（おすすめ）',
    waveLabel: "ステップ {wave} / {total}",
    progressLabel: 'レベル {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "目標",
    goalVocab: "{level}レベルの単語を{target}語覚える",
    goalMicroRule: "ルールを学ぶ：{title}",
    goalTense: "時制をマスター：{title}",
    goalGrammarRef: "テーマを学ぶ：{title}",
    goalCollection: "単語セットを学ぶ：{title}",
    goalIrregular: "動詞を覚える：{title}",
    goalSpoken: "フレーズを学ぶ：{title}",
    goalExam: "{level}レベル試験に合格する",
    upcomingLabel: '今後の予定',
    startBtn: '始める',
    otherStepBtn: '別のステップ',
    openMatrixBtn: '知識マトリックスを開く',
    closeLabel: '閉じる',
    typeVocab: '語彙',
    typeMicroRule: 'マイクロルール',
    typeTense: '時制・構文',
    typeGrammarRef: '文法ガイド',
    typeCollection: '単語セット',
    typeIrregular: '不規則動詞',
    typeSpoken: 'リアル英語',
    typeExam: 'レベル試験',
    vocabDesc: '{target} 語を目指して語彙を増やす ({current}/{target})',
    examDesc: '総合テストに合格して {level} を完了',
    allDoneTitle: 'C1までの全ルートを完了しました！',
    allDoneDesc: 'すべてのレベルと試験に合格しています。',
  },
  kk: {
    title: "Ақылды курс",
    subtitle: 'Бұл курс бойынша ақылды ілгерілеу (ұсынылады)',
    waveLabel: "Қадам {wave} / {total}",
    progressLabel: 'Деңгей {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Мақсат",
    goalVocab: "{level} деңгейіндегі {target} сөзді үйрену",
    goalMicroRule: "Ережені үйрену: {title}",
    goalTense: "Шақты меңгеру: {title}",
    goalGrammarRef: "Тақырыпты оқу: {title}",
    goalCollection: "Жинақты үйрену: {title}",
    goalIrregular: "Етістіктерді үйрену: {title}",
    goalSpoken: "Тіркестерді үйрену: {title}",
    goalExam: "{level} деңгей тестін тапсыру",
    upcomingLabel: 'Жоспардағы келесілер',
    startBtn: 'Бастау',
    otherStepBtn: 'Басқа қадам',
    openMatrixBtn: 'Білім матрицасын ашу',
    closeLabel: 'Жабу',
    typeVocab: 'Сөздік қор',
    typeMicroRule: 'Микроереже',
    typeTense: 'Шақ құрылымы',
    typeGrammarRef: 'Анықтамалық',
    typeCollection: 'Жинақ',
    typeIrregular: 'Бұрыс етістіктер',
    typeSpoken: 'Сөйлеу ағылшыншасы',
    typeExam: 'Деңгей тесті',
    vocabDesc: '{target} сөз мақсатына қарай сөз жинау ({current}/{target})',
    examDesc: '{level} деңгейін бекіту үшін кешенді тест тапсырыңыз',
    allDoneTitle: 'C1 деңгейіне дейінгі жол толық аяқталды!',
    allDoneDesc: 'Барлық деңгейлер мен тесттер сәтті тапсырылды.',
  },
  ko: {
    title: "스마트 코스",
    subtitle: '코스를 체계적으로 채워 나가는 스마트 진행입니다 (추천)',
    waveLabel: "단계 {wave} / {total}",
    progressLabel: '레벨 {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "목표",
    goalVocab: "{level} 레벨 단어 {target}개 익히기",
    goalMicroRule: "규칙 익히기: {title}",
    goalTense: "시제 마스터: {title}",
    goalGrammarRef: "주제 학습: {title}",
    goalCollection: "단어 모음 학습: {title}",
    goalIrregular: "동사 익히기: {title}",
    goalSpoken: "표현 익히기: {title}",
    goalExam: "{level} 레벨 시험 통과하기",
    upcomingLabel: '이어질 단계',
    startBtn: '시작하기',
    otherStepBtn: '다른 단계',
    openMatrixBtn: '지식 매트릭스 열기',
    closeLabel: '닫기',
    typeVocab: '어휘',
    typeMicroRule: '미니 규칙',
    typeTense: '시제 구문',
    typeGrammarRef: '문법 가이드',
    typeCollection: '단어 모음',
    typeIrregular: '불규칙 동사',
    typeSpoken: '실전 영어',
    typeExam: '레벨 시험',
    vocabDesc: '목표 {target}단어까지 어휘 채우기 ({current}/{target})',
    examDesc: '종합 시험을 통과해 {level} 완료하기',
    allDoneTitle: 'C1까지 모든 코스를 마쳤습니다!',
    allDoneDesc: '모든 레벨과 시험을 통과했습니다.',
  },
  lv: {
    title: "Viedais kurss",
    subtitle: 'Šī ir viedā virzība kursā (ieteicams)',
    waveLabel: "Solis {wave} no {total}",
    progressLabel: 'Līmenis {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Mērķis",
    goalVocab: "Iemācīties {target} {level} līmeņa vārdus",
    goalMicroRule: "Apgūt likumu: {title}",
    goalTense: "Apgūt laika formu: {title}",
    goalGrammarRef: "Izpētīt tēmu: {title}",
    goalCollection: "Apgūt kolekciju: {title}",
    goalIrregular: "Iemācīties darbības vārdus: {title}",
    goalSpoken: "Apgūt frāzes: {title}",
    goalExam: "Nokārtot {level} līmeņa testu",
    upcomingLabel: 'Tālāk plānā',
    startBtn: 'Sākt',
    otherStepBtn: 'Cits solis',
    openMatrixBtn: 'Atvērt zināšanu matricu',
    closeLabel: 'Aizvērt',
    typeVocab: 'Vārdu krājums',
    typeMicroRule: 'Mikrolikums',
    typeTense: 'Laika forma',
    typeGrammarRef: 'Uzziņu materiāls',
    typeCollection: 'Kolekcija',
    typeIrregular: 'Nekārtnie darbības vārdi',
    typeSpoken: 'Dzīvā angļu valoda',
    typeExam: 'Līmeņa tests',
    vocabDesc: 'Krājiet vārdus līdz {target} mērķim ({current}/{target})',
    examDesc: 'Nokārtojiet pārbaudes darbu līmenim {level}',
    allDoneTitle: 'Viss ceļš līdz C1 ir pabeigts!',
    allDoneDesc: 'Visi līmeņi un testi ir nokārtoti.',
  },
  lt: {
    title: "Išmanusis kursas",
    subtitle: 'Tai išmanus žingsniavimas per kursą (rekomenduojama)',
    waveLabel: "Žingsnis {wave} iš {total}",
    progressLabel: 'Lygis {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Tikslas",
    goalVocab: "Išmokti {target} {level} lygio žodžių",
    goalMicroRule: "Išmokti taisyklę: {title}",
    goalTense: "Įvaldyti laiką: {title}",
    goalGrammarRef: "Išnagrinėti temą: {title}",
    goalCollection: "Išmokti rinkinį: {title}",
    goalIrregular: "Išmokti veiksmažodžius: {title}",
    goalSpoken: "Išmokti frazes: {title}",
    goalExam: "Išlaikyti {level} lygio testą",
    upcomingLabel: 'Toliau plane',
    startBtn: 'Pradėti',
    otherStepBtn: 'Kitas žingsnis',
    openMatrixBtn: 'Atidaryti žinių matricą',
    closeLabel: 'Uždaryti',
    typeVocab: 'Žodynas',
    typeMicroRule: 'Mikrotaisyklė',
    typeTense: 'Laiko konstrukcija',
    typeGrammarRef: 'Gramatikos gidas',
    typeCollection: 'Rinkinys',
    typeIrregular: 'Netaisyklingi veiksmažodžiai',
    typeSpoken: 'Gyvoji anglų kalba',
    typeExam: 'Lygio testas',
    vocabDesc: 'Mokykite žodžių link {target} tikslo ({current}/{target})',
    examDesc: 'Išlaikykite testą ir patvirtinkite {level}',
    allDoneTitle: 'Visas kelias iki C1 užbaigtas!',
    allDoneDesc: 'Visi lygiai ir testai išlaikyti.',
  },
  fa: {
    title: "دوره هوشمند",
    subtitle: 'این پیشرفت هوشمند در دوره است (پیشنهادی)',
    waveLabel: "گام {wave} از {total}",
    progressLabel: 'سطح {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "هدف",
    goalVocab: "یادگیری {target} واژه سطح {level}",
    goalMicroRule: "یادگیری نکته: {title}",
    goalTense: "تسلط بر زمان: {title}",
    goalGrammarRef: "مطالعه موضوع: {title}",
    goalCollection: "یادگیری مجموعه: {title}",
    goalIrregular: "یادگیری افعال: {title}",
    goalSpoken: "یادگیری عبارت‌ها: {title}",
    goalExam: "قبولی در آزمون سطح {level}",
    upcomingLabel: 'گام‌های بعدی',
    startBtn: 'شروع',
    otherStepBtn: 'گام دیگر',
    openMatrixBtn: 'باز کردن ماتریس دانش',
    closeLabel: 'بستن',
    typeVocab: 'واژگان',
    typeMicroRule: 'نکته دستوری',
    typeTense: 'ساختار زمان',
    typeGrammarRef: 'مرجع گرامر',
    typeCollection: 'مجموعه واژگان',
    typeIrregular: 'افعال بی‌قاعده',
    typeSpoken: 'انگلیسی محاوره‌ای',
    typeExam: 'آزمون سطح',
    vocabDesc: 'رسیدن به هدف {target} واژه ({current}/{target})',
    examDesc: 'آزمون جامع سطح {level} را بگذرانید',
    allDoneTitle: 'مسیر کامل تا سطح C1 تکمیل شد!',
    allDoneDesc: 'همه سطوح و آزمون‌ها با موفقیت گذرانده شدند.',
  },
  pl: {
    title: "Inteligentny kurs",
    subtitle: 'To inteligentne przejście przez kurs (zalecane)',
    waveLabel: "Krok {wave} z {total}",
    progressLabel: 'Poziom {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Cel",
    goalVocab: "Poznaj {target} słów na poziomie {level}",
    goalMicroRule: "Poznaj regułę: {title}",
    goalTense: "Opanuj czas: {title}",
    goalGrammarRef: "Poznaj temat: {title}",
    goalCollection: "Poznaj kolekcję: {title}",
    goalIrregular: "Poznaj czasowniki: {title}",
    goalSpoken: "Poznaj zwroty: {title}",
    goalExam: "Zdaj test poziomu {level}",
    upcomingLabel: 'Kolejne w planie',
    startBtn: 'Rozpocznij',
    otherStepBtn: 'Inny krok',
    openMatrixBtn: 'Otwórz matrycę wiedzy',
    closeLabel: 'Zamknij',
    typeVocab: 'Słownictwo',
    typeMicroRule: 'Mikroreguła',
    typeTense: 'Czas gramatyczny',
    typeGrammarRef: 'Poradnik',
    typeCollection: 'Kolekcja',
    typeIrregular: 'Czasowniki nieregularne',
    typeSpoken: 'Żywy angielski',
    typeExam: 'Test poziomu',
    vocabDesc: 'Rozbuduj słownictwo do {target} słów ({current}/{target})',
    examDesc: 'Zdaj test przekrojowy dla poziomu {level}',
    allDoneTitle: 'Cała ścieżka do C1 ukończona!',
    allDoneDesc: 'Wszystkie poziomy i testy zostały zaliczone.',
  },
  pt: {
    title: "Curso inteligente",
    subtitle: 'Este é um avanço inteligente no curso (recomendado)',
    waveLabel: "Passo {wave} de {total}",
    progressLabel: 'Nível {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Objetivo",
    goalVocab: "Aprender {target} palavras de nível {level}",
    goalMicroRule: "Aprender regra: {title}",
    goalTense: "Dominar tempo: {title}",
    goalGrammarRef: "Estudar tema: {title}",
    goalCollection: "Aprender coleção: {title}",
    goalIrregular: "Aprender verbos: {title}",
    goalSpoken: "Aprender expressões: {title}",
    goalExam: "Passar no exame de nível {level}",
    upcomingLabel: 'A seguir no plano',
    startBtn: 'Começar',
    otherStepBtn: 'Outro passo',
    openMatrixBtn: 'Abrir matriz de conhecimento',
    closeLabel: 'Fechar',
    typeVocab: 'Vocabulário',
    typeMicroRule: 'Micro-regra',
    typeTense: 'Tempo verbal',
    typeGrammarRef: 'Guia gramatical',
    typeCollection: 'Coleção',
    typeIrregular: 'Verbos irregulares',
    typeSpoken: 'Inglês falado',
    typeExam: 'Exame de nível',
    vocabDesc: 'Avance rumo às {target} palavras ({current}/{target})',
    examDesc: 'Conclua o exame geral de nível {level}',
    allDoneTitle: 'Percurso completo até C1 concluído!',
    allDoneDesc: 'Todos os níveis e exames foram aprovados.',
  },
  'pt-br': {
    title: "Curso inteligente",
    subtitle: 'Este é um avanço inteligente no curso (recomendado)',
    waveLabel: "Passo {wave} de {total}",
    progressLabel: 'Nível {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Meta",
    goalVocab: "Aprender {target} palavras do nível {level}",
    goalMicroRule: "Aprender regra: {title}",
    goalTense: "Dominar tempo: {title}",
    goalGrammarRef: "Estudar tema: {title}",
    goalCollection: "Aprender coleção: {title}",
    goalIrregular: "Aprender verbos: {title}",
    goalSpoken: "Aprender expressões: {title}",
    goalExam: "Passar no teste do nível {level}",
    upcomingLabel: 'Próximos passos',
    startBtn: 'Começar',
    otherStepBtn: 'Outro passo',
    openMatrixBtn: 'Abrir matriz de conhecimento',
    closeLabel: 'Fechar',
    typeVocab: 'Vocabulário',
    typeMicroRule: 'Microrregra',
    typeTense: 'Tempo verbal',
    typeGrammarRef: 'Guia de gramática',
    typeCollection: 'Coleção',
    typeIrregular: 'Verbos irregulares',
    typeSpoken: 'Inglês falado',
    typeExam: 'Exame de nível',
    vocabDesc: 'Aprenda palavras até a meta de {target} ({current}/{target})',
    examDesc: 'Faça o exame completo para concluir o nível {level}',
    allDoneTitle: 'Trilha completa até C1 concluída!',
    allDoneDesc: 'Todos os níveis e exames foram aprovados.',
  },
  ro: {
    title: "Curs inteligent",
    subtitle: 'Aceasta este o avansare inteligentă în curs (recomandat)',
    waveLabel: "Pasul {wave} din {total}",
    progressLabel: 'Nivel {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Obiectiv",
    goalVocab: "Învață {target} cuvinte de nivel {level}",
    goalMicroRule: "Învață regula: {title}",
    goalTense: "Stăpânește timpul: {title}",
    goalGrammarRef: "Studiază tema: {title}",
    goalCollection: "Învață colecția: {title}",
    goalIrregular: "Învață verbele: {title}",
    goalSpoken: "Învață expresii: {title}",
    goalExam: "Promovează testul de nivel {level}",
    upcomingLabel: 'Urmează în plan',
    startBtn: 'Începe',
    otherStepBtn: 'Alt pas',
    openMatrixBtn: 'Deschide matricea de cunoștințe',
    closeLabel: 'Închide',
    typeVocab: 'Vocabular',
    typeMicroRule: 'Micro-regulă',
    typeTense: 'Timp verbal',
    typeGrammarRef: 'Ghid gramatical',
    typeCollection: 'Colecție',
    typeIrregular: 'Verbe neregulate',
    typeSpoken: 'Engleză vorbită',
    typeExam: 'Test de nivel',
    vocabDesc: 'Acumulează cuvinte spre ținta de {target} ({current}/{target})',
    examDesc: 'Promovează testul complet pentru {level}',
    allDoneTitle: 'Întregul traseu până la C1 este gata!',
    allDoneDesc: 'Toate nivelurile și testele au fost promovate.',
  },
  ru: {
    title: "Умный курс",
    subtitle: 'Это умное продвижение по курсу (рекомендуется)',
    waveLabel: "Шаг {wave} из {total}",
    progressLabel: 'Уровень {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Цель",
    goalVocab: "Выучить {target} слов уровня {level}",
    goalMicroRule: "Изучить правило: {title}",
    goalTense: "Освоить время: {title}",
    goalGrammarRef: "Изучить тему: {title}",
    goalCollection: "Выучить подборку: {title}",
    goalIrregular: "Выучить глаголы: {title}",
    goalSpoken: "Изучить выражения: {title}",
    goalExam: "Сдать тест уровня {level}",
    upcomingLabel: 'Далее по плану',
    startBtn: 'Начать',
    otherStepBtn: 'Другой шаг',
    openMatrixBtn: 'Открыть матрицу знаний',
    closeLabel: 'Закрыть',
    typeVocab: 'Словарь',
    typeMicroRule: 'Микроправило',
    typeTense: 'Временная форма',
    typeGrammarRef: 'Справочник',
    typeCollection: 'Подборка',
    typeIrregular: 'Неправильные глаголы',
    typeSpoken: 'Живой английский',
    typeExam: 'Экзамен уровня',
    vocabDesc: 'Добрать слова к вехе {target} ({current}/{target})',
    examDesc: 'Сдать комплексный тест и закрыть {level}',
    allDoneTitle: 'Весь курс до C1 пройден!',
    allDoneDesc: 'Все уровни и комплексные тесты успешно сданы.',
  },
  sk: {
    title: "Inteligentný kurz",
    subtitle: 'Toto je inteligentný postup kurzom (odporúča sa)',
    waveLabel: "Krok {wave} z {total}",
    progressLabel: 'Úroveň {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Cieľ",
    goalVocab: "Naučiť sa {target} slov úrovne {level}",
    goalMicroRule: "Prejsť pravidlo: {title}",
    goalTense: "Zvládnuť čas: {title}",
    goalGrammarRef: "Preštudovať tému: {title}",
    goalCollection: "Naučiť sa kolekciu: {title}",
    goalIrregular: "Naučiť sa slovesá: {title}",
    goalSpoken: "Naučiť sa frázy: {title}",
    goalExam: "Zložiť test úrovne {level}",
    upcomingLabel: 'Ďalej v pláne',
    startBtn: 'Začať',
    otherStepBtn: 'Iný krok',
    openMatrixBtn: 'Otvoriť maticu znalostí',
    closeLabel: 'Zavrieť',
    typeVocab: 'Slovná zásoba',
    typeMicroRule: 'Mikropravidlo',
    typeTense: 'Časová konštrukcia',
    typeGrammarRef: 'Príručka',
    typeCollection: 'Kolekcia',
    typeIrregular: 'Nepravidelné slovesá',
    typeSpoken: 'Hovorená angličtina',
    typeExam: 'Test úrovne',
    vocabDesc: 'Doplňte slovíčka k cieľu {target} ({current}/{target})',
    examDesc: 'Zložte súhrnný test na potvrdenie {level}',
    allDoneTitle: 'Celá cesta až po C1 je hotová!',
    allDoneDesc: 'Všetky úrovne a testy sú splnené.',
  },
  sl: {
    title: "Pametni tečaj",
    subtitle: 'To je pametno napredovanje po tečaju (priporočeno)',
    waveLabel: "Korak {wave} od {total}",
    progressLabel: 'Raven {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Cilj",
    goalVocab: "Nauči se {target} besed ravni {level}",
    goalMicroRule: "Nauči se pravilo: {title}",
    goalTense: "Osvoji čas: {title}",
    goalGrammarRef: "Preuči temo: {title}",
    goalCollection: "Nauči se zbirko: {title}",
    goalIrregular: "Nauči se glagole: {title}",
    goalSpoken: "Nauči se izraze: {title}",
    goalExam: "Opravi izpit ravni {level}",
    upcomingLabel: 'Naprej po načrtu',
    startBtn: 'Začni',
    otherStepBtn: 'Drug korak',
    openMatrixBtn: 'Odpri matriko znanja',
    closeLabel: 'Zapri',
    typeVocab: 'Besedišče',
    typeMicroRule: 'Mikropravilo',
    typeTense: 'Časovna oblika',
    typeGrammarRef: 'Priročnik',
    typeCollection: 'Zbirka',
    typeIrregular: 'Nepravilni glagoli',
    typeSpoken: 'Pogovorna angleščina',
    typeExam: 'Izpit ravni',
    vocabDesc: 'Naučite se besed proti cilju {target} ({current}/{target})',
    examDesc: 'Opravite celostni izpit za potrditev {level}',
    allDoneTitle: 'Celotna pot do C1 je zaključena!',
    allDoneDesc: 'Vse ravni in izpiti so opravljeni.',
  },
  es: {
    title: "Curso inteligente",
    subtitle: 'Este es un avance inteligente por el curso (recomendado)',
    waveLabel: "Paso {wave} de {total}",
    progressLabel: 'Nivel {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Objetivo",
    goalVocab: "Aprender {target} palabras de nivel {level}",
    goalMicroRule: "Aprender regla: {title}",
    goalTense: "Dominar tiempo: {title}",
    goalGrammarRef: "Estudiar tema: {title}",
    goalCollection: "Aprender colección: {title}",
    goalIrregular: "Aprender verbos: {title}",
    goalSpoken: "Aprender expresiones: {title}",
    goalExam: "Aprobar el examen de nivel {level}",
    upcomingLabel: 'A continuación',
    startBtn: 'Empezar',
    otherStepBtn: 'Otro paso',
    openMatrixBtn: 'Abrir matriz de conocimiento',
    closeLabel: 'Cerrar',
    typeVocab: 'Vocabulario',
    typeMicroRule: 'Microrregla',
    typeTense: 'Tiempo verbal',
    typeGrammarRef: 'Guía gramatical',
    typeCollection: 'Colección',
    typeIrregular: 'Verbos irregulares',
    typeSpoken: 'Inglés hablado',
    typeExam: 'Examen de nivel',
    vocabDesc: 'Suma palabras hacia el objetivo de {target} ({current}/{target})',
    examDesc: 'Supera el examen global para completar {level}',
    allDoneTitle: '¡Ruta completa hasta C1 terminada!',
    allDoneDesc: 'Todos los niveles y exámenes están aprobados.',
  },
  'es-mx': {
    title: "Curso inteligente",
    subtitle: 'Este es un avance inteligente por el curso (recomendado)',
    waveLabel: "Paso {wave} de {total}",
    progressLabel: 'Nivel {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Meta",
    goalVocab: "Aprender {target} palabras de nivel {level}",
    goalMicroRule: "Aprender regla: {title}",
    goalTense: "Dominar tiempo: {title}",
    goalGrammarRef: "Estudiar tema: {title}",
    goalCollection: "Aprender colección: {title}",
    goalIrregular: "Aprender verbos: {title}",
    goalSpoken: "Aprender expresiones: {title}",
    goalExam: "Aprobar el examen de nivel {level}",
    upcomingLabel: 'Después en el plan',
    startBtn: 'Empezar',
    otherStepBtn: 'Otro paso',
    openMatrixBtn: 'Abrir matriz de conocimiento',
    closeLabel: 'Cerrar',
    typeVocab: 'Vocabulario',
    typeMicroRule: 'Microrregla',
    typeTense: 'Tiempo verbal',
    typeGrammarRef: 'Guía de gramática',
    typeCollection: 'Colección',
    typeIrregular: 'Verbos irregulares',
    typeSpoken: 'Inglés hablado',
    typeExam: 'Examen de nivel',
    vocabDesc: 'Aprende palabras rumbo a la meta de {target} ({current}/{target})',
    examDesc: 'Aprueba el examen completo para completar {level}',
    allDoneTitle: '¡Ruta completa hasta C1 terminada!',
    allDoneDesc: 'Todos los niveles y exámenes están aprobados.',
  },
  sv: {
    title: "Smart kurs",
    subtitle: 'Det här är smart progression genom kursen (rekommenderas)',
    waveLabel: "Steg {wave} av {total}",
    progressLabel: 'Nivå {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Mål",
    goalVocab: "Lär dig {target} ord på nivå {level}",
    goalMicroRule: "Lär dig regeln: {title}",
    goalTense: "Bemästra tempus: {title}",
    goalGrammarRef: "Studera temat: {title}",
    goalCollection: "Lär dig samlingen: {title}",
    goalIrregular: "Lär dig verben: {title}",
    goalSpoken: "Lär dig uttryck: {title}",
    goalExam: "Klara nivåprovet för {level}",
    upcomingLabel: 'Härnäst i planen',
    startBtn: 'Starta',
    otherStepBtn: 'Annat steg',
    openMatrixBtn: 'Öppna kunskapsmatris',
    closeLabel: 'Stäng',
    typeVocab: 'Ordförråd',
    typeMicroRule: 'Mikroregel',
    typeTense: 'Tempusform',
    typeGrammarRef: 'Grammatikguide',
    typeCollection: 'Ordsamling',
    typeIrregular: 'Oregelbundna verb',
    typeSpoken: 'Talad engelska',
    typeExam: 'Nivåprov',
    vocabDesc: 'Lär dig ord mot målet {target} ({current}/{target})',
    examDesc: 'Klara helhetsprovet för nivå {level}',
    allDoneTitle: 'Hela vägen upp till C1 klar!',
    allDoneDesc: 'Alla nivåer och prov är avklarade.',
  },
  th: {
    title: "คอร์สอัจฉริยะ",
    subtitle: 'นี่คือการเรียนรู้ตามลำดับขั้นอย่างชาญฉลาด (แนะนำ)',
    waveLabel: "ขั้นที่ {wave} / {total}",
    progressLabel: 'ระดับ {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "เป้าหมาย",
    goalVocab: "เรียนรู้คำศัพท์ระดับ {level} จำนวน {target} คำ",
    goalMicroRule: "เรียนรู้กฎ: {title}",
    goalTense: "ฝึกใช้กาล: {title}",
    goalGrammarRef: "ศึกษาหัวข้อ: {title}",
    goalCollection: "เรียนรู้ชุดคำศัพท์: {title}",
    goalIrregular: "เรียนรู้คำกริยา: {title}",
    goalSpoken: "เรียนรู้สำนวน: {title}",
    goalExam: "สอบผ่านระดับ {level}",
    upcomingLabel: 'ถัดไปในแผน',
    startBtn: 'เริ่มเลย',
    otherStepBtn: 'เปลี่ยนขั้นอื่น',
    openMatrixBtn: 'เปิดเมทริกซ์ความรู้',
    closeLabel: 'ปิด',
    typeVocab: 'คำศัพท์',
    typeMicroRule: 'กฎสั้น',
    typeTense: 'โครงสร้างกาล',
    typeGrammarRef: 'คู่มือไวยากรณ์',
    typeCollection: 'ชุดคำศัพท์',
    typeIrregular: 'กริยา 3 ช่อง',
    typeSpoken: 'ภาษาพูด',
    typeExam: 'ข้อสอบระดับ',
    vocabDesc: 'สะสมคำศัพท์สู่เป้าหมาย {target} คำ ({current}/{target})',
    examDesc: 'สอบผ่านข้อสอบรวมเพื่อจบระดับ {level}',
    allDoneTitle: 'ผ่านครบทั้งคอร์สถึงระดับ C1 แล้ว!',
    allDoneDesc: 'ผ่านทุกระดับและข้อสอบเรียบร้อยแล้ว',
  },
  tr: {
    title: "Akıllı kurs",
    subtitle: 'Bu, kursta akıllı ilerleme yoludur (önerilen)',
    waveLabel: "Adım {wave} / {total}",
    progressLabel: 'Seviye {level} · %{percent} ({closed}/{total})',
    nextStepLabel: "Hedef",
    goalVocab: "{level} seviyesinde {target} kelime öğren",
    goalMicroRule: "Kuralı öğren: {title}",
    goalTense: "Zamanı kavra: {title}",
    goalGrammarRef: "Konuyu incele: {title}",
    goalCollection: "Koleksiyonu öğren: {title}",
    goalIrregular: "Fiilleri öğren: {title}",
    goalSpoken: "İfadeleri öğren: {title}",
    goalExam: "{level} seviye testini geç",
    upcomingLabel: 'Plandaki sonrakiler',
    startBtn: 'Başla',
    otherStepBtn: 'Başka adım',
    openMatrixBtn: 'Bilgi Matrisini Aç',
    closeLabel: 'Kapat',
    typeVocab: 'Kelime dağarcığı',
    typeMicroRule: 'Mikro kural',
    typeTense: 'Zaman yapısı',
    typeGrammarRef: 'Dilbilgisi rehberi',
    typeCollection: 'Kelime seti',
    typeIrregular: 'Düzensiz fiiller',
    typeSpoken: 'Günlük İngilizce',
    typeExam: 'Seviye testi',
    vocabDesc: '{target} kelime hedefine doğru ilerle ({current}/{target})',
    examDesc: '{level} seviyesini tamamlamak için kapsamlı testi geç',
    allDoneTitle: 'C1’e kadar tüm rota tamamlandı!',
    allDoneDesc: 'Tüm seviyeler ve sınavlar geçildi.',
  },
  uk: {
    title: "Розумний курс",
    subtitle: 'Це розумне просування по курсу (рекомендується)',
    waveLabel: "Крок {wave} із {total}",
    progressLabel: 'Рівень {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Ціль",
    goalVocab: "Вивчити {target} слів рівня {level}",
    goalMicroRule: "Вивчити правило: {title}",
    goalTense: "Опанувати час: {title}",
    goalGrammarRef: "Вивчити тему: {title}",
    goalCollection: "Вивчити добірку: {title}",
    goalIrregular: "Вивчити дієслова: {title}",
    goalSpoken: "Вивчити вислови: {title}",
    goalExam: "Скласти тест рівня {level}",
    upcomingLabel: 'Далі за планом',
    startBtn: 'Почати',
    otherStepBtn: 'Інший крок',
    openMatrixBtn: 'Відкрити матрицю знань',
    closeLabel: 'Закрити',
    typeVocab: 'Словник',
    typeMicroRule: 'Мікроправило',
    typeTense: 'Часова форма',
    typeGrammarRef: 'Довідник',
    typeCollection: 'Добірка',
    typeIrregular: 'Неправильні дієслова',
    typeSpoken: 'Жива англійська',
    typeExam: 'Іспит рівня',
    vocabDesc: 'Добрати слова до мети {target} ({current}/{target})',
    examDesc: 'Скласти комплексний тест і закрити {level}',
    allDoneTitle: 'Увесь курс до C1 пройдено!',
    allDoneDesc: 'Усі рівні та іспити успішно складено.',
  },
  ur: {
    title: "سمارٹ کورس",
    subtitle: 'یہ کورس میں اسمارٹ پیش رفت ہے (تجویز کردہ)',
    waveLabel: "قدم {wave} / {total}",
    progressLabel: 'لیول {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "ہدف",
    goalVocab: "سطح {level} کے {target} الفاظ سیکھیں",
    goalMicroRule: "اصول سیکھیں: {title}",
    goalTense: "زمانہ سیکھیں: {title}",
    goalGrammarRef: "موضوع پڑھیں: {title}",
    goalCollection: "مجموعہ سیکھیں: {title}",
    goalIrregular: "افعال سیکھیں: {title}",
    goalSpoken: "جملے سیکھیں: {title}",
    goalExam: "سطح {level} کا امتحان پاس کریں",
    upcomingLabel: 'آئندہ مراحل',
    startBtn: 'شروع کریں',
    otherStepBtn: 'دوسرا قدم',
    openMatrixBtn: 'نالج میٹرکس کھولیں',
    closeLabel: 'بند کریں',
    typeVocab: 'ذخیرۂ الفاظ',
    typeMicroRule: 'مائیکرو اصول',
    typeTense: 'زمانے کی ساخت',
    typeGrammarRef: 'گرامر گائیڈ',
    typeCollection: 'الفاظ کا مجموعہ',
    typeIrregular: 'بے قاعدہ افعال',
    typeSpoken: 'بول چال کی انگریزی',
    typeExam: 'لیول امتحان',
    vocabDesc: '{target} الفاظ کے ہدف کی طرف بڑھیں ({current}/{target})',
    examDesc: '{level} مکمل کرنے کے لیے جامع ٹیسٹ پاس کریں',
    allDoneTitle: 'C1 تک پورا راستہ مکمل ہو گیا!',
    allDoneDesc: 'تمام لیولز اور امتحانات پاس ہو چکے ہیں۔',
  },
  vi: {
    title: "Khóa học thông minh",
    subtitle: 'Đây là lộ trình tiến bộ thông minh theo khóa học (khuyên dùng)',
    waveLabel: "Bước {wave} / {total}",
    progressLabel: 'Trình độ {level} · {percent}% ({closed}/{total})',
    nextStepLabel: "Mục tiêu",
    goalVocab: "Học {target} từ trình độ {level}",
    goalMicroRule: "Học quy tắc: {title}",
    goalTense: "Nắm vững thì: {title}",
    goalGrammarRef: "Học chủ đề: {title}",
    goalCollection: "Học bộ từ: {title}",
    goalIrregular: "Học động từ: {title}",
    goalSpoken: "Học cụm từ: {title}",
    goalExam: "Vượt qua bài kiểm tra {level}",
    upcomingLabel: 'Tiếp theo trong kế hoạch',
    startBtn: 'Bắt đầu',
    otherStepBtn: 'Bước khác',
    openMatrixBtn: 'Mở ma trận kiến thức',
    closeLabel: 'Đóng',
    typeVocab: 'Từ vựng',
    typeMicroRule: 'Quy tắc ngắn',
    typeTense: 'Cấu trúc thì',
    typeGrammarRef: 'Cẩm nang ngữ pháp',
    typeCollection: 'Bộ từ vựng',
    typeIrregular: 'Động từ bất quy tắc',
    typeSpoken: 'Tiếng Anh giao tiếp',
    typeExam: 'Bài thi trình độ',
    vocabDesc: 'Học thêm từ hướng tới mốc {target} ({current}/{target})',
    examDesc: 'Vượt qua bài thi tổng hợp để hoàn thành {level}',
    allDoneTitle: 'Đã hoàn thành trọn vẹn đến C1!',
    allDoneDesc: 'Tất cả trình độ và bài thi đã vượt qua.',
  },
};

export function getSmartPathStrings(lang = 'ru') {
  const norm = String(lang || 'ru').toLowerCase().trim();
  const base = norm.split('-')[0];
  return SMART_PATH_I18N[norm] || SMART_PATH_I18N[base] || SMART_PATH_I18N.en;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatStepTypeLabel(stepType, s) {
  switch (stepType) {
    case 'vocab': return s.typeVocab;
    case 'micro_rule': return s.typeMicroRule;
    case 'tense': return s.typeTense;
    case 'grammar_ref': return s.typeGrammarRef;
    case 'collection': return s.typeCollection;
    case 'irregular': return s.typeIrregular;
    case 'spoken': return s.typeSpoken;
    case 'exam': return s.typeExam;
    default: return s.typeCollection;
  }
}

function formatStepGoalTitle(step, plan, s) {
  if (!step) return '';
  const targetStr = String(step.targetWords || 20);
  const titleStr = String(step.title || '');
  switch (step.stepType) {
    case 'vocab':
      return String(s.goalVocab || 'Learn {target} {level} words')
        .replaceAll('{target}', targetStr)
        .replaceAll('{level}', plan.levelId);
    case 'micro_rule':
      return String(s.goalMicroRule || 'Learn rule: {title}').replaceAll('{title}', titleStr);
    case 'tense':
      return String(s.goalTense || 'Master tense: {title}').replaceAll('{title}', titleStr);
    case 'grammar_ref':
      return String(s.goalGrammarRef || 'Study topic: {title}').replaceAll('{title}', titleStr);
    case 'collection':
      return String(s.goalCollection || 'Learn collection: {title}').replaceAll('{title}', titleStr);
    case 'irregular':
      return String(s.goalIrregular || 'Learn verbs: {title}').replaceAll('{title}', titleStr);
    case 'spoken':
      return String(s.goalSpoken || 'Learn phrases: {title}').replaceAll('{title}', titleStr);
    case 'exam':
      return String(s.goalExam || 'Pass the {level} level test').replaceAll('{level}', plan.levelId);
    default:
      return titleStr;
  }
}

export function showSmartPathModal(allWords = [], callbacks = {}) {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('smart-path-modal-overlay');
  if (existing) existing.remove();

  const rawLang = (getInterfaceLanguage() || 'ru').toLowerCase();
  const baseLang = rawLang.split('-')[0];
  const isRtl = RTL_LOCALES.has(baseLang);
  const s = getSmartPathStrings(rawLang);

  let skipOffset = 0;

  const overlay = document.createElement('div');
  overlay.id = 'smart-path-modal-overlay';
  overlay.className = 'smart-path-overlay';

  const close = () => {
    overlay.remove();
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', onKeyDown);
    }
  };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  function renderModal() {
    const plan = buildSmartPathPlan(allWords, rawLang, { skipOffset });
    const step = plan.currentStep;

    const progressText = String(s.progressLabel || '')
      .replace(/\s*\(\{closed\}\/\{total\}\)/g, '')
      .replace('{level}', plan.levelId)
      .replace('{percent}', String(plan.readinessPercent));

    const catProg = plan.categoryProgress || { vocab: 0, microRules: 0, collections: 0, tenses: 0 };

    const waveText = String(s.waveLabel || '')
      .replace('{wave}', String(plan.currentStepNumber || 1))
      .replace('{total}', String(plan.totalSteps || plan.totalWaves));

    const upcomingHtml = (plan.upcomingSteps || []).map((up) => `
      <div class="smart-path-up-row">
        <span class="smart-path-up-icon">${escapeHtml(up.icon || '•')}</span>
        <span class="smart-path-up-type">${escapeHtml(formatStepTypeLabel(up.stepType, s))}</span>
        <span class="smart-path-up-title">${escapeHtml(up.title)}</span>
        ${up.requiresAdUnlock ? '<span class="smart-path-up-ad" aria-hidden="true">🎬</span>' : ''}
      </div>
    `).join('');

    overlay.innerHTML = `
      <style>
        .smart-path-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          background: var(--bg-main, #f8fafc);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0;
          box-sizing: border-box;
        }
        body.dark-theme .smart-path-overlay,
        .dark-theme .smart-path-overlay,
        [data-theme="dark"] .smart-path-overlay {
          background: #0b1120;
        }
        .smart-path-card {
          width: 100%;
          max-width: 560px;
          height: 100%;
          background: var(--card-bg, #ffffff);
          color: var(--text-main, #0f172a);
          border: none;
          border-radius: 0;
          padding: calc(max(var(--safe-top, 0px), env(safe-area-inset-top, 0px)) + 16px) 16px calc(max(var(--safe-bottom, 0px), env(safe-area-inset-bottom, 0px)) + 20px);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        body.dark-theme .smart-path-card,
        .dark-theme .smart-path-card,
        [data-theme="dark"] .smart-path-card {
          background: #0f172a;
          color: #f8fafc;
        }
        .smart-path-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .smart-path-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .smart-path-head-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.14);
          border: 1px solid rgba(16, 185, 129, 0.34);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .smart-path-head-icon img,
        .smart-path-head-icon svg {
          width: 21px;
          height: 21px;
          object-fit: contain;
          display: block;
        }
        body.dark-theme .smart-path-head-icon img,
        .dark-theme .smart-path-head-icon img,
        [data-theme="dark"] .smart-path-head-icon img,
        body.dark-theme .smart-path-head-icon svg,
        .dark-theme .smart-path-head-icon svg,
        [data-theme="dark"] .smart-path-head-icon svg {
          filter: brightness(0) invert(0.88);
        }
        .smart-path-title {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.25;
        }
        .smart-path-sub {
          margin: 3px 0 0;
          font-size: 12.5px;
          color: var(--text-muted, #64748b);
          line-height: 1.35;
        }
        .smart-path-close {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid var(--border-color, rgba(148, 163, 184, 0.3));
          background: transparent;
          color: var(--text-muted, #64748b);
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .smart-path-progress-box {
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
          border-radius: 14px;
          padding: 11px 13px;
          margin-bottom: 12px;
          flex-shrink: 0;
        }
        .smart-path-progress-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .smart-path-wave-pill {
          color: #059669;
          background: rgba(16, 185, 129, 0.14);
          padding: 2px 9px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 800;
        }
        body.dark-theme .smart-path-wave-pill,
        .dark-theme .smart-path-wave-pill,
        [data-theme="dark"] .smart-path-wave-pill {
          color: #34d399;
        }
        .smart-path-track {
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.22);
          overflow: hidden;
        }
        .smart-path-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.25s ease;
        }
        .smart-path-bars-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 12px;
        }
        .smart-path-bar-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .smart-path-bar-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted, #64748b);
        }
        .smart-path-bar-name {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .smart-path-bar-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .smart-path-bar-pct {
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
          color: var(--text-main, #0f172a);
        }
        body.dark-theme .smart-path-bar-pct,
        .dark-theme .smart-path-bar-pct,
        [data-theme="dark"] .smart-path-bar-pct {
          color: #e2e8f0;
        }
        .smart-path-step-card {
          background: rgba(22, 163, 74, 0.08);
          border: 1.5px solid rgba(22, 163, 74, 0.36);
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 12px;
          flex-shrink: 0;
        }
        body.dark-theme .smart-path-step-card,
        .dark-theme .smart-path-step-card,
        [data-theme="dark"] .smart-path-step-card {
          background: rgba(56, 189, 248, 0.1);
          border-color: rgba(56, 189, 248, 0.38);
        }
        .smart-path-step-kicker {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 800;
          color: #15803d;
          margin-bottom: 6px;
        }
        body.dark-theme .smart-path-step-kicker,
        .dark-theme .smart-path-step-kicker,
        [data-theme="dark"] .smart-path-step-kicker {
          color: #38bdf8;
        }
        .smart-path-step-main {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .smart-path-step-emoji {
          font-size: 24px;
          line-height: 1.1;
          flex-shrink: 0;
        }
        .smart-path-step-title {
          font-size: 15.5px;
          font-weight: 800;
          line-height: 1.3;
          margin: 0;
        }
        .smart-path-step-desc {
          font-size: 12.5px;
          color: var(--text-muted, #64748b);
          margin: 4px 0 0;
          line-height: 1.35;
        }
        .smart-path-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .smart-path-primary {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(22, 163, 74, 0.32);
        }
        .smart-path-upcoming {
          border-top: 1px dashed var(--border-color, rgba(148, 163, 184, 0.25));
          padding-top: 12px;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .smart-path-up-label {
          font-size: 12px;
          font-weight: 800;
          color: var(--text-muted, #64748b);
          margin-bottom: 8px;
          flex-shrink: 0;
        }
        .smart-path-up-list {
          flex: 1;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding-right: 2px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .smart-path-up-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          padding: 7px 10px;
          border-radius: 10px;
          background: rgba(148, 163, 184, 0.08);
          border: 1px solid rgba(148, 163, 184, 0.12);
        }
        .smart-path-up-icon {
          font-size: 14px;
          flex-shrink: 0;
        }
        .smart-path-up-type {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-muted, #64748b);
          background: rgba(148, 163, 184, 0.16);
          padding: 2px 7px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .smart-path-up-title {
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }
        .smart-path-up-ad {
          font-size: 12px;
          opacity: 0.78;
          flex-shrink: 0;
        }
      </style>
      <div class="smart-path-card" dir="${isRtl ? 'rtl' : 'ltr'}" role="dialog" aria-modal="true" aria-label="${escapeHtml(s.title)}">
        <div class="smart-path-head">
          <div class="smart-path-title-wrap">
            <span class="smart-path-head-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C12.7 7.2 14.8 9.3 20 10C14.8 10.7 12.7 12.8 12 18C11.3 12.8 9.2 10.7 4 10C9.2 9.3 11.3 7.2 12 2Z" fill="#1e293b"/><path d="M19 15C19.35 17.1 20.2 17.95 22.3 18.3C20.2 18.65 19.35 19.5 19 21.6C18.65 19.5 17.8 18.65 15.7 18.3C17.8 17.95 18.65 17.1 19 15Z" fill="#1e293b"/></svg></span>
            <h3 class="smart-path-title">${escapeHtml(s.title)}</h3>
          </div>
          <button type="button" class="smart-path-close" id="smart-path-close-btn" aria-label="${escapeHtml(s.closeLabel)}">✕</button>
        </div>

        <div class="smart-path-progress-box">
          <div class="smart-path-progress-row">
            <span>${escapeHtml(progressText)}</span>
            <span class="smart-path-wave-pill">${escapeHtml(waveText)}</span>
          </div>
          <div class="smart-path-bars-grid">
            <div class="smart-path-bar-item">
              <div class="smart-path-bar-meta">
                <span class="smart-path-bar-name"><span class="smart-path-bar-dot" style="background:#22c55e;"></span>${escapeHtml(s.typeVocab)}</span>
                <span class="smart-path-bar-pct">${catProg.vocab}%</span>
              </div>
              <div class="smart-path-track">
                <div class="smart-path-fill" style="width:${catProg.vocab}%;background:linear-gradient(90deg,#16a34a,#22c55e);"></div>
              </div>
            </div>
            <div class="smart-path-bar-item">
              <div class="smart-path-bar-meta">
                <span class="smart-path-bar-name"><span class="smart-path-bar-dot" style="background:#38bdf8;"></span>${escapeHtml(s.typeMicroRule)}</span>
                <span class="smart-path-bar-pct">${catProg.microRules}%</span>
              </div>
              <div class="smart-path-track">
                <div class="smart-path-fill" style="width:${catProg.microRules}%;background:linear-gradient(90deg,#0284c7,#38bdf8);"></div>
              </div>
            </div>
            <div class="smart-path-bar-item">
              <div class="smart-path-bar-meta">
                <span class="smart-path-bar-name"><span class="smart-path-bar-dot" style="background:#a855f7;"></span>${escapeHtml(s.typeCollection)}</span>
                <span class="smart-path-bar-pct">${catProg.collections}%</span>
              </div>
              <div class="smart-path-track">
                <div class="smart-path-fill" style="width:${catProg.collections}%;background:linear-gradient(90deg,#7c3aed,#a855f7);"></div>
              </div>
            </div>
            <div class="smart-path-bar-item">
              <div class="smart-path-bar-meta">
                <span class="smart-path-bar-name"><span class="smart-path-bar-dot" style="background:#f59e0b;"></span>${escapeHtml(s.typeTense)}</span>
                <span class="smart-path-bar-pct">${catProg.tenses}%</span>
              </div>
              <div class="smart-path-track">
                <div class="smart-path-fill" style="width:${catProg.tenses}%;background:linear-gradient(90deg,#d97706,#f59e0b);"></div>
              </div>
            </div>
          </div>
        </div>

        ${step ? `
          <div class="smart-path-step-card">
            <div class="smart-path-step-kicker">
              <span>${escapeHtml(s.nextStepLabel)}</span>
              <span>${escapeHtml(formatStepTypeLabel(step.stepType, s))}</span>
            </div>
            <div class="smart-path-step-main" style="align-items: center;">
              <span class="smart-path-step-emoji">${escapeHtml(step.icon || '🧭')}</span>
              <div>
                <h4 class="smart-path-step-title">${escapeHtml(formatStepGoalTitle(step, plan, s))}</h4>
              </div>
            </div>
          </div>

          <div class="smart-path-actions">
            <button type="button" class="smart-path-primary" id="smart-path-start-btn">${step.requiresAdUnlock ? '🎬 ' : ''}${escapeHtml(s.startBtn)}</button>
          </div>
        ` : `
          <div class="smart-path-step-card">
            <h4 class="smart-path-step-title">🏆 ${escapeHtml(s.allDoneTitle)}</h4>
            <p class="smart-path-step-desc">${escapeHtml(s.allDoneDesc)}</p>
          </div>
        `}

        ${upcomingHtml ? `
          <div class="smart-path-upcoming">
            <div class="smart-path-up-label">${escapeHtml(s.upcomingLabel)}</div>
            <div class="smart-path-up-list">
              ${upcomingHtml}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    overlay.querySelector('#smart-path-close-btn')?.addEventListener('click', close);

    overlay.querySelector('#smart-path-start-btn')?.addEventListener('click', async (ev) => {
      if (!step || !step.linkTarget) return;
      const startBtn = ev.currentTarget;

      if (step.requiresAdUnlock) {
        if (startBtn.disabled) return;
        const origHtml = startBtn.innerHTML;
        startBtn.disabled = true;
        startBtn.textContent = `⏳ ${t('ad_loading') || '...'}`;
        try {
          // High-eCPM Rewarded Video Ad (REWARDED_PACKS) to unlock the next locked step
          const adRes = await AdService.showLanguagePackRewardedAd(step.title || step.id);
          if (!adRes || (!adRes.rewardEarned && !adRes.success)) {
            startBtn.disabled = false;
            startBtn.innerHTML = origHtml;
            return;
          }
          if (step.stepType === 'micro_rule' && step.ruleId) {
            try {
              const raw = localStorage.getItem('myduo_microrules_unlocked');
              const arr = raw ? JSON.parse(raw) : [];
              const set = new Set(Array.isArray(arr) ? arr.map(Number) : []);
              set.add(Number(step.ruleId));
              localStorage.setItem('myduo_microrules_unlocked', JSON.stringify([...set]));
            } catch (_) {}
          } else if (step.stepType === 'tense' && step.tenseId) {
            try {
              const raw = localStorage.getItem('myduo_tenses_unlocked');
              const arr = raw ? JSON.parse(raw) : [];
              const set = new Set(Array.isArray(arr) ? arr.map(String) : []);
              set.add(String(step.tenseId));
              localStorage.setItem('myduo_tenses_unlocked', JSON.stringify([...set]));
            } catch (_) {}
          }
          if (typeof window !== 'undefined' && window.trackEvent) {
            window.trackEvent('smart_path_ad_unlock', {
              level: plan.levelId,
              step_type: step.stepType,
              step_id: step.id,
            });
          }
        } catch (_) {
          startBtn.disabled = false;
          startBtn.innerHTML = origHtml;
          return;
        }
      }

      if (typeof window !== 'undefined' && window.trackEvent) {
        window.trackEvent('smart_path_start_step', {
          level: plan.levelId,
          step_type: step.stepType,
          wave: plan.currentWave,
        });
      }
      close();
      if (step.linkTarget.targetType === 'smart_vocab') {
        callbacks.onStartVocab?.(step.linkTarget.category);
      } else {
        callbacks.onNavigateLink?.(step.linkTarget);
      }
    });
  }

  document.body.appendChild(overlay);
  renderModal();
}
