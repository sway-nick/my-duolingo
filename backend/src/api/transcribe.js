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

function transcribePingPost(e) {
  var t0 = Date.now();
  var body = {};
  try {
    body = getJsonBody(e);
  } catch (err) {
    body = {};
  }
  return successResponse({
    ping: 'pong',
    receivedLength: (e && e.postData && e.postData.length) || 0,
    audioChars: String(body.audioBase64 || '').length,
    mimeType: body.mimeType || '',
    expectedWord: body.expectedWord || '',
    serverParseMs: Date.now() - t0,
  });
}

function transcribePost(e) {
  var t0 = Date.now();
  var body = getJsonBody(e);
  var parseMs = Date.now() - t0;
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

  // Список активных моделей Gemini API
  var modelsToTry = ['gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];

  var promptText =
    'Transcribe only the spoken English words in this audio. Output plain text in lowercase without punctuation, quotes, or markdown.';

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
      maxOutputTokens: 30,
    },
  };

  var options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  var lastError = '';
  var geminiMs = 0;

  for (var m = 0; m < modelsToTry.length; m++) {
    var modelName = modelsToTry[m];
    try {
      var url =
        'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(modelName) +
        ':generateContent?key=' +
        encodeURIComponent(apiKey);
      var g0 = Date.now();
      var response = UrlFetchApp.fetch(url, options);
      geminiMs = Date.now() - g0;
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

        var heard = String(rawText || '')
          .toLowerCase()
          .replace(/[^a-z0-9\s']/g, ' ')
          .trim();

        var heardTokens = heard.match(/[a-z0-9]+(?:'[a-z]+)?/g) || [];
        var target = String(expectedWord || '')
          .toLowerCase()
          .replace(/[^a-z0-9\s']/g, ' ')
          .trim();
        var targetTokens = target.match(/[a-z0-9]+(?:'[a-z]+)?/g) || [];

        var isCorrect = false;
        var score = 0;
        var category = 'wrong_word';
        var feedback = '';

        if (heardTokens.length === 0) {
          category = 'no_speech_detected';
          score = 0;
          isCorrect = false;
          feedback = 'Голос не обнаружен. Попробуйте ещё раз.';
        } else if (heard === target || (targetTokens.length === 1 && heardTokens.includes(targetTokens[0]))) {
          category = 'exact_match';
          score = 96;
          isCorrect = true;
          feedback = 'Отличное произношение!';
        } else {
          // JS фонетическое и дистанционное сравнение
          var primaryHeard = heardTokens[0] || '';
          var primaryTarget = targetTokens[0] || '';
          
          var isPhoneticVariant = false;
          // Известные русскоязычные паттерны (th->s/z/f, w->v, short/long vowels)
          var normH = primaryHeard.replace(/^s/i, 'th').replace(/^z/i, 'th').replace(/^v/i, 'w');
          var normT = primaryTarget.replace(/^s/i, 'th').replace(/^z/i, 'th').replace(/^v/i, 'w');

          if (normH === normT || (primaryTarget.length >= 5 && Math.abs(primaryHeard.length - primaryTarget.length) <= 1)) {
            isPhoneticVariant = true;
          }

          if (isPhoneticVariant) {
            category = 'close_accented_variant';
            score = 78;
            isCorrect = true;
            feedback = 'Хорошо! Обратите внимание на чистоту звуков.';
          } else {
            category = 'wrong_word';
            score = 25;
            isCorrect = false;
            feedback = 'Сказано: «' + (heardTokens.slice(0, 3).join(' ')) + '». Нужно: «' + expectedWord + '»';
          }
        }

        var totalServerMs = Date.now() - t0;

        return successResponse({
          isCorrect: isCorrect,
          transcribed: heardTokens.join(' ') || heard,
          score: score,
          feedback: feedback,
          category: category,
          modelUsed: modelName,
          timings: {
            parseMs: parseMs,
            geminiMs: geminiMs,
            totalServerMs: totalServerMs,
          },
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
