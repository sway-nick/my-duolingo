import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

if (typeof global.window === 'undefined') {
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  };
}
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    _store: {
      myduo_interface_lang: 'ru',
      myduo_lang_manual: 'true',
    },
    getItem(k) {
      return Object.prototype.hasOwnProperty.call(this._store, k) ? this._store[k] : null;
    },
    setItem(k, v) {
      this._store[k] = String(v);
    },
    removeItem(k) {
      delete this._store[k];
    },
    clear() {
      this._store = { myduo_interface_lang: 'ru', myduo_lang_manual: 'true' };
    },
  };
}
if (typeof global.CustomEvent === 'undefined') {
  global.CustomEvent = class {
    constructor(name, opts) {
      this.name = name;
      this.detail = opts ? opts.detail : null;
    }
  };
}

const wordsData = JSON.parse(fs.readFileSync(path.resolve('frontend/assets/data/words.json'), 'utf8'));

function assertAll36Locales(obj, label, SUPPORTED_LOCALE_CODES) {
  assert.ok(obj && typeof obj === 'object', `${label} must be an object`);
  for (const loc of SUPPORTED_LOCALE_CODES) {
    const val = obj[loc];
    assert.equal(typeof val, 'string', `${label} missing locale "${loc}"`);
    assert.ok(val.trim().length > 0, `${label} empty for locale "${loc}"`);
    assert.equal(val.includes('\uFFFD'), false, `${label} has U+FFFD for "${loc}"`);
  }
}

test('Item 1: Prepositions data covers 9 groups (175 items) across all 36 locales', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { PREPOSITIONS_META_I18N, PREPOSITIONS_GROUPS } = await import('../frontend/components/favorites/prepositionsData.js');

  assert.equal(SUPPORTED_LOCALE_CODES.length, 36);
  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    const meta = PREPOSITIONS_META_I18N[loc];
    assert.ok(meta && meta.tileTitle && meta.hubTitle, `PREPOSITIONS_META_I18N missing "${loc}"`);
  }

  assert.equal(PREPOSITIONS_GROUPS.length, 9);
  const expectedCounts = {
    time: 27,
    place: 35,
    direction: 24,
    cause: 15,
    manner: 14,
    topic: 16,
    concession: 12,
    exception: 17,
    measure: 15,
  };
  let total = 0;
  for (const grp of PREPOSITIONS_GROUPS) {
    assert.equal(grp.items.length, expectedCounts[grp.id], `Group ${grp.id} item count`);
    total += grp.items.length;
    assertAll36Locales(grp.title, `prep group ${grp.id} title`, SUPPORTED_LOCALE_CODES);
    assertAll36Locales(grp.desc, `prep group ${grp.id} desc`, SUPPORTED_LOCALE_CODES);
    for (const it of grp.items) {
      assert.ok(it.word && it.example, `prep item "${it.word}" must have word & example`);
      assertAll36Locales(it.tr, `prep "${grp.id}:${it.word}"`, SUPPORTED_LOCALE_CODES);
    }
  }
  assert.equal(total, 175);
});

test('Item 2: Pronouns matrix (8x5) and 7 groups (59 items) cover all 36 locales', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { PRONOUNS_META_I18N, PRONOUNS_MATRIX, PRONOUNS_GROUPS } = await import('../frontend/components/favorites/pronounsData.js');

  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    assert.ok(PRONOUNS_META_I18N[loc]?.tileTitle && PRONOUNS_META_I18N[loc]?.matrixTitle, `PRONOUNS_META_I18N missing "${loc}"`);
  }

  assert.equal(PRONOUNS_MATRIX.rows.length, 8);
  for (const col of ['person', 'subject', 'object', 'possessiveDep', 'possessiveAbs', 'reflexive']) {
    assertAll36Locales(PRONOUNS_MATRIX.headers[col], `pronoun header ${col}`, SUPPORTED_LOCALE_CODES);
  }
  for (const row of PRONOUNS_MATRIX.rows) {
    assertAll36Locales(row.personLabel, `pronoun row ${row.id} label`, SUPPORTED_LOCALE_CODES);
    for (const formKey of ['subject', 'object', 'possessiveDep', 'possessiveAbs', 'reflexive']) {
      assert.ok(row[formKey]?.word, `row ${row.id} ${formKey} word missing`);
      assertAll36Locales(row[formKey].tr, `row ${row.id} ${formKey}`, SUPPORTED_LOCALE_CODES);
    }
  }

  assert.equal(PRONOUNS_GROUPS.length, 7);
  const expectedCounts = {
    demonstrative: 6,
    interrogative: 5,
    relative: 9,
    indefinite: 22,
    negative: 6,
    universal: 9,
    reciprocal: 2,
  };
  let total = 0;
  for (const grp of PRONOUNS_GROUPS) {
    assert.equal(grp.items.length, expectedCounts[grp.id], `Pronoun group ${grp.id} count`);
    total += grp.items.length;
    assertAll36Locales(grp.title, `pronoun group ${grp.id} title`, SUPPORTED_LOCALE_CODES);
    assertAll36Locales(grp.desc, `pronoun group ${grp.id} desc`, SUPPORTED_LOCALE_CODES);
    for (const it of grp.items) {
      assertAll36Locales(it.tr, `pronoun "${grp.id}:${it.word}"`, SUPPORTED_LOCALE_CODES);
    }
  }
  assert.equal(total, 59);
});

test('Items 3 & 4: Conjunctions (FANBOYS, Correlative, Subordinating) & Conjunctive Adverbs cover all 36 locales', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { CONJUNCTIONS_META_I18N, CONJUNCTIONS_SECTIONS } = await import('../frontend/components/favorites/conjunctionsData.js');

  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    const m = CONJUNCTIONS_META_I18N[loc];
    assert.ok(m?.tileTitle && m?.punctuationTitle && m?.punctuationRule, `CONJUNCTIONS_META_I18N missing "${loc}"`);
    assert.ok(Array.isArray(m.punctuationExamples) && m.punctuationExamples.length >= 2);
  }

  assert.equal(CONJUNCTIONS_SECTIONS.length, 4);
  const byId = Object.fromEntries(CONJUNCTIONS_SECTIONS.map((s) => [s.id, s]));
  assert.equal(byId.coordinating.items.length, 7);
  assert.equal(byId.correlative.items.length, 13);
  assert.equal(byId.subordinating.groups.length, 9);
  assert.equal(byId.conjunctive_adverbs.groups.length, 8);

  const subNominal = byId.subordinating.groups.find((g) => g.id === 'sub_nominal');
  assert.ok(subNominal && subNominal.items.length === 3, 'Nominal content conjunctions (that, whether, if) present');

  for (const sec of CONJUNCTIONS_SECTIONS) {
    assertAll36Locales(sec.title, `conj section ${sec.id} title`, SUPPORTED_LOCALE_CODES);
    assertAll36Locales(sec.desc, `conj section ${sec.id} desc`, SUPPORTED_LOCALE_CODES);
    const items = sec.items || sec.groups.flatMap((g) => {
      assertAll36Locales(g.title, `conj subgroup ${g.id} title`, SUPPORTED_LOCALE_CODES);
      assertAll36Locales(g.desc, `conj subgroup ${g.id} desc`, SUPPORTED_LOCALE_CODES);
      return g.items;
    });
    for (const it of items) {
      assertAll36Locales(it.tr, `conj "${sec.id}:${it.word}"`, SUPPORTED_LOCALE_CODES);
    }
  }
});

