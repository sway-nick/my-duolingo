# -*- coding: utf-8 -*-
"""
Builds and appends the 92 fairy tale lemmas to frontend/assets/data/words.json,
generates Google Sheets TSV/CSV/AppsScript files, and creates TTS audio.
"""
import os
import sys
import json
import csv
import urllib.request
import wordfreq
import asyncio
import edge_tts
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(ROOT_DIR, "scripts"))

import fairy_tale_batch1
import fairy_tale_batch2
import fairy_tale_batch3

WORDS_JSON_PATH = os.path.join(ROOT_DIR, "frontend", "assets", "data", "words.json")
US_AUDIO_DIR = os.path.join(ROOT_DIR, "frontend", "assets", "audio", "us")
UK_AUDIO_DIR = os.path.join(ROOT_DIR, "frontend", "assets", "audio", "uk")

os.makedirs(US_AUDIO_DIR, exist_ok=True)
os.makedirs(UK_AUDIO_DIR, exist_ok=True)

AUX_LANGS = [
    'uk', 'de', 'es', 'fr', 'pl', 'it', 'tr', 'pt', 'ro', 'bg',
    'cs', 'sk', 'hu', 'el', 'sl', 'et', 'lt', 'da', 'fi', 'sv',
    'hr', 'lv', 'hi', 'ar', 'id', 'vi', 'th', 'ko', 'ja', 'bn',
    'fa', 'zh', 'ur', 'kk'
]

# POS mappings for the 92 words
POS_MAP = {
    'accept': 'Глагол',
    'backward': 'Наречие',
    'balcony': 'Существительное',
    'banish': 'Глагол',
    'banner': 'Существительное',
    'blackness': 'Существительное',
    'boom': 'Глагол',
    'bronze': 'Существительное',
    'buckle': 'Глагол',
    'carp': 'Существительное',
    'centipede': 'Существительное',
    'ceremonial': 'Прилагательное',
    'ceremonious': 'Прилагательное',
    'chopstick': 'Существительное',
    'claw': 'Существительное',
    'coil': 'Существительное',
    'convulsive': 'Прилагательное',
    'coral': 'Существительное',
    'crouch': 'Глагол',
    'crunch': 'Глагол',
    'crystallize': 'Глагол',
    'damp': 'Прилагательное',
    'darken': 'Глагол',
    'dauntless': 'Прилагательное',
    'dye': 'Глагол',
    'earnest': 'Прилагательное',
    'ebony': 'Существительное',
    'economical': 'Прилагательное',
    'extremity': 'Существительное',
    'feast': 'Существительное',
    'fiery': 'Прилагательное',
    'fireball': 'Существительное',
    'fit': 'Глагол',
    'fury': 'Существительное',
    'glare': 'Глагол',
    'gleam': 'Глагол',
    'glitter': 'Глагол',
    'glow': 'Глагол',
    'goldfish': 'Существительное',
    'gratitude': 'Существительное',
    'horrid': 'Прилагательное',
    'imaginable': 'Прилагательное',
    'inexhaustible': 'Прилагательное',
    'inhabitant': 'Существительное',
    'invulnerable': 'Прилагательное',
    'knight': 'Существительное',
    'liquid': 'Существительное',
    'lotus': 'Существительное',
    'magnificent': 'Прилагательное',
    'marble': 'Существительное',
    'mighty': 'Прилагательное',
    'monstrous': 'Прилагательное',
    'mortal': 'Прилагательное',
    'nostril': 'Существительное',
    'notch': 'Существительное',
    'occurrence': 'Существительное',
    'overspread': 'Глагол',
    'parapet': 'Существительное',
    'penetrate': 'Глагол',
    'pity': 'Существительное',
    'pledge': 'Глагол',
    'prey': 'Существительное',
    'procession': 'Существительное',
    'prosperous': 'Прилагательное',
    'quiver': 'Существительное',
    'reptile': 'Существительное',
    'retainer': 'Существительное',
    'retinue': 'Существительное',
    'roar': 'Глагол',
    'roast': 'Глагол',
    'robe': 'Существительное',
    'saliva': 'Существительное',
    'sally': 'Глагол',
    'saucepan': 'Существительное',
    'serpent': 'Существительное',
    'serpentine': 'Прилагательное',
    'shudder': 'Глагол',
    'silvery': 'Прилагательное',
    'single': 'Прилагательное',
    'sling': 'Глагол',
    'starlit': 'Прилагательное',
    'stew': 'Существительное',
    'stormy': 'Прилагательное',
    'sumptuous': 'Прилагательное',
    'terrify': 'Глагол',
    'thunder': 'Существительное',
    'token': 'Существительное',
    'tramp': 'Существительное',
    'tray': 'Существительное',
    'tremble': 'Глагол',
    'trout': 'Существительное',
    'wonder': 'Глагол',
}

def clean_filename(text):
    clean = re.sub(r"[^a-z0-9\s'-]", "", text.lower().strip())
    clean = re.sub(r"\s+", "_", clean)
    return clean

