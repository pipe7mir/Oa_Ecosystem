
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppStateManager } from '../stateManager.js';

describe('AppStateManager', () => {
    let stateManager;

    beforeEach(() => {
        stateManager = new AppStateManager();
    });

    it('should initialize with default state', () => {
        expect(stateManager.get('user')).toBeNull();
        expect(stateManager.get('isLoading')).toBe(false);
    });

    it('should set and get values', () => {
        stateManager.set('isLoading', true);
        expect(stateManager.get('isLoading')).toBe(true);
    });

    it('should notify subscribers on change', () => {
        const callback = vi.fn();
        stateManager.subscribe('isLoading', callback);

        stateManager.set('isLoading', true);

        expect(callback).toHaveBeenCalledWith(true);
    });

    it('should update complex objects', () => {
        const user = { name: 'Test' };
        stateManager.set('user', user);
        expect(stateManager.get('user')).toEqual(user);
    });
});
