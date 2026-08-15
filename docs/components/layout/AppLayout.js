function renderAppLayout() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="mobile-app">

      <header class="mobile-header">
        <div class="brand">
          <span class="brand-icon">📖</span>
          <div>
            <h2>English Trainer</h2>
            <small>Учите слова легко!</small>
          </div>
        </div>
        <div class="header-icons">
          <button>⚙</button>
          <button>☀</button>
        </div>
      </header>

      <main class="training-screen">
        <div id="training"></div>
      </main>

      <nav class="bottom-nav">
        <button>
          🎓
          <span>Тренировка</span>
        </button>
        <button>
          ♡
          <span>Избранное</span>
        </button>
        <button>
          📊
          <span>Статистика</span>
        </button>
        <button>
          📖
          <span>Словарь</span>
        </button>
      </nav>

    </div>
  `;
}

export { renderAppLayout };
