package com.englishbreakfast.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

public class BackgroundAudioService extends Service {

    public static final String ACTION_START = "com.englishbreakfast.app.action.START";
    public static final String ACTION_UPDATE = "com.englishbreakfast.app.action.UPDATE";
    public static final String ACTION_STOP = "com.englishbreakfast.app.action.STOP";
    public static final String ACTION_TOGGLE = "com.englishbreakfast.app.action.TOGGLE";
    public static final String ACTION_NEXT = "com.englishbreakfast.app.action.NEXT";

    public static final String EXTRA_WORD = "extra_word";
    public static final String EXTRA_TRANSLATION = "extra_translation";
    public static final String EXTRA_PLAYING = "extra_playing";

    private static final String CHANNEL_ID = "channel_englishbreakfast_audio_v2";
    private static final int NOTIFICATION_ID = 2001;

    private static volatile boolean running = false;

    public interface PlaybackActionListener {
        void onTogglePlay();
        void onNextWord();
    }

    private static PlaybackActionListener actionListener;

    public static void setActionListener(PlaybackActionListener listener) {
        actionListener = listener;
    }

    public static boolean isRunning() {
        return running;
    }

    private PowerManager.WakeLock wakeLock;
    private String currentWord = "";
    private String currentTranslation = "";
    private boolean isPlaying = true;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "EnglishBreakfast:AudioWakeLock");
            wakeLock.setReferenceCounted(false);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        if (action == null) action = ACTION_START;

        switch (action) {
            case ACTION_START:
                running = true;
                currentWord = intent.getStringExtra(EXTRA_WORD);
                currentTranslation = intent.getStringExtra(EXTRA_TRANSLATION);
                isPlaying = intent.getBooleanExtra(EXTRA_PLAYING, true);
                acquireWakeLock();
                startForegroundWithNotification();
                break;

            case ACTION_UPDATE:
                if (intent.hasExtra(EXTRA_WORD)) {
                    currentWord = intent.getStringExtra(EXTRA_WORD);
                }
                if (intent.hasExtra(EXTRA_TRANSLATION)) {
                    currentTranslation = intent.getStringExtra(EXTRA_TRANSLATION);
                }
                if (intent.hasExtra(EXTRA_PLAYING)) {
                    isPlaying = intent.getBooleanExtra(EXTRA_PLAYING, true);
                }
                updateNotificationContent();
                break;

            case ACTION_TOGGLE:
                if (actionListener != null) {
                    actionListener.onTogglePlay();
                }
                break;

            case ACTION_NEXT:
                if (actionListener != null) {
                    actionListener.onNextWord();
                }
                break;

            case ACTION_STOP:
                running = false;
                releaseWakeLock();
                stopForeground(true);
                stopSelf();
                break;
        }

        return START_NOT_STICKY;
    }

    private void acquireWakeLock() {
        try {
            if (wakeLock != null && !wakeLock.isHeld()) {
                // Hold wake lock for up to 4 hours safety window
                wakeLock.acquire(4 * 60 * 60 * 1000L);
            }
        } catch (Exception ignored) {}
    }

    private void releaseWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Exception ignored) {}
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                try {
                    manager.deleteNotificationChannel("channel_englishbreakfast_audio");
                } catch (Exception ignored) {}
            }

            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Аудиоплеер Избранного",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Фоновое воспроизведение слов на экране блокировки");
            channel.setShowBadge(true);
            channel.setSound(null, null);
            channel.enableVibration(false);
            channel.enableLights(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildNotification() {
        Intent contentIntent = new Intent(this, MainActivity.class);
        contentIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingContentIntent = PendingIntent.getActivity(this, 0, contentIntent, pendingFlags);

        // Toggle action (Play / Pause)
        Intent toggleIntent = new Intent(this, BackgroundAudioService.class);
        toggleIntent.setAction(ACTION_TOGGLE);
        PendingIntent pendingToggleIntent = PendingIntent.getService(this, 1, toggleIntent, pendingFlags);

        // Next word action
        Intent nextIntent = new Intent(this, BackgroundAudioService.class);
        nextIntent.setAction(ACTION_NEXT);
        PendingIntent pendingNextIntent = PendingIntent.getService(this, 2, nextIntent, pendingFlags);

        String title = (currentWord != null && !currentWord.trim().isEmpty()) ? currentWord.trim() : "English Breakfast";
        String text = (currentTranslation != null && !currentTranslation.trim().isEmpty()) ? currentTranslation.trim() : "Избранное • Фоновое аудио";

        int toggleIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String toggleLabel = isPlaying ? "Пауза" : "Пуск";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(text)
            .setSubText("English Breakfast")
            .setContentIntent(pendingContentIntent)
            .setOngoing(isPlaying)
            .setOnlyAlertOnce(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setStyle(new MediaStyle()
                .setShowActionsInCompactView(0, 1))
            .addAction(toggleIcon, toggleLabel, pendingToggleIntent)
            .addAction(android.R.drawable.ic_media_next, "Следующее", pendingNextIntent);

        return builder.build();
    }

    private void startForegroundWithNotification() {
        Notification notification = buildNotification();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception e) {
            try {
                startForeground(NOTIFICATION_ID, notification);
            } catch (Exception ignored) {}
        }
    }

    private void updateNotificationContent() {
        if (!running) return;
        Notification notification = buildNotification();
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, notification);
        }
    }

    @Override
    public void onDestroy() {
        running = false;
        releaseWakeLock();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
