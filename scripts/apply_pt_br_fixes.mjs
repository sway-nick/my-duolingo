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

export const PT_BR_WORD_OVERRIDES_V2 = {
  'lunch':'almoço','arm':'braço','foot':'pé','ear':'orelha, ouvido','skin':'pele','chest':'peito, tórax','tongue':'língua','face':'rosto, face',
  'bear':'urso','deer':'cervo','deer deer':'cervo - cervos','fifty':'cinquenta','score':'placar, pontuação','match':'partida, combinar, fósforo',
  'running':'corrida','meal':'refeição','shoe':'sapato','wear':'vestir, usar','scarf':'cachecol, lenço','cap':'boné',
  'peace':'paz','gender':'gênero','castle':'castelo','clock':'relógio de parede','watch':'assistir, relógio de pulso','bench':'banco',
  'handle':'maçaneta, alça, lidar com','port':'porto','sort':'ordenar, tipo','turn':'virar, vez','plate':'prato, placa','change':'mudar, troco',
  'miss':'sentir falta, perder','live':'viver, morar','like':'gostar, como','keep':'manter, guardar','learn':'aprender, estudar','fall':'cair, outono',
  'clean':'limpo, limpar','warm':'morno, quente','ready':'pronto','different':'diferente','own':'próprio, possuir','whole':'inteiro, todo',
  'criminal':'criminoso','corrupt':'corrupto','laptop':'notebook','menu':'cardápio, menu','rude':'grosseiro, mal-educado','poster':'pôster, cartaz',
  'cookie':'biscoito, cookie','backup':'backup, cópia de segurança','relative':'parente','sensitive':'sensível','contest':'concurso, competição',
  'educated':'instruído, culto','resume':'currículo, retomar','intend':'pretender, tencionar','compromise':'acordo, concessão',
  'sympathy':'compaixão, solidariedade','prejudice':'preconceito','succeed':'ter sucesso, conseguir','attend':'frequentar, comparecer',
  'record':'gravar, registro','course':'curso, rumo','custom':'costume, personalizado','tap':'torneira, tocar','net':'rede, líquido',
  'eat ate eaten':'comer','teach taught taught':'ensinar','shoot shot shot':'atirar, disparar','cost cost cost':'custar','cut cut cut':'cortar',
  'drink drank drunk':'beber','sweat sweat sweat':'suar','dig dug dug':'cavar','smell smelt smelt':'cheirar','quit quit quit':'desistir, largar, sair',
  'bear bore born':'suportar, dar à luz','sink sank sunk':'afundar','spin spun spun':'girar','ring rang rung':'tocar, telefonar',
  'lie lay lain':'deitar-se, jazer','learn learnt learnt':'aprender','stand stood stood':'ficar de pé','strike struck struck':'golpear, fazer greve',
  'stick stuck stuck':'colar, emperrar','fit fit fit':'caber, servir','rid rid rid':'livrar, libertar','wind wound wound':'dar corda, serpentear',
  'come in':'entrar','turn on':'ligar','get up':'levantar-se','bring up':'criar (educar), mencionar','run out':'acabar, esgotar-se',
  'get on':'embarcar, dar-se bem','on time':'na hora certa, pontualmente','in front of':'na frente de','at home':'em casa','give back':'devolver',
  'just looking':'só dando uma olhada','foot feet':'pé - pés','focus foci':'foco - focos','analysis analyses':'análise - análises',
  'person people':'pessoa - pessoas','medium media':'meio - meios (mídia)','consist of':'consistir em','object to':'opor-se a','refer to':'referir-se a',
  'laugh at':'rir de','smile at':'sorrir para','promise to':'prometer','scrambled eggs':'ovos mexidos','sour cream':'creme azedo (sour cream)',
  'a piece of cake':'mamão com açúcar, muito fácil','when pigs fly':'no dia de São Nunca','no pain no gain':'sem esforço não há ganho',
};
Object.assign(PT_BR_WORD_OVERRIDES, PT_BR_WORD_OVERRIDES_V2);
/**
 * Sanitizes a single Portuguese translation string:
 * - Applies explicit PT_BR_WORD_OVERRIDES if the word matches
 * - Strips trailing/leading commas
 * - Deduplicates identical comma-separated tokens (case-insensitive)
 */

