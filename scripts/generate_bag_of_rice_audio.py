import asyncio
import json
import os
import re
import edge_tts

VOICE = "en-US-ChristopherNeural"
RATE = "-2%"
TITLE = "My Lord Bag of Rice"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODAL_PATH = os.path.join(BASE_DIR, "frontend", "components", "modals", "MilestoneStoryModal.js")


def load_story0_paragraphs():
    with open(MODAL_PATH, "r", encoding="utf-8") as f:
        src = f.read()
    m = re.search(r'"0"\s*:\s*\{[\s\S]*?"paragraphs"\s*:\s*(\[[\s\S]*?\])\s*\},', src)
    if not m:
        raise RuntimeError("Could not find story 0 paragraphs in MilestoneStoryModal.js")
    return json.loads(m.group(1))


async def generate_chunk(text):
    comm = edge_tts.Communicate(text, VOICE, rate=RATE)
    audio = bytearray()
    last_end = 0.0
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            end_sec = (chunk["offset"] + chunk["duration"]) / 10_000_000.0
            if end_sec > last_end:
                last_end = end_sec
    return bytes(audio), last_end


async def main():
    paragraphs = load_story0_paragraphs()
    total = len(paragraphs)
    print(f"Generating full narration for '{TITLE}' ({total} paragraphs) using {VOICE} ({RATE})...")

    combined_audio = bytearray()
    paragraph_timings = []
    current_time = 0.0

    print(f"  [0/{total}] Voicing title...")
    title_audio, title_dur = await generate_chunk(TITLE + ".")
    combined_audio.extend(title_audio)
    current_time += title_dur

    for idx, p_text in enumerate(paragraphs):
        print(f"  [{idx+1}/{total}] Voicing paragraph {idx+1}...")
        p_audio, p_dur = await generate_chunk(p_text)
        p_start = current_time
        combined_audio.extend(p_audio)
        current_time += p_dur
        p_end = current_time
        paragraph_timings.append({
            "pIndex": idx,
            "start": round(p_start, 2),
            "end": round(p_end, 2),
        })

    total_duration = round(current_time, 2)
    total_size_mb = len(combined_audio) / 1024 / 1024
    print(f"Done! Total duration: {total_duration}s ({total_duration/60:.1f} mins), size: {total_size_mb:.2f} MB")

    target_dirs = [
        os.path.join(BASE_DIR, "docs", "assets", "audio", "stories"),
        os.path.join(BASE_DIR, "frontend", "assets", "audio", "stories"),
    ]
    for tdir in target_dirs:
        os.makedirs(tdir, exist_ok=True)
        mp3_path = os.path.join(tdir, "my_lord_bag_of_rice.mp3")
        with open(mp3_path, "wb") as f:
            f.write(combined_audio)
        json_path = os.path.join(tdir, "my_lord_bag_of_rice_timing.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump({
                "title": TITLE,
                "voice": VOICE,
                "rate": RATE,
                "totalDuration": total_duration,
                "paragraphs": paragraph_timings,
            }, f, indent=2, ensure_ascii=False)
        print(f"Saved: {mp3_path}")


if __name__ == "__main__":
    asyncio.run(main())
