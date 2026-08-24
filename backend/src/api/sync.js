/**
 * Synchronizes user data (progress, favorites, weekly XP, settings) between devices.
 */
function syncGet(e) {
  const query = getQuery(e);
  const userId = String(query.userId || '').trim();
  const weekKey = String(query.weekKey || '').trim();

  if (!userId || !userId.startsWith('u_')) {
    return successResponse({
      progress: {},
      favorites: [],
      weeklyXp: 0,
      avatar: '',
      settings: null,
    });
  }

  // 1. Fetch UserProgress
  const progressHeaders = ['userId', 'wordId', 'status', 'correctCount', 'errorCount', 'lastReviewed', 'quizCorrect', 'pairsCorrect', 'inputCorrect', 'seenInCards', 'masteredAt'];
  const allProgress = getSheetData('UserProgress', progressHeaders);
  const userProgressRows = allProgress.filter((p) => String(p.userId).trim() === userId);
  
  const progressMap = {};
  userProgressRows.forEach((row) => {
    const wordId = String(row.wordId).trim();
    if (wordId) {
      progressMap[wordId] = {
        correct: Number(row.correctCount || 0),
        error: Number(row.errorCount || 0),
        quizCorrect: Number(row.quizCorrect || 0),
        pairsCorrect: Number(row.pairsCorrect || 0),
        inputCorrect: Number(row.inputCorrect || 0),
        seenInCards: Boolean(row.seenInCards === true || row.seenInCards === 'true' || row.status === 'mastered' || Number(row.quizCorrect || 0) > 0),
        mastered: row.status === 'mastered' || Number(row.inputCorrect || 0) >= 3,
        masteredAt: row.masteredAt ? new Date(row.masteredAt).getTime() : null,
        lastPracticed: row.lastReviewed ? new Date(row.lastReviewed).getTime() : 0,
        status: row.status || (Number(row.inputCorrect || 0) >= 3 ? 'mastered' : 'learning'),
      };
    }
  });

  // 2. Fetch Favorites
  const favHeaders = ['userId', 'wordId', 'createdAt'];
  const allFavs = getSheetData('Favorites', favHeaders);
  const userFavs = allFavs
    .filter((f) => String(f.userId).trim() === userId)
    .map((f) => String(f.wordId).trim())
    .filter(Boolean);

  // 3. Fetch Leaderboard XP & Avatar
  let weeklyXp = 0;
  let avatar = '';
  let userName = '';
  if (weekKey) {
    const lbHeaders = ['userId', 'weekKey', 'name', 'avatar', 'xp', 'updatedAt'];
    const allLb = getSheetData('Leaderboard', lbHeaders);
    const userLb = allLb.find((l) => String(l.userId).trim() === userId && String(l.weekKey).trim() === weekKey);
    if (userLb) {
      weeklyXp = Number(userLb.xp || 0);
      avatar = String(userLb.avatar || '');
      userName = String(userLb.name || '');
    }
  }

  // 4. Fetch UserSettings
  const setHeaders = ['userId', 'dailyGoal', 'enabledMethods', 'theme', 'level', 'updatedAt'];
  const allSet = getSheetData('UserSettings', setHeaders);
  const userSet = allSet.find((s) => String(s.userId).trim() === userId);

  // 5. Extract Study Dates for streak
  const studyDatesSet = new Set();
  userProgressRows.forEach((row) => {
    if (row.lastReviewed) {
      try {
        const d = new Date(row.lastReviewed);
        if (!isNaN(d.getTime())) {
          studyDatesSet.add(d.toISOString().split('T')[0]);
        }
      } catch (e) {}
    }
    if (row.masteredAt) {
      try {
        const d = new Date(row.masteredAt);
        if (!isNaN(d.getTime())) {
          studyDatesSet.add(d.toISOString().split('T')[0]);
        }
      } catch (e) {}
    }
  });

  return successResponse({
    userId,
    progress: progressMap,
    favorites: userFavs,
    weeklyXp,
    avatar,
    userName,
    studyDates: Array.from(studyDatesSet).sort(),
    settings: userSet ? {
      dailyGoal: Number(userSet.dailyGoal || 10),
      enabledMethods: String(userSet.enabledMethods || 'cards,quiz,input'),
      theme: String(userSet.theme || 'light'),
      category: String(userSet.level || 'All'),
    } : null,
  });
}

