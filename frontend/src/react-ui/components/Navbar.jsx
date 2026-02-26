import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { theme } from '../styles/theme';
import logoImg from '../../img/logos/LOGO1.png';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
    const location = useLocation();

    // Update isMobile on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 992);
            if (window.innerWidth > 992) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const styles = {
        nav: {
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 16px' : `${theme.spacing(2)} ${theme.spacing(4)}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease'
        },
        brand: {
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            gap: theme.spacing(1.5)
        },
        logoIcon: {
            width: isMobile ? '36px' : '40px',
            height: isMobile ? '36px' : '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        },
        logoText: {
            fontFamily: 'ModernAge, sans-serif',
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 'bold',
            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        desktopMenu: {
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: theme.spacing(3)
        },
        link: {
            fontFamily: theme.fonts.body,
            textDecoration: 'none',
            color: theme.colors.text.secondary,
            fontWeight: 500,
            transition: 'color 0.2s ease',
            fontSize: '0.95rem'
        },
        adminBtn: {
            textDecoration: 'none',
            padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
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
        },
        // Mobile Menu Styles
        hamburger: {
            display: isMobile ? 'flex' : 'none',
            flexDirection: 'column',
            justifyContent: 'space-around',
            width: '28px',
            height: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            zIndex: 1002
        },
        hamburgerLine: (isOpen, lineNum) => ({
            width: '100%',
            height: '3px',
            background: theme.colors.primary,
            borderRadius: '3px',
            transition: 'all 0.3s ease',
            transformOrigin: 'center',
            ...(isOpen && lineNum === 1 && { transform: 'rotate(45deg) translate(5px, 6px)' }),
            ...(isOpen && lineNum === 2 && { opacity: 0 }),
            ...(isOpen && lineNum === 3 && { transform: 'rotate(-45deg) translate(6px, -7px)' })
        }),
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            opacity: mobileMenuOpen ? 1 : 0,
            visibility: mobileMenuOpen ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease, visibility 0.3s ease'
        },
        mobileMenu: {
            position: 'fixed',
            top: 0,
            right: mobileMenuOpen ? 0 : '-100%',
            width: '280px',
            maxWidth: '85vw',
            height: '100vh',
            background: 'white',
            zIndex: 999,
            padding: '80px 24px 32px',
            boxShadow: '-5px 0 25px rgba(0, 0, 0, 0.15)',
            transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowY: 'auto'
        },
        mobileLink: {
            display: 'block',
            padding: '16px 0',
            fontSize: '1.1rem',
            color: '#102027',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            transition: 'color 0.2s ease, padding-left 0.2s ease',
            fontFamily: theme.fonts.body
        },
        mobileAdminBtn: {
            display: 'block',
            marginTop: '24px',
            padding: '14px 24px',
            background: theme.colors.primary,
            color: 'white',
            borderRadius: '50px',
            textAlign: 'center',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontSize: '1rem',
            boxShadow: theme.shadows.soft
        },
        closeBtn: {
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: theme.colors.primary,
            padding: '8px'
        }
    };

    const navLinks = [
        { to: '/', label: 'Inicio', active: true },
        { to: '/live', label: 'En Vivo' },
        { to: '/about', label: 'Nosotros' },
        { divider: true },
        { to: '/recursos', label: 'Recursos' },
        { to: '/peticiones', label: 'Peticiones' }
    ];

    return (
        <>
            <nav style={styles.nav} className="oasis-navbar">
                {/* Brand/Logo */}
                <Link to="/" style={styles.brand}>
                    <div style={styles.logoIcon}>
                        <img src={logoImg} alt="OASIS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={styles.logoText} className="logo-text">
                        OASIS
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div style={styles.desktopMenu} className="desktop-menu">
                    {navLinks.map((item, index) => (
                        item.divider ? (
                            <div key={`divider-${index}`} style={styles.divider}></div>
                        ) : (
                            <Link 
                                key={item.to} 
                                to={item.to} 
                                className="hover-primary" 
                                style={{
                                    ...styles.link,
                                    ...(item.active && { color: theme.colors.text.primary, fontWeight: 'bold' })
                                }}
                            >
                                {item.label}
                            </Link>
                        )
                    ))}
                    <Link to="/login" style={styles.adminBtn} className="btn-active">
                        Admin
                    </Link>
                </div>

                {/* Hamburger Button (Mobile) */}
                <button 
                    style={styles.hamburger} 
                    onClick={toggleMobileMenu}
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <span style={styles.hamburgerLine(mobileMenuOpen, 1)}></span>
                    <span style={styles.hamburgerLine(mobileMenuOpen, 2)}></span>
                    <span style={styles.hamburgerLine(mobileMenuOpen, 3)}></span>
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div style={styles.overlay} onClick={closeMobileMenu}></div>

            {/* Mobile Slide-out Menu */}
            <div style={styles.mobileMenu} className="mobile-menu">
                <button style={styles.closeBtn} onClick={closeMobileMenu} aria-label="Close menu">
                    <i className="bi bi-x-lg"></i>
                </button>
                
                {navLinks.filter(item => !item.divider).map((item) => (
                    <Link 
                        key={item.to} 
                        to={item.to} 
                        style={styles.mobileLink}
                        onClick={closeMobileMenu}
                    >
                        {item.label}
                    </Link>
                ))}
                
                <Link 
                    to="/inscripciones" 
                    style={styles.mobileLink}
                    onClick={closeMobileMenu}
                >
                    Inscripciones
                </Link>
                
                <Link 
                    to="/login" 
                    style={styles.mobileAdminBtn}
                    onClick={closeMobileMenu}
                >
                    <i className="bi bi-shield-lock me-2"></i>
                    Admin
                </Link>
            </div>

            {/* Hover Styles Injection */}
            <style>{`
                .hover-primary:hover { color: ${theme.colors.primary} !important; }
                .btn-active:active { transform: scale(0.98); }
                .mobile-menu a:hover { color: ${theme.colors.primary}; padding-left: 8px; }
            `}</style>
        </>
    );
};

export default Navbar;
