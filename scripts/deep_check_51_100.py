import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

words = json.load(open('frontend/assets/data/words.json', encoding='utf-8'))
batch = [w for w in words if 51 <= w['id'] <= 100]

check_ids = [51, 53, 56, 57, 58, 61, 65, 68, 72, 75, 78, 85, 88, 90, 93, 95, 100]

for w in batch:
    if w['id'] in check_ids:
        print(f"\n==================== ID {w['id']}: '{w['word']}' ====================")
        print(f"RU: {w.get('translation')}")
        tr = w.get('translations', {})
        for loc in sorted(tr.keys()):
            print(f"  {loc}: {tr[loc]}")
