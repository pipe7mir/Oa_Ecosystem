/**
 * LayoutMaestro — Layout adaptativo Web / PWA
 *
 * Desktop (≥768px): Sidebar fija de vidrio + <Outlet /> derecha
 * Mobile  (<768px): Sin sidebar, <Outlet /> full-width + <BottomNav /> abajo
 *
 * Estética: Liquid Glass (backdropFilter, bordes sutiles, Flat Design 2.0)
 */
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Tv2,
    Users,
    BookOpen,
    MessageCircleHeart,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Droplets,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useAppMode from '../../hooks/useAppMode';
import BottomNav from './BottomNav';
import logoImg from '../../img/logos/LOGO1.png';

/* ─── Ruta de navegación pública ─── */
const PUBLIC_NAV = [
    { to: '/', label: 'Inicio', Icon: Home },
    { to: '/live', label: 'En Vivo', Icon: Tv2 },
    { to: '/about', label: 'Nosotros', Icon: Users },
    { to: '/recursos', label: 'Recursos', Icon: BookOpen },
    { to: '/peticiones', label: 'Peticiones', Icon: MessageCircleHeart },
];

/* ─── Componente de ítem de Sidebar ─── */
const SideItem = ({ to, label, Icon, isActive, collapsed }) => (
    <Link
        to={to}
        title={collapsed ? label : undefined}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : '12px',
            padding: collapsed ? '12px' : '10px 16px',
            borderRadius: '14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            textDecoration: 'none',
            transition: 'background 0.2s, transform 0.15s',
            background: isActive
                ? 'linear-gradient(135deg, rgba(91,46,166,0.18), rgba(0,211,223,0.1))'
                : 'transparent',
            color: isActive ? '#5b2ea6' : '#435566',
            fontWeight: isActive ? 700 : 500,
            fontSize: '0.88rem',
            fontFamily: 'AdventSans, system-ui, sans-serif',
            borderLeft: isActive ? '3px solid #5b2ea6' : '3px solid transparent',
            position: 'relative',
            overflow: 'hidden',
        }}
        onMouseEnter={e => {
            if (!isActive) e.currentTarget.style.background = 'rgba(91,46,166,0.07)';
        }}
        onMouseLeave={e => {
            if (!isActive) e.currentTarget.style.background = 'transparent';
        }}
    >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
        {!collapsed && <span>{label}</span>}
    </Link>
);

