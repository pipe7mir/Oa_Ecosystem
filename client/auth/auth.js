/* ==============================================================================
   MÓDULO DE AUTENTICACIÓN - OASIS
   Sistema de login y registro con validación y manejo centralizado de errores
   ============================================================================== */

import {
  handleError,
  validateForm,
  sanitizeHTML,
  showAlert,
  logEvent
} from '../common/errorHandler.js';
import { eventSystem } from '../common/eventDelegation.js';
import { appState } from '../common/stateManager.js';
import { i18n } from '../common/i18n.js';

/* ==============================================================================
   FUNCIONES DE RENDERIZADO
   ============================================================================== */

/**
 * Renderiza el contenedor principal de autenticación
 * @returns {string} HTML del contenedor
 */
export async function renderAuth() {
  // Verificar sesión existente
  const session = appState.get('session');
  const user = appState.get('user');

  if (session && session.authenticated && user) {
    // Si es admin, redirigir al panel
    if (user.role === 'admin') {
      setTimeout(() => window.location.hash = '#admin', 100);
      return `<div class="text-center py-5 mt-5"><div class="spinner-border text-primary"></div><p class="mt-2">Redirigiendo al panel...</p></div>`;
    }
    // Si es usuario normal, mantener en home o perfil (opcional)
    // Por ahora, permitimos ver el login solo si no es admin, o redirigimos a home?
    // User asked "mantenga la secion". If they click panel link, maybe show messaging?
    // But the panel link is only for admins typically? 
    // Actually, user said "entro al panel administrativo y le doy click en inicio... no necesito que se cierre la sesion"
    // The issue was returning to #auth (Panel Link) showed login.
    // So if logged in as admin, go to admin.
  }

  return `
        <div class="container py-5 d-flex justify-content-center align-items-center" style="min-height: 85vh;">
            <div id="auth-surface" class="col-lg-5 w-100 animate__animated animate__fadeInUp" style="max-width: 400px;">
                <div id="auth-card-container">
                    ${renderLoginForm()}
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza el formulario de login
 * @returns {string} HTML del formulario
 */
function renderLoginForm() {
  return `
        <div class="auth-card card shadow-lg animate__animated animate__fadeIn rounded-5">
            <div class="auth-header text-center p-4">
                <i class="bi bi-shield-lock fs-1 text-primary"></i>
                <h3 class="fw-bold mb-0 brand-text" style="letter-spacing: 2px; color: var(--nightfall-vivid) !important;">${i18n.t('auth.login_title')}</h3>
            </div>
            <div class="card-body p-4 bg-white rounded-5">
                <form id="login-form" data-submit-action="auth-login-submit">
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-primary">${i18n.t('auth.user_label')}</label>
                        <input type="text" name="username" class="form-control" required minlength="3" maxlength="100" placeholder="${i18n.t('auth.user_placeholder')}">
                    </div>
                    <div class="mb-4">
                        <label class="form-label small fw-bold text-primary">${i18n.t('auth.password_label')}</label>
                        <input type="password" name="password" class="form-control" required minlength="6" maxlength="128" placeholder="${i18n.t('auth.password_placeholder')}">
                    </div>
                    <div id="auth-status-area"></div>
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary px-5 rounded-pill">
                            <span class="spinner-border spinner-border-sm me-2 d-none" role="status" aria-hidden="true"></span>
                            ${i18n.t('auth.btn_login')}
                        </button>
                    </div>
                    <div class="text-center mt-3">
                        <button type="button" 
                                class="small btn btn-link text-primary"
                                data-action="auth-toggle-register">
                            ${i18n.t('auth.link_register')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Renderiza el formulario de registro
 * @returns {string} HTML del formulario
 */
function renderRegisterForm() {
  return `
        <div class="auth-card card shadow-lg animate__animated animate__fadeIn rounded-5">
            <div class="auth-header text-center p-4">
                <i class="bi bi-person-plus fs-1 text-primary"></i>
                <h3 class="fw-bold mb-0 brand-text" style="letter-spacing: 2px; color: var(--nightfall-vivid) !important;">${i18n.t('auth.register_title')}</h3>
            </div>
            <div class="card-body p-4 bg-white rounded-5">
                <form id="register-form" data-submit-action="auth-register-submit">
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-primary">${i18n.t('auth.user_label')}</label>
                        <input type="text" name="username" class="form-control" required minlength="3" maxlength="100" placeholder="${i18n.t('auth.user_placeholder')}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-primary">${i18n.t('auth.email_label')}</label>
                        <input type="email" name="email" class="form-control" required maxlength="255">
                    </div>
                    <div class="mb-4">
                        <label class="form-label small fw-bold text-primary">${i18n.t('auth.password_label')}</label>
                        <input type="password" name="password" class="form-control" required minlength="6" maxlength="128" placeholder="${i18n.t('auth.password_placeholder')}">
                    </div>
                    <div id="auth-status-area"></div>
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary px-5 rounded-pill">
                            <span class="spinner-border spinner-border-sm me-2 d-none" role="status" aria-hidden="true"></span>
                            ${i18n.t('auth.btn_register')}
                        </button>
                    </div>
                    <div class="text-center mt-3">
                        <button type="button" 
                                class="small btn btn-link text-primary"
                                data-action="auth-toggle-login">
                            ${i18n.t('auth.link_login')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/* ==============================================================================
   INICIALIZACIÓN DEL MÓDULO
   ============================================================================== */

/**
 * Inicializa el módulo de autenticación
 * Registra los manejadores de eventos
 */
export function initAuth() {
  try {
    // Registrar acciones de navegación
    eventSystem.register('auth-toggle-register', () => {
      authController.toggleView('register');
    });

    eventSystem.register('auth-toggle-login', () => {
      authController.toggleView('login');
    });

    // Registrar handlers de formularios
    eventSystem.register('auth-login-submit', (element) => {
      const form = element.closest('form') || element;
      authController.handleLogin(form);
    });

    eventSystem.register('auth-register-submit', (element) => {
      const form = element.closest('form') || element;
      authController.handleRegister(form);
    });

    logEvent('auth_module_initialized');
  } catch (err) {
    handleError({
      error: err,
      context: 'initAuth',
      severity: 'critical'
    });
  }
}

/* ==============================================================================
   CONTROLADOR ENCAPSULADO
   ============================================================================== */

const authController = {
  /**
     * Alterna entre vista de login y registro
     * @param {string} view - 'login' o 'register'
     */
  toggleView(view) {
    const container = document.getElementById('auth-card-container');
    if (!container) return;

    try {
      container.innerHTML = view === 'register' ? renderRegisterForm() : renderLoginForm();
      logEvent('auth_view_toggled', { view });
    } catch (err) {
      handleError({
        error: err,
        context: 'toggleView',
        severity: 'warning'
      });
    }
  },

  /**
     * Maneja el login del usuario
     * @param {HTMLFormElement} form - Formulario de login
     */
  handleLogin: async function (form) {
    const statusArea = form.closest('[id]')?.parentElement?.querySelector('#auth-status-area') ||
      document.getElementById('auth-status-area');
    const btn = form.querySelector('button[type="submit"]');
    const spinner = btn?.querySelector('.spinner-border');

    if (!btn) return;

    try {
      // Validar formulario
      const validation = validateForm(form);
      if (!validation.success) {
        const errorMessage = Object.values(validation.errors).join(', ');
        if (statusArea) showAlert(statusArea, errorMessage, 'danger');
        return;
      }

      const { username: user, password: pass } = validation.data;

      btn.disabled = true;
      if (spinner) spinner.classList.remove('d-none');

      logEvent('login_attempt', { username: user });

      // Consumir API Laravel
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: user,
          password: pass
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error en la autenticación');
      }

      const userData = data.user;

      // Actualizar estado de la aplicación
      appState.set('user', {
        username: userData.name,
        email: userData.email,
        role: userData.role || 'user',
        id: userData.id
      });
      appState.set('userRole', userData.role || 'user');
      appState.set('token', data.token); // Store token
      appState.set('session', {
        authenticated: true,
        timestamp: new Date().toISOString()
      });

      // Build session object
      const sessionObj = {
        user: appState.get('user'),
        role: appState.get('userRole'),
        token: data.token,
        timestamp: new Date().toISOString()
      };

      // Guardar sesión en localStorage (persistencia básica)
      localStorage.setItem('oasis_session', JSON.stringify(sessionObj));

      // Update global app state to refresh navbar
      if (window.app && window.app.handleAuthState) {
        await window.app.handleAuthState(sessionObj);
      }

      logEvent('login_success', { username: userData.name, role: userData.role });

      if (statusArea) {
        showAlert(statusArea, 'Login exitoso. Redirigiendo...', 'success');
      }

      // Redirigir según rol
      setTimeout(() => {
        if (userData.role?.toLowerCase() === 'admin') {
          window.location.hash = '#admin';
        } else {
          window.location.hash = '#home';
        }
      }, 1000);

    } catch (error) {
      const errorResult = handleError({
        error,
        context: 'handleLogin',
        userMessage: 'No pudimos iniciar sesión. Verifica tus credenciales.'
      });
      logEvent('login_failed', { error: error.message });
      if (statusArea) showAlert(statusArea, errorResult.message, 'danger');
      btn.disabled = false;
      if (spinner) spinner.classList.add('d-none');
    }
  },

  /**
     * Maneja el registro de nuevos usuarios
     * @param {HTMLFormElement} form - Formulario de registro
     */
  handleRegister: async function (form) {
    const statusArea = form.closest('[id]')?.parentElement?.querySelector('#auth-status-area') ||
      document.getElementById('auth-status-area');
    const btn = form.querySelector('button[type="submit"]');
    const spinner = btn?.querySelector('.spinner-border');

    if (!btn) return;

    try {
      // Validar formulario
      const validation = validateForm(form);
      if (!validation.success) {
        const errorMessage = Object.values(validation.errors).join(', ');
        if (statusArea) showAlert(statusArea, errorMessage, 'danger');
        return;
      }

      const { username, email, password } = validation.data;

      btn.disabled = true;
      if (spinner) spinner.classList.remove('d-none');

      logEvent('register_attempt', { username });

      // Consumir API Laravel
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error en el registro');
      }

      logEvent('register_success', { username });

      if (statusArea) {
        showAlert(statusArea, data.message || 'Registro exitoso. Espera aprobación.', 'success');
      }

      // Limpiar formulario y redirigir a login tras unos segundos
      form.reset();
      setTimeout(() => {
        if (this.toggleView) this.toggleView('login');
      }, 3000);

    } catch (error) {
      console.error('Registration Error Details:', error);
      const errorResult = handleError({
        error,
        context: 'handleRegister',
        userMessage: error.message || 'No pudimos registrar tu cuenta.'
      });
      logEvent('register_failed', { error: error.message });
      if (statusArea) showAlert(statusArea, errorResult.message, 'danger');
    } finally {
      btn.disabled = false;
      if (spinner) spinner.classList.add('d-none');
    }
  }
};

export { authController };
