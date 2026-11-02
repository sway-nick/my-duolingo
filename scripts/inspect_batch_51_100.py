import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

words = json.load(open('frontend/assets/data/words.json', encoding='utf-8'))
batch_51_100 = [w for w in words if 51 <= w['id'] <= 100]

print(f"Total words in batch 51-100: {len(batch_51_100)}")
print(f"Range: ID {batch_51_100[0]['id']} ('{batch_51_100[0]['word']}') -> ID {batch_51_100[-1]['id']} ('{batch_51_100[-1]['word']}')")

for idx, w in enumerate(batch_51_100):
    w_id = w['id']
    en = w['word']
    ru = w.get('translation', '')
    tr = w.get('translations', {})
    
    # Print summary
    print(f"\n[{w_id:3d}] '{en}' | RU: '{ru}'")
    print(f"  DE: {tr.get('de')} | ES: {tr.get('es')} | FR: {tr.get('fr')} | IT: {tr.get('it')}")
    print(f"  PL: {tr.get('pl')} | TR: {tr.get('tr')} | JA: {tr.get('ja')} | KO: {tr.get('ko')}")
    print(f"  AR: {tr.get('ar')} | ZH: {tr.get('zh')} | UK: {tr.get('uk')} | CS: {tr.get('cs')}")
