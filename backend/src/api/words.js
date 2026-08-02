function wordsGet() {
  const sheet = getSheet('Vocabulary');

  const values = sheet.getDataRange().getValues();

  values.shift();

  const words = values.map((row) => {
    return {
      id: row[0],
      word: row[1],
      transcription: row[2],
      translation: row[3],
      category: row[4],
      level: row[5],
    };
  });

  return successResponse(words);
}
