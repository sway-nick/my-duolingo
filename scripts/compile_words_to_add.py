import sys
sys.path.append('.')
import re
import json

with open('frontend/assets/data/words.json', 'r', encoding='utf-8') as f:
    dict_raw = json.load(f)

dict_words = {w['word'].lower().strip() for w in dict_raw}
for w in dict_raw:
    w_str = w.get('word', '').strip().lower()
    for part in re.split(r'[\s\-,/]+', w_str):
        if part:
            dict_words.add(part)

from scripts.audit_story_bag_of_rice import STORY_TEXT, FUNCTION_WORDS, PROPER_NAMES
from scripts.audit_final_story import CANONICAL_LEMMA_MAP, get_candidate_lemmas

# Additional fixes
CANONICAL_LEMMA_MAP['robes'] = 'robe'
CANONICAL_LEMMA_MAP['earnest'] = 'earnest'
CANONICAL_LEMMA_MAP['fitting'] = 'fit'

tokens = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", STORY_TEXT.replace('’', "'").replace('‘', "'"))

missing_lemmas = set()

for t in tokens:
    raw = t.lower().strip("'")
    if not raw or len(raw) <= 1 and raw not in ('a', 'i'):
        continue
    if raw in PROPER_NAMES or raw in FUNCTION_WORDS:
        continue
    if raw in ('robes', 'earnest', 'fitting'):
        missing_lemmas.add(CANONICAL_LEMMA_MAP[raw])
        continue
    if raw in dict_words:
        continue

    # Check candidates
    cands = get_candidate_lemmas(raw)
    matched = [c for c in cands if c in dict_words]
    if matched:
        continue

    lemma = CANONICAL_LEMMA_MAP.get(raw, raw)
    if lemma in dict_words:
        continue
    missing_lemmas.add(lemma)

words_list = sorted(list(missing_lemmas))
print(f"Total verified words/lemmas to add: {len(words_list)}")
print(words_list)

with open('scripts/words_to_add.json', 'w', encoding='utf-8') as f:
    json.dump(words_list, f, indent=2)
