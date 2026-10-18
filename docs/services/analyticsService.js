/**
 * Unified Google Analytics / Firebase Analytics Service
 * 
 * Works across:
 * - Android Native App via AndroidAnalyticsBridge (Firebase Analytics / GA4)
 * - Web / PWA / Development console logging
 */

function sanitizeEventName(name) {
  if (!name) return 'unknown_event';
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 40);
}

export function trackScreen(screenName, screenClass = 'Screen', params = {}) {
  try {
    const cleanName = sanitizeEventName(screenName);
    const cleanClass = screenClass || 'MainActivity';

    if (
      typeof window !== 'undefined' &&
      window.AndroidAnalyticsBridge &&
      typeof window.AndroidAnalyticsBridge.trackScreen === 'function'
    ) {
      window.AndroidAnalyticsBridge.trackScreen(cleanName, cleanClass);
      if (params && Object.keys(params).length > 0) {
        window.AndroidAnalyticsBridge.logEvent(`screen_${cleanName}`, JSON.stringify(params));
      }
    }
  } catch (err) {
    console.warn('[Analytics] trackScreen error:', err);
  }
}

export function trackEvent(eventName, params = {}) {
  try {
    const cleanName = sanitizeEventName(eventName);
    if (
      typeof window !== 'undefined' &&
      window.AndroidAnalyticsBridge &&
      typeof window.AndroidAnalyticsBridge.logEvent === 'function'
    ) {
      window.AndroidAnalyticsBridge.logEvent(cleanName, JSON.stringify(params || {}));
    }
  } catch (err) {
    console.warn('[Analytics] trackEvent error:', err);
  }
}

export function setAnalyticsUserId(userId) {
  try {
    if (
      typeof window !== 'undefined' &&
      window.AndroidAnalyticsBridge &&
      typeof window.AndroidAnalyticsBridge.setUserId === 'function'
    ) {
      window.AndroidAnalyticsBridge.setUserId(userId ? String(userId) : null);
    }
  } catch (err) {
    console.warn('[Analytics] setUserId error:', err);
  }
}

export function setAnalyticsUserProperty(name, value) {
  try {
    if (
      typeof window !== 'undefined' &&
      window.AndroidAnalyticsBridge &&
      typeof window.AndroidAnalyticsBridge.setUserProperty === 'function'
    ) {
      window.AndroidAnalyticsBridge.setUserProperty(String(name), value ? String(value) : null);
    }
  } catch (err) {
    console.warn('[Analytics] setUserProperty error:', err);
  }
}

if (typeof window !== 'undefined') {
  window.trackScreen = trackScreen;
  window.trackEvent = trackEvent;
  window.setAnalyticsUserId = setAnalyticsUserId;
  window.setAnalyticsUserProperty = setAnalyticsUserProperty;
}
