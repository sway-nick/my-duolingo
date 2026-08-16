import { loginUser, registerUser } from '../../services/api.js?v=13.0';
import { setCurrentUser } from '../../services/authService.js?v=13.0';

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

      <!-- Quick Google Sign-in / Registration -->
      <div class="social-auth-section">
        <button type="button" class="google-auth-btn" id="google-auth-btn" title="Быстрая авторизация через Google">
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          <span id="google-btn-label">Продолжить с Google</span>
        </button>
      </div>

      <div class="auth-divider">
        <span>или через email и пароль</span>
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

        <div class="form-group" id="password-confirm-group" style="display:none;">
          <label>Повторите пароль</label>
          <input type="password" id="auth-password-confirm" placeholder="••••••••" />
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
  const passConfirmGroup = modal.querySelector('#password-confirm-group');
  const submitBtn = modal.querySelector('#auth-submit-btn');
  const googleBtn = modal.querySelector('#google-auth-btn');
  const googleBtnLabel = modal.querySelector('#google-btn-label');
  const errorBox = modal.querySelector('#auth-error');
  const closeBtn = modal.querySelector('#modal-close-btn');

  const switchTab = (newMode) => {
    mode = newMode;
    errorBox.style.display = 'none';
    if (mode === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      nameGroup.style.display = 'none';
      passConfirmGroup.style.display = 'none';
      submitBtn.textContent = 'Войти';
      if (googleBtnLabel) googleBtnLabel.textContent = 'Войти через Google';
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      nameGroup.style.display = 'block';
      passConfirmGroup.style.display = 'block';
      submitBtn.textContent = 'Зарегистрироваться';
      if (googleBtnLabel) googleBtnLabel.textContent = 'Регистрация через Google';
    }
  };

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));
  closeBtn.addEventListener('click', () => modal.remove());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Google Quick Auth
  googleBtn.addEventListener('click', async () => {
    errorBox.style.display = 'none';

    let googleEmail = prompt('Введите ваш Google Email для быстрой авторизации:');
    if (!googleEmail || !googleEmail.trim()) return;

    googleEmail = googleEmail.trim().toLowerCase();
    if (!googleEmail.includes('@')) {
      errorBox.textContent = 'Пожалуйста, введите корректный адрес электронной почты';
      errorBox.style.display = 'block';
      return;
    }

    const defaultName = googleEmail.split('@')[0];
    const googleName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

    submitBtn.disabled = true;
    googleBtn.disabled = true;
    const prevText = googleBtnLabel ? googleBtnLabel.textContent : 'Продолжить с Google';
    if (googleBtnLabel) googleBtnLabel.textContent = 'Авторизация...';

    try {
      // 1. Try login first, if doesn't exist then auto-register
      let res = await loginUser(googleEmail, 'google_oauth_pass');
      if (!res || !res.success || !res.data?.user) {
        res = await registerUser(googleEmail, 'google_oauth_pass', googleName);
      }

      if (res && res.success && res.data?.user) {
        const userWithProvider = { ...res.data.user, provider: 'google', name: res.data.user.name || googleName };
        setCurrentUser(userWithProvider, res.data.token);
        modal.remove();
        if (onSuccessCallback) onSuccessCallback(userWithProvider);
      } else {
        throw new Error(res?.error || 'Не удалось войти через Google');
      }
    } catch (err) {
      errorBox.textContent = err.message || 'Ошибка авторизации Google';
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      googleBtn.disabled = false;
      if (googleBtnLabel) googleBtnLabel.textContent = prevText;
    }
  });

  const form = modal.querySelector('#auth-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const email = modal.querySelector('#auth-email').value.trim();
    const password = modal.querySelector('#auth-password').value.trim();
    const passwordConfirm = modal.querySelector('#auth-password-confirm').value.trim();
    const name = modal.querySelector('#auth-name').value.trim();

    if (mode === 'register') {
      if (!name) {
        errorBox.textContent = 'Пожалуйста, введите ваше имя';
        errorBox.style.display = 'block';
        return;
      }
      if (password !== passwordConfirm) {
        errorBox.textContent = 'Пароли не совпадают. Введите одинаковые пароли.';
        errorBox.style.display = 'block';
        return;
      }
      if (password.length < 4) {
        errorBox.textContent = 'Пароль должен содержать не менее 4 символов';
        errorBox.style.display = 'block';
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Загрузка...';

    try {
      let res;
      if (mode === 'login') {
        res = await loginUser(email, password);
      } else {
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
