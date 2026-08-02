/**
 * API version.
 */
const API_VERSION = 'v1';

/**
 * Registered routes.
 */
const ROUTES = {
  v1: {
    health: {
      get: healthEndpoint,
    },

    auth: {
      post: loginPost,
    },

    lessons: {},
    words: {
      get: wordsGet,
    },
    review: {},
    stats: {},
    settings: {},
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
    return errorResponse(`API version '${version}' is not supported.`, 404);
  }

  const handler = api[route];

  if (!handler) {
    return errorResponse(`Route '${route}' not found.`, 404);
  }

  if (typeof handler.get !== 'function') {
    return errorResponse('GET method is not supported.', 405);
  }

  return handler.get(e);
}
