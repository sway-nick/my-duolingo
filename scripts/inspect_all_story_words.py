import sys
sys.path.append('.')
import re
import json

with open('frontend/assets/data/words.json', 'r', encoding='utf-8') as f:
    dict_raw = json.load(f)

dict_words = {w['word'].lower().strip() for w in dict_raw}

from scripts.audit_story_bag_of_rice import STORY_TEXT, FUNCTION_WORDS, PROPER_NAMES
from scripts.audit_final_story import get_candidate_lemmas

tokens = set(re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", STORY_TEXT.replace('’', "'").replace('‘', "'")))

print("=== TOKENS MATCHED VIA LEMMAS ===")
for t in sorted(tokens):
    raw = t.lower().strip("'")
    if raw in PROPER_NAMES or raw in FUNCTION_WORDS:
        continue
    if raw in dict_words:
        continue
    cands = get_candidate_lemmas(raw)
    matched = [c for c in cands if c in dict_words]
    if matched:
        print(f"{raw:15} -> matched: {matched}")
