const PROGRESS_HEADERS = ['userId', 'wordId', 'status', 'correctCount', 'errorCount', 'lastReviewed', 'quizCorrect', 'pairsCorrect', 'inputCorrect', 'seenInCards', 'masteredAt'];
const FAVORITE_HEADERS = ['userId', 'wordId', 'createdAt'];

function progressPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['userId', 'wordId', 'isCorrect']);

  const userId = String(body.userId).trim();
  const wordId = String(body.wordId).trim();
  const isCorrect = Boolean(body.isCorrect);

  // Optimization: Do not pollute Google Sheets with unregistered guest progress
  if (!userId.startsWith('u_')) {
    return successResponse({ userId, wordId, isCorrect, localOnly: true });
  }

  const sheet = getSheet('UserProgress', PROGRESS_HEADERS);
  const progressList = getSheetData('UserProgress', PROGRESS_HEADERS);

  const existingIndex = progressList.findIndex((p) => String(p.userId).trim() === userId && String(p.wordId).trim() === wordId);

  const quizCorrect = Number(body.quizCorrect !== undefined ? body.quizCorrect : 0);
  const pairsCorrect = Number(body.pairsCorrect !== undefined ? body.pairsCorrect : 0);
  const inputCorrect = Number(body.inputCorrect !== undefined ? body.inputCorrect : 0);
  const seenInCards = Boolean(body.seenInCards);
  const masteredAt = body.masteredAt || '';

  let updatedRecord;
  if (existingIndex >= 0) {
    const item = progressList[existingIndex];
    const correctCount = Number(item.correctCount || 0) + (isCorrect ? 1 : 0);
    const errorCount = Number(item.errorCount || 0) + (isCorrect ? 0 : 1);
    const isMastered = inputCorrect >= 2 || item.status === 'mastered';
    const status = isMastered ? 'mastered' : 'learning';
    const lastReviewed = new Date().toISOString();

    const rowIndex = item._rowIndex;
    sheet.getRange(rowIndex, 3, 1, 9).setValues([[
      status, correctCount, errorCount, lastReviewed,
      quizCorrect || Number(item.quizCorrect || 0),
      pairsCorrect || Number(item.pairsCorrect || 0),
      inputCorrect || Number(item.inputCorrect || 0),
      seenInCards || Boolean(item.seenInCards),
      masteredAt || (item.masteredAt ? new Date(item.masteredAt).toISOString() : '')
    ]]);
    updatedRecord = { userId, wordId, status, correctCount, errorCount, lastReviewed };
  } else {
    const isMastered = inputCorrect >= 2;
    updatedRecord = {
      userId,
      wordId,
      status: isMastered ? 'mastered' : 'learning',
      correctCount: isCorrect ? 1 : 0,
      errorCount: isCorrect ? 0 : 1,
      lastReviewed: new Date().toISOString(),
      quizCorrect,
      pairsCorrect,
      inputCorrect,
      seenInCards,
      masteredAt: masteredAt ? new Date(masteredAt).toISOString() : '',
    };
    appendSheetRow('UserProgress', updatedRecord, PROGRESS_HEADERS);
  }

  return successResponse(updatedRecord);
}

