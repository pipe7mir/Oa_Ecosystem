/* ==============================================================================
   MÓDULO ADMIN - STREAMING & YOUTUBE CONTROL
   Gestión de la transmisión en vivo y contenido del canal
   ============================================================================== */

import { handleError, sanitizeHTML } from '../common/errorHandler.js';
import { appState } from '../common/stateManager.js';
import { themeManager } from '../common/themeManager.js';

let currentSettings = {
    youtube_channel_id: '',
    youtube_live_video_id: '',
    stream_is_live: '0',
    youtube_playlist_id: ''
};

/**
 * Renderiza la interfaz de gestión de streaming
 */
export async function renderAdminStreaming() {
    return `
    <div class="row justify-content-center animate__animated animate__fadeIn">
        <div class="col-lg-8">
            <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
                <div class="card-header bg-primary text-white p-4">
                    <h4 class="mb-0"><i class="bi bi-broadcast me-2"></i>Configuración de Transmisión</h4>
                    <p class="mb-0 opacity-75 small">Gestiona la señal en vivo y el contenido de respaldo</p>
                </div>
                <div class="card-body p-4 bg-light">
                    
                    <form id="streaming-form">
                        
                        <!-- ESTADO DE LA TRANSMISIÓN -->
                        <div class="card border-0 shadow-sm mb-4 rounded-4">
                            <div class="card-body p-4">
                                <h5 class="text-primary fw-bold mb-3">Estado de la Señal</h5>
                                <div class="form-check form-switch custom-switch-lg">
                                    <input class="form-check-input" type="checkbox" role="switch" id="stream_is_live" disabled>
                                    <label class="form-check-label fw-bold" for="stream_is_live">
                                        <span id="live-status-text" class="badge bg-secondary rounded-pill px-3 py-2">OFFLINE</span>
                                        <small class="d-block text-muted fw-normal mt-1">
                                            Activa esta opción cuando estés transmitiendo en vivo.
                                        </small>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- CONFIGURACIÓN DE YOUTUBE -->
                        <div class="card border-0 shadow-sm mb-4 rounded-4">
                            <div class="card-body p-4">
                                <h5 class="text-danger fw-bold mb-3"><i class="bi bi-youtube me-2"></i>Configuración YouTube</h5>
                                
                                <div class="mb-3">
                                    <label for="youtube_channel_id" class="form-label fw-bold">ID del Canal (Channel ID)</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-white"><i class="bi bi-person-video2"></i></span>
                                        <input type="text" class="form-control" id="youtube_channel_id" placeholder="Ej: UC..." disabled>
                                    </div>
                                    <div class="form-text">El ID de tu canal de YouTube (comienza con UC).</div>
                                </div>

                                <div class="mb-3">
                                    <label for="youtube_playlist_id" class="form-label fw-bold">ID de Lista de Reproducción (Respaldo)</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-white"><i class="bi bi-collection-play"></i></span>
                                        <input type="text" class="form-control" id="youtube_playlist_id" placeholder="Ej: PL..." disabled>
                                    </div>
                                    <div class="form-text">Se mostrará cuando NO estés en vivo if el canal no tiene contenido reciente.</div>
                                </div>

                                <div class="mb-3 animate__animated animate__fadeIn" id="live-video-group" style="display: none;">
                                    <label for="youtube_live_video_id" class="form-label fw-bold text-danger">ID del Video en Vivo</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-danger text-white"><i class="bi bi-camera-video-fill"></i></span>
                                        <input type="text" class="form-control border-danger" id="youtube_live_video_id" placeholder="ID del video actual" disabled>
                                    </div>
                                    <div class="form-text text-danger">Requerido solo cuando la transmisión está ACTIVA.</div>
                                </div>
                            </div>
                        </div>

                        <!-- ACCIONES -->
                        <div class="d-flex justify-content-end gap-3 mt-4">
                            <button type="button" class="btn btn-secondary rounded-pill px-4" id="btn-cancel-streaming" disabled>
                                <i class="bi bi-x-lg me-2"></i>Cancelar
                            </button>
                            <button type="button" class="btn btn-primary rounded-pill px-4" id="btn-edit-streaming">
                                <i class="bi bi-pencil-square me-2"></i>Editar
                            </button>
                            <button type="submit" class="btn btn-success rounded-pill px-4" id="btn-save-streaming" style="display: none;">
                                <i class="bi bi-save me-2"></i>Guardar Cambios
                            </button>
                        </div>
                    </form>

                </div>
            </div>

            <!-- PREVIEW -->
            <div class="card shadow-lg border-0 rounded-4 overflow-hidden mt-4">
                 <div class="card-header bg-dark text-white p-3">
                    <h5 class="mb-0"><i class="bi bi-eye me-2"></i>Vista Previa</h5>
                </div>
                <div class="card-body p-0 bg-black">
                     <div class="ratio ratio-16x9">
                        <iframe id="preview-player" src="" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            </div>

        </div>
    </div>
    `;
}

/**
 * Inicializa la lógica del módulo de streaming
 */
export async function initAdminStreaming() {
    try {
        await loadStreamingSettings();
        setupEventListeners();
        updatePreview();
    } catch (error) {
        handleError({
            error,
            context: 'initAdminStreaming',
            userMessage: 'Error inicializando el módulo de transmisión.'
        });
    }
}

