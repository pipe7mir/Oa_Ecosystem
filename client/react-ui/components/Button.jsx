import React from 'react';
import { theme } from '../styles/theme';

/**
 * Flat 2.0 Button Component
 * @param {string} children - Label
 * @param {string} variant - 'primary', 'secondary', 'accent', 'outline'
 * @param {function} onClick - Click handler
 */
const Button = ({ children, variant = 'primary', onClick, style }) => {
    // Updated visual: white button with slight shadow, dark purple text/icon
    const btnBase = {
        padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
        borderRadius: theme.spacing(1),
        border: 'none',
        background: '#ffffff',
        fontFamily: theme.fonts.body,
        fontWeight: 700,
        fontSize: '0.95rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(1),
        color: theme.colors.primary,
        boxShadow: '0 6px 18px rgba(16,24,40,0.06)',
        transition: 'transform 120ms ease, box-shadow 120ms ease'
    };

    const variantColors = {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        outline: theme.colors.primary
    };

    const finalStyle = { ...btnBase, color: variantColors[variant] || theme.colors.primary, ...style };

    const handleEnter = (e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(16,24,40,0.08)';
    };

    const handleLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(16,24,40,0.06)';
    };

    return (
        <button onClick={onClick} style={finalStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            {children}
        </button>
    );
};

export default Button;
