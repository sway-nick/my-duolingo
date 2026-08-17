const LEADERBOARD_HEADERS = ['userId', 'weekKey', 'name', 'avatar', 'xp', 'updatedAt'];

function getIsoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function leaderboardGet(e) {
  const query = getQuery(e);
  const weekKey = query.weekKey || getIsoWeekKey();

  const sheet = getSheet('Leaderboard', LEADERBOARD_HEADERS);
  const list = getSheetData('Leaderboard', LEADERBOARD_HEADERS);

  const weekList = list
    .filter((item) => item.weekKey === weekKey)
    .map((item) => ({
      userId: item.userId,
      name: item.name || 'Ученик',
      avatar: item.avatar || '',
      xp: Number(item.xp || 0),
    }))
    .sort((a, b) => b.xp - a.xp);

  return successResponse(weekList);
}

function leaderboardPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['userId']);

  const userId = String(body.userId);
  const weekKey = body.weekKey || getIsoWeekKey();
  const xp = Math.max(0, Number(body.xp || 0));
  const name = body.name || 'Ученик';
  const avatar = body.avatar || '';
  const updatedAt = new Date().toISOString();

  const sheet = getSheet('Leaderboard', LEADERBOARD_HEADERS);
  const list = getSheetData('Leaderboard', LEADERBOARD_HEADERS);

  const existingIdx = list.findIndex(
    (item) => String(item.userId) === userId && item.weekKey === weekKey
  );

  if (existingIdx >= 0) {
    const item = list[existingIdx];
    const rowIndex = item._rowIndex;
    sheet.getRange(rowIndex, 3, 1, 4).setValues([[name, avatar, xp, updatedAt]]);
  } else {
    appendSheetRow('Leaderboard', { userId, weekKey, name, avatar, xp, updatedAt }, LEADERBOARD_HEADERS);
  }

  return successResponse({ userId, weekKey, xp, name, avatar });
}
