/* main.js - Core Engine OASIS v2.5 (Optimizado) */
// import { supabase } from './src/common/supabaseClient.js'; // REMOVED
import { handleError, logEvent, debugLog } from './src/common/errorHandler.js';
import { eventSystem } from './src/common/eventDelegation.js';
import { appState } from './src/common/stateManager.js';
import { i18n } from './src/common/i18n.js';

const app = {
    viewport: document.getElementById('main-content'),
    session: null,
    userRole: null,
    moduleCache: new Map(), // Caché para evitar recargas innecesarias

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            // 1. Inicializar sistemas core
            logEvent('app_init_started');

            // Inicializar estado de la aplicación
            appState.set('isLoading', true);
            i18n.init();

            // Register language toggle
            eventSystem.register('toggle-language', () => {
                i18n.toggleLanguage();
            });

            // 2. Inicializar sesión de forma atómica
            const storedSession = localStorage.getItem('oasis_session');
            let session = null;
            if (storedSession) {
                try {
                    const parsed = JSON.parse(storedSession);
                    // Basic expiry check could go here
                    session = parsed;
                    debugLog('Session restored from localStorage', session);
                } catch (e) {
                    console.error('Invalid session format', e);
                    localStorage.removeItem('oasis_session');
                }
            }

            await this.handleAuthState(session);

            // 3. (Supabase Auth Listener removed)

            // 4. Inicializar event delegation en el documento
            document.addEventListener('click', (e) => {
                eventSystem.handleClick(e);
            }, true);

            document.addEventListener('submit', (e) => {
                eventSystem.handleSubmit(e);
            }, true);

            document.addEventListener('change', (e) => {
                eventSystem.handleChange(e);
            }, true);

            // 5. Configurar navegación
            window.addEventListener('hashchange', () => this.route());
            this.route();

            appState.set('isLoading', false);
            logEvent('app_initialized');
        } catch (error) {
            appState.set('isLoading', false);
            handleError({
                error,
                context: 'app.init',
                severity: 'critical'
            });
        }
    },

    /**
     * Maneja el estado de autenticación
     * @param {Object} session - Sesión del usuario
     */
    /**
     * Maneja el estado de autenticación
     * @param {Object} session - Sesión del usuario
     */
    async handleAuthState(session) {
        this.session = session;
        try {
            if (session && session.user) {
                // Session object from localStorage matches what we set in auth.js
                const user = session.user;
                const role = session.role || 'user';

                this.userRole = role;
                appState.set('user', user);
                appState.set('userRole', role);
                appState.set('session', {
                    authenticated: true,
                    timestamp: session.timestamp || new Date().toISOString()
                });
                debugLog('User authenticated', { role: this.userRole });
            } else {
                this.userRole = null;
                appState.set('user', null);
                appState.set('userRole', null);
                appState.set('session', { authenticated: false });
            }
        } catch (error) {
            handleError({
                error,
                context: 'handleAuthState',
                severity: 'warning'
            });
            this.userRole = null;
        }
        this.updateNavbar();
    },

    /**
     * Actualiza la barra de navegación según estado de autenticación
     */
    /**
     * Actualiza la barra de navegación (Deprecado/Estático)
     */
    updateNavbar() {
        // Navbar is now static. Logic removed.
    },

    /**
     * Cierra la sesión del usuario
     */
    async logout() {
        try {
            appState.set('isLoading', true);

            // Optional: Call Backend Logout
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                await fetch(`${apiUrl}/logout`, { method: 'POST' });
            } catch (e) {
                console.warn('Backend logout failed', e);
            }

            // Local cleanup
            localStorage.removeItem('oasis_session');
            this.moduleCache.clear();

            this.session = null;
            this.userRole = null;
            appState.set('session', { authenticated: false });
            appState.set('user', null);
            appState.set('userRole', null);

            window.location.hash = '#home';

            appState.set('isLoading', false);
            logEvent('user_logout', { timestamp: new Date().toISOString() });

            this.updateNavbar();
            this.route(); // Re-route to update UI
        } catch (error) {
            appState.set('isLoading', false);
            handleError({
                error,
                context: 'logout',
                userMessage: 'Error al cerrar sesión'
            });
        }
    },

    /**
     * Ruteador Optimizado con Transiciones y Caché
     */
    async route() {
        if (!this.viewport) return;

        const hash = window.location.hash.replace('#', '') || 'home';

        // Bypass for React Routes
        if (hash.startsWith('react-ui')) {
            return;
        }

        // 1. Efecto de salida (Fade out suave)
        this.viewport.style.opacity = '0.5';
        this.viewport.style.transition = 'opacity 0.2s ease';

        try {
            let module;

            // 2. Verificación de Caché
            if (this.moduleCache.has(hash)) {
                module = this.moduleCache.get(hash);
                debugLog('Loading from cache', { route: hash });
            } else {
                // Mapeo de rutas a importadores estáticos (analizable por Vite)
                const importers = {
                    'home': () => import('./src/modules/home.js'),
                    'admin': () => import('./src/modules/admin.js'),
                    'usuarios': () => import('./src/modules/usuarios.js'),
                    'recursos': () => import('./src/modules/recursos.js'),
                    'peticiones': () => import('./src/modules/peticiones.js'),
                    'auth': () => import('./src/auth/auth.js')
                };

                const importer = importers[hash] || importers['home'];
                module = await importer();
                this.moduleCache.set(hash, module); // Guardar en caché
                debugLog('Imported module', { route: hash });
            }

            // 3. Seguridad de Roles
            const protectedRoutes = ['admin', 'usuarios'];
            if (protectedRoutes.includes(hash) && this.userRole !== 'admin') {
                logEvent('unauthorized_access_attempt', { route: hash });
                window.location.hash = '#home';
                return;
            }

            // 4. Renderizado
            const renderFn = module[`render${hash.charAt(0).toUpperCase() + hash.slice(1)}`] ||
                module.renderHome ||
                module.renderAdminPanel ||
                module.renderAuth;

            if (!renderFn) {
                throw new Error(`Función render no encontrada para la ruta: ${hash}`);
            }

            this.viewport.innerHTML = await renderFn();

            // 5. Inicialización del módulo
            // Mapeo de funciones init según el módulo
            const initMap = {
                'home': 'initHomeFunctions',
                'admin': 'initAdmin',
                'usuarios': 'initUsuarios',
                'recursos': 'initRecursos',
                'peticiones': 'initPeticiones',
                'auth': 'initAuth'
            };

            const initFnName = initMap[hash];
            const initFn = initFnName && module[initFnName] ? module[initFnName] : null;

            if (initFn && typeof initFn === 'function') {
                await initFn();
            }

            // 6. Registrar cambio de ruta
            appState.set('currentModule', hash);
            logEvent('route_changed', { route: hash, timestamp: new Date().toISOString() });

        } catch (error) {
            const result = handleError({
                error,
                context: `route[${hash}]`,
                userMessage: `Módulo en mantenimiento: ${hash}`
            });
            this.viewport.innerHTML = `
                <div class="alert alert-warning m-5 shadow-sm" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>${hash}:</strong> ${result.message}
                </div>`;
        } finally {
            // 7. Efecto de entrada (Fade in)
            setTimeout(() => {
                this.viewport.style.opacity = '1';
            }, 50);
        }
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());