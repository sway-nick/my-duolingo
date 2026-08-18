/**
 * Entry point for GET requests.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(e) {
  try {
    return routeGet(e);
  } catch (error) {
    console.error(error);

    return errorResponse(error.message || 'Internal server error.', 500);
  }
}

/**
 * Entry point for POST requests.
 *
 * @param {Object} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  console.log('========== doPost ==========');

  try {
    console.log(JSON.stringify(e));
  } catch (error) {
    console.log('Cannot stringify event object.');
  }

  try {
    return routePost(e);
  } catch (error) {
    console.error(error);

    return errorResponse(error.message || 'Internal server error.', 500);
  }
}

/**
 * Creates successful API response.
 *
 * @param {*} data
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function successResponse(data) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      status: 200,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Creates error API response.
 *
 * @param {string} message
 * @param {number} status
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function errorResponse(message, status = 500) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: false,
      status,
      data: null,
      error: message,
      timestamp: new Date().toISOString(),
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Maintenance: One-click cleanup utility for Google Sheets.
 * Deletes all anonymous guest rows and duplicate records from database sheets.
 */
function cleanupGuests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsToClean = ['UserSettings', 'UserProgress', 'Leaderboard', 'Favorites'];
  let totalDeleted = 0;

  sheetsToClean.forEach(function(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;

    const values = sheet.getRange(1, 1, lastRow, 1).getValues();
    let sheetDeleted = 0;

    // Iterate bottom to top so indices don't shift
    for (let r = lastRow; r >= 2; r--) {
      const userId = String(values[r - 1][0] || '').trim();
      if (!userId.startsWith('u_') && !userId.startsWith('bot_')) {
        sheet.deleteRow(r);
        sheetDeleted++;
      }
    }
    Logger.log('Лист "' + sheetName + '": удалено записей: ' + sheetDeleted);
    totalDeleted += sheetDeleted;
  });

  Logger.log('Уборка завершена! Всего удалено записей гостей: ' + totalDeleted);
}
