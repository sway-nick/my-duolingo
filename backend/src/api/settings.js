const SETTINGS_HEADERS = ['userId', 'dailyGoal', 'enabledMethods', 'theme', 'level', 'updatedAt'];

function settingsGet(e) {
  const query = getQuery(e);
  const userId = query.userId || 'guest';

  const list = getSheetData('UserSettings', SETTINGS_HEADERS);
  const found = list.find((s) => String(s.userId) === String(userId));

  const defaults = {
    userId,
    dailyGoal: 10,
    enabledMethods: 'cards,quiz,input',
    theme: 'light',
    level: 'All',
  };

  if (found) {
    return successResponse({
      ...defaults,
      ...found,
      dailyGoal: Number(found.dailyGoal || 10),
    });
  }

  return successResponse(defaults);
}

function settingsPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['userId']);

  const userId = body.userId;
  const sheet = getSheet('UserSettings', SETTINGS_HEADERS);
  const list = getSheetData('UserSettings', SETTINGS_HEADERS);

  const existingIndex = list.findIndex((s) => String(s.userId) === String(userId));

  const record = {
    userId,
    dailyGoal: body.dailyGoal !== undefined ? Number(body.dailyGoal) : 10,
    enabledMethods: body.enabledMethods ? String(body.enabledMethods) : 'cards,quiz,input',
    theme: body.theme ? String(body.theme) : 'light',
    level: body.level ? String(body.level) : 'All',
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    const rowIndex = list[existingIndex]._rowIndex;
    sheet.getRange(rowIndex, 2, 1, 5).setValues([
      [record.dailyGoal, record.enabledMethods, record.theme, record.level, record.updatedAt]
    ]);
  } else {
    appendSheetRow('UserSettings', record, SETTINGS_HEADERS);
  }

  return successResponse(record);
}
