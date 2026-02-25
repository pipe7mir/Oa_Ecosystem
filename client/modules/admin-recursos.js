/* ==============================================================================
   MÓDULO ADMIN-RECURSOS - GESTOR DE INVENTARIO OASIS
   Gestión de stock, recursos educativos y materiales multimedia
   ============================================================================== */

// import { supabase } from '../common/supabaseClient.js'; // REMOVED
import { handleError, sanitizeHTML, logEvent } from '../common/errorHandler.js';
import { eventSystem } from '../common/eventDelegation.js';
import { appState } from '../common/stateManager.js';

/* ==============================================================================
   RENDERIZADO DE LA INTERFAZ
   ============================================================================== */

/**
 * Renderiza el gestor de recursos administrativo
 * @returns {string} HTML de la interfaz
 */
export async function renderAdminRecursos() {
  return `
        <div class="admin-recursos-wrapper p-3 animate__animated animate__fadeIn">
            <div class="glass-header d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm" 
                 style="background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);">
                <div>
                    <h3 class="fw-bold text-primary mb-0" style="font-family: 'Moonrising', sans-serif;">Gestión de Stock</h3>
                    <p class="text-muted small mb-0">Administración institucional Oasis</p>
                </div>
                <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold border-0"
                        data-action="admin-recursos-toggle-form">
                    <i class="bi bi-plus-lg me-2"></i>Añadir Producto
                </button>
            </div>

            <div id="form-recurso-container" class="detail-card-body mb-4 d-none shadow-lg p-4 border-0 rounded-4 animate__animated animate__fadeInDown">
                <h5 id="form-title" class="fw-bold mb-4 text-dark border-bottom pb-3">Registrar Recurso</h5>
                <input type="hidden" id="rec-id">
                <div class="row g-4">
                    <div class="col-md-6">
                        <label class="small fw-bold text-muted mb-2 d-block">Nombre del Recurso</label>
                        <input type="text" id="rec-titulo" class="form-control rounded-3 border-2 p-2 shadow-none" 
                               placeholder="Ej: Biblia Reina Valera PDF" maxlength="100">
                    </div>
                    <div class="col-md-3">
                        <label class="small fw-bold text-muted mb-2 d-block">Categoría</label>
                        <select id="rec-categoria" class="form-select rounded-3 border-2 p-2 shadow-none">
                            <option value="oasis">💎 OASIS</option>
                            <option value="multimedia">📸 Multimedia</option>
                            <option value="adventista">⛪ Institucional</option>
                            <option value="utilidad">🛠️ Utilidad</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="small fw-bold text-muted mb-2 d-block">Tipo Acción</label>
                        <select id="rec-accion" class="form-select rounded-3 border-2 p-2 shadow-none">
                            <option value="download">📥 Descarga</option>
                            <option value="link">🔗 Sitio Web</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="small fw-bold text-muted mb-2 d-block">URL Destino (Link)</label>
                        <input type="url" id="rec-link" class="form-control rounded-3 border-2 p-2 shadow-none" 
                               placeholder="https://..." required>
                    </div>
                    <div class="col-md-6">
                        <label class="small fw-bold text-muted mb-2 d-block">URL Miniatura (Imagen)</label>
                        <input type="url" id="rec-miniatura" class="form-control rounded-3 border-2 p-2 shadow-none" 
                               placeholder="https://...">
                    </div>
                    <div class="col-12 text-end pt-3 border-top">
                        <button class="btn btn-light px-4 me-2 rounded-pill fw-bold"
                                data-action="admin-recursos-toggle-form">
                            Cancelar
                        </button>
                        <button class="btn btn-primary px-4 btn-save-stock rounded-pill shadow-sm fw-bold border-0"
                                data-action="admin-recursos-guardar">
                            GUARDAR STOCK
                        </button>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-4 shadow-sm overflow-hidden border">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-dark text-white">
                            <tr class="small text-uppercase">
                                <th class="ps-4 py-3">Recurso / Detalle</th>
                                <th style="width: 25%;">Tipo Acción</th>
                                <th class="text-end pe-4" style="width: 15%;">Gestión</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-inventario-body">
                            <tr>
                                <td colspan="3" class="text-center p-5">
                                    <div class="spinner-grow text-primary" role="status"></div>
                                    <p class="text-muted mt-3">Cargando inventario...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
}

/* ==============================================================================
   INICIALIZACIÓN DEL MÓDULO
   ============================================================================== */

/**
 * Inicializa el módulo de recursos administrativos
 * Registra handlers y carga datos
 */
export async function initAdminRecursos() {
  try {
    logEvent('admin_recursos_init');

    // Registrar acciones
    eventSystem.register('admin-recursos-toggle-form', () => {
      adminRecursosController.toggleForm();
    });

    eventSystem.register('admin-recursos-guardar', () => {
      adminRecursosController.guardar();
    });

    eventSystem.register('admin-recursos-editar', (element) => {
      const id = element.dataset.resourceId;
      adminRecursosController.prepararEdicion(id);
    });

    eventSystem.register('admin-recursos-eliminar', (element) => {
      const id = element.dataset.resourceId;
      adminRecursosController.eliminar(id);
    });

    // Cargar datos iniciales
    await adminRecursosController.cargar();

  } catch (err) {
    handleError({
      error: err,
      context: 'initAdminRecursos',
      severity: 'critical'
    });
  }
}

/* ==============================================================================
   CONTROLADOR ENCAPSULADO
   ============================================================================== */

const adminRecursosController = {
  // Caché local para evitar latencia
  localData: [],

  /**
     * Alterna la visibilidad del formulario
     */
  toggleForm() {
    const form = document.getElementById('form-recurso-container');
    if (!form) return;

    try {
      form.classList.toggle('d-none');
      if (form.classList.contains('d-none')) {
        this.limpiarForm();
      } else {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      logEvent('admin_recursos_form_toggled');
    } catch (err) {
      handleError({
        error: err,
        context: 'toggleForm',
        severity: 'warning'
      });
    }
  },

  /**
     * Limpia campos del formulario
     */
  limpiarForm() {
    const fields = ['rec-id', 'rec-titulo', 'rec-link', 'rec-miniatura'];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const title = document.getElementById('form-title');
    if (title) title.innerText = 'Registrar Nuevo Recurso';
  },

  /**
     * Guarda o actualiza un recurso
     */
  async guardar() {
    const id = document.getElementById('rec-id')?.value;
    const titulo = document.getElementById('rec-titulo')?.value?.trim();
    const link = document.getElementById('rec-link')?.value?.trim();
    const miniatura = document.getElementById('rec-miniatura')?.value?.trim() || null;
    const categoria = document.getElementById('rec-categoria')?.value;
    const accion = document.getElementById('rec-accion')?.value;

    // Validación
    if (!titulo || !link) {
      handleError({
        error: new Error('Campos incompletos'),
        context: 'guardar',
        userMessage: 'Por favor completa el título y el URL del recurso'
      });
      return;
    }

    // Validar URL
    try {
      new URL(link);
      if (miniatura) new URL(miniatura);
    } catch {
      handleError({
        error: new Error('URL inválida'),
        context: 'guardar',
        userMessage: 'Por favor ingresa URLs válidas'
      });
      return;
    }

    const btn = document.querySelector('.btn-save-stock');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-grow spinner-border-sm me-2"></span>Sincronizando...';
    }

    try {
      const payload = {
        title: sanitizeHTML(titulo),
        category: categoria,
        download_url: sanitizeHTML(link),
        thumbnail_url: miniatura ? sanitizeHTML(miniatura) : null,
        action_type: accion
      };

      const apiUrl = import.meta.env.VITE_API_URL;
      let response;

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (id && id !== '') {
        response = await fetch(`${apiUrl}/resources/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
        logEvent('admin_recursos_updated', { id });
      } else {
        response = await fetch(`${apiUrl}/resources`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        logEvent('admin_recursos_created');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar recurso');
      }

      // UI feedback
      this.toggleForm();
      await this.cargar();

    } catch (err) {
      handleError({
        error: err,
        context: 'guardar',
        userMessage: 'Error al guardar el recurso'
      });
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'GUARDAR STOCK';
      }
    }
  },

  /**
     * Carga todos los recursos de la BD
     */
  async cargar() {
    const tableBody = document.getElementById('tabla-inventario-body');
    if (!tableBody) return;

    try {
      appState.set('isLoading', true);

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/resources`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al cargar recursos');

      const data = await response.json();

      // Caché local
      this.localData = data || [];

      // Renderizar tabla
      if (this.localData.length === 0) {
        tableBody.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center p-5 text-muted">
                            <i class="bi bi-inbox display-1 opacity-50"></i>
                            <p class="mt-3">El inventario está vacío</p>
                        </td>
                    </tr>`;
      } else {
        tableBody.innerHTML = this.localData.map(rec => this.renderRecursoRow(rec)).join('');
      }

      appState.set('isLoading', false);
      logEvent('admin_recursos_loaded', { count: this.localData.length });

    } catch (err) {
      appState.set('isLoading', false);
      handleError({
        error: err,
        context: 'cargar',
        userMessage: 'Error al cargar recursos'
      });
      tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center p-4 text-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Error de conexión
                    </td>
                </tr>`;
    }
  },

  /**
     * Renderiza una fila de recurso
     * @param {Object} rec - Objeto de recurso
     * @returns {string} HTML de la fila
     */
  renderRecursoRow(rec) {
    const titulo = sanitizeHTML(rec.title || 'Sin título');
    const categoria = sanitizeHTML(rec.category || 'General').toUpperCase();
    const tipo = rec.action_type === 'download' ? 'Descarga' : 'Sitio Web';
    const icono = rec.action_type === 'download' ? 'bi-cloud-arrow-down' : 'bi-link-45deg';
    const colorBg = rec.action_type === 'download' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info';

    return `
            <tr class="align-middle border-bottom item-row animate__animated animate__fadeIn">
                <td class="ps-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="img-preview-mini me-3 shadow-sm border rounded bg-light" 
                             style="width:45px; height:45px; overflow:hidden;">
                            ${rec.thumbnail_url
        ? `<img src="${sanitizeHTML(rec.thumbnail_url)}" 
                                        style="width:100%; height:100%; object-fit:cover;" 
                                        loading="lazy" 
                                        alt="${titulo}">`
        : '<i class="bi bi-box-seam text-muted d-flex justify-content-center pt-2"></i>'
      }
                        </div>
                        <div>
                            <div class="fw-bold text-dark small">${titulo}</div>
                            <span class="badge rounded-pill bg-light text-primary border" 
                                  style="font-size:0.65rem;">${categoria}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="badge ${colorBg} border px-3">
                        <i class="bi ${icono} me-1"></i>
                        ${tipo}
                    </div>
                </td>
                <td class="text-end pe-4">
                    <div class="btn-group btn-group-sm border rounded-pill bg-white overflow-hidden shadow-sm">
                        <button class="btn btn-hover-blue border-0"
                                data-action="admin-recursos-editar"
                                data-resource-id="${sanitizeHTML(rec.id)}">
                            <i class="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button class="btn btn-hover-red border-0"
                                data-action="admin-recursos-eliminar"
                                data-resource-id="${sanitizeHTML(rec.id)}">
                            <i class="bi bi-trash3 text-danger"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
  },

  /**
     * Prepara el formulario para edición
     * @param {string} id - ID del recurso a editar
     */
  prepararEdicion(id) {
    const rec = this.localData.find(r => r.id === id);
    if (!rec) {
      handleError({
        error: new Error('Recurso no encontrado'),
        context: 'prepararEdicion',
        severity: 'warning'
      });
      return;
    }

    try {
      this.toggleForm();
      const title = document.getElementById('form-title');
      if (title) title.innerText = 'Editando: ' + sanitizeHTML(rec.title);

      document.getElementById('rec-id').value = sanitizeHTML(rec.id);
      document.getElementById('rec-titulo').value = sanitizeHTML(rec.title);
      document.getElementById('rec-categoria').value = rec.category;
      document.getElementById('rec-link').value = sanitizeHTML(rec.download_url);
      document.getElementById('rec-miniatura').value = rec.thumbnail_url || '';
      document.getElementById('rec-accion').value = rec.action_type || 'download';

      logEvent('admin_recursos_edit_prepared', { id });
    } catch (err) {
      handleError({
        error: err,
        context: 'prepararEdicion',
        severity: 'warning'
      });
    }
  },

  /**
     * Elimina un recurso
     * @param {string} id - ID del recurso
     */
  async eliminar(id) {
    if (!confirm('¿Deseas eliminar este material de forma permanente?')) {
      return;
    }

    try {
      appState.set('isLoading', true);

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/resources/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al eliminar recurso');

      logEvent('admin_recursos_deleted', { id });
      appState.set('isLoading', false);

      // Recargar tabla
      await this.cargar();

    } catch (err) {
      appState.set('isLoading', false);
      handleError({
        error: err,
        context: 'eliminar',
        userMessage: 'Error al eliminar el recurso'
      });
    }
  }
};

export { adminRecursosController };
