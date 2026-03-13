import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { AlertCircle, CheckCircle, HelpCircle, X } from 'lucide-react';

const ConfirmationModal = ({ 
    show, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    type = 'warning' 
}) => {
    const { theme, mode } = useTheme();

    /**
     * Duotone Icon Generator
     * One solid layer + One 20% opacity layer for depth
     */
    const DuotoneIcon = ({ Icon, baseColor }) => (
        <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', opacity: 0.2 }}>
                <Icon size={48} color={baseColor} />
            </div>
            <div style={{ position: 'relative' }}>
                <Icon size={32} color={baseColor} strokeWidth={2.5} />
            </div>
        </div>
    );

    const icons = {
        warning: <DuotoneIcon Icon={HelpCircle} baseColor={theme.colors.warning} />,
        danger: <DuotoneIcon Icon={AlertCircle} baseColor={theme.colors.error} />,
        success: <DuotoneIcon Icon={CheckCircle} baseColor={theme.colors.success} />
    };

    return (
        <AnimatePresence>
            {show && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px'
                }}>
                    {/* Backdrop with extreme glassmorphism */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        style={{
                            position: 'absolute', inset: 0,
                            background: mode === 'dark' ? 'rgba(15, 15, 18, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                            backdropFilter: 'blur(16px)'
                        }}
                    />

                    {/* Modal Content - PWA Style Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        style={{
                            position: 'relative',
                            width: '100%', maxWidth: '440px',
                            background: theme.glass.background,
                            backdropFilter: theme.glass.backdropFilter,
                            border: theme.glass.border,
                            borderRadius: '24px',
                            padding: '40px 32px',
                            boxShadow: theme.shadows.floating,
                            textAlign: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Sacred Glow in Dark Mode */}
                        {mode === 'dark' && (
                            <div style={{
                                position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
                                width: '200px', height: '100px', background: `${theme.colors.primary}15`,
                                filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none'
                            }} />
                        )}

                        <button 
                            onClick={onCancel}
                            style={{
                                position: 'absolute', top: '24px', right: '24px',
                                background: 'rgba(255,255,255,0.05)', border: 'none', 
                                color: theme.colors.text.secondary,
                                width: '36px', height: '36px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                            {icons[type]}
                        </div>

                        <h3 style={{ 
                            color: theme.colors.text.primary, 
                            fontWeight: 900, fontSize: '1.6rem', 
                            marginBottom: '16px',
                            letterSpacing: '-0.5px'
                        }}>
                            {title}
                        </h3>

                        <p style={{ 
                            color: theme.colors.text.secondary, 
                            lineHeight: 1.6, marginBottom: '40px',
                            fontSize: '1rem'
                        }}>
                            {message}
                        </p>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={onCancel}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '16px',
                                    background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
                                    border: 'none',
                                    color: theme.colors.text.primary, fontWeight: 700,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    if (window.navigator.vibrate) window.navigator.vibrate(20);
                                    onConfirm();
                                }}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '16px',
                                    background: type === 'danger' ? theme.colors.error : theme.colors.primary,
                                    border: 'none', color: '#ffffff', fontWeight: 800,
                                    cursor: 'pointer', boxShadow: `0 8px 16px ${theme.colors.primary}33`,
                                    fontSize: '0.95rem',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
