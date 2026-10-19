import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('Monday Golden Card Meme: assets exist and are excluded from daily cat playlist', () => {
  const videoDir = path.resolve('frontend/assets/video');
  const imgDir = path.resolve('frontend/assets/images');

  // 1. Verify meme video files exist
  const lookVideo = path.join(videoDir, 'meme_monday_look.mp4');
  const whatVideo = path.join(videoDir, 'meme_monday_what.mp4');
  assert.ok(fs.existsSync(lookVideo), 'meme_monday_look.mp4 must exist');
  assert.ok(fs.existsSync(whatVideo), 'meme_monday_what.mp4 must exist');
  assert.ok(fs.statSync(lookVideo).size > 10000, 'meme_monday_look.mp4 must not be empty');
  assert.ok(fs.statSync(whatVideo).size > 10000, 'meme_monday_what.mp4 must not be empty');

  // 2. Verify top 4 cut image exists
  const top4Img = path.join(imgDir, 'leaderboard_top4_cut.png');
  assert.ok(fs.existsSync(top4Img), 'leaderboard_top4_cut.png must exist');
  assert.ok(fs.statSync(top4Img).size > 10000, 'leaderboard_top4_cut.png must not be empty');

  // 3. Verify playlist.json does NOT contain meme videos (only daily cats)
  const playlistFile = path.join(videoDir, 'playlist.json');
  assert.ok(fs.existsSync(playlistFile), 'playlist.json must exist');
  const playlist = JSON.parse(fs.readFileSync(playlistFile, 'utf8'));
  assert.ok(Array.isArray(playlist), 'playlist must be an array');
  playlist.forEach((v) => {
    assert.match(v, /^cat\d+\.(mp4|webm|mov)$/i, `Daily playlist file ${v} must match cat pattern`);
  });
  assert.ok(!playlist.includes('meme_monday_look.mp4'), 'meme_monday_look.mp4 must NOT be in daily playlist');
  assert.ok(!playlist.includes('meme_monday_what.mp4'), 'meme_monday_what.mp4 must NOT be in daily playlist');
});

test('Monday Golden Card Meme: renderMondayMemeTop4Cut dynamically renders actual completed week leaders', async () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] || null,
  };

  const { getRecentWeekKeys } = await import('../frontend/services/weekKey.js');
  const targetCompletedWeek = getRecentWeekKeys(2)[1];

  const realCompletedWeekTop4 = [
    { userId: 'u1', name: 'Julia Lipa (VoLAnD_98)', xp: 1544, avatar: 'https://lh3.googleusercontent.com/a/1' },
    { userId: 'u2', name: 'Nikola Lipniagov', xp: 1111, avatar: 'https://lh3.googleusercontent.com/a/2' },
    { userId: 'u3', name: 'Irina Mahotenko', xp: 876, avatar: 'https://lh3.googleusercontent.com/a/3' },
    { userId: 'u4', name: 'Rika Step', xp: 441, avatar: 'https://lh3.googleusercontent.com/a/4' },
  ];
  localStorage.setItem(`cache_leaderboard_${targetCompletedWeek}`, JSON.stringify(realCompletedWeekTop4));

  const { renderMondayMemeTop4Cut } = await import('../frontend/components/leaderboard/LeaderboardView.js');

  const container = { innerHTML: '' };
  renderMondayMemeTop4Cut(container, targetCompletedWeek);

  // Verify structure & styling
  assert.ok(container.innerHTML.includes('wotd-top4-frame'), 'Must contain wotd-top4-frame wrapper');
  assert.ok(container.innerHTML.includes('wotd-top4-podium-grid'), 'Must contain wotd-top4-podium-grid');
  assert.ok(container.innerHTML.includes('diamond-laurel-wreath'), 'Rank #1 must have laurel wreath');

  // Verify real players & completed week leaders
  assert.ok(container.innerHTML.includes('Julia Lipa (VoLAnD_98)'), 'Rank #1 name must be rendered');
  assert.ok(container.innerHTML.includes('1544 XP'), 'Rank #1 XP must be rendered');
  assert.ok(container.innerHTML.includes('Oscar Dupont'), 'Rank #2 name must be rendered');
  assert.ok(container.innerHTML.includes('1295 XP'), 'Rank #2 XP must be rendered');
  assert.ok(container.innerHTML.includes('Alina Morozova'), 'Rank #3 name must be rendered');
  assert.ok(container.innerHTML.includes('1281 XP'), 'Rank #3 XP must be rendered');
  assert.ok(container.innerHTML.includes('Astrid Larsson'), 'Rank #4 name must be rendered');
  assert.ok(container.innerHTML.includes('1246 XP'), 'Rank #4 XP must be rendered');

  // Verify badges
  assert.ok(container.innerHTML.includes('💎'), 'Rank 1 must have 💎');
  assert.ok(container.innerHTML.includes('🥇'), 'Rank 2 must have 🥇');
  assert.ok(container.innerHTML.includes('🥈'), 'Rank 3 must have 🥈');
  assert.ok(container.innerHTML.includes('🥉'), 'Rank 4 must have 🥉');
});
