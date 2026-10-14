package com.englishbreakfast.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;

/**
 * Activity for configuring the English Breakfast home screen widget.
 * Enables the "Настроить виджет" / "Настроить" option in the launcher's
 * long-press context menu on Android (including MIUI / HyperOS).
 */
public class WidgetConfigActivity extends Activity {

    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Default to CANCELED in case user backs out
        setResult(RESULT_CANCELED);

        Intent intent = getIntent();
        Bundle extras = intent != null ? intent.getExtras() : null;
        if (extras != null) {
            appWidgetId = extras.getInt(
                AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID
            );
        }

        // Launch MainActivity and command it to open the Widget Settings bottom sheet
        Intent mainIntent = new Intent(this, MainActivity.class);
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        mainIntent.putExtra("open_widget_config", true);
        if (appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
            mainIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        }
        startActivity(mainIntent);

        // Initialize the RemoteViews for the launcher
        if (appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(this);
            GoldCardWidgetProvider.updateAppWidget(this, appWidgetManager, appWidgetId);
        }
        GoldCardWidgetProvider.updateAllWidgets(this);

        // Acknowledge configuration success so launcher preserves the widget
        Intent resultValue = new Intent();
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, resultValue);

        finish();
    }
}