function statsGet(e) {
  const query = getQuery(e);
  const userId = query.userId || 'guest';

  const progressList = getSheetData('UserProgress', PROGRESS_HEADERS).filter(
    (p) => String(p.userId) === String(userId),
  );

  const vocabulary = getSheetData('Vocabulary', ['id', 'word', 'transcription', 'translation', 'category', 'level']);
  const totalWords = vocabulary.length;

  const masteredCount = progressList.filter((p) => p.status === 'mastered').length;
  const learningCount = progressList.filter((p) => p.status === 'learning').length;
  const totalAttempted = progressList.length;

  let totalCorrect = 0;
  let totalErrors = 0;

  progressList.forEach((p) => {
    totalCorrect += Number(p.correctCount || 0);
    totalErrors += Number(p.errorCount || 0);
  });

  const accuracy = totalCorrect + totalErrors > 0 ? Math.round((totalCorrect / (totalCorrect + totalErrors)) * 100) : 0;

  // Category breakdown
  const categoryStats = {};
  vocabulary.forEach((w) => {
    const cat = w.category || 'Общие';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { category: cat, total: 0, learned: 0 };
    }
    categoryStats[cat].total += 1;

    const prog = progressList.find((p) => String(p.wordId) === String(w.id));
    if (prog && (prog.status === 'mastered' || Number(prog.correctCount) > 0)) {
      categoryStats[cat].learned += 1;
    }
  });

  // Calculate Word of the Day across all users in the last 3 days (most mistakes)
  const allUserProgress = getSheetData('UserProgress', PROGRESS_HEADERS);
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const errorMap = {};

  allUserProgress.forEach((p) => {
    const lastRev = p.lastReviewed || '';
    const errCount = Number(p.errorCount || 0);
    if (errCount > 0 && lastRev >= threeDaysAgo) {
      const wId = String(p.wordId).trim();
      errorMap[wId] = (errorMap[wId] || 0) + errCount;
    }
  });

  let topWordId = null;
  let maxErrors = 0;
  Object.keys(errorMap).forEach((wId) => {
    if (errorMap[wId] > maxErrors) {
      maxErrors = errorMap[wId];
      topWordId = wId;
    }
  });

  // Fallback to all-time errors if no 3-day errors yet
  if (!topWordId) {
    allUserProgress.forEach((p) => {
      const errCount = Number(p.errorCount || 0);
      if (errCount > 0) {
        const wId = String(p.wordId).trim();
        errorMap[wId] = (errorMap[wId] || 0) + errCount;
        if (errorMap[wId] > maxErrors) {
          maxErrors = errorMap[wId];
          topWordId = wId;
        }
      }
    });
  }

  // Fallback to global date seed if no errors in sheet at all
  if (!topWordId && vocabulary.length > 0) {
    const todayStr = new Date().toISOString().slice(0, 10);
    let dateHash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      dateHash = ((dateHash << 5) - dateHash) + todayStr.charCodeAt(i);
      dateHash |= 0;
    }
    const trickyPool = vocabulary.filter((w) => w.level === 'B1' || w.level === 'B2' || w.level === 'Intermediate' || (w.word && w.word.length >= 6));
    const pool = trickyPool.length > 0 ? trickyPool : vocabulary;
    const idx = Math.abs(dateHash) % pool.length;
    topWordId = String(pool[idx].id);
  }

  return successResponse({
    totalWords,
    masteredCount,
    learningCount,
    totalAttempted,
    accuracy,
    streakDays: 3, // example streak
    categoryBreakdown: Object.values(categoryStats),
    wordOfTheDayId: topWordId,
    wordOfTheDayErrors: maxErrors,
  });
}

function favoritePost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['userId', 'wordId', 'isFavorite']);

  const userId = String(body.userId).trim();
  const wordId = String(body.wordId).trim();
  const isFavorite = Boolean(body.isFavorite);

  // Optimization: Do not pollute Google Sheets with unregistered guest favorites
  if (!userId.startsWith('u_')) {
    return successResponse({ userId, wordId, isFavorite, localOnly: true });
  }

  const sheet = getSheet('Favorites', FAVORITE_HEADERS);
  const favList = getSheetData('Favorites', FAVORITE_HEADERS);

  const existingIndex = favList.findIndex((f) => String(f.userId).trim() === userId && String(f.wordId).trim() === wordId);

  if (isFavorite && existingIndex < 0) {
    appendSheetRow('Favorites', { userId, wordId, createdAt: new Date().toISOString() }, FAVORITE_HEADERS);
  } else if (!isFavorite && existingIndex >= 0) {
    const rowIndex = favList[existingIndex]._rowIndex;
    sheet.deleteRow(rowIndex);
  }

  return successResponse({ userId, wordId, isFavorite });
}
