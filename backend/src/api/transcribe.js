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
    'Expected English word: "' + expectedWord + '". ' +
    'Analyze pronunciation and output JSON only:\n' +
    '{"isCorrect": boolean, "transcribed": "spoken word lowercase", "score": 0-100, "feedback": "brief Russian tip max 8 words"}';

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
      maxOutputTokens: 120,
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
          var jsonMatch = String(rawText).match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            evaluation = JSON.parse(jsonMatch[0]);
          } else {
            evaluation = JSON.parse(rawText);
          }
        } catch (jsonErr) {
          var cleanText = String(rawText)
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          try {
            evaluation = JSON.parse(cleanText);
          } catch (e) {
            evaluation.transcribed = cleanText.toLowerCase();
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
