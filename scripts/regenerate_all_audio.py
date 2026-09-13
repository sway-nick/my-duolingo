import os
import re
import sys
import json
import time
import asyncio
import edge_tts
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS_JSON = os.path.join(BASE_DIR, frontend, assets, data, words.json)
UK_DIR = os.path.join(BASE_DIR, frontend, assets, audio, uk)
US_DIR = os.path.join(BASE_DIR, frontend, assets, audio, us)

os.makedirs(UK_DIR, exist_ok=True)
os.makedirs(US_DIR, exist_ok=True)

PHONETIC_OVERRIDES = {
    'read read read': 'read. red. red.',
    'wind wound wound': 'wynd. wownd. wownd.',
    'tear tore torn': 'tair. tore. torn.',
    'sow sowed sown': 'so. sohd. sohn.',
    'sow sowed sowed/sown': 'so. sohd. sohn.',
    'be was/were been': 'be... was... were... been.',
    'bear bore born': 'bear... bore... born.',
    'bear bore born/borne': 'bear... bore... born... or borne.',
    'burn burnt/burned burnt/burned': 'burn... burnt... or burned.',
    'bust bust/busted bust/busted': 'bust... bust... or busted.',
    'dive dove/dived dived': 'dive... dove... or dived... dived.',
    'bid bid/bade bid/bidden': 'bid... bid... or bade... bid... or bidden.',
}

def get_clean_filename(text):
    clean = re.sub(r[^a-z0-9\s'-], ", text.lower().strip())
 clean = re.sub(r\s+, _, clean)
 return clean

def format_tts_query(word_text, category=):
 raw = word_text.strip().lower()
 if raw in PHONETIC_OVERRIDES:
 return PHONETIC_OVERRIDES[raw]
 
 if 'irregular' in (category or '').lower():
 cleaned = re.sub(r'(\w+)/(\w+)', r'\1 or \2', raw)
 parts = [p.strip() for p in cleaned.split() if p.strip()]
 return '... '.join(parts) + '.'
 
 return word_text

async def generate_single(sem, word_item, accent, progress, total_tasks):
 word_text = word_item.get('word', '').strip()
 category = word_item.get('category', '')
 if not word_text:
 return True

 clean_name = get_clean_filename(word_text)
 dest_dir = UK_DIR if accent == uk else US_DIR
 dest_file = os.path.join(dest_dir, f{clean_name}.mp3)

 tts_text = format_tts_query(word_text, category)
 is_irregular = irregular in (category or ).lower()
 voice = en-GB-SoniaNeural if accent == uk else en-US-JennyNeural
 rate = -12% if is_irregular else 0%

 async with sem:
 success = False
 for attempt in range(4):
 try:
 comm = edge_tts.Communicate(tts_text, voice, rate=rate)
 temp_file = dest_file + f.tmp_{accent}
 await comm.save(temp_file)
 if os.path.exists(temp_file) and os.path.getsize(temp_file) > 400:
 shutil.move(temp_file, dest_file)
 success = True
 break
 else:
 if os.path.exists(temp_file): os.remove(temp_file)
 except Exception as e:
 await asyncio.sleep(0.3 * (attempt + 1))

 if success:
 progress['success'] += 1
 else:
 progress['failed'] += 1
 print(f [!] FAILED: '{word_text}' [{accent.upper()}], flush=True)

 done = progress['success'] + progress['failed']
 if done % 200 == 0 or done == total_tasks:
 pct = (done / max(1, total_tasks)) * 100
 print(f[{done}/{total_tasks}] ({pct:.1f}%) Processed ({accent.upper()} voice)..., flush=True)

 return success

async def main():
 print(f[*] Reading dictionary words from: {WORDS_JSON}, flush=True)
 with open(WORDS_JSON, 'r', encoding='utf-8') as f:
 words = json.load(f)

 print(f[*] Loaded {len(words)} words., flush=True)
 
 sem = asyncio.Semaphore(12)
 
 print(\n==========================================, flush=True)
 print(f[*] 1/2: Generating UK Audio (en-GB-SoniaNeural) for {len(words)} words..., flush=True)
 print(==========================================, flush=True)
 uk_progress = {'success': 0, 'failed': 0}
 start_uk = time.time()
 await asyncio.gather(*(generate_single(sem, w, uk, uk_progress, len(words)) for w in words))
 uk_elapsed = time.time() - start_uk
 print(f[✓] UK audio completed in {uk_elapsed:.1f}s! (Success: {uk_progress['success']}, Failed: {uk_progress['failed']}), flush=True)

 print(\n==========================================, flush=True)
 print(f[*] 2/2: Generating US Audio (en-US-JennyNeural) for {len(words)} words..., flush=True)
 print(==========================================, flush=True)
 us_progress = {'success': 0, 'failed': 0}
 start_us = time.time()
 await asyncio.gather(*(generate_single(sem, w, us, us_progress, len(words)) for w in words))
 us_elapsed = time.time() - start_us
 print(f[✓] US audio completed in {us_elapsed:.1f}s! (Success: {us_progress['success']}, Failed: {us_progress['failed']}), flush=True)

 print(\n[SUCCESS] All audio recordings generated successfully!, flush=True)

if __name__ == __main__:
 asyncio.run(main())
