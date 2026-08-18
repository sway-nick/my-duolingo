import { playFanfareSound } from '../../services/audioService.js?v=21.0';

function getPrizeDetails(rank) {
  switch (rank) {
    case 1:
      return {
        icon: '💎',
        title: 'Алмазный кубок!',
        badge: '1 МЕСТО В ЛИГЕ НЕДЕЛИ',
        color: '#38bdf8',
        gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
        shadow: 'rgba(56, 189, 248, 0.45)',
      };
    case 2:
      return {
        icon: '🥇',
        title: 'Золотая медаль!',
        badge: '2 МЕСТО В ЛИГЕ НЕДЕЛИ',
        color: '#eab308',
        gradient: 'linear-gradient(135deg, #ca8a04, #fde047)',
        shadow: 'rgba(234, 179, 8, 0.45)',
      };
    case 3:
      return {
        icon: '🥈',
        title: 'Серебряная медаль!',
        badge: '3 МЕСТО В ЛИГЕ НЕДЕЛИ',
        color: '#94a3b8',
        gradient: 'linear-gradient(135deg, #64748b, #cbd5e1)',
        shadow: 'rgba(148, 163, 184, 0.45)',
      };
    case 4:
    default:
      return {
        icon: '🥉',
        title: 'Бронзовая медаль!',
        badge: '4 МЕСТО В ЛИГЕ НЕДЕЛИ',
        color: '#d97706',
        gradient: 'linear-gradient(135deg, #b45309, #fcd34d)',
        shadow: 'rgba(217, 119, 6, 0.45)',
      };
  }
}

function spawnConfetti() {
  const container = document.createElement('div');
  container.id = 'podium-confetti-container';
  container.className = 'confetti-wrapper';

  const colors = ['#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4'];
  const shapes = ['square', 'rectangle', 'circle', 'star'];
  const pieceCount = 65;

  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const left = Math.random() * 100;
    const size = Math.random() * 8 + 6;
    const duration = Math.random() * 2.2 + 2.0;
    const delay = Math.random() * 0.8;
    const rotSpeed = Math.random() * 360;

    piece.className = `confetti-piece confetti-${shape}`;
    piece.style.cssText = `
      left: ${left}%;
      background-color: ${color};
      width: ${shape === 'rectangle' ? size * 1.6 : size}px;
      height: ${size}px;
      animation: confettiFall ${duration}s ease-in-out ${delay}s infinite;
      transform: rotate(${rotSpeed}deg);
    `;

    if (shape === 'star') {
      piece.textContent = '★';
      piece.style.background = 'none';
      piece.style.color = color;
      piece.style.fontSize = `${size * 1.4}px`;
    }

    container.appendChild(piece);
  }

  document.body.appendChild(container);
  return container;
}

function showPrizePodiumModal(rank = 4, xp = 0, onDismiss = () => {}) {
  // Remove existing modal if already open
  const existing = document.querySelector('#prize-podium-modal');
  if (existing) existing.remove();
  const existingConfetti = document.querySelector('#podium-confetti-container');
  if (existingConfetti) existingConfetti.remove();

  // 1. Play triumphant fanfare sound
  playFanfareSound();

  // 2. Start falling confetti
  const confettiContainer = spawnConfetti();

  const info = getPrizeDetails(rank);

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'prize-podium-modal';
  modalOverlay.className = 'modal-backdrop prize-podium-backdrop';

  modalOverlay.innerHTML = `
    <div class="modal-content prize-podium-content">
      <div class="podium-shine-effect"></div>
      
      <div class="prize-icon-circle" style="box-shadow: 0 10px 30px ${info.shadow};">
        <span class="prize-huge-icon">${info.icon}</span>
      </div>

      <div class="prize-badge-pill" style="background: ${info.gradient};">
        ${info.badge}
      </div>

      <h2 class="prize-congrats-title">🎉 Поздравляем!</h2>
      <p class="prize-congrats-subtitle">
        Вы заняли призовое место!
      </p>

      <div class="prize-rank-box">
        <div class="prize-rank-name">${info.title}</div>
        <div class="prize-rank-desc">Топ-4 игроков недели</div>
      </div>

      <button class="primary-button btn-green prize-continue-btn" id="prize-continue-btn">
        Ура! Продолжить 🚀
      </button>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const cleanup = () => {
    modalOverlay.classList.add('fade-out');
    if (confettiContainer) {
      confettiContainer.classList.add('fade-out');
    }
    setTimeout(() => {
      modalOverlay.remove();
      if (confettiContainer) confettiContainer.remove();
      onDismiss();
    }, 300);
  };

  const continueBtn = modalOverlay.querySelector('#prize-continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', cleanup);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) cleanup();
  });
}

function initPrizePodiumListener() {
  if (typeof window !== 'undefined') {
    window.addEventListener('myduo:podium_achieved', (e) => {
      const rank = e.detail && e.detail.rank ? e.detail.rank : 4;
      const xp = e.detail && e.detail.xp ? e.detail.xp : 0;
      setTimeout(() => {
        showPrizePodiumModal(rank, xp);
      }, 350);
    });
  }
}

export { showPrizePodiumModal, initPrizePodiumListener };
