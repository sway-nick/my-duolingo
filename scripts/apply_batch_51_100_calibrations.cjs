const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 51: launch
  {
    id: 51,
    translations: {
      hu: 'indítás, kilövés',
      pt: 'lançamento, lançar',
      ro: 'lansare, lansa',
      cs: 'zahájení, spuštění'
    }
  },
  // ID 53: ring
  {
    id: 53,
    translations: {
      it: 'anello, suonare',
      cs: 'prsten, kroužek',
      sk: 'prsteň, zvoniť',
      sl: 'prstan, zvoniti',
      fr: 'bague, anneau',
      hi: 'अंगूठी, बजना'
    }
  },
  // ID 54: repeat
  {
    id: 54,
    translations: {
      bg: 'повтарям, повторение',
      da: 'gentage',
      fi: 'toistaa',
      sv: 'upprepa',
      hr: 'ponoviti',
      hu: 'megismétel, ismétel',
      ko: '반복하다'
    }
  },
  // ID 57: neck
  {
    id: 57,
    translations: {
      de: 'Hals, Nacken',
      hi: 'गर्दन',
      fi: 'kaula, niska'
    }
  },
  // ID 58: core
  {
    id: 58,
    translations: {
      ja: '中核、コア、中心',
      th: 'แกนกลาง, หัวใจสำคัญ',
      vi: 'cốt lõi, trọng tâm'
    }
  },
  // ID 61: complex (removing "difficult" mistranslation across languages)
  {
    id: 61,
    translations: {
      de: 'komplex, vielschichtig',
      fr: 'complexe',
      it: 'complesso',
      tr: 'karmaşık, kompleks',
      ro: 'complex',
      bg: 'сложен, комплексен',
      cs: 'komplexní, složitý',
      sk: 'komplexný, zložitý',
      hu: 'összetett, komplex',
      lt: 'sudėtingas, kompleksinis',
      sl: 'zapleten, kompleksen'
    }
  },
  // ID 65: extremely (removing "muscular/very strong" mistranslation across languages)
  {
    id: 65,
    translations: {
      da: 'ekstremt, yderst',
      fi: 'erittäin, äärimmäisen',
      sv: 'extremt, ytterst',
      hr: 'izuzetno, ekstremno',
      lv: 'ārkārtīgi, ārkārtēji',
      th: 'อย่างยิ่ง, สุดขีด',
      ko: '극히, 대단히',
      ja: '極めて、非常に',
      vi: 'vô cùng, cực kỳ',
      kk: 'өте, аса, төтенше'
    }
  },
  // ID 68: prefer
  {
    id: 68,
    translations: {
      it: 'preferire',
      lt: 'teikti pirmenybę',
      da: 'foretrække'
    }
  },
  // ID 69: except
  {
    id: 69,
    translations: {
      ja: '〜を除いて、以外'
    }
  },
  // ID 72: male
  {
    id: 72,
    translations: {
      cs: 'mužský, muž',
      hi: 'पुरुष, नर'
    }
  },
  // ID 74: danger (fix capitalization)
  {
    id: 74,
    translations: {
      it: 'pericolo',
      ro: 'pericol'
    }
  },
  // ID 76: capture
  {
    id: 76,
    translation: 'захватывать, поймать', // Russian root
    translations: {
      da: 'fange, erobre',
      fi: 'vangita, vallata',
      ro: 'a captura, a prinde',
      ar: 'أسر، التقاط، استيلاء'
    }
  },
  // ID 77: traffic (general traffic, not only "road vehicular traffic")
  {
    id: 77,
    translation: 'движение, трафик',
    translations: {
      de: 'Verkehr',
      fr: 'circulation, trafic',
      it: 'traffico',
      tr: 'trafik',
      pt: 'tráfego, trânsito',
      ro: 'trafic',
      bg: 'трафик, движение',
      cs: 'provoz, doprava',
      sk: 'premávka, doprava',
      hu: 'forgalom',
      el: 'κυκλοφορία, κίνηση',
      sl: 'promet',
      lt: 'eismas'
    }
  },
  // ID 78: plate (remove stove/oven/burner calques)
  {
    id: 78,
    translation: 'тарелка, пластина',
    translations: {
      uk: 'тарілка, пластина',
      de: 'Teller, Platte',
      es: 'plato, placa',
      it: 'piatto, piastra',
      tr: 'tabak, plaka',
      ro: 'farfurie, placă',
      bg: 'чиния, плоча',
      cs: 'talíř, deska',
      sk: 'tanier, doska',
      hu: 'tányér, lemez',
      el: 'πιάτο, πλάκα',
      sl: 'krožnik, plošča',
      et: 'taldrik, plaat',
      lt: 'lėkštė, plokštė',
      da: 'tallerken, plade',
      fi: 'lautanen, laatta',
      sv: 'tallrik, platta',
      hr: 'tanjur, ploča',
      lv: 'šķīvis, plāksne',
      hi: 'थाली, प्लेट',
      vi: 'đĩa, tấm',
      th: 'จาน, แผ่น',
      ko: '접시, 플레이트',
      ja: '皿、プレート',
      kk: 'тәрелке, пластина'
    }
  },
  // ID 80: select
  {
    id: 80,
    translations: {
      sl: 'izbrati',
      fi: 'valita'
    }
  },
  // ID 82: expensive (fix capitalization)
  {
    id: 82,
    translations: {
      pl: 'drogi',
      it: 'costoso',
      ro: 'scump',
      bg: 'скъп',
      cs: 'drahý',
      sk: 'drahý',
      hu: 'drága',
      el: 'ακριβός',
      sl: 'drag',
      et: 'kallis',
      lt: 'brangus'
    }
  },
  // ID 83: secret
  {
    id: 83,
    translations: {
      cs: 'tajemství, tajný',
      hu: 'titok, titkos',
      ja: '秘密'
    }
  },
  // ID 85: adopt
  {
    id: 85,
    translation: 'усыновлять, принимать',
    translations: {
      pl: 'adoptować, przyjąć',
      tr: 'benimsemek, evlat edinmek',
      cs: 'adoptovat, přijmout',
      hu: 'örökbe fogad, elfogad',
      fi: 'adoptoida, omaksua',
      lv: 'adoptēt, pieņemt',
      vi: 'nhận nuôi, áp dụng',
      th: 'รับเลี้ยง, นำมาใช้',
      ko: '입양하다, 채택하다',
      ja: '養子にする、採用する'
    }
  },
  // ID 88: circle
  {
    id: 88,
    translations: {
      ja: '円、丸、サークル',
      tr: 'çember, daire'
    }
  },
  // ID 90: solve (remove "the problem / задачу" suffix across 24 languages)
  {
    id: 90,
    translation: 'решать, разрешать',
    translations: {
      uk: 'вирішувати, розв\'язувати',
      de: 'lösen, auflösen',
      it: 'risolvere',
      ro: 'rezolva',
      bg: 'решавам',
      cs: 'vyřešit, řešit',
      sk: 'vyriešiť, riešiť',
      hu: 'megold, felold',
      el: 'λύνω, επιλύω',
      sl: 'rešiti, razrešiti',
      et: 'lahendama',
      lt: 'išspręsti',
      da: 'løse',
      fi: 'ratkaista',
      sv: 'lösa',
      hr: 'riješiti',
      lv: 'atrisināt, risināt',
      hi: 'हल करना, सुलझाना',
      ar: 'يحلّ',
      vi: 'giải quyết',
      ko: '해결하다, 풀다',
      ja: '解決する、解く',
      kk: 'шешу, шешім табу'
    }
  },
  // ID 91: busy (fix capitalization)
  {
    id: 91,
    translations: {
      it: 'occupato',
      tr: 'meşgul'
    }
  },
  // ID 93: requirement (fix "market demand" confusion)
  {
    id: 93,
    translations: {
      ja: '要件、必要条件',
      ko: '요구조건, 필요조건',
      da: 'krav, betingelse',
      sv: 'krav, villkor',
      hr: 'zahtjev, uvjet',
      lv: 'prasība, nosacījums'
    }
  },
  // ID 95: rain
  {
    id: 95,
    translations: {
      it: 'pioggia, piovere'
    }
  },
  // ID 97: disappear
  {
    id: 97,
    translations: {
      bg: 'изчезвам'
    }
  },
  // ID 100: exercise
  {
    id: 100,
    translations: {
      ja: '運動、エクササイズ、練習問題',
      ro: 'exercițiu'
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

console.log(`Batch 51..100 calibration finished! Total translation fields patched: ${totalPatched}`);
