import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { theme } from '../styles/theme';
import GlassCard from '../components/GlassCard';
import FormViewer from '../components/FormViewer';

/**
 * Componente Inscripciones (Público)
 * ---------------------------------
 * Punto de entrada para que los usuarios se registren en eventos.
 * 1. Lista todos los formularios activos (/event-forms).
 * 2. Permite seleccionar un evento y renderiza el FormViewer para completar el registro.
 */
const Inscripciones = () => {
    // ESTADOS: Lista de eventos, evento seleccionado, y estados de flujo (carga/finalizado)
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        apiClient.get('/event-forms')
            .then(({ data }) => {
                setForms(data);
            })
            .catch(e => console.error('Error al cargar eventos:', e))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="container py-5 text-center" style={{ animation: 'fadeIn 0.5s ease' }}>
                <div className="display-1 mb-4">🎉</div>
                <h2 style={{ fontFamily: theme.fonts.titles, color: theme.colors.primary }}>¡Inscripción Exitosa!</h2>
                <p className="text-muted">Hemos recibido tus datos correctamente. ¡Nos vemos pronto!</p>
                <button className="btn btn-primary mt-4 rounded-pill px-5" onClick={() => { setFinished(false); setSelectedForm(null); }}>
                    Volver al listado
                </button>
            </div>
        );
    }

    return (
        <div className="container py-4 px-3">
            {selectedForm ? (
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8">
                        <button className="btn btn-link text-decoration-none text-muted p-0 mb-4" onClick={() => setSelectedForm(null)}>
                            <i className="bi bi-arrow-left me-2"></i>Volver al listado
                        </button>
                        <GlassCard className="glass-card" style={{ padding: theme.spacing(3) }}>
                            <FormViewer form={selectedForm} onComplete={() => setFinished(true)} />
                        </GlassCard>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-center mb-4">
                        <h1 style={{ fontFamily: theme.fonts.titles, fontSize: 'clamp(2rem, 6vw, 3.5rem)', marginBottom: theme.spacing(2), color: theme.colors.primary }}>
                            Próximos Eventos
                        </h1>
                        <p className="text-muted lead" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>Participa en nuestras actividades y vive la experiencia Oasis.</p>
                    </div>

                    <div className="row g-3 justify-content-center">
                        {forms.map(form => (
                            <div key={form.id} className="col-md-6 col-lg-4">
                                <GlassCard
                                    style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.3s ease' }}
                                    onClick={() => setSelectedForm(form)}
                                >
                                    <div className="d-flex flex-column h-100">
                                        <div style={{ width: 48, height: 48, background: theme.colors.primary + '10', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary, marginBottom: theme.spacing(3) }}>
                                            <i className="bi bi-calendar-event fs-4"></i>
                                        </div>
                                        <h4 className="fw-bold mb-3">{form.title}</h4>
                                        <p className="text-muted small flex-grow-1">{form.description}</p>
                                        <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                                            <span className="fw-bold text-primary small">Inscribirme ahora</span>
                                            <i className="bi bi-chevron-right text-primary"></i>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        ))}
                        {forms.length === 0 && (
                            <div className="text-center p-5 opacity-50">
                                <i className="bi bi-calendar-x display-4 mb-3"></i>
                                <h5>No hay eventos activos en este momento.</h5>
                                <p>Vuelve pronto para ver nuestras novedades.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
            <style>{`
                .glass-card:hover { transform: translateY(-5px); }
            `}</style>
        </div>
    );
};

export default Inscripciones;