/* ─── Sidebar (Desktop) ─── */
const Sidebar = ({ collapsed, onToggle }) => {
    const { pathname } = useLocation();
    const { canAccessAdmin, signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const sidebarWidth = collapsed ? '72px' : '240px';

    return (
        <aside
            aria-label="Barra lateral de navegación"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: sidebarWidth,
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                /* Liquid Glass */
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                backgroundColor: 'rgba(255, 255, 255, 0.70)',
                borderRight: '1px solid rgba(255, 255, 255, 0.55)',
                boxShadow: '4px 0 32px rgba(91,46,166,0.08)',
                transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                overflow: 'hidden',
            }}
        >
            {/* Brand */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '20px 0' : '20px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderBottom: '1px solid rgba(91,46,166,0.08)',
                flexShrink: 0,
            }}>
                <img src={logoImg} alt="OASIS" style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }} />
                {!collapsed && (
                    <span style={{
                        fontFamily: 'ModernAge, sans-serif',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(90deg, #5b2ea6, #00d3df)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        whiteSpace: 'nowrap',
                    }}>
                        OASIS
                    </span>
                )}
            </div>

            {/* Navigation Links */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {PUBLIC_NAV.map(({ to, label, Icon }) => (
                    <SideItem
                        key={to}
                        to={to}
                        label={label}
                        Icon={Icon}
                        isActive={pathname === to || (to !== '/' && pathname.startsWith(to))}
                        collapsed={collapsed}
                    />
                ))}

                {canAccessAdmin && (
                    <>
                        <div style={{ height: '1px', background: 'rgba(91,46,166,0.1)', margin: '8px 0' }} />
                        <SideItem
                            to="/admin"
                            label="Admin Panel"
                            Icon={ShieldCheck}
                            isActive={pathname.startsWith('/admin')}
                            collapsed={collapsed}
                        />
                    </>
                )}
            </nav>

            {/* User + Sign Out */}
            <div style={{
                borderTop: '1px solid rgba(91,46,166,0.08)',
                padding: collapsed ? '12px 8px' : '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flexShrink: 0,
            }}>
                {!collapsed && user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #5b2ea6, #00d3df)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                        }}>
                            {(user.name || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1f1f2e', truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {user.name || user.email}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#5b2ea6', textTransform: 'capitalize' }}>{user.role}</div>
                        </div>
                    </div>
                )}

                {user && (
                    <button
                        onClick={handleSignOut}
                        title="Cerrar sesión"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
                            gap: '8px', padding: collapsed ? '10px' : '8px 12px',
                            border: 'none', borderRadius: '10px', cursor: 'pointer',
                            background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444',
                            fontSize: '0.82rem', fontWeight: 600,
                            fontFamily: 'AdventSans, sans-serif',
                            width: '100%',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.16)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    >
                        <LogOut size={17} />
                        {!collapsed && 'Cerrar sesión'}
                    </button>
                )}
            </div>

            {/* Collapse toggle */}
            <button
                onClick={onToggle}
                aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-14px',
                    transform: 'translateY(-50%)',
                    width: '28px', height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(91,46,166,0.2)',
                    boxShadow: '0 2px 12px rgba(91,46,166,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 201,
                    transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(91,46,166,0.25)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(91,46,166,0.15)'}
            >
                {collapsed
                    ? <ChevronRight size={14} color="#5b2ea6" strokeWidth={2.5} />
                    : <ChevronLeft size={14} color="#5b2ea6" strokeWidth={2.5} />
                }
            </button>
        </aside>
    );
};

/* ─── Header mobile (Liquid Glass sticky) ─── */
const MobileHeader = () => {
    const { pathname } = useLocation();
    const pageTitle = [
        { path: '/', label: 'Inicio' },
        { path: '/live', label: 'En Vivo' },
        { path: '/about', label: 'Nosotros' },
        { path: '/recursos', label: 'Recursos' },
        { path: '/peticiones', label: 'Peticiones' },
        { path: '/admin', label: 'Admin' },
    ].find(p => pathname === p.path || (p.path !== '/' && pathname.startsWith(p.path)))?.label || 'OASIS';

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 2px 16px rgba(91,46,166,0.08)',
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <img src={logoImg} alt="OASIS" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            </Link>
            <span style={{
                fontFamily: 'AdventSans, sans-serif', fontWeight: 700,
                fontSize: '1rem', color: '#1f1f2e',
            }}>
                {pageTitle}
            </span>
            <div style={{ width: '30px' }} /> {/* spacer */}
        </header>
    );
};

/* ─── LayoutMaestro ─── */
const LayoutMaestro = ({ showFooter = true }) => {
    const { isMobile, isDesktop } = useAppMode();
    const [collapsed, setCollapsed] = useState(false);

    const sidebarWidth = collapsed ? 72 : 240;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at 15% 20%, #ede9fe 0%, #e8f9ff 50%, #f4f7f6 100%)',
            fontFamily: 'AdventSans, system-ui, sans-serif',
        }}>
            {/* Desktop: Fixed Sidebar */}
            {isDesktop && (
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
            )}

            {/* Mobile: Liquid Glass top header */}
            {isMobile && <MobileHeader />}

            {/* Main content area */}
            <main
                style={{
                    marginLeft: isDesktop ? `${sidebarWidth}px` : 0,
                    transition: 'margin-left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    minHeight: '100vh',
                }}
            >
                <Outlet />
            </main>

            {/* Mobile: Bottom Navigation */}
            {isMobile && <BottomNav />}
        </div>
    );
};

export default LayoutMaestro;
