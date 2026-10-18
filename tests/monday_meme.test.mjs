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
