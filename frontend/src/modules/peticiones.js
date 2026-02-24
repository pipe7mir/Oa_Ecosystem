// import { supabase } from '../common/supabaseClient.js'; // REMOVED
import { handleError, sanitizeHTML, logEvent } from '../common/errorHandler.js';
import { eventSystem } from '../common/eventDelegation.js';
import { appState } from '../common/stateManager.js';

/* ==============================================================================
   MÓDULO DE PETICIONES Y SOLICITUDES - OASIS
   Este módulo maneja todas las interacciones relacionadas con solicitudes de
   los usuarios (oración, visitación, ayuda social, etc.)
   ============================================================================== */

/**
 * Renderiza la pantalla inicial del módulo de peticiones
 * @returns {string} HTML para el contenedor de peticiones
 */
export async function renderPeticiones() {
  return `
        <section class="container py-5 animate__animated animate__fadeIn">
            <div id="peticiones-flow-container">
                <div class="card border-0 shadow-lg rounded-4 p-5 text-center mx-auto" style="max-width: 600px;">
                    <i class="bi bi-shield-lock text-primary mb-4" style="font-size: 4rem;"></i>
                    <h2 class="fw-bold mb-3">Protección de Datos</h2>
                    <p class="text-muted mb-4">
                        En la Iglesia OASIS valoramos tu privacidad. Para procesar tu solicitud, necesitamos tu autorización para el tratamiento de datos personales conforme a la Ley 1581 de 2012.
                    </p>
                    <div class="d-grid gap-2">
                        <button class="btn btn-oasis py-3 rounded-pill fw-bold" data-action="peticiones-accept-privacy">
                            AUTORIZO EL TRATAMIENTO
                        </button>
                        <button class="btn btn-light py-2 rounded-pill text-muted" data-action="back-to-home">
                            No acepto, volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        </section>
    `;
}

/**
 * Inicializa el módulo de peticiones
 * Registra los manejadores de eventos según el patrón de delegación
 */
export function initPeticiones() {
  try {
    // Registrar acciones en el sistema de delegación de eventos
    eventSystem.register('peticiones-accept-privacy', () => {
      peticionesController.acceptPrivacy();
    });

    eventSystem.register('peticiones-open-form', (element) => {
      const categoria = element.dataset.categoria;
      peticionesController.openForm(categoria);
    });

    eventSystem.register('peticiones-toggle-contact', (element) => {
      const show = element.getAttribute('data-show') === 'true';
      peticionesController.toggleContact(show);
    });

    eventSystem.register('peticiones-submit-form', (element) => {
      const form = element.closest('form') || element;
      peticionesController.submitRequest(form);
    });

    eventSystem.register('back-to-home', () => {
      window.location.hash = '#home';
    });

    logEvent('peticiones_module_initialized', { timestamp: new Date().toISOString() });
  } catch (err) {
    handleError({
      error: err,
      context: 'initPeticiones',
      userMessage: 'Error al inicializar el módulo de peticiones'
    });
  }
}

/* ==============================================================================
   CONTROLADOR ENCAPSULADO - Patrón para evitar variables globales
   ============================================================================== */

