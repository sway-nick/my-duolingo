package com.englishbreakfast.app;

import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {

    private float statusBarHeightDp = 0f;
    private float navigationBarHeightDp = 0f;
    private long lastBackPressTime = 0;
    private GoogleSignInClient googleSignInClient;
    private ActivityResultLauncher<Intent> googleSignInLauncher;

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
        setupGoogleAuthBridge();
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

    private void setupGoogleAuthBridge() {
        try {
            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken("249517100642-ma0f00l78ku4r4n5jghnt9q8tmhga6sf.apps.googleusercontent.com")
                .requestEmail()
                .build();
            googleSignInClient = GoogleSignIn.getClient(this, gso);

            googleSignInLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    Intent data = result.getData();
                    Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
                    handleGoogleSignInResult(task);
                }
            );

            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public boolean isAvailable() {
                        return true;
                    }

                    @JavascriptInterface
                    public void signInWithGoogle() {
                        runOnUiThread(() -> {
                            try {
                                if (googleSignInClient != null && googleSignInLauncher != null) {
                                    googleSignInClient.signOut().addOnCompleteListener(task -> {
                                        Intent signInIntent = googleSignInClient.getSignInIntent();
                                        googleSignInLauncher.launch(signInIntent);
                                    });
                                } else {
                                    notifyJsGoogleAuthError("Сервис Google Sign-In не инициализирован");
                                }
                            } catch (Exception e) {
                                notifyJsGoogleAuthError("Не удалось запустить Google Sign-In: " + e.getMessage());
                            }
                        });
                    }

                    @JavascriptInterface
                    public void signOutGoogle() {
                        runOnUiThread(() -> {
                            try {
                                if (googleSignInClient != null) {
                                    googleSignInClient.signOut();
                                }
                            } catch (Exception ignored) {}
                        });
                    }
                }, "AndroidAuthBridge");
            }
        } catch (Exception e) {}
    }

    private void handleGoogleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
            if (account != null) {
                String idToken = account.getIdToken() != null ? account.getIdToken() : "";
                String email = account.getEmail() != null ? account.getEmail() : "";
                String displayName = account.getDisplayName() != null ? account.getDisplayName() : "";
                String photoUrl = account.getPhotoUrl() != null ? account.getPhotoUrl().toString() : "";
                String id = account.getId() != null ? account.getId() : "";

                JSONObject json = new JSONObject();
                json.put("id", id);
                json.put("email", email);
                json.put("name", displayName);
                json.put("photoUrl", photoUrl);
                json.put("idToken", idToken);

                notifyJsGoogleAuthSuccess(json.toString());
            } else {
                notifyJsGoogleAuthError("Не удалось получить профиль Google");
            }
        } catch (ApiException e) {
            int statusCode = e.getStatusCode();
            if (statusCode == 12501 || statusCode == 12502) {
                notifyJsGoogleAuthCancelled();
                return;
            }
            String errorMsg;
            if (statusCode == 10) {
                errorMsg = "Ошибка конфигурации Google Sign-In (Код 10). Требуется добавить SHA-1 ключ в Firebase Console.";
            } else if (statusCode == 7) {
                errorMsg = "Ошибка сети при подключении к Google. Проверьте интернет-соединение.";
            } else {
                errorMsg = "Ошибка Google Sign-In (код " + statusCode + "): " + e.getMessage();
            }
            notifyJsGoogleAuthError(errorMsg);
        } catch (Exception e) {
            notifyJsGoogleAuthError("Ошибка авторизации: " + e.getMessage());
        }
    }

    private void notifyJsGoogleAuthSuccess(String jsonStr) {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().post(() -> {
                bridge.getWebView().evaluateJavascript(
                    "(function() { if (typeof window.onNativeGoogleSignInSuccess === 'function') { window.onNativeGoogleSignInSuccess(" + jsonStr + "); } })()", null);
            });
        }
    }

    private void notifyJsGoogleAuthCancelled() {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().post(() -> {
                bridge.getWebView().evaluateJavascript(
                    "(function() { if (typeof window.onNativeGoogleSignInCancelled === 'function') { window.onNativeGoogleSignInCancelled(); } })()", null);
            });
        }
    }

    private void notifyJsGoogleAuthError(String errorMsg) {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().post(() -> {
                JSONObject obj = new JSONObject();
                try { obj.put("error", errorMsg); } catch (Exception ignored) {}
                bridge.getWebView().evaluateJavascript(
                    "(function() { if (typeof window.onNativeGoogleSignInFailure === 'function') { window.onNativeGoogleSignInFailure(" + obj.toString() + "); } })()", null);
            });
        }
    }
}
