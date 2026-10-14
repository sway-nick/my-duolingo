package com.englishbreakfast.app;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WidgetDataManager {

    private static final String PREF_NAME = "widget_gold_card_prefs";
    private static final String KEY_WORDS_JSON = "key_words_json";
    private static final String KEY_CURRENT_INDEX = "key_current_index";
    private static final String KEY_IS_FLIPPED = "key_is_flipped";
    private static final String KEY_PENDING_UNFAVS = "key_pending_unfavs";
    private static final String KEY_PENDING_FAVS = "key_pending_favs";
    private static final String KEY_HAS_FAVORITES = "key_has_favorites";
    private static volatile boolean isAppInForeground = false;

    // In-memory cache to prevent repetitive JSON parsing on main thread during widget taps
    private static List<WidgetWord> sCachedWords = null;
    private static String sCachedWordsJson = null;
    private static Set<String> sCachedUnfavs = null;
    private static Set<String> sCachedFavs = null;
    private static Boolean sCachedHasFavs = null;

    public static synchronized void invalidateCache() {
        sCachedWords = null;
        sCachedWordsJson = null;
        sCachedUnfavs = null;
        sCachedFavs = null;
        sCachedHasFavs = null;
    }

    public static void setAppInForeground(boolean inForeground) {
        isAppInForeground = inForeground;
    }

    public static boolean isAppInForeground() {
        return isAppInForeground;
    }

    public static class WidgetWord {
        public String id;
        public String word;
        public String transcription;
        public String translation;
        public String level;
        public String example;
        public boolean isFavorite;

        public WidgetWord(String id, String word, String transcription, String translation, String level, String example, boolean isFavorite) {
            this.id = id != null ? id : word;
            this.word = word != null ? word : "";
            this.transcription = transcription != null ? transcription : "";
            this.translation = translation != null ? translation : "";
            this.level = level != null && !level.isEmpty() ? level.toUpperCase() : "ELEMENTARY";
            this.example = example != null && !example.isEmpty() ? "«" + example.replaceAll("^[«\"']|[»\"']$", "") + "»" : "";
            this.isFavorite = isFavorite;
        }
    }

    private static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized void saveFavorites(Context context, String wordsJson) {
        if (context == null || wordsJson == null) return;
        try {
            SharedPreferences prefs = getPrefs(context);
            boolean hasFavs = false;
            String trimmed = wordsJson.trim();
            if (trimmed.startsWith("{")) {
                JSONObject root = new JSONObject(trimmed);
                JSONArray wordsArr = root.optJSONArray("words");
                if (wordsArr == null || wordsArr.length() == 0) {
                    // Safety check: Never wipe out existing widget words with an empty payload!
                    return;
                }
                hasFavs = root.optBoolean("hasFavorites", false);
            } else if (trimmed.startsWith("[")) {
                JSONArray arr = new JSONArray(trimmed);
                if (arr.length() == 0) {
                    return;
                }
                hasFavs = arr.length() > 0;
            }
            prefs.edit()
                .putString(KEY_WORDS_JSON, wordsJson)
                .putBoolean(KEY_HAS_FAVORITES, hasFavs)
                .apply();
            invalidateCache();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static synchronized boolean hasUserFavorites(Context context) {
        if (context == null) return false;
        SharedPreferences prefs = getPrefs(context);
        String jsonStr = prefs.getString(KEY_WORDS_JSON, "");
        if (prefs.contains(KEY_HAS_FAVORITES)) {
            return prefs.getBoolean(KEY_HAS_FAVORITES, false);
        }
        // Auto-detect from jsonStr if key is not yet stored
        String trimmed = jsonStr != null ? jsonStr.trim() : "";
        if (trimmed.startsWith("{")) {
            try {
                return new JSONObject(trimmed).optBoolean("hasFavorites", false);
            } catch (Exception ignored) {
                return false;
            }
        }
        return trimmed.startsWith("[") && trimmed.length() > 2;
    }

    public static synchronized int getTotalFavoritesCount(Context context) {
        List<WidgetWord> words = getWords(context);
        return words.size();
    }

    public static synchronized int getCurrentFavoriteIndex(Context context) {
        List<WidgetWord> words = getWords(context);
        if (words.isEmpty()) return 0;
        SharedPreferences prefs = getPrefs(context);
        int idx = prefs.getInt(KEY_CURRENT_INDEX, 0);
        if (idx < 0 || idx >= words.size()) {
            idx = 0;
        }
        return idx + 1;
    }

    public static synchronized List<WidgetWord> getWords(Context context) {
        List<WidgetWord> list = new ArrayList<>();
        if (context == null) return list;

        SharedPreferences prefs = getPrefs(context);
        String jsonStr = prefs.getString(KEY_WORDS_JSON, "");
        Set<String> unfavs = prefs.getStringSet(KEY_PENDING_UNFAVS, new HashSet<>());
        Set<String> favs = prefs.getStringSet(KEY_PENDING_FAVS, new HashSet<>());
        boolean hasFavs = hasUserFavorites(context);

        // Return from in-memory cache if inputs match
        if (sCachedWords != null 
                && sCachedWordsJson != null && sCachedWordsJson.equals(jsonStr)
                && sCachedUnfavs != null && sCachedUnfavs.equals(unfavs)
                && sCachedFavs != null && sCachedFavs.equals(favs)
                && sCachedHasFavs != null && sCachedHasFavs == hasFavs) {
            return new ArrayList<>(sCachedWords);
        }

        if (jsonStr != null && !jsonStr.trim().isEmpty()) {
            try {
                JSONArray arr = null;
                String trimmed = jsonStr.trim();
                if (trimmed.startsWith("{")) {
                    JSONObject root = new JSONObject(trimmed);
                    arr = root.optJSONArray("words");
                } else if (trimmed.startsWith("[")) {
                    arr = new JSONArray(trimmed);
                }

                if (arr != null) {
                    for (int i = 0; i < arr.length(); i++) {
                        JSONObject obj = arr.getJSONObject(i);
                        String id = obj.optString("id", "");
                        String word = obj.optString("word", "");
                        String trans = obj.optString("transcription", obj.optString("transcription_ipa", ""));
                        String transln = obj.optString("translation", obj.optString("translation_ru", ""));
                        String level = obj.optString("level", obj.optString("category", "ELEMENTARY"));
                        String example = obj.optString("example", obj.optString("notes", ""));
                        boolean isFav = obj.optBoolean("isFavorite", hasFavs);
                        if (unfavs.contains(id)) {
                            isFav = false;
                        } else if (favs.contains(id)) {
                            isFav = true;
                        }

                        if (!word.trim().isEmpty()) {
                            if (hasFavs) {
                                if (isFav) {
                                    list.add(new WidgetWord(id, word, trans, transln, level, example, true));
                                }
                            } else {
                                list.add(new WidgetWord(id, word, trans, transln, level, example, isFav));
                            }
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Fallback: If list is empty (e.g. before first sync), provide starter category words
        if (list.isEmpty()) {
            list.add(new WidgetWord("w_know", "Knowledge", "/ˈnɒl.ɪdʒ/", "Знание, познания", "ELEMENTARY", "Knowledge is power.", false));
            list.add(new WidgetWord("w_opp", "Opportunity", "/ˌɒp.əˈtjuː.nə.ti/", "Возможность, удобный случай", "INTERMEDIATE", "Every day brings new opportunities.", false));
            list.add(new WidgetWord("w_conf", "Confidence", "/ˈkɒn.fɪ.dəns/", "Уверенность, доверие", "INTERMEDIATE", "Practice builds your confidence.", false));
            list.add(new WidgetWord("w_insp", "Inspiration", "/ˌɪn.spɪˈreɪ.ʃən/", "Вдохновение", "ELEMENTARY", "Find inspiration in small things.", false));
            list.add(new WidgetWord("w_succ", "Success", "/səkˈses/", "Успех, удача", "ELEMENTARY", "Success comes with persistence.", false));
        }

        sCachedWords = new ArrayList<>(list);
        sCachedWordsJson = jsonStr;
        sCachedUnfavs = new HashSet<>(unfavs);
        sCachedFavs = new HashSet<>(favs);
        sCachedHasFavs = hasFavs;

        return list;
    }

    public static synchronized WidgetWord getCurrentWord(Context context) {
        List<WidgetWord> words = getWords(context);
        if (words.isEmpty()) {
            return new WidgetWord("def", "English", "/ˈɪŋ.ɡlɪʃ/", "Английский язык", "A2", "Practice makes perfect", true);
        }

        SharedPreferences prefs = getPrefs(context);
        int idx = prefs.getInt(KEY_CURRENT_INDEX, 0);
        if (idx < 0 || idx >= words.size()) {
            idx = 0;
            prefs.edit().putInt(KEY_CURRENT_INDEX, 0).apply();
        }
        return words.get(idx);
    }

    public static synchronized WidgetWord nextWord(Context context) {
        List<WidgetWord> words = getWords(context);
        if (words.isEmpty()) return getCurrentWord(context);

        SharedPreferences prefs = getPrefs(context);
        int idx = prefs.getInt(KEY_CURRENT_INDEX, 0);
        idx = (idx + 1) % words.size();

        prefs.edit()
            .putInt(KEY_CURRENT_INDEX, idx)
            .putBoolean(KEY_IS_FLIPPED, false)
            .apply();

        return words.get(idx);
    }

    public static synchronized WidgetWord prevWord(Context context) {
        List<WidgetWord> words = getWords(context);
        if (words.isEmpty()) return getCurrentWord(context);

        SharedPreferences prefs = getPrefs(context);
        int idx = prefs.getInt(KEY_CURRENT_INDEX, 0);
        idx = (idx - 1 + words.size()) % words.size();

        prefs.edit()
            .putInt(KEY_CURRENT_INDEX, idx)
            .putBoolean(KEY_IS_FLIPPED, false)
            .apply();

        return words.get(idx);
    }

    public static synchronized boolean isFlipped(Context context) {
        return getPrefs(context).getBoolean(KEY_IS_FLIPPED, false);
    }

    public static synchronized boolean toggleFlip(Context context) {
        SharedPreferences prefs = getPrefs(context);
        boolean current = prefs.getBoolean(KEY_IS_FLIPPED, false);
        boolean flipped = !current;
        prefs.edit().putBoolean(KEY_IS_FLIPPED, flipped).apply();
        return flipped;
    }

    public static synchronized boolean toggleFavorite(Context context) {
        WidgetWord cur = getCurrentWord(context);
        if (cur == null || cur.id == null) return false;

        SharedPreferences prefs = getPrefs(context);
        Set<String> unfavs = new HashSet<>(prefs.getStringSet(KEY_PENDING_UNFAVS, new HashSet<>()));
        Set<String> favs = new HashSet<>(prefs.getStringSet(KEY_PENDING_FAVS, new HashSet<>()));
        boolean hasFavs = hasUserFavorites(context);

        boolean currentlyFav = cur.isFavorite;
        boolean newFavState;

        if (currentlyFav) {
            favs.remove(cur.id);
            unfavs.add(cur.id);
            newFavState = false;
        } else {
            unfavs.remove(cur.id);
            favs.add(cur.id);
            newFavState = true;
        }

        prefs.edit()
            .putStringSet(KEY_PENDING_UNFAVS, unfavs)
            .putStringSet(KEY_PENDING_FAVS, favs)
            .apply();
        invalidateCache();

        // If the user un-favorited the word while in favorites mode, advance to the next word immediately!
        if (hasFavs && !newFavState) {
            List<WidgetWord> remaining = getWords(context);
            // Check if there are any remaining user favorites
            boolean anyFavsLeft = false;
            for (WidgetWord w : remaining) {
                if (w.isFavorite) {
                    anyFavsLeft = true;
                    break;
                }
            }
            if (!anyFavsLeft) {
                // If user removed the last favorite, reset hasFavorites so widget doesn't stay in fake favorites mode
                prefs.edit().putBoolean(KEY_HAS_FAVORITES, false).putInt(KEY_CURRENT_INDEX, 0).apply();
                invalidateCache();
            } else {
                int idx = prefs.getInt(KEY_CURRENT_INDEX, 0);
                if (remaining.isEmpty()) {
                    idx = 0;
                } else {
                    idx = idx % remaining.size();
                }
                prefs.edit().putInt(KEY_CURRENT_INDEX, idx).putBoolean(KEY_IS_FLIPPED, false).apply();
            }
        }

        return newFavState;
    }

    public static synchronized String getPendingUnfavoritesJson(Context context) {
        Set<String> unfavs = getPrefs(context).getStringSet(KEY_PENDING_UNFAVS, new HashSet<>());
        JSONArray arr = new JSONArray();
        for (String id : unfavs) {
            arr.put(id);
        }
        return arr.toString();
    }

    public static synchronized void removePendingUnfavorite(Context context, String id) {
        if (context == null || id == null) return;
        SharedPreferences prefs = getPrefs(context);
        Set<String> unfavs = new HashSet<>(prefs.getStringSet(KEY_PENDING_UNFAVS, new HashSet<>()));
        if (unfavs.remove(id)) {
            prefs.edit().putStringSet(KEY_PENDING_UNFAVS, unfavs).apply();
            invalidateCache();
        }
    }

    public static synchronized void clearPendingUnfavorites(Context context) {
        getPrefs(context).edit().remove(KEY_PENDING_UNFAVS).apply();
        invalidateCache();
    }

    public static synchronized String getPendingFavoritesJson(Context context) {
        Set<String> favs = getPrefs(context).getStringSet(KEY_PENDING_FAVS, new HashSet<>());
        JSONArray arr = new JSONArray();
        for (String id : favs) {
            arr.put(id);
        }
        return arr.toString();
    }

    public static synchronized void removePendingFavorite(Context context, String id) {
        if (context == null || id == null) return;
        SharedPreferences prefs = getPrefs(context);
        Set<String> favs = new HashSet<>(prefs.getStringSet(KEY_PENDING_FAVS, new HashSet<>()));
        if (favs.remove(id)) {
            prefs.edit().putStringSet(KEY_PENDING_FAVS, favs).apply();
            invalidateCache();
        }
    }

    public static synchronized void clearPendingFavorites(Context context) {
        getPrefs(context).edit().remove(KEY_PENDING_FAVS).apply();
        invalidateCache();
    }

    // --- Widget Customization Settings ---
    private static final String KEY_WIDGET_THEME = "key_widget_theme";
    private static final String KEY_ROTATION_INTERVAL_MIN = "key_rotation_interval_min";
    private static final String KEY_SOUND_FLIP_ENABLED = "key_sound_flip_enabled";
    private static final String KEY_AUTO_SPEAK_ENABLED = "key_auto_speak_enabled";
    private static final String KEY_SPEAK_START_TIME = "key_speak_start_time";
    private static final String KEY_SPEAK_END_TIME = "key_speak_end_time";
    private static final String KEY_REMINDER_ENABLED = "key_reminder_enabled";
    private static final String KEY_REMINDER_TIME = "key_reminder_time";
    private static final String KEY_USER_RANK = "key_user_rank";
    private static final String KEY_REMINDER_ALERT = "key_reminder_alert";
    private static final String KEY_ALERT_BANNER_TEXT = "key_alert_banner_text";

    public static synchronized int getUserRank(Context context) {
        if (context == null) return 0;
        return getPrefs(context).getInt(KEY_USER_RANK, 0);
    }

    public static synchronized void setUserRank(Context context, int rank) {
        if (context == null) return;
        getPrefs(context).edit().putInt(KEY_USER_RANK, rank).apply();
    }

    public static synchronized boolean isReminderAlertActive(Context context) {
        if (context == null) return false;
        return getPrefs(context).getBoolean(KEY_REMINDER_ALERT, false);
    }

    public static synchronized void setReminderAlertActive(Context context, boolean active) {
        if (context == null) return;
        getPrefs(context).edit().putBoolean(KEY_REMINDER_ALERT, active).apply();
    }

    public static synchronized String getAlertBannerText(Context context) {
        if (context == null) return "⚡ Не отставай от других!";
        return getPrefs(context).getString(KEY_ALERT_BANNER_TEXT, "⚡ Не отставай от других!");
    }

    public static synchronized void setAlertBannerText(Context context, String text) {
        if (context == null || text == null) return;
        getPrefs(context).edit().putString(KEY_ALERT_BANNER_TEXT, text).apply();
    }

    public static synchronized String getWidgetTheme(Context context) {
        if (context == null) return "gold";
        return getPrefs(context).getString(KEY_WIDGET_THEME, "gold");
    }

    public static synchronized void setWidgetTheme(Context context, String theme) {
        if (context == null || theme == null) return;
        getPrefs(context).edit().putString(KEY_WIDGET_THEME, theme).apply();
    }

    public static synchronized int getRotationIntervalMin(Context context) {
        if (context == null) return 30;
        return getPrefs(context).getInt(KEY_ROTATION_INTERVAL_MIN, 30);
    }

    public static synchronized void setRotationIntervalMin(Context context, int minutes) {
        if (context == null) return;
        getPrefs(context).edit().putInt(KEY_ROTATION_INTERVAL_MIN, minutes).apply();
    }

    public static synchronized boolean isSoundFlipEnabled(Context context) {
        if (context == null) return true;
        return getPrefs(context).getBoolean(KEY_SOUND_FLIP_ENABLED, true);
    }

    public static synchronized void setSoundFlipEnabled(Context context, boolean enabled) {
        if (context == null) return;
        getPrefs(context).edit().putBoolean(KEY_SOUND_FLIP_ENABLED, enabled).apply();
    }

    public static synchronized boolean isAutoSpeakEnabled(Context context) {
        if (context == null) return false;
        return getPrefs(context).getBoolean(KEY_AUTO_SPEAK_ENABLED, false);
    }

    public static synchronized void setAutoSpeakEnabled(Context context, boolean enabled) {
        if (context == null) return;
        getPrefs(context).edit().putBoolean(KEY_AUTO_SPEAK_ENABLED, enabled).apply();
    }

    public static synchronized String getSpeakStartTime(Context context) {
        if (context == null) return "09:00";
        return getPrefs(context).getString(KEY_SPEAK_START_TIME, "09:00");
    }

    public static synchronized void setSpeakStartTime(Context context, String time) {
        if (context == null || time == null) return;
        getPrefs(context).edit().putString(KEY_SPEAK_START_TIME, time).apply();
    }

    public static synchronized String getSpeakEndTime(Context context) {
        if (context == null) return "20:00";
        return getPrefs(context).getString(KEY_SPEAK_END_TIME, "20:00");
    }

    public static synchronized void setSpeakEndTime(Context context, String time) {
        if (context == null || time == null) return;
        getPrefs(context).edit().putString(KEY_SPEAK_END_TIME, time).apply();
    }

    public static synchronized boolean isWithinSpeakHours(Context context) {
        try {
            String startStr = getSpeakStartTime(context);
            String endStr = getSpeakEndTime(context);
            String[] sParts = startStr.split(":");
            String[] eParts = endStr.split(":");
            int startMin = Integer.parseInt(sParts[0]) * 60 + Integer.parseInt(sParts[1]);
            int endMin = Integer.parseInt(eParts[0]) * 60 + Integer.parseInt(eParts[1]);

            java.util.Calendar cal = java.util.Calendar.getInstance();
            int nowMin = cal.get(java.util.Calendar.HOUR_OF_DAY) * 60 + cal.get(java.util.Calendar.MINUTE);

            if (startMin <= endMin) {
                return nowMin >= startMin && nowMin <= endMin;
            } else {
                // Overnight window, e.g. 21:00 to 07:00
                return nowMin >= startMin || nowMin <= endMin;
            }
        } catch (Exception e) {
            return false;
        }
    }

    public static synchronized boolean isReminderEnabled(Context context) {
        if (context == null) return true;
        return getPrefs(context).getBoolean(KEY_REMINDER_ENABLED, true);
    }

    public static synchronized void setReminderEnabled(Context context, boolean enabled) {
        if (context == null) return;
        getPrefs(context).edit().putBoolean(KEY_REMINDER_ENABLED, enabled).apply();
    }

    public static synchronized String getReminderTime(Context context) {
        if (context == null) return "11:00";
        return getPrefs(context).getString(KEY_REMINDER_TIME, "11:00");
    }

    public static synchronized void setReminderTime(Context context, String time) {
        if (context == null || time == null) return;
        getPrefs(context).edit().putString(KEY_REMINDER_TIME, time).apply();
    }

    public static synchronized int getReminderHour(Context context) {
        String t = getReminderTime(context);
        try {
            return Integer.parseInt(t.split(":")[0]);
        } catch (Exception e) {
            return 11;
        }
    }

    public static synchronized int getReminderMinute(Context context) {
        String t = getReminderTime(context);
        try {
            return Integer.parseInt(t.split(":")[1]);
        } catch (Exception e) {
            return 0;
        }
    }

    public static synchronized String getConfigJson(Context context) {
        JSONObject obj = new JSONObject();
        try {
            obj.put("widgetTheme", getWidgetTheme(context));
            obj.put("rotationIntervalMin", getRotationIntervalMin(context));
            obj.put("soundFlipEnabled", isSoundFlipEnabled(context));
            obj.put("autoSpeakEnabled", isAutoSpeakEnabled(context));
            obj.put("speakStartTime", getSpeakStartTime(context));
            obj.put("speakEndTime", getSpeakEndTime(context));
            obj.put("reminderEnabled", isReminderEnabled(context));
            obj.put("reminderTime", getReminderTime(context));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return obj.toString();
    }

    public static synchronized void saveConfigJson(Context context, String jsonStr) {
        if (context == null || jsonStr == null) return;
        try {
            JSONObject obj = new JSONObject(jsonStr);
            if (obj.has("widgetTheme")) {
                setWidgetTheme(context, obj.getString("widgetTheme"));
            }
            if (obj.has("rotationIntervalMin")) {
                setRotationIntervalMin(context, obj.getInt("rotationIntervalMin"));
            }
            if (obj.has("soundFlipEnabled")) {
                setSoundFlipEnabled(context, obj.getBoolean("soundFlipEnabled"));
            }
            if (obj.has("autoSpeakEnabled")) {
                setAutoSpeakEnabled(context, obj.getBoolean("autoSpeakEnabled"));
            }
            if (obj.has("speakStartTime")) {
                setSpeakStartTime(context, obj.getString("speakStartTime"));
            }
            if (obj.has("speakEndTime")) {
                setSpeakEndTime(context, obj.getString("speakEndTime"));
            }
            if (obj.has("reminderEnabled")) {
                setReminderEnabled(context, obj.getBoolean("reminderEnabled"));
            }
            if (obj.has("reminderTime")) {
                setReminderTime(context, obj.getString("reminderTime"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
