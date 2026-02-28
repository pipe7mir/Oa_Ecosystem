/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                oasis: {
                    purple: '#5b2ea6',
                    'purple-light': '#7c3aed',
                    'purple-dark': '#3d1a77',
                    cyan: '#00d3df',
                    'cyan-dark': '#00b8c4',
                    accent: '#ff4081',
                    dark: '#1f1f2e',
                    slate: '#102027',
                },
            },
            fontFamily: {
                sans: ['AdventSans', 'system-ui', 'sans-serif'],
                title: ['ModernAge', 'system-ui', 'sans-serif'],
            },
            backdropBlur: {
                glass: '20px',
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                'oasis-gradient': 'linear-gradient(135deg, #5b2ea6 0%, #00d3df 100%)',
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)',
                'glass-sm': '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
                'nav': '0 2px 24px rgba(91,46,166,0.15)',
            },
            animation: {
                'slide-up': 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-right': 'slideRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideRight: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
