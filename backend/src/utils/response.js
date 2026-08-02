/**
 * Creates a standardized JSON response.
 *
 * @param {Object} options
 * @param {boolean} [options.success=true]
 * @param {*} [options.data=null]
 * @param {string|null} [options.error=null]
 * @param {number} [options.status=200]
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonResponse({ success = true, data = null, error = null, status = 200 } = {}) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success,
      status,
      data,
      error,
      timestamp: new Date().toISOString(),
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Successful response.
 *
 * @param {*} data
 * @param {number} [status=200]
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function successResponse(data = null, status = 200) {
  return jsonResponse({
    success: true,
    data,
    status,
  });
}

/**
 * Error response.
 *
 * @param {string} error
 * @param {number} [status=400]
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function errorResponse(error, status = 400) {
  return jsonResponse({
    success: false,
    error,
    status,
  });
}
