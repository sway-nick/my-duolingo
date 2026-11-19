import asyncio
import json
import os
import re
import subprocess
import sys
import edge_tts

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
US_DIR = os.path.join(BASE_DIR, "frontend", "assets", "audio", "us")
UK_DIR = os.path.join(BASE_DIR, "frontend", "assets", "audio", "uk")
os.makedirs(US_DIR, exist_ok=True)
os.makedirs(UK_DIR, exist_ok=True)

US_VOICE = "en-US-JennyNeural"
UK_VOICE = "en-GB-RyanNeural"

# Exact pronunciation overrides for slang, abbreviations, and slash pairs
TTS_OVERRIDES = {
    "tbh": "T. B. H.",
    "btw": "B. T. W.",
    "idk": "I. D. K.",
    "imo / imho": "I. M. O., or I. M. H. O.",
    "fyi": "F. Y. I.",
    "asap": "A. S. A. P.",
    "ngl": "N. G. L.",
    "omw": "O. M. W.",
    "brb": "B. R. B.",
    "ttyl": "T. T. Y. L.",
    "fr": "F. R.",
    "jk": "J. K.",
    "nvm": "N. V. M.",
    "np": "N. P.",
    "ty / thx": "T. Y., or thanks",
    "pls / plz": "please",
    "w/ / w/o": "with, or without",
    "gtg / g2g": "G. T. G., or got to go",
    "iirc": "I. I. R. C.",
    "tl;dr": "T. L. D. R.",
    "lol / lmao": "lol, or L. M. A. O.",
    "cya / cu": "see ya",
    "lmk": "L. M. K.",
    "ikr": "I. K. R.",
    "rn": "R. N.",
    "tbf": "T. B. F.",
    "smh": "S. M. H.",
    "tmi": "T. M. I.",
    "eta": "E. T. A.",
    "ooo": "O. O. O.",
    "icymi": "I. C. Y. M. I.",
    "fomo": "foh-moh",
    "goat": "goat",
    "k / kk": "K., or K. K.",
    "tho": "though",
    "bc": "because",
    "dm": "D. M.",
    "abt": "about",
    "tmrw": "tomorrow",
    "gn": "G. N.",
    "gm": "G. M.",
    "yw": "Y. W.",
    "nbd / nw": "N. B. D., or N. W.",
    "ily": "I. L. Y.",
    "wth": "W. T. H.",
    "eod": "E. O. D.",
    "singular \"they\"": "singular they",
    "'cause / cuz": "cause",
    "'em": "em",
    "tell 'em / ask 'em": "tell em, or ask em",
    "wait for 'im / 'er": "wait for im, or er",
    "notsure / unno": "not sure, or unno",
    "dunn' / don'": "dun, or don",
    "'cause of / cuzza": "cause of, or cuzza",
    "i'ma": "I'm a",
    "whaddaya": "whaddaya",
    "jeet?": "jeet?",
    "finna": "finna",
}

