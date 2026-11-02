import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const TARGET_FILES = [
  path.join(rootDir, 'frontend', 'assets', 'data', 'words.json'),
  path.join(rootDir, 'assets', 'data', 'words.json'),
  path.join(rootDir, 'docs', 'assets', 'data', 'words.json')
];

// Curated calibrations for batch 1-50
const calibrations = {
  // ID 2: good at
  2: {
    de: "gut in, geschickt in",
    es: "bueno en, hábil en",
    bg: "добър в",
    el: "καλός σε",
    et: "hea milleski",
    hu: "jó valamiben",
    lt: "geras tam tikroje srityje",
    ro: "bun la",
    sk: "dobrý v",
    sl: "dober v"
  },
  // ID 4: sometimes (lowercase adverbs)
  4: {
    de: "manchmal",
    fr: "parfois",
    it: "a volte",
    pl: "czasami",
    tr: "bazen"
  },
  // ID 10: beginning (nouns, not verbs or locatives)
  10: {
    cs: "začátek",
    da: "begyndelse, start",
    fi: "alku, aloitus",
    hr: "početak",
    hu: "kezdet, eleje",
    ja: "始まり、初め",
    ko: "시작, 처음",
    lt: "pradžia",
    lv: "sākums",
    sv: "början, start"
  },
  // ID 14: assessment (evaluation/assessment, not degree/grade!)
  14: {
    bg: "оценка, оценяване",
    cs: "hodnocení, posouzení",
    el: "αξιολόγηση, εκτίμηση",
    et: "hinnang, hindamine",
    fi: "arviointi",
    hr: "procjena, ocjenjivanje",
    hu: "értékelés, felmérés",
    it: "valutazione, stima",
    lv: "novērtējums, vērtējums",
    ro: "evaluare, apreciere",
    sk: "hodnotenie, posúdenie",
    sl: "ocena, vrednotenje"
  },
  // ID 20: familiar (well-known/familiar, not habitual/routine!)
  20: {
    cs: "známý, povědomý",
    da: "velkendt, fortrolig",
    fi: "tuttu, tutunomainen",
    hr: "poznat, prisno poznat",
    hu: "ismerős",
    it: "familiare, noto",
    ja: "親しみのある、よく知られた",
    ko: "익숙한, 친숙한",
    lv: "pazīstams",
    ro: "cunoscut, familiar",
    sk: "známy, povedomý",
    sl: "znan, domač",
    sv: "bekant, välkänd",
    vi: "quen thuộc"
  },
  // ID 21: classroom
  21: {
    it: "aula, classe",
    pl: "sala lekcyjna, klasa"
  },
  // ID 22: reference (citation, mention, referral, not only hyperlink)
  22: {
    de: "Referenz, Hinweis, Bezug",
    it: "riferimento, citazione",
    ja: "参照、言及、推薦状",
    ko: "참조, 언급, 추천서",
    sv: "referens, hänvisning"
  },
  // ID 24: lunch (LUNCH / OBED, NOT DINNER / VECERA / CENA!)
  24: {
    bg: "обяд",
    cs: "oběd",
    el: "μεσημεριανό, γεύμα",
    et: "lõuna, lõunasöök",
    fi: "lounas",
    hr: "ručak",
    hu: "ebéd",
    it: "pranzo",
    lt: "pietūs",
    lv: "pusdienas",
    ro: "prânz",
    sk: "obed",
    sl: "kosilo"
  },
  // ID 27: instruction (instruction/directions, not "opportunità" - opportunity!)
  27: {
    it: "istruzione, indicazione"
  },
  // ID 37: train (both railway train AND to train/exercise!)
  37: {
    cs: "vlak, trénovat",
    de: "Zug, trainieren",
    hi: "ट्रेन, प्रशिक्षण देना",
    it: "treno, allenarsi",
    ja: "電車、列車、訓練する",
    kk: "пойыз, жаттығу",
    ko: "기차, 훈련하다",
    ro: "tren, a antrena",
    th: "รถไฟ, ฝึกฝน",
    vi: "tàu hỏa, huấn luyện"
  },
  // ID 44: native (native language, native speaker, indigenous - NO FREIGHT CARRIERS / SAVAGES!)
  44: {
    ru: "родной, носитель языка",
    da: "indfødt, modersmålstalende",
    et: "emakeelne, põline",
    fi: "syntyperäinen, äidinkielinen",
    hr: "izvorni govornik, rodni, domaći",
    it: "nativo, madrelingua",
    ja: "母国語話者、ネイティブ、生まれつきの",
    lt: "gimtasis, gimtakalbis",
    lv: "dzimtā valoda, dzimtā valodas runātājs",
    pl: "rodzimy, ojczysty, rodzimy użytkownik języka",
    sk: "rodný, rodený hovoriaci",
    sl: "rojen, naravni govorec",
    sv: "infödd, modersmålstalare"
  },
  // ID 49: struggle (noun & verb)
  49: {
    ja: "苦闘、奮闘、戦う",
    ko: "투쟁, 분투, 싸우다",
    tr: "mücadele, çabalamak"
  }
};

for (const filePath of TARGET_FILES) {
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  const words = JSON.parse(content);
  let updatedCount = 0;

  for (const w of words) {
    if (calibrations[w.id]) {
      const entryCalibs = calibrations[w.id];
      for (const [lang, newVal] of Object.entries(entryCalibs)) {
        if (lang === 'ru') {
          if (w.translation !== newVal) {
            w.translation = newVal;
            updatedCount++;
          }
        } else {
          if (!w.translations) w.translations = {};
          if (w.translations[lang] !== newVal) {
            w.translations[lang] = newVal;
            updatedCount++;
          }
        }
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Applied batch 1-50 calibrations to ${filePath}: ${updatedCount} fields updated.`);
}
