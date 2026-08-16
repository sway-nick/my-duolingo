import { renderMultipleChoice, destroyMultipleChoice } from './exercises/MultipleChoice.js?v=8.0';
import { renderSentenceBuilder, destroySentenceBuilder } from './exercises/SentenceBuilder.js?v=8.0';
import { renderListeningExercise, destroyListeningExercise } from './exercises/ListeningExercise.js?v=8.0';
import { renderMatchingPairs, destroyMatchingPairs } from './exercises/MatchingPairs.js?v=8.0';
import { renderFlashcardMode, destroyFlashcardMode } from './exercises/FlashcardMode.js?v=8.0';
import { renderIrregularVerbs, destroyIrregularVerbs } from './exercises/IrregularVerbs.js?v=8.0';

import AudioService from '../services/audioService.js?v=8.0';
import StorageService from '../services/storageService.js?v=8.0';
import { WORDS, IRREGULAR_VERBS, LESSONS } from '../services/initialData.js?v=8.0';

let currentExerciseIndex = 0;
let exerciseQueue = [];
let currentLessonId = null;
let lessonStats = {
    totalCorrect: 0,
    totalWrong: 0,
    mistakesList: [],
    xpEarned: 0,
    timeStarted: null
};

const EXERCISE_TYPES = {
    MC_EN_RU: 'mc_en_ru',
    MC_RU_EN: 'mc_ru_en',
    SENTENCE: 'sentence',
    LISTENING: 'listening',
    FLASHCARD: 'flashcard',
    MATCHING: 'matching',
    IRREGULAR: 'irregular'
};

export function renderLesson(containerOrLessonId, maybeLessonId) {
    let mainContent = document.querySelector('.main-content');
    let lessonId = containerOrLessonId;

    if (containerOrLessonId instanceof HTMLElement) {
        mainContent = containerOrLessonId;
        lessonId = maybeLessonId;
    }

    if (!mainContent) return;
    currentLessonId = lessonId;

    const lessonData = LESSONS.find(l => l.id === lessonId);
    if (!lessonData) {
        console.error('Lesson not found:', lessonId);
        return;
    }

    const lessonWords = lessonData.wordIds.map(id => WORDS.find(w => w.id === id)).filter(Boolean);
    
    // Generate Exercise Queue
    exerciseQueue = generateExerciseQueue(lessonData, lessonWords);
    currentExerciseIndex = 0;
    lessonStats = {
        totalCorrect: 0,
        totalWrong: 0,
        mistakesList: [],
        xpEarned: 0,
        timeStarted: Date.now()
    };

    renderLessonShell(mainContent);
    loadNextExercise();
}

function renderLessonShell(container) {
    container.innerHTML = `
        <div class="lesson-header">
            <button class="lesson-close-btn">✖</button>
            <div class="lesson-progress-bar-container">
                <div class="lesson-progress-bar" style="width: 0%"></div>
            </div>
            <div class="lesson-hearts">❤️ <span id="hearts-count">${StorageService.getHearts()}</span></div>
        </div>
        <div class="exercise-container"></div>
    `;

    container.querySelector('.lesson-close-btn').addEventListener('click', () => {
        if (confirm('Вы уверены? Прогресс будет потерян.')) {
            destroyLesson();
            // Dispatch event to go back to home screen
            document.dispatchEvent(new CustomEvent('lesson-quit'));
        }
    });
}

function loadNextExercise() {
    if (currentExerciseIndex >= exerciseQueue.length) {
        finishLesson();
        return;
    }

    const hearts = StorageService.getHearts();
    if (hearts <= 0) {
        failLesson();
        return;
    }

    // Update progress bar
    const progressPercent = (currentExerciseIndex / exerciseQueue.length) * 100;
    document.querySelector('.lesson-progress-bar').style.width = `${progressPercent}%`;
    document.getElementById('hearts-count').textContent = StorageService.getHearts();

    const container = document.querySelector('.exercise-container');
    container.innerHTML = '';
    
    const exercise = exerciseQueue[currentExerciseIndex];

    // Cleanup previous if any (safeguard)
    destroyAllExercises();

    switch (exercise.type) {
        case EXERCISE_TYPES.MC_EN_RU:
        case EXERCISE_TYPES.MC_RU_EN:
            renderMultipleChoice(container, exercise.data, handleExerciseComplete);
            break;
        case EXERCISE_TYPES.SENTENCE:
            renderSentenceBuilder(container, exercise.data, handleExerciseComplete);
            break;
        case EXERCISE_TYPES.LISTENING:
            renderListeningExercise(container, exercise.data, handleExerciseComplete);
            break;
        case EXERCISE_TYPES.MATCHING:
            renderMatchingPairs(container, exercise.data, handleExerciseComplete);
            break;
        case EXERCISE_TYPES.FLASHCARD:
            renderFlashcardMode(container, exercise.data, handleExerciseComplete);
            break;
        case EXERCISE_TYPES.IRREGULAR:
            renderIrregularVerbs(container, exercise.data, handleExerciseComplete);
            break;
    }
}

