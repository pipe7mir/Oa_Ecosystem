/* ==============================================================================
   MÓDULO ADMIN - PANEL DE CONTROL INTEGRADO OASIS
   Centro de control administrativo con gestión de módulos y sub-vistas
   ============================================================================== */

// import { supabase } from '../common/supabaseClient.js'; // REMOVED
import { handleError, sanitizeHTML, logEvent } from '../common/errorHandler.js';
import { eventSystem } from '../common/eventDelegation.js';
import { appState } from '../common/stateManager.js';
import { themeManager } from '../common/themeManager.js';
import { renderAnuncios, initAnuncios } from './anuncios.js';
import { renderUsuarios, initUsuarios } from './usuarios.js';
import { renderSolicitudes, initSolicitudes } from './solicitudes.js';

/* ==============================================================================
   EXPORTADO: Función Render Principal
   ============================================================================== */

/**
 * Renderiza el panel de administración principal
 * @returns {string} HTML del panel
 */
export async function renderAdmin() {
  try {
    // const { data: { session } } = await supabase.auth.getSession();
    // const adminName = session?.user?.user_metadata?.username || 'Administrador';

    // Use local state
    const user = appState.get('user');
    const adminName = user?.username || user?.name || 'Administrador';

    return `
            <div class="admin-dashboard-wrapper animate__animated animate__fadeIn">
                <header class="text-center py-5 position-relative">
                    <button id="theme-toggle-btn" class="btn btn-sm btn-outline-light position-absolute top-0 end-0 m-4 rounded-circle" style="width: 40px; height: 40px;">
                        <i class="bi bi-moon-stars-fill"></i>
                    </button>

                    <h1 class="display-3 fw-bold mb-2" 
                        style="font-family: 'Moonrising', sans-serif; text-shadow: 0 4px 15px rgba(0,0,0,0.5); color: var(--text-primary);">
                        CENTRO DE CONTROL
                    </h1>
                    <p style="font-family: 'Advent Sans', sans-serif; font-size: 1.2rem; color: var(--text-secondary);">
                        Bienvenido, ${sanitizeHTML(adminName)}. Gestión del Ecosistema Institucional.
                    </p>
                </header>

                <div class="container pb-5">
                    <div id="admin-main-grid" class="d-flex flex-wrap justify-content-center">
                        
                        <div class="oasis-square-card" data-action="admin-load-usuarios" style="cursor: pointer;">
                            <i class="bi bi-people-fill"></i>
                            <div class="card-info">
                                <span>Usuarios</span>
                                <small>Gestión Comunidad</small>
                            </div>
                        </div>

                        <div class="oasis-square-card" data-action="admin-load-anuncios" style="cursor: pointer;">
                            <i class="bi bi-megaphone-fill"></i>
                            <div class="card-info">
                                <span>Cartelera</span>
                                <small>Anuncios Live</small>
                            </div>
                        </div>

                        <div class="oasis-square-card" data-action="admin-load-solicitudes" style="cursor: pointer;">
                            <i class="bi bi-inbox-fill"></i>
                            <div class="card-info">
                                <span>Solicitudes</span>
                                <small>Buzón de Entrada</small>
                            </div>
                        </div>

                        <div class="oasis-square-card" data-action="admin-load-inventario" style="cursor: pointer;">
                            <i class="bi bi-box-seam"></i> 
                            <div class="card-info">
                                <span>Inventario</span>
                                <small>Stock de Recursos</small>
                            </div>
                        </div>

                        <div class="oasis-square-card" data-action="admin-load-streaming" style="cursor: pointer;">
                            <i class="bi bi-broadcast"></i> 
                            <div class="card-info">
                                <span>Transmisión</span>
                                <small>Control YouTube</small>
                            </div>
                        </div>

                        <div class="oasis-square-card" 
                             data-action="admin-logout"
                             style="border-left-color: #dc3545 !important; cursor: pointer;">
                            <i class="bi bi-box-arrow-left" style="color: #dc3545 !important;"></i>
                            <div class="card-info">
                                <span style="color: #dc3545;">Salir</span>
                                <small>Cerrar Sesión</small>
                            </div>
                        </div>
                    </div>
                    
                    <div id="admin-view-container" class="mt-5 d-none">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <button class="btn btn-oasis" data-action="admin-back-to-grid">
                                <i class="bi bi-arrow-left"></i> Volver al Panel
                            </button>
                            <h3 id="current-view-title" class="text-white mb-0" 
                                style="font-family: 'Moonrising', sans-serif;">MODULO</h3>
                        </div>
                        
                        <div id="admin-view-content" class="detail-card-body module-entry"></div>
                    </div>
                </div>
            </div>`;
  } catch (err) {
    handleError({
      error: err,
      context: 'renderAdminPanel',
      severity: 'critical'
    });
    return '<div class="alert alert-danger m-5">Error al cargar el panel de administración</div>';
  }
}

