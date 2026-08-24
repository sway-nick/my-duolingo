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

  appendSheetRow('Analytics', {
    userId, email, name, timestamp,
    deviceType, os, browser, language,
    timezone, resolution, location, referrer, ipAddress
  }, ANALYTICS_HEADERS);

  return successResponse({ success: true });
}
