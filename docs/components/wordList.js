function renderWordList(words) {
  const container = document.querySelector('#words');

  container.innerHTML = words
    .map((word) => {
      return `
        <div class="word-card">
          <h3>${word.word}</h3>
          <p>${word.transcription}</p>
          <p>${word.translation}</p>
          <small>${word.category} • ${word.level}</small>
        </div>
      `;
    })
    .join('');
}

export { renderWordList };
