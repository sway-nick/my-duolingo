const ANALYTICS_HEADERS = [
  'userId', 'email', 'name', 'timestamp',
  'deviceType', 'os', 'browser', 'language',
  'timezone', 'resolution', 'location', 'referrer', 'ipAddress'
];

function analyticsPost(e) {
  let body = {};
  try {
    body = getJsonBody(e);
  } catch (err) {
    return errorResponse('Invalid JSON body.', 400);
  }

  const userId = body.userId || '';
  if (!userId) {
    return errorResponse('Missing userId.', 400);
  }

  const email = body.email || '';
  const name = body.name || '';
  const timestamp = new Date().toISOString();
  const deviceType = body.deviceType || '';
  const os = body.os || '';
  const browser = body.browser || '';
  const language = body.language || '';
  const timezone = body.timezone || '';
  const resolution = body.resolution || '';
  const location = body.location || '';
  const referrer = body.referrer || '';
  const ipAddress = body.ipAddress || '';

  const sheet = getSheet('Analytics', ANALYTICS_HEADERS);
  const list = getSheetData('Analytics', ANALYTICS_HEADERS);

  const existingIdx = list.findIndex(
    (item) => String(item.userId || item.userid || '').trim() === userId
  );

  const rowData = {
    userId, email, name, timestamp,
    deviceType, os, browser, language,
    timezone, resolution, location, referrer, ipAddress
  };

  if (existingIdx >= 0) {
    const existing = list[existingIdx];
    const hasChanged =
      String(existing.email || '').trim() !== String(email).trim() ||
      String(existing.name || '').trim() !== String(name).trim() ||
      String(existing.devicetype || existing.deviceType || '').trim() !== String(deviceType).trim() ||
      String(existing.os || '').trim() !== String(os).trim() ||
      String(existing.browser || '').trim() !== String(browser).trim() ||
      String(existing.language || '').trim() !== String(language).trim() ||
      String(existing.timezone || '').trim() !== String(timezone).trim() ||
      String(existing.resolution || '').trim() !== String(resolution).trim() ||
      String(existing.location || '').trim() !== String(location).trim() ||
      String(existing.referrer || '').trim() !== String(referrer).trim() ||
      String(existing.ipaddress || existing.ipAddress || '').trim() !== String(ipAddress).trim();

    if (hasChanged) {
      const rowIndex = existing._rowIndex;
      const lastCol = sheet.getLastColumn() || ANALYTICS_HEADERS.length;
      const headers = sheet.getRange(1, 1, 1, Math.max(lastCol, 1)).getValues()[0];
      const rowValues = headers.map((h) => {
        if (rowData[h] !== undefined) return rowData[h];
        if (typeof h === 'string' && rowData[h.toLowerCase()] !== undefined) return rowData[h.toLowerCase()];
        return '';
      });
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
    }
  } else {
    appendSheetRow('Analytics', rowData, ANALYTICS_HEADERS);
  }

  return successResponse({ success: true });
}
