const ANALYTICS_HEADERS = [
  'userId', 'email', 'name', 'timestamp',
  'deviceType', 'os', 'browser', 'language',
  'timezone', 'resolution', 'referrer', 'ipAddress'
];

function analyticsPost(e) {
  let body = {};
  try {
    body = getJsonBody(e);
  } catch (err) {
    return errorResponse('Invalid JSON body.', 400);
  }

  const userId = body.userId || '';
  const email = body.email || '';
  const name = body.name || '';
  const timestamp = new Date().toISOString();
  const deviceType = body.deviceType || '';
  const os = body.os || '';
  const browser = body.browser || '';
  const language = body.language || '';
  const timezone = body.timezone || '';
  const resolution = body.resolution || '';
  const referrer = body.referrer || '';
  const ipAddress = ''; // Google Apps Script doesn't provide client IP in standard webapp events

  appendSheetRow('Analytics', {
    userId, email, name, timestamp,
    deviceType, os, browser, language,
    timezone, resolution, referrer, ipAddress
  }, ANALYTICS_HEADERS);

  return successResponse({ success: true });
}
