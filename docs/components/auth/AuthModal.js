import { loginUser, registerUser } from '../../services/api.js?v=7.0';
import { setCurrentUser } from '../../services/authService.js?v=7.0';

function renderAuthModal(onSuccessCallback) {
  const existing = document.querySelector('#auth-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'modal-backdrop';

  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" id="modal-close-btn">&times;</button>
      
      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-login-btn">Вход</button>
        <button class="auth-tab" id="tab-register-btn">Регистрация</button>
      </div>

      <form id="auth-form" class="auth-form">
        <div id="auth-error" class="auth-error" style="display:none;"></div>
        
        <div class="form-group" id="name-group" style="display:none;">
          <label>Имя</label>
          <input type="text" id="auth-name" placeholder="Ваше имя" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" id="auth-email" placeholder="example@mail.com" required />
        </div>

        <div class="form-group">
          <label>Пароль</label>
          <input type="password" id="auth-password" placeholder="••••••••" required />
        </div>

        <button type="submit" class="primary-button" id="auth-submit-btn">Войти</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  let mode = 'login'; // 'login' or 'register'

  const tabLogin = modal.querySelector('#tab-login-btn');
  const tabRegister = modal.querySelector('#tab-register-btn');
  const nameGroup = modal.querySelector('#name-group');
  const submitBtn = modal.querySelector('#auth-submit-btn');
  const errorBox = modal.querySelector('#auth-error');
  const closeBtn = modal.querySelector('#modal-close-btn');

  const switchTab = (newMode) => {
    mode = newMode;
    errorBox.style.display = 'none';
    if (mode === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      nameGroup.style.display = 'none';
      submitBtn.textContent = 'Войти';
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      nameGroup.style.display = 'block';
      submitBtn.textContent = 'Зарегистрироваться';
    }
  };

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));
  closeBtn.addEventListener('click', () => modal.remove());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  const form = modal.querySelector('#auth-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const email = modal.querySelector('#auth-email').value.trim();
    const password = modal.querySelector('#auth-password').value.trim();
    const name = modal.querySelector('#auth-name').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Загрузка...';

    try {
      let res;
      if (mode === 'login') {
        res = await loginUser(email, password);
      } else {
        if (!name) throw new Error('Введите ваше имя');
        res = await registerUser(email, password, name);
      }

      if (res && res.success && res.data?.user) {
        setCurrentUser(res.data.user, res.data.token);
        modal.remove();
        if (onSuccessCallback) onSuccessCallback(res.data.user);
      } else {
        throw new Error(res?.error || 'Произошла ошибка при авторизации');
      }
    } catch (err) {
      errorBox.textContent = err.message || 'Ошибка входа';
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? 'Войти' : 'Зарегистрироваться';
    }
  });
}

export { renderAuthModal };
