import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import GlassCard from '../react-ui/components/GlassCard';
import Button from '../react-ui/components/Button';
import { theme } from '../react-ui/styles/theme';

/**
 * Componente AdminBillboard - Versión Visual Mejorada
 * -----------------------------------------------------
 * Interfaz administrativa avanzada para gestionar la cartelera (Hero).
 * ✨ Nuevas características:
 * - Vista previa en tiempo real (Live Preview)
 * - Biblioteca de imágenes reutilizables
 * - Editor de estilos (colores, tipografías)
 * - Autoplay/Slideshow con intervalo configurable
 * - UI más visual con iconos
 */

// Estilos para animación pulse
const styles = `
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
`;

const AdminBillboard = () => {
    // ESTADOS: Datos principales
    const [billboards, setBillboards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // ESTADOS: Biblioteca de imágenes
    const [imageGallery, setImageGallery] = useState([
        'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&h=1080',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080',
    ]);
    const [showGallery, setShowGallery] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    
    // ESTADOS: Vista previa en tiempo real
    const [livePreviewMode, setLivePreviewMode] = useState(true);
    const [autoplayEnabled, setAutoplayEnabled] = useState(false);
    const [autoplayInterval, setAutoplayInterval] = useState(5);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const autoplayTimerRef = useRef(null);
    
    // ESTADOS: Editor de estilos
    const [styleEditor, setStyleEditor] = useState({
        titleColor: '#ffffff',
        titleFont: 'ModernAge, sans-serif',
        titleSize: '3.5rem',
        descColor: '#ffffff',
        descFont: 'system-ui, sans-serif',
        descSize: '1.25rem',
        overlayOpacity: 0.7,
    });
    
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

    useEffect(() => {
        fetchBillboards();
    }, []);

    // Autoplay para vista previa
    useEffect(() => {
        if (autoplayEnabled && billboards.length > 0) {
            autoplayTimerRef.current = setInterval(() => {
                setCurrentSlideIndex(prev => (prev + 1) % billboards.length);
            }, autoplayInterval * 1000);
        }
        return () => {
            if (autoplayTimerRef.current) {
                clearInterval(autoplayTimerRef.current);
            }
        };
    }, [autoplayEnabled, autoplayInterval, billboards.length]);

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
            is_active: item.is_active,
            styles: item.styles || {}
        });
        
        // Cargar estilos guardados
        if (item.styles) {
            setStyleEditor(prev => ({ ...prev, ...item.styles }));
        }
    };

    const handleReset = () => {
        setEditingItem(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({
            title: '',
            description: '',
            media_url: '',
            media_type: 'image',
            button_text: '',
            button_link: '',
            order: billboards.length + 1,
            is_active: true,
            styles: {}
        });
        setStyleEditor({
            titleColor: '#ffffff',
            titleFont: 'ModernAge, sans-serif',
            titleSize: '3.5rem',
            descColor: '#ffffff',
            descFont: 'system-ui, sans-serif',
            descSize: '1.25rem',
            overlayOpacity: 0.7,
        });
        const fileInput = document.getElementById('mediaFile');
        if (fileInput) fileInput.value = '';
    };

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setUploading(true);
            let mediaUrl = formData.media_url;

            if (selectedFile) {
                console.log('📤 Subiendo imagen:', selectedFile.name, `(${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`);
                
                const uploadFormData = new FormData();
                uploadFormData.append('image', selectedFile);

                const { data } = await apiClient.post('/billboards/upload-image', uploadFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('📥 Respuesta del servidor:', data);
                
                if (data.success) {
                    mediaUrl = data.imageUrl;
                    console.log('✅ Imagen subida con éxito:', mediaUrl);
                } else {
                    throw new Error('Error al subir la imagen');
                }
            }

            // Validar que media_url no esté vacía
            if (!mediaUrl) {
                alert('⚠️ Debes seleccionar una imagen para el billboard');
                setUploading(false);
                return;
            }

            const itemToSave = { 
                ...formData, 
                media_url: mediaUrl,
                styles: styleEditor
            };
            console.log('💾 Guardando billboard en DB:', itemToSave);
            console.log('📸 URL de imagen:', mediaUrl);
            
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

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este elemento?')) return;
        try {
            await apiClient.delete(`/admin/billboards/${id}`);
            fetchBillboards();
        } catch (e) {
            console.error('Error al eliminar:', e);
        }
    };

    const normalizeMediaUrl = (url) => {
        if (!url) return null;
        
        // Si ya es una URL completa (http/https), devuélvela tal cual
        if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
            return url;
        }
        
        // Si es una ruta relativa de uploads
        if (typeof url === 'string' && url.startsWith('/uploads/')) {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const backendUrl = apiBase.replace(/\/api\/?$/, '');
            return `${backendUrl}${url}`;
        }
        
        return url || null;
    };

    // Seleccionar imagen de la galería
    const handleSelectFromGallery = (url) => {
        setFormData(prev => ({ ...prev, media_url: url }));
        setPreviewUrl(url);
        setShowGallery(false);
    };

    // Agregar nueva imagen a la galería
    const handleAddToGallery = (url) => {
        if (url && !imageGallery.includes(url)) {
            setImageGallery(prev => [...prev, url]);
        }
    };

    // Renderizar vista previa en tiempo real
    const renderLivePreview = () => {
        const displayData = livePreviewMode ? formData : (billboards[currentSlideIndex] || formData);
        const displayUrl = livePreviewMode 
            ? (previewUrl || normalizeMediaUrl(formData.media_url))
            : normalizeMediaUrl(displayData.media_url);
        
        const currentStyles = livePreviewMode ? styleEditor : (displayData.styles || styleEditor);
        
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    height: '500px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: `3px solid ${livePreviewMode ? theme.colors.primary : '#6c757d'}`
                }}
            >
                {/* Fondo */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: displayUrl ? `url(${displayUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    transition: 'all 0.5s ease'
                }} />

                {/* Overlay */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: `linear-gradient(to right, rgba(0,0,0,${currentStyles.overlayOpacity}) 0%, rgba(0,0,0,${currentStyles.overlayOpacity * 0.5}) 50%, rgba(0,0,0,${currentStyles.overlayOpacity * 0.2}) 100%)`
                }} />

                {/* Contenido */}
                <div style={{
                    position: 'relative', zIndex: 1, color: '#fff',
                    height: '100%', display: 'flex', alignItems: 'center',
                    padding: '0 40px'
                }}>
                    <div style={{ maxWidth: '600px' }}>
                        <h1 style={{
                            fontFamily: currentStyles.titleFont,
                            fontSize: currentStyles.titleSize,
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            lineHeight: 1.2,
                            textShadow: '0 4px 15px rgba(0,0,0,0.5)',
                            color: currentStyles.titleColor,
                            transition: 'all 0.3s'
                        }}>
                            {displayData.title || 'Título del Hero'}
                        </h1>
                        <p style={{
                            fontFamily: currentStyles.descFont,
                            fontSize: currentStyles.descSize,
                            marginBottom: '1.5rem',
                            opacity: 0.95,
                            lineHeight: 1.6,
                            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            color: currentStyles.descColor,
                            transition: 'all 0.3s'
                        }}>
                            {displayData.description || 'Descripción de la diapositiva'}
                        </p>
                        {displayData.button_text && (
                            <button style={{
                                padding: '12px 28px',
                                borderRadius: '12px',
                                border: 'none',
                                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: '0 6px 20px rgba(91,46,166,0.4)',
                                transition: 'all 0.3s'
                            }}>
                                {displayData.button_text}
                            </button>
                        )}
                    </div>
                </div>

                {/* Badge de modo */}
                <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: livePreviewMode 
                        ? 'linear-gradient(135deg, #ff6b6b, #ee5a6f)' 
                        : 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <i className={`bi ${livePreviewMode ? 'bi-circle-fill' : 'bi-play-circle'}`} 
                       style={{ fontSize: '0.6rem', animation: livePreviewMode ? 'pulse 2s infinite' : 'none' }}></i>
                    {livePreviewMode ? 'LIVE' : `Slide ${currentSlideIndex + 1}/${billboards.length}`}
                </div>

                {/* Controles de navegación */}
                {!livePreviewMode && billboards.length > 1 && (
                    <div style={{
                        position: 'absolute', bottom: '16px', left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        {billboards.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlideIndex(idx)}
                                style={{
                                    width: currentSlideIndex === idx ? '32px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: currentSlideIndex === idx 
                                        ? '#fff' 
                                        : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        );
    };

    // Renderizar vista previa fullscreen del Hero
    const renderPreview = () => {
        const displayUrl = previewUrl || normalizeMediaUrl(formData.media_url);
        
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
                        backgroundImage: displayUrl ? `url(${displayUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        <>
            <style>{styles}</style>
            <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header con controles */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 style={{ 
                        fontFamily: 'ModernAge, sans-serif', 
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold',
                        fontSize: '2rem',
                        marginBottom: '8px'
                    }}>
                        <i className="bi bi-images" style={{ 
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}></i> Cartelera Hero
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: 0 }}>
                        <i className="bi bi-lightbulb"></i> Vista previa en tiempo real con control de estilos
                    </p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    {/* Toggle Live Preview */}
                    <button
                        type="button"
                        onClick={() => setLivePreviewMode(prev => !prev)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: `2px solid ${livePreviewMode ? theme.colors.primary : '#dee2e6'}`,
                            background: livePreviewMode ? theme.colors.primary : 'transparent',
                            color: livePreviewMode ? '#fff' : theme.colors.primary,
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <i className={`bi ${livePreviewMode ? 'bi-broadcast-pin' : 'bi-broadcast'}`}></i>
                        {livePreviewMode ? 'Live' : 'Slideshow'}
                    </button>

                    {/* Toggle Autoplay */}
                    <button
                        type="button"
                        onClick={() => setAutoplayEnabled(prev => !prev)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: `2px solid ${autoplayEnabled ? '#28a745' : '#dee2e6'}`,
                            background: autoplayEnabled ? '#28a745' : 'transparent',
                            color: autoplayEnabled ? '#fff' : '#28a745',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <i className={`bi ${autoplayEnabled ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                        {autoplayEnabled ? 'Pausar' : 'Autoplay'}
                    </button>

                    {editingItem && (
                        <Button variant="outline" onClick={handleReset}>
                            <i className="bi bi-x-circle me-1"></i>Cancelar
                        </Button>
                    )}
                </div>
            </div>

            {/* Vista Previa en Tiempo Real */}
            <GlassCard style={{ padding: '30px', marginBottom: '30px' }}>
                {renderLivePreview()}
            </GlassCard>

            <div className="row g-4">
                {/* Form Section */}
                <div className="col-lg-6">
                    <GlassCard style={{ padding: '30px' }}>
                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            {/* Campos principales con iconos */}
                            <div style={{ 
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                                borderRadius: '16px',
                                padding: '20px',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <div className="mb-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <div style={{
                                            width: '32px', height: '32px',
                                            borderRadius: '8px',
                                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}>
                                            <i className="bi bi-type-h1"></i>
                                        </div>
                                        <label className="form-label mb-0 fw-bold" style={{ fontSize: '0.9rem', color: theme.colors.primary }}>
                                            Título del Hero
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{
                                            borderRadius: '12px',
                                            border: '2px solid rgba(102, 126, 234, 0.2)',
                                            padding: '12px 16px'
                                        }}
                                        placeholder="Ej: Bienvenido a OASIS"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <div style={{
                                            width: '32px', height: '32px',
                                            borderRadius: '8px',
                                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '1rem'
                                        }}>
                                            <i className="bi bi-text-paragraph"></i>
                                        </div>
                                        <label className="form-label mb-0 fw-bold" style={{ fontSize: '0.9rem', color: theme.colors.primary }}>
                                            Descripción
                                        </label>
                                    </div>
                                    <textarea
                                        className="form-control"
                                        style={{
                                            borderRadius: '12px',
                                            border: '2px solid rgba(102, 126, 234, 0.2)',
                                            padding: '12px 16px'
                                        }}
                                        rows="3"
                                        placeholder="Breve descripción del slide..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Sección de Imagen con Galería */}
                            <div style={{ 
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                                borderRadius: '16px',
                                padding: '20px',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{
                                        width: '32px', height: '32px',
                                        borderRadius: '8px',
                                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}>
                                        <i className="bi bi-image"></i>
                                    </div>
                                    <label className="form-label mb-0 fw-bold" style={{ fontSize: '0.9rem', color: theme.colors.primary }}>
                                        Imagen de Fondo
                                    </label>
                                </div>

                                {/* Botones de carga */}
                                <div className="d-flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('mediaFile').click()}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '2px dashed rgba(102, 126, 234, 0.4)',
                                            background: 'rgba(102, 126, 234, 0.05)',
                                            color: theme.colors.primary,
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i className="bi bi-cloud-upload" style={{ fontSize: '1.2rem' }}></i>
                                        Subir Archivo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowGallery(true)}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '2px solid rgba(102, 126, 234, 0.4)',
                                            background: 'transparent',
                                            color: theme.colors.primary,
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i className="bi bi-collection" style={{ fontSize: '1.2rem' }}></i>
                                        Galería
                                    </button>
                                </div>

                                <input
                                    type="file"
                                    id="mediaFile"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.size > 20 * 1024 * 1024) {
                                                alert('La imagen no debe exceder 20MB');
                                                return;
                                            }
                                            setSelectedFile(file);
                                            setFormData({ ...formData, media_type: 'image' });
                                            const objectUrl = URL.createObjectURL(file);
                                            setPreviewUrl(objectUrl);
                                            handleAddToGallery(objectUrl);
                                            console.log(`✅ Archivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
                                        }
                                    }}
                                />

                                {selectedFile && (
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: 'rgba(40, 167, 69, 0.1)',
                                        border: '1px solid rgba(40, 167, 69, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <i className="bi bi-check-circle-fill" style={{ color: '#28a745', fontSize: '1.2rem' }}></i>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#28a745' }}>
                                                {selectedFile.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Sin overhead de Base64
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Configuración adicional */}
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-cursor" style={{ color: theme.colors.primary }}></i>
                                        <label className="form-label mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>
                                            Texto Botón
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ borderRadius: '12px', border: '2px solid #dee2e6' }}
                                        placeholder="Ej: Ver más"
                                        value={formData.button_text}
                                        onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                                    />
                                </div>
                                <div className="col-6">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-link-45deg" style={{ color: theme.colors.primary }}></i>
                                        <label className="form-label mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>
                                            Link Botón
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ borderRadius: '12px', border: '2px solid #dee2e6' }}
                                        placeholder="/ruta"
                                        value={formData.button_link}
                                        onChange={e => setFormData({ ...formData, button_link: e.target.value })}
                                    />
                                </div>
                                <div className="col-6">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-sort-numeric-down" style={{ color: theme.colors.primary }}></i>
                                        <label className="form-label mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>
                                            Orden
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-control"
                                        style={{ borderRadius: '12px', border: '2px solid #dee2e6' }}
                                        min="1" max="10"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="col-6 d-flex align-items-end">
                                    <div className="form-check form-switch" style={{ paddingLeft: '2.5rem', paddingBottom: '8px' }}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="isActive"
                                            style={{ width: '50px', height: '24px', cursor: 'pointer' }}
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <label className="form-check-label fw-bold" htmlFor="isActive" style={{ fontSize: '0.85rem', color: theme.colors.primary }}>
                                            <i className="bi bi-power me-1"></i>Activo
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="d-flex gap-2 mt-3">
                                <Button 
                                    type="submit" 
                                    disabled={uploading}
                                    style={{ flex: 1 }}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Subiendo...
                                        </>
                                    ) : (
                                        <>
                                            <i className={`bi ${editingItem ? 'bi-arrow-repeat' : 'bi-plus-circle'} me-2`}></i>
                                            {editingItem ? 'Actualizar' : 'Crear Slide'}
                                        </>
                                    )}
                                </Button>
                                <Button 
                                    type="button"
                                    variant="secondary"
                                    onClick={handleReset}
                                >
                                    <i className="bi bi-x-circle"></i>
                                </Button>
                            </div>
                        </form>
                    </GlassCard>

                    {/* Editor de Estilos */}
                    <GlassCard style={{ padding: '30px', marginTop: '20px' }}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '8px',
                                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '1rem'
                            }}>
                                <i className="bi bi-palette"></i>
                            </div>
                            <h5 className="mb-0 fw-bold" style={{ color: theme.colors.primary }}>
                                Editor de Estilos
                            </h5>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {/* Título */}
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(102, 126, 234, 0.05)',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className="bi bi-type-h1" style={{ color: theme.colors.primary }}></i>
                                    <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Título</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4">
                                        <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                                            <i className="bi bi-palette-fill me-1"></i>Color
                                        </label>
                                        <input
                                            type="color"
                                            className="form-control form-control-color"
                                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                                            value={styleEditor.titleColor}
                                            onChange={e => setStyleEditor({ ...styleEditor, titleColor: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-4">
                                        <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                                            <i className="bi bi-fonts me-1"></i>Fuente
                                        </label>
                                        <select
                                            className="form-select"
                                            style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                            value={styleEditor.titleFont}
                                            onChange={e => setStyleEditor({ ...styleEditor, titleFont: e.target.value })}
                                        >
                                            <option value="ModernAge, sans-serif">Modern Age</option>
                                            <option value="Arial, sans-serif">Arial</option>
                                            <option value="Georgia, serif">Georgia</option>
                                            <option value="'Courier New', monospace">Courier</option>
                                            <option value="'Times New Roman', serif">Times</option>
                                        </select>
                                    </div>
                                    <div className="col-4">
                                        <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                                            <i className="bi bi-text-paragraph me-1"></i>Tamaño
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                            value={styleEditor.titleSize}
                                            onChange={e => setStyleEditor({ ...styleEditor, titleSize: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(102, 126, 234, 0.05)',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className="bi bi-text-paragraph" style={{ color: theme.colors.primary }}></i>
                                    <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Descripción</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4">
                                        <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                                            <i className="bi bi-palette-fill me-1"></i>Color
                                        </label>
                                        <input
                                            type="color"
                                            className="form-control form-control-color"
                                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                                            value={styleEditor.descColor}
                                            onChange={e => setStyleEditor({ ...styleEditor, descColor: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-4">
                                        <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                                            <i className="bi bi-fonts me-1"></i>Fuente
                                        </label>
                                        <select
                                            className="form-select"
                                            style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                            value={styleEditor.descFont}
                                            onChange={e => setStyleEditor({ ...styleEditor, descFont: e.target.value })}
                                        >
                                            <option value="ModernAge, sans-serif">Modern Age</option>
                                            <option value="Arial, sans-serif">Arial</option>
                                            <option value="Georgia, serif">Georgia</option>
                                            <option value="'Courier New', monospace">Courier</option>
                                            <option value="'Times New Roman', serif">Times</option>
                                        </select>
                                    </div>
                                    <div className="col-4">
                                        <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                                            <i className="bi bi-text-paragraph me-1"></i>Tamaño
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                            value={styleEditor.descSize}
                                            onChange={e => setStyleEditor({ ...styleEditor, descSize: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Overlay Opacity */}
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(102, 126, 234, 0.05)',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-transparency" style={{ color: theme.colors.primary }}></i>
                                        <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Opacidad Overlay</span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.colors.primary }}>
                                        {Math.round(styleEditor.overlayOpacity * 100)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={styleEditor.overlayOpacity}
                                    onChange={e => setStyleEditor({ ...styleEditor, overlayOpacity: parseFloat(e.target.value) })}
                                />
                            </div>

                            {/* Botón reset */}
                            <button
                                type="button"
                                onClick={() => setStyleEditor({
                                    titleColor: '#ffffff',
                                    titleFont: 'ModernAge, sans-serif',
                                    titleSize: '3.5rem',
                                    descColor: '#ffffff',
                                    descFont: 'ModernAge, sans-serif',
                                    descSize: '1.15rem',
                                    overlayOpacity: 0.7
                                })}
                                style={{
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: '2px solid #dee2e6',
                                    background: 'transparent',
                                    color: '#6c757d',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Restaurar Estilos
                            </button>
                        </div>
                    </GlassCard>
                </div>

                {/* List Section */}
                <div className="col-lg-6">
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
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {item.media_type === 'image' && item.media_url ? (
                                                <img 
                                                    src={normalizeMediaUrl(item.media_url)} 
                                                    alt="thumbnail" 
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover',
                                                        display: 'block'
                                                    }} 
                                                    onError={(e) => {
                                                        console.warn('⚠️ Error cargando imagen:', e.target.src);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : null}
                                            {(!item.media_url || !item.media_type === 'image') && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                    color: '#fff'
                                                }}>
                                                    <i className="bi bi-image" style={{ fontSize: '1.5rem', opacity: 0.5 }}></i>
                                                </div>
                                            )}
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

            {/* Modal de Galería de Imágenes */}
            {showGallery && (
                <AnimatePresence>
                    <motion.div 
                        onClick={() => setShowGallery(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.9)', zIndex: 9999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '40px',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <motion.div 
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            style={{
                                width: '100%', maxWidth: '1200px', maxHeight: '90vh',
                                background: '#fff',
                                borderRadius: '24px',
                                padding: '40px',
                                overflow: 'auto',
                                boxShadow: '0 25px 80px rgba(102, 126, 234, 0.6)',
                                border: `3px solid ${theme.colors.primary}`
                            }}
                        >
                            {/* Header */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h3 style={{ 
                                        fontFamily: 'ModernAge, sans-serif',
                                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 'bold',
                                        marginBottom: '8px'
                                    }}>
                                        <i className="bi bi-collection"></i> Galería de Imágenes
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: 0 }}>
                                        Selecciona una imagen de la biblioteca o sube una nueva
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowGallery(false)}
                                    style={{
                                        background: 'rgba(108, 117, 125, 0.1)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px', height: '40px',
                                        color: '#6c757d',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Grid de imágenes */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '16px'
                            }}>
                                {imageGallery.map((imageUrl, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleSelectFromGallery(imageUrl)}
                                        style={{
                                            width: '100%',
                                            aspectRatio: '16/10',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            border: formData.media_url === imageUrl || previewUrl === imageUrl
                                                ? `4px solid ${theme.colors.primary}`
                                                : '2px solid #dee2e6',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <img 
                                            src={imageUrl} 
                                            alt={`Imagen ${idx + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s'
                                            }}
                                            onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                        />
                                        {(formData.media_url === imageUrl || previewUrl === imageUrl) && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px', right: '8px',
                                                background: theme.colors.primary,
                                                borderRadius: '50%',
                                                width: '32px', height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: '1rem',
                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.6)'
                                            }}>
                                                <i className="bi bi-check2"></i>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Botón para subir nueva */}
                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        document.getElementById('mediaFile').click();
                                        setShowGallery(false);
                                    }}
                                    style={{
                                        padding: '16px 32px',
                                        borderRadius: '16px',
                                        border: `2px dashed ${theme.colors.primary}`,
                                        background: 'rgba(102, 126, 234, 0.05)',
                                        color: theme.colors.primary,
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <i className="bi bi-cloud-upload" style={{ fontSize: '1.5rem' }}></i>
                                    Subir Nueva Imagen
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Modal de Vista Previa */}
            {showPreview && renderPreview()}
            </div>
        </>
    );
};

export default AdminBillboard;
