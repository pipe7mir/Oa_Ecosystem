
import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
/**
 * Componente AdminForms
 * --------------------
 * Gestor de formularios dinámicos para inscripciones de eventos.
 * Permite: 
 * 1. Crear estructuras de formulario personalizadas (Nombre, Correo, Archivos, etc.).
 * 2. Visualizar y exportar respuestas de los usuarios a formato Excel (CSV).
 * 3. Gestión de aforo y plantillas predefinidas.
 */

const EVENT_TEMPLATES = [
    {
        id: 'culto',
        name: 'Culto de Adoración',
        icon: 'bi-house-heart',
        color: '#4F46E5', // Indigo
        description: 'Ideal para servicios semanales y reuniones generales.',
        fields: [
            { id: 1, label: 'Nombre Completo', type: 'text', required: true },
            { id: 2, label: 'Correo Electrónico', type: 'email', required: true },
            { id: 3, label: 'Número de Acompañantes', type: 'number', required: true }
        ],
        capacity: 100
    },
    {
        id: 'camp',
        name: 'Campamento / Retiro',
        icon: 'bi-tree',
        color: '#10B981', // Emerald
        description: 'Formulario con campos de salud y contacto de emergencia.',
        fields: [
            { id: 1, label: 'Nombre Completo', type: 'text', required: true },
            { id: 2, label: 'Edad', type: 'number', required: true },
            { id: 3, label: 'Información Médica / Alergias', type: 'textarea', required: false },
            { id: 4, label: 'Contacto de Emergencia', type: 'text', required: true }
        ],
        capacity: 50
    },
    {
        id: 'concert',
        name: 'Concierto / Evento',
        icon: 'bi-music-note-beamed',
        color: '#F59E0B', // Amber
        description: 'Para eventos masivos con tipos de entrada.',
        fields: [
            { id: 1, label: 'Nombre Completo', type: 'text', required: true },
            { id: 2, label: 'Tipo de Entrada', type: 'select', required: true, options: 'General, VIP, Cortesía' }
        ],
        capacity: 200
    },
    {
        id: 'seminar',
        name: 'Seminario / Clase',
        icon: 'bi-mortarboard',
        color: '#8B5CF6', // Violet
        description: 'Enfoque profesional y académico.',
        fields: [
            { id: 1, label: 'Nombre Completo', type: 'text', required: true },
            { id: 2, label: 'Email', type: 'email', required: true },
            { id: 3, label: 'Profesión / Ocupación', type: 'text', required: false }
        ],
        capacity: 30
    }
];
const AdminForms = () => {
    const { theme, mode } = useTheme();
    // ESTADOS: Formularios, respuestas y control de edición
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingForm, setEditingForm] = useState(null);
    const [submissions, setSubmissions] = useState(null);
    const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null);
    const [selectingTemplate, setSelectingTemplate] = useState(false);
    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => {} });

    const glass = { background: theme.glass.background, backdropFilter: theme.glass.backdropFilter, border: theme.glass.border, borderRadius: theme.glass.borderRadius, boxShadow: theme.glass.boxShadow };

    useEffect(() => {
        fetchForms();
    }, []);

    /**
     * Obtiene todos los formularios creados por los administradores
     */
    const fetchForms = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/admin/event-forms');
            setForms(data || []);
        } catch (e) { console.error('Error al cargar formularios:', e); }
        finally { setLoading(false); }
    };

    /**
     * Inicializa un nuevo formulario con campos básicos por defecto
     */
    const handleCreateNew = () => {
        setSelectingTemplate(true);
    };

    const handleSelectTemplate = (template) => {
        setEditingForm({
            title: template.name,
            description: template.description,
            fields: template.fields.map(f => ({ ...f, id: Date.now() + Math.random() })),
            capacity: template.capacity,
            styles: { primaryColor: template.color, icon: template.icon },
            is_active: true
        });
        setSelectingTemplate(false);
    };

    const handleCustomTemplate = () => {
        setEditingForm({
            title: '',
            description: '',
            fields: [
                { id: Date.now(), label: 'Nombre Completo', type: 'text', required: true },
                { id: Date.now() + 1, label: 'Email', type: 'email', required: true }
            ],
            capacity: 0,
            styles: { primaryColor: theme.colors.primary, icon: 'bi-calendar-event' },
            is_active: true
        });
        setSelectingTemplate(false);
    };

    /**
     * Guarda el formulario dinámico en la base de datos (Backend procesa el JSON de campos)
     */
    const handleSaveForm = async () => {
        try {
            if (editingForm.id) {
                await apiClient.put(`/admin/event-forms/${editingForm.id}`, editingForm);
            } else {
                await apiClient.post('/admin/event-forms', editingForm);
            }
            setEditingForm(null);
            fetchForms();
            showToast('Formulario guardado', 'success');
        } catch (e) {
            showToast('Error al guardar el formulario: ' + e.message, 'error');
        }
    };

    /**
     * Borra permanentemente el formulario y sus inscripciones asociadas
     */
    const handleDeleteForm = async (id) => {
        setConfirmConfig({
            show: true, title: 'Eliminar Formulario', message: '¿Estás seguro de eliminar este formulario? Se borrarán también todas las respuestas.', type: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/admin/event-forms/${id}`);
                    fetchForms();
                    showToast('Formulario eliminado', 'success');
                } catch (e) {
                    showToast('Error al eliminar formulario', 'error');
                }
                setConfirmConfig(p => ({ ...p, show: false }));
            }
        });
    };

    /**
     * Obtiene todas las respuestas enviadas por los usuarios para un formulario específico
     */
    const fetchSubmissions = async (formId) => {
        try {
            const { data } = await apiClient.get('/admin/event-submissions');
            const filtered = (data || []).filter(s => s.eventForm && s.eventForm.id === formId);
            setSubmissions(filtered);
            setViewingSubmissionsFor(forms.find(f => f.id === formId));
        } catch (e) { console.error('Error al cargar inscripciones:', e); }
    };

    /**
     * Genera y descarga un archivo .CSV con los datos de las inscripciones
     */
    const exportToCSV = (data, filename) => {
        if (!data || !data.length) return;

        // Extraer todas las llaves (cabeceras) únicas del JSON de datos
        const fields = Array.from(new Set(data.flatMap(d => Object.keys(d.data))));
        const header = fields.join(',');
        const rows = data.map(d => fields.map(f => `"${d.data[f] || ''}"`).join(','));
        const csv = [header, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
    };

    if (editingForm) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0">{editingForm.id ? 'Editar Formulario' : 'Nuevo Formulario'}</h3>
                    <button className="btn btn-light" onClick={() => setEditingForm(null)}>Cancelar</button>
                </div>

                <div className="card border-0 shadow-sm p-4 mb-4" style={glass}>
                    <div className="row g-4">
                        <div className="col-md-8">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Título del Evento</label>
                                <input type="text" className="form-control" value={editingForm.title} onChange={e => setEditingForm({ ...editingForm, title: e.target.value })} placeholder="Ej: Campamento de Verano 2026" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Descripción / Instrucciones</label>
                                <textarea className="form-control" rows="3" value={editingForm.description} onChange={e => setEditingForm({ ...editingForm, description: e.target.value })} placeholder="Información sobre el evento..." />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold text-primary">Aforo Máximo</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-people-fill text-primary"></i></span>
                                    <input type="number" className="form-control border-start-0" value={editingForm.capacity} onChange={e => setEditingForm({ ...editingForm, capacity: parseInt(e.target.value) || 0 })} placeholder="0 = Ilimitado" />
                                </div>
                                <small className="text-muted">Cantidad máxima de personas permitidas.</small>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-success">Color de Identidad</label>
                                <div className="d-flex gap-2 align-items-center">
                                    <input type="color" className="form-control form-control-color border-0 p-0" style={{ width: '50px', height: '40px' }} value={editingForm.styles?.primaryColor || theme.colors.primary} onChange={e => setEditingForm({ ...editingForm, styles: { ...editingForm.styles, primaryColor: e.target.value } })} />
                                    <span className="small text-muted">{editingForm.styles?.primaryColor || theme.colors.primary}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h5 className="fw-bold mb-3">Campos del Formulario</h5>
                {editingForm.fields.map((field, index) => (
                    <div key={field.id} className="card border-0 shadow-sm p-3 mb-3" style={glass}>
                        <div className="row g-3">
                            <div className="col-md-5">
                                <label className="small fw-bold text-muted">Etiqueta del campo</label>
                                <input type="text" className="form-control form-control-sm" value={field.label} onChange={e => {
                                    const newFields = [...editingForm.fields];
                                    newFields[index].label = e.target.value;
                                    setEditingForm({ ...editingForm, fields: newFields });
                                }} />
                            </div>
                            <div className="col-md-3">
                                <label className="small fw-bold text-muted">Tipo</label>
                                <select className="form-select form-select-sm" value={field.type} onChange={e => {
                                    const newFields = [...editingForm.fields];
                                    newFields[index].type = e.target.value;
                                    setEditingForm({ ...editingForm, fields: newFields });
                                }}>
                                    <option value="text">Texto</option>
                                    <option value="email">Email</option>
                                    <option value="number">Número</option>
                                    <option value="date">Fecha</option>
                                    <option value="textarea">Área de texto</option>
                                    <option value="select">Selección (Dropdown)</option>
                                    <option value="file">Archivo (PDF/Foto)</option>
                                </select>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <div className="form-check mb-2">
                                    <input className="form-check-input" type="checkbox" checked={field.required} onChange={e => {
                                        const newFields = [...editingForm.fields];
                                        newFields[index].required = e.target.checked;
                                        setEditingForm({ ...editingForm, fields: newFields });
                                    }} id={`req-${field.id}`} />
                                    <label className="form-check-label small" htmlFor={`req-${field.id}`}>Obligatorio</label>
                                </div>
                            </div>
                            <div className="col-md-2 d-flex align-items-end justify-content-end">
                                <button className="btn btn-sm btn-outline-danger border-0" onClick={() => {
                                    const newFields = editingForm.fields.filter((_, i) => i !== index);
                                    setEditingForm({ ...editingForm, fields: newFields });
                                }}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                        {field.type === 'select' && (
                            <div className="mt-2">
                                <label className="small fw-bold text-muted">Opciones (separadas por coma)</label>
                                <input type="text" className="form-control form-control-sm" value={field.options || ''} onChange={e => {
                                    const newFields = [...editingForm.fields];
                                    newFields[index].options = e.target.value;
                                    setEditingForm({ ...editingForm, fields: newFields });
                                }} placeholder="Opción 1, Opción 2, Opción 3" />
                            </div>
                        )}
                    </div>
                ))}

                <div className="d-grid gap-2 mt-4">
                    <button className="btn btn-outline-primary border-dashed" onClick={() => {
                        setEditingForm({
                            ...editingForm,
                            fields: [...editingForm.fields, { id: Date.now(), label: 'Nuevo Campo', type: 'text', required: false }]
                        });
                    }}>
                        <i className="bi bi-plus-circle me-2"></i>Añadir Campo
                    </button>
                    <button className="btn btn-primary btn-lg mt-3" onClick={handleSaveForm}>
                        Guardar Formulario
                    </button>
                </div>
            </div>
        );
    }

    if (selectingTemplate) {
        return (
            <div className="container py-5 mt-4">
                <div className="text-center mb-5">
                    <h2 className="fw-bold">Elige una Plantilla</h2>
                    <p className="text-muted">Ahorra tiempo iniciando con una estructura diseñada para tu tipo de evento.</p>
                </div>
                <div className="row g-4 justify-content-center">
                    {EVENT_TEMPLATES.map(t => (
                        <div key={t.id} className="col-md-6 col-lg-3">
                            <div 
                                className="card h-100 border-0 shadow-sm text-center p-4 template-card" 
                                style={{ ...glass, cursor: 'pointer', transition: 'all 0.3s' }}
                                onClick={() => handleSelectTemplate(t)}
                            >
                                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" 
                                     style={{ width: '64px', height: '64px', background: t.color + '15', borderRadius: '16px', color: t.color }}>
                                    <i className={`bi ${t.icon} fs-2`}></i>
                                </div>
                                <h5 className="fw-bold mb-2">{t.name}</h5>
                                <p className="small text-muted flex-grow-1">{t.description}</p>
                                <button className="btn btn-sm w-100 mt-2 rounded-pill" style={{ background: t.color, color: 'white' }}>Seleccionar</button>
                            </div>
                        </div>
                    ))}
                    <div className="col-md-6 col-lg-3">
                        <div 
                            className="card h-100 border-0 shadow-sm text-center p-4 template-card" 
                            style={{ ...glass, border: '2px dashed #ddd', background: 'transparent', cursor: 'pointer' }}
                            onClick={handleCustomTemplate}
                        >
                            <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" 
                                 style={{ width: '64px', height: '64px', background: 'rgba(0,0,0,0.05)', borderRadius: '16px', color: '#666' }}>
                                <i className="bi bi-gear-wide-distributed fs-2"></i>
                            </div>
                            <h5 className="fw-bold mb-2">Personalizado</h5>
                            <p className="small text-muted flex-grow-1">Crea un formulario desde cero con tus propios campos.</p>
                            <button className="btn btn-sm btn-outline-secondary w-100 mt-2 rounded-pill">Empezar</button>
                        </div>
                    </div>
                    <div className="col-12 text-center mt-5">
                        <button className="btn btn-link text-muted" onClick={() => setSelectingTemplate(false)}>Volver a la gestión</button>
                    </div>
                </div>
                <style>{`
                    .template-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; border-color: ${theme.colors.primary} !important; }
                `}</style>
            </div>
        );
    }

    if (viewingSubmissionsFor) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-0">Respuestas: {viewingSubmissionsFor.title}</h3>
                        <p className="text-muted mb-0">{submissions?.length || 0} inscripciones recibidas</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-success" onClick={() => exportToCSV(submissions, `inscripciones_${viewingSubmissionsFor.title}`)}>
                            <i className="bi bi-file-earmark-spreadsheet me-2"></i>Exportar Excel (CSV)
                        </button>
                        <button className="btn btn-light" onClick={() => setViewingSubmissionsFor(null)}>Volver</button>
                    </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={glass}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    {viewingSubmissionsFor.fields.map(f => <th key={f.id}>{f.label}</th>)}
                                    <th>Fecha</th>
                                    <th className="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions?.map(sub => (
                                    <tr key={sub.id}>
                                        {viewingSubmissionsFor.fields.map(f => {
                                            const val = sub.data[f.label];
                                            const isFile = typeof val === 'string' && (val.includes('http') && val.includes('/uploads/'));

                                            return (
                                                <td key={f.id}>
                                                    {isFile ? (
                                                        <a href={val} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-primary py-0 px-2 small">
                                                            <i className="bi bi-download me-1"></i>Ver Archivo
                                                        </a>
                                                    ) : (val || '—')}
                                                </td>
                                            );
                                        })}
                                        <td className="small text-muted">{new Date(sub.created_at).toLocaleString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm text-danger" onClick={() => {
                                                setConfirmConfig({
                                                    show: true, title: 'Eliminar Respuesta', message: '¿Estás seguro de eliminar esta respuesta?', type: 'danger',
                                                    onConfirm: async () => {
                                                        try {
                                                            await apiClient.delete(`/admin/event-submissions/${sub.id}`);
                                                            fetchSubmissions(viewingSubmissionsFor.id);
                                                            showToast('Respuesta eliminada', 'success');
                                                        } catch (e) {
                                                            showToast('Error al eliminar respuesta', 'error');
                                                        }
                                                        setConfirmConfig(p => ({ ...p, show: false }));
                                                    }
                                                });
                                            }}>Borrar</button>
                                        </td>
                                    </tr>
                                ))}
                                {(!submissions || submissions.length === 0) && (
                                    <tr><td colSpan={viewingSubmissionsFor.fields.length + 2} className="text-center p-5 text-muted">Aún no hay inscripciones.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm"
                style={{
                    background: theme.glass.background,
                    backdropFilter: theme.glass.backdropFilter,
                    border: theme.glass.border,
                    borderRadius: theme.glass.borderRadius,
                    boxShadow: theme.glass.boxShadow
                }}>
                <div>
                    <h3 className="fw-bold mb-0" style={{ fontFamily: theme.fonts.accent, color: theme.colors.text.primary, fontSize: '2.2rem', textTransform: 'uppercase' }}>
                        Gestión de <span style={{ color: theme.colors.primary }}>Eventos</span>
                    </h3>
                    <p className="text-muted small mb-0">Crea formularios personalizados para tus eventos</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleCreateNew} style={{ background: theme.colors.primary, border: 'none' }}>
                    <i className="bi bi-plus-lg me-2"></i>Nuevo Formulario
                </button>
            </div>

            <div className="row g-4">
                {forms.map(form => (
                    <div key={form.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden" style={{ ...glass, borderLeft: `5px solid ${form.styles?.primaryColor || theme.colors.primary}` }}>
                            <div className="card-body p-4 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex gap-2 align-items-center">
                                        <div style={{ width: 36, height: 36, background: (form.styles?.primaryColor || theme.colors.primary) + '15', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: form.styles?.primaryColor || theme.colors.primary }}>
                                            <i className={`bi ${form.styles?.icon || 'bi-calendar-event'} fs-5`}></i>
                                        </div>
                                        <h5 className="fw-bold mb-0">{form.title}</h5>
                                    </div>
                                    <div className={`badge ${form.is_active ? 'bg-success' : 'bg-secondary'}`} style={{ borderRadius: '50px', padding: '5px 12px' }}>
                                        {form.is_active ? 'Activo' : 'Cerrado'}
                                    </div>
                                </div>
                                <p className="text-muted small flex-grow-1 mb-4">{form.description || 'Sin descripción'}</p>
                                
                                {/* Resumen de Aforo */}
                                <div className="bg-light p-3 rounded-3 mb-4 border-0">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-bold">Inscritos</span>
                                        <span className="small">{form.submissionCount} {form.capacity > 0 ? `/ ${form.capacity}` : ''}</span>
                                    </div>
                                    {form.capacity > 0 ? (
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div className="progress-bar rounded-pill" style={{ 
                                                width: `${Math.min((form.submissionCount / form.capacity) * 100, 100)}%`,
                                                background: (form.submissionCount / form.capacity) >= 0.9 ? theme.colors.danger : (form.styles?.primaryColor || theme.colors.primary) 
                                            }}></div>
                                        </div>
                                    ) : (
                                        <small className="text-muted">Aforo ilimitado</small>
                                    )}
                                </div>

                                <div className="mt-auto pt-3 border-top d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-primary flex-grow-1 rounded-pill" onClick={() => fetchSubmissions(form.id)}>
                                        <i className="bi bi-people me-1"></i>Resultados
                                    </button>
                                    <button className="btn btn-sm btn-light rounded-circle p-0" style={{ width: '32px', height: '32px' }} onClick={() => setEditingForm(form)}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-sm btn-light text-danger rounded-circle p-0" style={{ width: '32px', height: '32px' }} onClick={() => handleDeleteForm(form.id)}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && <div className="text-center p-5"><div className="spinner-border" style={{ color: theme.colors.primary }}></div></div>}
            {!loading && forms.length === 0 && (
                <div className="text-center p-5 mt-4 rounded-4" style={{ background: 'rgba(0,0,0,0.02)', border: '2px dashed #ddd' }}>
                    <i className="bi bi-journal-x fs-1 opacity-25 d-block mb-3"></i>
                    <h5 className="text-muted">No has creado ningún formulario todavía</h5>
                    <button className="btn btn-primary mt-2" onClick={handleCreateNew}>Crear mi primer formulario</button>
                </div>
            )}
            <ConfirmationModal 
                show={confirmConfig.show}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(p => ({ ...p, show: false }))}
            />
        </section>
    );
};

export default AdminForms;
