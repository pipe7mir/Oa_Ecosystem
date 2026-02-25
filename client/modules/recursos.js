// import { supabase } from '../common/supabaseClient.js'; // REMOVED
import { handleError, sanitizeHTML, logEvent } from '../common/errorHandler.js';
import { eventSystem } from '../common/eventDelegation.js';
import { appState } from '../common/stateManager.js';

/* ==============================================================================
   MÓDULO DE RECURSOS - OASIS
   Motor de visualización de recursos educativos y materiales en línea
   ============================================================================== */

/**
 * Renderiza la interfaz inicial del módulo de recursos
 * @returns {string} HTML con estado de carga
 */
export async function renderRecursos() {
  return `
    <div class="recursos-module animate__animated animate__fadeIn px-3">
        <header class="text-center py-5">
            <h2 class="display-5 fw-bold text-primary mb-2" 
                style="font-family: 'Moonrising', sans-serif; letter-spacing: 4px; text-shadow: 0 10px 20px rgba(0,0,0,0.05);">
                RECURSOS OASIS
            </h2>
            <div class="mx-auto bg-primary rounded-pill mb-3" style="width: 60px; height: 4px;"></div>
            <p class="text-muted small text-uppercase fw-bold" style="letter-spacing: 1px;">
                Material de alta gama para tu crecimiento espiritual
            </p>
        </header>

        <div class="container">
            <div id="tienda-grid" class="row g-5 justify-content-center pb-5">
                <div class="col-12 text-center py-5">
                    <div class="spinner-grow text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                    <p class="mt-3 text-muted small fw-bold">SINCRONIZANDO STOCK...</p>
                </div>
            </div>
        </div>
    </div>`;
}

/**
 * Inicializa el módulo de recursos
 * Carga los datos de la base de datos y configura el sistema de eventos
 */
export async function initRecursos() {
  const grid = document.getElementById('tienda-grid');
  if (!grid) {
    handleError({
      error: new Error('Grid container no encontrado'),
      context: 'initRecursos',
      severity: 'critical'
    });
    return;
  }

  try {
    appState.set('isLoading', true);
    logEvent('recursos_init_started');

    // Consulta atómica a la base de datos
    // Consulta atómica a la API local
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/resources`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error de red: ${response.statusText}`);
    }

    const recursos = await response.json();

    if (!recursos || recursos.length === 0) {
      grid.innerHTML = `
                <div class="col-12 text-center py-5 animate__animated animate__fadeIn">
                    <i class="bi bi-cloud-slash display-1 text-muted opacity-25"></i>
                    <p class="text-muted mt-3">No hay materiales disponibles en este momento.</p>
                </div>`;

      appState.set('isLoading', false);
      logEvent('recursos_empty_state');
      return;
    }

    // Renderizar tarjetas
    renderResourceCards(grid, recursos);

    // Registrar evento de clic para abrir recursos
    eventSystem.register('recursos-open-link', (element) => {
      recursosController.openResource(element);
    });

    appState.set('isLoading', false);
    logEvent('recursos_loaded', { count: recursos.length });

  } catch (err) {
    appState.set('isLoading', false);
    handleError({
      error: err,
      context: 'initRecursos',
      userMessage: 'No pudimos cargar los recursos. Por favor intenta más tarde.'
    });

    grid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger shadow-sm border-0 rounded-4 text-center">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar recursos. Por favor recarga la página.
                </div>
            </div>`;
  }
}

/**
 * Renderiza las tarjetas de recursos
 * @param {HTMLElement} grid - Contenedor donde renderizar
 * @param {Array} recursos - Array de objetos de recursos
 */
function renderResourceCards(grid, recursos) {
  try {
    grid.innerHTML = recursos.map(rec => {
      // Validaciones de seguridad
      if (!rec.id || !rec.download_url) {
        logEvent('recursos_invalid_record', { id: rec.id });
        return '';
      }

      const isDownload = rec.action_type === 'download';
      const actionLabel = isDownload ? 'Descargar' : 'Ir al Sitio';
      const actionIcon = isDownload ? 'bi-cloud-arrow-down-fill' : 'bi-arrow-up-right-circle-fill';
      const title = sanitizeHTML(rec.title || 'Sin título');
      const category = sanitizeHTML(rec.category || 'General');

      return `
            <div class="col-auto">
                <div class="oasis-premium-card" 
                     data-action="recursos-open-link"
                     data-resource-id="${sanitizeHTML(rec.id)}"
                     data-resource-url="${sanitizeHTML(rec.download_url)}"
                     style="cursor: pointer;"
                     role="button"
                     tabindex="0">
                    
                    <div class="card-visual">
                        ${rec.thumbnail_url
          ? `<img src="${sanitizeHTML(rec.thumbnail_url)}" 
                                    loading="lazy" 
                                    class="img-fluid rounded-4 shadow"
                                    alt="${title}">`
          : `<div class="placeholder-icon"><i class="bi ${actionIcon}"></i></div>`}
                    </div>

                    <div class="card-content">
                        <h6 class="resource-title">${title.toUpperCase()}</h6>
                        <p class="resource-category">${category.toUpperCase()}</p>
                        
                        <div class="action-wrapper">
                            <span class="premium-pill-btn">
                                <i class="bi ${actionIcon} me-2"></i> ${actionLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>`;
    }).join('');

  } catch (err) {
    handleError({
      error: err,
      context: 'renderResourceCards',
      severity: 'warning'
    });
  }
}

/* ==============================================================================
   CONTROLADOR ENCAPSULADO
   ============================================================================== */

const recursosController = {
  /**
     * Abre un recurso en una nueva pestaña
     * @param {HTMLElement} element - Elemento clickeado
     */
  openResource(element) {
    try {
      const url = element.dataset.resourceUrl;
      const resourceId = element.dataset.resourceId;

      if (!url) {
        throw new Error('URL del recurso no disponible');
      }

      // Validar que sea una URL válida
      try {
        new URL(url);
      } catch {
        throw new Error('URL del recurso no válida');
      }

      // Registrar evento de acceso
      logEvent('recursos_opened', {
        resourceId: sanitizeHTML(resourceId),
        timestamp: new Date().toISOString()
      });

      // Abrir en nueva pestaña con seguridad
      window.open(url, '_blank', 'noopener,noreferrer');

    } catch (err) {
      handleError({
        error: err,
        context: 'openResource',
        userMessage: 'No pudimos abrir este recurso. Por favor intenta de nuevo.'
      });
    }
  }
};

export { recursosController };
