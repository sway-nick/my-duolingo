import asyncio
import json
import os
import re
import sys
import edge_tts

VOICE = "en-US-ChristopherNeural"
RATE = "-2%"

TITLE = "Aladdin and the Magic Lamp"

PARAGRAPHS = [
    "A long time ago, in a busy city in the East, there lived a poor boy named Aladdin. His father had died when Aladdin was very young, so he lived alone with his mother. They had very little money, and his mother worked hard every day spinning cotton to buy food. Aladdin was a kind boy, but he preferred playing in the streets with his friends instead of working.",
    "One day, a tall stranger arrived in the city. He was actually a wicked sorcerer from a faraway land, but he had a clever plan. He approached Aladdin in the market and smiled warmly. \"My dear boy!\" he said. \"I am your father’s brother. I have traveled for many years to find you and help your family.\"",
    "Aladdin was surprised, and his mother was overjoyed. The stranger bought Aladdin fine new clothes and gave his mother gold coins. The next morning, the sorcerer asked Aladdin to walk with him outside the city. They walked for hours until they reached a quiet valley between two high mountains.",
    "The sorcerer built a small fire, threw some strange powder into it, and spoke magic words. Suddenly, the ground shook, and a heavy stone slab appeared with a brass ring in the center. \"Under this stone is a secret cave,\" the sorcerer said. \"Only you can enter it. Go down the stairs, walk through the halls of gold and jewels, and do not touch anything. At the very end, you will find an old oil lamp. Bring it to me.\" Before Aladdin went down, the sorcerer slipped a magic ring onto Aladdin’s finger for protection.",
    "Aladdin climbed down into the cave. It was breathtaking. Trees were covered with sparkling rubies, emeralds, and diamonds. Aladdin remembered the warning, though he did put a few shining fruits from the trees into his pockets, thinking they were just pretty glass. At the end of the cave, he found the dusty old lamp.",
    "When Aladdin returned to the entrance, the stairs were too steep to climb while holding the lamp. \"Give me the lamp first, and then I will pull you out!\" the sorcerer shouted angrily. Aladdin was afraid the man would leave him behind, so he refused. Furious, the sorcerer spoke another spell, and the heavy stone slammed shut, trapping Aladdin in the dark.",
    "For two days, Aladdin sat in the darkness, crying and praying. Accidentally, he rubbed the magic ring on his finger. Instantly, a huge genie appeared in a cloud of smoke. \"I am the Genie of the Ring,\" the spirit boomed. \"What is your wish?\"",
    "\"Take me home to my mother!\" Aladdin cried. In the blink of an eye, Aladdin was standing in his own house, still holding the old lamp.",
    "When Aladdin’s mother saw the dirty lamp, she decided to clean it so they could sell it for food. As soon as she rubbed it, a giant, powerful genie burst out of the spout, filling the whole room. \"I am the Genie of the Lamp!\" he thundered. \"Your wish is my command.\"",
    "Aladdin quickly asked for a feast. Immediately, silver plates filled with delicious food appeared on the table. From that day on, Aladdin and his mother were never hungry again. Aladdin sold the silver plates and used the lamp wisely, growing into a polite, educated, and handsome young man.",
    "Years later, Aladdin saw the Sultan’s daughter, Princess Jasmine, riding through the city. She was the most beautiful woman he had ever seen, and he fell deeply in love with her. Aladdin sent his mother to the Sultan’s palace with a bowl full of the sparkling jewels he had taken from the cave. The Sultan was amazed by the gift, but he demanded one more thing: Aladdin had to build a magnificent palace for the princess in a single night.",
    "Aladdin rubbed the magic lamp, and by the next morning, a palace of white marble and gold stood across from the Sultan’s home. The Sultan kept his promise, and Aladdin and Jasmine were married in a grand celebration. They lived happily together, and the people of the city loved Aladdin for his generosity.",
    "However, far away in his homeland, the wicked sorcerer discovered that Aladdin was still alive and had the magic lamp. Filled with rage, he traveled back to the city and disguised himself as an old merchant. Walking past Aladdin’s palace while Aladdin was away hunting, he shouted, \"New lamps for old! Trade your old lamps for shiny new ones!\"",
    "Princess Jasmine heard him from the window. She did not know the secret of Aladdin’s dusty old lamp, so she sent a servant to trade it for a bright new one. The moment the sorcerer held the magic lamp, he laughed cruelly and rubbed it. He ordered the genie to carry the entire palace—with the princess inside—to a distant desert in Africa.",
    "When Aladdin returned, his palace and his wife were gone. The Sultan was furious and gave Aladdin forty days to find his daughter. Heartbroken, Aladdin wandered into the countryside. As he washed his hands in a river, he accidentally rubbed the magic ring he still wore. The Genie of the Ring appeared. He could not undo the work of the more powerful Genie of the Lamp, but he could take Aladdin to the palace.",
    "In a flash, Aladdin arrived in the desert and sneaked into the palace through a window. Jasmine was overjoyed to see him. Together, they made a plan. That evening, the princess invited the sorcerer to dinner and secretly poured a strong sleeping potion into his cup. The sorcerer drank it and fell into a deep sleep.",
    "Aladdin quickly stepped out from behind a curtain, took the magic lamp from the sorcerer’s belt, and rubbed it. The Genie of the Lamp appeared, delighted to serve his true master again. Aladdin wished for the palace to be returned to its rightful place, leaving the wicked sorcerer behind in the desert forever.",
    "The next morning, the Sultan looked out his window and saw the marble palace shining in the sun once more. Aladdin and Jasmine were reunited with their family, and they lived in peace and happiness for the rest of their lives."
]

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
    print(f"🎙️ Generating full narration for '{TITLE}' using {VOICE} ({RATE})...")
    
    combined_audio = bytearray()
    paragraph_timings = []
    current_time = 0.0
    
    # 1. Voice Title
    print("  [0/18] Voicing title...")
    title_audio, title_dur = await generate_chunk(TITLE + ".")
    combined_audio.extend(title_audio)
    current_time += title_dur
    
    # 2. Voice each paragraph
    for idx, p_text in enumerate(PARAGRAPHS):
        print(f"  [{idx+1}/18] Voicing paragraph {idx+1}...")
        p_audio, p_dur = await generate_chunk(p_text)
        
        p_start = current_time
        combined_audio.extend(p_audio)
        current_time += p_dur
        p_end = current_time
        
        paragraph_timings.append({
            "pIndex": idx,
            "start": round(p_start, 2),
            "end": round(p_end, 2)
        })
    
    total_duration = round(current_time, 2)
    total_size_mb = len(combined_audio) / 1024 / 1024
    print(f"✨ Done! Total duration: {total_duration}s ({total_duration/60:.1f} mins), size: {total_size_mb:.2f} MB")

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_dirs = [
        os.path.join(base_dir, "docs", "assets", "audio", "stories"),
        os.path.join(base_dir, "frontend", "assets", "audio", "stories")
    ]
    
    for tdir in target_dirs:
        os.makedirs(tdir, exist_ok=True)
        mp3_path = os.path.join(tdir, "aladdin_and_the_magic_lamp.mp3")
        with open(mp3_path, "wb") as f:
            f.write(combined_audio)
            
        json_path = os.path.join(tdir, "aladdin_and_the_magic_lamp_timing.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump({
                "title": TITLE,
                "voice": VOICE,
                "rate": RATE,
                "totalDuration": total_duration,
                "paragraphs": paragraph_timings
            }, f, indent=2, ensure_ascii=False)
            
        print(f"💾 Saved: {mp3_path}")
        print(f"💾 Saved: {json_path}")

if __name__ == "__main__":
    asyncio.run(main())
