const DATABASE_ID = '1pRIbBXzyYMlQKMJZir9l7SH7I13QZfYZ_GETcq1w_BY';

function getDatabase() {
  return SpreadsheetApp.openById(DATABASE_ID);
}

function getSheet(sheetName, defaultHeaders = []) {
  const db = getDatabase();
  let sheet = db.getSheetByName(sheetName);
  if (!sheet && defaultHeaders.length > 0) {
    sheet = db.insertSheet(sheetName);
    sheet.appendRow(defaultHeaders);
  }
  return sheet;
}

function getSheetData(sheetName, defaultHeaders = []) {
  const sheet = getSheet(sheetName, defaultHeaders);
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  return values.slice(1).map((row, rowIndex) => {
    const item = { _rowIndex: rowIndex + 2 };
    headers.forEach((header, colIndex) => {
      item[header] = row[colIndex];
    });
    return item;
  });
}

function appendSheetRow(sheetName, rowObject, defaultHeaders = []) {
  const sheet = getSheet(sheetName, defaultHeaders);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || defaultHeaders.length).getValues()[0];
  const rowValues = headers.map((h) => (rowObject[h] !== undefined ? rowObject[h] : ''));
  sheet.appendRow(rowValues);
}

