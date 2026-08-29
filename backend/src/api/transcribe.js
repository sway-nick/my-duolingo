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
  var mimeType = rawMime.split(';')[0].trim();
  var expectedWord = String(body.expectedWord || '').trim();

  var apiKey = getGeminiApiKey();

  if (!apiKey) {
    return errorResponse('Gemini API key is not configured.', 500);
  }

  // Список актуальных моделей (gemini-3.7-flash — новая, 3.6 — стабильная)
  // Можно переопределить основную модель через Script Property 'GEMINI_TRANSCRIPTION_MODEL'
  var defaultModel =
    PropertiesService.getScriptProperties().getProperty('GEMINI_TRANSCRIPTION_MODEL') ||
    'gemini-3.7-flash';

  var modelsToTry = [defaultModel, 'gemini-3.6-flash', 'gemini-3.5-flash'];

  var lastError = '';
  var promptText =
    'The user was asked to pronounce the English word or phrase: "' +
    expectedWord +
    '". ' +
    'Analyze the audio and evaluate their pronunciation quality. ' +
    'Respond strictly in JSON format with these exact keys: ' +
    '{"isCorrect": boolean (true if the pronunciation is correct or has minor acceptable accent/variation, false if incorrect or completely different word), ' +
    '"transcribed": string (what you heard the user pronounce in lowercase, cleaned of punctuation), ' +
    '"score": number (pronunciation accuracy score from 0 to 100), ' +
    '"feedback": string (brief, constructive teacher-like feedback in Russian pointing out errors, formatted strictly like "обрати внимание на букву X" or "неправильное ударение" or "звук Z произнесен неверно". Keep it short, max 10 words. If correct, write "Отлично, произношение верное!")}';

  var payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
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
      maxOutputTokens: 200,
      responseMimeType: 'application/json',
    },
  };

  var options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

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

        var evaluation = {
          isCorrect: false,
          transcribed: '',
          score: 0,
          feedback: '',
        };

        try {
          evaluation = JSON.parse(rawText);
        } catch (jsonErr) {
          var cleanText = rawText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
          try {
            evaluation = JSON.parse(cleanText);
          } catch (e) {
            evaluation.transcribed = rawText.trim().toLowerCase();
            evaluation.isCorrect =
              evaluation.transcribed.indexOf(expectedWord.toLowerCase()) !== -1;
            evaluation.score = evaluation.isCorrect ? 80 : 20;
          }
        }

        return successResponse({
          isCorrect: !!evaluation.isCorrect,
          transcribed: String(evaluation.transcribed || '')
            .trim()
            .toLowerCase(),
          score: Number(evaluation.score || 0),
          feedback: String(evaluation.feedback || ''),
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

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (должны быть в этом же файле) =====
// Если они у вас уже есть – можно не копировать, они останутся без изменений.
// Если нет – раскомментируйте и используйте.

/*
function getJsonBody(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      return e.parameter || {};
    }
  }
  return e && e.parameter ? e.parameter : {};
}

function validateRequired(body, requiredFields) {
  for (var i = 0; i < requiredFields.length; i++) {
    if (!body[requiredFields[i]]) {
      throw new Error('Missing required field: ' + requiredFields[i]);
    }
  }
}

function successResponse(data) {
  return {
    status: 'success',
    data: data
  };
}

function errorResponse(message, code) {
  return {
    status: 'error',
    message: message,
    code: code || 500
  };
}
*/