test('Item 6: Word Order Tiles cover rules 9, 52, 60, 72 across all 36 locales', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { WORD_ORDER_TILES_UI_I18N, WORD_ORDER_TILES_BY_RULE_ID } = await import('../frontend/components/favorites/wordOrderTilesData.js');

  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    const ui = WORD_ORDER_TILES_UI_I18N[loc];
    assert.ok(ui?.heading && ui?.instruction && ui?.checkBtn && ui?.resetBtn, `WORD_ORDER_TILES_UI_I18N missing "${loc}"`);
  }

  for (const ruleId of [9, 52, 60, 72]) {
    const exList = WORD_ORDER_TILES_BY_RULE_ID[ruleId];
    assert.ok(Array.isArray(exList) && exList.length >= 4, `Rule ${ruleId} must have >= 4 tile exercises`);
    for (const ex of exList) {
      assert.ok(Array.isArray(ex.answerTokens) && ex.answerTokens.length >= 3);
      assert.equal(ex.tiles.length, ex.answerTokens.length);
      assert.deepEqual([...ex.tiles].sort(), [...ex.answerTokens].sort(), `${ex.id} tiles must match answerTokens multiset`);
      assert.notDeepEqual(ex.tiles, ex.answerTokens, `${ex.id} tiles must be shuffled, not already solved`);
      assertAll36Locales(ex.tr, `tile ${ex.id} tr`, SUPPORTED_LOCALE_CODES);
    }
  }
});

test('Items 7, 8, 9, 10: Tense Matrix color coding, V2/V3 links, aux verbs guide & been to', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { TENSE_CONSTRUCTIONS_I18N } = await import('../frontend/components/favorites/grammarUiTranslations.js');
  const { TENSE_CONSTRUCTIONS } = await import('../frontend/components/favorites/tenseConstructionsData.js');
  const { getTenseAuxGuide, getPresentPerfectBeenToNote, getContinuousStativeNote } = await import('../frontend/components/favorites/tenseAuxGuideData.js');
  const { formatColorCodedFormulaHtml } = await import('../frontend/components/favorites/TenseConstructionsView.js');
  const {
    PASSIVE_MATRIX_I18N,
    PASSIVE_MATRIX_CELLS,
    PASSIVE_EXTRAS,
  } = await import('../frontend/components/favorites/passiveMatrixData.js');
  const { MICRO_RULES } = await import('../frontend/components/favorites/microRulesData.js');

  assert.equal(TENSE_CONSTRUCTIONS_I18N.ru.auxLabel, 'Вспомогательные глаголы');
  assert.equal(TENSE_CONSTRUCTIONS_I18N.en.auxLabel, 'Auxiliary verbs');

  const ruleIdsSet = new Set(MICRO_RULES.map((r) => r.id));
  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    const pm = PASSIVE_MATRIX_I18N[loc];
    for (const k of [
      'activeVoiceBtn', 'passiveVoiceBtn', 'passiveHint', 'notUsedBadge', 'notUsedSub',
      'extrasHeading', 'modalsTitle', 'basicsTitle', 'causativeTitle', 'openRuleTag',
    ]) {
      assert.ok(typeof pm?.[k] === 'string' && pm[k].trim().length > 0, `PASSIVE_MATRIX_I18N.${loc}.${k} missing`);
      assert.equal(pm[k].includes('\uFFFD'), false);
    }
    const note = getPresentPerfectBeenToNote(loc);
    assert.ok(note?.title && note?.wrongSentence && note?.rightSentence && Array.isArray(note.bullets) && note.bullets.length >= 3, `beenTo note missing for "${loc}"`);
    const stativeNote = getContinuousStativeNote(loc);
    assert.ok(stativeNote?.title && stativeNote?.wrongSentence && stativeNote?.rightSentence && stativeNote?.summary, `stativeNote missing for "${loc}"`);
    for (const tc of TENSE_CONSTRUCTIONS) {
      const guide = getTenseAuxGuide(tc.id, loc);
      assert.ok(typeof guide === 'string' && guide.trim().length > 0, `auxGuide missing for ${tc.id} / ${loc}`);
      assert.equal(guide.includes('\uFFFD'), false);
    }
  }

  const passiveEntries = Object.entries(PASSIVE_MATRIX_CELLS);
  assert.equal(passiveEntries.length, 12, 'PASSIVE_MATRIX_CELLS has 12 cells');
  const activePassiveCells = passiveEntries.filter(([, c]) => !c.notUsed);
  const unusedPassiveCells = passiveEntries.filter(([, c]) => c.notUsed);
  assert.equal(activePassiveCells.length, 8, 'Passive matrix has 8 active cells');
  assert.equal(unusedPassiveCells.length, 4, 'Passive matrix marks 4 unused cells');
  for (const [, cell] of activePassiveCells) {
    assert.ok(cell.pos.includes('V3') && cell.neg.includes('V3') && cell.ques.includes('V3'), `${cell.id} must include V3`);
    assert.ok(ruleIdsSet.has(cell.ruleId), `${cell.id} ruleId must exist in MICRO_RULES`);
  }
  assert.equal(PASSIVE_EXTRAS.length, 3);
  for (const ex of PASSIVE_EXTRAS) {
    assert.ok(ruleIdsSet.has(ex.ruleId), `${ex.id} ruleId must exist in MICRO_RULES`);
  }
  const passiveBeingHtml = formatColorCodedFormulaHtml('S + am / is / are + being + V3');
  assert.ok(passiveBeingHtml.includes('tc-tok-cont') && passiveBeingHtml.includes('being') && !passiveBeingHtml.includes('tc-tok-cont">be</span>ing'), 'highlights being as single token');
  assert.ok(passiveBeingHtml.includes('data-open-irregular="V3"'), 'Passive V3 renders clickable badge');

  const pp = TENSE_CONSTRUCTIONS.find((t) => t.id === 'present_perfect');
  assert.ok(pp.quiz.some((q) => /been\s+___\s+london/i.test(q.blanked) && q.answer === 'to'), 'present_perfect quiz tests been to');

  const html = formatColorCodedFormulaHtml('S + have / has + V3');
  assert.ok(html.includes('tc-tok-perf'), 'highlights have/has pattern');
  assert.ok(html.includes('data-open-irregular="V3"'), 'renders clickable V3 link badge');

  const tcViewSrc = fs.readFileSync(path.resolve('frontend/components/favorites/TenseConstructionsView.js'), 'utf8');
  assert.ok(
    tcViewSrc.includes('width: max-content;') &&
    tcViewSrc.includes('min-width: 280px;') &&
    tcViewSrc.includes('.tc-matrix-table .tc-matrix-cell-formula') &&
    tcViewSrc.includes('.tc-matrix-th-formulas > div') &&
    tcViewSrc.includes('white-space: nowrap;') &&
    tcViewSrc.includes('data-matrix-voice="passive"') &&
    tcViewSrc.includes('PASSIVE_MATRIX_CELLS'),
    'TenseConstructionsView matrix columns are wide with non-wrapping formulas and Active/Passive voice toggle'
  );
});

