package com.englishbreakfast.app;

import android.graphics.Color;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // Dynamically synchronize native window & WebView background with current user theme (light, dark, or notebook)
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new Object() {
                @android.webkit.JavascriptInterface
                public void setWindowThemeColor(final String hexColor) {
                    runOnUiThread(() -> {
                        try {
                            int color = Color.parseColor(hexColor);
                            getWindow().getDecorView().setBackgroundColor(color);
                            if (getBridge() != null && getBridge().getWebView() != null) {
                                getBridge().getWebView().setBackgroundColor(color);
                            }
                        } catch (Exception e) {}
                    });
                }
            }, "AndroidThemeBridge");
        }
    }
}