EXAMPLE_REPLACEMENTS = [
    (r"\bw/o\b", "without"),
    (r"\bw/\s", "with "),
    (r"\bTL;DR\b", "T. L. D. R."),
    (r"\btbh\b|\bTBH\b", "T. B. H."),
    (r"\bBTW\b|\bbtw\b", "B. T. W."),
    (r"\bIDK\b|\bidk\b", "I. D. K."),
    (r"\bIMO\b", "I. M. O."),
    (r"\bIMHO\b", "I. M. H. O."),
    (r"\bFYI\b", "F. Y. I."),
    (r"\bASAP\b", "A. S. A. P."),
    (r"\bNGL\b|\bngl\b", "N. G. L."),
    (r"\bOMW\b", "O. M. W."),
    (r"\bBRB\b", "B. R. B."),
    (r"\bTTYL\b", "T. T. Y. L."),
    (r"\bFR\b|\bfr\b", "F. R."),
    (r"\bJK\b|\bjk\b", "J. K."),
    (r"\bNVM\b|\bnvm\b", "N. V. M."),
    (r"\bNP\b", "N. P."),
    (r"\bTY\b", "T. Y."),
    (r"\bthx\b|\bThx\b", "thanks"),
    (r"\bpls\b|\bPls\b|\bplz\b", "please"),
    (r"\bGTG\b|\bG2G\b", "G. T. G."),
    (r"\bIIRC\b", "I. I. R. C."),
    (r"\bLMK\b|\blmk\b", "L. M. K."),
    (r"\bIKR\b|\bikr\b", "I. K. R."),
    (r"\bRN\b|\brn\b", "R. N."),
    (r"\bTBF\b|\btbf\b", "T. B. F."),
    (r"\bsmh\b|\bSMH\b", "S. M. H."),
    (r"\bTMI\b", "T. M. I."),
    (r"\bETA\b", "E. T. A."),
    (r"\bOOO\b", "O. O. O."),
    (r"\bICYMI\b", "I. C. Y. M. I."),
    (r"\bDM me\b", "D. M. me"),
    (r"\bDMs\b", "D. M.s"),
    (r"\bGN\b", "G. N."),
    (r"\bGM\b", "G. M."),
    (r"\bYW\b", "Y. W."),
    (r"\bNw\b|\bNW\b", "N. W."),
    (r"\bILY\b", "I. L. Y."),
    (r"\bWTH\b", "W. T. H."),
    (r"\bEOD\b", "E. O. D."),
    (r"\btho\b", "though"),
    (r"\bbc\b", "because"),
    (r"\babt\b", "about"),
    (r"\btmrw\b", "tomorrow"),
]


def get_clean_filename(text: str) -> str:
    clean = re.sub(r"[^a-z0-9\s'-]", "", text.lower().strip())
    clean = re.sub(r"\s+", "_", clean)
    return clean


def format_tts_text(raw_text: str, is_example: bool) -> str:
    low = raw_text.strip().lower()
    if low in TTS_OVERRIDES:
        return TTS_OVERRIDES[low]
    out = raw_text.strip()
    if not is_example and "/" in out:
        out = out.replace(" / ", ", or ").replace("/", ", or ")
    if is_example:
        for pat, rep in EXAMPLE_REPLACEMENTS:
            out = re.sub(pat, rep, out)
    return out


def load_spoken_items():
    cmd = [
        "node",
        "-e",
        "import('./frontend/components/favorites/spokenEnglishData.js').then(m => console.log(JSON.stringify(m.SPOKEN_ENGLISH_ITEMS.map(x => ({id:x.id, spoken:x.spoken, example:x.example})))))",
    ]
    res = subprocess.run(cmd, cwd=BASE_DIR, capture_output=True, text=True, encoding="utf-8", check=True)
    return json.loads(res.stdout)


async def generate_one(sem: asyncio.Semaphore, tts_text: str, voice: str, out_path: str):
    if os.path.exists(out_path) and os.path.getsize(out_path) >= 400:
        return "skip"
    async with sem:
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(tts_text, voice)
                await comm.save(out_path)
                if os.path.exists(out_path) and os.path.getsize(out_path) >= 400:
                    return "ok"
            except Exception:
                await asyncio.sleep(0.5 * (attempt + 1))
        return "fail"


async def main():
    items = load_spoken_items()
    tasks_spec = {}
    for it in items:
        for raw, is_ex in ((it["spoken"], False), (it["example"], True)):
            fname = get_clean_filename(raw)
            if not fname:
                continue
            tts_text = format_tts_text(raw, is_ex)
            if fname not in tasks_spec:
                tasks_spec[fname] = tts_text

    print(f"Unique Live English audio phrases: {len(tasks_spec)}")
    sem = asyncio.Semaphore(10)
    coros = []
    for fname, tts_text in tasks_spec.items():
        coros.append(generate_one(sem, tts_text, US_VOICE, os.path.join(US_DIR, f"{fname}.mp3")))
        coros.append(generate_one(sem, tts_text, UK_VOICE, os.path.join(UK_DIR, f"{fname}.mp3")))

    results = await asyncio.gather(*coros)
    ok = results.count("ok")
    skip = results.count("skip")
    fail = results.count("fail")
    print(f"Done! generated={ok}, skipped={skip}, failed={fail}")
    if fail > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
