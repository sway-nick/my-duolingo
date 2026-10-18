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

test('Monday Ticker: shouldShowMondayTicker is disabled by default', async () => {
  const { shouldShowMondayTicker } = await import('../frontend/components/layout/MondayWinnersTicker.js');
  assert.equal(shouldShowMondayTicker(false), false);
});
