#!/usr/bin/env node
/**
 * One-time local helper to obtain an AdMob API OAuth2 Refresh Token
 * and save `.secrets/admob-oauth.json` for GitHub Secret `ADMOB_OAUTH_JSON`.
 *
 * Usage:
 *   node scripts/admob_oauth_helper.mjs path/to/client_secret.json
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const REDIRECT_PORT = 43210;
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/callback`;
const SCOPE = 'https://www.googleapis.com/auth/admob.readonly';

const clientPath = process.argv[2] || '.secrets/admob-client.json';
if (!fs.existsSync(clientPath)) {
  console.error(`File not found: ${clientPath}`);
  console.error('Download an OAuth 2.0 Desktop App Client JSON from Google Cloud Console and pass its path.');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
const cfg = raw.installed || raw.web || raw;
const clientId = cfg.client_id;
const clientSecret = cfg.client_secret;

if (!clientId || !clientSecret) {
  console.error('Invalid OAuth client JSON: missing client_id or client_secret.');
  process.exit(1);
}

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', SCOPE);
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');

console.log('\nOpen this URL in your browser (sign in with your AdMob Google account):\n');
console.log(authUrl.toString());
console.log('\nWaiting for callback on', REDIRECT_URI, '...\n');

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, REDIRECT_URI);
    if (u.pathname !== '/callback') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const code = u.searchParams.get('code');
    const err = u.searchParams.get('error');
    if (err || !code) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`OAuth error: ${err || 'missing code'}`);
      server.close();
      process.exit(1);
    }

    const tokRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tok = await tokRes.json();
    if (!tokRes.ok || !tok.refresh_token) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Token exchange failed: ${JSON.stringify(tok)}`);
      server.close();
      process.exit(1);
    }

    const outPath = path.resolve('.secrets/admob-oauth.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(
      outPath,
      JSON.stringify(
        {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tok.refresh_token,
        },
        null,
        2
      )
    );

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2>✅ AdMob OAuth connected! You can close this tab.</h2>');
    console.log('✅ Saved:', outPath);
    server.close();
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
    server.close();
    process.exit(1);
  }
});

server.listen(REDIRECT_PORT, '127.0.0.1');
