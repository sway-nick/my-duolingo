const USER_HEADERS = ['id', 'email', 'name', 'password', 'createdAt'];

/**
 * Register endpoint.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function registerPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['email', 'password', 'name']);

  const email = String(body.email).toLowerCase().trim();
  const users = getSheetData('Users', USER_HEADERS);

  const existing = users.find((u) => String(u.email).toLowerCase() === email);
  if (existing) {
    return errorResponse('Пользователь с таким email уже зарегистрирован', 400);
  }

  const userId = 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const newUser = {
    id: userId,
    email: email,
    name: String(body.name).trim(),
    password: String(body.password),
    createdAt: new Date().toISOString(),
  };

  appendSheetRow('Users', newUser, USER_HEADERS);

  return successResponse({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
    token: 'tok_' + userId,
  });
}

/**
 * Login endpoint.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function loginPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['email', 'password']);

  const email = String(body.email).toLowerCase().trim();
  const password = String(body.password);

  const users = getSheetData('Users', USER_HEADERS);
  const user = users.find((u) => String(u.email).toLowerCase() === email && String(u.password) === password);

  if (!user) {
    return errorResponse('Неверный email или пароль', 401);
  }

  return successResponse({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token: 'tok_' + user.id,
  });
}

