const fs = require('fs');

const FILES = [
  'frontend/assets/data/words.json',
  'assets/data/words.json',
  'docs/assets/data/words.json'
];

const calibrations = [
  // ID 552: submit (fix long explanatory clauses to concise modern app UI verbs across 18 languages)
  {
    id: 552,
    translation: 'отправлять, подавать, подчиняться',
    translations: {
      uk: 'надсилати, подавати, підкорятися',
      fr: 'soumettre, envoyer, céder',
      it: 'inviare, sottoporre, cedere',
      es: 'enviar, presentar, someterse',
      de: 'einreichen, absenden, unterwerfen',
      cs: 'odeslat, předložit, podřídit se',
      sk: 'odoslať, predložiť, podriadiť sa',
      pl: 'przesłać, złożyć, ulec',
      pt: 'enviar, submeter, entregar',
      ro: 'a trimite, depune, supune',
      bg: 'подавам, изпращам, подчинявам се',
      hu: 'beküld, benyújt, aláveti magát',
      el: 'υποβάλλω, καταθέτω, υποτάσσομαι',
      da: 'indsende, aflevere, underkaste sig',
      fi: 'lähettää, jättää, alistua',
      sv: 'skicka in, lämna in, underkasta sig',
      hr: 'poslati, predati, pokoriti se',
      sl: 'oddati, predložiti, podrediti se',
      et: 'esitama, saatma, alistuma',
      lt: 'pateikti, atsiųsti, paklusti',
      lv: 'iesniegt, nosūtīt, pakļauties',
      tr: 'göndermek, sunmak, boyun eğmek',
      ar: 'إرسال، تقديم، خضوع',
      ja: '送信する、提出する、屈服する',
      ko: '제출하다, 전송하다, 굴복하다',
      zh: '提交、呈交、顺从',
      kk: 'жіберу, тапсыру, бағыну'
    }
  },
  // ID 555: resolve (fix catastrophic "TO DECIDE / MAKE A DECISION" calque across 22 languages!)
  {
    id: 555,
    translation: 'разрешать проблему, улаживать, решимость',
    translations: {
      uk: 'вирішувати проблему, залагоджувати, рішучість',
      fr: 'résoudre, régler, détermination',
      it: 'risolvere, chiarire, risolutezza',
      es: 'resolver, solucionar, determinación',
      de: 'lösen, beilegen, Entschlossenheit',
      cs: 'vyřešit, urovnat, odhodlání',
      sk: 'vyriešiť, urovnať, odhodlanie',
      pl: 'rozwiązać, załagodzić, postanowienie',
      pt: 'resolver, solucionar, determinação',
      ro: 'a rezolva, soluționa, hotărâre',
      bg: 'решавам проблем, изглаждам, решимост',
      hu: 'megold, elsimít, elszántság',
      el: 'επιλύω, διευθετώ, αποφασιστικότητα',
      da: 'løse, afklare, beslutsomhed',
      fi: 'ratkaista, selvittää, päättäväisyys',
      sv: 'lösa, klara upp, beslutsamhet',
      hr: 'riješiti, izgladiti, odlučnost',
      sl: 'rešiti, razrešiti, odločnost',
      et: 'lahendama, klaarima, sihikindlus',
      lt: 'išspręsti, išsiaiškinti, ryžtas',
      lv: 'atrisināt, nokārtot, apņēmība',
      tr: 'çözmek, halletmek, kararlılık',
      ar: 'يحل مشكلة، تسوية، عزم',
      ja: '解決する、解明する、決意',
      ko: '해결하다, 풀다, 결심',
      vi: 'giải quyết, dàn xếp, quyết tâm',
      kk: 'мәселені шешу, реттеу, табандылық'
    }
  },
  // ID 566: vary (fix Finnish "to disagree" and clean plural verbs)
  {
    id: 566,
    translation: 'отличаться, варьироваться, менять',
    translations: {
      uk: 'відрізнятися, варіюватися, змінювати',
      fi: 'vaihdella, erota',
      bg: 'различавам се, варирам',
      et: 'erinema, varieeruma',
      sl: 'razlikovati se, spreminjati se'
    }
  },
  // ID 568: equally (fix Italian "tale" and clean)
  {
    id: 568,
    translation: 'поровну, одинаково, в равной степени',
    translations: {
      uk: 'порівну, однаково, в рівній мірі',
      it: 'ugualmente, altrettanto, equamente',
      kk: 'бірдей, теңдей'
    }
  },
  // ID 571: imply (fix catastrophic "ARITHMETIC AVERAGE / MEDIUM" calque across 10 languages!)
  {
    id: 571,
    translation: 'подразумевать, намекать, предполагать',
    translations: {
      uk: 'мати на увазі, натякати, припускати',
      bg: 'подразбирам, намеквам',
      cs: 'naznačovat, implikovat, znamenat',
      sk: 'naznačovať, implikovať, znamenať',
      el: 'υπονοώ, αφήνω να εννοηθεί',
      et: 'vihjama, mõista andma',
      hu: 'utal, sejtet, maga után von',
      ro: 'a sugera, lăsa să se înțeleagă',
      sl: 'nakazovati, namigovati',
      fr: 'insinuer, sous-entendre, impliquer',
      it: 'insinuare, sottintendere, implicare'
    }
  },
  // ID 578: boot (restore footwear across French, Italian, Czech, etc.)
  {
    id: 578,
    translation: 'ботинок, сапог, багажник, перезагрузка',
    translations: {
      uk: 'черевик, чобіт, багажник, завантаження',
      fr: 'botte, coffre, démarrer',
      it: 'stivale, bagagliaio, avviare',
      cs: 'bota, kufr auta, spustit',
      hu: 'csizma, bakancs, csomagtartó',
      pt: 'bota, porta-malas, inicializar',
      es: 'bota, maletero, arrancar'
    }
  },
  // ID 582: favor (fix "technical car service" to favor/goodwill across 8 languages)
  {
    id: 582,
    translation: 'услуга, одолжение, благосклонность',
    translations: {
      uk: 'послуга, ласка, прихильність',
      fr: 'service, faveur, privilégier',
      cs: 'laskavost, přízeň, služba',
      da: 'tjeneste, gunst, begunstige',
      fi: 'palvelus, suosio, suosia',
      et: 'teene, soosing, eelistama',
      hu: 'szívesség, kegy, pártfogol',
      it: 'favore, cortesia, prediligere',
      ro: 'favoare, amabilitate, serviciu'
    }
  },
  // ID 587: mood (lowercase Italian and clean)
  {
    id: 587,
    translations: {
      it: 'umore, stato d\'animo'
    }
  },
  // ID 594: draft (enrich with project/breeze)
  {
    id: 594,
    translation: 'черновик, проект, сквозняк',
    translations: {
      uk: 'чернетка, проєкт, протяг',
      fr: 'brouillon, ébauche, courant d\'air',
      it: 'bozza, progetto, corrente d\'aria',
      es: 'borrador, boceto, corriente',
      de: 'Entwurf, Skizze, Zugluft',
      cs: 'návrh, koncept, průvan',
      sk: 'návrh, koncept, prievan'
    }
  },
  // ID 597: mess (fix catastrophic "MENTAL / MEDICAL DISABILITY" calque across 10 languages!)
  {
    id: 597,
    translation: 'беспорядок, бардак, портить',
    translations: {
      uk: 'безлад, безладдя, псувати',
      ja: '散らかり、混乱、散らかす',
      ko: '엉망진창, 난장판, 엉망으로 만들다',
      kk: 'былық, бейберекеттік, ластау',
      vi: 'sự lộn xộn, mớ bừa bộn',
      th: 'ความยุ่งเหยิง, ความเละเทะ',
      ar: 'فوضى، خربطة، يفسد',
      hi: 'गंदगी, गड़बड़, अस्त-व्यस्त',
      hr: 'nered, zbrka',
      fi: 'sotku, sekasotku, sekoittaa'
    }
  },
  // ID 598: joy (strip "to entertain" verb phrases across 10 languages and restore pure joy/delight)
  {
    id: 598,
    translation: 'радость, восторг, отрада',
    translations: {
      uk: 'радість, захват, втіха',
      de: 'Freude, Entzücken, Wonne',
      fr: 'joie, allégresse, bonheur',
      it: 'gioia, letizia, giubilo',
      es: 'alegría, gozo, júbilo',
      cs: 'radost, potěšení',
      sk: 'radosť, potešenie',
      bg: 'радост, възторг',
      el: 'χαρά, ευτυχία',
      ro: 'bucurie, încântare',
      da: 'glæde, fryd',
      fi: 'ilo, riemu',
      sv: 'glädje, fröjd',
      hu: 'öröm, boldogság'
    }
  },
  // ID 599: motor (fix Finnish adjective and Kazakh "motion" noun)
  {
    id: 599,
    translation: 'мотор, двигатель, двигательный',
    translations: {
      uk: 'мотор, двигун, руховий',
      fi: 'moottori, moottorikäyttöinen',
      kk: 'қозғалтқыш, мотор'
    }
  },
  // ID 600: salary (enrich with common salary synonyms)
  {
    id: 600,
    translation: 'зарплата, оклад, заработная плата',
    translations: {
      uk: 'зарплата, заробітна плата, оклад'
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

console.log(`Batch 501..600 calibration finished! Total translation fields patched: ${totalPatched}`);