test('Item 11: NavigationStack, NumbersFolderView, and 10 Cross-Link families', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { pushNavReturn, popNavReturn, hasNavReturn, clearNavReturn } = await import('../frontend/services/navigationStack.js');
  const { NUMBERS_FOLDER_I18N } = await import('../frontend/components/favorites/NumbersFolderView.js');
  const { CROSS_LINK_I18N, getRelatedLinksForMicroRule, getRelatedMicroRulesForTense, getRelatedMicroRulesForCollection } = await import('../frontend/components/favorites/crossLinksMap.js');

  clearNavReturn();
  assert.equal(hasNavReturn(), false);
  const trace = [];
  pushNavReturn({ label: 'parent1', restore: () => trace.push('p1') });
  pushNavReturn({ label: 'parent2', restore: () => trace.push('p2') });
  assert.equal(hasNavReturn(), true);
  assert.equal(popNavReturn(), true);
  assert.equal(popNavReturn(), true);
  assert.equal(popNavReturn(), false);
  assert.deepEqual(trace, ['p2', 'p1']);

  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    assert.ok(NUMBERS_FOLDER_I18N[loc]?.folderTitle && NUMBERS_FOLDER_I18N[loc]?.cardinalsTitle && NUMBERS_FOLDER_I18N[loc]?.ordinalsTitle, `NUMBERS_FOLDER_I18N missing "${loc}"`);
    assert.ok(CROSS_LINK_I18N[loc]?.relatedHeading && CROSS_LINK_I18N[loc]?.numbersHub, `CROSS_LINK_I18N missing "${loc}"`);
  }

  assert.ok(getRelatedLinksForMicroRule(6, 'speech_parts').some((l) => l.targetType === 'numbers_hub'));
  assert.ok(getRelatedLinksForMicroRule(27, 'prepositions').some((l) => l.targetType === 'grammar_prepositions'));
  assert.ok(getRelatedLinksForMicroRule(13, 'pronouns').some((l) => l.targetType === 'grammar_pronouns'));
  assert.ok(getRelatedLinksForMicroRule(106, 'conjunctions_contrast').some((l) => l.targetType === 'grammar_conjunctions'));
  assert.ok(getRelatedLinksForMicroRule(35, 'tenses_basic').some((l) => l.targetType === 'irregular_verbs_packs'));
  assert.ok(getRelatedLinksForMicroRule(111, 'phrasal_verbs').some((l) => l.targetId === 'phrasal_verbs'));
  assert.ok(getRelatedLinksForMicroRule(76, 'tricky_pairs').some((l) => l.targetId === 'confusing_words'));
  assert.ok(getRelatedLinksForMicroRule(47, 'comparatives').some((l) => l.targetId === 'adjectives'));
  assert.ok(getRelatedLinksForMicroRule(31, 'prepositions').some((l) => l.targetId === 'months'));
  assert.ok(getRelatedLinksForMicroRule(59, 'tenses_perfect').some((l) => l.targetType === 'tense_construction' && l.targetId === 'present_perfect'));
  assert.ok(getRelatedMicroRulesForTense('present_perfect').includes(59));
  assert.ok(getRelatedMicroRulesForCollection('numbers').includes(6));
});

test('Item 13: Irregular Verbs 10 mnemonic packs cover 100% of irregular verbs in words.json + intro & numerals digits', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { IRREGULAR_PACKS_UI_I18N, IRREGULAR_VERB_PACKS, groupIrregularVerbsByPack } = await import('../frontend/components/favorites/irregularVerbsPacksData.js');
  const { getWordTranslation } = await import('../frontend/services/api.js');
  const { getCollectionWords } = await import('../frontend/services/collectionsService.js');

  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    const ui = IRREGULAR_PACKS_UI_I18N[loc];
    assert.ok(ui?.hubTitle && ui?.learnPackBtn, `IRREGULAR_PACKS_UI_I18N missing "${loc}"`);
    for (const k of ['introTitle', 'introDiff', 'introV1Desc', 'introV2Desc', 'introV3Desc']) {
      assert.ok(typeof ui?.[k] === 'string' && ui[k].trim().length > 0, `IRREGULAR_PACKS_UI_I18N.${loc}.${k} missing`);
      assert.equal(ui[k].includes('\uFFFD'), false);
    }
  }

  assert.equal(IRREGULAR_VERB_PACKS.length, 10);
  for (const pack of IRREGULAR_VERB_PACKS) {
    assertAll36Locales(pack.title, `pack ${pack.id} title`, SUPPORTED_LOCALE_CODES);
    assertAll36Locales(pack.mnemonic, `pack ${pack.id} mnemonic`, SUPPORTED_LOCALE_CODES);
  }

  const totalIrregularInDict = wordsData.filter((w) => w.category === 'Irregular verbs').length;
  const grouped = groupIrregularVerbsByPack(wordsData);
  const groupedTotal = grouped.reduce((sum, p) => sum + p.words.length, 0);
  assert.equal(groupedTotal, totalIrregularInDict, 'All irregular verbs in words.json must be mapped into the 10 packs');

  // Verify every word in numbers (30) and ordinal_numbers (20) contains digits in translation & all 36 locales
  const cardinalWords = getCollectionWords('numbers', wordsData);
  const ordinalWords = getCollectionWords('ordinal_numbers', wordsData);
  assert.equal(cardinalWords.length, 30, 'numbers collection has 30 words');
  assert.equal(ordinalWords.length, 20, 'ordinal_numbers collection has 20 words');
  for (const w of [...cardinalWords, ...ordinalWords]) {
    assert.ok(/\d/.test(w.translation), `${w.word} base translation must contain digits (got "${w.translation}")`);
    for (const loc of SUPPORTED_LOCALE_CODES) {
      const tr = loc === 'ru' ? w.translation : (w.translations?.[loc] || '');
      assert.ok(/\d/.test(tr), `${w.word} [${loc}] translation must contain digits (got "${tr}")`);
    }
  }
  const sixteen = cardinalWords.find((w) => w.word === 'sixteen');
  assert.ok(/\b16\b/.test(getWordTranslation(sixteen, 'ru')), 'sixteen ru translation shows (16)');
  const firstOrd = ordinalWords.find((w) => w.word === 'first');
  assert.ok(/\b1/.test(getWordTranslation(firstOrd, 'ru')), 'first ru translation shows digit 1');
});

test('Items 12 & 14: Spoken English practiceBtn and Daily News dictionary save across all 36 locales', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { SPOKEN_ENGLISH_I18N } = await import('../frontend/components/favorites/spokenEnglishI18n.js');
  const { NEWS_I18N } = await import('../frontend/services/newsI18n.js');
  const newsMod = await import('../frontend/components/favorites/DailyNewsView.js');

  for (const loc of SUPPORTED_LOCALE_CODES) {
    assert.ok(SPOKEN_ENGLISH_I18N[loc]?.practiceBtn?.trim().length > 0, `SPOKEN_ENGLISH_I18N[${loc}].practiceBtn missing`);
    for (const k of ['addToDictBtn', 'inDictBadge', 'keyVocabHeading', 'savedWordToast']) {
      assert.ok(NEWS_I18N[loc]?.[k]?.trim().length > 0, `NEWS_I18N[${loc}].${k} missing`);
    }
  }
  assert.equal(typeof newsMod.saveNewsWordToDictionary, 'function');
});

