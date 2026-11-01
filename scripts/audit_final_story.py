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

IRREGULAR_MAP = {
    'borne': 'bear', 'bore': 'bear', 'born': 'bear',
    'buckled': 'buckle',
    'slung': 'sling', 'slinging': 'sling',
    'parted': 'part',
    'flew': 'fly', 'flown': 'fly',
    'shook': 'shake', 'shaken': 'shake',
    'rose': 'rise', 'risen': 'rise',
    'bid': 'bid', 'bidden': 'bid',
    'struck': 'strike', 'stricken': 'strike',
    'wound': 'wind', 'winding': 'wind',
    'shone': 'shine',
    'hung': 'hang',
    'grew': 'grow', 'grown': 'grow',
    'crept': 'creep',
    'began': 'begin', 'begun': 'begin',
    'went': 'go', 'gone': 'go', 'goes': 'go',
    'came': 'come',
    'took': 'take', 'taken': 'take',
    'saw': 'see', 'seen': 'see',
    'felt': 'feel',
    'heard': 'hear',
    'knew': 'know', 'known': 'know',
    'thought': 'think',
    'found': 'find',
    'spread': 'spread',
    'hit': 'hit',
    'fell': 'fall', 'fallen': 'fall',
    'lost': 'lose',
    'caught': 'catch',
    'told': 'tell',
    'stood': 'stand',
    'sat': 'sit',
    'met': 'meet',
    'kept': 'keep',
    'cut': 'cut',
    'read': 'read',
    'slept': 'sleep',
    'swam': 'swim', 'swum': 'swim',
    'ate': 'eat', 'eaten': 'eat',
    'lying': 'lie', 'lay': 'lie', 'lain': 'lie',
    'carried': 'carry', 'carries': 'carry',
    'replied': 'reply', 'replies': 'reply',
    'stepped': 'step', 'stepping': 'step',
    'stopped': 'stop', 'stopping': 'stop',
    'spanning': 'span', 'spanned': 'span',
    'fitting': 'fit', 'fitted': 'fit',
    'longer': 'long', 'longest': 'long',
    'shorter': 'short', 'shortest': 'short',
    'taller': 'tall', 'tallest': 'tall',
    'rarest': 'rare', 'rarer': 'rare',
    'bravest': 'brave', 'braver': 'brave',
}

import sys
sys.path.append('.')
from scripts.audit_story_bag_of_rice import STORY_TEXT

def get_candidate_lemmas(w):
    lemmas = {w}
    if w in IRREGULAR_MAP:
        lemmas.add(IRREGULAR_MAP[w])
    
    if w.endswith("'s") or w.endswith("’s"):
        lemmas.add(w[:-2])
        
    # -ies -> -y
    if w.endswith('ies') and len(w) > 4:
        lemmas.add(w[:-3] + 'y')
        
    # -es -> -e, or base
    if w.endswith('es') and len(w) > 3:
        lemmas.add(w[:-2])
        lemmas.add(w[:-1])
        
    # -s -> base
    if w.endswith('s') and not w.endswith('ss') and len(w) > 3:
        lemmas.add(w[:-1])
        
    # -ied -> -y
    if w.endswith('ied') and len(w) > 4:
        lemmas.add(w[:-3] + 'y')
        
    # -ed -> -e, or base
    if w.endswith('ed') and len(w) > 3:
        lemmas.add(w[:-2])
        lemmas.add(w[:-1])
        # Double consonant (e.g. stepped -> step, stopped -> stop, rubbed -> rub)
        if len(w) > 5 and w[-3] == w[-4]:
            lemmas.add(w[:-3])
            
    # -ing -> -e, or base
    if w.endswith('ing') and len(w) > 4:
        lemmas.add(w[:-3])
        lemmas.add(w[:-3] + 'e')
        # Double consonant (e.g. stepping -> step, fitting -> fit, spanning -> span)
        if len(w) > 5 and w[-4] == w[-5]:
            lemmas.add(w[:-4])
            
    # -ily -> -y, -ly -> base / -e
    if w.endswith('ily') and len(w) > 4:
        lemmas.add(w[:-3] + 'y')
    if w.endswith('ly') and len(w) > 3:
        lemmas.add(w[:-2])
        lemmas.add(w[:-1])
        
    # -er / -est
    if w.endswith('ier') and len(w) > 4:
        lemmas.add(w[:-3] + 'y')
    if w.endswith('iest') and len(w) > 5:
        lemmas.add(w[:-4] + 'y')
    if w.endswith('er') and len(w) > 3:
        lemmas.add(w[:-2])
        lemmas.add(w[:-1])
        if len(w) > 5 and w[-3] == w[-4]:
            lemmas.add(w[:-3])
    if w.endswith('est') and len(w) > 4:
        lemmas.add(w[:-3])
        lemmas.add(w[:-2])
        if len(w) > 6 and w[-4] == w[-5]:
            lemmas.add(w[:-4])
            
    # prefixes un-, re-
    if w.startswith('un') and len(w) > 4:
        lemmas.add(w[2:])
    if w.startswith('re') and len(w) > 5:
        # only if base is real word
        lemmas.add(w[2:])
        
    return lemmas

