/**
 * AdminBottomNav — Barra de navegación inferior para Administradores
 * Liquid Glass · Lucide Icons · Específica para Módulo Admin
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Inbox,
    Megaphone,
    Image,
    Radio,
    MoreHorizontal,
    Users,
    Settings,
    Info,
    Layers,
    FileCheck,
    LogOut,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminBottomNav = () => {
    const { pathname } = useLocation();
    const { signOut, role } = useAuth();
    const [showMore, setShowMore] = useState(false);

    const isAdmin = role === 'admin';

    // Items principales en la barra
    const mainItems = [
        { to: '/admin/solicitudes', label: 'Inbox', Icon: Inbox },
        { to: '/admin/announcements', label: 'Anuncios', Icon: Megaphone },
        { to: '/admin/cartelera', label: 'Cartelera', Icon: Image },
        { to: '/admin/live', label: 'En Vivo', Icon: Radio },
    ];

    // Items que van en el menú "Más"
    const moreItems = [
        { to: '/admin/inscripciones', label: 'Inscripciones', Icon: FileCheck },
        { to: '/admin/recursos', label: 'Recursos', Icon: Layers, adminOnly: true },
        { to: '/admin/users', label: 'Usuarios', Icon: Users, adminOnly: true },
        { to: '/admin/about', label: 'Sobre Oasis', Icon: Info, adminOnly: true },
        { to: '/admin/ajustes', label: 'Ajustes', Icon: Settings, adminOnly: true },
    ].filter(item => !item.adminOnly || isAdmin);

    const NavItem = ({ to, label, Icon, onClick }) => {
        const isActive = pathname === to || (to !== '/admin' && pathname.startsWith(to));
        return (
            <Link
                to={to}
                onClick={onClick}
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
            >
                {isActive && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '36px',
                        height: '36px',
                        background: 'rgba(91,46,166,0.12)',
                        borderRadius: '50%',
                        zIndex: -1,
                    }} />
                )}
                <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    color={isActive ? '#5b2ea6' : '#6b7280'}
                />
                <span style={{
                    fontSize: '9px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#5b2ea6' : '#6b7280',
                    fontFamily: 'AdventSans, sans-serif',
                }}>
                    {label}
                </span>
            </Link>
        );
    };

    return (
        <>
            {/* Overlay de "Más" */}
            {showMore && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1001,
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                    }}
                    onClick={() => setShowMore(false)}
                >
                    <div
                        style={{
                            position: 'absolute', bottom: '80px', left: '16px', right: '16px',
                            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
                            borderRadius: '24px', padding: '16px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
                            animation: 'oasisSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {moreItems.map(item => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setShowMore(false)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    gap: '8px', textDecoration: 'none', color: '#435566',
                                    padding: '12px 8px', borderRadius: '16px',
                                    background: pathname.startsWith(item.to) ? 'rgba(91,46,166,0.08)' : 'transparent',
                                }}
                            >
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: pathname.startsWith(item.to) ? 'rgba(91,46,166,0.15)' : '#f3f4f6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: pathname.startsWith(item.to) ? '#5b2ea6' : '#6b7280',
                                }}>
                                    <item.Icon size={20} />
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 600, textAlign: 'center' }}>
                                    {item.label}
                                </span>
                            </Link>
                        ))}

                        <div style={{ gridColumn: 'span 3', height: '1px', background: '#eee', margin: '4px 0' }} />

                        <a href="/" target="_blank" style={{ textDecoration: 'none', color: '#6b7280', gridColumn: 'span 1.5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', fontWeight: 600 }}>
                            <ExternalLink size={14} /> Sitio
                        </a>
                        <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#ef4444', gridColumn: 'span 1.5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', fontWeight: 700 }}>
                            <LogOut size={14} /> Salir
                        </button>
                    </div>
                </div>
            )}

            <nav
                style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1002,
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                    height: '64px', boxShadow: '0 -4px 32px rgba(0,0,0,0.08)',
                }}
            >
                {mainItems.map(item => (
                    <NavItem key={item.to} {...item} />
                ))}

                {/* Botón Más */}
                <button
                    onClick={() => setShowMore(!showMore)}
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '3px', background: 'none', border: 'none', flex: 1, padding: '6px 0',
                    }}
                >
                    <div style={{
                        position: 'relative',
                        color: showMore ? '#5b2ea6' : '#6b7280',
                    }}>
                        <MoreHorizontal size={20} strokeWidth={showMore ? 2.5 : 2} />
                    </div>
                    <span style={{
                        fontSize: '9px', fontWeight: showMore ? 700 : 500,
                        color: showMore ? '#5b2ea6' : '#6b7280',
                        fontFamily: 'AdventSans, sans-serif',
                    }}>
                        Más
                    </span>
                </button>
            </nav>

            <div style={{ height: 'calc(64px + env(safe-area-inset-bottom))' }} />

            <style>{`
                @keyframes oasisSlideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (min-width: 992px) { nav { display: none !important; } }
            `}</style>
        </>
    );
};

export default AdminBottomNav;
