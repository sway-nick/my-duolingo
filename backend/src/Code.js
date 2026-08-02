/**
 * Entry point for GET requests.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(e) {
  return routeGet(e);
}

/**
 * Entry point for POST requests.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  return routePost(e);
}
