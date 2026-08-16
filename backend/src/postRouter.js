/**
 * Routes incoming POST requests.
 * Extracts route from query parameter, post body 'route', 'action', or 'path'.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function routePost(e) {
  try {
    let body = {};
    try {
      body = getJsonBody(e);
    } catch (err) {}

    const version = (e?.parameter?.version || body?.version || API_VERSION).toLowerCase();
    
    // Extract route from query parameter, body.route, body.action, or body.path
    let route = (e?.parameter?.route || body?.route || body?.action || body?.path || '').toLowerCase();

    // Map common aliases
    if (route === 'auth') {
      route = (body?.action || body?.type || 'login').toLowerCase();
    }

    const api = ROUTES[version];

    if (!api) {
      return errorResponse(`API version '${version}' is not supported.`, 404);
    }

    const handler = api[route];

    if (!handler) {
      return errorResponse(`Route '${route}' not found. Available routes: ${Object.keys(api).join(', ')}`, 404);
    }

    if (typeof handler.post !== 'function') {
      return errorResponse('POST method is not supported for this route.', 405);
    }

    return handler.post(e);
  } catch (error) {
    return errorResponse(error.message || 'Internal server error.', 500);
  }
}