def main():
    print("Loading words.json...")
    with open(WORDS_JSON_PATH, "r", encoding="utf-8") as f:
        existing_words = json.load(f)

    existing_lemmas = {w["word"].lower().strip(): w for w in existing_words}
    max_id = max(w["id"] for w in existing_words)
    print(f"Current vocabulary size: {len(existing_words)}, Max ID: {max_id}")

    raw_batch = (
        fairy_tale_batch1.BATCH_1 +
        fairy_tale_batch2.BATCH_2 +
        fairy_tale_batch3.BATCH_3
    )
    print(f"Total raw items in batches: {len(raw_batch)}")

    new_entries = []
    next_id = max_id + 1

    for item in raw_batch:
        w_text = item["word"].strip()
        if w_text.lower() in existing_lemmas:
            print(f"Skipping already existing lemma: {w_text}")
            continue

        translations_dict = {}
        for lk in AUX_LANGS:
            translations_dict[lk] = item[lk]

        entry = {
            "id": next_id,
            "word": w_text,
            "translation": item["ru"],
            "transcription": item["transcription"],
            "level": item.get("level", "B1"),
            "category": item.get("category", "General"),
            "translations": translations_dict
        }
        new_entries.append(entry)
        next_id += 1

    print(f"Prepared {len(new_entries)} brand new entries (IDs {max_id + 1} to {next_id - 1})")

    # Append to existing
    updated_words = existing_words + new_entries
    with open(WORDS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(updated_words, f, ensure_ascii=False, indent=2)
    print(f"Updated {WORDS_JSON_PATH} successfully! Total words: {len(updated_words)}")

    # Fetch Sheet headers to build TSV/CSV
    sheet_csv_url = 'https://docs.google.com/spreadsheets/d/1pRIbBXzyYMlQKMJZir9l7SH7I13QZfYZ_GETcq1w_BY/gviz/tq?tqx=out:csv&sheet=Vocabulary'
    req = urllib.request.Request(sheet_csv_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            first_line = resp.readline().decode('utf-8')
        headers = next(csv.reader([first_line]))
    except Exception as e:
        print(f"Could not fetch online headers, using standard 62 columns: {e}")
        headers = [
            'id', 'word', 'transcription_IPA', 'translation', 'notes',
            'translation_uk', 'translation_kk', 'translation_de', 'translation_es', 'translation_fr',
            'translation_pl', 'translation_it', 'translation_tr', 'translation_pt', 'translation_ro',
            'translation_bg', 'translation_cs', 'translation_sk', 'translation_hu', 'translation_el',
            'translation_sl', 'translation_et', 'translation_lt', 'translation_da', 'translation_fi',
            'translation_sv', 'translation_hr', 'translation_lv', 'translation_ga', 'translation_mt',
            'translation_ur', 'translation_zh', 'translation_hi', 'translation_bn', 'translation_ar',
            'translation_fa', 'translation_id', 'translation_vi', 'translation_th', 'translation_ko',
            'translation_ja', 'length w', 'caunt words', 'category', 'Частотность Zipf',
            'Существительное', 'Глагол', 'Прилагательное', 'Наречие', 'Местоимение',
            'Предлог', 'Союз', 'Междометие', 'Числительное', 'Частица',
            'Артикль', 'Модальный глагол', 'Полумодальные конструкции', 'Фразовый глагол', 'Качество перевода',
            'transcription', 'level'
        ]

    rows_data = []
    for w in new_entries:
        w_text = w["word"]
        zipf_val = wordfreq.zipf_frequency(w_text, 'en')
        zipf_str = f"{zipf_val:.2f}".replace('.', ',')
        pos = POS_MAP.get(w_text.lower(), '')

        row = []
        for col in headers:
            col_clean = col.strip()
            col_lower = col_clean.lower()

            if col_lower == 'id':
                row.append(str(w["id"]))
            elif col_lower == 'word':
                row.append(w_text)
            elif col_lower in ('transcription_ipa', 'transcription'):
                row.append(w["transcription"])
            elif col_lower == 'translation':
                row.append(w["translation"])
            elif col_lower == 'notes':
                row.append('')
            elif col_lower.startswith('translation_'):
                lang = col_lower.replace('translation_', '')
                row.append(w["translations"].get(lang, ''))
            elif col_lower == 'length w':
                row.append(str(len(w_text)))
            elif col_lower in ('caunt words', 'count words'):
                row.append(str(len(w_text.split())))
            elif col_lower == 'category':
                row.append(w["category"])
            elif 'zipf' in col_lower:
                row.append(zipf_str)
            elif col_clean == 'Существительное':
                row.append('1' if pos == 'Существительное' else '')
            elif col_clean == 'Глагол':
                row.append('1' if pos == 'Глагол' else '')
            elif col_clean == 'Прилагательное':
                row.append('1' if pos == 'Прилагательное' else '')
            elif col_clean == 'Наречие':
                row.append('1' if pos == 'Наречие' else '')
            elif col_lower == 'level':
                row.append(w["level"])
            else:
                row.append('')
        rows_data.append(row)

    # Save TSV
    tsv_path = os.path.join(ROOT_DIR, 'Google_Sheets_Fairy_Tale_Words.tsv')
    with open(tsv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter='\t')
        for r in rows_data:
            writer.writerow(r)
    print(f"Generated {tsv_path} with {len(rows_data)} rows.")

    # Save CSV
    csv_path = os.path.join(ROOT_DIR, 'Google_Sheets_Fairy_Tale_Words.csv')
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for r in rows_data:
            writer.writerow(r)
    print(f"Generated {csv_path} with {len(rows_data)} rows.")

    # Generate Google Apps Script snippet
    gas_snippet = f"""// Вставьте этот код в Расширения -> Apps Script таблицы и нажмите Выполнить (Run):
function append92FairyTaleWords() {{
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Vocabulary');
  var newRows = {json.dumps(rows_data, ensure_ascii=False, indent=2)};
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  SpreadsheetApp.flush();
  Logger.log('Успешно добавлено ' + newRows.length + ' слов!');
}}
"""
    gas_path = os.path.join(ROOT_DIR, 'append_fairy_tale_words.gs')
    with open(gas_path, 'w', encoding='utf-8') as f:
        f.write(gas_snippet)
    print(f"Generated {gas_path} successfully.")

if __name__ == '__main__':
    main()
