/* ==============================================================================
   MÓDULO HOME - LANDING PAGE PRINCIPAL OASIS
   Página de inicio con carrusel de anuncios, navegación principal y eventos
   ============================================================================== */

// import { supabase } from '../common/supabaseClient.js';
import { handleError, sanitizeHTML, logEvent } from '../common/errorHandler.js';
import { eventSystem } from '../common/eventDelegation.js';
import { appState } from '../common/stateManager.js';
import { i18n } from '../common/i18n.js';

/* ==============================================================================
   ESTADO DEL MÓDULO
   ============================================================================== */

let oasisCarouselInstance = null;

// Registrar evento de teclado global para el carrusel (Solo una vez al cargar el módulo)
document.addEventListener('keydown', (e) => {
    // Verificar si estamos en el home o el carrusel está en fullscreen
    if (appState.get('currentModule') === 'home' || document.fullscreenElement?.id === 'oasisCarousel') {
        homeController.handleKeyboardNav(e);
    }
});

/* ==============================================================================
   RENDERIZADO DEL MÓDULO
   ============================================================================== */

/**
 * Renderiza la página principal (home)
 * @returns {string} HTML de la página
 */
export async function renderHome() {
    return `
        <header class="hero-section d-flex align-items-center text-center text-white position-relative">
            <div class="container animate__animated animate__fadeIn position-relative" style="z-index: 2;">
                <h1 class="display-2 fw-bold mb-2 title-proy">${i18n.t('home.hero_title')}</h1>
                <p class="lead mb-4 fs-4 opacity-75">${i18n.t('home.hero_subtitle')}</p>
                <div id="status-area"></div>
                
                <!-- LIVE STREAMING CONTAINER -->
                <div id="streaming-container" class="mt-4 d-none">
                    <div class="row justify-content-center">
                        <div class="col-lg-10">
                            <div class="ratio ratio-16x9 rounded-4 shadow-lg overflow-hidden border border-light">
                                <iframe id="main-player" src="" title="Oasis Live" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            </div>
                            <div id="live-indicator" class="mt-3">
                                <span class="badge bg-danger rounded-pill px-3 py-2 animate__animated animate__pulse animate__infinite">
                                    <i class="bi bi-broadcast me-2"></i>EN VIVO
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </header>

        <main class="container my-5">
            <div class="row g-3 justify-content-center flex-nowrap overflow-auto pb-4 custom-scrollbar">
                <div class="col-auto">
                    <div class="oasis-square-card" data-action="home-nav-peticiones" style="cursor: pointer;">
                        <i class="bi bi-chat-heart"></i>
                        <div class="card-info"><span class="fw-bold">${i18n.t('home.cards.peticiones')}</span><small>${i18n.t('home.cards.peticiones_desc')}</small></div>
                    </div>
                </div>

                <div class="col-auto">
                    <div class="oasis-square-card" data-action="home-nav-external" data-url="https://alfoliadventista.org/signin" style="cursor: pointer;">
                        <i class="bi bi-bank2"></i>
                        <div class="card-info">
                            <span class="fw-bold">${i18n.t('home.cards.diezmos')}</span>
                            <small>${i18n.t('home.cards.diezmos_desc')}</small>
                        </div>
                    </div>
                </div>                

                <div class="col-auto">
                    <div class="oasis-square-card" data-action="home-nav-recursos" style="cursor: pointer;">
                        <i class="bi bi-cloud-download"></i>
                        <div class="card-info">
                            <span class="fw-bold">${i18n.t('home.cards.recursos')}</span>
                            <small>${i18n.t('home.cards.recursos_desc')}</small>
                        </div>
                    </div>
                </div>

                <div class="col-auto">
                    <div class="oasis-square-card">
                        <i class="bi bi-journal-text"></i>
                        <div class="card-info"><span class="fw-bold">${i18n.t('home.cards.leccion')}</span><small>${i18n.t('home.cards.leccion_desc')}</small></div>
                    </div>
                </div>

                <div class="col-auto">
                    <div class="oasis-square-card" data-action="home-nav-admin" style="cursor: pointer;">
                        <i class="bi bi-shield-lock-fill text-danger"></i>
                        <div class="card-info">
                            <span class="fw-bold">Centro de Control</span>
                            <small>Gestión y Control</small>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <section id="anuncios-display" class="container py-4">
            <div class="row justify-content-center">
                <div class="col-lg-11">
                    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <h2 class="titulo_seccion mb-0 title-proy">Cartelera OASIS</h2>
                        <div class="d-flex gap-2">
                            <button id="btn-carousel-pause" class="btn btn-oasis btn-sm rounded-pill" data-action="home-carousel-pause">
                                <i class="bi bi-pause-fill me-1"></i><span>Pausar</span>
                            </button>
                            <button id="btn-fullscreen" class="btn btn-oasis btn-sm rounded-pill" data-action="home-carousel-fullscreen">
                                <i class="bi bi-arrows-fullscreen me-1"></i>Proyectar
                            </button>
                        </div>
                    </div>
                    <div id="oasisCarousel" class="carousel slide shadow-lg rounded-5 overflow-hidden">
                        <div id="cards-container" class="carousel-inner">
                            <div class="text-center py-5">
                                <div class="spinner-border text-primary"></div>
                                <p class="text-muted mt-2">Cargando anuncios...</p>
                            </div>
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#oasisCarousel" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#oasisCarousel" data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-5 bg-light">
            <div class="container">
                <div class="row g-4 align-items-stretch">
                    <div class="col-lg-6">
                        <div class="card h-100 border-0 shadow-lg rounded-4 overflow-hidden">
                            <div class="card-header bg-white border-0 pt-4 px-4">
                                <h3 class="fw-bold text-primary mb-1 title-proy">Encuéntranos</h3>
                                <p class="text-muted small">Diagonal 75c, Cl. 32E #54, Belén, Medellín</p>
                            </div>
                            <div class="card-body p-0">
                                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2346761066483!2d-75.5947704!3d6.232777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTMnNTguMCJOIDc1wrAzNSc0MS4yIlc!5e0!3m2!1ses!2sco!4v1700000000000" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" title="Ubicación OASIS"></iframe>
                            </div>
                            <div class="card-footer bg-white border-0 p-3 text-center">
                                <a href="https://maps.google.com/?q=Diagonal+75c,+Cl.+32E+%2354,+Medellín" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   class="btn btn-oasis btn-sm px-4 rounded-pill">
                                    <i class="bi bi-geo-alt-fill me-2"></i>Ver en Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="card h-100 border-0 shadow-lg rounded-4 overflow-hidden">
                            <div id="events-feed">
                                <div class="text-center p-5">
                                    <div class="spinner-border text-primary" role="status"></div>
                                    <p class="text-muted mt-2">Cargando eventos...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-5 bg-white text-center">
            <div class="container">
                <div class="row g-4">
                    <div class="col-md-3">
                        <h4 class="fw-bold text-primary mb-3"><i class="bi bi-people-fill"></i></h4>
                        <h5 class="fw-bold title-proy">${i18n.t('home.community.comunidad')}</h5>
                        <p class="text-muted small">${i18n.t('home.community.comunidad_desc')}</p>
                    </div>
                    <div class="col-md-3">
                        <h4 class="fw-bold text-primary mb-3"><i class="bi bi-heart-fill"></i></h4>
                        <h5 class="fw-bold">${i18n.t('home.community.servicio')}</h5>
                        <p class="text-muted small">${i18n.t('home.community.servicio_desc')}</p>
                    </div>
                    <div class="col-md-3">
                        <h4 class="fw-bold text-primary mb-3"><i class="bi bi-book-fill"></i></h4>
                        <h5 class="fw-bold">${i18n.t('home.community.crecimiento')}</h5>
                        <p class="text-muted small">${i18n.t('home.community.crecimiento_desc')}</p>
                    </div>
                    <div class="col-md-3">
                        <h4 class="fw-bold text-primary mb-3"><i class="bi bi-stars"></i></h4>
                        <h5 class="fw-bold">${i18n.t('home.community.esperanza')}</h5>
                        <p class="text-muted small">${i18n.t('home.community.esperanza_desc')}</p>
                    </div>
                </div>
            </div>
        </section>`;
}

