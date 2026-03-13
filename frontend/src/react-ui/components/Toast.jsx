import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div 
                style={{ 
                    position: 'fixed', 
                    bottom: '24px', 
                    right: '24px', 
                    zIndex: 999999, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    pointerEvents: 'none'
                }}
            >
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            layout
                            style={{
                                pointerEvents: 'auto',
                                background: toast.type === 'error' ? '#ef4444' : 
                                            toast.type === 'success' ? '#10b981' : 
                                            toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
                                color: 'white',
                                padding: '16px 20px',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minWidth: '300px',
                                maxWidth: '450px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(8px)'
                            }}
                        >
                            <div style={{ flexShrink: 0 }}>
                                {toast.type === 'success' && <CheckCircle size={20} />}
                                {toast.type === 'error' && <XCircle size={20} />}
                                {toast.type === 'warning' && <AlertCircle size={20} />}
                                {toast.type === 'info' && <Info size={20} />}
                            </div>
                            <div style={{ flexGrow: 1, fontSize: '0.9rem', fontWeight: '500' }}>
                                {toast.message}
                            </div>
                            <button 
                                onClick={() => removeToast(toast.id)}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: 'white', 
                                    opacity: 0.7, 
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe usars dentro de ToastProvider');
    }
    return context;
};