function syncPost(e) {
  let body = {};
  try {
    body = getJsonBody(e);
  } catch (err) {}

  const userId = String(body.userId || e?.parameter?.userId || '').trim();
  if (!userId || !userId.startsWith('u_')) {
    return successResponse({ status: 'ignored_guest' });
  }

  const progress = body.progress || {};
  const favorites = body.favorites || [];
  const weeklyXp = body.weeklyXp !== undefined ? Number(body.weeklyXp) : null;
  const weekKey = body.weekKey || '';
  const avatar = body.avatar || '';
  const userName = body.userName || body.name || '';
  const settings = body.settings || null;

  // 1. Sync UserProgress batch
  const progressHeaders = ['userId', 'wordId', 'status', 'correctCount', 'errorCount', 'lastReviewed', 'quizCorrect', 'pairsCorrect', 'inputCorrect', 'seenInCards', 'masteredAt'];
  const sheetProg = getSheet('UserProgress', progressHeaders);
  const existingProg = getSheetData('UserProgress', progressHeaders);

  const wordIds = Object.keys(progress);
  if (wordIds.length > 0) {
    wordIds.forEach((wordId) => {
      const p = progress[wordId];
      if (!p) return;
      const isMastered = Boolean(p.mastered || p.status === 'mastered' || Number(p.inputCorrect || 0) >= 3);
      const status = isMastered ? 'mastered' : 'learning';
      const correctCount = Number(p.correct || 0);
      const errorCount = Number(p.error || 0);
      const lastReviewed = p.lastPracticed ? new Date(p.lastPracticed).toISOString() : new Date().toISOString();
      const quizCorrect = Number(p.quizCorrect || 0);
      const pairsCorrect = Number(p.pairsCorrect || 0);
      const inputCorrect = Number(p.inputCorrect || 0);
      const seenInCards = Boolean(p.seenInCards);
      const masteredAt = p.masteredAt ? new Date(p.masteredAt).toISOString() : '';

      const matchIdx = existingProg.findIndex((row) => String(row.userId).trim() === userId && String(row.wordId).trim() === String(wordId).trim());
      if (matchIdx >= 0) {
        const item = existingProg[matchIdx];
        const rIdx = item._rowIndex;
        sheetProg.getRange(rIdx, 3, 1, 9).setValues([[
          status, correctCount, errorCount, lastReviewed, quizCorrect, pairsCorrect, inputCorrect, seenInCards, masteredAt
        ]]);
      } else {
        appendSheetRow('UserProgress', {
          userId,
          wordId,
          status,
          correctCount,
          errorCount,
          lastReviewed,
          quizCorrect,
          pairsCorrect,
          inputCorrect,
          seenInCards,
          masteredAt
        }, progressHeaders);
      }
    });
  }

  // 2. Sync Favorites batch
  if (Array.isArray(favorites) && favorites.length > 0) {
    const favHeaders = ['userId', 'wordId', 'createdAt'];
    const existingFavs = getSheetData('Favorites', favHeaders);
    favorites.forEach((wordId) => {
      const match = existingFavs.find((f) => String(f.userId).trim() === userId && String(f.wordId).trim() === String(wordId).trim());
      if (!match) {
        appendSheetRow('Favorites', { userId, wordId: String(wordId), createdAt: new Date().toISOString() }, favHeaders);
      }
    });
  }

  // 3. Sync Leaderboard / XP
  if (weeklyXp !== null && weekKey) {
    const lbHeaders = ['userId', 'weekKey', 'name', 'avatar', 'xp', 'updatedAt'];
    const sheetLb = getSheet('Leaderboard', lbHeaders);
    const allLb = getSheetData('Leaderboard', lbHeaders);
    const existingLb = allLb.find((l) => String(l.userId).trim() === userId && String(l.weekKey).trim() === weekKey);
    const nowIso = new Date().toISOString();

    if (existingLb) {
      const currentServerXp = Number(existingLb.xp || 0);
      const finalXp = Math.max(currentServerXp, weeklyXp);
      const finalName = userName || existingLb.name || 'Участник';
      const finalAvatar = avatar || existingLb.avatar || '';
      // Columns: C=name, D=avatar, E=xp, F=updatedAt
      sheetLb.getRange(existingLb._rowIndex, 3, 1, 4).setValues([[finalName, finalAvatar, finalXp, nowIso]]);
    } else {
      appendSheetRow('Leaderboard', {
        userId,
        weekKey,
        name: userName || 'Участник',
        avatar: avatar || '',
        xp: weeklyXp,
        updatedAt: nowIso,
      }, lbHeaders);
    }
  }

  // 4. Sync Settings
  if (settings && typeof settings === 'object') {
    const setHeaders = ['userId', 'dailyGoal', 'enabledMethods', 'theme', 'level', 'updatedAt'];
    const sheetSet = getSheet('UserSettings', setHeaders);
    const allSet = getSheetData('UserSettings', setHeaders);
    const existingSet = allSet.find((s) => String(s.userId).trim() === userId);
    const setRecord = {
      userId,
      dailyGoal: settings.dailyGoal !== undefined ? Number(settings.dailyGoal) : 10,
      enabledMethods: settings.enabledMethods || 'cards,quiz,input',
      theme: settings.theme || 'light',
      level: settings.category || 'All',
      updatedAt: new Date().toISOString(),
    };
    if (existingSet) {
      sheetSet.getRange(existingSet._rowIndex, 2, 1, 5).setValues([[
        setRecord.dailyGoal, setRecord.enabledMethods, setRecord.theme, setRecord.level, setRecord.updatedAt
      ]]);
    } else {
      appendSheetRow('UserSettings', setRecord, setHeaders);
    }
  }

  return successResponse({ status: 'synced', userId });
}
