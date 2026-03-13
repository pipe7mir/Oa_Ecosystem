import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Megaphone,
    Image,
    Radio,
    MoreHorizontal,
    Users,
    Settings,
    Layers,
    Calendar,
    Inbox,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../ThemeContext';

const AdminBottomNav = () => {
    const { pathname } = useLocation();
    const { signOut, role } = useAuth();
    const [showMore, setShowMore] = useState(false);
    const { theme } = useTheme();

    const isAdmin = role === 'admin';

    const mainItems = [
        { to: '/admin/solicitudes', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/admin/announcements', label: 'Anuncios', Icon: Megaphone },
        { to: '/admin/requests', label: 'Peticiones', Icon: Inbox },
        { to: '/admin/cartelera', label: 'Cartelera', Icon: Image },
    ];

    const moreItems = [
        { to: '/admin/inscripciones', label: 'Eventos', Icon: Calendar },
        { to: '/admin/culto', label: 'Culto', Icon: Layers },
        { to: '/admin/recursos', label: 'Archivos', Icon: Layers, adminOnly: true },
        { to: '/admin/users', label: 'Equipo', Icon: Users, adminOnly: true },
        { to: '/admin/live', label: 'En Vivo', Icon: Radio },
    ].filter(item => !item.adminOnly || isAdmin);

    const NavItem = ({ to, label, Icon, onClick }) => {
        const isActive = pathname === to || (to !== '/admin' && pathname.startsWith(to));
        return (
            <Link
                to={to}
                onClick={() => {
                    if (window.navigator.vibrate) window.navigator.vibrate(10);
                    onClick && onClick();
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    flex: 1,
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                }}
            >
                <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    color={isActive ? theme.colors.primary : '#6b7280'}
                    style={{ filter: isActive ? `drop-shadow(0 0 8px ${theme.colors.primary}66)` : 'none' }}
                />
                <span style={{
                    fontSize: '10px',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? theme.colors.text.primary : '#6b7280',
                    fontFamily: 'Inter, sans-serif',
                }}>
                    {label}
                </span>
            </Link>
        );
    };

    return (
        <>
            <AnimatePresence>
                {showMore && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 19999,
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                        }}
                        onClick={() => setShowMore(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{
                                position: 'absolute', bottom: '80px', left: '12px', right: '12px',
                                background: theme.colors.surface,
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: '28px', padding: '24px',
                                boxShadow: theme.shadows.floating,
                                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {moreItems.map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => {
                                        if (window.navigator.vibrate) window.navigator.vibrate(10);
                                        setShowMore(false);
                                    }}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        gap: '10px', textDecoration: 'none', color: theme.colors.text.secondary,
                                        padding: '16px 8px', borderRadius: '20px',
                                        background: pathname.startsWith(item.to) ? `${theme.colors.primary}15` : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${pathname.startsWith(item.to) ? `${theme.colors.primary}33` : 'transparent'}`,
                                    }}
                                >
                                    <item.Icon size={24} color={pathname.startsWith(item.to) ? theme.colors.primary : '#888'} />
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: pathname.startsWith(item.to) ? theme.colors.text.primary : 'inherit' }}>
                                        {item.label}
                                    </span>
                                </Link>
                            ))}

                            <div style={{ gridColumn: 'span 3', height: '1px', background: theme.colors.border, margin: '8px 0' }} />

                            <button onClick={signOut} style={{ 
                                background: 'rgba(255,59,48,0.1)', border: 'none', color: '#ff3b30', 
                                gridColumn: 'span 3', display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', gap: '8px', fontSize: '13px', 
                                fontWeight: 800, padding: '16px', borderRadius: '16px' 
                            }}>
                                <LogOut size={18} /> Salir del Sistema
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav
                style={{
                    position: 'fixed', bottom: '12px', left: '16px', right: '16px', zIndex: 20000,
                    backdropFilter: theme.glass.backdropFilter,
                    backgroundColor: theme.glass.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '24px',
                    paddingBottom: '0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                    height: '72px', boxShadow: theme.shadows.medium,
                }}
            >
                {mainItems.map(item => (
                    <NavItem key={item.to} {...item} />
                ))}

                <button
                    onClick={() => {
                        if (window.navigator.vibrate) window.navigator.vibrate(10);
                        setShowMore(!showMore);
                    }}
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '4px', background: 'none', border: 'none', flex: 1,
                    }}
                >
                    <MoreHorizontal size={22} color={showMore ? theme.colors.primary : '#6b7280'} />
                    <span style={{
                        fontSize: '10px', fontWeight: showMore ? 800 : 500,
                        color: showMore ? theme.colors.text.primary : '#6b7280',
                        fontFamily: 'Inter, sans-serif',
                    }}>
                        Más
                    </span>
                </button>
            </nav>

            <div style={{ height: '100px' }} />
        </>
    );
};

export default AdminBottomNav;
