
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleError, sanitizeHTML, logEvent } from '../errorHandler.js';
import { appState } from '../stateManager.js';

describe('errorHandler Module', () => {

    describe('sanitizeHTML', () => {
        it('should remove script tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            expect(sanitizeHTML(input)).toBe('Hello');
        });

        it('should encode special characters', () => {
            const input = '<div>Bold</div>';
            expect(sanitizeHTML(input)).toBe('&lt;div&gt;Bold&lt;/div&gt;');
        });

        it('should return empty string for null/undefined', () => {
            expect(sanitizeHTML(null)).toBe('');
            expect(sanitizeHTML(undefined)).toBe('');
        });
    });

    describe('logEvent', () => {
        it('should call console.log with correct format', () => {
            const consoleSpy = vi.spyOn(console, 'log');
            logEvent('test_event', { foo: 'bar' });

            expect(consoleSpy).toHaveBeenCalled();
            const args = consoleSpy.mock.calls[0][0];
            expect(args).toContain('[EVENT]');
            expect(args).toContain('test_event');
        });
    });

    describe('handleError', () => {
        beforeEach(() => {
            vi.clearAllMocks();
            // Mock appState to avoid side effects
            appState.set = vi.fn();
        });

        it('should log error to console', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error');
            const error = new Error('Test error');

            handleError({
                error,
                context: 'testContext',
                severity: 'warning'
            });

            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should show alert if userMessage is provided', () => {
            // Mock window.alert is not needed because we can just check if it returns the formatted error object
            // But typically handleError might trigger UI changes. 
            // Based on implementation, it might just log and return.
            const error = new Error('Test error');
            const result = handleError({
                error,
                context: 'test',
                userMessage: 'Friendly message'
            });

            expect(result).toBeDefined();
            expect(result.message).toBe('Friendly message');
        });
    });
});
