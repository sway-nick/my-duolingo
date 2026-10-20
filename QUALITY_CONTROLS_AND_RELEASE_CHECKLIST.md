# Регламент постоянного контроля качества и релизных шлюзов (Quality Gates)

Данный документ фиксирует **обязательные постоянные контроли качества** проекта English Breakfast.  
Каждый из пунктов проверяется **автоматически** перед каждой сборкой APK/AAB и в CI/CD GitHub Actions (`.github/workflows/quality_gates.yml`), а также в тестовом наборе `npm test` (`tests/release_quality_gates.test.mjs`).

---

## 1. Медиация AdMob и Unity Ads (Gate 1)

### Обязательные требования:
1. **Авторизация в `app-ads.txt`:**
   * Google AdMob Direct Publisher: `google.com, pub-9917058160362744, DIRECT, f08c47fec0942fa0`
   * Unity Ads Direct Publisher: `unity.com, 157317001, DIRECT, 96cabb5fbdde37a7`
2. **Зависимости в `android/app/build.gradle`:**
   * Unity Ads нативный SDK: `implementation 'com.unity3d.ads:unity-ads:4.12.5'`
   * Адаптер медиации AdMob: `implementation 'com.google.ads.mediation:unity:4.12.5.0'`
3. **Правила ProGuard (`android/app/proguard-rules.pro`):**
   * Сохранение классов: `-keep class com.unity3d.ads.** { *; }`
   * Сохранение медиации: `-keep class com.google.ads.mediation.unity.** { *; }`
   * Подавление ворнингов: `-dontwarn com.unity3d.**`, `-dontwarn com.google.ads.mediation.unity.**`
4. **Межстраничная реклама:**
   * Показ после каждого завершённого раунда Теста (`minRoundsBetweenInterstitials = 1`).
   * Фоновая предзагрузка в RAM (`preloadInterstitial()`) с 0 мс задержкой при показе.
   * Автоматический fallback на официальный тестовый юнит при отсутствии заполнения (`NO_FILL`).

---

## 2. Работоспособность и безопасность виджета (Gate 2)

### Обязательные требования:
1. **Безопасная обработка Broadcast на HyperOS / MIUI / Samsung (`GoldCardWidgetProvider.java`):**
   * **ЗАПРЕЩЕНО** использовать блокирующую проверку вида `if (!isOurPackage) return;`, где `isOurPackage` требует `pkg != null`.
   * Лаунчеры Android при клике на виджет доставляют `PendingIntent`, в котором система зануляет `intent.getPackage()`.
   * **РАЗРЕШЕНО ТОЛЬКО:**
     ```java
     String pkg = intent.getPackage();
     if (pkg != null && !context.getPackageName().equals(pkg)) return;
     ComponentName comp = intent.getComponent();
     if (comp != null && !context.getPackageName().equals(comp.getPackageName())) return;
     ```
2. **Манифест (`AndroidManifest.xml`):**
   * Ресивер виджета `GoldCardWidgetProvider` обязан иметь `android:exported="true"`.
3. **Симметрия разметки (все 3 темы):**
   * Все ID из Java-кода (`widget_word_english`, `widget_word_translation`, `widget_btn_prev`, `widget_btn_next`, `widget_btn_speaker`, `widget_btn_heart`, `widget_btn_play_pause`, `widget_fav_counter`, `widget_rank_badge`, `widget_reminder_banner`, `widget_root`) обязаны присутствовать во всех 3 XML-макетах:
     * `widget_gold_card.xml`
     * `widget_glass_card.xml`
     * `widget_dark_glass_card.xml`
   * Разрешены строго теги из белого списка `RemoteViews`.
4. **Автозаполнение при отсутствии избранного:**
   * Если у пользователя 0 фаворитов, виджет автоматически заполняется качественными стартовыми словами из активного словаря с переводом на активный язык пользователя.

---

