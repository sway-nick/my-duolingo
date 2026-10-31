import json
import wordfreq
import csv
import urllib.request

with open('frontend/assets/data/words.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

new_words = words[-16:]

# 1. AR:AS (category and Частотность Zipf)
ar_as_rows = []
for w in new_words[:-1]: # 15 words currently in sheet
    z = str(wordfreq.zipf_frequency(w['word'], 'en')).replace('.', ',')
    ar_as_rows.append(f"{w['category']}\t{z}")

with open('fill_columns_AR_AS.tsv', 'w', encoding='utf-8') as f:
    f.write("\n".join(ar_as_rows) + "\n")

# 2. BJ (level)
bj_rows = [w['level'] for w in new_words[:-1]]
with open('fill_column_BJ.tsv', 'w', encoding='utf-8') as f:
    f.write("\n".join(bj_rows) + "\n")

# 3. C (transcription_IPA)
c_rows = [w.get('transcription', '') for w in new_words[:-1]]
with open('fill_column_C.tsv', 'w', encoding='utf-8') as f:
    f.write("\n".join(c_rows) + "\n")

# 4. Row 6926 for metro (all 62 columns)
url = 'https://docs.google.com/spreadsheets/d/1pRIbBXzyYMlQKMJZir9l7SH7I13QZfYZ_GETcq1w_BY/gviz/tq?tqx=out:csv&sheet=Vocabulary'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    headers = next(csv.reader([resp.readline().decode('utf-8')]))

metro_word = new_words[-1] # metro
metro_row = []
for col in headers:
    col_lower = col.strip().lower()
    if col_lower == 'id':
        metro_row.append(str(metro_word['id']))
    elif col_lower == 'word':
        metro_row.append(metro_word['word'])
    elif col_lower in ('transcription_ipa', 'transcription'):
        metro_row.append(metro_word.get('transcription', ''))
    elif col_lower == 'translation':
        metro_row.append(metro_word.get('translation', ''))
    elif col_lower.startswith('translation_'):
        lang = col_lower.replace('translation_', '')
        metro_row.append(metro_word.get('translations', {}).get(lang, ''))
    elif col_lower == 'category':
        metro_row.append(metro_word.get('category', 'Travel'))
    elif col_lower == 'level':
        metro_row.append(metro_word.get('level', 'A1'))
    elif col_lower == 'length w':
        metro_row.append(str(len(metro_word['word'])))
    elif col_lower == 'caunt words':
        metro_row.append('1')
    elif 'zipf' in col_lower:
        metro_row.append(str(wordfreq.zipf_frequency('metro', 'en')).replace('.', ','))
    else:
        metro_row.append('')

with open('row_6926_metro.tsv', 'w', encoding='utf-8') as f:
    f.write("\t".join(metro_row) + "\n")

# 5. One-click Apps Script that fixes everything directly in the sheet!
gas_code = f"""// Функция для автоматического заполнения недостающих category, Zipf, level, IPA и добавления metro
function fixMissingCategoriesAndZipf() {{
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Vocabulary');
  
  // 1. Заполняем AR6911:AS6925 (category и Частотность Zipf)
  var catZipfData = {json.dumps([[w['category'], float(wordfreq.zipf_frequency(w['word'], 'en'))] for w in new_words[:-1]], ensure_ascii=False)};
  sheet.getRange(6911, 44, catZipfData.length, 2).setValues(catZipfData); // Col 44 = AR
  
  // 2. Заполняем BJ6911:BJ6925 (level)
  var levelData = {json.dumps([[w['level']] for w in new_words[:-1]], ensure_ascii=False)};
  sheet.getRange(6911, 62, levelData.length, 1).setValues(levelData); // Col 62 = BJ
  
  // 3. Заполняем C6911:C6925 (transcription_IPA)
  var ipaData = {json.dumps([[w.get('transcription', '')] for w in new_words[:-1]], ensure_ascii=False)};
  sheet.getRange(6911, 3, ipaData.length, 1).setValues(ipaData); // Col 3 = C
  
  // 4. Проверяем, есть ли metro (строка 6926)
  if (sheet.getLastRow() < 6926) {{
    var metroRow = {json.dumps([metro_row], ensure_ascii=False)};
    sheet.getRange(6926, 1, 1, metroRow[0].length).setValues(metroRow);
  }}
  
  SpreadsheetApp.flush();
  Logger.log('Готово! Поля category, Zipf, level, транскрипция и слово metro успешно заполнены.');
}}
"""

with open('fill_sheet_missing_data.gs', 'w', encoding='utf-8') as f:
    f.write(gas_code)

print("Generated all files successfully.")
