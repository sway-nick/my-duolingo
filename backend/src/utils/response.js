/**
 * Creates a standardized JSON response.
 *
 * @param {Object} data
 * @param {boolean} [data.success=true]
 * @param {*} [data.data=null]
 * @param {string|null} [data.error=null]
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonResponse({ success = true, data = null, error = null } = {}) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success,
      data,
      error,
      timestamp: new Date().toISOString(),
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}
