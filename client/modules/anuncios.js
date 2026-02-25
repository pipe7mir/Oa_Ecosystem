/* ==============================================================================
   MÓDULO ANUNCIOS - AVANZADO: BATCH DELETE & UPLOAD
   ============================================================================== */

// import { supabase } from '../common/supabaseClient.js';
import { handleError, sanitizeHTML, logEvent } from '../common/errorHandler.js';
import { eventSystem } from '../common/eventDelegation.js';
import { appState } from '../common/stateManager.js';
import { showToast, showConfirmModal } from '../common/uiHelper.js';

/* ==============================================================================
   RENDERIZADO DEL MÓDULO
   ============================================================================== */

/**
 * Renderiza el panel de gestión de anuncios con diseño "Trama" y Glassmorphism
 * @returns {string} HTML del panel
 */
export async function renderAnuncios() {
  return `
        <section class="container-fluid py-4 animate__animated animate__fadeIn admin-trama text-theme-primary">
            
            <div class="row g-4">
                <!-- COLUMNA IZQUIERDA: FORMULARIO -->
                <div class="col-lg-7">
                    <div class="glass-panel p-4 h-100 position-relative animate__animated animate__slideInLeft">
                        <div class="glass-header p-3 rounded-top-4 mb-4 d-flex justify-content-between align-items-center">
                            <h4 class="mb-0 fw-bold text-gradient-purple">
                                <i class="bi bi-pencil-fill me-2"></i><span id="form-title">Nueva Publicación</span>
                            </h4>
                            <button type="button" class="btn btn-sm btn-outline-light rounded-pill px-3" data-action="anuncios-limpiar" title="Limpiar formulario">
                                <i class="bi bi-arrow-counterclockwise"></i> Reset
                            </button>
                        </div>

                        <!-- FIX: Usar data-submit-action para evitar que click active el envío -->
                        <form class="row g-3" data-submit-action="anuncios-guardar" id="form-anuncios" autocomplete="off">
                            <input type="hidden" id="anuncio-id">
                            
                            <div class="col-12">
                                <label class="form-label-glass">Título Principal <span class="text-danger">*</span></label>
                                <input type="text" id="anuncio-titulo" class="form-control input-glass p-3" 
                                       placeholder="Escribe un título llamativo..." required maxlength="100">
                            </div>

                            <div class="col-md-6">
                                <label class="form-label-glass">Fecha del Evento</label>
                                <input type="datetime-local" id="anuncio-fecha" class="form-control input-glass p-3">
                            </div>

                            <div class="col-md-6">
                                <label class="form-label-glass">Ubicación</label>
                                <input type="text" id="anuncio-lugar" class="form-control input-glass p-3" 
                                       placeholder="Ej: Sala 1">
                            </div>

                            <div class="col-12">
                                <label class="form-label-glass">Descripción</label>
                                <textarea id="anuncio-descripcion" class="form-control input-glass p-3" 
                                          rows="4" placeholder="Detalles de la publicación..." maxlength="500"></textarea>
                            </div>

                            <div class="col-12">
                                <label class="form-label-glass">Imagen del Anuncio (Max 2MB)</label>
                                <div class="oasis-file-upload" id="drop-zone">
                                    <input type="file" id="anuncio-archivo" accept="image/*">
                                    <input type="hidden" id="anuncio-imagen-url"> <!-- Guarda URL Base64 o remota -->
                                    <div id="upload-label">
                                        <i class="bi bi-cloud-arrow-up-fill text-theme-secondary"></i>
                                        <p class="mb-0 small text-theme-secondary">Haz clic o arrastra una imagen aquí</p>
                                    </div>
                                    <div id="upload-preview" class="d-none position-relative">
                                        <img src="" class="img-fluid rounded-3 shadow-sm" style="max-height: 150px; object-fit: cover;">
                                        <button type="button" class="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 m-1" id="remove-image">
                                            <i class="bi bi-x"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12 mt-4 pt-3 border-top border-white-10 text-end">
                                <button type="submit" class="btn btn-oasis px-5 py-3 rounded-pill fw-bold w-100 shadow-lg">
                                    <i class="bi bi-rocket-takeoff-fill me-2"></i> PUBLICAR ANUNCIO
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- COLUMNA DERECHA: PREVIEW -->
                <div class="col-lg-5">
                    <div class="glass-panel p-4 h-100 d-flex flex-column animate__animated animate__slideInRight">
                        <h5 class="text-theme-secondary text-center mb-4 small text-uppercase fw-bold letter-spacing-2">Vista Previa en Vivo</h5>
                        
                        <div class="preview-container flex-grow-1 d-flex align-items-center justify-content-center">
                            <!-- SIMULACIÓN DE POSTER -->
                            <div class="live-preview-box w-100" id="preview-box">
                                <!-- Imagen de Fondo -->
                                <div id="preview-image" style="width: 100%; height: 100%; background-size: cover; background-position: center; background-color: #2a2a2a; opacity: 0.6; transition: all 0.5s ease;"></div>
                                
                                <!-- Contenido Superpuesto -->
                                <div class="live-preview-content">
                                    <h3 id="preview-title" class="fw-bold mb-2 text-white" style="font-family: 'MoonRising', sans-serif; text-shadow: 0 2px 10px rgba(0,0,0,0.8);">Título del Anuncio</h3>
                                    
                                    <div class="d-flex align-items-center mb-2 text-warning small">
                                        <i class="bi bi-calendar-event me-2"></i>
                                        <span id="preview-date">Fecha del evento</span>
                                        <span class="mx-2">|</span>
                                        <i class="bi bi-geo-alt me-2"></i>
                                        <span id="preview-location">Ubicación</span>
                                    </div>

                                    <p id="preview-desc" class="small text-white-50 mb-0 line-clamp-3">
                                        Descripción...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN INFERIOR: LISTADO -->
            <div class="row mt-5">
                <div class="col-12">
                    <div class="glass-panel overflow-hidden animate__animated animate__fadeInUp">
                        <div class="glass-header p-4 border-bottom border-white-10">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center gap-3">
                                    <h5 class="mb-0 fw-bold text-theme-primary"><i class="bi bi-collection-play me-2"></i>Publicaciones Activas</h5>
                                    <button class="btn btn-sm btn-danger rounded-pill px-3 d-none animate__animated animate__fadeIn" id="btn-delete-batch" data-action="anuncios-delete-batch">
                                        <i class="bi bi-trash3-fill me-1"></i> Eliminar Selección (<span id="count-selected">0</span>)
                                    </button>
                                </div>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-outline-light rounded-circle" data-action="anuncios-refresh" title="Actualizar lista">
                                        <i class="bi bi-arrow-repeat"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body p-0" id="anuncios-container">
                            <div class="text-center p-5">
                                <div class="spinner-grow text-primary"></div>
                                <p class="text-theme-secondary mt-2">Cargando...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
}

/* ==============================================================================
   INICIALIZACIÓN
   ============================================================================== */

export async function initAnuncios() {
  try {
    logEvent('anuncios_admin_init');

    // Registrar acciones
    // FIX: Ahora escuchamos 'anuncios-guardar' vía submit handler en eventDelegation (usando data-submit-action)
    eventSystem.register('anuncios-guardar', (form) => anunciosController.guardar(form));

    eventSystem.register('anuncios-editar', (element) => {
      const id = element.dataset.anuncioId;
      anunciosController.prepararEdicion(id);
    });

    eventSystem.register('anuncios-eliminar', (element) => {
      const id = element.dataset.anuncioId;
      anunciosController.eliminar(id);
    });

    eventSystem.register('anuncios-refresh', () => anunciosController.cargar());

    eventSystem.register('anuncios-limpiar', () => anunciosController.limpiarForm());

    // Batch Actions
    eventSystem.register('anuncios-check-all', (checkbox) => anunciosController.toggleCheckAll(checkbox));
    eventSystem.register('anuncios-check-item', () => anunciosController.updateBatchButton());
    eventSystem.register('anuncios-delete-batch', () => anunciosController.eliminarLote());

    // Activar Live Preview
    anunciosController.setupLivePreview();
    anunciosController.setupImageUpload();

    // Cargar anuncios existentes
    await anunciosController.cargar();

  } catch (err) {
    handleError({
      error: err,
      context: 'initAnuncios',
      severity: 'warning'
    });
  }
}

/* ==============================================================================
   CONTROLADOR
   ============================================================================== */

const anunciosController = {
  localData: [],

  /**
     * Configura los listeners para la subida de imagen
     */
  setupImageUpload() {
    const fileInput = document.getElementById('anuncio-archivo');
    const hiddenInput = document.getElementById('anuncio-imagen-url');
    const uploadLabel = document.getElementById('upload-label');
    const uploadPreview = document.getElementById('upload-preview');
    const previewImg = uploadPreview?.querySelector('img');
    const removeBtn = document.getElementById('remove-image');

    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validar tamaño (2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast('La imagen supera los 2MB', 'error');
        fileInput.value = '';
        return;
      }

      // Leer archivo
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        hiddenInput.value = base64;

        // Actualizar UI Upload
        uploadLabel.classList.add('d-none');
        uploadPreview.classList.remove('d-none');
        if (previewImg) previewImg.src = base64;

        // Actualizar Live Preview
        document.getElementById('preview-image').style.backgroundImage = `url('${base64}')`;
      };
      reader.readAsDataURL(file);
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar abrir dialogo de archivo
        e.preventDefault();
        this.limpiarImagen();
      });
    }
  },

  /**
     * Limpia el campo de imagen y su preview
     */
  limpiarImagen() {
    const fileInput = document.getElementById('anuncio-archivo');
    const hiddenInput = document.getElementById('anuncio-imagen-url');
    const uploadLabel = document.getElementById('upload-label');
    const uploadPreview = document.getElementById('upload-preview');

    if (fileInput) fileInput.value = '';
    if (hiddenInput) hiddenInput.value = '';
    if (uploadLabel) uploadLabel.classList.remove('d-none');
    if (uploadPreview) uploadPreview.classList.add('d-none');
    document.getElementById('preview-image').style.backgroundImage = 'none';
  },

  /**
     * Configura los listeners para la vista previa en tiempo real
     */
  setupLivePreview() {
    const inputs = {
      title: document.getElementById('anuncio-titulo'),
      date: document.getElementById('anuncio-fecha'),
      location: document.getElementById('anuncio-lugar'),
      desc: document.getElementById('anuncio-descripcion')
    };

    const previews = {
      title: document.getElementById('preview-title'),
      date: document.getElementById('preview-date'),
      location: document.getElementById('preview-location'),
      desc: document.getElementById('preview-desc')
    };

    if (!inputs.title) return; // Si no hay elementos, salir

    // Helper para actualizar texto
    const updateText = (input, target, fallback) => {
      if (target) target.innerText = input.value.trim() || fallback;
    };

    // Listeners (usamos 'input' para feedback inmediato)
    inputs.title?.addEventListener('input', () => updateText(inputs.title, previews.title, 'Título del Anuncio'));

    inputs.date?.addEventListener('input', () => {
      const dateVal = inputs.date.value;
      if (previews.date) previews.date.innerText = dateVal ? new Date(dateVal).toLocaleString() : 'Fecha del evento';
    });

    inputs.location?.addEventListener('input', () => updateText(inputs.location, previews.location, 'Ubicación'));

    inputs.desc?.addEventListener('input', () => updateText(inputs.desc, previews.desc, 'Descripción...'));

    // Detener propagación de clicks dentro del formulario para evitar submit accidental
    // aunque data-submit-action ya lo previene, esto es seguridad extra
    const form = document.getElementById('form-anuncios');
    if (form) {
      form.addEventListener('click', (e) => {
        // No hacemos nada, solo asegurar que event delegation no confunda clicks con submits
      });
    }
  },

  /**
     * Limpia el formulario y resetea la vista previa
     */
  limpiarForm() {
    document.getElementById('form-anuncios')?.reset();
    document.getElementById('anuncio-id').value = '';
    document.getElementById('form-title').innerText = 'Nueva Publicación';

    // Reset Preview
    document.getElementById('preview-title').innerText = 'Título del Anuncio';
    document.getElementById('preview-date').innerText = 'Fecha del evento';
    document.getElementById('preview-location').innerText = 'Ubicación';
    document.getElementById('preview-desc').innerText = 'Descripción...';

    this.limpiarImagen();

    showToast('Formulario limpiado', 'info');
  },

  /**
     * Guarda o actualiza un anuncio
     */
  /**
     * Helper param obtener headers de auth
     */
  getAuthHeaders() {
    const token = appState.get('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  /**
     * Guarda o actualiza un anuncio
     */
  async guardar() {
    try {
      const id = document.getElementById('anuncio-id')?.value;
      const title = document.getElementById('anuncio-titulo')?.value?.trim();
      const event_date = document.getElementById('anuncio-fecha')?.value;
      const description = document.getElementById('anuncio-descripcion')?.value?.trim();
      const image_url = document.getElementById('anuncio-imagen-url')?.value?.trim();
      const location = document.getElementById('anuncio-lugar')?.value?.trim();

      if (!title) {
        showToast('El título es obligatorio', 'warning');
        document.getElementById('anuncio-titulo')?.focus();
        return;
      }

      appState.set('isLoading', true);

      const payload = {
        title: sanitizeHTML(title),
        event_date: event_date || null,
        description: sanitizeHTML(description),
        image_url: image_url || null,
        location: location ? sanitizeHTML(location) : null
      };

      let response;
      const url = `${import.meta.env.VITE_API_URL}/announcements`;
      const method = (id && id !== '') ? 'PUT' : 'POST';
      const endpoint = (id && id !== '') ? `${url}/${id}` : url;

      response = await fetch(endpoint, {
        method: method,
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al guardar anuncio');

      appState.set('isLoading', false);
      showToast(id ? 'Actualizado correctamente' : 'Publicado correctamente', 'success');

      this.limpiarForm();
      await this.cargar();

    } catch (err) {
      appState.set('isLoading', false);
      showToast('Error al guardar', 'error');
      handleError({
        error: err,
        context: 'guardar',
        userMessage: 'Error al procesar la solicitud'
      });
    }
  },

  /**
     * Carga lista de anuncios
     */
  async cargar() {
    const container = document.getElementById('anuncios-container');
    if (!container) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Error al cargar anuncios');

      this.localData = await response.json();
      this.renderTable(container);
      this.updateBatchButton();
      logEvent('anuncios_loaded', { count: this.localData.length });
    } catch (err) {
      this.localData = [];
      this.renderTable(container);
      handleError({ error: err, context: 'cargar' });
    }
  },

  /**
     * Renderiza la tabla completa de anuncios
     */
  renderTable(container) {
    if (this.localData.length === 0) {
      container.innerHTML = `
                    <div class="text-center p-5 text-theme-secondary">
                        <i class="bi bi-inbox-fill display-4 opacity-50 mb-3"></i>
                        <p>No hay publicaciones.</p>
                    </div>`;
      return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 text-theme-primary">
                <thead class="glass-header">
                    <tr>
                        <th class="ps-4 border-0" style="width: 50px;">
                            <input type="checkbox" class="form-check-input oasis-check" data-action="anuncios-check-all">
                        </th>
                        <th class="border-0">Publicación</th>
                        <th class="border-0">Fecha Evento</th>
                        <th class="text-end pe-4 border-0">Acciones</th>
                    </tr>
                </thead>
                <tbody class="border-top-0">
                    ${this.localData.map(a => this.renderRow(a)).join('')}
                </tbody>
            </table>
        </div>`;
  },

  // ... renderRow, toggleCheckAll, updateBatchButton ...

  /**
     * Elimina múltiples anuncios seleccionados
     */
  async eliminarLote() {
    const checks = document.querySelectorAll('.item-check:checked');
    const ids = Array.from(checks).map(c => c.value);

    if (ids.length === 0) return;

    showConfirmModal(
      'Eliminar Múltiples',
      `¿Estás seguro de eliminar <b>${ids.length}</b> anuncios seleccionados? Esta acción no se puede deshacer.`,
      async () => {
        try {
          appState.set('isLoading', true);

          // Execute deletions in parallel
          const deletePromises = ids.map(id =>
            fetch(`${import.meta.env.VITE_API_URL}/announcements/${id}`, {
              method: 'DELETE',
              headers: this.getAuthHeaders()
            })
          );

          await Promise.all(deletePromises);

          logEvent('anuncios_deleted_batch', { count: ids.length });
          showToast(`Se eliminaron ${ids.length} anuncios`, 'success');
          appState.set('isLoading', false);
          await this.cargar(); // Recargar tabla
          // Reset header check
          const headerCheck = document.querySelector('[data-action="anuncios-check-all"]');
          if (headerCheck) headerCheck.checked = false;
        } catch (err) {
          appState.set('isLoading', false);
          handleError({ error: err, context: 'eliminarLote' });
          showToast('Error al eliminar lote', 'error');
        }
      }
    );
  },

  // ... prepararEdicion ...

  /**
     * Elimina un anuncio
     */
  async eliminar(id) {
    showConfirmModal(
      'Eliminar Publicación',
      '¿Estás seguro de que deseas eliminar permanentemente este anuncio? Esta acción no se puede deshacer.',
      async () => {
        try {
          appState.set('isLoading', true);
          const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });

          if (!response.ok) throw new Error('Error al eliminar');

          logEvent('anuncios_deleted', { id });
          appState.set('isLoading', false);
          await this.cargar();
          showToast('Anuncio eliminado correctamente', 'success');
        } catch (err) {
          appState.set('isLoading', false);
          handleError({ error: err, context: 'eliminar' });
          showToast('Error al eliminar', 'error');
        }
      }
    );
  }
};

export { anunciosController };
