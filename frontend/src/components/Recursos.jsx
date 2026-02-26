import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { theme } from '../react-ui/styles/theme';

const Recursos = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const glassStyle = {
        background: theme.glass.background,
        backdropFilter: theme.glass.backdropFilter,
        border: theme.glass.border,
        borderRadius: theme.glass.borderRadius,
        boxShadow: theme.glass.boxShadow,
        transition: 'transform 0.2s ease-in-out'
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const { data } = await apiClient.get('/resources');
            setResources(data || []);
        } catch (err) {
            setError('No pudimos cargar los recursos.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-3 text-muted">Sincronizando Stock...</p></div>;
    if (error) return <div className="text-center py-5 text-danger">{error}</div>;

    return (
        <div className="container py-4 px-3 animate__animated animate__fadeIn">
            <header className="text-center py-4">
                <h2 className="fw-bold mb-2" style={{ fontFamily: theme.fonts.logo, color: theme.colors.primary, letterSpacing: '4px', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
                    RECURSOS OASIS
                </h2>
                <div className="mx-auto rounded-pill mb-3" style={{ width: '60px', height: '4px', background: theme.colors.primary }}></div>
                <p className="text-muted small text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)' }}>
                    Material de alta gama para tu crecimiento espiritual
                </p>
            </header>

            <div className="row g-3 justify-content-center">
                {resources.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <i className="bi bi-cloud-slash display-1 text-muted opacity-25"></i>
                        <p className="text-muted mt-3">No hay materiales disponibles en este momento.</p>
                    </div>
                ) : (
                    resources.map(rec => (
                        <div key={rec.id} className="col-auto">
                            <div
                                className="card border-0 h-100 overflow-hidden"
                                style={{ ...glassStyle, width: '280px', cursor: 'pointer' }}
                                onClick={() => handleOpen(rec.download_url)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ height: '280px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {rec.thumbnail_url ? (
                                        <img src={rec.thumbnail_url} alt={rec.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <i className={`bi ${rec.action_type === 'download' ? 'bi-cloud-arrow-down-fill' : 'bi-arrow-up-right-circle-fill'}`} style={{ fontSize: '4rem', color: theme.colors.secondary }}></i>
                                    )}
                                </div>
                                <div className="card-body text-center p-3">
                                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem', color: theme.colors.text.primary }}>{rec.title.toUpperCase()}</h6>
                                    <p className="small mb-3" style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>{rec.category.toUpperCase()}</p>
                                    <button className="btn btn-sm rounded-pill px-3 fw-bold text-white shadow-sm" style={{ background: theme.colors.secondary, width: '100%' }}>
                                        <i className={`bi ${rec.action_type === 'download' ? 'bi-cloud-arrow-down-fill' : 'bi-arrow-up-right-circle-fill'} me-2`}></i>
                                        {rec.action_type === 'download' ? 'Descargar' : 'Ir al Sitio'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Recursos;
