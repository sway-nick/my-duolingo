import json
import re
import wordfreq

with open('frontend/assets/data/words.json', 'r', encoding='utf-8') as f:
    dict_raw = json.load(f)

dict_words = set()
for entry in dict_raw:
    w = entry.get('word', '').strip().lower()
    if w:
        dict_words.add(w)
        for part in re.split(r'[\s\-,/]+', w):
            if part:
                dict_words.add(part)

# Function words & proper nouns
FUNCTION_WORDS = {
    'a', 'an', 'the', 'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'will', 'just', 'should', 'now', 'shall', 'may', 'might', 'must', 'would', 'could',
    'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'though', 'although',
    'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
    'yes', 'yeah', 'no', 'oh', 'ok', 'okay', 'hi', 'hello', 'bye', 'thanks', 'please',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
    'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand',
    'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh',
    'someone', 'somebody', 'something', 'somewhere', 'everyone', 'everybody', 'everything', 'everywhere',
    'anyone', 'anybody', 'anything', 'anywhere', 'no one', 'nobody', 'nothing', 'nowhere',
    'henceforth', 'therefore', 'however', 'thus', 'till', 'forth', 'sooner', 'upon', 'towards', 'beneath', 'beyond',
}

PROPER_NAMES = {
    'japan', 'tawara', 'toda', 'fujiwara', 'hidesato', 'seta', 'karashi', 'seta-no-karashi',
    'biwa', 'mikami', 'koto', 'samisen', 'ozaki', 'yei', 'theodora'
}

# Irregular forms to base lemma
IRREGULAR_MAP = {
    'sallied': 'sally',
    'buckled': 'buckle',
    'quiver': 'quiver',
    'reptile': 'reptile',
    'retainers': 'retainer',
    'retinue': 'retinue',
    'shudder': 'shudder',
    'thunder': 'thunder',
    'lotus': 'lotus',
    'prosperous': 'prosperous',
    'monstrous': 'monstrous',
    'sumptuous': 'sumptuous',
    'crystallized': 'crystallize',
    'dyed': 'dye',
    'terrified': 'terrify',
    'trembling': 'tremble',
    'tremble': 'tremble',
    'penetrating': 'penetrate',
    'dauntlessly': 'dauntless',
    'ceremoniously': 'ceremonious',
    'goldfishes': 'goldfish',
    'claws': 'claw',
    'coils': 'coil',
    'nostrils': 'nostril',
    'fireballs': 'fireball',
    'inhabitants': 'inhabitant',
    'centipedes': 'centipede',
    'chopsticks': 'chopstick',
    'trays': 'tray',
    'banners': 'banner',
    'wondered': 'wonder',
    'wondering': 'wonder',
    'stewed': 'stew',
    'roasted': 'roast',
    'roared': 'roar',
    'darkened': 'darken',
    'crouched': 'crouch',
    'banished': 'banish',
    'gleamed': 'gleam',
    'glittered': 'glitter',
    'glowing': 'glow',
    'glowed': 'glow',
    'slung': 'sling',
    'slinging': 'sling',
    'parted': 'part',
    'flew': 'fly',
    'shook': 'shake',
    'shaken': 'shake',
    'rose': 'rise',
    'struck': 'strike',
    'wound': 'wind',
    'winding': 'wind',
    'shone': 'shine',
    'hung': 'hang',
    'grew': 'grow',
    'crept': 'creep',
    'began': 'begin',
    'went': 'go',
    'came': 'come',
    'took': 'take',
    'saw': 'see',
    'felt': 'feel',
    'heard': 'hear',
    'knew': 'know',
    'thought': 'think',
    'found': 'find',
    'spread': 'spread',
    'hit': 'hit',
    'fell': 'fall',
    'lost': 'lose',
    'caught': 'catch',
    'told': 'tell',
    'stood': 'stand',
    'sat': 'sit',
    'met': 'meet',
    'kept': 'keep',
    'cut': 'cut',
    'slept': 'sleep',
    'swam': 'swim',
    'ate': 'eat',
    'borne': 'bear',
    'bore': 'bear',
    'lying': 'lie',
    'lay': 'lie',
    'lain': 'lie',
}

import sys
sys.path.append('.')
from scripts.audit_story_bag_of_rice import STORY_TEXT

def get_clean_lemma(word):
    w = word.lower().strip(" '\"")
    if w in IRREGULAR_MAP:
        return IRREGULAR_MAP[w]
    if w.endswith("'s") or w.endswith("’s"):
        return w[:-2]
    # Simple plurals
    if w.endswith('ies') and len(w) > 4:
        return w[:-3] + 'y'
    if w.endswith('es') and len(w) > 3 and (w.endswith('ches') or w.endswith('shes') or w.endswith('xes') or w.endswith('sses')):
        return w[:-2]
    if w.endswith('s') and not w.endswith('ss') and len(w) > 3:
        # Check if without 's' exists in dictionary
        if w[:-1] in dict_words:
            return w[:-1]
    if w.endswith('ed') and len(w) > 3:
        if w[:-1] in dict_words:
            return w[:-1]
        if w[:-2] in dict_words:
            return w[:-2]
    if w.endswith('ing') and len(w) > 4:
        if w[:-3] in dict_words:
            return w[:-3]
        if (w[:-3] + 'e') in dict_words:
            return w[:-3] + 'e'
    return w

# Clean tokens
cleaned_tokens = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", STORY_TEXT.replace('’', "'").replace('‘', "'"))

missing_lemmas = {}

for token in cleaned_tokens:
    raw = token.lower().strip("'")
    if not raw or len(raw) <= 1 and raw not in ('a', 'i'):
        continue
    if raw in PROPER_NAMES or raw in FUNCTION_WORDS or raw in dict_words:
        continue

    lemma = get_clean_lemma(raw)
    if lemma in dict_words or lemma in FUNCTION_WORDS or lemma in PROPER_NAMES:
        continue

    # Also check if base lemma without -ly / -y / -ed is in dict
    candidate_checked = False
    for sub in [lemma, raw]:
        if sub.endswith('ly') and sub[:-2] in dict_words:
            candidate_checked = True
            break
        if sub.endswith('ly') and (sub[:-2] + 'e') in dict_words:
            candidate_checked = True
            break
        if sub.endswith('y') and sub[:-1] in dict_words:
            candidate_checked = True
            break
    if candidate_checked:
        continue

    if lemma not in missing_lemmas:
        missing_lemmas[lemma] = {'forms': {raw}, 'count': 1}
    else:
        missing_lemmas[lemma]['forms'].add(raw)
        missing_lemmas[lemma]['count'] += 1

print(f"Total unique missing lemmas: {len(missing_lemmas)}")

# Print nicely sorted by frequency / word
print(f"{'LEMMA':<18} | {'FORMS IN TEXT':<28} | {'COUNT':<5} | {'ZIPF':<5}")
print("-" * 65)
for lem, data in sorted(missing_lemmas.items(), key=lambda x: (-x[1]['count'], x[0])):
    forms_str = ", ".join(sorted(data['forms']))
    z = round(wordfreq.zipf_frequency(lem, 'en'), 2)
    print(f"{lem:<18} | {forms_str:<28} | {data['count']:<5} | {z:<5}")
