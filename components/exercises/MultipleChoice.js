import AudioService from '../../services/audioService.js?v=8.0';

let currentKeyHandler = null;

export function renderMultipleChoice(container, exerciseData, onComplete) {
    container.innerHTML = '';
    const { word, options, correctIndex, direction } = exerciseData;
    let isAnswered = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'mc-container';

    // Prompt area
    const prompt = document.createElement('div');
    prompt.className = 'mc-prompt';
    prompt.textContent = direction === 'en-ru' ? word.word : word.translation;
    wrapper.appendChild(prompt);

    // Audio button for English words
    if (direction === 'en-ru' || direction === 'listening') {
        const audioBtn = document.createElement('button');
        audioBtn.className = 'audio-button';
        audioBtn.textContent = '🔊';
        audioBtn.addEventListener('click', () => {
            AudioService.speak(word.word);
        });
        prompt.appendChild(audioBtn);
    }

    // Options grid
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'mc-options';

    options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'mc-option';
        btn.textContent = `${idx + 1}. ${opt}`;
        
        btn.addEventListener('click', () => handleSelect(idx, btn));
        optionsGrid.appendChild(btn);
    });

    wrapper.appendChild(optionsGrid);

    // Feedback bar
    const feedbackBar = document.createElement('div');
    feedbackBar.className = 'feedback-bar hidden';
    wrapper.appendChild(feedbackBar);

    container.appendChild(wrapper);

    // Selection handler
    function handleSelect(idx, btn) {
        if (isAnswered) return;
        isAnswered = true;

        const allOptions = optionsGrid.querySelectorAll('.mc-option');
        allOptions.forEach(b => b.disabled = true);

        if (idx === correctIndex) {
            btn.classList.add('correct');
            AudioService.playCorrect();
            showFeedback(true, 'Правильно!');
            
            setTimeout(() => {
                destroyMultipleChoice();
                onComplete({ correct: true, word });
            }, 1200);
        } else {
            btn.classList.add('wrong');
            allOptions[correctIndex].classList.add('correct');
            AudioService.playWrong();
            showFeedback(false, `Неправильно. Правильный ответ: ${options[correctIndex]}`);
            
            setTimeout(() => {
                destroyMultipleChoice();
                onComplete({ correct: false, word, userAnswer: options[idx], correctAnswer: options[correctIndex] });
            }, 2000);
        }
    }

    function showFeedback(isCorrect, text) {
        feedbackBar.textContent = text;
        feedbackBar.className = `feedback-bar ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
    }

    // Keyboard support
    currentKeyHandler = (e) => {
        if (isAnswered) return;
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4 && num <= options.length) {
            const btn = optionsGrid.children[num - 1];
            handleSelect(num - 1, btn);
        }
    };
    document.addEventListener('keydown', currentKeyHandler);
}

export function destroyMultipleChoice() {
    if (currentKeyHandler) {
        document.removeEventListener('keydown', currentKeyHandler);
        currentKeyHandler = null;
    }
}