export const PT_BR_WORD_OVERRIDES_V3 = {
  "leg": "perna",
  "basketball": "basquete",
  "purple": "roxo",
  "flying": "voo, voando",
  "frequency": "frequência",
  "frequent": "frequente",
  "consequence": "consequência",
  "make": "fazer, criar",
  "take": "pegar, levar, tomar",
  "that's": "isso é, é isso",
  "during": "durante",
  "look up to": "admirar, respeitar",
  "look after": "cuidar de, tomar conta de",
  "put this one on": "experimente isto, vista isto",
  "believe in": "acreditar em",
  "so what": "e daí?",
  "get out": "sair, cair fora",
  "come from": "vir de, originar-se de",
  "work on": "trabalhar em",
  "work for": "trabalhar para",
  "without": "sem",
  "known for": "conhecido por, famoso por",
  "non": "não-, anti-",
  "learn about": "aprender sobre, saber sobre",
  "certain of": "certo de, seguro de",
  "tell told told": "dizer, contar",
  "write to": "escrever para",
  "included": "incluído",
  "agree with": "concordar com",
  "agree on": "concordar sobre, entrar em acordo",
  "famous for": "famoso por, conhecido por",
  "drop off": "deixar, dar carona",
  "teach": "ensinar",
  "to take something for granted": "dar como certo, não valorizar",
  "log": "tronco, registro, diário",
  "grab a coffee": "tomar um café, pegar um café",
  "shout to": "gritar para",
  "annoyed with": "irritado com",
  "torch": "tocha, lanterna",
  "lend lent lent": "emprestar",
  "incur": "incorrer em, atrair",
  "used to": "costumava, antes fazia",
  "am is are": "ser, estar (sou, é, são)",
  "i don't mind": "não me importo, por mim tudo bem",
  "won't": "não vai, não irá",
  "deal": "acordo, negócio, lidar",
  "check out": "dar uma olhada, fazer check-out",
  "sorry": "desculpe, sinto muito",
  "exactly": "exatamente, com certeza",
  "shall we say": "digamos, por assim dizer",
  "gotta": "ter que, precisar",
  "reach": "alcançar, atingir, chegar a",
  "shop": "loja, fazer compras",
  "cell": "célula, cela",
  "realize": "perceber, dar-se conta",
  "free": "grátis, livre, libertar",
  "lot": "muito, lote, terreno",
  "care about": "importar-se com, preocupar-se",
  "be able to": "ser capaz de, conseguir",
  "peer": "colega, espiar, espreitar",
  "liability": "responsabilidade, passivo",
  "limb": "membro, galho",
  "unplug": "desconectar, desligar da tomada",
  "up": "para cima, acima",
  "nonprofit": "sem fins lucrativos",
  "frankly": "francamente, honestamente",
  "indoor": "interno, em ambientes fechados",
  "actions speak louder than words": "ações valem mais que palavras",
  "who can tell": "quem sabe, vai saber",
  "any news": "alguma novidade?",
  "what's up": "e aí?, o que manda?",
  "what happened": "o que aconteceu?",
  "apply for": "candidatar-se a, concorrer a",
  "tread trod trodden": "pisar, trilhar",
  "bust bust/busted bust/busted": "quebrar, estourar, prender",
  "scared of": "com medo de, assustado com",
  "spring": "primavera, mola",
  "well": "bem, poço, bom",
  "bark": "latir, casca de árvore",
  "bat": "morcego, bastão",
  "fan": "ventilador, fã",
  "jam": "geleia, congestionamento",
  "light": "luz, claro, leve",
  "bank": "banco, margem",
  "ring": "anel, tocar, ligar",
  "saw": "serra, serrar, viu",
  "second": "segundo, segundo lugar",
  "present": "presente, atual",
  "content": "conteúdo, satisfeito",
  "refuse": "recusar, lixo",
  "firm": "empresa, firme",
  "flat": "plano, apartamento",
  "letter": "letra, carta",
  "mean": "significar, mau, média",
  "order": "pedido, ordem",
  "pound": "libra, bater",
  "rest": "descanso, resto, demais",
  "sink": "pia, afundar",
  "spell": "soletrar, feitiço",
  "stick": "pau, graveto, colar",
  "table": "mesa, tabela",
  "board": "quadro, diretoria, embarcar",
  "cross": "cruzar, cruz",
  "file": "arquivo, lixa",
  "head": "cabeça, liderar",
  "point": "ponto, apontar, sentido",
  "post": "postar, correio, cargo",
  "ship": "navio, enviar",
  "space": "espaço, vaga",
  "suit": "terno, combinar, servir",
  "will": "vontade, testamento, irá",
  "look at": "olhar para",
  "hold on": "esperar, aguardar",
  "keep up": "manter o ritmo, acompanhar",
  "show up": "aparecer, dar as caras",
  "slow down": "desacelerar, ir mais devagar",
  "work out": "treinar, dar certo, resolver",
  "give up": "desistir, largar mão",
  "put on": "vestir, colocar",
  "check in": "fazer check-in, registrar-se",
  "calm down": "acalmar-se",
  "mean meant meant": "significar, pretender",
  "keep kept kept": "manter, guardar"
};
Object.assign(PT_BR_WORD_OVERRIDES, PT_BR_WORD_OVERRIDES_V3);

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

