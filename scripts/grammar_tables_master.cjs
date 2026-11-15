// Compact reference tables for closed-class grammar topics (pronouns, articles, prepositions, etc.)

const GRAMMAR_TABLES_DEF = {
  10: {
    headers: ['Subject', '+', '−', '?'],
    rows: [
      ['I', 'am (\'m)', 'am not (\'m not)', 'Am I ...?'],
      ['he / she / it', 'is (\'s)', 'is not (isn\'t)', 'Is he/she/it ...?'],
      ['you / we / they', 'are (\'re)', 'are not (aren\'t)', 'Are you/we/they ...?'],
    ],
  },
  12: {
    headers: ['Form', '+', '−', '?'],
    rows: [
      ['Singular / Uncountable', 'There is (There\'s)', 'There isn\'t', 'Is there ...?'],
      ['Plural', 'There are', 'There aren\'t', 'Are there ...?'],
    ],
  },
  13: {
    headers: ['Subject', 'Object'],
    rows: [
      ['I', 'me'],
      ['you', 'you'],
      ['he', 'him'],
      ['she', 'her'],
      ['it', 'it'],
      ['we', 'us'],
      ['they', 'them'],
    ],
  },
  14: {
    headers: ['Subject', 'Possessive (+ noun)', 'Absolute (no noun)'],
    rows: [
      ['I', 'my', 'mine'],
      ['you', 'your', 'yours'],
      ['he', 'his', 'his'],
      ['she', 'her', 'hers'],
      ['it', 'its', '—'],
      ['we', 'our', 'ours'],
      ['they', 'their', 'theirs'],
    ],
  },
  16: {
    headers: ['Distance', 'Singular', 'Plural'],
    rows: [
      ['Near (here)', 'this', 'these'],
      ['Far (there)', 'that', 'those'],
    ],
  },
  18: {
    headers: ['Article', 'Rule', 'Example'],
    rows: [
      ['a', 'Singular countable + consonant sound', 'a book, a university'],
      ['an', 'Singular countable + vowel sound', 'an apple, an hour'],
      ['the', 'Specific, known, or unique noun', 'the sun, the key on the desk'],
      ['Ø (Zero)', 'General plurals/uncountables, meals, days, languages', 'Milk is healthy; on Monday'],
    ],
  },
  19: {
    headers: ['Ending', 'Rule', 'Example'],
    rows: [
      ['Regular', '+ s', 'book → books, day → days'],
      ['-s, -ss, -sh, -ch, -x, -o', '+ es', 'bus → buses, box → boxes, tomato → tomatoes'],
      ['Consonant + y', 'y → ies', 'city → cities, baby → babies'],
      ['-f / -fe', 'f/fe → ves', 'leaf → leaves, knife → knives'],
    ],
  },
  20: {
    headers: ['Type', 'Singular → Plural / Pair'],
    rows: [
      ['Irregular vowel/stem', 'man → men, woman → women, child → children'],
      ['Irregular (oo → ee)', 'foot → feet, tooth → teeth, goose → geese'],
      ['Other irregulars', 'mouse → mice, person → people, ox → oxen'],
      ['Same singular & plural', 'sheep → sheep, deer → deer, fish → fish, series → series'],
      ['Always plural (+ are)', 'jeans, trousers, scissors, glasses, clothes'],
    ],
  },
  23: {
    headers: ['Word', 'Asks about', 'Example'],
    rows: [
      ['Who', 'Person', 'Who called you?'],
      ['What', 'Thing / action / info', 'What is this?'],
      ['Where', 'Place', 'Where do you live?'],
      ['When', 'Time', 'When does it start?'],
      ['Why', 'Reason', 'Why are you late?'],
      ['How', 'Manner / degree', 'How much / many / long / often?'],
    ],
  },
  24: {
    headers: ['Word', 'Usage', 'Example'],
    rows: [
      ['Which', 'Limited choice', 'Which tea do you prefer: green or black?'],
      ['What', 'Open / unlimited choice', 'What music do you like?'],
      ['Whose', 'Possession', 'Whose bag is this?'],
    ],
  },
  27: {
    headers: ['Preposition', 'Usage', 'Examples'],
    rows: [
      ['in', 'Enclosed spaces, cities, countries', 'in a box, in London, in the car'],
      ['on', 'Surfaces, streets, public transport, floors', 'on the table, on Main St, on the bus'],
      ['at', 'Exact points, addresses, events', 'at the door, at 10 Downing St, at work'],
    ],
  },
  31: {
    headers: ['Preposition', 'Usage', 'Examples'],
    rows: [
      ['at', 'Clock times, night, noon, weekends', 'at 7:30, at night, at noon'],
      ['on', 'Days, dates, specific days', 'on Monday, on May 5th, on my birthday'],
      ['in', 'Months, seasons, years, parts of day', 'in July, in summer, in 2026, in the morning'],
    ],
  },
  35: {
    headers: ['Word', 'Sentence type', 'Example'],
    rows: [
      ['some', '+ statements, polite offers/requests', 'I have some time. Would you like some tea?'],
      ['any', '? questions, − negatives (with not)', 'Do you have any milk? I don\'t have any cash.'],
      ['no', '− meaning with + verb (no "not")', 'There is no sugar left.'],
    ],
  },
  36: {
    headers: ['Quantifier', 'Noun type', 'Note'],
    rows: [
      ['many', 'Countable plural', 'Common in ? / − (many books)'],
      ['much', 'Uncountable', 'Common in ? / − (much time)'],
      ['a lot of / lots of', 'Both countable & uncountable', 'Neutral, common in + sentences'],
      ['plenty of', 'Both countable & uncountable', 'More than enough'],
    ],
  },
  37: {
    headers: ['Quantifier', 'Noun type', 'Meaning'],
    rows: [
      ['a few', 'Countable plural', 'Some, enough (+ tone)'],
      ['few', 'Countable plural', 'Hardly any, not enough (− tone)'],
      ['a little', 'Uncountable', 'Some, enough (+ tone)'],
      ['little', 'Uncountable', 'Hardly any, not enough (− tone)'],
    ],
  },
  39: {
    headers: ['Prefix', 'Person (+ singular verb)', 'Thing', 'Place'],
    rows: [
      ['some-', 'somebody / someone', 'something', 'somewhere'],
      ['any-', 'anybody / anyone', 'anything', 'anywhere'],
      ['no-', 'nobody / no one', 'nothing', 'nowhere'],
      ['every-', 'everybody / everyone', 'everything', 'everywhere'],
    ],
  },
  41: {
    headers: ['Order', 'Category', 'Examples'],
    rows: [
      ['1. Opinion', 'nice, lovely, ugly', '2. Size: big, small, tall'],
      ['3. Age', 'new, old, young', '4. Shape: round, square'],
      ['5. Color', 'red, dark blue', '6. Origin: Italian, Japanese'],
      ['7. Material', 'wooden, cotton, silk', '8. Purpose: sleeping (bag), running (shoes)'],
    ],
  },
  46: {
    headers: ['Base', 'Comparative', 'Superlative'],
    rows: [
      ['good / well', 'better', 'the best'],
      ['bad / badly', 'worse', 'the worst'],
      ['far', 'farther / further', 'the farthest / the furthest'],
      ['little', 'less', 'the least'],
      ['much / many', 'more', 'the most'],
    ],
  },
  49: {
    headers: ['Subject', 'Reflexive', 'Reciprocal'],
    rows: [
      ['I / you (sg)', 'myself / yourself', '—'],
      ['he / she / it', 'himself / herself / itself', '—'],
      ['we / you (pl) / they', 'ourselves / yourselves / themselves', 'each other / one another'],
    ],
  },
  53: {
    headers: ['V1 (Base)', 'V2 (Past Simple)', 'V3 (Participle)'],
    rows: [
      ['be', 'was / were', 'been'],
      ['go / do / have', 'went / did / had', 'gone / done / had'],
      ['see / come / take', 'saw / came / took', 'seen / come / taken'],
      ['make / get / give', 'made / got / gave', 'made / got / given'],
      ['know / say / think', 'knew / said / thought', 'known / said / thought'],
      ['find / write / speak', 'found / wrote / spoke', 'found / written / spoken'],
    ],
  },
  64: {
    headers: ['Form', 'Meaning', 'Example'],
    rows: [
      ['must', 'Personal / strict obligation', 'I must call my mom today.'],
      ['have to', 'External rule / necessity', 'We have to wear helmets here.'],
      ['mustn\'t', 'Prohibition (forbidden!)', 'You mustn\'t park here.'],
      ['don\'t have to', 'No obligation (optional)', 'You don\'t have to come early.'],
    ],
  },
  105: {
    headers: ['Pronoun', 'Refers to', 'Example'],
    rows: [
      ['who / that', 'People', 'The woman who/that lives here is a doctor.'],
      ['which / that', 'Things / animals', 'The book which/that I bought is great.'],
      ['whose', 'Possession', 'The boy whose bike was stolen'],
      ['where / when', 'Place / Time', 'The cafe where we met; the day when it snowed'],
    ],
  },
  124: {
    headers: ['Direct Speech', 'Reported Speech (Backshift)'],
    rows: [
      ['Present Simple (work)', 'Past Simple (worked)'],
      ['Present Continuous (am working)', 'Past Continuous (was working)'],
      ['Past Simple / Present Perfect', 'Past Perfect (had worked)'],
      ['will / can / may / must', 'would / could / might / had to'],
    ],
  },
  138: {
    headers: ['Suffix', 'Function', 'Examples'],
    rows: [
      ['-er / -or', 'Person / agent', 'teach → teacher, act → actor'],
      ['-ness', 'Adjective → abstract noun', 'happy → happiness, dark → darkness'],
      ['-ment', 'Verb → noun (result/action)', 'develop → development, agree → agreement'],
    ],
  },
  139: {
    headers: ['Suffix', 'Function', 'Examples'],
    rows: [
      ['-tion / -sion', 'Verb → noun', 'inform → information, decide → decision'],
      ['-ity', 'Adjective → abstract noun', 'active → activity, possible → possibility'],
    ],
  },
  140: {
    headers: ['Suffix', 'Meaning', 'Examples'],
    rows: [
      ['-ful / -less', 'With / without', 'careful ↔ careless, hopeful ↔ hopeless'],
      ['-able / -ible', 'Can be done', 'readable, comfortable, visible'],
      ['-ous / -ive / -al', 'Having quality of', 'famous, creative, natural'],
    ],
  },
  142: {
    headers: ['Prefix', 'Rule / Meaning', 'Examples'],
    rows: [
      ['un-', 'Most common opposite', 'unhappy, unfair, unlock'],
      ['in- / im- / il- / ir-', 'im- (m/p/b), il- (l), ir- (r)', 'incorrect, impossible, illegal, irregular'],
      ['dis-', 'Opposite / reverse action', 'disagree, disappear, dishonest'],
      ['mis-', 'Wrongly / badly', 'misunderstand, mistake, misspell'],
    ],
  },
  143: {
    headers: ['Prefix', 'Meaning', 'Examples'],
    rows: [
      ['re-', 'Again', 'rewrite, rebuild, replay'],
      ['pre-', 'Before', 'preview, preheat, prepay'],
      ['over- / under-', 'Too much / too little', 'overcook ↔ undercook, overpaid ↔ underpaid'],
    ],
  },
  148: {
    headers: ['Word 1 (Contraction)', 'Word 2 (Possessive / Adverb)'],
    rows: [
      ['it\'s (= it is / it has)', 'its (belonging to it)'],
      ['you\'re (= you are)', 'your (belonging to you)'],
      ['they\'re (= they are)', 'their (belonging to them) / there (place)'],
      ['who\'s (= who is / who has)', 'whose (belonging to whom)'],
    ],
  },
};

module.exports = { GRAMMAR_TABLES_DEF };
