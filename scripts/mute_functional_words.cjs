const fs = require('fs');
const path = require('path');

const wordsPath = path.join(__dirname, '..', 'frontend', 'assets', 'data', 'words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

const targetIds = new Set([
  1396, // it
  1677, // as
  2049, // by
  3786, // of
  3788, // in
  3797, // from
  3802, // than
  3819, // upon
  3842, // at
  3854, // with
  3859, // the
  3865, // into
  3909, // this
  3910, // that
  3911, // these
  3912, // those
  4005, // on
  4075, // for
  4077  // its
]);

let updatedCount = 0;
words.forEach(w => {
  if (targetIds.has(w.id)) {
    w.category = 'Advanced';
    w.level = 'C2';
    w.excludeFromTraining = true;
    updatedCount++;
    console.log(`Updated word ID ${w.id} (${w.word}): category -> Advanced, level -> C2, excludeFromTraining -> true`);
  }
});

if (updatedCount !== targetIds.size) {
  console.warn(`Warning: Expected to update ${targetIds.size} words, but updated ${updatedCount}`);
} else {
  console.log(`Successfully updated all ${updatedCount} functional words in words.json.`);
}

fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2), 'utf8');
