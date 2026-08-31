import sounddevice as sd
import numpy as np
import wave
import subprocess
import time
import re
import os
import sys
from difflib import SequenceMatcher

# Обеспечиваем корректную работу с UTF-8 / эмодзи в любой консоли Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


# ============================================================
# НАСТРОЙКИ
# ============================================================

BASE_DIR = r"C:\EnglishBreakfast\Whisper"

WHISPER_EXE = os.path.join(BASE_DIR, r"bin\Release\whisper-cli.exe")

# Основная рабочая модель — q5_1 (квантованная)
MODEL = os.path.join(BASE_DIR, r"whisper.cpp\ggml-base.en-q5_1.bin")

AUDIO_FILE = os.path.join(BASE_DIR, "check_word.wav")

# Микрофон
MICROPHONE = 1

SAMPLE_RATE = 16000

# Максимальная длительность записи (сек)
MAX_DURATION = 3.0

# Минимальная громкость (RMS), при которой считаем, что началась речь
SPEECH_THRESHOLD = 0.005

# Сколько секунд тишины после речи считать концом слова
SILENCE_DURATION = 0.55

# Запас тишины после окончания речи (сек)
PADDING_END_DURATION = 0.15

# Размер одного блока записи
BLOCK_SIZE = 1024


# ============================================================
# НОРМАЛИЗАЦИЯ ТЕКСТА WHISPER
# ============================================================

def normalize_text(text: str) -> str:
    """
    Приводит текст к нормализованному виду:
    - lowercase
    - strip пробелов в начале и конце
    - удаление стандартной пунктуации
    - замена последовательности пробелов одним пробелом
    """
    if not text:
        return ""

    text = text.lower().strip()

    # Убираем возможные служебные теги в скобках [blank_audio] и т.д.
    text = re.sub(r"\[.*?\]", "", text)

    # Убираем стандартную пунктуацию
    text = re.sub(r"[.,!?;:'\"()\[\]{}\-–—/\\_~`@#$%^&*+=<>|]", "", text)

    # Убираем лишние пробелы
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# ЗАПИСЬ РЕЧИ С МИКРОФОНА
# ============================================================

