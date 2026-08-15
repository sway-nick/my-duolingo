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
        <div class="app-layout-root">
            <!-- Left Navigation Sidebar (Desktop & Tablet) -->
            <aside class="app-sidebar-left" id="app-sidebar-left">
                <div class="sidebar-brand-box">
                    <div class="brand-symbol">✦</div>
                    <div class="brand-meta">
                        <span class="brand-name">English</span>
                        <span class="brand-tag">PRO</span>
                    </div>
                </div>

                <nav class="sidebar-nav-menu">
                    <button data-view="learn" class="nav-item-btn active">
                        <span class="nav-icon">🎓</span>
                        <span class="nav-text">Обучение</span>
                    </button>
                    <button data-view="vocabulary" class="nav-item-btn">
                        <span class="nav-icon">📖</span>
                        <span class="nav-text">Словарь</span>
                    </button>
                    <button data-view="stats" class="nav-item-btn">
                        <span class="nav-icon">📊</span>
                        <span class="nav-text">Статистика</span>
                    </button>
                    <button data-view="favorites" class="nav-item-btn">
                        <span class="nav-icon">❤️</span>
                        <span class="nav-text">Избранное</span>
                    </button>
                    <button data-view="settings" class="nav-item-btn">
                        <span class="nav-icon">⚙️</span>
                        <span class="nav-text">Настройки</span>
                    </button>
                </nav>

                <div class="sidebar-bottom-panel">
                    <button id="theme-toggle-btn" class="theme-switch-btn" title="Сменить тему оформления">
                        <span id="theme-icon">🌙</span>
                        <span class="theme-label">Тема</span>
                    </button>
                </div>
            </aside>

            <!-- Main Work Area -->
            <div class="app-viewport-area">
                <!-- Top Navigation & Stats Bar -->
                <header class="app-header-bar" id="app-header"></header>
                
                <!-- Central Page View -->
                <main class="app-main-viewport" id="main-content"></main>
            </div>

            <!-- Mobile Bottom Bar Navigation -->
            <nav class="mobile-bottom-bar" id="bottom-nav">
                <button data-view="learn" class="mobile-nav-btn active">
                    <span class="m-icon">🎓</span>
                    <span class="m-label">Уроки</span>
                </button>
                <button data-view="vocabulary" class="mobile-nav-btn">
                    <span class="m-icon">📖</span>
                    <span class="m-label">Словарь</span>
                </button>
                <button data-view="stats" class="mobile-nav-btn">
                    <span class="m-icon">📊</span>
                    <span class="m-label">Прогресс</span>
                </button>
                <button data-view="favorites" class="mobile-nav-btn">
                    <span class="m-icon">❤️</span>
                    <span class="m-label">Избранное</span>
                </button>
                <button data-view="settings" class="mobile-nav-btn">
                    <span class="m-icon">⚙️</span>
                    <span class="m-label">Опции</span>
                </button>
            </nav>
        </div>
    `;

    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    const leftSidebar = document.getElementById('app-sidebar-left');
    const appHeader = document.getElementById('app-header');

    // Lazy initialize Web Audio API on first interaction
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

    // View Routing
    const switchView = (view) => {
        if (view === 'settings') {
            showSettingsModal();
            return;
        }

        document.querySelectorAll('.nav-item-btn, .mobile-nav-btn').forEach(btn => {
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.querySelectorAll('.nav-item-btn, .mobile-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            if (view) switchView(view);
        });
    });

    document.addEventListener('start-lesson', (e) => {
        const { lessonId } = e.detail;
        if (bottomNav) bottomNav.style.display = 'none';
        if (leftSidebar) leftSidebar.classList.add('in-lesson-mode');
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
        if (leftSidebar) leftSidebar.classList.remove('in-lesson-mode');
        if (appHeader) appHeader.style.display = '';
        switchView('learn');
    };

    document.addEventListener('back-to-path', restoreNav);
    document.addEventListener('lesson-quit', restoreNav);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let registration of registrations) {
                    registration.update();
                }
            });
            navigator.serviceWorker.register('./sw.js?v=2.1').catch(() => {
                console.log('Service worker registration failed');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', initApp);
