package com.englishbreakfast.app;

import android.content.res.Resources;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private float statusBarHeightDp = 0f;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Enable modern edge-to-edge drawing so status bar area is seamlessly colored by webview header
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);

        // 2. Measure status bar height in dp
        measureStatusBarHeight();

        // 3. Listen to system window insets
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            Insets statusBarInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars());
            if (statusBarInsets.top > 0) {
                float density = getResources().getDisplayMetrics().density;
                statusBarHeightDp = statusBarInsets.top / density;
                injectSafeTopToWebView();
            }
            return insets;
        });

        setupThemeBridge();
    }

    private void measureStatusBarHeight() {
        try {
            Resources resources = getResources();
            int resourceId = resources.getIdentifier("status_bar_height", "dimen", "android");
            if (resourceId > 0) {
                int px = resources.getDimensionPixelSize(resourceId);
                float density = resources.getDisplayMetrics().density;
                statusBarHeightDp = px / density;
            }
        } catch (Exception e) {
            statusBarHeightDp = 28f;
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        injectSafeTopToWebView();
    }

    private void injectSafeTopToWebView() {
        if (statusBarHeightDp <= 0) measureStatusBarHeight();
        if (bridge != null && bridge.getWebView() != null) {
            final float dp = statusBarHeightDp > 0 ? statusBarHeightDp : 28f;
            bridge.getWebView().post(() -> {
                bridge.getWebView().evaluateJavascript(
                    "document.documentElement.style.setProperty('--safe-top', '" + dp + "px');", null);
            });
        }
    }

    private void setupThemeBridge() {
        try {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public void setWindowThemeColor(final String themeOrColor) {
                        runOnUiThread(() -> {
                            try {
                                boolean isDark = themeOrColor.equalsIgnoreCase("dark") || 
                                                 themeOrColor.equalsIgnoreCase("#0f172a") || 
                                                 themeOrColor.equalsIgnoreCase("#1e293b");
                                WindowInsetsControllerCompat controller = 
                                    WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
                                if (controller != null) {
                                    // For light/notebook theme -> dark status bar icons (black time/battery)
                                    // For dark theme -> light status bar icons (white time/battery)
                                    controller.setAppearanceLightStatusBars(!isDark);
                                }
                                getWindow().setStatusBarColor(Color.TRANSPARENT);
                            } catch (Exception e) {}
                        });
                    }

                    @JavascriptInterface
                    public float getStatusBarHeightDp() {
                        return statusBarHeightDp > 0 ? statusBarHeightDp : 28f;
                    }
                }, "AndroidThemeBridge");
            }
        } catch (Exception e) {}
    }
}
