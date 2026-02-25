import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../react-ui/styles/theme';
import Footer from '../react-ui/components/Footer';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
    React.useEffect(() => {
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

    /**
     * 3. DEFINICIÓN DE ENLACES:
     * Lista completa de módulos administrativos disponibles en el sistema.
     */
    const allLinks = [
        { to: '/admin/solicitudes', label: 'Solicitudes', icon: 'bi-inbox' },
        { to: '/admin/recursos', label: 'Recursos', icon: 'bi-collection' },
        { to: '/admin/announcements', label: 'Anuncios', icon: 'bi-megaphone' },
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
        const editorAllowed = ['/admin/solicitudes', '/admin/announcements', '/admin/inscripciones', '/admin/cartelera', '/admin/live'];
        return editorAllowed.includes(link.to);
    });

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <div style={glass} className="mb-4">
                <div className="container-fluid py-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <Link to="/admin/solicitudes" style={{ textDecoration: 'none' }}>
                                <h5 className="mb-0 fw-bold" style={{ fontFamily: 'ModernAge, sans-serif', color: theme.colors.primary }}>
                                    OASIS <span className="text-muted small">Admin</span>
                                </h5>
                            </Link>
                        </div>

                        <div className="d-flex gap-2 bg-white p-1 rounded-pill border shadow-sm overflow-auto" style={{ maxWidth: '100%' }}>
                            {links.map(({ to, label, icon }) => {
                                const active = location.pathname === to || location.pathname.startsWith(to);
                                return (
                                    <Link key={to} to={to}
                                        className={`btn btn-sm rounded-pill fw-bold ${active ? 'text-white' : 'text-muted'}`}
                                        style={active ? { background: theme.colors.primary, paddingLeft: '1.5em', paddingRight: '1.5em' } : { border: 'none' }}>
                                        <i className={`bi ${icon} me-2`}></i>{label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <Link to="/" className="btn btn-sm btn-outline-primary rounded-pill fw-bold" title="Ver sitio público">
                                <i className="bi bi-globe"></i>
                            </Link>
                            <button onClick={() => { localStorage.removeItem('authToken'); navigate('/login'); }}
                                className="btn btn-sm btn-outline-danger rounded-pill fw-bold" title="Cerrar sesión">
                                <i className="bi bi-box-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid pf-5">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default AdminLayout;