async function loadStreamingSettings() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/settings?t=${Date.now()}`);
        if (!response.ok) throw new Error('Error cargando configuración');

        const settings = await response.json();

        // Mapear settings
        currentSettings = {
            youtube_channel_id: settings.youtube_channel_id || '',
            youtube_live_video_id: settings.youtube_live_video_id || '',
            stream_is_live: settings.stream_is_live === '1' || settings.stream_is_live === true,
            youtube_playlist_id: settings.youtube_playlist_id || ''
        };

        // Popular campos
        updateFormValues();
        updateLiveStatusUI(currentSettings.stream_is_live);

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function updateFormValues() {
    document.getElementById('youtube_channel_id').value = currentSettings.youtube_channel_id;
    document.getElementById('youtube_live_video_id').value = currentSettings.youtube_live_video_id;
    document.getElementById('youtube_playlist_id').value = currentSettings.youtube_playlist_id;
    document.getElementById('stream_is_live').checked = currentSettings.stream_is_live;
}

function updateLiveStatusUI(isLive) {
    const statusText = document.getElementById('live-status-text');
    const liveVideoGroup = document.getElementById('live-video-group');
    const switchInput = document.getElementById('stream_is_live');

    if (isLive) {
        statusText.textContent = 'EN VIVO - ON AIR';
        statusText.className = 'badge bg-danger rounded-pill px-3 py-2 animate__animated animate__pulse animate__infinite';
        liveVideoGroup.style.display = 'block';
        if (switchInput.disabled === false) { // Only require if editing
            document.getElementById('youtube_live_video_id').setAttribute('required', 'required');
        }
    } else {
        statusText.textContent = 'OFFLINE - RESPALDO';
        statusText.className = 'badge bg-secondary rounded-pill px-3 py-2';
        liveVideoGroup.style.display = 'none';
        document.getElementById('youtube_live_video_id').removeAttribute('required');
    }
}

function updatePreview() {
    const iframe = document.getElementById('preview-player');
    const isLive = document.getElementById('stream_is_live').checked; // Use current UI state if editing
    const videoId = document.getElementById('youtube_live_video_id').value;
    const channelId = document.getElementById('youtube_channel_id').value;
    const playlistId = document.getElementById('youtube_playlist_id').value;

    let src = '';

    if (isLive && videoId) {
        src = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    } else if (playlistId) {
        src = `https://www.youtube.com/embed?listType=playlist&list=${playlistId}&rel=0`;
    } else if (channelId) {
        // Fallback to channel uploads if no playlist
        // Note: 'UU' + channelId_subtitle is usually the uploads playlist, but we don't know it easily.
        // Best fallback without API key complexity is specific video or playlist.
        // If only channel ID is present, we might not be able to embed a "channel player" easily without a playlist ID.
        // We will try searching or simple embed.
        src = `https://www.youtube.com/embed?listType=user_uploads&list=${channelId}`; // This often needs username, not channel ID.
        // Better fallback: if we have channel ID, we might not show anything valid in preview unless it's a playlist.
        // Let's prompt user for playlist if no live video.
    }

    iframe.src = src;
}


function setupEventListeners() {
    const form = document.getElementById('streaming-form');
    const btnEdit = document.getElementById('btn-edit-streaming');
    const btnSave = document.getElementById('btn-save-streaming');
    const btnCancel = document.getElementById('btn-cancel-streaming');
    const inputs = form.querySelectorAll('input');
    const liveSwitch = document.getElementById('stream_is_live');

    // Toggle Edit Mode
    btnEdit.addEventListener('click', () => {
        inputs.forEach(input => input.disabled = false);
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
        btnCancel.disabled = false;

        // Focus first input
        document.getElementById('youtube_channel_id').focus();
    });

    // Cancel Edit
    btnCancel.addEventListener('click', () => {
        updateFormValues(); // Reset to saved values
        inputs.forEach(input => input.disabled = true);
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
        btnCancel.disabled = true;
        updateLiveStatusUI(currentSettings.stream_is_live); // Reset UI
    });

    // Live Switch Change
    liveSwitch.addEventListener('change', (e) => {
        updateLiveStatusUI(e.target.checked);
        // If turning live, confirm new Video ID is needed or use old?
        // UI already shows input.
    });

    // Handle Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        btnSave.disabled = true;
        btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

        try {
            const formData = new FormData();
            formData.append('youtube_channel_id', document.getElementById('youtube_channel_id').value);
            formData.append('youtube_live_video_id', document.getElementById('youtube_live_video_id').value);
            formData.append('youtube_playlist_id', document.getElementById('youtube_playlist_id').value);
            formData.append('stream_is_live', document.getElementById('stream_is_live').checked ? '1' : '0');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error guardando configuración');

            // Success
            // Lock UI
            inputs.forEach(input => input.disabled = true);
            btnEdit.style.display = 'inline-block';
            btnSave.style.display = 'none';
            btnCancel.disabled = true;
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Cambios';

            // Refresh internal state
            await loadStreamingSettings();
            updatePreview();

            // Notify
            const statusMsg = document.getElementById('live-status-text');
            statusMsg.classList.add('animate__flash');
            setTimeout(() => statusMsg.classList.remove('animate__flash'), 1000);

        } catch (error) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Cambios';
            handleError({
                error,
                context: 'saveStreamingSettings',
                userMessage: 'No se pudieron guardar los cambios.'
            });
        }
    });

    // Inputs change for preview (optional)
    inputs.forEach(input => {
        input.addEventListener('change', updatePreview);
    });
}