/* ==============================================================================
   INICIALIZACIÓN: Configura handlers de eventos
   ============================================================================== */

/**
 * Inicializa el módulo admin con system de eventos
 */
export async function initAdmin() {
  try {
    logEvent('admin_panel_init');

    // Registrar acciones del grid principal
    eventSystem.register('admin-load-usuarios', () => {
      adminController.loadView('usuarios');
    });

    eventSystem.register('admin-load-anuncios', () => {
      adminController.loadView('anuncios');
    });

    eventSystem.register('admin-load-solicitudes', () => {
      adminController.loadView('solicitudes');
    });

    eventSystem.register('admin-load-inventario', () => {
      adminController.loadView('inventario');
    });

    eventSystem.register('admin-load-streaming', () => {
      adminController.loadView('streaming');
    });

    eventSystem.register('admin-back-to-grid', () => {
      adminController.backToGrid();
    });

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const newTheme = themeManager.toggle();
        const icon = themeBtn.querySelector('i');
        if (icon) {
          icon.className = newTheme === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
        }
      });

      // Init icon state
      const icon = themeBtn.querySelector('i');
      if (icon) {
        icon.className = themeManager.current === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
      }
    }

    eventSystem.register('admin-logout', () => {
      adminController.logout();
    });

  } catch (err) {
    handleError({
      error: err,
      context: 'initAdmin',
      severity: 'critical'
    });
  }
}

/* ==============================================================================
   CONTROLADOR ENCAPSULADO: Lógica de navegación y carga de vistas
   ============================================================================== */

