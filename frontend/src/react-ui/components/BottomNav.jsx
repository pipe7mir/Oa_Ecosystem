/**
 * BottomNav — Barra de navegación inferior estilo app nativa
 * Liquid Glass · Lucide Icons · Safe-area iOS
 * Visible solo en modo Mobile (<768px)
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Tv2,
    Users,
    BookOpen,
    MessageCircleHeart,
    ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
    { to: '/', label: 'Inicio', Icon: Home },
    { to: '/live', label: 'En Vivo', Icon: Tv2 },
    { to: '/about', label: 'Nosotros', Icon: Users },
    { to: '/recursos', label: 'Recursos', Icon: BookOpen },
    { to: '/peticiones', label: 'Orar', Icon: MessageCircleHeart },
];

const ADMIN_ITEM = { to: '/admin', label: 'Admin', Icon: ShieldCheck };

const BottomNav = () => {
    const { pathname } = useLocation();
    const { canAccessAdmin } = useAuth();

    const items = canAccessAdmin ? [...NAV_ITEMS.slice(0, 4), ADMIN_ITEM] : NAV_ITEMS;

    return (
        <>
            {/* Spacer so content isn't hidden behind the bar */}
            <div style={{ height: 'calc(64px + env(safe-area-inset-bottom))' }} />

            <nav
                aria-label="Navegación principal"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    /* Liquid Glass */
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.72)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 -4px 32px rgba(91, 46, 166, 0.10)',
                    /* Safe area for iOS notch */
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    height: '64px',
                }}
            >
                {items.map(({ to, label, Icon }) => {
                    const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
                    return (
                        <Link
                            key={to}
                            to={to}
                            aria-label={label}
                            aria-current={isActive ? 'page' : undefined}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                textDecoration: 'none',
                                flex: 1,
                                padding: '6px 0',
                                position: 'relative',
                                transition: 'transform 0.15s ease',
                            }}
                            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.92)'}
                            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {/* Active pill glow */}
                            {isActive && (
                                <span style={{
                                    position: 'absolute',
                                    top: '4px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '36px',
                                    height: '36px',
                                    background: 'rgba(91, 46, 166, 0.12)',
                                    borderRadius: '50%',
                                    zIndex: -1,
                                }} />
                            )}
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                color={isActive ? '#5b2ea6' : '#6b7280'}
                                style={{ transition: 'color 0.2s, stroke-width 0.2s' }}
                            />
                            <span style={{
                                fontSize: '10px',
                                fontWeight: isActive ? 700 : 400,
                                color: isActive ? '#5b2ea6' : '#6b7280',
                                fontFamily: 'AdventSans, system-ui, sans-serif',
                                letterSpacing: '0.3px',
                                lineHeight: 1,
                                transition: 'color 0.2s',
                            }}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <style>{`
        @media (min-width: 768px) { nav[aria-label="Navegación principal"] { display: none !important; } }
      `}</style>
        </>
    );
};

export default BottomNav;