test('Item 15: Rule #63 (Agree) contrast card and quiz traps across 36 locales', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { MISTAKE_CARD_LABELS_I18N, RULE_MISTAKE_CARDS } = await import('../frontend/components/favorites/ruleMistakeCardsData.js');
  const { MICRO_RULES } = await import('../frontend/components/favorites/microRulesData.js');

  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    assert.ok(MISTAKE_CARD_LABELS_I18N[loc]?.wrongLabel && MISTAKE_CARD_LABELS_I18N[loc]?.rightLabel, `MISTAKE_CARD_LABELS_I18N missing "${loc}"`);
  }

  const cards63 = RULE_MISTAKE_CARDS[63];
  assert.ok(Array.isArray(cards63) && cards63.length === 4);
  assert.ok(cards63[0].wrong.includes('~~am~~') && cards63[0].right === 'I agree.');
  for (const c of cards63) {
    assertAll36Locales(c.meaning, `mistake card 63 meaning (${c.right})`, SUPPORTED_LOCALE_CODES);
  }

  const r63 = MICRO_RULES.find((r) => r.id === 63);
  assert.ok(r63.quiz.some((q) => q.answer === 'Do' && q.options.includes('Are')), 'Rule 63 tests Do vs Are agree');
  assert.ok(r63.quiz.some((q) => q.answer === "don't" && q.options.includes('am not')), 'Rule 63 tests don\'t vs am not agree');
});

