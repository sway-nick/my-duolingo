package com.englishbreakfast.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;

public class GoldCardWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_FLIP = "com.englishbreakfast.app.widget.ACTION_FLIP";
    public static final String ACTION_NEXT = "com.englishbreakfast.app.widget.ACTION_NEXT";
    public static final String ACTION_PREV = "com.englishbreakfast.app.widget.ACTION_PREV";
    public static final String ACTION_SPEAK = "com.englishbreakfast.app.widget.ACTION_SPEAK";
    public static final String ACTION_TOGGLE_FAV = "com.englishbreakfast.app.widget.ACTION_TOGGLE_FAV";
    public static final String ACTION_AUTO_ROTATE = "com.englishbreakfast.app.widget.ACTION_AUTO_ROTATE";

    private static final long ROTATION_INTERVAL_MS = 30 * 60 * 1000L; // 30 minutes

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        scheduleNextRotation(context);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        scheduleNextRotation(context);
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        cancelRotation(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (intent == null || intent.getAction() == null) return;
        handleWidgetAction(context, intent.getAction());
    }

    public static void handleWidgetAction(Context context, String action) {
        if (action == null) return;
        // Clear reminder alert when user interacts with widget
        if (ACTION_FLIP.equals(action) || ACTION_NEXT.equals(action) || ACTION_PREV.equals(action) || ACTION_SPEAK.equals(action)) {
            WidgetDataManager.setReminderAlertActive(context, false);
        }

        switch (action) {
            case ACTION_FLIP:
                WidgetDataManager.toggleFlip(context);
                if (WidgetDataManager.isSoundFlipEnabled(context)) {
                    WidgetAudioPlayer.playPageTurn(context);
                }
                updateAllWidgets(context);
                break;

            case ACTION_NEXT:
                WidgetDataManager.nextWord(context);
                if (WidgetDataManager.isSoundFlipEnabled(context)) {
                    WidgetAudioPlayer.playPageTurn(context);
                }
                if (WidgetDataManager.isAutoSpeakEnabled(context)) {
                    WidgetDataManager.WidgetWord curWord = WidgetDataManager.getCurrentWord(context);
                    if (curWord != null && !curWord.word.isEmpty()) {
                        WidgetAudioPlayer.playWord(context, curWord.word);
                    }
                }
                updateAllWidgets(context);
                break;

            case ACTION_PREV:
                WidgetDataManager.prevWord(context);
                if (WidgetDataManager.isSoundFlipEnabled(context)) {
                    WidgetAudioPlayer.playPageTurn(context);
                }
                if (WidgetDataManager.isAutoSpeakEnabled(context)) {
                    WidgetDataManager.WidgetWord curWord = WidgetDataManager.getCurrentWord(context);
                    if (curWord != null && !curWord.word.isEmpty()) {
                        WidgetAudioPlayer.playWord(context, curWord.word);
                    }
                }
                updateAllWidgets(context);
                break;

            case ACTION_SPEAK:
                WidgetDataManager.WidgetWord curWord = WidgetDataManager.getCurrentWord(context);
                if (curWord != null && !curWord.word.isEmpty()) {
                    WidgetAudioPlayer.playWord(context, curWord.word);
                }
                break;

            case ACTION_TOGGLE_FAV:
                WidgetDataManager.toggleFavorite(context);
                if (WidgetDataManager.isSoundFlipEnabled(context)) {
                    WidgetAudioPlayer.playPageTurn(context);
                }
                updateAllWidgets(context);
                break;

            case ACTION_AUTO_ROTATE:
                WidgetDataManager.nextWord(context);
                if (WidgetDataManager.isAutoSpeakEnabled(context)) {
                    // Suppress auto-speech if app in foreground, outside quiet hours, or system audio is busy (calls, video, games, silent mode)
                    if (!WidgetDataManager.isAppInForeground() 
                            && WidgetDataManager.isWithinSpeakHours(context)
                            && !WidgetAudioPlayer.isSystemAudioBusy(context)) {
                        WidgetDataManager.WidgetWord w = WidgetDataManager.getCurrentWord(context);
                        if (w != null && !w.word.isEmpty()) {
                            WidgetAudioPlayer.playWord(context, w.word);
                        }
                    }
                }
                updateAllWidgets(context);
                scheduleNextRotation(context);
                break;
        }
    }

    public static void updateAllWidgets(Context context) {
        if (context == null) return;
        try {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            ComponentName widgetComponent = new ComponentName(context, GoldCardWidgetProvider.class);
            int[] allIds = manager.getAppWidgetIds(widgetComponent);
            for (int id : allIds) {
                updateAppWidget(context, manager, id);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            String theme = WidgetDataManager.getWidgetTheme(context);
            int layoutId;
            if ("dark_glass".equalsIgnoreCase(theme)) {
                layoutId = R.layout.widget_dark_glass_card;
            } else if ("glass".equalsIgnoreCase(theme)) {
                layoutId = R.layout.widget_glass_card;
            } else {
                layoutId = R.layout.widget_gold_card;
            }
            RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);

            WidgetDataManager.WidgetWord word = WidgetDataManager.getCurrentWord(context);
            boolean isFlipped = WidgetDataManager.isFlipped(context);

            // Words
            views.setTextViewText(R.id.widget_word_english, word.word);
            views.setTextViewText(R.id.widget_word_translation, word.translation);

            // Toggle visibility between English word (front) and translation (back)
            if (isFlipped) {
                views.setViewVisibility(R.id.widget_word_english, View.GONE);
                views.setViewVisibility(R.id.widget_word_translation, View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.widget_word_english, View.VISIBLE);
                views.setViewVisibility(R.id.widget_word_translation, View.GONE);
            }

            Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
            boolean isPortrait = context.getResources().getConfiguration().orientation != android.content.res.Configuration.ORIENTATION_LANDSCAPE;
            int maxHeight = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
            int minHeight = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0) : 0;

            int currentHeightDp;
            if (isPortrait) {
                currentHeightDp = maxHeight > 0 ? maxHeight : minHeight;
            } else {
                currentHeightDp = minHeight > 0 ? minHeight : maxHeight;
            }

            // When widget is resized to 4x1, height is typically 40..80dp. For 4x2, it's 100..180dp.
            // If unknown (0), default to full 4x2 (isCompact1Row = false).
            boolean isCompact1Row = currentHeightDp > 0 && currentHeightDp < 90;

            float density = context.getResources().getDisplayMetrics().density;
            if (isCompact1Row) {
                // 4x1: standard base sizes
                // English: 20sp, Translation is 1 less: 19sp
                views.setTextViewTextSize(R.id.widget_word_english, TypedValue.COMPLEX_UNIT_SP, 20f);
                views.setTextViewTextSize(R.id.widget_word_translation, TypedValue.COMPLEX_UNIT_SP, 19f);
                views.setTextViewTextSize(R.id.widget_fav_counter, TypedValue.COMPLEX_UNIT_SP, 13f);
                views.setTextViewTextSize(R.id.widget_rank_badge, TypedValue.COMPLEX_UNIT_SP, 12.5f);
                views.setTextViewTextSize(R.id.widget_btn_prev, TypedValue.COMPLEX_UNIT_SP, 28f);
                views.setTextViewTextSize(R.id.widget_btn_next, TypedValue.COMPLEX_UNIT_SP, 28f);
                int pad4 = Math.round(4f * density);
                views.setViewPadding(R.id.widget_btn_speaker, pad4, pad4, pad4, pad4);
                views.setViewPadding(R.id.widget_btn_heart, pad4, pad4, pad4, pad4);
                int padBottom4x1 = Math.round(2f * density);
                views.setViewPadding(R.id.widget_btn_prev, 0, 0, 0, padBottom4x1);
                views.setViewPadding(R.id.widget_btn_next, 0, 0, 0, padBottom4x1);
            } else {
                // 4x2: all elements increased by 1
                // English: 23sp (+1 from 22sp), Translation is 1 less: 22sp
                views.setTextViewTextSize(R.id.widget_word_english, TypedValue.COMPLEX_UNIT_SP, 23f);
                views.setTextViewTextSize(R.id.widget_word_translation, TypedValue.COMPLEX_UNIT_SP, 22f);
                views.setTextViewTextSize(R.id.widget_fav_counter, TypedValue.COMPLEX_UNIT_SP, 15.5f);
                views.setTextViewTextSize(R.id.widget_rank_badge, TypedValue.COMPLEX_UNIT_SP, 14.5f);
                views.setTextViewTextSize(R.id.widget_btn_prev, TypedValue.COMPLEX_UNIT_SP, 31f);
                views.setTextViewTextSize(R.id.widget_btn_next, TypedValue.COMPLEX_UNIT_SP, 31f);
                int pad1 = Math.round(1f * density);
                views.setViewPadding(R.id.widget_btn_speaker, pad1, pad1, pad1, pad1);
                views.setViewPadding(R.id.widget_btn_heart, pad1, pad1, pad1, pad1);
                // Lift arrows higher in 4x2 to center in corner curvature
                int padBottom4x2 = Math.round(7f * density);
                views.setViewPadding(R.id.widget_btn_prev, 0, 0, 0, padBottom4x2);
                views.setViewPadding(R.id.widget_btn_next, 0, 0, 0, padBottom4x2);
            }

            // Heart Icon state
            views.setImageViewResource(
                R.id.widget_btn_heart,
                word.isFavorite ? R.drawable.ic_widget_heart_active : R.drawable.ic_widget_heart_inactive
            );

            // Favorite Counter: справа от динамика (показывается только в 4x2+ если есть фавориты)
            if (!isCompact1Row && WidgetDataManager.hasUserFavorites(context)) {
                int totalFavs = WidgetDataManager.getTotalFavoritesCount(context);
                int curFavIdx = WidgetDataManager.getCurrentFavoriteIndex(context);
                if (totalFavs > 0) {
                    views.setTextViewText(R.id.widget_fav_counter, curFavIdx + "/" + totalFavs);
                    views.setViewVisibility(R.id.widget_fav_counter, View.VISIBLE);
                } else {
                    views.setViewVisibility(R.id.widget_fav_counter, View.GONE);
                }
            } else {
                views.setViewVisibility(R.id.widget_fav_counter, View.GONE);
            }

            // Rank Badge: слева от сердечка (показывается только в 4x2+, максимум топ-100, без '#')
            if (!isCompact1Row) {
                int userRank = WidgetDataManager.getUserRank(context);
                if (userRank > 0 && userRank <= 100) {
                    views.setTextViewText(R.id.widget_rank_badge, "🏆 " + userRank);
                    views.setViewVisibility(R.id.widget_rank_badge, View.VISIBLE);
                } else if (userRank == 0) {
                    // Пока точный ранг не синхронизирован из приложения, показываем кубок 🏆
                    views.setTextViewText(R.id.widget_rank_badge, "🏆");
                    views.setViewVisibility(R.id.widget_rank_badge, View.VISIBLE);
                } else {
                    // Если место ниже 100 — скрываем
                    views.setViewVisibility(R.id.widget_rank_badge, View.GONE);
                }
            } else {
                views.setViewVisibility(R.id.widget_rank_badge, View.GONE);
            }

            // Reminder Alert Banner: "⚡ Не отставай от других!" или "Вас обошли соперники!"
            boolean isReminderAlert = WidgetDataManager.isReminderAlertActive(context);
            if (isReminderAlert) {
                String banner = WidgetDataManager.getAlertBannerText(context);
                views.setTextViewText(R.id.widget_reminder_banner, banner);
                views.setViewVisibility(R.id.widget_reminder_banner, View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.widget_reminder_banner, View.GONE);
            }

            int immutableFlag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0;

            // 1. ТОЛЬКО точное нажатие на рейтинг открывает программу в окне Рейтинг
            Intent leaderboardIntent = new Intent(context, MainActivity.class);
            leaderboardIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            leaderboardIntent.putExtra("open_tab", "leaderboard");
            PendingIntent leaderboardPi = PendingIntent.getActivity(context, 107, leaderboardIntent, PendingIntent.FLAG_UPDATE_CURRENT | immutableFlag);
            views.setOnClickPendingIntent(R.id.widget_rank_badge, leaderboardPi);

            // 2. Все остальные области карточки (фон, центр, баннеры, счетчик) переворачивают карточку и НЕ открывают приложение
            PendingIntent flipPi = getPendingIntent(context, ACTION_FLIP, 101);
            views.setOnClickPendingIntent(R.id.widget_root, flipPi);
            views.setOnClickPendingIntent(R.id.widget_center_click_area, flipPi);
            views.setOnClickPendingIntent(R.id.widget_word_english, flipPi);
            views.setOnClickPendingIntent(R.id.widget_word_translation, flipPi);
            views.setOnClickPendingIntent(R.id.widget_fav_counter, flipPi);
            views.setOnClickPendingIntent(R.id.widget_reminder_banner, flipPi);

            // 3. Интерактивные угловые кнопки
            views.setOnClickPendingIntent(R.id.widget_btn_prev, getPendingIntent(context, ACTION_PREV, 102));
            views.setOnClickPendingIntent(R.id.widget_btn_next, getPendingIntent(context, ACTION_NEXT, 103));
            views.setOnClickPendingIntent(R.id.widget_btn_speaker, getPendingIntent(context, ACTION_SPEAK, 104));
            views.setOnClickPendingIntent(R.id.widget_btn_heart, getPendingIntent(context, ACTION_TOGGLE_FAV, 105));

            appWidgetManager.updateAppWidget(appWidgetId, views);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static PendingIntent getPendingIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, GoldCardWidgetProvider.class);
        intent.setAction(action);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(context, requestCode, intent, flags);
    }

    public static void scheduleNextRotation(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            Intent intent = new Intent(context, GoldCardWidgetProvider.class);
            intent.setAction(ACTION_AUTO_ROTATE);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pi = PendingIntent.getBroadcast(context, 9001, intent, flags);

            long intervalMs = WidgetDataManager.getRotationIntervalMin(context) * 60 * 1000L;
            if (intervalMs < 15 * 60 * 1000L) {
                intervalMs = 15 * 60 * 1000L;
            }

            long triggerAt = SystemClock.elapsedRealtime() + intervalMs;
            am.setInexactRepeating(AlarmManager.ELAPSED_REALTIME, triggerAt, intervalMs, pi);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void cancelRotation(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            Intent intent = new Intent(context, GoldCardWidgetProvider.class);
            intent.setAction(ACTION_AUTO_ROTATE);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pi = PendingIntent.getBroadcast(context, 9001, intent, flags);
            am.cancel(pi);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
