# Preserve debugging stack traces
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes EnclosingMethod
-keepattributes InnerClasses

# Preserve JavaScript Interface for WebView & Capacitor
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve Capacitor Bridge and Plugins
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { public *; }
-keep public class * extends com.getcapacitor.BridgeActivity { public *; }

# Preserve Application Components
-keep class com.englishbreakfast.app.** { *; }

# Preserve Google Sign-In & Auth
-keep class com.google.android.gms.auth.api.signin.** { *; }
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.android.gms.tasks.** { *; }

# Preserve Google AdMob
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }
-keep class com.getcapacitor.community.admob.** { *; }

# Preserve Media & Background Audio Service
-keep class androidx.media.** { *; }
-keep class android.support.v4.media.** { *; }

# Preserve Firebase Analytics
-keep class com.google.firebase.analytics.** { *; }

# Suppress harmless warnings from third-party libraries
-dontwarn com.google.android.gms.**
-dontwarn com.getcapacitor.**
