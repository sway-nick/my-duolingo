import json
import csv
import urllib.request

SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1pRIbBXzyYMlQKMJZir9l7SH7I13QZfYZ_GETcq1w_BY/gviz/tq?tqx=out:csv&sheet=Vocabulary'

# 1. Fetch exact sheet headers
req = urllib.request.Request(SHEET_CSV_URL, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    first_line = resp.readline().decode('utf-8')

# Parse CSV headers
headers = next(csv.reader([first_line]))
print(f"Total columns in Google Sheet: {len(headers)}")

# 2. Load 16 new words from words.json
with open('frontend/assets/data/words.json', 'r', encoding='utf-8') as f:
    all_words = json.load(f)

new_words = all_words[-16:]
print(f"Loaded {len(new_words)} words: {[w['word'] for w in new_words]}")

# 3. Build rows matching the 62 columns
rows_data = []
for w in new_words:
    row = []
    word_text = w.get('word', '')
    trans_ru = w.get('translation', '')
    transcription = w.get('transcription', '')
    category = w.get('category', '')
    level = w.get('level', '')
    translations = w.get('translations', {})

    for col in headers:
        col_clean = col.strip()
        col_lower = col_clean.lower()

        if col_lower == 'id':
            row.append(str(w.get('id', '')))
        elif col_lower == 'word':
            row.append(word_text)
        elif col_lower in ('transcription_ipa', 'transcription'):
            row.append(transcription)
        elif col_lower == 'translation':
            row.append(trans_ru)
        elif col_lower == 'notes':
            row.append(w.get('notes', ''))
        elif col_lower.startswith('translation_'):
            lang = col_lower.replace('translation_', '')
            row.append(translations.get(lang, ''))
        elif col_lower == 'category':
            row.append(category)
        elif col_lower == 'level':
            row.append(level)
        elif col_lower == 'length w':
            row.append(str(len(word_text)))
        elif col_lower == 'caunt words':
            row.append(str(len(word_text.split())))
        elif 'zipf' in col_lower:
            # Default zipf based on level/category
            zipf_map = {'A1': '5.2', 'A2': '4.5', 'B1': '3.8', 'B2': '3.2'}
            row.append(zipf_map.get(level, '4.0'))
        else:
            row.append('')

    rows_data.append(row)

# 4. Save to TSV (perfect for copying and pasting into Google Sheets)
tsv_path = 'Google_Sheets_New_Words.tsv'
with open(tsv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, delimiter='\t')
    for r in rows_data:
        writer.writerow(r)

print(f"Generated {tsv_path} ({len(rows_data)} rows)")

# 5. Save to CSV
csv_path = 'Google_Sheets_New_Words.csv'
with open(csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    for r in rows_data:
        writer.writerow(r)

print(f"Generated {csv_path} ({len(rows_data)} rows)")

# 6. Generate Google Apps Script snippet for 1-click execution
gas_snippet = f"""// Вставьте этот код в Расширения -> Apps Script таблицы и нажмите Выполнить (Run):
function append16NewWords() {{
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Vocabulary');
  var newRows = {json.dumps(rows_data, ensure_ascii=False, indent=2)};
  
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  SpreadsheetApp.flush();
  Logger.log('Успешно добавлено ' + newRows.length + ' слов!');
}}
"""
with open('append_words_to_google_sheet.gs', 'w', encoding='utf-8') as f:
    f.write(gas_snippet)

print("Generated append_words_to_google_sheet.gs successfully.")
