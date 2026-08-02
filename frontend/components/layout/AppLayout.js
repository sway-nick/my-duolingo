function renderAppLayout() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <header class="app-header">
      <div class="logo">
        <h2>English Trainer</h2>
        <p>Учите слова легко!</p>
      </div>

      <nav class="navigation">
        <button>🎓 Тренировка</button>
        <button>♡ Избранное</button>
        <button>📊 Статистика</button>
        <button>📖 Словарь</button>
        <button>⚙</button>
        <button>☀</button>
      </nav>
    </header>

    <main class="app-layout">

      <aside class="sidebar left-sidebar">
        <div class="panel">
          <h3>Режим</h3>
        </div>

        <div class="panel">
          <h3>Сегодня</h3>
        </div>

        <div class="panel">
          <h3>Прогресс</h3>
        </div>
      </aside>


      <section class="training-area">
        <div id="words"></div>
      </section>


      <aside class="sidebar right-sidebar">
        <div class="panel">
          <h3>Действия</h3>
        </div>

        <div class="panel">
          <h3>Статистика слова</h3>
        </div>
      </aside>

    </main>
  `;
}

export { renderAppLayout };
