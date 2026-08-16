const USER_HEADERS = ['id', 'email', 'name', 'passwordHash', 'createdAt', 'status'];

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
 * Register endpoint. Handles both POST body and GET query parameters.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function registerPost(e) {
  let body = {};
  try {
    body = getJsonBody(e);
  } catch (err) {}

  const email = String(body.email || e?.parameter?.email || '').toLowerCase().trim();
  const password = String(body.password || e?.parameter?.password || '');
  const rawName = String(body.name || e?.parameter?.name || '').trim();

  if (!email || !password) {
    return errorResponse('Заполните необходимые поля: email, пароль', 400);
  }

  const users = getSheetData('Users', USER_HEADERS);

  const existing = users.find((u) => String(u.email).toLowerCase() === email);
  if (existing) {
    return errorResponse('Пользователь с таким email уже зарегистрирован', 400);
  }

  const userId = 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const hashedPassword = hashPassword(password);
  const userName = rawName || email.split('@')[0];

  const newUser = {
    id: userId,
    email: email,
    name: userName,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString(),
    status: 'active',
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
 * Google OAuth endpoint. Authenticates or automatically registers Google user.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function googleAuthPost(e) {
  let body = {};
  try {
    body = getJsonBody(e);
  } catch (err) {}

  const email = String(body.email || e?.parameter?.email || '').toLowerCase().trim();
  const rawName = String(body.name || e?.parameter?.name || '').trim();

  if (!email) {
    return errorResponse('Email обязателен для авторизации Google', 400);
  }

  const users = getSheetData('Users', USER_HEADERS);
  const existing = users.find((u) => String(u.email).toLowerCase() === email);
  const userName = rawName || email.split('@')[0];

  if (existing) {
    // If existing user lacks name in the sheet, update it
    if ((!existing.name || existing.name === existing.email.split('@')[0]) && rawName) {
      try {
        const sheet = getSheet('Users', USER_HEADERS);
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const nameColIndex = headers.indexOf('name') + 1;
        if (nameColIndex > 0 && existing._rowIndex) {
          sheet.getRange(existing._rowIndex, nameColIndex).setValue(rawName);
        }
      } catch (err) {
        console.warn('Failed to update existing user name:', err);
      }
    }

    return successResponse({
      user: {
        id: existing.id,
        email: existing.email,
        name: existing.name || userName,
      },
      token: 'tok_' + existing.id,
    });
  }

  const userId = 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const newUser = {
    id: userId,
    email: email,
    name: userName,
    passwordHash: 'google_oauth',
    createdAt: new Date().toISOString(),
    status: 'active',
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
 * Login endpoint. Handles both POST body and GET query parameters.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function loginPost(e) {
  let body = {};
  try {
    body = getJsonBody(e);
  } catch (err) {}

  const email = String(body.email || e?.parameter?.email || '').toLowerCase().trim();
  const password = String(body.password || e?.parameter?.password || '');

  if (!email || !password) {
    return errorResponse('Заполните поля email и пароль', 400);
  }

  const inputHashed = hashPassword(password);

  const users = getSheetData('Users', USER_HEADERS);
  const user = users.find(
    (u) =>
      String(u.email).toLowerCase() === email &&
      (String(u.passwordHash) === inputHashed || String(u.password) === inputHashed || String(u.password) === password),
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
