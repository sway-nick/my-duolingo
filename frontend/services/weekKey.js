// Standard ISO-8601 Week Key in UTC (YYYY-Www)
// Shared single source of truth for all week calculation across client & cloud services

export function getIsoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7; // ISO week: Monday=1 ... Sunday=7
  date.setUTCDate(date.getUTCDate() + 4 - day); // Nearest Thursday determines the ISO year
  const year = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${year}-W${String(weekNo).padStart(2, '0')}`;
}

export function getRecentWeekKeys(n = 8, fromDate = new Date()) {
  const count = Math.max(1, Number(n) || 8);
  const keys = [];
  const base = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate()));
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getTime() - i * 7 * 86400000);
    keys.push(getIsoWeekKey(d));
  }
  return Array.from(new Set(keys));
}

export function getIsoWeekStartMs(weekKey = getIsoWeekKey()) {
  const match = String(weekKey || '').match(/^(\d{4})-W(\d{2})$/);
  if (!match) return 0;
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monWeek1 = new Date(jan4.getTime() - (day - 1) * 86400000);
  const monTarget = new Date(monWeek1.getTime() + (week - 1) * 7 * 86400000);
  return monTarget.getTime();
}



