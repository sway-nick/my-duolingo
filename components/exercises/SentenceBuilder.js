import AudioService from '../../services/audioService.js?v=200.0';

export function renderSentenceBuilder(container, exerciseData, onComplete) {
    container.innerHTML = '';
    const { sentence, translation, words } = exerciseData;
    let isAnswered = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'sb-container';

    // Prompt area
    const prompt = document.createElement('div');
    prompt.className = 'sb-prompt';
    prompt.textContent = translation;
    
    const audioBtn = document.createElement('button');
    audioBtn.className = 'audio-button';
    audioBtn.textContent = '🔊';
    audioBtn.addEventListener('click', () => AudioService.speak(sentence));
    prompt.appendChild(audioBtn);
    wrapper.appendChild(prompt);

    // Answer area
    const answerArea = document.createElement('div');
    answerArea.className = 'sb-answer-area';
    wrapper.appendChild(answerArea);

    // Word bank
    const wordBank = document.createElement('div');
    wordBank.className = 'sb-word-bank';
    
    words.forEach((wordText, index) => {
        const tile = document.createElement('button');
        tile.className = 'sb-tile';
        tile.textContent = wordText;
        tile.dataset.index = index;
        
        tile.addEventListener('click', () => {
            if (isAnswered || tile.classList.contains('used')) return;
            
            // Mark as used in bank
            tile.classList.add('used');
            
            // Add clone to answer area
            const answerTile = document.createElement('button');
            answerTile.className = 'sb-tile placed';
            answerTile.textContent = wordText;
            answerTile.dataset.bankIndex = index;
            
            answerTile.addEventListener('click', () => {
                if (isAnswered) return;
                answerArea.removeChild(answerTile);
                tile.classList.remove('used');
                updateCheckButton();
            });
            
            answerArea.appendChild(answerTile);
            updateCheckButton();
        });
        
        wordBank.appendChild(tile);
    });
    wrapper.appendChild(wordBank);

    // Check Button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'check-button';
    checkBtn.textContent = 'Проверить';
    checkBtn.disabled = true;
    checkBtn.addEventListener('click', handleCheck);
    wrapper.appendChild(checkBtn);

    // Feedback bar
    const feedbackBar = document.createElement('div');
    feedbackBar.className = 'feedback-bar hidden';
    wrapper.appendChild(feedbackBar);

    container.appendChild(wrapper);

    function updateCheckButton() {
        const hasWords = answerArea.children.length > 0;
        checkBtn.disabled = !hasWords;
    }

    function handleCheck() {
        if (isAnswered) return;
        isAnswered = true;
        checkBtn.disabled = true;

        const placedTiles = Array.from(answerArea.children);
        const userAnswer = placedTiles.map(t => t.textContent).join(' ');
        
        // Remove punctuation and case for comparison
        const cleanUserAnswer = userAnswer.replace(/[.,!?]/g, '').toLowerCase().trim();
        const cleanCorrectAnswer = sentence.replace(/[.,!?]/g, '').toLowerCase().trim();

        if (cleanUserAnswer === cleanCorrectAnswer) {
            AudioService.playCorrect();
            showFeedback(true, 'Отлично!');
            setTimeout(() => {
                onComplete({ correct: true, sentence });
            }, 1200);
        } else {
            AudioService.playWrong();
            showFeedback(false, `Неправильно. Правильный ответ: ${sentence}`);
            setTimeout(() => {
                onComplete({ correct: false, sentence, userAnswer, correctAnswer: sentence });
            }, 2500);
        }
    }

    function showFeedback(isCorrect, text) {
        feedbackBar.textContent = text;
        feedbackBar.className = `feedback-bar ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
    }
}

export function destroySentenceBuilder() {
    // Event listeners attached to dynamically created DOM nodes will be GC'd when removed
}
