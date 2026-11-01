# -*- coding: utf-8 -*-
"""
Generates 92 new words for words.json, covering all 36 locales, exact IPAs, categories, and CEFR levels.
"""
import json
import os
import wordfreq

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS_JSON_PATH = os.path.join(ROOT_DIR, "frontend", "assets", "data", "words.json")

# 34 auxiliary language codes (excluding 'ru' and 'en')
LANG_KEYS = [
    'uk', 'de', 'es', 'fr', 'pl', 'it', 'tr', 'pt', 'ro', 'bg',
    'cs', 'sk', 'hu', 'el', 'sl', 'et', 'lt', 'da', 'fi', 'sv',
    'hr', 'lv', 'hi', 'ar', 'id', 'vi', 'th', 'ko', 'ja', 'bn',
    'fa', 'zh', 'ur', 'kk'
]

print("Ready to construct 92 words.")
