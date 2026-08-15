import { AudioService } from './services/audioService.js';
import { StorageService } from './services/storageService.js';
import { ApiService } from './services/api.js';
import { renderHeader, updateHeader } from './components/Header.js';
import { renderSkillPath } from './components/SkillPath.js';
import { renderLesson, destroyLesson } from './components/LessonEngine.js';
import { renderLessonSummary } from './components/LessonSummary.js';
import { renderVocabulary } from './components/VocabularyView.js';
import { renderStats } from './components/StatsView.js';
import { showSettingsModal, renderSettings } from './components/SettingsModal.js';

function initApp() {
    const appElement = document.getElementById('app');
    if (!appElement) return;

    appElement.innerHTML = `
        <div class="duo-app-wrapper">
            <!-- Desktop Left Sidebar -->
            <aside class="duo-sidebar-left" id="duo-sidebar-left">
                <div class="duo-brand">
                    <span class="brand-logo">🦜</span>
                    <span class="brand-title">duolingo</span>
                </div>
                <nav class="duo-sidebar-nav">
                    <button data-view="learn" class="duo-nav-btn active">
                        <span class="nav-icon">🎓</span>
                        <span class="nav-label">ОБУЧЕНИЕ</span>
                    </button>
                    <button data-view="vocabulary" class="duo-nav-btn">
                        <span class="nav-icon">📖</span>
                        <span class="nav-label">СЛОВАРЬ</span>
                    </button>
                    <button data-view="stats" class="duo-nav-btn">
                        <span class="nav-icon">📊</span>
                        <span class="nav-label">СТАТИСТИКА</span>
                    </button>
                    <button data-view="favorites" class="duo-nav-btn">
                        <span class="nav-icon">❤️</span>
                        <span class="nav-label">ИЗБРАННОЕ</span>
                    </button>
                    <button data-view="settings" class="duo-nav-btn">
                        <span class="nav-icon">⚙️</span>
                        <span class="nav-label">НАСТРОЙКИ</span>
                    </button>
                </nav>
                <div class="duo-sidebar-footer">
                    <button id="theme-toggle-btn" class="theme-toggle-btn" title="Сменить тему">
                        <span id="theme-icon">🌙</span> <span class="theme-label">Тема</span>
                    </button>
                </div>
            </aside>

            <div class="duo-main-area">
                <header class="app-header" id="app-header"></header>
                <main class="main-content" id="main-content"></main>
            </div>

            <!-- Mobile Bottom Nav -->
            <nav class="bottom-nav" id="bottom-nav">
                <button data-view="learn" class="nav-btn active"><span>🎓</span><small>Учиться</small></button>
                <button data-view="vocabulary" class="nav-btn"><span>📖</span><small>Словарь</small></button>
                <button data-view="stats" class="nav-btn"><span>📊</span><small>Статистика</small></button>
                <button data-view="favorites" class="nav-btn"><span>❤️</span><small>Избранное</small></button>
                <button data-view="settings" class="nav-btn"><span>⚙️</span><small>Настройки</small></button>
            </nav>
        </div>
    `;

    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    const leftSidebar = document.getElementById('duo-sidebar-left');
    const appHeader = document.getElementById('app-header');

    const initAudio = () => {
        AudioService.init();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);

    // Apply saved theme
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    };
    
    const settings = StorageService.getSettings() || {};
    applyTheme(settings.theme || 'light');

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            StorageService.updateSettings({ theme: newTheme });
            applyTheme(newTheme);
        });
    }

    StorageService.checkStreak();

    renderSettings(document.body);
    renderHeader();
    renderSkillPath(mainContent);

    // Synchronize navigation across desktop sidebar and mobile bottom-bar
    const switchView = (view) => {
        if (view === 'settings') {
            showSettingsModal();
            return;
        }

        document.querySelectorAll('.duo-nav-btn, .nav-btn').forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (typeof destroyLesson === 'function') {
            destroyLesson();
        }

        switch (view) {
            case 'learn':
                renderSkillPath(mainContent);
                break;
            case 'vocabulary':
                renderVocabulary(mainContent, false);
                break;
            case 'stats':
                renderStats(mainContent);
                break;
            case 'favorites':
                renderVocabulary(mainContent, true);
                break;
        }
        updateHeader();
    };

    document.querySelectorAll('.duo-nav-btn, .nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            if (view) switchView(view);
        });
    });

    document.addEventListener('start-lesson', (e) => {
        const { lessonId } = e.detail;
        if (bottomNav) bottomNav.style.display = 'none';
        if (leftSidebar) leftSidebar.classList.add('lesson-mode');
        if (appHeader) appHeader.style.display = 'none';
        renderLesson(mainContent, lessonId);
    });

    document.addEventListener('lesson-complete', (e) => {
        const { results } = e.detail;
        if (bottomNav) bottomNav.style.display = 'none';
        if (appHeader) appHeader.style.display = 'none';
        renderLessonSummary(mainContent, results);
        updateHeader();
    });

    const restoreNav = () => {
        if (bottomNav) bottomNav.style.display = '';
        if (leftSidebar) leftSidebar.classList.remove('lesson-mode');
        if (appHeader) appHeader.style.display = '';
        switchView('learn');
    };

    document.addEventListener('back-to-path', restoreNav);
    document.addEventListener('lesson-quit', restoreNav);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => {
                console.log('Service worker registration failed');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', initApp);
