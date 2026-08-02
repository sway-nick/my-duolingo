/**
 * Routes incoming POST requests.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function routePost(e) {
  try {
    const version = (e?.parameter?.version || API_VERSION).toLowerCase();
    const route = (e?.parameter?.route || '').toLowerCase();

    const api = ROUTES[version];

    if (!api) {
      return errorResponse(`API version '${version}' is not supported.`, 404);
    }

    const handler = api[route];

    if (!handler) {
      return errorResponse(`Route '${route}' not found.`, 404);
    }

    if (typeof handler.post !== 'function') {
      return errorResponse('POST method is not supported.', 405);
    }

    return handler.post(e);
  } catch (error) {
    return errorResponse(error.message || 'Internal server error.', 500);
  }
}
