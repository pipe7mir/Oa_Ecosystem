import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../react-ui/styles/theme';
import Footer from '../react-ui/components/Footer';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    // Responsive detection
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (!mobile) setIsMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    /**
     * LÓGICA DE CONTROL DE ACCESO (RBAC)
     * ---------------------------------
     * 1. Recuperamos el usuario y su rol desde el almacenamiento local.
     */
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const role = user?.role || 'editor'; // Por seguridad, si no hay rol, se asume 'editor'

    /**
     * 2. GUARDA DE SEGURIDAD:
     * Si un usuario con rol 'editor' intenta entrar a una ruta prohibida,
     * el sistema lo bloquea y lo redirige a la gestión de solicitudes.
     */
    useEffect(() => {
        const restrictedRoutes = ['/admin/recursos', '/admin/users', '/admin/about', '/admin/ajustes'];
        if (role === 'editor' && restrictedRoutes.some(path => location.pathname.startsWith(path))) {
            navigate('/admin/solicitudes', { replace: true });
        }
    }, [location.pathname, role, navigate]);

    // Estilo Glassmorphism para la barra de navegación superior
    const glass = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
    };

    // Mobile menu styles
    const mobileMenuOverlay = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        opacity: isMobileMenuOpen ? 1 : 0,
        visibility: isMobileMenuOpen ? 'visible' : 'hidden',
        transition: 'opacity 0.3s, visibility 0.3s',
        touchAction: 'none',
        overscrollBehavior: 'contain'
    };

    const mobileMenuPanel = {
        position: 'fixed',
        top: 0,
        left: isMobileMenuOpen ? 0 : '-280px',
        width: '280px',
        height: '100dvh',
        background: 'white',
        zIndex: 1051,
        transition: 'left 0.3s ease',
        overflowY: 'auto',
        boxShadow: '2px 0 20px rgba(0,0,0,0.15)',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch'
    };

    const hamburgerBtn = {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        color: theme.colors.primary,
        cursor: 'pointer',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    /**
     * 3. DEFINICIÓN DE ENLACES:
     * Lista completa de módulos administrativos disponibles en el sistema.
     */
    const allLinks = [
        { to: '/admin/solicitudes', label: 'Solicitudes', icon: 'bi-inbox' },
        { to: '/admin/recursos', label: 'Recursos', icon: 'bi-collection' },
        { to: '/admin/announcements', label: 'Anuncios', icon: 'bi-megaphone' },
        { to: '/admin/oasispress', label: 'Oasis Press', icon: 'bi-easel2' },
        { to: '/admin/inscripciones', label: 'Inscripciones', icon: 'bi-journal-check' },
        { to: '/admin/cartelera', label: 'Cartelera', icon: 'bi-card-image' },
        { to: '/admin/users', label: 'Usuarios', icon: 'bi-people' },
        { to: '/admin/live', label: 'En Vivo', icon: 'bi-broadcast' },
        { to: '/admin/about', label: 'Sobre Oasis', icon: 'bi-info-circle' },
        { to: '/admin/ajustes', label: 'Ajustes', icon: 'bi-gear' }
    ];

    /**
     * 4. FILTRADO POR ROL:
     * El administrador ve todo. El editor solo ve los módulos de contenido operativo.
     */
    const links = allLinks.filter(link => {
        if (role === 'admin') return true;
        const editorAllowed = ['/admin/solicitudes', '/admin/announcements', '/admin/oasispress', '/admin/inscripciones', '/admin/cartelera', '/admin/live'];
        return editorAllowed.includes(link.to);
    });

    const NavLinks = ({ mobile = false }) => (
        <>
            {links.map(({ to, label, icon }) => {
                const active = location.pathname === to || location.pathname.startsWith(to);
                if (mobile) {
                    return (
                        <Link key={to} to={to}
                            className={`d-flex align-items-center gap-3 px-4 py-3 text-decoration-none ${active ? 'text-white' : 'text-dark'}`}
                            style={active ? { background: theme.colors.primary } : { borderBottom: '1px solid #eee' }}>
                            <i className={`bi ${icon}`} style={{ fontSize: '1.2rem' }}></i>
                            <span className="fw-medium">{label}</span>
                        </Link>
                    );
                }
                return (
                    <Link key={to} to={to}
                        className={`btn btn-sm rounded-pill fw-bold ${active ? 'text-white' : 'text-muted'}`}
                        style={active ? { background: theme.colors.primary, paddingLeft: '1.5em', paddingRight: '1.5em', whiteSpace: 'nowrap' } : { border: 'none', whiteSpace: 'nowrap' }}>
                        <i className={`bi ${icon} me-2`}></i>{label}
                    </Link>
                );
            })}
        </>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            {/* Mobile Menu Overlay */}
            {isMobile && (
                <>
                    <div style={mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)} />
                    <div style={mobileMenuPanel}>
                        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
                            <h5 className="mb-0 fw-bold" style={{ fontFamily: 'ModernAge, sans-serif', color: theme.colors.primary }}>
                                OASIS <span className="text-muted small">Admin</span>
                            </h5>
                            <button onClick={() => setIsMobileMenuOpen(false)} style={hamburgerBtn}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <nav className="d-flex flex-column">
                            <NavLinks mobile={true} />
                        </nav>
                        <div className="p-4 border-top mt-auto">
                            <div className="d-flex gap-2">
                                <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill fw-bold flex-grow-1">
                                    <i className="bi bi-globe me-2"></i>Ver sitio
                                </a>
                                <button onClick={async () => { await signOut(); navigate('/login'); }}
                                    className="btn btn-sm btn-outline-danger rounded-pill fw-bold flex-grow-1">
                                    <i className="bi bi-box-arrow-right me-2"></i>Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div style={glass} className="mb-4">
                <div className="container-fluid py-3">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        {/* Mobile hamburger */}
                        {isMobile && (
                            <button onClick={() => setIsMobileMenuOpen(true)} style={hamburgerBtn}>
                                <i className="bi bi-list"></i>
                            </button>
                        )}

                        <div className="d-flex align-items-center gap-3">
                            <Link to="/admin/solicitudes" style={{ textDecoration: 'none' }}>
                                <h5 className="mb-0 fw-bold" style={{ fontFamily: 'ModernAge, sans-serif', color: theme.colors.primary }}>
                                    OASIS <span className="text-muted small">Admin</span>
                                </h5>
                            </Link>
                        </div>

                        {/* Desktop navigation */}
                        {!isMobile && (
                            <div className="d-flex gap-2 bg-white p-1 rounded-pill border shadow-sm overflow-auto flex-shrink-1" style={{ maxWidth: 'calc(100% - 200px)' }}>
                                <NavLinks mobile={false} />
                            </div>
                        )}

                        {/* Desktop action buttons */}
                        {!isMobile && (
                            <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill fw-bold" title="Ver sitio público">
                                    <i className="bi bi-globe"></i>
                                </a>
                                <button onClick={async () => { await signOut(); navigate('/login'); }}
                                    className="btn btn-sm btn-outline-danger rounded-pill fw-bold" title="Cerrar sesión">
                                    <i className="bi bi-box-arrow-right"></i>
                                </button>
                            </div>
                        )}

                        {/* Mobile: only show current page indicator */}
                        {isMobile && (
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge rounded-pill" style={{ background: theme.colors.primary, fontSize: '0.75rem' }}>
                                    {links.find(l => location.pathname.startsWith(l.to))?.label || 'Admin'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container-fluid px-3 px-lg-5">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default AdminLayout;
