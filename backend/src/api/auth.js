const USER_HEADERS = ['id', 'email', 'passwordHash', 'createdAt', 'status', 'name'];

/**
 * Computes SHA-256 hash of password with a fixed salt.
 *
 * @param {string} password
 * @returns {string}
 */
function hashPassword(password) {
  const salt = 'myduo_salt_v1_';
  if (typeof Utilities !== 'undefined' && Utilities.computeDigest) {
    const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + password);
    return raw.map((b) => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
  }
  return 'hashed_' + password;
}

/**
 * Register endpoint.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function registerPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['email', 'password']);

  const email = String(body.email).toLowerCase().trim();
  const users = getSheetData('Users', USER_HEADERS);

  const existing = users.find((u) => String(u.email).toLowerCase() === email);
  if (existing) {
    return errorResponse('Пользователь с таким email уже зарегистрирован', 400);
  }

  const userId = 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const hashedPassword = hashPassword(String(body.password));
  const userName = String(body.name || email.split('@')[0]).trim();

  const newUser = {
    id: userId,
    email: email,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString(),
    status: 'active',
    name: userName,
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
  const inputHashed = hashPassword(String(body.password));

  const users = getSheetData('Users', USER_HEADERS);
  const user = users.find(
    (u) =>
      String(u.email).toLowerCase() === email &&
      (String(u.passwordHash) === inputHashed || String(u.password) === inputHashed || String(u.password) === String(body.password)),
  );

  if (!user) {
    return errorResponse('Неверный email или пароль', 401);
  }

  return successResponse({
    user: {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
    },
    token: 'tok_' + user.id,
  });
}
