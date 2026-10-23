import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Curated Brazilian Portuguese (pt-BR) overrides for polysemous words,
 * untranslated words, pronouns, and homonyms.
 */
export const PT_BR_WORD_OVERRIDES = {
  // Pronouns & prepositions & basic words
  'from': 'de',
  'your': 'seu, sua',
  'all': 'tudo, todos',
  'me': 'me, mim',
  'out': 'fora, lá fora',
  'them': 'eles, lhes',
  'then': 'então, depois',
  'back': 'de volta, costas',
  'too': 'demais, também',
  'come on': 'vamos lá, qual é',
  'every': 'cada, todos',
  'state': 'estado',
  'little': 'pequeno, pouco',
  'another': 'outro, mais um',
  'find out': 'descobrir',
  'ever': 'sempre, alguma vez',
  'please': 'por favor, agradar',
  'play': 'jogar / brincar, peça',
  'make sure': 'certificar-se, garantir',
  'line': 'linha, fila',
  'matter': 'importar, matéria',
  'close': 'fechar, perto',
  'special': 'especial',
  'reason': 'motivo, razão',
  'pay back': 'reembolsar, retribuir',
  'date': 'data, encontro',
  'hold': 'segurar, abraçar',
  'review': 'revisão, avaliação',
  'related': 'relacionado, aparentado',
  'respect': 'respeitar, respeito',
  'leave left left': 'partir, deixar',
  'cold': 'frio, resfriado',
  'certainly': 'certamente, claro',
  'fair': 'justo, feira',
  'train': 'treinar, trem',
  'floor': 'chão, andar',
  'necessary': 'necessário, preciso',
  'plant': 'planta, plantar',
  'otherwise': 'caso contrário, senão',
  'broken': 'quebrado',
  'application': 'aplicativo, inscrição',
  'heat': 'aquecer, calor',
  'activity': 'atividade',
  'ride': 'passeio, andar a cavalo',
  'demand': 'exigir, demanda',
  'sexual': 'sexual',
  'lose lost lost': 'perder',
  'patient': 'paciente',
  'dress': 'vestido, vestir-se',
  'connection': 'conexão, ligação',
  'fix': 'consertar, fixar',
  'fly': 'voar, mosca',
  'somewhere': 'em algum lugar',
  'duty': 'dever, plantão',
  'smoke': 'fumar, fumaça',
  'lead led led': 'conduzir, liderar',
  'angry': 'irritado, com raiva',
  'orange': 'laranja',
  'fail': 'falhar, fracasso',
  'blow': 'soprar, golpe',
  'pacific': 'pacífico',
  'burn': 'queimadura, queimar',
  'paint': 'pintar, tinta',
  'recognize': 'reconhecer',
  'tie': 'amarrar, gravata',
  'bounty': 'recompensa',
  'stable': 'estável, estábulo',
  'pants': 'calças',
  'wash': 'lavar',
  'hurt hurt hurt': 'ferir, machucar',
  'afterwards': 'depois, em seguida',
  'sheet': 'folha, lençol',
  'settle': 'estabelecer-se, resolver',
  'tear': 'rasgar, lágrima',
  'cure': 'curar, cura',
  'sole': 'sola, único',
  'nail': 'unha, prego',
  'collapse': 'colapso, desabamento',
  'lean': 'inclinar-se, apoiar-se',
  'pile': 'monte, pilha',
  'upset upset upset': 'chatear, virar',
  'approve': 'aprovar',
  'drain': 'drenar, ralo',
  'whip': 'chicote, bater',
  'vegetable': 'vegetal, legume',
  'snack': 'lanche',
  'dislike': 'antipatia, não gostar',
  'confession': 'confissão',
  'dough': 'massa, grana',
  'clarify': 'esclarecer',
  'remark': 'observação, comentário',
  'comb': 'pente, pentear',
  'loaf': 'pão de forma, filão',
  'hysterical': 'histérico',
  'negligible': 'insignificante, desprezível',
  'bathe': 'tomar banho, banhar',
  'tremor': 'tremor',
  'configure': 'configurar',
  'zucchini': 'abobrinha',
  'paltry': 'insignificante, irrisório',

  // 3+ part duplicates & homonyms
  'on': 'em, sobre, ligado',
  'as': 'como, já que',
  'my': 'meu, minha',
  'can': 'poder, saber, lata',
  'most': 'a maioria, mais, muito',
  'last': 'último, passado, durar',
  'place': 'lugar, colocar',
  'take off': 'tirar, decolar, dar desconto',
  'general': 'geral, principal, general',
  'else': 'mais, outro, além disso',
  'hit': 'bater, acerto, sucesso',
  'get along': 'dar-se bem, conviver',
  'fight': 'luta, briga, lutar',
  'return': 'voltar, devolver, retorno',
  'original': 'original, inicial',
  'writing': 'escrita, obra',
  'starting': 'início, começando, inicial',
  'capital': 'capital, principal',
  'drop': 'deixar cair, gota',
  'bar': 'bar, barra',
  'highly': 'altamente, muito',
  'pattern': 'padrão, modelo',
  'tip': 'ponta, gorjeta, dica',
  'collect': 'coletar, colecionar, acumular',
  'bang': 'bater, estrondo, franja',
  'fortune': 'sorte, fortuna',
  'seal': 'foca, lacre, selar',
  'bow': 'reverência, arco',
  'examine': 'examinar, inspecionar',
  'crop': 'colheita, cortar, recortar',
  'collar': 'gola, colarinho, coleira',
  'trunk': 'tronco, porta-malas',
  'indirect': 'indireto',
  'moonshine': 'luar, bebida clandestina, bobagem',

  // Untranslated English words
  'jar': 'jarra, pote',
  'crush': 'esmagar',
  'deck': 'convés',
  'download': 'baixar',
  'slink': 'esgueirar-se',

  // Trailing commas & PT-PT -> PT-BR
  'will have to': 'terá que',
  'pretty good': 'muito bom',
  'width': 'largura',
  'ceo': 'diretor-geral (CEO)',
};

