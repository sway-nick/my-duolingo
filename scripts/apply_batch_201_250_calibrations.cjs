const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 204: weak
  {
    id: 204,
    translations: {
      it: 'debole'
    }
  },
  // ID 206: root
  {
    id: 206,
    translations: {
      cs: 'kořen'
    }
  },
  // ID 208: climb (add verb forms)
  {
    id: 208,
    translations: {
      de: 'klettern, besteigen',
      it: 'arrampicarsi, scalare',
      ro: 'urca, cățăra',
      bg: 'катеря се, изкачвам се',
      hu: 'mászik',
      el: 'σκαρφαλώνω, αναρριχώμαι',
      sl: 'plezati, vzpenjati se'
    }
  },
  // ID 213: surgery (fix catastrophic machine translation to machine operations / factory plant across 10 langs!)
  {
    id: 213,
    translation: 'хирургия, операция',
    translations: {
      de: 'Chirurgie, Operation',
      fr: 'chirurgie, opération',
      it: 'chirurgia, operazione',
      es: 'cirugía, operación',
      ro: 'chirurgie, operație',
      el: 'χειρουργική, εγχείρηση',
      hu: 'sebészet, műtét',
      vi: 'phẫu thuật',
      ja: '手術、外科'
    }
  },
  // ID 222: necessarily (fix capitalization across 13 languages)
  {
    id: 222,
    translations: {
      de: 'unbedingt',
      fr: 'nécessairement',
      it: 'necessariamente',
      tr: 'zorunlu olarak',
      ro: 'în mod necesar',
      bg: 'задължително',
      cs: 'nutně',
      sk: 'nevyhnutne',
      hu: 'szükségszerűen',
      el: 'αναγκαίως',
      sl: 'nujno',
      et: 'tingimata',
      lt: 'būtinai'
    }
  },
  // ID 224: accuse (fix noun "fault/guilt" to verb)
  {
    id: 224,
    translations: {
      fr: 'accuser',
      it: 'accusare',
      ro: 'acuza',
      el: 'κατηγορώ',
      sl: 'obtožiti',
      hu: 'vádol, hibáztat'
    }
  },
  // ID 225: knock (fix imperative "hit!" and nouns to clean verb)
  {
    id: 225,
    translations: {
      tr: 'kapıyı çalmak, vurmak',
      fr: 'frapper, toquer',
      ro: 'bate, ciocăni',
      cs: 'klepat',
      hu: 'kopog, kopogtat',
      el: 'χτυπώ',
      sl: 'trkati'
    }
  },
  // ID 229: fat (fix pork fat / lard calques to neutral fat / plump)
  {
    id: 229,
    translation: 'жирный, жир',
    translations: {
      cs: 'tlustý, mastný, tuk',
      sk: 'tučný, tuk',
      hu: 'kövér, zsíros, zsír',
      ro: 'gras, grăsime',
      bg: 'дебел, мазен, мазнина',
      el: 'παχύς, λίπος',
      sl: 'debel, masten, maščoba',
      et: 'paks, rasvane, rasv',
      da: 'fed, fedtstof',
      sv: 'fet, fett',
      kk: 'семіз, майлы, май'
    }
  },
  // ID 238: cite (fix noun "quotation" to verb "to cite" across 19 languages!)
  {
    id: 238,
    translations: {
      de: 'zitieren',
      fr: 'citer',
      it: 'citare',
      ro: 'cita',
      bg: 'цитирам',
      sk: 'citovať',
      hu: 'idéz',
      sl: 'citirati',
      et: 'tsiteerima',
      lt: 'cituoti',
      da: 'citere',
      sv: 'citera',
      hr: 'citirati',
      lv: 'citēt',
      fi: 'lainata, viitata',
      th: 'อ้างอิง',
      ko: '인용하다',
      ja: '引用する',
      kk: 'дәйексөз келтіру'
    }
  },
  // ID 240: speaker (clean audio loudspeaker vs human orator)
  {
    id: 240,
    translations: {
      de: 'Redner, Lautsprecher',
      it: 'oratore, altoparlante',
      cs: 'řečník, reproduktor',
      hu: 'szónok, hangszóró',
      ja: '演者、スピーカー'
    }
  },
  // ID 241: breast (fix burial coffin / wooden storage chest mistranslation across Finnish, Latvian, Kazakh!)
  {
    id: 241,
    translations: {
      fi: 'rinta',
      lv: 'krūts',
      kk: 'кеуде, омырау'
    }
  },
  // ID 243: leaf (remove phrase "of a plant" / "у растения" across 26 languages!)
  {
    id: 243,
    translation: 'лист',
    translations: {
      uk: 'листок, лист',
      de: 'Blatt',
      fr: 'feuille',
      pl: 'liść',
      it: 'foglia',
      tr: 'yaprak',
      pt: 'folha',
      ro: 'frunză',
      bg: 'листо',
      cs: 'list',
      sk: 'list',
      hu: 'levél',
      el: 'φύλλο',
      sl: 'list',
      et: 'leht',
      lt: 'lapas',
      da: 'blad',
      fi: 'lehti',
      sv: 'blad',
      hr: 'list',
      lv: 'lapa',
      hi: 'पत्ता',
      ar: 'ورقة، ورقة شجر',
      id: 'daun',
      ko: '나뭇잎, 잎',
      ja: '葉、葉っぱ',
      kk: 'жапырақ'
    }
  },
  // ID 246: doubt (add verb forms)
  {
    id: 246,
    translations: {
      fr: 'douter, doute',
      it: 'dubitare, dubbio',
      pl: 'wątpić, wątpliwość',
      ro: 'a se îndoi, îndoială',
      bg: 'съмнявам се, съмнение',
      sk: 'pochybovať, pochybnosť',
      hu: 'kételkedik, kétség',
      el: 'αμφιβάλλω, αμφιβολία',
      sl: 'dvomiti, dvom',
      et: 'kahtlema, kahtlus',
      da: 'tvivle, tvivl',
      fi: 'epäillä, epäilys',
      sv: 'tvivla, tvivel',
      hr: 'sumnjati, sumnja',
      ko: '의심하다, 의심'
    }
  },
  // ID 247: pursue (fix noun "hunting / police chase" to verb across 12 languages!)
  {
    id: 247,
    translations: {
      de: 'verfolgen, anstreben',
      fr: 'poursuivre',
      it: 'perseguire, dare la caccia',
      bg: 'преследвам',
      ro: 'urmări',
      sk: 'prenasledovať, usilovať sa',
      hu: 'üldöz, törekszik',
      el: 'επιδιώκω, καταδιώκω',
      sl: 'zasledovati, prizadevati si',
      et: 'jälitama, püüdlema',
      lt: 'siekti, persekioti',
      fi: 'tavoitella, jahdata'
    }
  },
  // ID 248: overall (fix military general army commander mistranslation across Czech, Lithuanian, Korean!)
  {
    id: 248,
    translations: {
      cs: 'celkový, obecný',
      lt: 'bendras, apskritai',
      ko: '전반적인, 전반적으로',
      sl: 'splošen',
      hr: 'opći, cjelokupni',
      bg: 'общ, цялостен',
      vi: 'toàn bộ, tổng thể'
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

console.log(`Batch 201..250 calibration finished! Total translation fields patched: ${totalPatched}`);
