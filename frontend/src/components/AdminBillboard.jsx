import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import { uploadToCloudinary } from '../api/cloudinary';
import GlassCard from '../react-ui/components/GlassCard';
import Button from '../react-ui/components/Button';
import { useToast } from '../react-ui/components/Toast';
import * as LucideIcons from 'lucide-react';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import { useTheme } from '../react-ui/ThemeContext';

const {
    Check, Trash2, ListChecks, Square, CheckSquare, X, Play, Image, Pencil, Plus, Trash, ExternalLink, Move
} = LucideIcons;

const AdminBillboard = () => {
    const { theme } = useTheme();

    const billboardStyles = `
    @keyframes oasisFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .admin-billboard-input {
        background: ${theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'} !important;
        border-radius: 12px !important;
        border: 1px solid ${theme.colors.border} !important;
        padding: 14px 18px !important;
        color: ${theme.colors.text.primary} !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        font-family: 'Inter', sans-serif !important;
    }
    .admin-billboard-input:focus {
        background: ${theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} !important;
        border-color: ${theme.colors.primary} !important;
        box-shadow: 0 0 0 4px ${theme.colors.primary}22 !important;
        outline: none !important;
    }
    .admin-billboard-label {
        display: block;
        font-size: 0.8rem;
        font-weight: 700;
        color: ${theme.colors.primary};
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    `;
    // ESTADOS
    const [billboards, setBillboards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showGallery, setShowGallery] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [livePreviewMode, setLivePreviewMode] = useState(true);
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null
    });
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        media_url: '',
        media_type: 'image',
        button_text: '',
        button_link: '',
        order: 1,
        is_active: true,
        styles: {}
    });

    const [styleEditor, setStyleEditor] = useState({
        titleColor: '#ffffff',
        titleFont: 'ModernAge, sans-serif',
        titleSize: '3.5rem',
        descColor: '#ffffff',
        descFont: 'AdventSans, sans-serif',
        descSize: '1.25rem',
        overlayOpacity: 0.7,
        textOpacity: 1,
        iconName: '',
        iconSize: '40',
        iconColor: '#ffffff',
    });

    const FONT_OPTIONS = [
        { label: 'Modern Age (Default)', value: 'ModernAge, sans-serif' },
        { label: 'Advent Sans', value: 'AdventSans, sans-serif' },
        { label: 'Moon Rising', value: 'MoonRising, sans-serif' },
        { label: 'Inter', value: 'Inter, sans-serif' },
        { label: 'Outfit', value: 'Outfit, sans-serif' },
        { label: 'Georgia', value: 'Georgia, serif' },
    ];

    const ICON_OPTIONS = [
        { name: 'Ninguno', value: '' },
        { name: 'Sol', value: 'Sun' },
        { name: 'Nube', value: 'Cloud' },
        { name: 'Luna', value: 'Moon' },
        { name: 'Corazón', value: 'Heart' },
        { name: 'Estrella', value: 'Star' },
        { name: 'Rayo', value: 'Zap' },
        { name: 'Cruz', value: 'Cross' },
        { name: 'Hoja', value: 'Leaf' },
        { name: 'Montaña', value: 'Mountain' },
        { name: 'Música', value: 'Music' },
        { name: 'Viento', value: 'Wind' },
        { name: 'Gota', value: 'Droplets' },
    ];

    // Galería estática Categorizada
    const [categorizedGallery] = useState({
        'Naturaleza & Paisajes': [
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80',
            'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=80',
            'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',
        ],
        'Clima & Cielo': [
            'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1920&q=80',
            'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=80',
            'https://images.unsplash.com/photo-1464802686167-b939a67e06a1?w=1920&q=80',
            'https://images.unsplash.com/photo-1514632595-4944383f2737?w=1920&q=80',
            'https://images.unsplash.com/photo-1534088568595-a066f7104218?w=1920&q=80',
            'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1920&q=80',
        ],
        'Fe & Arquitectura': [
            'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80',
            'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=1920&q=80',
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80',
            'https://images.unsplash.com/photo-1491153049914-d5399639ae52?w=1920&q=80',
            'https://images.unsplash.com/photo-1548625313-04249f658dc1?w=1920&q=80',
        ],
        'Abstracción & Fondos': [
            'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80',
            'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
            'https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=1920&q=80',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80',
        ]
    });

    useEffect(() => {
        fetchBillboards();
    }, []);

    const fetchBillboards = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/billboards');
            setBillboards(response.data.sort((a, b) => a.order - b.order));
        } catch (e) {
            console.error('Error al cargar billboards:', e);
            showToast('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const normalizeMediaUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('uploads/')) return `${apiClient.defaults.baseURL.replace('/api', '')}/${url}`;
        return url;
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            ...item,
            styles: item.styles || {}
        });
        if (item.styles) {
            setStyleEditor(prev => ({ ...prev, ...item.styles }));
        }
        setPreviewUrl(normalizeMediaUrl(item.media_url));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        setConfirmModal({
            show: true,
            title: '¿Eliminar Slide?',
            message: 'Esta acción no se puede deshacer y el contenido desaparecerá del sitio principal.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/admin/billboards/${id}`);
                    showToast('Slide eliminado correctamente', 'success');
                    fetchBillboards();
                    setConfirmModal(prev => ({ ...prev, show: false }));
                } catch (e) {
                    showToast('Error al eliminar', 'error');
                }
            }
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setConfirmModal({
            show: true,
            title: '¿Eliminar selección?',
            message: `Vas a eliminar ${selectedIds.length} diapositivas permanentemente.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    const response = await apiClient.post('/admin/billboards/bulk-delete', { ids: selectedIds });
                    if (response.data.success) {
                        showToast('Elementos eliminados correctamente', 'success');
                        setSelectedIds([]);
                        fetchBillboards();
                        setConfirmModal(prev => ({ ...prev, show: false }));
                    } else {
                        showToast('Error: ' + (response.data.message || 'No se pudo completar'), 'error');
                    }
                } catch (e) {
                    showToast('Error en eliminación por lotes', 'error');
                }
            }
        });
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === billboards.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(billboards.map(b => b.id));
        }
    };

    const handleSelectFromGallery = (url) => {
        setFormData({ ...formData, media_url: url, media_type: 'image' });
        setPreviewUrl(url);
        setShowGallery(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let mediaUrlToSave = formData.media_url;

            if (selectedFile) {
                console.log('🚀 Iniciando subida a Cloudinary...');
                const uploadRes = await uploadToCloudinary(selectedFile);
                mediaUrlToSave = uploadRes.secure_url;
            }

            const dataToSave = {
                ...formData,
                media_url: mediaUrlToSave,
                styles: styleEditor
            };

            if (editingItem) {
                await apiClient.put(`/admin/billboards/${editingItem.id}`, dataToSave);
            } else {
                await apiClient.post('/admin/billboards', dataToSave);
            }

            showToast('¡Guardado exitosamente!', 'success');
            resetForm();
            fetchBillboards();
        } catch (e) {
            console.error('Error al guardar:', e);
            showToast('Error al guardar: ' + (e.response?.data?.message || e.message), 'error');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            description: '',
            media_url: '',
            media_type: 'image',
            button_text: '',
            button_link: '',
            order: 1,
            is_active: true,
            styles: {}
        });
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    const renderLivePreview = () => {
        const displayUrl = previewUrl || (formData.media_url ? normalizeMediaUrl(formData.media_url) : '');

        return (
            <motion.div
                layout
                style={{
                    width: '100%',
                    height: '400px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#000',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    border: `1px solid rgba(255,255,255,0.1)`
                }}
            >
                {/* Background */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: displayUrl ? `url(${displayUrl})` : 'linear-gradient(to bottom, #0a0a0f, #1a1a2e)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    transition: 'all 0.5s ease'
                }} />

                {/* Overlay */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: `linear-gradient(to right, rgba(0,0,0,${styleEditor.overlayOpacity + 0.1}) 0%, rgba(0,0,0,${styleEditor.overlayOpacity - 0.2}) 100%)`
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative', zIndex: 2, height: '100%',
                    display: 'flex', alignItems: 'center', padding: '0 40px'
                }}>
                        <div style={{ opacity: styleEditor.textOpacity, transition: 'opacity 0.3s' }}>
                            {styleEditor.iconName && (
                                <div className="mb-3" style={{ color: styleEditor.iconColor }}>
                                    {React.createElement(
                                        LucideIcons[styleEditor.iconName] || LucideIcons.Star, 
                                        { size: parseInt(styleEditor.iconSize) }
                                    )}
                                </div>
                            )}
                            <h2 style={{
                                color: styleEditor.titleColor,
                                fontFamily: styleEditor.titleFont,
                                fontSize: `clamp(1.5rem, 5vw, ${styleEditor.titleSize})`,
                                fontWeight: 'bold',
                                lineHeight: 1.1,
                                marginBottom: '1rem',
                                textShadow: '0 4px 12px rgba(0,0,0,0.5)'
                            }}>
                                {formData.title || 'Título de ejemplo'}
                            </h2>
                            <p style={{
                                color: styleEditor.descColor,
                                fontFamily: styleEditor.descFont,
                                fontSize: styleEditor.descSize,
                                opacity: 1,
                                marginBottom: '1.5rem',
                                textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                            }}>
                                {formData.description || 'Esta es una descripción de ejemplo para el Hero.'}
                            </p>
                        </div>
                        {formData.button_text && (
                            <button style={{
                                padding: '12px 28px',
                                borderRadius: '12px',
                                border: 'none',
                                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                color: '#fff',
                                fontWeight: 'bold'
                            }}>
                                {formData.button_text}
                            </button>
                        )}
                    </div>

                <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                    padding: '6px 12px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontWeight: 600
                }}>
                    LIVE PREVIEW
                </div>
            </motion.div>
        );
    };

    return (
        <div style={{ padding: '0', maxWidth: '100%', margin: '0 auto', color: theme.colors.text.primary }}>
            <style>{billboardStyles}</style>

            {/* Header Area Area */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3 p-4 rounded-4 shadow-sm"
                style={{
                    background: theme.glass.background,
                    backdropFilter: theme.glass.backdropFilter,
                    border: theme.glass.border,
                    borderRadius: theme.glass.borderRadius,
                    boxShadow: theme.glass.boxShadow
                }}>
                <div>
                    <h1 style={{
                        fontWeight: '900',
                        fontFamily: theme.fonts.accent,
                        fontSize: '2.2rem',
                        letterSpacing: '1px',
                        marginBottom: '8px',
                        color: theme.colors.text.primary,
                        textTransform: 'uppercase'
                    }}>
                        Gestión <span style={{ color: theme.colors.primary }}>Cartelera</span>
                    </h1>
                    <p style={{ color: theme.colors.text.secondary, margin: 0, fontWeight: 500, fontSize: '1.1rem' }}>
                        Diseña la experiencia visual de bienvenida en Oasis.
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        onClick={toggleSelectAll}
                        style={{ 
                            borderRadius: '16px', padding: '12px 20px', 
                            fontWeight: '700', fontSize: '0.9rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.text.primary,
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {selectedIds.length === billboards.length ? <CheckSquare size={18} /> : <Square size={18} />}
                        {selectedIds.length === billboards.length ? 'Desmarcar' : 'Seleccionar'}
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{ 
                            borderRadius: '16px', padding: '12px 20px', 
                            fontWeight: '700', fontSize: '0.9rem',
                            background: theme.colors.primary,
                            border: 'none',
                            color: '#fff',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            boxShadow: `0 8px 24px ${theme.colors.primary}33`
                        }}
                    >
                        <ExternalLink size={18} /> Sitio
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* Form & Styling */}
                <div className="col-lg-7">
                    <div className="d-flex flex-column gap-4">
                        {/* Live Preview Card */}
                        <div className="mb-2">
                            {renderLivePreview()}
                        </div>

                        {/* Form Card */}
                        <GlassCard style={{ padding: theme.spacing(4), background: '#ffffff' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="admin-billboard-label">Título del Slide</label>
                                        <input
                                            type="text"
                                            className="form-control admin-billboard-input"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Escribe un título impactante..."
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="admin-billboard-label">Descripción</label>
                                        <textarea
                                            className="form-control admin-billboard-input"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Breve explicación del anuncio..."
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Texto del Botón</label>
                                        <input
                                            type="text"
                                            className="form-control admin-billboard-input"
                                            value={formData.button_text}
                                            onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Link del Botón</label>
                                        <input
                                            type="text"
                                            className="form-control admin-billboard-input"
                                            value={formData.button_link}
                                            onChange={e => setFormData({ ...formData, button_link: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-12 mt-4">
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowGallery(true)}
                                                className="btn btn-outline-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                                                style={{ borderRadius: '16px', fontWeight: 'bold' }}
                                            >
                                                <Image size={20} /> Elegir de Galería
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('fileUpload').click()}
                                                className="btn btn-dark w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                                                style={{ borderRadius: '16px', fontWeight: 'bold' }}
                                            >
                                                <Plus size={20} /> Subir Imagen
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            id="fileUpload"
                                            hidden
                                            onChange={e => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    setPreviewUrl(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="col-12 d-flex gap-2 mt-4">
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="btn btn-primary flex-grow-1 py-3"
                                            style={{ 
                                                borderRadius: '16px', 
                                                fontWeight: '800', 
                                                fontSize: '1.1rem',
                                                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                                border: 'none',
                                                color: '#fff'
                                            }}
                                        >
                                            {uploading ? 'Guardando...' : editingItem ? 'Actualizar Slide' : 'Crear nuevo Slide'}
                                        </button>
                                        {editingItem && (
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="btn btn-light py-3 px-4"
                                                style={{ borderRadius: '16px' }}
                                            >
                                                <X size={24} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </GlassCard>

                        {/* Style Editor */}
                        <GlassCard style={{ padding: '24px' }}>
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <Pencil size={20} /> Estilos Visuales
                            </h5>
                            <div className="row g-4">
                                {/* Tipografía y Colores de Título */}
                                <div className="col-md-6">
                                    <div className="p-3 rounded-4 bg-light border">
                                        <h6 className="fw-bold mb-3 small text-uppercase">Configuración de Título</h6>
                                        <div className="d-flex flex-column gap-3">
                                            <div>
                                                <label className="form-label small text-muted">Tipografía Título</label>
                                                <select 
                                                    className="form-select admin-billboard-input" 
                                                    value={styleEditor.titleFont}
                                                    onChange={e => setStyleEditor({ ...styleEditor, titleFont: e.target.value })}
                                                >
                                                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <label className="form-label small text-muted">Color</label>
                                                    <input
                                                        type="color"
                                                        className="form-control form-control-color w-100"
                                                        style={{ height: '45px' }}
                                                        value={styleEditor.titleColor}
                                                        onChange={e => setStyleEditor({ ...styleEditor, titleColor: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-6">
                                                    <label className="form-label small text-muted">Tamaño</label>
                                                    <input
                                                        type="text"
                                                        className="form-control admin-billboard-input"
                                                        value={styleEditor.titleSize}
                                                        onChange={e => setStyleEditor({ ...styleEditor, titleSize: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tipografía y Colores de Descripción */}
                                <div className="col-md-6">
                                    <div className="p-3 rounded-4 bg-light border">
                                        <h6 className="fw-bold mb-3 small text-uppercase">Configuración de Descripción</h6>
                                        <div className="d-flex flex-column gap-3">
                                            <div>
                                                <label className="form-label small text-muted">Tipografía Descripción</label>
                                                <select 
                                                    className="form-select admin-billboard-input" 
                                                    value={styleEditor.descFont}
                                                    onChange={e => setStyleEditor({ ...styleEditor, descFont: e.target.value })}
                                                >
                                                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <label className="form-label small text-muted">Color</label>
                                                    <input
                                                        type="color"
                                                        className="form-control form-control-color w-100"
                                                        style={{ height: '45px' }}
                                                        value={styleEditor.descColor}
                                                        onChange={e => setStyleEditor({ ...styleEditor, descColor: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-6">
                                                    <label className="form-label small text-muted">Tamaño</label>
                                                    <input
                                                        type="text"
                                                        className="form-control admin-billboard-input"
                                                        value={styleEditor.descSize}
                                                        onChange={e => setStyleEditor({ ...styleEditor, descSize: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Iconos & Color Icono */}
                                <div className="col-12">
                                    <div className="p-3 rounded-4 bg-dark text-white shadow-lg" style={{ border: `1px solid ${theme.colors.primary}33` }}>
                                        <div className="row g-4">
                                            <div className="col-md-4 border-end border-secondary">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-secondary">Icono del Slide</h6>
                                                <div className="d-flex flex-column gap-3">
                                                    <div>
                                                        <label className="form-label small opacity-75">Seleccionar Icono</label>
                                                        <select 
                                                            className="form-select bg-secondary border-0 text-white" 
                                                            value={styleEditor.iconName}
                                                            onChange={e => setStyleEditor({ ...styleEditor, iconName: e.target.value })}
                                                        >
                                                            {ICON_OPTIONS.map(i => <option key={i.value} value={i.value} style={{ background: '#333' }}>{i.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="form-label small opacity-75">Color del Icono</label>
                                                        <input
                                                            type="color"
                                                            className="form-control form-control-color w-100 bg-transparent border-0"
                                                            style={{ height: '35px' }}
                                                            value={styleEditor.iconColor}
                                                            onChange={e => setStyleEditor({ ...styleEditor, iconColor: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 border-end border-secondary">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-secondary">Tamaño Icono</h6>
                                                <div className="d-flex flex-column justify-content-center h-100 pb-4">
                                                    <label className="form-label small opacity-75 text-center mb-3">{styleEditor.iconSize}px</label>
                                                    <input
                                                        type="range"
                                                        className="form-range"
                                                        min="20" max="150"
                                                        value={styleEditor.iconSize}
                                                        onChange={e => setStyleEditor({ ...styleEditor, iconSize: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-secondary">Transparencias</h6>
                                                <div className="d-flex flex-column gap-3">
                                                    <div>
                                                        <label className="form-label small opacity-75">Opacidad Fondo ({Math.round(styleEditor.overlayOpacity * 100)}%)</label>
                                                        <input
                                                            type="range"
                                                            className="form-range"
                                                            min="0" max="1" step="0.05"
                                                            value={styleEditor.overlayOpacity}
                                                            onChange={e => setStyleEditor({ ...styleEditor, overlayOpacity: parseFloat(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label small opacity-75">Opacidad Texto ({Math.round(styleEditor.textOpacity * 100)}%)</label>
                                                        <input
                                                            type="range"
                                                            className="form-range"
                                                            min="0" max="1" step="0.05"
                                                            value={styleEditor.textOpacity}
                                                            onChange={e => setStyleEditor({ ...styleEditor, textOpacity: parseFloat(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* List Section */}
                <div className="col-lg-5">
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                        <ListChecks size={22} /> Diapositivas Existentes
                    </h5>

                    <div className="d-flex flex-column gap-3">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" />
                            </div>
                        ) : billboards.length === 0 ? (
                            <div className="text-center py-5 bg-light rounded-4 border-2 border-dashed">
                                No hay diapositivas registradas
                            </div>
                        ) : billboards.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <GlassCard style={{
                                    padding: '16px',
                                    borderLeft: editingItem?.id === item.id ? `6px solid ${theme.colors.primary}` : '1px solid rgba(255,255,255,0.05)',
                                    background: theme.colors.surface,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}>
                                    <div className="d-flex gap-3 align-items-center">
                                        <div
                                            onClick={() => toggleSelect(item.id)}
                                            style={{
                                                width: '26px', height: '26px',
                                                borderRadius: '8px',
                                                border: `2px solid ${selectedIds.includes(item.id) ? theme.colors.primary : '#dee2e6'}`,
                                                background: selectedIds.includes(item.id) ? theme.colors.primary : 'transparent',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            {selectedIds.includes(item.id) && <Check size={18} />}
                                        </div>

                                        <div style={{
                                            width: '90px', height: '55px',
                                            borderRadius: '12px', overflow: 'hidden',
                                            background: '#eee',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                        }}>
                                            <img
                                                src={normalizeMediaUrl(item.media_url)}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                alt="thumb"
                                            />
                                        </div>

                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                            <h6 className="mb-0 fw-bold text-truncate" style={{ color: '#fff', fontSize: '1rem' }}>{item.title || 'Sín Título'}</h6>
                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                <span style={{ fontSize: '0.7rem', color: theme.colors.text.secondary, fontWeight: 600 }}>
                                                    #{item.order}
                                                </span>
                                                {item.is_active ? 
                                                    <span className="badge rounded-pill" style={{ background: `${theme.colors.success}22`, color: theme.colors.success, fontSize: '0.65rem', border: `1px solid ${theme.colors.success}44` }}>Activo</span> :
                                                    <span className="badge rounded-pill" style={{ background: `rgba(255,255,255,0.05)`, color: '#888', fontSize: '0.65rem', border: `1px solid rgba(255,255,255,0.1)` }}>Inactivo</span>
                                                }
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="btn btn-sm p-2"
                                                style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: theme.colors.primary, border: 'none' }}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="btn btn-sm p-2"
                                                style={{ borderRadius: '10px', background: 'rgba(255, 59, 48, 0.1)', color: theme.colors.error, border: 'none' }}
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        style={{
                            position: 'fixed', bottom: '32px', left: '50%', x: '-50%',
                            background: theme.colors.surface, color: '#fff', padding: '16px 32px',
                            borderRadius: '24px', boxShadow: theme.shadows.floating,
                            zIndex: 1000, display: 'flex', alignItems: 'center', gap: '24px',
                            border: `1px solid ${theme.colors.primary}44`,
                            backdropFilter: 'blur(24px)'
                        }}
                    >
                        <span className="fw-bold">
                            <span style={{
                                background: theme.colors.primary,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                marginRight: '10px'
                            }}>
                                {selectedIds.length}
                            </span>
                            Seleccionados
                        </span>
                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
                        <button
                            onClick={handleBulkDelete}
                            className="btn btn-danger d-flex align-items-center gap-2"
                            style={{ borderRadius: '12px', padding: '8px 20px', fontWeight: 'bold' }}
                        >
                            <Trash2 size={18} /> Eliminar Lote
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="btn btn-outline-light d-flex align-items-center gap-2"
                            style={{ borderRadius: '12px', padding: '8px 20px' }}
                        >
                            Cancelar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Gallery Modal */}
            <AnimatePresence>
                {showGallery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.92)', zIndex: 10000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: isMobile ? '20px' : '60px', backdropFilter: 'blur(16px)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '100%', maxWidth: '1200px', background: theme.colors.surface,
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: '32px', padding: isMobile ? '24px' : '48px', maxHeight: '90vh', overflowY: 'auto',
                                boxShadow: theme.shadows.floating
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-5">
                                <h2 style={{ fontWeight: 900, color: '#fff', fontSize: '2rem', letterSpacing: '-1px' }}>Galería Master</h2>
                                <button 
                                    onClick={() => setShowGallery(false)}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', 
                                        width: '44px', height: '44px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="d-flex flex-column gap-5">
                                {Object.entries(categorizedGallery).map(([category, images]) => (
                                    <div key={category}>
                                        <h5 style={{ 
                                            color: theme.colors.primary, 
                                            fontSize: '0.8rem', 
                                            fontWeight: 800, 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '2px',
                                            marginBottom: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <span style={{ width: '40px', height: '2px', background: theme.colors.primary }} />
                                            {category}
                                        </h5>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                            gap: '24px'
                                        }}>
                                            {images.map((url, i) => (
                                                <motion.div
                                                    key={url}
                                                    whileHover={{ scale: 1.04, y: -5 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={() => {
                                                        if (window.navigator.vibrate) window.navigator.vibrate(10);
                                                        handleSelectFromGallery(url);
                                                    }}
                                                    style={{
                                                        aspectRatio: '16/9', borderRadius: '20px', overflow: 'hidden',
                                                        cursor: 'pointer', 
                                                        border: formData.media_url === url ? `4px solid ${theme.colors.primary}` : '2px solid transparent',
                                                        boxShadow: theme.shadows.medium,
                                                        background: '#000'
                                                    }}
                                                >
                                                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} alt="gallery" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Confirmation Modal */}
            <ConfirmationModal 
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type || 'warning'}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

export default AdminBillboard;
