import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import GlassCard from '../react-ui/components/GlassCard';
import Button from '../react-ui/components/Button';
import { theme } from '../react-ui/styles/theme';
import useImageCompression from '../hooks/useImageCompression';

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
    const [uploading, setUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const { compressImage, validateCompressedImage } = useImageCompression();
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
            const { data } = await apiClient.get('/admin/billboards');
            setBillboards(data || []);
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
     * Convierte un archivo de imagen a Base64 altamente comprimido
     * Usa browser-image-compression para reducción más agresiva y profesional
     * Objetivo: < 900KB en Base64 para evitar Error 413
     */
    const convertImageToBase64 = async (file) => {
        const result = await compressImage(file, {
            maxSizeMB: 0.9,           // < 900KB
            maxWidthOrHeight: 1280,   // 1280x720 Hero resolution
            initialQuality: 0.75,     // JPEG quality
            useWebWorker: true,       // Non-blocking
        });

        if (!result.success) {
            throw new Error('Compression failed');
        }

        // Validar que está dentro de límites seguros
        const validation = validateCompressedImage(result.base64);
        if (!validation.valid) {
            console.warn(`⚠️ ${validation.reason}`);
        }

        console.log(`✅ Imagen comprimida: ${result.compressedSizeKB}KB (reducción: ${result.reductionPercent}%)`);
        return result.base64;
    };

    /**
     * Envía los datos a la API (Creación o Actualización)
     * Usa Base64 para imágenes de alta calidad (similar a anuncios)
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setUploading(true);
            let mediaUrl = formData.media_url;

            // Si hay archivo seleccionado, convertirlo a base64 y subirlo
            if (selectedFile) {
                console.log('📤 Subiendo imagen:', selectedFile.name);
                const imageBase64 = await convertImageToBase64(selectedFile);
                console.log('📸 Base64 generado, tamaño:', (imageBase64.length / 1024).toFixed(1) + 'KB');
                
                const { data } = await apiClient.post('/billboards/upload-image', { imageBase64 });

                console.log('📥 Respuesta del servidor:', data);
                
                if (data.success) {
                    mediaUrl = data.imageUrl;
                    console.log('✅ Imagen subida con éxito:', mediaUrl);
                } else {
                    throw new Error('Error al subir la imagen');
                }
            }

            const itemToSave = { ...formData, media_url: mediaUrl };
            console.log('💾 Guardando billboard en DB:', itemToSave);
            
            if (editingItem) {
                await apiClient.put(`/admin/billboards/${editingItem.id}`, itemToSave);
            } else {
                await apiClient.post('/admin/billboards', itemToSave);
            }

            fetchBillboards();
            handleReset();
            alert('¡Guardado exitosamente!');
        } catch (e) {
            console.error('Error al guardar:', e);
            alert('Error al guardar. Verifica que todos los campos sean correctos.');
        } finally {
            setUploading(false);
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

    /**
     * Normaliza las URLs de los medios (igual que en Hero.jsx)
     */
    const normalizeMediaUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        if (url.startsWith('/uploads/')) {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const backendUrl = apiBase.replace(/\/api\/?$/, '');
            return `${backendUrl}${url}`;
        }
        return url;
    };

    /**
     * Renderiza la vista previa del Hero con los datos actuales del formulario
     */
    const renderPreview = () => {
        const previewUrl = normalizeMediaUrl(formData.media_url);
        
        return (
            <AnimatePresence>
                <motion.div 
                    onClick={() => setShowPreview(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.95)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <motion.div 
                        onClick={e => e.stopPropagation()}
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                        style={{
                            width: '100%', maxWidth: '1400px', height: '80vh',
                            position: 'relative', borderRadius: '20px', overflow: 'hidden',
                            boxShadow: '0 25px 80px rgba(102, 126, 234, 0.4)',
                            border: `2px solid ${theme.colors.primary}`
                        }}
                    >
                    {/* Botón cerrar */}
                    <button
                        onClick={() => setShowPreview(false)}
                        style={{
                            position: 'absolute', top: '20px', right: '20px', zIndex: 10,
                            background: 'rgba(255,255,255,0.2)', border: 'none',
                            borderRadius: '50%', width: '40px', height: '40px',
                            color: '#fff', fontSize: '1.5rem', cursor: 'pointer',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        ×
                    </button>

                    {/* Fondo */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundImage: previewUrl ? `url(${previewUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundSize: 'cover', backgroundPosition: 'center'
                    }} />

                    {/* Overlay */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)'
                    }} />

                    {/* Contenido */}
                    <div style={{
                        position: 'relative', zIndex: 1, color: '#fff',
                        height: '100%', display: 'flex', alignItems: 'center',
                        padding: '0 60px'
                    }}>
                        <div style={{ maxWidth: '700px' }}>
                            <h1 style={{
                                fontFamily: 'ModernAge, sans-serif',
                                fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                                fontWeight: 'bold',
                                marginBottom: '1.5rem',
                                lineHeight: 1.1,
                                textShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                background: `linear-gradient(135deg, #ffffff 0%, ${theme.colors.secondary} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {formData.title || 'Título del Hero'}
                            </h1>
                            <p style={{
                                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                                marginBottom: '2rem',
                                opacity: 0.9,
                                lineHeight: 1.6,
                                textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                            }}>
                                {formData.description || 'Descripción de la diapositiva del hero'}
                            </p>
                            {formData.button_text && (
                                <button style={{
                                    padding: '14px 32px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 24px rgba(91,46,166,0.4)',
                                    transition: 'all 0.3s'
                                }}>
                                    {formData.button_text}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Badge de vista previa */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            position: 'absolute', bottom: '20px', right: '20px',
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}>
                            <i className="bi bi-eye me-2"></i>Vista Previa
                    </motion.div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ 
                    fontFamily: 'ModernAge, sans-serif', 
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    fontSize: '2rem'
                }}>
                    <i className="bi bi-images" style={{ 
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}></i> Cartelera Hero
                </h2>
                {editingItem && (
                    <Button variant="outline" onClick={handleReset}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                )}
            </div>

            <div className="row g-4">
                {/* Form Section */}
                <div className="col-lg-5">
                    <GlassCard style={{ padding: '40px' }}>
                        <h5 className="mb-4 fw-bold" style={{ color: theme.colors.primary }}>
                            <i className={`bi ${editingItem ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                            {editingItem ? 'Editar' : 'Nueva'}
                        </h5>
                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label small fw-bold" style={{ fontSize: '0.75rem' }}>
                                    <i className="bi bi-type me-1"></i>TÍTULO
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Bienvenido a OASIS"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label small fw-bold" style={{ fontSize: '0.75rem' }}>
                                    <i className="bi bi-text-paragraph me-1"></i>DESCRIPCIÓN
                                </label>
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
                                    <label className="form-label small fw-bold" style={{ fontSize: '0.75rem' }}>
                                        <i className="bi bi-collection-play me-1"></i>TIPO
                                    </label>
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
                                    <label className="form-label small fw-bold" style={{ fontSize: '0.75rem' }}>
                                        <i className="bi bi-sort-numeric-down me-1"></i>ORDEN
                                    </label>
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
                                <label className="form-label small fw-bold" style={{ fontSize: '0.75rem' }}>
                                    <i className="bi bi-image me-1"></i>IMAGEN
                                </label>
                                <input
                                    type="file"
                                    id="mediaFile"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSelectedFile(file);
                                            setFormData({ ...formData, media_type: 'image' });
                                            
                                            // Crear vista previa comprimida (igual a la que se subirá)
                                            const compressedBase64 = await convertImageToBase64(file);
                                            setFormData(prev => ({ ...prev, media_url: compressedBase64 }));
                                        }
                                    }}
                                />
                                <small className="text-primary d-block mt-1">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Max <strong>1280x720px</strong> (16:9). Compresión ultra: <strong>JPEG 50%</strong> (~40-60KB).
                                </small>
                            </div>
                            <div>
                                <label className="form-label small fw-bold text-muted" style={{ fontSize: '0.75rem' }}>
                                    <i className="bi bi-link-45deg me-1"></i>URL ALTERNATIVA
                                </label>
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
                                    <label className="form-label small fw-bold" style={{ fontSize: '0.75rem' }}>
                                        <i className="bi bi-cursor me-1"></i>TEXTO BOTÓN
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: Ver más"
                                        value={formData.button_text}
                                        onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold" style={{ fontSize: '0.75rem' }}>
                                        <i className="bi bi-box-arrow-up-right me-1"></i>LINK BOTÓN
                                    </label>
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
                                <label className="form-check-label" htmlFor="isActive">
                                    <i className="bi bi-toggle-on me-1"></i>Diapositiva Activa
                                </label>
                            </div>
                            
                            <div className="d-flex gap-2 mt-3">
                                <Button 
                                    type="submit" 
                                    disabled={uploading}
                                    style={{ flex: 1 }}
                                    title={uploading ? "Subiendo..." : (editingItem ? "Actualizar" : "Crear")}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                            <i className="bi bi-cloud-arrow-up"></i>
                                        </>
                                    ) : (
                                        <>
                                            <i className={`bi ${editingItem ? 'bi-arrow-repeat' : 'bi-plus-circle'} me-1`}></i>
                                            {editingItem ? 'Actualizar' : 'Crear'}
                                        </>
                                    )}
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPreview(true)}
                                    disabled={!formData.title && !formData.media_url}
                                    title="Vista Previa del Hero"
                                >
                                    <i className="bi bi-eye-fill"></i>
                                </Button>
                                <Button 
                                    type="button"
                                    variant="secondary"
                                    onClick={handleReset}
                                    title="Limpiar formulario"
                                >
                                    <i className="bi bi-x-circle"></i>
                                </Button>
                            </div>
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
                            <motion.div 
                                className="col-12 text-center py-5"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                    borderRadius: '20px',
                                    padding: '40px',
                                    border: `2px dashed ${theme.colors.primary}`
                                }}>
                                    <i className="bi bi-images" style={{ fontSize: '3rem', color: theme.colors.primary, opacity: 0.5 }}></i>
                                    <p className="text-muted mt-3 mb-0">
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Crea tu primera diapositiva
                                    </p>
                                </div>
                            </motion.div>
                        ) : billboards.map((item, idx) => (
                            <motion.div 
                                key={item.id} 
                                className="col-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlassCard style={{ 
                                    padding: '16px', 
                                    borderLeft: `4px solid ${item.is_active ? theme.colors.primary : '#6c757d'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}>
                                    <div className="d-flex gap-3">
                                        <div style={{ 
                                            width: '140px', 
                                            height: '90px', 
                                            borderRadius: '12px', 
                                            overflow: 'hidden', 
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                            flexShrink: 0,
                                            position: 'relative'
                                        }}>
                                            {item.media_type === 'image' ? (
                                                <img 
                                                    src={item.media_url} 
                                                    alt="" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div 
                                                className="w-100 h-100 d-flex align-items-center justify-content-center text-white position-absolute top-0 start-0"
                                                style={{ display: item.media_type === 'video' ? 'flex' : 'none', background: 'rgba(0,0,0,0.5)' }}
                                            >
                                                <i className="bi bi-play-circle-fill fs-2"></i>
                                            </div>
                                            {/* Badge de tipo */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'rgba(0,0,0,0.6)',
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '8px',
                                                padding: '2px 8px',
                                                fontSize: '0.7rem',
                                                color: '#fff'
                                            }}>
                                                <i className={`bi ${item.media_type === 'video' ? 'bi-play-btn' : 'bi-image'} me-1`}></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                <h6 className="mb-0 fw-bold" style={{ color: theme.colors.text }}>
                                                    {item.title || 'Sin Título'}
                                                </h6>
                                                <div className="d-flex gap-1 align-items-center">
                                                    {item.is_active && (
                                                        <span 
                                                            className="badge" 
                                                            style={{ 
                                                                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                                                fontSize: '0.65rem'
                                                            }}
                                                        >
                                                            <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                                                            Activo
                                                        </span>
                                                    )}
                                                    <span 
                                                        className="badge bg-light text-dark"
                                                        style={{ fontSize: '0.65rem' }}
                                                        title="Orden de aparición"
                                                    >
                                                        #{item.order}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="small text-muted mb-2 text-truncate" style={{ maxWidth: '400px', fontSize: '0.8rem' }}>
                                                {item.description || 'Sin descripción'}
                                            </p>
                                            {item.button_text && (
                                                <div className="mb-2">
                                                    <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                                                        <i className="bi bi-mouse me-1"></i>{item.button_text}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="btn btn-sm px-3" 
                                                    onClick={() => handleEdit(item)}
                                                    style={{
                                                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                                        border: 'none',
                                                        color: '#fff',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem'
                                                    }}
                                                    title="Editar diapositiva"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger px-3" 
                                                    onClick={() => handleDelete(item.id)}
                                                    style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                                    title="Eliminar diapositiva"
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de Vista Previa */}
            {showPreview && renderPreview()}
        </div>
    );
};

export default AdminBillboard;
