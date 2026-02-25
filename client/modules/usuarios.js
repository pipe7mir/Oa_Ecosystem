/* ==============================================================================
   MÓDULO DE USUARIOS Y PERFILES - OASIS ADMIN
   Gestión de usuarios, roles y permisos en la plataforma
   ============================================================================== */

// import { supabase } from '../common/supabaseClient.js';
import { handleError, sanitizeHTML, logEvent } from '../common/errorHandler.js';
import { eventSystem } from '../common/eventDelegation.js';
import { appState } from '../common/stateManager.js';

/* ==============================================================================
   RENDERIZADO
   ============================================================================== */

/**
 * Renderiza la vista de usuarios con métricas y tabla de control
 * @returns {string} HTML de la vista
 */
export async function renderUsuarios() {
  return `
        <section class="container-fluid py-5">
            <div class="d-flex justify-content-between align-items-center mb-4 animate__animated animate__fadeInDown">
                <h2 class="fw-bold titulo_seccion">Gestión de Usuarios</h2>
                <button class="btn btn-sm btn-outline-secondary" data-action="usuarios-refresh-table">
                    <i class="bi bi-arrow-clockwise me-2"></i> Actualizar
                </button>
            </div>

            <!-- Métricas -->
            <div class="row g-3 mb-5 animate__animated animate__fadeInUp">
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-light">
                        <div class="card-body">
                            <h6 class="text-muted small fw-bold">USUARIOS TOTALES</h6>
                            <p class="display-6 fw-bold text-primary" id="metric-total-users">-</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-light">
                        <div class="card-body">
                            <h6 class="text-muted small fw-bold">PENDIENTES APROBACIÓN</h6>
                            <p class="display-6 fw-bold text-warning" id="metric-pending-users">-</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-light">
                        <div class="card-body">
                            <h6 class="text-muted small fw-bold">USUARIOS ACTIVOS</h6>
                            <p class="display-6 fw-bold text-success" id="metric-approved-users">-</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-light">
                        <div class="card-body  ">
                            <h6 class="text-muted small fw-bold">ADMINISTRADORES</h6>
                            <p class="display-6 fw-bold text-dark" id="metric-admin-users">-</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de usuarios -->
            <div class="card border-0 shadow-sm rounded-4 animate__animated animate__fadeIn">
                <div class="card-header bg-light p-4 border-0 rounded-top-4">
                    <h5 class="mb-0 fw-bold">Tabla de Usuarios</h5>
                </div>
                <div class="card-body p-0" id="usuarios-container">
                    <div class="text-center p-5">
                        <div class="spinner-grow text-primary" role="status"></div>
                        <p class="mt-3 text-muted">Cargando usuarios...</p>
                    </div>
                </div>
            </div>
        </section>
    `;
}

/* ==============================================================================
   INICIALIZACIÓN Y LÓGICA
   ============================================================================== */

/**
 * Inicializa el módulo de usuarios
 * Carga datos y registra handlers
 */
export async function initUsuarios() {
  try {
    appState.set('isLoading', true);
    logEvent('usuarios_module_init');

    // Registrar acciones
    eventSystem.register('usuarios-refresh-table', () => {
      initUsuarios();
    });

    eventSystem.register('usuarios-approve-user', (element) => {
      usuariosController.approveUser(element.dataset.userId);
    });

    eventSystem.register('usuarios-delete-user', (element) => {
      usuariosController.deleteUser(element.dataset.userId);
    });

    eventSystem.register('usuarios-update-role', (element) => {
      usuariosController.updateRole(element);
    });

    // Cargar datos
    await usuariosController.loadUsers();

    appState.set('isLoading', false);
  } catch (err) {
    appState.set('isLoading', false);
    handleError({
      error: err,
      context: 'initUsuarios',
      severity: 'warning'
    });
  }
}

/* ==============================================================================
   CONTROLADOR ENCAPSULADO
   ============================================================================== */

const usuariosController = {
  /**
     * Carga la lista de usuarios y actualiza la tabla
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
     * Carga la lista de usuarios y actualiza la tabla
     */
  async loadUsers() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Error al cargar usuarios');

      const usuarios = await response.json();

      this.updateMetrics(usuarios);
      this.renderUsersTable(usuarios);

      logEvent('usuarios_loaded', { count: usuarios.length });
    } catch (err) {
      handleError({
        error: err,
        context: 'loadUsers',
        userMessage: 'Error al cargar usuarios'
      });
    }
  },

  // ... updateMetrics, renderUsersTable, renderUserRow ...

  /**
     * Aprueba un usuario
     */
  async approveUser(userId) {
    if (!userId) return;

    try {
      if (!confirm('¿Aprobar acceso a este usuario?')) return;

      appState.set('isLoading', true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/approve`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Error al aprobar');

      logEvent('usuario_approved', { userId });
      appState.set('isLoading', false);
      showToast('Usuario aprobado correctamente', 'success');

      // Recargar tabla
      await this.loadUsers();
    } catch (err) {
      appState.set('isLoading', false);
      handleError({
        error: err,
        context: 'approveUser',
        userMessage: 'Error al aprobar usuario'
      });
    }
  },

  /**
     * Elimina un usuario
     */
  async deleteUser(userId) {
    if (!userId) return;

    try {
      if (!confirm('¿Eliminar permanentemente este usuario? Esta acción no se puede deshacer.')) {
        return;
      }

      appState.set('isLoading', true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Error al eliminar');

      logEvent('usuario_deleted', { userId });
      appState.set('isLoading', false);
      showToast('Usuario eliminado correctamente', 'success');

      // Recargar tabla
      await this.loadUsers();
    } catch (err) {
      appState.set('isLoading', false);
      handleError({
        error: err,
        context: 'deleteUser',
        userMessage: 'Error al eliminar usuario'
      });
    }
  },

  /**
     * Actualiza el rol de un usuario
     */
  async updateRole(element) {
    const userId = element.dataset.userId;
    const nuevoRol = element.value;

    if (!userId || !nuevoRol) return;

    try {
      appState.set('isLoading', true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role: nuevoRol })
      });
      if (!response.ok) throw new Error('Error al actualizar rol');

      logEvent('usuario_role_updated', { userId, newRole: nuevoRol });
      appState.set('isLoading', false);
      showToast('Rol actualizado correctamente', 'success');

      // Recargar tabla
      await this.loadUsers();
    } catch (err) {
      appState.set('isLoading', false);
      handleError({
        error: err,
        context: 'updateRole',
        userMessage: 'Error al actualizar rol'
      });
    }
  }
};

export { usuariosController };
