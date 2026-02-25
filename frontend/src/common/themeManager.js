/**
 * GESTOR DE TEMAS - UI THEME MANAGER
 * Maneja el cambio entre modos Claro/Oscuro persistente
 */

import { logEvent } from './errorHandler.js';
import { appState } from './stateManager.js';

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('oasis_theme') || 'dark'; // Default to dark (Nightfall)
        this.applyTheme(this.theme);
    }

    /**
     * Alterna entre modos
     */
    toggle() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.theme);
        localStorage.setItem('oasis_theme', this.theme);
        logEvent('theme_changed', { mode: this.theme });
        return this.theme;
    }

    /**
     * Aplica el tema al documento
     * @param {string} theme - 'dark' | 'light'
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        appState.set('theme', theme);

        // Update meta color-scheme if needed for browser UI
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? '#10002b' : '#ffffff');
        }
    }

    /**
     * Obtiene el tema actual
     */
    get current() {
        return this.theme;
    }
}

export const themeManager = new ThemeManager();
