import { supabase } from './common/supabaseClient.js';

async function displayAnnouncements() {
    const container = document.getElementById('cards-container');
    const now = new Date().toISOString();

    try {
        // 1. Consultar anuncios activos (que no hayan expirado)
        const { data: announcements, error } = await supabase
            .from('announcements')
            .select('*')
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!announcements || announcements.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No hay anuncios vigentes en este momento.</p>';
            return;
        }

        // 2. Generar el HTML de las tarjetas
        container.innerHTML = announcements.map(ann => {
            // Utilidad para el degradado basado en el color elegido en el admin
            const colorFuerte = ann.theme_color || '#0d6efd';
            
            return `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="public-card shadow-lg rounded-5 overflow-hidden position-relative" 
                         style="min-height: 500px; background-image: url('${ann.image_url || ''}'); background-size: cover; background-position: center; background-color: ${colorFuerte}; display: flex; flex-direction: column; justify-content: flex-end;">
                        
                        <div style="position: absolute; inset: 0; background: linear-gradient(to top, ${colorFuerte} 0%, transparent 100%); z-index: 1;"></div>
                        
                        <img src="./assets/logo-adventista.png" class="position-absolute" style="top: 25px; left: 25px; width: 45px; z-index: 10; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                        <img src="./assets/logo-oasis.png" class="position-absolute" style="top: 25px; right: 25px; width: 55px; z-index: 10; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">

                        <div class="p-4 p-lg-5 position-relative text-white" style="z-index: 2;">
                            <h2 class="fw-bold mb-2 text-shadow">${ann.title}</h2>
                            <p class="opacity-90 mb-4 text-shadow">${ann.description}</p>
                            <div class="d-inline-block border-top border-white border-opacity-50 pt-3">
                                <span class="h5 fw-light">${ann.event_date} - ${ann.event_time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error al cargar anuncios:', error);
        container.innerHTML = '<p class="text-danger text-center">Error al conectar con el servidor.</p>';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', displayAnnouncements);