package com.englishbreakfast.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class StudyReminderReceiver extends BroadcastReceiver {

    public static final String CHANNEL_ID = "english_breakfast_study_reminder";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null) return;
        try {
            if (!WidgetDataManager.isReminderEnabled(context)) return;

            // 1. Activate motivation text on home screen widget: "⚡ Не отставай от других!"
            WidgetDataManager.setAlertBannerText(context, context.getString(R.string.widget_reminder_default_alert));
            WidgetDataManager.setReminderAlertActive(context, true);
            GoldCardWidgetProvider.updateAllWidgets(context);

            // 2. Post system heads-up notification (silent, sound is reserved exclusively for being overtaken in leaderboard)
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        "Напоминания о занятиях",
                        NotificationManager.IMPORTANCE_DEFAULT
                    );
                    channel.setDescription("Ежедневные напоминания повторить слова в English Breakfast");
                    channel.setSound(null, null);
                    nm.createNotificationChannel(channel);
                }

                Intent launchIntent = new Intent(context, MainActivity.class);
                launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                PendingIntent pi = PendingIntent.getActivity(context, 7001, launchIntent, flags);

                WidgetDataManager.WidgetWord word = WidgetDataManager.getCurrentWord(context);
                String title = "Время для English Breakfast!";
                String text = (word != null && !word.word.isEmpty())
                    ? "Не отставай от других! Слово дня: " + word.word + " (" + word.translation + ")"
                    : "Не отставай от других! Зайдите повторить слова и удержать место в рейтинге!";

                NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle(title)
                    .setContentText(text)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setSound(null)
                    .setAutoCancel(true)
                    .setContentIntent(pi);

                nm.notify(1001, builder.build());
            }

            // 4. Reschedule for tomorrow
            StudyReminderManager.scheduleReminder(context);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