function handleExerciseComplete(result) {
    if (result.correct) {
        lessonStats.totalCorrect++;
        lessonStats.xpEarned += 10;
        // Optionally update SRS progress via StorageService
    } else {
        lessonStats.totalWrong++;
        StorageService.loseHeart();
        
        if (result.word) {
            lessonStats.mistakesList.push(result.word);
        } else if (result.sentence) {
            lessonStats.mistakesList.push(result.sentence);
        }
        
        // Insert failed exercise at the end of the queue so they have to repeat it
        // exerciseQueue.push(exerciseQueue[currentExerciseIndex]);
    }

    currentExerciseIndex++;
    loadNextExercise();
}

function finishLesson() {
    destroyAllExercises();
    StorageService.addXP(lessonStats.xpEarned);
    if (currentLessonId) {
        StorageService.completeLesson(currentLessonId, {
            score: lessonStats.totalCorrect,
            stars: lessonStats.totalWrong === 0 ? 3 : (lessonStats.totalWrong <= 2 ? 2 : 1),
            perfect: lessonStats.totalWrong === 0
        });
    }
    
    const timeTaken = Math.max(1, Math.round((Date.now() - (lessonStats.timeStarted || Date.now())) / 1000));
    
    // Dispatch completion event with results wrapper
    document.dispatchEvent(new CustomEvent('lesson-complete', {
        detail: {
            results: {
                xpEarned: lessonStats.xpEarned,
                totalCorrect: lessonStats.totalCorrect,
                totalWrong: lessonStats.totalWrong,
                mistakes: lessonStats.mistakesList,
                lessonId: currentLessonId,
                timeTaken
            }
        }
    }));
}

function failLesson() {
    destroyAllExercises();
    alert('У вас закончились жизни! Попробуйте позже.');
    document.dispatchEvent(new CustomEvent('lesson-quit'));
}

export function destroyLesson() {
    destroyAllExercises();
    // Additional lesson cleanup if needed
}

function destroyAllExercises() {
    destroyMultipleChoice();
    destroySentenceBuilder();
    destroyListeningExercise();
    destroyMatchingPairs();
    destroyFlashcardMode();
    destroyIrregularVerbs();
}

// ---- Exercise Generators ----

function generateExerciseQueue(lesson, words) {
    const queue = [];

    // Always add a matching pairs at the beginning if enough words
    if (words.length >= 4) {
        const pairs = words.slice(0, 5).map(w => ({ word: w.word, translation: w.translation }));
        queue.push({ type: EXERCISE_TYPES.MATCHING, data: { pairs } });
    }

    words.forEach(word => {
        // Flashcard intro
        queue.push({ type: EXERCISE_TYPES.FLASHCARD, data: { word } });

        // Multiple choice EN -> RU
        queue.push({
            type: EXERCISE_TYPES.MC_EN_RU,
            data: generateMultipleChoiceData(word, words, 'en-ru')
        });

        // Multiple choice RU -> EN
        if (Math.random() > 0.5) {
            queue.push({
                type: EXERCISE_TYPES.MC_RU_EN,
                data: generateMultipleChoiceData(word, words, 'ru-en')
            });
        }

        // Listening
        if (Math.random() > 0.5) {
            queue.push({ type: EXERCISE_TYPES.LISTENING, data: { word } });
        }

        // Sentence Builder
        if (word.example && word.exampleTranslation) {
            queue.push({
                type: EXERCISE_TYPES.SENTENCE,
                data: generateSentenceData(word.example, word.exampleTranslation)
            });
        }
    });

    // Add Irregular Verbs if applicable
    if (lesson.id.includes('irregular')) {
        const verbs = IRREGULAR_VERBS || [];
        verbs.slice(0, 3).forEach(verb => {
            queue.push({
                type: EXERCISE_TYPES.IRREGULAR,
                data: { verb, hiddenForms: [1, 2] } // Past & Participle hidden
            });
        });
    }

    // Shuffle queue (keep matching pair at index 0 if it exists)
    const first = queue[0].type === EXERCISE_TYPES.MATCHING ? queue.shift() : null;
    shuffleArray(queue);
    if (first) queue.unshift(first);

    // Limit to ~12 exercises to avoid long lessons
    return queue.slice(0, 12);
}

function generateMultipleChoiceData(targetWord, allWords, direction) {
    const isEnRu = direction === 'en-ru';
    const correctAnswer = isEnRu ? targetWord.translation : targetWord.word;
    
    // Pick 3 random wrong options
    const wrongOptions = [];
    const pool = [...WORDS].filter(w => w.id !== targetWord.id);
    shuffleArray(pool);
    
    for (let i = 0; i < 3 && i < pool.length; i++) {
        wrongOptions.push(isEnRu ? pool[i].translation : pool[i].word);
    }

    const options = [correctAnswer, ...wrongOptions];
    shuffleArray(options);
    
    return {
        word: targetWord,
        options,
        correctIndex: options.indexOf(correctAnswer),
        direction
    };
}

function generateSentenceData(sentence, translation) {
    // Basic tokenizer
    const words = sentence.replace(/[.,!?]/g, '').split(' ').filter(Boolean);
    shuffleArray(words);
    return { sentence, translation, words };
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