/**
 * Sanitizes a single Portuguese translation string:
 * - Applies explicit PT_BR_WORD_OVERRIDES if the word matches
 * - Strips trailing/leading commas
 * - Deduplicates identical comma-separated tokens (case-insensitive)
 */
export function sanitizePtTranslation(englishWord, ptText) {
  const key = String(englishWord || '').trim().toLowerCase();
  if (PT_BR_WORD_OVERRIDES[key]) {
    return PT_BR_WORD_OVERRIDES[key];
  }
  if (!ptText) return ptText;
  let cleaned = String(ptText).trim().replace(/^,+|,+$/g, '').trim();
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);
    const seen = new Set();
    const deduped = [];
    for (const p of parts) {
      const low = p.toLowerCase();
      if (!seen.has(low)) {
        seen.add(low);
        deduped.push(p);
      }
    }
    cleaned = deduped.join(', ');
  }
  return cleaned;
}

export function applyPtFixesToWordsArray(words) {
  let fixedCount = 0;
  for (const w of words) {
    if (!w) continue;
    const key = String(w.word || '').trim().toLowerCase();
    if (key === 'indirect' && w.translation === 'интернет, косвенный, непрямой') {
      w.translation = 'косвенный, непрямой';
    }
    if (w.translations && w.translations.pt) {
      const oldPt = w.translations.pt;
      const newPt = sanitizePtTranslation(w.word, oldPt);
      if (newPt !== oldPt) {
        w.translations.pt = newPt;
        fixedCount++;
      }
    }
  }
  return fixedCount;
}

// If executed directly
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const targets = [
    path.join(ROOT_DIR, 'assets', 'data', 'words.json'),
    path.join(ROOT_DIR, 'frontend', 'assets', 'data', 'words.json'),
    path.join(ROOT_DIR, 'docs', 'assets', 'data', 'words.json'),
    path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'assets', 'public', 'assets', 'data', 'words.json')
  ];

  for (const p of targets) {
    if (fs.existsSync(p)) {
      const words = JSON.parse(fs.readFileSync(p, 'utf8'));
      const count = applyPtFixesToWordsArray(words);
      fs.writeFileSync(p, JSON.stringify(words, null, 2), 'utf8');
      console.log(`✅ Updated ${path.relative(ROOT_DIR, p)} (${count} words fixed)`);
    }
  }
}
