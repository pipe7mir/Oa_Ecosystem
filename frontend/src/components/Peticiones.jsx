import React, { useState } from 'react';
import apiClient from '../api/client';
import { theme } from '../react-ui/styles/theme';

const Peticiones = () => {
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [category, setCategory] = useState(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        celular: '',
        descripcion: ''
    });

    // Glassmorphism Style Helper
    const glassStyle = {
        background: theme.glass.background,
        backdropFilter: theme.glass.backdropFilter,
        border: theme.glass.border,
        borderRadius: theme.glass.borderRadius,
        boxShadow: theme.glass.boxShadow,
        color: theme.colors.text.primary
    };

    const categories = [
        { title: 'Oración', icon: 'bi-hands-pray', sub: 'Apoyo espiritual' },
        { title: 'Visitación', icon: 'bi-house-heart', sub: 'Solicitud al hogar' },
        { title: 'Traslado', icon: 'bi-file-earmark-arrow-up', sub: 'Feligresía' },
        { title: 'Ayuda Social', icon: 'bi-heart-pulse', sub: 'Apoyo en necesidad' },
        { title: 'Hospitales', icon: 'bi-hospital', sub: 'Visita médica' },
        { title: 'Eventos', icon: 'bi-calendar-check', sub: 'Inscripciones' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                category,
                description: formData.descripcion,
                is_anonymous: isAnonymous,
                contact_name: isAnonymous ? 'Anónimo' : formData.nombre,
                contact_phone: isAnonymous ? 'N/A' : formData.celular
            };

            await apiClient.post('/requests', payload);
            setSuccess(true);
        } catch (error) {
            alert('Error al enviar la solicitud: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container py-5 text-center animate__animated animate__bounceIn">
                <div style={{ ...glassStyle, padding: theme.spacing(6), maxWidth: '600px', margin: '0 auto' }}>
                    <i className="bi bi-check-circle-fill" style={{ fontSize: '5rem', color: theme.colors.success }}></i>
                    <h2 className="mt-4 fw-bold" style={{ fontFamily: theme.fonts.logo }}>¡Petición de {category} enviada!</h2>
                    <p className="text-muted">Hemos recibido tu solicitud. Un líder de OASIS se pondrá en contacto contigo si así lo solicitaste.</p>
                    <button
                        className="btn text-white px-5 mt-3 rounded-pill fw-bold"
                        style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
                        onClick={() => {
                            setSuccess(false);
                            setCategory(null);
                            setFormData({ nombre: '', celular: '', descripcion: '' });
                        }}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!privacyAccepted) {
        return (
            <section className="container py-5 animate__animated animate__fadeIn">
                <div style={{ ...glassStyle, padding: theme.spacing(6), maxWidth: '600px', margin: '0 auto' }} className="text-center">
                    <i className="bi bi-shield-lock text-primary mb-4" style={{ fontSize: '4rem', color: theme.colors.primary }}></i>
                    <h2 className="fw-bold mb-3" style={{ fontFamily: theme.fonts.logo }}>Protección de Datos</h2>
                    <p className="text-muted mb-4">
                        En la Iglesia OASIS valoramos tu privacidad. Para procesar tu solicitud, necesitamos tu autorización para el tratamiento de datos personales conforme a la Ley 1581 de 2012.
                    </p>
                    <div className="d-grid gap-2">
                        <button
                            className="btn text-white py-3 rounded-pill fw-bold"
                            style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
                            onClick={() => setPrivacyAccepted(true)}
                        >
                            AUTORIZO EL TRATAMIENTO
                        </button>
                        <button className="btn btn-light py-2 rounded-pill text-muted">
                            No acepto, volver al inicio
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (!category) {
        return (
            <section className="container py-5">
                <div className="text-center mb-5 animate__animated animate__fadeInDown">
                    <h2 style={{ fontFamily: theme.fonts.logo, color: theme.colors.primary }} className="fw-bold">
                        ¿En qué podemos apoyarte hoy?
                    </h2>
                    <p className="text-muted">Selecciona una categoría para iniciar tu solicitud</p>
                </div>
                <div className="row g-4 justify-content-center animate__animated animate__fadeInUp">
                    {categories.map((cat) => (
                        <div key={cat.title} className="col-6 col-md-4 col-lg-2">
                            <div
                                className="text-center p-3 h-100 d-flex flex-column align-items-center justify-content-center"
                                style={{
                                    ...glassStyle,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onClick={() => setCategory(cat.title)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <i className={`bi ${cat.icon} mb-2`} style={{ fontSize: '2rem', color: theme.colors.secondary }}></i>
                                <span className="fw-bold d-block" style={{ fontSize: '0.9rem' }}>{cat.title}</span>
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>{cat.sub}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="container py-5 animate__animated animate__zoomIn">
            <div className="col-lg-7 mx-auto">
                <div style={{ ...glassStyle, overflow: 'hidden' }}>
                    <div className="p-4 text-white" style={{ background: theme.colors.primary }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="mb-0 fw-bold fs-4">Solicitud de {category}</h3>
                            <button className="btn-close btn-close-white" onClick={() => setCategory(null)}></button>
                        </div>
                    </div>
                    <div className="p-4 p-md-5">
                        <form onSubmit={handleSubmit}>
                            <p className="text-center text-muted small mb-4">Tu información será tratada con confidencialidad.</p>

                            <div className="mb-4">
                                <div className="btn-group w-100 shadow-sm rounded-pill overflow-hidden" role="group">
                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="anonimo"
                                        id="modo1"
                                        checked={!isAnonymous}
                                        onChange={() => setIsAnonymous(false)}
                                    />
                                    <label className="btn btn-outline-primary" htmlFor="modo1">
                                        <i className="bi bi-person-check me-2"></i>Con mis datos
                                    </label>

                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="anonimo"
                                        id="modo2"
                                        checked={isAnonymous}
                                        onChange={() => setIsAnonymous(true)}
                                    />
                                    <label className="btn btn-outline-primary" htmlFor="modo2">
                                        <i className="bi bi-incognito me-2"></i>Anónimo
                                    </label>
                                </div>
                            </div>

                            {!isAnonymous && (
                                <div className="row g-3 mb-3 animate__animated animate__fadeIn">
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            className="form-control rounded-pill px-4 bg-light border-0"
                                            placeholder="Nombre completo"
                                            required
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="tel"
                                            className="form-control rounded-pill px-4 bg-light border-0"
                                            placeholder="WhatsApp"
                                            required
                                            value={formData.celular}
                                            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <textarea
                                    className="form-control rounded-4 p-4 bg-light border-0"
                                    rows="4"
                                    placeholder="Escribe aquí los detalles..."
                                    required
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="btn w-100 py-3 rounded-pill fw-bold text-white shadow"
                                style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'ENVIAR AHORA'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Peticiones;
