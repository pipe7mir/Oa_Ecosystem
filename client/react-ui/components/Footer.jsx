import React from 'react';
import { theme } from '../styles/theme';
import logoImg from '../../img/logos/LOGO1.png';

const Footer = () => {
    return (
        <footer style={{
            background: 'white',
            padding: `${theme.spacing(8)} 0`,
            borderTop: '1px solid rgba(0,0,0,0.05)',
            marginTop: 'auto'
        }}>
            <div className="container">
                <div className="row g-4">
                    {/* Brand Column */}
                    <div className="col-lg-4 mb-4 mb-lg-0">
                        <div className="d-flex align-items-center mb-3">
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: '10px' }}>
                                <img src={logoImg} alt="OASIS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontFamily: 'ModernAge, sans-serif', fontSize: '1.5rem', fontWeight: 'bold', background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                OASIS
                            </span>
                        </div>
                        <p style={{ color: theme.colors.text.secondary, fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Una comunidad conectada por el propósito, la innovación y el servicio. Transformando vidas a través del amor.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div className="col-6 col-lg-2 offset-lg-1">
                        <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: theme.spacing(3), color: theme.colors.text.primary }}>Explorar</h5>
                        <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
                            <li className="mb-2"><a href="/" className="text-decoration-none text-secondary">Inicio</a></li>
                            <li className="mb-2"><a href="/about" className="text-decoration-none text-secondary">Nosotros</a></li>
                            <li className="mb-2"><a href="/live" className="text-decoration-none text-secondary">En Vivo</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="col-6 col-lg-2">
                        <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: theme.spacing(3), color: theme.colors.text.primary }}>Comunidad</h5>
                        <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
                            <li className="mb-2"><a href="/peticiones" className="text-decoration-none text-secondary">Peticiones</a></li>
                            <li className="mb-2"><a href="/recursos" className="text-decoration-none text-secondary">Recursos</a></li>
                            <li className="mb-2"><a href="/login" className="text-decoration-none text-secondary">Admin</a></li>
                        </ul>
                    </div>

                    {/* Social Column */}
                    <div className="col-lg-3">
                        <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: theme.spacing(3), color: theme.colors.text.primary }}>Síguenos</h5>
                        <div className="d-flex gap-3">
                            <a href="#" className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary }}>
                                <i className="bi bi-instagram"></i>
                            </a>
                            <a href="https://www.facebook.com/Iglesia7Oasis/" target="_blank" rel="noopener noreferrer" className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary }}>
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="https://www.youtube.com/@Iglesia7Oasis" target="_blank" rel="noopener noreferrer" className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary }}>
                                <i className="bi bi-youtube"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-5 pt-4 border-top">
                    <small style={{ color: theme.colors.text.secondary }}>
                        © 2026 OASIS Ecosystem. Todos los derechos reservados.
                    </small>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
