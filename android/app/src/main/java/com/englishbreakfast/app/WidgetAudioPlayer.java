package com.englishbreakfast.app;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.AudioPlaybackConfiguration;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import java.io.File;
import java.util.List;
import java.util.Locale;

public class WidgetAudioPlayer {

    private static MediaPlayer activePlayer = null;
    private static TextToSpeech fallbackTts = null;
    private static boolean ttsReady = false;

    /**
     * Checks if the system audio is busy (phone/VoIP call, active video/music/gaming, or silent/vibrate mode)
     * so automatic widget rotation speech does not disturb the user.
     */
    public static boolean isSystemAudioBusy(Context context) {
        if (context == null) return false;
        try {
            AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            if (am == null) return false;

            // 1. Phone or VoIP call in progress (Cellular call, WhatsApp, Telegram, Zoom, Meet, etc.)
            int mode = am.getMode();
            if (mode == AudioManager.MODE_IN_CALL ||
                mode == AudioManager.MODE_IN_COMMUNICATION ||
                mode == AudioManager.MODE_RINGTONE) {
                return true;
            }

            // 2. Active media playback across the system (YouTube, video players, music streaming, games)
            if (am.isMusicActive()) {
                return true;
            }

            // 3. Active audio sessions inspection on Android 8.0+ (Games, media, voice)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                List<AudioPlaybackConfiguration> configs = am.getActivePlaybackConfigurations();
                if (configs != null) {
                    for (AudioPlaybackConfiguration cfg : configs) {
                        AudioAttributes attrs = cfg.getAudioAttributes();
                        if (attrs != null) {
                            int usage = attrs.getUsage();
                            if (usage == AudioAttributes.USAGE_GAME ||
                                usage == AudioAttributes.USAGE_MEDIA ||
                                usage == AudioAttributes.USAGE_VOICE_COMMUNICATION ||
                                usage == AudioAttributes.USAGE_VOICE_COMMUNICATION_SIGNALLING) {
                                return true;
                            }
                        }
                    }
                }
            }

            // 4. Silent or Vibrate mode (Do Not Disturb / Meeting etiquette)
            int ringerMode = am.getRingerMode();
            if (ringerMode == AudioManager.RINGER_MODE_SILENT ||
                ringerMode == AudioManager.RINGER_MODE_VIBRATE) {
                return true;
            }

            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public static synchronized void playWord(Context context, String word) {
        playWord(context, word, null);
    }

    public static synchronized void playWord(Context context, String word, final Runnable onDone) {
        if (context == null || word == null || word.trim().isEmpty()) {
            if (onDone != null) onDone.run();
            return;
        }

        final Context appCtx = context.getApplicationContext();
        final String cleanWord = word.trim();
        final String audioFilename = cleanWord.toLowerCase()
            .replaceAll("[^a-z0-9\\s'-]", "")
            .replaceAll("\\s+", "_") + ".mp3";

        // Stop any previous playback
        stopPlayback();

        // 1. Try playing from bundled APK assets (Elementary US)
        try {
            String assetPath = "public/assets/audio/us/" + audioFilename;
            AssetFileDescriptor afd = appCtx.getAssets().openFd(assetPath);
            MediaPlayer player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .build());
            player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();

            player.setOnCompletionListener(mp -> {
                mp.release();
                if (activePlayer == mp) activePlayer = null;
                if (onDone != null) onDone.run();
            });
            player.setOnErrorListener((mp, what, extra) -> {
                mp.release();
                if (activePlayer == mp) activePlayer = null;
                playViaTts(appCtx, cleanWord, onDone);
                return true;
            });

            player.prepare();
            player.start();
            activePlayer = player;
            return;
        } catch (Exception assetEx) {
            // Asset not pre-packaged (e.g. non-elementary or custom word)
        }

        // 2. Try playing from cached downloaded audio files in internal storage
        try {
            File cacheFile = new File(appCtx.getFilesDir(), "audio_cache/" + audioFilename);
            if (!cacheFile.exists()) {
                cacheFile = new File(appCtx.getCacheDir(), audioFilename);
            }

            if (cacheFile.exists() && cacheFile.length() > 0) {
                MediaPlayer player = new MediaPlayer();
                player.setDataSource(cacheFile.getAbsolutePath());
                player.setOnCompletionListener(mp -> {
                    mp.release();
                    if (activePlayer == mp) activePlayer = null;
                    if (onDone != null) onDone.run();
                });
                player.setOnErrorListener((mp, what, extra) -> {
                    mp.release();
                    if (activePlayer == mp) activePlayer = null;
                    playViaTts(appCtx, cleanWord, onDone);
                    return true;
                });
                player.prepare();
                player.start();
                activePlayer = player;
                return;
            }
        } catch (Exception cacheEx) {}

        // 3. Fallback: Android Text-To-Speech
        playViaTts(appCtx, cleanWord, onDone);
    }

    private static void playViaTts(Context context, String text, final Runnable onDone) {
        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                if (fallbackTts == null) {
                    fallbackTts = new TextToSpeech(context, status -> {
                        if (status == TextToSpeech.SUCCESS) {
                            ttsReady = true;
                            fallbackTts.setLanguage(Locale.US);
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH_MR1) {
                                fallbackTts.setOnUtteranceProgressListener(new android.speech.tts.UtteranceProgressListener() {
                                    @Override
                                    public void onStart(String utteranceId) {}
                                    @Override
                                    public void onDone(String utteranceId) {
                                        if (onDone != null) onDone.run();
                                    }
                                    @Override
                                    public void onError(String utteranceId) {
                                        if (onDone != null) onDone.run();
                                    }
                                });
                            }
                            fallbackTts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "widget_tts");
                        } else {
                            if (onDone != null) onDone.run();
                        }
                    });
                } else if (ttsReady) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH_MR1) {
                        fallbackTts.setOnUtteranceProgressListener(new android.speech.tts.UtteranceProgressListener() {
                            @Override
                            public void onStart(String utteranceId) {}
                            @Override
                            public void onDone(String utteranceId) {
                                if (onDone != null) onDone.run();
                            }
                            @Override
                            public void onError(String utteranceId) {
                                if (onDone != null) onDone.run();
                            }
                        });
                    }
                    fallbackTts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "widget_tts");
                } else {
                    if (onDone != null) onDone.run();
                }
            } catch (Exception e) {
                e.printStackTrace();
                if (onDone != null) onDone.run();
            }
        });
    }

    public static synchronized void stopPlayback() {
        if (activePlayer != null) {
            try {
                if (activePlayer.isPlaying()) {
                    activePlayer.stop();
                }
                activePlayer.release();
            } catch (Exception ignored) {}
            activePlayer = null;
        }
        if (fallbackTts != null) {
            try {
                fallbackTts.stop();
            } catch (Exception ignored) {}
        }
    }

    public static synchronized void playPageTurn(Context context) {
        if (context == null) return;
        try {
            // Respect silent and vibrate modes
            AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            if (am != null) {
                int ringerMode = am.getRingerMode();
                if (ringerMode == AudioManager.RINGER_MODE_SILENT || ringerMode == AudioManager.RINGER_MODE_VIBRATE) {
                    return;
                }
            }
            int resId = context.getResources().getIdentifier("page_turn", "raw", context.getPackageName());
            if (resId != 0) {
                MediaPlayer player = MediaPlayer.create(context.getApplicationContext(), resId);
                if (player != null) {
                    player.setVolume(0.40f, 0.40f);
                    player.setOnCompletionListener(MediaPlayer::release);
                    player.start();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
