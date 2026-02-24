/**
 * SISTEMA DE EVENT DELEGATION CENTRALIZADO
 * Reemplaza onclick= inline handlers con data-attributes
 * Patrón: event delegation con validación de seguridad
 */

class EventDelegationSystem {
  constructor() {
    this.handlers = new Map();
    this.setupDelegation();
  }

  /**
   * Registra un handler para un action específico
   * @param {string} action - Acción identificadora (ej: 'accept-privacy')
   * @param {Function} handler - Función a ejecutar
   * @param {string} scope - Elemento contenedor (default: document)
   */
  register(action, handler, scope = document) {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, []);
    }
    this.handlers.get(action).push({ handler, scope });
  }

  /**
   * Setup del sistema de delegación
   */
  setupDelegation() {
    // Delegación global en document
    document.addEventListener('click', (e) => this.handleClick(e));
    document.addEventListener('submit', (e) => this.handleSubmit(e));
    document.addEventListener('change', (e) => this.handleChange(e));
  }

  /**
   * Maneja click events delegados
   */
  handleClick(e) {
    const element = e.target.closest('[data-action]');
    if (!element) return;
    
    const action = element.getAttribute('data-action');
    if (!action) return;

    const handlers = this.handlers.get(action) || [];
    handlers.forEach(({ handler, scope }) => {
      if (scope.contains(element)) {
        try {
          handler(element, e);
        } catch (error) {
          console.error(`Error in action: ${action}`, error);
        }
      }
    });
  }

  /**
   * Maneja submit events delegados
   */
  handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    // Buscamos atributo en el formulario o en un padre (aunque usualmente es el form)
    const action = form.getAttribute('data-submit-action'); 
    
    if (!action) return;

    const handlers = this.handlers.get(action) || [];
    handlers.forEach(({ handler }) => {
      try {
        handler(form, e);
      } catch (error) {
        console.error(`Error in form submission: ${action}`, error);
      }
    });
  }

  /**
   * Maneja change events delegados
   */
  handleChange(e) {
    const action = e.target.getAttribute('data-change-action');
    if (!action) return;

    const handlers = this.handlers.get(action) || [];
    handlers.forEach(({ handler }) => {
      try {
        handler(e);
      } catch (error) {
        console.error(`Error in change action: ${action}`, error);
      }
    });
  }

  /**
   * Obtiene data-attributes de un elemento
   * @param {Element} element - Elemento
   * @returns {Object} Object con todos los data attributes
   */
  getDataAttributes(element) {
    return Object.assign({}, element.dataset);
  }

  /**
   * Ejecuta un handler directamente (para backward compatibility)
   */
  execute(action, event = null) {
    const handlers = this.handlers.get(action) || [];
    handlers.forEach(({ handler }) => {
      try {
        handler(event || {});
      } catch (error) {
        console.error(`Error executing action: ${action}`, error);
      }
    });
  }
}

// Instancia global única
export const eventSystem = new EventDelegationSystem();

export default eventSystem;
