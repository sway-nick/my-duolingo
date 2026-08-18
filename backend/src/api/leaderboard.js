const LEADERBOARD_HEADERS = ['userId', 'weekKey', 'name', 'avatar', 'xp', 'updatedAt'];
const USER_HEADERS = ['id', 'userName', 'email', 'passwordHash', 'createdAt', 'status'];

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

  const leaderboardList = getSheetData('Leaderboard', LEADERBOARD_HEADERS);
  const usersList = getSheetData('Users', USER_HEADERS);

  // Map of userId -> leaderboard item for this week
  const weekMap = {};
  leaderboardList.forEach((item) => {
    if (item.weekKey === weekKey) {
      weekMap[String(item.userId)] = {
        userId: String(item.userId),
        name: item.name || 'Ученик',
        avatar: item.avatar || '',
        xp: Number(item.xp || 0),
      };
    }
  });

  // Ensure all registered users from Users sheet are included in leaderboard
  usersList.forEach((u) => {
    const uid = String(u.id);
    if (!uid) return;
    if (!weekMap[uid]) {
      weekMap[uid] = {
        userId: uid,
        name: u.userName || u.email || 'Ученик',
        avatar: '',
        xp: 0,
      };
    } else {
      if (u.userName && (weekMap[uid].name === 'Ученик' || !weekMap[uid].name)) {
        weekMap[uid].name = u.userName;
      }
    }
  });

  const weekList = Object.values(weekMap);

  // If few participants, add engaging initial league participants
  const defaultBots = [
    { userId: 'bot_1', name: 'Alex Smith', avatar: './assets/avatars/avatar_1.png', xp: 54 },
    { userId: 'bot_2', name: 'Elena Petrova', avatar: './assets/avatars/avatar_3.png', xp: 42 },
    { userId: 'bot_3', name: 'Mark Davis', avatar: './assets/avatars/avatar_6.png', xp: 35 },
    { userId: 'bot_4', name: 'Anna Novak', avatar: './assets/avatars/avatar_8.png', xp: 28 },
    { userId: 'bot_5', name: 'Dmitry K.', avatar: './assets/avatars/avatar_11.png', xp: 21 },
    { userId: 'bot_6', name: 'Sophie L.', avatar: './assets/avatars/avatar_14.png', xp: 16 },
    { userId: 'bot_7', name: 'John Doe', avatar: './assets/avatars/avatar_2.png', xp: 11 },
    { userId: 'bot_8', name: 'Maria Ivanova', avatar: './assets/avatars/avatar_15.png', xp: 6 },
  ];

  defaultBots.forEach((bot) => {
    if (!weekList.some((p) => String(p.userId) === String(bot.userId))) {
      weekList.push(bot);
    }
  });

  // Sort descending by XP
  weekList.sort((a, b) => b.xp - a.xp);

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
