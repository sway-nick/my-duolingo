import os
import re
import json
import time
import random
import urllib.request
import urllib.parse

import ssl
ssl._create_default_https_context = ssl._create_unverified_context

API_URL = "https://script.google.com/macros/s/AKfycbwnXMvc0F37phkEvq7fEXcqLoFCVrAUYrC88d09pjDjer039oDmsciF-u18mZbuhngjxQ/exec?route=words"

# Define destination directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
US_DIR = os.path.join(BASE_DIR, "frontend", "assets", "audio", "us")
UK_DIR = os.path.join(BASE_DIR, "frontend", "assets", "audio", "uk")

# Ensure directories exist
os.makedirs(US_DIR, exist_ok=True)
os.makedirs(UK_DIR, exist_ok=True)

def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        try:
            print(msg.encode('ascii', errors='replace').decode('ascii'))
        except Exception:
            pass

def get_clean_filename(text):
    # Keep only alphanumeric characters, spaces, single quotes, and hyphens
    clean = re.sub(r"[^a-z0-9\s'-]", "", text.lower().strip())
    clean = re.sub(r"\s+", "_", clean)
    return clean

def download_file(url, filepath):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            content_type = response.headers.get('Content-Type', '')
            if 'text/html' in content_type:
                # Returned HTML instead of audio (likely a block or redirect)
                return False
            
            data = response.read()
            if len(data) < 500:
                # File is too small to be valid audio
                return False
            
            with open(filepath, 'wb') as f:
                f.write(data)
            return True
    except Exception as e:
        safe_print(f"Error downloading {url}: {e}")
        return False

def main():
    safe_print(f"[*] Fetching words list from Google Sheet API...")
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

    import sys
    limit = None
    if "--limit" in sys.argv:
        try:
            limit_idx = sys.argv.index("--limit")
            limit = int(sys.argv[limit_idx + 1])
            safe_print(f"[*] Limiting download to first {limit} words.")
        except Exception:
            limit = 2
            safe_print(f"[*] Limiting download to first {limit} words.")
    
    if limit is not None:
        words = words[:limit]

    safe_print(f"[SUCCESS] Loaded {len(words)} words. Starting audio download...")
    
    success_count = 0
    skipped_count = 0
    failed_count = 0

    for idx, w in enumerate(words):
        word_text = w.get("word", "").strip()
        if not word_text:
            continue

        clean_name = get_clean_filename(word_text)
        safe_print(f"[{idx+1}/{len(words)}] Processing word: '{word_text}' -> filename: '{clean_name}.mp3'")

        for accent in ["us", "uk"]:
            dest_dir = US_DIR if accent == "us" else UK_DIR
            dest_file = os.path.join(dest_dir, f"{clean_name}.mp3")

            # Check if file exists and is valid
            if os.path.exists(dest_file) and os.path.getsize(dest_file) > 500:
                skipped_count += 1
                continue

            # Determine URLs
            lang_code = "en-US" if accent == "us" else "en-GB"
            voice_type = "2" if accent == "us" else "1"
            
            google_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang_code}&client=tw-ob&q={urllib.parse.quote(word_text)}"
            youdao_url = f"https://dict.youdao.com/dictvoice?audio={urllib.parse.quote(word_text)}&type={voice_type}"

            # Step 1: Try Google Translate TTS
            success = download_file(google_url, dest_file)
            
            # Step 2: Fallback to Youdao if Google failed
            if not success:
                success = download_file(youdao_url, dest_file)

            if success:
                success_count += 1
                # Politeness delay to avoid rate limiting
                time.sleep(random.uniform(0.5, 1.2))
            else:
                safe_print(f"  [ERROR] Failed to download audio for '{word_text}' ({accent.upper()})")
                failed_count += 1

    safe_print("\n[SUCCESS] Audio download complete!")
    safe_print(f"   - Successfully downloaded: {success_count} files")
    safe_print(f"   - Already existing (skipped): {skipped_count} files")
    safe_print(f"   - Failed downloads: {failed_count} files")

if __name__ == "__main__":
    main()