## 3. Поддержка всех 33 языков интерфейса и переводов (Gate 3)

### Обязательные требования:
1. **Список 33 поддерживаемых языков:**
   `ru`, `uk`, `en`, `de`, `es`, `fr`, `pl`, `tr`, `it`, `ro`, `bg`, `hu`, `el`, `da`, `ga`, `lv`, `lt`, `mt`, `pt`, `sk`, `sl`, `fi`, `hr`, `cs`, `sv`, `et`, `hi`, `ar`, `id`, `vi`, `th`, `ko`, `ja`.
2. **Словарь (`words.json`):**
   * Содержит более 2 000 базовых слов и 12 тематических коллекций.
   * Полные переводы на все 33 языка.
   * Строгий запрет на символы повреждения кодировки `U+FFFD` (`\ufffd`).
3. **Сервис переводов (`i18n.js`):**
   * Каждый из 33 языков имеет свой словарь в `const translations`.
   * Словарь виджета `WIDGET_TRANSLATIONS` полностью локализован на все 33 языка.
   * `getWordTranslation(wordObj)` отдаёт точный перевод для выбранного языка без утечки случайных иностранных языков.

---

## 4. Экономия запросов к Firebase / Cloud Firestore (Gate 4)

### Обязательные требования:
1. **TTL-кэширование Лидерборда на 30 минут (`LEADERBOARD_CACHE_TTL = 30 * 60 * 1000`):**
   * При повторном открытии вкладки «Рейтинг» запросы в Firestore блокируются, пока не прошло 30 минут с момента последнего запроса. Это снижает чтение базы в десятки раз.
2. **Дедупликация параллельных запросов сверки (In-Flight Deduplication):**
   * Одновременные вызовы `reconcileWeeklyXpFirestore` и `commitXpDeltaFirestore` объединяются в единый исполняемый промис (`inFlightReconciliation`), предотвращая дублирующие вызовы к серверу.
3. **Дебаунс синхронизации пользователя (Debounce 400 мс):**
   * Вызов `pushUserDataToCloud` дебаунсится через `syncDebounceTimer`, чтобы не бомбардировать Firestore при быстром вводе букв или ответов на карточки.
4. **Атомарные инкременты и серверные метки времени:**
   * Изменение очков и времени выполняется через атомарный серверный инкремент и `setToServerValue: "REQUEST_TIME"` в одном батче `:commit`, избавляя от лишней операции предварительного чтения документа.
5. **Серверное ограничение выборки (`limit: 100`):**
   * Запросы к коллекциям лидерборда строго ограничены первыми 100 позициями, исключая выгрузку всей базы пользователей.
6. **Пакетная синхронизация прогресса блоками раунда (Batching по этапам):**
   * Прогресс по каждому отдельному слову не отправляется в Firestore поштучно. Ответы мгновенно сохраняются локально в `localStorage` и буферизуются в `pendingProgressQueue`.
   * Отправка в облако (`pushUserDataToCloud` / `saveBulkProgressFirestore`) выполняется строго блоками:
     - При завершении полного блока **Карточек** (`cards`);
     - При завершении полного блока **Квиза** (`quiz`);
     - При завершении полного блока **Пар** (`pairs`);
     - При завершении полного блока **Теста** (`input`);
     - По завершении полного раунда обучения либо при сворачивании приложения (`pause` / `visibilitychange`).

---

## 5. Автоматизированные проверки перед релизом

Перед коммитом и сборкой обязательно выполнение:
```bash
# 1. Запуск 55 автотестов качества (включая Gate 1, 2, 3, 4)
npm test

# 2. Валидация XML разметки, манифеста, медиации и безопасности виджета
python scripts/validate_widget.py

# 3. Стандартизированная сборка APK (для тестирования на девайсе)
node scripts/build_android_apk.mjs

# 4. Стандартизированная сборка AAB (для Google Play Console)
node scripts/build_android_aab.mjs
```
