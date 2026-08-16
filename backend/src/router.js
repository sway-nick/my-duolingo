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
      post: function (e) {
        let body = {};
        try {
          body = getJsonBody(e);
        } catch (err) {}
        if (body.action === 'register' || body.route === 'register') {
          return registerPost(e);
        }
        return loginPost(e);
      },
    },
    register: {
      get: registerPost,
      post: registerPost,
    },
    login: {
      get: loginPost,
      post: loginPost,
    },
    google_auth: {
      get: googleAuthPost,
      post: googleAuthPost,
    },
    googleauth: {
      get: googleAuthPost,
      post: googleAuthPost,
    },
    words: {
      get: wordsGet,
    },
    stats: {
      get: statsGet,
    },
    progress: {
      post: progressPost,
    },
    favorite: {
      post: favoritePost,
    },
    settings: {
      get: settingsGet,
      post: settingsPost,
    },
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
