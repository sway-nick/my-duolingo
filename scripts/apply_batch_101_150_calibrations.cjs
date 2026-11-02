const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 103: unfortunately (fix capitalization)
  {
    id: 103,
    translations: {
      fr: 'malheureusement',
      pl: 'niestety',
      it: 'purtroppo',
      tr: 'maalesef',
      ro: 'din păcate',
      bg: 'за съжаление',
      cs: 'bohužel',
      sk: 'bohužiaľ',
      hu: 'sajnos',
      el: 'δυστυχώς',
      sl: 'na žalost',
      et: 'kahjuks',
      lt: 'deja'
    }
  },
  // ID 105: united (fix "combined" mistranslation across languages)
  {
    id: 105,
    translations: {
      fr: 'uni',
      it: 'unito',
      ro: 'unit',
      bg: 'обединен',
      cs: 'sjednocený, spojený',
      sk: 'zjednotený, spojený',
      hu: 'egyesült',
      el: 'ενωμένος',
      et: 'ühendatud',
      sl: 'združen'
    }
  },
  // ID 106: pool (fix "common apartment room/zone" error in European langs + missing swimming pool in Korean)
  {
    id: 106,
    translations: {
      fr: 'piscine, fonds commun',
      it: 'piscina, fondo comune',
      ro: 'piscină, fond comun',
      bg: 'плувен басейн, общ фонд',
      cs: 'bazén, společný fond',
      sk: 'bazén, spoločný fond',
      hu: 'úszómedence, közös alap',
      el: 'πισίνα, κοινό ταμείο',
      sl: 'bazen, skupni sklad',
      et: 'bassein, ühisfond',
      lt: 'baseinas, bendras fondas',
      ko: '수영장, 공동 기금'
    }
  },
  // ID 108: empty
  {
    id: 108,
    translations: {
      el: 'άδειος'
    }
  },
  // ID 111: pocket
  {
    id: 111,
    translations: {
      lt: 'kišenė'
    }
  },
  // ID 119: tall
  {
    id: 119,
    translations: {
      ro: 'înalt',
      bg: 'висок',
      el: 'ψηλός',
      sl: 'visok',
      hr: 'visok'
    }
  },
  // ID 122: universe (fix capitalization across 13 languages)
  {
    id: 122,
    translations: {
      fr: 'univers',
      pl: 'wszechświat',
      it: 'universo',
      tr: 'evren',
      ro: 'univers',
      bg: 'вселена',
      cs: 'vesmír',
      sk: 'vesmír',
      hu: 'világegyetem',
      el: 'σύμπαν',
      sl: 'vesolje',
      et: 'universum',
      lt: 'visata'
    }
  },
  // ID 123: acknowledge
  {
    id: 123,
    translations: {
      bg: 'признавам, потвърждавам',
      el: 'αναγνωρίζω, παραδέχομαι',
      ro: 'recunoaște',
      hu: 'elismer, tudomásul vesz'
    }
  },
  // ID 125: locate
  {
    id: 125,
    translations: {
      it: 'localizzare, trovare',
      hu: 'megtalál, felkutat',
      el: 'εντοπίζω, βρίσκω',
      zh: '定位、找到'
    }
  },
  // ID 126: balance
  {
    id: 126,
    translations: {
      it: 'equilibrio, bilancio',
      cs: 'rovnováha, bilance',
      sk: 'rovnováha, bilancia'
    }
  },
  // ID 129: lean
  {
    id: 129,
    translations: {
      it: 'appoggiarsi, inclinare',
      ro: 'sprijini, înclina',
      hu: 'dől, támaszkodik',
      cs: 'naklánět se, opírat se',
      bg: 'накланям се, облягам се',
      sl: 'nagibati se, nasloniti se',
      hr: 'nagnuti se, osloniti se'
    }
  },
  // ID 132: copy
  {
    id: 132,
    translations: {
      de: 'kopieren, Kopie',
      fr: 'copier, copie',
      pl: 'kopiować, kopia',
      it: 'copiare, copia',
      ro: 'copia, copie',
      cs: 'kopírovat, kopie',
      sk: 'kopírovať, kópia',
      es: 'copiar, copia',
      pt: 'copiar, cópia',
      ja: 'コピーする、コピー',
      ko: '복사하다, 복사'
    }
  },
  // ID 133: joke
  {
    id: 133,
    translation: 'шутка, шутить',
    translations: {
      de: 'scherzen, Witz',
      fr: 'plaisanter, blague',
      it: 'scherzare, scherzo',
      pl: 'żartować, żart',
      pt: 'brincar, piada',
      ja: '冗談、冗談を言う',
      ko: '농담하다, 농담'
    }
  },
  // ID 134: bear (restore missing animal bear and verb senses across 19 languages!)
  {
    id: 134,
    translations: {
      fr: 'ours, supporter',
      it: 'orso, sopportare',
      tr: 'ayı, katlanmak',
      pt: 'urso, suportar',
      ro: 'urs, a suporta',
      bg: 'мечка, търпя',
      cs: 'medvěd, snášet',
      sk: 'medveď, znášať',
      hu: 'medve, elvisel',
      el: 'αρκούδα, αντέχω',
      sl: 'medved, prenašati',
      et: 'karu, taluma',
      lt: 'lokys, pakęsti',
      lv: 'lācis, paciest',
      ja: '熊、耐える',
      ko: '곰, 참다',
      th: 'หมี, อดทน',
      vi: 'con gấu, chịu đựng'
    }
  },
  // ID 137: sight (fix imperatives "Look! See!" to noun senses)
  {
    id: 137,
    translations: {
      fr: 'vue, spectacle, regard',
      it: 'vista, sguardo',
      ro: 'vedere, priveliște',
      bg: 'зрение, гледка',
      cs: 'zrak, pohled',
      sk: 'zrak, pohľad',
      hu: 'látás, látvány',
      el: 'θέα, όραση',
      sl: 'vid, pogled',
      et: 'nägemine, vaatepilt',
      lt: 'rega, reginys, vaizdas',
      da: 'syn, seværdighed',
      sv: 'syn, sikte',
      fi: 'näkö, näkymä',
      ja: '視力、光景、視界',
      ko: '시력, 광경, 시야',
      ar: 'بصر، مشهد، رؤية'
    }
  },
  // ID 140: tape (fix decorative gift ribbon to adhesive / magnetic tape)
  {
    id: 140,
    translations: {
      tr: 'bant, şerit',
      ro: 'bandă, bandă adezivă',
      bg: 'лента, тиксо',
      cs: 'páska, lepicí páska',
      sk: 'páska, lepiaca páska',
      lt: 'juosta, lipni juosta',
      hi: 'टेप, पट्टी',
      id: 'pita, pita perekat',
      vi: 'băng keo, băng dính',
      th: 'เทป, เทปกาว',
      ko: '테이프',
      ja: 'テープ'
    }
  },
  // ID 141: ocean
  {
    id: 141,
    translations: {
      da: 'ocean, verdenshav',
      sv: 'ocean, världshav',
      ko: '대양, 해양',
      ja: '大洋、海洋',
      ur: 'بحر، سمندر'
    }
  },
  // ID 142: host (clean up party celebration calques)
  {
    id: 142,
    translations: {
      it: 'ospite, presentatore',
      da: 'vært',
      sv: 'värd',
      fi: 'isäntä',
      bg: 'домакин, водещ',
      ro: 'gazdă',
      vi: 'chủ nhà, người dẫn chương trình',
      ko: '주최자, 진행자',
      ja: '主催者、ホスト'
    }
  },
  // ID 143: grant (fix "procure / supply" to "grant / subsidy / grant permission")
  {
    id: 143,
    translations: {
      fr: 'accorder, subvention',
      it: 'concedere, borsa di studio',
      tr: 'vermek, bağış, hibe',
      ro: 'acorda, subvenție',
      cs: 'udělit, dotace',
      sk: 'udeliť, grant',
      hu: 'megad, támogatás',
      el: 'χορηγώ, επιχορήγηση',
      sl: 'odobriti, subvencija',
      et: 'määrama, toetus',
      lt: 'suteikti, dotacija',
      da: 'bevilge, tilskud',
      fi: 'myöntää, apuraha',
      sv: 'bevilja, bidrag',
      hr: 'odobriti, bespovratna sredstva',
      lv: 'piešķirt, grants',
      ja: '付与する、助成金',
      ko: '부여하다, 보조금'
    }
  },
  // ID 146: declare
  {
    id: 146,
    translation: 'объявлять, декларировать',
    translations: {
      fr: 'déclarer, annoncer',
      it: 'dichiarare, annunciare',
      pt: 'declarar, anunciar',
      pl: 'deklarować, ogłaszać'
    }
  },
  // ID 147: domestic (calque from tamed animals fixed to domestic/internal/household across 22 languages!)
  {
    id: 147,
    translation: 'домашний, внутренний',
    translations: {
      uk: 'домашній, внутрішній',
      fr: 'domestique, intérieur',
      it: 'domestico, interno',
      ro: 'domestic, intern',
      bg: 'домашен, вътрешен',
      cs: 'domácí, vnitřní',
      sk: 'domáci, vnútorný',
      hu: 'hazai, belső, házi',
      el: 'εγχώριος, οικιακός',
      sl: 'domač, notranji',
      et: 'kodune, siseriiklik',
      lt: 'namų, vidaus',
      da: 'hjemlig, indenlandsk',
      fi: 'kotimainen, sisäinen',
      sv: 'inhemsk, huslig',
      hr: 'domaći, unutarnji',
      lv: 'iekšzemes, mājas',
      vi: 'nội địa, trong nhà',
      th: 'ภายในประเทศ, ในครัวเรือน',
      ko: '국내의, 가정의',
      ja: '国内の、家庭の'
    }
  },
  // ID 150: neither
  {
    id: 150,
    translation: 'ни тот ни другой, никакой',
    translations: {
      fr: 'ni l\'un ni l\'autre, aucun',
      it: 'né l\'uno né l\'altro, nessuno',
      ja: 'どちらも〜ない、いずれも〜ない',
      ko: '어느 쪽도 아니다',
      fi: 'ei kumpikaan',
      vi: 'cả hai đều không',
      th: 'ไม่ทั้งสอง'
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

console.log(`Batch 101..150 calibration finished! Total translation fields patched: ${totalPatched}`);
