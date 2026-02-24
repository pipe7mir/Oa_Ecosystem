import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';
import logoImg from '../../img/logos/LOGO1.png';

const styles = {
    nav: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${theme.spacing(2)} ${theme.spacing(4)}`, // 16px 32px
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Requested 0.1
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease'
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        gap: theme.spacing(1.5) // ~12px
    },
    logoIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    logoText: {
        fontFamily: 'ModernAge, sans-serif',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    menu: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(3) // 24px
    },
    link: {
        fontFamily: theme.fonts.body,
        textDecoration: 'none',
        color: theme.colors.text.secondary,
        fontWeight: 500,
        transition: 'color 0.2s ease',
        fontSize: '0.95rem'
    },
    linkActive: {
        color: theme.colors.primary,
        fontWeight: 'bold'
    },
    adminBtn: {
        textDecoration: 'none',
        padding: `${theme.spacing(1)} ${theme.spacing(3)}`, // 8px 24px
        background: theme.colors.primary,
        color: 'white',
        borderRadius: '50px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        boxShadow: theme.shadows.soft,
        transition: 'transform 0.2s'
    },
    divider: {
        width: '1px',
        height: '24px',
        backgroundColor: 'rgba(0,0,0,0.1)'
    }
};

const Navbar = () => {
    return (
        <nav style={styles.nav}>
            {/* Brand/Logo */}
            <Link to="/" style={styles.brand}>
                <div style={styles.logoIcon}>
                    <img src={logoImg} alt="OASIS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <span style={styles.logoText}>
                    OASIS
                </span>
            </Link>

            {/* Menu Items */}
            <div style={styles.menu}>
                <Link to="/" style={{ ...styles.link, color: theme.colors.text.primary, fontWeight: 'bold' }}>Inicio</Link>
                <Link to="/live" className="hover-primary" style={styles.link}>En Vivo</Link>
                <Link to="/about" className="hover-primary" style={styles.link}>Nosotros</Link>

                <div style={styles.divider}></div>

                <Link to="/recursos" className="hover-primary" style={styles.link}>Recursos</Link>
                <Link to="/peticiones" className="hover-primary" style={styles.link}>Peticiones</Link>

                <Link to="/login" style={styles.adminBtn} className="btn-active">
                    Admin
                </Link>
            </div>

            {/* Hover Styles Injection */}
            <style>{`
                .hover-primary:hover { color: ${theme.colors.primary} !important; }
                .btn-active:active { transform: scale(0.98); }
            `}</style>
        </nav>
    );
};

export default Navbar;
