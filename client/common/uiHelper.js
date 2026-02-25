/* ==============================================================================
   UI HELPERS - TOASTS & MODALS (GLASSPHORISM STYLE)
   Reemplazo de alerts y confirms por componentes estéticos
   ============================================================================== */

/**
 * Muestra una notificación tipo Toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - 'success', 'error', 'info', 'warning'
 */
export function showToast(message, type = 'info') {
    // Crear contenedor si no existe
    let container = document.getElementById('oasis-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'oasis-toast-container';
        container.className = 'position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    // Iconos por tipo
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };

    const colors = {
        success: 'border-left: 4px solid #00b4d8;', // Cyan
        error: 'border-left: 4px solid #ef233c;',   // Red
        warning: 'border-left: 4px solid #ffb703;', // Yellow
        info: 'border-left: 4px solid #7209b7;'     // Purple
    };

    // Crear elemento toast
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-white bg-dark border-0 mb-2 animate__animated animate__fadeInRight';
    toastEl.style.cssText = `
        background: rgba(16, 0, 43, 0.9) !important;
        backdrop-filter: blur(10px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        border-radius: 12px;
        min-width: 300px;
        ${colors[type] || colors.info}
    `;

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center">
                <i class="bi ${icons[type] || icons.info} fs-4 me-3"></i>
                <div>${message}</div>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    container.appendChild(toastEl);

    // Inicializar Bootstrap Toast (si disponible) o usar timeout manual
    // Asumimos bootstrap disponible globalmente o manejo manual
    setTimeout(() => {
        toastEl.classList.remove('animate__fadeInRight');
        toastEl.classList.add('animate__fadeOutRight');
        setTimeout(() => toastEl.remove(), 500);
    }, 4000);
}

/**
 * Muestra un modal de confirmación personalizado (CSS Puro)
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje de confirmación
 * @param {Function} onConfirm - Callback al confirmar
 */
export function showConfirmModal(title, message, onConfirm) {
    // Remover modal previo si existe
    const existing = document.getElementById('oasis-custom-modal');
    if (existing) existing.remove();

    // Crear estructura del modal
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'oasis-custom-modal';
    modalOverlay.className = 'oasis-modal-overlay animate__animated animate__fadeIn';

    modalOverlay.innerHTML = `
        <div class="oasis-modal-content animate__animated animate__zoomIn">
            <div class="oasis-modal-header">
                <h5 class="mb-0 fw-bold text-gradient-purple"><i class="bi bi-question-circle-fill me-2"></i>${title}</h5>
                <button type="button" class="btn-close-custom" id="modal-close-x"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="oasis-modal-body">
                <p class="mb-0">${message}</p>
            </div>
            <div class="oasis-modal-footer">
                <button type="button" class="btn btn-outline-light rounded-pill px-4 me-2" id="modal-cancel-btn">Cancelar</button>
                <button type="button" class="btn btn-danger rounded-pill px-4" id="modal-confirm-btn">
                    <i class="bi bi-check-lg me-2"></i>Confirmar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden'; // Prevenir scroll

    // Event Listeners
    const close = () => {
        modalOverlay.classList.replace('animate__fadeIn', 'animate__fadeOut');
        modalOverlay.querySelector('.oasis-modal-content').classList.replace('animate__zoomIn', 'animate__zoomOut');
        document.body.style.overflow = '';
        setTimeout(() => modalOverlay.remove(), 300);
    };

    document.getElementById('modal-close-x').onclick = close;
    document.getElementById('modal-cancel-btn').onclick = close;

    document.getElementById('modal-confirm-btn').onclick = () => {
        // Deshabilitar botón para prevenir doble submit
        const btn = document.getElementById('modal-confirm-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

        onConfirm().then(() => {
            close();
        }).catch(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-check-lg me-2"></i>Confirmar';
        });
    };
}
