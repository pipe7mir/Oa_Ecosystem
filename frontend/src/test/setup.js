
import { vi } from 'vitest';

// Mock del objeto global window y sus métodos si es necesario
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock de localStorage
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: function (key) {
            return store[key] || null;
        },
        setItem: function (key, value) {
            store[key] = value.toString();
        },
        clear: function () {
            store = {};
        },
        removeItem: function (key) {
            delete store[key];
        }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock de console para evitar ruido en tests
global.console = {
    ...console,
    // log: vi.fn(),
    // error: vi.fn(),
    // warn: vi.fn(),
};
