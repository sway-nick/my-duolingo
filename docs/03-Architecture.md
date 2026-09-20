# Architecture — English Breakfast

## Обзор системы

```
┌─────────────────────────────────────────────────────────┐
│                      ИСТОЧНИКИ ПРАВДЫ                   │
│                                                         │
│   frontend/          ← ВСЕ ПРАВКИ ТОЛЬКО ЗДЕСЬ         │
│   backend/src/       ← Google Apps Script               │
└───────────────┬─────────────────────┬───────────────────┘
                │ node scripts/build  │ clasp push
                ▼                     ▼
┌──────────────────┐       ┌───────────────────────────────┐
│  docs/           │       │  Google Apps Script (REST API) │
│  (корень репо)   │       │  → Google Sheets (БД)          │
└──────┬───────────┘       └───────────────────────────────┘
       │ Cloudflare Pages
       ▼
┌─────────────────────────────────────────────────────────┐
│  https://english-breakfast.pages.dev  (PWA + Android)   │
│                                                         │
│  ┌──────────────────────┐   ┌───────────────────────┐   │
│  │  Web (PWA)           │   │  Android (Capacitor)  │   │
│  │  Cloudflare Pages    │   │  EnglishBreakfast.apk │   │
│  └──────────────────────┘   └───────────────────────┘   │
└─────────────────────────────────────────────────────────┘
       │
       │ Firebase Auth + Firestore REST API
       ▼
┌─────────────────────────────────────────────────────────┐
│  Firebase (english-breakfast-181ba)                     │
│  • Auth  — identity провайдер                          │
│  • Firestore — прогресс, избранное, лидерборд, XP      │
└─────────────────────────────────────────────────────────┘
```

---

## Правило №1 — Источник правды

> **Все изменения исходного кода делаются ТОЛЬКО в `frontend/`**
> Никогда не редактировать файлы в `docs/`, `services/` (корень) напрямую.

После правок запустить:
```bash
node scripts/build.cjs
```
Билд автоматически скопирует `frontend/` → `docs/` + корень репо.

---

## Структура проекта