def is_token_in_dict(raw):
    raw = raw.lower().strip(" '\"")
    if not raw or raw in PROPER_NAMES or raw in FUNCTION_WORDS or raw in dict_words:
        return True, raw
    for cand in get_candidate_lemmas(raw):
        if cand in dict_words or cand in FUNCTION_WORDS or cand in PROPER_NAMES:
            return True, cand
    return False, None

# Normalize text
tokens = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", STORY_TEXT.replace('’', "'").replace('‘', "'"))

missing_tokens = {}
for t in tokens:
    raw = t.lower().strip("'")
    if not raw or len(raw) <= 1 and raw not in ('a', 'i'):
        continue
    found, matched = is_token_in_dict(raw)
    if not found:
        if raw not in missing_tokens:
            missing_tokens[raw] = 1
        else:
            missing_tokens[raw] += 1

# Normalize to canonical lemma for report
CANONICAL_LEMMA_MAP = {
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
    'ceremonial': 'ceremonial',
    'goldfishes': 'goldfish',
    'goldfish': 'goldfish',
    'claws': 'claw',
    'coils': 'coil',
    'nostrils': 'nostril',
    'fireballs': 'fireball',
    'inhabitants': 'inhabitant',
    'centipedes': 'centipede',
    'centipede': 'centipede',
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
    'robes': 'robe',
    'fitting': 'fit',
}

grouped_missing = {}
for raw, count in missing_tokens.items():
    lemma = CANONICAL_LEMMA_MAP.get(raw, raw)
    if lemma not in grouped_missing:
        grouped_missing[lemma] = {'forms': {raw}, 'count': count}
    else:
        grouped_missing[lemma]['forms'].add(raw)
        grouped_missing[lemma]['count'] += count

print(f"Total missing tokens: {sum(missing_tokens.values())}")
print(f"Total unique missing lemmas: {len(grouped_missing)}")

output_rows = []
for lem, data in sorted(grouped_missing.items(), key=lambda x: (-x[1]['count'], x[0])):
    forms_str = ", ".join(sorted(data['forms']))
    z = round(wordfreq.zipf_frequency(lem, 'en'), 2)
    output_rows.append((lem, forms_str, data['count'], z))

print(f"\n{'#':<3} | {'LEMMA':<18} | {'FORMS IN TEXT':<26} | {'FREQ':<4} | {'ZIPF':<5}")
print("-" * 65)
for idx, (lem, forms, cnt, z) in enumerate(output_rows, 1):
    print(f"{idx:<3} | {lem:<18} | {forms:<26} | {cnt:<4} | {z:<5}")
