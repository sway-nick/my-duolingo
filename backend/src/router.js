/**
 * API version.
 */
const API_VERSION = 'v1';

/**
 * Registered routes.
 */
const ROUTES = {
  v1: {
    health: healthEndpoint,

    // Reserved routes
    auth: notImplementedEndpoint,
    lessons: notImplementedEndpoint,
    words: notImplementedEndpoint,
    review: notImplementedEndpoint,
    stats: notImplementedEndpoint,
    settings: notImplementedEndpoint,
  },
};

/**
 * Routes incoming GET requests.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function routeGet(e) {
  const version = (e?.parameter?.version || API_VERSION).toLowerCase();
  const route = (e?.parameter?.route || 'health').toLowerCase();

  const api = ROUTES[version];

  if (!api) {
    return jsonResponse({
      success: false,
      error: `API version '${version}' is not supported.`,
    });
  }

  const handler = api[route];

  if (!handler) {
    return jsonResponse({
      success: false,
      error: `Route '${route}' not found.`,
    });
  }

  return handler(e);
}

/**
 * Placeholder endpoint.
 *
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function notImplementedEndpoint() {
  return jsonResponse({
    success: false,
    error: 'Not implemented yet.',
  });
}
