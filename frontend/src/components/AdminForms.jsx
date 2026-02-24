/**
 * Componente AdminForms
 * --------------------
 * Gestor de formularios dinámicos para inscripciones de eventos.
 * Permite: 
 * 1. Crear estructuras de formulario personalizadas (Nombre, Correo, Archivos, etc.).
 * 2. Visualizar y exportar respuestas de los usuarios a formato Excel (CSV).
 */
const AdminForms = () => {
    // ESTADOS: Formularios, respuestas y control de edición
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingForm, setEditingForm] = useState(null);
    const [submissions, setSubmissions] = useState(null);
    const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null);

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
            const res = await apiClient.get('/admin/event-forms');
            setForms(res.data);
        } catch (e) { console.error('Error al cargar formularios:', e); }
        finally { setLoading(false); }
    };

    /**
     * Inicializa un nuevo formulario con campos básicos por defecto
     */
    const handleCreateNew = () => {
        setEditingForm({
            title: '',
            description: '',
            fields: [
                { id: Date.now(), label: 'Nombre Completo', type: 'text', required: true },
                { id: Date.now() + 1, label: 'Email', type: 'email', required: true }
            ],
            is_active: true
        });
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
        } catch (e) {
            alert('Error al guardar el formulario');
        }
    };

    /**
     * Borra permanentemente el formulario y sus inscripciones asociadas
     */
    const handleDeleteForm = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este formulario? Se borrarán también todas las respuestas.')) return;
        try {
            await apiClient.delete(`/admin/event-forms/${id}`);
            fetchForms();
        } catch (e) { console.error('Error al eliminar formulario:', e); }
    };

    /**
     * Obtiene todas las respuestas enviadas por los usuarios para un formulario específico
     */
    const fetchSubmissions = async (formId) => {
        try {
            const res = await apiClient.get('/admin/event-submissions', { params: { event_form_id: formId } });
            setSubmissions(res.data);
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
                    <div className="mb-3">
                        <label className="form-label fw-bold">Título del Evento</label>
                        <input type="text" className="form-control" value={editingForm.title} onChange={e => setEditingForm({ ...editingForm, title: e.target.value })} placeholder="Ej: Campamento de Verano 2026" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Descripción / Instrucciones</label>
                        <textarea className="form-control" rows="3" value={editingForm.description} onChange={e => setEditingForm({ ...editingForm, description: e.target.value })} placeholder="Información sobre el evento..." />
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
                                            const isFile = typeof val === 'string' && val.startsWith('/storage/submissions/');

                                            return (
                                                <td key={f.id}>
                                                    {isFile ? (
                                                        <a href={`${apiClient.defaults.baseURL.replace('/api', '')}${val}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-primary py-0 px-2 small">
                                                            <i className="bi bi-download me-1"></i>Ver Archivo
                                                        </a>
                                                    ) : (val || '—')}
                                                </td>
                                            );
                                        })}
                                        <td className="small text-muted">{new Date(sub.created_at).toLocaleString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm text-danger" onClick={async () => {
                                                if (window.confirm('¿Eliminar respuesta?')) {
                                                    await apiClient.delete(`/admin/event-submissions/${sub.id}`);
                                                    fetchSubmissions(viewingSubmissionsFor.id);
                                                }
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-0" style={{ fontFamily: theme.fonts.logo, color: theme.colors.primary }}>
                        <i className="bi bi-journal-check me-2"></i>Gestor de Inscripciones
                    </h3>
                    <p className="text-muted small mb-0">Crea formularios personalizados para tus eventos</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleCreateNew}>
                    <i className="bi bi-plus-lg me-2"></i>Nuevo Formulario
                </button>
            </div>

            <div className="row g-4">
                {forms.map(form => (
                    <div key={form.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden" style={glass}>
                            <div className="card-body p-4 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h5 className="fw-bold mb-0">{form.title}</h5>
                                    <div className={`badge ${form.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                        {form.is_active ? 'Activo' : 'Cerrado'}
                                    </div>
                                </div>
                                <p className="text-muted small flex-grow-1">{form.description || 'Sin descripción'}</p>
                                <div className="mt-3 pt-3 border-top d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => fetchSubmissions(form.id)}>
                                        <i className="bi bi-people me-1"></i>Ver Respuestas
                                    </button>
                                    <button className="btn btn-sm btn-light" onClick={() => setEditingForm(form)}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-sm btn-light text-danger" onClick={() => handleDeleteForm(form.id)}>
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
        </section>
    );
};

export default AdminForms;
