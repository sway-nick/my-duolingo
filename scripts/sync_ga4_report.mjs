#!/usr/bin/env node
/**
 * Syncs country-level analytics from Google Analytics 4 (GA4 Data API v1beta)
 * into a single aggregated Firestore document: `site_stats/ga4_report`.
 *
 * Required environment variables:
 *   GA4_PROPERTY_ID            - Numeric GA4 Property ID (e.g. "412345678")
 *   GA4_SERVICE_ACCOUNT_JSON   - Service Account JSON with GA4 Viewer + Firestore Writer roles
 *
 * Optional environment variables:
 *   FIREBASE_SERVICE_ACCOUNT_JSON - Separate Service Account JSON for Firestore (if different from GA4 SA)
 *   FIREBASE_PROJECT_ID           - Defaults to "english-breakfast-181ba"
 *   GA4_ALLTIME_START_DATE        - Defaults to "2024-01-01"
 */

import crypto from 'node:crypto';

const DEFAULT_FIREBASE_PROJECT_ID = 'english-breakfast-181ba';
const DEFAULT_ADMOB_PUBLISHER_ID = 'pub-9917058160362744';
const TOP_COUNTRIES_LIMIT = 80;
const PAID_CHANNEL_RE = /paid|display|cross-network|affiliate|cpc|ppc/i;

function toAdMobDate(d) {
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function parseIsoToAdMobDate(isoStr) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoStr || '').trim());
  if (!m) return { year: 2024, month: 1, day: 1 };
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

async function getAdMobAccessToken(oauthConfig) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: oauthConfig.client_id,
      client_secret: oauthConfig.client_secret,
      refresh_token: oauthConfig.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AdMob OAuth refresh failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error('AdMob OAuth response missing access_token');
  return data.access_token;
}

async function fetchAdMobCountryRevenue(publisherId, accessToken, startDateObj, endDateObj) {
  const url = `https://admob.googleapis.com/v1/accounts/${encodeURIComponent(publisherId)}/mediationReport:generate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reportSpec: {
        dateRange: {
          startDate: startDateObj,
          endDate: endDateObj,
        },
        dimensions: ['COUNTRY'],
        metrics: ['ESTIMATED_EARNINGS'],
        localizationSettings: {
          currencyCode: 'USD',
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AdMob mediationReport failed (${res.status}): ${text}`);
  }

  const items = await res.json();
  const revByCountry = new Map();
  let totalUsd = 0;

  for (const item of Array.isArray(items) ? items : []) {
    const row = item?.row;
    if (!row) continue;
    const rawCode = row.dimensionValues?.COUNTRY?.value;
    const code = normalizeCountryCode(rawCode, '');
    const micros = Number(row.metricValues?.ESTIMATED_EARNINGS?.microsValue || 0);
    const usd = micros / 1_000_000;
    revByCountry.set(code, (revByCountry.get(code) || 0) + usd);
    totalUsd += usd;
  }

  return { revByCountry, totalUsd: Math.round(totalUsd * 100) / 100 };
}

function applyAdMobRevenueToPeriod(periodData, admobResult) {
  if (!periodData || !admobResult) return;
  const { revByCountry, totalUsd } = admobResult;
  const seen = new Set();

  for (const c of periodData.countries || []) {
    if (c.code === 'OTHER') continue;
    seen.add(c.code);
    const usd = revByCountry.get(c.code) || 0;
    c.adRevenue = Math.round(usd * 100) / 100;
  }

  // Add any country with AdMob revenue that wasn't in GA4 rows
  for (const [code, usd] of revByCountry.entries()) {
    if (seen.has(code) || usd <= 0) continue;
    periodData.countries.push({
      code,
      name: code === 'ZZ' ? 'Other / Unknown' : code,
      totalUsers: 0,
      newPaid: 0,
      newOrganic: 0,
      uninstalls: 0,
      activeUsers: 0,
      proPurchases: 0,
      adRevenue: Math.round(usd * 100) / 100,
    });
  }

  periodData.totals.adRevenue = totalUsd;
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function getGoogleAccessToken(serviceAccount, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: scopes.join(' '),
    aud: serviceAccount.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key);
  const assertion = `${unsignedJwt}.${base64UrlEncode(signature)}`;

  const res = await fetch(payload.aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OAuth token exchange failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('OAuth response missing access_token');
  }
  return data.access_token;
}