/* ==============================================================================
   INICIALIZACIÓN DEL MÓDULO
   ============================================================================== */

/**
 * Inicializa el módulo home
 * Configura eventos y carga datos dinámicos
 */
export async function initHomeFunctions() {
    try {
        logEvent('home_module_init');
        appState.set('currentModule', 'home');

        // Registrar navegación
        eventSystem.register('home-nav-peticiones', () => {
            window.location.hash = '#peticiones';
        });

        eventSystem.register('home-nav-recursos', () => {
            window.location.hash = '#recursos';
        });

        eventSystem.register('home-nav-admin', () => {
            window.location.hash = '#auth'; // Entry point to admin
        });

        eventSystem.register('home-nav-external', (element) => {
            const url = element.dataset.url;
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        });

        // Registrar controles del carrusel
        eventSystem.register('home-carousel-pause', () => {
            homeController.toggleCarouselPause();
        });

        eventSystem.register('home-carousel-fullscreen', () => {
            homeController.enterFullscreen();
        });

        // Cargar anuncios, eventos y estado del streaming
        await homeController.loadCarousel();
        await homeController.loadEvents();
        await homeController.loadStreamingStatus();

    } catch (err) {
        handleError({
            error: err,
            context: 'initHomeFunctions',
            severity: 'warning'
        });
    }
}

