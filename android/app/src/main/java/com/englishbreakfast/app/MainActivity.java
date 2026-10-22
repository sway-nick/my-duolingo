package com.englishbreakfast.app;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.graphics.Color;
import android.os.Build;
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
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import java.util.Locale;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import org.json.JSONObject;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.media.Ringtone;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import androidx.core.app.NotificationCompat;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.net.Uri;
import android.provider.Settings;
import android.webkit.WebView;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {

    private float statusBarHeightDp = 0f;
    private float navigationBarHeightDp = 0f;
    private long lastBackPressTime = 0;
    private GoogleSignInClient googleSignInClient;
    private ActivityResultLauncher<Intent> googleSignInLauncher;
    private TextToSpeech tts;
    private boolean ttsInitialized = false;
    private volatile boolean isPageOriginTrusted = true;

    private void updateTrustedOriginState(String url) {
        if (url == null || url.trim().isEmpty() || "about:blank".equalsIgnoreCase(url)) {
            return;
        }
        try {
            Uri uri = Uri.parse(url);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            if (host == null || scheme == null) {
                isPageOriginTrusted = false;
                return;
            }
            boolean hostOk = "localhost".equalsIgnoreCase(host);
            boolean schemeOk = "https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme) || "capacitor".equalsIgnoreCase(scheme);
            isPageOriginTrusted = hostOk && schemeOk;
        } catch (Exception e) {
            isPageOriginTrusted = false;
        }
    }

    private void updateTrustedOriginState(WebView view) {
        if (view == null) {
            isPageOriginTrusted = false;
            return;
        }
        updateTrustedOriginState(view.getUrl());
    }

    private boolean isTrustedOrigin() {
        return isPageOriginTrusted;
    }

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
        setupAudioBridge();
        setupWidgetBridge();
        initNativeTts();
        lockWebViewTextZoom();

        if (bridge != null) {
            bridge.addWebViewListener(new WebViewListener() {
                @Override
                public void onPageStarted(WebView webView) {
                    updateTrustedOriginState(webView);
                }

                @Override
                public void onPageLoaded(WebView webView) {
                    updateTrustedOriginState(webView);
                }

                @Override
                public void onPageCommitVisible(WebView webView, String url) {
                    updateTrustedOriginState(url);
                }
            });
            if (bridge.getWebView() != null) {
                updateTrustedOriginState(bridge.getWebView());
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        StudyReminderManager.scheduleReminder(this);
        handleWidgetConfigIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleWidgetConfigIntent(intent);
    }

    private void runJsWhenReady(final String jsCheckAndExecute, final int maxAttempts) {
        if (bridge == null || bridge.getWebView() == null) return;
        final android.os.Handler handler = new android.os.Handler(android.os.Looper.getMainLooper());
        Runnable runnable = new Runnable() {
            int attempts = 0;
            @Override
            public void run() {
                if (isFinishing() || isDestroyed() || bridge == null || bridge.getWebView() == null) return;
                attempts++;
                bridge.getWebView().evaluateJavascript(jsCheckAndExecute, result -> {
                    boolean handled = "true".equalsIgnoreCase(result) || "\"true\"".equalsIgnoreCase(result);
                    if (!handled && attempts < maxAttempts) {
                        handler.postDelayed(this, 300);
                    }
                });
            }
        };
        handler.postDelayed(runnable, 200);
    }

    private void handleWidgetConfigIntent(Intent intent) {
        if (intent == null) return;
        if (intent.getBooleanExtra("open_widget_config", false)) {
            runJsWhenReady(
                "(function() { if (typeof window.openWidgetConfigBottomSheet === 'function') { window.openWidgetConfigBottomSheet(); return true; } return false; })()",
                25
            );
        }
        String openTab = intent.getStringExtra("open_tab");
        if ("leaderboard".equalsIgnoreCase(openTab)) {
            runJsWhenReady(
                "(function() { if (typeof window.setActiveTab === 'function') { window.setActiveTab('leaderboard'); return true; } const b = document.querySelector('[data-tab=\"leaderboard\"]'); if (b) { b.click(); return true; } return false; })()",
                25
            );
        } else if ("favorites".equalsIgnoreCase(openTab)) {
            runJsWhenReady(
                "(function() { if (typeof window.setActiveTab === 'function') { window.setActiveTab('favorites'); return true; } const b = document.querySelector('[data-tab=\"favorites\"]'); if (b) { b.click(); return true; } return false; })()",
                25
            );
        }
    }

    private void lockWebViewTextZoom() {
        try {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().post(() -> {
                    try {
                        bridge.getWebView().getSettings().setTextZoom(100);
                        bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            bridge.getWebView().getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW);
                        }
                    } catch (Exception e) {}
                });
            }
        } catch (Exception e) {}
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
        WidgetDataManager.setAppInForeground(true);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        lockWebViewTextZoom();
        injectSafeTopToWebView();
        injectSafeBottomToWebView();
        GoldCardWidgetProvider.updateAllWidgets(MainActivity.this);

        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().post(() -> {
                bridge.getWebView().evaluateJavascript(
                    "(function() { if (typeof window.syncPendingWidgetFavorites === 'function') { window.syncPendingWidgetFavorites(); } if (typeof window.syncCurrentWidgetRank === 'function') { window.syncCurrentWidgetRank(); } })()", null);
            });
        }
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
                        if (!isTrustedOrigin()) return;
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
                        if (!isTrustedOrigin()) return 0f;
                        return statusBarHeightDp > 0 ? statusBarHeightDp : 28f;
                    }

                    @JavascriptInterface
                    public float getNavigationBarHeightDp() {
                        if (!isTrustedOrigin()) return 0f;
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
                        if (!isTrustedOrigin()) return false;
                        return true;
                    }

                    @JavascriptInterface
                    public void signInWithGoogle() {
                        if (!isTrustedOrigin()) return;
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
                        if (!isTrustedOrigin()) return;
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

    @Override
    public void onPause() {
        super.onPause();
        WidgetDataManager.setAppInForeground(false);
        // If background audio service is actively running, ensure WebView JavaScript timers keep firing while screen is off
        if (BackgroundAudioService.isRunning() && bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().resumeTimers();
        }
    }

    @Override
    public void onDestroy() {
        BackgroundAudioService.setActionListener(null);
        if (tts != null) {
            try {
                tts.stop();
                tts.shutdown();
            } catch (Exception ignored) {}
        }
        super.onDestroy();
    }

    private void initNativeTts() {
        try {
            tts = new TextToSpeech(this, status -> {
                if (status == TextToSpeech.SUCCESS) {
                    ttsInitialized = true;
                    try {
                        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                            @Override
                            public void onStart(String utteranceId) {}

                            @Override
                            public void onDone(String utteranceId) {
                                notifyTtsDone(utteranceId);
                            }

                            @Override
                            public void onError(String utteranceId) {
                                notifyTtsDone(utteranceId);
                            }
                        });
                    } catch (Exception ignored) {}
                }
            });
        } catch (Exception ignored) {}
    }

    private void notifyTtsDone(String utteranceId) {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().post(() -> {
                bridge.getWebView().evaluateJavascript(
                    "(function() { if (typeof window.onNativeTtsComplete === 'function') { window.onNativeTtsComplete('" + utteranceId + "'); } })()", null);
            });
        }
    }

    private void setupAudioBridge() {
        BackgroundAudioService.setActionListener(new BackgroundAudioService.PlaybackActionListener() {
            @Override
            public void onTogglePlay() {
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().post(() -> {
                        bridge.getWebView().evaluateJavascript(
                            "(function() { if (typeof window.onBackgroundAudioToggle === 'function') { window.onBackgroundAudioToggle(); } })()", null);
                    });
                }
            }

            @Override
            public void onNextWord() {
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().post(() -> {
                        bridge.getWebView().evaluateJavascript(
                            "(function() { if (typeof window.onBackgroundAudioNext === 'function') { window.onBackgroundAudioNext(); } })()", null);
                    });
                }
            }
        });

        try {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public void startBackgroundMode(final String word, final String translation) {
                        if (!isTrustedOrigin()) return;
                        runOnUiThread(() -> {
                            try {
                                Intent intent = new Intent(MainActivity.this, BackgroundAudioService.class);
                                intent.setAction(BackgroundAudioService.ACTION_START);
                                intent.putExtra(BackgroundAudioService.EXTRA_WORD, word);
                                intent.putExtra(BackgroundAudioService.EXTRA_TRANSLATION, translation);
                                intent.putExtra(BackgroundAudioService.EXTRA_PLAYING, true);
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    startForegroundService(intent);
                                } else {
                                    startService(intent);
                                }
                            } catch (Exception ignored) {}
                        });
                    }

                    @JavascriptInterface
                    public void updateNotification(final String word, final String translation, final boolean isPlaying) {
                        if (!isTrustedOrigin()) return;
                        runOnUiThread(() -> {
                            try {
                                Intent intent = new Intent(MainActivity.this, BackgroundAudioService.class);
                                intent.setAction(BackgroundAudioService.ACTION_UPDATE);
                                intent.putExtra(BackgroundAudioService.EXTRA_WORD, word);
                                intent.putExtra(BackgroundAudioService.EXTRA_TRANSLATION, translation);
                                intent.putExtra(BackgroundAudioService.EXTRA_PLAYING, isPlaying);
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    startForegroundService(intent);
                                } else {
                                    startService(intent);
                                }
                            } catch (Exception ignored) {}
                        });
                    }

                    @JavascriptInterface
                    public void stopBackgroundMode() {
                        if (!isTrustedOrigin()) return;
                        runOnUiThread(() -> {
                            try {
                                Intent intent = new Intent(MainActivity.this, BackgroundAudioService.class);
                                intent.setAction(BackgroundAudioService.ACTION_STOP);
                                startService(intent);
                            } catch (Exception ignored) {}
                        });
                    }

                    @JavascriptInterface
                    public boolean speakText(final String text, final String langCode, final String utteranceId) {
                        if (!isTrustedOrigin()) return false;
                        return speakText(text, langCode, utteranceId, 1.0f);
                    }

                    @JavascriptInterface
                    public boolean speakText(final String text, final String langCode, final String utteranceId, final float speechRate) {
                        if (!isTrustedOrigin()) return false;
                        if (text == null || text.trim().isEmpty()) {
                            return false;
                        }
                        runOnUiThread(() -> {
                            try {
                                if (tts == null) {
                                    notifyTtsDone(utteranceId);
                                    return;
                                }
                                Locale locale;
                                if ("uk".equalsIgnoreCase(langCode) || "uk-UA".equalsIgnoreCase(langCode)) {
                                    locale = new Locale("uk", "UA");
                                } else if ("ru".equalsIgnoreCase(langCode) || "ru-RU".equalsIgnoreCase(langCode)) {
                                    locale = new Locale("ru", "RU");
                                } else if ("en-GB".equalsIgnoreCase(langCode) || "gb".equalsIgnoreCase(langCode)) {
                                    locale = Locale.UK;
                                } else if ("en".equalsIgnoreCase(langCode) || "en-US".equalsIgnoreCase(langCode) || "us".equalsIgnoreCase(langCode)) {
                                    locale = Locale.US;
                                } else if ("de".equalsIgnoreCase(langCode) || "de-DE".equalsIgnoreCase(langCode)) {
                                    locale = Locale.GERMANY;
                                } else if ("fr".equalsIgnoreCase(langCode) || "fr-FR".equalsIgnoreCase(langCode)) {
                                    locale = Locale.FRANCE;
                                } else if ("es".equalsIgnoreCase(langCode) || "es-ES".equalsIgnoreCase(langCode)) {
                                    locale = new Locale("es", "ES");
                                } else if (langCode != null && langCode.contains("-")) {
                                    String[] parts = langCode.split("-");
                                    locale = new Locale(parts[0], parts[1]);
                                } else if (langCode != null) {
                                    locale = new Locale(langCode);
                                } else {
                                    locale = new Locale("ru", "RU");
                                }
                                tts.setLanguage(locale);
                                float rate = speechRate > 0.1f ? speechRate : 1.0f;
                                tts.setSpeechRate(rate);
                                tts.setPitch(1.0f);
                                Bundle params = new Bundle();
                                params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
                                tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId);
                            } catch (Exception e) {
                                notifyTtsDone(utteranceId);
                            }
                        });
                        return true;
                    }

                    @JavascriptInterface
                    public void stopSpeech() {
                        if (!isTrustedOrigin()) return;
                        runOnUiThread(() -> {
                            try {
                                if (tts != null) {
                                    tts.stop();
                                }
                            } catch (Exception ignored) {}
                        });
                    }
                }, "AndroidAudioBridge");
            }
        } catch (Exception ignored) {}
    }

    private void setupWidgetBridge() {
        try {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public void syncFavorites(final String wordsJson) {
                        if (!isTrustedOrigin()) return;
                        try {
                            WidgetDataManager.saveFavorites(MainActivity.this, wordsJson);
                            GoldCardWidgetProvider.updateAllWidgets(MainActivity.this);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }

                    @JavascriptInterface
                    public boolean requestPinWidget(final String size) {
                        if (!isTrustedOrigin()) return false;
                        return requestPinWidget();
                    }

                    @JavascriptInterface
                    public boolean requestPinWidget() {
                        if (!isTrustedOrigin()) return false;
                        try {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                AppWidgetManager appWidgetManager = getSystemService(AppWidgetManager.class);
                                if (appWidgetManager != null && appWidgetManager.isRequestPinAppWidgetSupported()) {
                                    ComponentName provider = new ComponentName(MainActivity.this, GoldCardWidgetProvider.class);
                                    int[] existingIds = appWidgetManager.getAppWidgetIds(provider);
                                    if (!WidgetDataManager.hasRealInstalledWidgets(MainActivity.this, existingIds)) {
                                        WidgetDataManager.markPrePinGhostIds(MainActivity.this, existingIds);
                                    }
                                    appWidgetManager.requestPinAppWidget(provider, null, null);
                                    return true;
                                }
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        return false;
                    }

                    @JavascriptInterface
                    public boolean isPinSupported() {
                        if (!isTrustedOrigin()) return false;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            AppWidgetManager appWidgetManager = getSystemService(AppWidgetManager.class);
                            return appWidgetManager != null && appWidgetManager.isRequestPinAppWidgetSupported();
                        }
                        return false;
                    }

                    @JavascriptInterface
                    public boolean isWidgetInstalled() {
                        if (!isTrustedOrigin()) return false;
                        try {
                            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(MainActivity.this);
                            ComponentName provider = new ComponentName(MainActivity.this, GoldCardWidgetProvider.class);
                            int[] ids = appWidgetManager.getAppWidgetIds(provider);
                            return WidgetDataManager.hasRealInstalledWidgets(MainActivity.this, ids);
                        } catch (Exception e) {
                            return false;
                        }
                    }

                    @JavascriptInterface
                    public String getPendingUnfavorites() {
                        if (!isTrustedOrigin()) return "[]";
                        return WidgetDataManager.getPendingUnfavoritesJson(MainActivity.this);
                    }

                    @JavascriptInterface
                    public void removePendingUnfavorite(final String id) {
                        if (!isTrustedOrigin()) return;
                        WidgetDataManager.removePendingUnfavorite(MainActivity.this, id);
                    }

                    @JavascriptInterface
                    public void clearPendingUnfavorites() {
                        if (!isTrustedOrigin()) return;
                        WidgetDataManager.clearPendingUnfavorites(MainActivity.this);
                    }

                    @JavascriptInterface
                    public String getPendingFavorites() {
                        if (!isTrustedOrigin()) return "[]";
                        return WidgetDataManager.getPendingFavoritesJson(MainActivity.this);
                    }

                    @JavascriptInterface
                    public void removePendingFavorite(final String id) {
                        if (!isTrustedOrigin()) return;
                        WidgetDataManager.removePendingFavorite(MainActivity.this, id);
                    }

                    @JavascriptInterface
                    public void clearPendingFavorites() {
                        if (!isTrustedOrigin()) return;
                        WidgetDataManager.clearPendingFavorites(MainActivity.this);
                    }

                    @JavascriptInterface
                    public void syncUserRank(final int rank) {
                        if (!isTrustedOrigin()) return;
                        try {
                            WidgetDataManager.setUserRank(MainActivity.this, rank);
                            GoldCardWidgetProvider.updateAllWidgets(MainActivity.this);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }

                    @JavascriptInterface
                    public void triggerOvertakenAlert(final String localizedMessage) {
                        if (!isTrustedOrigin()) return;
                        runOnUiThread(() -> {
                            try {
                                String text = (localizedMessage != null && !localizedMessage.trim().isEmpty())
                                    ? localizedMessage.trim()
                                    : "Вас обошли соперники!";
                                WidgetDataManager.setAlertBannerText(MainActivity.this, "⚡ " + text);
                                WidgetDataManager.setReminderAlertActive(MainActivity.this, true);
                                GoldCardWidgetProvider.updateAllWidgets(MainActivity.this);

                                // Post system notification with sound (plays exactly ONCE)
                                Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                                if (nm != null) {
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                        NotificationChannel channel = new NotificationChannel(
                                            "english_breakfast_rank_alert",
                                            "Оповещения турнира",
                                            NotificationManager.IMPORTANCE_HIGH
                                        );
                                        channel.setDescription("Оповещения о смещении в таблице лидеров");
                                        channel.enableVibration(true);
                                        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                                            .build();
                                        channel.setSound(soundUri, audioAttributes);
                                        nm.createNotificationChannel(channel);
                                    }

                                    Intent launchIntent = new Intent(MainActivity.this, MainActivity.class);
                                    launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                                    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
                                    PendingIntent pi = PendingIntent.getActivity(MainActivity.this, 7005, launchIntent, flags);

                                    NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "english_breakfast_rank_alert")
                                        .setSmallIcon(R.mipmap.ic_launcher)
                                        .setContentTitle("🏆 " + text)
                                        .setContentText("Вернитесь в топ-4 лидеров, пока неделя не завершилась!")
                                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                                        .setSound(soundUri)
                                        .setAutoCancel(true)
                                        .setContentIntent(pi);

                                    nm.notify(1005, builder.build());
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        });
                    }

                    @JavascriptInterface
                    public String getWidgetConfig() {
                        if (!isTrustedOrigin()) return "{}";
                        return WidgetDataManager.getConfigJson(MainActivity.this);
                    }

                    @JavascriptInterface
                    public void saveWidgetConfig(final String configJson) {
                        if (!isTrustedOrigin()) return;
                        try {
                            WidgetDataManager.saveConfigJson(MainActivity.this, configJson);
                            GoldCardWidgetProvider.scheduleNextRotation(MainActivity.this);
                            GoldCardWidgetProvider.updateAllWidgets(MainActivity.this);
                            StudyReminderManager.scheduleReminder(MainActivity.this);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }

                    @JavascriptInterface
                    public String getSystemLanguage() {
                        if (!isTrustedOrigin()) return "ru";
                        try {
                            Locale loc = Locale.getDefault();
                            return loc != null ? loc.getLanguage() : "ru";
                        } catch (Exception e) {
                            return "ru";
                        }
                    }

                    @JavascriptInterface
                    public void openHomeScreenSettings() {
                        if (!isTrustedOrigin()) return;
                        runOnUiThread(() -> {
                            try {
                                Intent miuiIntent = new Intent("miui.intent.action.APP_PERM_EDITOR");
                                miuiIntent.setClassName("com.miui.securitycenter", "com.miui.permcenter.permissions.PermissionsEditorActivity");
                                miuiIntent.putExtra("extra_pkgname", getPackageName());
                                miuiIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(miuiIntent);
                                return;
                            } catch (Exception ignored) {}

                            try {
                                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                                intent.setData(Uri.parse("package:" + getPackageName()));
                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(intent);
                            } catch (Exception e) {
                                try {
                                    Intent intent = new Intent(Settings.ACTION_SETTINGS);
                                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    startActivity(intent);
                                } catch (Exception ignored) {}
                            }
                        });
                    }

                    @JavascriptInterface
                    public void shareToChannel(final String channel, final String text, final String url) {
                        if (!isTrustedOrigin()) return;
                        runOnUiThread(() -> {
                            String safeText = text != null ? text : "";
                            String safeUrl = url != null ? url : "";
                            String combined = (safeText + " " + safeUrl).trim();
                            try {
                                if ("telegram".equalsIgnoreCase(channel)) {
                                    try {
                                        Uri tgUri = Uri.parse("tg://msg_url?url=" + Uri.encode(safeUrl) + "&text=" + Uri.encode(safeText));
                                        Intent tgIntent = new Intent(Intent.ACTION_VIEW, tgUri);
                                        tgIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                        startActivity(tgIntent);
                                        return;
                                    } catch (Exception ignored) {}
                                    Uri webTgUri = Uri.parse("https://t.me/share/url?url=" + Uri.encode(safeUrl) + "&text=" + Uri.encode(safeText));
                                    Intent webIntent = new Intent(Intent.ACTION_VIEW, webTgUri);
                                    webIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    startActivity(webIntent);
                                    return;
                                } else if ("whatsapp".equalsIgnoreCase(channel)) {
                                    try {
                                        Uri waUri = Uri.parse("whatsapp://send?text=" + Uri.encode(combined));
                                        Intent waIntent = new Intent(Intent.ACTION_VIEW, waUri);
                                        waIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                        startActivity(waIntent);
                                        return;
                                    } catch (Exception ignored) {}
                                    Uri webWaUri = Uri.parse("https://api.whatsapp.com/send?text=" + Uri.encode(combined));
                                    Intent webIntent = new Intent(Intent.ACTION_VIEW, webWaUri);
                                    webIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    startActivity(webIntent);
                                    return;
                                } else if ("viber".equalsIgnoreCase(channel)) {
                                    try {
                                        Uri vbUri = Uri.parse("viber://forward?text=" + Uri.encode(combined));
                                        Intent vbIntent = new Intent(Intent.ACTION_VIEW, vbUri);
                                        vbIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                        startActivity(vbIntent);
                                        return;
                                    } catch (Exception ignored) {}
                                } else if ("tiktok".equalsIgnoreCase(channel)) {
                                    Uri ttUri = Uri.parse("https://www.tiktok.com/");
                                    Intent ttIntent = new Intent(Intent.ACTION_VIEW, ttUri);
                                    ttIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    startActivity(ttIntent);
                                    return;
                                }

                                Intent sendIntent = new Intent(Intent.ACTION_SEND);
                                sendIntent.setType("text/plain");
                                sendIntent.putExtra(Intent.EXTRA_TEXT, combined);
                                Intent chooser = Intent.createChooser(sendIntent, "Поделиться");
                                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(chooser);
                            } catch (Exception ignored) {}
                        });
                    }

                    @JavascriptInterface
                    public void openFeedbackEmail(final String email, final String subject, final String body) {
                        if (!isTrustedOrigin()) return;
                        runOnUiThread(() -> {
                            String safeEmail = email != null ? email : "lipniagovnikola@gmail.com";
                            String safeSubject = subject != null ? subject : "English Breakfast — Feedback";
                            String safeBody = body != null ? body : "";
                            try {
                                Uri mailtoUri = Uri.parse(
                                    "mailto:" + safeEmail +
                                    "?subject=" + Uri.encode(safeSubject) +
                                    "&body=" + Uri.encode(safeBody)
                                );
                                Intent emailIntent = new Intent(Intent.ACTION_SENDTO, mailtoUri);
                                emailIntent.putExtra(Intent.EXTRA_EMAIL, new String[]{safeEmail});
                                emailIntent.putExtra(Intent.EXTRA_SUBJECT, safeSubject);
                                emailIntent.putExtra(Intent.EXTRA_TEXT, safeBody);
                                emailIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(emailIntent);
                            } catch (Exception e) {
                                try {
                                    Intent fallback = new Intent(Intent.ACTION_SEND);
                                    fallback.setType("message/rfc822");
                                    fallback.putExtra(Intent.EXTRA_EMAIL, new String[]{safeEmail});
                                    fallback.putExtra(Intent.EXTRA_SUBJECT, safeSubject);
                                    fallback.putExtra(Intent.EXTRA_TEXT, safeBody);
                                    Intent chooser = Intent.createChooser(fallback, safeSubject);
                                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    startActivity(chooser);
                                } catch (Exception ignored) {}
                            }
                        });
                    }
                }, "AndroidWidgetBridge");
            }
        } catch (Exception ignored) {}
    }
}

