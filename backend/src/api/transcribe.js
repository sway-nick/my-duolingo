/**
 * Speech-to-Text Audio Transcription via Google Gemini Flash API.
 * Receives Base64 audio from MediaRecorder on client, sends to Gemini, returns transcribed word.
 */

function getGeminiApiKey() {
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    key = 'AIzaSyCCa5D1txoS4wEaDW4PxThPEL_TU93SeRU';
    try {
      PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', key);
    } catch (e) {}
  }
  return key;
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
  var url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(apiKey);
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  Logger.log('Status: ' + res.getResponseCode());
  Logger.log('Response: ' + res.getContentText().slice(0, 200));
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

  try {
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + encodeURIComponent(apiKey);

    var payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audioBase64
              }
            },
            {
              text: 'The user was asked to pronounce the English word: "' + expectedWord + '". Transcribe strictly what the user pronounced in English letters (lowercase). If they pronounced the word correctly or with an accent, return the English word. Return ONLY the single word or short phrase, without punctuation, quotes, markdown or explanations.'
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 20
      }
    };

    var options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();

    if (responseCode !== 200) {
      return errorResponse('Gemini API error (' + responseCode + '): ' + responseText, responseCode);
    }

    var resJson = JSON.parse(responseText);
    var rawTranscribed = resJson && resJson.candidates && resJson.candidates[0] && resJson.candidates[0].content && resJson.candidates[0].content.parts && resJson.candidates[0].content.parts[0] ? resJson.candidates[0].content.parts[0].text : '';
    var cleanedText = rawTranscribed.trim().toLowerCase().replace(/[.,!?:;"'«»`]/g, '');

    return successResponse({
      text: cleanedText,
      raw: rawTranscribed,
      expectedWord: expectedWord
    });
  } catch (err) {
    return errorResponse('Transcription failed: ' + err.message, 500);
  }
}