def record_speech(
    audio_file: str = AUDIO_FILE,
    sample_rate: int = SAMPLE_RATE,
    mic_device: int = MICROPHONE,
    max_duration: float = MAX_DURATION,
    speech_threshold: float = SPEECH_THRESHOLD,
    silence_duration: float = SILENCE_DURATION,
    padding_end: float = PADDING_END_DURATION,
    block_size: int = BLOCK_SIZE,
) -> str | None:
    """
    Записывает аудио с микрофона:
    - ожидает начала речи по SPEECH_THRESHOLD (RMS)
    - останавливает запись при тишине SILENCE_DURATION после начала речи или по MAX_DURATION
    - добавляет небольшой запас тишины PADDING_END_DURATION в конце
    - сохраняет mono, 16 kHz, 16-bit PCM WAV
    """
    print()
    print("🎤 Слушаю...")

    audio_chunks = []
    speech_started = False
    silence_time = 0.0
    start_time = time.time()

    def callback(indata, frames, time_info, status):
        nonlocal speech_started, silence_time

        audio_block = indata[:, 0].copy()
        audio_chunks.append(audio_block)

        rms = np.sqrt(np.mean(audio_block.astype(np.float64) ** 2))

        # ----------------------------------------------------
        # Обнаружение речи
        # ----------------------------------------------------
        if rms >= speech_threshold:
            if not speech_started:
                speech_started = True
                print("🗣 Речь обнаружена...")
            silence_time = 0.0
        elif speech_started:
            silence_time += frames / sample_rate

    try:
        with sd.InputStream(
            samplerate=sample_rate,
            channels=1,
            dtype="float32",
            blocksize=block_size,
            device=mic_device,
            callback=callback,
        ):
            while True:
                elapsed = time.time() - start_time

                if elapsed >= max_duration:
                    break

                if speech_started and silence_time >= silence_duration:
                    break

                time.sleep(0.01)
    except Exception as e:
        print()
        print(f"❌ Ошибка аудиоустройства (микрофон {mic_device}): {e}")
        return None

    print("⏹ Конец речи.")

    if not speech_started:
        print("⚠ Речь не обнаружена.")
        return None

    audio = np.concatenate(audio_chunks)

    # Обрезаем максимальную длительность
    max_samples = int(max_duration * sample_rate)
    audio = audio[:max_samples]

    # Добавляем небольшой запас тишины в конце (0.15 сек)
    if padding_end > 0:
        padding = np.zeros(int(padding_end * sample_rate), dtype=np.float32)
        audio = np.concatenate([audio, padding])

    # Конвертируем в 16-bit PCM
    audio_int16 = np.clip(audio * 32767, -32768, 32767).astype(np.int16)

    # Сохраняем WAV
    os.makedirs(os.path.dirname(os.path.abspath(audio_file)), exist_ok=True)
    with wave.open(audio_file, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(audio_int16.tobytes())

    duration = len(audio) / sample_rate
    rms_total = np.sqrt(np.mean(audio.astype(np.float64) ** 2))
    peak_total = np.max(np.abs(audio))

    print()
    print(f"💾 Записано: {duration:.2f} сек")
    print(f"🎚 RMS: {rms_total:.5f}")
    print(f"📈 Peak: {peak_total:.5f}")
    print(f"📁 {audio_file}")

    return audio_file


# ============================================================
# РАСПОЗНАВАНИЕ WHISPER
# ============================================================

def recognize(
    audio_file: str,
    whisper_exe: str = WHISPER_EXE,
    model_path: str = MODEL,
) -> tuple[str, float, str]:
    """
    Вызывает локальный whisper-cli.exe:
    whisper-cli.exe -m MODEL -f AUDIO -l en -np -nt

    Возвращает:
    (clean_text, elapsed_seconds, raw_output)
    """
    print()
    print("🧠 Whisper распознаёт...")

    command = [
        whisper_exe,
        "-m",
        model_path,
        "-f",
        audio_file,
        "-l",
        "en",
        "-np",
        "-nt",
    ]

    start = time.perf_counter()

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
    except Exception as e:
        print()
        print(f"❌ Ошибка запуска Whisper: {e}")
        return "", 0.0, ""

    elapsed = time.perf_counter() - start
    raw_text = (result.stdout or "").strip()

    # Фильтруем технический вывод Whisper
    lines = []
    for line in raw_text.splitlines():
        line_clean = line.strip()
        if not line_clean:
            continue

        # Пропускаем служебные логи whisper.cpp
        if (
            line_clean.startswith("load_backend:")
            or line_clean.startswith("whisper_")
            or line_clean.startswith("system_info:")
            or line_clean.startswith("read_audio_data:")
            or line_clean.startswith("main:")
            or line_clean.startswith("output_score:")
            or line_clean.startswith("ggml_")
            or line_clean.startswith("[")
        ):
            continue

        lines.append(line_clean)

    text = " ".join(lines).strip()
    return text, elapsed, raw_text


# ============================================================
# ПРОВЕРКА ОДНОГО СЛОВА
# ============================================================

def check_word_detailed(
    target_word: str,
    whisper_text: str,
    whisper_time: float = 0.0,
    raw_output: str = "",
) -> dict:
    """
    Выполняет полную проверку произношения одного целевого слова.

    Правила:
    1. И target, и heard нормализуются.
    2. heard должен состоять ровно из ОДНОГО слова.
    3. Точное совпадение: target == heard -> OK
    4. Мягкое сравнение через difflib.SequenceMatcher:
       - len(target) <= 4: порог 0.80
       - len(target) <= 6: порог 0.75
       - иначе: порог 0.70
       similarity >= threshold -> OK

    Возвращает словарь с полной диагностической информацией.
    """
    target = normalize_text(target_word)
    heard = normalize_text(whisper_text)

    # Проверяем, состоит ли heard ровно из одного слова
    words = heard.split() if heard else []
    is_single_word = len(words) == 1

    exact_match = False
    similarity = 0.0
    threshold = 0.80
    passed = False
    reason = ""

    if not heard:
        passed = False
        reason = "Whisper не распознал речь (пустой результат)."
    elif not is_single_word:
        passed = False
        reason = f"Whisper вернул {len(words)} слов(а), требуется ровно одно слово."
    else:
        # Вычисляем порог в зависимости от длины слова
        if len(target) <= 4:
            threshold = 0.80
        elif len(target) <= 6:
            threshold = 0.75
        else:
            threshold = 0.70

        # Точное совпадение
        if heard == target:
            exact_match = True
            similarity = 1.0
            passed = True
            reason = "Точное совпадение целевого слова."
        else:
            # Мягкое сравнение написания
            similarity = SequenceMatcher(None, target, heard).ratio()
            if similarity >= threshold:
                passed = True
                reason = f"Мягкое совпадение (схожесть {similarity:.2f} >= {threshold:.2f})."
            else:
                passed = False
                reason = f"Слово не совпадает (схожесть {similarity:.2f} < {threshold:.2f})."

    diagnostics = {
        "target_raw": target_word,
        "target": target,
        "whisper_raw": raw_output if raw_output else whisper_text,
        "heard_clean": whisper_text,
        "heard": heard,
        "is_single_word": is_single_word,
        "exact_match": exact_match,
        "similarity": similarity,
        "threshold": threshold,
        "passed": passed,
        "reason": reason,
        "whisper_time": whisper_time,
    }

    return diagnostics


def check_word(target_word: str, whisper_text: str) -> bool:
    """
    Базовая функция проверки соответствия слова (True/False).
    """
    diag = check_word_detailed(target_word, whisper_text)
    return diag["passed"]


# ============================================================
# ВЫВОД РЕЗУЛЬТАТА ДЛЯ ПОЛЬЗОВАТЕЛЯ
# ============================================================

def display_result(diagnostic: dict):
    """
    Отображает понятный пользовательский интерфейс с результатами проверки.
    """
    print()
    print()
    print("=" * 59)
    print("                       РЕЗУЛЬТАТ")
    print("=" * 59)
    print()
    print(f"🎯 Нужно сказать: {diagnostic['target']}")
    print(f"👂 Whisper услышал: {diagnostic['heard'] if diagnostic['heard'] else '[ничего]'}")
    print()

    if diagnostic["passed"]:
        print("✅ СЛОВО НАЙДЕНО")
        print()
        print("Правильное слово распознано Whisper.")
    else:
        print("❌ СЛОВО НЕ НАЙДЕНО")
        print()
        print("Whisper не распознал целевое слово.")

    print()
    print(f"⏱ Время Whisper: {diagnostic['whisper_time']:.2f} сек")
    print("=" * 59)


# ============================================================
# MAIN
# ============================================================

def main():
    print()
    print("=" * 59)
    print("              ENGLISH BREAKFAST")
    print("             ПРОВЕРКА ОДНОГО СЛОВА")
    print("=" * 59)

    target_word = input("🎯 Введите английское слово: ").strip()

    if not target_word:
        print("❌ Слово не введено.")
        return

    print()
    print(f"🎯 Целевое слово: {target_word}")

    input("\nНажми ENTER...")

    # 1. Запись с микрофона
    audio_file = record_speech()

    if audio_file is None:
        return

    # 2. Распознавание Whisper
    whisper_text, whisper_time, raw_output = recognize(audio_file)

    # 3. Детальная проверка
    diagnostic = check_word_detailed(
        target_word=target_word,
        whisper_text=whisper_text,
        whisper_time=whisper_time,
        raw_output=raw_output,
    )

    # 4. Отображение результата пользователю
    display_result(diagnostic)


if __name__ == "__main__":
    main()
