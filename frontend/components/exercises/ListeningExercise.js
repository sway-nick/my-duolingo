import AudioService from '../../services/audioService.js?v=8.0';

let currentKeyHandler = null;

function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

export function renderListeningExercise(container, exerciseData, onComplete) {
    container.innerHTML = '';
    const { word } = exerciseData;
    let isAnswered = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'listening-container';

    // Playback controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'listening-controls';

    const mainSpeakerBtn = document.createElement('button');
    mainSpeakerBtn.className = 'listening-prompt';
    mainSpeakerBtn.textContent = '🔊';
    mainSpeakerBtn.addEventListener('click', () => AudioService.speak(word.word));
    controlsDiv.appendChild(mainSpeakerBtn);

    const slowSpeakerBtn = document.createElement('button');
    slowSpeakerBtn.className = 'listening-slow-btn';
    slowSpeakerBtn.textContent = '🐢';
    slowSpeakerBtn.addEventListener('click', () => AudioService.speak(word.word, true));
    controlsDiv.appendChild(slowSpeakerBtn);

    wrapper.appendChild(controlsDiv);

    // Input field
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.className = 'listening-input';
    inputField.placeholder = 'Введите услышанное слово';
    wrapper.appendChild(inputField);

    // Check button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'check-button';
    checkBtn.textContent = 'Проверить';
    checkBtn.addEventListener('click', handleCheck);
    wrapper.appendChild(checkBtn);

    // Feedback bar
    const feedbackBar = document.createElement('div');
    feedbackBar.className = 'feedback-bar hidden';
    wrapper.appendChild(feedbackBar);

    container.appendChild(wrapper);

    // Auto-play on render
    setTimeout(() => {
        AudioService.speak(word.word);
    }, 300);

    // Support Enter key
    currentKeyHandler = (e) => {
        if (e.key === 'Enter' && !isAnswered) {
            handleCheck();
        }
    };
    document.addEventListener('keydown', currentKeyHandler);
    
    // Focus input immediately
    inputField.focus();

    function handleCheck() {
        if (isAnswered) return;
        
        const userInput = inputField.value.trim().toLowerCase();
        const correctAnswer = word.word.trim().toLowerCase();
        
        if (!userInput) return; // Don't check empty
        
        isAnswered = true;
        checkBtn.disabled = true;
        inputField.disabled = true;

        const distance = levenshtein(userInput, correctAnswer);

        if (distance === 0) {
            AudioService.playCorrect();
            showFeedback(true, 'Отлично!');
            setTimeout(() => {
                destroyListeningExercise();
                onComplete({ correct: true, word });
            }, 1200);
        } else if (distance <= 1 && correctAnswer.length >= 4) {
            // Allow minor typos for words 4+ letters
            AudioService.playCorrect();
            showFeedback(true, `Почти правильно! Правильное написание: ${word.word}`);
            setTimeout(() => {
                destroyListeningExercise();
                onComplete({ correct: true, word, typo: true });
            }, 2500);
        } else {
            AudioService.playWrong();
            showFeedback(false, `Неправильно. Правильное написание: ${word.word}`);
            setTimeout(() => {
                destroyListeningExercise();
                onComplete({ correct: false, word, userAnswer: userInput, correctAnswer: word.word });
            }, 2500);
        }
    }

    function showFeedback(isCorrect, text) {
        feedbackBar.textContent = text;
        feedbackBar.className = `feedback-bar ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
    }
}

export function destroyListeningExercise() {
    if (currentKeyHandler) {
        document.removeEventListener('keydown', currentKeyHandler);
        currentKeyHandler = null;
    }
}
