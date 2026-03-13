import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Plus, X, Trash2, Pencil, CloudDownload, Link as LinkIcon, Box } from 'lucide-react';

const AdminRecursos = () => {
    const { theme, mode } = useTheme();
    const [resources, setResources] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [formData, setFormData] = useState({
        id: '', title: '', category: 'oasis', action_type: 'download', download_url: '', thumbnail_url: ''
    });
    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => {} });
    const location = useLocation();
    const navigate = useNavigate();

    const PURPLE_AMETHYST = '#6D28D9';

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
            const { data } = await apiClient.get('/resources');
            setResources(data || []);
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
            showToast('Recurso guardado', 'success');
        } catch (error) {
            showToast('Error al guardar: ' + error.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        setConfirmConfig({
            show: true, title: 'Eliminar Recurso', message: '¿Estás seguro de que deseas eliminar este recurso?', type: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/resources/${id}`);
                    fetchResources();
                    showToast('Recurso eliminado', 'success');
                } catch (error) {
                    showToast('Error al eliminar', 'error');
                }
                setConfirmConfig(p => ({ ...p, show: false }));
            }
        });
    };

    const handleEdit = (rec) => {
        setFormData(rec);
        setShowForm(true);
    };

    const handleExcelImport = async (file) => {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const ws = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
                
                const rows = json.slice(1);
                let count = 0;
                for (let row of rows) {
                    if (row[0] && row[3]) { // Título y URL obligatorios
                        await apiClient.post('/resources', {
                            title: row[0],
                            category: (row[1] || 'oasis').toLowerCase(),
                            action_type: (row[2] || 'download').toLowerCase(),
                            download_url: row[3],
                            thumbnail_url: row[4] || ''
                        });
                        count++;
                    }
                }
                fetchResources();
                showToast(`${count} archivos importados desde Excel`, 'success');
            };
            reader.readAsArrayBuffer(file);
        } catch (e) { showToast('Error procesando Excel', 'error'); }
    };

    const downloadTemplate = () => {
        const wsData = [
            ["Título", "Categoría (oasis/multimedia/adventista/utilidad)", "Tipo (download/link)", "URL Destino", "URL Miniatura (opcional)"],
            ["Himnario Adventista PDF", "adventista", "download", "https://ejemplo.com/himnario.pdf", "https://ejemplo.com/thumb.jpg"],
            ["Video Promocional", "multimedia", "link", "https://youtube.com/watch?v=123", ""],
            ["Logos Oasis Pack", "oasis", "download", "https://ejemplo.com/logos.zip", ""]
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "RecursosOasis");
        XLSX.writeFile(wb, "Plantilla_Recursos_Oasis.xlsx");
    };

    const resetForm = () => setFormData({ id: '', title: '', category: 'oasis', action_type: 'download', download_url: '', thumbnail_url: '' });

    return (
        <div className="container py-5 animate__animated animate__fadeIn">
            {/* Admin Navigation removed - handled by Layout */}

            <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm" style={glassStyle}>
                <div>
                    <h3 className="fw-bold mb-0" style={{ fontFamily: theme.fonts.accent, color: theme.colors.text.primary, fontSize: '2.2rem', textTransform: 'uppercase' }}>
                        Gestión de <span style={{ color: theme.colors.primary }}>Archivos</span>
                    </h3>
                    <p className="text-muted small mb-0">Administración institucional Oasis</p>
                </div>
                <button
                    className="btn rounded-pill px-4 shadow-sm fw-bold border-0 text-white d-flex align-items-center gap-2"
                    style={{ background: theme.colors.primary }}
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    {showForm ? 'Cerrar' : 'Añadir Producto'}
                </button>
            </div>

            {/* Batch Import Zone (Excel) */}
            <div className="row mb-5">
                <div className="col-12">
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files[0];
                            if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                                handleExcelImport(file);
                            } else {
                                showToast('Utiliza un archivo Excel (.xlsx)', 'warning');
                            }
                        }}
                        onClick={() => document.getElementById('excel-recursos-upload').click()}
                        className="p-5 text-center transition-all bg-white"
                        style={{ 
                            borderRadius: '24px',
                            border: `2px dashed ${isDragging ? PURPLE_AMETHYST : theme.colors.border}`,
                            background: isDragging ? `${PURPLE_AMETHYST}05` : 'white',
                            cursor: 'pointer',
                            boxShadow: theme.shadows.soft
                        }}
                    >
                        <input 
                            type="file" id="excel-recursos-upload" hidden accept=".xlsx, .xls" 
                            onChange={(e) => e.target.files[0] && handleExcelImport(e.target.files[0])} 
                        />
                        <div className="mb-3 d-inline-flex p-3 rounded-circle" style={{ background: `${PURPLE_AMETHYST}15` }}>
                            <Upload size={32} color={PURPLE_AMETHYST} />
                        </div>
                        <h5 className="fw-bold mb-2">Importación Masiva de Recursos</h5>
                        <p className="text-muted small mb-4">Sube tus archivos por lote usando nuestra plantilla oficial de Excel</p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); downloadTemplate(); }} 
                            className="btn rounded-pill px-4 fw-bold border-0 text-white" 
                            style={{ background: PURPLE_AMETHYST }}
                        >
                            <FileSpreadsheet size={18} className="me-2" /> Descargar Plantilla Excel
                        </button>
                    </div>
                </div>
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
                                        <span className={`badge border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2 ${rec.action_type === 'download' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'}`}>
                                            {rec.action_type === 'download' ? <CloudDownload size={14} /> : <LinkIcon size={14} />}
                                            {rec.action_type === 'download' ? 'Descarga' : 'Sitio Web'}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button className="btn btn-light rounded-circle p-2 shadow-sm border" onClick={() => handleEdit(rec)}><Pencil size={18} color={theme.colors.primary} /></button>
                                            <button className="btn btn-light rounded-circle p-2 shadow-sm border" onClick={() => handleDelete(rec.id)}><Trash2 size={18} color="#EF4444" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {resources.length === 0 && <tr><td colSpan="3" className="text-center p-5 text-muted">Inventario vacío</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <ConfirmationModal 
                show={confirmConfig.show}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(p => ({ ...p, show: false }))}
            />
        </div>
    );
};

export default AdminRecursos;