test('Item 16: CEFR Level Readiness Matrix, 2-3 Q/Topic Exams, Topic %, PRO Gating & Nudge Modal (A1-C1)', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const {
    LEVEL_MATRIX_I18N,
    CEFR_LEVEL_BLUEPRINTS,
    computeLevelReadiness,
    buildLevelExamQuestions,
    computeExamTopicStats,
    savePassedCefrExam,
    loadPassedCefrExams,
    getLevelMatrixStrings,
  } = await import('../frontend/components/favorites/levelMatrixData.js');
  const {
    CEFR_LEVEL_PROFILE_I18N,
    CEFR_EXAM_TOPICS,
    getCefrLevelProfile,
  } = await import('../frontend/components/favorites/cefrExamBankData.js');
  const { MICRO_RULES } = await import('../frontend/components/favorites/microRulesData.js');
  const { TENSE_CONSTRUCTIONS } = await import('../frontend/components/favorites/tenseConstructionsData.js');
  const { CONJUNCTIONS_SECTIONS } = await import('../frontend/components/favorites/conjunctionsData.js');
  const {
    STORAGE_KEY_CEFR_NUDGE,
    evaluateCefrNudgeCandidate,
  } = await import('../frontend/components/modals/LevelMatrixNudgeModal.js');

  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    const s = getLevelMatrixStrings(loc);
    assert.ok(s?.hubTitle && s?.startExamBtn && s?.closedStatus && s?.openStatus, `LEVEL_MATRIX_I18N missing "${loc}"`);
    for (const k of [
      'vocabRangeLabel', 'practicalSkillsHeading', 'topicBreakdownHeading',
      'mistakesReviewHeading', 'proErrorsLockTitle', 'proErrorsUnlockBtn',
      'freeA1MistakesNote', 'nudgeFirstTitle', 'nudgeReadyTitle', 'nudgeOpenMatrixBtn',
      'microRuleCutLabel', 'openFullRuleBtn', 'examplesLabel',
    ]) {
      assert.ok(typeof s[k] === 'string' && s[k].trim().length > 0, `LevelMatrix extra key "${k}" missing for "${loc}"`);
      assert.equal(s[k].includes('\uFFFD'), false);
    }
    assert.equal(/\b12\b/.test(s.examFailDesc || ''), false, `examFailDesc must not hardcode 12/15 for "${loc}"`);
  }

  // Verify zero non-Latin English bleed on fixed Level Matrix & Conjunction keys
  const nonLatin = ['ar', 'bn', 'bg', 'zh', 'el', 'hi', 'ja', 'kk', 'ko', 'fa', 'ru', 'th', 'uk', 'ur'];
  for (const loc of nonLatin) {
    const entry = LEVEL_MATRIX_I18N[loc];
    for (const k of ['grammar_prep', 'grammar_pron', 'grammar_conj']) {
      assert.notEqual(entry[k], LEVEL_MATRIX_I18N.en[k], `${loc}.${k} must not leak English`);
    }
    for (const sec of CONJUNCTIONS_SECTIONS) {
      assert.notEqual(sec.title[loc], sec.title.en, `CONJUNCTIONS_SECTIONS.${sec.id}.${loc} must not leak English`);
    }
  }

  // Verify CEFR micro-rule & tense level alignment
  const ruleIdsSet = new Set(MICRO_RULES.map((r) => r.id));
  assert.equal(MICRO_RULES.find((r) => /Present Continuous/i.test(r.title.en))?.level, 'A1', 'Present Continuous must be A1');
  assert.equal(MICRO_RULES.find((r) => /Past Simple: was\/were/i.test(r.title.en))?.level, 'A1', 'Basic Past Simple must be A1');
  assert.equal(MICRO_RULES.find((r) => /Past Continuous/i.test(r.title.en))?.level, 'A2', 'Past Continuous must be A2');
  assert.equal(MICRO_RULES.find((r) => /Present Perfect: Result/i.test(r.title.en))?.level, 'A2', 'Basic Present Perfect must be A2');
  assert.equal(MICRO_RULES.find((r) => /Zero & First Conditional/i.test(r.title.en))?.level, 'A2', 'Zero & First Conditionals must be A2');
  assert.equal(MICRO_RULES.find((r) => /Reported Speech: Tense Backshift/i.test(r.title.en))?.level, 'B1', 'Basic Reported Speech must be B1');
  assert.equal(MICRO_RULES.find((r) => /Phrasal Verbs: Basics/i.test(r.title.en))?.level, 'B1', 'Basic Phrasal Verbs must be B1');
  assert.equal(MICRO_RULES.find((r) => /Future Continuous/i.test(r.title.en))?.level, 'B2', 'Future Continuous must be B2');
  assert.equal(MICRO_RULES.find((r) => /Passive in Perfect, Continuous/i.test(r.title.en))?.level, 'B2', 'Complex Passive must be B2');
  assert.equal(TENSE_CONSTRUCTIONS.find((t) => t.id === 'past_continuous')?.level, 'A2');
  assert.equal(TENSE_CONSTRUCTIONS.find((t) => t.id === 'present_perfect')?.level, 'A2');
  assert.equal(TENSE_CONSTRUCTIONS.find((t) => t.id === 'future_simple')?.level, 'A2');
  assert.equal(TENSE_CONSTRUCTIONS.find((t) => t.id === 'future_continuous')?.level, 'B2');

  // Verify CEFR bank profiles, 2-3 questions per topic, and 100% microRuleId resolution
  for (const lvl of ['A1', 'A2', 'B1', 'B2', 'C1']) {
    assert.ok(CEFR_LEVEL_PROFILE_I18N[lvl]?.vocabRange && CEFR_LEVEL_PROFILE_I18N[lvl]?.vocabTargetWords > 0);
    for (const loc of SUPPORTED_LOCALE_CODES) {
      const prof = getCefrLevelProfile(lvl, loc);
      assert.ok(prof.skills && prof.skills.trim().length > 0 && !prof.skills.includes('\uFFFD'), `Missing skills for ${lvl}/${loc}`);
    }
    const topics = CEFR_EXAM_TOPICS[lvl];
    assert.ok(Array.isArray(topics) && topics.length >= 8, `${lvl} has >= 8 CEFR topics`);
    for (const top of topics) {
      assertAll36Locales(top.title, `CEFR topic ${top.topicId} title`, SUPPORTED_LOCALE_CODES);
      assert.ok(ruleIdsSet.has(top.microRuleId), `Topic ${top.topicId} must reference valid microRuleId (got ${top.microRuleId})`);
      assert.ok(top.questions.length >= 2 && top.questions.length <= 3, `Topic ${top.topicId} must have 2-3 distinct questions`);
      for (const q of top.questions) {
        assert.equal(q.options.length, 4);
        assert.equal(new Set(q.options).size, 4);
        assert.ok(q.options.includes(q.answer));
        const effRule = q.microRuleId || top.microRuleId;
        assert.ok(ruleIdsSet.has(effRule), `Question ${q.id} must resolve to valid microRuleId`);
        assertAll36Locales(q.explanation, `CEFR question ${q.id} explanation`, SUPPORTED_LOCALE_CODES);
      }
    }
  }
  const toBeAnswers = CEFR_EXAM_TOPICS.A1.find((t) => t.topicId === 'a1_to_be').questions.map((q) => q.answer);
  assert.deepEqual(new Set(toBeAnswers), new Set(['am', 'is', 'are']), 'A1 to be topic must test all 3 forms: am, is, are');

  global.localStorage.clear();
  assert.equal(evaluateCefrNudgeCandidate(wordsData, 'ru'), null, 'No nudge when 0 blocks closed');

  for (const lvl of ['A1', 'A2', 'B1', 'B2', 'C1']) {
    assert.ok(CEFR_LEVEL_BLUEPRINTS[lvl], `Blueprint missing for ${lvl}`);
    const readiness = computeLevelReadiness(lvl, wordsData, 'ru');
    assert.ok(readiness.totalBlocks >= 5, `${lvl} has mandatory blocks`);
    assert.ok(readiness.blocks.some((b) => b.id === `cefr_vocab:${lvl}`), `${lvl} includes vocabulary target block`);
    assert.ok(readiness.vocabRange && readiness.skills, `${lvl} readiness includes CEFR profile`);
    assert.equal(readiness.examPassed, false);
    for (const b of readiness.blocks) {
      assert.ok(b.linkTarget && b.linkTarget.targetType, `Block ${b.id} must have linkTarget`);
    }

    const questions = buildLevelExamQuestions(lvl, wordsData, 'ru');
    assert.ok(questions.length >= 48 && questions.length <= 52, `${lvl} comprehensive exam must have ~50 questions (got ${questions.length})`);
    const tilesQs = questions.filter((q) => q.type === 'tiles');
    const vocabQs = questions.filter((q) => q.category === 'vocabulary');
    assert.ok(tilesQs.length >= 3, `${lvl} exam must have >= 3 Word Order Tile questions (got ${tilesQs.length})`);
    assert.ok(vocabQs.length >= 10, `${lvl} exam must have >= 10 challenging vocabulary questions (got ${vocabQs.length})`);
    for (const q of questions) {
      assert.ok(q.topicId && q.topicTitle && q.blockId && q.linkTarget?.targetType, `Exam question in ${lvl} must reference topic & linkTarget`);
      assert.ok(ruleIdsSet.has(Number(q.microRuleId)), `Built exam question ${q.id} must resolve to valid microRuleId`);
      if (q.type === 'tiles') {
        assert.ok(Array.isArray(q.tiles) && Array.isArray(q.answerTokens));
      } else {
        assert.equal(q.options.length, 4);
        assert.equal(new Set(q.options).size, 4);
        assert.ok(q.options.includes(q.answer));
      }
    }

    // Verify per-topic percentage stats calculation + mistake microRuleId
    const sampleRecords = questions.map((q, idx) => ({
      question: q,
      userAnswer: idx % 2 === 0 ? q.answer : '__wrong__',
      correctAnswer: q.answer,
      isCorrect: idx % 2 === 0,
    }));
    const stats = computeExamTopicStats(questions, sampleRecords);
    assert.ok(stats.topicStats.length >= 8, `${lvl} topicStats covers all tested topics`);
    assert.ok(stats.mistakes.length > 0, `${lvl} records mistakes accurately`);
    assert.ok(stats.mistakes.every((m) => ruleIdsSet.has(Number(m.microRuleId))), `${lvl} every mistake includes valid microRuleId`);
    for (const ts of stats.topicStats) {
      assert.ok(ts.percent >= 0 && ts.percent <= 100);
    }
  }

  // Verify CEFR vocabulary targets aligned to actual dictionary sizes (Elementary=2554, Intermediate=2249, Advanced=1630)
  assert.equal(CEFR_LEVEL_PROFILE_I18N.A1.vocabTargetWords, 1250, 'A1 vocabTargetWords must be 1250');
  assert.equal(CEFR_LEVEL_PROFILE_I18N.A2.vocabTargetWords, 2554, 'A2 vocabTargetWords must be 2554');
  assert.equal(CEFR_LEVEL_PROFILE_I18N.B1.vocabTargetWords, 3680, 'B1 vocabTargetWords must be 3680');
  assert.equal(CEFR_LEVEL_PROFILE_I18N.B2.vocabTargetWords, 4803, 'B2 vocabTargetWords must be 4803');
  assert.equal(CEFR_LEVEL_PROFILE_I18N.C1.vocabTargetWords, 6433, 'C1 vocabTargetWords must be 6433');
  assert.equal(CEFR_LEVEL_PROFILE_I18N.A1.vocabRange, '1 250');
  assert.equal(CEFR_LEVEL_PROFILE_I18N.A2.vocabRange, '2 554');
  assert.equal(CEFR_LEVEL_PROFILE_I18N.B1.vocabRange, '3 680');
  assert.equal(CEFR_LEVEL_PROFILE_I18N.B2.vocabRange, '4 803');
  assert.equal(CEFR_LEVEL_PROFILE_I18N.C1.vocabRange, '6 433');
  assert.equal(LEVEL_MATRIX_I18N.ru.matrixTab, 'Матрица знаний');
  assert.equal(LEVEL_MATRIX_I18N.ru.hubTitle, 'Обязательные темы для каждого уровня согласно CEFR');
  for (const loc of SUPPORTED_LOCALE_CODES) {
    const lmLoc = LEVEL_MATRIX_I18N[loc];
    for (const k of ['matrixTab', 'hubTitle', 'examGateLockedTitle', 'examGateLockedBody', 'examGateConfirmBody', 'examGateYes', 'examGateNo', 'examGateOk', 'examGateProBtn']) {
      assert.ok(typeof lmLoc?.[k] === 'string' && lmLoc[k].trim().length > 0, `LEVEL_MATRIX_I18N.${loc}.${k} missing`);
    }
  }
  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    const t = LEVEL_MATRIX_I18N[loc].hubTitle;
    assert.equal(/CEFR/i.test(t), true, `hubTitle for "${loc}" must reference CEFR (got "${t}")`);
  }

  // Verify split numbers + ordinal_numbers in A1 blueprint
  const a1Cols = CEFR_LEVEL_BLUEPRINTS.A1.collections;
  assert.ok(a1Cols.some((c) => c.id === 'numbers') && a1Cols.some((c) => c.id === 'ordinal_numbers'), 'A1 collections splits numbers and ordinal_numbers');

  // Verify Nudge triggers when at least 1 A1 requirement is closed, and suppresses once recorded
  global.localStorage.setItem('myduo_microrules_done', JSON.stringify([1]));
  global.localStorage.setItem('myduo_grammar_ref_done', JSON.stringify(['prepositions:time']));
  const cand = evaluateCefrNudgeCandidate(wordsData, 'ru');
  assert.ok(cand && cand.levelId === 'A1' && cand.triggerType === 'first', 'Nudge triggers for A1 when >= 1 block closed');
  global.localStorage.setItem(STORAGE_KEY_CEFR_NUDGE, JSON.stringify({ A1: 'first' }));
  assert.equal(evaluateCefrNudgeCandidate(wordsData, 'ru'), null, 'Nudge does not repeat for same A1 first milestone');

  // Verify UI contracts across LevelMatrixView, GrammarReferenceView, Favorites 4-stage & green completion borders
  const lmViewSrc = fs.readFileSync(path.resolve('frontend/components/favorites/LevelMatrixView.js'), 'utf8');
  assert.ok(lmViewSrc.includes("isProActive() || activeLevel === 'A1'"), 'A1 mistakes free, A2-C1 gated to PRO');
  assert.ok(lmViewSrc.includes("ProService.openPaywall('cefr_exam_errors')"), 'PRO unlock button opens paywall');
  assert.ok(lmViewSrc.includes('lm-rule-cut'), 'LevelMatrixView renders expandable inline micro-rule cut under mistakes');
  assert.ok(lmViewSrc.includes('data-open-full-rule'), 'LevelMatrixView renders full rule navigation inside cut');
  assert.ok(lmViewSrc.includes('restoreExamState'), 'LevelMatrixView restores completed exam results on Back return');
  assert.ok(lmViewSrc.includes('lm-filled-answer') && lmViewSrc.includes('formatQuizBlankedHtml'), 'Substitutes answer in blanked sentence');
  assert.ok(lmViewSrc.includes('bindQuizWordPopover(') && lmViewSrc.includes('useWordPopover'), 'A1-A2 exam prompts support tap-to-translate');
  assert.equal(lmViewSrc.includes('s.examWrongMsg'), false, 'LevelMatrixView must not render redundant Wrong banner');
  assert.equal(lmViewSrc.includes('body.dark-mode'), false, 'LevelMatrixView must use .dark-theme, never body.dark-mode');
  assert.ok(lmViewSrc.includes('.dark-theme') && lmViewSrc.includes('#38bdf8'), 'LevelMatrixView uses dark-theme turquoise #38bdf8');

  const grefSrc = fs.readFileSync(path.resolve('frontend/components/favorites/GrammarReferenceView.js'), 'utf8');
  assert.equal(grefSrc.includes('data-group-filter="all"'), false, 'GrammarReferenceView removes "All" filter chip');
  assert.equal(grefSrc.includes('data-toggle-done'), false, 'GrammarReferenceView removes honour-system mark learned button');
  assert.ok(grefSrc.includes('gref-test-box') && grefSrc.includes('gref-filled-answer'), 'GrammarReferenceView renders inline group mini-test with answer substitution');
  assert.ok(grefSrc.includes('#38bdf8') && !grefSrc.includes('body.dark-mode'), 'GrammarReferenceView uses .dark-theme turquoise #38bdf8');

  const colHubSrc = fs.readFileSync(path.resolve('frontend/components/favorites/CollectionsHubView.js'), 'utf8');
  const numViewSrc = fs.readFileSync(path.resolve('frontend/components/favorites/NumbersFolderView.js'), 'utf8');
  const irvViewSrc = fs.readFileSync(path.resolve('frontend/components/favorites/IrregularVerbsPacksView.js'), 'utf8');
  const grammarHubSrc = fs.readFileSync(path.resolve('frontend/components/favorites/GrammarHubView.js'), 'utf8');
  const indexSrc = fs.readFileSync(path.resolve('frontend/index.html'), 'utf8');
  const trainingCardSrc = fs.readFileSync(path.resolve('frontend/components/training/TrainingCard.js'), 'utf8');
  assert.ok(colHubSrc.includes('is-completed') && numViewSrc.includes('is-completed') && irvViewSrc.includes('is-completed'), 'Completed green borders wired across collections, numbers, and irregular packs');
  assert.ok(indexSrc.includes('myduo_completed_collections') && indexSrc.includes('_favQuizPassIndex') && indexSrc.includes('favQuizStage'), 'index.html runs 4-stage quiz and saves myduo_completed_collections');
  assert.ok(trainingCardSrc.includes('favQuizStage'), 'TrainingCard honors favQuizStage');

  // Verify 3 monochrome dock icons (Compass -> Knowledge Matrix -> Globe News) on main hub & removed from GrammarHubView
  assert.equal(fs.existsSync(path.resolve('frontend/assets/icons/hub_nav_compass.webp')), true, 'hub_nav_compass.webp exists');
  assert.equal(fs.existsSync(path.resolve('frontend/assets/icons/hub_nav_checklist.webp')), true, 'hub_nav_checklist.webp exists');
  assert.equal(fs.existsSync(path.resolve('frontend/assets/icons/hub_nav_globe.webp')), true, 'hub_nav_globe.webp exists');
  assert.equal(grammarHubSrc.includes('data-grammar-id="level_matrix_exams"'), false, 'GrammarHubView removes level_matrix_exams tile');
  assert.ok(
    indexSrc.includes('hub-bottom-fabs') &&
    indexSrc.includes('hub-smart-path-fab') &&
    indexSrc.includes('hub-cefr-test-fab') &&
    indexSrc.includes('hub-daily-news-fab') &&
    indexSrc.includes('hub-dock-icon-img') &&
    indexSrc.includes('assets/icons/hub_nav_globe.webp'),
    'Main hub renders 3 monochrome dock icons (AI Sparkle, Graduation Cap, Globe)'
  );
  const fabsSectionIdx = indexSrc.indexOf("fabsWrap.id = 'hub-bottom-fabs'");
  const smartAppendIdx = indexSrc.indexOf("fabsWrap.appendChild(smartBtn)", fabsSectionIdx);
  const cefrAppendIdx = indexSrc.indexOf("fabsWrap.appendChild(cefrBtn)", fabsSectionIdx);
  const newsAppendIdx = indexSrc.indexOf("fabsWrap.appendChild(fabBtn)", fabsSectionIdx);
  assert.ok(
    fabsSectionIdx !== -1 && smartAppendIdx !== -1 && cefrAppendIdx > smartAppendIdx && newsAppendIdx > cefrAppendIdx,
    'Dock icon order must be Compass (Smart Path) -> Checklist (Matrix) -> Globe (News)'
  );

  savePassedCefrExam('A1');
  assert.equal(loadPassedCefrExams().has('A1'), true);
});

