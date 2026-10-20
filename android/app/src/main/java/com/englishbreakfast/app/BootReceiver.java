package com.englishbreakfast.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) return;
        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action)) {
            try {
                // Cancel orphaned legacy repeating alarm (without setPackage) from previous build
                if (Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {
                    try {
                        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                        if (am != null) {
                            Intent legacyIntent = new Intent(context, GoldCardWidgetProvider.class);
                            legacyIntent.setAction(GoldCardWidgetProvider.ACTION_AUTO_ROTATE);
                            int flags = PendingIntent.FLAG_NO_CREATE;
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                flags |= PendingIntent.FLAG_IMMUTABLE;
                            }
                            PendingIntent legacyPi = PendingIntent.getBroadcast(context, 9001, legacyIntent, flags);
                            if (legacyPi != null) {
                                am.cancel(legacyPi);
                                legacyPi.cancel();
                            }
                        }
                    } catch (Exception ignored) {}
                }

                StudyReminderManager.scheduleReminder(context);
                GoldCardWidgetProvider.scheduleNextRotation(context);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
