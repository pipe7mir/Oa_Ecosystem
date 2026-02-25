import React from 'react';
import { theme } from '../styles/theme';
import GlassCard from './GlassCard';
import Button from './Button';

const MapSection = () => {
    // Hemos pegado la URL exacta del src que proporcionaste
    const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1964311065785!2d-75.5979098892048!3d6.237820726390662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4429bd22d620b5%3A0xdf3574c2f8237ca!2sIglesia%20Adventista%20del%20S%C3%A9ptimo%20D%C3%ADa%20-%20Oasis!5e0!3m2!1ses!2sco!4v1771882597884!5m2!1ses!2sco";

    // URL para abrir en una pestaña nueva (Google Maps directo)
    const mapDirectUrl = "https://www.google.com/maps?q=Templo+Oasis";

    return (
        <GlassCard style={{ padding: theme.spacing(4), display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{
                fontFamily: 'ModernAge, sans-serif',
                color: theme.colors.primary,
                fontSize: '2rem',
                marginBottom: theme.spacing(1),
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <i className="bi bi-geo-alt-fill"></i> Acompáñanos
            </h3>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing(3) }}>
                Te invitamos a ser parte de nuestra comunidad. Encuéntranos aquí.
            </p>

            {/* Contenedor del Mapa */}
            <div style={{
                flexGrow: 1,
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#e9ecef',
                marginBottom: theme.spacing(3),
                minHeight: '400px', // Aumentado para mejor visibilidad
                position: 'relative',
                border: `1px solid ${theme.colors.border || 'rgba(0,0,0,0.1)'}`
            }}>
                <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                    allowFullScreen={true} // React usa CamelCase
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de la Iglesia"
                ></iframe>
            </div>

            <div className="mt-auto text-center">
                <a href={mapDirectUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                    <Button variant="primary" style={{ width: '100%', padding: '12px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        ¡Acompáñanos! <i className="bi bi-arrow-right ms-2"></i>
                    </Button>
                </a>
            </div>
        </GlassCard>
    );
};

export default MapSection;