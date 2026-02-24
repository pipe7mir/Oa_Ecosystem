import React from 'react';
import { theme } from '../styles/theme';

/**
 * Glassmorphism Container Component
 */
const GlassCard = ({ children, style, className, onClick }) => {
    const cardStyle = {
        background: theme.glass.background,
        backdropFilter: theme.glass.backdropFilter,
        WebkitBackdropFilter: theme.glass.backdropFilter,
        border: theme.glass.border,
        borderRadius: theme.glass.borderRadius, // 16px
        boxShadow: theme.glass.boxShadow,
        padding: theme.spacing(3), // 24px (3x8)
        color: theme.colors.text.primary,
        transition: 'transform 0.16s ease, box-shadow 0.16s ease',
        ...style
    };

    // Subtle hover only: small lift and slightly brighter background to keep balance
    const onEnter = (e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 24, 40, 0.06)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
    };

    const onLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = theme.glass.boxShadow;
        e.currentTarget.style.background = theme.glass.background;
    };

    return (
        <div style={cardStyle} className={className} onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick}>
            {children}
        </div>
    );
};

export default GlassCard;
