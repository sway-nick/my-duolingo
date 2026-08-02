const DATABASE_ID = '1pRIbBXzyYMlQKMJZir9l7SH7I13QZfYZ_GETcq1w_BY';

function getDatabase() {
  return SpreadsheetApp.openById(DATABASE_ID);
}

function getSheet(sheetName) {
  return getDatabase().getSheetByName(sheetName);
}
