import { speakWord } from '../../services/audioService.js?v=7.0';
import { toggleFavoriteApi } from '../../services/api.js?v=7.0';

function renderFavoritesView(favoriteWords = [], containerSelector = '#app-content', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const { onStartFavoritePractice = () => {}, onRemoveFavorite = () => {} } = options;

  if (!favoriteWords || favoriteWords.length === 0) {
    container.innerHTML = `
      <div class="favorites-page">
        <div class="page-header">
          <h2>❤️ Избранные слова</h2>
          <p class="subtitle">Ваш персональный список слов для повторения</p>
        </div>
        <div class="empty-favorites-box">
          <span class="empty-icon">🤍</span>
          <h3>У вас пока нет избранных слов</h3>
          <p>Нажимайте на сердечко ❤️ во время тренировок, чтобы добавлять сложные слова сюда.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="favorites-page">
      <div class="page-header-row">
        <div>
          <h2>❤️ Избранные слова (${favoriteWords.length})</h2>
          <p class="subtitle">Персональная подборка для регулярного повторения</p>
        </div>
        <button class="primary-button" id="start-fav-practice-btn">🎓 Тренировать избранные</button>
      </div>

      <div class="favorites-grid" id="favorites-grid">
        ${favoriteWords
          .map(
            (word) => `
          <div class="fav-card" data-id="${word.id}">
            <div class="fav-card-top">
              <span class="category-badge">${word.category || 'Общие'}</span>
              <button class="remove-fav-btn" data-id="${word.id}" title="Удалить из избранного">❤️</button>
            </div>
            
            <div class="fav-card-body">
              <h3 class="fav-word">${word.word}</h3>
              <p class="fav-transcription">${word.transcription || ''}</p>
              <p class="fav-translation">${word.translation}</p>
            </div>

            <div class="fav-card-actions">
              <button class="sound-button-sm" data-word="${word.word}" data-id="${word.id}">🔊 Слушать</button>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>
  `;

  // Bind practice button
  container.querySelector('#start-fav-practice-btn')?.addEventListener('click', () => {
    onStartFavoritePractice(favoriteWords);
  });

  // Bind sound buttons
  container.querySelectorAll('.sound-button-sm').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const w = e.target.getAttribute('data-word');
      const id = e.target.getAttribute('data-id');
      speakWord(w, id);
    });
  });

  // Bind remove favorite buttons
  container.querySelectorAll('.remove-fav-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      await toggleFavoriteApi(id, false);
      const card = container.querySelector(`.fav-card[data-id="${id}"]`);
      if (card) card.remove();
      onRemoveFavorite(id);
    });
  });
}

export { renderFavoritesView };
