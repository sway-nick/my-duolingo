// Pair-based "easy to confuse" collections.
//  - tricky_sounds   : 50 minimal pairs (100 words) that SOUND alike (train the ear). Third item = IPA contrast.
//  - confusing_words : 50 pairs (100 words) that LOOK alike (spelling / form traps).
// Pairs are sorted from most common (A1/A2 everyday English) to least common (B2/C1).
// Words are ordered pair-by-pair so that 10-per-page pagination always keeps both
// words of a pair (5 pairs per page, 10 pages total) on the same page.

export const TRICKY_SOUNDS_ID = 'tricky_sounds';
export const CONFUSING_WORDS_ID = 'confusing_words';

export const TRICKY_SOUNDS_PAIRS = [
  // Page 1 — Top everyday A1 traps
  ['half', 'have', '/f/ ≠ /v/'],
  ['live', 'leave', '/ɪ/ ≠ /iː/'],
  ['walk', 'work', '/ɔː/ ≠ /ɜː/'],
  ['bad', 'bed', '/æ/ ≠ /e/'],
  ['light', 'right', '/l/ ≠ /r/'],
  // Page 2 — Very common A1
  ['three', 'free', '/θ/ ≠ /f/'],
  ['not', 'note', '/ɒ/ ≠ /əʊ/'],
  ['sit', 'seat', '/ɪ/ ≠ /iː/'],
  ['house', 'horse', '/aʊ/ ≠ /ɔː/'],
  ['short', 'shirt', '/ɔː/ ≠ /ɜː/'],
  // Page 3 — Common A1–A2
  ['gold', 'cold', '/g/ ≠ /k/'],
  ['dry', 'try', '/d/ ≠ /t/'],
  ['back', 'pack', '/b/ ≠ /p/'],
  ['safe', 'save', '/f/ ≠ /v/'],
  ['full', 'fool', '/ʊ/ ≠ /uː/'],
  // Page 4 — Common A2
  ['think', 'sink', '/θ/ ≠ /s/'],
  ['fit', 'feet', '/ɪ/ ≠ /iː/'],
  ['send', 'sand', '/e/ ≠ /æ/'],
  ['dead', 'dad', '/e/ ≠ /æ/'],
  ['glass', 'grass', '/l/ ≠ /r/'],
  // Page 5 — Everyday A2
  ['cup', 'cap', '/ʌ/ ≠ /æ/'],
  ['ship', 'sheep', '/ɪ/ ≠ /iː/'],
  ['price', 'prize', '/s/ ≠ /z/'],
  ['pull', 'pool', '/ʊ/ ≠ /uː/'],
  ['bit', 'beat', '/ɪ/ ≠ /iː/'],
  // Page 6 — A2–B1
  ['play', 'pray', '/l/ ≠ /r/'],
  ['thick', 'sick', '/θ/ ≠ /s/'],
  ['bird', 'bored', '/ɜː/ ≠ /ɔː/'],
  ['bone', 'born', '/əʊ/ ≠ /ɔː/'],
  ['mouse', 'mouth', '/s/ ≠ /θ/'],
  // Page 7 — A2–B1
  ['bear', 'beer', '/eə/ ≠ /ɪə/'],
  ['pan', 'pen', '/æ/ ≠ /e/'],
  ['luck', 'lack', '/ʌ/ ≠ /æ/'],
  ['guess', 'gas', '/e/ ≠ /æ/'],
  ['farm', 'firm', '/ɑː/ ≠ /ɜː/'],
  // Page 8 — B1
  ['boat', 'vote', '/b/ ≠ /v/'],
  ['thank', 'tank', '/θ/ ≠ /t/'],
  ['tie', 'die', '/t/ ≠ /d/'],
  ['fly', 'fry', '/l/ ≠ /r/'],
  ['lend', 'land', '/e/ ≠ /æ/'],
  // Page 9 — B1
  ['chip', 'cheap', '/ɪ/ ≠ /iː/'],
  ['hill', 'heel', '/ɪ/ ≠ /iː/'],
  ['bug', 'bag', '/ʌ/ ≠ /æ/'],
  ['bat', 'bet', '/æ/ ≠ /e/'],
  ['port', 'pot', '/ɔː/ ≠ /ɒ/'],
  // Page 10 — B1–B2
  ['goat', 'coat', '/g/ ≠ /k/'],
  ['ban', 'van', '/b/ ≠ /v/'],
  ['pill', 'peel', '/ɪ/ ≠ /iː/'],
  ['cart', 'cat', '/ɑː/ ≠ /æ/'],
  ['bin', 'bean', '/ɪ/ ≠ /iː/'],
];

