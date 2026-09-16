package com.englishbreakfast.app;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        setupThemeBridge();
    }

    @Override
    public void onStart() {
        super.onStart();
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        setupThemeBridge();
    }

    private void setupThemeBridge() {
        try {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public void setWindowThemeColor(final String colorHex) {
                        runOnUiThread(() -> {
                            try {
                                int color = Color.parseColor(colorHex);
                                getWindow().setStatusBarColor(color);
                                boolean isDark = colorHex.equalsIgnoreCase("#0f172a") || isColorDark(color);
                                WindowInsetsControllerCompat controller = 
                                    WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
                                if (controller != null) {
                                    controller.setAppearanceLightStatusBars(!isDark);
                                }
                            } catch (Exception e) {}
                        });
                    }

                    private boolean isColorDark(int color) {
                        double darkness = 1 - (0.299 * Color.red(color) + 
                                               0.587 * Color.green(color) + 
                                               0.114 * Color.blue(color)) / 255;
                        return darkness >= 0.5;
                    }
                }, "AndroidThemeBridge");
            }
        } catch (Exception e) {}
    }
}