async function runGa4Report(propertyId, accessToken, body) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GA4 runReport failed (${res.status}): ${text}`);
  }
  return res.json();
}

function normalizeCountryCode(rawCode, rawName) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code) && code !== 'ZZ') {
    return code;
  }
  if (!rawName || rawName === '(not set)') return 'ZZ';
  return 'ZZ';
}

function ensureCountryEntry(map, code, name) {
  if (!map.has(code)) {
    map.set(code, {
      code,
      name: (name && name !== '(not set)') ? name : (code === 'ZZ' ? 'Other / Unknown' : code),
      totalUsers: 0,
      newPaid: 0,
      newOrganic: 0,
      uninstalls: 0,
      activeUsers: 0,
      proPurchases: 0,
      adRevenue: 0,
    });
  } else if (name && name !== '(not set)') {
    const cur = map.get(code);
    if (cur.name === code || cur.name === 'Other / Unknown') {
      cur.name = name;
    }
  }
  return map.get(code);
}

async function fetchAllTimeTotals(propertyId, accessToken, startDate) {
  const totalsByCode = new Map();
  const report = await runGa4Report(propertyId, accessToken, {
    dateRanges: [{ startDate, endDate: 'today' }],
    dimensions: [{ name: 'countryId' }, { name: 'country' }],
    metrics: [{ name: 'totalUsers' }],
    limit: '250',
  });

  for (const row of report.rows || []) {
    const rawCode = row.dimensionValues?.[0]?.value;
    const rawName = row.dimensionValues?.[1]?.value;
    const code = normalizeCountryCode(rawCode, rawName);
    const totalUsers = Number(row.metricValues?.[0]?.value || 0);
    const entry = totalsByCode.get(code) || {
      code,
      name: (rawName && rawName !== '(not set)') ? rawName : (code === 'ZZ' ? 'Other / Unknown' : code),
      totalUsers: 0,
    };
    entry.totalUsers += totalUsers;
    totalsByCode.set(code, entry);
  }
  return totalsByCode;
}

async function fetchPeriodData(propertyId, accessToken, dateRange, allTimeMap) {
  const byCountry = new Map();

  // Seed with all-time countries so totalUsers is always populated
  for (const [code, item] of allTimeMap.entries()) {
    const entry = ensureCountryEntry(byCountry, code, item.name);
    entry.totalUsers = item.totalUsers;
  }

  // 1. Core metrics: activeUsers, newUsers, ecommercePurchases, totalAdRevenue
  let coreReport = null;
  try {
    coreReport = await runGa4Report(propertyId, accessToken, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'countryId' }, { name: 'country' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'ecommercePurchases' },
        { name: 'totalAdRevenue' },
      ],
      limit: '250',
    });
  } catch (err) {
    console.warn(`[GA4] Core report with totalAdRevenue failed for ${dateRange.startDate}..${dateRange.endDate}, retrying without totalAdRevenue:`, err.message);
    coreReport = await runGa4Report(propertyId, accessToken, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'countryId' }, { name: 'country' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'ecommercePurchases' },
      ],
      limit: '250',
    });
  }

  const coreNewUsersByCode = new Map();
  for (const row of coreReport.rows || []) {
    const rawCode = row.dimensionValues?.[0]?.value;
    const rawName = row.dimensionValues?.[1]?.value;
    const code = normalizeCountryCode(rawCode, rawName);
    const entry = ensureCountryEntry(byCountry, code, rawName);
    entry.activeUsers += Number(row.metricValues?.[0]?.value || 0);
    const newUsers = Number(row.metricValues?.[1]?.value || 0);
    coreNewUsersByCode.set(code, (coreNewUsersByCode.get(code) || 0) + newUsers);
    entry.proPurchases += Number(row.metricValues?.[2]?.value || 0);
    entry.adRevenue += Number(row.metricValues?.[3]?.value || 0);
  }

  // 2. Paid vs Organic acquisition split (newUsers by firstUserDefaultChannelGroup)
  try {
    const acqReport = await runGa4Report(propertyId, accessToken, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'countryId' }, { name: 'firstUserDefaultChannelGroup' }],
      metrics: [{ name: 'newUsers' }],
      limit: '1000',
    });
    for (const row of acqReport.rows || []) {
      const code = normalizeCountryCode(row.dimensionValues?.[0]?.value, '');
      const channel = String(row.dimensionValues?.[1]?.value || '');
      const count = Number(row.metricValues?.[0]?.value || 0);
      const entry = ensureCountryEntry(byCountry, code, '');
      if (PAID_CHANNEL_RE.test(channel)) {
        entry.newPaid += count;
      } else {
        entry.newOrganic += count;
      }
    }
  } catch (err) {
    console.warn(`[GA4] Channel split report failed for ${dateRange.startDate}..${dateRange.endDate}:`, err.message);
    for (const [code, count] of coreNewUsersByCode.entries()) {
      const entry = ensureCountryEntry(byCountry, code, '');
      entry.newOrganic += count;
    }
  }

  // 3. Uninstalls (Firebase Analytics automatic Android event: app_remove)
  try {
    const removeReport = await runGa4Report(propertyId, accessToken, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'countryId' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { matchType: 'EXACT', value: 'app_remove' },
        },
      },
      limit: '250',
    });
    for (const row of removeReport.rows || []) {
      const code = normalizeCountryCode(row.dimensionValues?.[0]?.value, '');
      const count = Number(row.metricValues?.[0]?.value || 0);
      const entry = ensureCountryEntry(byCountry, code, '');
      entry.uninstalls += count;
    }
  } catch (err) {
    console.warn(`[GA4] app_remove report failed for ${dateRange.startDate}..${dateRange.endDate}:`, err.message);
  }

  // Compute totals across all countries
  const totals = {
    totalUsers: 0,
    newPaid: 0,
    newOrganic: 0,
    uninstalls: 0,
    activeUsers: 0,
    proPurchases: 0,
    adRevenue: 0,
  };

  const list = [];
  for (const entry of byCountry.values()) {
    totals.totalUsers += entry.totalUsers;
    totals.newPaid += entry.newPaid;
    totals.newOrganic += entry.newOrganic;
    totals.uninstalls += entry.uninstalls;
    totals.activeUsers += entry.activeUsers;
    totals.proPurchases += entry.proPurchases;
    totals.adRevenue += entry.adRevenue;

    if (
      entry.totalUsers > 0 ||
      entry.activeUsers > 0 ||
      entry.newPaid > 0 ||
      entry.newOrganic > 0 ||
      entry.uninstalls > 0 ||
      entry.proPurchases > 0 ||
      entry.adRevenue > 0
    ) {
      list.push({
        ...entry,
        adRevenue: Math.round(entry.adRevenue * 100) / 100,
      });
    }
  }

  totals.adRevenue = Math.round(totals.adRevenue * 100) / 100;

  // Sort by activeUsers desc, then totalUsers desc
  list.sort((a, b) => (b.activeUsers - a.activeUsers) || (b.totalUsers - a.totalUsers));

  let countries = list;
  if (list.length > TOP_COUNTRIES_LIMIT) {
    const top = list.slice(0, TOP_COUNTRIES_LIMIT);
    const rest = list.slice(TOP_COUNTRIES_LIMIT);
    const other = {
      code: 'OTHER',
      name: 'Other countries',
      totalUsers: 0,
      newPaid: 0,
      newOrganic: 0,
      uninstalls: 0,
      activeUsers: 0,
      proPurchases: 0,
      adRevenue: 0,
    };
    for (const r of rest) {
      other.totalUsers += r.totalUsers;
      other.newPaid += r.newPaid;
      other.newOrganic += r.newOrganic;
      other.uninstalls += r.uninstalls;
      other.activeUsers += r.activeUsers;
      other.proPurchases += r.proPurchases;
      other.adRevenue += r.adRevenue;
    }
    other.adRevenue = Math.round(other.adRevenue * 100) / 100;
    top.push(other);
    countries = top;
  }

  return {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    totals,
    countries,
  };
}

async function writeReportToFirestore(projectId, accessToken, reportPayload) {
  const docUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/site_stats/ga4_report`;
  const nowIso = new Date().toISOString();
  const body = {
    fields: {
      reportJson: { stringValue: JSON.stringify(reportPayload) },
      updatedAt: { timestampValue: nowIso },
      version: { integerValue: '1' },
    },
  };

  const res = await fetch(docUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Firestore PATCH site_stats/ga4_report failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const propertyId = String(process.env.GA4_PROPERTY_ID || '').trim();
  const ga4SaRaw = String(process.env.GA4_SERVICE_ACCOUNT_JSON || '').trim();
  const fbSaRaw = String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  const projectId = String(process.env.FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID).trim();
  const allTimeStart = String(process.env.GA4_ALLTIME_START_DATE || '2024-01-01').trim();

  if (!propertyId) {
    throw new Error('Missing required env var: GA4_PROPERTY_ID');
  }
  if (!ga4SaRaw) {
    throw new Error('Missing required env var: GA4_SERVICE_ACCOUNT_JSON');
  }

  const ga4Sa = JSON.parse(ga4SaRaw);
  const fbSa = fbSaRaw ? JSON.parse(fbSaRaw) : ga4Sa;

  console.log(`[GA4 Sync] Fetching OAuth token for GA4 property ${propertyId}...`);
  const ga4Token = await getGoogleAccessToken(ga4Sa, [
    'https://www.googleapis.com/auth/analytics.readonly',
  ]);

  console.log(`[GA4 Sync] Querying all-time totals since ${allTimeStart}...`);
  const allTimeMap = await fetchAllTimeTotals(propertyId, ga4Token, allTimeStart);

  console.log('[GA4 Sync] Querying today, yesterday, 7d, and allTime periods...');
  const [today, yesterday, last7d, allTime] = await Promise.all([
    fetchPeriodData(propertyId, ga4Token, { startDate: 'today', endDate: 'today' }, allTimeMap),
    fetchPeriodData(propertyId, ga4Token, { startDate: 'yesterday', endDate: 'yesterday' }, allTimeMap),
    fetchPeriodData(propertyId, ga4Token, { startDate: '7daysAgo', endDate: 'yesterday' }, allTimeMap),
    fetchPeriodData(propertyId, ga4Token, { startDate: allTimeStart, endDate: 'today' }, allTimeMap),
  ]);

  const payload = {
    generatedAt: new Date().toISOString(),
    allTimeStart,
    revenueSource: 'ga4',
    periods: {
      today,
      yesterday,
      last7d,
      allTime,
    },
  };

  // Optional: Override adRevenue with exact AdMob + Unity Ads Mediation Report API data
  const admobOauthRaw = String(process.env.ADMOB_OAUTH_JSON || '').trim();
  const admobPublisherId = String(process.env.ADMOB_PUBLISHER_ID || DEFAULT_ADMOB_PUBLISHER_ID).trim();
  if (admobOauthRaw) {
    try {
      const admobOauth = JSON.parse(admobOauthRaw);
      console.log(`[AdMob Sync] Refreshing OAuth token for ${admobPublisherId}...`);
      const admobToken = await getAdMobAccessToken(admobOauth);

      const now = new Date();
      const todayDate = toAdMobDate(now);
      const yest = new Date(now.getTime() - 86400000);
      const yestDate = toAdMobDate(yest);
      const d7 = new Date(now.getTime() - 7 * 86400000);
      const d7Date = toAdMobDate(d7);
      const allStartDate = parseIsoToAdMobDate(allTimeStart);

      const [amToday, amYest, am7d, amAll] = await Promise.all([
        fetchAdMobCountryRevenue(admobPublisherId, admobToken, todayDate, todayDate),
        fetchAdMobCountryRevenue(admobPublisherId, admobToken, yestDate, yestDate),
        fetchAdMobCountryRevenue(admobPublisherId, admobToken, d7Date, yestDate),
        fetchAdMobCountryRevenue(admobPublisherId, admobToken, allStartDate, todayDate),
      ]);

      applyAdMobRevenueToPeriod(today, amToday);
      applyAdMobRevenueToPeriod(yesterday, amYest);
      applyAdMobRevenueToPeriod(last7d, am7d);
      applyAdMobRevenueToPeriod(allTime, amAll);
      payload.revenueSource = 'admob';
      console.log(`[AdMob Sync] Exact AdMob+Unity revenue merged: today=$${amToday.totalUsd}, yesterday=$${amYest.totalUsd}, 7d=$${am7d.totalUsd}, allTime=$${amAll.totalUsd}`);
    } catch (err) {
      console.warn('[AdMob Sync] Failed, keeping GA4 adRevenue fallback:', err.message);
    }
  }

  console.log(
    `[GA4 Sync] Built report: yesterday active=${yesterday.totals.activeUsers}, newPaid=${yesterday.totals.newPaid}, newOrg=${yesterday.totals.newOrganic}, uninstalls=${yesterday.totals.uninstalls}, pro=${yesterday.totals.proPurchases}, adRev=$${yesterday.totals.adRevenue} (${yesterday.countries.length} countries)`
  );

  if (dryRun) {
    console.log('[GA4 Sync] --dry-run enabled, skipping Firestore write.');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`[GA4 Sync] Writing site_stats/ga4_report to Firestore project ${projectId}...`);
  const fbToken = await getGoogleAccessToken(fbSa, [
    'https://www.googleapis.com/auth/datastore',
  ]);
  await writeReportToFirestore(projectId, fbToken, payload);
  console.log('[GA4 Sync] Done! Firestore document site_stats/ga4_report updated.');
}

main().catch((err) => {
  console.error('[GA4 Sync] Fatal error:', err);
  process.exit(1);
});
