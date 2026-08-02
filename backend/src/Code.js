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
  console.log('========== doPost ==========');

  try {
    console.log(JSON.stringify(e));
  } catch (error) {
    console.log('Cannot stringify event object.');
  }

  return routePost(e);
}
