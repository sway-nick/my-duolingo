/**
 * Speech-to-Text Audio Transcription via Google Gemini API.
 * Receives Base64 audio from MediaRecorder on client, sends to Gemini, returns transcribed word.
 */

function getGeminiApiKey() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';
}

function setGeminiApiKey(key) {
  if (key) {
    PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', String(key).trim());
    return successResponse({ message: 'GEMINI_API_KEY updated successfully' });
  }
  return errorResponse('API key cannot be empty', 400);
}

function testGeminiAuthorization() {
  var apiKey = getGeminiApiKey();
  if (!apiKey) {
    Logger.log(
      '⚠️ GEMINI_API_KEY is not set in Script Properties yet. Please set it in Project Settings -> Script Properties.',
    );
  }
  var url =
    'https://generativelanguage.googleapis.com/v1beta/models' +
    (apiKey ? '?key=' + encodeURIComponent(apiKey) : '');
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  Logger.log('Status: ' + res.getResponseCode());
  return res.getResponseCode() === 200;
}

function transcribePost(e) {
  var body = getJsonBody(e);
  validateRequired(body, ['audioBase64']);

  var audioBase64 = String(body.audioBase64 || '').trim();
  var rawMime = String(body.mimeType || 'audio/webm').toLowerCase();
  var cleanMime = rawMime.split(';')[0].trim();
  if (cleanMime === 'audio/mp4' || cleanMime === 'audio/x-m4a') {
    cleanMime = 'audio/m4a';
  }

  var expectedWord = String(body.expectedWord || '').trim();
  var apiKey = getGeminiApiKey();

  if (!apiKey) {
    return errorResponse('Gemini API key is not configured.', 500);
  }

  // Список моделей: gemini-3.6-flash (быстрая и стабильная), fallbacks
  var defaultModel =
    PropertiesService.getScriptProperties().getProperty('GEMINI_TRANSCRIPTION_MODEL') ||
    'gemini-3.6-flash';

  var modelsToTry = [defaultModel, 'gemini-3.7-flash', 'gemini-3.5-flash'];

  var promptText =
    'You are an expert English pronunciation evaluator for language learners.\n' +
    'Target English word: "' + expectedWord + '"\n\n' +
    'TASK (2 steps):\n' +
    '1. First, blind-transcribe what word the speaker actually uttered into "heard" (lowercase, clean). Ignore background noise, breathing, or mic clicks.\n' +
    '2. Compare "heard" with the target word "' + expectedWord + '". Classify match into "category":\n' +
    '   - "exact_match": word matches accurately with native or natural pronunciation.\n' +
    '   - "close_accented_variant": the intended word is clearly recognizable, but has noticeable non-native accent/phoneme distortion (e.g. /θ/ vs /s/, /w/ vs /v/, /r/ vs /l/, vowel length /ɪ/ vs /iː/, devoiced final consonant).\n' +
    '   - "wrong_word": speaker said a completely different word, extra phrases, or unintelligible speech.\n' +
    '   - "no_speech_detected": silence, cough, noise only.\n\n' +
    'Respond strictly in JSON format:\n' +
    '{\n' +
    '  "heard": "word",\n' +
    '  "category": "exact_match" | "close_accented_variant" | "wrong_word" | "no_speech_detected",\n' +
    '  "confidence": 0.0 to 1.0,\n' +
    '  "feedback": "short Russian tip max 8 words (e.g. Обратите внимание на звук /θ/ or Отличное произношение!)"\n' +
    '}';

  var payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: cleanMime || 'audio/webm',
              data: audioBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 150,
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingLevel: 'low',
      },
    },
  };

  var options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  var lastError = '';

  for (var m = 0; m < modelsToTry.length; m++) {
    var modelName = modelsToTry[m];
    try {
      var url =
        'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(modelName) +
        ':generateContent?key=' +
        encodeURIComponent(apiKey);
      var response = UrlFetchApp.fetch(url, options);
      var responseCode = response.getResponseCode();
      var responseText = response.getContentText();

      if (responseCode === 200) {
        var resJson = JSON.parse(responseText);
        var rawText =
          resJson &&
          resJson.candidates &&
          resJson.candidates[0] &&
          resJson.candidates[0].content &&
          resJson.candidates[0].content.parts &&
          resJson.candidates[0].content.parts[0]
            ? resJson.candidates[0].content.parts[0].text
            : '';

        var evaluation = {};
        try {
          var jsonMatch = String(rawText).match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            evaluation = JSON.parse(jsonMatch[0]);
          } else {
            evaluation = JSON.parse(rawText);
          }
        } catch (jsonErr) {
          evaluation = {};
        }

        var heard = String(evaluation.heard || evaluation.transcribed || '').trim().toLowerCase();
        var category = String(evaluation.category || '').toLowerCase();
        var confidence = Number(evaluation.confidence !== undefined ? evaluation.confidence : 0.85);
        var feedback = String(evaluation.feedback || '').trim();

        // Токенизация и проверка слов
        var heardTokens = heard.match(/[a-z]+(?:'[a-z]+)?/g) || [];
        var targetToken = String(expectedWord).trim().toLowerCase();

        var isCorrect = false;
        var score = 0;

        if (category === 'exact_match') {
          score = Math.min(100, Math.max(90, Math.round((confidence || 0.95) * 100)));
          isCorrect = true;
          if (!feedback) feedback = 'Отличное произношение!';
        } else if (category === 'close_accented_variant') {
          score = Math.min(88, Math.max(62, Math.round((confidence || 0.8) * 85)));
          isCorrect = true; // Слово угадано, замечание по произношению выдается в feedback
        } else if (category === 'wrong_word') {
          score = Math.min(45, Math.max(10, Math.round((confidence || 0.5) * 30)));
          isCorrect = false;
        } else if (category === 'no_speech_detected') {
          score = 0;
          isCorrect = false;
          if (!feedback) feedback = 'Голос не обнаружен';
        } else {
          // Fallback если категория не передана
          if (heardTokens.includes(targetToken)) {
            score = 80;
            isCorrect = true;
          } else {
            score = 20;
            isCorrect = false;
          }
        }

        // Защита от лишних слов (например "I don't know apple")
        if (isCorrect && heardTokens.length > 2 && !heardTokens.includes(targetToken)) {
          isCorrect = false;
          score = 25;
          feedback = 'Произнесите только одно слово: ' + expectedWord;
        }

        return successResponse({
          isCorrect: isCorrect,
          transcribed: heard || (heardTokens[0] || ''),
          score: score,
          feedback: feedback,
          category: category,
          modelUsed: modelName,
        });
      } else {
        lastError = 'Model ' + modelName + ' error (' + responseCode + '): ' + responseText;
      }
    } catch (err) {
      lastError = 'Model ' + modelName + ' exception: ' + err.message;
    }
  }

  return errorResponse('Gemini transcription failed across all models: ' + lastError, 500);
}