const peticionesController = {
  /**
     * Aceptar privacidad y mostrar categorías de solicitudes
     */
  acceptPrivacy() {
    const container = document.getElementById('peticiones-flow-container');
    if (!container) {
      handleError({
        error: new Error('Container no encontrado'),
        context: 'acceptPrivacy',
        severity: 'warning'
      });
      return;
    }

    try {
      container.innerHTML = `
                <div class="text-center mb-5 animate__animated animate__fadeInDown">
                    <h2 class="titulo_seccion">¿En qué podemos apoyarte hoy?</h2>
                    <p class="text-muted">Selecciona una categoría para iniciar tu solicitud</p>
                </div>

                <div class="row g-4 justify-content-center animate__animated animate__fadeInUp">
                    ${this.renderCategoryCard('Oración', 'bi-hands-pray', 'Apoyo espiritual')}
                    ${this.renderCategoryCard('Visitación', 'bi-house-heart', 'Solicitud al hogar')}
                    ${this.renderCategoryCard('Traslado', 'bi-file-earmark-arrow-up', 'Feligresía')}
                    ${this.renderCategoryCard('Ayuda Social', 'bi-heart-pulse', 'Apoyo en necesidad')}
                    ${this.renderCategoryCard('Hospitales', 'bi-hospital', 'Visita médica')}
                    ${this.renderCategoryCard('Eventos', 'bi-calendar-check', 'Inscripciones')}
                </div>
            `;

      logEvent('peticiones_categories_shown', { action: 'acceptPrivacy' });
    } catch (err) {
      handleError({
        error: err,
        context: 'acceptPrivacy',
        userMessage: 'Error al cargar las categorías'
      });
    }
  },

  /**
     * Renderiza una tarjeta de categoría
     * @param {string} titulo - Título de la categoría
     * @param {string} icono - Clase del ícono bootstrap
     * @param {string} sub - Subtítulo descriptivo
     * @returns {string} HTML de la tarjeta
     */
  renderCategoryCard(titulo, icono, sub) {
    return `
            <div class="col-6 col-md-4 col-lg-2">
                <div class="oasis-square-card mx-auto w-100" 
                     data-action="peticiones-open-form" 
                     data-categoria="${sanitizeHTML(titulo)}"
                     style="cursor: pointer;">
                    <i class="bi ${icono}"></i>
                    <div class="card-info">
                        <span class="fw-bold">${sanitizeHTML(titulo)}</span>
                        <small>${sanitizeHTML(sub)}</small>
                    </div>
                </div>
            </div>
        `;
  },

  /**
     * Abre el formulario de una categoría específica
     * @param {string} categoria - Categoría seleccionada
     */
  openForm(categoria) {
    const container = document.getElementById('peticiones-flow-container');
    if (!container) return;

    try {
      appState.set('currentPeticionCategory', categoria);

      container.innerHTML = `
                <div class="col-lg-7 mx-auto animate__animated animate__zoomIn">
                    <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div class="card-header bg-oasis-purple text-white p-4 border-0">
                            <div class="d-flex justify-content-between align-items-center">
                                <h3 class="mb-0 fw-bold fs-4">Solicitud de ${sanitizeHTML(categoria)}</h3>
                                <button class="btn-close btn-close-white" data-action="peticiones-accept-privacy"></button>
                            </div>
                        </div>
                        <div class="card-body p-4 p-md-5">
                            <form id="form-peticion" data-action="peticiones-submit-form">
                                <p class="text-center text-muted small mb-4">Tu información será tratada con confidencialidad.</p>
                                
                                <div class="mb-4">
                                    <div class="btn-group w-100 shadow-sm rounded-pill overflow-hidden" role="group">
                                        <input type="radio" class="btn-check" name="anonimo" id="modo1" value="false" checked>
                                        <label class="btn btn-oasis-outline" for="modo1">
                                            <i class="bi bi-person-check me-2"></i>Con mis datos
                                        </label>
                                        
                                        <input type="radio" class="btn-check" name="anonimo" id="modo2" value="true">
                                        <label class="btn btn-oasis-outline" for="modo2">
                                            <i class="bi bi-incognito me-2"></i>Anónimo
                                        </label>
                                    </div>
                                </div>

                                <div id="contact-fields" class="animate__animated animate__fadeIn">
                                    <div class="row g-3 mb-3">
                                        <div class="col-md-6">
                                            <input type="text" 
                                                   id="p_nombre" 
                                                   class="form-control rounded-pill px-4 bg-light border-0" 
                                                   placeholder="Nombre completo"
                                                   maxlength="100">
                                        </div>
                                        <div class="col-md-6">
                                            <input type="tel" 
                                                   id="p_celular" 
                                                   class="form-control rounded-pill px-4 bg-light border-0" 
                                                   placeholder="WhatsApp"
                                                   maxlength="20">
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <textarea id="p_descripcion" 
                                              class="form-control rounded-4 p-4 bg-light border-0" 
                                              rows="4" 
                                              placeholder="Escribe aquí los detalles..." 
                                              required
                                              maxlength="1000"></textarea>
                                </div>

                                <button type="submit" 
                                        id="btn-submit-peticion" 
                                        class="btn btn-oasis-gradient w-100 py-3 rounded-pill fw-bold text-white shadow">
                                    ENVIAR AHORA
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;

      // Configurar manejadores de cambio para los radios
      document.querySelectorAll('input[name="anonimo"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          const show = e.target.value === 'false';
          this.toggleContact(show);
        });
      });

      logEvent('peticiones_form_opened', { categoria: sanitizeHTML(categoria) });
    } catch (err) {
      handleError({
        error: err,
        context: 'openForm',
        userMessage: 'Error al abrir el formulario'
      });
    }
  },

  /**
     * Alterna la visibilidad de campos de contacto
     * @param {boolean} show - Mostrar u ocultar campos
     */
  toggleContact(show) {
    const fields = document.getElementById('contact-fields');
    if (!fields) return;

    try {
      if (show) {
        fields.style.display = 'block';
        fields.classList.add('animate__animated', 'animate__fadeIn');
      } else {
        fields.style.display = 'none';
        // Limpiar campos cuando se selecciona anónimo
        document.getElementById('p_nombre').value = '';
        document.getElementById('p_celular').value = '';
      }
      logEvent('peticiones_contact_toggled', { show });
    } catch (err) {
      handleError({
        error: err,
        context: 'toggleContact',
        severity: 'warning'
      });
    }
  },

  /**
     * Envía la solicitud al servidor
     * @param {HTMLFormElement} form - El formulario a enviar
     */
  submitRequest: async function (form) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

    try {
      const isAnon = form.querySelector('input[name="anonimo"]:checked').value === 'true';
      const nombre = form.querySelector('#p_nombre').value.trim();
      const celular = form.querySelector('#p_celular').value.trim();
      const descripcion = form.querySelector('#p_descripcion').value.trim();
      const categoria = appState.get('currentPeticionCategory');

      // Validación
      if (!isAnon && !nombre) {
        throw new Error('Por favor ingresa tu nombre');
      }
      if (!isAnon && !celular) {
        throw new Error('Por favor ingresa tu teléfono');
      }
      if (!descripcion) {
        throw new Error('Por favor describe tu solicitud');
      }

      const requestData = {
        category: categoria,
        description: sanitizeHTML(descripcion),
        is_anonymous: isAnon,
        contact_name: isAnon ? 'Anónimo' : sanitizeHTML(nombre),
        contact_phone: isAnon ? 'N/A' : sanitizeHTML(celular)
      };

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al enviar la solicitud');
      }

      logEvent('peticiones_submitted', { categoria, isAnon });
      this.showSuccess(categoria);
    } catch (err) {
      handleError({
        error: err,
        context: 'submitRequest',
        userMessage: 'Error al enviar tu solicitud. Por favor intenta de nuevo.'
      });
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  },

  /**
     * Muestra el mensaje de éxito
     * @param {string} categoria - Categoría de la solicitud
     */
  showSuccess(categoria) {
    const container = document.getElementById('peticiones-flow-container');
    if (!container) return;

    container.innerHTML = `
            <div class="text-center p-5 animate__animated animate__bounceIn">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
                <h2 class="mt-4 fw-bold">¡Petición de ${sanitizeHTML(categoria)} enviada!</h2>
                <p class="text-muted">Hemos recibido tu solicitud. Un líder de OASIS se pondrá en contacto contigo si así lo solicitaste.</p>
                <button class="btn btn-oasis px-5 mt-3 rounded-pill" data-action="back-to-home">
                    Volver al inicio
                </button>
            </div>
        `;

    appState.set('currentPeticionCategory', null);
  }
};

// Exportar para acceso externo si es necesario (compatibilidad)
export { peticionesController };
