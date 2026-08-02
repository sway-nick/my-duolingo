/**
 * Routes incoming GET requests.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function routeGet(e) {
  const path = (e && e.parameter && e.parameter.route) || 'health';

  switch (path) {
    case 'health':
      return healthEndpoint();

    default:
      return jsonResponse({
        success: false,
        error: 'Route not found',
      });
  }
}
