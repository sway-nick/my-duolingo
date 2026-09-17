package com.englishbreakfast.app;

import android.content.res.Resources;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private float statusBarHeightDp = 0f;
    private float navigationBarHeightDp = 0f;
    private long lastBackPressTime = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Enable modern edge-to-edge drawing so status bar and navigation bar are colored with main theme background
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        int initialBg = Color.parseColor("#0f172a");
        getWindow().setStatusBarColor(initialBg);
        getWindow().setNavigationBarColor(initialBg);

        // 2. Measure status bar & navigation bar heights in dp
        measureDimensions();

        // 3. Listen to system window insets (status bars & navigation bars)
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            Insets statusBarInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars());
            if (statusBarInsets.top > 0) {
                float density = getResources().getDisplayMetrics().density;
                statusBarHeightDp = statusBarInsets.top / density;
                injectSafeTopToWebView();
            }
            Insets navBarInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
            if (navBarInsets.bottom >= 0) {
                float density = getResources().getDisplayMetrics().density;
                navigationBarHeightDp = navBarInsets.bottom / density;
                injectSafeBottomToWebView();
            }
            return insets;
        });

        setupThemeBridge();
        setupBackNavigation();
    }

    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().evaluateJavascript(
                        "(function() { if (typeof window.handleAndroidBackButton === 'function') { return window.handleAndroidBackButton(); } return false; })()",
                        result -> {
                            boolean handled = "true".equalsIgnoreCase(result) || "\"true\"".equalsIgnoreCase(result);
                            if (!handled) {
                                if (bridge.getWebView().canGoBack()) {
                                    bridge.getWebView().goBack();
                                    return;
                                }
                                long now = System.currentTimeMillis();
                                if (now - lastBackPressTime < 2000) {
                                    finish();
                                } else {
                                    lastBackPressTime = now;
                                    Toast.makeText(MainActivity.this, "Нажмите «Назад» еще раз, чтобы выйти", Toast.LENGTH_SHORT).show();
                                }
                            }
                        }
                    );
                } else {
                    finish();
                }
            }
        });
    }

    private void measureDimensions() {
        measureStatusBarHeight();
        measureNavigationBarHeight();
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

    private void measureNavigationBarHeight() {
        try {
            Resources resources = getResources();
            int resourceId = resources.getIdentifier("navigation_bar_height", "dimen", "android");
            if (resourceId > 0) {
                int px = resources.getDimensionPixelSize(resourceId);
                float density = resources.getDisplayMetrics().density;
                navigationBarHeightDp = px / density;
            }
        } catch (Exception e) {
            navigationBarHeightDp = 0f;
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        injectSafeTopToWebView();
        injectSafeBottomToWebView();
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

    private void injectSafeBottomToWebView() {
        if (bridge != null && bridge.getWebView() != null) {
            final float dp = navigationBarHeightDp >= 0 ? navigationBarHeightDp : 0f;
            bridge.getWebView().post(() -> {
                bridge.getWebView().evaluateJavascript(
                    "document.documentElement.style.setProperty('--safe-bottom', '" + dp + "px');", null);
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
                                boolean isNotebook = themeOrColor.equalsIgnoreCase("notebook") || 
                                                     themeOrColor.equalsIgnoreCase("#f5eedc");
                                WindowInsetsControllerCompat controller = 
                                    WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
                                if (controller != null) {
                                    // For light/notebook theme -> dark status & navigation bar icons (black time/battery/gesture line)
                                    // For dark theme -> light status & navigation bar icons (white time/battery/gesture line)
                                    controller.setAppearanceLightStatusBars(!isDark);
                                    controller.setAppearanceLightNavigationBars(!isDark);
                                }
                                int bgThemeColor = isDark ? Color.parseColor("#0f172a") : 
                                                   (isNotebook ? Color.parseColor("#f5eedc") : Color.parseColor("#f8fafc"));
                                getWindow().setStatusBarColor(bgThemeColor);
                                getWindow().setNavigationBarColor(bgThemeColor);
                            } catch (Exception e) {}
                        });
                    }

                    @JavascriptInterface
                    public float getStatusBarHeightDp() {
                        return statusBarHeightDp > 0 ? statusBarHeightDp : 28f;
                    }

                    @JavascriptInterface
                    public float getNavigationBarHeightDp() {
                        return navigationBarHeightDp >= 0 ? navigationBarHeightDp : 0f;
                    }
                }, "AndroidThemeBridge");
            }
        } catch (Exception e) {}
    }
}
