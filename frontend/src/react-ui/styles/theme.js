/**
 * OASIS React Design System
 * Flat Design 2.0 + Glassmorphism
 * Base Grid: 8px
 */

export const theme = {
    // 1. Arquitectura de Estilos (8px Grid System)
    spacing: (units) => `${units * 8}px`,

    // 2. Estética Visual: Flat Design 2.0 (Vibrant & Clean)
    colors: {
        primary: '#5b2ea6', // Darker brand purple for text/icons
        secondary: '#00d3df', // Cyan adjusted
        accent: '#ff4081', // Pink Punch
        background: '#f4f7f6', // Clean Slate
        text: {
            primary: '#102027', // Dark blue-grey for body
            secondary: '#435566', // medium
            inverse: '#ffffff'
        },
        success: '#00c853',
        warning: '#ffd600',
        error: '#d50000'
    },

    // 3. Glassmorphism (Strict Spec)
    glass: {
        background: 'rgba(255, 255, 255, 0.10)', // 10% Opacity (more subtle)
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)', // subtle thin border
        borderRadius: '16px', // Standard container radius (2 * 8px)
        boxShadow: '0 8px 20px 0 rgba(16, 24, 40, 0.06)'
    },

    // 4. Sombras Suaves (Flat 2.0 Soft Shadows)
    shadows: {
        soft: '0 4px 6px rgba(0, 0, 0, 0.05)', // Subtle lift
        medium: '0 10px 20px rgba(0, 0, 0, 0.08)', // Focus state
        floating: '0 20px 40px rgba(0, 0, 0, 0.12)' // Modal/Floating
    },

    // 5. Tipografía & Marca
    fonts: {
        titles: "'ModernAge', sans-serif",
        body: "'AdventSans', sans-serif",
        logo: "'ModernAge', sans-serif"
    }
};
