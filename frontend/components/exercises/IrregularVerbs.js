import AudioService from '../../services/audioService.js?v=8.0';

let currentKeyHandler = null;

export function renderIrregularVerbs(container, exerciseData, onComplete) {
    container.innerHTML = '';
    const { verb, hiddenForms } = exerciseData;
    let isAnswered = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'iv-container';

    // Hint area
    const prompt = document.createElement('div');
    prompt.className = 'iv-prompt';
    
    const translationTitle = document.createElement('h3');
    translationTitle.textContent = verb.translation;
    prompt.appendChild(translationTitle);

    if (verb.hint) {
        const hintText = document.createElement('p');
        hintText.className = 'iv-hint';
        hintText.textContent = verb.hint;
        prompt.appendChild(hintText);
    }

    const audioBtn = document.createElement('button');
    audioBtn.className = 'audio-button';
    audioBtn.textContent = '🔊';
    audioBtn.addEventListener('click', () => {
        // Play all forms sequentially
        const text = `${verb.infinitive}. ${verb.pastSimple}. ${verb.pastParticiple}.`;
        AudioService.speak(text);
    });
    prompt.appendChild(audioBtn);
    wrapper.appendChild(prompt);

    // Forms Table
    const tableDiv = document.createElement('div');
    tableDiv.className = 'iv-table';

    const headers = ['Infinitive', 'Past Simple', 'Past Participle'];
    const correctForms = [verb.infinitive, verb.pastSimple, verb.pastParticiple];
    const inputs = [];

    for (let i = 0; i < 3; i++) {
        const col = document.createElement('div');
        col.className = 'iv-col';
        
        const header = document.createElement('div');
        header.className = 'iv-header';
        header.textContent = headers[i];
        col.appendChild(header);

        if (hiddenForms.includes(i)) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'iv-input';
            input.dataset.index = i;
            col.appendChild(input);
            inputs.push(input);
        } else {
            const staticText = document.createElement('div');
            staticText.className = 'iv-static';
            staticText.textContent = correctForms[i];
            col.appendChild(staticText);
        }
        
        tableDiv.appendChild(col);
    }

    wrapper.appendChild(tableDiv);

    // Check Button
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

    if (inputs.length > 0) {
        inputs[0].focus();
    }

    // Enter key support
    currentKeyHandler = (e) => {
        if (e.key === 'Enter' && !isAnswered) {
            handleCheck();
        }
    };
    document.addEventListener('keydown', currentKeyHandler);

    function handleCheck() {
        if (isAnswered) return;
        
        // Ensure all inputs have some text before checking
        const anyEmpty = inputs.some(inp => inp.value.trim() === '');
        if (anyEmpty) return;

        isAnswered = true;
        checkBtn.disabled = true;

        let allCorrect = true;

        inputs.forEach(input => {
            const idx = parseInt(input.dataset.index);
            const userVal = input.value.trim().toLowerCase();
            const correctVal = correctForms[idx].toLowerCase();
            
            // Handle variants like "was/were"
            const correctVariants = correctVal.split('/').map(v => v.trim());
            const isMatch = correctVariants.includes(userVal) || userVal === correctVal;

            if (isMatch) {
                input.classList.add('correct');
            } else {
                input.classList.add('wrong');
                allCorrect = false;
                
                // Show correction below input
                const correction = document.createElement('div');
                correction.className = 'iv-correction';
                correction.textContent = correctForms[idx];
                input.parentNode.appendChild(correction);
            }
            input.disabled = true;
        });

        if (allCorrect) {
            AudioService.playCorrect();
            showFeedback(true, 'Отлично!');
        } else {
            AudioService.playWrong();
            showFeedback(false, 'Есть ошибки. Посмотрите правильные ответы.');
        }

        setTimeout(() => {
            destroyIrregularVerbs();
            onComplete({ correct: allCorrect, verb });
        }, 2500);
    }

    function showFeedback(isCorrect, text) {
        feedbackBar.textContent = text;
        feedbackBar.className = `feedback-bar ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
    }
}

export function destroyIrregularVerbs() {
    if (currentKeyHandler) {
        document.removeEventListener('keydown', currentKeyHandler);
        currentKeyHandler = null;
    }
}
