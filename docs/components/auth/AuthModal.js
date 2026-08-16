import { loginUser, registerUser } from '../../services/api.js?v=13.0';
import { setCurrentUser } from '../../services/authService.js?v=13.0';

const GOOGLE_CLIENT_ID = '971261131396-00l4rv6n0c4plrd9ie10qb8tvrme2emk.apps.googleusercontent.com';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT:', e);
    return null;
  }
}

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

      <!-- Google Official One-Tap & Sign-In -->
      <div class="social-auth-section">
        <div id="google-btn-wrapper" style="width: 100%; display: flex; justify-content: center; min-height: 44px;">
          <button type="button" class="google-auth-btn" id="google-auth-btn" title="Войти через аккаунт Google">
            <svg width="20" height="20" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            <span id="google-btn-label">Продолжить с Google</span>
          </button>
        </div>
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
  const googleBtnWrapper = modal.querySelector('#google-btn-wrapper');
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
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      nameGroup.style.display = 'block';
      passConfirmGroup.style.display = 'block';
      submitBtn.textContent = 'Зарегистрироваться';
    }
  };

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));
  closeBtn.addEventListener('click', () => modal.remove());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Handle Google OAuth Credential (JWT response from Google Account Selector)
  async function handleGoogleResponse(response) {
    if (!response || !response.credential) return;

    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      errorBox.textContent = 'Не удалось получить данные аккаунта Google';
      errorBox.style.display = 'block';
      return;
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const picture = payload.picture || '';

    submitBtn.disabled = true;
    submitBtn.textContent = 'Авторизация через Google...';

    try {
      let res = await loginUser(email, 'google_oauth_pass');
      if (!res || !res.success || !res.data?.user) {
        res = await registerUser(email, 'google_oauth_pass', name);
      }

      if (res && res.success && res.data?.user) {
        const userWithGoogle = {
          ...res.data.user,
          provider: 'google',
          name: name,
          email: email,
          avatar: picture,
        };
        setCurrentUser(userWithGoogle, res.data.token);
        modal.remove();
        if (onSuccessCallback) onSuccessCallback(userWithGoogle);
      } else {
        throw new Error(res?.error || 'Не удалось завершить вход через Google');
      }
    } catch (err) {
      errorBox.textContent = err.message || 'Ошибка входа через Google';
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? 'Войти' : 'Зарегистрироваться';
    }
  }

  // Initialize official Google Identity Services
  function initGoogleIdentity() {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render official native Google button inside wrapper
        if (googleBtnWrapper) {
          googleBtnWrapper.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnWrapper, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left',
            width: 320,
            locale: 'ru',
          });
        }
      } catch (e) {
        console.warn('Google Identity initialization fallback:', e);
      }
    }
  }

  if (window.google?.accounts?.id) {
    initGoogleIdentity();
  } else {
    // Wait for Google script to finish loading if not ready yet
    const checkGoogleInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleInterval);
        initGoogleIdentity();
      }
    }, 150);

    setTimeout(() => clearInterval(checkGoogleInterval), 4000);
  }

  // Fallback click on custom Google button if native render hasn't replaced it
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      }
    });
  }

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
