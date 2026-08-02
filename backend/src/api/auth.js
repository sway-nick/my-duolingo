/**
 * Login endpoint.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function loginPost(e) {
  const body = getJsonBody(e);

  validateRequired(body, ['email', 'password']);

  return successResponse({
    message: 'Login request received.',
    email: body.email,
  });
}
