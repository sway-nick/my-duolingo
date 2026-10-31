import json
import re

# Load words from dictionary
with open('frontend/assets/data/words.json', 'r', encoding='utf-8') as f:
    dict_words_raw = json.load(f)

dict_words = set()
for w in dict_words_raw:
    word_str = w.get('word', '').strip().lower()
    if word_str:
        dict_words.add(word_str)
        # Also split phrases so if dictionary has "bus stop", both "bus" and "stop" are known
        for part in re.split(r'[\s\-,/]+', word_str):
            if part:
                dict_words.add(part)

print(f"Total entries in dictionary: {len(dict_words_raw)}, unique vocabulary forms: {len(dict_words)}")

# Standard English closed-class function words, pronouns, contractions, numbers
FUNCTION_WORDS = {
    'a', 'an', 'the',
    'i', 'me', 'my', 'mine', 'myself',
    'you', 'your', 'yours', 'yourself',
    'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself',
    'we', 'us', 'our', 'ours', 'ourselves',
    'they', 'them', 'their', 'theirs', 'themselves',
    'this', 'that', 'these', 'those',
    'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'will', 'just', 'should', 'now',
    'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while',
    'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having',
    'do', 'does', 'did', 'doing',
    'would', 'could', 'should', 'might', 'must',
    'yes', 'yeah', 'no', 'oh', 'ok', 'okay', 'hi', 'hello', 'bye', 'thanks', 'please',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
    'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand',
    'first', 'second', 'third', 'fourth', 'fifth',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'someone', 'somebody', 'something', 'somewhere',
    'everyone', 'everybody', 'everything', 'everywhere',
    'anyone', 'anybody', 'anything', 'anywhere',
    'no one', 'nobody', 'nothing', 'nowhere',
    'wifi', 'wi-fi',
}

# Proper nouns in the dialogues
PROPER_NAMES = {
    'maya', 'leo', 'nina', 'tom', 'patel', 'brighton', 'daniel', 'reed', 'emma', 'sara', 'ben', 'anna', 'lisbon', 'berlin'
}

CONTRACTION_EXPANSIONS = {
    "i'm": ["i", "am"],
    "it's": ["it", "is"],
    "that's": ["that", "is"],
    "there's": ["there", "is"],
    "here's": ["here", "is"],
    "what's": ["what", "is"],
    "who's": ["who", "is"],
    "where's": ["where", "is"],
    "he's": ["he", "is"],
    "she's": ["she", "is"],
    "they're": ["they", "are"],
    "we're": ["we", "are"],
    "you're": ["you", "are"],
    "i've": ["i", "have"],
    "you've": ["you", "have"],
    "we've": ["we", "have"],
    "they've": ["they", "have"],
    "i'll": ["i", "will"],
    "you'll": ["you", "will"],
    "he'll": ["he", "will"],
    "she'll": ["she", "will"],
    "we'll": ["we", "will"],
    "they'll": ["they", "will"],
    "i'd": ["i", "would"],
    "you'd": ["you", "would"],
    "he'd": ["he", "would"],
    "we'd": ["we", "would"],
    "don't": ["do", "not"],
    "doesn't": ["does", "not"],
    "didn't": ["did", "not"],
    "can't": ["can", "not"],
    "won't": ["will", "not"],
    "isn't": ["is", "not"],
    "aren't": ["are", "not"],
    "wasn't": ["was", "not"],
    "weren't": ["were", "not"],
    "haven't": ["have", "not"],
    "hasn't": ["has", "not"],
    "hadn't": ["had", "not"],
    "let's": ["let", "us"]
}

# UK to US spelling variants
SPELLING_VARIANTS = {
    'practise': 'practice',
    'theatre': 'theater',
    'favour': 'favor',
    'colour': 'color',
    'neighbour': 'neighbor',
    'organise': 'organize',
}

