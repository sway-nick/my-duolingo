import os
import re
import json

BASE_DIR = r"c:\projects\my-duolingo"
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# 1. Load existing keys from i18n.js
i18n_path = os.path.join(FRONTEND_DIR, "services", "i18n.js")
existing_ru_dict = {}
if os.path.exists(i18n_path):
    with open(i18n_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        ru_match = re.search(r"ru:\s*\{([^}]+)\}", content, re.DOTALL)
        if ru_match:
            lines = ru_match.group(1).splitlines()
            for line in lines:
                m = re.match(r"^\s*([a-zA-Z0-9_]+)\s*:\s*[\"'](.*)[\"'],?", line)
                if m:
                    existing_ru_dict[m.group(1)] = m.group(2)

print(f"Loaded {len(existing_ru_dict)} keys from services/i18n.js")

# 2. Extract UI strings categorized by sections
ui_elements = []

# Nav & Common
ui_elements.append(("Nav", "training", "Тренировка"))
ui_elements.append(("Nav", "leaderboard", "Рейтинг"))
ui_elements.append(("Nav", "dictionary", "Словарь"))
ui_elements.append(("Nav", "favorites", "Избранное"))
ui_elements.append(("Nav", "stats", "Статистика"))
ui_elements.append(("Nav", "settings", "Настройки"))
ui_elements.append(("Nav", "demo", "Гостевой режим"))
ui_elements.append(("Common", "words", "слов"))
ui_elements.append(("Common", "word_1", "слово"))
ui_elements.append(("Common", "word_2", "слова"))
ui_elements.append(("Common", "btn_cancel", "Отмена"))
ui_elements.append(("Common", "btn_save", "Сохранить"))
ui_elements.append(("Common", "btn_close", "Закрыть"))
ui_elements.append(("Common", "btn_delete", "Удалить"))
ui_elements.append(("Common", "btn_back", "Назад"))
ui_elements.append(("Common", "loading", "Загрузка..."))
ui_elements.append(("Common", "error_occurred", "Произошла ошибка"))

# Stats View
ui_elements.append(("Stats", "achievements", "📊 Мои достижения"))
ui_elements.append(("Stats", "word_of_day", "Слово дня"))
ui_elements.append(("Stats", "flip_for_translation", "Нажми, чтобы увидеть перевод"))
ui_elements.append(("Stats", "stats_mastered", "Выучено слов"))
ui_elements.append(("Stats", "stats_in_progress", "Всего в процессе"))
ui_elements.append(("Stats", "stats_total_xp", "Общий счёт XP"))
ui_elements.append(("Stats", "stats_weekly_xp", "Набрано за неделю"))
ui_elements.append(("Stats", "stats_categories", "📁 Прогресс по категориям"))
ui_elements.append(("Stats", "stats_empty_categories", "Категории появятся после первых пройденных уроков."))

# Favorites View
ui_elements.append(("Favorites", "fav_title", "❤️ Избранные слова"))
ui_elements.append(("Favorites", "fav_empty", "У вас нет избранных слов"))
ui_elements.append(("Favorites", "fav_empty_sub", "Добавляйте сложные слова в избранное, нажимая на ❤️ во время тренировок, чтобы повторять их отдельно."))
ui_elements.append(("Favorites", "fav_start_btn", "🎓 Перейти к тренировке"))
ui_elements.append(("Favorites", "fav_practice_btn", "🔥 Повторить избранное"))

# Dictionary View
ui_elements.append(("Dictionary", "dict_title", "📖 Мой словарь"))
ui_elements.append(("Dictionary", "dict_search", "Поиск слова..."))
ui_elements.append(("Dictionary", "dict_filter_all", "Все слова"))
ui_elements.append(("Dictionary", "dict_filter_learning", "Изучаю"))
ui_elements.append(("Dictionary", "dict_filter_mastered", "Выучено"))
ui_elements.append(("Dictionary", "dict_stage_cards", "Карточки"))
ui_elements.append(("Dictionary", "dict_stage_quiz", "Квиз"))
ui_elements.append(("Dictionary", "dict_stage_pairs", "Пары"))
ui_elements.append(("Dictionary", "dict_stage_test", "Тест"))
ui_elements.append(("Dictionary", "dict_add_word_btn", "+ Добавить своё слово"))
ui_elements.append(("Dictionary", "dict_empty_search", "Ничего не найдено"))

# Add Word Modal
ui_elements.append(("Modal_AddWord", "addword_modal_title", "➕ Добавить слово в словарь"))
ui_elements.append(("Modal_AddWord", "addword_input_word_label", "Английское слово:"))
ui_elements.append(("Modal_AddWord", "addword_input_word_ph", "например: knowledge"))
ui_elements.append(("Modal_AddWord", "addword_input_trans_label", "Перевод:"))
ui_elements.append(("Modal_AddWord", "addword_input_trans_ph", "например: знание"))
ui_elements.append(("Modal_AddWord", "addword_input_notes_label", "Примечание / контекст (необязательно):"))
ui_elements.append(("Modal_AddWord", "addword_input_notes_ph", "например: употребляется в формальной речи"))
ui_elements.append(("Modal_AddWord", "addword_category_label", "Категория:"))
ui_elements.append(("Modal_AddWord", "addword_category_ph", "Общие"))
ui_elements.append(("Modal_AddWord", "addword_btn_submit", "✨ Проверить и добавить"))
ui_elements.append(("Modal_AddWord", "addword_success_msg", "Слово успешно проверено и добавлено!"))
ui_elements.append(("Modal_AddWord", "addword_ai_checking", "🧠 ИИ проверяет правописание и перевод..."))

# Leaderboard View
ui_elements.append(("Leaderboard", "lead_title", "🏆 Лига недели"))
ui_elements.append(("Leaderboard", "lead_position", "Вы находитесь на"))
ui_elements.append(("Leaderboard", "lead_position_end", "месте"))
ui_elements.append(("Leaderboard", "lead_current_week", "Текущая неделя"))
ui_elements.append(("Leaderboard", "lead_all_time", "Общий зачёт"))
ui_elements.append(("Leaderboard", "lead_rules", "Правила лиги"))
ui_elements.append(("Leaderboard", "lead_no_players", "Игроки появятся после первого начисления XP"))
ui_elements.append(("Leaderboard", "lead_rule_correct", "Правильный ответ: +1..+3 XP"))
ui_elements.append(("Leaderboard", "lead_rule_error", "Ошибка: -5 XP"))
ui_elements.append(("Leaderboard", "lead_rule_reset", "Сброс рейтинга каждый понедельник в 00:00 UTC"))

# Training & Exercises
ui_elements.append(("Training", "train_left", "Осталось слов"))
ui_elements.append(("Training", "train_in_progress", "В обучении"))
ui_elements.append(("Training", "train_know", "Знаю"))
ui_elements.append(("Training", "train_learn", "Учить"))
ui_elements.append(("Training", "train_cant_speak", "Не могу говорить"))
ui_elements.append(("Training", "train_check", "Проверить"))
ui_elements.append(("Training", "train_continue", "Продолжить"))
ui_elements.append(("Training", "train_mastered_title", "Поздравляем!"))
ui_elements.append(("Training", "train_mastered_all_favs", "Все избранные слова изучены!"))
ui_elements.append(("Training", "train_mastered_sub_favs", "Вы успешно изучили все избранные слова!"))
ui_elements.append(("Training", "train_mastered_sub_cat", "Все слова в категории успешно выучены!"))
ui_elements.append(("Training", "train_review_again", "🔄 Повторить заново"))
ui_elements.append(("Training", "train_exit_favs", "Вернуться в общую программу"))
ui_elements.append(("Training", "train_no_words_test", "Нет слов для Теста"))
ui_elements.append(("Training", "train_no_words_test_sub", "Сюда попадают слова, прошедшие режим «Пары»."))
ui_elements.append(("Training", "train_no_words_quiz", "Нет слов для Квиза"))
ui_elements.append(("Training", "train_no_words_quiz_sub", "Сюда попадают слова из Карточек по кнопке «Учить»."))
ui_elements.append(("Training", "train_no_words_pairs", "Нет слов для режима «Пары»"))
ui_elements.append(("Training", "train_no_words_pairs_sub", "Сюда попадают слова из Квиза или отмеченные «Знаю»."))
ui_elements.append(("Training", "train_go_quiz", "Перейти в Квиз"))
ui_elements.append(("Training", "train_go_pairs", "Перейти в Пары"))
ui_elements.append(("Training", "train_go_test", "Перейти в Тест"))
ui_elements.append(("Training", "train_input_placeholder", "Введите слово по-английски..."))
ui_elements.append(("Training", "train_input_hint", "Подсказка"))
ui_elements.append(("Training", "train_correct_answer", "Правильно!"))
ui_elements.append(("Training", "train_incorrect_answer", "Неверно. Правильный ответ:"))

# Settings View
ui_elements.append(("Settings", "settings_title", "⚙️ Настройки"))
ui_elements.append(("Settings", "settings_profile", "Профиль пользователя"))
ui_elements.append(("Settings", "settings_logout", "Выйти"))
ui_elements.append(("Settings", "settings_login", "Войти"))
ui_elements.append(("Settings", "settings_login_sub", "Войдите, чтобы синхронизировать прогресс"))
ui_elements.append(("Settings", "settings_theme", "🎨 Тема оформления"))
ui_elements.append(("Settings", "settings_theme_light", "Светлая"))
ui_elements.append(("Settings", "settings_theme_dark", "Тёмная"))
ui_elements.append(("Settings", "settings_theme_notebook", "Тетрадь"))
ui_elements.append(("Settings", "settings_sfx", "✨ Звуковые эффекты"))
ui_elements.append(("Settings", "settings_sfx_on", "🔔 Включены"))
ui_elements.append(("Settings", "settings_sfx_off", "🔕 Выключены"))
ui_elements.append(("Settings", "settings_voice", "Акцент озвучки"))
ui_elements.append(("Settings", "settings_voice_uk", "Британский (UK)"))
ui_elements.append(("Settings", "settings_voice_us", "Американский (US)"))
ui_elements.append(("Settings", "settings_goal", "📌 Дневная цель"))
ui_elements.append(("Settings", "settings_lang", "🌐 Язык интерфейса"))
ui_elements.append(("Settings", "settings_maintenance", "Обслуживание приложения"))
ui_elements.append(("Settings", "settings_maintenance_sub", "Если рейтинг или слова не обновляются, очистите кэш приложения."))
ui_elements.append(("Settings", "settings_clear_cache", "Очистить кэш приложения"))
ui_elements.append(("Settings", "settings_cache_cleared", "✓ Кэш успешно очищен!"))
ui_elements.append(("Settings", "settings_avatar_choose", "Выбрать аватарку"))

# Auth Modal
ui_elements.append(("Auth", "auth_modal_title", "Вход в аккаунт"))
ui_elements.append(("Auth", "auth_email_label", "Ваш Email:"))
ui_elements.append(("Auth", "auth_email_ph", "name@example.com"))
ui_elements.append(("Auth", "auth_pass_label", "Пароль:"))
ui_elements.append(("Auth", "auth_pass_ph", "Введите пароль"))
ui_elements.append(("Auth", "auth_name_label", "Ваше имя:"))
ui_elements.append(("Auth", "auth_name_ph", "Как к вам обращаться"))
ui_elements.append(("Auth", "auth_btn_login", "Войти"))
ui_elements.append(("Auth", "auth_btn_register", "Зарегистрироваться"))
ui_elements.append(("Auth", "auth_switch_to_reg", "Нет аккаунта? Зарегистрироваться"))
ui_elements.append(("Auth", "auth_switch_to_login", "Уже есть аккаунт? Войти"))

# Speech / Pronunciation
ui_elements.append(("Pronunciation", "speech_listening", "🎤 Слушаю... Говорите"))
ui_elements.append(("Pronunciation", "speech_recognized", "Распознано:"))
ui_elements.append(("Pronunciation", "speech_accuracy", "Точность произношения:"))
ui_elements.append(("Pronunciation", "speech_success", "✅ Отличное произношение!"))
ui_elements.append(("Pronunciation", "speech_retry", "❌ Попробуйте ещё раз"))
ui_elements.append(("Pronunciation", "speech_not_heard", "⚠ Голос не распознан. Попробуйте сказать громче."))

print(f"Total structured UI keys prepared: {len(ui_elements)}")
