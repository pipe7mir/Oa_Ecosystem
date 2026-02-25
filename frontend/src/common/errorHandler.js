/**
 * GESTOR CENTRALIZADO DE ERRORES
 * Proporciona manejo consistente de errores en toda la aplicación
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const getCurrentLogLevel = () => {
  const level = import.meta.env.VITE_LOG_LEVEL || 'warn';
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  return levels[level.toLowerCase()] || 1;
};

/**
 * Registra un mensaje en la consola según el nivel de log configurado
 * @param {string} level - Nivel de log (ERROR, WARN, INFO, DEBUG)
 * @param {string} context - Contexto donde ocurrió el error
 * @param {string|Error} message - Mensaje o error a registrar
 * @param {any} data - Datos adicionales (opcional)
 */
const logMessage = (level, context, message, data = null) => {
  const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
  const currentLevel = getCurrentLogLevel();
  
  if (levels[level] > currentLevel) return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}] [${context}]`;

  const logFn = {
    ERROR: console.error,
    WARN: console.warn,
    INFO: console.info,
    DEBUG: console.debug
  }[level] || console.log;

  if (data) {
    logFn(prefix, message, data);
  } else {
    logFn(prefix, message);
  }
};

/**
 * Obtiene un mensaje amigable al usuario según el tipo de error
 * @param {Error|string} error - El error capturado
 * @returns {string} Mensaje amigable al usuario
 */
const getFriendlyMessage = (error) => {
  const errorMessage = error?.message || String(error);

  if (errorMessage.includes('network') || errorMessage.includes('offline')) {
    return 'Error de conexión. Verifica tu internet.';
  }
  if (errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
    return 'No tienes permiso para realizar esta acción.';
  }
  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return 'El recurso solicitado no fue encontrado.';
  }
  if (errorMessage.includes('timeout') || errorMessage.includes('timeout')) {
    return 'La solicitud tardó demasiado. Intenta de nuevo.';
  }
  if (errorMessage.includes('validation')) {
    return 'Hay campos inválidos en el formulario.';
  }
  if (errorMessage.includes('already exists')) {
    return 'Este registro ya existe en el sistema.';
  }

  return 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
};

/**
 * Maneja un error y retorna un mensaje para mostrar al usuario
 * @param {Error} error - El error capturado
 * @param {string} context - Contexto donde ocurrió el error (ej: 'loginUser', 'fetchUsers')
 * @param {string} userFacingMessage - Mensaje alternativo personalizado (opcional)
 * @returns {Object} Objeto con success: false y mensaje para usuario
 */
export const handleError = (arg1, arg2 = null, arg3 = null) => {
  // Soporta dos firmas:
  // 1) handleError(error, context, userFacingMessage)
  // 2) handleError({ error, context, userMessage, severity })
  let error = null;
  let context = 'unknown';
  let userFacingMessage = null;
  let severity = null;

  if (arg1 && typeof arg1 === 'object' && (arg1.error || arg1.context || arg1.userMessage)) {
    error = arg1.error || new Error('Unknown error');
    context = arg1.context || 'unknown';
    userFacingMessage = arg1.userMessage || arg1.userMessage === '' ? arg1.userMessage : arg1.userMessage;
    // Backwards-compatible key name
    if (!userFacingMessage && arg1.userMessage === undefined && arg1.userMessage === undefined) {
      userFacingMessage = arg1.userMessage || arg1.userMessage;
    }
    // Accept both 'userMessage' and 'userFacingMessage'
    userFacingMessage = arg1.userMessage || arg1.userFacingMessage || userFacingMessage;
    severity = arg1.severity || null;
  } else {
    error = arg1 instanceof Error || typeof arg1 === 'object' ? arg1 : new Error(String(arg1));
    context = arg2 || 'unknown';
    userFacingMessage = arg3 || null;
  }

  const errorMessage = error?.message || String(error);

  // Log del error completo en consola (desarrollo)
  // Log as ERROR to ensure visibility in all environments/tests
  const level = LOG_LEVELS.ERROR;
  logMessage(level, context, errorMessage, error);

  // En producción, podrías enviar el error a un servicio de logging
  if (import.meta.env.PROD) {
    // sendErrorToLoggingService(context, error);
  }

  return {
    success: false,
    message: userFacingMessage || getFriendlyMessage(error),
    context,
    rawError: import.meta.env.DEV ? errorMessage : undefined
  };
};

/**
 * Valida un formulario HTML
 * @param {HTMLFormElement} form - Formulario a validar
 * @returns {Object} Objeto con success: boolean y errores
 */
export const validateForm = (form) => {
  if (!form) {
    return handleError(new Error('Formulario no encontrado'), 'validateForm');
  }

  const formData = new FormData(form);
  const errors = {};

  for (const [name, value] of formData.entries()) {
    const input = form.elements[name];
    
    // Validación de campos requeridos
    if (input.required && !value.trim()) {
      errors[name] = 'Este campo es requerido';
      continue;
    }

    // Validación de email
    if (input.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[name] = 'Email no válido';
        continue;
      }
    }

    // Validación de contraseña (mínimo 6 caracteres)
    if (input.type === 'password' && value) {
      if (value.length < 6) {
        errors[name] = 'La contraseña debe tener al menos 6 caracteres';
        continue;
      }
    }

    // Validación de teléfono (opcional, solo si tiene valor)
    if (input.type === 'tel' && value) {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(value)) {
        errors[name] = 'Teléfono no válido';
        continue;
      }
    }

    // Validación de URL
    if (input.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        errors[name] = 'URL no válida';
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: Object.fromEntries(formData) };
};

/**
 * Sanitiza HTML para evitar XSS
 * @param {string} html - HTML a sanitizar
 * @returns {string} HTML sanitizado
 */
export const sanitizeHTML = (html) => {
  if (html === null || html === undefined) return '';

  const temp = document.createElement('div');
  temp.innerHTML = String(html);

  // Remove potentially dangerous tags entirely
  temp.querySelectorAll('script, style').forEach((el) => el.remove());

  // Escape remaining markup
  const escaped = document.createElement('div');
  escaped.textContent = temp.innerHTML;
  return escaped.innerHTML;
};

/**
 * Muestra un mensaje de error en la UI
 * @param {HTMLElement} container - Elemento donde mostrar el error
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de alerta (danger, warning, info, success)
 */
export const showAlert = (container, message, type = 'danger') => {
  if (!container) return;

  // Sanitizar el mensaje
  const safeMessage = sanitizeHTML(message);

  const alertHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${safeMessage}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  container.innerHTML = alertHTML;

  // Auto-remove después de 5 segundos para alertas de éxito
  if (type === 'success') {
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }
};

/**
 * Logger de eventos importantes
 * @param {string} event - Nombre del evento
 * @param {Object} data - Datos del evento
 */
export const logEvent = (event, data = {}) => {
  // Always log events to console for observability in tests and dev
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} [EVENT] ${event}`, data);
};

/**
 * Logger de debugging
 * @param {string} message - Mensaje de debug
 * @param {any} data - Datos adicionales
 */
export const debugLog = (message, data = null) => {
  logMessage(LOG_LEVELS.DEBUG, 'DEBUG', message, data);
};

/**
 * Exportar objeto con todos los métodos
 */
export default {
  handleError,
  validateForm,
  sanitizeHTML,
  showAlert,
  logEvent,
  debugLog
};
