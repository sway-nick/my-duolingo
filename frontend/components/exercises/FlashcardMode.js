import AudioService from '../../services/audioService.js?v=7.0';

let currentKeyHandler = null;

export function renderFlashcardMode(container, exerciseData, onComplete) {
    container.innerHTML = '';
    const { word } = exerciseData;
    let isFlipped = false;
    let isAnswered = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'flashcard-wrapper';

    // 3D Card Container
    const cardContainer = document.createElement('div');
    cardContainer.className = 'flashcard-container';

    const card = document.createElement('div');
    card.className = 'flashcard';

    // Front Face (English)
    const front = document.createElement('div');
    front.className = 'flashcard-front';
    
    const frontWord = document.createElement('h2');
    frontWord.textContent = word.word;
    front.appendChild(frontWord);

    if (word.transcription) {
        const frontTrans = document.createElement('div');
        frontTrans.className = 'transcription';
        frontTrans.textContent = word.transcription;
        front.appendChild(frontTrans);
    }

    const frontAudioBtn = document.createElement('button');
    frontAudioBtn.className = 'audio-button';
    frontAudioBtn.textContent = '🔊';
    frontAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        AudioService.speak(word.word);
    });
    front.appendChild(frontAudioBtn);

    // Back Face (Russian + Example)
    const back = document.createElement('div');
    back.className = 'flashcard-back';
    
    const backTrans = document.createElement('h2');
    backTrans.textContent = word.translation;
    back.appendChild(backTrans);

    if (word.example) {
        const backExample = document.createElement('div');
        backExample.className = 'example';
        backExample.textContent = word.example;
        back.appendChild(backExample);
    }

    const backAudioBtn = document.createElement('button');
    backAudioBtn.className = 'audio-button';
    backAudioBtn.textContent = '🔊';
    backAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        AudioService.speak(word.word); // Speak English word on back too
    });
    back.appendChild(backAudioBtn);

    card.appendChild(front);
    card.appendChild(back);
    cardContainer.appendChild(card);
    wrapper.appendChild(cardContainer);

    // SRS Buttons (Hidden initially)
    const srsButtons = document.createElement('div');
    srsButtons.className = 'srs-buttons hidden';

    const btnForgot = document.createElement('button');
    btnForgot.className = 'srs-btn srs-forgot';
    btnForgot.textContent = 'Не помню 😞';
    btnForgot.addEventListener('click', () => handleSRS('forgot'));

    const btnHard = document.createElement('button');
    btnHard.className = 'srs-btn srs-hard';
    btnHard.textContent = 'Трудно 🤔';
    btnHard.addEventListener('click', () => handleSRS('hard'));

    const btnEasy = document.createElement('button');
    btnEasy.className = 'srs-btn srs-easy';
    btnEasy.textContent = 'Легко 😊';
    btnEasy.addEventListener('click', () => handleSRS('easy'));

    srsButtons.appendChild(btnForgot);
    srsButtons.appendChild(btnHard);
    srsButtons.appendChild(btnEasy);
    wrapper.appendChild(srsButtons);

    container.appendChild(wrapper);

    // Flip Logic
    function flipCard() {
        if (isFlipped || isAnswered) return;
        isFlipped = true;
        card.classList.add('flipped');
        srsButtons.classList.remove('hidden');
    }

    cardContainer.addEventListener('click', flipCard);

    currentKeyHandler = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!isFlipped) {
                flipCard();
            }
        }
    };
    document.addEventListener('keydown', currentKeyHandler);

    function handleSRS(difficulty) {
        if (isAnswered) return;
        isAnswered = true;
        
        let correct = difficulty !== 'forgot';
        
        if (correct) {
            AudioService.playCorrect();
        } else {
            AudioService.playWrong();
        }

        setTimeout(() => {
            destroyFlashcardMode();
            onComplete({ correct, difficulty, word });
        }, 300);
    }
}

export function destroyFlashcardMode() {
    if (currentKeyHandler) {
        document.removeEventListener('keydown', currentKeyHandler);
        currentKeyHandler = null;
    }
}
