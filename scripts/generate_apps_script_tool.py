# -*- coding: utf-8 -*-
import json
import wordfreq
import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(ROOT_DIR, "scripts"))

from build_fairy_tale_dictionary import POS_MAP

WORDS_JSON = os.path.join(ROOT_DIR, "frontend", "assets", "data", "words.json")
with open(WORDS_JSON, "r", encoding="utf-8") as f:
    all_words = json.load(f)

new_92 = all_words[-92:]

words_data = []
for w in new_92:
    w_text = w["word"].strip()
    z = str(round(wordfreq.zipf_frequency(w_text, "en"), 2)).replace(".", ",")
    pos = POS_MAP.get(w_text.lower(), "")
    words_data.append({
        "id": w["id"],
        "word": w_text,
        "translation": w["translation"],
        "transcription": w["transcription"],
        "level": w.get("level", "B1"),
        "category": w.get("category", "General"),
        "zipf": z,
        "pos": pos,
        "translations": w["translations"]
    })

gs_code = f"""// =========================================================================================
// СКРИПТ ДЛЯ ДОБАВЛЕНИЯ И ОБНОВЛЕНИЯ 92 НОВЫХ СЛОВ В GOOGLE ТАБЛИЦУ
// (Категории, частотность Zipf, транскрипция IPA, уровень, части речи, переводы)
// =========================================================================================
// Инструкция:
// 1. В вашей Google Таблице откройте меню: Расширения -> Apps Script
// 2. Создайте новый файл скрипта (назовите его, например, AddNewWords.gs) или вставьте в Код.gs
// 3. Вставьте этот код целиком и нажмите Сохранить (Ctrl+S)
// 4. В выпадающем списке сверху выберите функцию: addFairyTaleWords
// 5. Нажмите кнопку Выполнить (Run).
// =========================================================================================

function addFairyTaleWords() {{
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Vocabulary');
  if (!sheet) {{
    SpreadsheetApp.getUi().alert('Ошибка: Лист "Vocabulary" не найден!');
    return;
  }}

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) {{
    SpreadsheetApp.getUi().alert('Ошибка: Таблица пуста!');
    return;
  }}

  // Считываем заголовки (первая строка)
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {{
    return String(h || '').trim();
  }});

  // Карта колонок по нижнему регистру
  const colMap = {{}};
  headers.forEach(function(h, idx) {{
    colMap[h.toLowerCase()] = idx;
  }});

  // Поиск индексов ключевых колонок
  const wordIdx = colMap['word'];
  const idIdx = colMap['id'];
  const catIdx = colMap['category'];
  const lvlIdx = colMap['level'];

  let zipfIdx = -1;
  const zipfKey = Object.keys(colMap).find(function(k) {{ return k.indexOf('zipf') >= 0; }});
  if (zipfKey) zipfIdx = colMap[zipfKey];

  let transIpaIdx = colMap['transcription_ipa'] !== undefined ? colMap['transcription_ipa'] : colMap['transcription'];
  let transPlainIdx = colMap['transcription'];
  let transRuIdx = colMap['translation'] !== undefined ? colMap['translation'] : colMap['translation_ru'];

  const lenIdx = colMap['length w'];
  let countIdx = -1;
  const countKey = Object.keys(colMap).find(function(k) {{ return k.indexOf('caunt') >= 0 || k.indexOf('count') >= 0; }});
  if (countKey) countIdx = colMap[countKey];

  // Данные 92 новых слов
  const newWords = {json.dumps(words_data, ensure_ascii=False, indent=2)};
  const newWordsMap = {{}};
  newWords.forEach(function(item) {{
    newWordsMap[item.word.toLowerCase()] = item;
  }});

  let maxId = 0;
  const existingRowIndices = {{}}; // word -> rowNumber (1-based)

  if (lastRow > 1) {{
    const currentData = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    for (let r = 0; r < currentData.length; r++) {{
      const rowNum = r + 2;
      const wVal = String(currentData[r][wordIdx] || '').trim().toLowerCase();
      if (wVal) {{
        existingRowIndices[wVal] = rowNum;
      }}
      const curId = parseInt(currentData[r][idIdx], 10);
      if (!isNaN(curId) && curId > maxId) {{
        maxId = curId;
      }}
    }}
  }}

  let addedCount = 0;
  let updatedCount = 0;
  const rowsToAppend = [];
  let nextId = maxId > 0 ? maxId + 1 : 6958;

  newWords.forEach(function(item) {{
    const lowerWord = item.word.toLowerCase();
    
    // Если слово уже есть в таблице - заполняем недостающие поля
    if (existingRowIndices[lowerWord]) {{
      const targetRow = existingRowIndices[lowerWord];
      const curRowVals = sheet.getRange(targetRow, 1, 1, lastCol).getValues()[0];
      let rowModified = false;

      if (catIdx !== undefined && !curRowVals[catIdx]) {{
        sheet.getRange(targetRow, catIdx + 1).setValue(item.category);
        rowModified = true;
      }}
      if (zipfIdx !== -1 && !curRowVals[zipfIdx]) {{
        sheet.getRange(targetRow, zipfIdx + 1).setValue(item.zipf);
        rowModified = true;
      }}
      if (transIpaIdx !== undefined && !curRowVals[transIpaIdx]) {{
        sheet.getRange(targetRow, transIpaIdx + 1).setValue(item.transcription);
        rowModified = true;
      }}
      if (transPlainIdx !== undefined && transPlainIdx !== transIpaIdx && !curRowVals[transPlainIdx]) {{
        sheet.getRange(targetRow, transPlainIdx + 1).setValue(item.transcription);
        rowModified = true;
      }}
      if (lvlIdx !== undefined && !curRowVals[lvlIdx]) {{
        sheet.getRange(targetRow, lvlIdx + 1).setValue(item.level);
        rowModified = true;
      }}
      if (transRuIdx !== undefined && !curRowVals[transRuIdx]) {{
        sheet.getRange(targetRow, transRuIdx + 1).setValue(item.translation);
        rowModified = true;
      }}
      if (lenIdx !== undefined && !curRowVals[lenIdx]) {{
        sheet.getRange(targetRow, lenIdx + 1).setValue(item.word.length);
        rowModified = true;
      }}
      if (countIdx !== -1 && !curRowVals[countIdx]) {{
        sheet.getRange(targetRow, countIdx + 1).setValue(item.word.split(/\\s+/).length);
        rowModified = true;
      }}
      if (item.pos && colMap[item.pos.toLowerCase()] !== undefined) {{
        const pIdx = colMap[item.pos.toLowerCase()];
        if (!curRowVals[pIdx]) {{
          sheet.getRange(targetRow, pIdx + 1).setValue(1);
          rowModified = true;
        }}
      }}
      // Переводы
      if (item.translations) {{
        Object.keys(item.translations).forEach(function(lang) {{
          const lKey = 'translation_' + lang.toLowerCase();
          if (colMap[lKey] !== undefined) {{
            const lIdx = colMap[lKey];
            if (!curRowVals[lIdx]) {{
              sheet.getRange(targetRow, lIdx + 1).setValue(item.translations[lang]);
              rowModified = true;
            }}
          }}
        }});
      }}

      if (rowModified) updatedCount++;
    }} else {{
      // Создаем новую строку
      const newRow = new Array(lastCol).fill('');
      if (idIdx !== undefined) newRow[idIdx] = nextId;
      if (wordIdx !== undefined) newRow[wordIdx] = item.word;
      if (transIpaIdx !== undefined) newRow[transIpaIdx] = item.transcription;
      if (transPlainIdx !== undefined) newRow[transPlainIdx] = item.transcription;
      if (transRuIdx !== undefined) newRow[transRuIdx] = item.translation;
      if (catIdx !== undefined) newRow[catIdx] = item.category;
      if (zipfIdx !== -1) newRow[zipfIdx] = item.zipf;
      if (lvlIdx !== undefined) newRow[lvlIdx] = item.level;
      if (lenIdx !== undefined) newRow[lenIdx] = item.word.length;
      if (countIdx !== -1) newRow[countIdx] = item.word.split(/\\s+/).length;

      if (item.pos && colMap[item.pos.toLowerCase()] !== undefined) {{
        newRow[colMap[item.pos.toLowerCase()]] = 1;
      }}

      if (item.translations) {{
        Object.keys(item.translations).forEach(function(lang) {{
          const lKey = 'translation_' + lang.toLowerCase();
          if (colMap[lKey] !== undefined) {{
            newRow[colMap[lKey]] = item.translations[lang];
          }}
        }});
      }}

      rowsToAppend.push(newRow);
      nextId++;
      addedCount++;
    }}
  }});

  if (rowsToAppend.length > 0) {{
    const insertStartRow = sheet.getLastRow() + 1;
    sheet.getRange(insertStartRow, 1, rowsToAppend.length, lastCol).setValues(rowsToAppend);
  }}

  SpreadsheetApp.flush();

  const report = 'Готово!\\n' +
                 '• Добавлено новых строк: ' + addedCount + '\\n' +
                 '• Обновлено существующих строк: ' + updatedCount + '\\n' +
                 'Все категории, частотность Zipf, транскрипции и переводы заполнены!';
  Logger.log(report);
  SpreadsheetApp.getUi().alert(report);
}}
"""

out_path = os.path.join(ROOT_DIR, "append_fairy_tale_words.gs")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(gs_code)

print(f"Generated {out_path} ({len(gs_code)} chars)")
