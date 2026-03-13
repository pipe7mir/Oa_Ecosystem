import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAppMode from '../hooks/useAppMode';
import AdminBottomNav from '../react-ui/components/AdminBottomNav';
import logoImg from '../img/logos/LOGO1.png';
import { useTheme } from '../react-ui/ThemeContext';
import {
    Inbox,
    Megaphone,
    Image as ImageIcon,
    Radio,
    Users,
    Settings,
    Info,
    Layers,
    FileCheck,
    LogOut,
    ExternalLink,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun,
    Calendar,
    Home,
    FolderOpen
} from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, user, role } = useAuth();
    const { isMobile, isDesktop } = useAppMode();
    const { mode, toggleMode, theme } = useTheme();
    const [isCollapsed, setIsCollapsed] = React.useState(true);

    useEffect(() => {
        const restrictedRoutes = ['/admin/recursos', '/admin/users', '/admin/about', '/admin/ajustes'];
        if (role === 'editor' && restrictedRoutes.some(path => location.pathname.startsWith(path))) {
            navigate('/admin/solicitudes', { replace: true });
        }
    }, [location.pathname, role, navigate]);

    const allLinks = [
        { to: '/admin/solicitudes', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/admin/announcements', label: 'Anuncios', Icon: Megaphone },
        { to: '/admin/requests', label: 'Peticiones', Icon: Inbox },
        { to: '/admin/inscripciones', label: 'Eventos', Icon: Calendar },
        { to: '/admin/cartelera', label: 'Cartelera', Icon: ImageIcon },
        { to: '/admin/live', label: 'En Vivo', Icon: Radio },
        { to: '/admin/culto', label: 'Orden de Culto', Icon: Layers },
        { to: '/admin/recursos', label: 'Archivos', Icon: FolderOpen, adminOnly: true },
        { to: '/admin/users', label: 'Equipo', Icon: Users, adminOnly: true },
        { to: '/admin/ajustes', label: 'Ajustes', Icon: Settings, adminOnly: true },
    ];

    // Verificación robusta de rol de administrador
    const isUserAdmin = role === 'admin' || user?.role === 'admin';
    const links = allLinks.filter(l => !l.adminOnly || isUserAdmin);

    const sidebarWidth = isCollapsed ? '90px' : '280px';

    return (
        <div style={{ minHeight: '100vh', background: theme.colors.background, color: theme.colors.text.primary, fontFamily: 'Inter, sans-serif', transition: 'background 0.3s ease' }}>

            {/* ─── DESKTOP SIDEBAR ─── */}
            {isDesktop && (
                <aside style={{
                    position: 'fixed', left: 0, top: 0, bottom: 0, 
                    width: sidebarWidth,
                    background: theme.colors.surface,
                    borderRight: `1px solid ${theme.colors.border}`,
                    zIndex: 1000,
                    display: 'flex', flexDirection: 'column',
                    padding: isCollapsed ? '32px 12px' : '32px 20px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                }}>
                    {/* Sidebar Toggle */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            position: 'absolute', top: '16px', right: '12px',
                            background: isCollapsed ? theme.colors.primary : 'rgba(255,255,255,0.05)', 
                            border: 'none', 
                            color: isCollapsed ? '#fff' : theme.colors.text.secondary,
                            width: '32px', height: '32px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: isCollapsed ? `0 4px 12px ${theme.colors.primary}44` : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>

                    {/* Logo Area */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: '12px', 
                        marginBottom: '48px', 
                        marginTop: isCollapsed ? '54px' : '0',
                        padding: '0 12px',
                        minHeight: '40px',
                        transition: 'margin-top 0.4s ease'
                    }}>
                        {isCollapsed ? (
                            <img src={logoImg} alt="OASIS" style={{ width: '40px', height: '40px', filter: `drop-shadow(0 0 8px ${theme.colors.primary}66)` }} />
                        ) : (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                                <h5 style={{ 
                                    margin: 0, 
                                    fontWeight: 900, 
                                    color: mode === 'dark' ? '#ffffff' : '#000000', 
                                    fontSize: '1.25rem', 
                                    letterSpacing: '2px',
                                    fontFamily: theme.fonts.brand 
                                }}>
                                    OASIS
                                </h5>
                                <span style={{ 
                                    fontWeight: 900, 
                                    fontSize: '1.25rem', 
                                    textTransform: 'uppercase', 
                                    color: mode === 'dark' ? '#A78BFA' : '#6D28D9',
                                    letterSpacing: '2px',
                                    fontFamily: theme.fonts.brand
                                }}>
                                    ADMIN
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Theme & Home Toggle Buttons */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: isCollapsed ? 'column' : 'row',
                        gap: '12px', 
                        marginBottom: '32px' 
                    }}>
                        <button 
                            onClick={toggleMode}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: isCollapsed ? '10px' : '12px 16px', borderRadius: '14px',
                                cursor: 'pointer',
                                background: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                border: 'none', color: theme.colors.text.primary,
                                flex: isCollapsed ? 'none' : 2, 
                                justifyContent: 'center',
                                transition: 'all 0.3s'
                            }}
                            title={`Cambiar a modo ${mode === 'dark' ? 'claro' : 'oscuro'}`}
                        >
                            {mode === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
                            {!isCollapsed && <span style={{ fontWeight: 800, fontSize: '0.75rem' }}>{mode === 'dark' ? 'CLARO' : 'OSCURO'}</span>}
                        </button>
                        <button 
                            onClick={() => window.open('/', '_blank')}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: isCollapsed ? '10px' : '12px', borderRadius: '14px',
                                cursor: 'pointer',
                                background: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                border: 'none', color: theme.colors.text.primary,
                                flex: isCollapsed ? 'none' : 1,
                                transition: 'all 0.3s'
                            }}
                            title="Ver sitio público"
                        >
                            <Home size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '4px', 
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        paddingRight: '4px',
                        msOverflowStyle: 'none',  /* IE and Edge */
                        scrollbarWidth: 'none',   /* Firefox */
                    }}>
                        <style>{`
                            aside nav::-webkit-scrollbar {
                                width: 4px;
                            }
                            aside nav::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            aside nav::-webkit-scrollbar-thumb {
                                background: ${theme.colors.primary}33;
                                border-radius: 10px;
                            }
                            aside nav:hover::-webkit-scrollbar-thumb {
                                background: ${theme.colors.primary}66;
                            }
                        `}</style>
                        {links.map(({ to, label, Icon }) => {
                            const active = location.pathname === to || location.pathname.startsWith(to);
                            return (
                                <Link key={to} to={to}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '16px',
                                        padding: isCollapsed ? '12px 0' : '12px 16px', borderRadius: '14px',
                                        textDecoration: 'none', 
                                        background: active ? `linear-gradient(135deg, ${theme.colors.primary}22, ${theme.colors.primary}08)` : 'transparent',
                                        color: active ? theme.colors.primary : theme.colors.text.secondary, 
                                        fontWeight: active ? 900 : 600,
                                        fontSize: '0.9rem',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        borderLeft: active ? `4px solid ${theme.colors.primary}` : '4px solid transparent',
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        boxShadow: active ? `0 8px 16px ${theme.colors.primary}10` : 'none',
                                        marginBottom: '2px'
                                    }}
                                >
                                    <Icon size={22} strokeWidth={active ? 2.5 : 2} style={{ minWidth: isCollapsed ? 'auto' : '22px' }} />
                                    {!isCollapsed && <span style={{ transition: 'opacity 0.3s', opacity: 1, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>{label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div style={{ marginTop: 'auto', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '24px' }}>
                        {user && (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', 
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                gap: '12px',
                                padding: isCollapsed ? '12px 0' : '12px', 
                                borderRadius: '16px',
                                background: isCollapsed ? 'transparent' : 'rgba(255,255,255,0.03)',
                                marginBottom: '16px'
                            }}>
                                <div style={{ 
                                    width: '44px', height: '44px', borderRadius: '14px', 
                                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    color: '#fff', fontWeight: 900, fontSize: '1.2rem',
                                    boxShadow: `0 8px 16px ${theme.colors.primary}33`
                                }}>
                                    {(user.name || user.email)[0].toUpperCase()}
                                </div>
                                {!isCollapsed && (
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.colors.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.name || user.email}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: theme.colors.primary, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '1px' }}>
                                            {role}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={signOut}
                            style={{ 
                                width: '100%', border: 'none', borderRadius: '16px', 
                                background: 'rgba(255, 59, 48, 0.12)', color: '#FF3B30', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                gap: '12px', fontWeight: 900, cursor: 'pointer',
                                padding: '16px', fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                            title="Cerrar Sesión"
                        >
                            <LogOut size={22} strokeWidth={2.5} />
                            {!isCollapsed && <span>Cerrar Sesión</span>}
                        </button>
                    </div>
                </aside>
            )}

            {/* ─── MOBILE HEADER (Luxury Glass) ─── */}
            {isMobile && (
                <header style={{
                    position: 'sticky', top: 0, zIndex: 1000,
                    padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backdropFilter: theme.glass.backdropFilter, 
                    backgroundColor: theme.glass.background,
                    borderBottom: `1px solid ${theme.colors.border}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={logoImg} alt="OASIS" style={{ width: '32px', height: '32px' }} />
                        <h6 style={{ margin: 0, fontWeight: 900, color: theme.colors.text.primary, fontSize: '1.2rem', letterSpacing: '2px', fontFamily: theme.fonts.brand }}>OASIS</h6>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={() => window.open('/', '_blank')} style={{ background: 'none', border: 'none', color: theme.colors.text.primary }}>
                            <Home size={20} />
                        </button>
                        <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: theme.colors.text.primary }}>
                            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: 800, 
                            background: theme.colors.primary, 
                            color: '#fff', 
                            padding: '6px 14px', 
                            borderRadius: '50px', 
                            boxShadow: `0 4px 12px ${theme.colors.primary}44`,
                            fontFamily: theme.fonts.accent,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            fontSize: '0.9rem'
                        }}>
                            {links.find(l => location.pathname.startsWith(l.to))?.label || 'Panel'}
                        </div>
                    </div>
                </header>
            )}

            {/* ─── MAIN CONTENT ─── */}
            <main style={{
                marginLeft: isDesktop ? sidebarWidth : 0,
                padding: isMobile ? '24px 20px' : '48px',
                paddingBottom: isMobile ? '100px' : '48px',
                minHeight: '100vh',
                transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>

            {/* ─── MOBILE BOTTOM NAV ─── */}
            {isMobile && <AdminBottomNav />}
        </div>
    );
};

export default AdminLayout;