test('Item 17: Smart Course Path (100-word soft entry, proportional waves, 36 locales)', async () => {
  const { SUPPORTED_LOCALE_CODES } = await import('../frontend/config/locales.js');
  const { SMART_PATH_WAVE_TARGETS, buildSmartPathPlan } = await import('../frontend/services/smartPathService.js');
  const { SMART_PATH_I18N, getSmartPathStrings } = await import('../frontend/components/modals/SmartPathModal.js');

  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    const s = getSmartPathStrings(loc);
    assert.ok(SMART_PATH_I18N[loc], `SMART_PATH_I18N missing "${loc}"`);
    for (const k of [
      'title', 'subtitle', 'waveLabel', 'progressLabel', 'nextStepLabel', 'upcomingLabel',
      'startBtn', 'otherStepBtn', 'openMatrixBtn', 'closeLabel', 'typeVocab', 'typeMicroRule',
      'typeTense', 'typeGrammarRef', 'typeCollection', 'typeIrregular', 'typeSpoken',
      'typeExam', 'vocabDesc', 'examDesc', 'allDoneTitle', 'allDoneDesc',
    ]) {
      assert.ok(typeof s?.[k] === 'string' && s[k].trim().length > 0, `SMART_PATH_I18N.${loc}.${k} missing`);
      assert.equal(s[k].includes('\uFFFD'), false);
    }
  }
  assert.equal(SMART_PATH_I18N.ru.subtitle, 'Это умное продвижение по курсу (рекомендуется)');
  assert.equal(SMART_PATH_WAVE_TARGETS.A1[0], 25, 'A1 starts with 25-word micro-wave');
  assert.equal(SMART_PATH_WAVE_TARGETS.A1[1], 50, 'A1 Wave 2 targets 50 words');
  assert.equal(SMART_PATH_WAVE_TARGETS.A1.length, 50, 'A1 has 50 micro-waves up to 1250 words');
  assert.equal(SMART_PATH_WAVE_TARGETS.A1[49], 1250, 'A1 ends at 1250 words');
  assert.equal(SMART_PATH_WAVE_TARGETS.A2[49], 2554, 'A2 ends at full Elementary (2554 words)');
  assert.equal(SMART_PATH_WAVE_TARGETS.B1[49], 3680, 'B1 ends at Elementary + half Intermediate (3680 words)');
  assert.equal(SMART_PATH_WAVE_TARGETS.B2[49], 4803, 'B2 ends at full Elementary + Intermediate (4803 words)');
  assert.equal(SMART_PATH_WAVE_TARGETS.C1[49], 6433, 'C1 ends at full main dictionary (6433 words)');

  // Fresh user (0 mastered words): starts with A1 Wave 1 targeting 25 words and interleaves without stacking micro-rules
  global.localStorage.clear();
  const plan0 = buildSmartPathPlan(wordsData, 'ru');
  assert.equal(plan0.levelId, 'A1');
  assert.equal(plan0.currentWave, 1);
  assert.equal(plan0.totalWaves, 50);
  assert.equal(plan0.currentStep?.stepType, 'vocab');
  assert.equal(plan0.currentStep?.targetWords, 25);
  assert.ok(Array.isArray(plan0.upcomingSteps) && plan0.upcomingSteps.length >= 10);
  assert.ok(plan0.upcomingSteps.some((st) => st.stepType !== 'vocab'), 'Wave 1 interleaves non-vocab steps right after 20 words');
  assert.ok(plan0.currentStep?.linkTarget?.targetType);
  // Ensure no two consecutive micro_rule steps and no two consecutive vocab steps in the upcoming roadmap
  for (let i = 1; i < plan0.upcomingSteps.length; i++) {
    assert.notEqual(
      plan0.upcomingSteps[i - 1].stepType === 'micro_rule' && plan0.upcomingSteps[i].stepType === 'micro_rule',
      true,
      `Micro-rules should not appear back-to-back at index ${i}`
    );
    assert.notEqual(
      plan0.upcomingSteps[i - 1].stepType === 'vocab' && plan0.upcomingSteps[i].stepType === 'vocab',
      true,
      `Vocab steps should not appear back-to-back at index ${i}`
    );
  }

  // User with 25 mastered words: Wave 1 vocab is satisfied, so Smart Path advances immediately into Wave 1 micro-rule
  const { getEffectiveUserId } = await import('../frontend/services/api.js');
  const prog25 = {};
  for (let i = 0; i < 25; i++) {
    prog25[wordsData[i].id] = { mastered: true, known: true, inputCorrect: 1 };
  }
  global.localStorage.setItem(`progress_${getEffectiveUserId()}`, JSON.stringify(prog25));
  const plan25 = buildSmartPathPlan(wordsData, 'ru');
  assert.equal(plan25.levelId, 'A1');
  assert.equal(plan25.totalMastered, 25);
  assert.equal(plan25.currentStep?.stepType, 'micro_rule', 'At 25 mastered words, next step pivots to Wave 1 micro-rule');
  assert.equal(plan25.currentStep?.requiresAdUnlock, true, 'Locked micro-rule requires high-eCPM Rewarded Ad for free user');
  assert.equal(plan25.currentWave, 1);

  // Unlocking Wave 1 micro-rule via Rewarded Ad clears requiresAdUnlock
  const firstRuleId = Number(plan25.currentStep.id.split(':')[1]);
  global.localStorage.setItem('myduo_microrules_unlocked', JSON.stringify([firstRuleId]));
  const plan25Unlocked = buildSmartPathPlan(wordsData, 'ru');
  assert.equal(plan25Unlocked.currentStep?.requiresAdUnlock, false, 'Unlocked micro-rule requires no ad');

  // Completing Wave 1 micro-rule does NOT shift rule #2 back into Wave 1 — advances cleanly to Wave 2 (50 words)
  global.localStorage.setItem('myduo_microrules_done', JSON.stringify([firstRuleId]));
  const planAfterWave1 = buildSmartPathPlan(wordsData, 'ru');
  assert.equal(planAfterWave1.currentWave, 2, 'After finishing Wave 1 vocab + rule, advances cleanly to Wave 2');
  assert.equal(planAfterWave1.currentStep?.stepType, 'vocab');
  assert.equal(planAfterWave1.currentStep?.targetWords, 50);

  // SmartPathModal uses high-eCPM REWARDED_PACKS ad (showLanguagePackRewardedAd) for locked steps
  const smartModalSrc = fs.readFileSync(path.resolve('frontend/components/modals/SmartPathModal.js'), 'utf8');
  assert.ok(smartModalSrc.includes('AdService.showLanguagePackRewardedAd'), 'SmartPathModal uses high-eCPM rewarded video ad');

  // Popular Verbs Action vs Stative toggle & 36-locale labels
  const { STATIVE_VERBS_SET, VERB_FILTER_I18N } = await import('../frontend/services/collectionsService.js');
  assert.ok(STATIVE_VERBS_SET.size >= 45 && STATIVE_VERBS_SET.has('know') && STATIVE_VERBS_SET.has('belong') && STATIVE_VERBS_SET.has('prefer'));
  for (const loc of [...SUPPORTED_LOCALE_CODES, 'pt-br', 'es-mx']) {
    const vf = VERB_FILTER_I18N[loc];
    assert.ok(vf?.all && vf?.action && vf?.stative && vf?.stativeHint, `VERB_FILTER_I18N missing keys for "${loc}"`);
  }

  // Another step switches to a distinct activity type
  const altPlan = buildSmartPathPlan(wordsData, 'ru', { skipOffset: 1 });
  assert.notEqual(altPlan.currentStep?.id, planAfterWave1.currentStep?.id);

  // Verify Compass wink animation hooks on hub open (light & dark theme safe)
  const indexHtmlSrc = fs.readFileSync(path.resolve('frontend/index.html'), 'utf8');
  const mainCssSrc = fs.readFileSync(path.resolve('frontend/assets/css/main.css'), 'utf8');
  assert.ok(indexHtmlSrc.includes('hub-dock-btn-compass'), 'index.html applies hub-dock-btn-compass class');
  assert.ok(
    mainCssSrc.includes('hubCompassWinkLight') && mainCssSrc.includes('hubCompassWinkDark'),
    'main.css defines light and dark Compass wink animations'
  );
});

