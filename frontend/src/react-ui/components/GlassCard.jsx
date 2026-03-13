import React from 'react';
import { useTheme } from '../ThemeContext';

/**
 * Glassmorphism Container Component
 */
const GlassCard = ({ children, style, className, onClick }) => {
    const { theme } = useTheme();

    const cardStyle = {
        background: theme.colors.surface,
        backdropFilter: theme.glass.backdropFilter,
        WebkitBackdropFilter: theme.glass.backdropFilter,
        border: theme.glass.border,
        borderRadius: theme.glass.borderRadius,
        boxShadow: theme.shadows.medium,
        padding: theme.spacing(3),
        color: theme.colors.text.primary,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        ...style
    };

    const onEnter = (e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = theme.shadows.floating;
        e.currentTarget.style.border = `1px solid ${theme.colors.primary}66`;
    };

    const onLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = theme.shadows.medium;
        e.currentTarget.style.border = theme.glass.border;
    };

    return (
        <div style={cardStyle} className={className} onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick}>
            {children}
        </div>
    );
};

export default GlassCard;