```
my-duolingo/
│
├── frontend/                   ← ИСТОЧНИК ПРАВДЫ (исходники)
│   ├── index.html              ← Единственный HTML-файл приложения
│   ├── app.js                  ← Точка входа приложения (init, routing)
│   ├── main.js                 ← Алиас app.js (устаревший, сохраняется для совместимости)
│   ├── sw.js                   ← Service Worker (PWA offline-кэш)
│   ├── manifest.json           ← PWA-манифест
│   ├── privacy.html            ← Страница политики конфиденциальности
│   │
│   ├── services/               ← Сервисный слой (бизнес-логика и API)
│   │   ├── api.js              ← Главный API-сервис: данные, синхронизация, пользователь
│   │   ├── firebase.js         ← Firebase Auth + Firestore REST-клиент
│   │   ├── authService.js      ← Авторизация: вход, выход, состояние сессии
│   │   ├── audioService.js     ← Воспроизведение аудио и TTS
│   │   ├── storageService.js   ← Обёртка над localStorage
│   │   ├── i18n.js             ← Интернационализация (переводы UI + словари)
│   │   └── initialData.js      ← Начальные данные приложения (сиды)
│   │
│   ├── components/             ← UI-компоненты (JS-классы/функции)
│   │   ├── Header.js           ← Шапка приложения
│   │   ├── LessonEngine.js     ← Движок урока (логика упражнений)
│   │   ├── LessonSummary.js    ← Экран итогов урока
│   │   ├── SkillPath.js        ← Карта навыков / дерево уроков
│   │   ├── SettingsModal.js    ← Модальное окно настроек
│   │   ├── StatsView.js        ← Экран статистики
│   │   ├── VocabularyView.js   ← Просмотр словаря
│   │   ├── wordList.js         ← Список слов (вспомогательный)
│   │   │
│   │   ├── auth/               ← Компоненты авторизации (формы входа/регистрации)
│   │   ├── dictionary/         ← Компоненты словаря
│   │   ├── exercises/          ← Типы упражнений (карточки, тесты, ввод)
│   │   ├── favorites/          ← Избранное
│   │   ├── layout/             ← Layout-компоненты (контейнеры, навигация)
│   │   ├── leaderboard/        ← Лидерборд
│   │   ├── modals/             ← Переиспользуемые модальные окна
│   │   ├── settings/           ← Экраны настроек
│   │   ├── stats/              ← Блоки статистики
│   │   └── training/           ← Режимы тренировки
│   │
│   └── assets/                 ← Статичные ресурсы
│       ├── css/
│       │   ├── main.css        ← Основные стили приложения
│       │   └── app.css         ← Дополнительные стили (алиас)
│       ├── data/
│       │   ├── words.json      ← База словаря (~5.6 МБ)
│       │   └── migrated_players.json  ← Данные миграции пользователей
│       ├── audio/              ← Аудиофайлы произношения
│       ├── avatars/            ← Изображения аватаров
│       ├── icons/              ← Иконки приложения
│       └── video/              ← Видеоматериалы
│
├── docs/                       ← СБОРКА (генерируется build.cjs — не редактировать!)
│   ├── [зеркало frontend/]     ← Идентично frontend/ после билда
│   ├── 01-Product-Backlog.md   ← Бэклог продукта
│   ├── 02-Roadmap.md           ← Дорожная карта
│   ├── 03-Architecture.md      ← Этот файл
│   ├── 04-ADR.md               ← Architectural Decision Records
│   ├── 05-Changelog.md         ← История изменений
│   └── 06-Product-Map.md       ← Карта продукта
│
├── backend/                    ← Google Apps Script (серверная часть)
│   ├── src/
│   │   ├── Code.js             ← Точка входа Apps Script
│   │   ├── router.js           ← GET-роутер
│   │   ├── postRouter.js       ← POST-роутер
│   │   ├── api/                ← Обработчики эндпоинтов
│   │   ├── services/           ← Сервисы (Google Sheets, логика)
│   │   └── utils/              ← Утилиты
│   └── dist/                   ← Бандл для деплоя (clasp push)
│
├── scripts/                    ← Утилиты разработки
│   ├── build.cjs               ← Главный билд: frontend/ → docs/ + корень
│   ├── build_android_apk.mjs   ← Сборка APK через Capacitor
│   ├── prepare_android_assets.mjs  ← Подготовка ресурсов Android
│   ├── bundle_backend.cjs      ← Бандлинг backend для clasp
│   ├── serve.mjs               ← Локальный dev-сервер
│   ├── download_audio.py       ← Скачивание аудио произношений
│   ├── sync_dictionary_and_audio.mjs  ← Синхронизация словаря и аудио
│   ├── extract_ui_strings.py   ← Извлечение строк для переводов
│   ├── generate_ui_csv.py      ← Генерация CSV переводов
│   ├── verify_imports.cjs      ← Проверка импортов
│   └── test_inputs.cjs         ← Тесты входных данных
│
├── android/                    ← Capacitor Android-проект
│   └── [Capacitor/Gradle файлы]
│
├── google_play_assets/         ← Материалы для Google Play Store
│   └── STORE_LISTING_ASO.md
│
├── .well-known/                ← PWA / web verification файлы
├── firebase.json               ← Firebase CLI конфиг
├── firestore.rules             ← Правила безопасности Firestore
├── GOOGLE_SHEETS_SCRIPT.js     ← Legacy скрипт Google Sheets
├── MOBILE_UI_UX_STANDARDS.md  ← UX-стандарты мобильного интерфейса
├── UI_AND_LAYOUT_STANDARDS.md ← Стандарты UI и разметки
├── README.md                   ← Документация проекта
├── package.json                ← Node.js зависимости
└── EnglishBreakfast.apk        ← Актуальный APK для скачивания
```

