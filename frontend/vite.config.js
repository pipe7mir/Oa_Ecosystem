import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },       // activa el SW en desarrollo para pruebas
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'mask-icon.svg',
        'robots.txt',
      ],

      // ──────────────────────────────────────────────
      //  MANIFEST PROFESIONAL — OASIS Ecosystem PWA
      // ──────────────────────────────────────────────
      manifest: {
        name: 'OASIS Ecosystem',
        short_name: 'OASIS',
        description: 'Plataforma de gestión y comunidad de la Iglesia Adventista OASIS',
        theme_color: '#5b2ea6',
        background_color: '#f0ebfc',
        lang: 'es',

        // Modo standalone → ventana independiente (sin chrome del navegador)
        // display_override permite Window Controls Overlay en escritorio
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],

        // Orientación flexible: portrait en móvil, landscape en desktop
        orientation: 'any',

        // Ruta de inicio marcada con ?pwa=1 para que useAppMode la detecte
        start_url: '/?pwa=1',
        scope: '/',

        // Punto de anclaje de colores del sistema operativo
        id: '/oasis-ecosystem-pwa',

        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],

        // Categorías para las tiendas de aplicaciones
        categories: ['productivity', 'lifestyle', 'education'],

        // Atajos rápidos (long-press en el ícono de la app)
        shortcuts: [
          {
            name: 'Anuncios',
            short_name: 'Anuncios',
            description: 'Crear y gestionar anuncios',
            url: '/admin/announcements?pwa=1',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'En Vivo',
            short_name: 'En Vivo',
            description: 'Ver transmisión en vivo',
            url: '/live?pwa=1',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
        ],

        // Capturas de pantalla para la hoja de instalación
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'OASIS Ecosystem - Vista de escritorio',
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'OASIS Ecosystem - Vista móvil',
          },
        ],

        // Compartir contenido con la app (deep-linking)
        share_target: {
          action: '/share',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
          },
        },
      },

      // ──────────────────────────────────────────────
      //  WORKBOX — estrategias de caché offline
      // ──────────────────────────────────────────────
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],

  server: {
    port: 5173,
    strictPort: false,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      external: ['jspdf', 'pptxgenjs'],
      output: {
        manualChunks: {
          'vendor': ['bootstrap', 'react', 'react-dom'],
          'motion': ['framer-motion'],
        },
      },
    },
  },

  optimizeDeps: {
    include: ['bootstrap', 'react', 'react-dom', 'lucide-react'],
  },
});