const adminController = {
  /**
     * Carga una vista del admin en el contenedor
     * @param {string} viewName - Nombre de la vista a cargar
     */
  async loadView(viewName) {
    const grid = document.getElementById('admin-main-grid');
    const container = document.getElementById('admin-view-container');
    const content = document.getElementById('admin-view-content');
    const title = document.getElementById('current-view-title');

    if (!grid || !container || !content || !title) {
      handleError({
        error: new Error('Elementos del DOM no encontrados'),
        context: 'loadView',
        severity: 'warning'
      });
      return;
    }

    try {
      // Transición visual
      grid.classList.add('d-none');
      container.classList.remove('d-none');
      title.innerText = viewName.toUpperCase();

      // Estado de carga
      content.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-grow text-primary"></div>
                    <p class="text-muted mt-2">Sincronizando módulo...</p>
                </div>`;

      // Cargar módulo según vista
      switch (viewName) {
        case 'usuarios':
          content.innerHTML = await renderUsuarios();
          await initUsuarios();
          break;

        case 'anuncios':
          content.innerHTML = await renderAnuncios();
          await initAnuncios();
          break;

        case 'solicitudes':
          content.innerHTML = await renderSolicitudes();
          await initSolicitudes();
          break;

        case 'inventario': {
          // Importación dinámica del gestor de inventario
          const { renderAdminRecursos, initAdminRecursos } = await import('./admin-recursos.js');
          content.innerHTML = await renderAdminRecursos();
          await initAdminRecursos();
          break;
        }

        case 'streaming': {
          const { renderAdminStreaming, initAdminStreaming } = await import('./admin-streaming.js');
          content.innerHTML = await renderAdminStreaming();
          await initAdminStreaming();
          break;
        }

        default:
          content.innerHTML = `
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            El módulo <strong>${sanitizeHTML(viewName)}</strong> está en desarrollo.
                        </div>`;
      }

      logEvent('admin_view_loaded', { view: viewName });

    } catch (error) {
      handleError({
        error,
        context: 'loadView',
        userMessage: `Error al cargar el módulo: ${viewName}`
      });
      content.innerHTML = `
                <div class="alert alert-danger shadow-sm border-0 rounded-4">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>Error:</strong> No se pudo cargar el módulo. Por favor intenta de nuevo.
                </div>`;
    }
  },

  /**
     * Vuelve al grid principal
     */
  backToGrid() {
    try {
      const grid = document.getElementById('admin-main-grid');
      const container = document.getElementById('admin-view-container');

      if (grid && container) {
        grid.classList.remove('d-none');
        container.classList.add('d-none');
        logEvent('admin_back_to_grid');
      }
    } catch (err) {
      handleError({
        error: err,
        context: 'backToGrid',
        severity: 'warning'
      });
    }
  },

  /**
     * Cierra sesión del administrador
     */
  async logout() {
    // Evitar múltiples modales
    if (document.getElementById('logout-modal')) return;

    const modalHtml = `
      <div class="oasis-modal-overlay animate__animated animate__fadeIn" id="logout-modal" style="z-index: 1050;">
        <div class="oasis-modal-content animate__animated animate__zoomIn">
          <div class="oasis-modal-header border-bottom-0 pb-0">
            <h5 class="mb-0 fw-bold text-white"><i class="bi bi-shield-lock-fill me-2"></i>Cerrar Sesión</h5>
            <button class="btn-close-custom" id="close-logout-modal">
                <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="oasis-modal-body py-4">
            <p class="mb-0 fs-5">¿Estás seguro de que deseas salir del Centro de Control?</p>
          </div>
          <div class="oasis-modal-footer border-top-0 pt-0 pb-4 gap-3 justify-content-center bg-transparent">
             <button class="btn btn-outline-light rounded-pill px-4" id="cancel-logout-btn">
                Cancelar
             </button>
             <button class="btn btn-danger rounded-pill px-4" id="confirm-logout-btn">
                <i class="bi bi-box-arrow-right me-2"></i>Confirmar Salida
             </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Event Listeners for Modal
    const closeModal = () => document.getElementById('logout-modal')?.remove();

    document.getElementById('close-logout-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-logout-btn').addEventListener('click', closeModal);

    document.getElementById('confirm-logout-btn').addEventListener('click', async () => {
      const btn = document.getElementById('confirm-logout-btn');
      btn.disabled = true; // Prevent double click
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saliendo...';

      try {
        appState.set('isLoading', true);

        const apiUrl = import.meta.env.VITE_API_URL;
        try {
          await fetch(`${apiUrl}/logout`, { 
            method: 'POST',
            credentials: 'include'
          });
        } catch (e) { console.warn('Logout API failed', e); }

        localStorage.removeItem('oasis_session');

        // Explicitly clear app state
        appState.set('user', null);
        appState.set('session', null);
        appState.set('userRole', null);

        appState.set('isLoading', false);
        logEvent('admin_logout', { timestamp: new Date().toISOString() });

        closeModal();
        window.location.hash = '#home';

      } catch (error) {
        appState.set('isLoading', false);
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-box-arrow-right me-2"></i>Confirmar Salida';

        handleError({
          error,
          context: 'logout',
          userMessage: 'Error al cerrar sesión'
        });
      }
    }, { once: true });
  }
};

export { adminController };