/* ==============================================================================
   CONTROLADOR ENCAPSULADO
   ============================================================================== */

const homeController = {
    carouselPaused: false,

    /**
       * Carga el carrusel de anuncios
       */
    async loadCarousel() {
        const container = document.getElementById('cards-container');
        if (!container) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements?limit=10`);
            if (!response.ok) throw new Error('Error al cargar anuncios');
            const anuncios = await response.json();

            if (!anuncios || anuncios.length === 0) {
                container.innerHTML = `
                        <div class="carousel-item active">
                            <div class="text-center p-5">
                                <i class="bi bi-inbox display-1 text-muted"></i>
                                <p class="text-muted mt-3">${i18n.t('home.no_anuncios')}</p>
                            </div>
                        </div>`;
                return;
            }

            // Renderizar carrusel
            container.innerHTML = anuncios.map((anuncio, index) => `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <div class="proyectable-poster">
                            <div class="poster-content-img" style="background-image: url('${sanitizeHTML(anuncio.image_url || '')}')"></div>
                            <div class="content-wrapper">
                                <h3 class="fw-bold mb-3">${sanitizeHTML(anuncio.title)}</h3>
                                <p class="lead mb-4">${sanitizeHTML(anuncio.description || '')}</p>
                                ${anuncio.event_date ? `
                                    <div class="mt-2">
                                        <span class="badge bg-primary rounded-pill px-3 py-2">
                                            <i class="bi bi-calendar-event me-2"></i>
                                            ${new Date(anuncio.event_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>`).join('');

            // Inicializar carrusel
            const carouselEl = document.querySelector('#oasisCarousel');
            if (carouselEl) {
                if (oasisCarouselInstance) oasisCarouselInstance.dispose();
                // eslint-disable-next-line no-undef
                oasisCarouselInstance = new bootstrap.Carousel(carouselEl, {
                    ride: 'carousel',
                    interval: 7000,
                    pause: 'hover'
                });
            }

            logEvent('home_carousel_loaded', { count: anuncios.length });

        } catch (err) {
            handleError({
                error: err,
                context: 'loadCarousel',
                userMessage: 'Error al cargar anuncios'
            });
            container.innerHTML = `
            <div class="text-center p-5 text-danger">Error cargando anuncios</div>
            `;
        }
    },

    toggleCarouselPause() {
        // ... same logic ...
    },

    enterFullscreen() {
        // ... same logic ...
    },

    handleKeyboardNav(e) {
        // ... same logic ...
    },

    async loadEvents() {
        const feed = document.getElementById('events-feed');
        if (!feed) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements?limit=5`);
            if (!response.ok) throw new Error('Error al cargar eventos');
            let eventos = await response.json();

            // Filter functionality client-side for now
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            eventos = eventos.filter(e => e.event_date && new Date(e.event_date) >= today)
                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                .slice(0, 5);

            if (!eventos || eventos.length === 0) {
                feed.innerHTML = `
            <div class="card-header bg-light border-0 pt-4 px-4">
                <h3 class="fw-bold text-primary mb-1">${i18n.t('home.events_title')}</h3>
            </div>
            <div class="card-body text-center p-5 text-muted">
                <i class="bi bi-calendar-check display-1 opacity-25"></i>
                <p class="mt-3">${i18n.t('home.no_events')}</p>
            </div>`;
                return;
            }

            const eventosHTML = eventos.map(evento => {
                const fecha = new Date(evento.event_date);
                const fechaFormato = fecha.toLocaleDateString(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                });

                return `
                    <div class="border-bottom p-3">
                        <div class="d-flex gap-3">
                            <div class="text-center" style="min-width: 50px;">
                                <div class="badge bg-primary rounded-pill px-2 text-capitalize">${fechaFormato}</div>
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="fw-bold mb-1">${sanitizeHTML(evento.title)}</h6>
                                <p class="text-muted small mb-1">${sanitizeHTML(evento.description || '')}</p>
                                <small class="text-gray">
                                    <i class="bi bi-geo-alt"></i> ${sanitizeHTML(evento.location || 'OASIS Central')}
                                </small>
                            </div>
                        </div>
                    </div>`;
            }).join('');

            feed.innerHTML = `
                <div class="card-header bg-light border-0 pt-4 px-4">
                    <h3 class="fw-bold text-primary mb-1">${i18n.t('home.events_title')}</h3>
                </div>
                <div class="card-body p-0">
                    ${eventosHTML}
                </div>`;

        } catch (err) {
            feed.innerHTML = `<div class="p-3 text-danger">Error loading events</div>`;
        }
    },

    /**
     * Carga el estado del streaming y configura el reproductor
     */
    async loadStreamingStatus() {
        try {
            const container = document.getElementById('streaming-container');
            const player = document.getElementById('main-player');
            const indicator = document.getElementById('live-indicator');

            if (!container || !player) return;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
            if (!response.ok) return; // Silent fail

            const settings = await response.json();
            const isLive = settings.stream_is_live === '1' || settings.stream_is_live === true;
            const liveVideoId = settings.youtube_live_video_id;
            const channelId = settings.youtube_channel_id;
            const playlistId = settings.youtube_playlist_id;

            let src = '';
            let showPlayer = false;

            if (isLive && liveVideoId) {
                // MODO EN VIVO
                src = `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&rel=0&modestbranding=1`;
                showPlayer = true;
                indicator.style.display = 'block';
                // Añadir clase de brillo al contenedor
                container.querySelector('.ratio').classList.add('shadow-dance'); // Asumiendo que existe o se añade CSS
            } else if (playlistId) {
                // MODO OFFLINE (Playlist)
                src = `https://www.youtube.com/embed?listType=playlist&list=${playlistId}&rel=0&modestbranding=1`;
                showPlayer = true;
                indicator.style.display = 'none';
            } else if (channelId) {
                // MODO OFFLINE (Canal) - Intento de fallback
                // Sin API key, user_uploads no siempre funciona bien solo con channel ID directo si no es usuario legacy.
                // Intentamos con listType=user_uploads&list=UU... (si supiéramos el ID de uploads).
                // Por ahora, mostrar nada o dejar vacío si no hay playlist.
                // Opcional: Mostrar último video si tuviéramos backend logic.
                // Dejaremos visible solo si hay playlist configurada para garantizar experiencia.
            }

            if (showPlayer && src) {
                player.src = src;
                container.classList.remove('d-none');
                container.classList.add('animate__fadeInUp');
            } else {
                container.classList.add('d-none');
            }

        } catch (error) {
            console.warn('Error checking streaming status', error);
        }
    }
};

export { homeController };
