import React, { useState } from 'react';
import apiClient from '../../api/client';
import { theme } from '../styles/theme';
import Button from './Button';

const FormViewer = ({ form, onComplete }) => {
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (label, value) => {
        setFormData(prev => ({ ...prev, [label]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const data = new FormData();
        data.append('event_form_id', form.id);

        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        try {
            await apiClient.post('/event-submissions', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onComplete && onComplete();
        } catch (e) {
            setError(e.response?.data?.message || 'Error al enviar la inscripción. Revisa que todos los campos obligatorios estén llenos.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontFamily: theme.fonts.titles, color: theme.colors.primary, marginBottom: theme.spacing(2) }}>
                {form.title}
            </h2>
            <p className="text-muted mb-4">{form.description}</p>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                {form.fields.map(field => (
                    <div key={field.id}>
                        <label className="form-label fw-bold small text-uppercase letter-spacing-1 mb-2">
                            {field.label} {field.required && <span className="text-danger">*</span>}
                        </label>

                        {field.type === 'textarea' ? (
                            <textarea
                                className="form-control"
                                rows="3"
                                required={field.required}
                                style={{ borderRadius: '12px', padding: '12px' }}
                                value={formData[field.label] || ''}
                                onChange={e => handleChange(field.label, e.target.value)}
                            />
                        ) : field.type === 'select' ? (
                            <select
                                className="form-select"
                                required={field.required}
                                style={{ borderRadius: '12px', padding: '12px' }}
                                value={formData[field.label] || ''}
                                onChange={e => handleChange(field.label, e.target.value)}
                            >
                                <option value="">Selecciona una opción...</option>
                                {field.options?.split(',').map(opt => (
                                    <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                ))}
                            </select>
                        ) : field.type === 'file' ? (
                            <input
                                type="file"
                                className="form-control"
                                required={field.required}
                                accept="image/*,application/pdf"
                                style={{ borderRadius: '12px', padding: '12px' }}
                                onChange={e => handleChange(field.label, e.target.files[0])}
                            />
                        ) : (
                            <input
                                type={field.type}
                                className="form-control"
                                required={field.required}
                                style={{ borderRadius: '12px', padding: '12px' }}
                                value={formData[field.label] || ''}
                                onChange={e => handleChange(field.label, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                {error && <div className="alert alert-danger mb-0">{error}</div>}

                <Button
                    type="submit"
                    disabled={submitting}
                    style={{ marginTop: theme.spacing(2), py: 3, fontSize: '1.1rem' }}
                >
                    {submitting ? 'Enviando...' : 'Completar Inscripción'}
                </Button>
            </form>
        </div>
    );
};

export default FormViewer;
