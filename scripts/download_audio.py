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

def download_file(url, filepath):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as response:
            content_type = response.headers.get('Content-Type', '')
            if 'text/html' in content_type:
                return False
            data = response.read()
            if len(data) < 400:
                return False
            with open(filepath, 'wb') as f:
                f.write(data)
            return True
    except Exception:
        return False

def process_word_accent(item):
    word_text, accent, total_tasks, counter_dict = item
    clean_name = get_clean_filename(word_text)
    dest_dir = US_DIR if accent == "us" else UK_DIR
    dest_file = os.path.join(dest_dir, f"{clean_name}.mp3")

    if os.path.exists(dest_file) and os.path.getsize(dest_file) > 400:
        with print_lock:
            counter_dict['skipped'] += 1
        return True

    lang_code = "en-US" if accent == "us" else "en-GB"
    voice_type = "2" if accent == "us" else "1"
    
    google_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang_code}&client=tw-ob&q={urllib.parse.quote(word_text)}"
    youdao_url = f"https://dict.youdao.com/dictvoice?audio={urllib.parse.quote(word_text)}&type={voice_type}"

    # Try Google TTS
    success = download_file(google_url, dest_file)
    if not success:
        # Fallback to Youdao
        time.sleep(0.3)
        success = download_file(youdao_url, dest_file)

    with print_lock:
        if success:
            counter_dict['success'] += 1
            idx = counter_dict['success'] + counter_dict['failed']
            pct = (idx / max(1, total_tasks)) * 100
            if idx % 10 == 0 or idx == total_tasks:
                safe_print(f"[{idx}/{total_tasks}] ({pct:.1f}%) Downloaded: '{word_text}' ({accent.upper()})")
        else:
            counter_dict['failed'] += 1
            safe_print(f"  [!] Failed: '{word_text}' ({accent.upper()})")

    time.sleep(random.uniform(0.15, 0.4))
    return success

def main():
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

    limit = None
    if "--limit" in sys.argv:
        try:
            limit_idx = sys.argv.index("--limit")
            limit = int(sys.argv[limit_idx + 1])
            safe_print(f"[*] Limiting download to first {limit} words.")
            words = words[:limit]
        except Exception:
            pass

    safe_print(f"[SUCCESS] Loaded {len(words)} words from cloud.")

    # Find missing tasks
    tasks = []
    skipped_count = 0
    counters = {'success': 0, 'failed': 0, 'skipped': 0}

    for w in words:
        word_text = w.get("word", "").strip()
        if not word_text:
            continue
        clean_name = get_clean_filename(word_text)

        for accent in ["us", "uk"]:
            dest_dir = US_DIR if accent == "us" else UK_DIR
            dest_file = os.path.join(dest_dir, f"{clean_name}.mp3")
            if os.path.exists(dest_file) and os.path.getsize(dest_file) > 400:
                skipped_count += 1
            else:
                tasks.append((word_text, accent))

    total_missing = len(tasks)
    safe_print(f"[*] Already existing audio files: {skipped_count}")
    safe_print(f"[*] Audio files to download: {total_missing}")

    if total_missing == 0:
        safe_print("[✓] All audio files are up to date!")
        return

    worker_items = [
        (word_text, accent, total_missing, counters)
        for (word_text, accent) in tasks
    ]

    safe_print(f"[*] Starting parallel download with 8 workers...")
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(process_word_accent, item) for item in worker_items]
        for f in as_completed(futures):
            pass

    elapsed = time.time() - start_time
    safe_print(f"\n[SUCCESS] Audio download complete in {elapsed:.1f}s!")
    safe_print(f"   - Successfully downloaded: {counters['success']} files")
    safe_print(f"   - Already existing (skipped): {skipped_count} files")
    safe_print(f"   - Failed downloads: {counters['failed']} files")

if __name__ == "__main__":
    main()
