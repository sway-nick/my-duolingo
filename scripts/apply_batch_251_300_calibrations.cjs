const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 255: aid
  {
    id: 255,
    translations: {
      ro: 'ajutor, ajuta',
      hu: 'segítség, segít'
    }
  },
  // ID 260: airport (fix ALL CAPS)
  {
    id: 260,
    translations: {
      cs: 'letiště',
      sk: 'letisko'
    }
  },
  // ID 267: tear (unify teardrop and to rip)
  {
    id: 267,
    translations: {
      de: 'zerreißen, Träne',
      fr: 'déchirer, larme',
      it: 'strappare, lacrima',
      pl: 'drzeć, łza',
      ro: 'rupe, lacrimă',
      cs: 'trhat, slza',
      hi: 'फाड़ना, आँसू',
      th: 'ฉีก, น้ำตา',
      ko: '찢다, 눈물',
      ja: '引き裂く、涙',
      kk: 'жырту, көз жасы'
    }
  },
  // ID 269: initial (fix museum original artifact mistranslation to initial/starting across 20 languages!)
  {
    id: 269,
    translations: {
      de: 'anfänglich, erst',
      fr: 'initial',
      it: 'iniziale',
      ro: 'inițial',
      bg: 'първоначален',
      cs: 'výchozí, počáteční',
      sk: 'východiskový, počiatočný',
      hu: 'kezdeti, kiinduló',
      el: 'αρχικός',
      sl: 'začeten',
      et: 'esialgne, algne',
      da: 'indledende, oprindelig',
      sv: 'ursprunglig, inledande',
      hr: 'početni, polazni',
      lv: 'sākotnējs',
      vi: 'ban đầu',
      th: 'แรกเริ่ม, ขั้นต้น',
      ko: '초기의, 최초의',
      ja: '初期の、最初の',
      kk: 'бастапқы'
    }
  },
  // ID 271: guide (fix corporate management board mistranslation across 12 languages!)
  {
    id: 271,
    translations: {
      de: 'Leitfaden, Führer',
      fr: 'guide, manuel',
      it: 'guida, manuale',
      ro: 'ghid, îndrumar',
      bg: 'ръководство, гид',
      cs: 'průvodce, návod',
      sk: 'sprievodca, návod',
      hu: 'kalauz, útmutató',
      el: 'οδηγός, εγχειρίδιο',
      sl: 'vodnik, priročnik',
      et: 'giid, teejuht',
      lt: 'vadovas, gidas'
    }
  },
  // ID 277: escape (fix botanical plant shoot / potato sprout mistranslation across 9 languages!)
  {
    id: 277,
    translations: {
      da: 'undslippe, flugt',
      fi: 'paeta, pako',
      sv: 'fly, flykt',
      hr: 'pobjeći, bijeg',
      lv: 'aizbēgt, bēgšana',
      vi: 'trốn thoát, tẩu thoát',
      th: 'หลบหนี, การหลบหนี',
      ko: '탈출하다, 도망치다',
      ja: '逃げる、脱出する'
    }
  },
  // ID 280: sheet (unify bedsheet and paper sheet)
  {
    id: 280,
    translations: {
      de: 'Blatt, Laken',
      fr: 'feuille, drap',
      it: 'foglio, lenzuolo',
      cs: 'list, prostěradlo',
      bg: 'лист, чаршаф',
      el: 'φύλλο, σεντόνι',
      da: 'ark, lagen',
      fi: 'arkki, lakana',
      sv: 'ark, lakan',
      hr: 'list, plahta'
    }
  },
  // ID 282: fault (fix catastrophic drinking wine / Merlot / Chardonnay mistranslation across 10 languages!)
  {
    id: 282,
    translations: {
      da: 'fejl, skyld',
      fi: 'vika, syy',
      sv: 'fel, skuld',
      hr: 'krivica, greška',
      lv: 'vainīgs, vaina',
      vi: 'lỗi, sai sót',
      th: 'ความผิด, ข้อผิดพลาด',
      ko: '잘못, 과실',
      ja: '過失、責任、欠陥',
      kk: 'кінә, қателік'
    }
  },
  // ID 292: slip (fix presentation slide / playground slide mistranslation across 7 languages!)
  {
    id: 292,
    translations: {
      fi: 'liukastua, lipsahtaa',
      hr: 'skliznuti, okliznuti se',
      lv: 'paslīdēt, noslīdēt',
      th: 'ลื่นไถล, เลื่อน',
      ko: '미끄러지다',
      ja: '滑る、滑り落ちる',
      kk: 'тайып кету, сырғу'
    }
  },
  // ID 295: creation (fix divine biblical Genesis capitalization across 13 languages)
  {
    id: 295,
    translations: {
      es: 'creación',
      fr: 'création',
      it: 'creazione',
      tr: 'yaratılış, oluşturma',
      ro: 'creare',
      bg: 'създаване',
      cs: 'stvoření, vytvoření',
      sk: 'tvorba, vytvorenie',
      hu: 'teremtés, alkotás',
      el: 'δημιουργία',
      sl: 'ustvarjanje',
      et: 'loomine',
      lt: 'sukūrimas'
    }
  },
  // ID 296: typically
  {
    id: 296,
    translations: {
      it: 'tipicamente, generalmente'
    }
  },
  // ID 299: mass (fix physics error: weight vs mass across 9 languages!)
  {
    id: 299,
    translations: {
      fr: 'masse',
      it: 'massa',
      ro: 'masă',
      bg: 'маса',
      hu: 'tömeg, mise',
      el: 'μάζα',
      sl: 'masa',
      et: 'mass',
      lt: 'masė'
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

console.log(`Batch 251..300 calibration finished! Total translation fields patched: ${totalPatched}`);
