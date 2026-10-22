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
    public static final String ACTION_TOGGLE_PLAY_PAUSE = "com.englishbreakfast.app.widget.ACTION_TOGGLE_PLAY_PAUSE";
    public static final String ACTION_PIN_SUCCESS = "com.englishbreakfast.app.widget.ACTION_PIN_SUCCESS";
    private static final java.util.concurrent.ExecutorService sSerialExecutor = java.util.concurrent.Executors.newSingleThreadExecutor();
    private static final android.os.Handler sSpeechHandler = new android.os.Handler(android.os.Looper.getMainLooper());
    private static volatile int sContinuousSessionId = 0;

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
        WidgetDataManager.onWidgetPinnedOrInteracted(context, appWidgetId, null);
        updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        super.onDeleted(context, appWidgetIds);
        WidgetDataManager.onWidgetsDeleted(context, appWidgetIds);
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        scheduleNextRotation(context);
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        try {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            ComponentName cn = new ComponentName(context, GoldCardWidgetProvider.class);
            WidgetDataManager.markPrePinGhostIds(context, manager.getAppWidgetIds(cn));
        } catch (Exception ignored) {}
        cancelRotation(context);
        stopContinuousPlay(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (intent == null || intent.getAction() == null) return;
        final String action = intent.getAction();

        // Security check for internal widget actions: reject if originating from a foreign package
        boolean isCustomWidgetAction = ACTION_FLIP.equals(action) || ACTION_NEXT.equals(action) || ACTION_PREV.equals(action)
                || ACTION_SPEAK.equals(action) || ACTION_TOGGLE_FAV.equals(action) || ACTION_AUTO_ROTATE.equals(action)
                || ACTION_TOGGLE_PLAY_PAUSE.equals(action) || ACTION_PIN_SUCCESS.equals(action);
        if (!isCustomWidgetAction) {
            return;
        }
        if (ACTION_PIN_SUCCESS.equals(action)) {
            int pinnedId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
            try {
                AppWidgetManager mgr = AppWidgetManager.getInstance(context);
                ComponentName cn = new ComponentName(context, GoldCardWidgetProvider.class);
                WidgetDataManager.onWidgetPinnedOrInteracted(context, pinnedId, mgr.getAppWidgetIds(cn));
            } catch (Exception ignored) {}
        }

        if (ACTION_FLIP.equals(action) || ACTION_NEXT.equals(action) || ACTION_PREV.equals(action)
                || ACTION_SPEAK.equals(action) || ACTION_TOGGLE_FAV.equals(action) || ACTION_AUTO_ROTATE.equals(action)
                || ACTION_TOGGLE_PLAY_PAUSE.equals(action) || ACTION_PIN_SUCCESS.equals(action)) {
            String pkg = intent.getPackage();
            if (pkg != null && !context.getPackageName().equals(pkg)) {
                return;
            }
            ComponentName comp = intent.getComponent();
            if (comp != null && !context.getPackageName().equals(comp.getPackageName())) {
                return;
            }
        }

        final PendingResult asyncResult = goAsync();
        final java.util.concurrent.atomic.AtomicBoolean finished = new java.util.concurrent.atomic.AtomicBoolean(false);
        final Runnable onDone = () -> {
            if (finished.compareAndSet(false, true)) {
                try {
                    asyncResult.finish();
                } catch (Exception ignored) {}
            }
        };
        // Watchdog timeout: release receiver after at most 6 seconds
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(onDone, 6000L);

        sSerialExecutor.execute(() -> {
            try {
                handleWidgetAction(context, action, onDone);
            } catch (Exception e) {
                onDone.run();
            }
        });
    }

    public static synchronized void startContinuousPlay(Context context) {
        if (context == null) return;
        sContinuousSessionId++;
        final int sessionId = sContinuousSessionId;
        WidgetDataManager.setContinuousPlayActive(context, true);
        updateAllWidgets(context);

        playNextContinuousWord(context.getApplicationContext(), sessionId);
    }

    public static synchronized void stopContinuousPlay(Context context) {
        if (context == null) return;
        sContinuousSessionId++;
        sSpeechHandler.removeCallbacksAndMessages(null);
        WidgetDataManager.setContinuousPlayActive(context, false);
        WidgetAudioPlayer.stopPlayback();
        updateAllWidgets(context);
    }

    private static void playNextContinuousWord(final Context context, final int sessionId) {
        sSerialExecutor.execute(() -> {
            if (sessionId != sContinuousSessionId || !WidgetDataManager.isContinuousPlayActive(context)) {
                return;
            }
            android.media.AudioManager am = (android.media.AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            if (am != null) {
                int mode = am.getMode();
                if (mode == android.media.AudioManager.MODE_IN_CALL || mode == android.media.AudioManager.MODE_IN_COMMUNICATION) {
                    stopContinuousPlay(context);
                    return;
                }
            }

            WidgetDataManager.WidgetWord curWord = WidgetDataManager.getCurrentWord(context);
            if (curWord == null || curWord.word.isEmpty() || "fav_empty".equals(curWord.id)) {
                stopContinuousPlay(context);
                return;
            }

            final java.util.concurrent.atomic.AtomicBoolean wordFinished = new java.util.concurrent.atomic.AtomicBoolean(false);
            final Runnable sessionWatchdog = () -> {
                if (sessionId == sContinuousSessionId && WidgetDataManager.isContinuousPlayActive(context)) {
                    if (wordFinished.compareAndSet(false, true)) {
                        sSerialExecutor.execute(() -> {
                            if (sessionId != sContinuousSessionId || !WidgetDataManager.isContinuousPlayActive(context)) {
                                return;
                            }
                            WidgetDataManager.nextWord(context);
                            updateAllWidgets(context);
                            playNextContinuousWord(context, sessionId);
                        });
                    }
                }
            };
            // 6.0s absolute safety ceiling per word - guarantees playback never hangs
            sSpeechHandler.postDelayed(sessionWatchdog, 6000L);

            WidgetAudioPlayer.playWord(context, curWord.word, () -> {
                sSpeechHandler.removeCallbacks(sessionWatchdog);
                if (wordFinished.compareAndSet(false, true)) {
                    // Speech finished -> wait 2 seconds pause, then change card and speak new word
                    sSpeechHandler.postDelayed(() -> {
                        sSerialExecutor.execute(() -> {
                            if (sessionId != sContinuousSessionId || !WidgetDataManager.isContinuousPlayActive(context)) {
                                return;
                            }
                            WidgetDataManager.nextWord(context);
                            updateAllWidgets(context);
                            playNextContinuousWord(context, sessionId);
                        });
                    }, 2000L);
                }
            });
        });
    }

    public static void handleWidgetAction(Context context, String action) {
        handleWidgetAction(context, action, null);
    }

    public static void handleWidgetAction(Context context, String action, final Runnable onAudioDone) {
        if (action == null) {
            if (onAudioDone != null) onAudioDone.run();
            return;
        }
        // Clear reminder alert and confirm widget active when user interacts with widget
        if (ACTION_FLIP.equals(action) || ACTION_NEXT.equals(action) || ACTION_PREV.equals(action)
                || ACTION_SPEAK.equals(action) || ACTION_TOGGLE_FAV.equals(action) || ACTION_TOGGLE_PLAY_PAUSE.equals(action)) {
            WidgetDataManager.setReminderAlertActive(context, false);
            try {
                AppWidgetManager mgr = AppWidgetManager.getInstance(context);
                ComponentName cn = new ComponentName(context, GoldCardWidgetProvider.class);
                WidgetDataManager.onWidgetPinnedOrInteracted(context, AppWidgetManager.INVALID_APPWIDGET_ID, mgr.getAppWidgetIds(cn));
            } catch (Exception ignored) {}
        }

        switch (action) {
            case ACTION_TOGGLE_PLAY_PAUSE:
                if (WidgetDataManager.isContinuousPlayActive(context)) {
                    stopContinuousPlay(context);
                } else {
                    startContinuousPlay(context);
                }
                if (onAudioDone != null) onAudioDone.run();
                break;

            case ACTION_FLIP:
                WidgetDataManager.toggleFlip(context);
                updateAllWidgets(context);
                if (onAudioDone != null) onAudioDone.run();
                break;

            case ACTION_NEXT:
                if (WidgetDataManager.isContinuousPlayActive(context)) {
                    stopContinuousPlay(context);
                }
                WidgetDataManager.nextWord(context);
                updateAllWidgets(context);
                {
                    WidgetDataManager.WidgetWord curWord = WidgetDataManager.getCurrentWord(context);
                    if (curWord != null && !curWord.word.isEmpty() && !"fav_empty".equals(curWord.id)) {
                        WidgetAudioPlayer.playWord(context, curWord.word, onAudioDone);
                    } else {
                        if (onAudioDone != null) onAudioDone.run();
                    }
                }
                break;

            case ACTION_PREV:
                if (WidgetDataManager.isContinuousPlayActive(context)) {
                    stopContinuousPlay(context);
                }
                WidgetDataManager.prevWord(context);
                updateAllWidgets(context);
                {
                    WidgetDataManager.WidgetWord curWord = WidgetDataManager.getCurrentWord(context);
                    if (curWord != null && !curWord.word.isEmpty() && !"fav_empty".equals(curWord.id)) {
                        WidgetAudioPlayer.playWord(context, curWord.word, onAudioDone);
                    } else {
                        if (onAudioDone != null) onAudioDone.run();
                    }
                }
                break;

            case ACTION_SPEAK:
                if (WidgetDataManager.isContinuousPlayActive(context)) {
                    stopContinuousPlay(context);
                }
                WidgetDataManager.WidgetWord curWord = WidgetDataManager.getCurrentWord(context);
                if (curWord != null && !curWord.word.isEmpty() && !"fav_empty".equals(curWord.id)) {
                    WidgetAudioPlayer.playWord(context, curWord.word, onAudioDone);
                } else {
                    if (onAudioDone != null) onAudioDone.run();
                }
                break;

            case ACTION_TOGGLE_FAV:
                WidgetDataManager.toggleFavorite(context);
                if (WidgetDataManager.isSoundFlipEnabled(context)) {
                    WidgetAudioPlayer.playPageTurn(context);
                }
                updateAllWidgets(context);
                if (onAudioDone != null) onAudioDone.run();
                break;

            case ACTION_AUTO_ROTATE:
                if (!hasActiveWidgets(context)) {
                    cancelRotation(context);
                    if (onAudioDone != null) onAudioDone.run();
                    return;
                }
                if (WidgetDataManager.isContinuousPlayActive(context)) {
                    // Continuous active speech is currently running and driving card progression.
                    // Reschedule next rotation without interrupting active speech.
                    scheduleNextRotation(context);
                    if (onAudioDone != null) onAudioDone.run();
                    return;
                }
                WidgetDataManager.nextWord(context);
                updateAllWidgets(context);
                scheduleNextRotation(context);
                if (WidgetDataManager.isAutoSpeakEnabled(context)) {
                    // Suppress auto-speech if app in foreground, outside quiet hours, or system audio is busy (calls, video, games, silent mode)
                    if (!WidgetDataManager.isAppInForeground() 
                            && WidgetDataManager.isWithinSpeakHours(context)
                            && !WidgetAudioPlayer.isSystemAudioBusy(context)) {
                        WidgetDataManager.WidgetWord w = WidgetDataManager.getCurrentWord(context);
                        if (w != null && !w.word.isEmpty() && !"fav_empty".equals(w.id)) {
                            WidgetAudioPlayer.playWord(context, w.word, onAudioDone);
                            break;
                        }
                    }
                }
                if (onAudioDone != null) onAudioDone.run();
                break;

            case ACTION_PIN_SUCCESS:
                updateAllWidgets(context);
                scheduleNextRotation(context);
                if (onAudioDone != null) onAudioDone.run();
                break;

            default:
                if (onAudioDone != null) onAudioDone.run();
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
                // English: 20sp, Translation reduced by 1: 18sp
                views.setTextViewTextSize(R.id.widget_word_english, TypedValue.COMPLEX_UNIT_SP, 20f);
                views.setTextViewTextSize(R.id.widget_word_translation, TypedValue.COMPLEX_UNIT_SP, 18f);
                views.setTextViewTextSize(R.id.widget_btn_prev, TypedValue.COMPLEX_UNIT_SP, 28f);
                views.setTextViewTextSize(R.id.widget_btn_next, TypedValue.COMPLEX_UNIT_SP, 28f);
                int padBottom4x1 = Math.round(2f * density);
                views.setViewPadding(R.id.widget_btn_prev, 0, 0, 0, padBottom4x1);
                views.setViewPadding(R.id.widget_btn_next, 0, 0, 0, padBottom4x1);

                // 4x1: ONLY arrows remain visible (hide speaker, heart, play/pause, counter, rank)
                views.setViewVisibility(R.id.widget_btn_speaker, View.GONE);
                views.setViewVisibility(R.id.widget_btn_heart, View.GONE);
                views.setViewVisibility(R.id.widget_btn_play_pause, View.GONE);
                views.setViewVisibility(R.id.widget_fav_counter, View.GONE);
                views.setViewVisibility(R.id.widget_rank_badge, View.GONE);
            } else {
                // 4x2: all elements balanced
                // English: 23sp (+1 from 22sp), Translation is 1 less: 22sp
                views.setTextViewTextSize(R.id.widget_word_english, TypedValue.COMPLEX_UNIT_SP, 23f);
                views.setTextViewTextSize(R.id.widget_word_translation, TypedValue.COMPLEX_UNIT_SP, 22f);
                views.setTextViewTextSize(R.id.widget_fav_counter, TypedValue.COMPLEX_UNIT_SP, 15f);
                views.setTextViewTextSize(R.id.widget_rank_badge, TypedValue.COMPLEX_UNIT_SP, 14f);
                views.setTextViewTextSize(R.id.widget_btn_prev, TypedValue.COMPLEX_UNIT_SP, 31f);
                views.setTextViewTextSize(R.id.widget_btn_next, TypedValue.COMPLEX_UNIT_SP, 31f);

                // Make speaker, heart, and play/pause smaller and balanced (matching earlier compact look)
                int padIcon = Math.round(10f * density);
                views.setViewPadding(R.id.widget_btn_speaker, padIcon, padIcon, padIcon, padIcon);
                views.setViewPadding(R.id.widget_btn_heart, padIcon, padIcon, padIcon, padIcon);
                views.setViewPadding(R.id.widget_btn_play_pause, padIcon, padIcon, padIcon, padIcon);

                // Lift arrows higher in 4x2 to center in corner curvature
                int padBottom4x2 = Math.round(7f * density);
                views.setViewPadding(R.id.widget_btn_prev, 0, 0, 0, padBottom4x2);
                views.setViewPadding(R.id.widget_btn_next, 0, 0, 0, padBottom4x2);
            }

            boolean isFavEmpty = "fav_empty".equals(word.id);

            // Heart Icon state: hide in 4x1 and for fallback/starter words
            if (isCompact1Row || word.isFallback) {
                views.setViewVisibility(R.id.widget_btn_heart, View.GONE);
            } else {
                views.setViewVisibility(R.id.widget_btn_heart, View.VISIBLE);
                views.setImageViewResource(
                    R.id.widget_btn_heart,
                    word.isFavorite ? R.drawable.ic_widget_heart_active : R.drawable.ic_widget_heart_inactive
                );
            }

            // Favorite Counter: справа от динамика (показывается только в 4x2+ если есть реальные фавориты)
            if (!isCompact1Row && WidgetDataManager.hasUserFavorites(context) && !isFavEmpty) {
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

            // Speaker button: hide in 4x1 or on empty favorites card
            if (isCompact1Row || isFavEmpty) {
                views.setViewVisibility(R.id.widget_btn_speaker, View.GONE);
            } else {
                views.setViewVisibility(R.id.widget_btn_speaker, View.VISIBLE);
            }

            // Play/Pause button: hide in 4x1 or on empty favorites card
            if (isCompact1Row || isFavEmpty) {
                views.setViewVisibility(R.id.widget_btn_play_pause, View.GONE);
            } else {
                views.setViewVisibility(R.id.widget_btn_play_pause, View.VISIBLE);
                boolean isPlaying = WidgetDataManager.isContinuousPlayActive(context);
                boolean isDark = "dark_glass".equalsIgnoreCase(theme);
                int iconRes;
                if (isPlaying) {
                    iconRes = isDark ? R.drawable.ic_widget_pause_light : R.drawable.ic_widget_pause;
                } else {
                    iconRes = isDark ? R.drawable.ic_widget_play_light : R.drawable.ic_widget_play;
                }
                views.setImageViewResource(R.id.widget_btn_play_pause, iconRes);
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

            // 3. Интерактивные кнопки
            views.setOnClickPendingIntent(R.id.widget_btn_prev, getPendingIntent(context, ACTION_PREV, 102));
            views.setOnClickPendingIntent(R.id.widget_btn_next, getPendingIntent(context, ACTION_NEXT, 103));
            views.setOnClickPendingIntent(R.id.widget_btn_speaker, getPendingIntent(context, ACTION_SPEAK, 104));
            views.setOnClickPendingIntent(R.id.widget_btn_heart, getPendingIntent(context, ACTION_TOGGLE_FAV, 105));
            views.setOnClickPendingIntent(R.id.widget_btn_play_pause, getPendingIntent(context, ACTION_TOGGLE_PLAY_PAUSE, 106));

            appWidgetManager.updateAppWidget(appWidgetId, views);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static PendingIntent getPendingIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, GoldCardWidgetProvider.class);
        intent.setAction(action);
        intent.setPackage(context.getPackageName());
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(context, requestCode, intent, flags);
    }

    public static boolean hasActiveWidgets(Context context) {
        if (context == null) return false;
        try {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            ComponentName cn = new ComponentName(context, GoldCardWidgetProvider.class);
            int[] allIds = manager.getAppWidgetIds(cn);
            return WidgetDataManager.hasRealInstalledWidgets(context, allIds);
        } catch (Exception e) {
            return false;
        }
    }

    public static void scheduleNextRotation(Context context) {
        if (context == null) return;
        if (!hasActiveWidgets(context)) {
            cancelRotation(context);
            return;
        }
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            Intent intent = new Intent(context, GoldCardWidgetProvider.class);
            intent.setAction(ACTION_AUTO_ROTATE);
            intent.setPackage(context.getPackageName());

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
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME, triggerAt, pi);
            } else {
                am.set(AlarmManager.ELAPSED_REALTIME, triggerAt, pi);
            }
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
            intent.setPackage(context.getPackageName());

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