test('Startup ES Module Graph Integrity: all static imports and named exports resolve cleanly', () => {
  const baseDir = path.resolve('frontend');
  const indexHtmlPath = path.join(baseDir, 'index.html');
  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  const scriptMatches = [...html.matchAll(/<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.ok(scriptMatches.length > 0, 'index.html has module script');

  const visited = new Set();
  const queue = [];

  function extractImports(code, filePath) {
    const importRegex = /import\s+(?:(\*\s+as\s+\w+)|(\{[\s\S]*?\})|(\w+))(?:\s*,\s*(?:(\{[\s\S]*?\})|(\w+)))?\s+from\s+['"]([^'"]+)['"]/g;
    let m;
    while ((m = importRegex.exec(code)) !== null) {
      const spec = m[6];
      const bracePart = m[2] || m[4];
      const names = [];
      if (bracePart) {
        const inner = bracePart.slice(1, -1);
        for (const part of inner.split(',')) {
          const cleaned = part.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
          if (!cleaned) continue;
          const origName = cleaned.split(/\s+as\s+/)[0].trim();
          if (origName) names.push(origName);
        }
      }
      queue.push({ fromFile: filePath, specifier: spec, names });
    }
    const bareRegex = /import\s+['"]([^'"]+)['"]/g;
    while ((m = bareRegex.exec(code)) !== null) {
      queue.push({ fromFile: filePath, specifier: m[1], names: [] });
    }
    const dynamicRegex = /\b(?:import|lazyMod|lazyLayoutMod)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((m = dynamicRegex.exec(code)) !== null) {
      queue.push({ fromFile: filePath, specifier: m[1], names: [] });
    }
  }

  for (const m of scriptMatches) extractImports(m[1], indexHtmlPath);

  const errors = [];
  while (queue.length > 0) {
    const { fromFile, specifier, names } = queue.shift();
    const cleanSpec = specifier.split('?')[0].split('#')[0];
    if (!cleanSpec.startsWith('.')) continue;

    const resolved = path.resolve(path.dirname(fromFile), cleanSpec);
    if (!fs.existsSync(resolved)) {
      errors.push(`Missing file: ${specifier} (from ${path.relative(baseDir, fromFile)})`);
      continue;
    }

    const content = fs.readFileSync(resolved, 'utf8');
    for (const name of names) {
      if (name === '*' || name === 'default') continue;
      const exportRegex = new RegExp(
        `export\\s+(?:async\\s+)?(?:function|const|let|var|class)\\s+${name}\\b|` +
        `export\\s*\\{[^}]*\\b(?:as\\s+)?${name}\\b[^}]*\\}`
      );
      if (!exportRegex.test(content)) {
        errors.push(`Missing export '${name}' in ${path.relative(baseDir, resolved)} (imported by ${path.relative(baseDir, fromFile)})`);
      }
    }

    if (!visited.has(resolved)) {
      visited.add(resolved);
      extractImports(content, resolved);
    }
  }

  assert.equal(errors.length, 0, `ES module graph errors:\n${errors.join('\n')}`);
  assert.ok(visited.size >= 50, `Expected full module graph (>=50 modules), checked ${visited.size}`);
});

test('Cloud Achievements Sync: micro-rules, tenses, grammar ref, spoken, CEFR exams & collections survive reinstall', async () => {
  const store = new Map();
  const prevStorage = globalThis.localStorage;
  globalThis.localStorage = {
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] ?? null,
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(String(k)); },
    clear: () => { store.clear(); },
  };
  try {
    const apiMod = await import('../frontend/services/api.js');
    const fbMod = await import('../frontend/services/firebase.js');
    assert.equal(typeof fbMod.saveUserAchievementsFirestore, 'function');
    assert.equal(typeof apiMod.collectLocalAchievementsSnapshot, 'function');
    assert.equal(typeof apiMod.mergeAchievementsSnapshots, 'function');
    assert.equal(typeof apiMod.applyAchievementsSnapshotToLocal, 'function');

    // Simulate user learning progress before reinstall
    localStorage.setItem('myduo_microrules_done', JSON.stringify([1, 2, 5, 14]));
    localStorage.setItem('myduo_microrules_quiz_done', JSON.stringify([1, 5]));
    localStorage.setItem('myduo_tenses_done', JSON.stringify(['present_simple', 'past_simple']));
    localStorage.setItem('myduo_grammar_ref_done', JSON.stringify(['prepositions:time', 'pronouns:matrix']));
    localStorage.setItem('myduo_spoken_practiced', JSON.stringify(['sp_1', 'sp_2']));
    localStorage.setItem('myduo_completed_collections', JSON.stringify(['numbers', 'finance_terms']));
    localStorage.setItem('myduo_cefr_exams_passed', JSON.stringify(['A1']));
    localStorage.setItem('myduo_milestone_highest_unlocked', '500');
    localStorage.setItem('myduo_story_0_unlocked', 'true');
    localStorage.setItem('myduo_milestone_story_100_completed', 'true');
    localStorage.setItem('myduo_time_best_clock', '9');
    localStorage.setItem('myduo_custom_collections', JSON.stringify([{ id: 'col_1', name: 'Work', wordIds: ['10', '20'] }]));

    const cloudBackup = apiMod.collectLocalAchievementsSnapshot();
    assert.deepEqual(cloudBackup.myduo_microrules_done.sort((a, b) => a - b), [1, 2, 5, 14]);
    assert.deepEqual(cloudBackup.myduo_cefr_exams_passed, ['A1']);
    assert.equal(cloudBackup.myduo_milestone_highest_unlocked, 500);
    assert.equal(cloudBackup.myduo_story_0_unlocked, true);

    // Simulate full reinstall (wiped localStorage) + new local rule #20 learned before cloud sync finishes
    localStorage.clear();
    localStorage.setItem('myduo_microrules_done', JSON.stringify([20]));
    localStorage.setItem('myduo_milestone_highest_unlocked', '100');

    const localAfterReinstall = apiMod.collectLocalAchievementsSnapshot();
    const merged = apiMod.mergeAchievementsSnapshots(localAfterReinstall, cloudBackup);
    apiMod.applyAchievementsSnapshotToLocal(merged);

    // Verify lossless union + max restore
    assert.deepEqual(JSON.parse(localStorage.getItem('myduo_microrules_done')).sort((a, b) => a - b), [1, 2, 5, 14, 20]);
    assert.deepEqual(JSON.parse(localStorage.getItem('myduo_microrules_quiz_done')).sort((a, b) => a - b), [1, 5]);
    assert.deepEqual(JSON.parse(localStorage.getItem('myduo_tenses_done')).sort(), ['past_simple', 'present_simple']);
    assert.deepEqual(JSON.parse(localStorage.getItem('myduo_grammar_ref_done')).sort(), ['prepositions:time', 'pronouns:matrix']);
    assert.deepEqual(JSON.parse(localStorage.getItem('myduo_spoken_practiced')).sort(), ['sp_1', 'sp_2']);
    assert.deepEqual(JSON.parse(localStorage.getItem('myduo_completed_collections')).sort(), ['finance_terms', 'numbers']);
    assert.deepEqual(JSON.parse(localStorage.getItem('myduo_cefr_exams_passed')), ['A1']);
    assert.equal(localStorage.getItem('myduo_milestone_highest_unlocked'), '500');
    assert.equal(localStorage.getItem('myduo_story_0_unlocked'), 'true');
    assert.equal(localStorage.getItem('myduo_milestone_story_100_completed'), 'true');
    assert.equal(localStorage.getItem('myduo_time_best_clock'), '9');
    assert.equal(JSON.parse(localStorage.getItem('myduo_custom_collections'))[0].wordIds.length, 2);
  } finally {
    globalThis.localStorage = prevStorage;
  }
});