export const CONFUSING_WORDS_PAIRS = [
  // Page 1 — Top everyday A1–A2 traps
  ['hear', 'here'],
  ['through', 'though'],
  ['quiet', 'quite'],
  ['whether', 'weather'],
  ['wait', 'weight'],
  // Page 2 — Very common A2
  ['lose', 'loose'],
  ['accept', 'except'],
  ['whole', 'hole'],
  ['piece', 'peace'],
  ['lie', 'lay'],
  // Page 3 — Common A2–B1
  ['advice', 'advise'],
  ['affect', 'effect'],
  ['raise', 'rise'],
  ['breath', 'breathe'],
  ['bored', 'board'],
  // Page 4 — Common A2–B1
  ['desert', 'dessert'],
  ['later', 'latter'],
  ['cell', 'sell'],
  ['role', 'roll'],
  ['sight', 'site'],
  // Page 5 — B1
  ['pair', 'pear'],
  ['brake', 'break'],
  ['steal', 'steel'],
  ['sweat', 'sweet'],
  ['flour', 'flower'],
  // Page 6 — B1
  ['fair', 'fare'],
  ['beside', 'besides'],
  ['personal', 'personnel'],
  ['sauce', 'source'],
  ['root', 'route'],
  // Page 7 — B1
  ['recipe', 'receipt'],
  ['custom', 'costume'],
  ['angel', 'angle'],
  ['wander', 'wonder'],
  ['adapt', 'adopt'],
  // Page 8 — B1–B2
  ['suit', 'suite'],
  ['classic', 'classical'],
  ['historic', 'historical'],
  ['electric', 'electrical'],
  ['economic', 'economical'],
  // Page 9 — B2
  ['sensible', 'sensitive'],
  ['principal', 'principle'],
  ['tail', 'tale'],
  ['heal', 'heel'],
  ['die', 'dye'],
  // Page 10 — B2–C1
  ['pray', 'prey'],
  ['conscience', 'conscious'],
  ['council', 'counsel'],
  ['imply', 'infer'],
  ['elicit', 'illicit'],
];

export const PAIR_COLLECTIONS = {
  [TRICKY_SOUNDS_ID]: TRICKY_SOUNDS_PAIRS,
  [CONFUSING_WORDS_ID]: CONFUSING_WORDS_PAIRS,
};

export function isPairCollection(collectionId) {
  return Object.prototype.hasOwnProperty.call(PAIR_COLLECTIONS, collectionId);
}

export function getPairWordKeys(collectionId) {
  const pairs = PAIR_COLLECTIONS[collectionId] || [];
  const keys = [];
  pairs.forEach(([a, b]) => {
    keys.push(a, b);
  });
  return keys;
}

// Returns { partner, contrast } for a word of a pair collection, or null.
export function getPairInfo(collectionId, wordText) {
  const pairs = PAIR_COLLECTIONS[collectionId];
  if (!pairs || !wordText) return null;
  const key = String(wordText).toLowerCase().trim();
  for (let i = 0; i < pairs.length; i++) {
    const [a, b, contrast] = pairs[i];
    if (a === key) return { partner: b, contrast: contrast || '', pairIndex: i + 1, pairTotal: pairs.length };
    if (b === key) return { partner: a, contrast: contrast || '', pairIndex: i + 1, pairTotal: pairs.length };
  }
  return null;
}
