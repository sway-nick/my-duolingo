function wordsGet() {
  const sheet = getSheet('Vocabulary');

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return successResponse([]);

  const headers = values[0].map((h) => String(h).trim().toLowerCase());

  // Find column indices dynamically
  const idIdx = headers.indexOf('id');
  const wordIdx = headers.indexOf('word');

  let transIdx = headers.indexOf('transcription_ipa');
  if (transIdx < 0) transIdx = headers.indexOf('transcription_ru');
  if (transIdx < 0) transIdx = headers.findIndex((h) => h.includes('transcription'));

  let zipfIdx = headers.indexOf('частотность zipf');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('частотность_zipf');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('zipf');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('zipf_frequency');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('frequency');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('частотность');
  if (zipfIdx < 0) zipfIdx = headers.findIndex((h) => h.includes('zipf') || h.includes('частот'));

  const translnIdx = headers.indexOf('translation');
  const catIdx = headers.indexOf('category');
  const lvlIdx = headers.indexOf('level');
  const notesIdx = headers.indexOf('notes');

  values.shift();

  const words = values.map((row) => {
    let transcription = '';
    if (transIdx >= 0 && row[transIdx] !== undefined) {
      transcription = String(row[transIdx]).trim();
    }

    if (transcription) {
      transcription = transcription.replace(/^[\/\[]/, '').replace(/[\/\]]$/, '');
      transcription = `/${transcription}/`;
    }

    let notes = '';
    if (notesIdx >= 0 && row[notesIdx] !== undefined) {
      notes = String(row[notesIdx]).trim();
    }

    let zipf = 0;
    if (zipfIdx >= 0 && row[zipfIdx] !== undefined && row[zipfIdx] !== '') {
      let v = String(row[zipfIdx]).replace(',', '.').trim();
      zipf = parseFloat(v) || 0;
    }

    return {
      id: row[idIdx >= 0 ? idIdx : 0],
      word: row[wordIdx >= 0 ? wordIdx : 1],
      transcription: transcription,
      translation: row[translnIdx >= 0 ? translnIdx : 3],
      category: row[catIdx >= 0 ? catIdx : 4],
      level: row[lvlIdx >= 0 ? lvlIdx : 5],
      notes: notes,
      zipf: zipf,
    };
  });

  // Сортировка по убыванию частотности Zipf: сначала самые частые и полезные слова
  words.sort((a, b) => (Number(b.zipf) || 0) - (Number(a.zipf) || 0));

  return successResponse(words);
}

function wordsAddPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['word']);

  const rawWord = String(body.word || '').trim();
  const rawTranslation = String(body.translation || '').trim();
  const rawCategory = String(body.category || 'Общие').trim();
  const rawNotes = String(body.notes || '').trim();

  // Length validations
  if (rawWord.length < 2 || rawWord.length > 35) {
    return errorResponse('Длина слова должна быть от 2 до 35 символов.', 400);
  }
  if (rawTranslation.length > 60) {
    return errorResponse('Длина перевода не должна превышать 60 символов.', 400);
  }
  if (rawCategory.length > 25) {
    return errorResponse('Название категории не должно превышать 25 символов.', 400);
  }
  if (rawNotes.length > 120) {
    return errorResponse('Длина примечания не должна превышать 120 символов.', 400);
  }

  const sheet = getSheet('Vocabulary');
  const values = sheet.getDataRange().getValues();
  if (values.length === 0) return errorResponse('Лист Vocabulary пуст', 500);

  const headers = values[0].map((h) => String(h).trim().toLowerCase());
  const idIdx = headers.indexOf('id');
  const wordIdx = headers.indexOf('word');

  let transIdx = headers.indexOf('transcription_ipa');
  if (transIdx < 0) transIdx = headers.indexOf('transcription_ru');
  if (transIdx < 0) transIdx = headers.findIndex((h) => h.includes('transcription'));

  let zipfIdx = headers.indexOf('частотность zipf');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('частотность_zipf');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('zipf');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('zipf_frequency');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('frequency');
  if (zipfIdx < 0) zipfIdx = headers.indexOf('частотность');
  if (zipfIdx < 0) zipfIdx = headers.findIndex((h) => h.includes('zipf') || h.includes('частот'));

  const translnIdx = headers.indexOf('translation');
  const catIdx = headers.indexOf('category');
  const lvlIdx = headers.indexOf('level');
  const notesIdx = headers.indexOf('notes');

  const cleanInputWord = rawWord.toLowerCase();

  // Search if word already exists (case-insensitive)
  let foundRowIndex = -1;
  let maxNumericId = 0;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowWord = String(row[wordIdx >= 0 ? wordIdx : 1] || '').trim().toLowerCase();
    const rowId = row[idIdx >= 0 ? idIdx : 0];
    const numId = parseInt(rowId, 10);
    if (!isNaN(numId) && numId > maxNumericId) {
      maxNumericId = numId;
    }

    if (rowWord === cleanInputWord) {
      foundRowIndex = i + 1; // 1-indexed sheet row
      break;
    }
  }

  // CASE 1: Word already exists -> update notes only!
  if (foundRowIndex > 0) {
    if (notesIdx >= 0) {
      sheet.getRange(foundRowIndex, notesIdx + 1).setValue(rawNotes);
    }
    const existingRow = values[foundRowIndex - 1];
    return successResponse({
      action: 'updated_notes',
      message: 'Заметка к существующему слову успешно обновлена!',
      word: {
        id: existingRow[idIdx >= 0 ? idIdx : 0],
        word: existingRow[wordIdx >= 0 ? wordIdx : 1],
        transcription: transIdx >= 0 ? existingRow[transIdx] : '',
        translation: translnIdx >= 0 ? existingRow[translnIdx] : '',
        category: catIdx >= 0 ? existingRow[catIdx] : '',
        level: lvlIdx >= 0 ? existingRow[lvlIdx] : '',
        notes: rawNotes,
        zipf: zipfIdx >= 0 ? parseFloat(existingRow[zipfIdx]) || 0 : 0,
      },
    });
  }

  // CASE 2: New word -> AI Moderation & Auto-Enrichment via Gemini
  let aiCleanWord = rawWord;
  let aiCleanTranslation = rawTranslation;
  let aiTranscription = '';
  let aiLevel = 'A2';
  let aiZipf = 4.2;

  const apiKey = getGeminiApiKey();
  if (apiKey) {
    try {
      const prompt = `You are an English vocabulary moderator.
Check if the word "${rawWord}" and translation "${rawTranslation}" are valid for an English learning app.
Rules:
1. Block any profanity, hate speech, vulgarity, insults, or gibberish.
2. Fix minor typos in the English word and translation if needed.
3. Provide IPA transcription in slashes like /.../, CEFR level (A1, A2, B1, B2, C1), and estimated Zipf frequency (1.0 to 7.0).
Respond with ONLY raw JSON without markdown:
{
  "valid": true,
  "cleanWord": "word",
  "cleanTranslation": "translation",
  "transcription": "/.../",
  "level": "A2",
  "zipf": 4.5,
  "rejectReason": ""
}`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 250, temperature: 0.1 },
      };

      const url =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
        encodeURIComponent(apiKey);

      const response = UrlFetchApp.fetch(url, {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      });

      if (response.getResponseCode() === 200) {
        const resText = response.getContentText();
        const jsonMatch = resText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0]);
          if (aiData.valid === false) {
            return errorResponse(aiData.rejectReason || 'Слово не прошло модерацию безопасности.', 400);
          }
          if (aiData.cleanWord) aiCleanWord = aiData.cleanWord;
          if (aiData.cleanTranslation) aiCleanTranslation = aiData.cleanTranslation;
          if (aiData.transcription) aiTranscription = aiData.transcription;
          if (aiData.level) aiLevel = aiData.level;
          if (aiData.zipf) aiZipf = parseFloat(aiData.zipf) || 4.2;
        }
      }
    } catch (err) {
      console.warn('AI moderation fallback:', err);
    }
  }

  // Generate unique ID
  const newId = maxNumericId > 0 ? String(maxNumericId + 1) : 'w_' + Date.now().toString(36);

  // Build row array according to existing header order
  const newRow = new Array(values[0].length).fill('');
  if (idIdx >= 0) newRow[idIdx] = newId;
  if (wordIdx >= 0) newRow[wordIdx] = aiCleanWord;
  if (transIdx >= 0) newRow[transIdx] = aiTranscription;
  if (translnIdx >= 0) newRow[translnIdx] = aiCleanTranslation;
  if (catIdx >= 0) newRow[catIdx] = rawCategory || 'Общие';
  if (lvlIdx >= 0) newRow[lvlIdx] = aiLevel;
  if (notesIdx >= 0) newRow[notesIdx] = rawNotes;
  if (zipfIdx >= 0) newRow[zipfIdx] = aiZipf;

  sheet.appendRow(newRow);

  const createdWord = {
    id: newId,
    word: aiCleanWord,
    transcription: aiTranscription,
    translation: aiCleanTranslation,
    category: rawCategory || 'Общие',
    level: aiLevel,
    notes: rawNotes,
    zipf: aiZipf,
  };

  return successResponse({
    action: 'created',
    message: 'Слово успешно проверено и добавлено в словарь!',
    word: createdWord,
  });
}
