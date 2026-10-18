import os
import re
import json
import asyncio
import edge_tts

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS_PATH = os.path.join(ROOT_DIR, "frontend", "assets", "data", "words.json")
US_DIR = os.path.join(ROOT_DIR, "frontend", "assets", "audio", "us")
UK_DIR = os.path.join(ROOT_DIR, "frontend", "assets", "audio", "uk")

os.makedirs(US_DIR, exist_ok=True)
os.makedirs(UK_DIR, exist_ok=True)

def clean_filename(text):
    clean = re.sub(r"[^a-z0-9\s'-]", "", text.lower().strip())
    clean = re.sub(r"\s+", "_", clean)
    return clean

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

async def generate_audio_file(word_text, category, accent, sem, progress, total):
    clean_name = clean_filename(word_text)
    dest_dir = US_DIR if accent == "us" else UK_DIR
    dest_file = os.path.join(dest_dir, f"{clean_name}.mp3")

    if os.path.exists(dest_file) and os.path.getsize(dest_file) > 400:
        progress["skipped"] += 1
        return True

    tts_text = format_tts_query(word_text, category)
    is_irregular = "irregular" in (category or "").lower()
    voice = "en-US-JennyNeural" if accent == "us" else "en-GB-SoniaNeural"
    rate = "-12%" if is_irregular else "+0%"

    async with sem:
        success = False
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(tts_text, voice, rate=rate)
                await comm.save(dest_file)
                if os.path.exists(dest_file) and os.path.getsize(dest_file) > 400:
                    success = True
                    break
            except Exception as e:
                await asyncio.sleep(0.5 * (attempt + 1))

        if success:
            progress["success"] += 1
            idx = progress["success"] + progress["failed"]
            pct = (idx / max(1, total)) * 100
            print(f"[{idx}/{total}] ({pct:.1f}%) Generated: '{word_text}' [{accent.upper()}] ({os.path.getsize(dest_file)} bytes)", flush=True)
        else:
            progress["failed"] += 1
            print(f"  [!] FAILED: '{word_text}' [{accent.upper()}]", flush=True)

        await asyncio.sleep(0.05)
        return success

async def main():
    print(f"Loading words from {WORDS_PATH}...")
    with open(WORDS_PATH, "r", encoding="utf-8") as f:
        words = json.load(f)

    tasks_to_run = []
    for w in words:
        word_text = (w.get("word") or "").strip()
        category = w.get("category", "")
        if not word_text:
            continue
        clean_name = clean_filename(word_text)
        for accent in ["us", "uk"]:
            dest_dir = US_DIR if accent == "us" else UK_DIR
            dest_file = os.path.join(dest_dir, f"{clean_name}.mp3")
            if not os.path.exists(dest_file) or os.path.getsize(dest_file) < 400:
                tasks_to_run.append((word_text, category, accent))

    total = len(tasks_to_run)
    print(f"Found {total} missing audio files across US and UK accents.")
    if total == 0:
        print("All words already have complete audio coverage!")
        return

    sem = asyncio.Semaphore(5)
    progress = {"success": 0, "failed": 0, "skipped": 0}

    task_coros = [
        generate_audio_file(word_text, category, accent, sem, progress, total)
        for word_text, category, accent in tasks_to_run
    ]

    await asyncio.gather(*task_coros)

    print("\n==========================================")
    print(f"DONE! Generated: {progress['success']}, Failed: {progress['failed']}")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(main())
