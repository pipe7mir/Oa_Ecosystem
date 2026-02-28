import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../react-ui/styles/theme';
import Footer from '../react-ui/components/Footer';
import { useAuth } from '../context/AuthContext';
import useAppMode from '../hooks/useAppMode';
import AdminBottomNav from '../react-ui/components/AdminBottomNav';
import logoImg from '../img/logos/LOGO1.png';
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
    ChevronLeft,
    ChevronRight,
    LayoutDashboard
} from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, user, role } = useAuth();
    const { isMobile, isDesktop } = useAppMode();
    const [collapsed, setCollapsed] = useState(false);

    /**
     * RBAC SECURITY GUARD
     * Redirige editores si intentan entrar a rutas restringidas
     */
    useEffect(() => {
        const restrictedRoutes = ['/admin/recursos', '/admin/users', '/admin/about', '/admin/ajustes'];
        if (role === 'editor' && restrictedRoutes.some(path => location.pathname.startsWith(path))) {
            navigate('/admin/solicitudes', { replace: true });
        }
    }, [location.pathname, role, navigate]);

    // Configuración de enlaces para el Sidebar
    const allLinks = [
        { to: '/admin/solicitudes', label: 'Solicitudes', Icon: Inbox },
        { to: '/admin/announcements', label: 'Anuncios', Icon: Megaphone },
        { to: '/admin/inscripciones', label: 'Inscripciones', Icon: FileCheck },
        { to: '/admin/cartelera', label: 'Cartelera', Icon: ImageIcon },
        { to: '/admin/live', label: 'En Vivo', Icon: Radio },
        { to: '/admin/recursos', label: 'Recursos', Icon: Layers, adminOnly: true },
        { to: '/admin/users', label: 'Usuarios', Icon: Users, adminOnly: true },
        { to: '/admin/about', label: 'Sobre Oasis', Icon: Info, adminOnly: true },
        { to: '/admin/ajustes', label: 'Ajustes', Icon: Settings, adminOnly: true },
    ];

    const links = allLinks.filter(l => !l.adminOnly || role === 'admin');

    const sidebarWidth = collapsed ? '72px' : '260px';

    return (
        <div style={{ minHeight: '100vh', background: '#f4f7f6', fontFamily: 'AdventSans, sans-serif' }}>

            {/* ─── DESKTOP SIDEBAR (Liquid Glass) ─── */}
            {isDesktop && (
                <aside style={{
                    position: 'fixed', top: 0, left: 0, bottom: 0, width: sidebarWidth,
                    zIndex: 200, display: 'flex', flexDirection: 'column',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRight: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.03)',
                    transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                    {/* Header Sidebar */}
                    <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={logoImg} alt="OASIS" style={{ width: '32px', height: '32px' }} />
                        {!collapsed && (
                            <div style={{ minWidth: 0 }}>
                                <h6 style={{ margin: 0, fontWeight: 800, fontFamily: 'ModernAge', color: '#5b2ea6', fontSize: '1rem' }}>OASIS</h6>
                                <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>ADMIN PANEL</span>
                            </div>
                        )}
                    </div>

                    {/* Nav Links */}
                    <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {links.map(({ to, label, Icon }) => {
                            const active = location.pathname === to || location.pathname.startsWith(to);
                            return (
                                <Link key={to} to={to} title={collapsed ? label : undefined}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '12px',
                                        padding: collapsed ? '12px' : '10px 16px', borderRadius: '14px',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        textDecoration: 'none', background: active ? 'rgba(91,46,166,0.08)' : 'transparent',
                                        color: active ? '#5b2ea6' : '#435566', fontWeight: active ? 700 : 500,
                                        transition: 'all 0.2s', borderLeft: active ? '3px solid #5b2ea6' : '3px solid transparent'
                                    }}>
                                    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                                    {!collapsed && <span style={{ fontSize: '0.9rem' }}>{label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Actions */}
                    <div style={{ padding: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        {!collapsed && user && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #5b2ea6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                                    {(user.name || user.email)[0].toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1f1f2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || user.email}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#5b2ea6', textTransform: 'uppercase', fontWeight: 700 }}>{role}</div>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <a href="/" target="_blank" title="Ver Sitio" style={{ flex: 1, height: '36px', borderRadius: '10px', background: '#f3f4f6', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                                <ExternalLink size={16} />
                            </a>
                            <button onClick={signOut} title="Cerrar Sesión" style={{ flex: collapsed ? 1 : 2, height: '36px', border: 'none', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, cursor: 'pointer' }}>
                                <LogOut size={16} />
                                {!collapsed && <span style={{ fontSize: '0.75rem' }}>Salir</span>}
                            </button>
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <button onClick={() => setCollapsed(!collapsed)}
                        style={{ position: 'absolute', right: '-12px', top: '80px', width: '24px', height: '24px', borderRadius: '50%', background: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10 }}>
                        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </aside>
            )}

            {/* ─── MOBILE HEADER (Liquid Glass) ─── */}
            {isMobile && (
                <header style={{
                    position: 'sticky', top: 0, zIndex: 1000,
                    padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backdropFilter: 'blur(20px) saturate(180%)', backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={logoImg} alt="OASIS" style={{ width: '28px', height: '28px' }} />
                        <h6 style={{ margin: 0, fontWeight: 900, fontFamily: 'ModernAge', color: '#5b2ea6', fontSize: '0.9rem' }}>ADMIN</h6>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(91,46,166,0.1)', color: '#5b2ea6', padding: '4px 12px', borderRadius: '50px' }}>
                        {links.find(l => location.pathname.startsWith(l.to))?.label || 'Panel'}
                    </div>
                </header>
            )}

            {/* ─── MAIN CONTENT ─── */}
            <main style={{
                marginLeft: isDesktop ? sidebarWidth : 0,
                transition: 'margin-left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                padding: '24px 16px',
                minHeight: '100vh',
                maxWidth: '100%',
                overflowX: 'hidden'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>

            {/* ─── MOBILE BOTTOM NAV ─── */}
            {isMobile && <AdminBottomNav />}

            {/* Global Footer (Desktop Only perhaps, or standard) */}
            <Footer />
        </div>
    );
};

export default AdminLayout;

