const SETTINGS_HEADERS = ['userId', 'dailyGoal', 'enabledMethods', 'theme', 'level', 'updatedAt'];

function settingsGet(e) {
  const query = getQuery(e);
  const userId = String(query.userId || 'guest').trim();

  const list = getSheetData('UserSettings', SETTINGS_HEADERS);
  const matching = list.filter((s) => String(s.userId).trim() === userId);
  let found = null;
  if (matching.length > 0) {
    matching.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    found = matching[0];
  }

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

  const userId = String(body.userId).trim();

  // Optimization: Do not pollute Google Sheets with unregistered guest settings
  if (!userId.startsWith('u_')) {
    return successResponse({ userId, ...body, localOnly: true });
  }

  const sheet = getSheet('UserSettings', SETTINGS_HEADERS);
  const list = getSheetData('UserSettings', SETTINGS_HEADERS);

  const matching = list.filter((s) => String(s.userId).trim() === userId);

  const record = {
    userId,
    dailyGoal: body.dailyGoal !== undefined ? Number(body.dailyGoal) : 10,
    enabledMethods: body.enabledMethods ? String(body.enabledMethods) : 'cards,quiz,input',
    theme: body.theme ? String(body.theme) : 'light',
    level: body.level ? String(body.level) : 'All',
    updatedAt: new Date().toISOString(),
  };

  if (matching.length > 0) {
    const firstRowIndex = matching[0]._rowIndex;
    sheet.getRange(firstRowIndex, 2, 1, 5).setValues([
      [record.dailyGoal, record.enabledMethods, record.theme, record.level, record.updatedAt]
    ]);
    if (matching.length > 1) {
      for (let i = matching.length - 1; i >= 1; i--) {
        sheet.deleteRow(matching[i]._rowIndex);
      }
    }
  } else {
    appendSheetRow('UserSettings', record, SETTINGS_HEADERS);
  }

  return successResponse(record);
}
