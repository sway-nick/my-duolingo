const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 601: cousin (add female cousin / gender-neutral cousin)
  {
    id: 601,
    translation: 'двоюродный брат, двоюродная сестра, кузен',
    translations: {
      uk: 'двоюрідний брат, двоюрідна сестра, кузен'
    }
  },
  // ID 605: lovely (lowercase capitalized adjectives)
  {
    id: 605,
    translations: {
      de: 'wunderschön, reizend, herrlich',
      it: 'bellissimo, incantevole, delizioso',
      tr: 'güzel, sevimli, hoş'
    }
  },
  // ID 616: plot (fix catastrophic "CONSPIRACY / TREASON" or "LAND LOT" calque across 15 languages!)
  {
    id: 616,
    translation: 'сюжет, фабула, заговор, участок земли',
    translations: {
      uk: 'сюжет, фабула, змова, ділянка',
      fr: 'intrigue, trame, complot, parcelle',
      it: 'trama, intreccio, complotto',
      cs: 'děj, zápletka, spiknutí, pozemek',
      sk: 'dej, zápletka, sprisahanie',
      pl: 'fabuła, intryga, spisek, działka',
      pt: 'enredo, trama, complô, lote',
      ro: 'intrigă, subiect, complot, parcelă',
      bg: 'сюжет, фабула, заговор, парцел',
      hu: 'cselekmény, összeesküvés, telek',
      el: 'πλοκή, υπόθεση, συνωμοσία, οικόπεδο',
      da: 'handling, plot, sammensværgelse',
      fi: 'juoni, salaliitto, tontti',
      sv: 'handling, intrig, sammansvärjning',
      hr: 'radnja, zaplet, zavjera',
      sl: 'zgodba, zaplet, zarota',
      ja: '筋、構想、陰謀、区画',
      ko: '줄거리, 구성, 음모, 땅',
      vi: 'cốt truyện, âm mưu, mảnh đất',
      ar: 'حبكة، مؤامرة، قطعة أرض',
      hi: 'कथानक, साजिश, भूखंड'
    }
  },
  // ID 617: angle (fix catastrophic "STREET CORNER / COZY NOOK" calque across 16 languages!)
  {
    id: 617,
    translation: 'угол, ракурс, угол зрения',
    translations: {
      uk: 'кут, ракурс, кут зору',
      fr: 'angle, point de vue',
      it: 'angolo, prospettiva',
      es: 'ángulo, perspectiva',
      de: 'Winkel, Blickwinkel',
      cs: 'úhel, zorný úhel, pohled',
      sk: 'uhol, uhol pohľadu',
      pl: 'kąt, punkt widzenia',
      pt: 'ângulo, ponto de vista',
      ro: 'unghi, punct de vedere',
      bg: 'ъгъл, ракурс, гледна точка',
      hu: 'szög, nézőpont',
      el: 'γωνία, οπτική γωνία',
      da: 'vinkel, synsvinkel',
      fi: 'kulma, näkökulma',
      sv: 'vinkel, synvinkel',
      hr: 'kut, kut gledanja',
      sl: 'kot, zorni kot',
      lv: 'leņķis, skatpunkts',
      ja: '角度、視点、アングル',
      ko: '각도, 관점, 시각',
      vi: 'góc, góc độ, quan điểm'
    }
  },
  // ID 621: butter (restore standard word order)
  {
    id: 621,
    translation: 'сливочное масло, мазать маслом',
    translations: {
      uk: 'вершкове масло, мазати маслом'
    }
  },
  // ID 622: desert (fix catastrophic "SWEET DESSERT / PUDDING" calque in sv and th)
  {
    id: 622,
    translations: {
      sv: 'öken, ödemark',
      th: 'ทะเลทราย',
      hr: 'pustinja'
    }
  },
  // ID 625: blind (fix roller window blind and ALL CAPS in ro)
  {
    id: 625,
    translations: {
      cs: 'slepý, nevidomý, roleta',
      ro: 'orb, nevăzător, jaluzea'
    }
  },
  // ID 626: bullet (fix "TYPOGRAPHIC DOT IN A LIST" calque across 10 languages!)
  {
    id: 626,
    translation: 'пуля, маркер списка',
    translations: {
      uk: 'куля, маркер списку',
      da: 'kugle, projektil, punkt',
      sv: 'kula, projektil, punkt',
      fi: 'luoti, ammus, luettelomerkki',
      et: 'kuul, täpp',
      lv: 'lode, aizzīme',
      sk: 'guľka, náboj, odrážka',
      hr: 'metak, točka',
      vi: 'viên đạn, dấu đầu dòng',
      cs: 'kulka, náboj, odrážka'
    }
  },
  // ID 627: sequence (fix catastrophic "SUBSEQUENCE IN HIGHER MATH" calque across 10 languages!)
  {
    id: 627,
    translation: 'последовательность, очередность, эпизод',
    translations: {
      uk: 'послідовність, черговість, епізод',
      fr: 'séquence, ordre, suite',
      it: 'sequenza, successione, serie',
      cs: 'posloupnost, sekvence, sled',
      sk: 'postupnosť, sekvencia, sled',
      sl: 'zaporedje, niz',
      ro: 'secvență, succesiune, serie',
      et: 'järjestus, jada, sekvents',
      hu: 'sorrend, egymásutániság, szekvencia',
      bg: 'последователност, поредица',
      lt: 'seka, eilė'
    }
  },
  // ID 629: minor (fix "adverb in grammar" and "minor scale" only across Nordic/Baltic languages)
  {
    id: 629,
    translation: 'незначительный, несовершеннолетний, минорный',
    translations: {
      uk: 'незначний, неповнолітній, мінорний',
      da: 'mindre, uvæsentlig, mindreårig',
      fi: 'vähäinen, alaikäinen, molli',
      sv: 'mindre, oväsentlig, underårig, moll',
      lv: 'neliels, nepilngadīgs, minors',
      el: 'δευτερεύων, ανήλικος, μινόρε',
      lt: 'nežymus, nepilnametis',
      cs: 'drobný, nezletilý, menší',
      sk: 'drobný, neplnoletý, menší'
    }
  },
  // ID 633: clock (fix catastrophic "TO WATCH A MOVIE / LOOK" calque across 16 languages!)
  {
    id: 633,
    translation: 'часы, настенные часы, засекать время',
    translations: {
      uk: 'годинник, настінний годинник',
      da: 'ur, vægur',
      fi: 'kello, seinäkello',
      sv: 'klocka, väggur',
      ja: '時計、置時計',
      kk: 'сағат, қабырға сағаты',
      ar: 'ساعة، ساعة حائط',
      hi: 'घड़ी, दीवार घड़ी',
      hr: 'sat, zidni sat',
      id: 'jam, jam dinding',
      lv: 'pulkstenis, sienas pulkstenis',
      th: 'นาฬิกา, นาฬิกาแขวน',
      vi: 'đồng hồ, đồng hồ treo tường',
      fr: 'horloge, pendule',
      cs: 'hodiny, nástěnné hodiny',
      sk: 'hodiny, nástenné hodiny'
    }
  },
  // ID 634: arrange (fix catastrophic "I AGREE" and "DIPLOMATIC NEGOTIATIONS" calque across 22 languages!)
  {
    id: 634,
    translation: 'организовывать, устраивать, расставлять',
    translations: {
      uk: 'організовувати, влаштовувати, розставляти',
      fr: 'organiser, arranger, disposer',
      it: 'organizzare, disporre, concordare',
      es: 'organizar, disponer, arreglar',
      de: 'organisieren, arrangieren, anordnen',
      cs: 'zorganizovat, zařídit, uspořádat',
      sk: 'zorganizovať, zariadiť, usporiadať',
      pl: 'organizować, aranżować, układać',
      pt: 'organizar, arranjar, dispor',
      ro: 'a organiza, aranja, dispune',
      bg: 'организирам, уреждам, подреждам',
      hu: 'elrendez, szervez, elintéz',
      el: 'κανονίζω, οργανώνω, τακτοποιώ',
      da: 'arrangere, organisere, tilrettelægge',
      fi: 'järjestää, sopia, asetella',
      sv: 'ordna, arrangera, ställa i ordning',
      hr: 'organizirati, urediti, dogovoriti',
      sl: 'urediti, organizirati, razporediti',
      et: 'korraldama, seadma, kokku leppima',
      lt: 'suorganizuoti, sutvarkyti, išdėstyti',
      lv: 'organizēt, nokārtot, sakārtot',
      tr: 'düzenlemek, ayarlamak, organize etmek',
      ar: 'ينظم، يرتب، ينسق',
      ja: '手配する、配置する、段取りをつける',
      ko: '마련하다, 배열하다, 주선하다',
      vi: 'sắp xếp, thu xếp, tổ chức',
      th: 'จัดเตรียม, จัดการ, วางแผน',
      kk: 'ұйымдастыру, реттеу, орналастыру'
    }
  },
  // ID 637: originally (fix Italian "insieme" to "originariamente")
  {
    id: 637,
    translations: {
      it: 'originariamente, all\'inizio, in origine'
    }
  },
  // ID 639: properly (fix catastrophic "TURN RIGHT" and "LEGAL STATUTE / LAW" calque across 12 languages!)
  {
    id: 639,
    translation: 'должным образом, правильно, как следует',
    translations: {
      uk: 'належним чином, правильно, як слід',
      fr: 'correctement, convenablement, comme il faut',
      it: 'correttamente, adeguatamente',
      es: 'correctamente, adecuadamente, debidamente',
      de: 'richtig, ordnungsgemäß, gehörig',
      cs: 'správně, řádně, jak se patří',
      sk: 'správne, riadne, ako sa patrí',
      pl: 'właściwie, prawidłowo, odpowiednio',
      pt: 'corretamente, adequadamente',
      ro: 'corect, în mod corespunzător',
      bg: 'правилно, както трябва, подобаващо',
      hu: 'megfelelően, rendesen, helyesen',
      el: 'σωστά, κατάλληλα, όπως πρέπει',
      da: 'ordentligt, korrekt',
      fi: 'kunnolla, asianmukaisesti',
      sv: 'ordentligt, på rätt sätt',
      hr: 'pravilno, kako treba',
      sl: 'pravilno, ustrezno',
      et: 'korralikult, nõuetekohaselt',
      lt: 'tinkamai, teisingai',
      lv: 'pareizi, pienācīgi',
      kk: 'дұрыс, тиісінше'
    }
  },
  // ID 643: dear (clean redundant archaic phrase)
  {
    id: 643,
    translation: 'дорогой, милый, уважаемый',
    translations: {
      uk: 'дорогий, милий, шановний',
      tr: 'sevgili, değerli'
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

console.log(`Batch 601..650 calibration finished! Total translation fields patched: ${totalPatched}`);
