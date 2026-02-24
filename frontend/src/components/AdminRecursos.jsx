import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { theme } from '../react-ui/styles/theme';

const AdminRecursos = () => {
    const [resources, setResources] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        id: '', title: '', category: 'oasis', action_type: 'download', download_url: '', thumbnail_url: ''
    });
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const glassStyle = {
        background: theme.glass.background,
        backdropFilter: theme.glass.backdropFilter,
        border: theme.glass.border,
        borderRadius: theme.glass.borderRadius,
        boxShadow: theme.glass.boxShadow
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await apiClient.get('/resources');
            setResources(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await apiClient.put(`/resources/${formData.id}`, formData);
            } else {
                await apiClient.post('/resources', formData);
            }
            fetchResources();
            setShowForm(false);
            resetForm();
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este recurso?')) return;
        try {
            await apiClient.delete(`/resources/${id}`);
            fetchResources();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleEdit = (rec) => {
        setFormData(rec);
        setShowForm(true);
    };

    const resetForm = () => setFormData({ id: '', title: '', category: 'oasis', action_type: 'download', download_url: '', thumbnail_url: '' });

    return (
        <div className="container py-5 animate__animated animate__fadeIn">
            {/* Admin Navigation removed - handled by Layout */}

            <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm" style={glassStyle}>
                <div>
                    <h3 className="fw-bold mb-0" style={{ fontFamily: theme.fonts.logo, color: theme.colors.primary }}>Gestión de Stock</h3>
                    <p className="text-muted small mb-0">Administración institucional Oasis</p>
                </div>
                <button
                    className="btn rounded-pill px-4 shadow-sm fw-bold border-0 text-white"
                    style={{ background: theme.colors.primary }}
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                >
                    <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-2`}></i>
                    {showForm ? 'Cerrar' : 'Añadir Producto'}
                </button>
            </div>

            {showForm && (
                <div className="mb-4 shadow-lg p-4 border-0 rounded-4 animate__animated animate__fadeInDown" style={{ ...glassStyle, background: 'white' }}>
                    <h5 className="fw-bold mb-4 border-bottom pb-3">{formData.id ? 'Editar' : 'Registrar'} Recurso</h5>
                    <form onSubmit={handleSubmit} className="row g-4">
                        <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-2">Nombre</label>
                            <input
                                type="text" className="form-control" placeholder="Ej: Biblia PDF" required
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="small fw-bold text-muted mb-2">Categoría</label>
                            <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="oasis">💎 OASIS</option>
                                <option value="multimedia">📸 Multimedia</option>
                                <option value="adventista">⛪ Institucional</option>
                                <option value="utilidad">🛠️ Utilidad</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="small fw-bold text-muted mb-2">Tipo Acción</label>
                            <select className="form-select" value={formData.action_type} onChange={e => setFormData({ ...formData, action_type: e.target.value })}>
                                <option value="download">📥 Descarga</option>
                                <option value="link">🔗 Sitio Web</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-2">URL Destino</label>
                            <input
                                type="url" className="form-control" placeholder="https://..." required
                                value={formData.download_url} onChange={e => setFormData({ ...formData, download_url: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-2">URL Miniatura</label>
                            <input
                                type="url" className="form-control" placeholder="https://..."
                                value={formData.thumbnail_url || ''} onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                            />
                        </div>
                        <div className="col-12 text-end pt-3 border-top">
                            <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold text-white" style={{ background: theme.colors.primary }}>
                                GUARDAR STOCK
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card border-0 shadow-sm" style={glassStyle}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                        <thead className="bg-light">
                            <tr className="small text-uppercase">
                                <th className="ps-4 py-3">Recurso / Detalle</th>
                                <th>Tipo Acción</th>
                                <th className="text-end pe-4">Gestión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map(rec => (
                                <tr key={rec.id}>
                                    <td className="ps-4 py-3">
                                        <div className="d-flex align-items-center">
                                            <div className="me-3 shadow-sm border rounded bg-light" style={{ width: '45px', height: '45px', overflow: 'hidden' }}>
                                                {rec.thumbnail_url ? (
                                                    <img src={rec.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={rec.title} />
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted"><i className="bi bi-box-seam"></i></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark small">{rec.title}</div>
                                                <span className="badge rounded-pill bg-light text-primary border" style={{ fontSize: '0.65rem' }}>{rec.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${rec.action_type === 'download' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'} border px-3`}>
                                            <i className={`bi ${rec.action_type === 'download' ? 'bi-cloud-arrow-down' : 'bi-link-45deg'} me-1`}></i>
                                            {rec.action_type === 'download' ? 'Descarga' : 'Sitio Web'}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary border-0" onClick={() => handleEdit(rec)}><i className="bi bi-pencil-square"></i></button>
                                            <button className="btn btn-outline-danger border-0" onClick={() => handleDelete(rec.id)}><i className="bi bi-trash3"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {resources.length === 0 && <tr><td colSpan="3" className="text-center p-5 text-muted">Inventario vacío</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRecursos;
