import test from 'node:test';
import assert from 'node:assert/strict';

test('Monday Ticker: getRecentWeekKeys returns 2 weeks and correct structure', async () => {
  const { getRecentWeekKeys, getIsoWeekKey } = await import('../frontend/services/weekKey.js');
  const currentWeek = getIsoWeekKey();
  const recent = getRecentWeekKeys(2);

  assert.equal(recent.length, 2);
  assert.equal(recent[0], currentWeek);
  assert.match(recent[0], /^\d{4}-W\d{2}$/);
  assert.match(recent[1], /^\d{4}-W\d{2}$/);
});

test('Monday Ticker: shouldShowMondayTicker returns true when forced', async () => {
  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  const { shouldShowMondayTicker } = await import('../frontend/components/layout/MondayWinnersTicker.js');

  const forced = shouldShowMondayTicker(true);
  assert.equal(forced, true);
});

test('Monday Ticker: shouldShowMondayTicker returns false when dismissed in session', async () => {
  global.sessionStorage = {
    getItem: (key) => (key.startsWith('myduo_monday_ticker_dismissed_') ? '1' : null),
    setItem: () => {},
    removeItem: () => {},
  };
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  const { shouldShowMondayTicker } = await import('../frontend/components/layout/MondayWinnersTicker.js');

  const shown = shouldShowMondayTicker(false);
  assert.equal(shown, false);
});

test('Monday Ticker: shouldShowMondayTicker returns true on any weekday when not yet seen this week', async () => {
  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  const { shouldShowMondayTicker } = await import('../frontend/components/layout/MondayWinnersTicker.js');

  const shown = shouldShowMondayTicker(false);
  assert.equal(shown, true);
});

test('Monday Ticker: shouldShowMondayTicker returns false if already seen this week', async () => {
  const { getIsoWeekKey } = await import('../frontend/services/weekKey.js');
  const curWeekKey = getIsoWeekKey();

  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
  global.localStorage = {
    getItem: (key) => (key === `myduo_ticker_seen_week_${curWeekKey}` ? '1' : null),
    setItem: () => {},
    removeItem: () => {},
  };

  const { shouldShowMondayTicker } = await import('../frontend/components/layout/MondayWinnersTicker.js');

  const shown = shouldShowMondayTicker(false);
  assert.equal(shown, false);
});
