import { loginUser, registerUser, googleAuthUser, fetchUserDataFromCloud } from '../../services/api.js?v=224.0';
import { setCurrentUser } from '../../services/authService.js?v=224.0';
import { loginWithGoogle, signInWithGoogleIdToken, registerWithEmail, loginWithEmail } from '../../services/firebase.js?v=224.0';
import { t } from '../../services/i18n.js?v=224.0';

const GOOGLE_CLIENT_ID = '249517100642-ma0f00l78ku4r4n5jghnt9q8tmhga6sf.apps.googleusercontent.com';

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

function renderAuthModal(onSuccessCallback, initialMode = 'login') {
  const existing = document.querySelector('#auth-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'modal-backdrop';

  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" id="modal-close-btn">&times;</button>
      
      <div class="auth-tabs">
        <button class="auth-tab ${initialMode === 'register' ? '' : 'active'}" id="tab-login-btn">${t('auth_tab_login') || 'Вход'}</button>
        <button class="auth-tab ${initialMode === 'register' ? 'active' : ''}" id="tab-register-btn">${t('auth_tab_register') || 'Регистрация'}</button>
      </div>

      <!-- Google Official One-Tap & Sign-In -->
      <div class="social-auth-section">
        <button type="button" class="google-auth-btn" id="google-auth-btn" title="${t('auth_google_continue')}">
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          <span id="google-btn-label">${t('auth_google_continue')}</span>
        </button>
      </div>

      <div class="auth-divider">
        <span>${t('auth_divider_or')}</span>
      </div>

      <form id="auth-form" class="auth-form">
        <div id="auth-error" class="auth-error" style="display:none;"></div>
        
        <div class="form-group" id="name-group" style="${initialMode === 'register' ? 'display:block;' : 'display:none;'}">
          <label>${t('auth_field_name')}</label>
          <input type="text" id="auth-name" placeholder="${t('auth_field_name_placeholder')}" maxlength="40" />
        </div>

        <div class="form-group">
          <label>${t('auth_field_email')}</label>
          <input type="email" id="auth-email" placeholder="example@mail.com" required maxlength="40" />
        </div>

        <div class="form-group">
          <label>${t('auth_field_password')}</label>
          <input type="password" id="auth-password" placeholder="••••••••" required maxlength="128" autocomplete="current-password" />
        </div>

        <div class="form-group" id="password-confirm-group" style="${initialMode === 'register' ? 'display:block;' : 'display:none;'}">
          <label>${t('auth_field_password_confirm')}</label>
          <input type="password" id="auth-password-confirm" placeholder="••••••••" maxlength="128" autocomplete="new-password" />
        </div>

        <button type="submit" class="primary-button" id="auth-submit-btn">${initialMode === 'register' ? (t('auth_btn_register') || 'Зарегистрироваться') : (t('auth_btn_login') || 'Войти')}</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  let mode = initialMode === 'register' ? 'register' : 'login';
  let tokenClient = null;

  const tabLogin = modal.querySelector('#tab-login-btn');
  const tabRegister = modal.querySelector('#tab-register-btn');
  const nameGroup = modal.querySelector('#name-group');
  const passConfirmGroup = modal.querySelector('#password-confirm-group');
  const submitBtn = modal.querySelector('#auth-submit-btn');
  const googleBtn = modal.querySelector('#google-auth-btn');
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
      submitBtn.textContent = t('auth_btn_login') || 'Войти';
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      nameGroup.style.display = 'block';
      passConfirmGroup.style.display = 'block';
      submitBtn.textContent = t('auth_btn_register') || 'Зарегистрироваться';
    }
  };

  switchTab(mode);

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));
  closeBtn.addEventListener('click', () => modal.remove());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Handle Google OAuth Token Response (Universal for PC and Mobile)
  async function handleGoogleOAuthToken(tokenResponse) {
    if (!tokenResponse || tokenResponse.error) {
      if (tokenResponse?.error !== 'popup_closed_by_user') {
        console.warn('Google OAuth Token error:', tokenResponse);
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t('auth_google_authorizing');

    try {
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const profile = await userinfoRes.json();
      const email = (profile.email || '').toLowerCase().trim();
      const name = profile.name || profile.given_name || email.split('@')[0];
      const picture = profile.picture || '';

      if (!email) {
        throw new Error('Не удалось получить email от Google аккаунта');
      }

      // Exchange with Firebase Auth REST API for valid Firestore idToken
      let fbIdToken = '';
      let fbLocalId = ''; // True Firebase UID from Firebase Auth
      let fbRefreshToken = '';
      try {
        const fbRes = await signInWithGoogleIdToken('', tokenResponse.access_token);
        if (fbRes && fbRes.idToken) {
          fbIdToken = fbRes.idToken;
          fbLocalId = fbRes.localId || ''; // Real Firebase UID (e.g. b9PUaf5j...)
          fbRefreshToken = fbRes.refreshToken || '';
          const fbUser = {
            id: fbLocalId || profile.sub || '',
            name: name,
            email: email,
            avatar: picture,
            provider: 'google',
            idToken: fbRes.idToken,
            refreshToken: fbRefreshToken,
            expiresAt: Date.now() + (parseInt(fbRes.expiresIn || '3600', 10) * 1000),
          };
          localStorage.setItem('myduo_firebase_user', JSON.stringify(fbUser));
          if (fbRefreshToken) {
            try { localStorage.setItem('myduo_refresh_token', fbRefreshToken); } catch (e) {}
          }
        }
      } catch (e) {}

      const res = await googleAuthUser(email, name, picture);
      if (res && res.success && res.data?.user) {
        const userWithGoogle = {
          ...res.data.user,
          provider: 'google',
          name: res.data.user.name || name,
          email: email,
          avatar: picture || '',
          // Use real Firebase UID (localId) — NOT Google OAuth Sub ID (profile.sub)
          firebaseUid: fbLocalId || profile.sub || profile.id || '',
          idToken: fbIdToken || '',
          refreshToken: fbRefreshToken || '',
        };
        setCurrentUser(userWithGoogle, fbIdToken || res.data.token);
        try {
          await fetchUserDataFromCloud(userWithGoogle.id);
        } catch (e) {}
        modal.remove();
        if (onSuccessCallback) onSuccessCallback(userWithGoogle);
      } else {
        throw new Error(res?.error || t('auth_err_failed'));
      }
    } catch (err) {
      errorBox.textContent = err.message || t('auth_err_failed');
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? t('auth_btn_login') : t('auth_btn_register');
    }
  }

  // Handle Google JWT Credential Response (One Tap / FedCM)
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
    submitBtn.textContent = t('auth_google_authorizing');

    try {
      // Exchange Google ID Token with Firebase Auth REST API
      let fbIdToken = '';
      let fbLocalId = ''; // True Firebase UID from Firebase Auth
      let fbRefreshToken = '';
      try {
        const fbRes = await signInWithGoogleIdToken(response.credential);
        if (fbRes && fbRes.idToken) {
          fbIdToken = fbRes.idToken;
          fbLocalId = fbRes.localId || ''; // Real Firebase UID (e.g. b9PUaf5j...)
          fbRefreshToken = fbRes.refreshToken || '';
          const fbUser = {
            id: fbLocalId || payload.sub || '',
            name: name,
            email: email,
            avatar: picture,
            provider: 'google',
            idToken: fbRes.idToken,
            refreshToken: fbRefreshToken,
            expiresAt: Date.now() + (parseInt(fbRes.expiresIn || '3600', 10) * 1000),
          };
          localStorage.setItem('myduo_firebase_user', JSON.stringify(fbUser));
          if (fbRefreshToken) {
            try { localStorage.setItem('myduo_refresh_token', fbRefreshToken); } catch (e) {}
          }
        }
      } catch (e) {}

      const res = await googleAuthUser(email, name, picture);

      if (res && res.success && res.data?.user) {
        const userWithGoogle = {
          ...res.data.user,
          provider: 'google',
          name: res.data.user.name || name,
          email: email,
          avatar: picture || '',
          // Use real Firebase UID (localId) — NOT Google JWT Sub ID (payload.sub)
          firebaseUid: fbLocalId || payload.sub || '',
          idToken: fbIdToken || '',
          refreshToken: fbRefreshToken || '',
        };
        setCurrentUser(userWithGoogle, fbIdToken || res.data.token);
        try {
          await fetchUserDataFromCloud(userWithGoogle.id);
        } catch (e) {}
        modal.remove();
        if (onSuccessCallback) onSuccessCallback(userWithGoogle);
      } else {
        throw new Error(res?.error || t('auth_err_failed'));
      }
    } catch (err) {
      errorBox.textContent = err.message || t('auth_err_failed');
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? t('auth_btn_login') : t('auth_btn_register');
    }
  }

  // Initialize official Google Identity Services (OAuth2 Token Client + ID Services)
  function initGoogleAuth() {
    if (window.google?.accounts?.oauth2) {
      try {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: handleGoogleOAuthToken,
        });
      } catch (e) {
        console.warn('Google OAuth2 init fallback:', e);
      }
    }

    if (window.google?.accounts?.id && !window._gsiInitialized) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => {
            if (typeof handleGoogleResponse === 'function') {
              handleGoogleResponse(resp);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window._gsiInitialized = true;
      } catch (e) {
        console.warn('Google ID init fallback:', e);
      }
    }
  }

  if (window.google?.accounts) {
    initGoogleAuth();
  } else {
    const checkGoogleInterval = setInterval(() => {
      if (window.google?.accounts) {
        clearInterval(checkGoogleInterval);
        initGoogleAuth();
      }
    }, 150);

    setTimeout(() => clearInterval(checkGoogleInterval), 4000);
  }

  // Click on full-width custom Google button
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      errorBox.style.display = 'none';

      const isAndroidApp = !!(
        window.androidBridge ||
        window.AndroidAuthBridge ||
        window.Capacitor?.isNativePlatform?.() ||
        window.Capacitor?.getPlatform?.() === 'android'
      );

      // 1. Mobile Android (Native AndroidAuthBridge or Capacitor FirebaseAuthentication)
      if (window.AndroidAuthBridge || window.Capacitor?.Plugins?.FirebaseAuthentication || isAndroidApp) {
        googleBtn.disabled = true;
        const origContent = googleBtn.innerHTML;
        googleBtn.innerHTML = `<span style="font-size: 14px;">⏳ ${t('auth_loading')}</span>`;
        try {
          const userObj = await loginWithGoogle();
          if (userObj && userObj.email) {
            const email = (userObj.email || '').toLowerCase().trim();
            const name = userObj.name || email.split('@')[0];
            const picture = userObj.avatar || '';

            const res = await googleAuthUser(email, name, picture);
            if (res && res.success && res.data?.user) {
              const userWithGoogle = {
                ...res.data.user,
                provider: 'google',
                name: res.data.user.name || name,
                email: email,
                avatar: picture || userObj.avatar || '',
                firebaseUid: userObj.id || '',
                idToken: userObj.idToken || '',
              };
              setCurrentUser(userWithGoogle, userWithGoogle.idToken || res.data.token);
              try {
                await fetchUserDataFromCloud(userWithGoogle.id);
              } catch (e) {}
              modal.remove();
              if (onSuccessCallback) onSuccessCallback(userWithGoogle);
              return;
            } else {
              throw new Error(res?.error || t('auth_err_failed'));
            }
          }
        } catch (nativeErr) {
          console.warn('Native Google Sign-In note:', nativeErr);
          const msg = nativeErr?.message || String(nativeErr || '');
          const lower = msg.toLowerCase();
          // Don't show red error if user simply backed out or closed the account picker
          if (!lower.includes('cancel') && !lower.includes('closed') && !msg.includes('12501') && !msg.includes('12502')) {
            errorBox.textContent = msg || t('auth_err_failed');
            errorBox.style.display = 'block';
          }
          return;
        } finally {
          googleBtn.disabled = false;
          googleBtn.innerHTML = origContent;
        }
        return;
      }

      // 2. Web Browser Google Sign-In via GIS (only for web desktop/browser)
      if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } else if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      } else {
        errorBox.textContent = t('auth_google_connecting');
        errorBox.style.display = 'block';
      }
    });
  }

  const form = modal.querySelector('#auth-form');
  
  function sanitizeInput(str) {
    if (!str) return '';
    // Strip HTML/script tags
    const clean = str.replace(/<[^>]*>?/gm, '');
    return clean.slice(0, 40);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const email = (modal.querySelector('#auth-email').value || '').trim();
    const password = modal.querySelector('#auth-password').value || '';
    const passwordConfirm = modal.querySelector('#auth-password-confirm').value || '';
    const name = sanitizeInput(modal.querySelector('#auth-name').value.trim());

    if (mode === 'register') {
      if (!name) {
        errorBox.textContent = t('auth_err_name_required');
        errorBox.style.display = 'block';
        return;
      }
      if (password !== passwordConfirm) {
        errorBox.textContent = t('auth_err_password_match');
        errorBox.style.display = 'block';
        return;
      }
      if (password.length < 6) {
        errorBox.textContent = 'Пароль должен содержать не менее 6 символов';
        errorBox.style.display = 'block';
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t('auth_loading');

    try {
      let res;
      let fbUser = null;

      if (mode === 'register') {
        // 1. Register with Firebase Auth cloud to get official ID token
        try {
          fbUser = await registerWithEmail(email, password, name);
        } catch (fbErr) {
          if (fbErr.code === 'auth/email-already-in-use' || fbErr.code === 'auth/weak-password' || fbErr.code === 'auth/invalid-email') {
            throw fbErr;
          }
          console.warn('Firebase registration fallback note:', fbErr);
        }

        // 2. Initialize local user profile and defaults
        res = await registerUser(email, password, name);
        if (res && res.success && res.data?.user) {
          const finalUser = {
            ...res.data.user,
            name: name || res.data.user.name,
            provider: 'email',
            firebaseUid: fbUser?.id || '',
            idToken: fbUser?.idToken || '',
          };
          setCurrentUser(finalUser, fbUser?.idToken || res.data.token);
          try {
            await fetchUserDataFromCloud(finalUser.id);
          } catch (e) {}
          modal.remove();
          if (onSuccessCallback) onSuccessCallback(finalUser);
          return;
        } else {
          throw new Error(res?.error || t('auth_err_failed'));
        }
      } else {
        // Mode === 'login'
        // 1. Try Firebase Auth cloud login
        try {
          fbUser = await loginWithEmail(email, password);
        } catch (fbErr) {
          if (fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/user-disabled') {
            // Check local fallback
            const localRes = await loginUser(email, password);
            if (localRes && localRes.success) {
              res = localRes;
            } else {
              throw fbErr;
            }
          } else {
            console.warn('Firebase login network fallback:', fbErr);
            res = await loginUser(email, password);
          }
        }

        if (fbUser) {
          // Sync local user record
          res = await registerUser(email, password, fbUser.name || name || email.split('@')[0]);
          const finalUser = {
            ...res.data.user,
            name: fbUser.name || res.data.user.name,
            provider: 'email',
            firebaseUid: fbUser.id,
            idToken: fbUser.idToken,
          };
          setCurrentUser(finalUser, fbUser.idToken);
          try {
            await fetchUserDataFromCloud(finalUser.id);
          } catch (e) {}
          modal.remove();
          if (onSuccessCallback) onSuccessCallback(finalUser);
          return;
        } else if (res && res.success && res.data?.user) {
          setCurrentUser(res.data.user, res.data.token);
          try {
            await fetchUserDataFromCloud(res.data.user.id);
          } catch (e) {}
          modal.remove();
          if (onSuccessCallback) onSuccessCallback(res.data.user);
          return;
        } else {
          throw new Error(res?.error || t('auth_err_failed'));
        }
      }
    } catch (err) {
      errorBox.textContent = err.message || t('auth_err_failed');
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'login' ? t('auth_btn_login') : t('auth_btn_register');
    }
  });
}

export { renderAuthModal };
