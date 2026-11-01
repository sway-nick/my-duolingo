package com.englishbreakfast.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;

/**
 * Activity for configuring the English Breakfast home screen widget.
 * Safely acknowledges configuration success so the launcher preserves the widget.
 */
public class WidgetConfigActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
        Intent intent = getIntent();
        Bundle extras = intent != null ? intent.getExtras() : null;
        if (extras != null) {
            appWidgetId = extras.getInt(
                AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID
            );
        }

        // Initialize and update the RemoteViews for the launcher
        if (appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(this);
            GoldCardWidgetProvider.updateAppWidget(this, appWidgetManager, appWidgetId);
        }
        GoldCardWidgetProvider.updateAllWidgets(this);

        // Acknowledge configuration success immediately so launcher preserves the widget
        Intent resultValue = new Intent();
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, resultValue);

        finish();
    }
}
