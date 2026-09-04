import AudioService from '../../services/audioService.js?v=200.0';

export function renderMatchingPairs(container, exerciseData, onComplete) {
    container.innerHTML = '';
    const { pairs } = exerciseData;
    let selectedLeft = null;
    let selectedRight = null;
    let matchedCount = 0;
    let wrongAttemptCount = 0;
    const totalPairs = pairs.length;

    // Create left/right lists and shuffle
    const leftItems = pairs.map((p, idx) => ({ id: idx, text: p.word, side: 'left' }));
    const rightItems = pairs.map((p, idx) => ({ id: idx, text: p.translation, side: 'right' }));

    shuffleArray(leftItems);
    shuffleArray(rightItems);

    const wrapper = document.createElement('div');
    wrapper.className = 'mp-container';

    const grid = document.createElement('div');
    grid.className = 'mp-grid';

    const leftCol = document.createElement('div');
    leftCol.className = 'mp-col';
    const rightCol = document.createElement('div');
    rightCol.className = 'mp-col';

    const cardElements = { left: {}, right: {} };

    leftItems.forEach(item => {
        const card = createCard(item);
        cardElements.left[item.id] = card;
        leftCol.appendChild(card);
    });

    rightItems.forEach(item => {
        const card = createCard(item);
        cardElements.right[item.id] = card;
        rightCol.appendChild(card);
    });

    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    wrapper.appendChild(grid);
    container.appendChild(wrapper);

    function createCard(item) {
        const btn = document.createElement('button');
        btn.className = 'mp-card';
        btn.textContent = item.text;
        
        btn.addEventListener('click', () => handleCardClick(item, btn));
        return btn;
    }

    function handleCardClick(item, cardBtn) {
        if (cardBtn.classList.contains('matched') || cardBtn.classList.contains('wrong')) return;

        // Deselect if already selected
        if (cardBtn.classList.contains('selected')) {
            cardBtn.classList.remove('selected');
            if (item.side === 'left') selectedLeft = null;
            else selectedRight = null;
            return;
        }

        // Apply selection
        if (item.side === 'left') {
            if (selectedLeft) cardElements.left[selectedLeft.id].classList.remove('selected');
            selectedLeft = item;
            cardBtn.classList.add('selected');
        } else {
            if (selectedRight) cardElements.right[selectedRight.id].classList.remove('selected');
            selectedRight = item;
            cardBtn.classList.add('selected');
        }

        // Check match if both selected
        if (selectedLeft !== null && selectedRight !== null) {
            checkMatch();
        }
    }

    function checkMatch() {
        const leftId = selectedLeft.id;
        const rightId = selectedRight.id;
        const leftCard = cardElements.left[leftId];
        const rightCard = cardElements.right[rightId];

        selectedLeft = null;
        selectedRight = null;

        if (leftId === rightId) {
            // Match
            leftCard.classList.remove('selected');
            rightCard.classList.remove('selected');
            leftCard.classList.add('matched');
            rightCard.classList.add('matched');
            AudioService.playCorrect(); // Or playClick

            matchedCount++;
            
            setTimeout(() => {
                leftCard.style.visibility = 'hidden';
                rightCard.style.visibility = 'hidden';
                
                if (matchedCount === totalPairs) {
                    AudioService.playCorrect();
                    setTimeout(() => {
                        onComplete({ correct: true, mistakes: wrongAttemptCount });
                    }, 500);
                }
            }, 500);
        } else {
            // Wrong match
            wrongAttemptCount++;
            leftCard.classList.remove('selected');
            rightCard.classList.remove('selected');
            leftCard.classList.add('wrong');
            rightCard.classList.add('wrong');
            AudioService.playWrong();

            setTimeout(() => {
                leftCard.classList.remove('wrong');
                rightCard.classList.remove('wrong');
            }, 800);
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

export function destroyMatchingPairs() {
    // Cleanup DOM events
}
