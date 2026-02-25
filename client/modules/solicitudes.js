/* ==============================================================================
   MÓDULO SOLICITUDES - GESTOR DE PETICIONES CIUDADANAS
   Sistema administrativo para revisar, aprobar y responder solicitudes
   ============================================================================== */

// import { supabase } from '../common/supabaseClient.js'; // REMOVED
import { handleError, sanitizeHTML, logEvent } from '../common/errorHandler.js';
import { eventSystem } from '../common/eventDelegation.js';
import { appState } from '../common/stateManager.js';

/* ==============================================================================
   RENDERIZADO DEL MÓDULO
   ============================================================================== */

/**
 * Renderiza el panel de gestión de solicitudes
 * @returns {string} HTML del panel
 */
export async function renderSolicitudes() {
  return `
        <section class="container-fluid py-5">
            <div class="d-flex justify-content-between align-items-center mb-4 animate__animated animate__fadeInDown">
                <h2 class="fw-bold titulo_seccion">Gestión de Solicitudes</h2>
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary px-4" data-filter="todas">
                        Todas
                    </button>
                    <button class="btn btn-outline-warning px-4" data-filter="pendientes">
                        Pendientes
                    </button>
                    <button class="btn btn-outline-success px-4" data-filter="aprobadas">
                        Aprobadas
                    </button>
                    <button class="btn btn-outline-danger px-4" data-filter="rechazadas">
                        Rechazadas
                    </button>
                </div>
            </div>

            <!-- Estadísticas -->
            <div class="row mb-5 gy-3">
                <div class="col-md-3">
                    <div class="card bg-light border-0 rounded-4 h-100">
                        <div class="card-body text-center">
                            <h5 class="text-muted fw-bold mb-2">Total</h5>
                            <h2 class="fw-bold text-primary" id="stat-total">0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light border-0 rounded-4 h-100">
                        <div class="card-body text-center">
                            <h5 class="text-muted fw-bold mb-2">Pendientes</h5>
                            <h2 class="fw-bold text-warning" id="stat-pendientes">0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light border-0 rounded-4 h-100">
                        <div class="card-body text-center">
                            <h5 class="text-muted fw-bold mb-2">Aprobadas</h5>
                            <h2 class="fw-bold text-success" id="stat-aprobadas">0</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light border-0 rounded-4 h-100">
                        <div class="card-body text-center">
                            <h5 class="text-muted fw-bold mb-2">Rechazadas</h5>
                            <h2 class="fw-bold text-danger" id="stat-rechazadas">0</h2>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Solicitudes -->
            <div class="card border-0 shadow-sm rounded-4">
                <div class="card-header bg-light p-4 border-0 rounded-top-4">
                    <h5 class="mb-0 fw-bold">Lista de Solicitudes</h5>
                </div>
                <div class="card-body p-0" id="solicitudes-container">
                    <div class="text-center p-5">
                        <div class="spinner-grow text-primary"></div>
                        <p class="text-muted mt-2">Cargando solicitudes...</p>
                    </div>
                </div>
            </div>

            <!-- Modal de Detalles -->
            <div class="modal fade" id="solicitudModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content rounded-4 border-0">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">Detalles de Solicitud</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="modal-content">
                        </div>
                        <div class="modal-footer border-0 pt-0" id="modal-actions">
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
}

/* ==============================================================================
   INICIALIZACIÓN DEL MÓDULO
   ============================================================================== */

/**
 * Inicializa el módulo de solicitudes administrativo
 */
export async function initSolicitudes() {
  try {
    logEvent('solicitudes_admin_init');

    // Registrar acciones
    eventSystem.register('solicitud-ver-detalle', (element) => {
      const id = element.dataset.solicitudId;
      solicitudesController.mostrarDetalle(id);
    });

    eventSystem.register('solicitud-aprobar', (element) => {
      const id = element.dataset.solicitudId;
      solicitudesController.aprobar(id);
    });

    eventSystem.register('solicitud-rechazar', (element) => {
      const id = element.dataset.solicitudId;
      solicitudesController.rechazar(id);
    });

    eventSystem.register('solicitud-responder', () => {
      solicitudesController.enviarRespuesta();
    });

    // Filtros
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        solicitudesController.setFiltro(e.target.dataset.filter);
        solicitudesController.mostrarSolicitudes();
      });
    });

    // Cargar solicitudes
    await solicitudesController.cargar();
    solicitudesController.mostrarSolicitudes();

  } catch (err) {
    handleError({
      error: err,
      context: 'initSolicitudes',
      severity: 'warning'
    });
  }
}

/* ==============================================================================
   CONTROLADOR ENCAPSULADO
   ============================================================================== */

const solicitudesController = {
  localData: [],
  filtroActual: 'todas',
  solicitudActual: null,

  /**
     * Define el filtro activo
     */
  setFiltro(filtro) {
    this.filtroActual = filtro;
  },

  /**
     * Carga solicitudes desde API Local
     */
  async cargar() {
    try {
      appState.set('isLoading', true);

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/requests`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al cargar solicitudes');

      const data = await response.json();

      this.localData = data || [];
      this.actualizarEstadisticas();

      appState.set('isLoading', false);
      logEvent('solicitudes_loaded', { count: this.localData.length });

    } catch (err) {
      appState.set('isLoading', false);
      handleError({
        error: err,
        context: 'cargar',
        userMessage: 'Error al cargar solicitudes'
      });
    }
  },

  /**
     * Actualiza las estadísticas
     */
  actualizarEstadisticas() {
    const total = this.localData.length;
    const pendientes = this.localData.filter(s => s.status === 'pendiente').length;
    const aprobadas = this.localData.filter(s => s.status === 'aprobada').length;
    const rechazadas = this.localData.filter(s => s.status === 'rechazada').length;

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pendientes').innerText = pendientes;
    document.getElementById('stat-aprobadas').innerText = aprobadas;
    document.getElementById('stat-rechazadas').innerText = rechazadas;
  },

  /**
     * Muestra solicitudes filtradas
     */
  mostrarSolicitudes() {
    const container = document.getElementById('solicitudes-container');
    if (!container) return;

    let filtradas = this.localData;

    if (this.filtroActual === 'pendientes') {
      filtradas = filtradas.filter(s => s.status === 'pendiente');
    } else if (this.filtroActual === 'aprobadas') {
      filtradas = filtradas.filter(s => s.status === 'aprobada');
    } else if (this.filtroActual === 'rechazadas') {
      filtradas = filtradas.filter(s => s.status === 'rechazada');
    }

    if (filtradas.length === 0) {
      container.innerHTML = `
                <div class="text-center p-5 text-muted">
                    <i class="bi bi-inbox display-1 opacity-25"></i>
                    <p class="mt-3">No hay solicitudes en este filtro</p>
                </div>`;
    } else {
      container.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th>Solicitante</th>
                                <th>Categoría</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtradas.map(s => this.renderRow(s)).join('')}
                        </tbody>
                    </table>
                </div>`;
    }
  },

  /**
     * Renderiza una fila de solicitud
     */
  renderRow(solicitud) {
    const nombre = solicitud.is_anonymous ? 'Anónimo' : sanitizeHTML(solicitud.name || 'N/A');
    const categoria = sanitizeHTML(solicitud.category || 'General');
    const descripcionCorta = (solicitud.description || '').substring(0, 50) + '...';

    const badgeStatus = {
      pendiente: 'warning',
      aprobada: 'success',
      rechazada: 'danger'
    };

    const status = solicitud.status || 'pendiente';
    const color = badgeStatus[status] || 'secondary';

    return `
            <tr>
                <td><strong>${nombre}</strong></td>
                <td><small>${categoria}</small></td>
                <td><small class="text-muted">${sanitizeHTML(descripcionCorta)}</small></td>
                <td>
                    <span class="badge bg-${color}">
                        ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-info me-2"
                            data-action="solicitud-ver-detalle"
                            data-solicitud-id="${sanitizeHTML(solicitud.id)}">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${status === 'pendiente' ? `
                        <button class="btn btn-sm btn-outline-success me-2"
                                data-action="solicitud-aprobar"
                                data-solicitud-id="${sanitizeHTML(solicitud.id)}">
                            <i class="bi bi-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger"
                                data-action="solicitud-rechazar"
                                data-solicitud-id="${sanitizeHTML(solicitud.id)}">
                            <i class="bi bi-x"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>`;
  },

  /**
     * Muestra detalles de solicitud en modal
     */
  mostrarDetalle(id) {
    const solicitud = this.localData.find(s => s.id == id); // Loose equality for string/number id mismatch
    if (!solicitud) return;

    this.solicitudActual = solicitud;

    const fecha = new Date(solicitud.created_at).toLocaleDateString('es-ES');
    const generador = solicitud.is_anonymous ? 'Anónimo' : sanitizeHTML(solicitud.name || 'N/A');
    const email = solicitud.is_anonymous ? '(No proporcionado)' : sanitizeHTML(solicitud.email || 'N/A');
    const telefono = sanitizeHTML(solicitud.phone || 'N/A');
    const categoria = sanitizeHTML(solicitud.category || 'General');
    const descripcion = sanitizeHTML(solicitud.description || '');
    const respuesta = sanitizeHTML(solicitud.response || '');

    document.getElementById('modal-content').innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <p class="text-muted small mb-1">Solicitante</p>
                    <p class="fw-bold">${generador}</p>
                </div>
                <div class="col-md-6">
                    <p class="text-muted small mb-1">Categoría</p>
                    <p class="fw-bold">${categoria}</p>
                </div>
                <div class="col-md-6">
                    <p class="text-muted small mb-1">Email</p>
                    <p class="text-break">${email}</p>
                </div>
                <div class="col-md-6">
                    <p class="text-muted small mb-1">Teléfono</p>
                    <p>${telefono}</p>
                </div>
                <div class="col-12">
                    <p class="text-muted small mb-1">Fecha de Solicitud</p>
                    <p>${fecha}</p>
                </div>
            </div>

            <hr>

            <div class="mb-3">
                <p class="text-muted small mb-1 fw-bold">DESCRIPCIÓN</p>
                <p class="border-start ps-3">${descripcion}</p>
            </div>

            ${respuesta ? `
                <hr>
                <div class="mb-3 bg-light p-3 rounded-3">
                    <p class="text-muted small mb-1 fw-bold">RESPUESTA</p>
                    <p>${respuesta}</p>
                </div>
            ` : ''}

            ${solicitud.status === 'pendiente' ? `
                <hr>
                <div class="mb-3">
                    <label class="form-label">Escribe una respuesta (opcional)</label>
                    <textarea id="respuesta-input" class="form-control" rows="3"
                              placeholder="Respuesta a la solicitud..." maxlength="500"></textarea>
                </div>
            ` : ''}
        `;

    // Acciones en modal
    const actionsHtml = solicitud.status === 'pendiente' ? `
            <button type="button" class="btn btn-sm btn-light" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-sm btn-success me-2"
                    data-action="solicitud-aprobar"
                    data-solicitud-id="${sanitizeHTML(solicitud.id)}">
                Aprobar
            </button>
            <button type="button" class="btn btn-sm btn-danger"
                    data-action="solicitud-rechazar"
                    data-solicitud-id="${sanitizeHTML(solicitud.id)}">
                Rechazar
            </button>
        ` : `
            <button type="button" class="btn btn-sm btn-light" data-bs-dismiss="modal">Cerrar</button>
        `;

    document.getElementById('modal-actions').innerHTML = actionsHtml;

    // Mostrar modal
    // eslint-disable-next-line no-undef
    const modal = new bootstrap.Modal(document.getElementById('solicitudModal'));
    modal.show();
  },

  /**
     * Aprueba una solicitud
     */
  async aprobar(id) {
    if (!confirm('¿Aprobar esta solicitud?')) return;

    try {
      appState.set('isLoading', true);

      const respuesta = document.getElementById('respuesta-input')?.value?.trim() || '';

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/requests/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ response: respuesta })
      });

      if (!response.ok) throw new Error('Error al aprobar solicitud');

      appState.set('isLoading', false);
      logEvent('solicitud_aprobada', { id });

      // Cerrar modal si está abierto
      const modalEl = document.getElementById('solicitudModal');
      if (modalEl) {
        // eslint-disable-next-line no-undef
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      await this.cargar();
      this.mostrarSolicitudes();

    } catch (err) {
      appState.set('isLoading', false);
      handleError({
        error: err,
        context: 'aprobar',
        userMessage: 'Error al aprobar solicitud'
      });
    }
  },

  /**
     * Rechaza una solicitud
     */
  async rechazar(id) {
    if (!confirm('¿Rechazar esta solicitud?')) return;

    try {
      appState.set('isLoading', true);

      const respuesta = document.getElementById('respuesta-input')?.value?.trim() || '';

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/requests/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ response: respuesta })
      });

      if (!response.ok) throw new Error('Error al rechazar solicitud');

      appState.set('isLoading', false);
      logEvent('solicitud_rechazada', { id });

      // Cerrar modal
      const modalEl = document.getElementById('solicitudModal');
      if (modalEl) {
        // eslint-disable-next-line no-undef
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      await this.cargar();
      this.mostrarSolicitudes();

    } catch (err) {
      appState.set('isLoading', false);
      handleError({
        error: err,
        context: 'rechazar',
        userMessage: 'Error al rechazar solicitud'
      });
    }
  },

  /**
     * Envía respuesta a solicitud
     */
  enviarRespuesta() {
    if (!this.solicitudActual) return;

    const respuesta = document.getElementById('respuesta-input')?.value?.trim();
    if (!respuesta) {
      handleError({
        error: new Error('Respuesta vacía'),
        context: 'enviarRespuesta',
        userMessage: 'Escribe una respuesta'
      });
      return;
    }

    this.aprobar(this.solicitudActual.id);
  }
};

export { solicitudesController };