def get_possible_lemmas(w):
    """Generate possible base lemmas for a word."""
    lemmas = {w}
    
    if w in SPELLING_VARIANTS:
        lemmas.add(SPELLING_VARIANTS[w])
        
    # Possessive 's e.g. tomorrow's -> tomorrow
    if w.endswith("'s"):
        lemmas.add(w[:-2])

    # Plural / 3rd person singular -s, -es, -ies
    if w.endswith('ies') and len(w) > 4:
        lemmas.add(w[:-3] + 'y') # e.g. priorities -> priority
    if w.endswith('es') and len(w) > 3:
        lemmas.add(w[:-2]) # e.g. boxes -> box, flashes -> flash
        lemmas.add(w[:-1]) # e.g. dates -> date
    if w.endswith('s') and not w.endswith('ss') and len(w) > 3:
        lemmas.add(w[:-1]) # e.g. keys -> key, shoes -> shoe, questions -> question
        
    # Past / Participle -ed, -d, -ied
    if w.endswith('ied') and len(w) > 4:
        lemmas.add(w[:-3] + 'y') # e.g. tried -> try
    if w.endswith('ed') and len(w) > 3:
        lemmas.add(w[:-2]) # e.g. walked -> walk, checked -> check
        lemmas.add(w[:-1]) # e.g. moved -> move, closed -> close
        # Double consonant e.g. stopped -> stop
        if len(w) > 5 and w[-3] == w[-4]:
            lemmas.add(w[:-3])

    # Gerund / Participle -ing
    if w.endswith('ing') and len(w) > 4:
        lemmas.add(w[:-3]) # e.g. asking -> ask, looking -> look, restarting -> restart
        lemmas.add(w[:-3] + 'e') # e.g. losing -> lose, moving -> move, making -> make
        # Double consonant e.g. stopping -> stop, getting -> get
        if len(w) > 5 and w[-4] == w[-5]:
            lemmas.add(w[:-4])

    # Adverb -ly, Adjective -y
    if w.endswith('ily') and len(w) > 4:
        lemmas.add(w[:-3] + 'y') # e.g. easily -> easy
    if w.endswith('ly') and len(w) > 3:
        lemmas.add(w[:-2]) # e.g. safely -> safe, calmly -> calm, confidently -> confident
    if w.endswith('y') and len(w) > 3:
        lemmas.add(w[:-1]) # e.g. rainy -> rain

    # Comparative / Superlative -er, -est
    if w.endswith('ier') and len(w) > 4:
        lemmas.add(w[:-3] + 'y') # e.g. earlier -> early, easier -> easy
    if w.endswith('er') and len(w) > 3:
        lemmas.add(w[:-2]) # e.g. quieter -> quiet, cheaper -> cheap
        lemmas.add(w[:-1]) # e.g. larger -> large, later -> late
    if w.endswith('iest') and len(w) > 5:
        lemmas.add(w[:-4] + 'y')
    if w.endswith('est') and len(w) > 4:
        lemmas.add(w[:-3])
        lemmas.add(w[:-2])

    # Common prefixes un-, re-
    if w.startswith('re') and len(w) > 4:
        base = w[2:]
        lemmas.add(base) # e.g. restart -> start
        for bl in list(lemmas):
            if bl.startswith('re') and len(bl) > 4:
                lemmas.add(bl[2:])
    if w.startswith('un') and len(w) > 4:
        lemmas.add(w[2:]) # e.g. unsure -> sure

    return lemmas

def is_word_in_dict(w):
    w = w.lower()
    if w in dict_words or w in FUNCTION_WORDS or w in PROPER_NAMES:
        return True, w
    # Check lemmas
    for lemma in get_possible_lemmas(w):
        if lemma in dict_words or lemma in FUNCTION_WORDS:
            return True, lemma
    return False, None

# Load parsed 37 dialogues
with open('scripts/parsed_37_dialogues.json', 'r', encoding='utf-8') as f:
    dialogues = json.load(f)

all_missing = {}

for d in dialogues:
    en_content = d['locales']['en']['content']
    # Normalize curly apostrophes to straight apostrophes
    en_content = en_content.replace('’', "'").replace('‘', "'")
    
    # Preserve Wi-Fi
    en_content = re.sub(r'\bwi-fi\b', 'wifi', en_content, flags=re.IGNORECASE)
    
    # First replace punctuation except apostrophes in contractions
    cleaned = re.sub(r'[\—\-\–\.\,\?\!\:\;\"\(\)\/\d]+', ' ', en_content)
    tokens = cleaned.strip().split()

    for token in tokens:
        raw_token = token.lower().strip(" '")
        if not raw_token:
            continue
            
        # Check contractions
        if raw_token in CONTRACTION_EXPANSIONS:
            sub_tokens = CONTRACTION_EXPANSIONS[raw_token]
        else:
            sub_tokens = [raw_token]

        for st in sub_tokens:
            if not st:
                continue
            found, matched_lemma = is_word_in_dict(st)
            if not found:
                if st not in all_missing:
                    all_missing[st] = {
                        'word': st,
                        'dialogues': [d['id']],
                        'examples': [en_content.split('\n')[0]]
                    }
                else:
                    if d['id'] not in all_missing[st]['dialogues']:
                        all_missing[st]['dialogues'].append(d['id'])

print(f"\n==================================================")
print(f"VOCABULARY AUDIT RESULTS:")
print(f"Total missing words across all 37 dialogues: {len(all_missing)}")
print(f"==================================================\n")

missing_list = sorted(list(all_missing.keys()))
for w in missing_list:
    d_list = all_missing[w]['dialogues']
    print(f"• {w} (dialogues: {d_list})")

# Save detailed report to json
with open('scripts/missing_words_report.json', 'w', encoding='utf-8') as f:
    json.dump(all_missing, f, ensure_ascii=False, indent=2)
