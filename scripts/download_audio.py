import os
import re
import sys
import json
import time
import random
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

API_URL = "https://script.google.com/macros/s/AKfycbwnXMvc0F37phkEvq7fEXcqLoFCVrAUYrC88d09pjDjer039oDmsciF-u18mZbuhngjxQ/exec?route=words"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
US_DIR = os.path.join(BASE_DIR, "frontend", "assets", "audio", "us")
UK_DIR = os.path.join(BASE_DIR, "frontend", "assets", "audio", "uk")

os.makedirs(US_DIR, exist_ok=True)
os.makedirs(UK_DIR, exist_ok=True)

print_lock = threading.Lock()

def safe_print(msg):
    with print_lock:
        try:
            print(msg, flush=True)
        except UnicodeEncodeError:
            try:
                print(msg.encode('ascii', errors='replace').decode('ascii'), flush=True)
            except Exception:
                pass

def get_clean_filename(text):
    clean = re.sub(r"[^a-z0-9\s'-]", "", text.lower().strip())
    clean = re.sub(r"\s+", "_", clean)
    return clean

def download_file(url, filepath, max_retries=3):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                content_type = response.headers.get('Content-Type', '')
                if 'text/html' in content_type:
                    time.sleep(0.5 * (attempt + 1))
                    continue
                data = response.read()
                if len(data) < 400:
                    time.sleep(0.5 * (attempt + 1))
                    continue
                with open(filepath, 'wb') as f:
                    f.write(data)
                return True
        except Exception:
            time.sleep(0.5 * (attempt + 1))
    return False

# Phonetic / grammar overrides to guarantee exact correct pronunciation of verb forms
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

def format_tts_query(word_text, category=""):
    raw = word_text.strip().lower()
    if raw in PHONETIC_OVERRIDES:
        return PHONETIC_OVERRIDES[raw]
    
    if 'irregular' in (category or '').lower():
        cleaned = re.sub(r'(\w+)/(\w+)', r'\1 or \2', raw)
        parts = [p.strip() for p in cleaned.split() if p.strip()]
        return '... '.join(parts) + '.'
    
    return word_text

import asyncio
try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False

async def process_task(sem, item, progress, force_overwrite):
    word_text, category, accent, total_tasks = item
    clean_name = get_clean_filename(word_text)
    dest_dir = US_DIR if accent == "us" else UK_DIR
    dest_file = os.path.join(dest_dir, f"{clean_name}.mp3")

    if not force_overwrite and os.path.exists(dest_file) and os.path.getsize(dest_file) > 400:
        progress['skipped'] += 1
        return True

    tts_text = format_tts_query(word_text, category)
    is_irregular = "irregular" in (category or "").lower()
    voice = "en-US-JennyNeural" if accent == "us" else "en-GB-SoniaNeural"
    rate = "-12%" if is_irregular else "0%"

    async with sem:
        success = False
        if HAS_EDGE_TTS:
            for attempt in range(3):
                try:
                    comm = edge_tts.Communicate(tts_text, voice, rate=rate)
                    await comm.save(dest_file)
                    if os.path.exists(dest_file) and os.path.getsize(dest_file) > 400:
                        success = True
                        break
                except Exception:
                    await asyncio.sleep(0.4 * (attempt + 1))
        
        if not success:
            lang_code = "en-US" if accent == "us" else "en-GB"
            google_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang_code}&client=tw-ob&q={urllib.parse.quote(tts_text)}"
            success = download_file(google_url, dest_file)

        if success:
            progress['success'] += 1
            idx = progress['success'] + progress['failed']
            pct = (idx / max(1, total_tasks)) * 100
            if idx % 10 == 0 or idx == total_tasks:
                safe_print(f"[{idx}/{total_tasks}] ({pct:.1f}%) Generated: '{word_text}' [{accent.upper()}]")
        else:
            progress['failed'] += 1
            safe_print(f"  [!] Failed: '{word_text}' [{accent.upper()}]")

        await asyncio.sleep(0.05)
        return success

async def async_main():
    safe_print("[*] Fetching words list from Google Sheet API...")
    try:
        req = urllib.request.Request(API_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            res_json = json.loads(response.read().decode('utf-8'))
            if not res_json.get("success") or "data" not in res_json:
                safe_print("[ERROR] Failed to fetch words: API response unsuccessful.")
                return
            words = res_json["data"]
    except Exception as e:
        safe_print(f"[ERROR] Failed to connect to API: {e}")
        return

    category_filter = None
    if "--category" in sys.argv:
        try:
            cat_idx = sys.argv.index("--category")
            category_filter = sys.argv[cat_idx + 1].strip().lower()
            words = [w for w in words if category_filter in (w.get("category", "") or "").lower()]
            safe_print(f"[*] Filtered by category '{category_filter}': {len(words)} words matched.")
        except Exception as e:
            safe_print(f"[!] Warning parsing category flag: {e}")

    force_overwrite = "--force" in sys.argv

    limit = None
    if "--limit" in sys.argv:
        try:
            limit_idx = sys.argv.index("--limit")
            limit = int(sys.argv[limit_idx + 1])
            safe_print(f"[*] Limiting download to first {limit} words.")
            words = words[:limit]
        except Exception:
            pass

    safe_print(f"[SUCCESS] Loaded {len(words)} words to process (force_overwrite={force_overwrite}).")

    tasks = []
    for w in words:
        word_text = w.get("word", "").strip()
        category = w.get("category", "")
        if not word_text:
            continue
        for accent in ["us", "uk"]:
            tasks.append((word_text, category, accent, len(words) * 2))

    total_tasks = len(tasks)
    if total_tasks == 0:
        safe_print("[✓] No words to process!")
        return

    safe_print(f"[*] Starting async generation for {total_tasks} tasks (concurrency=4)...")
    sem = asyncio.Semaphore(4)
    progress = {'success': 0, 'failed': 0, 'skipped': 0}
    start_time = time.time()

    await asyncio.gather(*(process_task(sem, item, progress, force_overwrite) for item in tasks))

    elapsed = time.time() - start_time
    safe_print(f"\n[SUCCESS] Audio download complete in {elapsed:.1f}s!")
    safe_print(f"   - Successfully generated: {progress['success']} files")
    safe_print(f"   - Skipped existing: {progress['skipped']} files")
    safe_print(f"   - Failed: {progress['failed']} files")

def main():
    asyncio.run(async_main())

if __name__ == "__main__":
    main()
