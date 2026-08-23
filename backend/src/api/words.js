function wordsGet() {
  const sheet = getSheet('Vocabulary');

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return successResponse([]);

  const headers = values[0].map((h) => String(h).trim().toLowerCase());

  // Find column indices dynamically
  const idIdx = headers.indexOf('id');
  const wordIdx = headers.indexOf('word');

  let transIdx = headers.indexOf('transcription_ipa');
  if (transIdx < 0) transIdx = headers.indexOf('transcription_ru');
  if (transIdx < 0) transIdx = headers.findIndex((h) => h.includes('transcription'));

  const translnIdx = headers.indexOf('translation');
  const catIdx = headers.indexOf('category');
  const lvlIdx = headers.indexOf('level');
  const notesIdx = headers.indexOf('notes');

  values.shift();

  const words = values.map((row) => {
    let transcription = '';
    if (transIdx >= 0 && row[transIdx] !== undefined) {
      transcription = String(row[transIdx]).trim();
    }

    if (transcription) {
      transcription = transcription.replace(/^[\/\[]/, '').replace(/[\/\]]$/, '');
      transcription = `/${transcription}/`;
    }

    let notes = '';
    if (notesIdx >= 0 && row[notesIdx] !== undefined) {
      notes = String(row[notesIdx]).trim();
    }

    return {
      id: row[idIdx >= 0 ? idIdx : 0],
      word: row[wordIdx >= 0 ? wordIdx : 1],
      transcription: transcription,
      translation: row[translnIdx >= 0 ? translnIdx : 3],
      category: row[catIdx >= 0 ? catIdx : 4],
      level: row[lvlIdx >= 0 ? lvlIdx : 5],
      notes: notes,
    };
  });

  return successResponse(words);
}
