/**
 * GESTOR DE ESTADO CENTRALIZADO SIMPLE
 * State Management sin complejidad
 * Patrón Observer/Pub-Sub
 */

export class AppStateManager {
  constructor() {
    this.state = {
      user: null,
      userRole: null,
      session: null,
      notifications: [],
      isLoading: false,
      currentModule: null,
      sidebarOpen: false,
      theme: 'light'
    };

    this.listeners = [];
    this.history = [];
    this.maxHistory = 50;
  }

  /**
   * Obtiene el estado completo
   * @returns {Object} Estado actual
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Obtiene un valor específico del estado
   * @param {string} key - Clave del estado
   * @returns {*} Valor del estado
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Establece un valor en el estado
   * @param {string} key - Clave
   * @param {*} value - Valor nuevo
   * @param {Object} metadata - Metadata adicional (opcional)
   */
  set(key, value, metadata = {}) {
    const oldValue = this.state[key];

    if (oldValue === value) return; // No cambió

    this.state[key] = value;

    // Guardar en historial
    this.history.push({
      timestamp: Date.now(),
      key,
      oldValue,
      newValue: value,
      ...metadata
    });

    // Limitar historial
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Notificar listeners
    this.notifyListeners(key, value, oldValue);
  }

  /**
   * Actualiza múltiples valores
   * @param {Object} updates - Objeto con actualizaciones
   */
  update(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Suscribe a cambios del estado
   * @param {Function} listener - Función a ejecutar cuando cambia el estado
   * @param {string} watchKey - (opcional) Monitorear solo una clave
   * @returns {Function} Función para desuscribirse
   */
  subscribe(arg1, arg2 = null) {
    // Backwards-compatible: subscribe(listener, watchKey) OR subscribe(watchKey, listener)
    let listener;
    let watchKey = null;

    if (typeof arg1 === 'function') {
      listener = arg1;
      watchKey = arg2 || null;
    } else {
      watchKey = arg1 || null;
      listener = arg2;
    }

    const subscription = { listener, watchKey };
    this.listeners.push(subscription);

    // Retornar función para unsubscribe
    return () => {
      this.listeners = this.listeners.filter((l) => l !== subscription);
    };
  }

  /**
   * Notifica a los listeners sobre cambios
   * @private
   */
  notifyListeners(key, newValue, oldValue) {
    this.listeners.forEach(({ listener, watchKey }) => {
      if (!watchKey || watchKey === key) {
        try {
          // If listener subscribed to a specific key, call with newValue for convenience
          if (watchKey) {
            listener(newValue);
          } else {
            listener({
              key,
              newValue,
              oldValue,
              state: this.state,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      }
    });
  }

  /**
   * Agrega una notificación
   * @param {string} message - Mensaje
   * @param {string} type - 'success', 'error', 'info', 'warning'
   * @param {number} duration - Duración en ms (0 = permanente)
   */
  addNotification(message, type = 'info', duration = 5000) {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };

    const notifications = [...this.state.notifications, notification];
    this.set('notifications', notifications);

    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }

    return notification.id;
  }

  /**
   * Remueve una notificación
   * @param {number} id - ID de la notificación
   */
  removeNotification(id) {
    const notifications = this.state.notifications.filter((n) => n.id !== id);
    this.set('notifications', notifications);
  }

  /**
   * Limpia todas las notificaciones
   */
  clearNotifications() {
    this.set('notifications', []);
  }

  /**
   * Obtiene el historial de cambios
   * @param {string} key - (opcional) Filtrar por clave
   * @returns {Array} Historial
   */
  getHistory(key = null) {
    if (key) {
      return this.history.filter((h) => h.key === key);
    }
    return [...this.history];
  }

  /**
   * Limpia el historial
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Reset a estado inicial
   */
  reset() {
    this.state = {
      user: null,
      userRole: null,
      session: null,
      notifications: [],
      isLoading: false,
      currentModule: null,
      sidebarOpen: false,
      theme: 'light'
    };
    this.history = [];
    this.notifyListeners('__reset__', null, null);
  }
}

// Instancia global única
export const appState = new AppStateManager();

export default appState;
