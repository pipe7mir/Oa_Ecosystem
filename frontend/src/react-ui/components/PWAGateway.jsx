/**
 * PWAGateway — Enrutamiento inteligente en la raíz "/"
 *
 * Regla Web  (navegador normal): muestra la LandingPage (Home)
 * Regla PWA  (app instalada):
 *   → Con sesión activa → /admin
 *   → Sin sesión       → /login
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAppMode from '../../hooks/useAppMode';
import { useAuth } from '../../context/AuthContext';
import Home from '../modules/Home';

const PWAGateway = () => {
    const { isPWA } = useAppMode();
    const { session, loading } = useAuth();

    // Esperar a que AuthContext inicialice
    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f0ebfc 0%, #e8f9ff 100%)',
            }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    {/* Liquid glass spinner */}
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        backdropFilter: 'blur(12px)',
                        background: 'rgba(255,255,255,0.6)',
                        border: '2px solid rgba(91,46,166,0.2)',
                        boxShadow: '0 8px 32px rgba(91,46,166,0.15)',
                        animation: 'pwaSpinPulse 1.4s ease-in-out infinite',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            border: '3px solid transparent',
                            borderTopColor: '#5b2ea6',
                            borderRightColor: '#00d3df',
                            animation: 'pwaSpinRotate 0.7s linear infinite',
                        }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#5b2ea6', fontWeight: 600, fontFamily: 'AdventSans, sans-serif' }}>
                        OASIS
                    </span>
                </div>
                <style>{`
          @keyframes pwaSpinPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
          @keyframes pwaSpinRotate  { to{transform:rotate(360deg)} }
        `}</style>
            </div>
        );
    }

    // Modo PWA: redirigir según sesión
    if (isPWA) {
        return session ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />;
    }

    // Modo Web: mostrar la LandingPage
    return <Home />;
};

export default PWAGateway;
