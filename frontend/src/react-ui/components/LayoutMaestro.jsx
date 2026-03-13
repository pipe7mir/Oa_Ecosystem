/**
 * LayoutMaestro — Layout adaptativo Web / PWA
 *
 * Desktop (≥768px): Navbar horizontal sticky arriba
 * Mobile  (<768px): Header sticky + <BottomNav /> abajo
 *
 * Estética: Liquid Glass (backdropFilter, bordes sutiles, Flat Design 2.0)
 */
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Tv2,
    Users,
    BookOpen,
    MessageCircleHeart,
    ShieldCheck,
    LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../ThemeContext';
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

/* ─── Desktop Navbar Horizontal ─── */
const DesktopNavbar = () => {
    const { pathname } = useLocation();
    const { canAccessAdmin, signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 1000,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}>
            <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px', height: '64px', maxWidth: '100%'
            }}>
                {/* Left: Logo + OASIS */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <img src={logoImg} alt="OASIS" style={{ width: '36px', height: '36px' }} />
                    <h6 style={{ 
                        margin: 0, fontWeight: 900, fontFamily: 'ModernAge', 
                        color: '#5b2ea6', fontSize: '1.25rem', letterSpacing: '0.5px' 
                    }}>
                        OASIS
                    </h6>
                </Link>

                {/* Center: Nav Links */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}>
                    {PUBLIC_NAV.map(({ to, label, Icon }) => {
                        const active = pathname === to || (to !== '/' && pathname.startsWith(to));
                        return (
                            <Link key={to} to={to}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '8px 16px', borderRadius: '10px',
                                    textDecoration: 'none', 
                                    background: active ? 'rgba(91,46,166,0.1)' : 'transparent',
                                    color: active ? '#5b2ea6' : '#435566', 
                                    fontWeight: active ? 700 : 500,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease-in-out',
                                    borderBottom: active ? '2px solid #5b2ea6' : '2px solid transparent',
                                    transform: 'translateY(0)',
                                    boxShadow: 'none',
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'rgba(91,46,166,0.05)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,46,166,0.15)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                    
                    {canAccessAdmin && (
                        <Link to="/admin"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', borderRadius: '10px',
                                textDecoration: 'none', 
                                background: pathname.startsWith('/admin') ? 'rgba(91,46,166,0.1)' : 'transparent',
                                color: pathname.startsWith('/admin') ? '#5b2ea6' : '#435566', 
                                fontWeight: pathname.startsWith('/admin') ? 700 : 500,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease-in-out',
                                borderBottom: pathname.startsWith('/admin') ? '2px solid #5b2ea6' : '2px solid transparent',
                                transform: 'translateY(0)',
                                boxShadow: 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (!pathname.startsWith('/admin')) {
                                    e.currentTarget.style.background = 'rgba(91,46,166,0.05)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,46,166,0.15)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!pathname.startsWith('/admin')) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }
                            }}
                        >
                            <ShieldCheck size={18} strokeWidth={pathname.startsWith('/admin') ? 2.5 : 2} />
                            <span>Admin</span>
                        </Link>
                    )}
                </nav>

                {/* Right: User Info & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user ? (
                        <>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '6px 12px', borderRadius: '10px',
                                background: 'rgba(91,46,166,0.05)'
                            }}>
                                <div style={{ 
                                    width: '32px', height: '32px', borderRadius: '10px', 
                                    background: 'linear-gradient(135deg, #5b2ea6, #7c3aed)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    color: '#fff', fontWeight: 800, fontSize: '0.85rem'
                                }}>
                                    {(user.name || user.email)[0].toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1f1f2e', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.name || user.email}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: '#5b2ea6', textTransform: 'capitalize' }}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            <button onClick={handleSignOut} title="Cerrar Sesión" 
                                style={{ 
                                    height: '36px', border: 'none', borderRadius: '10px', 
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    gap: '6px', fontWeight: 700, cursor: 'pointer',
                                    padding: '0 12px', fontSize: '0.8rem',
                                    transition: 'all 0.2s ease-in-out',
                                    transform: 'translateY(0)', boxShadow: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <LogOut size={16} />
                                <span>Salir</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', borderRadius: '10px',
                                textDecoration: 'none',
                                background: 'rgba(91,46,166,0.08)',
                                color: '#5b2ea6',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease-in-out',
                                transform: 'translateY(0)',
                                border: '1px solid rgba(91,46,166,0.2)',
                                boxShadow: 'none',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,46,166,0.15)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <ShieldCheck size={16} />
                            <span>Acceso Admin</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
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
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';

    return (
        <div style={{
            minHeight: '100vh',
            background: isDark 
                ? 'radial-gradient(circle at 10% 10%, #0a0a1a 0%, #000000 100%)' 
                : 'radial-gradient(circle at 15% 20%, #f0f7ff 0%, #e2e8f0 50%, #f8fafd 100%)',
            fontFamily: 'AdventSans, system-ui, sans-serif',
            color: theme.colors.text.primary,
        }}>
            {/* Desktop: Horizontal Navbar */}
            {isDesktop && <DesktopNavbar />}

            {/* Mobile: Liquid Glass top header */}
            {isMobile && <MobileHeader />}

            {/* Main content area */}
            <main style={{ minHeight: '100vh' }}>
                <Outlet />
            </main>

            {/* Mobile: Bottom Navigation */}
            {isMobile && <BottomNav />}
        </div>
    );
};

export default LayoutMaestro;
