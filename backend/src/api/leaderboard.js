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

  if (query.userId && query.xp !== undefined) {
    const userId = String(query.userId).trim();
    if (userId.startsWith('u_')) {
      const xp = Math.max(0, Number(query.xp || 0));
      const name = query.name || 'Ученик';
      const avatar = query.avatar || '';
      const updatedAt = new Date().toISOString();

      const sheet = getSheet('Leaderboard', LEADERBOARD_HEADERS);
      const list = getSheetData('Leaderboard', LEADERBOARD_HEADERS);

      const existingIdx = list.findIndex(
        (item) => String(item.userId).trim() === userId && item.weekKey === weekKey
      );

      if (existingIdx >= 0) {
        const item = list[existingIdx];
        const rowIndex = item._rowIndex;
        const nameToSave = (name && name !== 'Ученик') ? name : (item.name || name);
        const avatarToSave = avatar || item.avatar || '';
        const xpToSave = Math.max(xp, Number(item.xp || 0));
        sheet.getRange(rowIndex, 3, 1, 4).setValues([[nameToSave, avatarToSave, xpToSave, updatedAt]]);
      } else {
        appendSheetRow('Leaderboard', { userId, weekKey, name, avatar, xp, updatedAt }, LEADERBOARD_HEADERS);
      }
    }
  }

  const leaderboardList = getSheetData('Leaderboard', LEADERBOARD_HEADERS);
  const usersList = getSheetData('Users', USER_HEADERS);

  // Auto-cleanup: remove obsolete guest rows and weeks older than 4 weeks from sheet
  try {
    const sheet = getSheet('Leaderboard', LEADERBOARD_HEADERS);
    const currentWeekKey = getIsoWeekKey();
    const parts = currentWeekKey.split('-W');
    const curYear = parseInt(parts[0], 10);
    const curWeek = parseInt(parts[1], 10);

    const rowsToDelete = [];
    leaderboardList.forEach((item) => {
      if (!item._rowIndex) return;
      const uid = String(item.userId).trim();
      // Remove any guest rows
      if (!uid.startsWith('u_') && !uid.startsWith('bot_')) {
        rowsToDelete.push(item._rowIndex);
        return;
      }
      // Remove weeks older than 4 weeks
      if (item.weekKey && item.weekKey.includes('-W')) {
        const itemParts = item.weekKey.split('-W');
        const itemYear = parseInt(itemParts[0], 10);
        const itemWeek = parseInt(itemParts[1], 10);
        const diffWeeks = (curYear - itemYear) * 52 + (curWeek - itemWeek);
        if (diffWeeks > 4) {
          rowsToDelete.push(item._rowIndex);
        }
      }
    });

    if (rowsToDelete.length > 0) {
      rowsToDelete.sort((a, b) => b - a); // bottom to top
      rowsToDelete.forEach((rIdx) => {
        try { sheet.deleteRow(rIdx); } catch (err) {}
      });
    }
  } catch (cleanErr) {}

  const isOverall = (query.period === 'all');

  if (isOverall) {
    const overallMap = {};
    leaderboardList.forEach((item) => {
      const uid = String(item.userId).trim();
      if (!uid) return;
      const itemXp = Number(item.xp || 0);
      if (!overallMap[uid]) {
        overallMap[uid] = {
          userId: uid,
          name: item.name || 'Ученик',
          avatar: item.avatar || '',
          xp: itemXp,
        };
      } else {
        overallMap[uid].xp += itemXp;
        if (item.avatar && !overallMap[uid].avatar) overallMap[uid].avatar = item.avatar;
        if (item.name && item.name !== 'Ученик') overallMap[uid].name = item.name;
      }
    });

    usersList.forEach((u) => {
      const uid = String(u.id).trim();
      if (!uid) return;
      if (!overallMap[uid]) {
        overallMap[uid] = {
          userId: uid,
          name: u.userName || u.email || 'Ученик',
          avatar: '',
          xp: 0,
        };
      } else {
        if (u.userName && (overallMap[uid].name === 'Ученик' || !overallMap[uid].name)) {
          overallMap[uid].name = u.userName;
        }
      }
    });

    const overallList = Object.values(overallMap);

    const dynamicBots = generateDynamicBots(weekKey);
    dynamicBots.forEach((bot) => {
      const botUid = String(bot.userId);
      const botOverallXp = Math.floor(bot.xp * 3.5);
      if (!overallList.some((p) => String(p.userId) === botUid)) {
        overallList.push({
          userId: botUid,
          name: bot.name,
          avatar: bot.avatar,
          xp: botOverallXp,
          isBot: true,
        });
      }
    });

    overallList.sort((a, b) => b.xp - a.xp);
    return successResponse(overallList);
  }

  // Map of userId -> leaderboard item for this week (with duplicate deduplication taking max XP)
  const weekMap = {};
  leaderboardList.forEach((item) => {
    if (item.weekKey === weekKey) {
      const uid = String(item.userId);
      const itemXp = Number(item.xp || 0);
      if (!weekMap[uid]) {
        weekMap[uid] = {
          userId: uid,
          name: item.name || 'Ученик',
          avatar: item.avatar || '',
          xp: itemXp,
        };
      } else {
        weekMap[uid].xp = Math.max(weekMap[uid].xp, itemXp);
        if (item.avatar && !weekMap[uid].avatar) weekMap[uid].avatar = item.avatar;
        if (item.name && item.name !== 'Ученик') weekMap[uid].name = item.name;
      }
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

  // Dynamic 50 realistic league participants with daily progression (0-200 XP/day)
  const dynamicBots = generateDynamicBots(weekKey);
  dynamicBots.forEach((bot) => {
    if (!weekList.some((p) => String(p.userId) === String(bot.userId))) {
      weekList.push(bot);
    }
  });

  // Sort descending by XP
  weekList.sort((a, b) => b.xp - a.xp);

  return successResponse(weekList);
}

const BOT_PROFILES = [
  { name: 'Alex Smith', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Elena Petrova', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Mark Davis', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Anna Novak', avatar: './assets/avatars/avatar_8.png' },
  { name: 'Dmitry Kuznetsov', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Sophie Laurent', avatar: './assets/avatars/avatar_14.png' },
  { name: 'John Doe', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Maria Ivanova', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Carlos Mendes', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Emma Watson', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Liam O\'Connor', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Yuki Tanaka', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Oliver Brown', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Chloe Dubois', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Lucas Silva', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Maximilian Becker', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Mia Andersen', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Noah Johnson', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Zoe Martin', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Artem Sokolov', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Isabella Rossi', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Viktor Orlov', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Hannah Schmidt', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Gabriel Santos', avatar: './assets/avatars/avatar_8.png' },
  { name: 'Polina Smirnova', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Daniel Miller', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Laura Garcia', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Sergey Volkov', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Emily Clark', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Mateo Fernandez', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Alina Morozova', avatar: './assets/avatars/avatar_15.png' },
  { name: 'William Taylor', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Camille Bernard', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Ivan Popov', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Freja Nielsen', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Ethan Wright', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Daria Lebedeva', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Leo Moreau', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Victoria Hall', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Ksenia Fedorova', avatar: './assets/avatars/avatar_8.png' },
  { name: 'James Wilson', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Clara Meyer', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Ilya Kozlov', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Sara Lind', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Mason Evans', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Anastasia Romanova', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Hugo Lefebvre', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Evelyn Moore', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Mikhail Pavlov', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Olivia King', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Thomas Anderson', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Ekaterina Volkova', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Benjamin Lee', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Sofia Costa', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Andrey Semenov', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Charlotte Green', avatar: './assets/avatars/avatar_8.png' },
  { name: 'Lucas Bianchi', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Valeria Tarasova', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Henry Adams', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Mila Jansen', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Denis Belov', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Amelia Baker', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Sebastian Wagner', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Kira Vasilyeva', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Jack Campbell', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Astrid Larsson', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Pavel Komarov', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Harper Scott', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Diego Romero', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Alisa Zaytseva', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Samuel Harris', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Elise Fontaine', avatar: './assets/avatars/avatar_8.png' },
  { name: 'Timur Gusev', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Grace Turner', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Felix Weber', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Veronika Danilova', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Arthur Mitchell', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Lina Johansson', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Vadim Solovyov', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Scarlett Phillips', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Oscar Dupont', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Nadezhda Belyakova', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Julian Torres', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Maya Hoffmann', avatar: './assets/avatars/avatar_4.png' },
  { name: 'Roman Kudryavtsev', avatar: './assets/avatars/avatar_5.png' },
  { name: 'Lily Carter', avatar: './assets/avatars/avatar_6.png' },
  { name: 'Matteo Ricci', avatar: './assets/avatars/avatar_7.png' },
  { name: 'Yulia Antonova', avatar: './assets/avatars/avatar_8.png' },
  { name: 'George Kelly', avatar: './assets/avatars/avatar_9.png' },
  { name: 'Ines Ramos', avatar: './assets/avatars/avatar_10.png' },
  { name: 'Grigoriy Melnikov', avatar: './assets/avatars/avatar_11.png' },
  { name: 'Ruby Bennett', avatar: './assets/avatars/avatar_12.png' },
  { name: 'Jonas Braun', avatar: './assets/avatars/avatar_13.png' },
  { name: 'Svetlana Ponomareva', avatar: './assets/avatars/avatar_14.png' },
  { name: 'Louis Leroy', avatar: './assets/avatars/avatar_15.png' },
  { name: 'Eleanor Bailey', avatar: './assets/avatars/avatar_16.png' },
  { name: 'Stanislav Borisov', avatar: './assets/avatars/avatar_1.png' },
  { name: 'Eva Lund', avatar: './assets/avatars/avatar_2.png' },
  { name: 'Leon Schmitt', avatar: './assets/avatars/avatar_3.png' },
  { name: 'Tatiana Makarova', avatar: './assets/avatars/avatar_4.png' }
];

function generateDynamicBots(weekKey) {
  const now = new Date();
  let dayOfWeek = now.getUTCDay();
  if (dayOfWeek === 0) dayOfWeek = 7; // Monday = 1 ... Sunday = 7
  const hour = now.getUTCHours();

  function hashStr(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  return BOT_PROFILES.map((bot, index) => {
    const userId = 'bot_' + (index + 1);
    const tier = index % 5;
    const maxDaily = [190, 140, 95, 60, 30][tier];
    const minDaily = [70, 40, 20, 5, 0][tier];

    let botXP = 0;
    for (let d = 1; d <= dayOfWeek; d++) {
      const seed = hashStr(weekKey + '_' + userId + '_day_' + d);
      const dayGain = minDaily + (seed % (maxDaily - minDaily + 1));
      if (d < dayOfWeek) {
        botXP += dayGain;
      } else {
        const fraction = Math.min(1.0, Math.max(0.1, (hour + 1) / 21));
        botXP += Math.floor(dayGain * fraction);
      }
    }

    return {
      userId: userId,
      name: bot.name,
      avatar: bot.avatar,
      xp: botXP,
      isBot: true,
    };
  });
}

function leaderboardPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['userId']);

  const userId = String(body.userId).trim();

  // Optimization: Do not pollute Google Sheets with unregistered guest leaderboard rows
  if (!userId.startsWith('u_')) {
    return successResponse({ userId, xp: body.xp, localOnly: true });
  }

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
    const nameToSave = (name && name !== 'Ученик') ? name : (item.name || name);
    const avatarToSave = avatar || item.avatar || '';
    const xpToSave = Math.max(xp, Number(item.xp || 0));
    sheet.getRange(rowIndex, 3, 1, 4).setValues([[nameToSave, avatarToSave, xpToSave, updatedAt]]);
  } else {
    appendSheetRow('Leaderboard', { userId, weekKey, name, avatar, xp, updatedAt }, LEADERBOARD_HEADERS);
  }

  return successResponse({ userId, weekKey, xp, name, avatar });
}
