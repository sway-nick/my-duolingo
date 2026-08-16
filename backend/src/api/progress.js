const PROGRESS_HEADERS = ['userId', 'wordId', 'status', 'correctCount', 'errorCount', 'lastReviewed'];
const FAVORITE_HEADERS = ['userId', 'wordId', 'createdAt'];

function progressPost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['userId', 'wordId', 'isCorrect']);

  const userId = body.userId;
  const wordId = String(body.wordId);
  const isCorrect = Boolean(body.isCorrect);

  const sheet = getSheet('UserProgress', PROGRESS_HEADERS);
  const progressList = getSheetData('UserProgress', PROGRESS_HEADERS);

  const existingIndex = progressList.findIndex((p) => String(p.userId) === String(userId) && String(p.wordId) === wordId);

  let updatedRecord;
  if (existingIndex >= 0) {
    const item = progressList[existingIndex];
    const correctCount = Number(item.correctCount || 0) + (isCorrect ? 1 : 0);
    const errorCount = Number(item.errorCount || 0) + (isCorrect ? 0 : 1);
    const status = correctCount >= 3 ? 'mastered' : 'learning';
    const lastReviewed = new Date().toISOString();

    const rowIndex = item._rowIndex;
    sheet.getRange(rowIndex, 3, 1, 4).setValues([[status, correctCount, errorCount, lastReviewed]]);
    updatedRecord = { userId, wordId, status, correctCount, errorCount, lastReviewed };
  } else {
    updatedRecord = {
      userId,
      wordId,
      status: isCorrect ? 'learning' : 'learning',
      correctCount: isCorrect ? 1 : 0,
      errorCount: isCorrect ? 0 : 1,
      lastReviewed: new Date().toISOString(),
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

  return successResponse({
    totalWords,
    masteredCount,
    learningCount,
    totalAttempted,
    accuracy,
    streakDays: 3, // example streak
    categoryBreakdown: Object.values(categoryStats),
  });
}

function favoritePost(e) {
  const body = getJsonBody(e);
  validateRequired(body, ['userId', 'wordId', 'isFavorite']);

  const userId = body.userId;
  const wordId = String(body.wordId);
  const isFavorite = Boolean(body.isFavorite);

  const sheet = getSheet('Favorites', FAVORITE_HEADERS);
  const favList = getSheetData('Favorites', FAVORITE_HEADERS);

  const existingIndex = favList.findIndex((f) => String(f.userId) === String(userId) && String(f.wordId) === wordId);

  if (isFavorite && existingIndex < 0) {
    appendSheetRow('Favorites', { userId, wordId, createdAt: new Date().toISOString() }, FAVORITE_HEADERS);
  } else if (!isFavorite && existingIndex >= 0) {
    const rowIndex = favList[existingIndex]._rowIndex;
    sheet.deleteRow(rowIndex);
  }

  return successResponse({ userId, wordId, isFavorite });
}