---

## Правила расположения файлов

### Куда класть новые файлы

| Тип файла | Папка | Пример |
|-----------|-------|--------|
| Новый UI-компонент | `frontend/components/<область>/` | `frontend/components/exercises/SpellingCard.js` |
| Новый сервис / API-клиент | `frontend/services/` | `frontend/services/analyticsService.js` |
| Новый CSS-модуль | `frontend/assets/css/` | `frontend/assets/css/leaderboard.css` |
| Статичные данные (JSON) | `frontend/assets/data/` | `frontend/assets/data/phrases.json` |
| Аудиофайлы | `frontend/assets/audio/` | `frontend/assets/audio/hello.mp3` |
| Иконки / изображения | `frontend/assets/icons/` | `frontend/assets/icons/star.svg` |
| Аватары | `frontend/assets/avatars/` | `frontend/assets/avatars/owl_01.png` |
| Новый backend-эндпоинт | `backend/src/api/` | `backend/src/api/getProgress.js` |
| Скрипт сборки / автоматизации | `scripts/` | `scripts/generate_avatars.py` |
| Документация | `docs/` | `docs/07-Security.md` |
| Переводы / i18n | `frontend/services/i18n.js` | *(всё в одном файле)* |

### Запрещено

- ❌ Редактировать файлы в `docs/services/`, `services/` (корень), `docs/index.html` — только через билд
- ❌ Хранить секреты (API ключи, токены) в git
- ❌ Класть исходники компонентов в корень `frontend/components/` если есть подходящая подпапка
- ❌ Хранить временные / scratch файлы в `frontend/` или `docs/`

---

## Технический стек

| Слой | Технология |
|------|-----------|
| Frontend | Vanilla JS (ES Modules), HTML5, CSS3 |
| PWA | Service Worker, Web App Manifest |
| Mobile | Capacitor (Android) |
| Auth | Firebase Authentication (Google, Email/Password) |
| База данных | Firestore (прогресс, XP, избранное, лидерборд) |
| Legacy БД | Google Sheets через Apps Script REST API |
| Деплой web | Cloudflare Pages (из ветки `main`, папка `docs/`) |
| Деплой backend | Google Apps Script (clasp) |
| CDN | Cloudflare |

---

## Firebase — структура Firestore

```
users/{userId}/                        ← read: public; write: auth only
    users/{userId}/data/progress       ← read/write: auth.uid == userId
    users/{userId}/data/favorites      ← read/write: auth.uid == userId
    users/{userId}/data/notes          ← read/write: auth.uid == userId
    users/{userId}/data/weekly_xp_{week}  ← read/write: auth.uid == userId

leaderboards/{weekKey}/players/{userId}  ← read: public; write: auth.uid == userId
```

> **Важно:** `userId` в путях Firestore = **Firebase UID** (`b9PUaf5jtthwQIOPvAdZJ1o5CBC3`),
> а НЕ внутренний ID приложения (`110531984537821932939`).
> Всегда используй `getFirestoreUserId(uId)` перед запросами к subcollections.

---

## Деплой

```bash
# 1. Внести правки в frontend/
# 2. Собрать
node scripts/build.cjs

# 3. Закоммитить и запушить в main
git add -A
git commit -m "feat: ..."
git push origin main
# → Cloudflare Pages автоматически деплоит из docs/ ветки main

# Сборка Android APK
node scripts/build_android_apk.mjs
# APK: EnglishBreakfast.apk (макс. 36 МБ)

# Деплой backend (Apps Script)
node scripts/bundle_backend.cjs
cd backend && clasp push
```

---

## Версионирование импортов

Файлы сервисов в `index.html` подключаются с версионным параметром:
```html
<script src="services/api.js?v=221.0" type="module"></script>
<script src="services/firebase.js?v=200.0" type="module"></script>
```
При значительных изменениях файла — увеличивать версию, чтобы инвалидировать кэш.
