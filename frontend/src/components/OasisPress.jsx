import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../react-ui/styles/theme';
import apiClient from '../api/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';

// ===============================
// OASIS PRESS - Presentation Editor
// ===============================
// PowerPoint-like features with Liquid Glass aesthetics

// Available fonts
const FONTS = [
    { name: 'Trebuchet MS', label: 'Trebuchet MS' },
    { name: 'AdventSans', label: 'Advent Sans' },
    { name: 'ModernAge', label: 'Modern Age' },
    { name: 'Arial', label: 'Arial' },
    { name: 'Georgia', label: 'Georgia' },
    { name: 'Times New Roman', label: 'Times New Roman' },
    { name: 'Verdana', label: 'Verdana' },
    { name: 'Courier New', label: 'Courier New' },
    { name: 'Impact', label: 'Impact' },
];

// Preset colors
const COLORS = ['#5b2ea6', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#000000', '#ffffff', '#6b7280'];

// ===============================
// IMAGE LIBRARY
// ===============================
const IMAGE_LIBRARY = {
    logos: [
        { id: 'logo-oasis-main', name: 'Oasis Principal', url: '/src/img/logos/LOGO1.png', category: 'logos' },
        { id: 'logo-oasis-church', name: 'Iglesia Oasis', url: '/src/img/logos/LOGO2.png', category: 'logos' },
        { id: 'logo-oasis-icon', name: 'Oasis Icono', url: '/src/img/logos/T1.png', category: 'logos' },
        { id: 'logo-iasd', name: 'IASD Logo', url: '/src/img/logos/IASD1.png', category: 'logos' },
    ],
    social: [
        { id: 'social-ig', name: 'Instagram', url: '/src/img/logos/RRSSINS.png', category: 'social' },
        { id: 'social-fb', name: 'Facebook', url: '/src/img/logos/RRSSFB.png', category: 'social' },
        { id: 'social-yt', name: 'YouTube', url: '/src/img/logos/RRSSYT.png', category: 'social' },
        { id: 'social-x', name: 'X / Twitter', url: '/src/img/logos/RRSSX.png', category: 'social' },
        { id: 'social-wa', name: 'WhatsApp', url: '/src/img/logos/RRSS.png', category: 'social' },
    ],
    backgrounds: [
        { id: 'bg-1', name: 'Worship Lights', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&q=80', category: 'backgrounds' },
        { id: 'bg-2', name: 'Church Interior', url: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&q=80', category: 'backgrounds' },
        { id: 'bg-3', name: 'Sunset Sky', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80', category: 'backgrounds' },
        { id: 'bg-4', name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', category: 'backgrounds' },
        { id: 'bg-5', name: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80', category: 'backgrounds' },
        { id: 'bg-6', name: 'Stars Night', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80', category: 'backgrounds' },
        { id: 'bg-7', name: 'Forest Light', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80', category: 'backgrounds' },
        { id: 'bg-8', name: 'Abstract Purple', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80', category: 'backgrounds' },
        { id: 'bg-9', name: 'Bokeh Lights', url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1920&q=80', category: 'backgrounds' },
        { id: 'bg-10', name: 'Clouds', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80', category: 'backgrounds' },
    ],
    decorative: [
        { id: 'dec-1', name: 'Cross Gold', url: 'https://cdn-icons-png.flaticon.com/512/3004/3004430.png', category: 'decorative' },
        { id: 'dec-2', name: 'Dove', url: 'https://cdn-icons-png.flaticon.com/512/616/616490.png', category: 'decorative' },
        { id: 'dec-3', name: 'Bible', url: 'https://cdn-icons-png.flaticon.com/512/3004/3004416.png', category: 'decorative' },
        { id: 'dec-4', name: 'Praying Hands', url: 'https://cdn-icons-png.flaticon.com/512/2621/2621216.png', category: 'decorative' },
        { id: 'dec-5', name: 'Heart', url: 'https://cdn-icons-png.flaticon.com/512/833/833472.png', category: 'decorative' },
        { id: 'dec-6', name: 'Star', url: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', category: 'decorative' },
        { id: 'dec-7', name: 'Music Notes', url: 'https://cdn-icons-png.flaticon.com/512/3659/3659784.png', category: 'decorative' },
        { id: 'dec-8', name: 'Church Building', url: 'https://cdn-icons-png.flaticon.com/512/2330/2330457.png', category: 'decorative' },
    ]
};

// Gradient presets for backgrounds
const GRADIENT_PRESETS = [
    { id: 'grad-1', name: 'Oasis Purple', value: 'linear-gradient(135deg, #5b2ea6 0%, #8b5cf6 100%)', overlay: 'linear-gradient(135deg, rgba(91,46,166,0.8) 0%, rgba(139,92,246,0.6) 100%)' },
    { id: 'grad-2', name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', overlay: 'linear-gradient(135deg, rgba(240,147,251,0.7) 0%, rgba(245,87,108,0.7) 100%)' },
    { id: 'grad-3', name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', overlay: 'linear-gradient(135deg, rgba(102,126,234,0.7) 0%, rgba(118,75,162,0.7) 100%)' },
    { id: 'grad-4', name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', overlay: 'linear-gradient(135deg, rgba(17,153,142,0.7) 0%, rgba(56,239,125,0.7) 100%)' },
    { id: 'grad-5', name: 'Fire', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', overlay: 'linear-gradient(135deg, rgba(241,39,17,0.7) 0%, rgba(245,175,25,0.7) 100%)' },
    { id: 'grad-6', name: 'Night Sky', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', overlay: 'linear-gradient(135deg, rgba(15,12,41,0.8) 0%, rgba(48,43,99,0.7) 50%, rgba(36,36,62,0.8) 100%)' },
    { id: 'grad-7', name: 'Dawn', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', overlay: 'linear-gradient(135deg, rgba(255,236,210,0.5) 0%, rgba(252,182,159,0.5) 100%)' },
    { id: 'grad-8', name: 'Royal', value: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)', overlay: 'linear-gradient(135deg, rgba(20,30,48,0.8) 0%, rgba(36,59,85,0.8) 100%)' },
    { id: 'grad-9', name: 'Transparent Dark', value: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)', overlay: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)' },
    { id: 'grad-10', name: 'Transparent Light', value: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)', overlay: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.7) 100%)' },
];

// Theme presets for Design tab
const THEMES = [
    { id: 'theme-white', name: 'Claro', background: '#ffffff', textColor: '#000000', accent: theme.colors.primary },
    { id: 'theme-dark', name: 'Oscuro', background: '#1a1a1a', textColor: '#ffffff', accent: '#3b82f6' },
    { id: 'theme-oasis', name: 'Oasis', background: 'linear-gradient(135deg, #5b2ea6 0%, #8b5cf6 100%)', textColor: '#ffffff', accent: '#f59e0b' },
    { id: 'theme-nature', name: 'Naturaleza', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', textColor: '#ffffff', accent: '#ffffff' },
    { id: 'theme-ocean', name: 'Océano', background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', textColor: '#ffffff', accent: '#ffffff' },
    { id: 'theme-gold', name: 'Premium', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', textColor: '#f1c40f', accent: '#f1c40f' },
];

// Default slide
const createDefaultSlide = () => ({
    id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    order: 0,
    background: '#ffffff',
    backgroundImage: '',
    elements: [],
});

// ===============================
// API Functions
// ===============================
const fetchPresentations = async () => {
    try {
        const data = await apiClient.get('/presentations');
        const normalized = (Array.isArray(data) ? data : []).map(p => ({
            ...p,
            slides: Array.isArray(p.slides) ? p.slides : [createDefaultSlide()]
        }));
        setPresentations(normalized);
    } catch (error) {
        console.error('Error fetching presentations:', error);
        setPresentations([]);
    } finally {
        setLoading(false);
    }
};

const createPresentation = async () => {
    const newPres = createDefaultPresentation();
    try {
        const created = await apiClient.post('/presentations', newPres);
        const normalized = {
            ...created,
            slides: Array.isArray(created.slides) ? created.slides : [createDefaultSlide()]
        };
        setPresentations(prev => [normalized, ...(prev || [])]);
        setCurrentPresentation(normalized);
        setSelectedSlide(0);
        setIsEditing(true);
    } catch (error) {
        console.error('Error creating presentation:', error);
        // Create locally if API fails
        const localPres = { ...newPres, id: `local-${Date.now()}` };
        setPresentations(prev => [localPres, ...(prev || [])]);
        setCurrentPresentation(localPres);
        setSelectedSlide(0);
        setIsEditing(true);
    }
};

const savePresentation = async () => {
    if (!currentPresentation) return;
    setSaving(true);
    try {
        const updated = await apiClient.put(`/presentations/${currentPresentation.id}`, currentPresentation);
        const normalized = {
            ...updated,
            slides: Array.isArray(updated.slides) ? updated.slides : getSlides(currentPresentation)
        };
        setPresentations(prev => (prev || []).map(p => p.id === normalized.id ? normalized : p));
        setCurrentPresentation(normalized);
    } catch (error) {
        console.error('Error saving:', error);
    } finally {
        setSaving(false);
    }
};

const deletePresentation = async (id) => {
    if (!window.confirm('¿Eliminar esta presentación?')) return;
    try {
        await apiClient.del(`/presentations/${id}`);
        setPresentations(prev => (prev || []).filter(p => p.id !== id));
        if (currentPresentation?.id === id) {
            setCurrentPresentation(null);
            setIsEditing(false);
        }
    } catch (error) {
        console.error('Error deleting:', error);
    }
};

// ===============================
// Image Library Functions
// ===============================
const openImageLibrary = (mode = 'element') => {
    setImageLibraryMode(mode);
    setShowImageLibrary(true);
    setImageLibraryCategory('all');
    setCustomImageUrl('');
};

const handleImageSelect = (image) => {
    if (imageLibraryMode === 'background') {
        updateSlideBackgroundImage(image.url);
    } else {
        addImageElement(image.url);
    }
    setShowImageLibrary(false);
};

const handleCustomImageAdd = () => {
    if (!customImageUrl.trim()) return;
    if (imageLibraryMode === 'background') {
        updateSlideBackgroundImage(customImageUrl);
    } else {
        addImageElement(customImageUrl);
    }
    setShowImageLibrary(false);
    setCustomImageUrl('');
};

const addImageElement = (src) => {
    if (!currentPresentation) return;
    const slides = getSlides(currentPresentation);
    const currentSlide = slides[selectedSlide];
    if (!currentSlide) return;

    const newElement = {
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'image',
        x: 100,
        y: 100,
        width: 250,
        height: 200,
        src: src,
        rotation: 0,
        opacity: 1,
        style: {
            borderRadius: 8,
            objectFit: 'cover',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
    };

    const updatedSlides = [...slides];
    updatedSlides[selectedSlide] = {
        ...currentSlide,
        elements: [...getElements(currentSlide), newElement]
    };
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
    setSelectedElement(newElement.id);
};

const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for local use
    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (imageLibraryMode === 'background') {
            updateSlideBackgroundImage(dataUrl);
        } else {
            addImageElement(dataUrl);
        }
    };
    reader.readAsDataURL(file);
    setShowImageLibrary(false);
};

// ===============================
// Element Management
// ===============================
const addElement = (type) => {
    if (!currentPresentation) return;
    const slides = getSlides(currentPresentation);
    const currentSlide = slides[selectedSlide];
    if (!currentSlide) return;

    const newElement = {
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        width: type === 'text' ? 400 : type === 'heading' ? 600 : 200,
        height: type === 'text' ? 80 : type === 'heading' ? 100 : 200,
        content: type === 'text' ? 'Haga clic para editar texto' : type === 'heading' ? 'Título' : '',
        rotation: 0,
        opacity: 1,
        style: {
            fontSize: type === 'heading' ? 48 : 24,
            fontFamily: 'AdventSans, sans-serif',
            fontWeight: type === 'heading' ? 'bold' : 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            color: theme.colors.text.primary,
            backgroundColor: type === 'shape' ? theme.colors.primary : 'transparent',
            borderRadius: type === 'shape' ? 8 : 0,
            textAlign: 'center',
            lineHeight: 1.4,
            padding: 12,
            border: 'none',
            boxShadow: 'none'
        }
    };

    const updatedSlides = [...slides];
    updatedSlides[selectedSlide] = {
        ...currentSlide,
        elements: [...getElements(currentSlide), newElement]
    };
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
    setSelectedElement(newElement.id);
};

const updateElement = (elementId, updates) => {
    if (!currentPresentation) return;
    const slides = getSlides(currentPresentation);
    const currentSlide = slides[selectedSlide];
    if (!currentSlide) return;

    const elements = getElements(currentSlide);
    const updatedElements = elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
    );
    const updatedSlides = [...slides];
    updatedSlides[selectedSlide] = { ...currentSlide, elements: updatedElements };
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
};

const updateElementStyle = (elementId, styleUpdates) => {
    if (!currentPresentation) return;
    const slides = getSlides(currentPresentation);
    const currentSlide = slides[selectedSlide];
    if (!currentSlide) return;

    const elements = getElements(currentSlide);
    const updatedElements = elements.map(el =>
        el.id === elementId ? { ...el, style: { ...el.style, ...styleUpdates } } : el
    );
    const updatedSlides = [...slides];
    updatedSlides[selectedSlide] = { ...currentSlide, elements: updatedElements };
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
};

const deleteElement = (elementId) => {
    if (!currentPresentation) return;
    const slides = getSlides(currentPresentation);
    const currentSlide = slides[selectedSlide];
    if (!currentSlide) return;

    const elements = getElements(currentSlide);
    const updatedSlides = [...slides];
    updatedSlides[selectedSlide] = {
        ...currentSlide,
        elements: elements.filter(el => el.id !== elementId)
    };
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
    setSelectedElement(null);
};

const moveElement = (elementId, direction) => {
    if (!currentPresentation) return;
    const slides = getSlides(currentPresentation);
    const currentSlide = slides[selectedSlide];
    if (!currentSlide) return;

    const elements = getElements(currentSlide);
    const index = elements.findIndex(el => el.id === elementId);
    if (index === -1) return;

    const newElements = [...elements];
    if (direction === 'up' && index < elements.length - 1) {
        [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
    } else if (direction === 'down' && index > 0) {
        [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
    }

    const updatedSlides = [...slides];
    updatedSlides[selectedSlide] = { ...currentSlide, elements: newElements };
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
};

// ===============================
// Touch & Keyboard Navigation
// ===============================
const handleTouchStart = useCallback((e) => {
    if (!isPresentMode) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
}, [isPresentMode]);

const handleTouchEnd = useCallback((e) => {
    if (!isPresentMode || !currentPresentation) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const threshold = 50;
    const slides = getSlides(currentPresentation);

    if (Math.abs(deltaX) > threshold) {
        if (deltaX < 0 && selectedSlide < slides.length - 1) {
            setSelectedSlide(prev => prev + 1);
        } else if (deltaX > 0 && selectedSlide > 0) {
            setSelectedSlide(prev => prev - 1);
        }
    }
}, [isPresentMode, currentPresentation, selectedSlide]);

useEffect(() => {
    if (!isPresentMode) return;
    const handleKeyDown = (e) => {
        const slides = getSlides(currentPresentation);
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            setSelectedSlide(prev => Math.min(prev + 1, slides.length - 1));
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setSelectedSlide(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Escape') {
            setIsPresentMode(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [isPresentMode, currentPresentation]);

// ===============================
// Open presentation for editing or presenting
// ===============================
const openPresentation = (presentation, forPresenting = false) => {
    const normalized = {
        ...presentation,
        slides: Array.isArray(presentation.slides) ? presentation.slides : [createDefaultSlide()]
    };
    setCurrentPresentation(normalized);
    setSelectedSlide(0);
    if (forPresenting) {
        setIsPresentMode(true);
    } else {
        setIsEditing(true);
    }
};

// ===============================
// Current slide data helper
// ===============================
const getCurrentSlideData = () => getSlide(currentPresentation, selectedSlide);
const getSelectedElementData = () => {
    const slide = getCurrentSlideData();
    if (!slide || !selectedElement) return null;
    return getElements(slide).find(el => el.id === selectedElement) || null;
};

// ===============================
// Image Library Modal
// ===============================
const ImageLibraryModal = () => {
    const allImages = [
        ...IMAGE_LIBRARY.logos,
        ...IMAGE_LIBRARY.social,
        ...IMAGE_LIBRARY.backgrounds,
        ...IMAGE_LIBRARY.decorative
    ];

    const filteredImages = imageLibraryCategory === 'all'
        ? allImages
        : IMAGE_LIBRARY[imageLibraryCategory] || [];

    const categories = [
        { id: 'all', name: 'Todos', icon: 'bi-grid-3x3-gap' },
        { id: 'logos', name: 'Logos Oasis', icon: 'bi-award' },
        { id: 'social', name: 'Redes Sociales', icon: 'bi-share' },
        { id: 'backgrounds', name: 'Fondos', icon: 'bi-image' },
        { id: 'decorative', name: 'Decorativos', icon: 'bi-stars' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 9998,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
            onClick={() => setShowImageLibrary(false)}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    ...glassCard,
                    width: '90%',
                    maxWidth: '900px',
                    maxHeight: '85vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
                    <h5 className="mb-0 fw-bold" style={{ color: theme.colors.primary }}>
                        <i className="bi bi-images me-2"></i>
                        {imageLibraryMode === 'background' ? 'Seleccionar Fondo' : 'Biblioteca de Imágenes'}

                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Categories */}
                <div className="px-4 py-3 border-bottom" style={{ background: 'rgba(91,46,166,0.03)' }}>
                    <div className="d-flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setImageLibraryCategory(cat.id)}
                                className={`btn btn-sm rounded-pill ${imageLibraryCategory === cat.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                            >
                                <i className={`bi ${cat.icon} me-1`}></i>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom URL / Upload */}
                <div className="px-4 py-3 border-bottom">
                    <div className="row g-2 align-items-center">
                        <div className="col">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Pegar URL de imagen..."
                                    value={customImageUrl}
                                    onChange={(e) => setCustomImageUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCustomImageAdd()}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCustomImageAdd}
                                    disabled={!customImageUrl.trim()}
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                        <div className="col-auto">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <i className="bi bi-upload me-1"></i>
                                Subir imagen
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gradients section (only for backgrounds) */}
                {imageLibraryMode === 'background' && (
                    <div className="px-4 py-3 border-bottom">
                        <h6 className="small fw-bold text-muted mb-2">
                            <i className="bi bi-palette me-1"></i> Degradados
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                            {GRADIENT_PRESETS.map(grad => (
                                <button
                                    key={grad.id}
                                    onClick={() => {
                                        updateSlideBackgroundImage('', grad.value);
                                        setShowImageLibrary(false);
                                    }}
                                    className="btn btn-sm p-0 rounded"
                                    style={{
                                        width: 60,
                                        height: 40,
                                        background: grad.value,
                                        border: '2px solid #fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}
                                    title={grad.name}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Image Grid */}
                <div className="flex-grow-1 overflow-auto p-4">
                    <div className="row g-3">
                        {filteredImages.map(img => (
                            <div key={img.id} className="col-6 col-sm-4 col-md-3">
                                <motion.div
                                    whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(91,46,166,0.25)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleImageSelect(img)}
                                    style={{
                                        aspectRatio: img.category === 'backgrounds' ? '16/9' : '1/1',
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        background: '#f8f9fa',
                                        border: '2px solid transparent',
                                        position: 'relative'
                                    }}
                                    className="shadow-sm"
                                >
                                    <img
                                        src={img.url}
                                        alt={img.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: img.category === 'backgrounds' ? 'cover' : 'contain',
                                            padding: img.category === 'backgrounds' ? 0 : 12
                                        }}
                                    />
                                    <div
                                        className="position-absolute bottom-0 start-0 end-0 p-2 text-white text-center small"
                                        style={{
                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        {img.name}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    {filteredImages.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-image display-4 mb-3 d-block opacity-50"></i>
                            <p>No hay imágenes en esta categoría</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ===============================
// Presentation Mode
// ===============================
const PresentationMode = () => {
    const slides = getSlides(currentPresentation);
    const currentSlideData = slides[selectedSlide] || createDefaultSlide();
    const elements = getElements(currentSlideData);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: '#0a0a0a',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
            id="presentation-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Exit button */}
            <button
                onClick={() => setIsPresentMode(false)}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 50,
                    height: 50,
                    color: '#fff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    zIndex: 10000
                }}
            >
                <i className="bi bi-x-lg"></i>
            </button>

            {/* Slide counter */}
            <div style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#fff',
                fontSize: '1rem',
                opacity: 0.7
            }}>
                {selectedSlide + 1} / {slides.length}
            </div>

            {/* Slide content */}
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={currentSlideData.id || selectedSlide}
                    initial={
                        currentSlideData.transitionType === 'infinite' ? { opacity: 0, scale: 0.5, x: 200 } :
                            currentSlideData.transitionType === 'slide' ? { x: '100%' } :
                                currentSlideData.transitionType === 'zoom' ? { scale: 0.8, opacity: 0 } :
                                    { opacity: 0 }
                    }
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={
                        currentSlideData.transitionType === 'infinite' ? { opacity: 0, scale: 2, x: -200 } :
                            currentSlideData.transitionType === 'slide' ? { x: '-100%' } :
                                currentSlideData.transitionType === 'zoom' ? { scale: 1.2, opacity: 0 } :
                                    { opacity: 0 }
                    }
                    transition={{
                        duration: currentSlideData.transitionType === 'infinite' ? 0.8 : 0.4,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: '90vw',
                        maxWidth: '1200px',
                        aspectRatio: '16/9',
                        background: currentSlideData.backgroundGradient || currentSlideData.background || '#fff',
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}
                >
                    <SlideContent
                        slide={currentSlideData}
                        scale={Math.min(window.innerWidth * 0.9, 1200) / VIRTUAL_WIDTH}
                        isPresenting={true}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {selectedSlide > 0 && (
                <button
                    onClick={() => setSelectedSlide(prev => prev - 1)}
                    style={{
                        position: 'absolute',
                        left: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        color: '#fff',
                        fontSize: '2rem',
                        cursor: 'pointer'
                    }}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
            )}
            {selectedSlide < slides.length - 1 && (
                <button
                    onClick={() => setSelectedSlide(prev => prev + 1)}
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        color: '#fff',
                        fontSize: '2rem',
                        cursor: 'pointer'
                    }}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            )}
        </motion.div>
    );
};

// ===============================
// Text Formatting Toolbar
// ===============================
const TextFormattingToolbar = ({ element }) => {
    const isDisabled = element.disabled || (element.type !== 'text' && element.type !== 'heading');

    return (
        <div className={`d-flex flex-wrap align-items-center gap-2 p-2 mb-3 ${isDisabled ? 'opacity-50' : ''}`}
            style={{ ...glassCard, padding: '8px', pointerEvents: isDisabled ? 'none' : 'auto' }}>
            {/* Font Family */}
            <select
                className="form-select form-select-sm"
                style={{ width: '140px' }}
                value={element.style?.fontFamily?.split(',')[0] || 'AdventSans'}
                onChange={(e) => updateElementStyle(element.id, { fontFamily: `${e.target.value}, sans-serif` })}
            >
                {FONTS.map(font => (
                    <option key={font.name} value={font.name}>{font.label}</option>
                ))}
            </select>

            {/* Font Size */}
            <select
                className="form-select form-select-sm"
                style={{ width: '80px' }}
                value={element.style?.fontSize || 24}
                onChange={(e) => updateElementStyle(element.id, { fontSize: parseInt(e.target.value) })}
            >
                {[12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96].map(size => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>

            {/* Bold */}
            <button
                className={`btn btn-sm ${element.style?.fontWeight === 'bold' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => updateElementStyle(element.id, { fontWeight: element.style?.fontWeight === 'bold' ? 'normal' : 'bold' })}
                title="Negrita"
            >
                <i className="bi bi-type-bold"></i>
            </button>

            {/* Italic */}
            <button
                className={`btn btn-sm ${element.style?.fontStyle === 'italic' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => updateElementStyle(element.id, { fontStyle: element.style?.fontStyle === 'italic' ? 'normal' : 'italic' })}
                title="Cursiva"
            >
                <i className="bi bi-type-italic"></i>
            </button>

            {/* Underline */}
            <button
                className={`btn btn-sm ${element.style?.textDecoration === 'underline' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => updateElementStyle(element.id, { textDecoration: element.style?.textDecoration === 'underline' ? 'none' : 'underline' })}
                title="Subrayado"
            >
                <i className="bi bi-type-underline"></i>
            </button>

            {/* Text Align */}
            <div className="btn-group">
                <button
                    className={`btn btn-sm ${element.style?.textAlign === 'left' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => updateElementStyle(element.id, { textAlign: 'left' })}
                >
                    <i className="bi bi-text-left"></i>
                </button>
                <button
                    className={`btn btn-sm ${element.style?.textAlign === 'center' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => updateElementStyle(element.id, { textAlign: 'center' })}
                >
                    <i className="bi bi-text-center"></i>
                </button>
                <button
                    className={`btn btn-sm ${element.style?.textAlign === 'right' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => updateElementStyle(element.id, { textAlign: 'right' })}
                >
                    <i className="bi bi-text-right"></i>
                </button>
            </div>

            {/* Text Color */}
            <div className="d-flex align-items-center gap-1">
                <span className="small text-muted">Color:</span>
                <input
                    type="color"
                    className="form-control form-control-color p-0"
                    style={{ width: 30, height: 30 }}
                    value={element.style?.color || '#000000'}
                    onChange={(e) => updateElementStyle(element.id, { color: e.target.value })}
                />
            </div>

            {/* Quick colors */}
            <div className="d-flex gap-1">
                {COLORS.slice(0, 6).map(color => (
                    <button
                        key={color}
                        className="btn btn-sm p-0"
                        style={{
                                                    width: 24,
                                                    height: 24,
                                                    background: color,
                                                    border: currentSlideData.background === color ? `2px solid ${theme.colors.primary}` : '2px solid #ddd',
                                                    borderRadius: 4
                                                }}
                                                onClick={() => {
                                                    updateSlideBackground(color);
                                                    updateSlideBackgroundImage('', null);
                                                }}
                    />
                ))}
            </div>
        </div>
    );
};

// ===============================
// Editor View
// ===============================
const EditorView = () => {
    const slides = getSlides(currentPresentation);
    const currentSlideData = getCurrentSlideData() || createDefaultSlide();
    const elements = getElements(currentSlideData);
    const selectedEl = getSelectedElementData();

    return (
        <div className="row g-2">
            {/* Ribbon Interface - PowerPoint Style */}
            <div className="col-12 mb-2">
                <div style={{ ...glassCard, borderRadius: '12px 12px 4px 4px' }} className="overflow-hidden">
                    {/* Tabs Navigation */}
                    <div className="d-flex border-bottom bg-light px-2" style={{ gap: '2px' }}>
                        {['Inicio', 'Insertar', 'Diseño', 'Transiciones'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                style={{
                                    border: 'none',
                                    background: activeTab === tab.toLowerCase() ? '#fff' : 'transparent',
                                    borderBottom: activeTab === tab.toLowerCase() ? `3px solid ${theme.colors.primary}` : 'none',
                                    padding: '6px 20px',
                                    fontSize: '0.85rem',
                                    fontWeight: activeTab === tab.toLowerCase() ? 'bold' : 'normal',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                        <div className="ms-auto d-flex align-items-center gap-2 px-3">
                            <input type="file" ref={importInputRef} onChange={importPresentation} style={{ display: 'none' }} accept=".json" />
                            <button onClick={() => importInputRef.current.click()} className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }}>
                                <i className="bi bi-file-earmark-arrow-up me-1"></i> Importar
                            </button>
                            <button onClick={savePresentation} disabled={saving} className="btn btn-sm btn-success px-4" style={{ borderRadius: '6px' }}>
                                <i className={`bi ${saving ? 'bi-hourglass-split' : 'bi-save'} me-1`}></i> Guardar
                            </button>
                            <button onClick={() => setIsPresentMode(true)} className="btn btn-sm btn-primary px-4" style={{ borderRadius: '6px' }}>
                                <i className="bi bi-play-fill me-1"></i> Proyectar
                            </button>
                            <button onClick={handleExportPDF} className="btn btn-sm btn-outline-danger px-3" style={{ borderRadius: '6px' }}>
                                <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                            </button>
                            <button onClick={handleExportPPTX} className="btn btn-sm btn-outline-warning px-3" style={{ borderRadius: '6px' }}>
                                <i className="bi bi-file-earmark-slides me-1"></i> Exportar PPTX
                            </button>
                        </div>
                    </div>

                    {/* ribbon Content */}
                    <div className="p-3 bg-white d-flex align-items-center gap-4 flex-wrap" style={{ minHeight: '80px' }}>
                        {activeTab === 'inicio' && (
                            <>
                                {/* Grupo: Portapapeles */}
                                <div className="d-flex flex-column align-items-center px-3 border-end">
                                    <div className="d-flex gap-2 mb-1">
                                        <button onClick={pasteElement} className="btn btn-light d-flex flex-column align-items-center py-1 px-3" style={{ fontSize: '0.7rem' }}>
                                            <i className="bi bi-clipboard fs-4"></i>
                                            <span style={{ marginTop: '2px' }}>Pegar</span>
                                        </button>
                                        <div className="d-flex flex-column gap-1">
                                            <button onClick={cutElement} className="btn btn-sm btn-light py-0 px-2 text-start" style={{ fontSize: '0.65rem' }}><i className="bi bi-scissors me-1"></i>Cortar</button>
                                            <button onClick={copyElement} className="btn btn-sm btn-light py-0 px-2 text-start" style={{ fontSize: '0.65rem' }}><i className="bi bi-files me-1"></i>Copiar</button>
                                        </div>
                                    </div>
                                    <span className="small text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Portapapeles</span>
                                </div>

                                {/* Grupo: Diapositivas */}
                                <div className="d-flex flex-column align-items-center px-3 border-end">
                                    <div className="d-flex gap-2 mb-1">
                                        <button onClick={addSlide} className="btn btn-light d-flex flex-column align-items-center py-1 px-3" style={{ fontSize: '0.7rem' }}>
                                            <i className="bi bi-plus-square fs-4 text-success"></i>
                                            <span style={{ marginTop: '2px' }}>Nueva</span>
                                        </button>
                                        <div className="d-flex flex-column gap-1 justify-content-center">
                                            <button className="btn btn-sm btn-light py-0 px-2 text-start" style={{ fontSize: '0.65rem' }}><i className="bi bi-layout-text-sidebar me-1"></i>Diseño</button>
                                            <button className="btn btn-sm btn-light py-0 px-2 text-start" style={{ fontSize: '0.65rem' }}><i className="bi bi-arrow-repeat me-1"></i>Restablecer</button>
                                        </div>
                                    </div>
                                    <span className="small text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Diapositivas</span>
                                </div>

                                {/* Grupo: Fuente */}
                                <div className="d-flex flex-column align-items-center px-3 border-end">
                                    <div className="d-flex flex-column gap-1 mb-1">
                                        <div className="d-flex gap-1">
                                            <select
                                                className="form-select form-select-sm py-0"
                                                style={{ fontSize: '0.75rem', width: '130px', height: '24px' }}
                                                value={selectedEl?.style?.fontFamily || 'Arial'}
                                                onChange={(e) => updateElementStyle(selectedEl?.id, { fontFamily: e.target.value })}
                                                disabled={!selectedEl}
                                            >
                                                {FONTS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                                            </select>
                                            <select
                                                className="form-select form-select-sm py-0"
                                                style={{ fontSize: '0.75rem', width: '60px', height: '24px' }}
                                                value={selectedEl?.style?.fontSize?.replace('px', '') || '24'}
                                                onChange={(e) => updateElementStyle(selectedEl?.id, { fontSize: `${e.target.value}px` })}
                                                disabled={!selectedEl}
                                            >
                                                {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 84, 96].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <button onClick={() => updateElementStyle(selectedEl?.id, { fontWeight: selectedEl?.style?.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`btn btn-sm btn-light py-0 px-2 ${selectedEl?.style?.fontWeight === 'bold' ? 'active' : ''}`} style={{ fontSize: '0.75rem' }} disabled={!selectedEl}><b>N</b></button>
                                            <button onClick={() => updateElementStyle(selectedEl?.id, { fontStyle: selectedEl?.style?.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`btn btn-sm btn-light py-0 px-2 ${selectedEl?.style?.fontStyle === 'italic' ? 'active' : ''}`} style={{ fontSize: '0.75rem' }} disabled={!selectedEl}><i>K</i></button>
                                            <button onClick={() => updateElementStyle(selectedEl?.id, { textDecoration: selectedEl?.style?.textDecoration === 'underline' ? 'none' : 'underline' })} className={`btn btn-sm btn-light py-0 px-2 ${selectedEl?.style?.textDecoration === 'underline' ? 'active' : ''}`} style={{ fontSize: '0.75rem' }} disabled={!selectedEl}><u>S</u></button>
                                            <div className="vr mx-1"></div>
                                            <input
                                                type="color"
                                                className="form-control form-control-color p-0 border-0"
                                                style={{ width: 20, height: 20, background: 'none' }}
                                                value={selectedEl?.style?.color || '#000000'}
                                                onChange={(e) => updateElementStyle(selectedEl?.id, { color: e.target.value })}
                                                disabled={!selectedEl}
                                            />
                                        </div>
                                    </div>
                                    <span className="small text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Fuente</span>
                                </div>

                                {/* Grupo: Párrafo */}
                                <div className="d-flex flex-column align-items-center px-3 border-end">
                                    <div className="d-flex flex-column gap-1 mb-1 justify-content-center h-100">
                                        <div className="d-flex gap-1">
                                            <button onClick={() => updateElementStyle(selectedEl?.id, { textAlign: 'left' })} className={`btn btn-sm btn-light py-0 px-2 ${selectedEl?.style?.textAlign === 'left' ? 'active' : ''}`} disabled={!selectedEl}><i className="bi bi-text-left"></i></button>
                                            <button onClick={() => updateElementStyle(selectedEl?.id, { textAlign: 'center' })} className={`btn btn-sm btn-light py-0 px-2 ${selectedEl?.style?.textAlign === 'center' ? 'active' : ''}`} disabled={!selectedEl}><i className="bi bi-text-center"></i></button>
                                            <button onClick={() => updateElementStyle(selectedEl?.id, { textAlign: 'right' })} className={`btn btn-sm btn-light py-0 px-2 ${selectedEl?.style?.textAlign === 'right' ? 'active' : ''}`} disabled={!selectedEl}><i className="bi bi-text-right"></i></button>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <button className="btn btn-sm btn-light py-0 px-2" disabled={!selectedEl}><i className="bi bi-list-ul"></i></button>
                                            <button className="btn btn-sm btn-light py-0 px-2" disabled={!selectedEl}><i className="bi bi-list-ol"></i></button>
                                            <button className="btn btn-sm btn-light py-0 px-2" disabled={!selectedEl}><i className="bi bi-distribute-vertical"></i></button>
                                        </div>
                                    </div>
                                    <span className="small text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Párrafo</span>
                                </div>

                                {/* Grupo: Dibujo */}
                                <div className="d-flex flex-column align-items-center px-3">
                                    <div className="d-flex gap-2 mb-1">
                                        <div className="d-flex flex-wrap gap-1" style={{ width: '80px' }}>
                                            {['square', 'circle', 'triangle'].map(shape => (
                                                <button key={shape} onClick={() => addElement('shape', { shapeType: shape })} className="btn btn-sm btn-light p-1" style={{ width: '24px', height: '24px' }}>
                                                    <i className={`bi bi-${shape === 'square' ? 'square' : shape === 'circle' ? 'circle' : 'triangle'}`}></i>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="d-flex flex-column gap-1">
                                            <button onClick={() => moveElement(selectedEl?.id, 'up')} className="btn btn-sm btn-light py-0 px-2 text-start" style={{ fontSize: '0.65rem' }} disabled={!selectedEl}><i className="bi bi-layer-forward me-1"></i>Organizar</button>
                                            <button className="btn btn-sm btn-light py-0 px-2 text-start" style={{ fontSize: '0.65rem' }} disabled={!selectedEl}><i className="bi bi-palette me-1"></i>Estilos</button>
                                        </div>
                                    </div>
                                    <span className="small text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Dibujo</span>
                                </div>
                            </>
                        )}

                        {activeTab === 'insertar' && (
                            <>
                                <div className="d-flex gap-3">
                                    <div className="d-flex flex-column align-items-center">
                                        <button onClick={() => addElement('heading')} className="btn btn-light mb-1"><i className="bi bi-type-h1 fs-4"></i></button>
                                        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>Título</span>
                                    </div>
                                    <div className="d-flex flex-column align-items-center">
                                        <button onClick={() => addElement('text')} className="btn btn-light mb-1"><i className="bi bi-fonts fs-4"></i></button>
                                        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>Texto</span>
                                    </div>
                                    <div className="d-flex flex-column align-items-center">
                                        <button onClick={() => addElement('shape')} className="btn btn-light mb-1"><i className="bi bi-square fs-4"></i></button>
                                        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>Forma</span>
                                    </div>
                                    <div className="vr mx-2"></div>
                                    <div className="d-flex flex-column align-items-center">
                                        <button onClick={() => openImageLibrary('element')} className="btn btn-light mb-1"><i className="bi bi-image fs-4"></i></button>
                                        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>Imagen</span>
                                    </div>
                                    <div className="d-flex flex-column align-items-center">
                                        <button
                                            onClick={() => addImageElement(IMAGE_LIBRARY.logos[0].url)}
                                            className="btn btn-light mb-1"
                                        >
                                            <img src={IMAGE_LIBRARY.logos[0].url} alt="" style={{ width: 24, height: 24 }} />
                                        </button>
                                        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>Logo Oasis</span>
                                    </div>
                                    <div className="d-flex flex-column align-items-center">
                                        <button
                                            onClick={() => { setImageLibraryCategory('social'); openImageLibrary('element'); }}
                                            className="btn btn-light mb-1"
                                        >
                                            <i className="bi bi-share fs-4"></i>
                                        </button>
                                        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>Redes</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'diseño' && (
                            <>
                                <div className="d-flex flex-column align-items-center px-3 border-end">
                                    <button onClick={() => openImageLibrary('background')} className="btn btn-light mb-1"><i className="bi bi-card-image fs-4"></i></button>
                                    <span className="small text-muted" style={{ fontSize: '0.7rem' }}>Fondo</span>
                                </div>
                                <div className="d-flex flex-column align-items-center px-3">
                                    <div className="d-flex gap-2 mb-1 overflow-auto" style={{ maxWidth: '400px', paddingBottom: '5px' }}>
                                        {THEMES.map(theme => (
                                            <button
                                                key={theme.id}
                                                onClick={() => applyTheme(theme)}
                                                className="btn btn-sm p-0 flex-shrink-0"
                                                style={{
                                                    width: '70px',
                                                    height: '40px',
                                                    background: theme.background,
                                                    border: '2px solid #ddd',
                                                    borderRadius: '4px',
                                                    position: 'relative'
                                                }}
                                                title={theme.name}
                                            >
                                                <span style={{ fontSize: '0.5rem', color: theme.textColor, position: 'absolute', top: 2, left: 4 }}>Aa</span>
                                                <div style={{ position: 'absolute', bottom: 2, right: 4, width: '10px', height: '10px', background: theme.accent, borderRadius: '50%' }}></div>
                                            </button>
                                        ))}
                                    </div>
                                    <span className="small text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Temas</span>
                                </div>
                                <div className="vr mx-2"></div>
                                <div className="d-flex flex-wrap gap-1 align-content-center" style={{ maxWidth: '200px' }}>
                                    {COLORS.map(color => (
                                        <button key={color} onClick={() => updateSlideBackground(color)} style={{ width: 20, height: 20, background: color, border: '1px solid #ddd', borderRadius: '2px' }} />
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'transiciones' && (
                            <>
                                <div className="d-flex gap-3 align-items-center">
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: '220px' }}
                                        value={currentSlideData.transitionType || 'fade'}
                                        onChange={(e) => {
                                            const slides = getSlides(currentPresentation);
                                            const updatedSlides = [...slides];
                                            updatedSlides[selectedSlide] = { ...updatedSlides[selectedSlide], transitionType: e.target.value };
                                            setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
                                        }}
                                    >
                                        <option value="fade">Desvanecer (Estándar)</option>
                                        <option value="morph">Transformar (PowerPoint Morph)</option>
                                        <option value="infinite">Movimiento Infinito (Prezi)</option>
                                        <option value="slide">Deslizar</option>
                                        <option value="zoom">Zoom</option>
                                    </select>
                                    <span className="small text-muted">Aplica a esta diapositiva</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Slide Panel (Left) */}
                <div className="col-12 col-lg-2">
                    <div style={glassCard} className="p-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="fw-bold small text-muted">Diapositivas</span>
                            <button onClick={addSlide} className="btn btn-sm btn-primary rounded-circle" style={{ width: 28, height: 28, padding: 0 }}>
                                <i className="bi bi-plus"></i>
                            </button>
                        </div>
                        <div className="d-flex flex-column gap-2" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            {slides.map((slide, index) => (
                                <motion.div
                                    key={slide.id || index}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setSelectedSlide(index); setSelectedElement(null); }}
                                    className="position-relative"
                                    style={{
                                        aspectRatio: '16/9',
                                        background: slide.backgroundGradient || slide.background || '#fff',
                                        borderRadius: 8,
                                        border: selectedSlide === index ? `2px solid ${theme.colors.primary}` : '1px solid #ddd',
                                        cursor: 'pointer',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Thumbnail background image */}
                                    {slide.backgroundImage && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundImage: `url(${slide.backgroundImage})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }} />
                                    )}
                                    {slide.backgroundImage && slide.backgroundGradient && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: GRADIENT_PRESETS.find(g => g.value === slide.backgroundGradient)?.overlay || slide.backgroundGradient
                                        }} />
                                    )}

                                    <span className="position-absolute" style={{ top: 4, left: 6, fontSize: '0.65rem', fontWeight: 'bold', color: '#666', background: 'rgba(255,255,255,0.8)', padding: '0 4px', borderRadius: 3, zIndex: 2 }}>
                                        {index + 1}
                                    </span>
                                    {/* Mini preview */}
                                    <div style={{ position: 'absolute', inset: 0 }}>
                                        <SlideContent
                                            slide={slide}
                                            scale={150 / VIRTUAL_WIDTH}
                                            isPresenting={true}
                                        />
                                    </div>
                                    {/* Actions */}
                                    <div className="position-absolute d-flex gap-1" style={{ bottom: 3, right: 3 }}>
                                        <button onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }} className="btn btn-sm p-0" style={{ width: 18, height: 18, fontSize: '0.55rem', background: 'rgba(255,255,255,0.9)' }}>
                                            <i className="bi bi-copy"></i>
                                        </button>
                                        {slides.length > 1 && (
                                            <button onClick={(e) => { e.stopPropagation(); deleteSlide(index); }} className="btn btn-sm p-0" style={{ width: 18, height: 18, fontSize: '0.55rem', background: 'rgba(255,255,255,0.9)', color: '#dc3545' }}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Canvas (Center) */}
                <div className="col-12 col-lg-7">
                    <div style={glassCard} className="p-3">
                        {/* Element Toolbar */}
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-3 pb-3 border-bottom">
                            <div className="btn-group">
                                <button onClick={() => addElement('heading')} className="btn btn-outline-primary btn-sm">
                                    <i className="bi bi-type-h1 me-1"></i> Título
                                </button>
                                <button onClick={() => addElement('text')} className="btn btn-outline-primary btn-sm">
                                    <i className="bi bi-fonts me-1"></i> Texto
                                </button>
                            </div>
                            <button onClick={() => addElement('shape')} className="btn btn-outline-primary btn-sm">
                                <i className="bi bi-square me-1"></i> Forma
                            </button>
                            <button onClick={() => openImageLibrary('element')} className="btn btn-outline-primary btn-sm">
                                <i className="bi bi-image me-1"></i> Imagen
                            </button>
                            <button onClick={() => openImageLibrary('background')} className="btn btn-outline-secondary btn-sm">
                                <i className="bi bi-card-image me-1"></i> Fondo
                            </button>

                            {/* Quick Logo Access */}
                            <div className="vr mx-1"></div>
                            <div className="btn-group">
                                <button
                                    onClick={() => addImageElement(IMAGE_LIBRARY.logos[0].url)}
                                    className="btn btn-outline-info btn-sm"
                                    title="Logo Oasis Principal"
                                >
                                    <img src={IMAGE_LIBRARY.logos[0].url} alt="" style={{ width: 16, height: 16 }} />
                                </button>
                                <button
                                    onClick={() => {
                                        setImageLibraryCategory('social');
                                        openImageLibrary('element');
                                    }}
                                    className="btn btn-outline-info btn-sm"
                                    title="Redes Sociales"
                                >
                                    <i className="bi bi-share"></i>
                                </button>
                            </div>
                            <div className="ms-auto d-flex gap-2">
                                {/* Moved to Ribbon UI */}
                            </div>
                        </div>

                        {/* Canvas */}
                        <div
                            ref={canvasRef}
                            style={{
                                aspectRatio: '16/9',
                                background: currentSlideData.backgroundGradient || currentSlideData.background || '#fff',
                                borderRadius: 12,
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.1)'
                            }}
                            onClick={() => setSelectedElement(null)}
                        >
                            {canvasRef.current && (
                                <SlideContent
                                    slide={currentSlideData}
                                    scale={canvasRef.current.offsetWidth / VIRTUAL_WIDTH}
                                    selectedElement={selectedElement}
                                    setSelectedElement={setSelectedElement}
                                    editingTextId={editingTextId}
                                    setEditingTextId={setEditingTextId}
                                    updateElement={updateElement}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Properties Panel (Right) */}
                <div className="col-12 col-lg-3">
                    <div style={glassCard} className="p-3">
                        {selectedEl ? (
                            <>
                                <h6 className="fw-bold mb-3">
                                    <i className="bi bi-sliders me-2"></i>
                                    Propiedades
                                </h6>
                                <div className="d-flex flex-column gap-3">
                                    {/* Position */}
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="form-label small text-muted mb-1">X</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={Math.round(selectedEl.x)}
                                                onChange={(e) => updateElement(selectedEl.id, { x: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small text-muted mb-1">Y</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={Math.round(selectedEl.y)}
                                                onChange={(e) => updateElement(selectedEl.id, { y: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    {/* Size */}
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="form-label small text-muted mb-1">Ancho</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={selectedEl.width}
                                                onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) || 100 })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small text-muted mb-1">Alto</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={selectedEl.height || 'auto'}
                                                onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) || 100 })}
                                            />
                                        </div>
                                    </div>

                                    {/* Rotation */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">Rotación: {selectedEl.rotation || 0}°</label>
                                        <input
                                            type="range"
                                            className="form-range"
                                            min="-180"
                                            max="180"
                                            value={selectedEl.rotation || 0}
                                            onChange={(e) => updateElement(selectedEl.id, { rotation: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    {/* Opacity */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">Opacidad: {Math.round((selectedEl.opacity || 1) * 100)}%</label>
                                        <input
                                            type="range"
                                            className="form-range"
                                            min="0"
                                            max="100"
                                            value={(selectedEl.opacity || 1) * 100}
                                            onChange={(e) => updateElement(selectedEl.id, { opacity: parseInt(e.target.value) / 100 })}
                                        />
                                    </div>

                                    {/* Background color for shapes/text */}
                                    {(selectedEl.type === 'shape' || selectedEl.type === 'text' || selectedEl.type === 'heading') && (
                                        <div>
                                            <label className="form-label small text-muted mb-1">Color de fondo</label>
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color"
                                                    style={{ width: 40, height: 35 }}
                                                    value={selectedEl.style?.backgroundColor === 'transparent' ? '#ffffff' : (selectedEl.style?.backgroundColor || '#ffffff')}
                                                    onChange={(e) => updateElementStyle(selectedEl.id, { backgroundColor: e.target.value })}
                                                />
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => updateElementStyle(selectedEl.id, { backgroundColor: 'transparent' })}
                                                >
                                                    Sin fondo
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Border Radius */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">Bordes redondeados: {selectedEl.style?.borderRadius || 0}px</label>
                                        <input
                                            type="range"
                                            className="form-range"
                                            min="0"
                                            max="100"
                                            value={selectedEl.style?.borderRadius || 0}
                                            onChange={(e) => updateElementStyle(selectedEl.id, { borderRadius: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    {/* Image URL */}
                                    {selectedEl.type === 'image' && (
                                        <div>
                                            <label className="form-label small text-muted mb-1">URL de imagen</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="https://..."
                                                value={selectedEl.src || ''}
                                                onChange={(e) => updateElement(selectedEl.id, { src: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {/* Layer controls */}
                                    <div className="d-flex gap-2">
                                        <button
                                            onClick={() => moveElement(selectedEl.id, 'up')}
                                            className="btn btn-sm btn-outline-secondary flex-fill"
                                            title="Traer al frente"
                                        >
                                            <i className="bi bi-layer-forward"></i> Adelante
                                        </button>
                                        <button
                                            onClick={() => moveElement(selectedEl.id, 'down')}
                                            className="btn btn-sm btn-outline-secondary flex-fill"
                                            title="Enviar atrás"
                                        >
                                            <i className="bi bi-layer-backward"></i> Atrás
                                        </button>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => deleteElement(selectedEl.id)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <i className="bi bi-trash me-1"></i> Eliminar elemento
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h6 className="fw-bold mb-3">
                                    <i className="bi bi-easel me-2"></i>
                                    Diapositiva
                                </h6>
                                <div className="d-flex flex-column gap-3">
                                    {/* Solid Color */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">
                                            <i className="bi bi-palette-fill me-1"></i> Color sólido
                                        </label>
                                        <div className="d-flex flex-wrap gap-1 mb-2">
                                            {COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    className="btn btn-sm p-0"
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        background: color,
                                                        border: currentSlideData.background === color ? `2px solid ${theme.colors.primary}` : '2px solid #ddd',
                                                        borderRadius: 4
                                                    }}
                                                    onClick={() => {
                                                        updateSlideBackground(color);
                                                        updateSlideBackgroundImage('', null);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <input
                                            type="color"
                                            className="form-control form-control-color w-100"
                                            value={currentSlideData.background || '#ffffff'}
                                            onChange={(e) => {
                                                updateSlideBackground(e.target.value);
                                                updateSlideBackgroundImage('', null);
                                            }}
                                        />
                                    </div>

                                    {/* Gradients */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">
                                            <i className="bi bi-rainbow me-1"></i> Degradados
                                        </label>
                                        <div className="d-flex flex-wrap gap-1">
                                            {GRADIENT_PRESETS.map(grad => (
                                                <button
                                                    key={grad.id}
                                                    className="btn btn-sm p-0"
                                                    style={{
                                                        width: 40,
                                                        height: 28,
                                                        background: grad.value,
                                                        border: currentSlideData.backgroundGradient === grad.value ? `2px solid ${theme.colors.primary}` : '1px solid #ddd',
                                                        borderRadius: 4
                                                    }}
                                                    onClick={() => updateSlideBackgroundImage('', grad.value)}
                                                    title={grad.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Background Image */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">
                                            <i className="bi bi-image me-1"></i> Imagen de fondo
                                        </label>
                                        {currentSlideData.backgroundImage && (
                                            <div className="mb-2 position-relative" style={{ borderRadius: 8, overflow: 'hidden' }}>
                                                <img
                                                    src={currentSlideData.backgroundImage}
                                                    alt="Background"
                                                    style={{ width: '100%', height: 80, objectFit: 'cover' }}
                                                />
                                                <button
                                                    onClick={() => updateSlideBackgroundImage('')}
                                                    className="btn btn-sm btn-danger position-absolute"
                                                    style={{ top: 4, right: 4, width: 24, height: 24, padding: 0 }}
                                                >
                                                    <i className="bi bi-x"></i>
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => openImageLibrary('background')}
                                            className="btn btn-sm btn-outline-primary w-100"
                                        >
                                            <i className="bi bi-images me-1"></i>
                                            {currentSlideData.backgroundImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
                                        </button>
                                    </div>

                                    {/* Gradient Overlay for Background Image */}
                                    {currentSlideData.backgroundImage && (
                                        <div>
                                            <label className="form-label small text-muted mb-1">
                                                <i className="bi bi-layers me-1"></i> Overlay (degradado sobre imagen)
                                            </label>
                                            <div className="d-flex flex-wrap gap-1">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    style={{ fontSize: '0.7rem' }}
                                                    onClick={() => updateSlideBackgroundImage(currentSlideData.backgroundImage, null)}
                                                >
                                                    Sin overlay
                                                </button>
                                                {GRADIENT_PRESETS.slice(0, 6).map(grad => (
                                                    <button
                                                        key={grad.id}
                                                        className="btn btn-sm p-0"
                                                        style={{
                                                            width: 32,
                                                            height: 24,
                                                            background: grad.overlay,
                                                            border: currentSlideData.backgroundGradient === grad.value ? `2px solid ${theme.colors.primary}` : '1px solid #ddd',
                                                            borderRadius: 4
                                                        }}
                                                        onClick={() => updateSlideBackgroundImage(currentSlideData.backgroundImage, grad.value)}
                                                        title={grad.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Transitions */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">
                                            <i className="bi bi-magic me-1"></i> Transición
                                        </label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={currentSlideData.transitionType || 'fade'}
                                            onChange={(e) => {
                                                const slides = getSlides(currentPresentation);
                                                const updatedSlides = [...slides];
                                                updatedSlides[selectedSlide] = { ...updatedSlides[selectedSlide], transitionType: e.target.value };
                                                setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
                                            }}
                                        >
                                            <option value="fade">Desvanecer (Estándar)</option>
                                            <option value="morph">Transformar (PowerPoint Morph)</option>
                                            <option value="infinite">Movimiento Infinito (Prezi)</option>
                                            <option value="slide">Deslizar</option>
                                            <option value="zoom">Zoom</option>
                                        </select>
                                    </div>

                                    {/* Clear All */}
                                    {(currentSlideData.backgroundImage || currentSlideData.backgroundGradient) && (
                                        <button
                                            onClick={clearSlideBackground}
                                            className="btn btn-sm btn-outline-secondary"
                                        >
                                            <i className="bi bi-eraser me-1"></i> Limpiar fondo
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Presentation Info */}
                    <div style={glassCard} className="p-3 mt-3">
                        <h6 className="fw-bold mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Información
                        </h6>
                        <div className="d-flex flex-column gap-2">
                            <div>
                                <label className="form-label small text-muted mb-1">Título</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={currentPresentation?.title || ''}
                                    onChange={(e) => setCurrentPresentation({ ...currentPresentation, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label small text-muted mb-1">Descripción</label>
                                <textarea
                                    className="form-control form-control-sm"
                                    rows="2"
                                    value={currentPresentation?.description || ''}
                                    onChange={(e) => setCurrentPresentation({ ...currentPresentation, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ===============================
    // Main Render
    // ===============================
    return (
        <div className="container-fluid py-4">
            {/* Present Mode Overlay */}
            <AnimatePresence>
                {isPresentMode && currentPresentation && <PresentationMode />}
            </AnimatePresence>

            {/* Image Library Modal */}
            <AnimatePresence>
                {showImageLibrary && <ImageLibraryModal />}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
            >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        {isEditing && (
                            <button
                                onClick={() => { setIsEditing(false); setCurrentPresentation(null); setSelectedElement(null); }}
                                className="btn btn-outline-secondary btn-sm rounded-pill"
                            >
                                <i className="bi bi-arrow-left me-1"></i> Volver
                            </button>
                        )}
                        <h4 className="mb-0 fw-bold" style={{ fontFamily: 'ModernAge, sans-serif', color: theme.colors.primary }}>
                            <i className="bi bi-easel2-fill me-2"></i>
                            {isEditing ? (currentPresentation?.title || 'Editor') : 'Oasis Press'}
                        </h4>
                    </div>
                    {!isEditing && (
                        <button onClick={createPresentation} className="btn btn-primary rounded-pill px-4" style={glassPrimary}>
                            <i className="bi bi-plus-lg me-2"></i> Nueva Presentación
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : isEditing && currentPresentation ? (
                <EditorView />
            ) : (
                /* Presentations Grid */
                <div className="row g-4">
                    {(presentations || []).length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div style={{ ...glassCard, padding: '3rem' }}>
                                <i className="bi bi-easel2 display-1 text-muted mb-3 d-block"></i>
                                <h5 className="text-muted">No hay presentaciones aún</h5>
                                <p className="text-muted small">Crea tu primera presentación con estilo Liquid Glass</p>
                                <button onClick={createPresentation} className="btn btn-primary rounded-pill px-4 mt-2">
                                    <i className="bi bi-plus-lg me-2"></i> Crear Presentación
                                </button>
                            </div>
                        </div>
                    ) : (
                        (presentations || []).map((presentation, index) => (
                            <motion.div
                                key={presentation.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="col-12 col-sm-6 col-lg-4 col-xl-3"
                            >
                                <motion.div
                                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(91, 46, 166, 0.15)' }}
                                    style={{ ...glassCard, overflow: 'hidden', cursor: 'pointer' }}
                                    onClick={() => openPresentation(presentation, false)}
                                >
                                    {/* Thumbnail */}
                                    <div
                                        style={{
                                            aspectRatio: '16/9',
                                            background: getSlide(presentation, 0)?.background || '#f0f0f0',
                                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div className="position-absolute" style={{ bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 8px', borderRadius: 8, fontSize: '0.75rem' }}>
                                            {getSlides(presentation).length} slides
                                        </div>
                                    </div>
                                    {/* Info */}
                                    <div className="p-3">
                                        <h6 className="fw-bold mb-1 text-truncate">{presentation.title || 'Sin título'}</h6>
                                        <p className="text-muted small mb-2 text-truncate">{presentation.description || 'Sin descripción'}</p>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="small text-muted">
                                                {presentation.updatedAt ? new Date(presentation.updatedAt).toLocaleDateString('es-ES') : ''}
                                            </span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openPresentation(presentation, true); }}
                                                    className="btn btn-sm btn-primary rounded-circle"
                                                    style={{ width: 32, height: 32, padding: 0 }}
                                                    title="Proyectar"
                                                >
                                                    <i className="bi bi-play-fill"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deletePresentation(presentation.id); }}
                                                    className="btn btn-sm btn-outline-danger rounded-circle"
                                                    style={{ width: 32, height: 32, padding: 0 }}
                                                    title="Eliminar"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default OasisPress;
