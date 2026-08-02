function renderTrainingCard(word) {
  const container = document.querySelector('#training');

  container.innerHTML = `
    <section class="word-card">

      <button class="sound-button">
        🔊
      </button>


      <h1 class="training-word">
        ${word.word}
      </h1>


      <p class="training-transcription">
        ${word.transcription}
      </p>


      <p class="hint">
        Введите перевод
      </p>


      <input
        class="answer-input"
        placeholder="Введите перевод"
      />


      <div class="difficulty">

        <button>
          Не помню
        </button>

        <button>
          Легко
        </button>

      </div>


      <div class="result-card">

        <h3>
          ✓ Правильно!
        </h3>


        <p>
          ${word.translation} — ${word.word}
        </p>


        <button class="next-button">
          Следующее слово →
        </button>

      </div>


    </section>
  `;
}

export { renderTrainingCard };
