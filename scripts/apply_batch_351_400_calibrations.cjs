const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 356: warning
  {
    id: 356,
    translations: {
      sk: 'varovanie, upozornenie'
    }
  },
  // ID 359: vast
  {
    id: 359,
    translations: {
      it: 'vasto, enorme'
    }
  },
  // ID 362: drag
  {
    id: 362,
    translations: {
      it: 'trascinare'
    }
  },
  // ID 365: display
  {
    id: 365,
    translations: {
      da: 'vise, display',
      sv: 'visa, display',
      hr: 'prikazati, zaslon',
      fi: 'näyttää, näyttö'
    }
  },
  // ID 370: agenda (fix plural machine translations across 12 languages)
  {
    id: 370,
    translations: {
      fr: 'ordre du jour, agenda',
      it: 'ordine del giorno, agenda',
      tr: 'gündem',
      ro: 'ordine de zi, agendă',
      bg: 'дневен ред',
      cs: 'program jednání, agenda',
      sk: 'program rokovania, agenda',
      hu: 'napirend',
      el: 'ημερήσια διάταξη',
      sl: 'dnevni red',
      et: 'päevakord',
      lt: 'darbotvarkė'
    }
  },
  // ID 381: tank (restore military combat tank across 17 languages!)
  {
    id: 381,
    translations: {
      fr: 'char, réservoir',
      it: 'carro armato, serbatoio',
      pl: 'czołg, zbiornik',
      ro: 'tanc, rezervor',
      bg: 'танк, резервоар',
      cs: 'tank, nádrž',
      sk: 'tank, nádrž',
      hu: 'tank, tartály',
      el: 'άρμα μάχης, δεξαμενή',
      sl: 'tank, rezervoar',
      lt: 'tankas, bakas',
      fi: 'panssarivaunu, säiliö',
      hr: 'tenk, spremnik',
      lv: 'tanks, tvertne',
      ar: 'دبابة، خزان',
      vi: 'xe tăng, bể chứa',
      kk: 'танк, резервуар'
    }
  },
  // ID 387: perfectly (fix adjective "perfect" to adverb across 18 languages!)
  {
    id: 387,
    translations: {
      fr: 'parfaitement',
      it: 'perfettamente',
      bg: 'перфектно, идеално',
      cs: 'dokonale, perfektně',
      sk: 'dokonale, perfektne',
      hu: 'tökéletesen',
      el: 'τέλεια',
      sl: 'popolnoma',
      et: 'täiuslikult',
      lt: 'tobulai',
      da: 'perfekt, ideelt',
      fi: 'täydellisesti',
      sv: 'perfekt',
      lv: 'ideāli, perfekti',
      vi: 'hoàn hảo',
      ko: '완벽하게',
      ja: '完璧に、完全に'
    }
  },
  // ID 390: disagree (fix 1st person sentences with capitalization to clean infinitive verbs)
  {
    id: 390,
    translation: 'не соглашаться, расходиться во взглядах',
    translations: {
      fr: 'être en désaccord',
      it: 'dissentire, non essere d\'accordo',
      ro: 'a nu fi de acord, a dezaproba',
      bg: 'не съм съгласен, оспорвам',
      cs: 'nesouhlasit',
      sk: 'nesúhlasiť',
      hu: 'nem ért egyet, vitatkozik',
      el: 'διαφωνώ',
      sl: 'ne strinjati se',
      et: 'mitte nõustuma',
      lt: 'nesutikti',
      lv: 'nepiekrist',
      ko: '동의하지 않다'
    }
  },
  // ID 392: regard
  {
    id: 392,
    translations: {
      it: 'considerare, rispetto',
      ro: 'considera, privință',
      cs: 'považovat, zřetel',
      hu: 'tekintet, figyelmesség'
    }
  },
  // ID 395: waste (unify verb to waste/squander with noun waste/refuse across 20 languages!)
  {
    id: 395,
    translations: {
      fr: 'gaspiller, déchets',
      ro: 'risipi, deşeuri',
      bg: 'пилея, отпадъци',
      cs: 'plýtvat, odpad',
      sk: 'plytvať, odpad',
      hu: 'pazarol, hulladék',
      el: 'σπαταλώ, απόβλητα',
      sl: 'zapravljati, odpadki',
      et: 'raiskama, jäätmed',
      lt: 'švaistyti, atliekos',
      da: 'spilde, affald',
      fi: 'tuhlata, jäte',
      sv: 'slösa, avfall',
      hr: 'rasipati, otpad',
      lv: 'šķērdēt, atkritumi',
      vi: 'lãng phí, chất thải',
      th: 'สิ้นเปลือง, ขยะ',
      ko: '낭비하다, 폐기물',
      ja: '浪費する、廃棄物',
      kk: 'ысырап ету, қалдықтар'
    }
  },
  // ID 398: wrap (fix catastrophic building collapse / financial ruin mistranslation across 19 languages!)
  {
    id: 398,
    translations: {
      fr: 'emballer, envelopper',
      it: 'avvolgere, incartare',
      ro: 'a împacheta, a înveli',
      bg: 'опаковам, увивам',
      cs: 'zabalit, obalit',
      sk: 'zabaliť, obaliť',
      hu: 'becsomagol, befed',
      el: 'τυλίγω',
      tr: 'sarmak, paketlemek',
      da: 'pakke ind, vikle',
      fi: 'kääriä, paketoida',
      sv: 'slå in, linda',
      hr: 'zamotati, omotati',
      lv: 'ietīt, iesaiņot',
      ar: 'يلفّ، يغلّف',
      vi: 'gói, bọc',
      th: 'ห่อ, พัน',
      ko: '싸다, 포장하다',
      ja: '包む、包装する',
      kk: 'орау, орап қою'
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

console.log(`Batch 351..400 calibration finished! Total translation fields patched: ${totalPatched}`);
