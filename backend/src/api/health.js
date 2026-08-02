/**
 * Health endpoint.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function healthEndpoint(e) {
  return successResponse({
    service: 'My Duolingo API',
    version: '0.1.0',
    apiVersion: API_VERSION,
    status: 'OK',
    environment: 'Google Apps Script',
    timestamp: new Date().toISOString(),
  });
}
