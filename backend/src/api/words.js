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

const PROFANITY_BLOCKLIST = [
  'fuck', 'fucking', 'fucker', 'fucked', 'fucks',
  'shit', 'shitty', 'bitch', 'bitches', 'cunt', 'cunts',
  'dick', 'dicks', 'pussy', 'pussies', 'asshole', 'assholes',
  'bastard', 'bastards', 'slut', 'sluts', 'whore', 'whores',
  'nigger', 'niggers', 'nigga', 'fag', 'faggot', 'retard',
  'cock', 'cocks', 'blowjob', 'handjob', 'porn', 'porno',
  'хуй', 'хуя', 'хуе', 'пизд', 'ебат', 'ебан', 'бляд', 'сука', 'мудак', 'гандон'
];

function isProfanityText(text) {
  const t = String(text || '').toLowerCase();
  return PROFANITY_BLOCKLIST.some((bad) => {
    const regex = new RegExp('\\b' + bad + '\\b', 'i');
    return regex.test(t) || t.includes(bad);
  });
}

const GEMINI_TEXT_CASCADE = [
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.5-flash'
];

function callGeminiTextCascade(apiKey, prompt, maxTokens) {
  let lastError = null;
  let isRateLimited = false;

  for (let i = 0; i < GEMINI_TEXT_CASCADE.length; i++) {
    const model = GEMINI_TEXT_CASCADE[i];
    try {
      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens || 250, temperature: 0.1 },
      };

      const url =
        'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(model) +
        ':generateContent?key=' +
        encodeURIComponent(apiKey);

      const response = UrlFetchApp.fetch(url, {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      });

      const code = response.getResponseCode();
      if (code === 200) {
        const resText = response.getContentText();
        const jsonMatch = resText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return { success: true, data: JSON.parse(jsonMatch[0]), modelUsed: model };
        }
      } else if (code === 429) {
        isRateLimited = true;
        console.warn('Gemini 429 rate limit on model ' + model + ', trying next fallback...');
      } else {
        lastError = response.getContentText();
      }
    } catch (err) {
      lastError = err.message;
      console.warn('Gemini call error on model ' + model + ':', err);
    }
  }

  if (isRateLimited) {
    return { success: false, error: '⏳ Превышен лимит запросов к AI. Подождите 20-30 секунд и попробуйте снова.' };
  }
  return { success: false, error: lastError || 'Сбой связи с сервером AI.' };
}

function wordsAddPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['word']);

  let rawWord = String(body.word || '').trim().toLowerCase();
  let rawTranslation = String(body.translation || '').trim().toLowerCase();
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

  // Strict English characters validation (only a-z, spaces, hyphens, apostrophes - NO digits, NO cyrillic)
  if (!/^[a-z\s\-\']+$/i.test(rawWord) || /[0-9\u0400-\u04FF]/.test(rawWord)) {
    return errorResponse('Поле английского слова должно содержать только буквы английского алфавита (без цифр и кириллицы).', 400);
  }

  // Local profanity filter
  if (isProfanityText(rawWord) || isProfanityText(rawTranslation)) {
    return errorResponse('Ненормативная, оскорбительная или нецензурная лексика строго запрещена.', 400);
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
  if (!apiKey) {
    return errorResponse('API-ключ Gemini не настроен на сервере Apps Script.', 500);
  }

  const prompt = `You are an expert bilingual lexicographer and dictionary editor.
Validate if the English word "${rawWord}" with user's translation "${rawTranslation}" can be added to an educational vocabulary.

Step 1. Profanity & Hate Speech Check:
Is "${rawWord}" or "${rawTranslation}" vulgar, offensive, swear word, slurs, or NSFW?
-> If YES, respond: {"valid": false, "rejectReason": "Ненормативная лексика запрещена."}

Step 2. Proper Noun Check:
Is "${rawWord}" purely a proper noun (e.g. personal name, city, brand) with no common vocabulary meaning?
-> If YES, respond: {"valid": false, "rejectReason": "Имена собственные и названия не добавляются в словарь."}

Step 3. Translation Accuracy Check:
What are the actual definitions/translations of the English word "${rawWord}" in Russian/Ukrainian?
Does the user's translation "${rawTranslation}" accurately translate "${rawWord}"?
CRITICAL: If "${rawTranslation}" is completely wrong or unrelated (for example: word "trump" translated as "собака", or "cat" translated as "автомобиль"):
-> You MUST respond: {"valid": false, "rejectReason": "Перевод «${rawTranslation}» неверен для слова «${rawWord}». Правильные варианты: козырь, козырная карта, козырять."}

Step 4. If and only if the translation is legitimate:
Output:
{
  "valid": true,
  "cleanWord": "<lowercase english word>",
  "cleanTranslation": "<corrected lowercase translation>",
  "transcription": "/<ipa>/",
  "level": "<A1|A2|B1|B2|C1>",
  "zipf": <float between 1.0 and 7.0>,
  "rejectReason": ""
}

Respond with ONLY raw JSON without markdown formatting:`;

  const aiResult = callGeminiTextCascade(apiKey, prompt, 250);
  if (!aiResult.success) {
    return errorResponse(aiResult.error || 'Сбой AI-модерации.', 500);
  }

  const aiData = aiResult.data;
  if (aiData.valid === false) {
    return errorResponse(aiData.rejectReason || 'Слово не прошло модерацию безопасности.', 400);
  }

  if (aiData.cleanWord) aiCleanWord = String(aiData.cleanWord).toLowerCase().trim();
  if (aiData.cleanTranslation) aiCleanTranslation = String(aiData.cleanTranslation).toLowerCase().trim();
  if (aiData.transcription) aiTranscription = aiData.transcription;
  if (aiData.level) aiLevel = aiData.level;
  if (aiData.zipf) aiZipf = parseFloat(aiData.zipf) || 4.2;

  // Force clean lowercase
  aiCleanWord = aiCleanWord.toLowerCase().trim();
  aiCleanTranslation = aiCleanTranslation.toLowerCase().trim();

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

function suggestTranslationsPost(e) {
  const body = getJsonBody(e);
  const rawWord = String(body.word || '').trim().toLowerCase();
  const lang = String(body.lang || 'ru').trim().toLowerCase();

  if (!rawWord || rawWord.length < 2) {
    return successResponse({ suggestions: [], category: 'Общие', transcription: '' });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return successResponse({ suggestions: [], category: 'Общие', transcription: '' });
  }

  const targetLang = lang === 'uk' ? 'Ukrainian' : 'Russian';
  const prompt = `Translate the English word "${rawWord}" into ${targetLang}.
Return 2 to 4 of the most common, accurate, lowercase translations (e.g. for "trump" in Russian: ["козырь", "козырная карта", "козырять"]).
Also provide a category (e.g. "Общие", "Еда", "Бизнес", "Спорт", etc.) and IPA transcription.
Respond with ONLY raw JSON without markdown:
{
  "suggestions": ["перевод 1", "перевод 2"],
  "category": "Общие",
  "transcription": "/.../"
}`;

  const aiResult = callGeminiTextCascade(apiKey, prompt, 200);
  if (aiResult.success && aiResult.data) {
    const data = aiResult.data;
    return successResponse({
      suggestions: Array.isArray(data.suggestions) ? data.suggestions.map((s) => String(s).toLowerCase().trim()) : [],
      category: data.category || 'Общие',
      transcription: data.transcription || '',
    });
  }

  return successResponse({ suggestions: [], category: 'Общие', transcription: '' });
}
