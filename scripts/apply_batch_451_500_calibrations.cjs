const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 451: shooting (dual shooting gun + film shoot across 9 languages)
  {
    id: 451,
    translation: 'стрельба, съёмка',
    translations: {
      uk: 'стрілянина, зйомка',
      fr: 'tir, tournage',
      it: 'tiro, ripresa',
      es: 'tiroteo, rodaje',
      de: 'Schießen, Dreharbeiten',
      cs: 'střelba, natáčení',
      sk: 'streľba, nakrúcanie',
      el: 'πυροβολισμός, γύρισμα',
      ko: '사격, 촬영'
    }
  },
  // ID 456: pure (fix "TO DO HOUSEWORK" in French and clean vs pure across 12 languages)
  {
    id: 456,
    translation: 'чистый, чистейший, беспримесный',
    translations: {
      uk: 'чистий, бездоганний, щирий',
      fr: 'pur, sans mélange, authentique',
      it: 'puro, schietto',
      es: 'puro, genuino',
      ar: 'نقي، خالص',
      ja: '純粋な、混じりけのない',
      ko: '순수한, 순전한',
      th: 'บริสุทธิ์, แท้',
      tr: 'saf, katıksız',
      vi: 'nguyên chất, thuần khiết',
      ro: 'pur, curat',
      kk: 'таза, мінсіз'
    }
  },
  // ID 459: fellow (fix "little boy" calque across 14 languages to companion/colleague/guy)
  {
    id: 459,
    translation: 'товарищ, коллега, парень',
    translations: {
      uk: 'товариш, колега, хлопець',
      fr: 'confrère, compagnon, type',
      es: 'compañero, colega, tipo',
      it: 'collega, compagno, tipo',
      de: 'Kollege, Gefährte, Kerl',
      cs: 'kolega, druh, chlapík',
      sk: 'kolega, druh, chlapík',
      pl: 'kolega, towarzysz, facet',
      hu: 'társ, kolléga, fickó',
      ro: 'coleg, tovarăș, semen',
      bg: 'колега, другар, тип',
      el: 'συνάδελφος, σύντροφος',
      et: 'kaaslane, kolleeg, mees',
      lt: 'kolega, bičiulis, vaikinas'
    }
  },
  // ID 460: install (fix imperative verbs to infinitives)
  {
    id: 460,
    translations: {
      da: 'installere',
      ro: 'a instala, instala',
      sl: 'namestiti, inštalirati'
    }
  },
  // ID 463: graduate (fix "Master's degree" and "postgraduate" calques across 12 languages)
  {
    id: 463,
    translation: 'выпускник, окончить обучение, окончить вуз',
    translations: {
      uk: 'випускник, закінчити виш',
      fr: 'diplômé, obtenir un diplôme',
      it: 'laureato, laurearsi',
      cs: 'absolvent, promovat',
      sk: 'absolvent, promovať',
      el: 'απόφοιτος, αποφοιτώ',
      bg: 'абсолвент, завършвам',
      sl: 'diplomant, diplomirati',
      da: 'kandidat, dimittere',
      sv: 'akademiker, ta examen',
      fi: 'valmistunut, valmistua',
      hu: 'végzős, diplomázik'
    }
  },
  // ID 464: sharp (fix catastrophic "SPICY FOOD / PIQUANT" calque across 21 languages!)
  {
    id: 464,
    translation: 'острый, резкий, точный',
    translations: {
      uk: 'гострий, різкий, чіткий',
      fr: 'tranchant, pointu, aiguisé',
      it: 'affilato, tagliente, acuto',
      es: 'afilado, agudo, cortante',
      cs: 'ostrý, nabroušený',
      sk: 'ostrý, nabrúsený',
      da: 'skarp, spids',
      sv: 'vass, skarp',
      fi: 'terävä, suippo',
      el: 'κοφτερός, αιχμηρός',
      ar: 'حاد، قاطع',
      ja: '鋭い、尖った',
      ko: '날카로운, 예리한',
      th: 'คม, แหลม',
      vi: 'sắc, nhọn',
      ro: 'ascuțit, tăios',
      hu: 'éles, hegyes',
      bg: 'остър, изострен',
      hr: 'oštar, šiljat',
      sl: 'oster, koničast',
      et: 'terav',
      lv: 'ass, smails',
      kk: 'өткір, үшкір'
    }
  },
  // ID 471: load (fix catastrophic "AIRPORT BAGGAGE / LUGGAGE" calque across 18 languages!)
  {
    id: 471,
    translation: 'груз, нагрузка, загружать',
    translations: {
      uk: 'вантаж, навантаження, завантажувати',
      fr: 'charge, chargement, charger',
      it: 'carico, caricare, carico di lavoro',
      cs: 'náklad, zátěž, nahrát',
      sk: 'náklad, záťaž, nahrať',
      da: 'last, byrde, indlæse',
      fi: 'kuorma, taakka, ladata',
      sv: 'last, börda, ladda',
      hu: 'rakomány, terhelés, betölt',
      el: 'φορτίο, φόρτωση, φορτώνω',
      ko: '짐, 부담, 적재하다',
      vi: 'gánh nặng, tải, chất hàng',
      ro: 'încărcătură, sarcină, a încărca',
      bg: 'товар, натоварване, зареждам',
      hr: 'teret, opterećenje, učitati',
      sl: 'tovor, obremenitev, naložiti',
      th: 'ภาระ, การบรรทุก, บรรจุ',
      tr: 'yük, yükleme, yüklemek'
    }
  },
  // ID 473: vegetable (noun first in ru/uk, fix duplicate plural in ro)
  {
    id: 473,
    translation: 'овощ, овощной',
    translations: {
      uk: 'овоч, овочевий',
      ro: 'legumă'
    }
  },
  // ID 474: silent (fix adverbs to adjectives in lt and sk)
  {
    id: 474,
    translations: {
      lt: 'tylus, begarsis',
      sk: 'tichý, mlčanlivý'
    }
  },
  // ID 476: girlfriend (romantic partner in ru/uk/ro)
  {
    id: 476,
    translation: 'девушка, подруга',
    translations: {
      uk: 'дівчина, кохана',
      ro: 'iubită, prietenă'
    }
  },
  // ID 477: surely (fix capitalization across 14 languages)
  {
    id: 477,
    translation: 'конечно, несомненно, уверенно',
    translations: {
      bg: 'разбира се, несъмнено',
      cs: 'jistě, určitě',
      de: 'sicherlich, gewiss',
      el: 'σίγουρα, ασφαλώς',
      et: 'kindlasti, muidugi',
      fr: 'certainement, sûrement',
      hu: 'biztosan, kétségtelenül',
      it: 'certamente, sicuramente',
      lt: 'žinoma, tikrai',
      pl: 'z pewnością, oczywiście',
      ro: 'cu siguranță, desigur',
      sk: 'určite, nepochybne',
      sl: 'seveda, zagotovo',
      tr: 'kesinlikle, elbette'
    }
  },
  // ID 480: immediate (fix moment/adverbs to proper adjectives)
  {
    id: 480,
    translations: {
      el: 'άμεσος',
      de: 'unmittelbar, sofortig',
      ja: '即時の、直接の',
      ko: '즉각적인, 직접적인',
      lt: 'neatidėliotinas, tiesioginis'
    }
  },
  // ID 485: advance (fix catastrophic "COMMERCIAL ADVERTISING" calque across 14 languages!)
  {
    id: 485,
    translation: 'продвигаться, наступление, аванс',
    translations: {
      uk: 'просуватися, наступ, аванс',
      fr: 'avancer, progrès, avance',
      it: 'avanzare, progresso, anticipo',
      fi: 'edetä, edistää, ennakko',
      lt: 'žengti į priekį, pažanga, avansas',
      lv: 'virzīties uz priekšu, progress, avanss',
      sk: 'postupovať, pokrok, záloha',
      sl: 'napredovati, napredek, predujem',
      hr: 'napredovati, napredak, predujam',
      hu: 'előrehalad, haladás, előleg',
      cs: 'postupovat, pokrok, záloha',
      ko: '나아가다, 진보, 선불',
      vi: 'tiến lên, tiến bộ, tiền tạm ứng',
      kk: 'алға жылжу, ілгерілеу, аванс',
      ar: 'يتقدم، تقدم، سلفة'
    }
  },
  // ID 489: contemporary (restore contemporary / modern across 14 languages)
  {
    id: 489,
    translation: 'современный, современник',
    translations: {
      uk: 'сучасний, сучасник',
      fr: 'contemporain, moderne',
      it: 'contemporaneo, moderno',
      es: 'contemporáneo, moderno',
      de: 'zeitgenössisch, zeitgemäß',
      cs: 'současný, moderní',
      sk: 'súčasný, moderný',
      pl: 'współczesny, nowoczesny',
      bg: 'съвременен, модерен',
      da: 'samtidig, nutidig',
      sv: 'samtida, nutida',
      fi: 'nykyajan, aikalainen',
      ja: '現代の、同時代の',
      ko: '현대의, 동시대의',
      ro: 'contemporan, modern',
      kk: 'қазіргі заманғы, замандас'
    }
  },
  // ID 490: rural (fix catastrophic "RUSTIC FURNITURE" calque across 15 languages!)
  {
    id: 490,
    translation: 'сельский, деревенский',
    translations: {
      uk: 'сільський, селянський',
      fr: 'rural, champêtre',
      es: 'rural, campesino',
      it: 'rurale, campestre',
      pt: 'rural, campestre',
      cs: 'venkovský, selský',
      sk: 'vidiecky, dedinský',
      da: 'landlig, landboforhold',
      sv: 'lantlig, landsbygd',
      ro: 'rural, sătesc',
      bg: 'селски, селскостопански',
      hr: 'ruralan, seoski',
      sl: 'podeželski, kmečki',
      ja: '田舎の、農村の',
      ko: '시골의, 지방의',
      vi: 'nông thôn'
    }
  },
  // ID 491: wage (fix catastrophic "PAYMENT FOR PIECEWORK" calque across 21 languages!)
  {
    id: 491,
    translation: 'заработная плата, ставка, вести войну',
    translations: {
      uk: 'заробітна плата, ставка, вести війну',
      fr: 'salaire, rémunération, mener',
      es: 'salario, sueldo, librar',
      it: 'salario, paga, intraprendere',
      de: 'Lohn, Gehalt, führen',
      cs: 'mzda, plat, vést válku',
      sk: 'mzda, plat, viesť vojnu',
      pl: 'płaca, wynagrodzenie, toczyć',
      pt: 'salário, remuneração, travar',
      ro: 'salariu, leafă, a purta',
      bg: 'заплата, възнаграждение, водя',
      hu: 'bér, fizetés, folytat',
      el: 'μισθός, ημερομίσθιο, διεξάγω',
      da: 'løn, gage, føre krig',
      fi: 'palkka, työpalkka, käydä',
      sv: 'lön, avlöning, föra krig',
      hr: 'nadnica, plaća, voditi',
      sl: 'plača, mezda, bojevati',
      et: 'palk, töötasu, pidama',
      lt: 'atlyginimas, alga, kariauti',
      lv: 'alga, darba samaksa, vest',
      tr: 'ücret, maaş, sürdürmek',
      ar: 'أجر، راتب، يشن حرباً',
      fa: 'دستمزد، حقوق، به راه انداختن',
      ur: 'اجرت، تنخواہ، شروع کرنا',
      hi: 'मजदूरी, वेतन, छेड़ना',
      bn: 'মজুরি, বেতন, পরিচালনা করা',
      id: 'upah, gaji, melancarkan',
      vi: 'tiền lương, tiền công, tiến hành',
      th: 'ค่าจ้าง, เงินเดือน, ก่อสงคราม',
      ja: '賃金、給料、行う',
      ko: '임금, 급여, 벌이다',
      zh: '工资、薪水、进行',
      kk: 'жалақы, еңбекақы, жүргізу'
    }
  },
  // ID 494: brief (fix Kazakh verb and Croatian noun)
  {
    id: 494,
    translations: {
      kk: 'қысқа, қысқаша',
      hr: 'kratak, sažet'
    }
  },
  // ID 495: reduction (fix French and Italian verbs to nouns)
  {
    id: 495,
    translation: 'снижение, сокращение, уменьшение',
    translations: {
      fr: 'réduction, baisse, diminution',
      it: 'riduzione, calo, diminuzione',
      es: 'reducción, disminución',
      fi: 'vähennys, alennus'
    }
  },
  // ID 497: assist (fix noun forms to verbs across 8 languages)
  {
    id: 497,
    translations: {
      cs: 'pomáhat, asistovat',
      sk: 'pomôcť, asistovať',
      bg: 'помагам, съдействам',
      hu: 'segít, közreműködik',
      it: 'assistere, aiutare',
      ro: 'a ajuta, a asista',
      pl: 'pomagać, asystować',
      kk: 'көмектесу, жәрдемдесу',
      ar: 'يساعد، يعاون'
    }
  }
];

let totalPatched = 0;

for (const filepath of FILES) {
  if (!fs.existsSync(filepath)) continue;
  const words = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const wordMap = new Map(words.map(w => [w.id, w]));

  for (const cal of calibrations) {
    const target = wordMap.get(cal.id);
    if (!target) continue;

    if (cal.translation) {
      target.translation = cal.translation;
      totalPatched++;
    }

    if (cal.translations) {
      if (!target.translations) target.translations = {};
      for (const [lang, val] of Object.entries(cal.translations)) {
        target.translations[lang] = val;
        totalPatched++;
      }
    }
  }

  fs.writeFileSync(filepath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Successfully calibrated ${filepath}`);
}

console.log(`Batch 451..500 calibration finished! Total translation fields patched: ${totalPatched}`);
