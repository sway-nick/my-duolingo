/**
 * Entry point for GET requests.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(e) {
  try {
    return routeGet(e);
  } catch (error) {
    console.error(error);

    return errorResponse(error.message || 'Internal server error.', 500);
  }
}

/**
 * Entry point for POST requests.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  console.log('========== doPost ==========');

  try {
    console.log(JSON.stringify(e));
  } catch (error) {
    console.log('Cannot stringify event object.');
  }

  try {
    return routePost(e);
  } catch (error) {
    console.error(error);

    return errorResponse(error.message || 'Internal server error.', 500);
  }
}

/**
 * Creates successful API response.
 *
 * @param {*} data
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function successResponse(data) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      status: 200,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Creates error API response.
 *
 * @param {string} message
 * @param {number} status
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function errorResponse(message, status = 500) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: false,
      status,
      data: null,
      error: message,
      timestamp: new Date().toISOString(),
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}
