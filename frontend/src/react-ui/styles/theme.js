/**
 * OASIS React Design System - Amethyst Church Luxury Edition
 * Supporting Dark/Light Modes with Split-Screen High-Fidelity Specs
 */

export const createTheme = (mode = 'dark') => {
    const isDark = mode === 'dark';

    // Shadows based on background tone as requested
    const shadowColor = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(109, 40, 217, 0.1)';

    return {
        mode,
        spacing: (units) => `${units * 8}px`,

        colors: {
            primary: '#5B2EA6', // Royal Purple
            secondary: '#4F46E5', // Indigo (Strong contrast for text)
            accent: '#F2C94C', // Oasis Gold
            background: isDark ? '#08080a' : '#f0f4f8', 
            surface: isDark ? '#121216' : '#ffffff', 
            surfaceAlt: isDark ? '#1a1a24' : '#e2e8f0', // Visible Grid/Backdrops
            text: {
                primary: isDark ? '#f8f4ff' : '#0f172a',
                secondary: isDark ? '#94a3b8' : '#334155', // Slate-700
                inverse: isDark ? '#0f172a' : '#f8f4ff'
            },
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            border: isDark ? 'rgba(91, 46, 166, 0.2)' : 'rgba(91, 46, 166, 0.12)'
        },

        glass: {
            background: isDark ? 'rgba(26, 26, 31, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px) saturate(160%)', // Spec: 12px blur
            border: isDark ? '1px solid rgba(109, 40, 217, 0.3)' : '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '16px', // Spec: 16px
            boxShadow: `0 8px 32px ${shadowColor}`
        },

        shadows: {
            soft: `0 4px 12px ${shadowColor}`,
            medium: `0 12px 30px ${shadowColor}`,
            floating: isDark ? '0 30px 60px rgba(0, 0, 0, 0.8)' : '0 30px 60px rgba(109, 40, 217, 0.15)'
        },

        fonts: {
            titles: "'Inter', sans-serif",
            body: "'Inter', sans-serif",
            brand: "'ModernAge', sans-serif",
            accent: "'MoonRising', sans-serif",
            details: "'Adventist Logo', sans-serif",
        }
    };
};

export const theme = createTheme('light'); // Cambiado a light por defecto como se acordó previamente.
