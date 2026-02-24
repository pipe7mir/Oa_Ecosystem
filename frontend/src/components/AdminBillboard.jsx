import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import GlassCard from '../react-ui/components/GlassCard';
import Button from '../react-ui/components/Button';
import { theme } from '../react-ui/styles/theme';

/**
 * Componente AdminBillboard
 * -------------------------
 * Interfaz administrativa para gestionar la cartelera (Hero).
 * Permite subir imágenes locales, vincular videos y organizar el orden de aparición.
 */
const AdminBillboard = () => {
    // ESTADOS: Datos de la cartelera, control de carga y edición
    const [billboards, setBillboards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        media_url: '',
        media_type: 'image',
        button_text: '',
        button_link: '',
        order: 1,
        is_active: true
    });

    useEffect(() => {
        fetchBillboards();
    }, []);

    /**
     * Obtiene la lista de diapositivas desde la API protegida del administrador
     */
    const fetchBillboards = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/admin/billboards');
            setBillboards(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Error al cargar la cartelera:', e);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Prepara el formulario para editar una diapositiva existente
     */
    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            media_url: item.media_url || '',
            media_type: item.media_type || 'image',
            button_text: item.button_text || '',
            button_link: item.button_link || '',
            order: item.order || 1,
            is_active: item.is_active
        });
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube el scroll para ver el formulario
    };

    /**
     * Limpia el formulario y resetea el estado de edición
     */
    const handleReset = () => {
        setEditingItem(null);
        setSelectedFile(null);
        setFormData({
            title: '',
            description: '',
            media_url: '',
            media_type: 'image',
            button_text: '',
            button_link: '',
            order: billboards.length + 1,
            is_active: true
        });
        // Reinicia manualmente el input de archivo
        const fileInput = document.getElementById('mediaFile');
        if (fileInput) fileInput.value = '';
    };

    /**
     * Envía los datos a la API (Creación o Actualización)
     * Utiliza FormData para soportar la carga de archivos de imagen.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        // Adjunta el archivo seleccionado si existe
        if (selectedFile) {
            data.append('media_file', selectedFile);
        }

        try {
            if (editingItem) {
                // Laravel requiere que los PUT con archivos se envíen vía POST con el parámetro _method=PUT
                data.append('_method', 'PUT');
                await apiClient.post(`/admin/billboards/${editingItem.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await apiClient.post('/admin/billboards', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchBillboards();
            handleReset();
            alert('¡Guardado exitosamente!');
        } catch (e) {
            console.error('Error al guardar:', e);
            alert('Error al guardar. Verifica que todos los campos sean correctos.');
        }
    };

    /**
     * Elimina una diapositiva permanentemente
     */
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este elemento?')) return;
        try {
            await apiClient.delete(`/admin/billboards/${id}`);
            fetchBillboards();
        } catch (e) {
            console.error('Error al eliminar:', e);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ fontFamily: 'ModernAge, sans-serif', color: theme.colors.primary }}>
                    <i className="bi bi-card-image me-2"></i>Gestor de Cartelera (Hero)
                </h2>
                {editingItem && (
                    <Button variant="outline" onClick={handleReset}>Cancelar Edición</Button>
                )}
            </div>

            <div className="row g-4">
                {/* Form Section */}
                <div className="col-lg-5">
                    <GlassCard style={{ padding: '40px' }}>
                        <h4 className="mb-4">{editingItem ? 'Editar Diapositiva' : 'Nueva Diapositiva'}</h4>
                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label small text-uppercase fw-bold">Título (Hero)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Bienvenido a OASIS"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label small text-uppercase fw-bold">Descripción</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Breve descripción del slide"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label small text-uppercase fw-bold">Tipo de Medio</label>
                                    <select
                                        className="form-select"
                                        value={formData.media_type}
                                        onChange={e => setFormData({ ...formData, media_type: e.target.value })}
                                    >
                                        <option value="image">Imagen</option>
                                        <option value="video">Enlace de Video (YouTube Embed/MP4)</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small text-uppercase fw-bold">Orden (1-5)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1" max="10"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="form-label small text-uppercase fw-bold">Imagen de Fondo (Local)</label>
                                <input
                                    type="file"
                                    id="mediaFile"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={e => {
                                        setSelectedFile(e.target.files[0]);
                                        if (e.target.files[0]) setFormData({ ...formData, media_type: 'image' });
                                    }}
                                />
                                <small className="text-primary d-block mt-1">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Dimensiones recomendadas: <strong>1920x1080px</strong> (Relación 16:9).
                                </small>
                            </div>
                            <div>
                                <label className="form-label small text-uppercase fw-bold text-muted">O URL de Imagen / Video</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="https://..."
                                    value={formData.media_url}
                                    onChange={e => setFormData({ ...formData, media_url: e.target.value })}
                                />
                                <small className="text-muted">Si subes un archivo, la URL se generará automáticamente.</small>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label small text-uppercase fw-bold">Texto Botón</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: Ver más"
                                        value={formData.button_text}
                                        onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small text-uppercase fw-bold">Link Botón</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="/inscripciones"
                                        value={formData.button_link}
                                        onChange={e => setFormData({ ...formData, button_link: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-check form-switch mt-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="isActive">Diapositiva Activa</label>
                            </div>
                            <Button type="submit" className="mt-3">
                                {editingItem ? 'Actualizar Cartelera' : 'Crear Nueva Cartelera'}
                            </Button>
                        </form>
                    </GlassCard>
                </div>

                {/* List Section */}
                <div className="col-lg-7">
                    <div className="row g-3">
                        {loading ? (
                            <div className="col-12 text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : billboards.length === 0 ? (
                            <div className="col-12 text-center py-5 text-muted">
                                No hay elementos en la cartelera. Crea el primero a la izquierda.
                            </div>
                        ) : billboards.map(item => (
                            <div key={item.id} className="col-12">
                                <GlassCard style={{ padding: '20px', borderLeft: `5px solid ${item.is_active ? theme.colors.primary : '#ccc'}` }}>
                                    <div className="d-flex gap-3">
                                        <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                                            {item.media_type === 'image' ? (
                                                <img src={item.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                                                    <i className="bi bi-play-circle-fill fs-3"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between">
                                                <h5 className="mb-1">{item.title || 'Sin Título'}</h5>
                                                <span className="badge bg-light text-dark">Slot {item.order}</span>
                                            </div>
                                            <p className="small text-muted mb-2 text-truncate" style={{ maxWidth: '300px' }}>{item.description || 'Sin descripción'}</p>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(item)}>Editar</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>Eliminar</button>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBillboard;
